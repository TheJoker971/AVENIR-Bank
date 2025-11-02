import { MessageRepositoryInterface } from "application/repositories/MessageRepositoryInterface";
import { MessageEntity } from "domain/entities/MessageEntity";

export class MessageRepositoryInMemory implements MessageRepositoryInterface {
  private messages: Map<number, MessageEntity> = new Map();
  private nextId: number = 1;
  private advisorAssignments: Map<number, number> = new Map(); // messageId -> advisorId

  async findById(id: number): Promise<MessageEntity | null> {
    const message = this.messages.get(id);
    return message || null;
  }

  async findBySenderId(senderId: number): Promise<MessageEntity[]> {
    const messages: MessageEntity[] = [];
    for (const message of this.messages.values()) {
      if (message.senderId === senderId) {
        messages.push(message);
      }
    }
    return messages;
  }

  async findByReceiverId(receiverId: number): Promise<MessageEntity[]> {
    const messages: MessageEntity[] = [];
    for (const message of this.messages.values()) {
      if (message.receiverId === receiverId) {
        messages.push(message);
      }
    }
    return messages;
  }

  async findUnassignedMessages(): Promise<MessageEntity[]> {
    const messages: MessageEntity[] = [];
    for (const message of this.messages.values()) {
      // Un message est non assigné si receiverId est 0 ou null (non défini)
      // et qu'il n'a pas encore été assigné à un conseiller
      if (!this.advisorAssignments.has(message.id) && message.receiverId === 0) {
        messages.push(message);
      }
    }
    return messages;
  }

  async findByAdvisorId(advisorId: number): Promise<MessageEntity[]> {
    const messages: MessageEntity[] = [];
    for (const [messageId, assignedAdvisorId] of this.advisorAssignments.entries()) {
      if (assignedAdvisorId === advisorId) {
        const message = this.messages.get(messageId);
        if (message) {
          messages.push(message);
        }
      }
    }
    return messages;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<MessageEntity[]> {
    const messages: MessageEntity[] = [];
    for (const message of this.messages.values()) {
      const messageDate = message.date;
      if (messageDate >= startDate && messageDate <= endDate) {
        messages.push(message);
      }
    }
    return messages;
  }

  async findRecentMessages(limit: number): Promise<MessageEntity[]> {
    const allMessages = Array.from(this.messages.values());
    allMessages.sort((a, b) => b.date.getTime() - a.date.getTime());
    return allMessages.slice(0, limit);
  }

  async findAll(): Promise<MessageEntity[]> {
    return Array.from(this.messages.values());
  }

  async save(message: MessageEntity): Promise<void> {
    const id = message.id > 0 ? message.id : this.nextId++;
    if (id !== message.id && message.id <= 0) {
      // L'entité est immuable, on doit créer une nouvelle instance
      // Pour simplifier, on assume que l'entité a déjà un ID valide
      this.messages.set(message.id, message);
    } else {
      this.messages.set(message.id, message);
    }
  }

  async update(message: MessageEntity): Promise<void> {
    if (!this.messages.has(message.id)) {
      throw new Error(`Message avec l'ID ${message.id} introuvable`);
    }
    this.messages.set(message.id, message);
  }

  async delete(id: number): Promise<void> {
    if (!this.messages.has(id)) {
      throw new Error(`Message avec l'ID ${id} introuvable`);
    }
    this.messages.delete(id);
    this.advisorAssignments.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.messages.has(id);
  }

  async countUnassignedMessages(): Promise<number> {
    const unassigned = await this.findUnassignedMessages();
    return unassigned.length;
  }

  async countBySenderId(senderId: number): Promise<number> {
    let count = 0;
    for (const message of this.messages.values()) {
      if (message.senderId === senderId) {
        count++;
      }
    }
    return count;
  }

  // Méthode supplémentaire pour assigner un conseiller à un message
  async assignAdvisor(messageId: number, advisorId: number): Promise<void> {
    if (!this.messages.has(messageId)) {
      throw new Error(`Message avec l'ID ${messageId} introuvable`);
    }
    this.advisorAssignments.set(messageId, advisorId);
  }

  // Méthode supplémentaire pour transférer un message à un autre conseiller
  async transferToAdvisor(messageId: number, newAdvisorId: number): Promise<void> {
    if (!this.messages.has(messageId)) {
      throw new Error(`Message avec l'ID ${messageId} introuvable`);
    }
    this.advisorAssignments.set(messageId, newAdvisorId);
  }
}

