import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Platform, PermissionsAndroid, NativeModules, NativeEventEmitter, Linking, Alert } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BleManager from 'react-native-ble-manager';
import { colors, spacing, shadows } from '../theme';
import { useTestLogic } from '../hooks/useTestLogic';

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
            setDevices(prev => {
                const exists = prev.find(d => d.id === peripheral.id);
                if (!exists) return [...prev, peripheral];
                return prev;
            });
        };

        const handleStopScan = () => {
            console.log('Scan stopped');
            setIsScanning(false);
        };

        const handleStateUpdate = (state: any) => {
            console.log('BT State Updated:', state);
            setBtState(state.state === 'on' ? 'on' : 'off');
        };

        if (!bleManagerEmitter) return;

        const listeners = [
            bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral),
            bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
            bleManagerEmitter.addListener('BleManagerDidUpdateState', handleStateUpdate),
        ];

        return () => {
            listeners.forEach(l => l.remove());
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
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);
                return result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                return result === PermissionsAndroid.RESULTS.GRANTED;
            }
        }
        return true;
    };

    const toggleBluetooth = async () => {
        try {
            if (btState === 'off') {
                await BleManager.enableBluetooth();
                setBtState('on');
            } else {
                Alert.alert('Info', 'To disable Bluetooth, please use the system settings.', [
                    { text: 'Open Settings', onPress: () => Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS') },
                    { text: 'Cancel', style: 'cancel' }
                ]);
            }
        } catch (e) {
            console.error('Toggle error:', e);
        }
    };

    const makeDiscoverable = async () => {
        try {
            // Android intent for discoverability (usually 300 seconds)
            await Linking.sendIntent('android.bluetooth.adapter.action.REQUEST_DISCOVERABLE');
        } catch (e) {
            console.error('Discoverable error:', e);
            Alert.alert('Error', 'Could not open discoverability settings.');
        }
    };

    const startScan = async () => {
        if (isScanning) return;

        const hasPermission = await checkPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Location/Bluetooth permissions are required to scan.');
            return;
        }

        try {
            setDevices([]);
            setIsScanning(true);
            // Scan for 10 seconds, no specific service UUIDs
            // @ts-ignore
            await BleManager.scan([], 10, false);
        } catch (err) {
            console.error('Scan error:', err);
            setIsScanning(false);
            Alert.alert('Scan Failed', 'Could not start Bluetooth scan.');
        }
    };

    const renderDeviceItem = ({ item }: { item: any }) => (
        <View style={styles.deviceItem}>
            <Icon name="bluetooth" size={20} color={colors.primary} />
            <View>
                <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
                <Text style={styles.deviceId}>{item.id}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isAutomated && <Text style={styles.seqText}>Test Sequence</Text>}
                <Text style={styles.title}>Bluetooth Test</Text>
                <Text style={styles.subtitle}>Scanning for nearby devices to verify hardware.</Text>
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
