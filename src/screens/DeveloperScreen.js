import React, { useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import LogoMark from '../components/LogoMark';
import { colors, spacing, typography } from '../theme/tokens';
import { runDiagnostics } from '../utils/diagnostics';

export default function DeveloperScreen() {
    const [diagResults, setDiagResults] = useState([]);
    const [diagRunning, setDiagRunning] = useState(false);

    const handleEmail = () => {
        Linking.openURL('mailto:gs7016903@gmail.com?subject=Boğaziçi Prep Feedback');
    };

    const handleDiagnostics = async () => {
        setDiagRunning(true);
        try {
            const results = await runDiagnostics();
            setDiagResults(results);
        } catch (error) {
            setDiagResults([{ id: 'fatal', label: 'Diagnostics', ok: false, detail: String(error?.message || error) }]);
        } finally {
            setDiagRunning(false);
        }
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <LogoMark size={72} label="B" />
                <Text style={styles.appName}>Boğaziçi Prep</Text>
                <Text style={styles.version}>Version 1.0</Text>
            </View>

            <Card style={styles.devCard}>
                <Text style={styles.cardTitle}>Geliştirici Hakkında</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Geliştirici:</Text>
                    <Text style={styles.value}>Mehmet Yasin Kaya</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Bölüm:</Text>
                    <Text style={styles.value}>Boğaziçi Üniversitesi{'\n'}Bilgisayar Mühendisliği</Text>
                </View>

                <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>
                        "BUEPT hazırlık serüveni, kelimelerle boğuştuğunuz ve essay'ler arasında kaybolduğunuz uzun bir maraton. Bu süreci biraz daha katlanılır, belki de keyifli bir hale getirmek için bu kodları yazdım. Boğaziçi'nin tadını çıkarmanız dileğiyle!"
                    </Text>
                </View>
            </Card>

            <Card style={styles.contactCard}>
                <Text style={styles.cardTitle}>İletişim & Destek</Text>
                <Text style={styles.bodyText}>
                    Uygulama hakkında geri bildirim vermek, hata bildirmek veya bana ulaşmak isterseniz aşağıdaki butona tıklayarak mail atabilirsiniz.
                </Text>

                <Button
                    label="Mail Gönder: gs7016903@gmail.com"
                    onPress={handleEmail}
                    icon="✉️"
                />
            </Card>

            <Card style={styles.buildCard}>
                <Text style={styles.cardTitle}>Build & Distribution</Text>
                <Text style={styles.bodyText}>
                    Production-ready build for Android (APK). All data conflicts resolved, hooks stabilized.
                </Text>
                <View style={styles.buildInfo}>
                    <View style={styles.buildBadge}>
                        <Text style={styles.buildBadgeText}>V21 STABLE</Text>
                    </View>
                    <Text style={styles.buildMeta}>Release Date: {new Date().toLocaleDateString()}</Text>
                </View>
                <Button
                    label="Download Production APK"
                    onPress={() => Linking.openURL('https://github.com/yasinkaya/BUEPT-APP/releases/latest')}
                    icon="📦"
                    variant="primary"
                />
            </Card>

            <Card style={styles.contactCard}>
                <Text style={styles.cardTitle}>Diagnostics</Text>
                <Text style={styles.bodyText}>Run a quick health check for API, dictionary, and TTS.</Text>
                <Button
                    label={diagRunning ? 'Running...' : 'Run Diagnostics'}
                    onPress={handleDiagnostics}
                    icon="🧪"
                    disabled={diagRunning}
                />
                {diagResults.length ? (
                    <View style={styles.diagList}>
                        {diagResults.map((row) => (
                            <View key={row.id} style={styles.diagRow}>
                                <Text style={[styles.diagStatus, row.ok ? styles.diagOk : styles.diagFail]}>
                                    {row.ok ? 'OK' : 'FAIL'}
                                </Text>
                                <View style={styles.diagBody}>
                                    <Text style={styles.diagLabel}>{row.label}</Text>
                                    <Text style={styles.diagDetail}>{row.detail}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : null}
            </Card>

        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    appName: {
        fontSize: typography.h1,
        fontFamily: typography.fontHeadline,
        color: colors.text,
        marginTop: spacing.md,
    },
    version: {
        fontSize: typography.small,
        color: colors.muted,
        marginTop: 4,
    },
    devCard: {
        marginBottom: spacing.lg,
        backgroundColor: '#0A1628',
        borderColor: colors.primary,
        borderWidth: 1,
    },
    contactCard: {
        marginBottom: spacing.xl,
    },
    buildCard: {
        marginBottom: spacing.lg,
        backgroundColor: '#064E3B',
        borderColor: '#10B981',
        borderWidth: 1,
    },
    buildInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: spacing.md,
    },
    buildBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    buildBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    buildMeta: {
        fontSize: 12,
        color: '#D1FAE5',
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: typography.h2,
        fontFamily: typography.fontHeadline,
        color: colors.primary,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    label: {
        fontSize: typography.body,
        color: colors.muted,
        fontWeight: 'bold',
        flex: 1,
    },
    value: {
        fontSize: typography.body,
        color: '#DDE8FF',
        fontFamily: typography.fontHeadline,
        flex: 2,
        textAlign: 'right',
        lineHeight: 22,
    },
    quoteBox: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: 'rgba(88, 166, 255, 0.1)',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    quoteText: {
        fontSize: typography.small,
        color: '#A8C0FF',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    bodyText: {
        fontSize: typography.body,
        color: colors.text,
        marginBottom: spacing.md,
        lineHeight: 22,
    },
    diagList: {
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    diagRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    diagStatus: {
        width: 48,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '800',
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    diagOk: {
        backgroundColor: '#DCFCE7',
        color: '#166534',
    },
    diagFail: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
    },
    diagBody: {
        flex: 1,
    },
    diagLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    diagDetail: {
        fontSize: 12,
        color: colors.muted,
    },
});
