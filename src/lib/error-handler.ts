/**
 * 統一エラーハンドリングシステム
 * 標準化されたエラー形式、自動復旧機能、ユーザーフレンドリーメッセージ
 */

import { monitoring } from './monitoring';

// エラー分類
export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// エラー重要度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 標準化エラー型
export interface StandardError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  details?: Record<string, any>;
  timestamp: string;
  context?: {
    url?: string;
    method?: string;
    userId?: string;
    requestId?: string;
    userAgent?: string;
    stackTrace?: string;
  };
  retryable: boolean;
  recoveryActions?: RecoveryAction[];
}

// 復旧アクション型
export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'logout' | 'redirect' | 'custom';
  label: string;
  action: () => Promise<void> | void;
  automatic?: boolean;
  delay?: number; // ms
}

// エラーハンドリング設定
interface ErrorHandlerConfig {
  enableAutoRetry: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
  enableUserNotification: boolean;
  enableReporting: boolean;
  reportingThreshold: ErrorSeverity;
}

class ErrorHandler {
  private config: ErrorHandlerConfig;
  private retryAttempts: Map<string, number> = new Map();
  private errorHistory: StandardError[] = [];
  private errorCallbacks: Map<ErrorCategory, ((_error: StandardError) => void)[]> = new Map();

  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = {
      enableAutoRetry: true,
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
      enableUserNotification: true,
      enableReporting: true,
      reportingThreshold: ErrorSeverity.MEDIUM,
      ...config,
    };
  }

  /**
   * エラーを標準化形式に変換
   */
  public standardizeError(
    error: Error | any,
    context?: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      code?: string;
      userMessage?: string;
      url?: string;
      method?: string;
      userId?: string;
      requestId?: string;
    }
  ): StandardError {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();

    // エラーカテゴリを自動判定
    const category = context?.category || this.categorizeError(error);
    const severity = context?.severity || this.determineSeverity(category, error);
    
    const standardError: StandardError = {
      id: errorId,
      category,
      severity,
      code: context?.code || error?.code || this.generateErrorCode(category),
      message: error?.message || 'Unknown error occurred',
      userMessage: context?.userMessage || this.generateUserMessage(category, error),
      details: {
        originalError: error?.name,
        originalMessage: error?.message,
        statusCode: error?.status || error?.statusCode,
      },
      timestamp,
      context: {
        url: context?.url || (typeof window !== 'undefined' ? window.location.href : undefined),
        method: context?.method,
        userId: context?.userId,
        requestId: context?.requestId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        stackTrace: error?.stack,
      },
      retryable: this.isRetryable(category, error),
      recoveryActions: this.generateRecoveryActions(category, error),
    };

    return standardError;
  }

  /**
   * エラーを処理
   */
  public async handleError(
    error: Error | any,
    context?: Parameters<typeof this.standardizeError>[1]
  ): Promise<StandardError> {
    const standardError = this.standardizeError(error, context);
    
    // エラー履歴に追加
    this.errorHistory.unshift(standardError);
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(0, 100);
    }

    // 監視システムに報告
    if (this.config.enableReporting && this.shouldReport(standardError)) {
      this.reportError(standardError);
    }

    // カテゴリ別コールバック実行
    const callbacks = this.errorCallbacks.get(standardError.category) || [];
    callbacks.forEach(callback => {
      try {
        callback(standardError);
      } catch (callbackError) {
        // console.error('Error in error callback:', callbackError);
      }
    });

    // 自動復旧試行
    if (this.config.enableAutoRetry && standardError.retryable) {
      await this.attemptAutoRecovery(standardError);
    }

    // ユーザー通知
    if (this.config.enableUserNotification) {
      this.notifyUser(standardError);
    }

    return standardError;
  }

  /**
   * API エラー専用ハンドラー
   */
  public async handleApiError(
    error: any,
    endpoint: string,
    method: string,
    context?: {
      userId?: string;
      requestId?: string;
      requestData?: any;
    }
  ): Promise<StandardError> {
    const apiContext = {
      category: ErrorCategory.API,
      url: endpoint,
      method,
      userId: context?.userId,
      requestId: context?.requestId,
      code: error?.status?.toString() || 'API_ERROR',
    };

    return this.handleError(error, apiContext);
  }

  /**
   * ネットワークエラー専用ハンドラー
   */
  public async handleNetworkError(
    error: any,
    context?: {
      url?: string;
      method?: string;
      timeout?: boolean;
    }
  ): Promise<StandardError> {
    const networkContext = {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      url: context?.url,
      method: context?.method,
      code: context?.timeout ? 'NETWORK_TIMEOUT' : 'NETWORK_ERROR',
      userMessage: context?.timeout 
        ? 'リクエストがタイムアウトしました。しばらく待ってから再度お試しください。'
        : 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    };

    return this.handleError(error, networkContext);
  }

  /**
   * バリデーションエラー専用ハンドラー
   */
  public handleValidationError(
    fieldErrors: Record<string, string[]>,
    generalMessage?: string
  ): StandardError {
    const validationError = new Error(generalMessage || 'Validation failed');
    
    const validationContext = {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      code: 'VALIDATION_ERROR',
      userMessage: '入力内容に問題があります。エラーメッセージを確認して修正してください。',
    };

    const standardError = this.standardizeError(validationError, validationContext);
    standardError.details = { fieldErrors, ...standardError.details };
    
    return standardError;
  }

  /**
   * エラーカテゴリ別コールバック登録
   */
  public onError(category: ErrorCategory, callback: (error: StandardError) => void): void {
    if (!this.errorCallbacks.has(category)) {
      this.errorCallbacks.set(category, []);
    }
    this.errorCallbacks.get(category)!.push(callback);
  }

  /**
   * エラー履歴取得
   */
  public getErrorHistory(limit?: number): StandardError[] {
    return limit ? this.errorHistory.slice(0, limit) : [...this.errorHistory];
  }

  /**
   * エラー統計取得
   */
  public getErrorStatistics(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    retryableCount: number;
    recentErrors: StandardError[];
  } {
    const byCategory: Record<ErrorCategory, number> = {} as any;
    const bySeverity: Record<ErrorSeverity, number> = {} as any;
    let retryableCount = 0;

    for (const error of this.errorHistory) {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      if (error.retryable) retryableCount++;
    }

    return {
      total: this.errorHistory.length,
      byCategory,
      bySeverity,
      retryableCount,
      recentErrors: this.errorHistory.slice(0, 10),
    };
  }

  // プライベートメソッド

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private categorizeError(error: any): ErrorCategory {
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    
    if (error?.status || error?.statusCode) {
      const status = error.status || error.statusCode;
      if (status === 401) return ErrorCategory.AUTHENTICATION;
      if (status === 403) return ErrorCategory.AUTHORIZATION;
      if (status === 404) return ErrorCategory.NOT_FOUND;
      if (status === 429) return ErrorCategory.RATE_LIMIT;
      if (status >= 400 && status < 500) return ErrorCategory.CLIENT;
      if (status >= 500) return ErrorCategory.SERVER;
      return ErrorCategory.API;
    }

    if (error?.name === 'ValidationError') return ErrorCategory.VALIDATION;
    
    return ErrorCategory.UNKNOWN;
  }

  private determineSeverity(category: ErrorCategory, _error: any): ErrorSeverity {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.HIGH;
      case ErrorCategory.SERVER:
        return ErrorSeverity.CRITICAL;
      case ErrorCategory.NETWORK:
        return ErrorSeverity.HIGH;
      case ErrorCategory.VALIDATION:
        return ErrorSeverity.LOW;
      case ErrorCategory.NOT_FOUND:
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  private generateErrorCode(category: ErrorCategory): string {
    const timestamp = Date.now().toString().slice(-6);
    return `${category.toUpperCase()}_${timestamp}`;
  }

  private generateUserMessage(category: ErrorCategory, _error: any): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'インターネット接続に問題があります。接続を確認して再度お試しください。';
      case ErrorCategory.AUTHENTICATION:
        return 'ログインが必要です。再度ログインしてください。';
      case ErrorCategory.AUTHORIZATION:
        return 'この操作を行う権限がありません。';
      case ErrorCategory.NOT_FOUND:
        return '要求されたリソースが見つかりません。';
      case ErrorCategory.RATE_LIMIT:
        return 'リクエストが多すぎます。しばらく待ってから再度お試しください。';
      case ErrorCategory.VALIDATION:
        return '入力内容に問題があります。';
      case ErrorCategory.SERVER:
        return 'サーバーで問題が発生しました。しばらく待ってから再度お試しください。';
      default:
        return '予期しないエラーが発生しました。問題が続く場合はサポートにお問い合わせください。';
    }
  }

  private isRetryable(category: ErrorCategory, _error: any): boolean {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.RATE_LIMIT:
        return true;
      case ErrorCategory.SERVER:
        const status = _error?.status || _error?.statusCode;
        return status >= 500 && status < 600;
      default:
        return false;
    }
  }

  private generateRecoveryActions(category: ErrorCategory, _error: any): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // 再試行アクション
    if (this.isRetryable(category, _error)) {
      actions.push({
        type: 'retry',
        label: '再試行',
        action: async () => {
          // この処理は呼び出し元で実装される
          window.location.reload();
        },
        automatic: this.config.enableAutoRetry,
        delay: this.config.retryDelayMs,
      });
    }

    // カテゴリ別アクション
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        actions.push({
          type: 'logout',
          label: 'ログアウト',
          action: () => {
            // 認証トークンをクリア
            localStorage.removeItem('auth-token');
            window.location.href = '/login';
          },
        });
        break;

      case ErrorCategory.NETWORK:
        actions.push({
          type: 'refresh',
          label: 'ページを更新',
          action: () => window.location.reload(),
        });
        break;

      case ErrorCategory.NOT_FOUND:
        actions.push({
          type: 'redirect',
          label: 'ホームに戻る',
          action: () => window.location.href = '/',
        });
        break;
    }

    return actions;
  }

  private shouldReport(error: StandardError): boolean {
    const severityLevels = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 1,
      [ErrorSeverity.HIGH]: 2,
      [ErrorSeverity.CRITICAL]: 3,
    };

    return severityLevels[error.severity] >= severityLevels[this.config.reportingThreshold];
  }

  private reportError(error: StandardError): void {
    try {
      monitoring.trackError({
        message: error.message,
        filename: error.context?.url || 'unknown',
        lineno: 0,
        colno: 0,
        error: new Error(error.message),
        stack: error.context?.stackTrace,
        timestamp: error.timestamp,
        userAgent: error.context?.userAgent || 'unknown',
        url: error.context?.url || 'unknown',
        userId: error.context?.userId,
      });
    } catch (reportingError) {
      // console.error('Failed to report error:', reportingError);
    }
  }

  private async attemptAutoRecovery(error: StandardError): Promise<void> {
    const attemptKey = `${error.category}_${error.code}`;
    const attempts = this.retryAttempts.get(attemptKey) || 0;

    if (attempts >= this.config.maxRetryAttempts) {
      return;
    }

    this.retryAttempts.set(attemptKey, attempts + 1);

    const automaticAction = error.recoveryActions?.find(action => action.automatic);
    if (automaticAction) {
      try {
        if (automaticAction.delay) {
          await new Promise(resolve => setTimeout(resolve, automaticAction.delay));
        }
        await automaticAction.action();
        
        // 成功した場合、試行回数をリセット
        this.retryAttempts.delete(attemptKey);
      } catch (recoveryError) {
        // console.error('Auto recovery failed:', recoveryError);
      }
    }
  }

  private notifyUser(_error: StandardError): void {
    // ここでは console.error を使用しているが、実際の実装では
    // Toast通知、モーダル、通知バーなどのUI コンポーネントを使用
    // console.error('User notification:', {
    //   title: `エラーが発生しました (${error.severity})`,
    //   message: error.userMessage,
    //   actions: error.recoveryActions?.map(action => action.label),
    // });

    // 将来的にはここで UI コンポーネントを呼び出し
    // notificationService.show({
    //   type: 'error',
    //   title: `エラーが発生しました (${error.severity})`,
    //   message: error.userMessage,
    //   actions: error.recoveryActions,
    // });
  }
}

// シングルトンインスタンス
export const errorHandler = new ErrorHandler();

// ユーティリティ関数
export const handleError = (error: any, context?: any) => 
  errorHandler.handleError(error, context);

export const handleApiError = (error: any, endpoint: string, method: string, context?: any) =>
  errorHandler.handleApiError(error, endpoint, method, context);

export const handleNetworkError = (error: any, context?: any) =>
  errorHandler.handleNetworkError(error, context);

export const handleValidationError = (fieldErrors: Record<string, string[]>, message?: string) =>
  errorHandler.handleValidationError(fieldErrors, message);

export default errorHandler;