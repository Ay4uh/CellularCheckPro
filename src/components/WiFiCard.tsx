import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { shadows } from '../theme';

interface WiFiCardProps {
    wifiInfo: {
        isConnected: boolean;
        type: string;
        ssid: string | null;
        ipAddress: string | null;
        strength: number | null;
        frequency: number | null;
    };
    theme: any;
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

export const WiFiCard = React.memo(({ wifiInfo, theme, fadeAnim, slideAnim }: WiFiCardProps) => {
    const { colors } = theme;

    return (
        <Animated.View style={[styles.card, shadows.medium, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.card
        }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.dark ? '#333' : '#E0F7FA' }]}>
                <Icon name="wifi" size={32} color="#00BCD4" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>WiFi Network</Text>
            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Status:</Text>
                <Text style={[styles.value, { color: wifiInfo.isConnected ? colors.success : colors.error }]}>
                    {wifiInfo.isConnected ? 'Connected' : 'Disconnected'}
                </Text>
            </View>
            {wifiInfo.isConnected && (
                <>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.subtext }]}>SSID:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{wifiInfo.ssid || 'Unknown'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.subtext }]}>IP Address:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{wifiInfo.ipAddress || 'Unknown'}</Text>
                    </View>
                    {wifiInfo.strength !== null && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.subtext }]}>Signal Strength:</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{wifiInfo.strength}%</Text>
                        </View>
                    )}
                    {wifiInfo.frequency !== null && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.subtext }]}>Frequency:</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{wifiInfo.frequency} MHz</Text>
                        </View>
                    )}
                </>
            )}
        </Animated.View>
    );
}, (prev, next) => {
    return JSON.stringify(prev.wifiInfo) === JSON.stringify(next.wifiInfo) && prev.theme.dark === next.theme.dark;
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
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginRight: 10,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        paddingLeft: 5,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});
