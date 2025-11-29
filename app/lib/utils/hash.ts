import crypto from 'crypto'

/**
 * SHA256 해시 생성
 * AI 캐싱에 사용 (input_hash 생성용)
 */
export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * 비밀번호 해싱 (bcrypt 대체용)
 * 실제 프로덕션에서는 bcrypt 사용 권장
 */
export async function hashPassword(password: string): Promise<string> {
  // Supabase Auth가 관리하므로 실제로는 사용하지 않음
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password)
  return hashed === hash
}
