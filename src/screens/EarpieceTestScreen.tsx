import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, NativeModules, Platform } from 'react-native';
import Sound from 'react-native-sound';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { TestOrder } from '../utils/TestOrder';
import { useTheme } from '../context/ThemeContext';

const { AudioModule, HardwareModule } = NativeModules;

export const EarpieceTestScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const [isPlaying, setIsPlaying] = useState(false);
    const { completeTest, isAutomated, currentIndex } = useTestLogic('Earpiece');
    const soundRef = useRef<Sound | null>(null);

    // Clean up sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.release();
                soundRef.current = null;
            }
            // Reset audio mode to normal on exit
            if (Platform.OS === 'android' && AudioModule) {
                AudioModule.setMode(0);
                AudioModule.setSpeakerphoneOn(true);
            } else if (Platform.OS === 'ios' && HardwareModule) {
                HardwareModule.setAudioRoute('speaker').catch(console.error);
            }
        };
    }, []);

    const toggleSound = async () => {
        if (isPlaying) {
            // Stop logic
            if (soundRef.current) {
                soundRef.current.stop(() => {
                    soundRef.current?.release();
                });
                soundRef.current = null;
            }
            setIsPlaying(false);
            return;
        }

        // Start logic
        playSound();
    };

    const playSound = async () => {
        setIsPlaying(true);

        try {
            // Configure audio routing to EARPIECE
            if (Platform.OS === 'android' && AudioModule) {
                // Use 'Voice' category which often forces earpiece on many Android implementations
                Sound.setCategory('Voice' as any, true);

                // Native forcing
                AudioModule.setMode(3); // MODE_IN_COMMUNICATION
                AudioModule.setSpeakerphoneOn(false);
            } else if (Platform.OS === 'ios' && HardwareModule) {
                await HardwareModule.setAudioRoute('earpiece');
            } else {
                Sound.setCategory('PlayAndRecord', true);
            }
        } catch (error) {
            console.log('Audio routing error:', error);
        }

        // 2. Load and Play
        const sound = new Sound('earpiece_beep.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load sound', error);
                Alert.alert("Error", "Could not load earpiece test file.");
                setIsPlaying(false);
                return;
            }

            soundRef.current = sound;
            sound.setVolume(1.0);
            sound.setNumberOfLoops(3);

            sound.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
                setIsPlaying(false);
                sound.release();
                soundRef.current = null;
            });
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test {currentIndex + 1} of {TestOrder.length}</Text>}
                <Text style={styles.title}>Earpiece Check</Text>
                <Text style={styles.subtitle}>Put the phone to your ear like a call.</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.mainCircle, shadows.medium, isPlaying && styles.playingCircle]}
                    onPress={toggleSound}
                >
                    <Icon name={isPlaying ? "stop" : "phone-incoming"} size={80} color={isPlaying ? colors.error : colors.primary} />
                    <Text style={styles.playText}>{isPlaying ? 'Stop Test' : 'Start Test'}</Text>
                </TouchableOpacity>

                <View style={styles.infoCard}>
                    <Icon name="information-outline" size={20} color={colors.subtext} />
                    <Text style={styles.infoText}>The sound should ONLY come from the top speaker.</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Can you hear the tone at the top?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Yes, Clear</Text>
                    </TouchableOpacity>
                </View>
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
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.l
        },
        mainCircle: {
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.primary,
            marginBottom: 40
        },
        playingCircle: {
            borderColor: colors.success,
            backgroundColor: theme.dark ? '#1B3320' : '#F1F8E9'
        },
        playText: {
            marginTop: 10,
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary
        },
        infoCard: {
            flexDirection: 'row',
            backgroundColor: theme.dark ? '#333' : '#F5F5F5',
            padding: 12,
            borderRadius: 12,
            alignItems: 'center',
            gap: 8,
            maxWidth: '80%'
        },
        infoText: {
            fontSize: 12,
            color: colors.subtext,
            flexShrink: 1
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
};
