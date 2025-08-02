'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { apiClient, StudyLog, MorningTest, AfternoonTest } from '../lib/api'

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280']

export default function Analysis() {
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([])
  const [morningTests, setMorningTests] = useState<MorningTest[]>([])
  const [afternoonTests, setAfternoonTests] = useState<AfternoonTest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalysisData()
  }, [])

  const fetchAnalysisData = async () => {
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
    } catch (error) {
      console.error('分析データの取得に失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 学習時間の週別データ
  const getWeeklyStudyData = () => {
    const weeklyData: { [key: string]: number } = {}
    studyLogs.forEach(log => {
      const date = new Date(log.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const week = weekStart.toISOString().split('T')[0]
      weeklyData[week] = (weeklyData[week] || 0) + log.studyTime
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
      subjectUnderstanding[log.subject].total += log.understanding
      subjectUnderstanding[log.subject].count += 1
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
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis label={{ value: '時間', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 科目別学習時間 */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">科目別学習時間</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: '時間', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value, name, props) => [value + '時間', props.payload.fullSubject]} />
                  <Bar dataKey="time" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 理解度分析 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 理解度レーダーチャート */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">分野別理解度</h3>
              {understandingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={understandingData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={0} domain={[0, 5]} />
                    <Radar name="理解度" dataKey="understanding" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    <Tooltip formatter={(value, name, props) => [value, props.payload.fullSubject]} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-250 flex items-center justify-center text-gray-500">
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