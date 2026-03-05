import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function NotificationScreen() {
    const { colors, isDark } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return { name: 'check-circle-outline', color: '#10b981' };
            case 'warning': return { name: 'alert-outline', color: '#f59e0b' };
            case 'danger': return { name: 'alert-octagon-outline', color: '#ef4444' };
            default: return { name: 'bell-outline', color: colors.primary };
        }
    };

    const renderItem = ({ item }) => {
        const icon = getIcon(item.type);
        return (
            <Pressable
                style={[
                    styles.notificationCard,
                    { backgroundColor: colors.surface, borderColor: item.is_read ? colors.border : colors.primary + '30' }
                ]}
                onPress={() => !item.is_read && markAsRead(item.id)}
            >
                <View style={[styles.iconBox, { backgroundColor: icon.color + '15' }]}>
                    <MaterialCommunityIcons name={icon.name} size={22} color={icon.color} />
                </View>
                <View style={styles.contentBox}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.typeText, { color: colors.textMuted }]}>{item.type?.toUpperCase() || 'UPDATE'}</Text>
                        <Text style={[styles.dateText, { color: colors.textMuted }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text style={[
                        styles.messageText,
                        { color: colors.textMain },
                        !item.is_read && styles.unreadText
                    ]}>
                        {item.message}
                    </Text>
                </View>
                {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </Pressable>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.textMain }]}>Inbox</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        {notifications.filter(n => !n.is_read).length} unread updates
                    </Text>
                </View>
                {notifications.some(n => !n.is_read) && (
                    <Pressable onPress={markAllRead} style={[styles.markAllBtn, { borderColor: colors.border }]}>
                        <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
                    </Pressable>
                )}
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="bell-off-outline" size={64} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>All caught up!</Text>
                        <Text style={[styles.emptySub, { color: colors.textMuted }]}>Your notifications will appear here.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    subtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5 },
    markAllText: { fontSize: 12, fontWeight: '800' },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        borderWidth: 1.5,
        alignItems: 'center'
    },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    contentBox: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    typeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    dateText: { fontSize: 10, fontWeight: '600' },
    messageText: { fontSize: 14, lineHeight: 20, opacity: 0.8 },
    unreadText: { opacity: 1, fontWeight: '700' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 12 },

    emptyContainer: { padding: 60, alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 18, fontWeight: '800', marginTop: 16 },
    emptySub: { fontSize: 14, fontWeight: '500', marginTop: 8, textAlign: 'center' }
});
