import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface GyroGaugeProps {
    data: { x: number; y: number; z: number };
    theme: any;
}

const SingleGauge = ({ value, label, color, theme }: { value: number, label: string, color: string, theme: any }) => {
    const { colors } = theme;

    // Scale: Gyro values typically range from -10 to 10 rad/s (or similar)
    // We'll map -10 to 10 to -120 to 120 degrees
    const rotateAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        const clampedValue = Math.max(-10, Math.min(10, value));
        const targetAngle = (clampedValue / 10) * 120;

        Animated.spring(rotateAnim, {
            toValue: targetAngle,
            useNativeDriver: true,
            friction: 7,
            tension: 50
        }).start();
    }, [value]);

    const needleRotation = rotateAnim.interpolate({
        inputRange: [-180, 180],
        outputRange: ['-180deg', '180deg']
    });

    return (
        <View style={styles.gaugeItem}>
            <View style={styles.svgWrapper}>
                <Svg width="80" height="80" viewBox="0 0 100 100">
                    {/* Gauge Arc */}
                    <Path
                        d="M 20 80 A 45 45 0 1 1 80 80"
                        fill="none"
                        stroke={colors.border}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity={0.5}
                    />
                    {/* Scale Markings */}
                    {[-10, -5, 0, 5, 10].map((v, i) => {
                        const angle = (v / 10) * 120;
                        const r1 = 40;
                        const r2 = 45;
                        const x1 = 50 + r1 * Math.sin((angle * Math.PI) / 180);
                        const y1 = 50 - r1 * Math.cos((angle * Math.PI) / 180);
                        const x2 = 50 + r2 * Math.sin((angle * Math.PI) / 180);
                        const y2 = 50 - r2 * Math.cos((angle * Math.PI) / 180);
                        return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.subtext} strokeWidth="2" />;
                    })}

                    {/* Hub */}
                    <Circle cx="50" cy="50" r="4" fill={colors.text} />
                </Svg>

                {/* Needle */}
                <Animated.View style={[styles.needle, { backgroundColor: color, transform: [{ rotate: needleRotation }] }]} />
            </View>
            <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{value.toFixed(2)}</Text>
        </View>
    );
};

export const GyroGauge = ({ data, theme }: GyroGaugeProps) => {
    const { colors } = theme;

    return (
        <View style={styles.container}>
            <SingleGauge label="Axis X" value={data.x} color={theme.colors.primary} theme={theme} />
            <SingleGauge label="Axis Y" value={data.y} color={theme.colors.secondary} theme={theme} />
            <SingleGauge label="Axis Z" value={data.z} color={theme.colors.success} theme={theme} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        width: '100%'
    },
    gaugeItem: {
        alignItems: 'center',
        flex: 1
    },
    svgWrapper: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    needle: {
        position: 'absolute',
        top: 15,
        width: 2,
        height: 35,
        borderRadius: 1,
        zIndex: 5,
        transformOrigin: 'bottom'
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
        textTransform: 'uppercase'
    },
    value: {
        fontSize: 12,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums']
    }
});
