/**
 * 統合監視ダッシュボード - リアルタイム監視とアラート機能
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import { apiClient } from '@/lib/api';
import { monitoring } from '@/lib/monitoring';

interface SystemMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  totalResponseTime: number;
  statusCodes: Record<number, number>;
  endpointAverages: Record<
    string,
    {
      count: number;
      averageTime: number;
      errorRate: number;
    }
  >;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    user: number;
    system: number;
  };
}

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  environment: string;
  version: string;
}

interface AlertLevel {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  metric?: string;
  value?: number;
  threshold?: number;
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [alerts, setAlerts] = useState<AlertLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // 秒

  // アラート条件チェック
  const checkAlertConditions = useCallback((metrics: SystemMetrics) => {
    const newAlerts: AlertLevel[] = [];
    const now = new Date().toISOString();

    // エラー率チェック
    const errorRate = metrics.requestCount > 0 ? metrics.errorCount / metrics.requestCount : 0;
    if (errorRate > 0.1) {
      // 10%以上
      newAlerts.push({
        level: 'error',
        message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
        timestamp: now,
        metric: 'error_rate',
        value: errorRate,
        threshold: 0.1,
      });
    }

    // レスポンス時間チェック
    if (metrics.averageResponseTime > 1000) {
      // 1秒以上
      newAlerts.push({
        level: 'warning',
        message: `Slow response time: ${metrics.averageResponseTime.toFixed(0)}ms`,
        timestamp: now,
        metric: 'response_time',
        value: metrics.averageResponseTime,
        threshold: 1000,
      });
    }

    // メモリ使用量チェック
    const memoryUsage = metrics.memory.heapUsed / metrics.memory.heapTotal;
    if (memoryUsage > 0.9) {
      // 90%以上
      newAlerts.push({
        level: 'critical',
        message: `High memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
        timestamp: now,
        metric: 'memory_usage',
        value: memoryUsage,
        threshold: 0.9,
      });
    }

    // エンドポイント別チェック
    Object.entries(metrics.endpointAverages).forEach(([endpoint, stats]) => {
      if (stats.errorRate > 0.2) {
        // 20%以上
        newAlerts.push({
          level: 'warning',
          message: `High error rate on ${endpoint}: ${(stats.errorRate * 100).toFixed(1)}%`,
          timestamp: now,
          metric: 'endpoint_error_rate',
          value: stats.errorRate,
          threshold: 0.2,
        });
      }
    });

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 49)]); // 最新50件まで保持
  }, []);

  // メトリクス取得
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/metrics');
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
        checkAlertConditions(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      // console.error('Failed to fetch metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [checkAlertConditions]);

  // ヘルスチェック
  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/health');
      const data = await response.json();

      if (data.success) {
        setHealth(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch health');
      }
    } catch (err) {
      // console.error('Failed to fetch health:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // データ更新
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([fetchMetrics(), fetchHealth()]);
    } catch (err) {
      // console.error('Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMetrics, fetchHealth]);

  // 自動更新設定
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(refreshData, refreshInterval * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval, refreshData]);

  // 初期データ取得
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // メトリクスリセット（開発環境のみ）
  const resetMetrics = async () => {
    if (process.env.NODE_ENV !== 'development') return;

    try {
      const response = await fetch('/api/monitoring/metrics/reset', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        await refreshData();
        monitoring.trackCustomMetric('metrics_reset', 1);
      }
    } catch (err) {
      // console.error('Failed to reset metrics:', err);
    }
  };

  // ユーティリティ関数
  // const formatBytes = (bytes: number) => {
  //   const mb = bytes / 1024 / 1024;
  //   return `${mb.toFixed(1)} MB`;
  // };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getAlertColor = (level: AlertLevel['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'critical':
        return 'text-red-800 bg-red-100 border-red-300';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (errorRate: number, responseTime: number) => {
    if (errorRate > 0.1 || responseTime > 1000) return 'text-red-500';
    if (errorRate > 0.05 || responseTime > 500) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isLoading && !metrics) {
    return (
      <div className='min-h-screen bg-slate-50 dark:bg-slate-900 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6'></div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='card-primary p-6 rounded-lg shadow'>
                  <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2'></div>
                  <div className='h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4'></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* ヘッダー */}
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>システム監視ダッシュボード</h1>

          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={autoRefresh}
                  onChange={e => setAutoRefresh(e.target.checked)}
                  className='rounded'
                />
                <span className='ml-2 text-sm text-gray-600 dark:text-gray-300'>自動更新</span>
              </label>

              <select
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className='text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 card-primary'
                disabled={!autoRefresh}
              >
                <option value={10}>10秒</option>
                <option value={30}>30秒</option>
                <option value={60}>1分</option>
                <option value={300}>5分</option>
              </select>
            </div>

            <button
              onClick={refreshData}
              disabled={isLoading}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-all duration-200'
            >
              {isLoading ? '更新中...' : '手動更新'}
            </button>

            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={resetMetrics}
                className='px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-all duration-200'
              >
                メトリクスリセット
              </button>
            )}
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center'>
              <svg className='w-5 h-5 text-red-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-red-800'>{error}</span>
            </div>
          </div>
        )}

        {/* システム概要 */}
        {metrics && health && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='card-primary p-6 rounded-lg shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>システム状態</p>
                  <p
                    className={`text-2xl font-semibold ${health.status === 'healthy' ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {health.status === 'healthy' ? '正常' : '異常'}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>稼働時間: {formatUptime(health.uptime)}</p>
            </div>

            <div className='card-primary p-6 rounded-lg shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>リクエスト数</p>
                  <p className='text-2xl font-semibold text-blue-600'>{metrics.requestCount.toLocaleString()}</p>
                </div>
                <svg className='w-8 h-8 text-blue-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  />
                </svg>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                エラー: {metrics.errorCount} (
                {((metrics.errorCount / Math.max(metrics.requestCount, 1)) * 100).toFixed(1)}%)
              </p>
            </div>

            <div className='card-primary p-6 rounded-lg shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>平均応答時間</p>
                  <p
                    className={`text-2xl font-semibold ${getStatusColor(
                      metrics.errorCount / Math.max(metrics.requestCount, 1),
                      metrics.averageResponseTime
                    )}`}
                  >
                    {metrics.averageResponseTime.toFixed(0)}ms
                  </p>
                </div>
                <svg className='w-8 h-8 text-yellow-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                総応答時間: {(metrics.totalResponseTime / 1000).toFixed(1)}秒
              </p>
            </div>

            <div className='card-primary p-6 rounded-lg shadow'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>メモリ使用量</p>
                  <p className='text-2xl font-semibold text-purple-600'>{health.memory.used}MB</p>
                </div>
                <svg className='w-8 h-8 text-purple-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                使用率: {((health.memory.used / health.memory.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* アラート */}
        {alerts.length > 0 && (
          <div className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>アラート ({alerts.length})</h2>
            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {alerts.slice(0, 10).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.level)}`}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <span className='font-medium text-sm uppercase tracking-wide mr-2'>{alert.level}</span>
                      <span>{alert.message}</span>
                    </div>
                    <span className='text-xs opacity-75'>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* エンドポイント統計 */}
        {metrics && Object.keys(metrics.endpointAverages).length > 0 && (
          <div className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>エンドポイント統計</h2>
            <div className='card-primary rounded-lg shadow overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                  <thead className='bg-gray-50 dark:bg-gray-700'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        エンドポイント
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        リクエスト数
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        平均応答時間
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        エラー率
                      </th>
                    </tr>
                  </thead>
                  <tbody className='card-primary divide-y divide-gray-200 dark:divide-gray-700'>
                    {Object.entries(metrics.endpointAverages)
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 10)
                      .map(([endpoint, stats]) => (
                        <tr key={endpoint}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                            {endpoint}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                            {stats.count.toLocaleString()}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor(stats.errorRate, stats.averageTime)}`}
                          >
                            {stats.averageTime.toFixed(0)}ms
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor(stats.errorRate, stats.averageTime)}`}
                          >
                            {(stats.errorRate * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ステータスコード分布 */}
        {metrics && Object.keys(metrics.statusCodes).length > 0 && (
          <div>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>ステータスコード分布</h2>
            <div className='card-primary p-6 rounded-lg shadow'>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                {Object.entries(metrics.statusCodes)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([status, count]) => (
                    <div key={status} className='text-center'>
                      <div
                        className={`text-2xl font-bold ${
                          Number(status) >= 400
                            ? 'text-red-500'
                            : Number(status) >= 300
                              ? 'text-yellow-500'
                              : 'text-green-500'
                        }`}
                      >
                        {count}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>{status}</div>
                      <div className='text-xs text-gray-500 dark:text-gray-500'>
                        {((count / metrics.requestCount) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringDashboard;
