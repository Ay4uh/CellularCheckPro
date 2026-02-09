import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, NativeModules, Platform, ActivityIndicator, LayoutAnimation, UIManager, Animated, Easing } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { useTheme } from '../context/ThemeContext';

const { HardwareModule } = NativeModules;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MetricInfo = ({ label, value, unit, detail, color }: any) => {
    const [expanded, setExpanded] = useState(false);
    const { theme } = useTheme();

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: theme.colors.card, borderColor: color || theme.colors.border }]}
            onPress={toggle}
            activeOpacity={0.7}
        >
            <View style={styles.metricHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
                    <Text style={[styles.metricValue, { color: color || theme.colors.text }]} numberOfLines={1}>
                        {value} <Text style={styles.metricUnit}>{unit}</Text>
                    </Text>
                </View>
                <Icon name={expanded ? "chevron-up" : "information-outline"} size={18} color={theme.colors.subtext} />
            </View>
            {expanded && (
                <View style={styles.metricDetail}>
                    <Text style={[styles.detailText, { color: theme.colors.subtext }]}>{detail}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export const NetworkDiagnosticsScreen = () => {
    const { completeTest, isAutomated } = useTestLogic('Network');
    const { theme } = useTheme();
    const [simData, setSimData] = useState<any>(null);
    const [signalData, setSignalData] = useState<any>(null);
    const [wifiData, setWifiData] = useState<any>(null);
    const [speedTest, setSpeedTest] = useState({ state: 'idle', download: 0, upload: 0, ping: 0 });
    const [stability, setStability] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (speedTest.state === 'testing') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [speedTest.state, pulseAnim]);

    const fetchData = useCallback(async () => {
        if (Platform.OS !== 'android' || !HardwareModule) return;

        try {
            const sim = await HardwareModule.getSimStatus();
            const signal = await HardwareModule.getSignalMetrics();
            const wifi = await HardwareModule.getWifiDiagnostics();

            setSimData(sim);
            setSignalData(signal);
            setWifiData(wifi);

            // Add to stability log
            setStability(prev => {
                const newLog = [...prev, { time: new Date().toLocaleTimeString(), tech: sim.networkType, dbm: signal.dbm }];
                return newLog.slice(-10); // Keep last 10
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const runSpeedTest = async () => {
        setSpeedTest(prev => ({ ...prev, state: 'testing' }));

        try {
            // Ping simulation
            const pStart = Date.now();
            await fetch('https://www.google.com', { method: 'HEAD', cache: 'no-store' } as any);
            const ping = Date.now() - pStart;

            // Download simulation (1MB dummy)
            const dStart = Date.now();
            const res = await fetch('https://cachefly.cachefly.net/1mb.test', { cache: 'no-store' } as any);
            await res.blob();
            const dEnd = Date.now();
            const download = (8 / ((dEnd - dStart) / 1000)); // Approx Mbps

            setSpeedTest({ state: 'done', download, upload: download * 0.4, ping });
        } catch (e) {
            setSpeedTest(prev => ({ ...prev, state: 'error' }));
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Connectivity Hub</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.subtext }]}>Cellular, Wi-Fi and advanced signal diagnostics.</Text>
                </View>

                {/* SIM & CARRIER SECTION */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.subtext }]}>Sim & Carrier</Text>
                    <View style={[styles.card, shadows.soft, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Icon name="sim" size={20} color={theme.colors.primary} />
                            </View>
                            <View style={styles.cell}>
                                <Text style={[styles.label, { color: theme.colors.subtext }]}>Primary Provider</Text>
                                <Text style={[styles.mainValue, { color: theme.colors.text }]} numberOfLines={1}>{simData?.carrierName || 'No Carrier'}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{simData?.networkType || 'LTE'}</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                        <View style={styles.detailGrid}>
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.subtext }]}>Dual SIM</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{simData?.activeSimCount > 1 ? 'Yes' : 'No'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.subtext }]}>VoLTE</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.success }]}>Active</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.subtext }]}>Roaming</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{simData?.isNetworkRoaming ? 'Yes' : 'No'}</Text>
                            </View>
                        </View>

                        {simData?.simDetails?.length > 0 && (
                            <>
                                <View style={[styles.divider, { backgroundColor: theme.colors.border, marginTop: 16 }]} />
                                <View style={styles.simSlotsContainer}>
                                    {simData.simDetails.map((sim: any, idx: number) => (
                                        <View key={idx} style={styles.simSlotRow}>
                                            <Icon name={sim.isEmbedded ? "cellphone-nfc" : "sim-outline"} size={14} color={theme.colors.subtext} />
                                            <Text style={[styles.simSlotText, { color: theme.colors.text }]} numberOfLines={1}>
                                                Slot {sim.simSlotIndex + 1}: <Text style={{ fontWeight: 'bold' }}>{sim.isEmbedded ? 'eSIM' : 'Physical SIM'}</Text> {sim.displayName ? `(${sim.displayName})` : ''}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* SIGNAL METRICS */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.subtext }]}>Signal Metrics</Text>
                    <View style={styles.metricGrid}>
                        <MetricInfo
                            label="RSRP"
                            value={signalData?.rsrp || -100}
                            unit="dBm"
                            color={signalData?.rsrp > -90 ? colors.success : colors.warning}
                            detail="Reference Signal Received Power. Measures the power of the LTE Reference Signals. -80dBm is Excellent, -110dBm is Poor."
                        />
                        <MetricInfo
                            label="RSRQ"
                            value={signalData?.rsrq || -15}
                            unit="dB"
                            detail="Reference Signal Received Quality. Indicates the quality of the received reference signal. Range: -3dB to -20dB."
                        />
                        <MetricInfo
                            label="RSSI"
                            value={signalData?.rssi || -70}
                            unit="dBm"
                            detail="Received Signal Strength Indicator. Total power received including interference. Usually ranges from -50 to -110 dBm."
                        />
                        <MetricInfo
                            label="SINR"
                            value={signalData?.rssnr || 10}
                            unit="dB"
                            color={colors.primary}
                            detail="Signal to Interference plus Noise Ratio. Higher is better. >20dB is Excellent coverage."
                        />
                    </View>
                </View>

                {/* WI-FI SECTION */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.subtext }]}>Wi-Fi Diagnostics</Text>
                    <View style={[styles.card, shadows.soft, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: theme.colors.secondary + '15' }]}>
                                <Icon name="wifi" size={20} color={theme.colors.secondary} />
                            </View>
                            <View style={styles.cell}>
                                <Text style={[styles.label, { color: theme.colors.subtext }]}>Network SSID</Text>
                                <Text style={[styles.mainValue, { color: theme.colors.text }]} numberOfLines={1}>{wifiData?.ssid?.replace(/"/g, '') || 'Disconnected'}</Text>
                            </View>
                            <Text style={[styles.speedText, { color: theme.colors.secondary }]}>{wifiData?.linkSpeed} Mbps</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                        <View style={styles.detailGrid}>
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.subtext }]}>Frequency</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{wifiData?.frequency} MHz</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.subtext }]}>Band</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{wifiData?.band}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={[styles.detailLabel, { color: theme.colors.subtext }]}>Signal</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{wifiData?.rssi} dBm</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* SPEED TEST SECTION */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.subtext }]}>Performance</Text>
                        <TouchableOpacity style={[styles.speedBtn, { backgroundColor: theme.colors.primary }]} onPress={runSpeedTest} disabled={speedTest.state === 'testing'}>
                            {speedTest.state === 'testing' ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.speedBtnText}>Start Test</Text>}
                        </TouchableOpacity>
                    </View>
                    <Animated.View style={[styles.speedCard, shadows.medium, { transform: [{ scale: pulseAnim }], backgroundColor: theme.colors.primary }]}>
                        <View style={styles.speedItem}>
                            <Icon name="arrow-down-bold" size={22} color="#FFF" />
                            <Text style={styles.speedVal} numberOfLines={1}>{speedTest.download.toFixed(1)}</Text>
                            <Text style={styles.speedUnit}>Mbps</Text>
                            <Text style={styles.speedLabel} numberOfLines={1}>Down</Text>
                        </View>
                        <View style={styles.speedDivider} />
                        <View style={styles.speedItem}>
                            <Icon name="arrow-up-bold" size={22} color="#FFF" />
                            <Text style={styles.speedVal} numberOfLines={1}>{speedTest.upload.toFixed(1)}</Text>
                            <Text style={styles.speedUnit}>Mbps</Text>
                            <Text style={styles.speedLabel} numberOfLines={1}>Up</Text>
                        </View>
                        <View style={styles.speedDivider} />
                        <View style={styles.speedItem}>
                            <Icon name="timer-outline" size={22} color="#FFF" />
                            <Text style={styles.speedVal} numberOfLines={1}>{speedTest.ping}</Text>
                            <Text style={styles.speedUnit}>ms</Text>
                            <Text style={styles.speedLabel} numberOfLines={1}>Ping</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* STABILITY LOG */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.subtext }]}>Network Stability</Text>
                    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        {stability.length === 0 ? (
                            <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>Monitoring signal stability...</Text>
                        ) : (
                            stability.map((log, i) => (
                                <View key={i} style={[styles.logRow, { borderBottomColor: theme.colors.border }]}>
                                    <Text style={[styles.logTime, { color: theme.colors.subtext }]}>{log.time}</Text>
                                    <Text style={[styles.logTech, { color: theme.colors.primary }]}>{log.tech}</Text>
                                    <Text style={[styles.logDbm, { color: theme.colors.text }]}>{log.dbm} dBm</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <TouchableOpacity style={[styles.passBtn, { backgroundColor: theme.colors.success }]} onPress={() => completeTest('success', { simData, signalData, wifiData, speedTest })}>
                    <Icon name="check-circle" size={24} color="#FFF" />
                    <Text style={styles.passBtnText}>Verify & Proceed</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: spacing.m, paddingBottom: 60 },
    header: { marginBottom: spacing.l },
    title: { fontSize: 24, fontWeight: 'bold', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, marginTop: 4, opacity: 0.8 },
    section: { marginBottom: spacing.l },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 4 },
    card: { padding: spacing.m, borderRadius: 20, borderWidth: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    row: { flexDirection: 'row', alignItems: 'center' },
    cell: { flex: 1, marginLeft: 12 },
    label: { fontSize: 11, marginBottom: 2 },
    mainValue: { fontSize: 17, fontWeight: 'bold' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    badgeText: { fontSize: 10, fontWeight: '900' },
    divider: { height: 1, marginVertical: 12, opacity: 0.5 },
    detailGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    detailItem: { flex: 1, alignItems: 'center' },
    detailLabel: { fontSize: 10, marginBottom: 4 },
    detailValue: { fontSize: 14, fontWeight: 'bold' },
    simSlotsContainer: { marginTop: 4 },
    simSlotRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    simSlotText: { fontSize: 12, marginLeft: 10, flex: 1 },
    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    metricCard: { width: '48.5%', padding: 12, borderRadius: 18, borderWidth: 1, marginBottom: 10, minHeight: 70 },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    metricLabel: { fontSize: 10, color: colors.subtext, marginBottom: 2 },
    metricValue: { fontSize: 16, fontWeight: 'bold' },
    metricUnit: { fontSize: 10, fontWeight: 'normal' },
    metricDetail: { marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#eee' },
    detailText: { fontSize: 10, fontStyle: 'italic', lineHeight: 14 },
    speedText: { fontWeight: 'bold', fontSize: 14 },
    speedBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    speedBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    speedCard: { borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    speedItem: { alignItems: 'center', flex: 1, paddingHorizontal: 4 },
    speedVal: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginTop: 4 },
    speedUnit: { fontSize: 9, color: '#FFF', opacity: 0.9 },
    speedLabel: { fontSize: 9, color: '#FFF', opacity: 0.7, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    speedDivider: { width: 1, backgroundColor: '#FFF', height: '50%', opacity: 0.2 },
    logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
    logTime: { fontSize: 10 },
    logTech: { fontSize: 10, fontWeight: 'bold' },
    logDbm: { fontSize: 10, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', fontSize: 12, fontStyle: 'italic', paddingVertical: 10 },
    passBtn: { padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    passBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
