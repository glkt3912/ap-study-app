/**
 * フロントエンド監視・エラートラッキングシステム
 * Web Vitals、エラー追跡、ユーザー行動分析を統合
 */

// Web Vitals 型定義
interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
}

// エラー追跡型定義
interface ErrorEvent {
  message: string;
  filename: string;
  lineno: number;
  colno: number;
  error: Error | null;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
}

// パフォーマンス追跡型定義
interface PerformanceEvent {
  type: 'navigation' | 'resource' | 'api' | 'user-interaction';
  name: string;
  duration: number;
  timestamp: string;
  url: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// ユーザー行動追跡型定義
interface UserEvent {
  type: 'click' | 'scroll' | 'focus' | 'blur' | 'resize' | 'beforeunload';
  target: string;
  timestamp: string;
  url: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private isEnabled: boolean;
  private apiEndpoint: string;
  private batchSize: number = 10;
  private batchTimeout: number = 5000; // 5秒
  private eventQueue: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true';
    this.apiEndpoint = process.env.NEXT_PUBLIC_MONITORING_ENDPOINT || '/api/monitoring';

    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Web Vitals 監視
    this.initWebVitals();

    // エラー監視
    this.initErrorTracking();

    // パフォーマンス監視
    this.initPerformanceTracking();

    // ユーザー行動監視
    this.initUserTracking();

    // ペースの送信処理
    this.initBatchSender();
  }

  /**
   * Web Vitals 監視初期化
   */
  private async initWebVitals() {
    try {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

      const handleMetric = (metric: WebVitalsMetric) => {
        this.trackPerformance({
          type: 'navigation',
          name: `web-vital-${metric.name}`,
          duration: metric.value,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          metadata: {
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
          },
        });
      };

      onCLS(handleMetric);
      onINP(handleMetric);
      onFCP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
    } catch (error) {
      // console.warn('Web Vitals monitoring failed to initialize:', error);
    }
  }

  /**
   * エラー監視初期化
   */
  private initErrorTracking() {
    // JavaScript エラー
    window.addEventListener('error', event => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // Promise rejection エラー
    window.addEventListener('unhandledrejection', event => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        filename: 'unknown',
        lineno: 0,
        colno: 0,
        error: event.reason instanceof Error ? event.reason : null,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // React Error Boundary サポート
    window.addEventListener('react-error', (event: any) => {
      this.trackError({
        message: `React Error: ${event.detail.message}`,
        filename: event.detail.filename || 'react-component',
        lineno: 0,
        colno: 0,
        error: event.detail.error,
        stack: event.detail.error?.stack || event.detail.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });
  }

  /**
   * パフォーマンス監視初期化
   */
  private initPerformanceTracking() {
    // ページロード監視
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        this.trackPerformance({
          type: 'navigation',
          name: 'page-load',
          duration: navigation.loadEventEnd - (navigation.requestStart || 0),
          timestamp: new Date().toISOString(),
          url: window.location.href,
          metadata: {
            domContentLoaded: navigation.domContentLoadedEventEnd - (navigation.requestStart || 0),
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          },
        });
      }, 0);
    });

    // リソース読み込み監視
    new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.trackPerformance({
            type: 'resource',
            name: resourceEntry.name,
            duration: resourceEntry.duration,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            metadata: {
              initiatorType: resourceEntry.initiatorType,
              transferSize: resourceEntry.transferSize,
              encodedBodySize: resourceEntry.encodedBodySize,
              decodedBodySize: resourceEntry.decodedBodySize,
            },
          });
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }

  /**
   * ユーザー行動監視初期化
   */
  private initUserTracking() {
    // クリック追跡
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      this.trackUserEvent({
        type: 'click',
        target: this.getElementSelector(target),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        metadata: {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        },
      });
    });

    // スクロール追跡（デバウンス処理）
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackUserEvent({
          type: 'scroll',
          target: 'window',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          metadata: {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
            innerHeight: window.innerHeight,
            scrollHeight: document.documentElement.scrollHeight,
          },
        });
      }, 100);
    });

    // ページ離脱追跡
    window.addEventListener('beforeunload', () => {
      this.trackUserEvent({
        type: 'beforeunload',
        target: 'window',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        metadata: {
          sessionDuration: Date.now() - (performance.timeOrigin || Date.now()),
        },
      });

      // 残りのイベントを即座に送信
      this.flushEvents();
    });
  }

  /**
   * バッチ送信システム初期化
   */
  private initBatchSender() {
    this.batchTimer = setTimeout(() => {
      this.sendBatch();
    }, this.batchTimeout);
  }

  /**
   * エラー追跡
   */
  public trackError(error: ErrorEvent) {
    if (!this.isEnabled) return;

    // console.error('Frontend Error Tracked:', error);
    this.addToQueue('error', error);
  }

  /**
   * パフォーマンス追跡
   */
  public trackPerformance(performance: PerformanceEvent) {
    if (!this.isEnabled) return;

    this.addToQueue('performance', performance);
  }

  /**
   * ユーザー行動追跡
   */
  public trackUserEvent(event: UserEvent) {
    if (!this.isEnabled) return;

    this.addToQueue('user-event', event);
  }

  /**
   * API呼び出し追跡
   */
  public trackApiCall(url: string, method: string, duration: number, status: number, error?: Error) {
    if (!this.isEnabled) return;

    this.trackPerformance({
      type: 'api',
      name: `${method} ${url}`,
      duration,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      metadata: {
        method,
        status,
        error: error?.message,
      },
    });
  }

  /**
   * カスタムメトリクス追跡
   */
  public trackCustomMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    this.trackPerformance({
      type: 'user-interaction',
      name,
      duration: value,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...(metadata && { metadata }),
    });
  }

  /**
   * イベントをキューに追加
   */
  private addToQueue(type: string, data: any) {
    this.eventQueue.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });

    if (this.eventQueue.length >= this.batchSize) {
      this.sendBatch();
    }
  }

  /**
   * バッチ送信
   */
  private async sendBatch() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        }),
      });
    } catch (error) {
      // console.error('Failed to send monitoring events:', error);
      // 失敗したイベントを再キューに追加（無限ループ防止のため制限付き）
      if (events.length < 100) {
        this.eventQueue.unshift(...events);
      }
    }

    // 次のバッチタイマー設定
    this.batchTimer = setTimeout(() => {
      this.sendBatch();
    }, this.batchTimeout);
  }

  /**
   * 残りのイベントを即座に送信
   */
  private flushEvents() {
    if (this.eventQueue.length > 0) {
      navigator.sendBeacon(
        this.apiEndpoint,
        JSON.stringify({
          events: this.eventQueue,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        })
      );
    }
  }

  /**
   * DOM要素のセレクタを取得
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }

    return element.tagName.toLowerCase();
  }
}

// シングルトンインスタンス
export const monitoring = new MonitoringService();

// React Error Boundary サポート
export const reportError = (error: Error, errorInfo: any) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('react-error', {
      detail: {
        message: error.message,
        error,
        componentStack: errorInfo.componentStack,
      },
    });
    window.dispatchEvent(event);
  }
};

export default MonitoringService;
