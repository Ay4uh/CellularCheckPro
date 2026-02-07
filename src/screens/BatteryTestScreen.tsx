import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import DeviceInfo from 'react-native-device-info';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

export const BatteryTestScreen = () => {
    const { completeTest, isAutomated } = useTestLogic('Battery');
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [powerState, setPowerState] = useState<any>({});
    const [isCharging, setIsCharging] = useState(false);

    useEffect(() => {
        DeviceInfo.getBatteryLevel().then(setBatteryLevel);
        DeviceInfo.isBatteryCharging().then(setIsCharging);
        DeviceInfo.getPowerState().then(setPowerState);
    }, []);

    const levelPercent = batteryLevel !== null ? (batteryLevel * 100) : 0;
    const isGood = levelPercent > 20; // Simplified Logic

    const InfoCard = ({ label, value, icon, color }: any) => (
        <View style={styles.gridItem}>
            <View style={[styles.miniIcon, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={20} color={color} />
            </View>
            <Text style={styles.gridLabel}>{label}</Text>
            <Text style={styles.gridValue}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence: 7/8</Text>}
                <Text style={styles.title}>Battery Status</Text>
                <Text style={styles.disclaimer}>Results based on Android system data</Text>
            </View>

            <View style={[styles.mainCard, shadows.medium]}>
                {/* Big Battery Icon Construction */}
                <View style={styles.batteryOutline}>
                    <View style={[styles.batteryFill, {
                        height: `${levelPercent}%`,
                        backgroundColor: isCharging ? colors.success : (isGood ? colors.primary : colors.error)
                    }]} />
                    {isCharging && <Icon name="lightning-bolt" size={40} color="#FFF" style={styles.bolt} />}
                </View>

                <Text style={styles.percentageText}>{levelPercent.toFixed(0)}%</Text>
                <Text style={styles.statusText}>{isCharging ? 'Charging' : 'Discharging'}</Text>
            </View>

            <View style={styles.grid}>
                <InfoCard label="Level" value={`${levelPercent.toFixed(0)}%`} icon="battery" color={colors.primary} />
                <InfoCard label="Power Saver" value={powerState.lowPowerMode ? 'On' : 'Off'} icon="battery-saver" color={colors.warning} />
            </View>

            <TouchableOpacity style={styles.passBtn} onPress={() => completeTest('success')}>
                <Text style={styles.btnText}>Test Complete</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.m,
        alignItems: 'center'
    },
    header: {
        alignItems: 'center',
        marginVertical: spacing.l
    },
    seqText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    disclaimer: {
        fontSize: 12,
        color: colors.subtext,
        marginTop: 4,
        fontStyle: 'italic'
    },
    mainCard: {
        backgroundColor: colors.card,
        width: '100%',
        padding: spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: spacing.l,
    },
    batteryOutline: {
        width: 80,
        height: 150,
        borderWidth: 4,
        borderColor: colors.text,
        borderRadius: 12,
        justifyContent: 'flex-end',
        padding: 4,
        marginBottom: 20,
        position: 'relative'
    },
    batteryFill: {
        width: '100%',
        borderRadius: 6,
    },
    bolt: {
        position: 'absolute',
        top: '40%',
        left: '25%',
        shadowColor: 'black',
        elevation: 5
    },
    percentageText: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.text,
    },
    statusText: {
        fontSize: 18,
        color: colors.subtext,
        marginTop: 5
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
        width: '100%',
        justifyContent: 'center'
    },
    gridItem: {
        width: '45%',
        backgroundColor: colors.card,
        padding: spacing.m,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border
    },
    miniIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    gridLabel: {
        fontSize: 12,
        color: colors.subtext,
        textTransform: 'uppercase'
    },
    gridValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 2
    },
    passBtn: {
        backgroundColor: colors.success,
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 30,
        marginTop: 'auto',
        marginBottom: 20,
        width: '100%',
        alignItems: 'center'
    },
    btnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    }
});
