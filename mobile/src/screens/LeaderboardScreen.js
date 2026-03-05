import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Dimensions, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function LeaderboardScreen() {
    const { colors, isDark } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('gamification/leaderboard');
                setUsers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="small" color={colors.primary} />
        </View>
    );

    const renderItem = ({ item, index }) => {
        const rank = index + 4;
        return (
            <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.rankBadge, { backgroundColor: colors.background }]}>
                    <Text style={[styles.rankText, { color: colors.textMain }]}>{rank}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{item.name}</Text>
                    <Text style={[styles.userSquad, { color: colors.textMuted }]}>{item.rank || 'Citizen Helper'}</Text>
                </View>
                <View style={styles.pointsBox}>
                    <Text style={[styles.pointsText, { color: colors.primary }]}>{item.points}</Text>
                    <Text style={[styles.ptsLabel, { color: colors.textMuted }]}>POINTS</Text>
                </View>
            </View>
        );
    };

    const top3 = users.slice(0, 3);
    const others = users.slice(3);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.podiumContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <View style={styles.podium}>
                    {top3[1] && (
                        <View style={styles.podiumItem}>
                            <View style={[styles.podiumAvatar, { borderColor: '#94a3b8' }]}>
                                <Text style={styles.podiumInitial}>{top3[1].name.charAt(0)}</Text>
                                <View style={[styles.crownBadge, { backgroundColor: '#94a3b8' }]}>
                                    <Text style={styles.crownText}>2</Text>
                                </View>
                            </View>
                            <Text style={[styles.podiumName, { color: colors.textMain }]} numberOfLines={1}>{top3[1].name}</Text>
                            <Text style={[styles.podiumPts, { color: colors.textMuted }]}>{top3[1].points} pts</Text>
                        </View>
                    )}
                    {top3[0] && (
                        <View style={[styles.podiumItem, styles.podiumFirst]}>
                            <View style={[styles.podiumAvatar, { width: 90, height: 90, borderRadius: 45, borderColor: '#f59e0b', borderWidth: 4 }]}>
                                <Text style={[styles.podiumInitial, { fontSize: 32 }]}>{top3[0].name.charAt(0)}</Text>
                                <View style={[styles.crownBadge, { backgroundColor: '#f59e0b', top: -12, width: 32, height: 32, borderRadius: 16 }]}>
                                    <MaterialCommunityIcons name="crown" size={18} color="#fff" />
                                </View>
                            </View>
                            <Text style={[styles.podiumName, { color: colors.textMain, fontSize: 16 }]} numberOfLines={1}>{top3[0].name}</Text>
                            <Text style={[styles.podiumPts, { color: colors.primary, fontWeight: '900' }]}>{top3[0].points} pts</Text>
                        </View>
                    )}
                    {top3[2] && (
                        <View style={styles.podiumItem}>
                            <View style={[styles.podiumAvatar, { borderColor: '#b45309' }]}>
                                <Text style={styles.podiumInitial}>{top3[2].name.charAt(0)}</Text>
                                <View style={[styles.crownBadge, { backgroundColor: '#b45309' }]}>
                                    <Text style={styles.crownText}>3</Text>
                                </View>
                            </View>
                            <Text style={[styles.podiumName, { color: colors.textMain }]} numberOfLines={1}>{top3[2].name}</Text>
                            <Text style={[styles.podiumPts, { color: colors.textMuted }]}>{top3[2].points} pts</Text>
                        </View>
                    )}
                </View>
            </View>

            <FlatList
                data={others}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<Text style={[styles.listHeader, { color: colors.textMuted }]}>Top Contributors</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    podiumContainer: { paddingBottom: 32, paddingTop: 40, borderBottomWidth: 1.5 },
    podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12 },
    podiumItem: { alignItems: 'center', width: width / 4 },
    podiumFirst: { marginBottom: 15 },
    podiumAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 12
    },
    podiumInitial: { fontSize: 24, fontWeight: '900', color: '#64748b' },
    crownBadge: {
        position: 'absolute',
        top: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4
    },
    crownText: { color: '#fff', fontSize: 12, fontWeight: '900' },
    podiumName: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
    podiumPts: { fontSize: 11, fontWeight: '700', marginTop: 2 },

    list: { padding: 20 },
    listHeader: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
    userCard: {
        flexDirection: 'row',
        padding: 18,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1.5
    },
    rankBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rankText: { fontSize: 14, fontWeight: '900' },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '800' },
    userSquad: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    pointsBox: { alignItems: 'flex-end' },
    pointsText: { fontSize: 18, fontWeight: '900' },
    ptsLabel: { fontSize: 9, fontWeight: '800', marginTop: 2 }
});
