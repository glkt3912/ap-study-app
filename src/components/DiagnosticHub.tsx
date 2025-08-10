'use client';

import Link from 'next/link';
import { useState } from 'react';
import { performanceAnalyzer } from '@/lib/performance-analyzer';
import { errorHandler } from '@/lib/error-handler';

export default function DiagnosticHub() {
  const [performanceResults, setPerformanceResults] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const results = await performanceAnalyzer.analyzePerformance();
      setPerformanceResults(results);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('パフォーマンス分析エラー:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getErrorStatistics = () => {
    const stats = errorHandler.getErrorStatistics();
    setErrorStats(stats);
  };

  const diagnosticPages = [
    {
      title: '🧪 総合診断',
      description: 'CSS・JavaScript・API接続の総合テスト',
      url: '/debug',
      color: 'btn-primary hover-lift click-shrink focus-ring',
    },
    {
      title: '🎨 CSS専用テスト',
      description: 'Tailwind・カスタムCSS・ダークモードのテスト',
      url: '/css-test',
      color: 'btn-secondary hover-lift click-shrink focus-ring',
    },
    {
      title: '🖥️ 環境チェック',
      description: 'ブラウザ・システム・パフォーマンス情報',
      url: '/env-check',
      color: 'btn-success hover-lift click-shrink focus-ring',
    },
    {
      title: '🔌 API接続テスト',
      description: 'バックエンドAPI・レスポンス時間のテスト',
      url: '/api-test',
      color: 'btn-warning hover-lift click-shrink focus-ring',
    },
  ];

  return (
    <div className='card-primary p-6'>
      <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>🧪 診断・テストページ</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {diagnosticPages.map((page, index) => (
          <Link
            key={index}
            href={page.url}
            className={`${page.color} text-white p-6 rounded-lg transition-all duration-200 block`}
          >
            <h3 className='text-xl font-bold mb-2'>{page.title}</h3>
            <p className='text-sm opacity-90'>{page.description}</p>
          </Link>
        ))}
      </div>

      {/* 監視・パフォーマンスダッシュボード */}
      <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* パフォーマンス分析 */}
        <div className='card-primary border border-slate-200 dark:border-slate-700 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>📊 パフォーマンス分析</h3>
            <button
              onClick={runPerformanceAnalysis}
              disabled={isAnalyzing}
              className='btn-primary hover-lift click-shrink focus-ring interactive-disabled'
            >
              {isAnalyzing ? '分析中...' : '分析開始'}
            </button>
          </div>

          {performanceResults ? (
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>総合スコア:</span>
                <span
                  className={`font-bold ${
                    performanceResults.score.overall >= 90
                      ? 'text-green-600'
                      : performanceResults.score.overall >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {performanceResults.score.overall}/100
                </span>
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>{performanceResults.summary}</div>
              <div className='text-xs sm:text-sm'>
                ボトルネック: {performanceResults.bottlenecks.length}件 | 提案: {performanceResults.suggestions.length}
                件
              </div>
            </div>
          ) : (
            <div className='text-sm text-gray-500 dark:text-gray-400'>パフォーマンス分析を実行してください</div>
          )}
        </div>

        {/* エラー統計 */}
        <div className='card-primary border border-slate-200 dark:border-slate-700 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>🚨 エラー統計</h3>
            <button
              onClick={getErrorStatistics}
              className='btn-error hover-lift click-shrink focus-ring'
            >
              統計取得
            </button>
          </div>

          {errorStats ? (
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span>総エラー数:</span>
                <span className={`font-bold ${errorStats.total === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {errorStats.total}件
                </span>
              </div>
              <div className='text-sm'>
                <div>再試行可能: {errorStats.retryableCount}件</div>
                <div>最近のエラー: {errorStats.recentErrors.length}件</div>
              </div>
              {Object.entries(errorStats.byCategory).length > 0 && (
                <div className='text-xs space-y-1'>
                  <div className='font-medium'>カテゴリ別:</div>
                  {Object.entries(errorStats.byCategory).map(([category, count]) => (
                    <div key={category} className='ml-2'>
                      {category}: {count as number}件
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className='text-sm text-gray-500 dark:text-gray-400'>エラー統計を取得してください</div>
          )}
        </div>
      </div>

      <div className='mt-8 card-accent'>
        <h3 className='font-semibold text-gray-900 dark:text-white mb-3'>💡 診断ページの使い方</h3>
        <ul className='text-sm text-gray-600 dark:text-gray-300 space-y-2'>
          <li>
            <strong>問題発生時:</strong> まず「総合診断」で全体チェック
          </li>
          <li>
            <strong>CSS問題:</strong> 「CSS専用テスト」で詳細確認
          </li>
          <li>
            <strong>パフォーマンス:</strong> 「環境チェック」で性能測定
          </li>
          <li>
            <strong>API問題:</strong> 「API接続テスト」でサーバー状態確認
          </li>
          <li>
            <strong>チーム共有:</strong> スクリーンショットで問題報告
          </li>
        </ul>
      </div>

      <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
        <h3 className='font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>🔧 開発者向けクイックアクセス</h3>
        <div className='flex flex-wrap gap-2'>
          <a
            href='/debug'
            className='badge-warning text-sm hover-lift'
          >
            /debug
          </a>
          <a
            href='/css-test'
            className='badge-warning text-sm hover-lift'
          >
            /css-test
          </a>
          <a
            href='/env-check'
            className='badge-warning text-sm hover-lift'
          >
            /env-check
          </a>
          <a
            href='/api-test'
            className='badge-warning text-sm hover-lift'
          >
            /api-test
          </a>
        </div>
      </div>
    </div>
  );
}
