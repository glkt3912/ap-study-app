'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StudyWeek } from '@/data/studyPlan';
import { CardSkeleton } from './ui/Skeleton';
import { apiClient, PredictiveAnalysis, PersonalizedRecommendations } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  studyData: StudyWeek[];
  isLoading?: boolean;
}

export default function Dashboard({ studyData, isLoading = false }: DashboardProps) {
  const { user } = useAuth();

  // AI学習コーチ機能のステート
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(
    null
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // フォールバック: 個別AI分析データ取得 (バックエンド未対応時)
  const fetchAIDataFallback = useCallback(async () => {
    if (!user?.id || user.id <= 0) {
      return;
    }

    try {
      const [predictions, recommendations] = await Promise.all([
        apiClient.getPredictiveAnalysis(user.id).catch(() => null),
        apiClient.getPersonalizedRecommendations(user.id).catch(() => null),
      ]);

      setPredictiveAnalysis(predictions);
      setPersonalizedRecommendations(recommendations);
    } catch (error) {
      // エラーログは開発環境でのみ出力
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('AI データ取得エラー:', error);
      }
    }
  }, [user?.id]);

  // バッチ処理: ダッシュボードML分析データ一括取得 (2個API → 1個API)
  const fetchBatchDashboardMLData = useCallback(async () => {
    if (!user?.id || user.id <= 0) {
      return;
    }

    try {
      setIsLoadingAI(true);
      const batchData = await apiClient.getBatchDashboardMLData(user.id);

      setPredictiveAnalysis(batchData.predictiveAnalysis);
      setPersonalizedRecommendations(batchData.personalizedRecommendations);
    } catch (error) {
      // バッチAPI失敗時はフォールバックを使用
      await fetchAIDataFallback();

      // エラーログは開発環境でのみ出力
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('バッチML データ取得エラー、フォールバックを使用:', error);
      }
    } finally {
      setIsLoadingAI(false);
    }
  }, [user?.id, fetchAIDataFallback]);

  useEffect(() => {
    if (user?.id && !isLoading) {
      fetchBatchDashboardMLData();
    }
  }, [user?.id, isLoading, fetchBatchDashboardMLData]);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }
  const totalDays = studyData.reduce((acc, week) => acc + week.days.length, 0);
  const completedDays = studyData.reduce((acc, week) => acc + week.days.filter(day => day.completed).length, 0);
  const totalStudyTime = studyData.reduce(
    (acc, week) => acc + week.days.reduce((dayAcc, day) => dayAcc + day.actualTime, 0),
    0
  );
  const averageUnderstanding =
    studyData.reduce((acc, week) => {
      const weekUnderstanding = week.days.reduce((dayAcc, day) => dayAcc + day.understanding, 0);
      return acc + weekUnderstanding / week.days.length;
    }, 0) / studyData.length;

  const progressPercentage = (completedDays / totalDays) * 100;

  const getCurrentWeek = () => {
    return studyData.find(week => week.days.some(day => !day.completed)) || studyData[0];
  };

  const currentWeek = getCurrentWeek();
  const todayTask = currentWeek?.days.find(day => !day.completed);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
        <div className='bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0'>
              <span className='text-xl sm:text-2xl'>📚</span>
            </div>
            <div className='ml-3 sm:ml-4 min-w-0'>
              <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>学習進捗</p>
              <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {progressPercentage.toFixed(1)}%
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {completedDays}/{totalDays} 日完了
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0'>
              <span className='text-xl sm:text-2xl'>⏱️</span>
            </div>
            <div className='ml-3 sm:ml-4 min-w-0'>
              <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>総学習時間</p>
              <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {Math.floor(totalStudyTime / 60)}h
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>{totalStudyTime % 60}分</p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex-shrink-0'>
              <span className='text-xl sm:text-2xl'>🎯</span>
            </div>
            <div className='ml-3 sm:ml-4 min-w-0'>
              <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>平均理解度</p>
              <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {averageUnderstanding.toFixed(1)}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>/ 5.0</p>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0'>
              <span className='text-xl sm:text-2xl'>📅</span>
            </div>
            <div className='ml-3 sm:ml-4 min-w-0'>
              <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>現在の週</p>
              <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
                第{currentWeek?.weekNumber}週
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{currentWeek?.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          🤖 AI学習コーチ (新機能)
          ======================================== */}
      {user?.id && predictiveAnalysis && (
        <div className='bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-md p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-2'>
              <span className='text-2xl'>🤖</span>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>AI学習コーチ</h3>
            </div>
            <div className='text-right'>
              <div className='text-3xl font-bold text-purple-600 dark:text-purple-400'>
                {predictiveAnalysis.examPassProbability}%
              </div>
              <div className='text-sm text-purple-800 dark:text-purple-300'>合格予測確率</div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white dark:bg-gray-700 rounded-lg p-4'>
              <div className='flex items-center space-x-2 mb-2'>
                <span className='text-lg'>📈</span>
                <h4 className='font-semibold text-gray-900 dark:text-white'>学習予測</h4>
              </div>
              <div className='space-y-1 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>推奨時間:</span>
                  <span className='font-medium'>{predictiveAnalysis.recommendedStudyHours}h/日</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-300'>合格まで:</span>
                  <span className='font-medium'>{predictiveAnalysis.timeToReadiness}日</span>
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-700 rounded-lg p-4'>
              <div className='flex items-center space-x-2 mb-2'>
                <span className='text-lg'>⚠️</span>
                <h4 className='font-semibold text-gray-900 dark:text-white'>注意点</h4>
              </div>
              <div className='space-y-1'>
                {(predictiveAnalysis?.riskFactors || []).slice(0, 2).map((factor, index) => (
                  <span
                    key={index}
                    className='inline-block text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded'
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>

            <div className='bg-white dark:bg-gray-700 rounded-lg p-4'>
              <div className='flex items-center space-x-2 mb-2'>
                <span className='text-lg'>✨</span>
                <h4 className='font-semibold text-gray-900 dark:text-white'>強み</h4>
              </div>
              <div className='space-y-1'>
                {(predictiveAnalysis?.successFactors || []).slice(0, 2).map((factor, index) => (
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

          {/* 今日の推奨アクション */}
          {personalizedRecommendations && 
            personalizedRecommendations.dailyStudyPlan && 
            personalizedRecommendations.dailyStudyPlan.length > 0 && (
            <div className='mt-4 bg-white dark:bg-gray-700 rounded-lg p-4'>
              <div className='flex items-center space-x-2 mb-3'>
                <span className='text-lg'>📋</span>
                <h4 className='font-semibold text-gray-900 dark:text-white'>今日の推奨アクション</h4>
              </div>
              {(personalizedRecommendations?.dailyStudyPlan || []).slice(0, 1).map((plan, index) => (
                <div key={index} className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                      {plan.subjects.join(', ')}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        plan.priority === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : plan.priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}
                    >
                      {plan.priority}
                    </span>
                  </div>
                  <div className='text-xs text-gray-600 dark:text-gray-300'>
                    目標時間: {plan.estimatedTime}分 | 学習目標: {(plan.objectives || []).slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoadingAI && (
            <div className='mt-4 flex items-center justify-center py-4'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600'></div>
              <span className='ml-2 text-sm text-gray-600 dark:text-gray-300'>AI分析中...</span>
            </div>
          )}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>今日の学習</h3>
          </div>
          <div className='p-6'>
            {todayTask ? (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium text-gray-900 dark:text-white'>{todayTask.subject}</h4>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>{todayTask.day}曜日</span>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>学習トピック:</p>
                  <div className='flex flex-wrap gap-2'>
                    {todayTask.topics.map((topic, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full'
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-300'>
                  <span>予定時間: {todayTask.estimatedTime}分</span>
                  <span>実際の時間: {todayTask.actualTime}分</span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div
                    className='bg-blue-600 dark:bg-blue-500 h-2 rounded-full'
                    style={{ width: todayTask.completed ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className='text-gray-500 dark:text-gray-400'>今日の学習タスクはありません</p>
            )}
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>週別進捗</h3>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              {studyData.slice(0, 3).map(week => {
                const weekProgress = (week.days.filter(day => day.completed).length / week.days.length) * 100;
                return (
                  <div key={week.weekNumber} className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        第{week.weekNumber}週: {week.title}
                      </span>
                      <span className='text-sm text-gray-600 dark:text-gray-300'>{weekProgress.toFixed(0)}%</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${weekProgress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md'>
        <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>学習フェーズ別進捗</h3>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {['基礎固め期', '応用知識習得期', '総仕上げ期'].map(phase => {
              const phaseWeeks = studyData.filter(week => week.phase === phase);
              const phaseProgress =
                phaseWeeks.length > 0
                  ? (phaseWeeks.reduce((acc, week) => acc + week.days.filter(day => day.completed).length, 0) /
                      phaseWeeks.reduce((acc, week) => acc + week.days.length, 0)) *
                    100
                  : 0;

              return (
                <div key={phase} className='text-center'>
                  <div className='w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center'>
                    <span className='text-white font-bold text-lg'>{phaseProgress.toFixed(0)}%</span>
                  </div>
                  <h4 className='font-medium text-gray-900 dark:text-white'>{phase}</h4>
                  <p className='text-sm text-gray-600 dark:text-gray-300'>{phaseWeeks.length}週間</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
