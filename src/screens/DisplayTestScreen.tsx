import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useTestContext } from '../context/TestContext';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

const TEST_COLORS = [
    { name: 'Red', color: '#FF0000' },
    { name: 'Green', color: '#00FF00' },
    { name: 'Blue', color: '#0000FF' },
    { name: 'White', color: '#FFFFFF' },
    { name: 'Black', color: '#000000' },
];

export const DisplayTestScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const [colorIndex, setColorIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const { markTestAndGoNext } = useTestContext();
    const navigation = useNavigation();

    const handleNext = () => {
        if (colorIndex < TEST_COLORS.length - 1) {
            setColorIndex(colorIndex + 1);
        } else {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        return (
            <View style={styles.resultsContainer}>
                <Text style={styles.title}>Display color test finished</Text>
                <Text style={styles.subtitle}>Did you notice any dead pixels or color issues?</Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.failButton]}
                        onPress={() => markTestAndGoNext('Display', 'failure', navigation)}
                    >
                        <Text style={styles.buttonText}>Issues Found</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.passButton]}
                        onPress={() => markTestAndGoNext('Display', 'success', navigation)}
                    >
                        <Text style={styles.buttonText}>Looks Good</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: TEST_COLORS[colorIndex].color }]}
            onPress={handleNext}
            activeOpacity={1}
        >
            <StatusBar hidden />
            <View style={styles.instructionBox}>
                <Text style={[
                    styles.instructionText,
                    { color: TEST_COLORS[colorIndex].name === 'White' ? '#000' : '#FFF' }
                ]}>
                    Tap to cycle colors: {TEST_COLORS[colorIndex].name} ({colorIndex + 1}/{TEST_COLORS.length})
                </Text>
                <Text style={[
                    styles.subInstructionText,
                    { color: TEST_COLORS[colorIndex].name === 'White' ? '#666' : '#CCC' }
                ]}>
                    Check for dead pixels or backlight bleed
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        instructionBox: {
            padding: spacing.m,
            borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.3)',
            alignItems: 'center',
        },
        instructionText: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        subInstructionText: {
            fontSize: 14,
            marginTop: 4,
        },
        resultsContainer: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.l,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: spacing.s,
        },
        subtitle: {
            fontSize: 16,
            color: colors.subtext,
            textAlign: 'center',
            marginBottom: spacing.xl,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: spacing.m,
        },
        button: {
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            borderRadius: 12,
            minWidth: 140,
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
