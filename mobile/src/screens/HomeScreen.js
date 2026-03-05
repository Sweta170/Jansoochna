import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable, RefreshControl, Image, Dimensions, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();
    const { isConnected: isNetworkConnected, queueSize, isSyncing, syncNow } = useOffline();
    const { socket, isConnected: isSocketConnected } = useSocket();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ total: 0, resolved: 0 });

    const fetchStats = async () => {
        try {
            const res = await api.get('analytics/public');
            setStats({
                total: res.data.totalComplaints || 0,
                resolved: res.data.resolvedPercentage || 0
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchComplaints = async () => {
        try {
            const res = await api.get('complaints');
            setComplaints(res.data);
        } catch (err) {
            console.error('Failed to fetch complaints:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchComplaints();
        fetchStats();
    };

    const renderCard = ({ item }) => (
        <Pressable
            style={[styles.complaintCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ComplaintDetails', { id: item.id })}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.statusChip, { backgroundColor: item.status === 'resolved' ? '#10b98120' : '#ef444420' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'resolved' ? '#10b981' : '#ef4444' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <Text style={[styles.complaintTitle, { color: colors.textMain }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.complaintDesc, { color: colors.textMuted }]} numberOfLines={2}>{item.description}</Text>
        </Pressable>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Citizen Terminal Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.headerContent}>
                    <View style={styles.brandGroup}>
                        <View style={[styles.shieldIcon, { backgroundColor: colors.primary }]}>
                            <MaterialCommunityIcons name="shield-check" size={18} color="#fff" />
                        </View>
                        <View>
                            <Text style={[styles.welcomeText, { color: colors.textMain }]}>JanSoochna</Text>
                            <View style={styles.statusRow}>
                                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                <Text style={[styles.subText, { color: colors.textMuted }]}>APP ONLINE</Text>
                            </View>
                        </View>
                    </View>
                    <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.headerAction}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textMain} />
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={complaints}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListHeaderComponent={
                    <View style={styles.headerComponent}>
                        {/* Command Overview */}
                        <View style={styles.overviewSection}>
                            <Text style={styles.overviewTitle}>My Dashboard</Text>
                            <Text style={[styles.overviewSubtitle, { color: colors.textMuted }]}>
                                User: <Text style={{ color: colors.textMain, fontWeight: '700' }}>{user?.name || 'Citizen'}</Text> • Status: <Text style={{ color: '#10b981', fontWeight: '700' }}>Active</Text>
                            </Text>
                        </View>

                        {/* Emergency Banner */}
                        <Pressable
                            style={[styles.emergencyBanner, { backgroundColor: '#ef4444' }]}
                            onPress={() => navigation.navigate('Emergency')}
                        >
                            <MaterialCommunityIcons name="alert-decagram" size={24} color="#fff" />
                            <Text style={styles.emergencyText}>EMERGENCY HELPLINE</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
                        </Pressable>

                        {/* Grid System */}
                        <View style={styles.gridContainer}>
                            <View style={styles.gridRow}>
                                <Pressable
                                    style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => navigation.navigate('Report')}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                        <MaterialCommunityIcons name="file-document-edit-outline" size={24} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.gridTitle, { color: colors.textMain }]}>File Complaint</Text>
                                    <Text style={[styles.gridSub, { color: colors.textMuted }]}>Report an issue</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => navigation.navigate('Leaderboard')}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: '#f59e0b15' }]}>
                                        <MaterialCommunityIcons name="trophy-outline" size={24} color="#f59e0b" />
                                    </View>
                                    <Text style={[styles.gridTitle, { color: colors.textMain }]}>Top Citizens</Text>
                                    <Text style={[styles.gridSub, { color: colors.textMuted }]}>Active members</Text>
                                </Pressable>
                            </View>

                            <View style={styles.gridRow}>
                                <Pressable
                                    style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => navigation.navigate('Transparency')}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: '#10b98115' }]}>
                                        <MaterialCommunityIcons name="chart-box-outline" size={24} color="#10b981" />
                                    </View>
                                    <Text style={[styles.gridTitle, { color: colors.textMain }]}>Statistics</Text>
                                    <Text style={[styles.gridSub, { color: colors.textMuted }]}>Transparency data</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.gridCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => navigation.navigate('Services')}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: '#6366f115' }]}>
                                        <MaterialCommunityIcons name="view-grid-outline" size={24} color="#6366f1" />
                                    </View>
                                    <Text style={[styles.gridTitle, { color: colors.textMain }]}>Services</Text>
                                    <Text style={[styles.gridSub, { color: colors.textMuted }]}>Government tools</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Dispatch Feed Header */}
                        <View style={styles.feedHeader}>
                            <Text style={[styles.feedTitle, { color: colors.textMain }]}>RECENT UPDATES</Text>
                            <View style={[styles.headerLine, { backgroundColor: colors.border }]} />
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="checkbox-multiple-marked-outline" size={64} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>All Clean!</Text>
                        <Text style={[styles.emptySub, { color: colors.textMuted }]}>No pending issues in your area.</Text>
                    </View>
                }
            />

            <Pressable
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Chat')}
            >
                <MaterialCommunityIcons name="robot-happy" size={28} color="#fff" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 45,
        paddingBottom: 15,
        borderBottomWidth: 1.5,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    shieldIcon: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    welcomeText: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -2 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    subText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    headerAction: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

    headerComponent: { paddingHorizontal: 20, paddingTop: 24 },
    overviewSection: { marginBottom: 24 },
    overviewTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 4 },
    overviewSubtitle: { fontSize: 14, fontWeight: '600' },

    emergencyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        gap: 12
    },
    emergencyText: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

    gridContainer: { gap: 12, marginBottom: 40 },
    gridRow: { flexDirection: 'row', gap: 12 },
    gridCard: { flex: 1, padding: 20, borderRadius: 24, borderWidth: 1.5 },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    gridTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    gridSub: { fontSize: 11, fontWeight: '600' },

    feedHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    feedTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
    headerLine: { flex: 1, height: 1 },

    listContent: { paddingBottom: 100 },
    complaintCard: { marginHorizontal: 20, padding: 20, borderRadius: 24, borderWidth: 1.5, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900' },
    dateText: { fontSize: 11, fontWeight: '600' },
    complaintTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
    complaintDesc: { fontSize: 14, lineHeight: 20, fontWeight: '500' },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    emptyState: { alignItems: 'center', marginTop: 60, padding: 40 },
    emptyText: { fontSize: 18, fontWeight: '800', marginTop: 16 },
    emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8 }
});
