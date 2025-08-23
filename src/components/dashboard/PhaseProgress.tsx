'use client';

import React from 'react';
import { StudyWeek } from '@/data/studyPlan';

interface PhaseProgressProps {
  studyData: StudyWeek[];
}

export function PhaseProgress({ studyData }: PhaseProgressProps) {
  const phases = ['基礎固め期', '応用知識習得期', '総仕上げ期'];

  const getPhaseData = (phase: string) => {
    const phaseWeeks = studyData.filter(week => week.phase === phase);
    const phaseProgress = phaseWeeks.length > 0
      ? (phaseWeeks.reduce((acc, week) => 
          acc + week.days.filter(day => day.completed).length, 0
        ) / phaseWeeks.reduce((acc, week) => acc + week.days.length, 0)) * 100
      : 0;

    return {
      progress: phaseProgress,
      weeksCount: phaseWeeks.length
    };
  };

  return (
    <div className='card-primary'>
      <div className='p-6 border-b border-slate-200 dark:border-slate-700'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>学習フェーズ別進捗</h3>
      </div>
      <div className='p-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {phases.map(phase => {
            const { progress, weeksCount } = getPhaseData(phase);
            
            return (
              <div key={phase} className='text-center'>
                <div className='w-20 h-20 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center'>
                  <span className='text-white font-bold text-lg'>{progress.toFixed(0)}%</span>
                </div>
                <h4 className='font-medium text-slate-900 dark:text-white'>{phase}</h4>
                <p className='text-sm text-slate-600 dark:text-slate-300'>{weeksCount}週間</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}