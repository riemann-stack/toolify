/* ───────────────────────────────────────────────────────────
   축구 포메이션 데이터
   - lines: 골키퍼 제외한 라인별 인원 (뒤→앞 순)
   - total = 1(GK) + sum(lines)
   ─────────────────────────────────────────────────────────── */

export interface Formation {
  id: string
  name: string
  lines: number[]    // [수비, 미들..., 공격]
  desc: string
}

export const FORMATIONS_11: Formation[] = [
  { id: '4-4-2',   name: '4-4-2',   lines: [4, 4, 2],     desc: '클래식 균형. 알렉스 퍼거슨 맨유 황금기' },
  { id: '4-3-3',   name: '4-3-3',   lines: [4, 3, 3],     desc: '공격적 표준. 펩 바르샤·리버풀 클롭' },
  { id: '4-2-3-1', name: '4-2-3-1', lines: [4, 2, 3, 1], desc: '현대 표준. 더블 볼란치 + 톱2.5' },
  { id: '3-5-2',   name: '3-5-2',   lines: [3, 5, 2],     desc: '스리백 + 윙백. 콘테 인터' },
  { id: '3-4-3',   name: '3-4-3',   lines: [3, 4, 3],     desc: '공격적 스리백. 안토니오 콘테 첼시' },
  { id: '4-1-4-1', name: '4-1-4-1', lines: [4, 1, 4, 1], desc: '수비 안정. 단일 수비형 미드' },
  { id: '5-3-2',   name: '5-3-2',   lines: [5, 3, 2],     desc: '5백 수비. 약체팀 카운터 전술' },
  { id: '4-5-1',   name: '4-5-1',   lines: [4, 5, 1],     desc: '수비적. 미드 두텁게' },
  { id: '4-3-2-1', name: '4-3-2-1', lines: [4, 3, 2, 1], desc: '크리스마스 트리. 카를로 안첼로티' },
  { id: '5-4-1',   name: '5-4-1',   lines: [5, 4, 1],     desc: '극수비. 강팀 상대 잠그기' },
  { id: '4-4-1-1', name: '4-4-1-1', lines: [4, 4, 1, 1], desc: '섀도우 스트라이커' },
  { id: '3-6-1',   name: '3-6-1',   lines: [3, 6, 1],     desc: '미드 압도. 점유 전술' },
]

export const FORMATIONS_9: Formation[] = [
  { id: '9-3-3-2',   name: '3-3-2',   lines: [3, 3, 2],   desc: '균형. 청소년 9인제 표준' },
  { id: '9-3-2-3',   name: '3-2-3',   lines: [3, 2, 3],   desc: '공격형' },
  { id: '9-2-4-2',   name: '2-4-2',   lines: [2, 4, 2],   desc: '미들 강화' },
  { id: '9-3-4-1',   name: '3-4-1',   lines: [3, 4, 1],   desc: '수비형' },
  { id: '9-2-3-3',   name: '2-3-3',   lines: [2, 3, 3],   desc: '풀공격' },
  { id: '9-3-3-1-1', name: '3-3-1-1', lines: [3, 3, 1, 1], desc: '섀도우 스트라이커' },
]

export const FORMATIONS_7: Formation[] = [
  { id: '7-2-3-1', name: '2-3-1',   lines: [2, 3, 1],   desc: '7인제 기본' },
  { id: '7-3-2-1', name: '3-2-1',   lines: [3, 2, 1],   desc: '수비형 (피라미드)' },
  { id: '7-2-2-2', name: '2-2-2',   lines: [2, 2, 2],   desc: '균형 (육각형)' },
  { id: '7-1-3-2', name: '1-3-2',   lines: [1, 3, 2],   desc: '공격형' },
  { id: '7-3-1-2', name: '3-1-2',   lines: [3, 1, 2],   desc: '수비형 + 투톱' },
  { id: '7-2-1-3', name: '2-1-3',   lines: [2, 1, 3],   desc: '극공격' },
]

export const FORMATIONS_5: Formation[] = [
  { id: '5-1-2-1', name: '1-2-1 (다이아)', lines: [1, 2, 1], desc: '풋살 표준. 한 명씩 사방' },
  { id: '5-2-1-1', name: '2-1-1',         lines: [2, 1, 1], desc: '수비형 Y자' },
  { id: '5-1-1-2', name: '1-1-2',         lines: [1, 1, 2], desc: '공격형 역Y자' },
  { id: '5-2-2',   name: '2-2 (박스)',    lines: [2, 2],     desc: '풋살 박스 포메이션' },
  { id: '5-1-3',   name: '1-3',           lines: [1, 3],     desc: '공격적 박스' },
]

export const ALL_FORMATIONS: Formation[] = [
  ...FORMATIONS_11, ...FORMATIONS_9, ...FORMATIONS_7, ...FORMATIONS_5,
]

export function getFormationsByCount(total: number): Formation[] {
  switch (total) {
    case 11: return FORMATIONS_11
    case 9:  return FORMATIONS_9
    case 7:  return FORMATIONS_7
    case 5:  return FORMATIONS_5
    default: return []
  }
}

/* ─── 포지션 라벨 (라인 구성 전체를 보고 역할 추정) ───
   - lines 전체를 받아 수비형/공격형 미드, 윙백, 풋살 역할까지 구분 */
export function positionLabel(lines: number[], lineIdx: number, posInLine: number): string {
  const lineCount = lines[lineIdx]
  const totalLines = lines.length
  const total = 1 + lines.reduce((a, b) => a + b, 0)
  const pick = (arr: string[]) => arr[posInLine] ?? `P${posInLine + 1}`
  const isDef = lineIdx === 0
  const isAtk = lineIdx === totalLines - 1

  /* 5인제(풋살): 골레이로 제외 픽소·알라·피보 */
  if (total === 5) {
    if (isDef) return lineCount >= 2 ? pick(['L픽소', 'R픽소']) : '픽소'
    if (isAtk) {
      if (lineCount === 1) return '피보'
      if (lineCount === 2) return pick(['L피보', 'R피보'])
      return pick(['L알라', '피보', 'R알라'])
    }
    if (lineCount === 1) return '알라'
    if (lineCount === 2) return pick(['L알라', 'R알라'])
    return pick(['L알라', '피보', 'R알라'])
  }

  /* 수비 라인 */
  if (isDef) {
    if (lineCount === 5) return pick(['LWB', 'LCB', 'CB', 'RCB', 'RWB'])
    if (lineCount === 4) return pick(['LB', 'LCB', 'RCB', 'RB'])
    if (lineCount === 3) return pick(['LCB', 'CB', 'RCB'])
    if (lineCount === 2) return pick(['LB', 'RB'])
    return 'CB'
  }
  /* 공격 라인 */
  if (isAtk) {
    if (lineCount === 3) return pick(['LW', 'ST', 'RW'])
    if (lineCount === 2) return pick(['ST', 'ST'])
    return 'ST'
  }

  /* 미드필드 — 깊이별 역할 */
  const midLineCount = totalLines - 2
  const isFirstMid = lineIdx === 1                 // 가장 수비형
  const isLastMid = lineIdx === totalLines - 2     // 공격라인 바로 뒤
  const threeBack = lines[0] === 3                 // 스리백 → 5미드 양끝은 윙백

  // 단일 미드 라인 (4-4-2 / 4-3-3 / 3-5-2 …)
  if (midLineCount === 1) {
    if (lineCount >= 5) {
      if (posInLine === 0) return threeBack ? 'LWB' : 'LM'
      if (posInLine === lineCount - 1) return threeBack ? 'RWB' : 'RM'
      const k = posInLine - 1
      const innerCount = lineCount - 2
      if (innerCount === 1) return 'CM'
      if (innerCount === 2) return ['LCM', 'RCM'][k]
      if (innerCount === 3) return ['LCM', 'CM', 'RCM'][k]
      return ['LM', 'LCM', 'CM', 'RCM', 'RM'][k] ?? 'CM'
    }
    if (lineCount === 4) return pick(['LM', 'LCM', 'RCM', 'RM'])
    if (lineCount === 3) return pick(['LCM', 'CM', 'RCM'])
    if (lineCount === 2) return pick(['LCM', 'RCM'])
    return 'CM'
  }

  // 다중 미드 라인
  if (isFirstMid) {            // 홀딩/수비형 미드 (4-2-3-1의 2, 4-1-4-1의 1)
    if (lineCount === 1) return 'CDM'
    if (lineCount === 2) return pick(['LDM', 'RDM'])
    if (lineCount === 3) return pick(['LDM', 'CDM', 'RDM'])
    return pick(['LM', 'LCM', 'RCM', 'RM'])
  }
  if (isLastMid) {             // 공격형 미드 (4-2-3-1의 3, 크리스마스트리의 2)
    if (lineCount === 1) return 'CAM'
    if (lineCount === 2) return pick(['LAM', 'RAM'])
    if (lineCount === 3) return pick(['LW', 'CAM', 'RW'])
    if (lineCount === 4) return pick(['LM', 'LCM', 'RCM', 'RM'])
    return pick(['LM', 'LAM', 'CAM', 'RAM', 'RM'])
  }
  // 중간 미드 라인
  if (lineCount === 1) return 'CM'
  if (lineCount === 2) return pick(['LCM', 'RCM'])
  if (lineCount === 3) return pick(['LM', 'CM', 'RM'])
  return pick(['LM', 'LCM', 'CM', 'RCM', 'RM'])
}

/* ─── 커스텀 포메이션 파싱: "4-3-3" → [4,3,3] ─── */
export function parseFormation(text: string): number[] | null {
  const tokens = text.trim().split(/[-\s]+/).filter(Boolean)
  if (tokens.length < 2 || tokens.length > 5) return null
  if (!tokens.every(t => /^\d+$/.test(t))) return null   // 숫자만 허용 ("4abc"·"4.5" 거부)
  const parts = tokens.map(t => parseInt(t, 10))
  if (parts.some(n => n < 1 || n > 10)) return null
  return parts
}
