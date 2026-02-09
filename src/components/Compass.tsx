import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { G, Circle, Rect, Path, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface CompassProps {
    heading: number; // In degrees
    theme: any;
}

export const Compass = ({ heading, theme }: CompassProps) => {
    const { colors } = theme;

    // Smooth the rotation
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.spring(rotateAnim, {
            toValue: -heading, // Rotate dial opposite to heading
            useNativeDriver: true,
            friction: 8,
            tension: 40
        }).start();
    }, [heading]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 360],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <View style={[styles.compassWrapper, { borderColor: colors.border }]}>
                <Animated.View style={[styles.dial, { transform: [{ rotate: rotation }] }]}>
                    <Svg width="200" height="200" viewBox="0 0 200 200">
                        {/* Circle background */}
                        <Circle cx="100" cy="100" r="95" stroke={colors.border} strokeWidth="1" fill="none" opacity={0.3} />

                        {/* Degree markings */}
                        {[...Array(72)].map((_, i) => {
                            const angle = i * 5;
                            const isMajor = angle % 30 === 0;
                            const r1 = isMajor ? 85 : 90;
                            const r2 = 95;
                            const x1 = 100 + r1 * Math.sin((angle * Math.PI) / 180);
                            const y1 = 100 - r1 * Math.cos((angle * Math.PI) / 180);
                            const x2 = 100 + r2 * Math.sin((angle * Math.PI) / 180);
                            const y2 = 100 - r2 * Math.cos((angle * Math.PI) / 180);

                            return (
                                <Path
                                    key={i}
                                    d={`M ${x1} ${y1} L ${x2} ${y2}`}
                                    stroke={isMajor ? colors.primary : colors.subtext}
                                    strokeWidth={isMajor ? 2 : 1}
                                />
                            );
                        })}

                        {/* Directions */}
                        <SvgText x="100" y="30" fill={colors.error} fontSize="18" fontWeight="bold" textAnchor="middle">N</SvgText>
                        <SvgText x="170" y="105" fill={colors.text} fontSize="14" fontWeight="bold" textAnchor="middle">E</SvgText>
                        <SvgText x="100" y="180" fill={colors.text} fontSize="14" fontWeight="bold" textAnchor="middle">S</SvgText>
                        <SvgText x="30" y="105" fill={colors.text} fontSize="14" fontWeight="bold" textAnchor="middle">W</SvgText>
                    </Svg>
                </Animated.View>

                {/* Fixed Needle Pointer */}
                <View style={[styles.needle, { backgroundColor: colors.primary }]} />

                {/* Center readout */}
                <View style={[styles.centerReadout, { backgroundColor: colors.card }]}>
                    <Text style={[styles.headingValue, { color: colors.text }]}>{Math.round(heading)}°</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20
    },
    compassWrapper: {
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        position: 'relative'
    },
    dial: {
        width: 200,
        height: 200,
    },
    needle: {
        position: 'absolute',
        top: 0,
        width: 4,
        height: 25,
        borderRadius: 2,
        zIndex: 10,
    },
    centerReadout: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 5
    },
    headingValue: {
        fontSize: 18,
        fontWeight: 'bold',
    }
});
