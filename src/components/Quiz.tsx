'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, QuizSession } from '../lib/api';

interface QuizCategory {
  category: string;
  questionCount: number;
}
import { QuizEngine } from './quiz/QuizEngine';
import { QuizProgress } from './quiz/QuizProgress';
import { LearningTrends } from './quiz/LearningTrends';
import { QuizUI } from './quiz/QuizUI';
import { QuizResult } from './quiz/QuizResult';

interface QuizState {
  categories: QuizCategory[];
  loading: boolean;
  error: string | null;
  result: QuizSession | null;
  recommendations: {
    reason: string;
    weakCategories?: string[];
    questions: any[];
  } | null;
  progress: {
    overall: {
      totalQuestions: number;
      answeredQuestions: number;
      progressRate: number;
    };
    categoryProgress: any[];
    recentActivity: QuizSession[];
  } | null;
  weakPoints: any[];
  learningTrends: {
    period: number;
    dailyTrends: any[];
    cumulativeProgress: any[];
    categoryTrends: any[];
  } | null;
}

export default function Quiz() {
  
  const [state, setState] = useState<QuizState>({
    categories: [],
    loading: false,
    error: null,
    result: null,
    recommendations: null,
    progress: null,
    weakPoints: [],
    learningTrends: null,
  });

  const [activeTab, setActiveTab] = useState<'quiz' | 'progress' | 'recommendations' | 'trends'>('quiz');

  // Quiz Engine状態管理
  const quizEngine = QuizEngine({
    onQuizComplete: (result) => {
      setState(prev => ({ ...prev, result, error: null }));
    },
    onError: (error) => {
      setState(prev => ({ ...prev, error }));
    },
    isLoading: state.loading,
    setLoading: (loading) => {
      setState(prev => ({ ...prev, loading }));
    },
  });

  // バッチ処理: Quiz機能用データ一括取得
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        const [categories, progress] = await Promise.allSettled([
          apiClient.getQuizCategories(),
          apiClient.getQuizProgress(),
        ]);

        setState(prev => ({
          ...prev,
          categories: categories.status === 'fulfilled' 
            ? categories.value.map((categoryName: string) => ({
                category: categoryName,
                questionCount: 50 // Default question count - could be fetched from API
              }))
            : [],
          progress: progress.status === 'fulfilled' 
            ? {
                overall: {
                  totalQuestions: progress.value.totalSessions || 0,
                  answeredQuestions: progress.value.totalSessions || 0,
                  progressRate: progress.value.averageScore || 0
                },
                categoryProgress: [], // Could be derived from progress.value
                recentActivity: [] // Could be fetched separately
              }
            : {
                overall: { totalQuestions: 0, answeredQuestions: 0, progressRate: 0 },
                categoryProgress: [],
                recentActivity: []
              },
          recommendations: null,
          weakPoints: [],
          learningTrends: null,
          loading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'データの取得に失敗しました',
          loading: false,
        }));
      }
    };

    loadQuizData();
  }, []);

  // エラークリア
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Quiz終了
  const endQuiz = () => {
    setState(prev => ({
      ...prev,
      result: null,
      error: null,
    }));
  };

  // ローディング中
  if (state.loading) {
    return (
      <div className='container-primary py-6'>
        <div className='card-primary p-8 shadow-moderate'>
          <div className='text-center'>
            <div className='loading-spinner-lg mx-auto'></div>
            <p className='mt-4 text-slate-600 dark:text-slate-300'>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (state.error) {
    return (
      <div className='container-primary py-6'>
        <div className='card-primary p-8 shadow-moderate error-state'>
          <div className='text-center'>
            <div className='text-red-500 text-lg font-semibold mb-4'>エラー</div>
            <p className='text-slate-600 dark:text-slate-400 mb-6'>{state.error}</p>
            <button
              onClick={clearError}
              className='btn-primary btn-large hover-lift click-shrink focus-ring'
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 結果表示
  if (state.result) {
    return (
      <QuizResult
        result={state.result}
        onNewQuiz={endQuiz}
        onBackToDashboard={() => window.location.reload()}
      />
    );
  }

  // Quiz進行中
  if (quizEngine.session) {
    const currentQuestion = quizEngine.session.questions[quizEngine.session.currentIndex];
    if (!currentQuestion) return null;

    const userAnswer = quizEngine.session.answers[currentQuestion.id] || '';

    return (
      <QuizUI
        currentQuestion={currentQuestion}
        currentIndex={quizEngine.session.currentIndex}
        totalQuestions={quizEngine.session.questions.length}
        userAnswer={userAnswer}
        onSelectAnswer={quizEngine.selectAnswer}
        onNextQuestion={quizEngine.nextQuestion}
        isLoading={state.loading}
      />
    );
  }

  // Quiz開始画面
  return (
    <div className='container-primary py-6'>
      <div className='card-primary p-8 shadow-moderate hover-lift'>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center'>応用情報技術者試験 過去問Quiz</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* ランダム問題 */}
          <div className='interactive-card hover-lift'>
            <h3 className='heading-tertiary mb-4'>ランダム問題</h3>
            <p className='text-slate-600 dark:text-slate-400 mb-6 text-sm'>全カテゴリからランダムに問題を出題します</p>
            <div className='space-y-3'>
              <button
                onClick={() => quizEngine.startQuiz('random', 5)}
                className='w-full btn-primary hover-lift click-shrink focus-ring'
              >
                5問チャレンジ
              </button>
              <button
                onClick={() => quizEngine.startQuiz('random', 10)}
                className='w-full btn-primary hover-lift click-shrink focus-ring'
              >
                10問チャレンジ
              </button>
            </div>
          </div>

          {/* カテゴリ別問題 */}
          <div className='interactive-card hover-lift hover-glow-success'>
            <h3 className='heading-tertiary mb-4'>カテゴリ別問題</h3>
            <p className='text-slate-600 dark:text-slate-400 mb-6 text-sm'>特定の分野に集中して学習できます</p>
            <div className='space-y-2'>
              {state.categories.map(category => (
                <button
                  key={category.category}
                  onClick={() => quizEngine.startQuiz('category', Math.min(category.questionCount, 10), category.category)}
                  className='w-full text-left card-secondary py-2 px-3 hover-lift click-shrink focus-ring'
                >
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium'>{category.category}</span>
                    <span className='text-xs text-slate-500'>{category.questionCount}問</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 追加情報 */}
        <div className='mt-8 card-accent'>
          <h4 className='font-semibold text-blue-800 mb-2'>📚 学習のポイント</h4>
          <ul className='text-sm text-blue-700 space-y-1'>
            <li>• IPA公式過去問から出題</li>
            <li>• 回答時間が記録され、効率的な学習をサポート</li>
            <li>• 正答率や苦手分野を分析して学習計画を最適化</li>
          </ul>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className='flex overflow-x-auto border-b border-slate-200 mb-6 scrollbar-hide'>
        {[
          { key: 'quiz', label: '問題演習', shortLabel: '演習' },
          { key: 'progress', label: '学習進捗', shortLabel: '進捗' },
          { key: 'recommendations', label: 'おすすめ問題', shortLabel: '推奨' },
          { key: 'trends', label: '学習トレンド', shortLabel: 'トレンド' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className='hidden sm:inline'>{tab.label}</span>
            <span className='sm:hidden'>{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* 進捗タブ */}
      {activeTab === 'progress' && (
        <QuizProgress 
          progressData={state.progress}
          weakPoints={state.weakPoints}
          onStartQuiz={quizEngine.startQuiz}
        />
      )}

      {/* 推奨問題タブ */}
      {activeTab === 'recommendations' && (
        <div className='space-y-6'>
          {/* 苦手分野 */}
          {state.weakPoints.length > 0 && (
            <div className='bg-red-50 rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4 text-red-800'>苦手分野</h3>
              <div className='space-y-2'>
                {state.weakPoints.map((weak: any, index: number) => (
                  <div key={index} className='flex items-center justify-between p-3 bg-white rounded-lg'>
                    <span className='font-medium'>{weak.category}</span>
                    <div className='text-right'>
                      <div className='text-sm text-red-600'>正答率: {Math.round(weak.accuracy_rate)}%</div>
                      <div className='text-xs text-slate-600'>{weak.total_answers}問回答</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 推奨問題 */}
          {state.recommendations && (
            <div className='bg-green-50 rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4 text-green-800'>おすすめ問題</h3>
              <div className='mb-4 p-3 bg-white rounded-lg'>
                <div className='text-sm font-medium text-green-700'>
                  推奨理由: {state.recommendations.reason === 'weak_category_focus' ? '苦手分野の強化' : '一般的な学習'}
                </div>
                {state.recommendations.weakCategories && (
                  <div className='text-xs text-slate-600 mt-1'>
                    重点カテゴリ: {state.recommendations.weakCategories.join(', ')}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (state.recommendations) {
                    quizEngine.startQuiz('weak_points', Math.min(state.recommendations.questions.length, 10));
                  }
                }}
                className='w-full btn-success'
              >
                推奨問題で学習開始 ({Math.min(state.recommendations.questions.length, 10)}問)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 学習トレンドタブ */}
      {activeTab === 'trends' && (
        <LearningTrends trendsData={state.learningTrends} />
      )}
    </div>
  );
}
