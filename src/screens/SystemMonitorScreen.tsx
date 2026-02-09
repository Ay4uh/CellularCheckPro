import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform, Dimensions, NativeModules, LayoutAnimation, UIManager, TouchableOpacity, Animated } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { spacing, shadows } from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { WiFiCard } from '../components/WiFiCard';
import { StorageCard } from '../components/StorageCard';
import { RamCard } from '../components/RamCard';
import { CpuCard } from '../components/CpuCard';
import { DeviceInfoCard } from '../components/DeviceInfoCard';

const { width } = Dimensions.get('window');
const { HardwareModule } = NativeModules;

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export const SystemMonitorScreen = () => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const [storage, setStorage] = useState({ total: 0, free: 0, used: 0, percentage: 0 });
    const [ram, setRam] = useState({ total: 0, used: 0, percentage: 0 });
    const [cpuInfo, setCpuInfo] = useState({
        architecture: '',
        cores: 0
    });
    const [cpuFrequencies, setCpuFrequencies] = useState<number[]>([]);
    const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(40).fill(0));
    const [ramHistory, setRamHistory] = useState<number[]>(new Array(40).fill(0));

    const [wifiInfo, setWifiInfo] = useState<{
        isConnected: boolean;
        type: string;
        ssid: string | null;
        ipAddress: string | null;
        strength: number | null;
        frequency: number | null;
    }>({
        isConnected: false,
        type: '',
        ssid: null,
        ipAddress: null,
        strength: null,
        frequency: null
    });

    const [expandedCpu, setExpandedCpu] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Animation Values
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;
    const fadeAnim5 = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const stagger = 100;
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            Animated.timing(fadeAnim1, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.sequence([
                Animated.delay(stagger),
                Animated.timing(fadeAnim2, { toValue: 1, duration: 500, useNativeDriver: true })
            ]),
            Animated.sequence([
                Animated.delay(stagger * 2),
                Animated.timing(fadeAnim3, { toValue: 1, duration: 500, useNativeDriver: true })
            ]),
            Animated.sequence([
                Animated.delay(stagger * 3),
                Animated.timing(fadeAnim4, { toValue: 1, duration: 500, useNativeDriver: true })
            ]),
            Animated.sequence([
                Animated.delay(stagger * 4),
                Animated.timing(fadeAnim5, { toValue: 1, duration: 500, useNativeDriver: true })
            ])
        ]).start();
    }, []);

    const toggleCpuExpansion = React.useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCpu(prev => !prev);
    }, []);

    const loadData = async () => {
        // Storage
        try {
            const total = await DeviceInfo.getTotalDiskCapacity();
            const free = await DeviceInfo.getFreeDiskStorage();
            const used = total - free;
            const percentage = Math.round((used / total) * 100);
            setStorage({ total, free, used, percentage });
        } catch (e) {
            console.error(e);
        }

        // Initial update
        updateRealtimeData();

        // CPU Static Info
        try {
            const architecture = await DeviceInfo.supportedAbis().then(abis => abis.join(', ')).catch(() => 'Unknown');
            setCpuInfo({
                architecture,
                cores: 8
            });
        } catch (e) {
            console.log("CPU Info Error", e);
        }
    };

    const updateRealtimeData = async () => {
        try {
            // RAM 
            if (HardwareModule && HardwareModule.getMemoryUsage) {
                const mem = await HardwareModule.getMemoryUsage();
                setRam({ total: mem.total, used: mem.used, percentage: Math.round(mem.percentage) });
                setRamHistory(prev => [...prev.slice(1), mem.percentage]);
            } else {
                const total = await DeviceInfo.getTotalMemory();
                let used = await DeviceInfo.getUsedMemory().catch(() => total * 0.4);
                const percentage = Math.round((used / total) * 100);
                setRam({ total, used, percentage });
                setRamHistory(prev => [...prev.slice(1), percentage]);
            }

            // CPU Load
            if (HardwareModule && HardwareModule.getSystemLoad) {
                const load = await HardwareModule.getSystemLoad();
                setCpuHistory(prev => [...prev.slice(1), load]);
            }

            // CPU Frequencies
            if (HardwareModule && HardwareModule.getCpuFrequencies) {
                const freqs = await HardwareModule.getCpuFrequencies();
                setCpuFrequencies(freqs);
            }
        } catch (e) {
            console.log(e);
        }
    };

    // NetInfo Listener
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setWifiInfo({
                isConnected: state.isConnected ?? false,
                type: state.type,
                ssid: (state.details as any)?.ssid ?? 'N/A',
                ipAddress: (state.details as any)?.ipAddress ?? 'N/A',
                strength: (state.details as any)?.strength ?? null,
                frequency: (state.details as any)?.frequency ?? null
            });
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        loadData();
        // High frequency for "live" graphs
        const interval = setInterval(updateRealtimeData, 1000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const bytesToGB = React.useCallback((bytes: number) => {
        if (bytes === 0) return '0 GB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }, []);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>System Monitor</Text>
                <Text style={styles.subtitle}>Real-time hardware statistics</Text>
            </View>

            <WiFiCard
                wifiInfo={wifiInfo}
                theme={theme}
                fadeAnim={fadeAnim1}
                slideAnim={slideAnim}
            />

            <StorageCard
                storage={storage}
                theme={theme}
                fadeAnim={fadeAnim2}
                slideAnim={slideAnim}
                bytesToGB={bytesToGB}
            />

            <RamCard
                ram={ram}
                ramHistory={ramHistory}
                theme={theme}
                fadeAnim={fadeAnim3}
                slideAnim={slideAnim}
                bytesToGB={bytesToGB}
            />

            <CpuCard
                cpuInfo={cpuInfo}
                cpuFrequencies={cpuFrequencies}
                cpuHistory={cpuHistory}
                expandedCpu={expandedCpu}
                toggleCpuExpansion={toggleCpuExpansion}
                theme={theme}
                fadeAnim={fadeAnim4}
                slideAnim={slideAnim}
            />

            <DeviceInfoCard
                theme={theme}
                fadeAnim={fadeAnim5}
                slideAnim={slideAnim}
            />
        </ScrollView>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            padding: spacing.m,
            paddingTop: 20,
            paddingBottom: 110,
        },
        header: {
            marginBottom: spacing.l,
            paddingHorizontal: 4,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
        },
        subtitle: {
            fontSize: 16,
            color: colors.subtext,
            marginTop: 4,
        },
    });
};
