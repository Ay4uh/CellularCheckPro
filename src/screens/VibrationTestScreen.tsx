import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Vibration } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

export const VibrationTestScreen = () => {
    const [isVibrating, setIsVibrating] = useState(false);
    const { completeTest, isAutomated } = useTestLogic('Vibration');

    const startVibration = () => {
        setIsVibrating(true);
        // Pattern: [delay, duration, delay, duration ...]
        const ONE_SECOND_IN_MS = 1000;
        Vibration.vibrate([500, 500, 500, 500, 500, 500]);

        setTimeout(() => {
            setIsVibrating(false);
        }, 3000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Vibration Motor</Text>
                <Text style={styles.subtitle}>Test the haptic feedback of your device.</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.vibrateCircle, shadows.medium, isVibrating && styles.vibratingCircle]}
                    onPress={startVibration}
                    disabled={isVibrating}
                >
                    <Icon
                        name={isVibrating ? "vibrate" : "cellphone-basic"}
                        size={80}
                        color={isVibrating ? colors.secondary : colors.primary}
                    />
                    <Text style={styles.tapText}>{isVibrating ? 'Vibrating...' : 'Tap to Vibrate'}</Text>
                </TouchableOpacity>

                <View style={styles.tipBox}>
                    <Icon name="lightbulb-outline" size={20} color={colors.warning} />
                    <Text style={styles.tipText}>Make sure your phone is not on 'Silent' or 'Do Not Disturb'.</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did you feel the phone vibrating?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Felt it</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.l
    },
    vibrateCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        marginBottom: 40
    },
    vibratingCircle: {
        borderColor: colors.secondary,
        backgroundColor: '#E0F2F1'
    },
    tapText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF9C4',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        maxWidth: '80%'
    },
    tipText: {
        fontSize: 12,
        color: '#5D4037',
        flexShrink: 1
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
