import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Dimensions, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, sub, icon, color, colors }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{title}</Text>
            <Text style={[styles.statValue, { color: colors.textMain }]}>{value}</Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>{sub}</Text>
        </View>
    </View>
);

const MetricRow = ({ label, percentage, color, colors }) => (
    <View style={styles.metricRow}>
        <View style={styles.metricInfo}>
            <Text style={[styles.metricLabel, { color: colors.textMain }]}>{label}</Text>
            <Text style={[styles.metricValue, { color }]}>{percentage}%</Text>
        </View>
        <View style={[styles.metricBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.metricBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
    </View>
);

export default function TransparencyScreen() {
    const { colors, isDark } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await api.get('analytics/public');
            setData(res.data);
        } catch (err) {
            console.error('Transparency fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Updating Civic Data...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.headerSmall, { color: colors.primary }]}>Live Insights</Text>
                <Text style={[styles.headerLarge, { color: colors.textMain }]}>Transparency Portal</Text>
                <Text style={[styles.headerSub, { color: colors.textMuted }]}>
                    Open government metrics verified by community members.
                </Text>
            </View>

            <View style={styles.grid}>
                <StatCard
                    title="Citizens"
                    value={data?.totalUsers || 0}
                    sub="Active Participants"
                    icon="account-group-outline"
                    color={colors.primary}
                    colors={colors}
                />
                <StatCard
                    title="Resolution"
                    value={`${data?.resolvedPercentage || 0}%`}
                    sub="Average Efficacy"
                    icon="shield-check-outline"
                    color="#10b981"
                    colors={colors}
                />
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Resolution Pipeline</Text>
                    <MaterialCommunityIcons name="chart-timeline-variant" size={20} color={colors.textMuted} />
                </View>

                <MetricRow
                    label="Resolved Issues"
                    percentage={Math.round((data?.complaintsByStatus?.find(s => s.status === 'resolved')?.count / data?.totalComplaints) * 100) || 0}
                    color="#10b981"
                    colors={colors}
                />
                <MetricRow
                    label="In Progress"
                    percentage={Math.round((data?.complaintsByStatus?.find(s => s.status === 'in_progress')?.count / data?.totalComplaints) * 100) || 0}
                    color={colors.primary}
                    colors={colors}
                />
                <MetricRow
                    label="Under Review"
                    percentage={Math.round((data?.complaintsByStatus?.find(s => s.status === 'open')?.count / data?.totalComplaints) * 100) || 0}
                    color="#ef4444"
                    colors={colors}
                />
            </View>

            <View style={[styles.infoBanner, { backgroundColor: isDark ? colors.surface : '#1e293b' }]}>
                <MaterialCommunityIcons name="information-outline" size={24} color="#fff" />
                <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Data Integrity</Text>
                    <Text style={styles.infoText}>
                        This dashboard presents live, unedited data directly from our civic engagement engine.
                    </Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

    header: { paddingHorizontal: 20, paddingTop: 40, marginBottom: 24 },
    headerSmall: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
    headerLarge: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    headerSub: { fontSize: 15, fontWeight: '500', lineHeight: 22, marginTop: 8 },

    grid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
    statCard: { flex: 1, padding: 20, borderRadius: 28, borderWidth: 1.5 },
    statIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    statValue: { fontSize: 24, fontWeight: '900', marginVertical: 2 },
    statSub: { fontSize: 11, fontWeight: '600' },

    section: { marginHorizontal: 20, padding: 24, borderRadius: 32, borderWidth: 1.5, marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },

    metricRow: { marginBottom: 20 },
    metricInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    metricLabel: { fontSize: 14, fontWeight: '700' },
    metricValue: { fontSize: 14, fontWeight: '900' },
    metricBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    metricBarFill: { height: '100%', borderRadius: 4 },

    infoBanner: { marginHorizontal: 20, padding: 24, borderRadius: 28, flexDirection: 'row', gap: 16, alignItems: 'center' },
    infoContent: { flex: 1 },
    infoTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
    infoText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500', marginTop: 4, lineHeight: 18 }
});
