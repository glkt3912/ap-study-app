'use client';

import React from 'react';
import { QuizSession } from '../../lib/api';

interface QuizResultProps {
  result: QuizSession;
  onNewQuiz: () => void;
  onBackToDashboard: () => void;
}

export function QuizResult({ result, onNewQuiz, onBackToDashboard }: QuizResultProps) {
  return (
    <div className='container-primary py-6'>
      <div className='card-primary p-8 shadow-moderate achievement-unlock'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6'>Quiz結果</h2>

          <ResultMetrics result={result} />
          
          {result.category && <CategoryBadge category={result.category} />}

          <ActionButtons 
            onNewQuiz={onNewQuiz}
            onBackToDashboard={onBackToDashboard}
          />
        </div>
      </div>
    </div>
  );
}

function ResultMetrics({ result }: { result: QuizSession }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
      <div className='metric-card hover-lift'>
        <div className='text-2xl font-bold text-blue-600'>{result.score}%</div>
        <div className='text-sm text-slate-600 dark:text-slate-300'>正答率</div>
      </div>
      <div className='metric-card hover-lift'>
        <div className='text-2xl font-bold text-green-600'>
          {result.correctAnswers}/{result.totalQuestions}
        </div>
        <div className='text-sm text-slate-600 dark:text-slate-300'>正解数</div>
      </div>
      <div className='metric-card hover-lift'>
        <div className='text-2xl font-bold text-purple-600'>{result.avgTimePerQ}秒</div>
        <div className='text-sm text-slate-600 dark:text-slate-300'>平均解答時間</div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null;

  return (
    <div className='mb-6'>
      <span className='badge-info px-3 py-1 rounded-full text-sm'>
        カテゴリ: {category}
      </span>
    </div>
  );
}

function ActionButtons({ 
  onNewQuiz, 
  onBackToDashboard 
}: { 
  onNewQuiz: () => void;
  onBackToDashboard: () => void;
}) {
  return (
    <div className='flex gap-4 justify-center'>
      <button
        onClick={onNewQuiz}
        className='btn-primary btn-large hover-lift click-shrink focus-ring'
      >
        新しいQuizを開始
      </button>
      <button
        onClick={onBackToDashboard}
        className='btn-secondary btn-large hover-lift click-shrink focus-ring'
      >
        ダッシュボードに戻る
      </button>
    </div>
  );
}