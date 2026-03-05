import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from '../services/api';

const QUEUE_KEY = '@report_queue';

const QueueService = {
    // Save a report to the local queue
    addToQueue: async (reportData) => {
        try {
            const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
            const queue = existingQueue ? JSON.parse(existingQueue) : [];

            // Add unique ID and timestamp to the queued item
            const queuedItem = {
                ...reportData,
                tempId: Date.now().toString(),
                queuedAt: new Date().toISOString()
            };

            queue.push(queuedItem);
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            return true;
        } catch (error) {
            console.error('Failed to add to queue:', error);
            return false;
        }
    },

    // Get all queued reports
    getQueue: async () => {
        try {
            const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
            return existingQueue ? JSON.parse(existingQueue) : [];
        } catch (error) {
            console.error('Failed to get queue:', error);
            return [];
        }
    },

    // Sync all reports in the queue
    syncQueue: async () => {
        const state = await NetInfo.fetch();
        if (!state.isConnected) return { success: false, syncedCount: 0 };

        const queue = await QueueService.getQueue();
        if (queue.length === 0) return { success: true, syncedCount: 0 };

        let syncedCount = 0;
        const failedItems = [];

        for (const report of queue) {
            try {
                // Prepare form data (handling image if present)
                const formData = new FormData();
                formData.append('title', report.title);
                formData.append('description', report.description);
                formData.append('category', report.category);
                formData.append('latitude', report.latitude);
                formData.append('longitude', report.longitude);

                if (report.image) {
                    formData.append('image', {
                        uri: report.image,
                        type: 'image/jpeg',
                        name: 'report.jpg',
                    });
                }

                await api.post('/complaints', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                syncedCount++;
            } catch (error) {
                console.error('Failed to sync report:', error);
                failedItems.push(report);
            }
        }

        // Update queue with items that failed to sync
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedItems));

        return {
            success: failedItems.length === 0,
            syncedCount,
            remaining: failedItems.length
        };
    },

    // Clear the queue
    clearQueue: async () => {
        await AsyncStorage.removeItem(QUEUE_KEY);
    }
};

export default QueueService;
