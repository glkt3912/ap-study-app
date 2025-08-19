'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense, memo, useMemo } from 'react';
import { apiClient, type ExamConfig } from '../lib/api';
import { ExamConfigModal } from './ExamConfigModal';
import { useAuth } from '../contexts/AuthContext';

const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const Pie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));

interface PerformanceMetrics {
  period: number;
  studyConsistency: {
    study_days: number;
    total_sessions: number;
    avg_session_duration: number;
    consistency_rate: number;
  };
  learningEfficiency: {
    avg_score: number;
    avg_time_per_question: number;
    total_questions_attempted: number;
    avg_total_time: number;
  };
  growthAnalysis: Array<{
    week_start: string;
    avg_score: number;
    sessions_count: number;
    prev_week_score: number;
    score_change: number;
  }>;
  categoryBalance: Array<{
    category: string;
    questions_attempted: number;
    accuracy_rate: number;
    proportion: number;
  }>;
}

interface ExamReadiness {
  examDate: string;
  daysToExam: number;
  targetScore: number;
  currentAbility: {
    current_avg_score: number;
    total_sessions: number;
    target_achievement_rate: number;
  };
  categoryReadiness: Array<{
    category: string;
    questions_attempted: number;
    accuracy_rate: number;
    readiness_level: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  }>;
  overallReadiness: string;
  studyRecommendations: Array<{
    type: string;
    recommendation: string;
    priority: string;
  }>;
  passProbability: number;
}

interface LearningPattern {
  timePattern: Array<{
    study_hour: number;
    session_count: number;
    avg_score: number;
    avg_duration: number;
  }>;
  frequencyPattern: Array<{
    day_of_week: number;
    session_count: number;
    avg_score: number;
  }>;
  volumePerformanceCorrelation: Array<{
    daily_sessions: number;
    daily_questions: number;
    avg_score_for_volume: number;
    frequency: number;
  }>;
  recommendations: {
    optimalTimeSlot: string;
    optimalDayOfWeek: string;
    recommendedDailyQuestions: number;
  };
}

// 残り日数を計算するヘルパー関数
const calculateRemainingDays = (examDate: string): number => {
  return Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
};

function AdvancedAnalysis() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'performance' | 'readiness' | 'pattern' | 'efficiency'>('performance');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [examReadiness, setExamReadiness] = useState<ExamReadiness | null>(null);
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 統一エラーハンドリング関数
  const handleError = useCallback((error: unknown, context: string): string => {
    console.error(`${context} error:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return 'ネットワークに接続できません。インターネット接続を確認してください。';
      }
      if (error.message.includes('404')) {
        return 'データが見つかりません。';
      }
      if (error.message.includes('500')) {
        return 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
      }
      return error.message;
    }
    
    return `${context}中にエラーが発生しました。再試行してください。`;
  }, []);

  // 試験設定モーダル管理
  const [isExamConfigModalOpen, setIsExamConfigModalOpen] = useState(false);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);

  // 試験日設定用（既存フォーム用）
  const [examDate, setExamDate] = useState('');
  const [targetScore, setTargetScore] = useState(60);

  // 試験設定を読み込む
  const loadExamConfig = useCallback(async () => {
    try {
      const config = await apiClient.getExamConfig(userId.toString());
      setExamConfig(config);
      if (config) {
        setExamDate(new Date(config.examDate).toISOString().split('T')[0] || '');
        setTargetScore(config.targetScore || 60);
      }
    } catch (_error) {
      // 設定が存在しない場合は無視
      setExamConfig(null);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'performance') {
      loadPerformanceMetrics();
    } else if (activeTab === 'pattern') {
      loadLearningPattern();
    } else if (activeTab === 'readiness') {
      loadExamConfig();
    }
  }, [activeTab, userId, loadExamConfig]);

  // モーダル保存ハンドラー
  const handleExamConfigSave = (savedConfig: ExamConfig) => {
    setExamConfig(savedConfig);
    setExamDate(new Date(savedConfig.examDate).toISOString().split('T')[0] || '');
    setTargetScore(savedConfig.targetScore || 60);
    setIsExamConfigModalOpen(false);
  };

  const loadPerformanceMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getPerformanceMetrics(30, userId);
      setPerformanceMetrics(data);
    } catch (err) {
      const errorMessage = handleError(err, 'パフォーマンス指標取得');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadExamReadiness = async () => {
    if (!examConfig && !examDate) {
      setError('試験設定が必要です。設定を編集してください。');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.evaluateExamReadiness({
        examDate: examConfig?.examDate || examDate,
        targetScore: examConfig?.targetScore || targetScore,
        userId: userId,
      });
      setExamReadiness(data);
    } catch (err) {
      const errorMessage = handleError(err, '試験準備度評価');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadLearningPattern = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getLearningPattern(userId);
      setLearningPattern(data);
    } catch (err) {
      const errorMessage = handleError(err, '学習パターン分析');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'badge-success';
      case 'good':
        return 'badge-info';
      case 'needs_improvement':
        return 'badge-warning';
      case 'critical':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // パフォーマンス最適化: メモ化された計算
  const memoizedChartData = useMemo(() => {
    // 実際のperformanceMetricsデータ構造に合わせて調整
    const categoryData = performanceMetrics?.categoryBalance?.map(c => ({
      category: c.category,
      accuracy: Math.round(c.accuracy_rate * 100) / 100,
      proportion: Math.round(c.proportion * 100) / 100,
    })) || [];

    const growthData = performanceMetrics?.growthAnalysis?.map(g => ({
      week: g.week_start,
      score: Math.round(g.avg_score * 100) / 100,
      change: Math.round(g.score_change * 100) / 100,
    })) || [];

    return { categoryData, growthData };
  }, [performanceMetrics]);

  return (
    <div className='card-primary p-6'>
      <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-6'>高度な学習分析</h2>

      {/* タブナビゲーション */}
      <div className='flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 mb-6 scrollbar-hide'>
        {[
          { key: 'performance', label: 'パフォーマンス指標', shortLabel: '指標' },
          { key: 'readiness', label: '試験準備度', shortLabel: '準備度' },
          { key: 'pattern', label: '学習パターン', shortLabel: 'パターン' },
          { key: 'efficiency', label: '学習効率分析', shortLabel: '効率' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap hover-lift click-shrink focus-ring ${
              activeTab === tab.key
                ? 'nav-tab-active'
                : 'nav-tab-inactive'
            }`}
          >
            <span className='hidden sm:inline'>{tab.label}</span>
            <span className='sm:hidden'>{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className='alert-error mb-4'>
          {error}
        </div>
      )}

      {loading && (
        <div className='flex justify-center items-center py-8'>
          <div className='loading-spinner'></div>
          <span className='ml-2 text-gray-600 dark:text-gray-300'>読み込み中...</span>
        </div>
      )}

      {/* パフォーマンス指標タブ */}
      {activeTab === 'performance' && performanceMetrics && !loading && (
        <div className='space-y-6'>
          {/* 学習継続性 */}
          <div className='card-accent p-4'>
            <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>学習継続性</h3>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {performanceMetrics.studyConsistency.study_days}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>学習日数</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {Math.round(performanceMetrics.studyConsistency.consistency_rate)}%
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>継続率</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {performanceMetrics.studyConsistency.total_sessions}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>総セッション数</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                  {Math.round(performanceMetrics.studyConsistency.avg_session_duration || 0)}分
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>平均学習時間</div>
              </div>
            </div>
          </div>

          {/* 学習効率 */}
          <div className='card-accent p-4'>
            <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>学習効率</h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {Math.round(performanceMetrics.learningEfficiency.avg_score || 0)}点
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>平均スコア</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  {Math.round(performanceMetrics.learningEfficiency.avg_time_per_question || 0)}秒
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>問題あたり平均時間</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {performanceMetrics.learningEfficiency.total_questions_attempted || 0}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>総回答問題数</div>
              </div>
            </div>
          </div>

          {/* カテゴリバランス */}
          <div className='card-accent p-4'>
            <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>カテゴリ別学習バランス</h3>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* 円グラフ */}
              <div>
                <h4 className='font-medium mb-3 text-gray-700 dark:text-gray-300'>問題数の分布</h4>
                <Suspense
                  fallback={
                    <div className='h-48 flex items-center justify-center text-gray-500'>グラフを読み込み中...</div>
                  }
                >
                  <ResponsiveContainer width='100%' height={200}>
                    <PieChart>
                      <Pie
                        data={performanceMetrics.categoryBalance}
                        cx='50%'
                        cy='50%'
                        outerRadius={60}
                        fill='#8884d8'
                        dataKey='questions_attempted'
                        label={({ category, proportion }) => `${category}: ${Math.round(proportion)}%`}
                        labelLine={false}
                      >
                        {performanceMetrics?.categoryBalance?.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value}問`, 'カテゴリ']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Suspense>
              </div>

              {/* バー表示 */}
              <div className='space-y-2'>
                {performanceMetrics?.categoryBalance?.map((category, index) => (
                  <div key={index} className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>{category.category}</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full'
                          style={{ width: `${Math.min(category.proportion, 100)}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-600 dark:text-gray-300 w-12'>
                        {Math.round(category.proportion)}%
                      </span>
                      <span className='text-sm text-green-600 dark:text-green-400 w-12'>
                        {Math.round(category.accuracy_rate * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 成長分析グラフ */}
          {performanceMetrics.growthAnalysis.length > 0 && (
            <div className='card-accent p-4'>
              <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>週次成長分析</h3>
              <Suspense
                fallback={
                  <div className='h-64 flex items-center justify-center text-gray-500'>グラフを読み込み中...</div>
                }
              >
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={performanceMetrics.growthAnalysis}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='week_start'
                      tickFormatter={value =>
                        new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={value => `週開始: ${new Date(value).toLocaleDateString('ja-JP')}`}
                      formatter={(value: any, name: any) => [
                        name === 'avg_score'
                          ? `${Number(value).toFixed(1)}点`
                          : name === 'score_change'
                            ? `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(1)}点`
                            : `${value}回`,
                        name === 'avg_score' ? '平均スコア' : name === 'score_change' ? 'スコア変化' : 'セッション数',
                      ]}
                    />
                    <Legend />
                    <Line type='monotone' dataKey='avg_score' stroke='#3B82F6' strokeWidth={3} name='avg_score' />
                    <Line
                      type='monotone'
                      dataKey='score_change'
                      stroke='#10B981'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      name='score_change'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          )}
        </div>
      )}

      {/* 試験準備度タブ */}
      {activeTab === 'readiness' && (
        <div className='space-y-6'>
          {/* 試験設定 */}
          <div className='card-accent p-4'>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-semibold text-lg text-gray-800 dark:text-white'>試験設定</h3>
              <button
                onClick={() => setIsExamConfigModalOpen(true)}
                className='px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                設定を編集
              </button>
            </div>
            
            {examConfig ? (
              <div className='space-y-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300 mr-2'>試験日:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {new Date(examConfig.examDate).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className='flex items-center'>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300 mr-2'>目標点数:</span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {examConfig.targetScore || 60}点
                    </span>
                  </div>
                </div>
                <div className='flex items-center'>
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300 mr-2'>残り日数:</span>
                  <span className='text-sm text-blue-600 dark:text-blue-400 font-medium'>
                    {examConfig.remainingDays || calculateRemainingDays(examConfig.examDate)}日
                  </span>
                </div>
                <button
                  onClick={loadExamReadiness}
                  disabled={loading}
                  className='btn-primary hover-lift click-shrink focus-ring interactive-disabled w-full mt-4'
                >
                  {loading ? '評価中...' : '準備度を評価'}
                </button>
              </div>
            ) : (
              <div className='text-center py-6'>
                <p className='text-gray-600 dark:text-gray-400 mb-4'>試験設定が未設定です</p>
                <button
                  onClick={() => setIsExamConfigModalOpen(true)}
                  className='btn-primary hover-lift click-shrink focus-ring'
                >
                  試験設定を開始
                </button>
              </div>
            )}
          </div>

          {/* 試験準備度結果 */}
          {examReadiness && !loading && (
            <div className='space-y-4'>
              {/* 総合評価 */}
              <div className='card-accent p-4'>
                <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>総合評価</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                      {examReadiness.daysToExam}日
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-300'>試験まで</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                      {Math.round(examReadiness.passProbability)}%
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-300'>合格予測</div>
                  </div>
                  <div className='text-center'>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getReadinessColor(examReadiness.overallReadiness)}`}
                    >
                      {examReadiness.overallReadiness}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-300 mt-1'>総合準備度</div>
                  </div>
                </div>
              </div>

              {/* カテゴリ別準備度 */}
              <div className='card-accent p-4'>
                <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>カテゴリ別準備度</h3>
                <div className='space-y-2'>
                  {examReadiness?.categoryReadiness?.map((category, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>{category.category}</span>
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm text-gray-600 dark:text-gray-300'>
                          {Math.round(category.accuracy_rate * 100)}%
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getReadinessColor(category.readiness_level)}`}>
                          {category.readiness_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 学習推奨 */}
              <div className='card-accent p-4'>
                <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>学習推奨</h3>
                <div className='space-y-2'>
                  {examReadiness?.studyRecommendations?.map((rec, index) => (
                    <div key={index} className='flex items-start space-x-2'>
                      <span
                        className={`inline-block w-2 h-2 rounded-full mt-2 ${
                          rec.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                      ></span>
                      <span className='text-sm text-gray-700 dark:text-gray-300'>{rec.recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 学習パターンタブ */}
      {activeTab === 'pattern' && learningPattern && !loading && (
        <div className='space-y-6'>
          {/* 推奨学習条件 */}
          <div className='card-accent p-4'>
            <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>推奨学習条件</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-xl font-bold text-blue-600 dark:text-blue-400'>
                  {learningPattern.recommendations.optimalTimeSlot}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>最適学習時間帯</div>
              </div>
              <div className='text-center'>
                <div className='text-xl font-bold text-green-600 dark:text-green-400'>
                  {learningPattern.recommendations.optimalDayOfWeek}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>最適学習曜日</div>
              </div>
              <div className='text-center'>
                <div className='text-xl font-bold text-purple-600 dark:text-purple-400'>
                  {learningPattern.recommendations.recommendedDailyQuestions}問
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>推奨日次問題数</div>
              </div>
            </div>
          </div>

          {/* 時間帯別パフォーマンス */}
          <div className='card-accent p-4'>
            <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>時間帯別パフォーマンス</h3>
            <div className='space-y-2'>
              {learningPattern?.timePattern?.map((time, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>{time.study_hour}時台</span>
                  <div className='flex items-center space-x-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-300'>{time.session_count}セッション</span>
                    <span className='text-sm text-green-600 dark:text-green-400'>{Math.round(time.avg_score)}点</span>
                    <div className='w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2'>
                      <div
                        className='bg-blue-500 h-2 rounded-full'
                        style={{ width: `${(time.avg_score / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) || (
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  学習データが蓄積されると、時間帯別のパフォーマンス分析が表示されます。
                </p>
              )}
            </div>
          </div>

          {/* 曜日別パフォーマンス */}
          <div className='card-accent p-4'>
            <h3 className='font-semibold text-lg mb-3 text-gray-800 dark:text-white'>曜日別パフォーマンス</h3>
            <div className='space-y-2'>
              {learningPattern?.frequencyPattern?.map((day, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                    {dayNames[day.day_of_week]}曜日
                  </span>
                  <div className='flex items-center space-x-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-300'>{day.session_count}セッション</span>
                    <span className='text-sm text-green-600 dark:text-green-400'>{Math.round(day.avg_score)}点</span>
                    <div className='w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2'>
                      <div
                        className='bg-green-500 h-2 rounded-full'
                        style={{ width: `${(day.avg_score / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )) || (
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  学習データが蓄積されると、曜日別のパフォーマンス分析が表示されます。
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 学習効率分析タブ */}
      {activeTab === 'efficiency' && (
        <div className='space-y-6'>
          <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300 px-4 py-3 rounded'>
            <div className='flex items-center'>
              <span className='mr-2'>📊</span>
              <span className='font-medium'>新機能: 学習効率分析</span>
            </div>
            <p className='text-sm mt-1'>
              時間帯別・分野別の学習効率を詳細に分析し、個人最適化された学習提案を提供します。
            </p>
          </div>

          {/* LearningEfficiencyDashboardコンポーネントを埋め込み */}
          <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-1'>
            <div className='card-primary rounded'>
              <Suspense
                fallback={
                  <div className='h-96 flex items-center justify-center'>
                    <div className='loading-spinner'></div>
                    <span className='ml-3 text-gray-600 dark:text-gray-300'>学習効率分析を読み込み中...</span>
                  </div>
                }
              >
                <LearningEfficiencyDashboardComponent />
              </Suspense>
            </div>
          </div>
        </div>
      )}
      
      {/* ExamConfigModal */}
      <ExamConfigModal
        isOpen={isExamConfigModalOpen}
        onClose={() => setIsExamConfigModalOpen(false)}
        onSave={handleExamConfigSave}
        userId={userId.toString()}
        {...(examConfig && { initialConfig: examConfig })}
      />
    </div>
  );
}

// 動的インポート用のLazy Componentを定義
const LearningEfficiencyDashboardComponent = lazy(() =>
  import('./LearningEfficiencyDashboard')
);

// React.memo でパフォーマンス最適化
export { AdvancedAnalysis };
export default memo(AdvancedAnalysis);
