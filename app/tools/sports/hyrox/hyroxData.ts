/* ──────────────────────────────────────────────────────
   sports/hyrox/hyroxData.ts
   하이록스(HYROX) 완주 예측 · 목표 역산 · 부문별 중량 레퍼런스
   ⚠️ 스테이션 예상 시간은 개인 편차가 매우 큽니다. 기본값은 참고 추정이며 직접 수정 가능.
   ────────────────────────────────────────────────────── */

export type Level = 'elite' | 'advanced' | 'intermediate' | 'beginner'
export type Division = 'open' | 'pro'
export type Gender = 'm' | 'f'

export const LEVELS: { id: Level; label: string }[] = [
  { id: 'beginner',     label: '입문' },
  { id: 'intermediate', label: '중급' },
  { id: 'advanced',     label: '상급' },
  { id: 'elite',        label: '엘리트' },
]

// 8개 스테이션 (대회 진행 순서) — 매 스테이션 앞에 1km 런
export interface Station {
  id: string
  name: string      // 한글
  nameEn: string
  spec: string      // 규격(거리/횟수)
}

export const STATIONS: Station[] = [
  { id: 'ski',     name: '스키에르그',       nameEn: 'SkiErg',            spec: '1,000m' },
  { id: 'sledpush',name: '썰매 밀기',         nameEn: 'Sled Push',         spec: '50m' },
  { id: 'sledpull',name: '썰매 끌기',         nameEn: 'Sled Pull',         spec: '50m' },
  { id: 'burpee',  name: '버피 브로드 점프',  nameEn: 'Burpee Broad Jump', spec: '80m' },
  { id: 'row',     name: '로잉',             nameEn: 'Rowing',            spec: '1,000m' },
  { id: 'farmers', name: '파머스 캐리',       nameEn: 'Farmers Carry',     spec: '200m' },
  { id: 'lunge',   name: '샌드백 런지',       nameEn: 'Sandbag Lunges',    spec: '100m' },
  { id: 'wallball',name: '월 볼',            nameEn: 'Wall Balls',        spec: '100/75회' },
]

export const RUN_COUNT = 8
export const RUN_DISTANCE_M = 1000

// 레벨별 기본 페이스(초/km) + 스테이션 예상 시간(초) + 록스존(전환) 총합(초)
export interface LevelPreset {
  runPaceSec: number       // 1km당 초
  stations: Record<string, number>
  roxzoneSec: number       // 8회 전환 총합
}

export const LEVEL_PRESETS: Record<Level, LevelPreset> = {
  elite: {
    runPaceSec: 250, roxzoneSec: 240,
    stations: { ski: 210, sledpush: 120, sledpull: 130, burpee: 200, row: 215, farmers: 75, lunge: 180, wallball: 220 },
  },
  advanced: {
    runPaceSec: 290, roxzoneSec: 330,
    stations: { ski: 240, sledpush: 160, sledpull: 170, burpee: 250, row: 240, farmers: 95, lunge: 230, wallball: 300 },
  },
  intermediate: {
    runPaceSec: 330, roxzoneSec: 420,
    stations: { ski: 270, sledpush: 210, sledpull: 220, burpee: 320, row: 270, farmers: 120, lunge: 300, wallball: 400 },
  },
  beginner: {
    runPaceSec: 390, roxzoneSec: 540,
    stations: { ski: 300, sledpush: 280, sledpull: 290, burpee: 420, row: 300, farmers: 150, lunge: 400, wallball: 540 },
  },
}

// ─── 부문별 중량·규격 ───
export interface StationSpec {
  station: string         // station name(ko)
  open_m: string
  open_f: string
  pro_m: string
  pro_f: string
}

export const WEIGHT_TABLE: StationSpec[] = [
  { station: '썰매 밀기 (Sled Push)',   open_m: '152kg', open_f: '102kg', pro_m: '202kg', pro_f: '152kg' },
  { station: '썰매 끌기 (Sled Pull)',   open_m: '103kg', open_f: '78kg',  pro_m: '153kg', pro_f: '103kg' },
  { station: '파머스 캐리 (Farmers)',   open_m: '2×24kg', open_f: '2×16kg', pro_m: '2×32kg', pro_f: '2×24kg' },
  { station: '샌드백 런지 (Lunges)',    open_m: '20kg',  open_f: '10kg',  pro_m: '30kg',  pro_f: '20kg' },
  { station: '월 볼 (Wall Balls)',     open_m: '6kg·100회', open_f: '4kg·75회', pro_m: '9kg·100회', pro_f: '6kg·100회' },
]

// 무게 무관 종목(거리/횟수 동일)
export const FIXED_SPECS: { station: string; spec: string }[] = [
  { station: '스키에르그 (SkiErg)', spec: '1,000m' },
  { station: '로잉 (Rowing)',      spec: '1,000m' },
  { station: '버피 브로드 점프',    spec: '80m' },
  { station: '런 (Run)',           spec: '1km × 8회 = 8km' },
]

export const DIVISION_NOTE = '월 볼 횟수: 남자·여자 Pro 100회, 여자 Open 75회(2025/26 시즌 조정). 목표 높이: 남자 3.0m · 여자 2.7m. 썰매 중량은 썰매 자체 무게 포함값입니다. Doubles(2인)는 작업을 분담, Relay(4인)는 4명이 코스를 나눠 진행합니다.'

// ─── 계산 ───
export interface PredictInput {
  runPaceSec: number
  stationSec: Record<string, number>
  roxzoneSec: number
}

export interface PredictResult {
  runTotalSec: number        // 8km 런 합
  stationTotalSec: number    // 8 스테이션 합
  roxzoneSec: number
  totalSec: number
  runShare: number           // 런 비중 %
  stationShare: number       // 스테이션 비중 %
  roxShare: number
}

export function predict(inp: PredictInput): PredictResult {
  const runTotalSec = inp.runPaceSec * RUN_COUNT
  const stationTotalSec = STATIONS.reduce((s, st) => s + (inp.stationSec[st.id] || 0), 0)
  const totalSec = runTotalSec + stationTotalSec + inp.roxzoneSec
  const safe = totalSec > 0 ? totalSec : 1
  return {
    runTotalSec, stationTotalSec, roxzoneSec: inp.roxzoneSec, totalSec,
    runShare: (runTotalSec / safe) * 100,
    stationShare: (stationTotalSec / safe) * 100,
    roxShare: (inp.roxzoneSec / safe) * 100,
  }
}

/** 목표 완주 시간(초) → 필요한 km당 런 페이스(초). 스테이션+록스존 시간 가정 차감 */
export function requiredPace(targetSec: number, stationTotalSec: number, roxzoneSec: number): number {
  const runBudget = targetSec - stationTotalSec - roxzoneSec
  if (runBudget <= 0) return 0
  return runBudget / RUN_COUNT
}

// ─── 포맷 ───
export function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '-:--'
  const s = Math.round(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(ss)}`
  return `${m}:${pad(ss)}`
}

/** 초/km → "m:ss" 페이스 */
export function fmtPace(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return '-:--'
  const s = Math.round(sec)
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}
