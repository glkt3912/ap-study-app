'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api';

interface ApiTestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  responseTime: number;
  statusCode?: number;
  error?: string;
  data?: any;
}

export default function ApiTestPage() {
  const [tests, setTests] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const apiEndpoints = useMemo(
    () => [
      { name: 'Health Check', endpoint: '/api/health', method: 'GET' },
      { name: 'Study Plan', endpoint: '/api/study-plan', method: 'GET' },
      { name: 'Study Log', endpoint: '/api/study-log', method: 'GET' },
      { name: 'Test Records', endpoint: '/api/test-records', method: 'GET' },
    ],
    []
  );

  const runSingleTest = async (endpoint: string, method: string = 'GET'): Promise<ApiTestResult> => {
    const startTime = performance.now();

    try {
      let response: Response;

      switch (method) {
        case 'GET':
          if (endpoint === '/api/study-plan') {
            const data = await apiClient.getStudyPlan();
            return {
              endpoint,
              status: 'success',
              responseTime: Math.round(performance.now() - startTime),
              statusCode: 200,
              data: data.slice(0, 1), // 最初の1件のみ表示
            };
          }
          response = await fetch(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch {
          data = await response.text();
        }

        return {
          endpoint,
          status: 'success',
          responseTime,
          statusCode: response.status,
          data: typeof data === 'object' ? JSON.stringify(data, null, 2).slice(0, 200) + '...' : data,
        };
      } else {
        return {
          endpoint,
          status: 'error',
          responseTime,
          statusCode: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      return {
        endpoint,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setTests([]);

    for (const api of apiEndpoints) {
      // テスト開始状態を追加
      setTests(prev => [
        ...prev,
        {
          endpoint: api.endpoint,
          status: 'pending',
          responseTime: 0,
        },
      ]);

      // APIテスト実行
      const result = await runSingleTest(api.endpoint, api.method);

      // 結果を更新
      setTests(prev => prev.map(test => (test.endpoint === api.endpoint ? result : test)));

      // 次のテストまで少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunning(false);
  }, [apiEndpoints]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  useEffect(() => {
    // ページ読み込み時に自動実行
    runAllTests();
  }, [runAllTests]);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 p-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>🔌 API接続テスト</h1>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-400 transition-all duration-200'
          >
            {isRunning ? '🔄 テスト中...' : '🚀 テスト実行'}
          </button>
        </div>

        {/* テスト進行状況 */}
        {isRunning && (
          <div className='mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4'>
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3'></div>
              <span className='text-blue-700 dark:text-blue-300'>API接続テストを実行中...</span>
            </div>
          </div>
        )}

        {/* テスト結果 */}
        <div className='grid gap-6'>
          {tests.map((test, index) => (
            <div key={test.endpoint} className='card-primary rounded-lg shadow p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center'>
                  <span className='text-2xl mr-3'>{getStatusIcon(test.status)}</span>
                  <div>
                    <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
                      {apiEndpoints[index]?.name || test.endpoint}
                    </h3>
                    <p className='text-sm text-slate-600 dark:text-slate-400'>{test.endpoint}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <div className={`font-bold ${getStatusColor(test.status)}`}>{test.status.toUpperCase()}</div>
                  {test.responseTime > 0 && (
                    <div className='text-sm text-slate-600 dark:text-slate-400'>{test.responseTime}ms</div>
                  )}
                </div>
              </div>

              {/* ステータスコード */}
              {test.statusCode && (
                <div className='mb-2'>
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>Status Code:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                      test.statusCode >= 200 && test.statusCode < 300
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {test.statusCode}
                  </span>
                </div>
              )}

              {/* エラー詳細 */}
              {test.error && (
                <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded'>
                  <h4 className='font-medium text-red-800 dark:text-red-200 mb-1'>エラー詳細:</h4>
                  <code className='text-sm text-red-700 dark:text-red-300'>{test.error}</code>
                </div>
              )}

              {/* レスポンスデータ */}
              {test.data && (
                <div className='mt-4'>
                  <h4 className='font-medium text-slate-700 dark:text-slate-300 mb-2'>レスポンスデータ:</h4>
                  <pre className='bg-slate-100 dark:bg-slate-700 p-3 rounded text-xs overflow-x-auto'>
                    <code className='text-slate-800 dark:text-slate-200'>
                      {typeof test.data === 'string' ? test.data : JSON.stringify(test.data, null, 2)}
                    </code>
                  </pre>
                </div>
              )}

              {/* パフォーマンス評価 */}
              {test.responseTime > 0 && (
                <div className='mt-3 flex items-center'>
                  <span className='text-sm text-slate-600 dark:text-slate-400 mr-2'>Performance:</span>
                  {test.responseTime < 200 ? (
                    <span className='px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs sm:text-sm'>
                      🚀 高速
                    </span>
                  ) : test.responseTime < 1000 ? (
                    <span className='px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded text-xs sm:text-sm'>
                      ⚡ 普通
                    </span>
                  ) : (
                    <span className='px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs sm:text-sm'>
                      🐌 低速
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 診断情報 */}
        <div className='mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4'>📊 API診断ガイド</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm'>
            <div>
              <h3 className='font-bold text-green-600 dark:text-green-400 mb-2'>✅ 正常パターン</h3>
              <ul className='space-y-1 text-slate-700 dark:text-slate-300'>
                <li>• Status Code: 200-299</li>
                <li>• Response Time: &lt;200ms (高速)</li>
                <li>• Data: JSON形式で返却</li>
                <li>• Error: なし</li>
              </ul>
            </div>
            <div>
              <h3 className='font-bold text-red-600 dark:text-red-400 mb-2'>❌ 問題パターン</h3>
              <ul className='space-y-1 text-slate-700 dark:text-slate-300'>
                <li>• Status Code: 404 (Not Found)</li>
                <li>• Status Code: 500 (Server Error)</li>
                <li>• Response Time: &gt;2000ms</li>
                <li>• Connection Error</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className='mt-8 text-center'>
          <button
            onClick={() => window.history.back()}
            className='px-6 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200'
          >
            ← 前のページに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
