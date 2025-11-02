/**
 * Service de gestion des utilisateurs (Directeur) - Application Layer
 */
import { UserDto } from '@/shared/dto';

export interface CreateUserData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  address: string;
  role: 'CLIENT' | 'ADVISE' | 'DIRECTOR';
}

export interface UserServiceInterface {
  getAllUsers(): Promise<UserDto[] | Error>;
  getUsersByRole(role: 'CLIENT' | 'ADVISE' | 'DIRECTOR'): Promise<UserDto[] | Error>;
  getClientsByAdvisor(advisorId: number): Promise<UserDto[] | Error>;
  createUser(data: CreateUserData): Promise<UserDto | Error>;
  banUser(userId: number): Promise<void | Error>;
  unbanUser(userId: number): Promise<void | Error>;
  deleteUser(userId: number): Promise<void | Error>;
  assignAdvisorToClient(clientId: number, advisorId: number): Promise<UserDto | Error>;
  removeAdvisorFromClient(clientId: number): Promise<UserDto | Error>;
}

