'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { errorHandler, StandardError, ErrorSeverity, ErrorCategory } from '@/lib/error-handler';

interface ErrorToastProps {
  error: StandardError;
  onClose: () => void;
  onAction?: (_action: () => void) => void;
}

function ErrorToast({ error, onClose, onAction: _onAction }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300); // アニメーション後に削除
  }, [onClose]);

  useEffect(() => {
    // 自動非表示タイマー（重要度によって時間調整）
    const timeout =
      error.severity === ErrorSeverity.LOW
        ? 3000
        : error.severity === ErrorSeverity.MEDIUM
          ? 5000
          : error.severity === ErrorSeverity.HIGH
            ? 8000
            : 10000; // CRITICAL

    const timer = setTimeout(() => {
      if (error.severity !== ErrorSeverity.CRITICAL) {
        handleClose();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [error.severity, handleClose]);

  const getSeverityStyles = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ErrorSeverity.HIGH:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'ℹ️';
      case ErrorSeverity.MEDIUM:
        return '⚠️';
      case ErrorSeverity.HIGH:
        return '🚨';
      case ErrorSeverity.CRITICAL:
        return '🔴';
      default:
        return '❓';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 max-w-md w-full mx-auto p-4 rounded-lg border shadow-lg z-50
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getSeverityStyles()}
      `}
    >
      <div className='flex items-start space-x-3'>
        <span className='text-xl'>{getSeverityIcon()}</span>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-semibold'>エラーが発生しました ({error.severity})</h4>
            <button
              onClick={handleClose}
              className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
              aria-label='閉じる'
            >
              ✕
            </button>
          </div>

          <p className='text-sm mt-1 text-gray-700 dark:text-gray-300'>{error.userMessage}</p>

          {/* 詳細エラー情報（開発環境のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <details className='mt-2'>
              <summary className='text-xs text-gray-600 cursor-pointer'>詳細情報（開発環境）</summary>
              <pre className='text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto'>
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}

          {/* 復旧アクション */}
          {error.recoveryActions && error.recoveryActions.length > 0 && (
            <div className='flex space-x-2 mt-3'>
              {error.recoveryActions.slice(0, 2).map((recoveryAction, index) => (
                <button
                  key={index}
                  onClick={() => {
                    recoveryAction.action();
                    if (_onAction) {
                      _onAction(recoveryAction.action);
                    }
                    handleClose();
                  }}
                  className='text-xs px-3 py-1 bg-white border border-current rounded hover:bg-gray-50 transition-colors'
                >
                  {recoveryAction.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ErrorToastManagerState {
  errors: StandardError[];
}

export function ErrorToastManager() {
  const [state, setState] = useState<ErrorToastManagerState>({ errors: [] });

  useEffect(() => {
    // エラーハンドラーからの通知を受信
    const handleError = (error: StandardError) => {
      setState(prev => ({
        errors: [...prev.errors, error],
      }));
    };

    // 全カテゴリのエラーを監視
    errorHandler.onError(ErrorCategory.NETWORK, handleError);
    errorHandler.onError(ErrorCategory.API, handleError);
    errorHandler.onError(ErrorCategory.AUTHENTICATION, handleError);
    errorHandler.onError(ErrorCategory.VALIDATION, handleError);
    errorHandler.onError(ErrorCategory.SERVER, handleError);
    errorHandler.onError(ErrorCategory.CLIENT, handleError);
    errorHandler.onError(ErrorCategory.UNKNOWN, handleError);

    return () => {
      // クリーンアップは errorHandler 側で管理される
    };
  }, []);

  const removeError = (errorId: string) => {
    setState(prev => ({
      errors: prev.errors.filter(error => error.id !== errorId),
    }));
  };

  return (
    <>
      {state.errors.map((error, _index) => (
        <ErrorToast
          key={error.id}
          error={error}
          onClose={() => removeError(error.id)}
          onAction={_action => {
            // 復旧アクション実行時の追加処理があれば実装
          }}
        />
      ))}
    </>
  );
}
