'use client';

import React from 'react';
import { StudyWeek } from '@/data/studyPlan';

interface TodayStudyTaskProps {
  studyData: StudyWeek[];
}

export function TodayStudyTask({ studyData }: TodayStudyTaskProps) {
  const getCurrentWeek = () => {
    return studyData.find(week => week.days.some(day => !day.completed)) || studyData[0];
  };

  const currentWeek = getCurrentWeek();
  const todayTask = currentWeek?.days.find(day => !day.completed);

  return (
    <div className='card-primary hover-lift z-content'>
      <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
        <h3 className='heading-tertiary'>今日の学習</h3>
      </div>
      <div className='p-6'>
        {todayTask ? (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium text-slate-900 dark:text-white'>{todayTask.subject}</h4>
              <span className='text-sm text-slate-500 dark:text-slate-400'>{todayTask.day}曜日</span>
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-slate-600 dark:text-slate-300'>学習トピック:</p>
              <div className='flex flex-wrap gap-2'>
                {todayTask.topics.map((topic, index) => (
                  <span
                    key={index}
                    className='badge-info text-xs rounded-full'
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className='flex items-center justify-between text-sm text-slate-600 dark:text-slate-300'>
              <span>予定時間: {todayTask.estimatedTime}分</span>
              <span>実際の時間: {todayTask.actualTime}分</span>
            </div>
            <div className='w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2'>
              <div
                className='progress-fill-primary h-2 rounded-full'
                style={{ width: todayTask.completed ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
        ) : (
          <p className='text-slate-500 dark:text-slate-400'>今日の学習タスクはありません</p>
        )}
      </div>
    </div>
  );
}