import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export const HardwareInfoScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Hardware Info Screen</Text>
        <Text style={styles.subText}>Device specifications will be displayed here.</Text>
    </View>
);

export const ReportScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Diagnostic Report</Text>
        <Text style={styles.subText}>Test results log will appear here.</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.s,
    },
    subText: {
        fontSize: 16,
        color: colors.subtext,
    },
});
