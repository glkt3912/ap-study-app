'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

interface ChartProps {
  data: any[]
  className?: string
}

export function StudyTimeChart({ data, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
          <YAxis label={{ value: '時間', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: any, name: any, props: any) => [value + '時間', props.payload.fullSubject]} />
          <Bar dataKey="time" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProgressChart({ data, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis label={{ value: '時間', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="time" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function UnderstandingRadarChart({ data, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={0} domain={[0, 5]} />
          <Radar name="理解度" dataKey="understanding" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
          <Tooltip formatter={(value: any, name: any, props: any) => [value, props.payload.fullSubject]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}