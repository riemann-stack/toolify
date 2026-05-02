// ─────────────────────────────────────────────────────────────
// 빨래 건조 시간 계산기 — 한국 가정 장비 데이터 + 조합 추천
// ─────────────────────────────────────────────────────────────

export type Equipment = {
  id: string
  name: string
  icon: string
  desc: string
  timeReduction?: number     // 0~1 (예: 0.30 = 시간 30% 단축)
  humidityReduction?: number // 절대값 (예: 15 = 습도 -15%p)
  tempIncrease?: number      // °C
  tempDecrease?: number      // °C (에어컨 제습)
  powerW: number             // 평균 전력 (W)
  runtimeMin?: number        // 사용 시간 (없으면 전체 건조 시간)
  category: 'wind' | 'humidity' | 'temp' | 'spin' | 'rack'
}

// 한국 가정 장비 11종 (★ 표시는 한국 특화)
export const LAUNDRY_EQUIPMENT: Equipment[] = [
  // 바람 계열
  { id: 'fan',          name: '선풍기',          icon: '💨', desc: '보편적·저전력',           timeReduction: 0.30, powerW: 50,   category: 'wind' },
  { id: 'circulator',   name: '서큘레이터',      icon: '🌀', desc: '강력한 바람·집중 통풍',   timeReduction: 0.40, powerW: 30,   category: 'wind' },
  { id: 'bathroom-fan', name: '욕실 환풍기 ★',   icon: '🚿', desc: '한국 가정 표준 (작은 공간 효율)', timeReduction: 0.25, powerW: 30, category: 'wind' },

  // 습도 계열
  { id: 'dehumidifier', name: '제습기',          icon: '💧', desc: '장마·겨울 실내 핵심',     humidityReduction: 15, powerW: 200, category: 'humidity' },
  { id: 'aircon-dry',   name: '에어컨 제습',     icon: '❄️', desc: '강력하지만 전력 ↑',       humidityReduction: 20, tempDecrease: 3, powerW: 800, category: 'humidity' },

  // 온도 계열
  { id: 'heater',       name: '난방·라디에이터', icon: '🔥', desc: '겨울 효과·전기료 ↑',      tempIncrease: 5, powerW: 1500, category: 'temp' },

  // 공간·통풍
  { id: 'two-racks',    name: '건조대 2개',      icon: '📐', desc: '간격 ↑·통풍 ↑·전력 0',   timeReduction: 0.15, powerW: 0,   category: 'rack' },

  // 탈수 추가
  { id: 'extra-spin',   name: '추가 탈수 1회',   icon: '🌪️', desc: '15~20% 단축, 짧게 사용', timeReduction: 0.18, powerW: 100, runtimeMin: 10, category: 'spin' },
]

// 한국 평균 전기료 (2026 기준, 2단계 가정)
export const KRW_PER_KWH = 200

export type ComboResult = {
  combo: string[]
  minutes: number
  cost: number
  kwh: number
  reductionPct: number
  totalW: number
}

export type Priority = 'speed' | 'balanced' | 'cost'

// 조합 평가
export function evaluateCombo(comboIds: string[], baseMinutes: number): ComboResult {
  let mult = 1
  let humReduce = 0
  let tempInc = 0
  let totalW = 0

  // 같은 카테고리 중복 방지: 가장 큰 효과만
  const byCat = new Map<string, Equipment>()
  for (const id of comboIds) {
    const eq = LAUNDRY_EQUIPMENT.find(e => e.id === id)
    if (!eq) continue
    const existing = byCat.get(eq.category)
    if (!existing) {
      byCat.set(eq.category, eq)
    } else {
      // 같은 카테고리 중복: timeReduction 큰 쪽만 (다른 효과는 합산)
      const ex = existing.timeReduction ?? 0
      const ne = eq.timeReduction ?? 0
      if (ne > ex) byCat.set(eq.category, eq)
    }
  }

  for (const eq of byCat.values()) {
    if (eq.timeReduction) mult *= (1 - eq.timeReduction)
    if (eq.humidityReduction) humReduce += eq.humidityReduction
    if (eq.tempIncrease) tempInc += eq.tempIncrease
    if (eq.tempDecrease) tempInc -= eq.tempDecrease  // 에어컨은 온도 ↓ → 시간 ↑ 살짝
    totalW += eq.powerW
  }

  // 습도 -15%당 시간 -10%, 온도 +5°C당 시간 -8%
  mult *= Math.max(0.1, 1 - humReduce * 0.0067)
  mult *= Math.max(0.1, 1 - tempInc * 0.016)

  const minutes = baseMinutes * mult

  // 전력은 장비별 runtimeMin 따로 계산 (없으면 전체 건조 시간)
  let totalKwh = 0
  for (const eq of byCat.values()) {
    const runtime = (eq.runtimeMin ?? minutes) / 60
    totalKwh += (eq.powerW * runtime) / 1000
  }
  const cost = totalKwh * KRW_PER_KWH

  return {
    combo: Array.from(byCat.values()).map(e => e.id),
    minutes: Math.round(minutes),
    cost: Math.round(cost),
    kwh: Math.round(totalKwh * 100) / 100,
    reductionPct: Math.round((1 - mult) * 100),
    totalW,
  }
}

// 가능한 모든 조합 평가 + 우선순위 정렬
export function recommendCombos(
  ownedIds: string[],
  baseMinutes: number,
  priority: Priority,
  targetMinutes?: number,
): ComboResult[] {
  if (ownedIds.length === 0) return []
  const total = 1 << ownedIds.length
  const all: ComboResult[] = []
  for (let mask = 1; mask < total; mask++) {
    const combo: string[] = []
    for (let j = 0; j < ownedIds.length; j++) {
      if (mask & (1 << j)) combo.push(ownedIds[j])
    }
    all.push(evaluateCombo(combo, baseMinutes))
  }

  let filtered = all
  if (targetMinutes && targetMinutes > 0) {
    const within = all.filter(c => c.minutes <= targetMinutes)
    filtered = within.length > 0 ? within : all
  }

  if (priority === 'speed') {
    filtered.sort((a, b) => a.minutes - b.minutes || a.cost - b.cost)
  } else if (priority === 'cost') {
    filtered.sort((a, b) => a.cost - b.cost || a.minutes - b.minutes)
  } else {
    // balanced: 시간 가중 0.7 + 비용 가중 0.3 (정규화)
    const maxTime = Math.max(...filtered.map(c => c.minutes), 1)
    const maxCost = Math.max(...filtered.map(c => c.cost), 1)
    filtered.sort((a, b) => (
      (a.minutes / maxTime) * 0.7 + (a.cost / maxCost) * 0.3
    ) - (
      (b.minutes / maxTime) * 0.7 + (b.cost / maxCost) * 0.3
    ))
  }

  return filtered
}

export function fmtMinutes(m: number): string {
  if (m < 1) return '1분 미만'
  if (m < 60) return `${Math.round(m)}분`
  const h = Math.floor(m / 60)
  const mm = Math.round(m % 60)
  if (mm === 0) return `${h}시간`
  if (mm === 60) return `${h + 1}시간`
  return `${h}시간 ${mm}분`
}

export function fmtKrw(krw: number): string {
  if (krw < 1) return '거의 무료'
  if (krw < 10) return `약 ${Math.round(krw)}원`
  if (krw < 100) return `약 ${Math.round(krw / 5) * 5}원`
  return `약 ${Math.round(krw / 10) * 10}원`
}
