import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, PermissionsAndroid, ActivityIndicator, NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Barcode from 'react-native-barcode-svg';
import { spacing, shadows } from '../theme';
import { useTheme } from '../context/ThemeContext';

const { HardwareModule } = NativeModules;

export const HardwareInfoScreen = () => {
    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    const [info, setInfo] = useState<any>({
        brand: 'Loading...',
        model: 'Loading...',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uniqueId, setUniqueId] = useState<string>('UNKNOWN');

    useEffect(() => {
        loadDataSafe();
    }, []);

    const safeGet = async (promise: any, fallback: any = 'N/A') => {
        try {
            if (!promise) return fallback;
            const res = await promise;
            console.log('safeGet result:', res);
            return res === null || res === undefined ? fallback : res;
        } catch (e) {
            console.log('Error fetching field:', e);
            return fallback;
        }
    };

    const loadDataSafe = async () => {
        try {
            const brand = DeviceInfo.getBrand();
            const model = DeviceInfo.getModel();
            const type = DeviceInfo.getDeviceType();
            const systemName = DeviceInfo.getSystemName();
            const systemVersion = DeviceInfo.getSystemVersion();
            const bundleId = DeviceInfo.getBundleId();
            const buildNumber = DeviceInfo.getBuildNumber();
            const version = DeviceInfo.getVersion();
            const isTablet = DeviceInfo.isTablet();

            setInfo((prev: any) => ({
                ...prev,
                brand, model, type, systemName, systemVersion,
                bundleId, buildNumber, version, isTablet
            }));

            let id = await safeGet(DeviceInfo.getUniqueId(), 'UNKNOWN');
            if (Platform.OS === 'android') {
                try {
                    const hasPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
                    if (!hasPerm) {
                        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
                        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                            console.log("Phone State permission denied");
                        }
                    }
                    const serial = await safeGet(DeviceInfo.getSerialNumber(), 'N/A');
                    if (serial !== 'unknown' && serial !== 'N/A') id = serial;
                } catch (e) { console.log('Permission err', e); }
            }
            setUniqueId(id);

            const results = await Promise.all([
                safeGet(DeviceInfo.getProduct()),
                safeGet(DeviceInfo.getDevice()),
                DeviceInfo.getDeviceId(),
                safeGet(DeviceInfo.getApiLevel()),
                safeGet(DeviceInfo.getBaseOs()),
                safeGet(DeviceInfo.getCodename()),
                safeGet(DeviceInfo.getSecurityPatch()),
                safeGet(DeviceInfo.getCarrier()),
                safeGet(DeviceInfo.getTotalMemory(), 0),
                safeGet(DeviceInfo.getMaxMemory(), 0),
                safeGet(DeviceInfo.getTotalDiskCapacity(), 0),
                safeGet(DeviceInfo.getFreeDiskStorage(), 0),
                safeGet(DeviceInfo.getFontScale()),
                safeGet(DeviceInfo.getIpAddress()),
                safeGet(DeviceInfo.getMacAddress()),
                safeGet(DeviceInfo.getUserAgent()),
                safeGet(DeviceInfo.isEmulator()),
                safeGet(DeviceInfo.isPinOrFingerprintSet()),
                safeGet(DeviceInfo.getBuildId()),
                safeGet(DeviceInfo.getFingerprint())
            ]);

            const [
                product, device, devIdActual, apiLevel, baseOs, codename, securityPatch,
                carrier, totalMem, maxMem, totalDisk, freeDisk,
                fontScale, ip, mac, userAgent, isEmulator, isPin,
                buildId, fingerprint
            ] = results;

            console.log('Fetching extra info...');
            const extra = HardwareModule ? await safeGet(HardwareModule.getExtraHardwareDetails()) : {};
            const imeis = HardwareModule ? await safeGet(HardwareModule.getImeis()) : {};

            setInfo((prev: any) => ({
                ...prev,
                product, device, deviceId: devIdActual, apiLevel, baseOs, codename, securityPatch,
                carrier, totalMem, maxMem, totalDisk, freeDisk,
                fontScale, ip, mac, userAgent, isEmulator, isPin,
                buildId, fingerprint,
                ...extra, ...imeis
            }));

        } catch (err: any) {
            console.error('CRITICAL LOAD ERROR:', err);
            setError(err.message || "Failed to load info");
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ label, value }: { label: string, value: any }) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={1}>{value?.toString() || 'N/A'}</Text>
        </View>
    );

    const formatBytes = (bytes: number) => {
        if (!bytes || isNaN(bytes)) return 'N/A';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const renderBarcode = (val: string) => {
        if (!val || val === 'N/A' || val === 'Restricted' || val === 'UNKNOWN') {
            return (
                <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.subtext, fontSize: 12 }}>Barcode Unavailable</Text>
                </View>
            );
        }
        return (
            <Barcode
                value={val}
                format="CODE128"
                height={80}
                maxWidth={280}
                singleBarWidth={2}
                onError={(err: any) => console.log('Barcode generation failed:', err)}
            />
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Hardware Information</Text>

            {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />}
            {error && <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>Error: {error}</Text>}

            <View style={styles.barcodeContainer}>
                <View style={[styles.barcodeWrapper, { backgroundColor: '#FFF', padding: 10, borderRadius: 8, minWidth: 200, minHeight: 100, justifyContent: 'center' }]}>
                    {renderBarcode(
                        (info.imei1 && info.imei1.length > 5 && info.imei1 !== 'Restricted')
                            ? info.imei1
                            : uniqueId
                    )}
                </View>
                <Text style={styles.deviceId}>{(info.imei1 && info.imei1 !== 'Restricted') ? info.imei1 : uniqueId}</Text>
                <Text style={styles.smallText}>{(info.imei1 && info.imei1 !== 'Restricted') ? 'Device IMEI' : 'Device Unique ID (Fallback)'}</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Build & OS</Text>
                    <InfoRow label="Brand" value={info.brand} />
                    <InfoRow label="Model" value={info.model} />
                    <InfoRow label="Device" value={info.device} />
                    <InfoRow label="Android Version" value={info.systemVersion} />
                    <InfoRow label="OS Codename" value={info.codename} />
                    <InfoRow label="Security Patch" value={info.securityPatch} />
                    <InfoRow label="Build ID" value={info.buildId} />
                    <InfoRow label="Incremental" value={info.buildNumber} />
                    <InfoRow label="API Level" value={info.apiLevel} />
                    <InfoRow label="Base OS" value={info.baseOs} />
                    <InfoRow label="Product" value={info.product} />
                    <InfoRow label="Fingerprint" value={info.fingerprint} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Display & CPU</Text>
                    <InfoRow label="Resolution" value={`${info.xdpi?.toFixed(0)} x ${info.ydpi?.toFixed(0)} PPI`} />
                    <InfoRow label="Refresh Rate" value={`${info.refreshRate} Hz`} />
                    <InfoRow label="SoC / Chip" value={info.soc} />
                    <InfoRow label="Hardware" value={info.hardware} />
                    <InfoRow label="Arch" value={info.supportedAbis} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Hardware Stats</Text>
                    <InfoRow label="RAM Total" value={formatBytes(info.totalMem)} />
                    <InfoRow label="Max JV Mem" value={formatBytes(info.maxMem)} />
                    <InfoRow label="Disk Total" value={formatBytes(info.totalDisk)} />
                    <InfoRow label="Disk Free" value={formatBytes(info.freeDisk)} />
                    <InfoRow label="Device Type" value={info.brand === 'Apple' ? 'iPhone' : info.type} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Network & Identity</Text>
                    <InfoRow label="Carrier" value={info.carrier} />
                    <InfoRow label="IP Addr" value={info.ip} />
                    <InfoRow label="MAC" value={info.mac} />
                    <InfoRow label="AppID" value={info.bundleId} />
                    <InfoRow label="Auth Set" value={info.isPin ? 'Yes' : 'No'} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Raw UserAgent</Text>
                    <Text style={styles.smallText}>{info.userAgent}</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            padding: spacing.m,
            backgroundColor: colors.background,
            minHeight: '100%'
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: spacing.m,
            color: colors.text,
            textAlign: 'center'
        },
        barcodeContainer: {
            alignItems: 'center',
            marginBottom: spacing.l,
            backgroundColor: colors.card,
            padding: spacing.l,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border
        },
        barcodeWrapper: {
            padding: 5,
            backgroundColor: 'white',
            borderRadius: 4
        },
        deviceId: {
            color: colors.text,
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: spacing.m,
            fontVariant: ['tabular-nums']
        },
        idLabel: {
            color: colors.subtext,
            fontSize: 12,
            textTransform: 'uppercase',
            marginTop: 4
        },
        grid: {
            gap: spacing.m
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 8,
            padding: spacing.m,
            borderWidth: 1,
            borderColor: colors.border,
        },
        sectionHeader: {
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: spacing.s,
            textTransform: 'uppercase',
            letterSpacing: 1
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6,
            alignItems: 'center'
        },
        label: {
            fontSize: 14,
            color: colors.subtext,
            flex: 1
        },
        value: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
            textAlign: 'right'
        },
        smallText: {
            color: colors.subtext,
            fontSize: 10
        }
    });
};
