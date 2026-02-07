import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { shadows } from '../theme';

interface StorageCardProps {
    storage: {
        used: number;
        total: number;
        percentage: number;
    };
    theme: any;
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    bytesToGB: (bytes: number) => string;
}

export const StorageCard = React.memo(({ storage, theme, fadeAnim, slideAnim, bytesToGB }: StorageCardProps) => {
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
            <View style={[styles.iconBox, { backgroundColor: theme.dark ? '#333' : '#E3F2FD' }]}>
                <Icon name="harddisk" size={32} color="#2196F3" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Storage</Text>
            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Used: {bytesToGB(storage.used)}</Text>
                <Text style={[styles.label, { color: colors.subtext }]}>Total: {bytesToGB(storage.total)}</Text>
            </View>
            {renderProgressBar(storage.percentage, storage.percentage > 90 ? colors.error : '#2196F3')}
            <Text style={[styles.percentageText, { color: colors.text }]}>{storage.percentage}% Used</Text>
        </Animated.View>
    );
}, (prev, next) => {
    return prev.storage.percentage === next.storage.percentage && prev.theme.dark === next.theme.dark;
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
