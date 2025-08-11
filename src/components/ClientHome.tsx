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
          console.error('学習データの取得に失敗しました:', {
            id: standardError.id,
            category: standardError.category,
            severity: standardError.severity,
            code: standardError.code,
            message: standardError.message,
            userMessage: standardError.userMessage,
            timestamp: standardError.timestamp,
            retryable: standardError.retryable
          });
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
