import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { HeaderMenu } from '../components/HeaderMenu';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { HardwareInfoScreen } from '../screens/HardwareInfoScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SpeakerTestScreen } from '../screens/SpeakerTestScreen';
import { EarpieceTestScreen } from '../screens/EarpieceTestScreen';
import { MicTestScreen } from '../screens/MicTestScreen';
import { CameraTestScreen } from '../screens/CameraTestScreen';
import { TouchTestScreen } from '../screens/TouchTestScreen';
import { ProximityTestScreen } from '../screens/ProximityTestScreen';
import { VibrationTestScreen } from '../screens/VibrationTestScreen';
import { FlashTestScreen } from '../screens/FlashTestScreen';
import { GPSTestScreen } from '../screens/GPSTestScreen';
import { FingerprintTestScreen } from '../screens/FingerprintTestScreen';
import { BluetoothTestScreen } from '../screens/BluetoothTestScreen';
import { SensorTestScreen } from '../screens/SensorTestScreen';
import { BatteryTestScreen } from '../screens/BatteryTestScreen';
import { ScreenTestScreen } from '../screens/ScreenTestScreen';
import { NfcTestScreen } from '../screens/NfcTestScreen';
import { ButtonsTestScreen } from '../screens/ButtonsTestScreen';
import { HeadphoneJackTestScreen } from '../screens/HeadphoneJackTestScreen';
import { VideoTestScreen } from '../screens/VideoTestScreen';
import { DepthTestScreen } from '../screens/DepthTestScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { SystemMonitorScreen } from '../screens/SystemMonitorScreen';
import { NetworkDiagnosticsScreen } from '../screens/NetworkDiagnosticsScreen';
import { StorageManagerScreen } from '../screens/StorageManagerScreen';

import { DisplayTestScreen } from '../screens/DisplayTestScreen';
import { MultiTouchTestScreen } from '../screens/MultiTouchTestScreen';
import { SecurityScanScreen } from '../screens/SecurityScanScreen';
import { colors } from '../theme';

// Types
export type RootStackParamList = {
    DashboardMain: undefined;
    SpeakerTest: undefined;
    EarpieceTest: undefined;
    MicTest: undefined;
    CameraTest: undefined;
    TouchTest: undefined;
    ProximityTest: undefined;
    VibrationTest: undefined;
    FlashTest: undefined;
    GPSTest: undefined;
    NetworkDiagnostics: undefined;
    FingerprintTest: undefined;
    WifiTest: undefined;
    BluetoothTest: undefined;
    SensorTest: undefined;
    BatteryTest: undefined;
    ScreenTest: undefined;
    NfcTest: undefined;
    ButtonsTest: undefined;
    HeadphoneJackTest: undefined;
    VideoTest: undefined;
    DepthTest: undefined;
    DisplayTest: undefined;
    MultiTouchTest: undefined;
    SecurityScan: undefined;
    StorageManager: undefined;
    About: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const HeaderTitle = ({ children }: { children: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
            marginRight: 8
        }}>
            {children}
        </Text>
        <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 24, height: 24, borderRadius: 6 }}
        />
    </View>
);

const DashboardStack = () => {
    const { theme } = useTheme();
    const colors = theme.colors;

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.card },
                headerTintColor: colors.primary,
                headerTitleAlign: 'center',
                headerTitle: (props) => <HeaderTitle {...props as any} />,
                headerRight: () => <HeaderMenu />,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="DashboardMain"
                component={DashboardScreen}
                options={{ title: 'Cellular Check Pro' }}
            />
            <Stack.Screen name="SpeakerTest" component={SpeakerTestScreen} options={{ title: 'Loudspeaker Test' }} />
            <Stack.Screen name="EarpieceTest" component={EarpieceTestScreen} options={{ title: 'Earpiece Test' }} />
            <Stack.Screen name="MicTest" component={MicTestScreen} options={{ title: 'Microphone Test' }} />
            <Stack.Screen name="CameraTest" component={CameraTestScreen} options={{ title: 'Camera Test' }} />
            <Stack.Screen name="TouchTest" component={TouchTestScreen} options={{ title: 'Touch Test', headerShown: false }} />
            <Stack.Screen name="ProximityTest" component={ProximityTestScreen} options={{ title: 'Proximity Test' }} />
            <Stack.Screen name="VibrationTest" component={VibrationTestScreen} options={{ title: 'Vibration Test' }} />
            <Stack.Screen name="FlashTest" component={FlashTestScreen} options={{ title: 'Flash Test' }} />
            <Stack.Screen name="GPSTest" component={GPSTestScreen} options={{ title: 'GPS Test' }} />
            <Stack.Screen name="NetworkDiagnostics" component={NetworkDiagnosticsScreen} options={{ title: 'Connectivity Hub' }} />
            <Stack.Screen name="FingerprintTest" component={FingerprintTestScreen} options={{ title: 'Fingerprint Test' }} />
            <Stack.Screen name="BluetoothTest" component={BluetoothTestScreen} options={{ title: 'Bluetooth Test' }} />
            <Stack.Screen name="SensorTest" component={SensorTestScreen} options={{ title: 'Sensors Test' }} />
            <Stack.Screen name="BatteryTest" component={BatteryTestScreen} options={{ title: 'Battery Test' }} />
            <Stack.Screen name="ScreenTest" component={ScreenTestScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NfcTest" component={NfcTestScreen} options={{ title: 'NFC Test' }} />
            <Stack.Screen name="ButtonsTest" component={ButtonsTestScreen} options={{ title: 'Buttons Test' }} />
            <Stack.Screen name="HeadphoneJackTest" component={HeadphoneJackTestScreen} options={{ title: 'Headjack Test' }} />
            <Stack.Screen name="VideoTest" component={VideoTestScreen} options={{ title: 'Video Sync Test' }} />
            <Stack.Screen name="DepthTest" component={DepthTestScreen} options={{ title: 'Depth Test' }} />
            <Stack.Screen name="DisplayTest" component={DisplayTestScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MultiTouchTest" component={MultiTouchTestScreen} options={{ headerShown: false }} />
            <Stack.Screen name="StorageManager" component={StorageManagerScreen} options={{ title: 'Storage & Apps' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
        </Stack.Navigator>
    );
};

export const AppNavigator = () => {
    return (
        <ThemeProvider>
            <AppNavigatorContent />
        </ThemeProvider>
    );
};

import { StatusBar } from 'react-native';

const AppNavigatorContent = () => {
    const { theme } = useTheme();
    const colors = theme.colors;

    return (
        <NavigationContainer theme={theme as any}>
            <StatusBar
                barStyle={theme.dark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.card}
            />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: true,
                    headerTitleAlign: 'center',
                    headerStyle: { backgroundColor: colors.card, shadowOpacity: 0, elevation: 0, borderBottomWidth: 1, borderBottomColor: theme.dark ? '#333' : '#F0F0F0' },
                    headerTintColor: colors.primary,
                    headerTitle: (props) => <HeaderTitle {...props as any} />,
                    headerRight: () => <HeaderMenu />,
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: '#B0B0B0',
                    tabBarShowLabel: false, // Cleaner "advanced" look without labels
                    tabBarStyle: ((route) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? 'DashboardMain';
                        if (routeName !== 'DashboardMain' && route.name === 'Dashboard') {
                            return { display: 'none' };
                        }
                        return {
                            position: 'absolute',
                            bottom: 20,
                            left: '15%',
                            right: '15%',
                            backgroundColor: theme.dark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            borderRadius: 30,
                            height: 60,
                            borderTopWidth: 0,
                            elevation: 10,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 5 },
                            shadowOpacity: 0.2,
                            shadowRadius: 10,
                            paddingBottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        };
                    })(route),
                    tabBarIcon: ({ color, size, focused }) => {
                        let iconName = 'circle';
                        if (route.name === 'Dashboard') iconName = focused ? 'view-grid' : 'view-grid-outline';
                        else if (route.name === 'Monitor') iconName = focused ? 'pulse' : 'pulse';
                        else if (route.name === 'Hardware Info') iconName = focused ? 'chip' : 'chip';
                        else if (route.name === 'Report') iconName = focused ? 'file-document' : 'file-document-outline';
                        else if (route.name === 'About') iconName = focused ? 'information' : 'information-outline';

                        // Active state indicator
                        if (focused) {
                            return (
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: colors.primary + '20',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: 0,
                                }}>
                                    <Icon name={iconName} size={24} color={colors.primary} />
                                </View>
                            );
                        }
                        return <Icon name={iconName} size={24} color={color} />;
                    },
                })}
            >
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardStack}
                    options={({ route }) => ({
                        headerShown: false,
                        tabBarStyle: ((route) => {
                            const routeName = getFocusedRouteNameFromRoute(route) ?? 'DashboardMain';
                            if (routeName !== 'DashboardMain') {
                                return { display: 'none' };
                            }
                            return {
                                position: 'absolute',
                                bottom: 20,
                                left: '15%',
                                right: '15%',
                                backgroundColor: theme.dark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
                                borderRadius: 30,
                                height: 60,
                                borderTopWidth: 0,
                                elevation: 10,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 5 },
                                shadowOpacity: 0.2,
                                shadowRadius: 10,
                                paddingBottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            };
                        })(route)
                    })}
                />
                <Tab.Screen name="Monitor" component={SystemMonitorScreen} />

                <Tab.Screen name="Hardware Info" component={HardwareInfoScreen} />
                <Tab.Screen name="Report" component={ReportScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};
