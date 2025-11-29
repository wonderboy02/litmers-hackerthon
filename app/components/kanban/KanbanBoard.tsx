'use client'

import React from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { useKanbanData } from '@/app/lib/hooks/useKanbanData'
import { useMoveIssue } from '@/app/lib/hooks/useIssues'
import { calculatePosition } from '@/app/lib/utils/position'

interface KanbanBoardProps {
  projectId: string
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { data: kanbanData, isLoading } = useKanbanData(projectId)
  const moveIssueMutation = useMoveIssue(projectId)

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    // 드롭 위치가 없으면 무시
    if (!destination) {
      return
    }

    // 같은 위치에 드롭하면 무시
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const newStateId = destination.droppableId

    // 목적지 컬럼의 이슈 리스트
    const targetState = kanbanData?.states.find((s: any) => s.id === newStateId)
    if (!targetState) return

    const targetIssues = targetState.issues

    // 새 position 계산
    let prevItemPosition: number | null = null
    let nextItemPosition: number | null = null

    if (targetIssues.length === 0) {
      // 빈 컬럼
      prevItemPosition = null
      nextItemPosition = null
    } else if (destination.index === 0) {
      // 최상단
      prevItemPosition = null
      nextItemPosition = targetIssues[0].board_position
    } else if (destination.index >= targetIssues.length) {
      // 최하단
      prevItemPosition = targetIssues[targetIssues.length - 1].board_position
      nextItemPosition = null
    } else {
      // 중간
      prevItemPosition = targetIssues[destination.index - 1].board_position
      nextItemPosition = targetIssues[destination.index].board_position
    }

    // 이슈 이동
    moveIssueMutation.mutate({
      issueId: draggableId,
      newStateId,
      prevItemPosition,
      nextItemPosition
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">칸반 보드를 불러오는 중...</div>
      </div>
    )
  }

  if (!kanbanData || kanbanData.states.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">프로젝트에 상태가 없습니다. 프로젝트 설정에서 상태를 추가해주세요.</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">칸반 보드</h2>
        <p className="text-sm text-gray-500 mt-1">
          전체 {kanbanData.totalIssues}개 이슈
        </p>
      </div>

      {/* 칸반 보드 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanData.states.map((state: any) => (
            <KanbanColumn key={state.id} state={state} />
          ))}
        </div>
      </DragDropContext>

      {/* 안내 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> 이슈를 드래그하여 다른 상태로 이동할 수 있습니다.
          WIP Limit을 초과하면 컬럼이 빨간색으로 표시됩니다.
        </p>
      </div>
    </div>
  )
}
