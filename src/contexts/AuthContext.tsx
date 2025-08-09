'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userId: number;
  token: string | null;
  isAuthenticated: boolean;
  login: (_email: string, _password: string) => Promise<boolean>;
  signup: (_email: string, _password: string, _name?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (_updates: Partial<User>) => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // トークン検証とユーザー情報取得
  const verifyToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          ...data.data.user,
          createdAt: new Date(data.data.user.createdAt),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // 初期化時にトークンをチェック
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ap-study-token');

      if (storedToken) {
        const isValid = await verifyToken(storedToken);
        if (isValid) {
          setToken(storedToken);
        } else {
          localStorage.removeItem('ap-study-token');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [verifyToken]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data.data;
        setToken(newToken);
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
        });
        localStorage.setItem('ap-study-token', newToken);
        return true;
      } else {
        setError(data.message || 'ログインに失敗しました');
        return false;
      }
    } catch {
      setError('ネットワークエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data.data;
        setToken(newToken);
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
        });
        localStorage.setItem('ap-study-token', newToken);
        return true;
      } else {
        setError(data.message || 'アカウント作成に失敗しました');
        return false;
      }
    } catch {
      setError('ネットワークエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('ap-study-token');
  }, []);

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!user) return;

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    },
    [user]
  );

  const contextValue: AuthContextType = {
    user,
    userId: user?.id || 0,
    token,
    isAuthenticated: user !== null && token !== null,
    login,
    signup,
    logout,
    updateUser,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // サーバーサイドでは警告なしでデフォルト値を返す
    if (typeof window === 'undefined') {
      return {
        user: null,
        userId: 0,
        token: null,
        isAuthenticated: false,
        login: async () => false,
        signup: async () => false,
        logout: () => {},
        updateUser: () => {},
        isLoading: false,
        error: null,
      } as AuthContextType;
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
