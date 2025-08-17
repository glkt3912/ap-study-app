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
import { unifiedApiClient } from '@/lib/unified-api';
import { errorHandler } from '@/lib/error-handler';

export default function ClientHome() {
  const { isAuthenticated, user, userId, isLoading: authLoading, logout } = useAuth();
  // const { theme } = useTheme(); // テーマは現在未使用
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studyData, setStudyData] = useState(studyPlanData);
  const [loading, setLoading] = useState(false); // テスト用に即座にfalse
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

      try {
        setLoading(true);
        setError(null);
        
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('Making API call to getStudyPlan...');
        }
        
        // 統一APIを使用して学習計画を取得（認証状態に関わらず試行）
        let data;
        const userIdToUse = user?.id || 1; // 認証されていない場合はデフォルトユーザー1を使用
        
        try {
          const studyPlan = await unifiedApiClient.getStudyPlan(userIdToUse);
          // 統一APIレスポンスを既存形式に変換
          data = studyPlan.weeks || [];
          
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('統一API成功:', data.length, '週のデータを取得');
          }
        } catch (unifiedError) {
          console.warn('統一API失敗、レガシーAPIにフォールバック:', unifiedError);
          // フォールバック: 既存APIを使用
          try {
            data = await apiClient.getStudyPlan();
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log('レガシーAPI成功:', data.length, '週のデータを取得');
            }
          } catch (legacyError) {
            console.warn('レガシーAPIも失敗、モックデータを使用:', legacyError);
            // 両方のAPIが失敗した場合はモックデータを使用
            setStudyData(studyPlanData);
            setLoading(false);
            setError('APIエラーが発生しました。モックデータを表示しています。');
            return;
          }
        }

        // 開発環境でデータ構造を確認
        if (process.env.NODE_ENV === 'development') {
          console.log('=== API Response Data ===');
          console.log('Data length:', data?.length);
          console.log('First week sample:', data?.[0]);
          console.log('First day sample:', data?.[0]?.days?.[0]);
        }

        // 試験設定も読み込む
        await loadExamConfig();
        
        // バックエンドのデータ構造をフロントエンドの構造に変換（安全な変換）
        const convertedData = data.map((week: any) => {
          try {
            return {
              ...week,
              goals: Array.isArray(week.goals) ? week.goals : 
                     typeof week.goals === 'string' ? JSON.parse(week.goals) : [],
              days: (week.days || []).map((day: any) => {
                try {
                  return {
                    ...day,
                    topics: Array.isArray(day.topics) ? day.topics : 
                           typeof day.topics === 'string' ? JSON.parse(day.topics) : [],
                  };
                } catch (topicsError) {
                  console.warn('Topics parsing error for day:', day, topicsError);
                  return { ...day, topics: [] };
                }
              }),
            };
          } catch (weekError) {
            console.warn('Week parsing error:', week, weekError);
            return { ...week, goals: [], days: [] };
          }
        });

        setStudyData(convertedData);
        setLoading(false); // 成功時に明示的にローディングを終了
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Data loading completed successfully');
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('=== 学習データの取得に失敗しました ===');
          // eslint-disable-next-line no-console
          console.error('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL);
          // eslint-disable-next-line no-console
          console.error('Full URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/study/plan`);
          // eslint-disable-next-line no-console
          console.error('Original Error:', err);
          // eslint-disable-next-line no-console
          console.error('Error Type:', typeof err, Object.prototype.toString.call(err));
          // eslint-disable-next-line no-console
          console.error('Error Properties:', Object.getOwnPropertyNames(err));
          // eslint-disable-next-line no-console
          console.error('Error Message:', err instanceof Error ? err.message : String(err));
          // eslint-disable-next-line no-console
          console.error('Error Stack:', err instanceof Error ? err.stack : 'No stack trace');
          // eslint-disable-next-line no-console
          console.error('User Info:', {
            isAuthenticated,
            userId: user?.id,
            hasUser: !!user
          });
          // eslint-disable-next-line no-console
          console.error('Network Status:', navigator.onLine ? 'Online' : 'Offline');
        }

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
          console.error('StandardError詳細:', standardError);
        }

        // HTTP 500エラーの場合は開発環境でモックデータを使用
        if (process.env.NODE_ENV === 'development' && err instanceof Error && err.message?.includes('500')) {
          console.warn('HTTP 500エラーのため、モックデータを使用します');
          setStudyData(studyPlanData);
          setError('サーバーエラーが発生しました。モックデータを表示しています。バックエンドログを確認してください。');
          return;
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
              // リトライ時も統一APIを使用
              let data;
              const retryUserIdToUse = user?.id || 1;
              try {
                const studyPlan = await unifiedApiClient.getStudyPlan(retryUserIdToUse);
                data = studyPlan.weeks || [];
              } catch (unifiedError) {
                console.warn('リトライ時の統一API失敗、レガシーAPIにフォールバック:', unifiedError);
                data = await apiClient.getStudyPlan();
              }
              
              const convertedData = data.map((week: any) => ({
                ...week,
                goals: typeof week.goals === 'string' ? JSON.parse(week.goals) : week.goals,
                days: week.days.map((day: any) => ({
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
  }, [isAuthenticated, user?.id, authLoading, loadExamConfig, logout]);

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
