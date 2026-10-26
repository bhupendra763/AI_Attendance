import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import { api } from '../api/endpoints';
import {
  setAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  isMockMode,
} from '../api/client';
import { initialUsers } from '../api/mock/data';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  getDefaultRouteForRole: (role?: UserRole | null) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDefaultRouteForRole = (role?: UserRole | null): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    case 'PARENT':
      return '/parent/dashboard';
    default:
      return '/login';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedRefresh = getStoredRefreshToken();
        if (storedRefresh) {
          // Attempt to refresh session
          const tokens = await api.auth.refresh(storedRefresh);
          setAccessToken(tokens.accessToken);
          if (tokens.refreshToken) {
            setStoredRefreshToken(tokens.refreshToken);
          }
          // Fetch current user details
          const userIdMatch = storedRefresh.match(/mock_jwt_refresh_(.*)/);
          const userId = userIdMatch ? userIdMatch[1] : 'user-admin-1';
          const me = await api.auth.getMe(userId);
          setUser(me);
        } else if (isMockMode()) {
          // If no stored token in mock mode, seed default login as Teacher for immediate rich demo
          const defaultUser = initialUsers[1]; // Dr. Sarah Jenkins (Teacher)
          setUser(defaultUser);
          setAccessToken(`mock_jwt_access_${defaultUser.id}`);
          setStoredRefreshToken(`mock_jwt_refresh_${defaultUser.id}`);
        }
      } catch (err) {
        setAccessToken(null);
        setStoredRefreshToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth expiration events
    const handleExpired = () => {
      setUser(null);
      setAccessToken(null);
      setStoredRefreshToken(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const authData: AuthResponse = await api.auth.login(email, pass);
      setAccessToken(authData.accessToken);
      setStoredRefreshToken(authData.refreshToken);
      setUser(authData.user);
      return authData.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout(user?.email);
    } catch {
      // Continue cleanup regardless
    } finally {
      setUser(null);
      setAccessToken(null);
      setStoredRefreshToken(null);
      setIsLoading(false);
    }
  };

  const switchDemoRole = useCallback(async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const demoTarget = initialUsers.find((u) => u.role === targetRole) || initialUsers[0];
      const res = await api.auth.login(demoTarget.email, 'Demo@1234');
      setAccessToken(res.accessToken);
      setStoredRefreshToken(res.refreshToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchDemoRole,
        getDefaultRouteForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
