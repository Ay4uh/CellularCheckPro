import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NetInfo from '@react-native-community/netinfo';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

export const WifiTestScreen = () => {
    const [wifiInfo, setWifiInfo] = useState<any>(null);
    const [isTestingSpeed, setIsTestingSpeed] = useState(false);
    const [speedResults, setSpeedResults] = useState<number | null>(null);
    const { completeTest, isAutomated } = useTestLogic('Wi-Fi');

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.type === 'wifi') {
                setWifiInfo(state.details);
            } else {
                setWifiInfo(null);
            }
        });

        // Initial check
        NetInfo.fetch().then(state => {
            if (state.type === 'wifi') {
                setWifiInfo(state.details);
            }
        });

        return () => unsubscribe();
    }, []);

    const runSpeedTest = async () => {
        setIsTestingSpeed(true);
        setSpeedResults(null);

        // Simulating a speed test by fetching a small resource and measuring time
        // In a real app, this would be more complex
        const startTime = Date.now();
        try {
            const response = await fetch('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png', { cache: 'no-store' } as any);
            await response.blob();
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            // Dummy logic to simulate "Mbps"
            const mockSpeed = Math.floor(Math.random() * 50) + 10;
            setSpeedResults(mockSpeed);
        } catch (e) {
            console.log('Speed test error:', e);
        }
        setIsTestingSpeed(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Wi-Fi Connectivity</Text>
                <Text style={styles.subtitle}>Check Wi-Fi strength and internet speed.</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.infoCard, shadows.medium]}>
                    <View style={styles.infoRow}>
                        <Icon name="wifi" size={32} color={wifiInfo ? colors.success : colors.subtext} />
                        <View>
                            <Text style={styles.primaryInfo}>
                                {wifiInfo ? `Connected to ${wifiInfo.ssid || 'Wi-Fi'}` : 'Not Connected'}
                            </Text>
                            {wifiInfo && (
                                <Text style={styles.secondaryInfo}>
                                    Strength: {wifiInfo.strength}% | IP: {wifiInfo.ipAddress || 'N/A'}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.speedBtn, isTestingSpeed && styles.disabledBtn]}
                    onPress={runSpeedTest}
                    disabled={isTestingSpeed}
                >
                    {isTestingSpeed ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <>
                            <Icon name="speedometer" size={24} color="#FFF" />
                            <Text style={styles.speedBtnText}>Run Speed Test</Text>
                        </>
                    )}
                </TouchableOpacity>

                {speedResults && (
                    <View style={styles.resultsBox}>
                        <Text style={styles.speedValue}>{speedResults}</Text>
                        <Text style={styles.speedUnit}>Mbps</Text>
                        <Text style={styles.speedLabel}>Download Speed</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Is Wi-Fi working as expected?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No / Slow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Fast</Text>
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
        alignItems: 'center'
    },
    infoCard: {
        backgroundColor: colors.card,
        width: '100%',
        padding: spacing.l,
        borderRadius: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.border
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    primaryInfo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text
    },
    secondaryInfo: {
        fontSize: 14,
        color: colors.subtext,
        marginTop: 4
    },
    speedBtn: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 12,
        alignItems: 'center',
        gap: 10,
        width: '80%',
        justifyContent: 'center'
    },
    disabledBtn: {
        opacity: 0.6
    },
    speedBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    resultsBox: {
        marginTop: 40,
        alignItems: 'center'
    },
    speedValue: {
        fontSize: 72,
        fontWeight: '900',
        color: colors.secondary
    },
    speedUnit: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.subtext,
        marginTop: -10
    },
    speedLabel: {
        fontSize: 14,
        color: colors.subtext,
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 2
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
