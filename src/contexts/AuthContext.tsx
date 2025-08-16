'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { validateLoginInput } from '../utils/validation';

interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userId: number;
  token: string | null;
  isAuthenticated: boolean;
  login: (_emailOrUsername: string, _password: string) => Promise<boolean>;
  signup: (_email: string, _password: string, _name?: string, _username?: string) => Promise<boolean>;
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

  // トークン検証とユーザー情報取得（環境別認証戦略）
  const verifyToken = useCallback(async (fallbackToken?: string): Promise<boolean> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // 開発環境での認証戦略
      if (process.env.NODE_ENV === 'development') {
        // 開発環境では認証を柔軟に処理
        if (fallbackToken) {
          headers.Authorization = `Bearer ${fallbackToken}`;
        }
        // ログ出力で認証状態を確認
        console.log('Auth verification in development mode', {
          hasFallbackToken: !!fallbackToken,
          endpoint: `${API_BASE_URL}/api/auth/me`
        });
      } else {
        // 本番環境では厳密な認証
        if (fallbackToken) {
          headers.Authorization = `Bearer ${fallbackToken}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include', // HttpOnly Cookieを優先して送信
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setUser({
            ...data.data.user,
            createdAt: new Date(data.data.user.createdAt),
          });
          return true;
        }
      }
      
      // 開発環境では認証失敗をログ出力
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth verification failed', {
          status: response.status,
          statusText: response.statusText
        });
      }
      
      return false;
    } catch (error) {
      // 開発環境ではエラー詳細をログ出力
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth verification error', error);
      }
      return false;
    }
  }, []);

  // 初期化時にトークンをチェック（HttpOnly Cookie優先）
  useEffect(() => {
    const initAuth = async () => {
      // HttpOnly Cookieでの認証を優先して試行
      const isCookieValid = await verifyToken();
      
      if (isCookieValid) {
        setToken('cookie-authenticated'); // Cookie認証成功を示す
        setIsLoading(false);
        return;
      }
      
      // フォールバック: localStorageのトークンをチェック
      const storedToken = localStorage.getItem('ap-study-token');
      if (storedToken) {
        const isTokenValid = await verifyToken(storedToken);
        if (isTokenValid) {
          setToken(storedToken);
          setIsLoading(false);
          return;
        } else {
          // 無効なトークンを削除
          localStorage.removeItem('ap-study-token');
        }
      }

      // 認証に失敗した場合
      setIsLoading(false);
    };

    initAuth();
  }, [verifyToken]);

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // クライアントサイドバリデーション
    const validation = validateLoginInput(emailOrUsername, password);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      setIsLoading(false);
      return false;
    }

    try {
      const requestBody = {
        emailOrUsername: emailOrUsername.trim(),
        password,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly Cookieを受信
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data.data;
        
        // Cookie認証が成功
        setToken('cookie-authenticated');
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
        });
        
        // フォールバック用にlocalStorageにも保存
        if (newToken) {
          localStorage.setItem('ap-study-token', newToken);
        }
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

  const signup = useCallback(async (
    email: string, 
    password: string, 
    name?: string, 
    username?: string
  ): Promise<boolean> => {
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
      const requestBody = { email, password, name, username };
      
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

        // Cookie認証が成功
        setToken('cookie-authenticated');
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt),
        });
        
        // フォールバック用にlocalStorageにも保存
        if (newToken) {
          localStorage.setItem('ap-study-token', newToken);
        }
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
      <AutoRefreshProvider _isAuthenticated={contextValue.isAuthenticated} _token={token}>
        {children}
      </AutoRefreshProvider>
    </AuthContext.Provider>
  );
}

// 自動リフレッシュを管理するコンポーネント
function AutoRefreshProvider({ 
  children, 
  _isAuthenticated, 
  _token 
}: { 
  children: React.ReactNode;
  _isAuthenticated: boolean;
  _token: string | null;
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
