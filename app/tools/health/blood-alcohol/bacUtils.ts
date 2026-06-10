/* ──────────────────────────────────────────────────────
   health/blood-alcohol/bacUtils.ts
   혈중알코올 — Widmark 공식·다음날 아침·여러 자리 누적
   ※ 본 도구는 음주 예방 교육 참고용이며, 법적 면책 근거가 아닙니다.
   ±20~30% 오차 가능. 음주 후 운전 절대 X. 카카오 T 대리 1577-1577.
   ────────────────────────────────────────────────────── */

/* ─── 분해 속도 옵션 (개인차) ─── */
export interface DecayRate {
  id: string
  label: string
  rate: number   // g/dL per hour
  desc: string
}

export const DECAY_RATES: DecayRate[] = [
  { id: 'very-fast', label: '매우 빠름', rate: 0.020, desc: '평균보다 30% 빠름 (드문 케이스)' },
  { id: 'fast',      label: '빠름',      rate: 0.018, desc: '평균보다 20% 빠름' },
  { id: 'normal',    label: '보통',      rate: 0.015, desc: '한국인 평균 (표준) ⭐' },
  { id: 'slow',      label: '느림',      rate: 0.013, desc: 'ALDH2 결손 일부 (얼굴 빨개짐)' },
  { id: 'very-slow', label: '매우 느림', rate: 0.010, desc: 'ALDH2 결손 강함 (술 매우 약함)' },
]

/* ─── 식사 상태 ─── */
export interface FoodState {
  id: string
  label: string
  multiplier: number   // BAC 보정
  desc: string
}

export const FOOD_STATES: FoodState[] = [
  { id: 'empty',     label: '완전 공복',    multiplier: 1.25, desc: '흡수 25% 빠름' },
  { id: 'light',     label: '가벼운 안주',  multiplier: 1.15, desc: '술 + 마른 안주' },
  { id: 'normal',    label: '보통 식사',    multiplier: 1.00, desc: '일반적인 식사량 (기준)' },
  { id: 'hearty',    label: '든든한 식사',  multiplier: 0.85, desc: '밥·고기' },
  { id: 'very-hearty', label: '매우 든든',  multiplier: 0.75, desc: '기름진 음식' },
]

/* ─── 표준잔 (1잔 = 알코올 8g) ─── */
export const STANDARD_DRINK_G = 8

/* ─── 한국 음주운전 처벌 임계값 (도로교통법·윤창호법, 직군 무관 동일) ─── */
export const BAC_THRESHOLDS = {
  GENERAL_SUSPEND:    0.03,   // 면허정지 (단속 기준)
  REVOKE:             0.08,   // 면허취소
  AGGRAVATED:         0.20,   // 가중처벌 (2~5년 / 1000~2000만원)
}

/* ─── 약물·알코올 위험 ─── */
export interface DrugAlcoholRisk {
  id: string
  name: string
  risk: 'high' | 'medium' | 'low'
  desc: string
}

export const DRUG_ALCOHOL_RISKS: DrugAlcoholRisk[] = [
  { id: 'sleep',     name: '수면제',           risk: 'high',   desc: '호흡 억제 → 사망 가능성' },
  { id: 'painkiller', name: '진통제 (타이레놀)', risk: 'high',   desc: '간 손상 (아세트아미노펜 + 알코올)' },
  { id: 'antidepressant', name: '항우울제',     risk: 'high',   desc: '부작용 증폭·과다 진정' },
  { id: 'bp',        name: '혈압약',           risk: 'high',   desc: '저혈압 쇼크 위험' },
  { id: 'diabetes',  name: '당뇨약',           risk: 'high',   desc: '저혈당 쇼크 위험' },
  { id: 'antihistamine', name: '항알레르기제',  risk: 'medium', desc: '졸음·진정 효과 증폭' },
  { id: 'antibiotic', name: '항생제',          risk: 'medium', desc: '일부 항생제는 디설피람 반응 (구토·홍조)' },
  { id: 'stomach',   name: '위장약',           risk: 'low',    desc: '효과 변화 가능' },
]

/* ─── 음주 세션 (자리) ─── */
export interface DrinkingSession {
  id: string
  startMin: number   // 0=00:00 기준 분 단위 (세션 시작 후 누적)
  endMin: number
  alcoholGrams: number
}

/* ─── Widmark 기본 계산 ─── */
export interface WidmarkInput {
  weightKg: number
  sex: 'male' | 'female'
  alcoholGrams: number
  foodMultiplier: number
}

export function calcPeakBAC(input: WidmarkInput): number {
  const r = input.sex === 'male' ? 0.68 : 0.55
  if (input.weightKg <= 0 || input.alcoholGrams <= 0) return 0
  return (input.alcoholGrams * input.foodMultiplier) / (input.weightKg * r * 10)
}

/* ─── 시간별 BAC 곡선 (음주 종료 후) ─── */
export function bacAtMinutesAfterEnd(
  peakBAC: number, minutesAfterEnd: number, decayRate: number,
): number {
  return Math.max(0, peakBAC - decayRate * (minutesAfterEnd / 60))
}

/* ─── 다음날 아침 BAC ─── */
export interface TomorrowInput {
  drinkEndH: number
  drinkEndM: number
  drinkEndDayOffset: number   // 0=오늘, -1=어제 (보통 0)
  morningH: number
  morningM: number
  peakBAC: number
  decayRate: number
}

export interface TomorrowResult {
  morningBAC: number
  hoursElapsed: number
  status: 'safe' | 'detected' | 'suspend' | 'revoke'
  statusLabel: string
  statusColor: string
  // 분 단위 (자정=0, 다음날 24:00=1440)
  endMin: number   // 음주 종료 시각 (분)
  morningMin: number   // 다음날 아침 시각 (분)
  suspendClearMin: number  // 면허정지 해소 (0.03)
  revokeClearMin: number   // 면허취소 해소 (0.08)
  zeroMin: number   // 완전 소멸
  recommendedSafeMin: number  // 권장 안전 시각 (완전 소멸 + 1시간)
}

export function calcTomorrowMorning(input: TomorrowInput): TomorrowResult {
  // 분 단위로 통일 (어제 23시 = -60, 오늘 자정 = 0)
  const endMin = input.drinkEndDayOffset * 1440 + input.drinkEndH * 60 + input.drinkEndM
  const morningMin = 1440 + input.morningH * 60 + input.morningM   // 다음날 아침
  const minutesElapsed = morningMin - endMin
  const hoursElapsed = minutesElapsed / 60

  const morningBAC = bacAtMinutesAfterEnd(input.peakBAC, minutesElapsed, input.decayRate)

  let status: TomorrowResult['status']
  let statusLabel: string
  let statusColor: string
  if (morningBAC >= BAC_THRESHOLDS.REVOKE) {
    status = 'revoke'; statusLabel = '🚨 면허취소 수준 — 절대 운전 금지'; statusColor = '#B91C1C'
  } else if (morningBAC >= BAC_THRESHOLDS.GENERAL_SUSPEND) {
    status = 'suspend'; statusLabel = '❌ 면허정지 수준 — 운전 불가'; statusColor = '#DC2626'
  } else if (morningBAC > 0) {
    status = 'detected'; statusLabel = '⚠️ 측정 시 양성 가능 — 단속 위험'; statusColor = '#EA580C'
  } else {
    status = 'safe'; statusLabel = '✅ 알코올 완전 분해'; statusColor = '#059669'
  }

  const suspendClearMin = input.peakBAC > BAC_THRESHOLDS.GENERAL_SUSPEND
    ? endMin + ((input.peakBAC - BAC_THRESHOLDS.GENERAL_SUSPEND) / input.decayRate) * 60
    : endMin
  const revokeClearMin = input.peakBAC > BAC_THRESHOLDS.REVOKE
    ? endMin + ((input.peakBAC - BAC_THRESHOLDS.REVOKE) / input.decayRate) * 60
    : endMin
  const zeroMin = input.peakBAC > 0
    ? endMin + (input.peakBAC / input.decayRate) * 60
    : endMin
  const recommendedSafeMin = zeroMin + 60   // 1시간 여유

  return {
    morningBAC, hoursElapsed,
    status, statusLabel, statusColor,
    endMin, morningMin,
    suspendClearMin, revokeClearMin, zeroMin, recommendedSafeMin,
  }
}

/* ─── 여러 자리 누적 ─── */
export interface CumulativeInput {
  sessions: DrinkingSession[]
  weightKg: number
  sex: 'male' | 'female'
  foodMultiplier: number
  decayRate: number
  startBaseDay?: number   // 기준 일자 (보통 0)
}

export interface CumulativeResult {
  curve: { min: number; bac: number }[]   // 5분 간격
  peakBAC: number
  peakMin: number
  totalAlcoholGrams: number
  finalEndMin: number
  suspendClearMin: number   // 면허정지 해소 (0.03)
  revokeClearMin: number    // 면허취소 해소 (0.08)
  zeroMin: number           // 완전 소멸
}

export function calcCumulativeBAC(input: CumulativeInput): CumulativeResult {
  const r = input.sex === 'male' ? 0.68 : 0.55
  const sessions = [...input.sessions].sort((a, b) => a.startMin - b.startMin)

  if (sessions.length === 0 || input.weightKg <= 0) {
    return {
      curve: [], peakBAC: 0, peakMin: 0,
      totalAlcoholGrams: 0, finalEndMin: 0,
      suspendClearMin: 0, revokeClearMin: 0, zeroMin: 0,
    }
  }

  const totalAlcoholGrams = sessions.reduce((s, x) => s + x.alcoholGrams, 0)
  const startMin = sessions[0].startMin
  const finalEndMin = sessions[sessions.length - 1].endMin
  const horizonMin = finalEndMin + 24 * 60   // 끝나고 24시간까지 시뮬

  // 시간 흐름 기반 0차(zero-order) 모델:
  // 각 자리 알코올은 종료 시점에 흡수 완료(단순화)되어 BAC가 점프하고,
  // 그 사이에는 시간당 decayRate로 일정하게 소거(0 미만 불가)된다.
  const bumps = sessions
    .map(s => ({ at: s.endMin, add: (s.alcoholGrams * input.foodMultiplier) / (input.weightKg * r * 10) }))
    .sort((a, b) => a.at - b.at)

  const curve: { min: number; bac: number }[] = []
  let runBac = 0      // runT 시점의 누적 BAC
  let runT = startMin
  let bi = 0
  for (let t = startMin; t <= horizonMin; t += 5) {
    while (bi < bumps.length && bumps[bi].at <= t) {
      runBac = Math.max(0, runBac - input.decayRate * ((bumps[bi].at - runT) / 60)) + bumps[bi].add
      runT = bumps[bi].at
      bi++
    }
    const bac = Math.max(0, runBac - input.decayRate * ((t - runT) / 60))
    curve.push({ min: t, bac })
  }

  let peakBAC = 0
  let peakMin = startMin
  for (const c of curve) {
    if (c.bac > peakBAC) { peakBAC = c.bac; peakMin = c.min }
  }

  // 마지막 자리 종료 시점의 BAC(이전 자리 소거를 반영) 기준으로 임계값 도달 시각 계산
  let bacAtFinalEnd = 0
  let fT = startMin
  for (const b of bumps) {
    bacAtFinalEnd = Math.max(0, bacAtFinalEnd - input.decayRate * ((b.at - fT) / 60)) + b.add
    fT = b.at
  }

  const suspendClearMin = bacAtFinalEnd > BAC_THRESHOLDS.GENERAL_SUSPEND
    ? finalEndMin + ((bacAtFinalEnd - BAC_THRESHOLDS.GENERAL_SUSPEND) / input.decayRate) * 60 : finalEndMin
  const revokeClearMin = bacAtFinalEnd > BAC_THRESHOLDS.REVOKE
    ? finalEndMin + ((bacAtFinalEnd - BAC_THRESHOLDS.REVOKE) / input.decayRate) * 60 : finalEndMin
  const zeroMin = finalEndMin + (bacAtFinalEnd / input.decayRate) * 60

  return {
    curve, peakBAC, peakMin,
    totalAlcoholGrams,
    finalEndMin,
    suspendClearMin,
    revokeClearMin,
    zeroMin,
  }
}

/* ─── 음주 → 알코올 그램 ─── */
export function alcoholGrams(volumeMl: number, abvPercent: number): number {
  return volumeMl * (abvPercent / 100) * 0.7894
}

/* ─── 시각 포맷 ─── */
export function fmtTimeMin(min: number, baseDay = 0): string {
  const totalMin = Math.round(min)
  const dayOffset = Math.floor(totalMin / 1440)
  const rest = ((totalMin % 1440) + 1440) % 1440
  const h = Math.floor(rest / 60)
  const m = rest % 60
  const total = baseDay + dayOffset
  let dayLabel = ''
  if (total === 1) dayLabel = ' (다음날)'
  else if (total === 2) dayLabel = ' (모레)'
  else if (total > 2) dayLabel = ` (+${total}일)`
  return `${pad2(h)}:${pad2(m)}${dayLabel}`
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function fmtBAC(bac: number): string {
  return bac.toFixed(3)
}
