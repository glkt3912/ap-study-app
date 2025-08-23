'use client';

import React from 'react';
import { useAIAnalysis } from '../providers/AIAnalysisProvider';
import { useAuth } from '../../contexts/AuthContext';

export function AICoachSection() {
  const { user, isAuthenticated } = useAuth();
  const { predictiveAnalysis, personalizedRecommendations, isLoading } = useAIAnalysis();

  const isUserAuthenticated = isAuthenticated && user?.id && user.id > 0;

  if (!isUserAuthenticated || !predictiveAnalysis) {
    return null;
  }

  return (
    <div className='bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-moderate p-6 hover-lift z-content'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          <span className='text-2xl'>🤖</span>
          <h3 className='heading-secondary'>AI学習コーチ</h3>
        </div>
        <div className='text-right'>
          <div className='metric-value text-purple-600 dark:text-purple-400'>
            {predictiveAnalysis.examPassProbability}%
          </div>
          <div className='metric-label text-purple-800 dark:text-purple-300'>合格予測確率</div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <PredictionCard 
          icon='📈'
          title='学習予測'
          data={[
            { label: '推奨時間', value: `${predictiveAnalysis.recommendedStudyHours}h/日` },
            { label: '合格まで', value: `${predictiveAnalysis.timeToReadiness}日` }
          ]}
        />

        <PredictionCard
          icon='⚠️'
          title='注意点'
          items={predictiveAnalysis.riskFactors?.slice(0, 2) || []}
          variant='warning'
        />

        <PredictionCard
          icon='✨'
          title='強み'
          items={predictiveAnalysis.successFactors?.slice(0, 2) || []}
          variant='success'
        />
      </div>

      {personalizedRecommendations?.dailyStudyPlan && 
       personalizedRecommendations.dailyStudyPlan.length > 0 && (
        <DailyRecommendationCard 
          recommendations={personalizedRecommendations.dailyStudyPlan.slice(0, 1)}
        />
      )}

      {isLoading && (
        <div className='mt-4 flex items-center justify-center py-4 z-loading'>
          <div className='loading-spinner-purple'></div>
          <span className='ml-2 text-sm loading-text'>AI分析中...</span>
        </div>
      )}
    </div>
  );
}

interface PredictionCardProps {
  icon: string;
  title: string;
  data?: { label: string; value: string }[];
  items?: string[];
  variant?: 'default' | 'warning' | 'success';
}

function PredictionCard({ icon, title, data, items, variant = 'default' }: PredictionCardProps) {
  return (
    <div className='card-secondary p-4 hover-lift click-shrink'>
      <div className='flex items-center space-x-2 mb-2'>
        <span className='text-lg'>{icon}</span>
        <h4 className='heading-quaternary'>{title}</h4>
      </div>
      
      {data && (
        <div className='space-y-1 text-sm'>
          {data.map((item, index) => (
            <div key={index} className='flex justify-between'>
              <span className='text-slate-600 dark:text-slate-300'>{item.label}:</span>
              <span className='font-medium'>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {items && (
        <div className='space-y-1'>
          {items.map((item, index) => (
            <span
              key={index}
              className={`inline-block text-xs px-2 py-1 rounded ${
                variant === 'warning' 
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                  : variant === 'success'
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface DailyRecommendationCardProps {
  recommendations: Array<{
    subjects: string[];
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number;
    objectives?: string[];
  }>;
}

function DailyRecommendationCard({ recommendations }: DailyRecommendationCardProps) {
  return (
    <div className='mt-4 card-secondary p-4 hover-lift z-content'>
      <div className='flex items-center space-x-2 mb-3'>
        <span className='text-lg'>📋</span>
        <h4 className='heading-quaternary'>今日の推奨アクション</h4>
      </div>
      {recommendations.map((plan, index) => (
        <div key={index} className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-slate-900 dark:text-white'>
              {plan.subjects.join(', ')}
            </span>
            <span
              className={`click-shrink ${
                plan.priority === 'high'
                  ? 'badge-error'
                  : plan.priority === 'medium'
                    ? 'badge-warning'
                    : 'badge-success'
              }`}
            >
              {plan.priority}
            </span>
          </div>
          <div className='text-xs text-slate-600 dark:text-slate-300'>
            目標時間: {plan.estimatedTime}分 | 学習目標: {(plan.objectives || []).slice(0, 2).join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}