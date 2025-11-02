/**
 * Use Case: Obtenir le conseiller attitré d'un client
 */
import { MessageRepositoryInterface } from "application/repositories/MessageRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class GetClientAssignedAdvisorUseCase {
  constructor(
    private messageRepository: MessageRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(clientId: number): Promise<number | null> {
    // Récupérer tous les messages du client
    const clientMessages = await this.messageRepository.findBySenderId(clientId);
    
    if (clientMessages.length === 0) {
      return null; // Aucun message, donc pas de conseiller assigné
    }

    // Trouver le premier conseiller qui a été assigné via un message
    // On cherche dans les messages assignés
    for (const message of clientMessages) {
      // Vérifier si ce message a un conseiller assigné
      // Pour cela, on vérifie dans le repository si le message a un advisorId
      const advisorMessages = await this.messageRepository.findByAdvisorId(message.receiverId);
      
      // Si le receiverId du message est un conseiller et qu'il a été assigné
      const receiver = await this.userRepository.findById(message.receiverId);
      if (receiver && !(receiver instanceof Error) && receiver.role.value === 'ADVISE') {
        // Vérifier si ce conseiller a été assigné à ce client
        const assignedMessages = await this.messageRepository.findByAdvisorId(message.receiverId);
        const hasClientMessage = assignedMessages.some(m => m.senderId === clientId);
        if (hasClientMessage) {
          return message.receiverId;
        }
      }
    }

    return null;
  }
}

