import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, NativeEventEmitter, NativeModules, Platform } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { TouchableOpacity } from 'react-native';

const { HardwareModule } = NativeModules;
const hardwareEmitter = HardwareModule ? new NativeEventEmitter(HardwareModule) : null;

export const ButtonsTestScreen = () => {
    const [volumeUpPressed, setVolumeUpPressed] = useState(false);
    const [volumeDownPressed, setVolumeDownPressed] = useState(false);
    const [powerPressed, setPowerPressed] = useState(false);

    const { completeTest, isAutomated } = useTestLogic('Buttons');

    useEffect(() => {
        if (!hardwareEmitter) return;

        const upSub = hardwareEmitter.addListener('onVolumeUpPress', (event) => {
            setVolumeUpPressed(event.isDown);
        });
        const downSub = hardwareEmitter.addListener('onVolumeDownPress', (event) => {
            setVolumeDownPressed(event.isDown);
        });
        const powerSub = hardwareEmitter.addListener('onPowerButtonPress', (event) => {
            setPowerPressed(event.isDown);
        });

        return () => {
            upSub.remove();
            downSub.remove();
            powerSub.remove();
        };
    }, []);

    const allPressed = volumeUpPressed && volumeDownPressed && (Platform.OS === 'ios' ? true : powerPressed);

    const ButtonIndicator = ({ label, icon, isPressed }: { label: string, icon: string, isPressed: boolean }) => (
        <View style={[styles.card, isPressed && styles.pressedCard]}>
            <Icon name={icon} size={48} color={isPressed ? '#FFF' : colors.primary} />
            <Text style={[styles.label, isPressed && styles.pressedLabel]}>{label}</Text>
            <View style={[styles.statusBadge, isPressed ? styles.successBadge : styles.pendingBadge]}>
                <Text style={styles.badgeText}>{isPressed ? 'DETECTED' : 'AWAITING'}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Physical Buttons</Text>
                <Text style={styles.subtitle}>Press the physical buttons on your device to verify they work.</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.grid}>
                    <ButtonIndicator label="Volume Up" icon="volume-plus" isPressed={volumeUpPressed} />
                    <ButtonIndicator label="Volume Down" icon="volume-minus" isPressed={volumeDownPressed} />
                    {Platform.OS === 'android' && (
                        <ButtonIndicator label="Power Button" icon="power" isPressed={powerPressed} />
                    )}
                </View>

                {Platform.OS === 'ios' && (
                    <View style={styles.iosNote}>
                        <Icon name="apple" size={20} color={colors.subtext} />
                        <Text style={styles.iosNoteText}>Mute switch detection requires active audio session check on iOS.</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did all buttons respond correctly?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Failed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>All Work</Text>
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
        justifyContent: 'center'
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.m,
        justifyContent: 'center'
    },
    card: {
        backgroundColor: colors.card,
        width: '45%',
        padding: spacing.l,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.soft
    },
    pressedCard: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    label: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text
    },
    pressedLabel: {
        color: '#FFF'
    },
    statusBadge: {
        marginTop: 15,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pendingBadge: {
        backgroundColor: colors.background,
    },
    successBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.subtext
    },
    iosNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8,
        opacity: 0.6
    },
    iosNoteText: {
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
