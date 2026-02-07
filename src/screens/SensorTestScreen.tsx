import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { accelerometer, gyroscope, magnetometer, barometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { map } from 'rxjs/operators';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

export const SensorTestScreen = () => {
    const { completeTest, isAutomated } = useTestLogic('Sensors');
    const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
    const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
    const [magData, setMagData] = useState({ x: 0, y: 0, z: 0 });
    const [barData, setBarData] = useState({ pressure: 0 });

    useEffect(() => {
        setUpdateIntervalForType(SensorTypes.accelerometer, 400);
        setUpdateIntervalForType(SensorTypes.gyroscope, 400);
        setUpdateIntervalForType(SensorTypes.magnetometer, 400);
        setUpdateIntervalForType(SensorTypes.barometer, 400);

        const sub1 = accelerometer.pipe(map(({ x, y, z }) => ({ x, y, z }))).subscribe(setAccelData, () => { });
        const sub2 = gyroscope.pipe(map(({ x, y, z }) => ({ x, y, z }))).subscribe(setGyroData, () => { });
        const sub3 = magnetometer.pipe(map(({ x, y, z }) => ({ x, y, z }))).subscribe(setMagData, () => { });
        const sub4 = barometer.pipe(map(({ pressure }) => ({ pressure }))).subscribe(setBarData, () => { });

        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
            sub4.unsubscribe();
        };
    }, []);

    const ValueRow = ({ label, value }: { label: string, value: number }) => (
        <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>{label}</Text>
            <Text style={styles.dataValue}>{value.toFixed(3)}</Text>
        </View>
    );

    const SensorCard = ({ title, icon, color, data, children }: any) => (
        <View style={[styles.card, shadows.soft]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Icon name={icon} size={24} color={color} />
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    {isAutomated && <Text style={styles.seqText}>Test Sequence: 6/8</Text>}
                    <Text style={styles.title}>Sensor Diagnostics</Text>
                    <Text style={styles.subtitle}>Reading raw data from device motion chips.</Text>
                </View>

                <SensorCard title="Accelerometer" icon="axis-arrow" color={colors.primary} data={accelData} />
                <SensorCard title="Gyroscope" icon="rotate-3d" color={colors.secondary} data={gyroData} />
                <SensorCard title="Magnetometer" icon="compass" color={colors.success} data={magData} />

                <View style={[styles.card, shadows.soft]}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: colors.warning + '20' }]}>
                            <Icon name="gauge" size={24} color={colors.warning} />
                        </View>
                        <Text style={styles.cardTitle}>Barometer</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <ValueRow label="Pressure (hPa)" value={barData.pressure} />
                    </View>
                </View>

                <TouchableOpacity style={[styles.passBtn, shadows.medium]} onPress={() => completeTest('success')}>
                    <Icon name="check-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.btnText}>Confirm Values</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        fontSize: 12,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.subtext,
        marginBottom: 10
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: spacing.m,
        marginBottom: spacing.m,
        borderWidth: 1,
        borderColor: colors.border
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 8
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    cardContent: {
        gap: 4
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4
    },
    dataLabel: {
        color: colors.subtext,
        fontSize: 14
    },
    dataValue: {
        color: colors.text,
        fontWeight: '600',
        fontVariant: ['tabular-nums']
    },
    passBtn: {
        backgroundColor: colors.success,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 30,
        marginTop: 10,
        gap: 8
    },
    btnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
