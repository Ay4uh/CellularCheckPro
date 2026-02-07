import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, NativeModules, Platform } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

const { HardwareModule } = NativeModules;

export const NetworkTestScreen = () => {
    const [simInfo, setSimInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { completeTest, isAutomated } = useTestLogic('Signal');

    useEffect(() => {
        fetchSimStatus();
    }, []);

    const fetchSimStatus = async () => {
        setIsLoading(true);
        if (Platform.OS === 'android' && HardwareModule) {
            try {
                const info = await HardwareModule.getSimStatus();
                setSimInfo(info);
            } catch (e) {
                console.log(e);
            }
        }
        setIsLoading(false);
    };

    const getSimStateLabel = (state: number) => {
        switch (state) {
            case 1: return 'Absent';
            case 5: return 'Ready';
            default: return 'Unknown';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Cellular & SIM</Text>
                <Text style={styles.subtitle}>Checking SIM card and signal strength.</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.simCard, shadows.medium]}>
                    <View style={styles.simHeader}>
                        <Icon name="sim" size={32} color={simInfo?.simState === 5 ? colors.success : colors.error} />
                        <Text style={styles.simTitle}>SIM Card Status</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>State:</Text>
                        <Text style={[styles.infoValue, { color: simInfo?.simState === 5 ? colors.success : colors.error }]}>
                            {isLoading ? 'Checking...' : getSimStateLabel(simInfo?.simState)}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Carrier:</Text>
                        <Text style={styles.infoValue}>{simInfo?.carrierName || 'No SIM Detected'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Roaming:</Text>
                        <Text style={styles.infoValue}>{simInfo?.isNetworkRoaming ? 'Yes' : 'No'}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.refreshBtn} onPress={fetchSimStatus}>
                    <Icon name="refresh" size={20} color={colors.primary} />
                    <Text style={styles.refreshText}>Refresh Status</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Is the cellular info correct?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No SIM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Correct</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.l,
        alignItems: 'center',
    },
    seqText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: colors.subtext,
        textAlign: 'center'
    },
    content: {
        flex: 1,
        padding: spacing.l,
        justifyContent: 'center',
        alignItems: 'center'
    },
    simCard: {
        width: '90%',
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: spacing.l,
        borderWidth: 1,
        borderColor: colors.border
    },
    simHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 15
    },
    simTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 15
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    infoLabel: {
        fontSize: 14,
        color: colors.subtext
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text
    },
    refreshBtn: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10
    },
    refreshText: {
        color: colors.primary,
        fontWeight: '600'
    },
    footer: {
        padding: spacing.l,
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...shadows.medium
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.m
    },
    controls: {
        flexDirection: 'row',
        gap: spacing.m
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    passBtn: {
        backgroundColor: colors.success,
    },
    failBtn: {
        backgroundColor: colors.error,
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
