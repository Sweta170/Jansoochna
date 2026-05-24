import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAdmin } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { admin } = useAdmin();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!admin) return;

    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      newSocket.emit('join-admin', { state: admin.state, district: admin.district });
    });

    newSocket.on('new-issue', (data) => {
      toast.success(`New issue: ${data.title} in ${data.district}`, { icon: '⚠️' });
      // In a real app with React Query: queryClient.invalidateQueries(['issues'])
    });

    newSocket.on('petition-ready', (data) => {
      toast.success(`Petition ready for Issue #${data.id} — 50 votes reached`, { icon: '📜' });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [admin]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
