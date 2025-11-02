/**
 * Hook pour la gestion des messages
 */
'use client';

import { useState, useEffect } from 'react';
import { MessageApiAdapter } from '@/infrastructure/api/MessageApiAdapter';
import { MessageDto } from '@/shared/dto';
import { MessageServiceInterface, SendMessageData } from '@/application/services/MessageService';

const messageService: MessageServiceInterface = new MessageApiAdapter();

export const useMessages = (userId: number | null) => {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    const result = await messageService.getMessages(userId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setMessages(result);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, [userId]);

  const sendMessage = async (content: string, receiverId?: number) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    
    const result = await messageService.sendMessage({ userId, content, receiverId });
    if (result instanceof Error) {
      setError(result.message);
      setLoading(false);
      return null;
    }
    
    await loadMessages();
    return result;
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refresh: loadMessages,
  };
};

export const useUnassignedMessages = () => {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    
    const result = await messageService.getUnassignedMessages();
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setMessages(result);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Rafraîchir toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const assignMessage = async (messageId: number, advisorId: number) => {
    setLoading(true);
    const result = await messageService.assignMessage(messageId, advisorId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      await loadMessages();
    }
    setLoading(false);
  };

  const transferMessage = async (messageId: number, fromAdvisorId: number, toAdvisorId: number) => {
    setLoading(true);
    const result = await messageService.transferMessage(messageId, fromAdvisorId, toAdvisorId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      await loadMessages();
    }
    setLoading(false);
  };

  return {
    messages,
    loading,
    error,
    assignMessage,
    transferMessage,
    refresh: loadMessages,
  };
};

