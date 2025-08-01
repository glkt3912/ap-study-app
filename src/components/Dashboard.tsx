'use client'

import { StudyWeek } from '@/data/studyPlan'

interface DashboardProps {
  studyData: StudyWeek[]
}

export default function Dashboard({ studyData }: DashboardProps) {
  const totalDays = studyData.reduce((acc, week) => acc + week.days.length, 0)
  const completedDays = studyData.reduce(
    (acc, week) => acc + week.days.filter(day => day.completed).length,
    0
  )
  const totalStudyTime = studyData.reduce(
    (acc, week) => acc + week.days.reduce((dayAcc, day) => dayAcc + day.actualTime, 0),
    0
  )
  const averageUnderstanding = studyData.reduce(
    (acc, week) => {
      const weekUnderstanding = week.days.reduce((dayAcc, day) => dayAcc + day.understanding, 0)
      return acc + (weekUnderstanding / week.days.length)
    },
    0
  ) / studyData.length

  const progressPercentage = (completedDays / totalDays) * 100

  const getCurrentWeek = () => {
    return studyData.find(week => 
      week.days.some(day => !day.completed)
    ) || studyData[0]
  }

  const currentWeek = getCurrentWeek()
  const todayTask = currentWeek?.days.find(day => !day.completed)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <span className="text-xl sm:text-2xl">📚</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">学習進捗</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{progressPercentage.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">{completedDays}/{totalDays} 日完了</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <span className="text-xl sm:text-2xl">⏱️</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">総学習時間</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{Math.floor(totalStudyTime / 60)}h</p>
              <p className="text-xs text-gray-500">{totalStudyTime % 60}分</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <span className="text-xl sm:text-2xl">🎯</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">平均理解度</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{averageUnderstanding.toFixed(1)}</p>
              <p className="text-xs text-gray-500">/ 5.0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <span className="text-xl sm:text-2xl">📅</span>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">現在の週</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">第{currentWeek?.weekNumber}週</p>
              <p className="text-xs text-gray-500 truncate">{currentWeek?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">今日の学習</h3>
          </div>
          <div className="p-6">
            {todayTask ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{todayTask.subject}</h4>
                  <span className="text-sm text-gray-500">{todayTask.day}曜日</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">学習トピック:</p>
                  <div className="flex flex-wrap gap-2">
                    {todayTask.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>予定時間: {todayTask.estimatedTime}分</span>
                  <span>実際の時間: {todayTask.actualTime}分</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: todayTask.completed ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">今日の学習タスクはありません</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">週別進捗</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {studyData.slice(0, 3).map((week) => {
                const weekProgress = (week.days.filter(day => day.completed).length / week.days.length) * 100
                return (
                  <div key={week.weekNumber} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        第{week.weekNumber}週: {week.title}
                      </span>
                      <span className="text-sm text-gray-600">{weekProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${weekProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">学習フェーズ別進捗</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['基礎固め期', '応用知識習得期', '総仕上げ期'].map((phase, index) => {
              const phaseWeeks = studyData.filter(week => week.phase === phase)
              const phaseProgress = phaseWeeks.length > 0 ? 
                (phaseWeeks.reduce((acc, week) => 
                  acc + week.days.filter(day => day.completed).length, 0
                ) / phaseWeeks.reduce((acc, week) => acc + week.days.length, 0)) * 100 : 0

              return (
                <div key={phase} className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{phaseProgress.toFixed(0)}%</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{phase}</h4>
                  <p className="text-sm text-gray-600">
                    {phaseWeeks.length}週間
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}