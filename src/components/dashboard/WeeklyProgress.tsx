'use client';

import React from 'react';
import { StudyWeek } from '@/data/studyPlan';

interface WeeklyProgressProps {
  studyData: StudyWeek[];
}

export function WeeklyProgress({ studyData }: WeeklyProgressProps) {
  return (
    <div className='card-primary'>
      <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
        <h3 className='heading-tertiary'>週別進捗</h3>
      </div>
      <div className='p-6'>
        <div className='space-y-4'>
          {studyData.slice(0, 3).map(week => {
            const weekProgress = week.days.length > 0 
              ? (week.days.filter(day => day.completed).length / week.days.length) * 100
              : 0;
              
            return (
              <div key={week.weekNumber} className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-medium text-slate-900 dark:text-white'>
                    第{week.weekNumber}週: {week.title}
                  </span>
                  <span className='text-sm text-slate-600 dark:text-slate-300'>{weekProgress.toFixed(0)}%</span>
                </div>
                <div className='w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2'>
                  <div
                    className='progress-fill-success h-2 rounded-full transition-all duration-300'
                    style={{ width: `${weekProgress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}