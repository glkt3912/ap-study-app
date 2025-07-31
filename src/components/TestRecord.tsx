'use client'

import { useState } from 'react'
import { testCategories, afternoonQuestionTypes } from '@/data/studyPlan'

interface MorningTestRecord {
  date: string
  category: string
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  memo?: string
}

interface AfternoonTestRecord {
  date: string
  questionType: string
  score: number
  timeSpent: number
  memo?: string
}

export default function TestRecord() {
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon'>('morning')
  const [morningTests, setMorningTests] = useState<MorningTestRecord[]>([])
  const [afternoonTests, setAfternoonTests] = useState<AfternoonTestRecord[]>([])
  
  const [newMorningTest, setNewMorningTest] = useState<MorningTestRecord>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    totalQuestions: 10,
    correctAnswers: 0,
    timeSpent: 0,
    memo: ''
  })

  const [newAfternoonTest, setNewAfternoonTest] = useState<AfternoonTestRecord>({
    date: new Date().toISOString().split('T')[0],
    questionType: '',
    score: 0,
    timeSpent: 0,
    memo: ''
  })

  const handleMorningSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMorningTest.category && newMorningTest.totalQuestions > 0) {
      setMorningTests([...morningTests, { ...newMorningTest }])
      setNewMorningTest({
        date: new Date().toISOString().split('T')[0],
        category: '',
        totalQuestions: 10,
        correctAnswers: 0,
        timeSpent: 0,
        memo: ''
      })
    }
  }

  const getMorningStats = () => {
    if (morningTests.length === 0) return { averageScore: 0, totalQuestions: 0 }
    
    const totalQuestions = morningTests.reduce((acc, test) => acc + test.totalQuestions, 0)
    const totalCorrect = morningTests.reduce((acc, test) => acc + test.correctAnswers, 0)
    
    return {
      averageScore: (totalCorrect / totalQuestions) * 100,
      totalQuestions: totalQuestions
    }
  }

  const morningStats = getMorningStats()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">問題演習記録</h2>
          <p className="text-gray-600 mt-1">午前・午後問題の演習結果を記録して弱点を把握しましょう</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('morning')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'morning'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              午前問題
            </button>
            <button
              onClick={() => setActiveTab('afternoon')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'afternoon'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              午後問題
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'morning' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{morningStats.averageScore.toFixed(1)}%</div>
                  <div className="text-sm text-blue-800">平均正答率</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{morningStats.totalQuestions}</div>
                  <div className="text-sm text-green-800">総問題数</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{morningTests.length}</div>
                  <div className="text-sm text-purple-800">演習回数</div>
                </div>
              </div>

              <form onSubmit={handleMorningSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                    <input
                      type="date"
                      value={newMorningTest.date}
                      onChange={(e) => setNewMorningTest({...newMorningTest, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分野</label>
                    <select
                      value={newMorningTest.category}
                      onChange={(e) => setNewMorningTest({...newMorningTest, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">分野を選択</option>
                      {testCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">総問題数</label>
                    <input
                      type="number"
                      value={newMorningTest.totalQuestions}
                      onChange={(e) => setNewMorningTest({...newMorningTest, totalQuestions: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">正答数</label>
                    <input
                      type="number"
                      value={newMorningTest.correctAnswers}
                      onChange={(e) => setNewMorningTest({...newMorningTest, correctAnswers: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max={newMorningTest.totalQuestions}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  記録を追加
                </button>
              </form>
            </div>
          )}

          {activeTab === 'afternoon' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <p className="text-gray-500">午後問題の記録機能は開発中です</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}