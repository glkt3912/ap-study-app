'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';

// 直接インポート（SSR問題回避）
import { StudyTimeChart, ProgressChart, UnderstandingRadarChart } from './charts/AnalysisCharts';
import {
  apiClient,
  StudyLog,
  MorningTest,
  AfternoonTest,
  PredictiveAnalysis,
  PersonalizedRecommendations,
} from '../lib/api';
import type { PerformanceInsight } from '../lib/clients/AnalysisClient';
import { unifiedApiClient } from '../lib/unified-api';
import { useAuth } from '../contexts/AuthContext';
// import { ChartSkeleton, CardSkeleton } from './ui/Skeleton'

// 分析結果の型定義
interface StudyPattern {
  totalStudyTime: number;
  averageStudyTime: number;
  studyFrequency: number;
  bestStudyTime: string;
  consistencyScore: number;
}

interface WeaknessAnalysis {
  weakSubjects: Array<{
    subject: string;
    understanding: number;
    studyTime: number;
    testScore: number;
    improvement: number;
  }>;
  weakTopics: Array<{
    topic: string;
    subject: string;
    understanding: number;
    testAccuracy: number;
    priority: number;
  }>;
}

interface StudyRecommendation {
  dailyStudyTime: number;
  weeklyGoal: number;
  focusSubjects: string[];
  reviewSchedule: Array<{
    subject: string;
    nextReviewDate: string;
    priority: number;
  }>;
}

interface AnalysisResult {
  id: number;
  analysisDate: string;
  studyPattern: StudyPattern;
  weaknessAnalysis: WeaknessAnalysis;
  studyRecommendation: StudyRecommendation;
  overallScore: number;
}

function Analysis() {
  const { user } = useAuth();
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [morningTests, setMorningTests] = useState<MorningTest[]>([]);
  const [afternoonTests, setAfternoonTests] = useState<AfternoonTest[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [studyStats, setStudyStats] = useState<any>(null);

  // ========================================
  // ML分析関連ステート
  // ========================================
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(
    null
  );
  const [advancedWeakPoints, setAdvancedWeakPoints] = useState<PerformanceInsight[] | null>(null);
  const [isGeneratingML, setIsGeneratingML] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);

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

  // ML分析データ個別取得（フォールバック用）
  const fetchMLAnalysisDataFallback = useCallback(async () => {
    if (!user?.id) return;

    try {
      setMlError(null);

      const [predictions, recommendations, weakPoints] = await Promise.all([
        apiClient.getPredictiveAnalysis(user.id).catch(() => null),
        apiClient.getPersonalizedRecommendations(user.id).catch(() => null),
        apiClient.getPerformanceInsights(user.id).catch(() => null),
      ]);

      setPredictiveAnalysis(predictions);
      setPersonalizedRecommendations(recommendations);
      setAdvancedWeakPoints(weakPoints);
    } catch (error) {
      const errorMessage = handleError(error, 'ML分析データ取得');
      setMlError(errorMessage);
    }
  }, [user?.id, handleError]);

  // フォールバック: 個別API呼び出し (バックエンド未対応時)
  const fetchAnalysisDataFallback = useCallback(async () => {
    try {
      // 統一APIとレガシーAPIの併用で最適化
      const userId = user?.id || 1;
      
      let morningData: MorningTest[] = [];
      let afternoonData: AfternoonTest[] = [];
      
      // テストデータは統一APIを優先使用
      try {
        const sessions = await unifiedApiClient.getTestSessions(userId, 50, 0);
        morningData = sessions
          .filter(session => session.type === 'morning')
          .map(session => ({
            id: session.id,
            date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
            category: session.category || '',
            totalQuestions: session.totalQuestions || 0,
            correctAnswers: session.correctAnswers || 0,
            accuracy: session.totalQuestions ? 
              Math.round((session.correctAnswers || 0) / session.totalQuestions * 100) : 0,
            timeSpent: session.timeSpent || 0,
            memo: session.memo || ''
          })) as MorningTest[];

        afternoonData = sessions
          .filter(session => session.type === 'afternoon')
          .map(session => ({
            id: session.id,
            date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
            category: session.category || '',
            score: session.score || 0,
            timeSpent: session.timeSpent || 0,
            memo: session.memo || ''
          })) as AfternoonTest[];
      } catch (unifiedError) {
        console.warn('統一API失敗、テストデータはレガシーAPIにフォールバック:', 
          unifiedError);
        // フォールバック: 既存APIを使用
        morningData = await apiClient.getMorningTests();
        afternoonData = await apiClient.getAfternoonTests();
      }
      
      const [logs, stats] = await Promise.all([
        apiClient.getStudyLogs(),
        Promise.resolve(null), // Remove getStudyLogStats as it doesn't exist
      ]);
      
      setStudyLogs(logs);
      setMorningTests(morningData);
      setAfternoonTests(afternoonData);
      setStudyStats(stats);

      // 従来の分析結果を取得
      await fetchLatestAnalysis();

      // ML分析データを個別取得（ユーザー認証時のみ）
      if (user?.id) {
        await fetchMLAnalysisDataFallback();
      }
    } catch (error) {
      const errorMessage = handleError(error, '分析データ取得');
      setMlError(errorMessage);
    }
  }, [user?.id, fetchMLAnalysisDataFallback, handleError]);

  // 最新分析結果取得
  const fetchLatestAnalysis = useCallback(async () => {
    try {
      // 統一APIを使用して分析結果を取得
      try {
        const analyses = await unifiedApiClient.getUserAnalysis(user?.id || 1);
        // 最新の分析結果を取得（配列の最初の要素）
        const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null;
        if (latestAnalysis) {
          // 統一API形式から既存形式に変換
          const convertedResult = {
            id: latestAnalysis.id,
            analysisDate: latestAnalysis.date,
            studyPattern: latestAnalysis.studyPattern || {},
            weaknessAnalysis: latestAnalysis.weaknessAnalysis || { weakSubjects: [], weakTopics: [] },
            studyRecommendation: latestAnalysis.studyRecommendation || {},
            overallScore: latestAnalysis.overallScore || 0
          };
          setAnalysisResult(convertedResult);
        }
      } catch (unifiedError) {
        console.warn('統一API失敗、レガシーAPIにフォールバック:', unifiedError);
        // フォールバック: 既存APIを使用
        await apiClient.getPerformanceInsights(user?.id || 0);
        // TODO: PerformanceInsight[]をAnalysisResultに変換する必要がある場合は変換関数を作成
        // setAnalysisResult(convertPerformanceInsightsToAnalysisResult(performanceInsights));
      }
    } catch (error) {
      // 最新分析結果の取得に失敗
    }
  }, [user?.id]);

  // バッチ処理: 分析データ一括取得 (7個API → 1個API)
  const fetchBatchAnalysisData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setMlError(null);

      const batchData = await apiClient.getBatchAnalysisData(user.id);

      // バッチAPIデータを各状態に設定
      setStudyLogs(batchData.studyLogs || []);
      setMorningTests(batchData.morningTests || []);
      setAfternoonTests(batchData.afternoonTests || []);
      setStudyStats(batchData.studyLogStats || null);

      // MLデータ設定
      setPredictiveAnalysis(batchData.predictiveAnalysis || null);
      setPersonalizedRecommendations(batchData.personalizedRecommendations || null);
      setAdvancedWeakPoints(batchData.advancedWeakPoints || null);

      // 従来の分析結果を取得
      await fetchLatestAnalysis();
    } catch (error) {
      // バッチAPI失敗時はフォールバックを使用
      console.warn('バッチAPI失敗、フォールバックを使用:', error);
      await fetchAnalysisDataFallback();
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchAnalysisDataFallback, fetchLatestAnalysis]);

  useEffect(() => {
    fetchBatchAnalysisData();
  }, [fetchBatchAnalysisData]);

  const runAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      await apiClient.generatePerformanceInsights(user?.id || 0);
      // TODO: PerformanceInsight[]をAnalysisResultに変換する必要がある場合は変換関数を作成
      // setAnalysisResult(convertPerformanceInsightsToAnalysisResult(performanceInsights));
    } catch (error) {
      // 分析実行に失敗
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ML分析生成関数
  const generateMLAnalysis = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsGeneratingML(true);
      setMlError(null);

      await apiClient.generateMLAnalysis(user.id);

      // 生成後に関連データも再取得
      await fetchMLAnalysisDataFallback();
    } catch (error) {
      const errorMessage = handleError(error, 'ML分析生成');
      setMlError(errorMessage);
    } finally {
      setIsGeneratingML(false);
    }
  }, [user?.id, fetchMLAnalysisDataFallback, handleError]);

  // パフォーマンス最適化: メモ化されたデータ計算
  const weeklyData = useMemo(() => {
    const weeklyDataMap: { [key: string]: number } = {};
    studyLogs.forEach(log => {
      const date = new Date(log.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const week = weekStart.toISOString().split('T')[0];
      if (week) {
        weeklyDataMap[week] = (weeklyDataMap[week] || 0) + log.studyTime;
      }
    });

    return Object.entries(weeklyDataMap)
      .map(([week, time]) => ({
        week: new Date(week).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        time: Math.round((time / 60) * 10) / 10, // 時間に変換
      }))
      .slice(-8); // 直近8週間
  }, [studyLogs]);

  // 科目別学習時間 (メモ化)
  const subjectData = useMemo(() => {
    const subjectDataMap: { [key: string]: number } = {};
    studyLogs.forEach(log => {
      subjectDataMap[log.subject] = (subjectDataMap[log.subject] || 0) + log.studyTime;
    });

    return Object.entries(subjectDataMap)
      .map(([subject, time]) => ({
        subject: subject.length > 10 ? subject.substring(0, 10) + '...' : subject,
        time: Math.round((time / 60) * 10) / 10,
        fullSubject: subject,
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 6);
  }, [studyLogs]);

  // 理解度分析 (メモ化)
  const understandingData = useMemo(() => {
    const subjectUnderstanding: { [key: string]: { total: number; count: number } } = {};
    studyLogs.forEach(log => {
      if (!subjectUnderstanding[log.subject]) {
        subjectUnderstanding[log.subject] = { total: 0, count: 0 };
      }
      const subjectData = subjectUnderstanding[log.subject];
      if (subjectData) {
        subjectData.total += log.understanding;
        subjectData.count += 1;
      }
    });

    return Object.entries(subjectUnderstanding)
      .map(([subject, data]) => ({
        subject: subject.length > 8 ? subject.substring(0, 8) + '...' : subject,
        understanding: Math.round((data.total / data.count) * 10) / 10,
        fullSubject: subject,
      }))
      .sort((a, b) => a.understanding - b.understanding);
  }, [studyLogs]);

  // 統計情報の計算 (メモ化)
  const totalStudyTime = useMemo(() => 
    studyLogs.reduce((total, log) => total + log.studyTime, 0), 
    [studyLogs]
  );
  
  const averageUnderstanding = useMemo(() => {
    if (studyLogs.length === 0) return 0;
    return studyLogs.reduce((total, log) => total + log.understanding, 0) / studyLogs.length;
  }, [studyLogs]);
  
  const morningTestAverage = useMemo(() => {
    if (morningTests.length === 0) return 0;
    const totalCorrect = morningTests.reduce((total, test) => total + test.correctAnswers, 0);
    const totalQuestions = morningTests.reduce((total, test) => total + test.totalQuestions, 0);
    return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  }, [morningTests]);
  
  const afternoonTestAverage = useMemo(() => {
    if (afternoonTests.length === 0) return 0;
    return afternoonTests.reduce((total, test) => total + test.score, 0) / afternoonTests.length;
  }, [afternoonTests]);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='card-primary'>
          <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>学習分析</h2>
            <p className='text-slate-600 dark:text-slate-300 mt-1'>
              学習データを分析して効率的な学習方法を見つけましょう
            </p>
          </div>
          <div className='p-6'>
            <div className='animate-pulse'>
              <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4'></div>
              <div className='h-64 bg-slate-200 dark:bg-slate-700 rounded mb-6'></div>
              <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // メモ化された変数はすでに上で定義されているため、ここでは削除

  return (
    <div className='space-y-6'>
      <div className='card-primary rounded-lg shadow-md'>
        <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>学習分析</h2>
          <p className='text-slate-600 dark:text-slate-300 mt-1'>学習データを分析して効率的な学習方法を見つけましょう</p>
        </div>

        <div className='p-6'>
          {/* 学習統計サマリー */}
          {studyStats && (
            <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <h3 className='text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3'>📊 学習統計サマリー</h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                    {Math.round(studyStats?.totalTime || 0)}h
                  </div>
                  <div className='text-sm text-blue-800 dark:text-blue-300'>総学習時間</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                    {studyStats?.totalSessions || 0}
                  </div>
                  <div className='text-sm text-green-800 dark:text-green-300'>学習回数</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                    {(studyStats?.averageUnderstanding || 0).toFixed(1)}
                  </div>
                  <div className='text-sm text-purple-800 dark:text-purple-300'>平均理解度</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                    {studyStats.subjectStats?.length || 0}
                  </div>
                  <div className='text-sm text-orange-800 dark:text-orange-300'>学習分野数</div>
                </div>
              </div>

              {studyStats?.subjectStats && studyStats.subjectStats.length > 0 && (
                <div className='mt-4'>
                  <h4 className='font-medium text-blue-900 dark:text-blue-300 mb-2'>分野別統計</h4>
                  <div className='space-y-2'>
                    {(studyStats?.subjectStats || []).slice(0, 3).map((subject: any, index: number) => (
                      <div key={index} className='flex justify-between items-center text-sm'>
                        <span className='font-medium'>{subject.subject}</span>
                        <div className='text-right'>
                          <div>
                            {Math.round(subject.totalTime)}h ({subject.sessionCount}回)
                          </div>
                          <div className='text-xs text-gray-600 dark:text-gray-400'>
                            理解度: {(subject.averageUnderstanding || 0).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(studyStats?.subjectStats?.length || 0) > 3 && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
                        他 {(studyStats?.subjectStats?.length || 0) - 3} 分野
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 分析実行ボタン */}
          <div className='mb-6 flex justify-between items-center'>
            <div>
              <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>AI学習分析</h3>
              <p className='text-sm text-slate-600 dark:text-slate-300'>学習データを分析して個別の改善提案を生成します</p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || studyLogs.length === 0}
              className='btn-primary hover-lift click-shrink focus-ring interactive-disabled flex items-center space-x-2'
            >
              {isAnalyzing ? (
                <>
                  <div className='loading-spinner-white'></div>
                  <span>分析中...</span>
                </>
              ) : (
                <>
                  <span>🧠</span>
                  <span>分析実行</span>
                </>
              )}
            </button>
          </div>

          {/* AI分析結果 */}
          {analysisResult && (
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>AI学習分析結果</h3>
                <div className='flex items-center space-x-2'>
                  <span className='text-2xl font-bold text-indigo-600 dark:text-indigo-400'>
                    {analysisResult?.overallScore || 0}
                  </span>
                  <span className='text-sm text-indigo-800 dark:text-indigo-300'>総合スコア</span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* 学習パターン */}
                <div className='card-secondary rounded-lg p-4'>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>学習パターン</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>総学習時間:</span>
                      <span className='font-medium'>
                        {Math.floor((analysisResult?.studyPattern?.totalStudyTime || 0) / 60)}h{' '}
                        {(analysisResult?.studyPattern?.totalStudyTime || 0) % 60}m
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>平均学習時間:</span>
                      <span className='font-medium'>{analysisResult?.studyPattern?.averageStudyTime || 0}分/日</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>学習頻度:</span>
                      <span className='font-medium'>{analysisResult?.studyPattern?.studyFrequency || 0}日/週</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>継続性:</span>
                      <span className='font-medium'>{analysisResult?.studyPattern?.consistencyScore || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* 弱点分析 */}
                <div className='card-secondary rounded-lg p-4'>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>弱点分析</h4>
                  <div className='space-y-2'>
                    {analysisResult?.weaknessAnalysis?.weakSubjects?.slice(0, 3)?.map((subject, index) => (
                      <div key={index} className='flex items-center justify-between'>
                        <span className='text-sm text-slate-600 dark:text-slate-300 truncate'>{subject.subject}</span>
                        <div className='flex items-center space-x-2'>
                          <div className='w-8 h-2 bg-slate-200 dark:bg-slate-700 rounded'>
                            <div
                              className={`h-2 rounded ${
                                subject.understanding < 2
                                  ? 'bg-red-400'
                                  : subject.understanding < 3
                                    ? 'bg-orange-400'
                                    : subject.understanding < 4
                                      ? 'bg-yellow-400'
                                      : 'bg-green-400'
                              }`}
                              style={{ width: `${(subject.understanding / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className='text-xs text-gray-500'>{(subject.understanding || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                    {(analysisResult?.weaknessAnalysis?.weakSubjects?.length || 0) === 0 && (
                      <p className='text-sm text-green-600'>弱点分野は見つかりませんでした👍</p>
                    )}
                  </div>
                </div>

                {/* 学習推奨 */}
                <div className='card-secondary rounded-lg p-4'>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>学習推奨</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>推奨学習時間:</span>
                      <span className='font-medium'>{analysisResult?.studyRecommendation?.dailyStudyTime || 0}分/日</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>週間目標:</span>
                      <span className='font-medium'>
                        {Math.floor((analysisResult?.studyRecommendation?.weeklyGoal || 0) / 60)}h{' '}
                        {(analysisResult?.studyRecommendation?.weeklyGoal || 0) % 60}m
                      </span>
                    </div>
                    <div className='mt-3'>
                      <span className='text-slate-600 dark:text-slate-300 text-xs sm:text-sm'>重点科目:</span>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {analysisResult?.studyRecommendation?.focusSubjects?.map((subject, index) => (
                          <span key={index} className='badge-info text-xs rounded'>
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-4 text-xs text-gray-500'>
                分析日時: {new Date(analysisResult?.analysisDate || new Date()).toLocaleString('ja-JP')}
              </div>
            </div>
          )}

          {/* ========================================
              🤖 ML学習効率分析セクション (新機能)
              ======================================== */}

          {/* ML分析実行ボタン */}
          {user?.id && (
            <div className='mb-6 flex justify-between items-center'>
              <div>
                <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>🤖 ML学習効率分析</h3>
                <p className='text-sm text-slate-600 dark:text-slate-300'>機械学習による高度な学習効率分析と予測</p>
              </div>
              <button
                onClick={generateMLAnalysis}
                disabled={isGeneratingML}
                className='btn-secondary hover-lift click-shrink focus-ring interactive-disabled flex items-center space-x-2'
              >
                {isGeneratingML ? (
                  <>
                    <div className='loading-spinner-white'></div>
                    <span>分析中...</span>
                  </>
                ) : (
                  <>
                    <span>🧠</span>
                    <span>ML分析実行</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ML分析エラー表示 */}
          {mlError && (
            <div className='mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
              <p className='text-sm text-red-600 dark:text-red-400'>{mlError}</p>
            </div>
          )}

          {/* 予測分析結果 */}
          {predictiveAnalysis && (
            <div className='bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-8'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-xl font-semibold text-slate-900 dark:text-white'>🔮 予測分析結果</h3>
                <div className='flex items-center space-x-2'>
                  <span className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                    {predictiveAnalysis.examPassProbability}%
                  </span>
                  <span className='text-sm text-purple-800 dark:text-purple-300'>合格予測確率</span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='card-secondary rounded-lg p-4'>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>📈 学習予測</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>推奨学習時間:</span>
                      <span className='font-medium'>{predictiveAnalysis.recommendedStudyHours}時間</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>合格まで:</span>
                      <span className='font-medium'>{predictiveAnalysis.timeToReadiness}日</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600 dark:text-slate-300'>信頼区間:</span>
                      <span className='font-medium'>
                        {Math.round(predictiveAnalysis.confidenceLevel * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className='card-secondary rounded-lg p-4'>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>⚠️ リスク要因</h4>
                  <div className='space-y-1'>
                    {predictiveAnalysis.riskFactors.slice(0, 3).map((factor, index) => (
                      <div
                        key={index}
                        className='text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded'
                      >
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>

                <div className='card-secondary rounded-lg p-4'>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>✨ 成功要因</h4>
                  <div className='space-y-1'>
                    {predictiveAnalysis.successFactors.slice(0, 3).map((factor, index) => (
                      <div
                        key={index}
                        className='text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded'
                      >
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* パーソナライズド推奨 */}
          {personalizedRecommendations && (
            <div className='bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 mb-8'>
              <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-4'>🎯 パーソナライズド推奨</h3>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>📅 今週の学習計画</h4>
                  <div className='space-y-2'>
                    {/* 新しいdailyStudyPlan構造に対応 */}
                    {personalizedRecommendations.dailyStudyPlan?.slice(0, 3).map((plan: any, index: number) => (
                      <div key={index} className='card-secondary rounded-lg p-3'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm font-medium text-slate-900 dark:text-white'>
                            {plan.subjects?.join(', ')} ({plan.estimatedTime}分)
                          </span>
                          <span
                            className='text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          >
                            {plan.priority || '重要'}
                          </span>
                        </div>
                        <div className='text-xs text-slate-600 dark:text-slate-300'>
                          目標: {plan.objectives?.join(', ') || '学習を進める'}
                        </div>
                      </div>
                    )) || 
                    /* フォールバック: 従来のstudyPlan.focusAreas構造 */
                    personalizedRecommendations.studyPlan?.focusAreas?.slice(0, 3).map((area: string, index: number) => (
                      <div key={index} className='card-secondary rounded-lg p-3'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm font-medium text-slate-900 dark:text-white'>
                            学習分野 {index + 1}
                          </span>
                          <span
                            className='text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          >
                            重要
                          </span>
                        </div>
                        <div className='text-xs text-slate-600 dark:text-slate-300'>
                          {area}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className='font-semibold text-slate-900 dark:text-white mb-3'>🏆 推奨学習分野</h4>
                  <div className='space-y-2'>
                    {personalizedRecommendations.studyPlan?.focusAreas
                      ?.slice(0, 4)
                      .map((area: string, index: number) => (
                      <div key={index} className='card-secondary rounded-lg p-3'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium text-slate-900 dark:text-white'>{area}</span>
                          <span className='text-xs text-gray-500 dark:text-gray-400'>
                            優先度: {personalizedRecommendations.priority}
                          </span>
                        </div>
                        <div className='text-xs text-slate-600 dark:text-slate-300 mt-1'>
                          重点学習分野として推奨されています
                        </div>
                      </div>
                    )) || []}
                  </div>
                </div>
              </div>

              {/* 学習戦略 */}
              <div className='mt-4 card-secondary rounded-lg p-4'>
                <h4 className='font-semibold text-slate-900 dark:text-white mb-2'>🛤️ 学習戦略</h4>
                
                {/* 練習戦略 */}
                <div className='mb-3'>
                  <h5 className='text-sm font-medium text-slate-800 dark:text-slate-200 mb-1'>練習戦略</h5>
                  <div className='text-xs text-slate-600 dark:text-slate-300'>
                    推奨問題タイプ: {personalizedRecommendations.practiceStrategy?.recommendedQuestionTypes?.join(', ') || '未設定'}
                  </div>
                  <div className='text-xs text-slate-600 dark:text-slate-300'>
                    強化分野: {personalizedRecommendations.practiceStrategy?.weaknessesToAddress?.join(', ') || '未設定'}
                  </div>
                </div>
                
                {/* 試験戦略 */}
                <div>
                  <h5 className='text-sm font-medium text-slate-800 dark:text-slate-200 mb-1'>試験戦略</h5>
                  <div className='text-xs text-slate-600 dark:text-slate-300'>
                    時間管理: {personalizedRecommendations.examStrategy?.timeManagement?.join(', ') || '未設定'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 高度な弱点分析 */}
          {advancedWeakPoints && (
            <div className='bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-6 mb-8'>
              <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-4'>🎯 AI弱点分析</h3>

              <div className='space-y-4'>
                {Array.isArray(advancedWeakPoints) 
                  ? advancedWeakPoints
                    .filter((insight: PerformanceInsight) => insight.type === 'weakness' && insight.priority === 'high')
                    .slice(0, 3)
                    .map((insight: PerformanceInsight, index: number) => (
                  <div key={index} className='card-secondary rounded-lg p-4'>
                    <div className='flex justify-between items-start mb-2'>
                      <h4 className='font-semibold text-slate-900 dark:text-white'>{insight.category}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          insight.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : insight.priority === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}
                      >
                        {insight.priority}
                      </span>
                    </div>
                    <div className='text-sm text-slate-600 dark:text-slate-300 mb-2'>
                      現在値: {insight.metrics.current} | 目標値: {insight.metrics.target} | トレンド: {insight.metrics.trend}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      <strong>{insight.title}:</strong> {insight.description}
                    </div>
                  </div>
                )) 
                  : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        弱点分析データがありません
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* 統計サマリー */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
            <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4'>
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
              </div>
              <div className='text-sm text-blue-800 dark:text-blue-300'>総学習時間</div>
            </div>
            <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-4'>
              <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {(averageUnderstanding || 0).toFixed(1)}
              </div>
              <div className='text-sm text-green-800 dark:text-green-300'>平均理解度</div>
            </div>
            <div className='bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4'>
              <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                {(morningTestAverage || 0).toFixed(1)}%
              </div>
              <div className='text-sm text-orange-800 dark:text-orange-300'>午前正答率</div>
            </div>
            <div className='bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4'>
              <div className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {(afternoonTestAverage || 0).toFixed(1)}
              </div>
              <div className='text-sm text-purple-800 dark:text-purple-300'>午後平均点</div>
            </div>
          </div>

          {/* チャートエリア */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
            {/* 週別学習時間 */}
            <div className='card-secondary p-4'>
              <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>週別学習時間推移</h3>
              <ProgressChart data={weeklyData} />
            </div>

            {/* 科目別学習時間 */}
            <div className='card-secondary p-4'>
              <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>科目別学習時間</h3>
              <StudyTimeChart data={subjectData} />
            </div>
          </div>

          {/* 理解度分析 */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* 理解度レーダーチャート */}
            <div className='card-secondary p-4'>
              <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>分野別理解度</h3>
              {understandingData.length > 0 ? (
                <UnderstandingRadarChart data={understandingData} />
              ) : (
                <div className='h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400'>
                  学習記録がありません
                </div>
              )}
            </div>

            {/* 改善提案 */}
            <div className='card-secondary p-4'>
              <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-4'>学習改善提案</h3>
              <div className='space-y-4'>
                {understandingData.length > 0 && (
                  <>
                    {understandingData
                      .filter(item => item.understanding < 3)
                      .slice(0, 2)
                      .map((item, index) => (
                        <div key={index} className='border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20 p-3'>
                          <h4 className='font-medium text-red-800 dark:text-red-300'>要注意分野</h4>
                          <p className='text-red-700 dark:text-red-400 text-sm'>
                            {item.fullSubject}の理解度が{item.understanding}と低めです。
                          </p>
                          <p className='text-xs text-red-600 dark:text-red-400 mt-1'>重点的な復習をお勧めします</p>
                        </div>
                      ))}

                    {understandingData
                      .filter(item => item.understanding >= 4)
                      .slice(0, 1)
                      .map((item, index) => (
                        <div key={index} className='border-l-4 border-green-400 bg-green-50 dark:bg-green-900/20 p-3'>
                          <h4 className='font-medium text-green-800 dark:text-green-300'>得意分野</h4>
                          <p className='text-green-700 dark:text-green-400 text-sm'>
                            {item.fullSubject}は理解度{item.understanding}と良好です。
                          </p>
                          <p className='text-xs text-green-600 dark:text-green-400 mt-1'>このペースを維持しましょう</p>
                        </div>
                      ))}
                  </>
                )}

                {studyLogs.length === 0 && (
                  <div className='text-center py-8'>
                    <p className='text-gray-500 dark:text-gray-400'>
                      学習記録を追加すると、個別の改善提案が表示されます
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='mt-8 text-center'>
            <p className='text-gray-500 dark:text-gray-400 text-sm'>
              ※ このページの分析結果は学習記録データに基づいて表示されます。
              <br />
              より正確な分析のために、日々の学習記録を継続してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// React.memo でパフォーマンス最適化
export default memo(Analysis);
