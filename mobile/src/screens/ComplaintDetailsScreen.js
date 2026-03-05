import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Alert, Pressable, Share, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api, { BASE_URL } from '../services/api';

const { width } = Dimensions.get('window');

export default function ComplaintDetailsScreen({ route, navigation }) {
    const { id } = route.params;
    const { colors, isDark } = useTheme();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`complaints/${id}`);
                setComplaint(res.data);
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'We could not retrieve the details for this report.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this civic issue on JanSoochna: ${complaint.title}\nhttps://jansoochna.app/reports/${complaint.id}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="small" color={colors.primary} />
        </View>
    );

    if (!complaint) return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.errorText, { color: colors.textMuted }]}>Report not found</Text>
        </View>
    );

    const imageUrl = complaint.image_url ? `http${BASE_URL.includes('://') ? BASE_URL.split('://')[0] : 'http'}://${BASE_URL.split('://')[1].split(':')[0]}:4000/${complaint.image_url}` : null;

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
            {complaint.image_url ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUrl?.replace('/api', '') }} style={styles.heroImage} resizeMode="cover" />
                    <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </Pressable>
                </View>
            ) : (
                <View style={[styles.headerSpacer, { backgroundColor: colors.primary + '10' }]} />
            )}

            <View style={[styles.content, { marginTop: complaint.image_url ? -30 : 0 }]}>
                <View style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: complaint.status === 'resolved' ? '#10b98115' : colors.primary + '15' }]}>
                            <Text style={[styles.statusText, { color: complaint.status === 'resolved' ? '#10b981' : colors.primary }]}>
                                {complaint.status.replace('_', ' ').toUpperCase()}
                            </Text>
                        </View>
                        <Pressable style={[styles.shareBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={handleShare}>
                            <MaterialCommunityIcons name="share-variant-outline" size={20} color={colors.textMain} />
                        </Pressable>
                    </View>

                    <Text style={[styles.title, { color: colors.textMain }]}>{complaint.title}</Text>

                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={16} color={colors.textMuted} />
                            <Text style={[styles.metaText, { color: colors.textMuted }]}>{new Date(complaint.created_at).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="account-outline" size={16} color={colors.textMuted} />
                            <Text style={[styles.metaText, { color: colors.textMuted }]}>{complaint.reporter?.name || 'Citizen'}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="tag-outline" size={16} color={colors.textMuted} />
                            <Text style={[styles.metaText, { color: colors.textMuted }]}>{complaint.category?.name || 'General'}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Details</Text>
                    <Text style={[styles.description, { color: colors.textMain }]}>{complaint.description}</Text>

                    {complaint.ai_summary && (
                        <View style={[styles.aiBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                            <View style={styles.aiHeader}>
                                <MaterialCommunityIcons name="robot-outline" size={18} color={colors.primary} />
                                <Text style={[styles.aiTitle, { color: colors.primary }]}>AI Intelligence</Text>
                            </View>
                            <Text style={[styles.aiContent, { color: colors.textMain }]}>
                                {complaint.ai_summary.summary || 'Prioritizing this issue based on high community impact metrics.'}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.impactCard, { backgroundColor: isDark ? colors.background : '#f8fafc', borderColor: colors.border }]}>
                        <View>
                            <Text style={[styles.impactLabel, { color: colors.textMuted }]}>Citizen Impact Score</Text>
                            <Text style={[styles.impactSub, { color: colors.textMuted }]}>Based on location and frequency</Text>
                        </View>
                        <Text style={[styles.impactValue, { color: colors.primary }]}>{Math.round(complaint.priority_score || 0)}</Text>
                    </View>
                </View>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { marginTop: 12, fontSize: 16, fontWeight: '700' },

    imageContainer: { width: '100%', height: 350, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    backBtn: { position: 'absolute', top: 60, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    headerSpacer: { width: '100%', height: 120 },

    content: { paddingHorizontal: 20 },
    mainCard: { borderRadius: 32, padding: 24, borderWidth: 1.5, elevation: 0 },

    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    shareBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },

    title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, lineHeight: 32 },

    metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 20 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 13, fontWeight: '600' },

    divider: { height: 1.5, width: '100%', marginVertical: 24, opacity: 0.5 },

    sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, marginBottom: 12 },
    description: { fontSize: 15, lineHeight: 24, fontWeight: '500', opacity: 0.8 },

    aiBox: { marginTop: 24, padding: 20, borderRadius: 24, borderLeftWidth: 6 },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    aiTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    aiContent: { fontSize: 14, fontWeight: '600', lineHeight: 20 },

    impactCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: 20, borderRadius: 24, borderWidth: 1.5 },
    impactLabel: { fontSize: 15, fontWeight: '800' },
    impactSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
    impactValue: { fontSize: 32, fontWeight: '900' }
});
