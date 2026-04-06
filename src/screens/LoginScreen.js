import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions, ImageBackground } from 'react-native';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppState } from '../context/AppState';

const BG_IMAGE = require('../assets/images/real_south_gate.jpg');

export default function LoginScreen({ navigation }) {
    const { login, userProfile } = useAppState();
    const { height } = useWindowDimensions();
    const compact = height < 760;
    const savedAccountReady = Boolean(userProfile?.email);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const savedAccountLabel = useMemo(
        () => (userProfile?.name ? `${userProfile.name} · ${userProfile.email}` : userProfile?.email || ''),
        [userProfile]
    );

    useEffect(() => {
        if (!email && userProfile?.email) {
            setEmail(userProfile.email);
        }
    }, [email, userProfile?.email]);

    const handleLogin = async () => {
        setError('');
        setSubmitting(true);
        const result = await login({ email, password });
        setSubmitting(false);
        if (!result?.ok) {
            setError(result?.error || 'Sign in failed.');
        }
    };

    const handleDemo = async () => {
        setError('');
        setSubmitting(true);
        const result = await login({ mode: 'demo', nextRoute: 'DemoFeatures' });
        setSubmitting(false);
        if (!result?.ok) {
            setError(result?.error || 'Demo mode could not start.');
        }
    };

    return (
        <ImageBackground source={BG_IMAGE} style={styles.bgImage} resizeMode="cover">
            <View style={styles.overlay} pointerEvents="none" />
            <KeyboardAvoidingView style={styles.flex} enabled={Platform.OS !== 'web'} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Top branding ── */}
                    <View style={[styles.topSection, compact && styles.topSectionCompact]}>
                        <View style={styles.logoWrap}>
                            <Ionicons name="school" size={48} color="#fff" />
                        </View>
                        <Text style={styles.brandTitle}>BUEPT</Text>
                        <Text style={styles.brandSub}>Boğaziçi University English Proficiency</Text>
                        <View style={styles.heroBadgeRow}>
                            <View style={styles.heroBadge}>
                                <Ionicons name="shield-checkmark-outline" size={13} color="#fff" />
                                <Text style={styles.heroBadgeText}>Local account</Text>
                            </View>
                            <View style={styles.heroBadge}>
                                <Ionicons name="flash-outline" size={13} color="#fff" />
                                <Text style={styles.heroBadgeText}>Demo launch</Text>
                            </View>
                            <View style={styles.heroBadge}>
                                <Ionicons name="wifi-outline" size={13} color="#fff" />
                                <Text style={styles.heroBadgeText}>Offline-safe</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Glassmorphism form card ── */}
                    <View style={[styles.formShell, compact && styles.formShellCompact]}>
                        <View style={[styles.glassCard, compact && styles.glassCardCompact]}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.flexOne}>
                                    <Text style={styles.formTitle}>Sign In</Text>
                                    <Text style={styles.formSub}>
                                        Use the saved local account on this device, or launch the live demo hub directly.
                                    </Text>
                                </View>
                                <View style={styles.statusPill}>
                                    <Ionicons name="desktop-outline" size={13} color={colors.primaryDark} />
                                    <Text style={styles.statusPillText}>Presenter Ready</Text>
                                </View>
                            </View>

                            {savedAccountReady ? (
                                <View style={styles.savedAccountCard}>
                                    <View style={styles.savedAccountTop}>
                                        <View>
                                            <Text style={styles.savedAccountLabel}>Saved account</Text>
                                            <Text style={styles.savedAccountValue}>{savedAccountLabel}</Text>
                                            <Text style={styles.savedAccountMeta}>
                                                Track: {userProfile.faculty || 'General'}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.savedAccountUseBtn}
                                            onPress={() => setEmail(userProfile.email)}
                                        >
                                            <Text style={styles.savedAccountUseText}>Use saved email</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.infoCard}>
                                    <Ionicons name="person-add-outline" size={18} color={colors.primaryDark} />
                                    <View style={styles.infoCopy}>
                                        <Text style={styles.infoTitle}>No local account on this device</Text>
                                        <Text style={styles.infoBody}>Create one once, then future sign-ins stay local and fast.</Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.inputWrap}>
                                <Ionicons name="mail-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="University Email (@boun.edu.tr)"
                                    placeholderTextColor={colors.muted}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    returnKeyType="next"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoComplete="email"
                                />
                            </View>

                            <View style={styles.inputWrap}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor={colors.muted}
                                    secureTextEntry
                                    returnKeyType="done"
                                    value={password}
                                    onChangeText={setPassword}
                                    onSubmitEditing={handleLogin}
                                    autoComplete="password"
                                />
                            </View>

                            {error ? (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle-outline" size={18} color={colors.errorDark} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <TouchableOpacity style={[styles.loginBtn, submitting && styles.loginBtnDisabled]} onPress={handleLogin} disabled={submitting}>
                                <Text style={styles.loginBtnText}>{submitting ? 'Signing In...' : 'Sign In'}</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.loginBtnIcon} />
                            </TouchableOpacity>

                            {/* Demo card */}
                            <View style={styles.presenterCard}>
                                <View style={styles.presenterHeader}>
                                    <View style={styles.presenterIcon}>
                                        <Ionicons name="sparkles-outline" size={18} color={colors.primaryDark} />
                                    </View>
                                    <View style={styles.presenterCopy}>
                                        <Text style={styles.presenterTitle}>Presenter Shortcut</Text>
                                        <Text style={styles.presenterBody}>
                                            Starts the demo dataset and opens the live demo hub automatically after sign-in.
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.presenterChecklist}>
                                    <Text style={styles.presenterCheck}>✓  Demo student profile</Text>
                                    <Text style={styles.presenterCheck}>✓  Pre-seeded vocab and analytics</Text>
                                    <Text style={styles.presenterCheck}>✓  Direct jump to Feature Hub</Text>
                                </View>
                                <TouchableOpacity style={[styles.demoBtn, submitting && styles.loginBtnDisabled]} onPress={handleDemo} disabled={submitting}>
                                    <Text style={styles.demoBtnText}>{submitting ? 'Opening Demo...' : 'Open Demo Hub'}</Text>
                                    <Ionicons name="flash-outline" size={16} color={colors.primaryDark} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.switchBtnText}>New Student? <Text style={styles.switchLink}>Create Account</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bgImage: { flex: 1, width: '100%', height: '100%' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    flex: { flex: 1 },
    flexOne: { flex: 1 },
    scrollContent: { flexGrow: 1 },

    // ── Top hero ──
    topSection: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 48, paddingHorizontal: spacing.lg },
    topSectionCompact: { paddingTop: 56, paddingBottom: 28 },
    logoWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    brandTitle: { fontSize: 44, fontWeight: '900', color: '#fff', fontFamily: typography.fontHeadline, letterSpacing: -1.5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
    brandSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.6, textAlign: 'center', marginTop: 4 },
    heroBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: spacing.lg },
    heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
    heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

    // ── Glass form ──
    formShell: { paddingHorizontal: spacing.lg, marginTop: -spacing.md, paddingBottom: 40 },
    formShellCompact: { paddingHorizontal: spacing.md },
    glassCard: { padding: spacing.xl, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', ...shadow.lg },
    glassCardCompact: { padding: spacing.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.lg },
    statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.border },
    statusPillText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    formTitle: { fontSize: 30, fontWeight: '900', color: colors.text, fontFamily: typography.fontHeadline, letterSpacing: -0.8 },
    formSub: { fontSize: 15, color: colors.muted, lineHeight: 22, marginTop: 4, maxWidth: 420 },

    // Saved account + info
    savedAccountCard: { borderRadius: radius.lg, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, ...shadow.slight },
    savedAccountTop: { flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', alignItems: 'center' },
    savedAccountLabel: { fontSize: 11, color: colors.muted, textTransform: 'uppercase', fontWeight: '800', letterSpacing: 0.8 },
    savedAccountValue: { marginTop: 4, fontSize: 15, color: colors.primaryDark, fontFamily: typography.fontHeadline, maxWidth: 260, fontWeight: '700' },
    savedAccountMeta: { marginTop: 2, fontSize: 13, color: colors.muted },
    savedAccountUseBtn: { borderRadius: 999, backgroundColor: colors.primaryLight, paddingHorizontal: 14, paddingVertical: 10 },
    savedAccountUseText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
    infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, padding: spacing.md, marginBottom: spacing.md },
    infoCopy: { flex: 1 },
    infoTitle: { color: colors.primaryDark, fontSize: 15, fontWeight: '800', fontFamily: typography.fontHeadline },
    infoBody: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },

    // Inputs
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 12, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 16 : 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '500' },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.errorLight, borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5', paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 },
    errorText: { flex: 1, fontSize: 14, color: colors.errorDark, lineHeight: 20, fontWeight: '500' },

    // Sign in button
    loginBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 999, marginTop: 16, ...shadow.md, borderWidth: 1.5, borderColor: colors.primaryDark },
    loginBtnDisabled: { opacity: 0.6 },
    loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
    loginBtnIcon: { marginLeft: 8 },

    // Presenter card
    presenterCard: { marginTop: spacing.lg, borderRadius: 20, backgroundColor: '#F0F4FF', borderWidth: 1, borderColor: '#D4DEFF', padding: spacing.lg, ...shadow.sm },
    presenterHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    presenterIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#D4DEFF', ...shadow.slight },
    presenterCopy: { flex: 1 },
    presenterTitle: { color: colors.primaryDark, fontSize: 17, fontWeight: '900', fontFamily: typography.fontHeadline },
    presenterBody: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
    presenterChecklist: { marginTop: 12, gap: 6, paddingLeft: 4 },
    presenterCheck: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '600' },
    demoBtn: { marginTop: spacing.md, paddingVertical: 14, borderRadius: 999, borderWidth: 1.5, borderColor: '#D4DEFF', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow.sm },
    demoBtnText: { color: colors.primaryDark, fontSize: 15, fontWeight: '800' },

    switchBtn: { alignItems: 'center', marginTop: 24, padding: spacing.md },
    switchBtnText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
    switchLink: { color: colors.primary, fontWeight: '800' },
});
