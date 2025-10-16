import { MessageEntity } from "domain/entities/MessageEntity";
import { MessageRepositoryInterface } from "application/repositories/MessageRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class SendMessageUseCase {
  constructor(
    private messageRepository: MessageRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(
    senderId: number,
    receiverId: number,
    subject: string,
    message: string
  ): Promise<MessageEntity | Error> {
    // Vérifier que l'expéditeur existe
    const sender = await this.userRepository.findById(senderId);
    if (sender instanceof Error) {
      return new Error("Expéditeur non trouvé");
    }

    // Vérifier que le destinataire existe
    const receiver = await this.userRepository.findById(receiverId);
    if (receiver instanceof Error) {
      return new Error("Destinataire non trouvé");
    }

    // Valider les données
    if (!subject || subject.trim().length === 0) {
      return new Error("Le sujet ne peut pas être vide");
    }

    if (!message || message.trim().length === 0) {
      return new Error("Le message ne peut pas être vide");
    }

    // Créer le message
    const messageEntity = MessageEntity.create(
      Date.now(), // ID temporaire
      senderId,
      receiverId,
      subject.trim(),
      message.trim()
    );

    // Sauvegarder le message
    await this.messageRepository.save(messageEntity);

    return messageEntity;
  }
}
