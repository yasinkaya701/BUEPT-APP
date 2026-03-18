import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppState } from '../context/AppState';

const FACULTIES = ["Engineering", "Economics", "Arts & Sciences", "Education", "Law"];

export default function SignupScreen({ navigation }) {
    const { register } = useAppState();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [faculty, setFaculty] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSignup = async () => {
        setError('');
        setSubmitting(true);
        const result = await register({ name, email, password, faculty });
        setSubmitting(false);
        if (!result?.ok) {
            setError(result?.error || 'Account could not be created.');
        }
    };

    return (
        <Screen scroll contentStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Create Account</Text>
            </View>

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons name="person-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Ahmet Yılmaz"
                            placeholderTextColor={colors.muted}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <Text style={styles.inputLabel}>University Email</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons name="mail-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="ahmet@boun.edu.tr"
                            placeholderTextColor={colors.muted}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Choose Faculty</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.facultyScroll}>
                        {FACULTIES.map(fac => (
                            <TouchableOpacity
                                key={fac}
                                style={[styles.facultyBtn, faculty === fac && styles.facultyBtnActive]}
                                onPress={() => setFaculty(fac)}
                            >
                                <Text style={[styles.facultyText, faculty === fac && styles.facultyTextActive]}>{fac}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Create a strong password"
                            placeholderTextColor={colors.muted}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={[styles.loginBtn, submitting && styles.loginBtnDisabled]} onPress={handleSignup} disabled={submitting}>
                        <Text style={styles.loginBtnText}>{submitting ? 'Creating Account...' : 'Register Now'}</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.loginBtnIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.switchBtnText}>Already registered? <Text style={styles.switchLink}>Sign In</Text></Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, paddingBottom: spacing.md },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    headerText: { fontSize: 24, fontWeight: '900', color: colors.primaryDark, fontFamily: typography.fontHeadline },

    scroll: { padding: spacing.xl },

    inputLabel: { fontSize: 13, fontWeight: '800', color: colors.muted, marginBottom: 8, textTransform: 'uppercase' },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.lg, marginBottom: spacing.xl, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 16 : 6, ...shadow.slight },
    inputIcon: { marginRight: spacing.sm },
    input: { flex: 1, fontSize: 16, color: colors.text },

    facultyScroll: { gap: spacing.sm, marginBottom: spacing.xl, paddingBottom: 8 },
    facultyBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    facultyBtnActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    facultyText: { fontSize: 14, fontWeight: '700', color: colors.muted },
    facultyTextActive: { color: colors.primary, fontWeight: '900' },

    loginBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: radius.pill, marginTop: spacing.md, ...shadow.sm },
    loginBtnDisabled: { opacity: 0.6 },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    loginBtnIcon: { marginLeft: 8 },
    errorText: { color: colors.errorDark, fontSize: 13, lineHeight: 18, marginTop: -8, marginBottom: spacing.md },
    switchBtn: { alignItems: 'center', marginTop: spacing.xl, padding: spacing.md },
    switchBtnText: { fontSize: 14, color: colors.muted, fontWeight: '600' },
    switchLink: { color: colors.primary, fontWeight: '800' },
});
