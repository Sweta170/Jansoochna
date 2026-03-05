import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { BASE_URL } from '../services/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { userToken } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Socket server is on the same host but different path/port than API
        const socketUrl = BASE_URL.replace('/api', '');

        const newSocket = io(socketUrl, {
            query: { token: userToken },
            transports: ['websocket'],
            autoConnect: true
        });

        newSocket.on('connect', () => {
            console.log('Socket Connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket Disconnected');
            setIsConnected(false);
        });

        newSocket.on('notification:new', async (data) => {
            console.log('New notification via socket:', data);

            // Expo Go for SDK 53+ doesn't support remote push notifications.
            if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
                return;
            }

            // Dynamic require
            try {
                const Notifications = require('expo-notifications');
                // Show a local notification immediately
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "JanSoochna Alert! 🔔",
                        body: data.message || "You have a new update regarding your complaint.",
                        data: { complaintId: data.complaint_id },
                    },
                    trigger: null, // show immediately
                });
            } catch (e) {
                console.warn('Failed to schedule local notification:', e.message);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userToken]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
