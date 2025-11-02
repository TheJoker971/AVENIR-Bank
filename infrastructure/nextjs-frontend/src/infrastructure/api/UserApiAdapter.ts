/**
 * Adaptateur API pour les utilisateurs - Infrastructure Layer
 */
import { apiClient } from './ApiClient';
import { UserServiceInterface, CreateUserData } from '@/application/services/UserService';
import { UserDto } from '@/shared/dto';

export class UserApiAdapter implements UserServiceInterface {
  async getAllUsers(): Promise<UserDto[] | Error> {
    try {
      return await apiClient.get<UserDto[]>('/api/users');
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  async createUser(data: CreateUserData): Promise<UserDto | Error> {
    try {
      return await apiClient.post<UserDto>('/api/users', data);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  }

  async banUser(userId: number): Promise<void | Error> {
    try {
      await apiClient.put(`/api/users/${userId}/ban`, {});
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du bannissement');
    }
  }

  async unbanUser(userId: number): Promise<void | Error> {
    try {
      await apiClient.put(`/api/users/${userId}/unban`, {});
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du débannissement');
    }
  }

  async deleteUser(userId: number): Promise<void | Error> {
    try {
      await apiClient.delete(`/api/users/${userId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la suppression');
    }
  }

  async getUsersByRole(role: 'CLIENT' | 'ADVISE' | 'DIRECTOR'): Promise<UserDto[] | Error> {
    try {
      return await apiClient.get<UserDto[]>(`/api/users/by-role/${role}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  async getClientsByAdvisor(advisorId: number): Promise<UserDto[] | Error> {
    try {
      return await apiClient.get<UserDto[]>(`/api/users/by-advisor/${advisorId}`);
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la récupération des clients');
    }
  }

  async assignAdvisorToClient(clientId: number, advisorId: number): Promise<UserDto | Error> {
    try {
      return await apiClient.put<UserDto>(`/api/users/${clientId}/assign-advisor/${advisorId}`, {});
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'assignation du conseiller');
    }
  }

  async removeAdvisorFromClient(clientId: number): Promise<UserDto | Error> {
    try {
      return await apiClient.put<UserDto>(`/api/users/${clientId}/remove-advisor`, {});
    } catch (error: any) {
      return new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du retrait du conseiller');
    }
  }
}

