import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import LogoMark from '../components/LogoMark';
import { colors, spacing, typography } from '../theme/tokens';

export default function DeveloperScreen() {
    const handleEmail = () => {
        Linking.openURL('mailto:gs7016903@gmail.com?subject=Boğaziçi Prep Feedback');
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
    }
});
