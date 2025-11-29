'use client'

import React from 'react'

interface StateWithIssues {
  id: string
  name: string
  color: string | null
  issues: any[]
}

interface ProjectStatsProps {
  states: StateWithIssues[]
  totalIssues: number
}

export function ProjectStats({ states, totalIssues }: ProjectStatsProps) {
  // 완료율 계산 (Done 상태의 이슈 개수 / 전체 이슈 개수)
  const doneState = states.find((s) => s.name === 'Done')
  const doneCount = doneState?.issues.length || 0
  const completionRate = totalIssues > 0 ? Math.round((doneCount / totalIssues) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 전체 이슈 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">전체 이슈</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{totalIssues}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 완료율 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">완료율</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{completionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {doneCount} / {totalIssues}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 상태별 이슈 카드들 */}
      {states.slice(0, 2).map((state) => {
        const count = state.issues.length
        const percentage = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0

        return (
          <div
            key={state.id}
            className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{state.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
              </div>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: state.color ? `${state.color}20` : '#f3f4f6',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    backgroundColor: state.color || '#9ca3af',
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
