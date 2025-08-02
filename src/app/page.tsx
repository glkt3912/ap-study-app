'use client'

import { useState, useEffect } from 'react'
import Dashboard from '@/components/Dashboard'
import WeeklyPlan from '@/components/WeeklyPlan'
import StudyLog from '@/components/StudyLog'
import TestRecord from '@/components/TestRecord'
import Analysis from '@/components/Analysis'
import { studyPlanData } from '@/data/studyPlan'
import { apiClient, StudyWeek } from '@/lib/api'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [studyData, setStudyData] = useState(studyPlanData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        console.error('学習データの取得に失敗しました:', err)
        setError('データの読み込みに失敗しました。モックデータを使用します。')
        // エラー時はモックデータを使用
        setStudyData(studyPlanData)
      } finally {
        setLoading(false)
      }
    }

    fetchStudyData()
  }, [])

  const tabs = [
    { id: 'dashboard', name: 'ダッシュボード', icon: '📊' },
    { id: 'plan', name: '学習計画', icon: '📅' },
    { id: 'log', name: '学習記録', icon: '✏️' },
    { id: 'test', name: '問題演習', icon: '📝' },
    { id: 'analysis', name: '分析', icon: '📈' }
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
      case 'analysis':
        return <Analysis />
      default:
        return <Dashboard studyData={studyData} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            応用情報技術者試験 学習管理
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            試験まで残り: <span className="font-semibold text-blue-600">約12週間</span>
          </p>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">データを読み込み中...</span>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  )
}