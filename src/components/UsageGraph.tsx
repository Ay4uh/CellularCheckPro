import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Line, G } from 'react-native-svg';

interface UsageGraphProps {
    data: number[]; // Array of percentages (0-100)
    color: string;
    height?: number;
    maxPoints?: number;
}

export const UsageGraph = React.memo(({
    data,
    color,
    height = 100,
    maxPoints = 40
}: UsageGraphProps) => {
    const width = Dimensions.get('window').width - 80; // Adjusted for card padding

    // Calculate SVG path
    const pathData = useMemo(() => {
        if (data.length < 2) return '';

        const step = width / (maxPoints - 1);
        const points = data.slice(-maxPoints).map((val, i) => {
            const x = i * step;
            const y = height - (val / 100) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    }, [data, width, height, maxPoints]);

    // Area path (filled)
    const areaPathData = useMemo(() => {
        if (data.length < 2) return '';
        const step = width / (maxPoints - 1);
        const points = data.slice(-maxPoints).map((val, i) => {
            const x = i * step;
            const y = height - (val / 100) * height;
            return `${x},${y}`;
        });

        const lastX = (points.length - 1) * step;
        return `M 0,${height} L ${points.join(' L ')} L ${lastX},${height} Z`;
    }, [data, width, height, maxPoints]);

    // Grid lines
    const gridLines = useMemo(() => {
        const lines = [];
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            lines.push(
                <Line
                    key={`h-${i}`}
                    x1="0" y1={y} x2={width} y2={y}
                    stroke="rgba(0,0,0,0.05)" strokeWidth="1"
                />
            );
        }
        // Vertical lines
        const step = width / (maxPoints - 1);
        for (let i = 0; i <= maxPoints; i += 10) {
            const x = i * step;
            lines.push(
                <Line
                    key={`v-${i}`}
                    x1={x} y1="0" x2={x} y2={height}
                    stroke="rgba(0,0,0,0.05)" strokeWidth="1"
                />
            );
        }
        return lines;
    }, [width, height, maxPoints]);

    return (
        <View style={[styles.container, { height }]}>
            <Svg width={width} height={height}>
                <G>
                    {gridLines}
                    {areaPathData !== '' && (
                        <Path
                            d={areaPathData}
                            fill={color}
                            fillOpacity={0.1}
                        />
                    )}
                    {pathData !== '' && (
                        <Path
                            d={pathData}
                            stroke={color}
                            strokeWidth="2"
                            fill="none"
                        />
                    )}
                </G>
            </Svg>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
        overflow: 'hidden',
    },
});
