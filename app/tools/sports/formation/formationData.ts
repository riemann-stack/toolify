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

/* ─── 포지션 라벨 (라인별·라인 내 위치별 자동 할당) ─── */
export function positionLabel(lineIdx: number, posInLine: number, lineCount: number, totalLines: number): string {
  // lineIdx: 0=수비라인, totalLines-1=최전방
  const isDef = lineIdx === 0
  const isAtk = lineIdx === totalLines - 1
  const center = (lineCount - 1) / 2
  const sideOf = posInLine - center  // 음수=왼쪽 / 양수=오른쪽

  if (isDef) {
    if (lineCount === 5) {
      return ['LWB', 'LCB', 'CB', 'RCB', 'RWB'][posInLine] ?? `D${posInLine + 1}`
    }
    if (lineCount === 4) return ['LB', 'LCB', 'RCB', 'RB'][posInLine] ?? `D${posInLine + 1}`
    if (lineCount === 3) return ['LCB', 'CB', 'RCB'][posInLine] ?? `D${posInLine + 1}`
    if (lineCount === 2) return ['LB', 'RB'][posInLine] ?? `D${posInLine + 1}`
    return `CB`
  }
  if (isAtk) {
    if (lineCount === 3) return ['LW', 'ST', 'RW'][posInLine] ?? `F${posInLine + 1}`
    if (lineCount === 2) return ['LST', 'RST'][posInLine] ?? `F${posInLine + 1}`
    return 'ST'
  }
  // 미드필드
  if (lineCount === 1) return sideOf === 0 ? 'CM' : sideOf < 0 ? 'LM' : 'RM'
  if (lineCount === 2) return ['LCM', 'RCM'][posInLine] ?? `M${posInLine + 1}`
  if (lineCount === 3) return ['LM', 'CM', 'RM'][posInLine] ?? `M${posInLine + 1}`
  if (lineCount === 4) return ['LM', 'LCM', 'RCM', 'RM'][posInLine] ?? `M${posInLine + 1}`
  if (lineCount === 5) return ['LM', 'LCM', 'CM', 'RCM', 'RM'][posInLine] ?? `M${posInLine + 1}`
  return `M${posInLine + 1}`
}

/* ─── 커스텀 포메이션 파싱: "4-3-3" → [4,3,3] ─── */
export function parseFormation(text: string): number[] | null {
  const parts = text.split(/[-\s]+/).map(s => parseInt(s, 10)).filter(n => Number.isFinite(n) && n > 0)
  if (parts.length < 2 || parts.length > 5) return null
  if (parts.some(n => n > 10)) return null
  return parts
}
