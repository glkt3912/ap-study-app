'use client';

import React, { useState } from 'react';
import { StudyWeek } from '@/data/studyPlan';
import { apiClient } from '@/lib/api';

interface WeeklyPlanProps {
  studyData: StudyWeek[];
  setStudyData: React.Dispatch<React.SetStateAction<StudyWeek[]>>;
}

export default function WeeklyPlan({ studyData, setStudyData }: WeeklyPlanProps) {
  const [selectedWeek, setSelectedWeek] = useState(1);

  const handleTaskComplete = async (weekIndex: number, dayIndex: number) => {
    const newData = [...studyData];
    const week = newData[weekIndex];
    if (!week) return;

    const task = week.days[dayIndex];
    if (!task) return;

    const isCompleting = !task.completed;

    // ローカル状態を即座に更新
    task.completed = isCompleting;
    if (isCompleting && task.actualTime === 0) {
      task.actualTime = task.estimatedTime;
    }
    setStudyData(newData);

    // バックエンドに進捗を保存
    try {
      await apiClient.updateStudyProgress(week.weekNumber, dayIndex, {
        completed: task.completed,
        actualTime: task.actualTime,
      });
    } catch (error) {
      // 進捗の保存に失敗しました
      // エラー時は元の状態に戻す
      task.completed = !isCompleting;
      if (!task.completed) {
        task.actualTime = 0;
      }
      setStudyData([...newData]);
    }
  };

  const selectedWeekData = studyData.find(week => week.weekNumber === selectedWeek);

  return (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg shadow'>
        <div className='p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>学習計画</h2>
          <p className='text-gray-600 mt-1'>週別の詳細な学習計画と進捗管理</p>
        </div>

        <div className='p-6'>
          <div className='flex flex-wrap gap-2 mb-6'>
            {studyData.map(week => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedWeek === week.weekNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                第{week.weekNumber}週
              </button>
            ))}
          </div>

          {selectedWeekData && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  第{selectedWeekData.weekNumber}週: {selectedWeekData.title}
                </h3>
                <div className='flex items-center space-x-4 mb-4'>
                  <span className='text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full'>
                    {selectedWeekData.phase}
                  </span>
                </div>
                <div className='space-y-2 mb-6'>
                  <h4 className='font-medium text-gray-900'>学習目標:</h4>
                  <ul className='list-disc list-inside space-y-1'>
                    {selectedWeekData.goals.map((goal, index) => (
                      <li key={index} className='text-gray-700'>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className='space-y-4'>
                {selectedWeekData.days.map((day, dayIndex) => {
                  const weekIndex = studyData.findIndex(w => w.weekNumber === selectedWeek);
                  return (
                    <div
                      key={dayIndex}
                      className={`border rounded-lg p-4 transition-colors ${
                        day.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-3 mb-2'>
                            <span className='font-medium text-gray-900'>{day.day}曜日</span>
                            <h4 className='text-lg font-semibold text-gray-900'>{day.subject}</h4>
                            <button
                              onClick={() => handleTaskComplete(weekIndex, dayIndex)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                day.completed
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {day.completed ? '完了' : '未完了'}
                            </button>
                          </div>
                          <div className='flex flex-wrap gap-2 mb-3'>
                            {day.topics.map((topic, topicIndex) => (
                              <span
                                key={topicIndex}
                                className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='text-sm text-gray-600'>
                        予定時間: {day.estimatedTime}分 | 実際の時間: {day.actualTime}分
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
