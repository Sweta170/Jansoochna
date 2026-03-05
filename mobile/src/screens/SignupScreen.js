import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function SignupScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('auth/register', { name, email, password, role: 'citizen' });
            Alert.alert(
                'Account Created',
                'You can now sign in with your credentials.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (err) {
            console.error(err);
            Alert.alert('Signup Failed', err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="shield-crown-outline" size={28} color="#fff" />
                    </View>
                    <Text style={[styles.title, { color: colors.textMain }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Join thousands of citizens making a real difference.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="account-outline" size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.textMain }]}
                                placeholder="John Doe"
                                placeholderTextColor={colors.textMuted}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.textMain }]}
                                placeholder="name@example.com"
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
                        style={[styles.button, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Get Started</Text>
                        )}
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account? </Text>
                        <Pressable onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: 32, justifyContent: 'center' },
    header: { marginBottom: 32, alignItems: 'center' },
    logoBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
    subtitle: { fontSize: 15, fontWeight: '500', textAlign: 'center', marginTop: 8, lineHeight: 22 },

    form: { width: '100%' },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 60, borderRadius: 20, borderWidth: 1.5, gap: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },

    button: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    buttonText: { fontSize: 17, fontWeight: '800', color: '#fff' },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: 14, fontWeight: '600' },
    linkText: { fontSize: 14, fontWeight: '800' }
});
