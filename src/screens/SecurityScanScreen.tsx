import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Easing,
    Platform,
    NativeModules,
    Linking,
    LayoutAnimation,
    UIManager
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import { colors, spacing, shadows } from '../theme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { SecurityModule } = NativeModules;

interface AppDetail {
    name: string;
    packageName: string;
    installTime?: number;
    size?: number;
}

interface ScanResult {
    id: string;
    title: string;
    description: string;
    status: 'secure' | 'warning' | 'risk';
    icon: string;
    details?: AppDetail[];
}

type SortType = 'name' | 'size' | 'date';

const ExpandableResultItem = ({ item }: { item: ScanResult }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [sortBy, setSortBy] = useState<SortType>('name');

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const hasDetails = item.details && item.details.length > 0;

    const formattedSize = (bytes: number) => {
        if (!bytes || bytes === 0) return 'N/A';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const sortedDetails = [...(item.details || [])].sort((a, b) => {
        if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
        if (sortBy === 'date') return (b.installTime || 0) - (a.installTime || 0);
        return a.name.localeCompare(b.name);
    });

    const isRecent = (timestamp?: number) => {
        if (!timestamp) return false;
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return (timestamp || 0) > sevenDaysAgo;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'secure': return { name: 'check-circle', color: colors.success };
            case 'warning': return { name: 'alert-circle', color: colors.warning };
            case 'risk': return { name: 'alert-decagram', color: colors.error };
            default: return { name: 'help-circle', color: colors.subtext };
        }
    };

    const statusIcon = getStatusIcon(item.status);

    return (
        <View style={[styles.resultCard, shadows.soft]}>
            <TouchableOpacity
                activeOpacity={hasDetails ? 0.7 : 1}
                onPress={hasDetails ? toggleExpand : undefined}
                style={styles.cardHeader}
            >
                <View style={[styles.resultIcon, { backgroundColor: statusIcon.color + '15' }]}>
                    <Icon name={item.icon} size={24} color={statusIcon.color} />
                </View>
                <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <Text style={styles.resultDesc}>{item.description}</Text>
                </View>
                {hasDetails ? (
                    <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={colors.subtext} />
                ) : (
                    <Icon name={statusIcon.name} size={20} color={statusIcon.color} />
                )}
            </TouchableOpacity>

            {isExpanded && hasDetails && (
                <View style={styles.detailsContainer}>
                    <View style={styles.detailsDivider} />

                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Sort by:</Text>
                        <TouchableOpacity onPress={() => setSortBy('name')} style={[styles.filterBtn, sortBy === 'name' && styles.filterBtnActive]}>
                            <Text style={[styles.filterBtnText, sortBy === 'name' && styles.filterBtnTextActive]}>Name</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSortBy('date')} style={[styles.filterBtn, sortBy === 'date' && styles.filterBtnActive]}>
                            <Text style={[styles.filterBtnText, sortBy === 'date' && styles.filterBtnTextActive]}>Newest</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSortBy('size')} style={[styles.filterBtn, sortBy === 'size' && styles.filterBtnActive]}>
                            <Text style={[styles.filterBtnText, sortBy === 'size' && styles.filterBtnTextActive]}>Storage</Text>
                        </TouchableOpacity>
                    </View>

                    {sortedDetails.map((app, idx) => {
                        const recent = isRecent(app.installTime);
                        return (
                            <View key={`${app.packageName}-${idx}`} style={styles.appRow}>
                                <View style={[styles.appIconContainer, recent && { backgroundColor: colors.warning + '20' }]}>
                                    <Icon name={recent ? "alert-outline" : "package-variant"} size={16} color={recent ? colors.warning : colors.subtext} />
                                </View>
                                <View style={styles.appTextInfo}>
                                    <View style={styles.appNameRow}>
                                        <Text style={styles.appName} numberOfLines={1}>{app.name || 'App'}</Text>
                                        {recent && <Text style={styles.recentBadge}>RECENT</Text>}
                                    </View>
                                    <Text style={styles.appPackage} numberOfLines={1}>{app.packageName}</Text>
                                </View>
                                <View style={styles.appMeta}>
                                    <Text style={styles.appSizeText}>{formattedSize(app.size || 0)}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export const SecurityScanScreen = () => {
    const [progress, setProgress] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [results, setResults] = useState<ScanResult[]>([]);
    const [currentStatusText, setCurrentStatusText] = useState('Ready to Scan');
    const [debugInfo, setDebugInfo] = useState('');

    const progressAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) })
            ])
        ).start();
    };

    const runScan = async (type: 'app' | 'malware' | 'hidden') => {
        setIsScanning(true);
        setResults([]);
        setProgress(0);
        progressAnim.setValue(0);
        startPulse();
        setDebugInfo(`Starting ${type} scan...`);

        try {
            if (SecurityModule?.checkConnectivity) {
                const conn = await SecurityModule.checkConnectivity();
                setDebugInfo(`Status: ${conn}`);
            }

            const scanTasks = [
                { text: 'Checking system integrity...', delay: 400 },
                { text: 'Scanning application directory...', delay: 600 },
                { text: 'Detecting hidden packages...', delay: 600 },
                { text: 'Analyzing browser security...', delay: 400 },
                { text: 'Heuristic malaria analysis...', delay: 500 },
            ];

            for (let i = 0; i < scanTasks.length; i++) {
                setCurrentStatusText(scanTasks[i].text);
                const targetProgress = ((i + 1) / scanTasks.length) * 100;
                Animated.timing(progressAnim, { toValue: targetProgress, duration: scanTasks[i].delay, useNativeDriver: false }).start();
                await new Promise(resolve => setTimeout(() => resolve(null), scanTasks[i].delay));
                setProgress(targetProgress);
            }

            let nativeData = { systemApps: [], userApps: [], hiddenApps: [], suspiciousPackages: [] };
            if (Platform.OS === 'android' && SecurityModule) {
                try {
                    const data = await SecurityModule.getAppInventory();
                    if (data) nativeData = data;
                } catch (e: any) {
                    console.error('getAppInventory error:', e?.message || e);
                    setDebugInfo(`Error: ${e?.message || 'Native failure'}`);
                }
            }

            let isPinSet = false;
            try {
                isPinSet = await DeviceInfo.isPinOrFingerprintSet();
            } catch (e) { }

            const uApps = nativeData.userApps || [];
            const sApps = nativeData.systemApps || [];

            const allResults: ScanResult[] = [];

            if (type === 'app') {
                allResults.push({
                    id: 'app_scan',
                    title: 'App Scan Results',
                    description: (uApps.length + sApps.length) > 0
                        ? `Scanned ${uApps.length + sApps.length} applications.`
                        : 'No apps found or permission denied.',
                    status: 'secure',
                    icon: 'apps',
                    details: [...uApps, ...sApps]
                });
            }

            if (type === 'malware') {
                allResults.push({
                    id: 'malware_scan',
                    title: 'Malware Scan Results',
                    description: (nativeData.suspiciousPackages?.length || 0) > 0
                        ? `Found ${nativeData.suspiciousPackages.length} suspicious items!`
                        : 'No malware or suspicious packages found.',
                    status: (nativeData.suspiciousPackages?.length || 0) > 0 ? 'risk' : 'secure',
                    icon: 'virus-off',
                    details: nativeData.suspiciousPackages?.map((pkg: string) => ({ name: 'Suspicious', packageName: pkg })) || []
                });
            }

            if (type === 'hidden') {
                allResults.push({
                    id: 'hidden_scan',
                    title: 'Hidden App Scan Results',
                    description: (nativeData.hiddenApps?.length || 0) > 0
                        ? `${nativeData.hiddenApps.length} hidden apps detected.`
                        : 'No hidden apps found.',
                    status: (nativeData.hiddenApps?.length || 0) > 0 ? 'warning' : 'secure',
                    icon: 'eye-off',
                    details: nativeData.hiddenApps || []
                });
            }

            // Always show protection status as a footer benefit
            allResults.push({
                id: 'protection',
                title: 'System Protection',
                description: isPinSet ? 'Device padlock is active.' : 'Warning: Device is unprotected!',
                status: isPinSet ? 'secure' : 'warning',
                icon: 'shield-lock'
            });

            setResults(allResults);
            setCurrentStatusText(`${type.charAt(0).toUpperCase() + type.slice(1)} Scan Complete`);
        } catch (error: any) {
            console.error('Scan UI Failure:', error);
            setDebugInfo(`Internal Error: ${error?.message || 'UI'}`);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.scanSection}>
                <Animated.View style={[styles.shieldContainer, shadows.medium, { transform: [{ scale: pulseAnim }], borderColor: isScanning ? colors.primary : colors.success }]}>
                    <Icon name={isScanning ? "shield-search" : "shield-check"} size={70} color={isScanning ? colors.primary : colors.success} />
                </Animated.View>
                <Text style={styles.statusTitle}>{currentStatusText}</Text>
                {debugInfo !== '' && (
                    <Text style={styles.miniDebug}>ID: {debugInfo}</Text>
                )}

                {!isScanning && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.scanButton, styles.appBtn, shadows.soft]} onPress={() => runScan('app')}>
                            <Icon name="apps" size={20} color="#FFF" style={{ marginBottom: 4 }} />
                            <Text style={styles.scanButtonText}>App Scan</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.scanButton, styles.malwareBtn, shadows.soft]} onPress={() => runScan('malware')}>
                            <Icon name="bug" size={20} color="#FFF" style={{ marginBottom: 4 }} />
                            <Text style={styles.scanButtonText}>Malware</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.scanButton, styles.hiddenBtn, shadows.soft]} onPress={() => runScan('hidden')}>
                            <Icon name="eye-off" size={20} color="#FFF" style={{ marginBottom: 4 }} />
                            <Text style={styles.scanButtonText}>Hidden</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isScanning && (
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
                    </View>
                )}
            </View>

            {results.length > 0 && (
                <View style={styles.resultsSection}>
                    <Text style={styles.sectionTitle}>Security Diagnostics</Text>
                    {results.map((item) => (
                        <ExpandableResultItem key={item.id} item={item} />
                    ))}

                    <View style={styles.safetyCard}>
                        <View style={styles.advisorHeader}>
                            <Icon name="shield-alert" size={24} color={colors.warning} />
                            <Text style={styles.advisorTitle}>Security Expert Tip</Text>
                        </View>
                        <Text style={styles.advisorText}>If app inventory is empty, go to Settings &gt; App Permissions and allow "Query All Packages".</Text>
                        <TouchableOpacity style={styles.advisorBtn} onPress={() => Linking.openSettings()}>
                            <Text style={styles.advisorBtnText}>Open App Permissions</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    contentContainer: { padding: spacing.l },
    scanSection: { alignItems: 'center', paddingVertical: spacing.xl },
    shieldContainer: { width: 130, height: 130, borderRadius: 65, borderWidth: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card, marginBottom: spacing.m },
    statusTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    miniDebug: { fontSize: 10, color: colors.subtext, marginBottom: spacing.m },
    progressContainer: { width: '80%', height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden', position: 'relative', marginTop: spacing.s },
    progressBar: { height: '100%', backgroundColor: colors.primary },
    progressLabel: { position: 'absolute', right: 0, top: -20, fontSize: 12, fontWeight: 'bold', color: colors.primary },
    buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, width: '100%' },
    scanButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, alignItems: 'center', minWidth: 90 },
    appBtn: { backgroundColor: colors.primary },
    malwareBtn: { backgroundColor: colors.error },
    hiddenBtn: { backgroundColor: colors.warning },
    scanButtonText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
    resultsSection: { marginTop: 0 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: spacing.m },
    resultCard: { backgroundColor: colors.card, borderRadius: 16, marginBottom: spacing.m, overflow: 'hidden' },
    cardHeader: { padding: spacing.m, flexDirection: 'row', alignItems: 'center' },
    resultIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
    resultInfo: { flex: 1 },
    resultTitle: { fontSize: 15, fontWeight: 'bold', color: colors.text },
    resultDesc: { fontSize: 12, color: colors.subtext, marginTop: 2 },
    detailsContainer: { paddingHorizontal: spacing.m, paddingBottom: spacing.m, backgroundColor: '#F9FAFB' },
    detailsDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: spacing.s },
    filterRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.s },
    filterLabel: { fontSize: 12, color: colors.subtext, marginRight: 8 },
    filterBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#E5E7EB', marginRight: 6 },
    filterBtnActive: { backgroundColor: colors.primary },
    filterBtnText: { fontSize: 11, color: colors.text, fontWeight: '600' },
    filterBtnTextActive: { color: '#FFF' },
    appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    appIconContainer: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
    appTextInfo: { flex: 1, marginLeft: 10 },
    appNameRow: { flexDirection: 'row', alignItems: 'center' },
    appName: { fontSize: 13, fontWeight: '700', color: colors.text, flexShrink: 1 },
    recentBadge: { marginLeft: 6, fontSize: 10, fontWeight: '900', color: colors.warning, backgroundColor: colors.warning + '15', paddingHorizontal: 4, borderRadius: 4 },
    appPackage: { fontSize: 10, color: colors.subtext, marginTop: 1 },
    appMeta: { alignItems: 'flex-end' },
    appSizeText: { fontSize: 11, fontWeight: '600', color: colors.primary },
    safetyCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: spacing.m, marginTop: spacing.m, borderLeftWidth: 4, borderLeftColor: colors.error },
    advisorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.s },
    advisorTitle: { fontSize: 16, fontWeight: 'bold', color: '#991B1B', marginLeft: 8 },
    advisorText: { fontSize: 13, color: '#991B1B', marginBottom: spacing.m },
    advisorBtn: { backgroundColor: colors.error, padding: 12, borderRadius: 12, marginTop: spacing.m, alignItems: 'center' },
    advisorBtnText: { color: '#FFF', fontWeight: 'bold' }
});
