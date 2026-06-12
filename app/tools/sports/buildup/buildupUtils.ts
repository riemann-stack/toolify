// ─────────────────────────────────────────────────────────────
// 러닝 빌드업 훈련 — 곡선 계산 + 프로파일 + VDOT 매핑 + 안전성 체크
// VDOT 함수는 race-predictor utils에서 재사용
// ─────────────────────────────────────────────────────────────
import {
  vdotFromRace, paceFromVdot, fmtPace, fmtHMS,
} from '../race-predictor/racePredictorUtils'

export { fmtPace, fmtHMS }

// ── 빌드업 프로파일 ─────────────────────
export type Profile = 'linear' | 'back-loaded' | 'sprint-finish' | 'race-pace-ladder'

export const PROFILE_LABEL: Record<Profile, string> = {
  'linear':           '균등 빌드업',
  'back-loaded':      '후반 집중',
  'sprint-finish':    '마지막 자극',
  'race-pace-ladder': '레이스 페이스 단계',
}
export const PROFILE_DESC: Record<Profile, string> = {
  'linear':           '구간마다 같은 폭으로 가속 — 가장 단순·표준',
  'back-loaded':      '처음 70%는 천천히, 후반 30% 가속 — 하프·풀 준비',
  'sprint-finish':    '처음 80%는 편안, 마지막 20%만 강하게 — 가벼운 자극주',
  'race-pace-ladder': 'E → M → HM → 10K 단계 (4구간 고정) — 레이스 적응',
}

// ── 강도 라벨 (VDOT 페이스 대비) ────────
export type Intensity = 'E' | 'M' | 'T' | 'I' | 'R'
export const INTENSITY_LABEL: Record<Intensity, { label: string; color: string; pct: number }> = {
  'E': { label: 'Easy',       color: '#0D9488', pct: 0.59 },
  'M': { label: 'Marathon',   color: '#059669', pct: 0.70 },
  'T': { label: 'Threshold',  color: '#FFD93E', pct: 0.78 },
  'I': { label: 'Interval',   color: '#EA580C', pct: 0.85 },
  'R': { label: 'Repetition', color: '#DC2626', pct: 0.93 },
}

// ── 시간 입력 헬퍼 ──────────────────────
/** "5:30" → 330초/km */
export function parsePace(s: string): number {
  const m = s.match(/^\s*(\d{1,2})\s*[:.]\s*(\d{1,2})\s*$/)
  if (!m) {
    const num = parseFloat(s)
    if (isFinite(num) && num > 0) return num
    return 0
  }
  return parseInt(m[1]) * 60 + parseInt(m[2])
}

/** 빠른 페이스 칩용 */
export const PACE_QUICK = ['7:00', '6:30', '6:00', '5:30', '5:00', '4:45', '4:30', '4:15', '4:00']

// ── 구간 분할 모드 ──────────────────────
export type SplitMode = 'equal-3' | 'equal-4' | 'equal-5' | 'equal-6' | 'per-km'

export const SPLIT_LABEL: Record<SplitMode, string> = {
  'equal-3': '균등 3구간',
  'equal-4': '균등 4구간',
  'equal-5': '균등 5구간',
  'equal-6': '균등 6구간',
  'per-km':  '1km 단위',
}

export function segmentsFromMode(totalKm: number, mode: SplitMode): number[] {
  if (mode === 'per-km') {
    const full = Math.floor(totalKm)
    const remainder = totalKm - full
    const out = Array(full).fill(1)
    if (remainder > 0.05) out.push(remainder)
    return out
  }
  const n = parseInt(mode.split('-')[1])
  const each = totalKm / n
  return Array(n).fill(each)
}

// ── 페이스 곡선 (프로파일별) ───────────
/**
 * 각 구간의 페이스(초/km) 배열 반환.
 * 거리 가중 평균이 (시작+끝)/2가 아니라 프로파일에 따라 달라짐.
 */
export function paceCurve(
  segments: number[],
  startSec: number,
  endSec: number,
  profile: Profile,
): number[] {
  const N = segments.length
  if (N === 0) return []
  if (N === 1) return [(startSec + endSec) / 2]

  const totalKm = segments.reduce((s, v) => s + v, 0)
  const cumKm: number[] = []
  let acc = 0
  for (const seg of segments) {
    cumKm.push(acc + seg / 2)  // 구간 중심 누적 거리
    acc += seg
  }
  const t = cumKm.map((c) => c / totalKm)  // 0~1

  if (profile === 'linear') {
    return t.map((x) => startSec + (endSec - startSec) * x)
  }
  if (profile === 'back-loaded') {
    // 처음 70%는 startSec 유지, 70~100% 구간에서 endSec까지 선형 가속
    return t.map((x) => {
      if (x <= 0.7) return startSec
      const u = (x - 0.7) / 0.3
      return startSec + (endSec - startSec) * u
    })
  }
  if (profile === 'sprint-finish') {
    // 처음 80%는 startSec, 마지막 20%만 빠르게
    return t.map((x) => {
      if (x <= 0.8) return startSec
      const u = (x - 0.8) / 0.2
      return startSec + (endSec - startSec) * u
    })
  }
  // race-pace-ladder: 4구간 고정 — 사용자 입력 startSec=E, endSec=10K
  // 4구간 미만이면 균등 fallback
  if (N >= 4) {
    // E=startSec, R10=endSec, 중간 M·HM 보간 (E~R10 사이를 35%·65% 위치)
    const m = startSec + (endSec - startSec) * 0.35
    const hm = startSec + (endSec - startSec) * 0.65
    const ladder = [startSec, m, hm, endSec]
    if (N === 4) return ladder
    // N>4면 ladder 보간 (균등 보간)
    return t.map((x) => {
      const idx = x * 3  // 0~3 사이
      const lo = Math.floor(idx)
      const hi = Math.min(3, lo + 1)
      const frac = idx - lo
      return ladder[lo] * (1 - frac) + ladder[hi] * frac
    })
  }
  // fallback linear
  return t.map((x) => startSec + (endSec - startSec) * x)
}

// ── 강도 분류 (페이스를 VDOT 비교) ────
/**
 * 사용자 VDOT 기준으로 페이스를 E/M/T/I/R로 분류.
 * VDOT 미입력 시 추정 불가 → undefined
 */
export function classifyIntensity(paceSecPerKm: number, vdot: number | null): Intensity | null {
  if (!vdot || vdot <= 0) return null
  // 각 강도의 페이스(초/km) 계산
  const e = paceFromVdot(vdot, INTENSITY_LABEL.E.pct)
  const m = paceFromVdot(vdot, INTENSITY_LABEL.M.pct)
  const t = paceFromVdot(vdot, INTENSITY_LABEL.T.pct)
  const i = paceFromVdot(vdot, INTENSITY_LABEL.I.pct)
  const r = paceFromVdot(vdot, INTENSITY_LABEL.R.pct)
  // 페이스가 빠를수록 (sec/km 작을수록) 강도 ↑
  const midEM = (e + m) / 2
  const midMT = (m + t) / 2
  const midTI = (t + i) / 2
  const midIR = (i + r) / 2
  if (paceSecPerKm > midEM) return 'E'
  if (paceSecPerKm > midMT) return 'M'
  if (paceSecPerKm > midTI) return 'T'
  if (paceSecPerKm > midIR) return 'I'
  return 'R'
}

// ── 메인 계산 ────────────────────────
export interface BuildupSegment {
  index: number
  km: number
  paceSec: number       // 초/km
  segTime: number       // 구간 시간(초)
  cumTime: number       // 누적 시간(초)
  intensity: Intensity | null
}
export interface BuildupResult {
  segments: BuildupSegment[]
  totalKm: number
  totalSec: number
  avgPaceSec: number
}

export function calcBuildup(
  segments: number[],
  startSec: number,
  endSec: number,
  profile: Profile,
  vdot: number | null = null,
): BuildupResult {
  const paces = paceCurve(segments, startSec, endSec, profile)
  let cum = 0
  const segs: BuildupSegment[] = segments.map((km, i) => {
    const segTime = km * paces[i]
    cum += segTime
    return {
      index: i + 1,
      km,
      paceSec: paces[i],
      segTime,
      cumTime: cum,
      intensity: classifyIntensity(paces[i], vdot),
    }
  })
  const totalKm = segments.reduce((s, v) => s + v, 0)
  const avgPaceSec = totalKm > 0 ? cum / totalKm : 0
  return { segments: segs, totalKm, totalSec: cum, avgPaceSec }
}

// ── 안전성 체크 ──────────────────────
export type SafetyLevel = 'green' | 'yellow' | 'orange' | 'red'

export interface SafetyWarning {
  level: SafetyLevel
  title: string
  message: string
}

export function safetyCheck(
  result: BuildupResult,
  startSec: number,
  endSec: number,
  user5kPaceSec: number | null,  // 사용자 5K 페이스 (선택)
  vdot: number | null,
): SafetyWarning[] {
  const warnings: SafetyWarning[] = []

  // 1. 페이스 격차
  const diff = startSec - endSec  // 양수: 가속
  if (diff > 120) {
    warnings.push({ level: 'orange', title: '페이스 격차 큼',
      message: `시작·끝 차이 ${Math.round(diff)}초/km — 적응이 어려울 수 있음. 90초/km 이내 권장.` })
  } else if (diff < 30 && diff > 0) {
    warnings.push({ level: 'green', title: '가벼운 빌드업',
      message: '격차 작음 — 회복 빌드업·LSD 마무리 자극에 적합.' })
  } else if (diff <= 0) {
    warnings.push({ level: 'red', title: '빌드업 X',
      message: '시작 페이스가 끝 페이스보다 빠르거나 같음. 빌드업은 점진 가속이 핵심.' })
  }

  // 2. 끝 페이스 vs 5K 페이스
  if (user5kPaceSec && user5kPaceSec > 0) {
    if (endSec < user5kPaceSec - 5) {
      warnings.push({ level: 'red', title: '인터벌 영역',
        message: `끝 페이스(${fmtPace(endSec)})가 5K 페이스(${fmtPace(user5kPaceSec)})보다 빠름 — 인터벌 훈련 계산기 권장.` })
    } else if (Math.abs(endSec - user5kPaceSec) < 10) {
      warnings.push({ level: 'orange', title: '매우 강한 빌드업',
        message: `끝 페이스가 5K 레이스 페이스 수준 — 충분한 워밍업·회복 필수.` })
    }
  }

  // 3. 고강도 구간 비율 (T 이상)
  if (vdot && vdot > 0) {
    const highKm = result.segments
      .filter((s) => s.intensity === 'T' || s.intensity === 'I' || s.intensity === 'R')
      .reduce((sum, s) => sum + s.km, 0)
    const ratio = result.totalKm > 0 ? highKm / result.totalKm : 0
    if (ratio > 0.5) {
      warnings.push({ level: 'red', title: '고강도 비율 과다',
        message: `T 이상 구간이 ${(ratio * 100).toFixed(0)}% — 인터벌 영역. 마지막 30% 이내 권장.` })
    } else if (ratio > 0.35) {
      warnings.push({ level: 'orange', title: '초보자 주의',
        message: `T 이상 구간이 ${(ratio * 100).toFixed(0)}% — 초보자는 마지막 20~30%만 권장.` })
    }
  }

  // 4. 마지막 구간 + 누적 피로
  const lastSeg = result.segments[result.segments.length - 1]
  if (lastSeg && lastSeg.km >= 5 && (lastSeg.intensity === 'I' || lastSeg.intensity === 'R')) {
    warnings.push({ level: 'orange', title: '누적 피로 +20% 효과',
      message: `마지막 구간 ${lastSeg.km.toFixed(1)}km @ ${fmtPace(lastSeg.paceSec)} — 누적 피로로 체감 강도 ↑. 페이스 유지 어려움 고려.` })
  }

  // 5. 비현실적 페이스 (마라톤 페이스보다 빠른 구간이 5km+)
  if (vdot && vdot > 0) {
    const mPace = paceFromVdot(vdot, INTENSITY_LABEL.M.pct)
    const fastKm = result.segments
      .filter((s) => s.paceSec < mPace - 10)
      .reduce((sum, s) => sum + s.km, 0)
    if (fastKm >= 8 && result.totalKm >= 15) {
      warnings.push({ level: 'red', title: '장거리 + 빠른 페이스',
        message: `M 페이스보다 빠른 구간이 ${fastKm.toFixed(1)}km — 장거리에서 무리 가능.` })
    }
  }

  if (warnings.length === 0) {
    warnings.push({ level: 'green', title: '균형 잡힌 빌드업',
      message: '체크 항목 모두 적정 범위. 컨디션 점검 후 진행.' })
  }

  return warnings
}

// ── 프리셋 ────────────────────────────
export interface Preset {
  id: string
  name: string
  category: '회복' | '평일' | '10K' | '하프' | '풀' | '스피드'
  totalKm: number
  profile: Profile
  splitMode: SplitMode
  /** 시작 페이스 — VDOT 기반 (E + offset) 또는 직접 */
  startFromE?: number    // E 페이스에 더할 초
  endFromIntensity?: 'E' | 'M' | 'T' | 'I'  // 끝 페이스 강도
  fixedStartPace?: string  // VDOT 미입력 시 폴백
  fixedEndPace?: string
  note: string
  scenario: string
}

export const PRESETS: Preset[] = [
  {
    id: 'recovery-5km',
    name: '🌱 회복 후 5km 가벼운 자극',
    category: '회복',
    totalKm: 5, profile: 'sprint-finish', splitMode: 'equal-5',
    startFromE: 30, endFromIntensity: 'M',
    fixedStartPace: '6:30', fixedEndPace: '5:30',
    note: '마지막 1km만 살짝 자극',
    scenario: '주말 LSD 다음날·휴식일 후 첫 운동',
  },
  {
    id: 'tempo-8km',
    name: '⚡ 평일 8km 자극주',
    category: '평일',
    totalKm: 8, profile: 'back-loaded', splitMode: 'equal-4',
    startFromE: 0, endFromIntensity: 'T',
    fixedStartPace: '6:00', fixedEndPace: '4:50',
    note: '후반 30%만 역치 페이스',
    scenario: '주중 평일 자극주 — 1주 1~2회 권장',
  },
  {
    id: 'standard-10km',
    name: '🎯 10km 대비 표준 빌드업',
    category: '10K',
    totalKm: 10, profile: 'linear', splitMode: 'equal-5',
    startFromE: 30, endFromIntensity: 'T',
    fixedStartPace: '6:00', fixedEndPace: '4:50',
    note: '가장 표준적인 10km 빌드업',
    scenario: '10K 대회 2~3주 전·주말 핵심 운동',
  },
  {
    id: 'half-prep-14km',
    name: '🏃 하프 대비 14km 빌드업',
    category: '하프',
    totalKm: 14, profile: 'race-pace-ladder', splitMode: 'equal-4',
    startFromE: 0, endFromIntensity: 'T',
    fixedStartPace: '6:00', fixedEndPace: '5:00',
    note: 'E → M → HM → 10K 4단계 적응',
    scenario: '하프 대회 4~6주 전 표준',
  },
  {
    id: 'half-prep-16km',
    name: '🏃 하프 대비 16km (M+HM)',
    category: '하프',
    totalKm: 16, profile: 'back-loaded', splitMode: 'equal-4',
    startFromE: 30, endFromIntensity: 'T',
    fixedStartPace: '6:10', fixedEndPace: '5:00',
    note: '후반 30%를 하프 페이스 적응',
    scenario: '하프 대회 2~4주 전 마지막 LSD',
  },
  {
    id: 'marathon-prep-20km',
    name: '💪 풀 대비 20km 빌드업',
    category: '풀',
    totalKm: 20, profile: 'back-loaded', splitMode: 'equal-4',
    startFromE: 30, endFromIntensity: 'M',
    fixedStartPace: '6:30', fixedEndPace: '5:30',
    note: '후반 8km M 페이스 적응',
    scenario: '풀 대회 4~6주 전 LSD',
  },
  {
    id: 'marathon-prep-25km',
    name: '💪 풀 대비 25km 빌드업',
    category: '풀',
    totalKm: 25, profile: 'back-loaded', splitMode: 'equal-5',
    startFromE: 30, endFromIntensity: 'M',
    fixedStartPace: '6:30', fixedEndPace: '5:30',
    note: '후반 10km M 페이스 — 가장 긴 빌드업',
    scenario: '풀 대회 6~8주 전 핵심 LSD',
  },
  {
    id: 'speed-endurance-6km',
    name: '🚀 스피드 지구력 6km',
    category: '스피드',
    totalKm: 6, profile: 'linear', splitMode: 'equal-6',
    startFromE: 0, endFromIntensity: 'I',
    fixedStartPace: '5:30', fixedEndPace: '4:20',
    note: '1km씩 6단계 — V̇O₂max 자극',
    scenario: '시즌 막판·5K 대회 직전',
  },
  {
    id: 'easy-3km',
    name: '🌿 입문자 3km 빌드업',
    category: '회복',
    totalKm: 3, profile: 'linear', splitMode: 'equal-3',
    startFromE: 60, endFromIntensity: 'E',
    fixedStartPace: '7:00', fixedEndPace: '6:00',
    note: '러닝 입문자·복귀 첫 빌드업',
    scenario: '러닝 시작 4~8주차',
  },
  {
    id: 'half-warmup-10km',
    name: '🔥 하프 직전 10km 점화',
    category: '하프',
    totalKm: 10, profile: 'sprint-finish', splitMode: 'equal-5',
    startFromE: 0, endFromIntensity: 'T',
    fixedStartPace: '5:50', fixedEndPace: '4:50',
    note: '대회 5~7일 전 마지막 자극',
    scenario: '하프 대회 1주 전 최종 자극',
  },
  {
    id: 'mar-warmup-12km',
    name: '🔥 풀 직전 12km 점검',
    category: '풀',
    totalKm: 12, profile: 'race-pace-ladder', splitMode: 'equal-4',
    startFromE: 30, endFromIntensity: 'T',
    fixedStartPace: '6:00', fixedEndPace: '5:00',
    note: '대회 1~2주 전 최종 페이스 점검',
    scenario: '풀 대회 1~2주 전 자신감 빌드업',
  },
  {
    id: 'recovery-after-race',
    name: '🌳 대회 후 회복 6km',
    category: '회복',
    totalKm: 6, profile: 'sprint-finish', splitMode: 'equal-3',
    startFromE: 60, endFromIntensity: 'E',
    fixedStartPace: '7:00', fixedEndPace: '6:00',
    note: '대회 3~5일 후 첫 자극',
    scenario: '하프·풀 대회 후 회복기 마무리',
  },
]

// ── localStorage 루틴 ────────────────────
export interface BuildupRoutine {
  id: string
  name: string
  totalKm: number
  startPace: string  // mm:ss
  endPace: string
  profile: Profile
  splitMode: SplitMode
  warmupKm?: number
  cooldownKm?: number
  notes?: string
  createdAt: string
  lastUsed?: string
}

export const STORAGE_KEY = 'youtil:buildup:routines-v1'

export function loadRoutines(): BuildupRoutine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? (JSON.parse(raw) as BuildupRoutine[]) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
export function saveRoutines(routines: BuildupRoutine[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines))
  } catch { /* quota */ }
}
export function routinesToCSV(routines: BuildupRoutine[]): string {
  const head = 'name,totalKm,startPace,endPace,profile,splitMode,notes,createdAt,lastUsed'
  const lines = routines.map((r) => [
    `"${r.name.replace(/"/g, '""')}"`,
    r.totalKm,
    r.startPace,
    r.endPace,
    r.profile,
    r.splitMode,
    `"${(r.notes ?? '').replace(/"/g, '""')}"`,
    r.createdAt,
    r.lastUsed ?? '',
  ].join(',')).join('\n')
  return [head, lines].join('\n')
}

// ── VDOT helper export ─────────────────
export { vdotFromRace, paceFromVdot }

// ── 거리·시간 공통 ─────────────────────
export const DIST_PRESETS_KM = [3, 5, 8, 10, 12, 15, 18, 20, 25, 30]
