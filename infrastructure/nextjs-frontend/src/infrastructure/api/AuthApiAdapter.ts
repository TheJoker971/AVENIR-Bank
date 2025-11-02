/**
 * Adaptateur API pour l'authentification - Infrastructure Layer
 * Implémente AuthServiceInterface en utilisant ApiClient
 */
import { apiClient } from './ApiClient';
import {
  AuthServiceInterface,
  LoginCredentials,
  RegisterData,
} from '@/application/services/AuthService';
import { UserDto } from '@/shared/dto';

export class AuthApiAdapter implements AuthServiceInterface {
  async login(credentials: LoginCredentials): Promise<UserDto | Error> {
    try {
      const response = await apiClient.post<{ user: UserDto; token: string }>('/auth/login', credentials);
      apiClient.setAuthToken(response.token);
      return response.user;
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la connexion');
    }
  }

  async register(data: RegisterData): Promise<UserDto | Error> {
    try {
      const response = await apiClient.post<{ user: UserDto; token: string }>('/auth/register', data);
      apiClient.setAuthToken(response.token);
      return response.user;
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      }
    }
  }

  async getCurrentUser(): Promise<UserDto | null> {
    try {
      const user = await apiClient.get<UserDto>('/auth/me');
      return user;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }
}

