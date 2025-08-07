/**
 * パフォーマンス分析システム
 * メトリクス収集、ボトルネック検出、最適化提案
 */

import { monitoring } from './monitoring';

// パフォーマンスメトリクス型定義
interface PerformanceMetrics {
  navigation: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
  };
  resources: {
    jsSize: number;
    cssSize: number;
    imageSize: number;
    totalSize: number;
    resourceCount: number;
    cacheHitRate: number;
  };
  runtime: {
    heapUsed: number;
    heapTotal: number;
    jsHeapSizeLimit: number;
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
  userInteraction: {
    averageInteractionTime: number;
    slowInteractions: number;
    inputDelay: number;
    scrollPerformance: number;
  };
  api: {
    averageResponseTime: number;
    slowRequests: Array<{
      url: string;
      duration: number;
      method: string;
    }>;
    errorRate: number;
    cacheHitRate: number;
  };
}

// ボトルネック情報
interface PerformanceBottleneck {
  type: 'loading' | 'rendering' | 'javascript' | 'network' | 'memory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  currentValue: number;
  threshold: number;
  impact: string;
  recommendations: string[];
}

// 最適化提案
interface OptimizationSuggestion {
  category: 'bundle' | 'images' | 'caching' | 'api' | 'rendering' | 'memory';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string[];
  expectedImprovement: {
    metric: string;
    improvement: string;
  };
  effort: 'low' | 'medium' | 'high';
}

class PerformanceAnalyzer {
  private metrics: PerformanceMetrics | null = null;
  private isAnalyzing = false;
  private analysisCallbacks: ((_analysis: PerformanceAnalysis) => void)[] = [];

  /**
   * パフォーマンス分析を実行
   */
  public async analyzePerformance(): Promise<PerformanceAnalysis> {
    if (this.isAnalyzing) {
      throw new Error('Performance analysis is already in progress');
    }

    this.isAnalyzing = true;

    try {
      // メトリクス収集
      const metrics = await this.collectMetrics();
      this.metrics = metrics;

      // ボトルネック分析
      const bottlenecks = this.detectBottlenecks(metrics);

      // 最適化提案生成
      const suggestions = this.generateOptimizationSuggestions(metrics, bottlenecks);

      // パフォーマンススコア計算
      const score = this.calculatePerformanceScore(metrics);

      const analysis: PerformanceAnalysis = {
        timestamp: new Date().toISOString(),
        metrics,
        bottlenecks,
        suggestions,
        score,
        summary: this.generateSummary(metrics, bottlenecks, score),
      };

      // コールバック実行
      this.analysisCallbacks.forEach(callback => {
        try {
          callback(analysis);
        } catch (error) {
          // console.error('Error in performance analysis callback:', error);
        }
      });

      // 監視システムにカスタムメトリクスを記録
      monitoring.trackCustomMetric('performance_analysis_completed', 1, {
        score: score.overall,
        bottleneckCount: bottlenecks.length,
        suggestionCount: suggestions.length,
      });

      return analysis;

    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * メトリクス収集
   */
  private async collectMetrics(): Promise<PerformanceMetrics> {
    const [navigationMetrics, resourceMetrics, runtimeMetrics, interactionMetrics, apiMetrics] = 
      await Promise.all([
        this.collectNavigationMetrics(),
        this.collectResourceMetrics(),
        this.collectRuntimeMetrics(),
        this.collectInteractionMetrics(),
        this.collectApiMetrics(),
      ]);

    return {
      navigation: navigationMetrics,
      resources: resourceMetrics,
      runtime: runtimeMetrics,
      userInteraction: interactionMetrics,
      api: apiMetrics,
    };
  }

  /**
   * ナビゲーションメトリクス収集
   */
  private async collectNavigationMetrics(): Promise<PerformanceMetrics['navigation']> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({
          domContentLoaded: 0,
          loadComplete: 0,
          firstPaint: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          firstInputDelay: 0,
          cumulativeLayoutShift: 0,
          timeToInteractive: 0,
        });
        return;
      }

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      // Web Vitalsを非同期で取得
      Promise.all([
        import('web-vitals').then(({ onCLS }) => 
          new Promise<number>(resolve => onCLS((metric: any) => resolve(metric.value)))
        ).catch(() => 0),
        import('web-vitals').then(({ onINP }) => 
          new Promise<number>(resolve => onINP((metric: any) => resolve(metric.value)))
        ).catch(() => 0),
        import('web-vitals').then(({ onLCP }) => 
          new Promise<number>(resolve => onLCP((metric: any) => resolve(metric.value)))
        ).catch(() => 0),
      ]).then(([cls, inp, lcp]) => {
        resolve({
          domContentLoaded: navigation.domContentLoadedEventEnd - (navigation.requestStart || 0),
          loadComplete: navigation.loadEventEnd - (navigation.requestStart || 0),
          firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: lcp,
          firstInputDelay: inp,
          cumulativeLayoutShift: cls,  
          timeToInteractive: this.estimateTimeToInteractive(navigation),
        });
      });
    });
  }

  /**
   * リソースメトリクス収集
   */
  private async collectResourceMetrics(): Promise<PerformanceMetrics['resources']> {
    if (typeof window === 'undefined') {
      return {
        jsSize: 0, cssSize: 0, imageSize: 0, totalSize: 0, resourceCount: 0, cacheHitRate: 0
      };
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let jsSize = 0, cssSize = 0, imageSize = 0, totalSize = 0;
    let cacheHits = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        cacheHits++;
      }

      const resourceType = this.getResourceType(resource);
      switch (resourceType) {
        case 'javascript':
          jsSize += size;
          break;
        case 'css':
          cssSize += size;
          break;
        case 'image':
          imageSize += size;
          break;
      }
    });

    return {
      jsSize,
      cssSize,
      imageSize,
      totalSize,
      resourceCount: resources.length,
      cacheHitRate: resources.length > 0 ? cacheHits / resources.length : 0,
    };
  }

  /**
   * ランタイムメトリクス収集
   */
  private async collectRuntimeMetrics(): Promise<PerformanceMetrics['runtime']> {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return {
        heapUsed: 0, heapTotal: 0, jsHeapSizeLimit: 0, usedJSHeapSize: 0, totalJSHeapSize: 0
      };
    }

    const memory = (performance as any).memory;
    return {
      heapUsed: memory.usedJSHeapSize,
      heapTotal: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
    };
  }

  /**
   * ユーザーインタラクションメトリクス収集
   */
  private async collectInteractionMetrics(): Promise<PerformanceMetrics['userInteraction']> {
    // 実際の実装では、ユーザーインタラクションを追跡する必要があります
    // ここでは簡略化した実装
    return {
      averageInteractionTime: 50,
      slowInteractions: 0,
      inputDelay: 10,
      scrollPerformance: 16,
    };
  }

  /**
   * API メトリクス収集
   */
  private async collectApiMetrics(): Promise<PerformanceMetrics['api']> {
    // 実際の実装では、API 呼び出し履歴から統計を取得
    // ここでは簡略化した実装
    return {
      averageResponseTime: 200,
      slowRequests: [],
      errorRate: 0,
      cacheHitRate: 0.8,
    };
  }

  /**
   * ボトルネック検出
   */
  private detectBottlenecks(metrics: PerformanceMetrics): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];

    // LCP (Largest Contentful Paint) チェック
    if (metrics.navigation.largestContentfulPaint > 2500) {
      bottlenecks.push({
        type: 'loading',
        severity: metrics.navigation.largestContentfulPaint > 4000 ? 'critical' : 'high',
        metric: 'Largest Contentful Paint',
        currentValue: metrics.navigation.largestContentfulPaint,
        threshold: 2500,
        impact: 'ページの主要コンテンツの表示が遅い',
        recommendations: [
          '画像の最適化（WebP、適切なサイズ）',
          'Critical CSS のインライン化',
          'リソースの事前読み込み（preload）',
          'CDN の使用',
        ],
      });
    }

    // FID (First Input Delay) チェック
    if (metrics.navigation.firstInputDelay > 100) {
      bottlenecks.push({
        type: 'javascript',
        severity: metrics.navigation.firstInputDelay > 300 ? 'critical' : 'high',
        metric: 'First Input Delay',
        currentValue: metrics.navigation.firstInputDelay,
        threshold: 100,
        impact: 'ユーザーの最初のインタラクションの反応が遅い',
        recommendations: [
          'JavaScript バンドルの分割',
          '非同期処理の最適化',
          'Web Workers の使用',
          'メインスレッドの負荷軽減',
        ],
      });
    }

    // CLS (Cumulative Layout Shift) チェック
    if (metrics.navigation.cumulativeLayoutShift > 0.1) {
      bottlenecks.push({
        type: 'rendering',
        severity: metrics.navigation.cumulativeLayoutShift > 0.25 ? 'critical' : 'medium',
        metric: 'Cumulative Layout Shift',
        currentValue: metrics.navigation.cumulativeLayoutShift,
        threshold: 0.1,
        impact: 'レイアウトの予期しない移動',
        recommendations: [
          '画像・動画に size 属性を指定',
          '広告領域の事前確保',
          'フォント読み込みの最適化',
          'CSS の計算値の事前設定',
        ],
      });
    }

    // バンドルサイズチェック
    if (metrics.resources.jsSize > 1024 * 1024) { // 1MB
      bottlenecks.push({
        type: 'network',
        severity: metrics.resources.jsSize > 2 * 1024 * 1024 ? 'high' : 'medium',
        metric: 'JavaScript Bundle Size',
        currentValue: metrics.resources.jsSize,
        threshold: 1024 * 1024,
        impact: 'JavaScript ファイルが大きすぎる',
        recommendations: [
          'Code splitting の実装',
          '未使用コードの除去（Tree shaking）',
          'Dynamic imports の使用',
          'ライブラリの見直し',
        ],
      });
    }

    // メモリ使用量チェック
    const memoryUsage = metrics.runtime.usedJSHeapSize / metrics.runtime.jsHeapSizeLimit;
    if (memoryUsage > 0.8) {
      bottlenecks.push({
        type: 'memory',
        severity: memoryUsage > 0.9 ? 'critical' : 'high',
        metric: 'Memory Usage',
        currentValue: memoryUsage * 100,
        threshold: 80,
        impact: 'メモリ使用量が多すぎる',
        recommendations: [
          'メモリリークの調査・修正',
          '不要なオブジェクトの解放',
          '画像・データのキャッシュ最適化',
          'コンポーネントの適切なクリーンアップ',
        ],
      });
    }

    return bottlenecks;
  }

  /**
   * 最適化提案生成
   */
  private generateOptimizationSuggestions(
    metrics: PerformanceMetrics, 
    bottlenecks: PerformanceBottleneck[]
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // ボトルネックベースの提案
    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.type) {
        case 'loading':
          suggestions.push({
            category: 'images',
            priority: 'high',
            title: '画像最適化',
            description: '画像のサイズとフォーマットを最適化してロード時間を短縮',
            implementation: [
              'WebP または AVIF フォーマットの使用',
              '適切なサイズでの画像提供',
              'Lazy loading の実装',
              '画像圧縮の強化',
            ],
            expectedImprovement: {
              metric: 'LCP',
              improvement: '20-40%短縮',
            },
            effort: 'medium',
          });
          break;

        case 'network':
          suggestions.push({
            category: 'bundle',
            priority: 'high',
            title: 'バンドル最適化',
            description: 'JavaScript バンドルのサイズを削減してネットワーク転送を最適化',
            implementation: [
              'Code splitting の実装',
              'Dynamic imports の使用',
              'Tree shaking の有効化',
              '未使用ライブラリの除去',
            ],
            expectedImprovement: {
              metric: 'FCP',
              improvement: '30-50%短縮',
            },
            effort: 'high',
          });
          break;
      }
    });

    // 一般的な最適化提案
    if (metrics.resources.cacheHitRate < 0.7) {
      suggestions.push({
        category: 'caching',
        priority: 'medium',
        title: 'キャッシュ戦略の改善',
        description: 'ブラウザキャッシュを効果的に活用してリソース読み込みを高速化',
        implementation: [
          'Cache-Control ヘッダーの最適化',
          'ETag の実装',
          'Service Worker の活用',
          'CDN キャッシュの最適化',
        ],
        expectedImprovement: {
          metric: 'Load Time',
          improvement: '40-60%短縮',
        },
        effort: 'low',
      });
    }

    if (metrics.api.averageResponseTime > 300) {
      suggestions.push({
        category: 'api',
        priority: 'medium',
        title: 'API レスポンス最適化',
        description: 'API の応答時間を短縮してユーザー体験を向上',
        implementation: [
          'データベースクエリの最適化',
          'レスポンスキャッシュの実装',
          'API レスポンスの軽量化',
          '並列リクエストの実装',
        ],
        expectedImprovement: {
          metric: 'API Response Time',
          improvement: '30-50%短縮',
        },
        effort: 'medium',
      });
    }

    return suggestions;
  }

  /**
   * パフォーマンススコア計算
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): {
    overall: number;
    loading: number;
    interactivity: number;
    visualStability: number;
  } {
    // Google Lighthouse スコア算出に基づいた簡略化版
    const loading = this.calculateLoadingScore(metrics.navigation);
    const interactivity = this.calculateInteractivityScore(metrics.navigation, metrics.userInteraction);
    const visualStability = this.calculateVisualStabilityScore(metrics.navigation);

    const overall = Math.round((loading * 0.25 + interactivity * 0.25 + visualStability * 0.15) * 4);

    return {
      overall: Math.max(0, Math.min(100, overall)),
      loading: Math.max(0, Math.min(100, loading)),
      interactivity: Math.max(0, Math.min(100, interactivity)),
      visualStability: Math.max(0, Math.min(100, visualStability)),
    };
  }

  /**
   * 分析結果サマリー生成
   */
  private generateSummary(
    metrics: PerformanceMetrics, 
    bottlenecks: PerformanceBottleneck[], 
    score: ReturnType<typeof this.calculatePerformanceScore>
  ): string {
    const criticalIssues = bottlenecks.filter(b => b.severity === 'critical').length;
    const highIssues = bottlenecks.filter(b => b.severity === 'high').length;

    if (score.overall >= 90) {
      return '優秀なパフォーマンスです。小さな最適化でさらに向上させることができます。';
    } else if (score.overall >= 70) {
      return `良好なパフォーマンスですが、${highIssues + criticalIssues}件の改善点があります。`;
    } else if (score.overall >= 50) {
      return `パフォーマンスに改善の余地があります。特に${criticalIssues > 0 ? '重要な' : ''}${bottlenecks.length}件の問題に対処してください。`;
    } else {
      return `パフォーマンスに深刻な問題があります。${criticalIssues}件の重要な問題を優先的に解決してください。`;
    }
  }

  // コールバック登録
  public onAnalysisComplete(callback: (_analysis: PerformanceAnalysis) => void): void {
    this.analysisCallbacks.push(callback);
  }

  // 現在のメトリクス取得
  public getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  // プライベートヘルパーメソッド
  private getResourceType(resource: PerformanceResourceTiming): string {
    const name = resource.name.toLowerCase();
    if (name.includes('.js') || resource.initiatorType === 'script') return 'javascript';
    if (name.includes('.css') || resource.initiatorType === 'css') return 'css';
    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)/) || resource.initiatorType === 'img') return 'image';
    return 'other';
  }

  private estimateTimeToInteractive(navigation: PerformanceNavigationTiming): number {
    // 簡略化された TTI 推定
    return navigation.domContentLoadedEventEnd - (navigation.requestStart || 0) + 1000;
  }

  private calculateLoadingScore(navigation: PerformanceMetrics['navigation']): number {
    const fcp = navigation.firstContentfulPaint;
    const lcp = navigation.largestContentfulPaint;
    
    // FCP スコア (0-100)
    const fcpScore = Math.max(0, 100 - (fcp - 1000) / 40);
    
    // LCP スコア (0-100)  
    const lcpScore = Math.max(0, 100 - (lcp - 2500) / 50);
    
    return (fcpScore + lcpScore) / 2;
  }

  private calculateInteractivityScore(
    navigation: PerformanceMetrics['navigation'],
    _interaction: PerformanceMetrics['userInteraction']
  ): number {
    const fid = navigation.firstInputDelay;
    const tti = navigation.timeToInteractive;
    
    // FID スコア (0-100)
    const fidScore = Math.max(0, 100 - (fid - 100) / 5);
    
    // TTI スコア (0-100)
    const ttiScore = Math.max(0, 100 - (tti - 3800) / 50);
    
    return (fidScore + ttiScore) / 2;
  }

  private calculateVisualStabilityScore(navigation: PerformanceMetrics['navigation']): number {
    const cls = navigation.cumulativeLayoutShift;
    
    // CLS スコア (0-100)
    return Math.max(0, 100 - (cls - 0.1) * 400);
  }
}

// 分析結果型定義
export interface PerformanceAnalysis {
  timestamp: string;
  metrics: PerformanceMetrics;
  bottlenecks: PerformanceBottleneck[];
  suggestions: OptimizationSuggestion[];
  score: {
    overall: number;
    loading: number;
    interactivity: number;
    visualStability: number;
  };
  summary: string;
}

// シングルトンインスタンス
export const performanceAnalyzer = new PerformanceAnalyzer();

export default performanceAnalyzer;