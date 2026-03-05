import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();
    const [stats, setStats] = useState({ reported: 0, resolved: 0, points: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('auth/me');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const MenuItem = ({ icon, title, subtitle, onPress, color = colors.textMain, showArrow = true }) => (
        <Pressable
            style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onPress}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
                <MaterialCommunityIcons name={icon} size={22} color={color} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: colors.textMain }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
            </View>
            {showArrow && <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />}
        </Pressable>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{user?.name || 'User Name'}</Text>
                    <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email || 'user@example.com'}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>{stats.points}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Points</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>{stats.reported}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reports</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>{stats.resolved}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Resolved</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.textMain, marginTop: 24 }]}>Account Settings</Text>
                <MenuItem
                    icon="shield-check-outline"
                    title="Verification Status"
                    subtitle="Your account is fully verified"
                    color={colors.success}
                    onPress={() => Alert.alert('Verification', 'Your account identity is verified.')}
                />
                <MenuItem
                    icon="bell-outline"
                    title="Notification Preferences"
                    subtitle="Push, Email & SMS"
                    onPress={() => Alert.alert('Notifications', 'Notification settings will be available soon.')}
                />

                <Text style={[styles.sectionTitle, { color: colors.textMain, marginTop: 24 }]}>Support</Text>
                <MenuItem
                    icon="help-circle-outline"
                    title="Help Center"
                    subtitle="FAQs and community support"
                    onPress={() => Alert.alert('Help Center', 'Redirecting to support portal...')}
                />
                <MenuItem
                    icon="information-outline"
                    title="About JanSoochna"
                    subtitle="Version 2.4.0 (Enhanced)"
                    onPress={() => Alert.alert('About', 'JanSoochna - A platform for civic transparency.')}
                />

                <Pressable
                    style={[styles.logoutBtn, { borderColor: colors.danger + '30' }]}
                    onPress={logout}
                >
                    <MaterialCommunityIcons name="logout-variant" size={20} color={colors.danger} />
                    <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
                </Pressable>

                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                    Designed for transparency and efficiency.
                </Text>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
    profileCard: { borderRadius: 32, padding: 32, alignItems: 'center', borderWidth: 1.5, elevation: 0 },
    avatarContainer: { width: 84, height: 84, borderRadius: 42, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
    userName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
    userEmail: { fontSize: 14, fontWeight: '600', marginTop: 4 },

    statsRow: { flexDirection: 'row', marginTop: 32, width: '100%', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '900' },
    statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 },
    statDivider: { width: 1, height: 30, opacity: 0.5 },

    content: { paddingHorizontal: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, marginTop: 8 },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1.5,
        marginBottom: 12
    },
    menuIconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuTextContainer: { flex: 1 },
    menuTitle: { fontSize: 16, fontWeight: '700' },
    menuSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1.5,
        marginTop: 32,
        gap: 8
    },
    logoutText: { fontSize: 15, fontWeight: '800' },
    footerText: { textAlign: 'center', marginTop: 32, fontSize: 12, fontWeight: '600' }
});
