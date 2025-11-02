/**
 * Use Case: Bannir un utilisateur
 */
import { UserEntity } from "domain/entities/UserEntity";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class BanUserUseCase {
  constructor(
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(userId: number): Promise<UserEntity | Error> {
    const user = await this.userRepository.findById(userId);
    if (user instanceof Error || !user) {
      return new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'utilisateur n'est pas déjà banni
    if (user.banned) {
      return new Error("L'utilisateur est déjà banni");
    }

    // Créer une nouvelle instance avec banned = true
    const bannedUser = UserEntity.create(
      user.id,
      user.firstname,
      user.lastname,
      user.email.value,
      user.password.value, // Le mot de passe est déjà hashé
      user.address,
      user.role.value,
      true // banned = true
    );

    if (bannedUser instanceof Error) {
      return bannedUser;
    }

    // Mettre à jour l'utilisateur
    await this.userRepository.update(bannedUser);

    return bannedUser;
  }
}

