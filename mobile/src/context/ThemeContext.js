import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setIsDark(savedTheme === 'dark');
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newMode = !isDark;
        setIsDark(newMode);
        await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const theme = {
        isDark,
        colors: isDark ? darkColors : lightColors,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

const lightColors = {
    primary: '#2563eb',
    background: '#ffffff',
    surface: '#ffffff',
    textMain: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    cardShadow: 'rgba(0,0,0,0.03)',
    heroBg: '#2563eb',
    heroText: '#ffffff',
    inputBg: '#f8fafc',
    navBg: '#ffffff',
    navBorder: '#f1f5f9',
};

const darkColors = {
    primary: '#3b82f6',
    background: '#020617',
    surface: '#0f172a',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1e293b',
    danger: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    cardShadow: 'rgba(0,0,0,0.4)',
    heroBg: '#1e3a8a',
    heroText: '#f1f5f9',
    inputBg: '#1e293b',
    navBg: '#0f172a',
    navBorder: '#1e293b',
};
