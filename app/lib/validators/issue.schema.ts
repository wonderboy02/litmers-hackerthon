import { z } from 'zod'

// FR-030: 이슈 생성
export const createIssueSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  description: z.string().max(5000).optional(),
  assigneeUserId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  labelIds: z.array(z.string().uuid()).max(5).optional()
})

// FR-032: 이슈 수정
export const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  assigneeUserId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  labelIds: z.array(z.string().uuid()).max(5).optional()
})

// FR-033: 이슈 상태 변경 및 이동
export const moveIssueSchema = z.object({
  newStateId: z.string().uuid(),
  prevItemPosition: z.number().nullable(),
  nextItemPosition: z.number().nullable()
})

// FR-036: 이슈 검색/필터링
export const issueFilterSchema = z.object({
  search: z.string().optional(),
  stateIds: z.array(z.string().uuid()).optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  priorities: z.array(z.enum(['HIGH', 'MEDIUM', 'LOW'])).optional(),
  labelIds: z.array(z.string().uuid()).optional(),
  hasDueDate: z.boolean().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

// FR-039-2: 서브태스크 생성
export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(200)
})

// Type exports
export type CreateIssueInput = z.infer<typeof createIssueSchema>
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>
export type MoveIssueInput = z.infer<typeof moveIssueSchema>
export type IssueFilterInput = z.infer<typeof issueFilterSchema>
export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>
