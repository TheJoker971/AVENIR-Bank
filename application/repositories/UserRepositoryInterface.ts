import { UserEntity } from "domain/entities/UserEntity";
import { UserNotFoundError } from "domain/errors/UserNotFoundError";

export interface UserRepositoryInterface {
    // Define methods for user repository
    findById(id: number): Promise<UserEntity | UserNotFoundError>;
    findByEmail(email: string): Promise<UserEntity | UserNotFoundError>;
    update(id: number, data:Partial<UserEntity>): Promise<void | UserNotFoundError>;
    delete(id: number): Promise<void | UserNotFoundError>;
}