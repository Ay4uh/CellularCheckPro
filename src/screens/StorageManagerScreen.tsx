import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    NativeModules,
    Dimensions,
    LayoutAnimation,
    Platform,
    RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { spacing, shadows } from '../theme';

const { HardwareModule } = NativeModules;
const { width } = Dimensions.get('window');

interface AppInfo {
    name: string;
    packageName: string;
    isSystem: boolean;
    icon?: string;
}

interface StorageInfo {
    total: number;
    available: number;
    used: number;
    externalTotal: number;
    externalAvailable: number;
}

export const StorageManagerScreen = () => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const [storage, setStorage] = useState<StorageInfo | null>(null);
    const [apps, setApps] = useState<AppInfo[]>([]);
    const [filteredApps, setFilteredApps] = useState<AppInfo[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'user' | 'system'>('user');
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [storageData, appsData] = await Promise.all([
                HardwareModule.getStorageDetails(),
                HardwareModule.getInstalledApps()
            ]);
            setStorage(storageData);
            setApps(appsData);
            applyFilter(appsData, search, filterType);
        } catch (error) {
            console.error('Error fetching storage/apps data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, filterType]);

    useEffect(() => {
        fetchData();
    }, []);

    const applyFilter = (allApps: AppInfo[], query: string, type: 'all' | 'user' | 'system') => {
        let filtered = allApps;

        if (type === 'user') {
            filtered = filtered.filter(app => !app.isSystem);
        } else if (type === 'system') {
            filtered = filtered.filter(app => app.isSystem);
        }

        if (query) {
            filtered = filtered.filter(app =>
                app.name.toLowerCase().includes(query.toLowerCase()) ||
                app.packageName.toLowerCase().includes(query.toLowerCase())
            );
        }

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFilteredApps(filtered);
    };

    const onSearchChange = (text: string) => {
        setSearch(text);
        applyFilter(apps, text, filterType);
    };

    const toggleFilter = (type: 'all' | 'user' | 'system') => {
        setFilterType(type);
        applyFilter(apps, search, type);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderAppItem = ({ item }: { item: AppInfo }) => (
        <View style={[styles.appItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.appIconContainer}>
                {item.icon ? (
                    <Image
                        source={{ uri: `data:image/png;base64,${item.icon}` }}
                        style={styles.appIcon}
                    />
                ) : (
                    <View style={[styles.appIconPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                        <Icon name="android" size={24} color={colors.primary} />
                    </View>
                )}
            </View>
            <View style={styles.appInfo}>
                <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.appPackage, { color: colors.subtext }]} numberOfLines={1}>{item.packageName}</Text>
            </View>
            {item.isSystem && (
                <View style={styles.systemBadge}>
                    <Text style={styles.systemBadgeText}>SYSTEM</Text>
                </View>
            )}
        </View>
    );

    const renderHeader = () => {
        if (!storage) return null;
        const usedPercentage = (storage.used / storage.total) * 100;

        return (
            <View style={styles.headerContainer}>
                <View style={[styles.storageCard, { backgroundColor: colors.card }, shadows.soft]}>
                    <View style={styles.storageHeader}>
                        <Icon name="database" size={24} color={colors.primary} />
                        <Text style={[styles.storageTitle, { color: colors.text }]}>Internal Storage</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
                            <View style={[styles.progressBarFill, { width: `${usedPercentage}%`, backgroundColor: colors.primary }]} />
                        </View>
                        <View style={styles.storageTextRow}>
                            <Text style={[styles.storageLabel, { color: colors.subtext }]}>
                                {formatBytes(storage.used)} used
                            </Text>
                            <Text style={[styles.storageLabel, { color: colors.subtext }]}>
                                {formatBytes(storage.total)} total
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(usedPercentage)}%</Text>
                            <Text style={[styles.statLabel, { color: colors.subtext }]}>Used</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.success }]}>{formatBytes(storage.available)}</Text>
                            <Text style={[styles.statLabel, { color: colors.subtext }]}>Free</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Icon name="magnify" size={20} color={colors.subtext} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search apps..."
                            placeholderTextColor={colors.subtext}
                            value={search}
                            onChangeText={onSearchChange}
                        />
                    </View>
                </View>

                <View style={styles.filterRow}>
                    {(['user', 'system', 'all'] as const).map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => toggleFilter(type)}
                            style={[
                                styles.filterButton,
                                filterType === type && { backgroundColor: colors.primary }
                            ]}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                { color: filterType === type ? '#FFF' : colors.subtext }
                            ]}>
                                {type.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: colors.text }]}>
                        Installed Apps ({filteredApps.length})
                    </Text>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.subtext }]}>Scanning storage...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={filteredApps}
                renderItem={renderAppItem}
                keyExtractor={(item) => item.packageName}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="application-off-outline" size={48} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.subtext }]}>No apps found</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.m,
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        padding: spacing.m,
        paddingBottom: 110,
    },
    headerContainer: {
        marginBottom: spacing.l,
    },
    storageCard: {
        padding: spacing.l,
        borderRadius: 20,
        marginBottom: spacing.l,
    },
    storageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.m,
    },
    storageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: spacing.s,
    },
    progressBarContainer: {
        marginBottom: spacing.l,
    },
    progressBarBackground: {
        height: 12,
        borderRadius: 6,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    storageTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    storageLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: spacing.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    searchContainer: {
        marginBottom: spacing.m,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: spacing.m,
        height: 50,
    },
    searchIcon: {
        marginRight: spacing.s,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: spacing.m,
    },
    filterButton: {
        paddingHorizontal: spacing.m,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: spacing.s,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    filterButtonText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    listHeader: {
        marginBottom: spacing.s,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderRadius: 16,
        marginBottom: spacing.s,
        borderWidth: 1,
    },
    appIconContainer: {
        width: 44,
        height: 44,
        marginRight: spacing.m,
    },
    appIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    appIconPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appInfo: {
        flex: 1,
    },
    appName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    appPackage: {
        fontSize: 12,
        marginTop: 2,
    },
    systemBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: spacing.s,
    },
    systemBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#888',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: spacing.m,
        fontSize: 16,
    },
});
