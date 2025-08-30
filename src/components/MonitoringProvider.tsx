'use client';

import React, { useEffect } from 'react';
import { errorHandler, ErrorCategory } from '@/lib/error-handler';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  useEffect(() => {
    // 監視システム初期化（development環境でも有効）
    if (typeof window !== 'undefined') {
      // グローバルエラーハンドラー設定
      const handleUnhandledError = (event: ErrorEvent) => {
        errorHandler.handleError(event.error, {
          category: ErrorCategory.CLIENT,
          url: window.location.href,
        });
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        errorHandler.handleNetworkError(event.reason, {
          url: window.location.href,
          method: 'unknown',
        });
      };

      // リスナー追加
      window.addEventListener('error', handleUnhandledError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // クリーンアップ
      return () => {
        window.removeEventListener('error', handleUnhandledError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }

    return undefined;
  }, []);

  return <>{children}</>;
}
