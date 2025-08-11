'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * 自動トークンリフレッシュフック
 * 
 * JWTトークンの有効期限（2時間）の75%時点（1時間30分）で自動リフレッシュを実行
 */
export function useAutoRefresh() {
  const { token, isAuthenticated, logout } = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // HttpOnly Cookieを送信
        body: JSON.stringify({}), // 空のボディ（リフレッシュトークンはCookieから取得）
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          console.log('[AutoRefresh] Token refreshed successfully');
          return true;
        }
      }
      
      console.warn('[AutoRefresh] Token refresh failed:', response.status);
      return false;
    } catch (error) {
      console.warn('[AutoRefresh] Token refresh error:', error);
      return false;
    }
  }, []);

  const scheduleRefresh = useCallback(() => {
    // 既存のタイマーをクリア
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // 2時間の75% = 1時間30分 = 5400秒 = 5,400,000ミリ秒
    const REFRESH_INTERVAL = 5400000;

    refreshTimeoutRef.current = setTimeout(async () => {
      console.log('[AutoRefresh] Attempting to refresh token...');
      
      const success = await refreshToken();
      
      if (success) {
        // 成功時は再スケジュール
        scheduleRefresh();
      } else {
        console.warn('[AutoRefresh] Failed to refresh token, logging out...');
        logout();
      }
    }, REFRESH_INTERVAL);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[AutoRefresh] Scheduled token refresh in ${REFRESH_INTERVAL / 1000 / 60} minutes`);
    }
  }, [refreshToken, logout]);

  // 認証状態が変わった時にリフレッシュをスケジュール
  useEffect(() => {
    if (isAuthenticated && token) {
      scheduleRefresh();
    } else {
      // 認証されていない場合はタイマーをクリア
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    }

    // クリーンアップ
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isAuthenticated, token, scheduleRefresh]);

  return {
    refreshToken,
    scheduleRefresh,
  };
}