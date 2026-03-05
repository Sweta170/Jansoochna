import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import api from '../services/api';

export const registerForPushNotificationsAsync = async () => {
    // Expo Go for SDK 53+ doesn't support remote push notifications.
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
        console.warn('[NotificationService] Skipping push token registration in Expo Go (SDK 53+ limitation).');
        return null;
    }

    // Dynamic require to avoid crash on import
    const Notifications = require('expo-notifications');

    let token;

    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        } catch (e) {
            console.warn('Failed to set notification channel:', e.message);
        }
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Handle Expo Project ID for newer versions of Expo
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

        try {
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('Push Token:', token);
        } catch (e) {
            console.warn('Push registration failed:', e.message);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
};

export const updatePushTokenOnServer = async (token) => {
    if (!token) return;
    try {
        await api.post('/auth/push-token', { token });
    } catch (error) {
        console.error('Failed to update push token on server', error);
    }
};

export default {
    registerForPushNotificationsAsync,
    updatePushTokenOnServer
};
