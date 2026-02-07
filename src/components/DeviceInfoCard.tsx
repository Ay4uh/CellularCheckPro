import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { shadows } from '../theme';

interface DeviceInfoCardProps {
    theme: any;
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

export const DeviceInfoCard = React.memo(({ theme, fadeAnim, slideAnim }: DeviceInfoCardProps) => {
    const { colors } = theme;

    return (
        <Animated.View style={[styles.card, shadows.medium, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.card
        }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.dark ? '#333' : '#F3E5F5' }]}>
                <Icon name="cellphone-information" size={32} color="#9C27B0" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Device Specifications</Text>

            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Manufacturer:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{DeviceInfo.getManufacturerSync()}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Model:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{DeviceInfo.getModel()}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Android Version:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{DeviceInfo.getSystemVersion()}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Hardware:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{DeviceInfo.getHardwareSync()}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.subtext }]}>Brand:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{DeviceInfo.getBrand()}</Text>
            </View>
        </Animated.View>
    );
}, (prev, next) => {
    return prev.theme.dark === next.theme.dark;
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
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});
