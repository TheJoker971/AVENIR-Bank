/**
 * Adaptateur API pour la messagerie - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import {
  MessageServiceInterface,
  SendMessageData,
} from '@/application/services/MessageService';
import { MessageDto } from '@/shared/dto';

export class MessageApiAdapter implements MessageServiceInterface {
  async sendMessage(data: SendMessageData): Promise<MessageDto | Error> {
    try {
      // Préparer le payload pour l'API
      const payload: any = {
        message: data.content,
      };
      
      // Si receiverId est fourni, l'inclure (pour les conseillers)
      if (data.receiverId) {
        payload.receiverId = data.receiverId;
      }
      
      return await apiClient.post<MessageDto>('/api/messages', payload);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  }

  async getMessages(userId: number): Promise<MessageDto[] | Error> {
    try {
      return await apiClient.get<MessageDto[]>('/api/messages');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des messages');
    }
  }

  async getUnassignedMessages(): Promise<MessageDto[] | Error> {
    try {
      return await apiClient.get<MessageDto[]>('/api/messages/unassigned');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des messages non assignés');
    }
  }

  async assignMessage(messageId: number, advisorId: number): Promise<void | Error> {
    try {
      await apiClient.post(`/api/messages/${messageId}/assign`, {});
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'assignation du message');
    }
  }

  async transferMessage(messageId: number, fromAdvisorId: number, toAdvisorId: number): Promise<void | Error> {
    try {
      await apiClient.post(`/api/messages/${messageId}/transfer`, { fromAdvisorId, toAdvisorId });
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du transfert du message');
    }
  }
}

