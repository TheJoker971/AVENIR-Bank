import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";
import { UserEntity } from "domain/entities/UserEntity";

export class UserRepositoryInMemory implements UserRepositoryInterface {
  private users: Map<number, UserEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<UserEntity | null> {
    const user = this.users.get(id);
    return user || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    for (const user of this.users.values()) {
      if (user.email.getValue() === email) {
        return user;
      }
    }
    return null;
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    const users: UserEntity[] = [];
    for (const user of this.users.values()) {
      if (user.role.getValue() === role) {
        users.push(user);
      }
    }
    return users;
  }

  async findAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values());
  }

  async save(user: UserEntity): Promise<void> {
    let userId = user.id;
    
    // Si l'ID est 0 ou négatif, générer un nouvel ID
    if (userId <= 0 || !this.users.has(userId)) {
      userId = this.nextId++;
    }
    
    // Créer une nouvelle instance avec l'ID correct si nécessaire
    const userToSave = userId !== user.id 
      ? UserEntity.create(
          userId,
          user.firstname,
          user.lastname,
          user.email.getValue(),
          user.password.getValue(),
          user.address,
          user.role.getValue(),
          user.banned
        )
      : user;
    
    if (userToSave instanceof Error) {
      throw new Error(`Erreur lors de la sauvegarde de l'utilisateur: ${userToSave.message}`);
    }
    
    this.users.set(userId, userToSave);
  }

  async update(user: UserEntity): Promise<void> {
    if (!this.users.has(user.id)) {
      throw new Error(`Utilisateur avec l'ID ${user.id} introuvable`);
    }
    this.users.set(user.id, user);
  }

  async delete(id: number): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error(`Utilisateur avec l'ID ${id} introuvable`);
    }
    this.users.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.users.has(id);
  }
}

