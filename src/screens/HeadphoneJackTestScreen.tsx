import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, NativeEventEmitter, NativeModules, TouchableOpacity } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

const { HardwareModule } = NativeModules;
const hardwareEmitter = HardwareModule ? new NativeEventEmitter(HardwareModule) : null;

export const HeadphoneJackTestScreen = () => {
    const [isPlugged, setIsPlugged] = useState(false);
    const { completeTest, isAutomated } = useTestLogic('Headset');

    useEffect(() => {
        if (!hardwareEmitter) return;

        const sub = hardwareEmitter.addListener('onHeadsetPlugChange', (event) => {
            console.log('Headset changed:', event);
            setIsPlugged(event.plugged);
        });

        return () => sub.remove();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Headphone Jack</Text>
                <Text style={styles.subtitle}>Plug in your headphones to verify the 3.5mm jack or USB-C adapter.</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.statusCard, shadows.medium, isPlugged && styles.activeCard]}>
                    <Icon
                        name={isPlugged ? "headphones" : "headphones-off"}
                        size={80}
                        color={isPlugged ? colors.success : colors.primary}
                    />
                    <Text style={styles.statusText}>
                        {isPlugged ? 'HEADSET CONNECTED' : 'WAITING FOR HEADSET...'}
                    </Text>
                    <Text style={styles.detailText}>
                        {isPlugged ? 'The device successfully detected your headphones.' : 'Please insert a 3.5mm jack or adapter.'}
                    </Text>
                </View>

                <View style={styles.infoBox}>
                    <Icon name="information-outline" size={18} color={colors.subtext} />
                    <Text style={styles.infoText}>This test verifies the physical connection detection on the logic board.</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did the jack detect your headset?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Failed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Works Fine</Text>
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
    statusCard: {
        backgroundColor: colors.card,
        width: '100%',
        padding: spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 30
    },
    activeCard: {
        borderColor: colors.success,
        backgroundColor: '#F0FFF4'
    },
    statusText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text
    },
    detailText: {
        marginTop: 10,
        fontSize: 14,
        color: colors.subtext,
        textAlign: 'center',
        paddingHorizontal: 20
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 40
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
