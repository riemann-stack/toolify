/* ──────────────────────────────────────────────────────
   health/blood-alcohol/bacUtils.ts
   혈중알코올 — Widmark 공식·다음날 아침·여러 자리 누적
   ※ 본 도구는 음주 예방 교육 참고용이며, 법적 면책 근거가 아닙니다.
   ±20~30% 오차 가능. 음주 후에는 계산값과 관계없이 운전하지 말 것.
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
  AGGRAVATED:         0.20,   // 가중처벌 구간 (형량은 아래 DRUNK_DRIVING_PENALTIES 'aggravated')
}

/* ─── 음주운전 형사처벌·행정처분 (참고) ───
   이 블록이 도구 안 법정 수치의 단일 소스다 — page.tsx·Client 문구는 여기서만 가져다 쓴다.
   TODO(lib 이관): 법정 수치 단일 소스 원칙에 따라 아래 상수 전체를 lib/krDrunkDriving.ts 로 옮길 것 */

/** 징역(년)·벌금(원) 범위. 하한 0 = 'n 이하' */
export interface PenaltyRange { prisonYears: [number, number]; fineWon: [number, number] }

/** 현행 BAC 구간 처벌 시행일 (도로교통법 제148조의2, 단속 기준 0.05→0.03 강화) */
export const DRUNK_DRIVING_LAW_SINCE = '2019-06-25'

const withComma = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
/** 원 → 'n만' (예: 20000000 → '2,000만', 30000 → '3만') — '원'은 호출부 또는 fmtManwonWon */
export const fmtManwon = (won: number) => `${withComma(won / 10000)}만`
/** 원 → 'n만원' (예: 130000 → '13만원') */
export const fmtManwonWon = (won: number) => `${fmtManwon(won)}원`
/** 'YYYY-MM-DD' → '2018년 9월 28일'(full) · '2018.9.28'(dot) · '2018년 9월'(ym). Date 파싱 없이 분해 */
export function fmtLawDate(iso: string, style: 'full' | 'dot' | 'ym' = 'full'): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (style === 'dot') return `${y}.${m}.${d}`
  if (style === 'ym') return `${y}년 ${m}월`
  return `${y}년 ${m}월 ${d}일`
}
/** 정식 표기 — '1년 이상 2년 이하 징역 또는 500만~1,000만원 벌금' / '1년 이하 징역 또는 500만원 이하 벌금' */
export function fmtPenaltyLong(r: PenaltyRange): string {
  const [pMin, pMax] = r.prisonYears
  const [fMin, fMax] = r.fineWon
  const prison = pMin > 0 ? `${pMin}년 이상 ${pMax}년 이하 징역` : `${pMax}년 이하 징역`
  const fine = fMin > 0 ? `${fmtManwon(fMin)}~${fmtManwonWon(fMax)} 벌금` : `${fmtManwonWon(fMax)} 이하 벌금`
  return `${prison} 또는 ${fine}`
}
/** 약식 표기 — '2~5년 / 1,000만~2,000만원' (joiner로 ' 징역 또는 ' 등 지정) */
export function fmtPenaltyShort(r: PenaltyRange, joiner = ' / '): string {
  const [pMin, pMax] = r.prisonYears
  const [fMin, fMax] = r.fineWon
  const prison = pMin > 0 ? `${pMin}~${pMax}년` : `${pMax}년 이하`
  const fine = fMin > 0 ? `${fmtManwon(fMin)}~${fmtManwonWon(fMax)}` : `${fmtManwonWon(fMax)} 이하`
  return `${prison}${joiner}${fine}`
}

/* 초범 BAC 구간·측정 거부 처벌
   출처: 국가법령정보센터 도로교통법 제148조의2 ②(측정 거부)·③(BAC 구간), 2019.6.25 시행.
   결격기간은 BAC가 아니라 제82조②(위반 횟수·사고)로 정해지므로 표에 넣지 않는다. */
type PenaltyId = 'suspend' | 'revoke' | 'aggravated' | 'refusal'
const PENALTY_ROWS: ({ id: PenaltyId; bac: string; license: string; note?: string } & PenaltyRange)[] = [
  { id: 'suspend',    bac: '0.03~0.08% 미만', license: '면허정지', note: '벌점 100점(정지 100일)', prisonYears: [0, 1], fineWon: [0, 5_000_000] },
  { id: 'revoke',     bac: '0.08~0.2% 미만',  license: '면허취소', prisonYears: [1, 2], fineWon: [5_000_000, 10_000_000] },
  { id: 'aggravated', bac: '0.2% 이상',       license: '면허취소', prisonYears: [2, 5], fineWon: [10_000_000, 20_000_000] },
  { id: 'refusal',    bac: '측정 거부',       license: '면허취소', prisonYears: [1, 5], fineWon: [5_000_000, 20_000_000] },
]
export const DRUNK_DRIVING_PENALTIES = PENALTY_ROWS.map(r => ({
  ...r,
  penalty: `${r.note ? `${r.note}, ` : ''}${fmtPenaltyLong(r)}`,
}))
export const DRUNK_DRIVING_PENALTY_BY_ID = Object.fromEntries(
  DRUNK_DRIVING_PENALTIES.map(p => [p.id, p]),
) as Record<PenaltyId, (typeof DRUNK_DRIVING_PENALTIES)[number]>
/** 초범 형사처벌 상한(징역 년·벌금 원) — '최대 징역 5년·벌금 2,000만원' 요약 문구용 */
export const DRUNK_DRIVING_MAX_PENALTY = {
  prisonYears: Math.max(...PENALTY_ROWS.map(r => r.prisonYears[1])),
  fineWon: Math.max(...PENALTY_ROWS.map(r => r.fineWon[1])),
}

/* 재위반 가중처벌 — 도로교통법 제148조의2 ①
   (음주운전·측정 거부로 벌금 이상 형이 확정된 날부터 10년 안에 다시 위반한 경우) */
export const DRUNK_DRIVING_REPEAT_WINDOW_YEARS = 10
export const DRUNK_DRIVING_REPEAT_PENALTIES: ({ label: string } & PenaltyRange)[] = [
  { label: '0.03~0.2%', prisonYears: [1, 5], fineWon: [5_000_000, 20_000_000] },
  { label: '0.2% 이상',  prisonYears: [2, 6], fineWon: [10_000_000, 30_000_000] },
  { label: '측정 거부',  prisonYears: [1, 6], fineWon: [5_000_000, 30_000_000] },
]

/* 음주운전 면허 결격기간(년, 면허가 취소된 날부터) — 도로교통법 제82조② */
export const LICENSE_DISQUALIFICATION_YEARS = {
  firstRevoke: 1,     // 그 밖의 취소 (음주·측정 거부 1회 취소 등)
  repeat: 2,          // 음주운전(측정 거부 포함) 2회 이상 위반
  accident: 2,        // 음주운전 중 교통사고
  repeatAccident: 3,  // 음주운전 중 교통사고 2회 이상
  fatal: 5,           // 음주운전 중 사망사고
}

/* 자전거·개인형 이동장치(전동킥보드 등) 음주운전 범칙금(원)
   출처: 도로교통법 시행령 별표 8(범칙금액). 자전거 2018.9.28 시행, 개인형 이동장치 2021.5.13 시행 */
export const BICYCLE_PM_FINES = {
  bicycle: { since: '2018-09-28', fine: 30_000, refusal: 100_000 },
  pm:      { since: '2021-05-13', fine: 100_000, refusal: 130_000 },
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
  drinkEndDayOffset: number   // 0=시작일 당일 종료, 1=자정 넘겨 익일 종료
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
  morningMin: number   // 확인 시각 (분) — 음주 종료 후 처음 오는 HH:MM
  suspendClearMin: number  // 면허정지 해소 (0.03)
  revokeClearMin: number   // 면허취소 해소 (0.08)
  zeroMin: number   // 완전 소멸
  recommendedSafeMin: number  // 권장 안전 시각 (완전 소멸 + 1시간)
}

export function calcTomorrowMorning(input: TomorrowInput): TomorrowResult {
  // 분 단위로 통일 (음주 시작일 자정 = 0)
  const endMin = input.drinkEndDayOffset * 1440 + input.drinkEndH * 60 + input.drinkEndM
  // 확인 시각 = 음주 종료 이후 처음 도래하는 HH:MM
  // (자정 이후 시작·종료한 음주에 무조건 +1일을 더하면 경과 시간이 24h 과대 → 거짓 '분해 완료')
  let morningMin = input.drinkEndDayOffset * 1440 + input.morningH * 60 + input.morningM
  if (morningMin < endMin) morningMin += 1440   // 종료와 같은 시각이면 경과 0h(보수적)
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
    status = 'safe'; statusLabel = '✅ 완전 분해 추정 (오차 가능)'; statusColor = '#059669'
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

/* ─── 실시간 카운트다운용 음주 종료 시각(epoch ms) 해석 ───
   시작·종료는 HH:MM만 입력받으므로 '언제의' 술자리인지 추정해야 한다.
   - 가장 최근 시작 시각(≤ 현재)의 술자리가 아직 진행 중이면 그 종료(미래)를 사용
     (예: 23:30에 19:00~02:00 입력 → 내일 02:00. 예전엔 '오늘 02:00'으로 잡혀 거짓 '통과')
   - 이미 끝났어도 그 술자리의 알코올이 아직 남아 있을 시간(residualMs, 보통 peak÷분해율)이면
     그 술자리로 본다 (예: 19:00~02:00 과음 후 다음날 14:00 확인 → 카운트다운 유지)
   - 알코올이 다 분해됐을 시간이면 기본은 그 술자리로 보되,
     다음 시작 시각이 지난 종료보다 훨씬 가까우면(절반 미만) 앞으로 마실 술자리로 본다
     → '아직 미래' 안내만 표시하고 카운트다운은 숨김
   tzOffsetMs: KST = +9h */
export function resolveDrinkEndEpoch(
  nowMs: number, startMinOfDay: number, endMinOfDay: number, tzOffsetMs = 9 * 3600 * 1000,
  residualMs = 0,
): number {
  const DAY = 24 * 3600 * 1000
  const localNow = nowMs + tzOffsetMs
  const localMidnight = Math.floor(localNow / DAY) * DAY
  let s0 = localMidnight + startMinOfDay * 60000
  if (s0 > localNow) s0 -= DAY                        // 가장 최근 시작(≤ 현재)
  const dur = (((endMinOfDay - startMinOfDay) % 1440) + 1440) % 1440 * 60000
  const e0 = s0 + dur
  if (e0 > localNow) return e0 - tzOffsetMs          // 음주 진행 중 → 종료는 미래
  if (localNow < e0 + residualMs) return e0 - tzOffsetMs  // 지난 술자리 알코올이 남아 있을 수 있음
  const sinceEnd = localNow - e0
  const untilNextStart = s0 + DAY - localNow
  const chosenEnd = untilNextStart * 2 < sinceEnd ? s0 + DAY + dur : e0
  return chosenEnd - tzOffsetMs
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
