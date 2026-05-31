// ─────────────────────────────────────────────────────────
// 경조사비(축의금·부의금) 데이터
//  금액 단위는 모두 "만원". 추천값은 한국의 일반적 관례(2024~2025 시세)를
//  반영한 참고치이며, 지역·집안·개인 사정에 따라 달라질 수 있다.
// ─────────────────────────────────────────────────────────

export type Mode = 'wedding' | 'funeral'

export interface AmountPair {
  attend: number // 참석(식사) 시 추천 (만원)
  absent: number // 불참(마음만) 시 추천 (만원)
}

export interface Relationship {
  id: string
  label: string
  hint: string
  wedding: AmountPair
  funeral: AmountPair
}

// 관계는 먼 사이 → 가까운 사이 순. 추천값은 "참석 가정" 기준.
export const RELATIONSHIPS: Relationship[] = [
  { id: 'biz',        label: '거래처·업무상',   hint: '일로 아는 사이',         wedding: { attend: 5,   absent: 5 },  funeral: { attend: 5,  absent: 5 } },
  { id: 'acquaint',   label: '지인·이웃·동호회', hint: '얼굴만 아는 정도',        wedding: { attend: 5,   absent: 5 },  funeral: { attend: 5,  absent: 5 } },
  { id: 'coworker',   label: '직장 동료',       hint: '같이 일하는 동료',        wedding: { attend: 10,  absent: 5 },  funeral: { attend: 5,  absent: 5 } },
  { id: 'friend',     label: '친구',           hint: '보통 친구',              wedding: { attend: 10,  absent: 5 },  funeral: { attend: 10, absent: 5 } },
  { id: 'closeFriend', label: '친한 친구',      hint: '오래·가깝게 지낸 친구',    wedding: { attend: 20,  absent: 10 }, funeral: { attend: 10, absent: 10 } },
  { id: 'relative',   label: '사촌·친척',       hint: '왕래하는 친척',          wedding: { attend: 20,  absent: 10 }, funeral: { attend: 20, absent: 10 } },
  { id: 'closeRel',   label: '가까운 친척',     hint: '자주 보는 가까운 친척',    wedding: { attend: 30,  absent: 20 }, funeral: { attend: 30, absent: 20 } },
  { id: 'family',     label: '형제자매·직계가족', hint: '가장 가까운 가족',       wedding: { attend: 100, absent: 50 }, funeral: { attend: 50, absent: 30 } },
]

export const REL_MAP: Record<string, Relationship> = Object.fromEntries(RELATIONSHIPS.map((r) => [r.id, r]))

// 동반(결혼식 식대 가산용) — 본인 외 추가 인원
export interface Companion { id: string; label: string; extra: number }
export const COMPANIONS: Companion[] = [
  { id: 'solo',   label: '혼자',          extra: 0 },
  { id: 'spouse', label: '배우자 동반',    extra: 1 },
  { id: 'family', label: '가족 동반(자녀)', extra: 2 },
]

// 1인 식대 추정(만원). 결혼식 참석 시 동반 인원에 곱해 가산.
export const MEAL_COST = 5
// 식대 가산을 적용하는 최대 기준선(만원). 이보다 큰 금액대(가까운 가족)는
// 액수 자체가 식대를 크게 웃돌아 동반 가산을 적용하지 않는다.
export const MEAL_ADD_CAP = 30

// 관례상 무난한 금액(만원). 4(死)·9(아홉수)는 제외.
export const CUSTOMARY = [3, 5, 7, 10, 15, 20, 30, 50, 70, 100, 150, 200, 300, 500]

// 가장 가까운 관례 금액으로 보정(동점은 낮은 쪽 — 과하지 않게).
export function snapCustomary(man: number): number {
  let best = CUSTOMARY[0]
  let bestDist = Infinity
  for (const c of CUSTOMARY) {
    const d = Math.abs(c - man)
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}

export interface Result {
  recommend: number // 만원
  low: number
  high: number
  attendBased: boolean
}

export function calcGift(
  rel: Relationship,
  mode: Mode,
  attend: boolean,
  companionExtra: number,
): Result {
  const pair = mode === 'wedding' ? rel.wedding : rel.funeral
  const base = attend ? pair.attend : pair.absent

  // 결혼식 + 참석 + 동반: 식대 가산(가까운 가족 제외)
  const mealAdd = attend && mode === 'wedding' && base <= MEAL_ADD_CAP
    ? companionExtra * MEAL_COST
    : 0

  const raw = Math.max(MEAL_COST, base + mealAdd) // 최소 5만원
  const recommend = snapCustomary(raw)

  const low = Math.min(pair.absent, pair.attend)
  const high = snapCustomary(Math.max(pair.attend, raw))

  return { recommend, low, high, attendBased: pair.attend !== pair.absent }
}

// ── 봉투 문구 ──
export interface EnvelopePhrase { ko: string; hanja: string; note: string }
export const ENVELOPE: Record<Mode, EnvelopePhrase[]> = {
  wedding: [
    { ko: '축 결혼', hanja: '祝 結婚', note: '가장 무난한 결혼 축하 문구' },
    { ko: '축 화혼', hanja: '祝 華婚', note: '신부 측에 주로 사용' },
    { ko: '하의',   hanja: '賀儀',   note: '격식 있는 축하의 뜻' },
    { ko: '축 성전', hanja: '祝 盛典', note: '성대한 의식을 축하' },
  ],
  funeral: [
    { ko: '부의', hanja: '賻儀', note: '가장 무난한 조의 문구' },
    { ko: '근조', hanja: '謹弔', note: '삼가 조의를 표함' },
    { ko: '조의', hanja: '弔意', note: '슬픔을 함께함' },
    { ko: '추모', hanja: '追慕', note: '고인을 기림' },
  ],
}
