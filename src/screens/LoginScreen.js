import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import Screen from '../components/Screen';
import { colors, spacing, typography, radius, shadow } from '../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppState } from '../context/AppState';

export default function LoginScreen({ navigation }) {
    const { login } = useAppState();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Simplified mock login
        if (email && password) {
            login(email);
        } else {
            login("Student");
        }
    };

    return (
        <Screen contentStyle={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.topSection}>
                    <View style={styles.logoWrap}>
                        <Ionicons name="book" size={64} color="#fff" />
                    </View>
                    <Text style={styles.brandTitle}>BUEPT Mobile</Text>
                    <Text style={styles.brandSub}>Academic Prestige Platform</Text>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.formTitle}>Welcome Back</Text>

                    <View style={styles.inputWrap}>
                        <Ionicons name="mail-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="University Email (@boun.edu.tr)"
                            placeholderTextColor={colors.muted}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputWrap}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={colors.muted}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <Text style={styles.loginBtnText}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.switchBtnText}>New Student? <Text style={{ color: colors.primary, fontWeight: '800' }}>Create Account</Text></Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    topSection: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark, paddingVertical: 80, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, ...shadow.md },
    logoWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
    brandTitle: { fontSize: 32, fontWeight: '900', color: '#fff', fontFamily: typography.fontHeadline, marginBottom: 4 },
    brandSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

    formSection: { flex: 1, padding: spacing.xl, marginTop: spacing.lg },
    formTitle: { fontSize: 24, fontWeight: '900', color: colors.text, marginBottom: spacing.xl, fontFamily: typography.fontHeadline },

    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.lg, marginBottom: spacing.md, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 16 : 6, ...shadow.slight },
    inputIcon: { marginRight: spacing.sm },
    input: { flex: 1, fontSize: 16, color: colors.text },

    loginBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: radius.pill, marginTop: spacing.md, ...shadow.sm },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    switchBtn: { alignItems: 'center', marginTop: spacing.xxl, padding: spacing.md },
    switchBtnText: { fontSize: 14, color: colors.muted, fontWeight: '600' }
});
