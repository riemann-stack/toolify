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
  category: 'wind' | 'humidity' | 'temp' | 'spin' | 'rack' | 'bathroom'
}

// 한국 가정 장비 8종 (★ 표시는 한국 특화)
export const LAUNDRY_EQUIPMENT: Equipment[] = [
  // 바람 계열
  { id: 'fan',          name: '선풍기',          icon: '💨', desc: '보편적·저전력',           timeReduction: 0.30, powerW: 50,   category: 'wind' },
  { id: 'circulator',   name: '서큘레이터',      icon: '🌀', desc: '강력한 바람·집중 통풍',   timeReduction: 0.40, powerW: 30,   category: 'wind' },
  // 욕실 환풍기는 '작은 밀폐 공간 + 배기' 효과로, 일반 바람(선풍기 등)과 별도로 누적된다
  { id: 'bathroom-fan', name: '욕실 환풍기 ★',   icon: '🚿', desc: '한국 가정 표준 (작은 공간 효율)', timeReduction: 0.25, powerW: 30, category: 'bathroom' },

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

// ── 건조 속도 보정 계수 (연속/선형보간) — 메인·조합 탭 공통 ──
function lerp(x: number, pts: [number, number][]): number {
  if (x <= pts[0][0]) return pts[0][1]
  const n = pts.length
  if (x >= pts[n - 1][0]) return pts[n - 1][1]
  for (let i = 1; i < n; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    }
  }
  return pts[n - 1][1]
}
// 기온(°C) → 시간 배수 (낮을수록 느림). 경계에서 갑자기 튀지 않도록 연속.
export function tempFactorOf(t: number): number {
  return lerp(t, [[-10, 2.2], [0, 1.8], [5, 1.6], [10, 1.4], [15, 1.2], [18, 1.1], [22, 1.0], [28, 0.9], [40, 0.82]])
}
// 습도(%) → 시간 배수 (높을수록 느림). 연속.
export function humidFactorOf(h: number): number {
  return lerp(h, [[20, 0.65], [30, 0.7], [50, 0.85], [65, 1.0], [80, 1.5], [90, 2.0], [100, 2.4]])
}

// 조합 평가 — env(현재 기온·습도) 기준으로 메인 탭과 동일한 곡선을 사용해 장비 효과를 계산
export function evaluateCombo(comboIds: string[], baseMinutes: number, env: { temp: number; humidity: number }): ComboResult {
  // 같은 카테고리 중복: 가장 큰 효과만
  const byCat = new Map<string, Equipment>()
  for (const id of comboIds) {
    const eq = LAUNDRY_EQUIPMENT.find(e => e.id === id)
    if (!eq) continue
    const existing = byCat.get(eq.category)
    if (!existing) { byCat.set(eq.category, eq); continue }
    // 같은 카테고리는 효과가 큰 1개만 적용 (예: 선풍기+서큘레이터 → 서큘레이터)
    const ex = existing.timeReduction ?? existing.humidityReduction ?? existing.tempIncrease ?? 0
    const ne = eq.timeReduction ?? eq.humidityReduction ?? eq.tempIncrease ?? 0
    if (ne > ex) byCat.set(eq.category, eq)
  }

  let mult = 1
  let totalW = 0
  for (const eq of byCat.values()) {
    if (eq.timeReduction) mult *= (1 - eq.timeReduction)
    // 습도/온도 장비는 메인 탭과 동일하게 '보정계수 비율'로 환경 의존 계산 (고습도일수록 제습 효과 ↑)
    if (eq.humidityReduction) {
      const after = Math.max(20, env.humidity - eq.humidityReduction)
      mult *= humidFactorOf(after) / humidFactorOf(env.humidity)
    }
    if (eq.tempIncrease) {
      mult *= tempFactorOf(env.temp + eq.tempIncrease) / tempFactorOf(env.temp)
    }
    if (eq.tempDecrease) {  // 에어컨: 온도 ↓ → 시간 ↑ 살짝
      mult *= tempFactorOf(env.temp - eq.tempDecrease) / tempFactorOf(env.temp)
    }
    totalW += eq.powerW
  }
  mult = Math.max(0.05, mult)

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
  env: { temp: number; humidity: number },
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
    all.push(evaluateCombo(combo, baseMinutes, env))
  }

  // 같은 카테고리 중복(예: 선풍기+서큘레이터)으로 동일해진 조합 제거
  const seen = new Set<string>()
  const deduped = all.filter(c => {
    const key = [...c.combo].sort().join(',')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  let filtered = deduped
  if (targetMinutes && targetMinutes > 0) {
    const within = deduped.filter(c => c.minutes <= targetMinutes)
    filtered = within.length > 0 ? within : deduped
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
