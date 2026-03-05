import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Dimensions, Pressable, Text } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const initialRegion = {
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    const { socket } = useSocket();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await api.get('complaints');
                setComplaints(res.data.filter(c => c.latitude && c.longitude));
            } catch (err) {
                console.error(err);
                Alert.alert('Network Error', 'Check your connection to load live map data.');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();

        if (socket) {
            socket.on('complaint:created', (newComplaint) => {
                if (newComplaint.latitude && newComplaint.longitude) {
                    setComplaints(prev => [newComplaint, ...prev]);
                }
            });
        }

        return () => {
            if (socket) socket.off('complaint:created');
        };
    }, [socket]);

    if (loading) return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="small" color={colors.primary} />
        </View>
    );

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                customMapStyle={isDark ? darkMapStyle : []}
                showsUserLocation
                showsMyLocationButton={false}
            >
                {complaints.map(c => (
                    <Marker
                        key={c.id}
                        coordinate={{ latitude: parseFloat(c.latitude), longitude: parseFloat(c.longitude) }}
                    >
                        <View style={[styles.marker, { backgroundColor: colors.surface, borderColor: c.status === 'resolved' ? '#10b981' : colors.danger }]}>
                            <MaterialCommunityIcons
                                name={c.status === 'resolved' ? "check-decagram" : "alert-rhombus"}
                                size={20}
                                color={c.status === 'resolved' ? '#10b981' : colors.danger}
                            />
                        </View>
                        <Callout tooltip onPress={() => navigation.navigate('Details', { id: c.id })}>
                            <View style={[styles.callout, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.calloutTitle, { color: colors.textMain }]}>{c.title}</Text>
                                <View style={styles.calloutFooter}>
                                    <Text style={[styles.calloutBtnText, { color: colors.primary }]}>View Details</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={14} color={colors.primary} />
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.hudTop}>
                <View style={[styles.hudBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.hudLabel, { color: colors.textMain }]}>Live Hazard Feed</Text>
                </View>
            </View>

            <Pressable
                style={[styles.backFab, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.goBack()}
            >
                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
            </Pressable>
        </View>
    );
}

const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: width, height: height },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    marker: { width: 36, height: 36, borderRadius: 12, borderSize: 2, borderWidth: 2, justifyContent: 'center', alignItems: 'center', elevation: 4 },

    callout: { padding: 12, borderRadius: 16, borderWidth: 1.5, minWidth: 160 },
    calloutTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
    calloutFooter: { flexDirection: 'row', alignItems: 'center' },
    calloutBtnText: { fontSize: 11, fontWeight: '800', marginRight: 4 },

    hudTop: { position: 'absolute', top: 60, width: '100%', alignItems: 'center' },
    hudBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, elevation: 6 },
    liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    hudLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

    backFab: { position: 'absolute', bottom: 32, left: 24, width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, elevation: 4 }
});
