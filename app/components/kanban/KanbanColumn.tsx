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
    <div className="flex-shrink-0 w-80 flex flex-col">
      {/* 컬럼 헤더 */}
      <div className={`p-4 rounded-t-xl border-t-4 transition-all duration-200 ${isWipLimitExceeded ? 'border-red-500 bg-red-50' : 'border-blue-400 bg-blue-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-bold text-lg flex items-center gap-2.5 ${isWipLimitExceeded ? 'text-red-700' : 'text-blue-900'}`}>
            {state.color && (
              <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: state.color }}></span>
            )}
            {state.name}
          </h3>
          {state.wip_limit && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isWipLimitExceeded ? 'bg-red-200 text-red-800' : 'bg-white text-gray-700 border border-gray-300'}`}>
              {issueCount} / {state.wip_limit}
            </span>
          )}
          {!state.wip_limit && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isWipLimitExceeded ? 'bg-red-200 text-red-800' : 'bg-white text-gray-700 border border-gray-300'}`}>
              {issueCount}
            </span>
          )}
        </div>
        {isWipLimitExceeded && (
          <p className="text-xs font-semibold text-red-700">⚠️ WIP Limit 초과</p>
        )}
      </div>

      {/* 이슈 리스트 (Droppable) */}
      <Droppable droppableId={state.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 min-h-[500px] border-l-2 border-r-2 border-b-2 rounded-b-xl transition-all duration-200 ${
              snapshot.isDraggingOver
                ? 'bg-blue-100 border-blue-400 ring-2 ring-blue-300'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="space-y-3">
              {state.issues.map((issue, index) => (
                <Draggable key={issue.id} draggableId={issue.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-opacity duration-150 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <IssueCard issue={issue} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* 빈 상태 */}
              {state.issues.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm font-medium">
                  <div className="mb-2">🎯</div>
                  이슈를 드래그하여 추가하세요
                </div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  )
}
