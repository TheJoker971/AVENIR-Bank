import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { UserEntity } from "domain/entities/UserEntity";

export class RemoveAdvisorFromClientUseCase {
  constructor(private userRepository: UserRepositoryInterface) {}

  async execute(clientId: number): Promise<UserEntity | Error> {
    // Vérifier que le client existe
    const client = await this.userRepository.findById(clientId);
    if (!client || client instanceof Error) {
      return new Error("Client non trouvé");
    }

    // Vérifier que le client est bien un client
    if (client.role.value !== "CLIENT") {
      return new Error("L'utilisateur doit être un client");
    }

    // Retirer le conseiller du client
    const updatedClient = client.removeAdvisor();
    if (updatedClient instanceof Error) {
      return updatedClient;
    }

    await this.userRepository.update(updatedClient);
    return updatedClient;
  }
}

