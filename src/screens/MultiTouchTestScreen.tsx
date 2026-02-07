import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { TestOrder } from '../utils/TestOrder';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export const MultiTouchTestScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const [touches, setTouches] = useState<any[]>([]);
    const [maxTouches, setMaxTouches] = useState(0);
    const { completeTest, isAutomated, currentIndex } = useTestLogic('MultiTouch');
    const navigation = useNavigation();

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const currentTouches = [...evt.nativeEvent.touches];
                setTouches(currentTouches);
                if (currentTouches.length > maxTouches) {
                    setMaxTouches(currentTouches.length);
                }
            },
            onPanResponderMove: (evt) => {
                const currentTouches = [...evt.nativeEvent.touches];
                setTouches(currentTouches);
                if (currentTouches.length > maxTouches) {
                    setMaxTouches(currentTouches.length);
                }
            },
            onPanResponderRelease: () => {
                setTouches([]);
            },
            onPanResponderTerminate: () => {
                setTouches([]);
            },
        })
    ).current;

    const handleComplete = (success: boolean) => {
        completeTest(success ? 'success' : 'failure');
    };

    return (
        <View style={styles.container}>
            {/* Dedicated Touch Handling Layer */}
            <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

            {/* Background Indicators Layer */}
            {touches.map((touch, index) => (
                <View
                    key={touch.identifier || index}
                    style={[
                        styles.touchIndicator,
                        { left: touch.pageX - 40, top: touch.pageY - 40 }
                    ]}
                />
            ))}

            {/* UI Overlay Layer (Header & Footer) */}
            <View style={styles.overlay} pointerEvents="box-none">
                <View style={styles.header}>
                    {isAutomated && <Text style={styles.seqText}>Test {currentIndex + 1} of {TestOrder.length}</Text>}
                    <Text style={styles.title}>Multi-Touch Test</Text>
                    <Text style={styles.subtitle}>Touch with as many fingers as possible</Text>
                    <Text style={styles.countText}>Active: {touches.length} | Max Detected: {maxTouches}</Text>
                </View>

                <View style={styles.footer} pointerEvents="box-none">
                    <TouchableOpacity
                        style={[styles.button, styles.failButton]}
                        onPress={() => handleComplete(false)}
                    >
                        <Text style={styles.buttonText}>FAIL</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.passButton]}
                        onPress={() => handleComplete(true)}
                    >
                        <Text style={styles.buttonText}>PASS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
            paddingTop: spacing.xl,
            alignItems: 'center',
            backgroundColor: 'transparent',
            pointerEvents: 'none'
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'space-between',
            paddingVertical: spacing.xl,
        },
        seqText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: 8,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        subtitle: {
            fontSize: 14,
            color: colors.subtext,
            marginTop: 4,
        },
        countText: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.primary,
            marginTop: spacing.m,
        },
        touchIndicator: {
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(33, 150, 243, 0.5)',
            borderWidth: 2,
            borderColor: colors.primary,
        },
        footer: {
            position: 'absolute',
            bottom: spacing.xl,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.m,
            paddingHorizontal: spacing.l,
        },
        button: {
            flex: 1,
            paddingVertical: spacing.m,
            borderRadius: 12,
            alignItems: 'center',
        },
        passButton: {
            backgroundColor: colors.success,
        },
        failButton: {
            backgroundColor: colors.error,
        },
        buttonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
};
