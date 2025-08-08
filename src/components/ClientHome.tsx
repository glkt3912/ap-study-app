'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import WeeklyPlan from '@/components/WeeklyPlan'
import StudyLog from '@/components/StudyLog'
import TestRecord from '@/components/TestRecord'
import Analysis from '@/components/Analysis'
import Quiz from '@/components/Quiz'
import DataExport from '@/components/DataExport'
import DiagnosticHub from '@/components/DiagnosticHub'
import { AdvancedAnalysis } from '@/components/AdvancedAnalysis'
import { ReviewSystem } from '@/components/ReviewSystem'
import { AuthModal } from '@/components/auth'
import { ErrorToastManager } from '@/components/ErrorToast'
import { useAuth } from '@/contexts/AuthContext'
import { studyPlanData } from '@/data/studyPlan'
import { apiClient } from '@/lib/api'
import { errorHandler } from '@/lib/error-handler'

export default function ClientHome() {
  const { isAuthenticated, user, isLoading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [studyData, setStudyData] = useState(studyPlanData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // ダークモード初期化
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ap-study-theme')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark
      
      setIsDarkMode(shouldBeDark)
      document.documentElement.classList.toggle('dark', shouldBeDark)
    }
  }, [])

  const toggleDarkMode = () => {
    if (!mounted || typeof window === 'undefined') return
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.documentElement.classList.toggle('dark', newMode)
    localStorage.setItem('ap-study-theme', newMode ? 'dark' : 'light')
  }

  // バックエンドからデータを取得
  useEffect(() => {
    const fetchStudyData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.getStudyPlan()
        
        // バックエンドのデータ構造をフロントエンドの構造に変換
        const convertedData = data.map(week => ({
          ...week,
          goals: typeof week.goals === 'string' ? JSON.parse(week.goals) : week.goals,
          days: week.days.map(day => ({
            ...day,
            topics: typeof day.topics === 'string' ? JSON.parse(day.topics) : day.topics
          }))
        }))
        
        setStudyData(convertedData)
      } catch (err) {
        // 高度なエラーハンドリング
        const standardError = await errorHandler.handleApiError(
          err,
          '/api/study/plan',
          'GET',
          user?.id ? {
            userId: user.id.toString(),
          } : undefined
        )

        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('学習データの取得に失敗しました:', standardError)
        }

        setError('データの読み込みに失敗しました。モックデータを使用します。')
        // エラー時はモックデータを使用
        setStudyData(studyPlanData)
      } finally {
        setLoading(false)
      }
    }

    fetchStudyData()
  }, [user?.id])

  const tabs = [
    { id: 'dashboard', name: 'ダッシュボード', icon: '📊' },
    { id: 'plan', name: '学習計画', icon: '📅' },
    { id: 'log', name: '学習記録', icon: '✏️' },
    { id: 'test', name: '問題演習', icon: '📝' },
    { id: 'quiz', name: 'Quiz', icon: '🧭' },
    { id: 'analysis', name: '分析', icon: '📈' },
    { id: 'advanced', name: '高度分析', icon: '🎯' },
    { id: 'review', name: '復習システム', icon: '🔄' },
    { id: 'export', name: 'エクスポート', icon: '💾' },
    { id: 'debug', name: '診断', icon: '🧪' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard studyData={studyData} />
      case 'plan':
        return <WeeklyPlan studyData={studyData} setStudyData={setStudyData} />
      case 'log':
        return <StudyLog />
      case 'test':
        return <TestRecord />
      case 'quiz':
        return <Quiz />
      case 'analysis':
        return <Analysis />
      case 'advanced':
        return <AdvancedAnalysis />
      case 'review':
        return <ReviewSystem />
      case 'export':
        return <DataExport studyData={studyData} />
      case 'debug':
        return <DiagnosticHub />
      default:
        return <Dashboard studyData={studyData} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                応用情報技術者試験 学習管理
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                試験まで残り: <span className="font-semibold text-blue-600 dark:text-blue-400">約12週間</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* 認証状態表示・ログインボタン */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={authLoading}
                >
                  {authLoading ? '読み込み中...' : 'ログイン'}
                </button>
              )}
              
              {mounted ? (
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="テーマ切り替え"
                >
                  <span className="text-xl">
                    {isDarkMode ? '☀️' : '🌙'}
                  </span>
                </button>
              ) : (
                <div className="p-2 rounded-lg bg-gray-100">
                  <span className="text-xl">🌙</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden text-xs">{tab.name.slice(0, 2)}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {error && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">データを読み込み中...</span>
          </div>
        ) : (
          renderContent()
        )}
      </main>
      
      {/* 認証モーダル */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* エラートースト管理 */}
      <ErrorToastManager />
    </div>
  )
}