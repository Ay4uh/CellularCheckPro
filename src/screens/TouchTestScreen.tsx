import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, } from 'react-native';
import { spacing } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import { TestOrder } from '../utils/TestOrder';
import { useTheme } from '../context/ThemeContext';

export const TouchTestScreen = () => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const colors = theme.colors;

    const { completeTest, isAutomated, currentIndex } = useTestLogic('Touch');
    const [visited, setVisited] = useState<Set<string>>(new Set());
    const [layout, setLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
    const [debug, setDebug] = useState("");

    const ROWS = 12;
    const COLS = 7;

    // Create grid based on actual layout dimensions
    const blockW = layout.width / COLS;
    const blockH = layout.height / ROWS;

    const handleTouch = (evt: any) => {
        // Use locationX/Y relative to the view responding to the event
        const { locationX, locationY } = evt.nativeEvent;
        setDebug(`${Math.floor(locationX)}, ${Math.floor(locationY)}`);

        const col = Math.floor(locationX / blockW);
        const row = Math.floor(locationY / blockH);

        if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
            setVisited(prev => {
                const key = `${row},${col}`;
                if (prev.has(key)) return prev;
                const next = new Set(prev);
                next.add(key);
                return next;
            });
        }
    };

    const reset = () => {
        setVisited(new Set());
        setDebug("");
    };

    const total = COLS * ROWS;
    const count = visited.size;
    const percent = total > 0 ? Math.floor((count / total) * 100) : 0;

    return (
        <View style={styles.container}>

            {/* LAYER 1: The Visual Grid (Background) */}
            <View
                style={styles.gridLayer}
                onLayout={(e) => setLayout(e.nativeEvent.layout)}
            >
                {layout.width > 0 && Array.from({ length: ROWS }).map((_, r) => (
                    <View key={`r${r}`} style={styles.row}>
                        {Array.from({ length: COLS }).map((_, c) => {
                            const isVisited = visited.has(`${r},${c}`);
                            return (
                                <View
                                    key={`b${r}${c}`}
                                    style={[
                                        styles.block,
                                        isVisited && styles.visitedBlock
                                    ]}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* LAYER 2: Touch Listener (Transparent, sits on top of grid, below controls) */}
            <View
                style={styles.touchLayer}
                onTouchStart={handleTouch}
                onTouchMove={handleTouch}
            // No onTouchEnd needed unless we clear
            />

            {/* LAYER 3: UI Overlay (Controls, sits on top of everything) */}
            <View style={styles.overlay} pointerEvents="box-none">
                <View pointerEvents="none" style={styles.header}>
                    {isAutomated && <Text style={styles.seqText}>Test {currentIndex + 1} of {TestOrder.length}</Text>}
                    <Text style={styles.title}>Touch Test</Text>
                    <Text style={styles.percentText}>{percent}%</Text>
                    <Text style={styles.hintText}>Trace lines across the whole screen green.</Text>
                    {/* <Text style={styles.debugText}>{debug}</Text> */}
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity style={styles.smallBtn} onPress={reset}>
                        <Text style={[styles.btnTxt, { color: '#FFF' }]}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, { backgroundColor: colors.success }]} onPress={() => completeTest('success')}>
                        <Text style={styles.btnTxt}>PASS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, { backgroundColor: colors.error }]} onPress={() => completeTest('failure')}>
                        <Text style={styles.btnTxt}>FAIL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.dark ? '#000' : '#FFF', // Adaptable background
        },
        gridLayer: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            flexDirection: 'column',
            zIndex: 1
        },
        touchLayer: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 2, // Catches events
            backgroundColor: 'transparent'
        },
        overlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 3, // Buttons on top
            justifyContent: 'space-between',
            padding: 20,
            paddingTop: 40
        },
        row: {
            flex: 1,
            flexDirection: 'row'
        },
        block: {
            flex: 1,
            borderWidth: 0.5,
            borderColor: theme.dark ? '#222' : '#EEE',
            backgroundColor: theme.dark ? '#000' : '#FFF'
        },
        visitedBlock: {
            backgroundColor: colors.success,
            borderColor: theme.dark ? '#004400' : '#66BB6A'
        },
        header: {
            alignItems: 'center',
            backgroundColor: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)',
            padding: 10,
            borderRadius: 10
        },
        title: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold'
        },
        percentText: {
            fontSize: 40,
            fontWeight: '900',
            color: colors.text,
            marginTop: 5
        },
        hintText: {
            color: colors.subtext,
            fontSize: 12,
            marginTop: 2
        },
        seqText: {
            fontSize: 12,
            color: colors.success,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: 8,
        },
        debugText: {
            color: 'yellow',
            fontSize: 10,
            marginTop: 2
        },
        controls: {
            flexDirection: 'row',
            gap: 15,
            justifyContent: 'center',
            paddingBottom: 20
        },
        smallBtn: {
            padding: 15,
            backgroundColor: '#333',
            borderRadius: 8,
            justifyContent: 'center',
            minWidth: 70,
            alignItems: 'center'
        },
        btn: {
            paddingHorizontal: 25,
            paddingVertical: 15,
            borderRadius: 8,
            minWidth: 90,
            alignItems: 'center',
            justifyContent: 'center'
        },
        btnTxt: {
            color: '#FFF',
            fontWeight: 'bold',
            fontSize: 16
        }
    });
};
