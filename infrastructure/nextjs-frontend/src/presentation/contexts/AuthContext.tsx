/**
 * Context d'authentification - Presentation Layer
 * Fournit un état d'authentification partagé entre tous les composants
 */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthApiAdapter } from '@/infrastructure/api/AuthApiAdapter';
import { UserDto } from '@/shared/dto';
import {
  AuthServiceInterface,
  LoginCredentials,
  RegisterData,
} from '@/application/services/AuthService';

const authService: AuthServiceInterface = new AuthApiAdapter();

interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<Error | null>;
  register: (data: RegisterData) => Promise<Error | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<Error | null> => {
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

  const register = async (data: RegisterData): Promise<Error | null> => {
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
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
