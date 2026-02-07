import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, GestureResponderEvent, SafeAreaView } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, CameraPosition } from 'react-native-vision-camera';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { useTheme } from '../context/ThemeContext';

export const CameraTestScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const { completeTest, isAutomated } = useTestLogic('Camera');
    const { hasPermission, requestPermission } = useCameraPermission();
    const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
    const device = useCameraDevice(cameraPosition);
    const camera = useRef<Camera>(null);
    const [isActive, setIsActive] = useState(false);
    const [photoPath, setPhotoPath] = useState<string | null>(null);

    useEffect(() => {
        requestPermission().then((granted) => {
            if (granted) {
                setIsActive(true);
            }
        });
    }, []);

    const takePhoto = async () => {
        if (camera.current) {
            try {
                const photo = await camera.current.takePhoto();
                setPhotoPath(photo.path);
                setIsActive(false);
            } catch (e) {
                console.error('Failed to take photo', e);
            }
        }
    };

    const toggleCamera = () => {
        setCameraPosition(prev => prev === 'back' ? 'front' : 'back');
    };

    const handleFocus = async (event: GestureResponderEvent) => {
        if (!device?.supportsFocus || !camera.current) return;
        const { locationX, locationY } = event.nativeEvent;
        try {
            await camera.current.focus({ x: locationX, y: locationY });
        } catch (e) { }
    };

    if (!hasPermission) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="camera-off" size={50} color={colors.subtext} />
                <Text style={styles.msgText}>Camera permission needed</Text>
            </View>
        )
    }

    if (device == null) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.msgText}>Loading Camera...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {isActive ? (
                <View style={styles.cameraWrapper}>
                    <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={handleFocus}>
                        <Camera
                            ref={camera}
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={isActive}
                            photo={true}
                            enableZoomGesture={true}
                        />
                        <View style={styles.overlayHeader}>
                            <Text style={styles.seqText}>{isAutomated ? 'Test 3/8' : 'Camera Test'}</Text>
                        </View>
                        <Text style={styles.focusHint}>Tap screen to focus</Text>
                    </TouchableOpacity>

                    {/* Camera Controls Overlay */}
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.glassBtn} onPress={toggleCamera}>
                            <Icon name="camera-flip" size={28} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.shutterBtn} onPress={takePhoto}>
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>

                        <View style={{ width: 50 }} />
                    </View>
                </View>
            ) : (
                <SafeAreaView style={styles.resultContainer}>
                    <View style={styles.header}>
                        <Icon name="camera-check" size={60} color={colors.success} />
                        <Text style={styles.title}>Capture Success</Text>
                        <Text style={styles.subtitle}>Image captured successfully.</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>File Path:</Text>
                        <Text numberOfLines={2} style={styles.pathText}>{photoPath || 'N/A'}</Text>
                    </View>

                    <View style={styles.actionBlock}>
                        <TouchableOpacity onPress={() => setIsActive(true)} style={styles.retryBtn}>
                            <Text style={styles.retryText}>Retake Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => completeTest('success')} style={[styles.passBtn, shadows.medium]}>
                            <Icon name="check" size={24} color="#FFF" />
                            <Text style={styles.passText}>Pass Test</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}
        </View>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#000', // Camera view typically black background behind feed
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background
        },
        msgText: {
            marginTop: 20,
            color: colors.subtext,
            fontSize: 16
        },
        cameraWrapper: {
            flex: 1,
        },
        overlayHeader: {
            position: 'absolute',
            top: 50,
            width: '100%',
            alignItems: 'center',
            zIndex: 10
        },
        seqText: {
            color: '#FFF',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0,0,0,0.4)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            fontSize: 12
        },
        focusHint: {
            position: 'absolute',
            top: 100,
            alignSelf: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 14,
            pointerEvents: 'none'
        },
        controls: {
            position: 'absolute',
            bottom: 40,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            width: '100%',
            paddingHorizontal: 30,
        },
        glassBtn: {
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 25,
            // backdropFilter: 'blur(10px)', // Native blur requires libraries
        },
        shutterBtn: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 4,
            borderColor: 'rgba(255,255,255,0.5)'
        },
        shutterInner: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#FFF',
        },
        resultContainer: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            padding: spacing.l
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing.xl
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: 10
        },
        subtitle: {
            color: colors.subtext,
            fontSize: 14
        },
        card: {
            backgroundColor: colors.card,
            padding: spacing.m,
            borderRadius: 12,
            marginBottom: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border
        },
        cardLabel: {
            fontSize: 12,
            color: colors.subtext,
            marginBottom: 4,
            textTransform: 'uppercase'
        },
        pathText: {
            fontSize: 12,
            color: colors.text,
            fontFamily: 'Courier',
        },
        actionBlock: {
            gap: spacing.m
        },
        passBtn: {
            backgroundColor: colors.success,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            gap: 8
        },
        passText: {
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold'
        },
        retryBtn: {
            padding: 16,
            alignItems: 'center'
        },
        retryText: {
            color: colors.primary,
            fontSize: 16,
            fontWeight: '600'
        }
    });
};
