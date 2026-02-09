import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { shadows } from '../theme';

interface RamCardProps {
    ram: {
        used: number;
        total: number;
        percentage: number;
    };
    ramHistory: number[];
    theme: any;
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    bytesToGB: (bytes: number) => string;
}

import { UsageGraph } from './UsageGraph';

export const RamCard = React.memo(({ ram, ramHistory, theme, fadeAnim, slideAnim, bytesToGB }: RamCardProps) => {
    const { colors } = theme;

    const renderProgressBar = (percentage: number, color: string) => (
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
    );

    return (
        <Animated.View style={[styles.card, shadows.medium, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.card
        }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.dark ? '#333' : '#E8F5E9' }]}>
                <Icon name="memory" size={32} color="#4CAF50" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>RAM (Memory)</Text>
            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Used: {bytesToGB(ram.used)}</Text>
                <Text style={[styles.label, { color: colors.subtext }]}>Total: {bytesToGB(ram.total)}</Text>
            </View>
            {renderProgressBar(ram.percentage, ram.percentage > 85 ? colors.warning : '#4CAF50')}

            <UsageGraph
                data={ramHistory}
                color="#4CAF50"
                height={80}
            />

            <Text style={[styles.percentageText, { color: colors.text }]}>{ram.percentage}% Used</Text>
        </Animated.View>
    );
}, (prev, next) => {
    return prev.ram.percentage === next.ram.percentage &&
        JSON.stringify(prev.ramHistory) === JSON.stringify(next.ramHistory) &&
        prev.theme.dark === next.theme.dark;
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'right',
    },
});
