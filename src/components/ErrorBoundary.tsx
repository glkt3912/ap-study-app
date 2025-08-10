/**
 * React Error Boundary - 監視システム統合
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { reportError } from '@/lib/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 監視システムにエラー報告
    reportError(error, errorInfo);

    // カスタムエラーハンドラがあれば実行
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center container-primary z-modal-backdrop'>
          <div className='max-w-md w-full card-primary p-6 shadow-strong hover-lift z-modal'>
            <div className='flex items-center mb-4'>
              <div className='flex-shrink-0'>
                <svg className='h-8 w-8 text-red-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-lg font-medium text-primary'>アプリケーションエラー</h3>
              </div>
            </div>

            <div className='text-sm text-secondary mb-4'>
              予期しないエラーが発生しました。しばらく待ってから再度お試しください。
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mb-4 hover-lift'>
                <summary className='cursor-pointer text-sm font-medium text-tertiary mb-2 click-shrink focus-ring'>
                  エラー詳細（開発環境）
                </summary>
                <div className='bg-slate-100 dark:bg-slate-700 p-3 rounded text-xs font-mono overflow-auto max-h-40 scrollbar-modern'>
                  <div className='mb-2'>
                    <strong>エラー:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>スタックトレース:</strong>
                      <pre className='whitespace-pre-wrap mt-1'>{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div className='mt-2'>
                      <strong>コンポーネントスタック:</strong>
                      <pre className='whitespace-pre-wrap mt-1'>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className='flex space-x-3'>
              <button
                onClick={() => window.location.reload()}
                className='flex-1 btn-primary hover-lift click-shrink focus-ring'
              >
                ページを再読み込み
              </button>
              <button
                onClick={() => window.history.back()}
                className='flex-1 btn-secondary hover-lift click-shrink focus-ring'
              >
                前のページに戻る
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
