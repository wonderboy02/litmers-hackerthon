'use client'

import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/app/components/kanban/KanbanBoard'

export default function ProjectKanbanPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <div className="h-[calc(100vh-8rem)]">
      <KanbanBoard projectId={projectId} />
    </div>
  )
}
