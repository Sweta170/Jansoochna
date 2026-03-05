import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// UPDATE THIS TO YOUR COMPUTER'S IP ADDRESS
// Current Wi-Fi IP: 192.168.1.7
const BASE_URL = 'http://192.168.1.7:4000/api/';

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 Unauthorized errors (e.g., after database reset)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Session expired or invalid. Clearing token.');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // Note: This won't trigger a re-render in AuthContext immediately,
            // but the next app start or manual refresh will go to Login.
        }
        return Promise.reject(error);
    }
);

export default api;
export { BASE_URL };
