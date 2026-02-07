import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useTestLogic } from '../hooks/useTestLogic';
import { useTheme } from '../context/ThemeContext';

// Colors to cycle through
const TEST_COLORS = [
    { name: 'Red', hex: '#FF0000', text: 'Check for Dead Pixels' },
    { name: 'Green', hex: '#00FF00', text: 'Check for Dead Pixels' },
    { name: 'Blue', hex: '#0000FF', text: 'Check for Dead Pixels' },
    { name: 'White', hex: '#FFFFFF', text: 'Check for Spots' },
    { name: 'Black', hex: '#000000', text: 'Check for Light Bleed' },
];

export const ScreenTestScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const { completeTest, isAutomated } = useTestLogic('LCD Screen');
    const [colorIndex, setColorIndex] = useState(-1); // -1 is start screen

    const handlePress = () => {
        if (colorIndex < TEST_COLORS.length - 1) {
            setColorIndex(prev => prev + 1);
        } else {
            // End of test
            setColorIndex(-2); // Show result screen
        }
    };

    if (colorIndex === -1) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.title}>SCREEN TEST</Text>
                <Text style={styles.desc}>Tap the screen to cycle through colors: Red, Green, Blue, White, Black.</Text>
                <Text style={styles.desc}>Look for dead pixels or discoloration.</Text>
                <TouchableOpacity style={styles.btn} onPress={handlePress}>
                    <Text style={styles.btnText}>Start Test</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (colorIndex === -2) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.title}>Test Complete</Text>
                <Text style={styles.desc}>Did you see any defects?</Text>

                <View style={styles.row}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#FF4444' }]} onPress={() => completeTest('failure')}>
                        <Text style={styles.btnText}>Defects Found</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#44FF44' }]} onPress={() => completeTest('success')}>
                        <Text style={styles.btnText}>Screen Perfect</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentColor = TEST_COLORS[colorIndex];
    const isDark = currentColor.name === 'Black' || currentColor.name === 'Blue' || currentColor.name === 'Red';

    return (
        <TouchableOpacity
            style={[styles.testContainer, { backgroundColor: currentColor.hex }]}
            onPress={handlePress}
            activeOpacity={1}
        >
            <StatusBar hidden />
            <View style={styles.overlay}>
                <Text style={[styles.colorName, { color: isDark ? '#FFF' : '#000', opacity: 0.5 }]}>
                    {currentColor.name}
                </Text>
                <Text style={[styles.hint, { color: isDark ? '#FFF' : '#000', opacity: 0.3 }]}>
                    Tap to next
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        testContainer: {
            flex: 1,
        },
        center: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
        },
        title: {
            color: colors.text,
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 20
        },
        desc: {
            color: colors.subtext,
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 30
        },
        btn: {
            backgroundColor: colors.card,
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 10,
            margin: 10,
            borderWidth: 1,
            borderColor: colors.border
        },
        btnText: {
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold'
        },
        overlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        colorName: {
            fontSize: 40,
            fontWeight: '900',
            textTransform: 'uppercase'
        },
        hint: {
            marginTop: 10,
            fontSize: 14
        },
        row: {
            flexDirection: 'row'
        }
    });
};
