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
      return await apiClient.post<MessageDto>('/messages', data);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  }

  async getMessages(userId: number): Promise<MessageDto[] | Error> {
    try {
      return await apiClient.get<MessageDto[]>(`/users/${userId}/messages`);
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des messages');
    }
  }

  async getUnassignedMessages(): Promise<MessageDto[] | Error> {
    try {
      return await apiClient.get<MessageDto[]>('/messages/unassigned');
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de la récupération des messages non assignés');
    }
  }

  async assignMessage(messageId: number, advisorId: number): Promise<void | Error> {
    try {
      await apiClient.post(`/messages/${messageId}/assign`, { advisorId });
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors de l\'assignation du message');
    }
  }

  async transferMessage(messageId: number, fromAdvisorId: number, toAdvisorId: number): Promise<void | Error> {
    try {
      await apiClient.post(`/messages/${messageId}/transfer`, { fromAdvisorId, toAdvisorId });
    } catch (error: any) {
      return new Error(error.response?.data?.message || 'Erreur lors du transfert du message');
    }
  }
}

