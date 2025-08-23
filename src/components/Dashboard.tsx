'use client';

import React, { useEffect } from 'react';
import { StudyWeek } from '@/data/studyPlan';
import { CardSkeleton } from './ui/Skeleton';
import { AIAnalysisProvider, useAIAnalysis } from './providers/AIAnalysisProvider';
import { DashboardMetrics } from './dashboard/DashboardMetrics';
import { AICoachSection } from './dashboard/AICoachSection';
import { TodayStudyTask } from './dashboard/TodayStudyTask';
import { WeeklyProgress } from './dashboard/WeeklyProgress';
import { PhaseProgress } from './dashboard/PhaseProgress';

interface DashboardProps {
  studyData: StudyWeek[];
  isLoading?: boolean;
}

function DashboardContent({ studyData, isLoading }: DashboardProps) {
  const { fetchData } = useAIAnalysis();

  useEffect(() => {
    if (!isLoading && studyData.length > 0) {
      fetchData();
    }
  }, [isLoading, studyData.length, fetchData]);

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

      <AICoachSection />


      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <TodayStudyTask studyData={studyData} />
        <WeeklyProgress studyData={studyData} />
      </div>

      <PhaseProgress studyData={studyData} />
    </div>
  );
}

export default function Dashboard(props: DashboardProps) {
  return (
    <AIAnalysisProvider>
      <DashboardContent {...props} />
    </AIAnalysisProvider>
  );
}
