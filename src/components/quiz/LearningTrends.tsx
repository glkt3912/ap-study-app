'use client';

import React, { lazy, Suspense } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));

interface LearningTrendsData {
  period: number;
  dailyTrends: any[];
  cumulativeProgress: any[];
  categoryTrends: any[];
}

interface LearningTrendsProps {
  trendsData: LearningTrendsData | null;
}

const getChartTheme = (isDark: boolean) => ({
  grid: isDark ? '#374151' : '#e5e7eb',
  text: isDark ? '#d1d5db' : '#374151',
  background: isDark ? '#1f2937' : '#ffffff',
  tooltip: {
    background: isDark ? '#374151' : '#ffffff',
    border: isDark ? '#4b5563' : '#e5e7eb',
    text: isDark ? '#f9fafb' : '#111827',
  },
  colors: {
    primary: isDark ? '#60a5fa' : '#3b82f6',
    success: isDark ? '#34d399' : '#10b981',
    warning: isDark ? '#fbbf24' : '#f59e0b',
    purple: isDark ? '#a78bfa' : '#8b5cf6',
  },
});

export function LearningTrends({ trendsData }: LearningTrendsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);

  if (!trendsData) {
    return (
      <div className='bg-slate-50 rounded-lg p-6 text-center'>
        <p className='text-slate-600 dark:text-slate-300'>学習データが不足しています。問題演習を行うとトレンドが表示されます。</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <DailyTrendsChart 
        data={trendsData.dailyTrends} 
        chartTheme={chartTheme} 
      />
      <CumulativeProgressChart 
        data={trendsData.cumulativeProgress} 
        chartTheme={chartTheme} 
      />
      <CategoryTrendsSection 
        categories={trendsData.categoryTrends} 
      />
    </div>
  );
}

function DailyTrendsChart({ 
  data, 
  chartTheme 
}: { 
  data: any[]; 
  chartTheme: ReturnType<typeof getChartTheme>; 
}) {
  return (
    <div className='card-accent p-6'>
      <h3 className='text-lg font-semibold mb-4'>日別学習トレンド (過去30日)</h3>
      <Suspense fallback={<ChartLoadingSpinner />}>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke={chartTheme.grid} />
            <XAxis
              dataKey='study_date'
              tickFormatter={value =>
                new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
              }
              tick={{ fill: chartTheme.text, fontSize: 12 }}
            />
            <YAxis tick={{ fill: chartTheme.text, fontSize: 12 }} />
            <Tooltip
              labelFormatter={value => new Date(value).toLocaleDateString('ja-JP')}
              formatter={(value, name) => [
                formatTooltipValue(value, String(name)),
                name === 'daily_questions' ? '問題数' : name === 'avg_score' ? '平均点' : String(name)
              ]}
              contentStyle={{
                backgroundColor: chartTheme.tooltip.background,
                border: `1px solid ${chartTheme.tooltip.border}`,
                borderRadius: '8px',
                color: chartTheme.tooltip.text,
              }}
            />
            <Line
              type='monotone'
              dataKey='daily_questions'
              stroke={chartTheme.colors.primary}
              strokeWidth={2}
              name='daily_questions'
              dot={{ fill: chartTheme.colors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartTheme.colors.primary, strokeWidth: 2 }}
            />
            <Line 
              type='monotone' 
              dataKey='avg_score' 
              stroke={chartTheme.colors.success} 
              strokeWidth={2} 
              name='avg_score'
              dot={{ fill: chartTheme.colors.success, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: chartTheme.colors.success, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Suspense>
    </div>
  );
}

function CumulativeProgressChart({ 
  data, 
  chartTheme 
}: { 
  data: any[]; 
  chartTheme: ReturnType<typeof getChartTheme>; 
}) {
  return (
    <div className='card-accent p-6'>
      <h3 className='text-lg font-semibold mb-4'>累積学習進捗</h3>
      <Suspense fallback={<ChartLoadingSpinner />}>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' stroke={chartTheme.grid} />
            <XAxis
              dataKey='study_date'
              tickFormatter={value =>
                new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
              }
              tick={{ fill: chartTheme.text, fontSize: 12 }}
            />
            <YAxis tick={{ fill: chartTheme.text, fontSize: 12 }} />
            <Tooltip
              labelFormatter={value => new Date(value).toLocaleDateString('ja-JP')}
              formatter={value => [`${value}問`, '累積問題数']}
              contentStyle={{
                backgroundColor: chartTheme.tooltip.background,
                border: `1px solid ${chartTheme.tooltip.border}`,
                borderRadius: '8px',
                color: chartTheme.tooltip.text,
              }}
            />
            <Line
              type='monotone'
              dataKey='cumulative_questions'
              stroke={chartTheme.colors.purple}
              strokeWidth={3}
              name='cumulative_questions'
              dot={{ fill: chartTheme.colors.purple, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartTheme.colors.purple, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Suspense>
    </div>
  );
}

function CategoryTrendsSection({ categories }: { categories: any[] }) {
  if (categories.length === 0) return null;

  return (
    <div className='card-accent p-6'>
      <h3 className='text-lg font-semibold mb-4'>カテゴリ別学習状況</h3>
      <div className='space-y-3'>
        {categories.map((category: any, index: number) => (
          <div key={index} className='flex items-center justify-between p-3 bg-white rounded-lg'>
            <span className='font-medium'>{category.category}</span>
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-slate-600'>{category.questions_attempted}問</div>
              <div className='text-sm text-green-600'>
                正答率: {Math.round(category.accuracy_rate * 100)}%
              </div>
              <div className='w-20 bg-slate-200 rounded-full h-2'>
                <div
                  className='progress-fill-animated h-2 rounded-full'
                  style={{ width: `${Math.min(category.accuracy_rate * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartLoadingSpinner() {
  return (
    <div className='h-64 flex items-center justify-center'>
      <div className='loading-spinner-lg'></div>
      <span className='ml-2'>グラフを読み込み中...</span>
    </div>
  );
}

function formatTooltipValue(value: any, name: string): string {
  if (typeof value === 'number' && name === 'avg_score') {
    return `${value.toFixed(1)}点`;
  } else if (typeof value === 'number' && name === 'daily_questions') {
    return `${value}問`;
  }
  return `${value}分`;
}