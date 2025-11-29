import { z } from 'zod'

// FR-020: 프로젝트 생성
export const createProjectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력해주세요').max(100),
  description: z.string().max(2000).optional()
})

// FR-023: 프로젝트 수정
export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional()
})

// FR-053: 커스텀 상태 생성
export const createCustomStateSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  position: z.number().positive()
})

// FR-038: 라벨 생성
export const createLabelSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
})

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateCustomStateInput = z.infer<typeof createCustomStateSchema>
export type CreateLabelInput = z.infer<typeof createLabelSchema>
