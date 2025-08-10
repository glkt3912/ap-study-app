'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface ReviewItem {
  id: string;
  category: string;
  question_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  understanding_level: number;
  last_reviewed: string;
  next_review_date: string;
  review_count: number;
  priority_score: number;
}

export function ReviewSystem() {
  const [todayReviews, setTodayReviews] = useState<ReviewItem[]>([]);
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUnderstanding, setCurrentUnderstanding] = useState(3);

  // 復習スケジュール生成
  const generateReviewSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.generateReviewSchedule();
      await loadTodayReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : '復習スケジュールの生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 本日の復習項目取得
  const loadTodayReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getTodayReviews();
      setTodayReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '復習項目の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 復習完了
  const completeReview = async (reviewItemId: string, understanding: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.completeReview(reviewItemId, understanding);
      setActiveReview(null);
      await loadTodayReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : '復習の完了に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayReviews();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 bg-red-100';
    if (score >= 0.6) return 'text-orange-600 bg-orange-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getReviewIntervalText = (reviewCount: number) => {
    const intervals = [1, 3, 7, 14, 30, 60, 120];
    const interval = intervals[Math.min(reviewCount, intervals.length - 1)] || 120;
    return `${interval}日後`;
  };

  return (
    <div className='bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0'>
        <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>復習システム</h2>
        <button
          onClick={generateReviewSchedule}
          disabled={loading}
          className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 text-sm sm:text-base'
        >
          復習スケジュール生成
        </button>
      </div>

      {error && <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>{error}</div>}

      {loading && (
        <div className='flex justify-center items-center py-8'>
          <div className='loading-spinner'></div>
          <span className='ml-2 loading-text'>読み込み中...</span>
        </div>
      )}

      {/* アクティブな復習 */}
      {activeReview && !loading && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-semibold mb-4'>復習中: {activeReview.category}</h3>

          <div className='bg-white dark:bg-slate-700 rounded-lg p-4 mb-4'>
            <p className='text-slate-900 dark:text-slate-100 mb-4'>{activeReview.question_text}</p>

            <div className='flex items-center space-x-4 mb-4'>
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(activeReview.difficulty)}`}>
                {activeReview.difficulty}
              </span>
              <span className='text-sm text-gray-600 dark:text-gray-400'>復習回数: {activeReview.review_count}回</span>
              <span className='text-sm text-gray-600 dark:text-gray-400'>前回理解度: {activeReview.understanding_level}/5</span>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>現在の理解度 (1-5)</label>
              <div className='flex space-x-2 justify-center sm:justify-start'>
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setCurrentUnderstanding(level)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                      currentUnderstanding === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex space-x-3'>
              <button
                onClick={() => completeReview(activeReview.id, currentUnderstanding)}
                disabled={loading}
                className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400'
              >
                復習完了
              </button>
              <button
                onClick={() => setActiveReview(null)}
                className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 本日の復習項目一覧 */}
      {!activeReview && !loading && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>本日の復習項目 ({todayReviews.length}件)</h3>
            {todayReviews.length === 0 && <p className='text-gray-600 dark:text-gray-400'>本日の復習項目はありません。</p>}
          </div>

          {todayReviews.length > 0 && (
            <div className='space-y-3'>
              {todayReviews.map(item => (
                <div key={item.id} className='border border-slate-200 rounded-lg p-3 sm:p-4'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-2 sm:space-y-0'>
                    <h4 className='font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base'>{item.category}</h4>
                    <div className='flex items-center space-x-2'>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority_score)}`}>
                        優先度: {Math.round(item.priority_score * 100)}%
                      </span>
                    </div>
                  </div>

                  <p className='text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2'>{item.question_text}</p>

                  <div className='flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0'>
                    <div className='flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      <span>理解度: {item.understanding_level}/5</span>
                      <span>復習回数: {item.review_count}回</span>
                      <span className='hidden sm:inline'>次回: {getReviewIntervalText(item.review_count)}</span>
                    </div>
                    <button
                      onClick={() => setActiveReview(item)}
                      className='px-3 py-1 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 self-start sm:self-auto'
                    >
                      復習開始
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 忘却曲線の説明 */}
      <div className='mt-8 bg-gray-50 rounded-lg p-4'>
        <h4 className='font-semibold mb-2'>忘却曲線に基づく復習システム</h4>
        <p className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
          エビングハウスの忘却曲線理論に基づき、最適なタイミングで復習を提案します。
        </p>
        <div className='text-xs text-gray-500 dark:text-gray-400'>復習間隔: 1日 → 3日 → 1週間 → 2週間 → 1ヶ月 → 2ヶ月 → 4ヶ月</div>
      </div>
    </div>
  );
}
