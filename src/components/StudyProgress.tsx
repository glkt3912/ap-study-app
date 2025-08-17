'use client';

import { useState, useEffect } from 'react';
import { StudyPlanProgress, StudyPlan } from '../types/api';
import { apiClient } from '../lib/api';
import { unifiedApiClient } from '../lib/unified-api';

interface StudyProgressProps {
  planId: number;
  plan?: StudyPlan;
  compact?: boolean;
}

export default function StudyProgress({ planId, plan: _plan, compact = false }: StudyProgressProps) {
  const [progress, setProgress] = useState<StudyPlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, [planId]); // loadProgress is stable

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 統一APIを使用して学習計画を取得
      try {
        const studyPlan = await unifiedApiClient.getStudyPlan(planId);
        // 統一APIレスポンスから進捗データを生成
        const progressData = generateProgressFromStudyPlan(studyPlan);
        setProgress(progressData);
      } catch (unifiedError) {
        console.warn('統一API失敗、レガシーAPIにフォールバック:', unifiedError);
        // フォールバック: 既存APIを使用
        const progressData = await apiClient.getStudyPlanProgress(planId);
        setProgress(progressData);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
      setError('進捗データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 統一APIレスポンスから進捗データを生成するヘルパー関数
  const generateProgressFromStudyPlan = (studyPlan: any): StudyPlanProgress => {
    const totalDays = studyPlan.weeks?.reduce((total: number, week: any) => total + (week.days?.length || 0), 0) || 0;
    const completedDays = studyPlan.weeks?.reduce((total: number, week: any) => 
      total + (week.days?.filter((day: any) => day.completed).length || 0), 0) || 0;
    
    // 既存のStudyPlanProgress型に合わせたデータ構造を作成
    return {
      planId: studyPlan.id,
      totalDays: totalDays,
      completedDays: completedDays,
      progressPercentage: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
      totalHours: Math.round((studyPlan.weeks?.reduce((total: number, week: any) => 
        total + (week.days?.reduce((weekTotal: number, day: any) => 
          weekTotal + (day.actualTime || 0), 0) || 0), 0) || 0) / 60),
      completedHours: Math.round((studyPlan.weeks?.reduce((total: number, week: any) => 
        total + (week.days?.filter((day: any) => day.completed)
          .reduce((weekTotal: number, day: any) => 
            weekTotal + (day.actualTime || 0), 0) || 0), 0) || 0) / 60),
      averageScore: calculateAverageUnderstanding(studyPlan.weeks || []) * 20, // 5段階 -> 100%変換
      streakDays: calculateStreakDays(studyPlan.weeks || []),
      lastStudyDate: getLastStudyDate(studyPlan.weeks || []),
      weeklyProgress: studyPlan.weeks?.map((week: any) => ({
        weekNumber: week.weekNumber,
        completed: week.days?.filter((day: any) => day.completed).length || 0,
        total: week.days?.length || 0,
        progressPercentage: week.days?.length > 0 ? 
          Math.round((week.days.filter((day: any) => day.completed).length / week.days.length) * 100) : 0
      })) || [],
      recentActivity: studyPlan.weeks?.slice(0, 3).map((week: any) => ({
        type: 'study_unit' as const,
        date: week.days?.[0]?.createdAt || new Date().toISOString(),
        description: `第${week.weekNumber}週: ${week.title}`
      })) || [],
      createdAt: studyPlan.createdAt || new Date().toISOString(),
      updatedAt: studyPlan.updatedAt || new Date().toISOString()
    } as any;
  };
  
  const calculateAverageUnderstanding = (weeks: any[]): number => {
    const allDays = weeks.flatMap(week => week.days || []);
    const daysWithUnderstanding = allDays.filter(day => day.understanding > 0);
    if (daysWithUnderstanding.length === 0) return 0;
    
    const totalUnderstanding = daysWithUnderstanding.reduce(
      (sum, day) => sum + day.understanding, 0);
    return Math.round(totalUnderstanding / daysWithUnderstanding.length);
  };

  const calculateStreakDays = (weeks: any[]): number => {
    // 簡単な実装：完了した日数を返す
    const allDays = weeks.flatMap(week => week.days || []);
    return allDays.filter(day => day.completed).length;
  };

  const getLastStudyDate = (weeks: any[]): string => {
    const allDays = weeks.flatMap(week => week.days || []);
    const completedDays = allDays.filter(day => day.completed);
    if (completedDays.length === 0) return new Date().toISOString();
    
    // 最後に完了した日を返す（簡単な実装）
    return completedDays[completedDays.length - 1]?.updatedAt || new Date().toISOString();
  };

  const calculateProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今日';
    } else if (diffDays === 1) {
      return '明日';
    } else if (diffDays > 0) {
      return `${diffDays}日後`;
    } else {
      return `${Math.abs(diffDays)}日前`;
    }
  };

  const getStreakColor = (days: number) => {
    if (days >= 7) return 'text-green-600 dark:text-green-400';
    if (days >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="study-loading-compact">
        <div className="study-loading-spinner-compact"></div>
        <span className="ml-2 text-sm">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="study-error">
        <p className="study-error-text">{error}</p>
        <button
          onClick={loadProgress}
          className="study-error-button"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="study-empty">
        進捗データがありません
      </div>
    );
  }

  if (compact) {
    return (
      <div className="study-card-compact">
        <div className="flex items-center justify-between mb-3">
          <h3 className="study-section-title">学習進捗</h3>
          <span className="study-meta">
            {formatDate(progress.lastStudyDate || new Date().toISOString())}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="study-stat-label">完了日数</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {progress.completedDays}<span className="text-sm text-gray-500">/{progress.totalDays}</span>
            </div>
          </div>
          <div>
            <div className="study-stat-label">学習時間</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {progress.completedHours}<span className="text-sm text-gray-500">h</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>進捗率</span>
            <span>{calculateProgressPercentage(progress.completedDays, progress.totalDays)}%</span>
          </div>
          <div className="study-progress-bar">
            <div
              className="study-progress-fill study-progress-fill-blue"
              style={{ width: `${calculateProgressPercentage(progress.completedDays, progress.totalDays)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400">連続学習:</span>
            <span className={`ml-1 font-medium ${getStreakColor(progress.streakDays)}`}>
              {progress.streakDays}日
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            平均スコア: {progress.averageScore}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">学習進捗サマリー</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {calculateProgressPercentage(progress.completedDays, progress.totalDays)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">全体進捗</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {progress.completedDays}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">完了日数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {progress.completedHours}h
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">学習時間</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStreakColor(progress.streakDays)}`}>
              {progress.streakDays}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">連続学習日</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>日数進捗</span>
              <span>{progress.completedDays}/{progress.totalDays}日</span>
            </div>
            <div className="study-progress-bar">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgressPercentage(progress.completedDays, progress.totalDays)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>時間進捗</span>
              <span>{progress.completedHours}/{progress.totalHours}時間</span>
            </div>
            <div className="study-progress-bar">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgressPercentage(progress.completedHours, progress.totalHours)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Study Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">学習統計</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">平均スコア</span>
                <span className="font-medium">{progress.averageScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">最終学習日</span>
                <span className="font-medium">
                  {formatDate(progress.lastStudyDate || new Date().toISOString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">1日平均学習時間</span>
                <span className="font-medium">
                  {progress.completedDays > 0 
                    ? Math.round((progress.completedHours / progress.completedDays) * 10) / 10 
                    : 0}時間
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">目標達成予測</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">残り日数</span>
                <span className="font-medium">{progress.totalDays - progress.completedDays}日</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">必要な1日学習時間</span>
                <span className="font-medium">
                  {progress.totalDays - progress.completedDays > 0 
                    ? Math.round(
                        ((progress.totalHours - progress.completedHours) / 
                         (progress.totalDays - progress.completedDays)) * 10
                      ) / 10
                    : 0}時間
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">達成可能性</span>
                <span className={`font-medium ${
                  progress.averageScore >= 70 
                    ? 'text-green-600 dark:text-green-400' 
                    : progress.averageScore >= 50 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {progress.averageScore >= 70 
                    ? '高い' 
                    : progress.averageScore >= 50 
                    ? '中程度' 
                    : '要努力'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      {progress.upcomingMilestones && progress.upcomingMilestones.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">今後のマイルストーン</h3>
          <div className="space-y-3">
            {progress.upcomingMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                    {milestone.isCompleted && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded">
                        完了
                      </span>
                    )}
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{milestone.description}</p>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(milestone.targetDate)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(milestone.targetDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}