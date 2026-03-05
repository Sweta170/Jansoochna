import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import QueueService from '../services/QueueService';
import { Alert } from 'react-native';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [queueSize, setQueueSize] = useState(0);

    useEffect(() => {
        // Listen for network changes
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                handleAutoSync();
            }
        });

        // Initial queue check
        updateQueueSize();

        return () => unsubscribe();
    }, []);

    const updateQueueSize = async () => {
        const queue = await QueueService.getQueue();
        setQueueSize(queue.length);
    };

    const handleAutoSync = async () => {
        const queue = await QueueService.getQueue();
        if (queue.length > 0) {
            syncNow();
        }
    };

    const syncNow = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        try {
            const result = await QueueService.syncQueue();
            if (result.syncedCount > 0) {
                Alert.alert(
                    'Sync Success',
                    `Successfully uploaded ${result.syncedCount} queued report(s).`
                );
            }
            await updateQueueSize();
        } catch (error) {
            console.error('Manual sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const addToQueue = async (reportData) => {
        const success = await QueueService.addToQueue(reportData);
        if (success) {
            await updateQueueSize();
        }
        return success;
    };

    return (
        <OfflineContext.Provider value={{
            isConnected,
            isSyncing,
            queueSize,
            syncNow,
            addToQueue
        }}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => useContext(OfflineContext);
