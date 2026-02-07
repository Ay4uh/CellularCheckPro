import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Easing, StatusBar, Image } from 'react-native';
import { useTestContext } from '../context/TestContext';
import { TestOrder } from '../utils/TestOrder';
import { spacing, shadows } from '../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AnimatedScaleButton } from '../components/AnimatedScaleButton';
import { useTheme } from '../context/ThemeContext';
import DeviceInfo from 'react-native-device-info';

import { TestCard } from '../components/TestCard';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (width - (spacing.m * 3)) / COLUMN_COUNT;

export const DashboardScreen = ({ navigation }: any) => {
    const { results, isAutomated, currentIndex, startAutomatedTest } = useTestContext();
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad)
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad)
            })
        ]).start();
    }, []);

    const handleStartAutomated = () => {
        startAutomatedTest();
        navigation.navigate(TestOrder[0].route);
    };

    const handleContinueAutomated = () => {
        if (currentIndex >= 0 && currentIndex < TestOrder.length) {
            navigation.navigate(TestOrder[currentIndex].route);
        } else {
            navigation.navigate(TestOrder[0].route);
        }
    };

    const startTest = React.useCallback((testId: string) => {
        const test = TestOrder.find(t => t.id === testId);
        if (test) {
            navigation.navigate(test.route);
        }
    }, [navigation]);

    const getIconName = React.useCallback((id: string) => {
        switch (id) {
            case 'Earpiece': return 'phone-in-talk';
            case 'Speaker': return 'volume-high';
            case 'Microphone': return 'microphone';
            case 'Camera': return 'camera';
            case 'Touch': return 'gesture-tap';
            case 'MultiTouch': return 'gesture-spread';
            case 'Display': return 'palette';
            case 'Proximity': return 'eye-off-outline';
            case 'Vibration': return 'vibrate';
            case 'Flash': return 'flashlight';
            case 'GPS': return 'crosshairs-gps';
            case 'Signal': return 'signal-cellular-3';
            case 'Fingerprint': return 'fingerprint';
            case 'Face ID': return 'face-recognition';
            case 'Wi-Fi': return 'wifi';
            case 'Bluetooth': return 'bluetooth';
            case 'Sensors': return 'compass-outline';
            case 'Battery': return 'battery-charging-90';
            case 'NFC': return 'nfc';
            case 'Buttons': return 'gesture-tap-button';
            case 'Headset': return 'headphones';
            case 'Video': return 'video-check';
            default: return 'circle-outline';
        }
    }, []);

    const getStatusColor = React.useCallback((status: string) => {
        switch (status) {
            case 'success': return colors.success;
            case 'failure': return colors.error;
            case 'skipped': return colors.warning;
            default: return colors.subtext;
        }
    }, [colors]);

    const passedCount = Object.values(results).filter(r => r === 'success').length;
    const totalTests = TestOrder.length;
    const progress = Math.round((passedCount / totalTests) * 100);

    return (
        <ScrollView
            style={styles.mainContainer}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            {/* Professional Summary Header */}
            <Animated.View style={[styles.headerCard, shadows.medium, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.headerInfo}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                    />
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>Device Overview</Text>
                        <Text style={styles.deviceName} numberOfLines={1}>{DeviceInfo.getModel()}</Text>
                        <Text style={styles.statusSummary}>{passedCount}/{totalTests} Tests Passed</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={[styles.progressCircle, { borderColor: progress === 100 ? colors.success : colors.primary }]}>
                            <Text style={[styles.progressText, { color: progress === 100 ? colors.success : colors.primary }]}>{progress}%</Text>
                        </View>
                    </View>
                </View>

                {/* Automated Test Button */}
                <TouchableOpacity
                    style={[styles.automatedButton, isAutomated && styles.automatedActive]}
                    onPress={isAutomated ? handleContinueAutomated : handleStartAutomated}
                    activeOpacity={0.8}
                >
                    <Icon
                        name={isAutomated ? "play-circle" : "auto-fix"}
                        size={24}
                        color="#FFF"
                        style={styles.btnIcon}
                    />
                    <View>
                        <Text style={styles.automatedTitle}>
                            {isAutomated ? "Continue sequence" : "Automated sequence"}
                        </Text>
                        <Text style={styles.automatedSub}>
                            {isAutomated ? "Resume hardware checks" : "Quickly test all features"}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color="#FFF" style={styles.chevron} />
                </TouchableOpacity>

                {/* Security Center Entry (Temporarily commented out for compliance) */}
                {/* 
                <AnimatedScaleButton
                    style={[styles.securityCard, shadows.soft]}
                    onPress={() => navigation.navigate('SecurityScan')}
                >
                    <View style={styles.securityIconMain}>
                        <Icon name="shield-check" size={24} color={colors.success} />
                    </View>
                    <View style={styles.securityTextContainer}>
                        <Text style={styles.securityTitle}>Security Center</Text>
                        <Text style={styles.securitySub}>Device protection is active</Text>
                    </View>
                    <View style={styles.securityBadge}>
                        <Text style={styles.securityBadgeText}>SAFE</Text>
                    </View>
                </AnimatedScaleButton>
                */}
            </Animated.View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Manual Tests</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Report')}>
                    <Text style={styles.sectionLink}>View Report</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {TestOrder.map((test) => (
                    <TestCard
                        key={test.id}
                        test={test}
                        status={results[test.id] || 'pending'}
                        theme={theme}
                        onPress={startTest}
                        getIconName={getIconName}
                        getStatusColor={getStatusColor}
                    />
                ))}
            </View>
        </ScrollView>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        mainContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            padding: spacing.m,
            paddingTop: 20,
            paddingBottom: 85,
        },
        headerCard: {
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: spacing.l,
            marginBottom: spacing.xl,
        },
        headerInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.l,
        },
        logo: {
            width: 50,
            height: 50,
            borderRadius: 12,
            marginRight: spacing.m,
        },
        headerLeft: {
            flex: 1,
        },
        greeting: {
            fontSize: 14,
            color: colors.subtext,
            fontWeight: '600',
        },
        deviceName: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        statusSummary: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: 'bold',
        },
        headerRight: {
            marginLeft: spacing.m,
        },
        progressCircle: {
            width: 70,
            height: 70,
            borderRadius: 35,
            borderWidth: 5,
            borderColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.dark ? '#333' : '#F0F8FF',
        },
        progressText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.primary,
        },
        automatedButton: {
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 4,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        automatedActive: {
            backgroundColor: colors.secondary,
            shadowColor: colors.secondary,
        },
        btnIcon: {
            marginRight: spacing.m,
        },
        automatedTitle: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
        automatedSub: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
        },
        chevron: {
            marginLeft: 'auto',
        },
        securityCard: {
            backgroundColor: theme.dark ? '#333' : '#F8F9FA',
            marginTop: spacing.m,
            padding: spacing.m,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        securityIconMain: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.success + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.m,
        },
        securityTextContainer: {
            flex: 1,
        },
        securityTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        securitySub: {
            fontSize: 12,
            color: colors.subtext,
        },
        securityBadge: {
            backgroundColor: colors.success,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginRight: 8,
        },
        securityBadgeText: {
            color: '#FFF',
            fontSize: 10,
            fontWeight: '900',
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.m,
            paddingHorizontal: 4,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        sectionLink: {
            color: colors.primary,
            fontWeight: '600',
            fontSize: 14,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        card: {
            width: CARD_WIDTH,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: spacing.m,
            marginBottom: spacing.m,
            alignItems: 'center',
            position: 'relative',
        },
        iconContainer: {
            width: 54,
            height: 54,
            borderRadius: 27,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
        },
        cardTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 2,
            height: 18,
        },
        cardStatus: {
            fontSize: 11,
            fontWeight: '700',
        },
        checkBadge: {
            position: 'absolute',
            top: 8,
            right: 8,
            width: 18,
            height: 18,
            borderRadius: 9,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
};
