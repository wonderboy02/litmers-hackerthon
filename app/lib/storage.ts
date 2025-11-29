import { createClient } from './supabase/client'

/**
 * Supabase Storage 버킷 이름
 * Supabase Dashboard에서 'avatars' 버킷을 생성해야 합니다.
 */
const AVATARS_BUCKET = 'avatars'

/**
 * 허용되는 이미지 파일 타입
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

/**
 * 최대 파일 크기 (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * 프로필 이미지 업로드
 * FR-005: 프로필 관리 - 이미지 파일 업로드
 */
export async function uploadProfileImage(
  userId: string,
  file: File,
): Promise<{ publicUrl: string; path: string }> {
  // 파일 타입 검증
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      '지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)',
    )
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기는 5MB를 초과할 수 없습니다.')
  }

  const supabase = createClient()

  // 파일 확장자 추출
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // 파일 업로드
  const { data, error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Profile image upload error:', error)
    throw new Error('이미지 업로드에 실패했습니다.')
  }

  // Public URL 생성
  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(data.path)

  return {
    publicUrl,
    path: data.path,
  }
}

/**
 * 기존 프로필 이미지 삭제
 */
export async function deleteProfileImage(filePath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .remove([filePath])

  if (error) {
    console.error('Profile image deletion error:', error)
    // 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

/**
 * 프로필 이미지 Public URL 가져오기
 */
export function getProfileImageUrl(filePath: string): string {
  const supabase = createClient()

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath)

  return publicUrl
}

/**
 * 클라이언트 사이드에서 이미지 파일 검증
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WebP, GIF만 가능)',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: '파일 크기는 5MB를 초과할 수 없습니다.',
    }
  }

  return { valid: true }
}

/**
 * 이미지 파일을 Base64로 변환 (미리보기용)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
