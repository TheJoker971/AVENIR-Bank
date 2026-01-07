/**
 * Hook personnalisé pour gérer les connexions WebSocket
 * Utilise Socket.IO pour les communications en temps réel
 */
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (userId: number | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      return;
    }

    // Créer la connexion WebSocket
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('🔌 WebSocket connecté');
      // Authentifier l'utilisateur
      const token = localStorage.getItem('token') || '';
      newSocket.emit('authenticate', { userId, token });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error.message);
    });

    setSocket(newSocket);

    // Cleanup lors du démontage
    return () => {
      console.log('🔌 Nettoyage connexion WebSocket');
      newSocket.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return socket;
};

