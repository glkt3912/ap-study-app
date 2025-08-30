'use client';

import React from 'react';
import { StudyWeek } from '@/data/studyPlan';
import { CardSkeleton } from './ui/Skeleton';
import { DashboardMetrics } from './dashboard/DashboardMetrics';
import { TodayStudyTask } from './dashboard/TodayStudyTask';
import { WeeklyProgress } from './dashboard/WeeklyProgress';
import { PhaseProgress } from './dashboard/PhaseProgress';

interface DashboardProps {
  studyData: StudyWeek[];
  isLoading?: boolean;
}

export default function Dashboard({ studyData, isLoading }: DashboardProps) {
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <DashboardMetrics studyData={studyData} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <TodayStudyTask studyData={studyData} />
        <WeeklyProgress studyData={studyData} />
      </div>

      <PhaseProgress studyData={studyData} />
    </div>
  );
}
