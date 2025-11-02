/**
 * Hook d'authentification - Presentation Layer
 * Gère l'état d'authentification
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApiAdapter } from '@/infrastructure/api/AuthApiAdapter';
import { UserDto } from '@/shared/dto';
import {
  AuthServiceInterface,
  LoginCredentials,
  RegisterData,
} from '@/application/services/AuthService';

const authService: AuthServiceInterface = new AuthApiAdapter();

export const useAuth = () => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result instanceof Error) {
        throw result;
      }
      setUser(result);
      router.push('/dashboard');
      return null;
    } catch (error) {
      return error instanceof Error ? error : new Error('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await authService.register(data);
      if (result instanceof Error) {
        throw result;
      }
      setUser(result);
      router.push('/dashboard');
      return null;
    } catch (error) {
      return error instanceof Error ? error : new Error('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};

