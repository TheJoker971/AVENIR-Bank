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
      
      // Les admins et advisors vont directement au dashboard
      if (result.role === 'DIRECTOR' || result.role === 'ADVISE') {
        router.push('/dashboard');
        return null;
      }
      
      // Pour les clients, vérifier si l'utilisateur a un compte actif
      if (result.role === 'CLIENT') {
        try {
          const activeAccountResponse = await fetch(`http://localhost:3000/api/users/${result.id}/active-account`, {
            headers: {
              'x-user-id': result.id.toString(),
            },
          });
          
          if (activeAccountResponse.ok) {
            const activeAccountData = await activeAccountResponse.json();
            
            // Si un compte actif existe, aller au dashboard, sinon vers la sélection
            if (activeAccountData.activeAccount) {
              router.push('/dashboard');
            } else {
              router.push('/select-account');
            }
          } else {
            // En cas d'erreur API, rediriger vers sélection par sécurité
            router.push('/select-account');
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du compte actif:', error);
          // En cas d'erreur, rediriger vers sélection par sécurité
          router.push('/select-account');
        }
      } else {
        // Fallback : aller au dashboard pour tout autre rôle
        router.push('/dashboard');
      }
      
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
      
      // Les admins et advisors vont directement au dashboard
      if (result.role === 'DIRECTOR' || result.role === 'ADVISE') {
        router.push('/dashboard');
      } else if (result.role === 'CLIENT') {
        // Un nouveau client n'a jamais de compte actif, rediriger vers sélection
        router.push('/select-account');
      } else {
        // Fallback : aller au dashboard pour tout autre rôle
        router.push('/dashboard');
      }
      
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
      // Nettoyer le localStorage du compte actif
      localStorage.removeItem('activeAccount');
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

