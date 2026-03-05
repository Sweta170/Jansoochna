import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load stored token and user on app start
        const loadStoredData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');

                if (token) {
                    setUserToken(token);
                    // Register for push notifications on app start
                    const pushToken = await NotificationService.registerForPushNotificationsAsync();
                    if (pushToken) {
                        await NotificationService.updatePushTokenOnServer(pushToken);
                    }
                }
                if (storedUser) setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to load auth data', e);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredData();
    }, []);

    const signIn = async (token, userData) => {
        try {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setUserToken(token);
            setUser(userData);

            // Register for push notifications after sign in
            const pushToken = await NotificationService.registerForPushNotificationsAsync();
            if (pushToken) {
                await NotificationService.updatePushTokenOnServer(pushToken);
            }
        } catch (e) {
            console.error('Failed to save auth data', e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setUserToken(null);
            setUser(null);
        } catch (e) {
            console.error('Failed to clear auth data', e);
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, user, isLoading, signIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
