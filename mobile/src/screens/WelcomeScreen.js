import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const { signIn } = useAuth();
    const { colors, isDark } = useTheme();

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('auth/login', { email, password });
            const { token, user } = res.data;
            await signIn(token, user);
        } catch (err) {
            console.error(err);
            Alert.alert('Login Failed', err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            pagingEnabled
            vertical
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: colors.background }}
        >
            {/* PAGE 1: LIVE LANDING */}
            <View style={[styles.page, { backgroundColor: colors.background }]}>
                <SafeAreaView style={styles.heroContent}>
                    <View style={styles.topSection}>
                        <View style={[styles.shieldIcon, { backgroundColor: colors.primary }]}>
                            <MaterialCommunityIcons name="shield-check" size={32} color="#fff" />
                        </View>
                        <Text style={[styles.brandText, { color: colors.textMain }]}>JanSoochna</Text>
                        <Text style={[styles.tagline, { color: colors.textMuted }]}>GOVERNMENT SERVICES APP</Text>
                    </View>

                    <View style={styles.centerSection}>
                        <Text style={[styles.heroTitle, { color: colors.textMain }]}>
                            Helping you,{"\n"}
                            <Text style={{ color: colors.primary }}>every day.</Text>
                        </Text>
                        <Text style={[styles.heroDescription, { color: colors.textMuted }]}>
                            A simple way to report issues, track progress, and access government transparency data.
                        </Text>

                        <View style={styles.featureGrid}>
                            <View style={styles.featureItem}>
                                <MaterialCommunityIcons name="zap" size={24} color={colors.primary} />
                                <View>
                                    <Text style={[styles.featureTitle, { color: colors.textMain }]}>Fast Reporting</Text>
                                    <Text style={[styles.featureSub, { color: colors.textMuted }]}>Send your issues directly to officers</Text>
                                </View>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialCommunityIcons name="trophy" size={24} color={colors.primary} />
                                <View>
                                    <Text style={[styles.featureTitle, { color: colors.textMain }]}>Top Citizens</Text>
                                    <Text style={[styles.featureSub, { color: colors.textMuted }]}>See active members in your area</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomSection}>
                        <MaterialCommunityIcons name="chevron-double-up" size={32} color={colors.primary} style={styles.bounceAnimate} />
                        <Text style={[styles.scrollText, { color: colors.textMuted }]}>SCROLL UP TO LOGIN</Text>
                    </View>
                </SafeAreaView>
            </View>

            {/* PAGE 2: AUTH TERMINAL */}
            <View style={[styles.page, { backgroundColor: colors.background }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, width: '100%' }}
                >
                    <ScrollView contentContainerStyle={styles.authScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.authHeader}>
                            <View style={[styles.terminalBadge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                                <View style={[styles.pulseDot, { backgroundColor: '#10b981' }]} />
                                <Text style={[styles.terminalText, { color: colors.textMain }]}>SECURE ACCESS</Text>
                            </View>
                            <Text style={[styles.authTitle, { color: colors.textMain }]}>User Login</Text>
                            <Text style={[styles.authSubtitle, { color: colors.textMuted }]}>
                                Enter your details to access your account.
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textMain }]}
                                        placeholder="yourname@example.com"
                                        placeholderTextColor={colors.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textMuted} />
                                    <TextInput
                                        style={[styles.input, { color: colors.textMain }]}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <Pressable
                                style={[styles.loginBtn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Text style={styles.loginBtnText}>Login Now</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                                    </>
                                )}
                            </Pressable>

                            <View style={styles.authFooter}>
                                <Text style={[styles.footerText, { color: colors.textMuted }]}>New user? </Text>
                                <Pressable onPress={() => navigation.navigate('Signup')}>
                                    <Text style={[styles.linkText, { color: colors.primary }]}>Register Now</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {
        height: height,
        width: width,
        paddingHorizontal: 24,
    },
    // Hero Styles
    heroContent: { flex: 1, justifyContent: 'space-between', paddingVertical: 40 },
    topSection: { alignItems: 'center', marginTop: 20 },
    shieldIcon: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    brandText: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
    tagline: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 4 },

    centerSection: { paddingVertical: 40 },
    heroTitle: { fontSize: 48, fontWeight: '900', letterSpacing: -2, lineHeight: 52 },
    heroDescription: { fontSize: 16, lineHeight: 26, fontWeight: '500', marginTop: 20, maxWidth: width * 0.8 },

    featureGrid: { marginTop: 40, gap: 24 },
    featureItem: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    featureTitle: { fontSize: 16, fontWeight: '800' },
    featureSub: { fontSize: 13, fontWeight: '500' },

    bottomSection: { alignItems: 'center', marginBottom: 40 },
    scrollText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginTop: 12 },
    bounceAnimate: { marginTop: 10 },

    // Auth Styles
    authScroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
    authHeader: { marginBottom: 40 },
    terminalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1.5,
        marginBottom: 20
    },
    pulseDot: { width: 6, height: 6, borderRadius: 3 },
    terminalText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    authTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    authSubtitle: { fontSize: 15, fontWeight: '500', marginTop: 12, lineHeight: 22 },

    form: { width: '100%' },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 64, borderRadius: 20, borderWidth: 1.5, gap: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },

    loginBtn: {
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 10,
        elevation: 0
    },
    loginBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

    authFooter: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: 14, fontWeight: '600' },
    linkText: { fontSize: 14, fontWeight: '800' }
});
