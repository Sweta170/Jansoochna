import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Alert, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const EmergencyCard = ({ title, number, icon, color, colors }) => (
    <Pressable
        style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => Linking.openURL(`tel:${number}`)}
    >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <View style={styles.cardInfo}>
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>{title}</Text>
            <Text style={[styles.cardNumber, { color: colors.textMain }]}>{number}</Text>
        </View>
        <View style={[styles.callBtn, { backgroundColor: color }]}>
            <MaterialCommunityIcons name="phone" size={18} color="#fff" />
        </View>
    </Pressable>
);

export default function EmergencyScreen() {
    const { colors, isDark } = useTheme();

    const handleSOS = () => {
        Alert.alert(
            "SOS Emergency Signal",
            "This will broadcast your location and alert emergency services. Proceed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "YES, SEND SOS",
                    style: "destructive",
                    onPress: () => Alert.alert("Signal Sent", "Your SOS signal has been broadcasted to the nearest control room.")
                }
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textMain }]}>Emergency Center</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Instant access to life-saving services.</Text>
            </View>

            <View style={styles.sosContainer}>
                <View style={[styles.pulseCircle, { borderColor: colors.danger + '20' }]} />
                <View style={[styles.pulseCircle, { width: 220, height: 220, borderRadius: 110, borderColor: colors.danger + '40' }]} />
                <Pressable style={styles.sosButton} onPress={handleSOS}>
                    <View style={[styles.sosOuter, { backgroundColor: colors.danger + '15' }]}>
                        <View style={[styles.sosInner, { backgroundColor: colors.danger }]}>
                            <MaterialCommunityIcons name="broadcast" size={40} color="#fff" />
                            <Text style={styles.sosText}>SOS</Text>
                        </View>
                    </View>
                </Pressable>
                <Text style={[styles.sosLabel, { color: colors.textMain }]}>Press for Help</Text>
                <Text style={[styles.sosSub, { color: colors.danger }]}>Emergency Response Active</Text>
            </View>

            <View style={styles.contactsSection}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Direct Contacts</Text>
                <EmergencyCard title="Police Response" number="100" icon="shield-account" color="#ef4444" colors={colors} />
                <EmergencyCard title="Medical Emergency" number="102" icon="ambulance" color="#10b981" colors={colors} />
                <EmergencyCard title="Fire Department" number="101" icon="fire" color="#f59e0b" colors={colors} />
                <EmergencyCard title="Women Safety" number="1091" icon="account-tie-voice" color="#6366f1" colors={colors} />
            </View>

            <View style={[styles.safetyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={[styles.safetyTitle, { color: colors.textMain }]}>Community Safety</Text>
                    <Text style={[styles.safetyText, { color: colors.textMuted }]}>
                        Record and report hazards like open manholes directly from the home screen to help your neighbors.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 40, marginBottom: 30 },
    title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    subtitle: { fontSize: 15, fontWeight: '500', marginTop: 4 },

    sosContainer: { alignItems: 'center', height: 320, justifyContent: 'center' },
    pulseCircle: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 2,
    },
    sosButton: { elevation: 8, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15 },
    sosOuter: { width: 170, height: 170, borderRadius: 85, justifyContent: 'center', alignItems: 'center' },
    sosInner: { width: 130, height: 130, borderRadius: 65, justifyContent: 'center', alignItems: 'center', gap: 4 },
    sosText: { color: '#fff', fontSize: 24, fontWeight: '900' },
    sosLabel: { fontSize: 18, fontWeight: '800', marginTop: 20 },
    sosSub: { fontSize: 13, fontWeight: '800', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },

    contactsSection: { paddingHorizontal: 24, marginTop: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1.5 },
    iconContainer: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    cardInfo: { flex: 1, marginLeft: 16 },
    cardLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    cardNumber: { fontSize: 22, fontWeight: '900', marginTop: 1 },
    callBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

    safetyCard: { marginHorizontal: 24, padding: 24, borderRadius: 28, borderWidth: 1.5, flexDirection: 'row', alignItems: 'flex-start', marginTop: 20 },
    safetyTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
    safetyText: { fontSize: 13, fontWeight: '500', lineHeight: 20 }
});
