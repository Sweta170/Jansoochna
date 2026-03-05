import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
    if (socket) return socket;

    const socketUrl = BASE_URL.replace('/api', '');

    socket = io(socketUrl, {
        query: { token },
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Admin Socket Connected');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
