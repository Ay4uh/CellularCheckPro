import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, NativeModules, NativeEventEmitter, Platform } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

const { HardwareModule } = NativeModules;
const hardwareEvents = HardwareModule ? new NativeEventEmitter(HardwareModule) : null;

export const ProximityTestScreen = () => {
    const [isNear, setIsNear] = useState(false);
    const { completeTest, isAutomated } = useTestLogic('Proximity');

    useEffect(() => {
        if (Platform.OS === 'android' && HardwareModule && hardwareEvents) {
            HardwareModule.startProximityTracking();
            const subscription = hardwareEvents.addListener('onProximityChange', (event) => {
                setIsNear(event.isNear);
            });

            return () => {
                HardwareModule.stopProximityTracking();
                subscription.remove();
            };
        }
    }, []);

    return (
        <SafeAreaView style={[styles.container, isNear && styles.containerNear]}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={[styles.title, isNear && styles.textNear]}>Proximity Sensor</Text>
                <Text style={[styles.subtitle, isNear && styles.textNear]}>Cover the top of your phone with your hand.</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.sensorCircle, shadows.medium, isNear && styles.sensorCircleNear]}>
                    <Icon
                        name={isNear ? "hand-pointing-up" : "hand-front-left-outline"}
                        size={80}
                        color={isNear ? colors.success : colors.primary}
                    />
                </View>

                <Text style={[styles.statusText, isNear && styles.textNear]}>
                    {isNear ? 'SENSOR BLOCKED' : 'SENSOR CLEAR'}
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did the screen react when covered?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Worked</Text>
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
    containerNear: {
        backgroundColor: '#1A1A1A',
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
    textNear: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.l
    },
    sensorCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        marginBottom: 30
    },
    sensorCircleNear: {
        borderColor: colors.success,
        backgroundColor: '#2D3436'
    },
    statusText: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.primary,
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
