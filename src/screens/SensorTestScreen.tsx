import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, NativeModules, NativeEventEmitter } from 'react-native';
import { accelerometer, gyroscope, magnetometer, barometer, gravity, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map } from 'rxjs/operators';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { useTheme } from '../context/ThemeContext';
import { Compass } from '../components/Compass';
import { GyroGauge } from '../components/GyroGauge';

const { HardwareModule } = NativeModules;
const hardwareEvents = new NativeEventEmitter(HardwareModule);

export const SensorTestScreen = () => {
    const { completeTest, isAutomated } = useTestLogic('Sensors');
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    // Motion sensors state
    const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
    const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
    const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
    const [gravityData, setGravityData] = useState({ x: 0, y: 0, z: 0 });

    // Native sensors state
    const [lightData, setLightData] = useState(0);
    const [proximityData, setProximityData] = useState({ isNear: false, distance: 0 });

    useEffect(() => {
        // Configure intervals (ms)
        setUpdateIntervalForType(SensorTypes.accelerometer, 200);
        setUpdateIntervalForType(SensorTypes.gyroscope, 80);
        setUpdateIntervalForType(SensorTypes.magnetometer, 200);
        setUpdateIntervalForType(SensorTypes.gravity, 200);

        // Subscriptions
        const sub1 = accelerometer.pipe(map(({ x, y, z }) => ({ x, y, z }))).subscribe(setAccelData, () => { });
        const sub2 = gyroscope.pipe(map(({ x, y, z }) => ({ x, y, z }))).subscribe(setGyroData, () => { });
        const sub3 = magnetometer.pipe(map(({ x, y, z }) => ({ x, y, z }))).subscribe(setMagData, () => { });
        const sub5 = gravity.pipe(map(({ x, y, z }) => ({ x, y, z }))).subscribe(setGravityData, () => { });

        // Native Event Listeners
        const l1 = hardwareEvents.addListener('onLightChange', (e: any) => setLightData(e.lux));
        const l5 = hardwareEvents.addListener('onProximityChange', (e: any) => setProximityData(e));

        // Start native tracking
        if (HardwareModule) {
            HardwareModule.startEnvironmentTracking();
            HardwareModule.startProximityTracking();
        }

        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
            sub5.unsubscribe();
            l1.remove();
            l5.remove();
            if (HardwareModule) {
                HardwareModule.stopEnvironmentTracking();
                HardwareModule.stopProximityTracking();
            }
        };
    }, []);

    // Compass heading calculation (degrees 0-360)
    const heading = Math.atan2(magData.y, magData.x) * (180 / Math.PI) + 180;

    const ValueRow = ({ label, value, unit = "" }: { label: string, value: number, unit?: string }) => (
        <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{label}</Text>
            <Text style={styles.dataValue}>{value.toFixed(2)}{unit}</Text>
        </View>
    );

    const SensorCard = ({ title, icon, color, data, children, style }: any) => (
        <View style={[styles.card, shadows.soft, style]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                    <Icon name={icon} size={20} color={color} />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            <View style={styles.cardContent}>
                {data && (
                    <>
                        <ValueRow label="X-Axis" value={data.x} />
                        <ValueRow label="Y-Axis" value={data.y} />
                        <ValueRow label="Z-Axis" value={data.z} />
                    </>
                )}
                {children}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    {isAutomated && <Text style={styles.seqText}>Hardware Test Sequence</Text>}
                    <Text style={styles.title}>Sensor Diagnostics</Text>
                    <Text style={styles.subtitle}>Analyzing real-time motion and environment data.</Text>
                </View>

                {/* VISUAL DIAGNOSTICS */}
                <View style={[styles.visualSection, { backgroundColor: theme.dark ? '#1A1A1A' : '#F8F9FA' }]}>
                    <Text style={styles.sectionTitle}>Visual Tools</Text>
                    <View style={styles.visualGrid}>
                        <View style={styles.visualItem}>
                            <Text style={styles.visualLabel}>Digital Compass</Text>
                            <Compass heading={heading} theme={theme} />
                        </View>
                        <View style={styles.visualItem}>
                            <Text style={styles.visualLabel}>Gyroscope Stability</Text>
                            <GyroGauge data={gyroData} theme={theme} />
                        </View>
                    </View>
                </View>

                {/* MOTION SENSORS */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Motion & Position</Text>
                    <View style={styles.cardGrid}>
                        <SensorCard title="Accelerometer" icon="axis-arrow" color="#6200EE" data={accelData} style={styles.halfCard} />
                        <SensorCard title="Gravity" icon="earth" color="#03DAC6" data={gravityData} style={styles.halfCard} />
                    </View>
                </View>

                {/* ENVIRONMENT & PROXIMITY */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Environment & Proximity</Text>
                    <View style={styles.cardGrid}>
                        <View style={[styles.card, styles.halfCard, shadows.soft]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: colors.warning + '15' }]}>
                                    <Icon name="white-balance-sunny" size={20} color={colors.warning} />
                                </View>
                                <Text style={styles.cardTitle}>Light</Text>
                            </View>
                            <Text style={styles.largeValue}>{lightData.toFixed(0)} <Text style={styles.unit}>Lux</Text></Text>
                        </View>

                        <View style={[styles.card, styles.halfCard, shadows.soft]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                    <Icon name="gesture-spread" size={20} color={colors.primary} />
                                </View>
                                <Text style={styles.cardTitle}>Distance</Text>
                            </View>
                            <Text style={[styles.largeValue, { color: proximityData.isNear ? colors.error : colors.text }]}>
                                {proximityData.distance.toFixed(0)} <Text style={styles.unit}>cm</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.passBtn, shadows.medium]} onPress={() => completeTest('success')}>
                    <Icon name="check-decagram" size={24} color="#FFF" />
                    <Text style={styles.btnText}>All Sensors Working</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
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
            paddingBottom: 40
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing.l
        },
        seqText: {
            fontSize: 10,
            color: colors.primary,
            fontWeight: '900',
            textTransform: 'uppercase',
            marginBottom: 8,
            backgroundColor: colors.primary + '15',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        subtitle: {
            fontSize: 14,
            color: colors.subtext,
            textAlign: 'center',
            marginTop: 4
        },
        visualSection: {
            borderRadius: 16,
            padding: spacing.m,
            marginBottom: spacing.l,
            borderWidth: 1,
            borderColor: colors.border
        },
        sectionTitle: {
            fontSize: 12,
            fontWeight: '800',
            color: colors.subtext,
            textTransform: 'uppercase',
            marginBottom: spacing.m,
            marginLeft: 4
        },
        visualGrid: {
            gap: 20
        },
        visualItem: {
            alignItems: 'center',
            width: '100%'
        },
        visualLabel: {
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10
        },
        section: {
            marginBottom: spacing.l
        },
        sectionLabel: {
            fontSize: 12,
            fontWeight: 'bold',
            color: colors.subtext,
            marginBottom: 10,
            marginLeft: 4
        },
        cardGrid: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: spacing.s
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: spacing.m,
            marginBottom: spacing.m,
            borderWidth: 1,
            borderColor: colors.border
        },
        halfCard: {
            width: '48%',
            marginBottom: 0
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        iconBox: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8
        },
        cardTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.text,
        },
        cardContent: {
            gap: 2
        },
        dataRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        dataLabel: {
            color: colors.subtext,
            fontSize: 11
        },
        dataValue: {
            color: colors.text,
            fontSize: 11,
            fontWeight: '700',
            fontVariant: ['tabular-nums']
        },
        largeValue: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: 4
        },
        unit: {
            fontSize: 12,
            color: colors.subtext,
            fontWeight: 'normal'
        },
        subtext: {
            fontSize: 11,
            color: colors.subtext,
        },
        passBtn: {
            backgroundColor: colors.success,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
            borderRadius: 16,
            marginTop: 10,
            gap: 12
        },
        btnText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold'
        }
    });
};
