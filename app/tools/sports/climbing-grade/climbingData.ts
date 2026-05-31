// ─────────────────────────────────────────────────────────
// 클라이밍 등급 환산 데이터 (표준 환산표 기준 · 근사치)
//  - 등급 변환은 1:1이 아니라 구간이 겹칩니다. 출처에 따라 한 단계 차이날 수 있어요.
//  - 볼더링: V-scale(미국/Hueco) ↔ Font(폰테인블로/유럽)
//  - 루트(리드): YDS(미국) ↔ French(프렌치/스포츠) ↔ UIAA(독일·알파인) — UIAA가 가장 근사적
// ─────────────────────────────────────────────────────────

export interface Band {
  label: string
  color: string
  desc: string
}

/** 0 입문 · 1 초급 · 2 중급 · 3 상급 · 4 고급 · 5 엘리트 */
export const BANDS: Band[] = [
  { label: '입문',   color: '#94A3B8', desc: '클라이밍을 막 시작한 단계. 기본 홀드 잡기와 발 쓰기를 익힙니다.' },
  { label: '초급',   color: '#059669', desc: '기본기를 다지는 단계. 실내 입문~초급 코스를 대부분 완등합니다.' },
  { label: '중급',   color: '#0EA5E9', desc: '꾸준히 다닌 동호인 수준. 다양한 무브와 약간의 파워가 필요합니다.' },
  { label: '상급',   color: '#EA580C', desc: '상위권 동호인. 파워·지구력·정교한 무브가 모두 요구됩니다.' },
  { label: '고급',   color: '#DC2626', desc: '전문적 훈련 단계. 지역 대회 입상권 수준입니다.' },
  { label: '엘리트', color: '#9333EA', desc: '세계 최상위 수준. 극소수만 도달하는 영역입니다.' },
]

export interface BoulderRow { v: string; font: string; band: number }
export interface RouteRow { yds: string; french: string; uiaa: string; band: number }

/** 볼더링 — V등급 기준 (Font는 구간이라 a/a+ 묶어 표기) */
export const BOULDER_ROWS: BoulderRow[] = [
  { v: 'V0',  font: '4',      band: 0 },
  { v: 'V1',  font: '5',      band: 0 },
  { v: 'V2',  font: '5+',     band: 1 },
  { v: 'V3',  font: '6A/6A+', band: 1 },
  { v: 'V4',  font: '6B/6B+', band: 2 },
  { v: 'V5',  font: '6C/6C+', band: 2 },
  { v: 'V6',  font: '7A',     band: 2 },
  { v: 'V7',  font: '7A+',    band: 3 },
  { v: 'V8',  font: '7B/7B+', band: 3 },
  { v: 'V9',  font: '7C',     band: 3 },
  { v: 'V10', font: '7C+',    band: 4 },
  { v: 'V11', font: '8A',     band: 4 },
  { v: 'V12', font: '8A+',    band: 4 },
  { v: 'V13', font: '8B',     band: 5 },
  { v: 'V14', font: '8B+',    band: 5 },
  { v: 'V15', font: '8C',     band: 5 },
  { v: 'V16', font: '8C+',    band: 5 },
  { v: 'V17', font: '9A',     band: 5 },
]

/** 루트(리드) — YDS 기준 (French·UIAA 표준 환산) */
export const ROUTE_ROWS: RouteRow[] = [
  { yds: '5.5',   french: '4b',     uiaa: 'IV+',  band: 0 },
  { yds: '5.6',   french: '4c',     uiaa: 'V-',   band: 0 },
  { yds: '5.7',   french: '5a',     uiaa: 'V',    band: 0 },
  { yds: '5.8',   french: '5b',     uiaa: 'V+',   band: 1 },
  { yds: '5.9',   french: '5c',     uiaa: 'VI-',  band: 1 },
  { yds: '5.10a', french: '6a',     uiaa: 'VI+',  band: 2 },
  { yds: '5.10b', french: '6a+',    uiaa: 'VII-', band: 2 },
  { yds: '5.10c', french: '6b',     uiaa: 'VII',  band: 2 },
  { yds: '5.10d', french: '6b+',    uiaa: 'VII+', band: 2 },
  { yds: '5.11a', french: '6c',     uiaa: 'VII+', band: 3 },
  { yds: '5.11b', french: '6c+',    uiaa: 'VIII-',band: 3 },
  { yds: '5.11c', french: '7a',     uiaa: 'VIII', band: 3 },
  { yds: '5.11d', french: '7a+',    uiaa: 'VIII+',band: 3 },
  { yds: '5.12a', french: '7b',     uiaa: 'IX-',  band: 4 },
  { yds: '5.12b', french: '7b+',    uiaa: 'IX-',  band: 4 },
  { yds: '5.12c', french: '7c',     uiaa: 'IX',   band: 4 },
  { yds: '5.12d', french: '7c+',    uiaa: 'IX+',  band: 4 },
  { yds: '5.13a', french: '7c+/8a', uiaa: 'X-',   band: 5 },
  { yds: '5.13b', french: '8a',     uiaa: 'X-',   band: 5 },
  { yds: '5.13c', french: '8a+',    uiaa: 'X',    band: 5 },
  { yds: '5.13d', french: '8b',     uiaa: 'X+',   band: 5 },
  { yds: '5.14a', french: '8b+',    uiaa: 'X+',   band: 5 },
  { yds: '5.14b', french: '8c',     uiaa: 'XI-',  band: 5 },
  { yds: '5.14c', french: '8c+',    uiaa: 'XI',   band: 5 },
  { yds: '5.14d', french: '9a',     uiaa: 'XI+',  band: 5 },
  { yds: '5.15a', french: '9a+',    uiaa: 'XII-', band: 5 },
  { yds: '5.15b', french: '9b',     uiaa: 'XII',  band: 5 },
  { yds: '5.15c', french: '9b+',    uiaa: 'XII+', band: 5 },
  { yds: '5.15d', french: '9c',     uiaa: 'XIII-',band: 5 },
]

export type Mode = 'boulder' | 'route'

/** 모드별 입력 가능한 체계와 행에서 라벨을 뽑는 키 */
export const SYSTEMS: Record<Mode, { id: string; label: string; key: string }[]> = {
  boulder: [
    { id: 'v',    label: 'V등급',    key: 'v' },
    { id: 'font', label: 'Font(폰)', key: 'font' },
  ],
  route: [
    { id: 'yds',    label: 'YDS',    key: 'yds' },
    { id: 'french', label: 'French', key: 'french' },
    { id: 'uiaa',   label: 'UIAA',   key: 'uiaa' },
  ],
}
