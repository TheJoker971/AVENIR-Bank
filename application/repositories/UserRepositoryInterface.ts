import { UserEntity } from "domain/entities/UserEntity";

export interface UserRepositoryInterface {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByRole(role: string): Promise<UserEntity[]>;
  findAll(): Promise<UserEntity[]>;
  save(user: UserEntity): Promise<void>;
  update(user: UserEntity): Promise<void>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;
}