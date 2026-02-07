import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { colors, spacing } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

export const NfcTestScreen = () => {
    const { completeTest, isAutomated } = useTestLogic('NFC');
    const [supported, setSupported] = useState(false);
    const [status, setStatus] = useState('Idle');

    useEffect(() => {
        async function checkNfc() {
            const isSupported = await NfcManager.isSupported();
            setSupported(isSupported);
            if (isSupported) {
                await NfcManager.start();
            }
        }
        checkNfc();

        return () => {
            NfcManager.cancelTechnologyRequest();
        }
    }, []);

    const readNfc = async () => {
        try {
            setStatus('Scanning...');
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();
            console.log('NFC Tag:', tag);
            setStatus('Tag Found! ' + (tag?.id || 'Unknown'));
            Alert.alert("NFC Test Passed", "Tag detected successfully.", [
                { text: "OK", onPress: () => completeTest('success') }
            ]);
        } catch (ex) {
            console.warn('Oops!', ex);
            setStatus('Scan Cancelled / Error');
            NfcManager.cancelTechnologyRequest();
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
    };

    return (
        <View style={styles.container}>
            {isAutomated && <Text style={styles.seqText}>Test Sequence: NFC</Text>}
            <Text style={styles.title}>NFC Test</Text>

            {supported ? (
                <>
                    <View style={styles.statusBox}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={readNfc}>
                        <Text style={styles.buttonText}>Start NFC Scan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipBtn} onPress={() => completeTest('skipped')}>
                        <Text style={styles.skipText}>Skip NFC Test</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.error}>NFC is not supported on this device.</Text>
                    <TouchableOpacity style={styles.skipBtn} onPress={() => completeTest('skipped')}>
                        <Text style={styles.skipText}>Continue</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.m,
    },
    seqText: {
        position: 'absolute',
        top: 20,
        right: 20,
        fontSize: 14,
        color: colors.primary,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: spacing.xl,
        color: colors.text,
    },
    statusBox: {
        marginBottom: spacing.xl,
        padding: spacing.l,
        backgroundColor: colors.card,
        borderRadius: 12,
        minWidth: 200,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.m,
        borderRadius: 30,
        marginBottom: spacing.l,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    error: {
        color: colors.error,
        fontSize: 18,
        marginBottom: spacing.l,
    },
    skipBtn: {
        padding: spacing.s,
    },
    skipText: {
        color: colors.subtext,
        fontSize: 16
    }
});
