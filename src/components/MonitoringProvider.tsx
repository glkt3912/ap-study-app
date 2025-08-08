'use client';

import React, { useEffect } from 'react';
// monitoring は動的に読み込まれるため直接importしない
import { errorHandler, ErrorCategory } from '@/lib/error-handler';
import { performanceAnalyzer } from '@/lib/performance-analyzer';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  useEffect(() => {
    // 監視システム初期化（development環境でも有効）
    if (typeof window !== 'undefined') {
      // パフォーマンス分析を定期実行
      const performanceAnalysisInterval = setInterval(async () => {
        try {
          if (document.readyState === 'complete') {
            await performanceAnalyzer.analyzePerformance();
          }
        } catch (error) {
          // パフォーマンス分析エラーは静黙にログのみ
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn('Performance analysis failed:', error);
          }
        }
      }, 30000); // 30秒間隔

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
        clearInterval(performanceAnalysisInterval);
        window.removeEventListener('error', handleUnhandledError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }

    return undefined;
  }, []);

  return <>{children}</>;
}
