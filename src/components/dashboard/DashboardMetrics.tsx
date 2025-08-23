'use client';

import React from 'react';
import { StudyWeek } from '@/data/studyPlan';

interface DashboardMetricsProps {
  studyData: StudyWeek[];
}

export function DashboardMetrics({ studyData }: DashboardMetricsProps) {
  const totalDays = studyData.reduce((acc, week) => acc + week.days.length, 0);
  const completedDays = studyData.reduce(
    (acc, week) => acc + week.days.filter(day => day.completed).length, 
    0
  );
  const totalStudyTime = studyData.reduce(
    (acc, week) => acc + week.days.reduce((dayAcc, day) => dayAcc + day.actualTime, 0),
    0
  );
  const averageUnderstanding = studyData.length > 0
    ? studyData.reduce((acc, week) => {
        const weekUnderstanding = week.days.reduce((dayAcc, day) => dayAcc + day.understanding, 0);
        return acc + weekUnderstanding / week.days.length;
      }, 0) / studyData.length
    : 0;

  const progressPercentage = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
  
  const getCurrentWeek = () => {
    return studyData.find(week => week.days.some(day => !day.completed)) || studyData[0];
  };

  const currentWeek = getCurrentWeek();

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
      <div className='metric-card hover-lift'>
        <div className='flex items-center'>
          <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0'>
            <span className='text-xl sm:text-2xl'>📚</span>
          </div>
          <div className='ml-3 sm:ml-4 min-w-0'>
            <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>学習進捗</p>
            <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {progressPercentage.toFixed(1)}%
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {completedDays}/{totalDays} 日完了
            </p>
          </div>
        </div>
      </div>

      <div className='metric-card hover-lift'>
        <div className='flex items-center'>
          <div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0'>
            <span className='text-xl sm:text-2xl'>⏱️</span>
          </div>
          <div className='ml-3 sm:ml-4 min-w-0'>
            <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>総学習時間</p>
            <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {Math.floor(totalStudyTime / 60)}h
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>{totalStudyTime % 60}分</p>
          </div>
        </div>
      </div>

      <div className='metric-card hover-lift'>
        <div className='flex items-center'>
          <div className='p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex-shrink-0'>
            <span className='text-xl sm:text-2xl'>🎯</span>
          </div>
          <div className='ml-3 sm:ml-4 min-w-0'>
            <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>平均理解度</p>
            <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {averageUnderstanding.toFixed(1)}
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>/ 5.0</p>
          </div>
        </div>
      </div>

      <div className='metric-card hover-lift'>
        <div className='flex items-center'>
          <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0'>
            <span className='text-xl sm:text-2xl'>📅</span>
          </div>
          <div className='ml-3 sm:ml-4 min-w-0'>
            <p className='text-sm font-medium text-slate-600 dark:text-slate-400 truncate'>現在の週</p>
            <p className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
              第{currentWeek?.weekNumber}週
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>{currentWeek?.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}