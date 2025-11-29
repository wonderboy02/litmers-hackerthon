'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PriorityChartProps {
  data: Record<string, number>
}

export function PriorityChart({ data }: PriorityChartProps) {
  const chartData = [
    { priority: 'HIGH', count: data.HIGH || 0, fill: '#ef4444' },
    { priority: 'MEDIUM', count: data.MEDIUM || 0, fill: '#f59e0b' },
    { priority: 'LOW', count: data.LOW || 0, fill: '#6b7280' }
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="priority" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>
    </ResponsiveContainer>
  )
}
