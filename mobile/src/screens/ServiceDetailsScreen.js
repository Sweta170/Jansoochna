import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ServiceDetailsScreen({ route, navigation }) {
    const { service } = route.params;
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={32} color={colors.textMain} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.textMain }]}>Service Details</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.iconBox, { backgroundColor: service.color + '15' }]}>
                        <MaterialCommunityIcons name={service.icon} size={48} color={service.color} />
                    </View>
                    <Text style={[styles.serviceName, { color: colors.textMain }]}>{service.name}</Text>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>{service.category}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>About Service</Text>
                    <Text style={[styles.description, { color: colors.textMuted }]}>
                        This service allows citizens to apply for or update their {service.name}.
                        Ensure you have all necessary digitized documents ready before proceeding with the application.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Requirements</Text>
                    {[
                        'Proof of Identity (Aadhar/PAN)',
                        'Proof of Address',
                        'Recent Passport Size Photo',
                        'Supporting Documents for ' + service.name
                    ].map((item, index) => (
                        <View key={index} style={styles.requirementItem}>
                            <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                            <Text style={[styles.requirementText, { color: colors.textMain }]}>{item}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Processing Time</Text>
                    <View style={[styles.infoRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.textMain }]}>Estimated: 7-15 Working Days</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Pressable
                    style={[styles.applyButton, { backgroundColor: colors.primary }]}
                    onPress={() => alert('Application flow started for ' + service.name)}
                >
                    <Text style={styles.applyButtonText}>Apply Now</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1.5,
    },
    headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    backButton: { padding: 4 },
    scrollContent: { padding: 20, paddingBottom: 120 },
    heroCard: {
        padding: 30,
        borderRadius: 32,
        borderWidth: 1.5,
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBox: {
        width: 100,
        height: 100,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    serviceName: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
    badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
    badgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, letterSpacing: -0.3 },
    description: { fontSize: 15, lineHeight: 24, fontWeight: '500' },
    requirementItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    requirementText: { fontSize: 15, fontWeight: '600' },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 12
    },
    infoText: { fontSize: 15, fontWeight: '700' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1.5,
    },
    applyButton: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
