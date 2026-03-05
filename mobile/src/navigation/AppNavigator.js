import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ComplaintDetailsScreen from '../screens/ComplaintDetailsScreen';
import ReportScreen from '../screens/ReportScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignupScreen from '../screens/SignupScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ServicesScreen from '../screens/ServicesScreen';
import TransparencyScreen from '../screens/TransparencyScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import ChatScreen from '../screens/ChatScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                headerStyle: {
                    backgroundColor: colors.surface,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1.5,
                    borderBottomColor: colors.border,
                    height: 100,
                },
                headerTintColor: colors.textMain,
                headerTitleStyle: { fontWeight: '900', fontSize: 20, letterSpacing: -0.5 },
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1.5,
                    borderTopColor: colors.border,
                    height: 70,
                    paddingBottom: 15,
                    paddingTop: 10,
                    elevation: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                }
            }}
        >
            <Tab.Screen
                name="HomeFeed"
                component={HomeScreen}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-variant" color={color} size={28} />
                    )
                }}
            />
            <Tab.Screen
                name="Services"
                component={ServicesScreen}
                options={{
                    title: 'Services',
                    tabBarLabel: 'Civic',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-grid" color={color} size={24} />
                    )
                }}
            />
            <Tab.Screen
                name="Transparency"
                component={TransparencyScreen}
                options={{
                    title: 'Transparency',
                    tabBarLabel: 'Stats',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="chart-box" color={color} size={24} />
                    )
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                    title: 'Updates',
                    tabBarLabel: 'Alerts',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bell" color={color} size={24} />
                    )
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Account',
                    tabBarLabel: 'You',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-circle" color={color} size={26} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { userToken, isLoading } = useAuth();
    const { colors, isDark } = useTheme();

    useEffect(() => {
        if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
            return;
        }
        const Notifications = require('expo-notifications');
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification Received:', notification);
        });
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.complaintId) {
                console.log('Navigate to complaint:', data.complaintId);
            }
        });
        return () => {
            foregroundSubscription.remove();
            responseSubscription.remove();
        };
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors?.background || '#fff' }}>
                <ActivityIndicator size="small" color={colors?.primary || '#2563eb'} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1.5,
                    borderBottomColor: colors.border
                },
                headerTintColor: colors.textMain,
                headerTitleStyle: { fontWeight: '900', fontSize: 18, letterSpacing: -0.5 },
                headerBackTitleVisible: false,
            }}
        >
            {userToken == null ? (
                <>
                    <Stack.Screen
                        name="Login"
                        component={WelcomeScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Signup"
                        component={SignupScreen}
                        options={{ title: 'Create Account' }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Main"
                        component={MainTabs}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Details"
                        component={ComplaintDetailsScreen}
                        options={{ title: 'Report Details' }}
                    />
                    <Stack.Screen
                        name="Report"
                        component={ReportScreen}
                        options={{ title: 'New Report' }}
                    />
                    <Stack.Screen
                        name="Map"
                        component={MapScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Emergency"
                        component={EmergencyScreen}
                        options={{ title: 'Emergency SOS' }}
                    />
                    <Stack.Screen
                        name="Leaderboard"
                        component={LeaderboardScreen}
                        options={{ title: 'Contributors' }}
                    />
                    <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="ServiceDetails"
                        component={ServiceDetailsScreen}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
