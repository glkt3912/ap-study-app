'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { type ExamConfig } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AppHeaderProps {
  isAuthenticated: boolean;
  user: User | null;
  authLoading: boolean;
  examConfig: ExamConfig | null;
  onLoginClick: () => void;
  onExamConfigClick: () => void;
  onLogout: () => void;
}

export function AppHeader({
  isAuthenticated,
  user,
  authLoading,
  examConfig,
  onLoginClick,
  onExamConfigClick,
  onLogout,
}: AppHeaderProps) {
  const calculateRemainingDays = (examDate: string): number => {
    return Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <header className='app-header'>
      <div className='container-primary py-3 sm:py-4'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0'>
          <div className='flex-1 min-w-0'>
            <h1 className='heading-primary truncate sm:text-clip'>
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
                    onClick={onExamConfigClick}
                    className='ml-1 underline hover:no-underline font-semibold'
                  >
                    {isAuthenticated ? '今すぐ設定' : 'ログインして設定'}
                  </button>
                </span>
              )}
            </p>
          </div>
          <div className='flex items-center justify-end space-x-2 sm:space-x-3 flex-shrink-0'>
            <ThemeToggle />
            
            {isAuthenticated && user ? (
              <div className='flex items-center space-x-2 sm:space-x-3'>
                <span className='text-sm text-secondary hidden sm:inline truncate max-w-32'>
                  {user.name || user.email}
                </span>
                <button
                  onClick={onLogout}
                  className='btn-secondary btn-small hover-lift click-shrink focus-ring'
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
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
  );
}