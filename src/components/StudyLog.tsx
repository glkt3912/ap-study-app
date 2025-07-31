'use client'

import { useState } from 'react'

interface StudyLogEntry {
  date: string
  subject: string
  studyTime: number
  understanding: number
  memo: string
}

export default function StudyLog() {
  const [logs, setLogs] = useState<StudyLogEntry[]>([])
  const [newLog, setNewLog] = useState<StudyLogEntry>({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    studyTime: 0,
    understanding: 0,
    memo: ''
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newLog.subject && newLog.studyTime > 0) {
      setLogs([...logs, { ...newLog }])
      setNewLog({
        date: new Date().toISOString().split('T')[0],
        subject: '',
        studyTime: 0,
        understanding: 0,
        memo: ''
      })
    }
  }

  const getTotalStudyTime = () => {
    return logs.reduce((total, log) => total + log.studyTime, 0)
  }

  const getAverageUnderstanding = () => {
    if (logs.length === 0) return 0
    return logs.reduce((total, log) => total + log.understanding, 0) / logs.length
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">学習記録</h2>
          <p className="text-gray-600 mt-1">日々の学習内容を記録して進捗を管理しましょう</p>
        </div>

        <div className="p-6">
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
                  min="0"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{logs.length}</div>
              <div className="text-sm text-blue-800">記録数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{Math.floor(getTotalStudyTime() / 60)}h {getTotalStudyTime() % 60}m</div>
              <div className="text-sm text-green-800">総学習時間</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{getAverageUnderstanding().toFixed(1)}</div>
              <div className="text-sm text-yellow-800">平均理解度</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">学習履歴</h3>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">まだ学習記録がありません</p>
            ) : (
              <div className="space-y-3">
                {logs.slice().reverse().map((log, index) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}