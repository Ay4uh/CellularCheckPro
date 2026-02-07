import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AnimatedScaleButton } from './AnimatedScaleButton';
import { spacing, shadows, colors as themeColors } from '../theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const CARD_WIDTH = (width - (spacing.m * 3)) / COLUMN_COUNT;

interface TestCardProps {
    test: {
        id: string;
        title: string;
    };
    status: string;
    theme: any;
    onPress: (id: string) => void;
    getIconName: (id: string) => string;
    getStatusColor: (status: string) => string;
}

export const TestCard = React.memo(({
    test,
    status,
    theme,
    onPress,
    getIconName,
    getStatusColor
}: TestCardProps) => {
    const isDone = status !== 'pending';
    const iconColor = isDone ? getStatusColor(status) : theme.colors.primary;
    const colors = theme.colors;

    return (
        <AnimatedScaleButton
            style={[styles.card, shadows.soft, { backgroundColor: colors.card }]}
            onPress={() => onPress(test.id)}
        >
            <View style={[
                styles.iconContainer,
                { backgroundColor: isDone ? iconColor + '15' : (theme.dark ? '#333' : '#F0F4F8') }
            ]}>
                <Icon
                    name={getIconName(test.id)}
                    size={28}
                    color={iconColor}
                />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                {test.title.replace(' Test', '')}
            </Text>
            <Text style={[styles.cardStatus, { color: isDone ? iconColor : colors.subtext }]}>
                {isDone ? status.toUpperCase() : 'Ready'}
            </Text>

            {isDone && (
                <View style={[styles.checkBadge, { backgroundColor: iconColor }]}>
                    <Icon name={status === 'success' ? "check" : "close"} size={12} color="#FFF" />
                </View>
            )}
        </AnimatedScaleButton>
    );
}, (prevProps, nextProps) => {
    // Only re-render if status or theme changes
    return prevProps.status === nextProps.status && prevProps.theme.dark === nextProps.theme.dark;
});

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        borderRadius: 16,
        padding: spacing.m,
        marginBottom: spacing.m,
        alignItems: 'center',
        position: 'relative',
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
        height: 18,
    },
    cardStatus: {
        fontSize: 11,
        fontWeight: '700',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
