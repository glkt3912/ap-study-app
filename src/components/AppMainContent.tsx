'use client';

import { ContentRenderer } from '@/components/ContentRenderer';
import { type StudyWeek as DataStudyWeek } from '@/data/studyPlan';
import { type Dispatch, type SetStateAction } from 'react';

interface AppMainContentProps {
  activeTab: string;
  studyData: DataStudyWeek[];
  setStudyData: Dispatch<SetStateAction<DataStudyWeek[]>>;
  loading: boolean;
  error: string | null;
}

export function AppMainContent({
  activeTab,
  studyData,
  setStudyData,
  loading,
  error,
}: AppMainContentProps) {

  return (
    <main className='app-main-content'>
      {error && (
        <div className='mb-4 alert-warning hover-lift'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <span className='text-yellow-400 text-lg'>⚠️</span>
            </div>
            <div className='ml-3 flex-1'>
              <p className='text-sm sm:text-base'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className='app-loading-state'>
          <div className='loading-spinner mb-3 sm:mb-0'></div>
          <span className='loading-text text-center sm:ml-3'>データを読み込み中...</span>
        </div>
      ) : (
        <div className='motion-safe-animate'>
          <ContentRenderer 
            activeTab={activeTab}
            studyData={studyData}
            setStudyData={setStudyData}
          />
        </div>
      )}
    </main>
  );
}