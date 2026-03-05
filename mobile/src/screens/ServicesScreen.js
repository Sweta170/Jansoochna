import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ServicesScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const categories = [
        { id: 'All', icon: 'apps' },
        { id: 'Civil', icon: 'account-group' },
        { id: 'Health', icon: 'heart-pulse' },
        { id: 'Edu', icon: 'school' },
        { id: 'Transport', icon: 'bus' }
    ];

    const services = [
        { id: 1, name: 'Birth Certificate', category: 'Civil', icon: 'baby-face-outline', color: '#3b82f6' },
        { id: 2, name: 'Aadhar Update', category: 'Civil', icon: 'fingerprint', color: '#10b981' },
        { id: 3, name: 'Voter ID', category: 'Civil', icon: 'account-check-outline', color: '#f59e0b' },
        { id: 4, name: 'Trade License', category: 'Business', icon: 'briefcase-outline', color: '#6366f1' },
        { id: 5, name: 'Property Tax', category: 'Civil', icon: 'home-city-outline', color: '#ef4444' },
        { id: 6, name: 'Water Connection', category: 'Utility', icon: 'water-outline', color: '#06b6d4' }
    ];

    const filteredServices = services.filter(s =>
        (category === 'All' || s.category === category) &&
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
                    <TextInput
                        placeholder="Search services..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.searchInput, { color: colors.textMain }]}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map(cat => (
                        <Pressable
                            key={cat.id}
                            onPress={() => setCategory(cat.id)}
                            style={[
                                styles.categoryBtn,
                                { backgroundColor: category === cat.id ? colors.primary : colors.surface, borderColor: colors.border }
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={cat.icon}
                                size={18}
                                color={category === cat.id ? '#fff' : colors.textMuted}
                            />
                            <Text style={[
                                styles.categoryText,
                                { color: category === cat.id ? '#fff' : colors.textMain }
                            ]}>
                                {cat.id}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredServices}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Pressable
                        style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('ServiceDetails', { service: item })}
                    >
                        <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                            <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                        </View>
                        <Text style={[styles.serviceName, { color: colors.textMain }]} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <Text style={[styles.serviceCat, { color: colors.textMuted }]}>{item.category}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="selection-search" size={64} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No services found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 60 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
    categoryScroll: { marginTop: 20 },
    categoryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        marginRight: 10,
        borderWidth: 1.5,
        gap: 8
    },
    categoryText: { fontSize: 13, fontWeight: '800' },

    listContent: { padding: 12, paddingBottom: 100 },
    serviceCard: {
        flex: 1,
        margin: 8,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160
    },
    iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    serviceName: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
    serviceCat: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', opacity: 0.7 },

    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, fontWeight: '700', marginTop: 12 }
});
