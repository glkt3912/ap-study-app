'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { AppNavigation } from '@/components/AppNavigation';
import { AppMainContent } from '@/components/AppMainContent';
import { AuthModal } from '@/components/auth';
import { ErrorToastManager } from '@/components/ErrorToast';
import { ExamConfigModal } from '@/components/ExamConfigModal';
import { useAuth } from '@/contexts/AuthContext';
import { studyPlanData } from '@/data/studyPlan';
import { apiClient, type ExamConfig } from '@/lib/api';
import { errorHandler } from '@/lib/error-handler';

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
    // 有効なユーザーIDがない場合はスキップ
    if (!userId || userId === 0) {
      setExamConfig(null);
      return;
    }

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

  // バックエンドからデータを取得
  useEffect(() => {
    const fetchStudyData = async () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('=== fetchStudyData called ===');
        // eslint-disable-next-line no-console
        console.log('Auth state:', {
          isAuthenticated,
          authLoading,
          userId: user?.id,
          hasUser: !!user
        });
      }

      // 認証ローディング中は待機
      if (authLoading) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('Auth loading, waiting...');
        }
        return;
      }

      // 認証されていない場合はモックデータを使用
      if (!isAuthenticated || !user?.id) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('Not authenticated or no user ID, using mock data');
        }
        setStudyData(studyPlanData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('Making API call to getStudyPlan...');
        }
        
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
          console.error('=== 学習データの取得に失敗しました ===');
          // eslint-disable-next-line no-console
          console.error('StandardError詳細:', {
            id: standardError?.id || 'N/A',
            category: standardError?.category || 'N/A',
            severity: standardError?.severity || 'N/A',
            code: standardError?.code || 'N/A',
            message: standardError?.message || 'N/A',
            userMessage: standardError?.userMessage || 'N/A',
            timestamp: standardError?.timestamp || 'N/A',
            retryable: standardError?.retryable || false
          });
          // eslint-disable-next-line no-console
          console.error('Original Error:', err);
          // eslint-disable-next-line no-console
          console.error('User Info:', {
            isAuthenticated,
            userId: user?.id,
            hasUser: !!user
          });
          // eslint-disable-next-line no-console
          console.error('API Endpoint:', '/api/study/plan');
          // eslint-disable-next-line no-console
          console.error('Context:', {
            userId: user?.id?.toString()
          });
        }

        // 認証エラーの場合は自動的にログアウト
        if (standardError.code === 'AUTH_TOKEN_EXPIRED' || standardError.code === 'AUTH_UNAUTHORIZED') {
          setError('セッションが期限切れです。再ログインしてください。');
          
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('Authentication error detected, logging out...');
          }
          
          // 自動ログアウト
          if (typeof logout === 'function') {
            logout();
          }
          // モックデータを使用
          setStudyData(studyPlanData);
        } else if (standardError.retryable && standardError.code !== 'NETWORK_ERROR') {
          // リトライ可能なエラーの場合（ネットワークエラー以外）
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('Retryable error detected, will retry in 2 seconds...');
          }
          
          setError('データの読み込みに失敗しました。2秒後に再試行します...');
          
          // 2秒後にリトライ
          setTimeout(async () => {
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log('Retrying API call...');
            }
            try {
              const data = await apiClient.getStudyPlan();
              const convertedData = data.map(week => ({
                ...week,
                goals: typeof week.goals === 'string' ? JSON.parse(week.goals) : week.goals,
                days: week.days.map(day => ({
                  ...day,
                  topics: typeof day.topics === 'string' ? JSON.parse(day.topics) : day.topics,
                })),
              }));
              setStudyData(convertedData);
              setError(null); // エラーをクリア
              
              if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log('Retry successful!');
              }
            } catch (retryErr) {
              if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.log('Retry failed, using mock data');
              }
              setError('データの読み込みに失敗しました。モックデータを使用します。');
              setStudyData(studyPlanData);
            }
          }, 2000);
        } else {
          setError('データの読み込みに失敗しました。モックデータを使用します。');
          // エラー時はモックデータを使用
          setStudyData(studyPlanData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudyData();
  }, [isAuthenticated, user?.id, loadExamConfig, logout]);

  // イベントハンドラー
  const handleExamConfigClick = () => {
    if (isAuthenticated && userId && userId !== 0) {
      setIsExamConfigModalOpen(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className='app-container'>
      <AppHeader
        isAuthenticated={isAuthenticated}
        user={user}
        authLoading={authLoading}
        examConfig={examConfig}
        onLoginClick={() => setShowAuthModal(true)}
        onExamConfigClick={handleExamConfigClick}
        onLogout={logout}
      />

      <AppNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <AppMainContent
        activeTab={activeTab}
        studyData={studyData}
        setStudyData={setStudyData}
        loading={loading}
        error={error}
      />

      {/* 認証モーダル */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* 試験設定モーダル */}
      {isAuthenticated && userId && userId !== 0 && (
        <ExamConfigModal
          isOpen={isExamConfigModalOpen}
          onClose={() => setIsExamConfigModalOpen(false)}
          onSave={handleExamConfigSave}
          userId={userId.toString()}
          {...(examConfig && { initialConfig: examConfig })}
        />
      )}

      {/* エラートースト管理 */}
      <ErrorToastManager />
    </div>
  );
}
