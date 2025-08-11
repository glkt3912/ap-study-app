'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

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
  
  // 自動リフレッシュフック（認証状態が確立した後にのみ初期化）

  // トークン検証とユーザー情報取得
  const verifyToken = useCallback(async (token?: string): Promise<boolean> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // トークンが提供された場合のみAuthorizationヘッダーを設定
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include', // HttpOnly Cookieを送信
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
      // まずHttpOnly Cookieでの認証を試行
      const isCookieValid = await verifyToken();
      
      if (isCookieValid) {
        setToken('cookie-based'); // Cookieベースの認証を示す
        setIsLoading(false);
        return;
      }
      
      // フォールバック: localStorageのトークンをチェック
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
        credentials: 'include', // HttpOnly Cookieを受信
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data.data;
        
        // Cookieベースの認証を優先
        setToken('cookie-based');
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
        });
        
        // フォールバック用にlocalStorageにも保存
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

    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthContext] Signup attempt:', { 
        email, 
        passwordLength: password.length,
        name,
        apiUrl: `${API_BASE_URL}/api/auth/signup`
      });
    }

    try {
      const requestBody = { email, password, name };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthContext] Sending signup request:', requestBody);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly Cookieを受信
        body: JSON.stringify(requestBody),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthContext] Signup response status:', response.status);
        console.log('[AuthContext] Response headers:', Object.fromEntries(response.headers.entries()));
      }

      const data = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthContext] Signup response data:', data);
      }

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data.data;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthContext] Signup successful, setting user data:', {
            userId: userData.id,
            email: userData.email,
            tokenLength: newToken.length
          });
        }

        // Cookieベースの認証を優先
        setToken('cookie-based');
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
        });
        
        // フォールバック用にlocalStorageにも保存
        localStorage.setItem('ap-study-token', newToken);
        return true;
      } else {
        const errorMessage = data.message || data.error || 'アカウント作成に失敗しました';
        
        if (process.env.NODE_ENV === 'development') {
          console.error('[AuthContext] Signup failed:', {
            status: response.status,
            statusText: response.statusText,
            data,
            errorMessage
          });
        }

        setError(errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = 'ネットワークエラーが発生しました';
      
      if (process.env.NODE_ENV === 'development') {
        console.error('[AuthContext] Signup network error:', error);
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // サーバーサイドログアウト（Cookieクリア）
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Server logout failed:', error);
    }
    
    // クライアントサイドの状態をクリア
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

  return (
    <AuthContext.Provider value={contextValue}>
      <AutoRefreshProvider isAuthenticated={contextValue.isAuthenticated} token={token}>
        {children}
      </AutoRefreshProvider>
    </AuthContext.Provider>
  );
}

// 自動リフレッシュを管理するコンポーネント
function AutoRefreshProvider({ 
  children, 
  isAuthenticated, 
  token 
}: { 
  children: React.ReactNode;
  isAuthenticated: boolean;
  token: string | null;
}) {
  useAutoRefresh();
  return <>{children}</>;
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
