'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

// 動的インポートでコード分割
const StudyTimeChart = dynamic(() => import('./charts/AnalysisCharts').then(mod => ({ default: mod.StudyTimeChart })), {
  loading: () => <div className="h-[300px] bg-gray-100 rounded animate-pulse" />,
  ssr: false
})

const ProgressChart = dynamic(() => import('./charts/AnalysisCharts').then(mod => ({ default: mod.ProgressChart })), {
  loading: () => <div className="h-[300px] bg-gray-100 rounded animate-pulse" />,
  ssr: false
})

const UnderstandingRadarChart = dynamic(() => import('./charts/AnalysisCharts').then(mod => ({ default: mod.UnderstandingRadarChart })), {
  loading: () => <div className="h-[300px] bg-gray-100 rounded animate-pulse" />,
  ssr: false
})
import { apiClient, StudyLog, MorningTest, AfternoonTest } from '../lib/api'
// import { ChartSkeleton, CardSkeleton } from './ui/Skeleton'

// 分析結果の型定義
interface StudyPattern {
  totalStudyTime: number
  averageStudyTime: number
  studyFrequency: number
  bestStudyTime: string
  consistencyScore: number
}

interface WeaknessAnalysis {
  weakSubjects: Array<{
    subject: string
    understanding: number
    studyTime: number
    testScore: number
    improvement: number
  }>
  weakTopics: Array<{
    topic: string
    subject: string
    understanding: number
    testAccuracy: number
    priority: number
  }>
}

interface StudyRecommendation {
  dailyStudyTime: number
  weeklyGoal: number
  focusSubjects: string[]
  reviewSchedule: Array<{
    subject: string
    nextReviewDate: string
    priority: number
  }>
}

interface AnalysisResult {
  id: number
  analysisDate: string
  studyPattern: StudyPattern
  weaknessAnalysis: WeaknessAnalysis
  studyRecommendation: StudyRecommendation
  overallScore: number
}




export default function Analysis() {
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([])
  const [morningTests, setMorningTests] = useState<MorningTest[]>([])
  const [afternoonTests, setAfternoonTests] = useState<AfternoonTest[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  // const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  // const [examDate, setExamDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  // const [isPredicting, setIsPredicting] = useState(false)

  const fetchAnalysisData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [logs, morningData, afternoonData] = await Promise.all([
        apiClient.getStudyLogs(),
        apiClient.getMorningTests(),
        apiClient.getAfternoonTests()
      ])
      setStudyLogs(logs)
      setMorningTests(morningData)
      setAfternoonTests(afternoonData)
      
      // 最新の分析結果を取得
      await fetchLatestAnalysis()
    } catch (error) {
      // 分析データの取得に失敗
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalysisData()
  }, [fetchAnalysisData])

  const fetchLatestAnalysis = async () => {
    try {
      const result = await apiClient.getLatestAnalysis()
      setAnalysisResult(result)
    } catch (error) {
      // 最新分析結果の取得に失敗
    }
  }


  const runAnalysis = async () => {
    try {
      setIsAnalyzing(true)
      const result = await apiClient.runAnalysis()
      setAnalysisResult(result)
    } catch (error) {
      // 分析実行に失敗
    } finally {
      setIsAnalyzing(false)
    }
  }


  // 学習時間の週別データ
  const getWeeklyStudyData = () => {
    const weeklyData: { [key: string]: number } = {}
    studyLogs.forEach(log => {
      const date = new Date(log.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const week = weekStart.toISOString().split('T')[0]
      if (week) {
        weeklyData[week] = (weeklyData[week] || 0) + log.studyTime
      }
    })
    
    return Object.entries(weeklyData)
      .map(([week, time]) => ({
        week: new Date(week).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        time: Math.round(time / 60 * 10) / 10 // 時間に変換
      }))
      .slice(-8) // 直近8週間
  }

  // 科目別学習時間
  const getSubjectStudyData = () => {
    const subjectData: { [key: string]: number } = {}
    studyLogs.forEach(log => {
      subjectData[log.subject] = (subjectData[log.subject] || 0) + log.studyTime
    })
    
    return Object.entries(subjectData)
      .map(([subject, time]) => ({
        subject: subject.length > 10 ? subject.substring(0, 10) + '...' : subject,
        time: Math.round(time / 60 * 10) / 10,
        fullSubject: subject
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 6)
  }

  // 理解度分析
  const getUnderstandingData = () => {
    const subjectUnderstanding: { [key: string]: { total: number, count: number } } = {}
    studyLogs.forEach(log => {
      if (!subjectUnderstanding[log.subject]) {
        subjectUnderstanding[log.subject] = { total: 0, count: 0 }
      }
      const subjectData = subjectUnderstanding[log.subject]
      if (subjectData) {
        subjectData.total += log.understanding
        subjectData.count += 1
      }
    })
    
    return Object.entries(subjectUnderstanding)
      .map(([subject, data]) => ({
        subject: subject.length > 8 ? subject.substring(0, 8) + '...' : subject,
        understanding: Math.round((data.total / data.count) * 10) / 10,
        fullSubject: subject
      }))
      .sort((a, b) => a.understanding - b.understanding)
  }

  // 統計情報の計算
  const getTotalStudyTime = () => studyLogs.reduce((total, log) => total + log.studyTime, 0)
  const getAverageUnderstanding = () => {
    if (studyLogs.length === 0) return 0
    return studyLogs.reduce((total, log) => total + log.understanding, 0) / studyLogs.length
  }
  const getMorningTestAverage = () => {
    if (morningTests.length === 0) return 0
    const totalCorrect = morningTests.reduce((total, test) => total + test.correctAnswers, 0)
    const totalQuestions = morningTests.reduce((total, test) => total + test.totalQuestions, 0)
    return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
  }
  const getAfternoonTestAverage = () => {
    if (afternoonTests.length === 0) return 0
    return afternoonTests.reduce((total, test) => total + test.score, 0) / afternoonTests.length
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">学習分析</h2>
            <p className="text-gray-600 mt-1">学習データを分析して効率的な学習方法を見つけましょう</p>
          </div>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  const weeklyData = getWeeklyStudyData()
  const subjectData = getSubjectStudyData()
  const understandingData = getUnderstandingData()
  const totalStudyTime = getTotalStudyTime()
  const averageUnderstanding = getAverageUnderstanding()
  const morningTestAverage = getMorningTestAverage()
  const afternoonTestAverage = getAfternoonTestAverage()

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">学習分析</h2>
          <p className="text-gray-600 mt-1">学習データを分析して効率的な学習方法を見つけましょう</p>
        </div>

        <div className="p-6">
          {/* 分析実行ボタン */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI学習分析</h3>
              <p className="text-sm text-gray-600">学習データを分析して個別の改善提案を生成します</p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || studyLogs.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>分析中...</span>
                </>
              ) : (
                <>
                  <span>🧠</span>
                  <span>分析実行</span>
                </>
              )}
            </button>
          </div>

          {/* AI分析結果 */}
          {analysisResult && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">AI学習分析結果</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-indigo-600">{analysisResult.overallScore}</span>
                  <span className="text-sm text-indigo-800">総合スコア</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 学習パターン */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">学習パターン</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">総学習時間:</span>
                      <span className="font-medium">{Math.floor(analysisResult.studyPattern.totalStudyTime / 60)}h {analysisResult.studyPattern.totalStudyTime % 60}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均学習時間:</span>
                      <span className="font-medium">{analysisResult.studyPattern.averageStudyTime}分/日</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">学習頻度:</span>
                      <span className="font-medium">{analysisResult.studyPattern.studyFrequency}日/週</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">継続性:</span>
                      <span className="font-medium">{analysisResult.studyPattern.consistencyScore}%</span>
                    </div>
                  </div>
                </div>

                {/* 弱点分析 */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">弱点分析</h4>
                  <div className="space-y-2">
                    {analysisResult.weaknessAnalysis.weakSubjects.slice(0, 3).map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">{subject.subject}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-2 bg-gray-200 rounded">
                            <div 
                              className={`h-2 rounded ${
                                subject.understanding < 2 ? 'bg-red-400' :
                                subject.understanding < 3 ? 'bg-orange-400' :
                                subject.understanding < 4 ? 'bg-yellow-400' : 'bg-green-400'
                              }`}
                              style={{ width: `${(subject.understanding / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{subject.understanding.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                    {analysisResult.weaknessAnalysis.weakSubjects.length === 0 && (
                      <p className="text-sm text-green-600">弱点分野は見つかりませんでした👍</p>
                    )}
                  </div>
                </div>

                {/* 学習推奨 */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">学習推奨</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">推奨学習時間:</span>
                      <span className="font-medium">{analysisResult.studyRecommendation.dailyStudyTime}分/日</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">週間目標:</span>
                      <span className="font-medium">{Math.floor(analysisResult.studyRecommendation.weeklyGoal / 60)}h {analysisResult.studyRecommendation.weeklyGoal % 60}m</span>
                    </div>
                    <div className="mt-3">
                      <span className="text-gray-600 text-xs">重点科目:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysisResult.studyRecommendation.focusSubjects.map((subject, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                分析日時: {new Date(analysisResult.analysisDate).toLocaleString('ja-JP')}
              </div>
            </div>
          )}

          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</div>
              <div className="text-sm text-blue-800">総学習時間</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{averageUnderstanding.toFixed(1)}</div>
              <div className="text-sm text-green-800">平均理解度</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{morningTestAverage.toFixed(1)}%</div>
              <div className="text-sm text-orange-800">午前正答率</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{afternoonTestAverage.toFixed(1)}</div>
              <div className="text-sm text-purple-800">午後平均点</div>
            </div>
          </div>

          {/* チャートエリア */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 週別学習時間 */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">週別学習時間推移</h3>
              <ProgressChart data={weeklyData} />
            </div>

            {/* 科目別学習時間 */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">科目別学習時間</h3>
              <StudyTimeChart data={subjectData} />
            </div>
          </div>

          {/* 理解度分析 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 理解度レーダーチャート */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">分野別理解度</h3>
              {understandingData.length > 0 ? (
                <UnderstandingRadarChart data={understandingData} />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500">
                  学習記録がありません
                </div>
              )}
            </div>

            {/* 改善提案 */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">学習改善提案</h3>
              <div className="space-y-4">
                {understandingData.length > 0 && (
                  <>
                    {understandingData
                      .filter(item => item.understanding < 3)
                      .slice(0, 2)
                      .map((item, index) => (
                        <div key={index} className="border-l-4 border-red-400 bg-red-50 p-3">
                          <h4 className="font-medium text-red-800">要注意分野</h4>
                          <p className="text-red-700 text-sm">{item.fullSubject}の理解度が{item.understanding}と低めです。</p>
                          <p className="text-xs text-red-600 mt-1">重点的な復習をお勧めします</p>
                        </div>
                      ))}
                    
                    {understandingData
                      .filter(item => item.understanding >= 4)
                      .slice(0, 1)
                      .map((item, index) => (
                        <div key={index} className="border-l-4 border-green-400 bg-green-50 p-3">
                          <h4 className="font-medium text-green-800">得意分野</h4>
                          <p className="text-green-700 text-sm">{item.fullSubject}は理解度{item.understanding}と良好です。</p>
                          <p className="text-xs text-green-600 mt-1">このペースを維持しましょう</p>
                        </div>
                      ))}
                  </>
                )}
                
                {studyLogs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">学習記録を追加すると、個別の改善提案が表示されます</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              ※ このページの分析結果は学習記録データに基づいて表示されます。<br/>
              より正確な分析のために、日々の学習記録を継続してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}