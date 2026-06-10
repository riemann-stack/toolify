// ─────────────────────────────────────────────────────────────
// 차대번호(VIN) 구조 해석 엔진 — ISO 3779 / NHTSA 표준 기반
// "구조 해석"만: 표준 규칙으로 인코딩된 정보(제조국·제조사·연식·체크디지트)
// 사고·주행거리·소유자·이력 조회는 절대 다루지 않음 (개인정보·공식 DB 영역)
// 전부 클라이언트 계산 — API 호출·입력값 전송 없음
// ─────────────────────────────────────────────────────────────

export type VinSection = 'wmi' | 'vds' | 'check' | 'year' | 'plant' | 'serial'

export interface WmiInfo {
  region: string
  country?: string   // 제조사 매칭 시 정확한 제조국, 미매칭 시 first-char 추정
  maker?: string     // 제조사 매칭 시
  matched?: string   // 매칭된 WMI 접두 (예: 'KMH')
  estimated?: boolean // country가 first-char 추정치인지
}
export interface CheckInfo {
  computable: boolean // I·O·Q 포함·길이 부족 시 false
  expected: string    // 계산된 체크 디지트
  actual: string      // 9번째 자리 실제 값
  valid: boolean
}
export interface YearInfo {
  code: string
  years: number[] | null // [1차주기, 2차주기] 또는 null
}
export interface VinResult {
  clean: string
  length: number
  hasIOQ: boolean
  invalidChars: string[]
  valid17: boolean
  sections: Record<VinSection, string>
  wmi: WmiInfo
  check: CheckInfo
  year: YearInfo
  plant: string
  serial: string
}

// ── 허용 문자 (I·O·Q 제외 — 1·0과 혼동 방지) ──────────────
export const VIN_INVALID_LETTERS = ['I', 'O', 'Q']

/** 대문자화 + 영숫자만 남김 (공백·하이픈 등 제거). I·O·Q는 남겨서 경고에 활용 */
export function sanitizeVin(raw: string): string {
  return (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17)
}

// ── 1) 제조 지역 (first char, ISO 3780 범위) ───────────────
export function regionOf(c: string): string {
  if (/[1-5]/.test(c)) return '북미'
  if (/[67]/.test(c)) return '오세아니아'
  if (/[890]/.test(c)) return '남미'
  if (/[A-H]/.test(c)) return '아프리카'
  if (/[J-R]/.test(c)) return '아시아'
  if (/[S-Z]/.test(c)) return '유럽'
  return '알 수 없음'
}

// first char → 주요 제조국 추정 (제조사 미매칭 시 보조 힌트, '등'으로 비단정)
const COUNTRY_HINT: Record<string, string> = {
  J: '일본', K: '한국', L: '중국', M: '인도·태국 등', N: '터키 등',
  P: '필리핀·말레이시아 등', R: '대만·베트남 등',
  S: '영국·독일 등', T: '스위스·체코 등', V: '프랑스·스페인 등',
  W: '독일', X: '러시아·동유럽 등', Y: '스웨덴·핀란드 등', Z: '이탈리아 등',
  '1': '미국', '4': '미국', '5': '미국', '2': '캐나다', '3': '멕시코',
  '6': '호주', '7': '뉴질랜드', '8': '남미', '9': '브라질 등',
}

// ── 2) WMI 제조사 사전 (정확도 우선 — 한국 상세 + 글로벌 주요) ──
// 출처: ISO 3780 / SAE WMI 공개 목록(Wikibooks WMI) 교차 확인.
// 2자리 항목은 폴백(브랜드만), 3자리 항목은 차종 힌트 포함. 매칭은 3→2→1 최장 접두 우선.
export interface WmiEntry { prefix: string; country: string; maker: string }
export const WMI_DATA: WmiEntry[] = [
  // ── 한국 (제조국 정확) ──
  { prefix: 'KMH', country: '한국', maker: '현대자동차 (승용)' },
  { prefix: 'KM8', country: '한국', maker: '현대자동차 (SUV·MPV)' },
  { prefix: 'KMC', country: '한국', maker: '현대자동차 (상용차)' },
  { prefix: 'KMT', country: '한국', maker: '제네시스 (승용)' },
  { prefix: 'KMU', country: '한국', maker: '제네시스 (SUV)' },
  { prefix: 'KM',  country: '한국', maker: '현대자동차' },
  { prefix: 'KNA', country: '한국', maker: '기아 (승용)' },
  { prefix: 'KNC', country: '한국', maker: '기아 (상용)' },
  { prefix: 'KND', country: '한국', maker: '기아 (SUV·MPV)' },
  { prefix: 'KNM', country: '한국', maker: '르노코리아 (구 르노삼성)' },
  { prefix: 'KN',  country: '한국', maker: '기아' },
  { prefix: 'KPA', country: '한국', maker: 'KG모빌리티(쌍용) (픽업)' },
  { prefix: 'KPB', country: '한국', maker: 'KG모빌리티(쌍용) (승용)' },
  { prefix: 'KPT', country: '한국', maker: 'KG모빌리티(쌍용) (SUV·MPV)' },
  { prefix: 'KP',  country: '한국', maker: 'KG모빌리티(쌍용)' },
  { prefix: 'KL1', country: '한국', maker: '한국GM 쉐보레 (승용)' },
  { prefix: 'KLY', country: '한국', maker: '한국GM 쉐보레 (창원공장)' },
  { prefix: 'KL',  country: '한국', maker: '한국GM (쉐보레)' },
  // ── 미국 생산 한국 브랜드 (제조국=미국) ──
  { prefix: '5NP', country: '미국', maker: '현대자동차 (앨라배마공장 승용)' },
  { prefix: '5NM', country: '미국', maker: '현대자동차 (앨라배마공장 SUV)' },
  { prefix: '5XY', country: '미국', maker: '기아 (조지아공장 SUV)' },
  { prefix: '5XX', country: '미국', maker: '기아 (조지아공장 승용)' },
  // ── 일본 ──
  { prefix: 'JHM', country: '일본', maker: '혼다' },
  { prefix: 'JH4', country: '일본', maker: '아쿠라' },
  { prefix: 'JH',  country: '일본', maker: '혼다' },
  { prefix: 'JN1', country: '일본', maker: '닛산 (승용)' },
  { prefix: 'JN8', country: '일본', maker: '닛산 (SUV·MPV)' },
  { prefix: 'JN',  country: '일본', maker: '닛산·인피니티' },
  { prefix: 'JTH', country: '일본', maker: '렉서스' },
  { prefix: 'JTJ', country: '일본', maker: '렉서스' },
  { prefix: 'JT',  country: '일본', maker: '토요타' },
  { prefix: 'JMB', country: '일본', maker: '미쓰비시' },
  { prefix: 'JA3', country: '일본', maker: '미쓰비시 (북미향)' },
  { prefix: 'JA4', country: '일본', maker: '미쓰비시 (북미향)' },
  { prefix: 'JM',  country: '일본', maker: '마쓰다' },
  { prefix: 'JF1', country: '일본', maker: '스바루 (승용)' },
  { prefix: 'JF2', country: '일본', maker: '스바루 (SUV)' },
  { prefix: 'JF',  country: '일본', maker: '스바루' },
  { prefix: 'JS',  country: '일본', maker: '스즈키' },
  // ── 독일 ──
  { prefix: 'WBA', country: '독일', maker: 'BMW (승용)' },
  { prefix: 'WBX', country: '독일', maker: 'BMW (SUV)' },
  { prefix: 'WBY', country: '독일', maker: 'BMW (i 전기)' },
  { prefix: 'WBS', country: '독일', maker: 'BMW M' },
  { prefix: 'WB',  country: '독일', maker: 'BMW' },
  { prefix: 'WMW', country: '독일', maker: 'MINI' },
  { prefix: 'WDB', country: '독일', maker: '메르세데스-벤츠' },
  { prefix: 'WDC', country: '독일', maker: '메르세데스-벤츠 (SUV)' },
  { prefix: 'WDD', country: '독일', maker: '메르세데스-벤츠 (승용)' },
  { prefix: 'W1K', country: '독일', maker: '메르세데스-벤츠 (승용·신형)' },
  { prefix: 'W1N', country: '독일', maker: '메르세데스-벤츠 (SUV·신형)' },
  { prefix: 'WVW', country: '독일', maker: '폭스바겐 (승용)' },
  { prefix: 'WVG', country: '독일', maker: '폭스바겐 (SUV)' },
  { prefix: 'WV',  country: '독일', maker: '폭스바겐' },
  { prefix: 'WAU', country: '독일', maker: '아우디 (승용)' },
  { prefix: 'WA1', country: '독일', maker: '아우디 (SUV)' },
  { prefix: 'WUA', country: '독일', maker: '아우디 스포츠(RS)' },
  { prefix: 'WP0', country: '독일', maker: '포르쉐 (승용)' },
  { prefix: 'WP1', country: '독일', maker: '포르쉐 (SUV)' },
  // ── 미국 ──
  { prefix: '1G1', country: '미국', maker: '쉐보레 (승용)' },
  { prefix: '1GC', country: '미국', maker: '쉐보레 (트럭)' },
  { prefix: '1GN', country: '미국', maker: '쉐보레 (SUV)' },
  { prefix: '1G6', country: '미국', maker: '캐딜락' },
  { prefix: '1G4', country: '미국', maker: '뷰익' },
  { prefix: '1G',  country: '미국', maker: 'GM (제너럴 모터스)' },
  { prefix: '1FA', country: '미국', maker: '포드 (승용)' },
  { prefix: '1FM', country: '미국', maker: '포드 (SUV)' },
  { prefix: '1FT', country: '미국', maker: '포드 (트럭)' },
  { prefix: '1F',  country: '미국', maker: '포드' },
  { prefix: '1C4', country: '미국', maker: '지프·크라이슬러 (SUV)' },
  { prefix: '1C3', country: '미국', maker: '크라이슬러' },
  { prefix: '1C6', country: '미국', maker: '램(RAM) 트럭' },
  { prefix: '1B3', country: '미국', maker: '닷지' },
  { prefix: '1J4', country: '미국', maker: '지프' },
  { prefix: '5YJ', country: '미국', maker: '테슬라 (프리몬트공장)' },
  { prefix: '7SA', country: '미국', maker: '테슬라 (텍사스공장)' },
  { prefix: '4T1', country: '미국', maker: '토요타 (미국생산)' },
  { prefix: '4S4', country: '미국', maker: '스바루 (미국생산)' },
  { prefix: '5FN', country: '미국', maker: '혼다 (SUV·미국생산)' },
  // ── 중국 ──
  { prefix: 'LRW', country: '중국', maker: '테슬라 (상하이공장)' },
  { prefix: 'LC0', country: '중국', maker: 'BYD' },
  { prefix: 'LFV', country: '중국', maker: 'FAW-폭스바겐' },
  { prefix: 'LSV', country: '중국', maker: '상하이폭스바겐(SAIC-VW)' },
  // ── 영국 ──
  { prefix: 'SAL', country: '영국', maker: '랜드로버' },
  { prefix: 'SAJ', country: '영국', maker: '재규어' },
  { prefix: 'SCB', country: '영국', maker: '벤틀리' },
  { prefix: 'SCF', country: '영국', maker: '애스턴마틴' },
  { prefix: 'SCC', country: '영국', maker: '로터스' },
  // ── 프랑스 ──
  { prefix: 'VF1', country: '프랑스', maker: '르노' },
  { prefix: 'VF3', country: '프랑스', maker: '푸조' },
  { prefix: 'VF7', country: '프랑스', maker: '시트로엥' },
  // ── 이탈리아 ──
  { prefix: 'ZFF', country: '이탈리아', maker: '페라리' },
  { prefix: 'ZFA', country: '이탈리아', maker: '피아트' },
  { prefix: 'ZAR', country: '이탈리아', maker: '알파로메오' },
  { prefix: 'ZHW', country: '이탈리아', maker: '람보르기니' },
  { prefix: 'ZAM', country: '이탈리아', maker: '마세라티' },
  // ── 스웨덴 ──
  { prefix: 'YV1', country: '스웨덴', maker: '볼보 (승용)' },
  { prefix: 'YV4', country: '스웨덴', maker: '볼보 (SUV)' },
  // ── 기타 유럽 ──
  { prefix: 'TMB', country: '체코', maker: '스코다' },
  { prefix: 'VSS', country: '스페인', maker: '세아트' },
]

const WMI_MAP: Map<string, WmiEntry> = new Map(WMI_DATA.map((e) => [e.prefix, e]))

/** WMI(1~3자리) → 제조국·제조사. 3→2→1 최장 접두 우선, 미매칭 시 지역+국가힌트 */
export function lookupWmi(clean: string): WmiInfo {
  const first = clean[0] || ''
  const region = first ? regionOf(first) : '알 수 없음'
  for (const len of [3, 2, 1]) {
    if (clean.length >= len) {
      const hit = WMI_MAP.get(clean.slice(0, len))
      if (hit) return { region, country: hit.country, maker: hit.maker, matched: hit.prefix }
    }
  }
  const hint = COUNTRY_HINT[first]
  return { region, country: hint, estimated: !!hint }
}

// ── 3) 체크 디지트 (9번째 자리) — NHTSA 북미 표준 ──────────
const TRANSLIT: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
}
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

/** 17자리 → 기대 체크 디지트·일치 여부. I·O·Q 등 변환 불가 문자/길이 부족이면 computable=false */
export function calcCheckDigit(clean: string): CheckInfo {
  const actual = clean[8] || ''
  if (clean.length !== 17) return { computable: false, expected: '', actual, valid: false }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const v = TRANSLIT[clean[i]]
    if (v === undefined) return { computable: false, expected: '', actual, valid: false }
    sum += v * WEIGHTS[i]
  }
  const r = sum % 11
  const expected = r === 10 ? 'X' : String(r)
  return { computable: true, expected, actual, valid: expected === actual }
}

// ── 4) 모델 연식 (10번째 자리) — 30년 주기 ─────────────────
// I·O·Q·U·Z·0 미사용. A=1980/2010 … T=1996/2026 … 9=2009/2039
const YEAR_LETTERS = 'ABCDEFGHJKLMNPRSTVWXY'.split('') // 21자 (1980~2000 / 2010~2030)
export interface YearRow { code: string; y1: number; y2: number }
export const YEAR_TABLE: YearRow[] = [
  ...YEAR_LETTERS.map((c, i) => ({ code: c, y1: 1980 + i, y2: 2010 + i })),
  ...['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((c, i) => ({ code: c, y1: 2001 + i, y2: 2031 + i })),
]
const YEAR_MAP: Map<string, YearRow> = new Map(YEAR_TABLE.map((r) => [r.code, r]))

/** 연식 코드 → [1차주기, 2차주기] 또는 null */
export function yearFromCode(code: string): number[] | null {
  const r = YEAR_MAP.get(code)
  return r ? [r.y1, r.y2] : null
}
/** 연도 → 연식 코드 또는 null (1980~2039) */
export function codeFromYear(year: number): string | null {
  const r = YEAR_TABLE.find((row) => row.y1 === year || row.y2 === year)
  return r ? r.code : null
}

// ── 종합 해석 ──────────────────────────────────────────────
export function decodeVin(raw: string): VinResult {
  const clean = sanitizeVin(raw)
  const length = clean.length
  const invalidChars = Array.from(new Set(clean.split('').filter((c) => VIN_INVALID_LETTERS.includes(c))))
  const hasIOQ = invalidChars.length > 0
  const valid17 = length === 17 && !hasIOQ

  const sections: Record<VinSection, string> = {
    wmi: clean.slice(0, 3),
    vds: clean.slice(3, 8),
    check: clean.slice(8, 9),
    year: clean.slice(9, 10),
    plant: clean.slice(10, 11),
    serial: clean.slice(11, 17),
  }

  return {
    clean,
    length,
    hasIOQ,
    invalidChars,
    valid17,
    sections,
    wmi: lookupWmi(clean),
    check: calcCheckDigit(clean),
    year: { code: sections.year, years: yearFromCode(sections.year) },
    plant: sections.plant,
    serial: sections.serial,
  }
}

// ── 제조사 사전(탭) — 국가별 그룹 (한국 먼저) ──────────────
export const DIRECTORY_COUNTRY_ORDER = ['한국', '미국', '일본', '독일', '중국', '영국', '프랑스', '이탈리아', '스웨덴', '체코', '스페인']
export function wmiByCountry(): { country: string; entries: WmiEntry[] }[] {
  const groups = new Map<string, WmiEntry[]>()
  for (const e of WMI_DATA) {
    const arr = groups.get(e.country) || []
    arr.push(e)
    groups.set(e.country, arr)
  }
  const ordered = DIRECTORY_COUNTRY_ORDER.filter((c) => groups.has(c))
  for (const c of groups.keys()) if (!ordered.includes(c)) ordered.push(c)
  return ordered.map((country) => ({ country, entries: groups.get(country) || [] }))
}
