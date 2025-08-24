'use client';

import React, { useState, useEffect, lazy, Suspense, useCallback, memo, useMemo } from 'react';
import { apiClient } from '../lib/api';

const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));

interface HourlyEfficiency {
  hour: number;
  avgStudyTime: number;
  avgUnderstanding: number;
  completionRate: number;
  efficiencyScore: number;
}

interface SubjectEfficiency {
  subject: string;
  totalStudyTime: number;
  avgUnderstanding: number;
  completionRate: number;
  difficultyLevel: number;
  learningVelocity: number;
}

interface LearningRecommendation {
  type: 'time_optimization' | 'subject_focus' | 'schedule_adjustment';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImprovement: number;
}

interface LearningEfficiencyAnalysis {
  id: string;
  userId: string;
  analysisDate: string;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  hourlyEfficiency: HourlyEfficiency[];
  subjectEfficiency: SubjectEfficiency[];
  recommendations: LearningRecommendation[];
  overallScore: number;
}

function LearningEfficiencyDashboard() {
  const [analysis, setAnalysis] = useState<LearningEfficiencyAnalysis | null>(null);
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
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const generateAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rawData = await apiClient.generateLearningEfficiencyAnalysis(1); // TODO: 実際のユーザーIDを使用
      
      // Transform API response to match expected interface
      const transformedData: LearningEfficiencyAnalysis = {
        id: 'generated-' + Date.now(),
        userId: '1',
        analysisDate: new Date().toISOString(),
        timeRange: {
          startDate: dateRange.startDate || '',
          endDate: dateRange.endDate || '',
        },
        hourlyEfficiency: rawData.timeOfDayEfficiency.map((item) => ({
          hour: item.hour,
          avgStudyTime: 60, // Default value in minutes
          avgUnderstanding: 3, // Default understanding score
          completionRate: item.efficiency * 100, // Convert efficiency to percentage
          efficiencyScore: item.efficiency,
        })),
        subjectEfficiency: rawData.subjectEfficiency.map((item) => ({
          subject: item.subject,
          totalStudyTime: 120, // Default value in minutes
          avgUnderstanding: 3, // Default understanding score
          completionRate: item.efficiency * 100, // Convert efficiency to percentage
          difficultyLevel: 3, // Default difficulty level
          learningVelocity: item.efficiency,
        })),
        recommendations: [], // Default empty array
        overallScore: rawData.overallEfficiency
      };
      
      setAnalysis(transformedData);
    } catch (err) {
      const errorMessage = handleError(err, '学習効率分析生成');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, handleError]);

  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'time_optimization':
        return '⏰';
      case 'subject_focus':
        return '📚';
      case 'schedule_adjustment':
        return '📅';
      default:
        return '💡';
    }
  };

  // パフォーマンス最適化: グラフデータのメモ化
  const chartData = useMemo(() => ({
    hourlyChartData: analysis?.hourlyEfficiency?.map(h => ({
      ...h,
      hour: `${h.hour}:00`,
      efficiencyScore: Math.round(h.efficiencyScore * 100) / 100,
    })) || [],
    subjectChartData: analysis?.subjectEfficiency?.map(s => ({
      ...s,
      learningVelocity: Math.round(s.learningVelocity * 100) / 100,
      completionRate: Math.round(s.completionRate * 100),
    })) || []
  }), [analysis]);

  const { hourlyChartData, subjectChartData } = chartData;

  return (
    <div className='card-primary rounded-lg shadow-md p-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0'>学習効率分析ダッシュボード</h2>
        <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
          <div className='flex items-center space-x-2'>
            <input
              type='date'
              value={dateRange.startDate}
              onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className='input-primary text-sm'
            />
            <span className='text-gray-500 dark:text-gray-400'>〜</span>
            <input
              type='date'
              value={dateRange.endDate}
              onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className='input-primary text-sm'
            />
          </div>
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className='btn-primary text-sm'
          >
            {loading ? '分析中...' : '分析実行'}
          </button>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6'>
          <div className='flex items-center'>
            <span className='mr-2'>⚠️</span>
            {error}
          </div>
        </div>
      )}

      {loading && (
        <div className='flex justify-center items-center py-12'>
          <div className='loading-spinner'></div>
          <span className='ml-3 loading-text'>学習効率を分析中...</span>
        </div>
      )}

      {analysis && !loading && (
        <div className='space-y-8'>
          {/* 総合スコア */}
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6'>
            <div className='text-center'>
              <div className='text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2'>{analysis?.overallScore || 0}</div>
              <div className='text-lg text-gray-700 dark:text-gray-300 mb-1'>総合学習効率スコア</div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                {new Date(analysis?.timeRange?.startDate || new Date()).toLocaleDateString()} 〜{' '}
                {new Date(analysis?.timeRange?.endDate || new Date()).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* 推奨事項 */}
          <div className='card-accent p-6'>
            <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-4'>🎯 改善提案</h3>
            <div className='space-y-4'>
              {analysis?.recommendations?.map((rec, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                  <div className='flex items-start space-x-3'>
                    <span className='text-2xl'>{getTypeIcon(rec.type)}</span>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-semibold'>{rec.title}</h4>
                        <span className='text-sm font-medium px-2 py-1 rounded'>{rec.priority}</span>
                      </div>
                      <p className='text-sm mb-2'>{rec.description}</p>
                      <div className='text-xs sm:text-sm'>期待される改善: +{rec.expectedImprovement}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 時間帯別効率 */}
          <div className='card-accent p-6'>
            <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-4'>⏰ 時間帯別学習効率</h3>
            <div className='h-80'>
              <Suspense
                fallback={
                  <div className='h-full flex items-center justify-center text-gray-500'>グラフを読み込み中...</div>
                }
              >
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={hourlyChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='hour' tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        name === 'efficiencyScore'
                          ? `${Number(value).toFixed(2)}`
                          : name === 'avgStudyTime'
                            ? `${Math.round(Number(value))}分`
                            : name === 'avgUnderstanding'
                              ? `${Number(value).toFixed(1)}点`
                              : `${Math.round(Number(value) * 100)}%`,
                        name === 'efficiencyScore'
                          ? '効率スコア'
                          : name === 'avgStudyTime'
                            ? '平均学習時間'
                            : name === 'avgUnderstanding'
                              ? '平均理解度'
                              : '完了率',
                      ]}
                    />
                    <Legend />
                    <Bar dataKey='efficiencyScore' fill='#3B82F6' name='efficiencyScore' />
                    <Bar dataKey='completionRate' fill='#10B981' name='completionRate' />
                  </BarChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </div>

          {/* 分野別効率 */}
          <div className='card-accent p-6'>
            <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-4'>📚 分野別学習効率</h3>
            <div className='h-80'>
              <Suspense
                fallback={
                  <div className='h-full flex items-center justify-center text-gray-500'>グラフを読み込み中...</div>
                }
              >
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={subjectChartData} layout='horizontal'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' tick={{ fontSize: 12 }} />
                    <YAxis type='category' dataKey='subject' tick={{ fontSize: 12 }} width={80} />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        name === 'learningVelocity'
                          ? `${Number(value).toFixed(2)}`
                          : name === 'totalStudyTime'
                            ? `${Math.round(Number(value))}分`
                            : name === 'avgUnderstanding'
                              ? `${Number(value).toFixed(1)}点`
                              : `${Number(value)}%`,
                        name === 'learningVelocity'
                          ? '学習速度'
                          : name === 'totalStudyTime'
                            ? '総学習時間'
                            : name === 'avgUnderstanding'
                              ? '平均理解度'
                              : '完了率',
                      ]}
                    />
                    <Legend />
                    <Bar dataKey='learningVelocity' fill='#8B5CF6' name='learningVelocity' />
                    <Bar dataKey='completionRate' fill='#F59E0B' name='completionRate' />
                  </BarChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </div>

          {/* 詳細数値 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 分野別詳細 */}
            <div className='card-accent p-6'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>分野別詳細</h3>
              <div className='space-y-3'>
                {analysis?.subjectEfficiency?.map((subject, index) => (
                  <div key={index} className='card-primary rounded p-3'>
                    <div className='font-medium text-gray-800 dark:text-gray-200 mb-2'>{subject.subject}</div>
                    <div className='grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300'>
                      <span>学習時間: {Math.round(subject.totalStudyTime)}分</span>
                      <span>理解度: {subject.avgUnderstanding.toFixed(1)}/5</span>
                      <span>完了率: {Math.round(subject.completionRate * 100)}%</span>
                      <span>学習速度: {subject.learningVelocity.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 最適時間帯 */}
            <div className='card-accent p-6'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>最適時間帯TOP5</h3>
              <div className='space-y-3'>
                {analysis?.hourlyEfficiency
                  ?.filter(h => h.efficiencyScore > 0)
                  ?.sort((a, b) => b.efficiencyScore - a.efficiencyScore)
                  ?.slice(0, 5)
                  ?.map((hour, index) => (
                    <div key={index} className='card-primary rounded p-3'>
                      <div className='flex items-center justify-between'>
                        <span className='font-medium text-gray-800 dark:text-gray-200'>
                          {hour.hour}:00 - {hour.hour + 1}:00
                        </span>
                        <span className='text-blue-600 dark:text-blue-400 font-semibold'>
                          {hour.efficiencyScore.toFixed(2)}
                        </span>
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-300 mt-1'>
                        理解度: {hour.avgUnderstanding.toFixed(1)} | 完了率: {Math.round(hour.completionRate * 100)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// React.memo でパフォーマンス最適化
export { LearningEfficiencyDashboard };
export default memo(LearningEfficiencyDashboard);
