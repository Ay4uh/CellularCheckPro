import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, PermissionsAndroid, Platform } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

export const GPSTestScreen = () => {
    const [location, setLocation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const { completeTest, isAutomated } = useTestLogic('GPS');

    const startLocationTest = async () => {
        setIsSearching(true);
        setError(null);

        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    setError("Location permission denied");
                    setIsSearching(false);
                    return;
                }
            } catch (err) {
                console.warn(err);
                setError("Permission error");
                setIsSearching(false);
                return;
            }
        }

        Geolocation.getCurrentPosition(
            (position) => {
                setLocation(position);
                setIsSearching(false);
            },
            (err) => {
                setError(err.message);
                setIsSearching(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>GPS Accuracy</Text>
                <Text style={styles.subtitle}>Verify your device can find its location.</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.statusBox, shadows.soft]}>
                    <Icon
                        name={location ? "map-marker-check" : isSearching ? "crosshairs-gps" : "map-marker-outline"}
                        size={60}
                        color={location ? colors.success : isSearching ? colors.secondary : colors.primary}
                    />
                    <Text style={styles.statusTitle}>
                        {location ? 'LOCATION FOUND' : isSearching ? 'SEARCHING SATELLITES...' : 'READY TO TEST'}
                    </Text>
                </View>

                {location && (
                    <View style={styles.dataGrid}>
                        <View style={styles.dataItem}>
                            <Text style={styles.label}>Accuracy</Text>
                            <Text style={styles.value}>{location.coords.accuracy.toFixed(1)}m</Text>
                        </View>
                        <View style={styles.dataItem}>
                            <Text style={styles.label}>Altitude</Text>
                            <Text style={styles.value}>{location.coords.altitude?.toFixed(1) || 'N/A'}m</Text>
                        </View>
                    </View>
                )}

                {error && <Text style={styles.errorText}>Error: {error}</Text>}

                <TouchableOpacity
                    style={[styles.startBtn, isSearching && styles.disabledBtn]}
                    onPress={startLocationTest}
                    disabled={isSearching}
                >
                    <Text style={styles.startBtnText}>{isSearching ? 'Locating...' : 'Get GPS Position'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Was accurate location found?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No / Slow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Accurate</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        padding: spacing.l,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statusBox: {
        width: '100%',
        backgroundColor: colors.card,
        padding: spacing.xl,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.border
    },
    statusTitle: {
        marginTop: 15,
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        letterSpacing: 1
    },
    dataGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30
    },
    dataItem: {
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        padding: 15,
        borderRadius: 12,
        minWidth: 100
    },
    label: {
        fontSize: 12,
        color: colors.subtext,
        marginBottom: 4
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary
    },
    errorText: {
        color: colors.error,
        marginBottom: 20,
        textAlign: 'center'
    },
    startBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center'
    },
    disabledBtn: {
        backgroundColor: colors.subtext
    },
    startBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
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
