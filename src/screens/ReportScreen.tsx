import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useTestContext } from '../context/TestContext';
import { TestOrder } from '../utils/TestOrder';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
// @ts-ignore
import { generatePDF as createPDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';

export const ReportScreen = () => {
    const { results, extraData, clearResults } = useTestContext();
    const navigation = useNavigation();
    const [exporting, setExporting] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState<any>({ brand: '', model: '', id: '' });

    const { theme } = useTheme();
    const colors = theme.colors;
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    React.useEffect(() => {
        const getInfo = async () => {
            const b = DeviceInfo.getBrand();
            const m = DeviceInfo.getModel();
            const i = await DeviceInfo.getUniqueId();
            setDeviceInfo({ brand: b, model: m, id: i });
        };
        getInfo();
    }, []);

    const handleGeneratePDF = async () => {
        setExporting(true);
        try {
            const date = new Date().toLocaleString();

            // Build Results Rows
            const rows = TestOrder.map(test => {
                const result = results[test.id] || 'skipped';
                const statusColor = result === 'success' ? '#4CAF50' : result === 'failure' ? '#F44336' : '#9E9E9E';
                return `
                    <tr style="border-bottom: 1px solid #EEE;">
                        <td style="padding: 12px; font-size: 14px; color: #333;">${test.title}</td>
                        <td style="padding: 12px; font-size: 14px; text-align: right; font-weight: bold; color: ${statusColor};">${result.toUpperCase()}</td>
                    </tr>
                `;
            }).join('');

            const html = `
                <html>
                    <head>
                        <style>
                            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; }
                            .header { text-align: center; border-bottom: 2px solid #2196F3; padding-bottom: 20px; margin-bottom: 30px; }
                            .logo { color: #2196F3; font-size: 32px; font-weight: bold; margin-bottom: 5px; }
                            .title { font-size: 20px; color: #555; text-transform: uppercase; letter-spacing: 2px; }
                            .info-table { width: 100%; margin-bottom: 30px; }
                            .info-row td { padding: 5px 0; font-size: 14px; }
                            .results-table { width: 100%; border-collapse: collapse; }
                            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #EEE; padding-top: 20px; }
                            .summary-box { background: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="logo">CELLULAR CHECK PRO</div>
                            <div class="title">Diagnostic Report</div>
                        </div>

                        <div class="summary-box">
                            <table class="info-table">
                                <tr class="info-row">
                                    <td><strong>Date:</strong> ${date}</td>
                                    <td style="text-align: right;"><strong>Status:</strong> COMPLETED</td>
                                </tr>
                                <tr class="info-row">
                                    <td><strong>Device:</strong> ${deviceInfo.brand} ${deviceInfo.model}</td>
                                    <td style="text-align: right;"><strong>ID:</strong> ${deviceInfo.id}</td>
                                </tr>
                            </table>
                            <p style="font-size: 12px; color: #666; margin: 0;">This report verifies the hardware integrity of the device as per the tests performed below.</p>
                        </div>

                        <table class="results-table">
                            <thead>
                                <tr style="background: #2196F3; color: white;">
                                    <th style="padding: 12px; text-align: left;">HARDWARE TEST</th>
                                    <th style="padding: 12px; text-align: right;">RESULT</th>
                                </tr>
                            </thead>
                            <tbody>
                ${rows}
                            </tbody>
                        </table>

                        ${extraData['Connectivity'] ? `
                        <div class="summary-box" style="margin-top: 30px;">
                            <h3 style="color: #2196F3; border-bottom: 2px solid #2196F3; padding-bottom: 8px;">NETWORK ANALYSIS</h3>
                            <table class="info-table">
                                <tr>
                                    <td><strong>Carrier:</strong> ${extraData['Connectivity'].simData?.carrierName} (${extraData['Connectivity'].simData?.networkType})</td>
                                    <td style="text-align: right;"><strong>SIM Type:</strong> ${extraData['Connectivity'].simData?.activeSimCount > 1 ? 'Dual SIM' : 'Single SIM'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Signal (RSRP):</strong> ${extraData['Connectivity'].signalData?.rsrp} dBm</td>
                                    <td style="text-align: right;"><strong>Quality (RSRQ):</strong> ${extraData['Connectivity'].signalData?.rsrq} dB</td>
                                </tr>
                                <tr>
                                    <td><strong>Wi-Fi SSID:</strong> ${extraData['Connectivity'].wifiData?.ssid?.replace(/"/g, '')}</td>
                                    <td style="text-align: right;"><strong>Wi-Fi Band:</strong> ${extraData['Connectivity'].wifiData?.band} (${extraData['Connectivity'].wifiData?.frequency} MHz)</td>
                                </tr>
                            </table>
                            <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin-top: 10px;">
                                <h4 style="margin: 0 0 10px 0; font-size: 14px;">Performance Benchmarks</h4>
                                <div style="display: flex; justify-content: space-between;">
                                    <span><strong>Download:</strong> ${extraData['Connectivity'].speedTest.download.toFixed(2)} Mbps</span>
                                    <span><strong>Upload:</strong> ${extraData['Connectivity'].speedTest.upload.toFixed(2)} Mbps</span>
                                    <span><strong>Latency:</strong> ${extraData['Connectivity'].speedTest.ping} ms</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <div class="footer">
                            <p>Cellular Pro - Professional Smartphone Diagnostics</p>
                            <p>Developed by Ayush Sharma | Report ID: CCP-${Date.now().toString().slice(-6)}</p>
                        </div>
                    </body>
                </html>
            `;

            const options = {
                html: html,
                fileName: 'CCP_Diagnostic_Report',
                base64: true,
            };

            const file = await createPDF(options);
            console.log('PDF Result Status:', !!file);

            if (file) {
                const shareOptions: any = {
                    title: 'Cellular Pro Report',
                    message: 'Here is your device diagnostic report.',
                    type: 'application/pdf',
                };

                if (file.filePath) {
                    shareOptions.url = (Platform.OS === 'android' ? 'file://' : '') + file.filePath;
                } else if (file.base64) {
                    shareOptions.url = `data:application/pdf;base64,${file.base64}`;
                }

                if (shareOptions.url) {
                    await Share.open(shareOptions);
                } else {
                    throw new Error('No PDF data or file path returned from generator.');
                }
            }

        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate PDF report: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    const handleDone = () => {
        clearResults();
        // @ts-ignore
        navigation.navigate('DashboardMain');
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Test Report</Text>

            <View style={styles.card}>
                <Text style={styles.cardHeader}>Diagnostic Summary</Text>
                {TestOrder.map((test) => {
                    const result = results[test.id] || 'skipped';
                    return (
                        <View key={test.id} style={styles.row}>
                            <Text style={styles.testName}>{test.title}</Text>
                            <View style={[styles.badge,
                            result === 'success' ? styles.success :
                                result === 'failure' ? styles.failure : styles.skipped
                            ]}>
                                <Text style={styles.badgeText}>{result.toUpperCase()}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={styles.footerButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.exportButton]}
                    onPress={handleGeneratePDF}
                    disabled={exporting}
                >
                    {exporting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Export PDF Report</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.doneButton]} onPress={handleDone}>
                    <Text style={styles.buttonText}>Clear & Finish</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const createStyles = (theme: any) => {
    const { colors } = theme;
    return StyleSheet.create({
        container: {
            flexGrow: 1,
            padding: spacing.m,
            paddingBottom: 110,
            backgroundColor: colors.background,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: spacing.l,
            color: colors.text,
            textAlign: 'center',
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: spacing.m,
            marginBottom: spacing.l,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
        },
        cardHeader: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 8,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.s,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
        },
        testName: {
            fontSize: 15,
            fontWeight: '500',
            color: colors.text,
        },
        badge: {
            paddingHorizontal: spacing.s,
            paddingVertical: 4,
            borderRadius: 12,
            minWidth: 80,
            alignItems: 'center',
        },
        success: { backgroundColor: colors.success },
        failure: { backgroundColor: colors.error },
        skipped: { backgroundColor: colors.subtext },
        badgeText: {
            color: '#FFF',
            fontSize: 10,
            fontWeight: 'bold',
        },
        footerButtons: {
            gap: spacing.m,
            marginBottom: spacing.xl,
        },
        button: {
            padding: spacing.m,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            height: 56,
        },
        exportButton: {
            backgroundColor: colors.primary,
        },
        doneButton: {
            backgroundColor: colors.secondary,
        },
        buttonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
};
