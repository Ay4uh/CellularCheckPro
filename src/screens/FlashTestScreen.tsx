import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, NativeModules, Platform } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { useTheme } from '../context/ThemeContext';

const { HardwareModule } = NativeModules;

export const FlashTestScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const [isOn, setIsOn] = useState(false);
    const { completeTest, isAutomated } = useTestLogic('Flash');

    const toggleFlash = () => {
        const newState = !isOn;
        setIsOn(newState);
        if (Platform.OS === 'android' && HardwareModule) {
            HardwareModule.setFlashlight(newState);
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (Platform.OS === 'android' && HardwareModule) {
                HardwareModule.setFlashlight(false);
            }
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Camera Flash</Text>
                <Text style={styles.subtitle}>Test the rear LED torch / flashlight.</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.flashCircle, shadows.medium, isOn && styles.flashCircleOn]}
                    onPress={toggleFlash}
                >
                    <Icon
                        name={isOn ? "flashlight" : "flashlight-off"}
                        size={80}
                        color={isOn ? '#FFD600' : colors.primary}
                    />
                    <Text style={styles.tapText}>{isOn ? 'Flash is ON' : 'Turn On Flash'}</Text>
                </TouchableOpacity>

                <View style={[styles.statusBadge, { backgroundColor: isOn ? '#FFF9C4' : (theme.dark ? '#333' : '#F5F5F5') }]}>
                    <Text style={[styles.statusText, { color: isOn ? '#FBC02D' : colors.subtext }]}>
                        {isOn ? 'CHECK REAR OF PHONE' : 'IDLE'}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did the flash / torch light up?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Bright</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
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
        flashCircle: {
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.primary,
            marginBottom: 30
        },
        flashCircleOn: {
            borderColor: '#FFD600',
            backgroundColor: '#FFFDE7',
            elevation: 10,
            shadowColor: '#FFD600',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 15
        },
        tapText: {
            marginTop: 10,
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.primary
        },
        statusBadge: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
        },
        statusText: {
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1
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
};
