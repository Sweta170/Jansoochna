import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useOffline } from '../context/OfflineContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function ReportScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const { isConnected, addToQueue } = useOffline();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        (async () => {
            const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (camStatus !== 'granted' || locStatus !== 'granted') {
                Alert.alert('Permission Required', 'Camera and GPS permissions help us verify reports accurately.');
            }
        })();
    }, []);

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const getLocation = async () => {
        try {
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        } catch (e) {
            Alert.alert('Location Error', 'Please enable GPS for accurate reporting.');
        }
    };

    const handleTitleChange = async (text) => {
        setTitle(text);
        if (text.length > 5) {
            try {
                const res = await api.post('/ai/predict', { text });
                if (res.data.category?.length > 0) setSuggestion(res.data.category[0].label);
            } catch (e) { }
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !image || !location) {
            Alert.alert('Almost There', 'Please provide a title, description, photo, and GPS location.');
            return;
        }

        setLoading(true);
        try {
            const reportData = {
                title,
                description,
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
                image: image
            };

            if (!isConnected) {
                const queued = await addToQueue(reportData);
                if (queued) {
                    Alert.alert('Saved Locally', 'Report saved. We will sync it when you are back online.');
                    navigation.goBack();
                } else {
                    Alert.alert('Error', 'Failed to save local snapshot.');
                }
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('latitude', location.latitude);
            formData.append('longitude', location.longitude);

            const uriParts = image.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('image', {
                uri: image,
                name: `report.${fileType}`,
                type: `image/${fileType}`,
            });
            formData.append('is_anonymous', isAnonymous.toString());

            await api.post('complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Alert.alert('Report Filed', 'Thank you for contributing to a better community.');
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Submission Error', 'We could not process your report right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textMain }]}>File Report</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Document evidence and location for faster resolution.
                    </Text>
                </View>

                <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Issue Heading</Text>
                        <TextInput
                            style={[styles.input, { color: colors.textMain, backgroundColor: colors.background, borderColor: colors.border }]}
                            placeholder="e.g. Broken streetlight on Park Ave"
                            placeholderTextColor={colors.textMuted}
                            value={title}
                            onChangeText={handleTitleChange}
                        />
                        {suggestion && (
                            <View style={[styles.aiBadge, { backgroundColor: colors.primary + '15' }]}>
                                <Text style={[styles.aiText, { color: colors.primary }]}>🤖 Suggested: {suggestion}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textMuted }]}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { color: colors.textMain, backgroundColor: colors.background, borderColor: colors.border }]}
                            placeholder="Share specific details to help city officials..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.mediaRow}>
                        <Pressable
                            style={[styles.mediaBtn, image && { backgroundColor: '#10b981', borderColor: '#10b981' }, { borderColor: colors.border }]}
                            onPress={takePhoto}
                        >
                            <MaterialCommunityIcons name={image ? "check-circle" : "camera-outline"} size={24} color={image ? "#fff" : colors.textMuted} />
                            <Text style={[styles.mediaText, { color: image ? "#fff" : colors.textMuted }]}>{image ? 'Attached' : 'Photo'}</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.mediaBtn, location && { backgroundColor: colors.primary, borderColor: colors.primary }, { borderColor: colors.border }]}
                            onPress={getLocation}
                        >
                            <MaterialCommunityIcons name={location ? "map-check" : "map-marker-outline"} size={24} color={location ? "#fff" : colors.textMuted} />
                            <Text style={[styles.mediaText, { color: location ? "#fff" : colors.textMuted }]}>{location ? 'Located' : 'GPS'}</Text>
                        </Pressable>
                    </View>

                    {image && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: image }} style={styles.preview} />
                            <Pressable style={styles.removeBtn} onPress={() => setImage(null)}>
                                <MaterialCommunityIcons name="close" size={20} color="#fff" />
                            </Pressable>
                        </View>
                    )}

                    <View style={[styles.switchCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={styles.switchInfo}>
                            <Text style={[styles.switchLabel, { color: colors.textMain }]}>Anonymous Report</Text>
                            <Text style={[styles.switchSub, { color: colors.textMuted }]}>Hide your profile from others.</Text>
                        </View>
                        <Switch
                            value={isAnonymous}
                            onValueChange={setIsAnonymous}
                            trackColor={{ false: colors.border, true: colors.primary + '50' }}
                            thumbColor={isAnonymous ? colors.primary : '#f4f3f4'}
                        />
                    </View>

                    <Pressable
                        style={[styles.submitBtn, { backgroundColor: colors.textMain }, (loading || !title || !image || !location) && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading || !title || !image || !location}
                    >
                        {loading ? <ActivityIndicator color={colors.background} /> : <Text style={[styles.submitBtnText, { color: colors.background }]}>Submit Report</Text>}
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 40 },
    header: { marginBottom: 32 },
    title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    subtitle: { fontSize: 15, fontWeight: '500', marginTop: 8, lineHeight: 22 },

    form: { padding: 24, borderRadius: 32, borderWidth: 1.5 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
    input: { borderRadius: 16, borderSize: 1.5, borderWidth: 1.5, padding: 16, fontSize: 16, fontWeight: '600' },
    textArea: { height: 120, textAlignVertical: 'top' },
    aiBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
    aiText: { fontSize: 12, fontWeight: '800' },

    mediaRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    mediaBtn: { flex: 1, height: 80, borderRadius: 20, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', gap: 4 },
    mediaText: { fontSize: 12, fontWeight: '800' },

    previewContainer: { position: 'relative', marginBottom: 20, borderRadius: 20, overflow: 'hidden' },
    preview: { width: '100%', height: 200 },
    removeBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },

    switchCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1.5, marginBottom: 24 },
    switchInfo: { flex: 1 },
    switchLabel: { fontSize: 14, fontWeight: '800' },
    switchSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },

    submitBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    submitBtnText: { fontSize: 17, fontWeight: '900' }
});
