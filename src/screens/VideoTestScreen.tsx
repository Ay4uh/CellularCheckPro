import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, VideoFile } from 'react-native-vision-camera';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import Video from 'react-native-video';

export const VideoTestScreen = () => {
    const device = useCameraDevice('back');
    const camera = useRef<Camera>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [videoPath, setVideoPath] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const timerRef = useRef<any>(null);

    const { completeTest, isAutomated } = useTestLogic('Video');

    useEffect(() => {
        requestPermissions();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const requestPermissions = async () => {
        try {
            const cameraStatus = await Camera.requestCameraPermission();
            const microStatus = await Camera.requestMicrophonePermission();

            if (cameraStatus !== 'granted' || microStatus !== 'granted') {
                Alert.alert('Permissions Required', 'Camera and Microphone permissions are needed for the Video Sync test.');
            }
        } catch (e) {
            console.error('Permission error:', e);
        }
    };

    const startRecording = async () => {
        try {
            if (!camera.current) return;

            setVideoPath(null);
            setIsRecording(true);
            setCountdown(5);

            await camera.current.startRecording({
                onRecordingFinished: (video) => {
                    console.log('Recording finished:', video.path);
                    setVideoPath(video.path);
                    setIsRecording(false);
                },
                onRecordingError: (error) => {
                    console.error('Recording error:', error);
                    setIsRecording(false);
                    Alert.alert('Error', 'Failed to record video');
                },
            });

            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        stopRecording();
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (e) {
            console.error(e);
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        if (!camera.current) return;
        await camera.current.stopRecording();
    };

    if (!device) return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Video & Audio Sync</Text>
                <Text style={styles.subtitle}>Record a short clip and play it back to check A/V sync.</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.previewContainer}>
                    {!videoPath ? (
                        <Camera
                            ref={camera}
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={!videoPath}
                            video={true}
                            audio={true}
                        />
                    ) : (
                        <Video
                            source={{ uri: 'file://' + videoPath }}
                            style={StyleSheet.absoluteFill}
                            controls={true}
                            resizeMode="cover"
                            repeat={true}
                        />
                    )}

                    {isRecording && (
                        <View style={styles.recordingOverlay}>
                            <View style={styles.recDot} />
                            <Text style={styles.recText}>REC 00:0{countdown}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionArea}>
                    {!videoPath ? (
                        <TouchableOpacity
                            style={[styles.recordBtn, isRecording && styles.recordingBtn]}
                            onPress={isRecording ? stopRecording : startRecording}
                        >
                            <Icon name={isRecording ? "stop" : "record"} size={32} color="#FFF" />
                            <Text style={styles.btnLabel}>{isRecording ? 'Stop' : 'Record 5s'}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.retryBtn}
                            onPress={() => setVideoPath(null)}
                        >
                            <Icon name="refresh" size={24} color={colors.primary} />
                            <Text style={styles.retryText}>Retake Video</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Is audio and video perfectly synced?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Bad Sync</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Perfect Sync</Text>
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
    recordingOverlay: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8
    },
    recDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF0000'
    },
    recText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold'
    },
    actionArea: {
        paddingVertical: 20,
        alignItems: 'center'
    },
    recordBtn: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        gap: 10,
        ...shadows.soft
    },
    recordingBtn: {
        backgroundColor: colors.error,
    },
    btnLabel: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10
    },
    retryText: {
        color: colors.primary,
        fontWeight: 'bold'
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
