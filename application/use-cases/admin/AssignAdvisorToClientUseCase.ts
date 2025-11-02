import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { UserEntity } from "domain/entities/UserEntity";

export class AssignAdvisorToClientUseCase {
  constructor(private userRepository: UserRepositoryInterface) {}

  async execute(clientId: number, advisorId: number): Promise<UserEntity | Error> {
    // Vérifier que le client existe
    const client = await this.userRepository.findById(clientId);
    if (!client || client instanceof Error) {
      return new Error("Client non trouvé");
    }

    // Vérifier que le client est bien un client
    if (client.role.value !== "CLIENT") {
      return new Error("L'utilisateur doit être un client");
    }

    // Vérifier que le conseiller existe
    const advisor = await this.userRepository.findById(advisorId);
    if (!advisor || advisor instanceof Error) {
      return new Error("Conseiller non trouvé");
    }

    // Vérifier que le conseiller est bien un conseiller
    if (advisor.role.value !== "ADVISE") {
      return new Error("L'utilisateur doit être un conseiller");
    }

    // Assigner le conseiller au client
    const updatedClient = client.assignAdvisor(advisorId);
    if (updatedClient instanceof Error) {
      return updatedClient;
    }

    await this.userRepository.update(updatedClient);
    return updatedClient;
  }
}

