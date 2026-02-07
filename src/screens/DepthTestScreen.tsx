import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat } from 'react-native-vision-camera';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

export const DepthTestScreen = () => {
    const device = useCameraDevice('back');
    const [hasDepth, setHasDepth] = useState<boolean | null>(null);
    const { completeTest, isAutomated } = useTestLogic('Depth');

    // Check for depth capability
    useEffect(() => {
        if (device) {
            const depthFormats = device.formats.filter(f => f.supportsVideoHdr || (f as any).supportsDepthCapture);
            setHasDepth(depthFormats.length > 0);
        }
    }, [device]);

    if (!device) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Depth / Portrait</Text>
                <Text style={styles.subtitle}>Verify depth sensor and portrait mode capabilities.</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.previewContainer}>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                    />

                    <View style={styles.statusOverlay}>
                        <Icon
                            name={hasDepth ? "layers-outline" : "layers-off-outline"}
                            size={24}
                            color={hasDepth ? colors.success : colors.warning}
                        />
                        <Text style={styles.statusText}>
                            {hasDepth ? 'Depth Mapping Available' : 'Depth Hardware Not Detected'}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Icon name="information-outline" size={18} color={colors.subtext} />
                    <Text style={styles.infoText}>
                        Portrait mode uses depth sensors or dual-lens parity to calculate distance.
                        This test checks the API for hardware depth support.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Does the camera preview look clear?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Failed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Works Fine</Text>
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
        padding: spacing.m,
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        ...shadows.medium
    },
    statusOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12
    },
    statusText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold'
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        marginTop: 20
    },
    infoText: {
        fontSize: 12,
        color: colors.subtext,
        textAlign: 'center'
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
