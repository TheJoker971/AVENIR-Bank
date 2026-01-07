'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Déconnecter le socket si l'utilisateur n'est plus authentifié
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // URL du serveur WebSocket (Socket.IO utilise http://, pas ws://)
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // Créer une nouvelle connexion socket
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connecté au serveur WebSocket');
      setConnected(true);

      // Authentifier le socket avec l'ID utilisateur
      newSocket.emit('authenticate', {
        userId: user.id,
        token: localStorage.getItem('token') || '', // Si vous utilisez des tokens
      });

      // Joindre la room du rôle de l'utilisateur
      if (user.role) {
        newSocket.emit('join-role-room', user.role);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur WebSocket');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      setConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup à la déconnexion
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket doit être utilisé dans un SocketProvider');
  }
  return context;
};
