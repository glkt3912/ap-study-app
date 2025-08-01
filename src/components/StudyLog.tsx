'use client'

import { useState, useEffect } from 'react'
import { apiClient, type StudyLog } from '../lib/api'

interface StudyLogEntry {
  id?: number
  date: string
  subject: string
  topics: string[]
  studyTime: number
  understanding: number
  memo?: string
  efficiency?: number
}

export default function StudyLog() {
  const [logs, setLogs] = useState<StudyLogEntry[]>([])
  const [newLog, setNewLog] = useState<StudyLogEntry>({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    topics: [],
    studyTime: 0,
    understanding: 0,
    memo: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topicInput, setTopicInput] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'time' | 'understanding'>('date')

  const subjects = [
    'コンピュータの基礎理論',
    'アルゴリズムとデータ構造',
    'ハードウェア基礎',
    'ソフトウェア基礎',
    'データベース基礎',
    'ネットワーク基礎',  
    'セキュリティ基礎',
    'システム開発技法',
    'プロジェクトマネジメント',
    'サービスマネジメント',
    '午前問題演習',
    '午後問題演習'
  ]

  // データ取得
  useEffect(() => {
    fetchStudyLogs()
  }, [])

  const fetchStudyLogs = async () => {
    try {
      setIsLoading(true)
      const studyLogs = await apiClient.getStudyLogs()
      setLogs(studyLogs.map(log => ({
        ...log,
        date: new Date(log.date).toISOString().split('T')[0]
      })))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '学習記録の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newLog.subject && newLog.studyTime > 0 && newLog.topics.length > 0) {
      try {
        setIsLoading(true)
        const createdLog = await apiClient.createStudyLog({
          ...newLog,  
          date: new Date(newLog.date).toISOString()
        })
        
        // ローカル状態を更新
        setLogs(prevLogs => [{
          ...createdLog,
          date: new Date(createdLog.date).toISOString().split('T')[0]
        }, ...prevLogs])
        
        // フォームをリセット
        setNewLog({
          date: new Date().toISOString().split('T')[0],
          subject: '',
          topics: [],
          studyTime: 0,
          understanding: 0,
          memo: ''
        })
        setTopicInput('')
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '学習記録の作成に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const addTopic = () => {
    if (topicInput.trim() && !newLog.topics.includes(topicInput.trim())) {
      setNewLog({
        ...newLog,
        topics: [...newLog.topics, topicInput.trim()]
      })
      setTopicInput('')
    }
  }

  const removeTopic = (indexToRemove: number) => {
    setNewLog({
      ...newLog,
      topics: newLog.topics.filter((_, index) => index !== indexToRemove)
    })
  }

  const getTotalStudyTime = () => {
    return logs.reduce((total, log) => total + log.studyTime, 0)
  }

  const getAverageUnderstanding = () => {
    if (logs.length === 0) return 0
    return logs.reduce((total, log) => total + log.understanding, 0) / logs.length
  }

  // フィルタリング機能
  const getFilteredLogs = () => {
    let filtered = [...logs]

    // 科目フィルター
    if (selectedSubject) {
      filtered = filtered.filter(log => log.subject === selectedSubject)
    }

    // 日付範囲フィルター
    if (selectedDateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      if (selectedDateRange === 'week') {
        cutoffDate.setDate(now.getDate() - 7)
      } else if (selectedDateRange === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1)
      }
      
      filtered = filtered.filter(log => new Date(log.date) >= cutoffDate)
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'subject':
          return a.subject.localeCompare(b.subject)
        case 'time':
          return b.studyTime - a.studyTime
        case 'understanding':
          return b.understanding - a.understanding
        default:
          return 0
      }
    })

    return filtered
  }

  // フィルタリングされたデータの統計
  const getFilteredStats = () => {
    const filtered = getFilteredLogs()
    const totalTime = filtered.reduce((total, log) => total + log.studyTime, 0)
    const avgUnderstanding = filtered.length > 0 
      ? filtered.reduce((total, log) => total + log.understanding, 0) / filtered.length 
      : 0
    
    // 科目別統計
    const subjectStats: { [key: string]: { time: number, count: number, understanding: number } } = {}
    filtered.forEach(log => {
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = { time: 0, count: 0, understanding: 0 }
      }
      subjectStats[log.subject].time += log.studyTime
      subjectStats[log.subject].count += 1
      subjectStats[log.subject].understanding += log.understanding
    })
    
    const topSubjects = Object.entries(subjectStats)
      .map(([subject, stats]) => ({
        subject,
        time: stats.time,
        count: stats.count,
        avgUnderstanding: stats.understanding / stats.count
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 3)

    return {
      count: filtered.length,
      totalTime,
      avgUnderstanding,
      topSubjects
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">学習記録</h2>
          <p className="text-gray-600 mt-1">日々の学習内容を記録して進捗を管理しましょう</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付
                </label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({...newLog, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  科目
                </label>
                <select
                  value={newLog.subject}
                  onChange={(e) => setNewLog({...newLog, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">科目を選択</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  学習時間 (分)
                </label>
                <input
                  type="number"
                  value={newLog.studyTime}
                  onChange={(e) => setNewLog({...newLog, studyTime: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  理解度 (1-5)
                </label>
                <div className="flex space-x-2 pt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewLog({...newLog, understanding: rating})}
                      className={`w-8 h-8 rounded-full text-sm ${
                        newLog.understanding >= rating
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 学習項目入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                学習項目
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="学習項目を入力 (例: SQL基礎)"
                />
                <button
                  type="button"
                  onClick={addTopic}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newLog.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeTopic(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {newLog.topics.length === 0 && (
                <p className="text-sm text-red-500 mt-1">最低1つの学習項目を追加してください</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                value={newLog.memo}
                onChange={(e) => setNewLog({...newLog, memo: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="学習内容や感想を記録してください"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              記録を追加
            </button>
          </form>

          {/* フィルター・ソートコントロール */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">フィルター・ソート</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">すべての科目</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期間</label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value as 'all' | 'week' | 'month')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">すべての期間</option>
                  <option value="week">過去1週間</option>
                  <option value="month">過去1ヶ月</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">並び順</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'subject' | 'time' | 'understanding')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">日付順</option>
                  <option value="subject">科目順</option>
                  <option value="time">学習時間順</option>
                  <option value="understanding">理解度順</option>
                </select>
              </div>
            </div>
          </div>

          {(() => {
            const filteredStats = getFilteredStats()
            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{filteredStats.count}</div>
                  <div className="text-sm text-blue-800">記録数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{Math.floor(filteredStats.totalTime / 60)}h {filteredStats.totalTime % 60}m</div>
                  <div className="text-sm text-green-800">総学習時間</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">{filteredStats.avgUnderstanding.toFixed(1)}</div>
                  <div className="text-sm text-yellow-800">平均理解度</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-xl font-bold text-purple-600">
                    {filteredStats.topSubjects.length > 0 ? filteredStats.topSubjects[0].subject.substring(0, 8) : 'なし'}
                  </div>
                  <div className="text-sm text-purple-800">最多学習分野</div>
                </div>
              </div>
            )
          })()}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">学習履歴</h3>
            {(() => {
              const filteredLogs = getFilteredLogs()
              return filteredLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {logs.length === 0 ? 'まだ学習記録がありません' : '条件に合う記録がありません'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{log.subject}</h4>
                        <p className="text-sm text-gray-600">{log.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{log.studyTime}分</div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <span
                              key={rating}
                              className={`w-4 h-4 rounded-full text-xs ${
                                log.understanding >= rating
                                  ? 'bg-yellow-400'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {log.memo && (
                      <p className="text-sm text-gray-700 bg-white p-2 rounded border">{log.memo}</p>
                    )}
                  </div>
                ))}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}