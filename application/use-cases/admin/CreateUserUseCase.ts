/**
 * Use Case: Créer un nouvel utilisateur (Directeur uniquement)
 */
import { UserEntity } from "domain/entities/UserEntity";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepositoryInterface
  ) {}

  async execute(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    address: string,
    role: string
  ): Promise<UserEntity | Error> {
    // Vérifier que l'email n'existe pas déjà
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser && !(existingUser instanceof Error)) {
      return new Error("Un utilisateur avec cet email existe déjà");
    }

    // Générer un ID unique
    const userId = Date.now();

    // Créer l'utilisateur selon son rôle
    let user: UserEntity | Error;
    
    switch (role.toUpperCase()) {
      case 'CLIENT':
        user = UserEntity.createClient(userId, firstname, lastname, email, password, address);
        break;
      case 'ADVISE':
        user = UserEntity.createAdvise(userId, firstname, lastname, email, password, address);
        break;
      case 'DIRECTOR':
        user = UserEntity.createDirector(userId, firstname, lastname, email, password, address);
        break;
      default:
        return new Error("Rôle invalide. Rôles acceptés: CLIENT, ADVISE, DIRECTOR");
    }

    if (user instanceof Error) {
      return user;
    }

    // Sauvegarder l'utilisateur
    await this.userRepository.save(user);

    return user;
  }
}

