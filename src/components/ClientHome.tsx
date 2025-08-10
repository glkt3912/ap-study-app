'use client';

import { useState, useEffect, useMemo } from 'react';
import Dashboard from '@/components/Dashboard';
import WeeklyPlan from '@/components/WeeklyPlan';
import StudyLog from '@/components/StudyLog';
import TestRecord from '@/components/TestRecord';
import Analysis from '@/components/Analysis';
import Quiz from '@/components/Quiz';
import DataExport from '@/components/DataExport';
import DiagnosticHub from '@/components/DiagnosticHub';
import { AdvancedAnalysis } from '@/components/AdvancedAnalysis';
import { ReviewSystem } from '@/components/ReviewSystem';
import { AuthModal } from '@/components/auth';
import { ErrorToastManager } from '@/components/ErrorToast';
import { useAuth } from '@/contexts/AuthContext';
import { studyPlanData } from '@/data/studyPlan';
import { apiClient } from '@/lib/api';
import { errorHandler } from '@/lib/error-handler';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ClientHome() {
  const { isAuthenticated, user, isLoading: authLoading, logout } = useAuth();
  // const { theme } = useTheme(); // テーマは現在未使用
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studyData, setStudyData] = useState(studyPlanData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // タブ定義（メモ化で最適化）
  const tabs = useMemo(() => [
    { id: 'dashboard', name: 'ダッシュボード', icon: '📊' },
    { id: 'plan', name: '学習計画', icon: '📅' },
    { id: 'log', name: '学習記録', icon: '✏️' },
    { id: 'test', name: '問題演習', icon: '📝' },
    { id: 'quiz', name: 'Quiz', icon: '🧭' },
    { id: 'analysis', name: '分析', icon: '📈' },
    { id: 'advanced', name: '高度分析', icon: '🎯' },
    { id: 'review', name: '復習システム', icon: '🔄' },
    { id: 'export', name: 'エクスポート', icon: '💾' },
    { id: 'debug', name: '診断', icon: '🧪' },
  ], []);


  // バックエンドからデータを取得
  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getStudyPlan();

        // バックエンドのデータ構造をフロントエンドの構造に変換
        const convertedData = data.map(week => ({
          ...week,
          goals: typeof week.goals === 'string' ? JSON.parse(week.goals) : week.goals,
          days: week.days.map(day => ({
            ...day,
            topics: typeof day.topics === 'string' ? JSON.parse(day.topics) : day.topics,
          })),
        }));

        setStudyData(convertedData);
      } catch (err) {
        // 高度なエラーハンドリング
        const standardError = await errorHandler.handleApiError(
          err,
          '/api/study/plan',
          'GET',
          user?.id
            ? {
                userId: user.id.toString(),
              }
            : undefined
        );

        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('学習データの取得に失敗しました:', standardError);
        }

        setError('データの読み込みに失敗しました。モックデータを使用します。');
        // エラー時はモックデータを使用
        setStudyData(studyPlanData);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyData();
  }, [user?.id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard studyData={studyData} />;
      case 'plan':
        return <WeeklyPlan studyData={studyData} setStudyData={setStudyData} />;
      case 'log':
        return <StudyLog />;
      case 'test':
        return <TestRecord />;
      case 'quiz':
        return <Quiz />;
      case 'analysis':
        return <Analysis />;
      case 'advanced':
        return <AdvancedAnalysis />;
      case 'review':
        return <ReviewSystem />;
      case 'export':
        return <DataExport studyData={studyData} />;
      case 'debug':
        return <DiagnosticHub />;
      default:
        return <Dashboard studyData={studyData} />;
    }
  };

  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 transition-all duration-200 duration-200'>
      <header className='bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700'>
        <div className='container-primary py-3 sm:py-4'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='heading-primary'>
                応用情報技術者試験 学習管理
              </h1>
              <p className='text-sm sm:text-base text-secondary mt-1'>
                試験まで残り: <span className='font-semibold text-blue-600 dark:text-blue-400'>約12週間</span>
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              {/* ダークモード切替ボタン */}
              <ThemeToggle />
              
              {/* 認証状態表示・ログインボタン */}
              {isAuthenticated && user ? (
                <div className='flex items-center space-x-3'>
                  <span className='text-sm text-secondary'>{user.name || user.email}</span>
                  <button
                    onClick={logout}
                    className='btn-secondary btn-small'
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className='btn-primary btn-small'
                  disabled={authLoading}
                >
                  {authLoading ? '読み込み中...' : 'ログイン'}
                </button>
              )}

            </div>
          </div>
        </div>
      </header>

      <nav className='bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700'>
        <div className='container-primary relative'>
          {/* スクロール可能なタブナビゲーション */}
          <div className='overflow-x-auto scrollbar-modern relative'>
            <div className='flex min-w-max px-2'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-tab ${
                    activeTab === tab.id
                      ? 'nav-tab-active'
                      : 'nav-tab-inactive'
                  }`}
                >
                  <span className='mr-2'>{tab.icon}</span>
                  {tab.name}
                  {activeTab === tab.id && (
                    <div className='absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-lg -z-10' />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* スクロールヒント - 小画面のみ表示 */}
          <div className='md:hidden bg-slate-50/80 dark:bg-slate-700/30 px-4 py-1 text-xs text-center text-muted backdrop-blur-sm'>
            ← スワイプでスクロール →
          </div>
        </div>
      </nav>

      <main className='container-primary section-padding'>
        {error && (
          <div className='mb-4 alert-warning'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <span className='text-yellow-400'>⚠️</span>
              </div>
              <div className='ml-3'>
                <p className='text-sm'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='loading-spinner'></div>
            <span className='ml-3 loading-text'>データを読み込み中...</span>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* エラートースト管理 */}
      <ErrorToastManager />
    </div>
  );
}
