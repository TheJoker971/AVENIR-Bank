import { MessageEntity } from "domain/entities/MessageEntity";
import { MessageRepositoryInterface } from "application/repositories/MessageRepositoryInterface";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class AssignMessageToAdvisorUseCase {
  constructor(
    private messageRepository: MessageRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(messageId: number, advisorId: number): Promise<MessageEntity | Error> {
    // Vérifier que le conseiller existe et a le bon rôle
    const advisor = await this.userRepository.findById(advisorId);
    if (advisor instanceof Error) {
      return new Error("Conseiller non trouvé");
    }

    if (advisor.role.value !== "ADVISE") {
      return new Error("L'utilisateur n'est pas un conseiller");
    }

    // Récupérer le message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      return new Error("Message non trouvé");
    }

    // Vérifier que le message n'est pas déjà assigné
    // Note: Il faudrait ajouter un champ advisorId à MessageEntity
    // pour gérer l'assignation

    // Créer une nouvelle version du message avec l'assignation
    // const assignedMessage = new MessageEntity(
    //   message.id,
    //   message.senderId,
    //   message.receiverId,
    //   message.subject,
    //   message.message,
    //   message.date,
    //   advisorId // advisor assigné
    // );

    // await this.messageRepository.update(assignedMessage);

    // return assignedMessage;

    // Pour l'instant, on retourne le message tel quel
    return message;
  }
}
