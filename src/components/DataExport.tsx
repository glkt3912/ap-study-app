'use client'

import { useState } from 'react'
import { StudyWeek } from '@/data/studyPlan'

interface DataExportProps {
  studyData: StudyWeek[]
}

export default function DataExport({ studyData }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  // JSON形式でデータをエクスポート
  const exportToJSON = () => {
    setIsExporting(true)
    try {
      const dataStr = JSON.stringify(studyData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `ap-study-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('JSON エクスポートエラー:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // CSV形式でデータをエクスポート
  const exportToCSV = () => {
    setIsExporting(true)
    try {
      const csvHeaders = [
        '週',
        'フェーズ',
        'タイトル',
        '曜日',
        '科目',
        'トピック',
        '予定時間(分)',
        '実際時間(分)',
        '完了',
        '理解度',
        'メモ'
      ].join(',')

      const csvData = studyData.flatMap(week =>
        week.days.map(day => [
          week.weekNumber,
          `"${week.phase}"`,
          `"${week.title}"`,
          `"${day.day}"`,
          `"${day.subject}"`,
          `"${day.topics.join('; ')}"`,
          day.estimatedTime,
          day.actualTime,
          day.completed ? '完了' : '未完了',
          day.understanding,
          `"${day.memo || ''}"`
        ].join(','))
      ).join('\n')

      const csvContent = csvHeaders + '\n' + csvData
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `ap-study-data-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('CSV エクスポートエラー:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 学習統計データを生成
  const generateStats = () => {
    const totalDays = studyData.reduce((sum, week) => sum + week.days.length, 0)
    const completedDays = studyData.reduce((sum, week) => 
      sum + week.days.filter(day => day.completed).length, 0)
    const totalEstimatedTime = studyData.reduce((sum, week) => 
      sum + week.days.reduce((daySum, day) => daySum + day.estimatedTime, 0), 0)
    const totalActualTime = studyData.reduce((sum, week) => 
      sum + week.days.reduce((daySum, day) => daySum + day.actualTime, 0), 0)
    const averageUnderstanding = studyData.reduce((sum, week) => 
      sum + week.days.reduce((daySum, day) => daySum + day.understanding, 0), 0) / totalDays

    return {
      totalDays,
      completedDays,
      completionRate: Math.round((completedDays / totalDays) * 100),
      totalEstimatedTime,
      totalActualTime,
      averageUnderstanding: Math.round(averageUnderstanding * 10) / 10,
      timeEfficiency: totalEstimatedTime > 0 ? Math.round((totalActualTime / totalEstimatedTime) * 100) : 0
    }
  }

  const stats = generateStats()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        📊 データエクスポート
      </h2>

      {/* 学習統計表示 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.completedDays}/{stats.totalDays}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-300">完了日数</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completionRate}%
          </div>
          <div className="text-sm text-green-600 dark:text-green-300">完了率</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(stats.totalActualTime / 60)}h
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-300">学習時間</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.averageUnderstanding}/5
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-300">平均理解度</div>
        </div>
      </div>

      {/* エクスポートボタン */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          エクスポート形式を選択
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportToJSON}
            disabled={isExporting}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <span className="mr-2">📄</span>
            JSON形式でエクスポート
          </button>
          
          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <span className="mr-2">📊</span>
            CSV形式でエクスポート
          </button>
        </div>

        {isExporting && (
          <div className="text-center text-gray-600 dark:text-gray-300">
            エクスポート中...
          </div>
        )}
      </div>

      {/* 使用方法説明 */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          💡 エクスポート機能について
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• <strong>JSON形式</strong>: データの完全なバックアップ、他システムでの活用</li>
          <li>• <strong>CSV形式</strong>: Excel等での分析、表計算ソフトでの管理</li>
          <li>• ファイル名には日付が自動で含まれます</li>
          <li>• エクスポートしたデータは個人の学習記録として保管できます</li>
        </ul>
      </div>
    </div>
  )
}