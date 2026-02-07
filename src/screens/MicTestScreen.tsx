import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid, Animated, Easing, SafeAreaView } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { TestOrder } from '../utils/TestOrder';
import { useTheme } from '../context/ThemeContext';

export const MicTestScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const { completeTest, isAutomated, currentIndex } = useTestLogic('Microphone');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioFile, setAudioFile] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    // Animation Values
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        checkPermissions();
        const options = {
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            audioSource: 6,
            wavFile: 'test.wav'
        };
        // Initialize logic
        try {
            AudioRecord.init(options);
        } catch (e) { console.log("Audio Init Warning", e) }
    }, []);

    useEffect(() => {
        if (isRecording) {
            startAnimation();
        } else {
            stopAnimation();
        }
    }, [isRecording]);

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2, // Subtler pulse
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const stopAnimation = () => {
        pulseAnim.setValue(1);
        pulseAnim.stopAnimation();
    };

    const checkPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);
                if (grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED) {
                    setPermissionGranted(true);
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            setPermissionGranted(true);
        }
    };

    const startRecording = () => {
        if (!permissionGranted) return;
        setIsRecording(true);
        setAudioFile(null);
        AudioRecord.start();
    };

    const stopRecording = async () => {
        setIsRecording(false);
        const audioFile = await AudioRecord.stop();
        setAudioFile(audioFile);
    };

    const playRecording = () => {
        if (!audioFile) return;
        setIsPlaying(true);
        // Force output to earpiece or speaker? Standard playback usually speaker.
        Sound.setCategory('Playback');
        const sound = new Sound(audioFile, '', (error) => {
            if (error) {
                setIsPlaying(false);
                return;
            }
            sound.play((success) => {
                setIsPlaying(false);
            });
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test {currentIndex + 1} of {TestOrder.length}</Text>}
                <Text style={styles.title}>Microphone Check</Text>
                <Text style={styles.subtitle}>Record a short voice clip to test the input.</Text>
            </View>

            <View style={styles.vizContainer}>
                <Animated.View
                    style={[
                        styles.micCircle,
                        { transform: [{ scale: pulseAnim }], opacity: isRecording ? 1 : 0.4 }
                    ]}
                />
                <Icon name="microphone" size={50} color={isRecording ? '#FFF' : colors.primary} style={{ zIndex: 10 }} />
            </View>

            <Text style={styles.status}>{isRecording ? 'Recording in progress...' : 'Ready to Record'}</Text>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.mainButton, isRecording ? styles.stopButton : styles.recordButton, shadows.medium]}
                    onPress={isRecording ? stopRecording : startRecording}
                    activeOpacity={0.8}
                >
                    <Icon name={isRecording ? "stop" : "record"} size={28} color="#FFF" />
                    <Text style={styles.mainButtonText}>{isRecording ? 'Stop' : 'Record'}</Text>
                </TouchableOpacity>

                {audioFile && (
                    <View style={styles.playbackSection}>
                        <TouchableOpacity
                            style={[styles.playbackBtn, isPlaying && styles.disabled]}
                            onPress={playRecording}
                            disabled={isPlaying}
                        >
                            <Icon name={isPlaying ? "dots-horizontal" : "play"} size={24} color={colors.primary} />
                            <Text style={styles.secondaryBtnText}>{isPlaying ? 'Playing...' : 'Play Recording'}</Text>
                        </TouchableOpacity>

                        <Text style={styles.verifyText}>Is the recording clear?</Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.actionBtn, styles.failBtn]} onPress={() => completeTest('failure')}>
                                <Icon name="close" size={20} color="#FFF" />
                                <Text style={styles.btnText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={() => completeTest('success')}>
                                <Icon name="check" size={20} color="#FFF" />
                                <Text style={styles.btnText}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            alignItems: 'center',
        },
        header: {
            padding: spacing.l,
            alignItems: 'center',
            width: '100%'
        },
        seqText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: 8,
            letterSpacing: 1
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8
        },
        subtitle: {
            fontSize: 14,
            color: colors.subtext,
            textAlign: 'center'
        },
        vizContainer: {
            width: 140,
            height: 140,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 40,
        },
        micCircle: {
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.primary,
        },
        status: {
            fontSize: 16,
            color: colors.subtext,
            fontWeight: '600',
            marginBottom: spacing.l
        },
        controls: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: spacing.l
        },
        mainButton: {
            flexDirection: 'row',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 30,
            alignItems: 'center',
            gap: 10,
            minWidth: 200,
            justifyContent: 'center'
        },
        recordButton: {
            backgroundColor: colors.primary,
        },
        stopButton: {
            backgroundColor: colors.error,
        },
        mainButtonText: {
            color: '#FFF',
            fontSize: 18,
            fontWeight: 'bold',
        },
        playbackSection: {
            width: '100%',
            marginTop: spacing.xl,
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: spacing.m,
            borderRadius: 16,
            ...shadows.soft
        },
        playbackBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 10,
            marginBottom: 10
        },
        disabled: { opacity: 0.5 },
        secondaryBtnText: {
            color: colors.primary,
            fontSize: 16,
            fontWeight: '600'
        },
        verifyText: {
            color: colors.text,
            marginBottom: spacing.m,
            fontWeight: '500'
        },
        actionRow: {
            flexDirection: 'row',
            gap: spacing.m,
            width: '100%'
        },
        actionBtn: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 12,
            borderRadius: 12,
            gap: 6
        },
        passBtn: { backgroundColor: colors.success },
        failBtn: { backgroundColor: colors.error },
        btnText: { color: '#FFF', fontWeight: 'bold' }
    });
};
