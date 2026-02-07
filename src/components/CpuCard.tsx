import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { shadows } from '../theme';

interface CpuCardProps {
    cpuInfo: {
        architecture: string;
        cores: number;
    };
    cpuFrequencies: number[];
    expandedCpu: boolean;
    toggleCpuExpansion: () => void;
    theme: any;
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
}

export const CpuCard = React.memo(({
    cpuInfo,
    cpuFrequencies,
    expandedCpu,
    toggleCpuExpansion,
    theme,
    fadeAnim,
    slideAnim
}: CpuCardProps) => {
    const { colors } = theme;

    const renderCpuCore = (freq: number, index: number) => {
        const maxFreq = 3000;
        const widthPercent = Math.min((freq / maxFreq) * 100, 100);

        return (
            <View key={index} style={styles.coreRow}>
                <Text style={[styles.coreLabel, { color: colors.subtext }]}>Core {index}</Text>
                <View style={styles.coreBarBg}>
                    <View style={[
                        styles.coreBarFill,
                        { width: `${widthPercent}%`, backgroundColor: freq > 0 ? colors.secondary : colors.subtext }
                    ]} />
                </View>
                <Text style={[styles.coreValue, { color: colors.text }]}>{freq} MHz</Text>
            </View>
        );
    };

    return (
        <Animated.View style={[styles.card, shadows.medium, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.card
        }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.dark ? '#333' : '#FFF3E0' }]}>
                <Icon name="cpu-64-bit" size={32} color="#FF9800" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>CPU (Processor)</Text>

            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Arch:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{cpuInfo.architecture}</Text>
            </View>

            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.subtext }]}>Cores:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{cpuInfo.cores} Cores</Text>
            </View>

            <TouchableOpacity
                style={[styles.expandBtn, { borderTopColor: colors.border }]}
                onPress={toggleCpuExpansion}
            >
                <Text style={[styles.expandText, { color: colors.primary }]}>
                    {expandedCpu ? 'Hide details' : 'View per-core frequency'}
                </Text>
                <Icon
                    name={expandedCpu ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.primary}
                />
            </TouchableOpacity>

            {expandedCpu && (
                <View style={styles.coreList}>
                    {cpuFrequencies.length > 0 ? (
                        cpuFrequencies.map((freq, index) => renderCpuCore(freq, index))
                    ) : (
                        <Text style={[styles.noData, { color: colors.subtext }]}>
                            Frequency data restricted by system
                        </Text>
                    )}
                </View>
            )}
        </Animated.View>
    );
}, (prev, next) => {
    return prev.expandedCpu === next.expandedCpu &&
        JSON.stringify(prev.cpuFrequencies) === JSON.stringify(next.cpuFrequencies) &&
        prev.theme.dark === next.theme.dark;
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginRight: 10,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15,
        marginTop: 5,
        borderTopWidth: 1,
    },
    expandText: {
        fontWeight: 'bold',
        marginRight: 5,
    },
    coreList: {
        marginTop: 15,
    },
    coreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    coreLabel: {
        width: 50,
        fontSize: 12,
    },
    coreBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    coreBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    coreValue: {
        width: 60,
        fontSize: 12,
        textAlign: 'right',
        fontWeight: '600',
    },
    noData: {
        fontStyle: 'italic',
        textAlign: 'center',
        fontSize: 12,
    },
});
