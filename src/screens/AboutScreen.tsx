import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors, spacing } from '../theme';

export const AboutScreen = () => {
    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.logoPlaceholder}>
                    {/* If we had a real logo, we'd use <Image source={require('../assets/logo.png')} style={styles.logo} /> */}
                    <Text style={styles.logoText}>CCP</Text>
                </View>
                <Text style={styles.appName}>Cellular Pro</Text>
                <Text style={styles.tagline}>Professional Diagnostics</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Cellular Check Pro</Text>
                <Text style={styles.text}>
                    Cellular Check Pro is a simple and reliable Android phone diagnostic tool designed to help you test your device hardware, sensors, and basic performance.
                </Text>
                <Text style={styles.text}>
                    This app allows you to run manual tests for your phone's display, touch screen, speakers, microphone, vibration, buttons, and available sensors. You can also view useful system information such as battery status, storage usage, RAM details, and device specifications.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Features</Text>
                <Text style={styles.bullet}>• Touch screen and display testing</Text>
                <Text style={styles.bullet}>• Speaker, microphone, and vibration tests</Text>
                <Text style={styles.bullet}>• Sensor checks (accelerometer, proximity, gyroscope)</Text>
                <Text style={styles.bullet}>• Battery level, temperature, and charging status</Text>
                <Text style={styles.bullet}>• Storage and RAM usage information</Text>
                <Text style={styles.bullet}>• Device and Android version details</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Important Disclaimer</Text>
                <Text style={styles.text}>
                    Cellular Check Pro does not claim to provide professional or manufacturer-level diagnostics. All results are based on available Android system information and user-initiated tests. This app is useful for basic troubleshooting, device checks before resale, or general hardware verification.
                </Text>
                <Text style={styles.text}>
                    Cellular Check Pro is not affiliated with any phone manufacturer or network carrier.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Developer Information</Text>
                <Text style={styles.label}>Developer: <Text style={styles.value}>Ayush Sharma</Text></Text>
                <Text style={styles.text}>
                    Cellular Check Pro is developed with a focus on reliability, transparency, and practical diagnostics. The goal is to provide a trusted tool that helps users and technicians quickly understand the true condition of a device.
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.version}>Version 1.0.0 (Pro)</Text>
                <Text style={styles.copyright}>© 2026 Ayush Sharma. All rights reserved.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.l,
        backgroundColor: colors.background,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.m,
        elevation: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    tagline: {
        fontSize: 14,
        color: colors.primary,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: 4,
        fontWeight: '600',
    },
    section: {
        marginBottom: spacing.xl,
        backgroundColor: colors.card,
        padding: spacing.m,
        borderRadius: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.s,
    },
    text: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 22,
        marginBottom: spacing.s,
    },
    bullet: {
        fontSize: 15,
        color: colors.text,
        marginBottom: 4,
        paddingLeft: 4,
    },
    label: {
        fontSize: 16,
        color: colors.subtext,
        marginBottom: spacing.s,
    },
    value: {
        color: colors.text,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.m,
    },
    version: {
        color: colors.subtext,
        fontSize: 14,
        marginBottom: 4,
    },
    copyright: {
        color: colors.subtext,
        fontSize: 12,
    }
});
