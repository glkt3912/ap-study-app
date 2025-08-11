'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { ExamConfigModal } from '@/components/ExamConfigModal';
import { useAuth } from '@/contexts/AuthContext';
import { studyPlanData } from '@/data/studyPlan';
import { apiClient, type ExamConfig } from '@/lib/api';
import { errorHandler } from '@/lib/error-handler';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ClientHome() {
  const { isAuthenticated, user, userId, isLoading: authLoading, logout } = useAuth();
  // const { theme } = useTheme(); // テーマは現在未使用
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studyData, setStudyData] = useState(studyPlanData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 試験設定関連
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [isExamConfigModalOpen, setIsExamConfigModalOpen] = useState(false);

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


  // 試験設定を読み込む
  const loadExamConfig = useCallback(async () => {
    try {
      const config = await apiClient.getExamConfig(userId.toString());
      setExamConfig(config);
    } catch (_error) {
      // 設定が存在しない場合は null のまま
      setExamConfig(null);
    }
  }, [userId]);

  // 試験設定保存ハンドラー
  const handleExamConfigSave = (savedConfig: ExamConfig) => {
    setExamConfig(savedConfig);
    setIsExamConfigModalOpen(false);
  };

  // 残り日数計算
  const calculateRemainingDays = (examDate: string): number => {
    return Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  // バックエンドからデータを取得
  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getStudyPlan();

        // 試験設定も読み込む
        await loadExamConfig();
        
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
  }, [user?.id, loadExamConfig]);

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
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900 transition-all duration-200'>
      <header className='card-primary shadow-gentle border-b border-slate-200 dark:border-slate-700 z-header'>
        <div className='container-primary py-3 sm:py-4'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='heading-primary'>
                応用情報技術者試験 学習管理
              </h1>
              <p className='text-sm sm:text-base text-secondary mt-1'>
                {examConfig ? (
                  <span>
                    試験まで残り: 
                    <span className='font-semibold text-blue-600 dark:text-blue-400 ml-1'>
                      {calculateRemainingDays(examConfig.examDate)}日
                    </span>
                    <span className='text-xs text-gray-500 ml-2'>
                      ({new Date(examConfig.examDate).toLocaleDateString('ja-JP')})
                    </span>
                  </span>
                ) : (
                  <span className='text-orange-600 dark:text-orange-400'>
                    試験日未設定 - 
                    <button
                      onClick={() => setIsExamConfigModalOpen(true)}
                      className='ml-1 underline hover:no-underline font-semibold'
                    >
                      今すぐ設定
                    </button>
                  </span>
                )}
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
                    className='btn-secondary btn-small hover-lift click-shrink focus-ring'
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className='btn-primary btn-small hover-lift click-shrink focus-ring'
                  disabled={authLoading}
                >
                  {authLoading ? '読み込み中...' : 'ログイン'}
                </button>
              )}

            </div>
          </div>
        </div>
      </header>

      <nav className='card-primary border-b border-slate-200 dark:border-slate-700 z-header backdrop-blur-modern'>
        <div className='container-primary relative'>
          {/* スクロール可能なタブナビゲーション */}
          <div className='overflow-x-auto scrollbar-modern relative'>
            <div className='flex min-w-max px-2'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-tab hover-lift click-shrink focus-ring ${
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
          <div className='md:hidden card-accent/80 px-4 py-1 text-xs text-center text-muted backdrop-blur-sm'>
            ← スワイプでスクロール →
          </div>
        </div>
      </nav>

      <main className='container-primary section-padding'>
        {error && (
          <div className='mb-4 alert-warning hover-lift'>
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
          <div className='motion-safe-animate'>
            {renderContent()}
          </div>
        )}
      </main>

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* 試験設定モーダル */}
      <ExamConfigModal
        isOpen={isExamConfigModalOpen}
        onClose={() => setIsExamConfigModalOpen(false)}
        onSave={handleExamConfigSave}
        userId={userId.toString()}
        {...(examConfig && { initialConfig: examConfig })}
      />

      {/* エラートースト管理 */}
      <ErrorToastManager />
    </div>
  );
}
