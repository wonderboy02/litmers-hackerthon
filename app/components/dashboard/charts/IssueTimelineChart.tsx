'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface IssueTimelineChartProps {
  creationData: Array<{ date: string; count: number }>
  completionData: Array<{ date: string; count: number }>
}

export function IssueTimelineChart({ creationData, completionData }: IssueTimelineChartProps) {
  // 데이터 병합
  const mergedData = creationData.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    created: item.count,
    completed: completionData[index]?.count || 0
  }))

  if (mergedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        데이터가 없습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mergedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="created"
          stroke="#3b82f6"
          name="생성된 이슈"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#10b981"
          name="완료된 이슈"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
