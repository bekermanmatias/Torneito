import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../types';
import { authService, usuarioService } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<Usuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const response = await usuarioService.getProfile();
          setUser(response.data.usuario);
        } catch (error) {
          console.error('Error loading user profile:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      const { token, usuario } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(usuario);
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (nombre: string, email: string, password: string) => {
    try {
      const response = await authService.register({ nombre, email, password });
      const { token, usuario } = response.data;
      
      localStorage.setItem('auth_token', token);
      setUser(usuario);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const updateProfile = async (userData: Partial<Usuario>) => {
    try {
      const response = await usuarioService.updateProfile(userData);
      setUser(response.data.usuario);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
