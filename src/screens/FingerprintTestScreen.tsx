import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

const rnBiometrics = new ReactNativeBiometrics();

export const FingerprintTestScreen = () => {
    const [biometryType, setBiometryType] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const { completeTest, isAutomated } = useTestLogic('Fingerprint');

    useEffect(() => {
        checkAvailability();
    }, []);

    const checkAvailability = async () => {
        try {
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            if (available) {
                setBiometryType(biometryType || 'Available');
            } else {
                setBiometryType('Not Supported');
            }
        } catch (error) {
            console.error(error);
            setBiometryType('Error');
        }
    };

    const runTest = async () => {
        setIsTesting(true);
        try {
            const { success } = await rnBiometrics.simplePrompt({
                promptMessage: 'Confirm Fingerprint Sensor Response',
                cancelButtonText: 'Cancel'
            });

            if (success) {
                Alert.alert("Success", "Biometric sensor responded correctly!");
            }
        } catch (error) {
            console.log('Biometric error:', error);
            // Don't alert on cancel
        }
        setIsTesting(false);
    };

    const getBiometryIcon = () => {
        if (biometryType === BiometryTypes.FaceID) return "face-recognition";
        if (biometryType === BiometryTypes.TouchID) return "fingerprint";
        if (biometryType === BiometryTypes.Biometrics) return "fingerprint";
        return "fingerprint-off";
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Biometric Check</Text>
                <Text style={styles.subtitle}>Verify Fingerprint or Face sensors.</Text>
                <Text style={styles.disclaimer}>Only tests sensor response. No data stored.</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.sensorCard, shadows.medium]}>
                    <Icon name={getBiometryIcon()} size={64} color={biometryType && biometryType !== 'Not Supported' ? colors.primary : colors.error} />
                    <Text style={styles.sensorStatus}>
                        {biometryType === null ? 'Scanning hardware...' : `Type: ${biometryType}`}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.testBtn, (isTesting || !biometryType || biometryType === 'Not Supported') && styles.disabledBtn]}
                    onPress={runTest}
                    disabled={isTesting || !biometryType || biometryType === 'Not Supported'}
                >
                    <Icon name="shield-check-outline" size={24} color="#FFF" />
                    <Text style={styles.testBtnText}>{isTesting ? 'Awaiting Input...' : 'Test Sensor Response'}</Text>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Icon name="information-outline" size={18} color={colors.subtext} />
                    <Text style={styles.infoText}>This only tests if the sensor is responsive. No data is stored.</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did the biometric sensor respond?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No Response</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Responsive</Text>
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
    disclaimer: {
        fontSize: 11,
        color: colors.subtext,
        marginTop: 6,
        fontStyle: 'italic',
        textAlign: 'center'
    },
    content: {
        flex: 1,
        padding: spacing.l,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sensorCard: {
        backgroundColor: colors.card,
        width: '100%',
        padding: spacing.xl,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.border
    },
    sensorStatus: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text
    },
    testBtn: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        width: '80%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 30
    },
    disabledBtn: {
        backgroundColor: colors.subtext,
        opacity: 0.6
    },
    testBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20
    },
    infoText: {
        fontSize: 12,
        color: colors.subtext,
        textAlign: 'center'
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
