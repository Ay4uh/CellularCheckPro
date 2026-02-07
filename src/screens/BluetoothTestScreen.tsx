import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Platform, PermissionsAndroid, NativeModules, NativeEventEmitter, Linking, Alert } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BleManager from 'react-native-ble-manager';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';
import DeviceInfo from 'react-native-device-info';

const { BleManagerModule } = NativeModules;
const bleManagerEmitter = BleManagerModule ? new NativeEventEmitter(BleManagerModule) : null;

export const BluetoothTestScreen = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [btState, setBtState] = useState<'on' | 'off' | 'unknown'>('unknown');
    const [devices, setDevices] = useState<any[]>([]);
    const { completeTest, isAutomated } = useTestLogic('Bluetooth');

    useEffect(() => {
        console.log('BluetoothTestScreen: mounting');

        try {
            BleManager.start({ showAlert: false });
            checkBluetoothState();
            checkPermissions();
        } catch (e) {
            console.error('Error starting BleManager:', e);
        }

        const handleDiscoverPeripheral = (peripheral: any) => {
            // RELAXED FILTERING: Even if it has no name, we show it (likely a sensor or phone 
            // not broadcasting name over BLE). We filter by ID to avoid duplicates.
            setDevices(prev => {
                const exists = prev.find(d => d.id === peripheral.id);
                if (!exists) return [...prev, peripheral];

                // Update RSSI if it already exists
                return prev.map(d => d.id === peripheral.id ? { ...d, rssi: peripheral.rssi } : d);
            });
        };

        const handleStopScan = () => {
            console.log('Scan stopped');
            setIsScanning(false);
        };

        const handleStateUpdate = (state: any) => {
            console.log('BT State Updated:', state);
            const newState = state.state === 'on' ? 'on' : 'off';
            setBtState(newState);
        };

        if (!bleManagerEmitter) return;

        const listeners = [
            bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral),
            bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
            bleManagerEmitter.addListener('BleManagerDidUpdateState', handleStateUpdate),
        ];

        return () => {
            listeners.forEach(l => l.remove());
            BleManager.stopScan();
        };
    }, []);

    const checkBluetoothState = async () => {
        try {
            // @ts-ignore
            BleManager.checkState();
        } catch (e) {
            console.error('Error checking state:', e);
        }
    };

    const checkPermissions = async () => {
        if (Platform.OS === 'android') {
            if (Platform.Version >= 31) {
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);
                return (
                    result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } else {
                const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                return result === PermissionsAndroid.RESULTS.GRANTED;
            }
        }
        return true;
    };

    const toggleBluetooth = async () => {
        try {
            if (btState !== 'on') {
                await BleManager.enableBluetooth();
                setBtState('on');
            } else {
                Alert.alert('Info', 'To disable Bluetooth, please use the system settings.', [
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    { text: 'Cancel', style: 'cancel' }
                ]);
            }
        } catch (e) {
            console.error('Toggle error:', e);
        }
    };

    const makeDiscoverable = async () => {
        try {
            await Linking.sendIntent('android.bluetooth.adapter.action.REQUEST_DISCOVERABLE');
        } catch (e) {
            console.error('Discoverable error:', e);
            Alert.alert('Error', 'Could not open discoverability settings.');
        }
    };

    const startScan = async () => {
        if (isScanning) return;

        // 1. Check Permissions
        const hasPermission = await checkPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Location and Bluetooth permissions are required to scan for nearby devices.');
            return;
        }

        // 2. Check Device Settings (Bluetooth & Location Services)
        try {
            if (Platform.OS === 'android') {
                const locationEnabled = await DeviceInfo.isLocationEnabled();
                if (!locationEnabled) {
                    Alert.alert(
                        'Location Services Required',
                        'Android requires Location Services (GPS) to be enabled for Bluetooth scanning. Please turn it on in settings.',
                        [
                            { text: 'Open Settings', onPress: () => Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS') },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                    return;
                }

                // Ensure Bluetooth is actually ON
                if (btState !== 'on') {
                    await BleManager.enableBluetooth();
                    // Give it a moment to actually turn on
                    await new Promise(resolve => setTimeout(() => resolve(null), 1000));
                }
            }

            setDevices([]);
            setIsScanning(true);

            // CORRECT SIGNATURE for react-native-ble-manager v12:
            // scan(options: ScanOptions)
            await BleManager.scan({
                serviceUUIDs: [],
                seconds: 20, // Increased to 20 for better discovery
                allowDuplicates: true
            });
        } catch (err) {
            console.error('Scan error:', err);
            setIsScanning(false);
            Alert.alert('Scan Failed', 'Could not start Bluetooth scan. Please verify Bluetooth is on.');
        }
    };

    const renderDeviceItem = ({ item }: { item: any }) => (
        <View style={styles.deviceItem}>
            <View style={styles.deviceIcon}>
                <Icon name="bluetooth" size={20} color={colors.primary} />
                <Text style={styles.rssiText}>{item.rssi} dBm</Text>
            </View>
            <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.name || item.localName || 'Unnamed BLE Device'}</Text>
                <Text style={styles.deviceId}>{item.id}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Bluetooth Test</Text>
                <Text style={styles.subtitle}>Scanning for nearby BLE devices to verify hardware.</Text>
            </View>

            {/* Educational Notice for BLE vs Classic */}
            <View style={styles.noticeCard}>
                <Icon name="information-outline" size={20} color={colors.primary} />
                <Text style={styles.noticeText}>
                    This test uses BLE (Low Energy). Standard phones/laptops may only appear if they are explicitly broadcasting a BLE signal or running a compatible app.
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, btState === 'on' && styles.activeCard]}
                        onPress={toggleBluetooth}
                    >
                        <Icon name={btState === 'on' ? "bluetooth" : "bluetooth-off"} size={32} color={btState === 'on' ? "#FFF" : colors.primary} />
                        <Text style={[styles.actionText, btState === 'on' && styles.activeText]}>
                            {btState === 'on' ? 'BT is ON' : 'Turn BT ON'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={makeDiscoverable}>
                        <Icon name="eye-outline" size={32} color={colors.primary} />
                        <Text style={styles.actionText}>Make Discoverable</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.scanBtn, isScanning && styles.disabledBtn]}
                    onPress={startScan}
                    disabled={isScanning}
                >
                    <Icon name={isScanning ? "sync" : "magnify"} size={24} color="#FFF" />
                    <Text style={styles.scanBtnText}>{isScanning ? 'Scan for Devices' : 'Search Nearby'}</Text>
                </TouchableOpacity>

                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Discovered Devices ({devices.length})</Text>
                </View>

                {devices.length === 0 && !isScanning ? (
                    <View style={styles.emptyState}>
                        <Icon name="bluetooth-audio" size={48} color={colors.subtext} />
                        <Text style={styles.emptyText}>No devices found yet.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={devices}
                        renderItem={renderDeviceItem}
                        keyExtractor={item => item.id}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.question}>Did Bluetooth scan work?</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.btn, styles.failBtn]} onPress={() => completeTest('failure')}>
                        <Icon name="close" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Failed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.passBtn]} onPress={() => completeTest('success')}>
                        <Icon name="check" size={24} color="#FFF" />
                        <Text style={styles.btnText}>Works Fine</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.l,
        alignItems: 'center',
    },
    seqText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: colors.subtext,
        textAlign: 'center'
    },
    noticeCard: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        marginHorizontal: spacing.l,
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        alignItems: 'center',
        gap: 12,
        ...shadows.soft
    },
    noticeText: {
        flex: 1,
        fontSize: 12,
        color: colors.subtext,
        lineHeight: 18
    },
    content: {
        flex: 1,
        padding: spacing.l,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: spacing.m,
        marginBottom: 20
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.card,
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.soft
    },
    activeCard: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    actionText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center'
    },
    activeText: {
        color: '#FFF'
    },
    scanBtn: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20
    },
    disabledBtn: {
        opacity: 0.6
    },
    scanBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    listHeader: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 10,
        marginBottom: 10
    },
    listTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.subtext,
        textTransform: 'uppercase'
    },
    list: {
        flex: 1
    },
    listContent: {
        paddingBottom: 20
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.card,
        borderRadius: 12,
        marginBottom: 10,
        gap: 15,
        borderWidth: 1,
        borderColor: colors.border
    },
    deviceIcon: {
        alignItems: 'center',
        minWidth: 50,
    },
    rssiText: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: 'bold',
        marginTop: 4
    },
    deviceInfo: {
        flex: 1
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text
    },
    deviceId: {
        fontSize: 12,
        color: colors.subtext,
        marginTop: 2
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5
    },
    emptyText: {
        marginTop: 10,
        color: colors.subtext
    },
    footer: {
        padding: spacing.l,
        backgroundColor: colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...shadows.medium
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.m
    },
    controls: {
        flexDirection: 'row',
        gap: spacing.m
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    passBtn: {
        backgroundColor: colors.success,
    },
    failBtn: {
        backgroundColor: colors.error,
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
