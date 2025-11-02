/**
 * Service d'authentification - Application Layer
 * Encapsule la logique métier d'authentification
 */
import { UserDto } from '@/shared/dto';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  address: string;
}

export interface AuthServiceInterface {
  login(credentials: LoginCredentials): Promise<UserDto | Error>;
  register(data: RegisterData): Promise<UserDto | Error>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserDto | null>;
  isAuthenticated(): boolean;
}

