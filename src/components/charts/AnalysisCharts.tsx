'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface ChartProps {
  data: any[];
  className?: string;
}

// ダークモード対応の色パレット
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

export function StudyTimeChart({ data, className }: ChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);

  return (
    <div className={className}>
      <ResponsiveContainer width='100%' height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke={chartTheme.grid} />
          <XAxis 
            dataKey='subject' 
            angle={-45} 
            textAnchor='end' 
            height={80} 
            tick={{ fill: chartTheme.text, fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: '時間', 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle', fill: chartTheme.text } 
            }}
            tick={{ fill: chartTheme.text, fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: any, name: any, props: any) => [value + '時間', props.payload.fullSubject]}
            contentStyle={{
              backgroundColor: chartTheme.tooltip.background,
              border: `1px solid ${chartTheme.tooltip.border}`,
              borderRadius: '8px',
              color: chartTheme.tooltip.text,
            }}
          />
          <Bar dataKey='time' fill={chartTheme.colors.success} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProgressChart({ data, className }: ChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);

  return (
    <div className={className}>
      <ResponsiveContainer width='100%' height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke={chartTheme.grid} />
          <XAxis 
            dataKey='week' 
            tick={{ fill: chartTheme.text, fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: '時間', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: chartTheme.text }
            }}
            tick={{ fill: chartTheme.text, fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: chartTheme.tooltip.background,
              border: `1px solid ${chartTheme.tooltip.border}`,
              borderRadius: '8px',
              color: chartTheme.tooltip.text,
            }}
          />
          <Line 
            type='monotone' 
            dataKey='time' 
            stroke={chartTheme.colors.primary} 
            strokeWidth={2}
            dot={{ fill: chartTheme.colors.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: chartTheme.colors.primary, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function UnderstandingRadarChart({ data, className }: ChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);

  return (
    <div className={className}>
      <ResponsiveContainer width='100%' height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke={chartTheme.grid} />
          <PolarAngleAxis 
            dataKey='subject' 
            tick={{ fill: chartTheme.text, fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={0} 
            domain={[0, 5]} 
            tick={{ fill: chartTheme.text, fontSize: 10 }}
          />
          <Radar 
            name='理解度' 
            dataKey='understanding' 
            stroke={chartTheme.colors.purple} 
            fill={chartTheme.colors.purple} 
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            formatter={(value: any, name: any, props: any) => [value, props.payload.fullSubject]}
            contentStyle={{
              backgroundColor: chartTheme.tooltip.background,
              border: `1px solid ${chartTheme.tooltip.border}`,
              borderRadius: '8px',
              color: chartTheme.tooltip.text,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
