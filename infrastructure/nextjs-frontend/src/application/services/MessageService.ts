/**
 * Service de messagerie - Application Layer
 */
import { MessageDto } from '@/shared/dto';

export interface SendMessageData {
  userId: number;
  content: string;
  receiverId?: number; // Optionnel pour les clients (sera assigné automatiquement)
}

export interface MessageServiceInterface {
  sendMessage(data: SendMessageData): Promise<MessageDto | Error>;
  getMessages(userId: number): Promise<MessageDto[] | Error>;
  getUnassignedMessages(): Promise<MessageDto[] | Error>;
  assignMessage(messageId: number, advisorId: number): Promise<void | Error>;
  transferMessage(messageId: number, fromAdvisorId: number, toAdvisorId: number): Promise<void | Error>;
}

