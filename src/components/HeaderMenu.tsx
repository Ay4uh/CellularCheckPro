import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { colors as defaultColors, shadows, spacing } from '../theme';

export const HeaderMenu = () => {
    const [visible, setVisible] = useState(false);
    const navigation = useNavigation<any>();
    const { theme, isDark, toggleTheme } = useTheme();
    const colors = theme.colors;

    const toggleMenu = () => setVisible(!visible);

    const handleOption = (action: () => void) => {
        setVisible(false);
        action();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={toggleMenu} style={styles.iconButton}>
                <Icon name="dots-vertical" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.overlay}>
                        <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }, shadows.medium]}>
                            {/* Dark Mode Toggle */}
                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                                onPress={() => handleOption(toggleTheme)}
                            >
                                <View style={styles.menuItemContent}>
                                    <Icon name={isDark ? "white-balance-sunny" : "weather-night"} size={20} color={colors.text} />
                                    <Text style={[styles.menuText, { color: colors.text }]}>
                                        {isDark ? "Light Mode" : "Dark Mode"}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* About App */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleOption(() => navigation.navigate('About'))}
                            >
                                <View style={styles.menuItemContent}>
                                    <Icon name="information-outline" size={20} color={colors.text} />
                                    <Text style={[styles.menuText, { color: colors.text }]}>About App</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: spacing.s,
    },
    iconButton: {
        padding: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    menu: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 180,
        borderRadius: 12,
        paddingVertical: 4,
        borderWidth: 1,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12
    }
});
