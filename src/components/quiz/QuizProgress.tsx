'use client';

import React from 'react';

interface QuizProgressData {
  overall: {
    totalQuestions: number;
    answeredQuestions: number;
    progressRate: number;
  };
  categoryProgress: any[];
  recentActivity: Array<{
    id: number;
    category?: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    startedAt: string;
    completedAt?: string;
  }>;
}

interface WeakPoint {
  category: string;
  accuracy_rate: number;
  total_answers: number;
}

interface QuizProgressProps {
  progressData: QuizProgressData | null;
  weakPoints: WeakPoint[];
  onStartQuiz: (_sessionType: string, _questionCount: number, _category?: string) => void;
}

export function QuizProgress({ progressData, weakPoints, onStartQuiz }: QuizProgressProps) {
  if (!progressData) {
    return (
      <div className='bg-slate-50 rounded-lg p-6 text-center'>
        <p className='text-slate-600 dark:text-slate-300'>学習データが不足しています。問題演習を行うと進捗が表示されます。</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <OverallProgress progress={progressData.overall} />
      <RecentActivity activities={progressData.recentActivity} />
      <WeakPointsSection weakPoints={weakPoints} onStartQuiz={onStartQuiz} />
    </div>
  );
}

function OverallProgress({ progress }: { progress: QuizProgressData['overall'] }) {
  return (
    <div className='card-accent p-6'>
      <h3 className='text-lg font-semibold mb-4'>全体進捗</h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='text-center'>
          <div className='text-2xl font-bold text-blue-600'>{progress.totalQuestions}</div>
          <div className='text-sm text-slate-600'>総問題数</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-green-600'>{progress.answeredQuestions}</div>
          <div className='text-sm text-slate-600'>回答済み問題数</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-bold text-purple-600'>{progress.progressRate}%</div>
          <div className='text-sm text-slate-600'>進捗率</div>
        </div>
      </div>
      <div className='mt-4'>
        <div className='w-full bg-slate-200 rounded-full h-2'>
          <div
            className='progress-fill-animated h-2 rounded-full'
            style={{ width: `${progress.progressRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function RecentActivity({ activities }: { activities: QuizProgressData['recentActivity'] }) {
  return (
    <div className='card-accent p-6'>
      <h3 className='text-lg font-semibold mb-4'>最近の学習活動</h3>
      <div className='space-y-3'>
        {activities.slice(0, 5).map(session => (
          <div key={session.id} className='flex items-center justify-between p-3 bg-white rounded-lg'>
            <div>
              <div className='font-medium'>{session.category || 'ランダム問題'}</div>
              <div className='text-sm text-slate-600'>
                {new Date(session.completedAt || session.startedAt).toLocaleDateString()}
              </div>
            </div>
            <div className='text-right'>
              <div className='font-bold text-lg text-green-600'>{session.score}点</div>
              <div className='text-sm text-slate-600'>
                {session.correctAnswers}/{session.totalQuestions}問正解
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeakPointsSection({ 
  weakPoints, 
  onStartQuiz 
}: { 
  weakPoints: WeakPoint[];
  onStartQuiz: (_sessionType: string, _questionCount: number, _category?: string) => void;
}) {
  if (weakPoints.length === 0) return null;

  return (
    <div className='bg-red-50 rounded-lg p-6'>
      <h3 className='text-lg font-semibold mb-4 text-red-800'>苦手分野</h3>
      <div className='space-y-2 mb-4'>
        {weakPoints.map((weak, index) => (
          <div key={index} className='flex items-center justify-between p-3 bg-white rounded-lg'>
            <span className='font-medium'>{weak.category}</span>
            <div className='text-right'>
              <div className='text-sm text-red-600'>正答率: {Math.round(weak.accuracy_rate)}%</div>
              <div className='text-xs text-slate-600'>{weak.total_answers}問回答</div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onStartQuiz('weak_points', 10)}
        className='w-full btn-error'
      >
        苦手分野の問題で学習開始 (10問)
      </button>
    </div>
  );
}