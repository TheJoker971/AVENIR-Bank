import { UserEntity } from "domain/entities/UserEntity";
import { UserRepositoryInterface } from "application/repositories/UserRepositoryInterface";

export class InMemoryUserRepository implements UserRepositoryInterface {
  private users: Map<number, UserEntity> = new Map();
  private nextId: number = 1;

  async findById(id: number): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    for (const user of this.users.values()) {
      if (user.email.value === email) {
        return user;
      }
    }
    return null;
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    const users: UserEntity[] = [];
    for (const user of this.users.values()) {
      if (user.role.value === role) {
        users.push(user);
      }
    }
    return users;
  }

  async findAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values());
  }

  async save(user: UserEntity): Promise<void> {
    // Pour la simulation, on génère un ID si nécessaire
    const userWithId = new (user.constructor as any)(
      user.id || this.nextId++,
      user.firstname,
      user.lastname,
      user.email,
      user.password,
      user.address,
      user.role,
      user.banned
    );
    this.users.set(userWithId.id, userWithId);
  }

  async update(user: UserEntity): Promise<void> {
    if (this.users.has(user.id)) {
      this.users.set(user.id, user);
    }
  }

  async delete(id: number): Promise<void> {
    this.users.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    return this.users.has(id);
  }

  // Méthodes utilitaires pour les tests
  clear(): void {
    this.users.clear();
    this.nextId = 1;
  }

  getCount(): number {
    return this.users.size;
  }

  // Méthode pour initialiser avec des données de test
  async seedTestData(): Promise<void> {
    // Créer un client de test
    const testClient = UserEntity.createClient(
      this.nextId++,
      "Jean",
      "Dupont",
      "jean.dupont@example.com",
      "password123",
      "123 Rue de la Paix, Paris"
    );
    if (testClient instanceof UserEntity) {
      await this.save(testClient);
    }

    // Créer un conseiller de test
    const testAdvisor = UserEntity.createAdvise(
      this.nextId++,
      "Marie",
      "Martin",
      "marie.martin@avenir-bank.com",
      "advisor123",
      "456 Avenue des Champs, Paris"
    );
    if (testAdvisor instanceof UserEntity) {
      await this.save(testAdvisor);
    }

    // Créer un directeur de test
    const testDirector = UserEntity.createDirector(
      this.nextId++,
      "Pierre",
      "Durand",
      "pierre.durand@avenir-bank.com",
      "director123",
      "789 Boulevard Haussmann, Paris"
    );
    if (testDirector instanceof UserEntity) {
      await this.save(testDirector);
    }
  }
}
