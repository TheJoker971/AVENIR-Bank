/**
 * Use Case: Débannir un utilisateur
 */
import { UserEntity } from "domain/entities/UserEntity";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class UnbanUserUseCase {
  constructor(
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(userId: number): Promise<UserEntity | Error> {
    const user = await this.userRepository.findById(userId);
    if (user instanceof Error || !user) {
      return new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'utilisateur est banni
    if (!user.banned) {
      return new Error("L'utilisateur n'est pas banni");
    }

    // Créer une nouvelle instance avec banned = false
    const unbannedUser = UserEntity.create(
      user.id,
      user.firstname,
      user.lastname,
      user.email.value,
      user.password.value, // Le mot de passe est déjà hashé
      user.address,
      user.role.value,
      false // banned = false
    );

    if (unbannedUser instanceof Error) {
      return unbannedUser;
    }

    // Mettre à jour l'utilisateur
    await this.userRepository.update(unbannedUser);

    return unbannedUser;
  }
}

