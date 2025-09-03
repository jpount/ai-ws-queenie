/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, RegisterData } from '../types';
import { useAuth } from '../services/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing user on mount
    const checkUser = async () => {
      try {
        const currentUser = await useAuth.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking auth state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Subscribe to auth changes
    const unsubscribe = useAuth.onAuthChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await useAuth.login(credentials);
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
    } catch (err) {
      const message = (err as Error).message || 'Failed to login';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await useAuth.register(data);
      setUser(user);
      toast.success(`Welcome to MindAnchor, ${user.name}!`);
    } catch (err) {
      const message = (err as Error).message || 'Failed to register';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await useAuth.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      const message = (err as Error).message || 'Failed to logout';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};