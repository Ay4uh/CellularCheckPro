import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, NativeModules } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
const { HardwareModule } = NativeModules;
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

const rnBiometrics = new ReactNativeBiometrics();

export const FaceUnlockTestScreen = () => {
    const [biometryType, setBiometryType] = useState<string | null>(null);
    const [hasFaceHardware, setHasFaceHardware] = useState<boolean | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const { completeTest, isAutomated } = useTestLogic('Face ID');

    useEffect(() => {
        checkAvailability();
    }, []);

    const checkAvailability = async () => {
        try {
            // Check native hardware features first
            const features = await HardwareModule.getBiometricFeatures();
            setHasFaceHardware(features.hasFace);

            const { available, biometryType: type } = await rnBiometrics.isSensorAvailable();
            if (available) {
                setBiometryType(type || 'Available');
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
                promptMessage: 'Confirm Face Unlock Response',
                cancelButtonText: 'Cancel'
            });

            if (success) {
                Alert.alert("Success", "Unlock interaction responded correctly!");
            }
        } catch (error) {
            console.log('Unlock error:', error);
        }
        setIsTesting(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Face Unlock</Text>
                <Text style={styles.subtitle}>Verify Face ID / Face Unlock sensors.</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.sensorCard, shadows.medium, !hasFaceHardware && styles.warningCard]}>
                    <Icon
                        name={hasFaceHardware ? "face-recognition" : "alert-circle-outline"}
                        size={80}
                        color={hasFaceHardware ? colors.success : colors.warning}
                    />
                    <Text style={styles.sensorStatus}>
                        {biometryType === null ? 'Scanning hardware...' :
                            hasFaceHardware ? 'Face Unlock Hardware Detected' :
                                'Face Unlock Hardware Missing'}
                    </Text>
                    {!hasFaceHardware && biometryType === 'Biometrics' && (
                        <Text style={styles.warningText}>
                            Note: Device supports biometrics, but specific Face Unlock hardware was not found. System may default to Fingerprint.
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.testBtn, (isTesting || !biometryType) && styles.disabledBtn]}
                    onPress={runTest}
                    disabled={isTesting || !biometryType}
                >
                    <Icon name="face-recognition" size={24} color="#FFF" />
                    <Text style={styles.testBtnText}>{isTesting ? 'Awaiting Face...' : 'Test Face Response'}</Text>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Icon name="information-outline" size={18} color={colors.subtext} />
                    <Text style={styles.infoText}>This verifies the sensor's ability to trigger the secure unlock prompt.</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did the Face Unlock prompt appear?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Active</Text>
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    sensorCard: {
        backgroundColor: colors.card,
        width: '100%',
        padding: spacing.l,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.border
    },
    warningCard: {
        borderColor: colors.warning,
        backgroundColor: '#FFFBEB'
    },
    warningText: {
        marginTop: 10,
        fontSize: 12,
        color: colors.warning,
        textAlign: 'center',
        paddingHorizontal: 10
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
