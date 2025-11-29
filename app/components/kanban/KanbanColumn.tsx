'use client'

import React from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { IssueCard } from './IssueCard'

interface KanbanColumnProps {
  state: {
    id: string
    name: string
    color?: string
    wip_limit?: number
    issues: any[]
  }
}

export function KanbanColumn({ state }: KanbanColumnProps) {
  const issueCount = state.issues.length
  const isWipLimitExceeded = state.wip_limit && issueCount > state.wip_limit

  return (
    <div className="flex-shrink-0 w-80">
      {/* 컬럼 헤더 */}
      <div className={`p-3 rounded-t-lg border-t-4 ${isWipLimitExceeded ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {state.color && (
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: state.color }}></span>
            )}
            {state.name}
          </h3>
          {state.wip_limit && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${isWipLimitExceeded ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
              {issueCount} / {state.wip_limit}
            </span>
          )}
          {!state.wip_limit && (
            <span className="text-xs text-gray-500">{issueCount}</span>
          )}
        </div>
        {isWipLimitExceeded && (
          <p className="text-xs text-red-600">⚠️ WIP Limit 초과</p>
        )}
      </div>

      {/* 이슈 리스트 (Droppable) */}
      <Droppable droppableId={state.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[500px] border-l border-r border-b rounded-b-lg ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
            }`}
          >
            {state.issues.map((issue, index) => (
              <Draggable key={issue.id} draggableId={issue.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                  >
                    <IssueCard issue={issue} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* 빈 상태 */}
            {state.issues.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                이슈를 드래그하여 추가하세요
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
