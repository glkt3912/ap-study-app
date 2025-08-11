'use client';

import Dashboard from '@/components/Dashboard';
import WeeklyPlan from '@/components/WeeklyPlan';
import StudyLog from '@/components/StudyLog';
import TestRecord from '@/components/TestRecord';
import Analysis from '@/components/Analysis';
import Quiz from '@/components/Quiz';
import DataExport from '@/components/DataExport';
import DiagnosticHub from '@/components/DiagnosticHub';
import { AdvancedAnalysis } from '@/components/AdvancedAnalysis';
import { ReviewSystem } from '@/components/ReviewSystem';
import { type StudyWeek as DataStudyWeek } from '@/data/studyPlan';
import { type Dispatch, type SetStateAction } from 'react';

interface ContentRendererProps {
  activeTab: string;
  studyData: DataStudyWeek[];
  setStudyData: Dispatch<SetStateAction<DataStudyWeek[]>>;
}

// コンテンツレンダラーのヘルパー関数
const renderDataAwareComponent = (
  tabId: string, 
  studyData: DataStudyWeek[], 
  setStudyData: Dispatch<SetStateAction<DataStudyWeek[]>>
) => {
  switch (tabId) {
    case 'plan':
      return <WeeklyPlan studyData={studyData} setStudyData={setStudyData} />;
    case 'export':
      return <DataExport studyData={studyData} />;
    case 'dashboard':
      return <Dashboard studyData={studyData} />;
    default:
      return null;
  }
};

const renderBasicComponent = (tabId: string) => {
  switch (tabId) {
    case 'log': return <StudyLog />;
    case 'test': return <TestRecord />;
    case 'quiz': return <Quiz />;
    case 'analysis': return <Analysis />;
    case 'advanced': return <AdvancedAnalysis />;
    case 'review': return <ReviewSystem />;
    case 'debug': return <DiagnosticHub />;
    default: return null;
  }
};

export function ContentRenderer({ activeTab, studyData, setStudyData }: ContentRendererProps) {
  const dataAwareComponent = renderDataAwareComponent(activeTab, studyData, setStudyData);
  if (dataAwareComponent) return dataAwareComponent;

  const basicComponent = renderBasicComponent(activeTab);
  if (basicComponent) return basicComponent;
  
  // デフォルトはダッシュボード
  return <Dashboard studyData={studyData} />;
}