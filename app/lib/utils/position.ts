/**
 * 칸반 보드 Position 계산 유틸리티
 * Drag & Drop 시 이슈의 순서를 결정하는 position 값을 계산합니다.
 */

/**
 * 두 아이템 사이의 position 값을 계산
 *
 * @param prevPosition 이전 아이템의 position (없으면 null)
 * @param nextPosition 다음 아이템의 position (없으면 null)
 * @returns 새로운 position 값
 */
export function calculatePosition(
  prevPosition: number | null,
  nextPosition: number | null
): number {
  // Case 1: 최상단에 추가 (prevPosition이 없고 nextPosition이 있음)
  if (prevPosition === null && nextPosition !== null) {
    return nextPosition / 2
  }

  // Case 2: 최하단에 추가 (prevPosition이 있고 nextPosition이 없음)
  if (prevPosition !== null && nextPosition === null) {
    return prevPosition + 1.0
  }

  // Case 3: 중간에 추가 (prevPosition과 nextPosition이 모두 있음)
  if (prevPosition !== null && nextPosition !== null) {
    const newPos = (prevPosition + nextPosition) / 2

    // 정밀도 한계 체크
    // floating point 정밀도 한계로 인해 새 값이 이전 값과 같아지는 경우
    if (newPos === prevPosition || newPos === nextPosition) {
      throw new Error('Position rebalancing required')
    }

    return newPos
  }

  // Case 4: 빈 컬럼 (둘 다 null)
  return 1.0
}

/**
 * Position 리밸런싱이 필요한지 확인
 * 연속된 여러 번의 이동으로 인해 position 값들이 너무 가까워진 경우
 */
export function needsRebalancing(positions: number[]): boolean {
  if (positions.length < 2) return false

  const sorted = [...positions].sort((a, b) => a - b)

  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i + 1] - sorted[i]
    // 차이가 너무 작으면 (0.000001 미만) 리밸런싱 필요
    if (diff < 0.000001) {
      return true
    }
  }

  return false
}

/**
 * Position 값들을 1.0, 2.0, 3.0 ... 으로 재정렬
 */
export function rebalancePositions(items: Array<{ id: string; position: number }>): Array<{ id: string; newPosition: number }> {
  const sorted = [...items].sort((a, b) => a.position - b.position)

  return sorted.map((item, index) => ({
    id: item.id,
    newPosition: (index + 1) * 1.0
  }))
}
