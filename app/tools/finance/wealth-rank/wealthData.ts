// 자산 순위 계산기 — 데이터 & 계산 로직
// 출처: 통계청·한국은행·금융감독원 「2025년 가계금융복지조사」(기준일 2025.3.31, 2025.12 공표)
//       상위 구간 컷은 2024년 조사 보도치(상위 1% 33억 등) 기반.
//       세계 기준은 UBS Global Wealth Report 2025(2024년 말 기준, 성인 1인당).

export interface Point { p: number; v: number } // p: 하위 누적 백분율(%), v: 순자산

// ──────────────────────────────────────────────────────────
// 전국 순자산 분포 (가구 기준, 단위: 만원)
//  ● 실측 앵커:
//    - 중앙값 2억 3,860만(2025 조사 표 1-2)        → p50  = 23,860
//    - 57.0% 가 순자산 3억(30,000) 미만           → p57  = 30,000
//    - 4분위 중앙값 ≈ 70th pct = 4.6억             → p70  = 46,000
//    - 순자산 10억(100,000) 이상 = 상위 11.8%       → p88.2= 100,000
//    - 5분위 중앙값 ≈ 90th pct = 11억               → p90  = 110,000
//    - 상위 5% 컷 15.2억 / 1% 33억 / 0.5% 44.2억 / 0.1% 86.7억
//  ● 그 외 하위~중간 구간은 평균 4.71억·지니 0.625에 맞춘 보간 추정.
// ──────────────────────────────────────────────────────────
export const NATIONAL: Point[] = [
  { p: 0, v: -3000 },
  { p: 10, v: 2000 },
  { p: 20, v: 5000 },
  { p: 30, v: 9500 },
  { p: 40, v: 16000 },
  { p: 50, v: 23860 }, // 실측: 중앙값 2억 3,860만
  { p: 57, v: 30000 }, // 실측: 57%가 3억 미만
  { p: 60, v: 33500 },
  { p: 70, v: 46000 }, // 실측: 4분위 중앙값
  { p: 80, v: 66000 },
  { p: 88.2, v: 100000 }, // 실측: 10억 이상 = 11.8%
  { p: 90, v: 110000 }, // 실측: 5분위 중앙값
  { p: 95, v: 152000 }, // 실측: 상위 5% 컷
  { p: 99, v: 330000 }, // 실측: 상위 1% 컷
  { p: 99.5, v: 442000 }, // 실측: 상위 0.5% 컷
  { p: 99.9, v: 867000 }, // 실측: 상위 0.1% 컷
  { p: 100, v: 2000000 },
]

export const NATIONAL_MEAN = 47144 // 만원 (2025 평균 순자산 4억 7,144만)
export const NATIONAL_MEDIAN = 23860 // 만원 (2025 조사 실측 중앙값 2억 3,860만)

// ──────────────────────────────────────────────────────────
// 세계 순자산 분포 (성인 1인당, 단위: USD) — UBS GWR 2025
//   피라미드: <$10k 40.7% / $10k~$100k 41.3% / $100k~$1M 16.4% / >$1M 1.6%
// ──────────────────────────────────────────────────────────
export const GLOBAL: Point[] = [
  { p: 0, v: -3000 },
  { p: 40.7, v: 10000 }, // <$10k = 40.7%
  { p: 50, v: 14500 }, // 중앙값(보간)
  { p: 82.0, v: 100000 }, // <$100k = 82.0%
  { p: 98.4, v: 1000000 }, // <$1M = 98.4% (백만장자 1.6%)
  { p: 99.0, v: 1450000 }, // 상위 1%(추정)
  { p: 99.9, v: 6500000 }, // 상위 0.1%(추정)
  { p: 100, v: 100000000 },
]

export const USD_KRW = 1380 // 참고용 고정 환율 (2026년 기준 근사)

// ── 연령대별 평균 순자산 (가구주 기준, 만원) ──
//   50대는 실측(5억 5,161만). 나머지는 연령 프로파일 기반 추정.
export interface Group { id: string; label: string; mean: number; real: boolean }
export const AGE_GROUPS: Group[] = [
  { id: 'u39', label: '39세 이하', mean: 23000, real: false },
  { id: '40s', label: '40대', mean: 44600, real: false },
  { id: '50s', label: '50대', mean: 55161, real: true },
  { id: '60p', label: '60세 이상', mean: 45500, real: false },
]

// ── 시도별 평균 순자산 (가구 기준, 만원) ──
//   서울·세종·경기·제주는 2025 실측. 그 외 13개 시도는
//   전국 평균(4.71억) 대비 상대 수준으로 보정한 추정치.
export const REGIONS: Group[] = [
  { id: 'seoul', label: '서울', mean: 71288, real: true },
  { id: 'sejong', label: '세종', mean: 60648, real: true },
  { id: 'gyeonggi', label: '경기', mean: 56006, real: true },
  { id: 'daejeon', label: '대전', mean: 48500, real: false },
  { id: 'jeju', label: '제주', mean: 48103, real: true },
  { id: 'ulsan', label: '울산', mean: 47500, real: false },
  { id: 'busan', label: '부산', mean: 45500, real: false },
  { id: 'daegu', label: '대구', mean: 45000, real: false },
  { id: 'incheon', label: '인천', mean: 44000, real: false },
  { id: 'gwangju', label: '광주', mean: 42000, real: false },
  { id: 'chungnam', label: '충남', mean: 41000, real: false },
  { id: 'gyeongnam', label: '경남', mean: 40500, real: false },
  { id: 'chungbuk', label: '충북', mean: 39500, real: false },
  { id: 'gangwon', label: '강원', mean: 38500, real: false },
  { id: 'gyeongbuk', label: '경북', mean: 38000, real: false },
  { id: 'jeonnam', label: '전남', mean: 37500, real: false },
  { id: 'jeonbuk', label: '전북', mean: 37000, real: false },
]

// ──────────────────────────────────────────────────────────
// 보간 함수
// ──────────────────────────────────────────────────────────

/** 값 → 하위 누적 백분율(p, 0~100) */
export function percentileFromValue(points: Point[], value: number, logScale = false): number {
  const n = points.length
  if (value <= points[0].v) return points[0].p
  if (value >= points[n - 1].v) return points[n - 1].p
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (value >= a.v && value <= b.v) {
      let t: number
      if (logScale && a.v > 0 && b.v > 0 && value > 0) {
        t = (Math.log(value) - Math.log(a.v)) / (Math.log(b.v) - Math.log(a.v))
      } else {
        t = (value - a.v) / (b.v - a.v)
      }
      return a.p + t * (b.p - a.p)
    }
  }
  return points[n - 1].p
}

/** 하위 누적 백분율(p) → 값 (역함수) */
export function valueFromPercentile(points: Point[], p: number, logScale = false): number {
  const n = points.length
  if (p <= points[0].p) return points[0].v
  if (p >= points[n - 1].p) return points[n - 1].v
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p)
      if (logScale && a.v > 0 && b.v > 0) {
        return Math.exp(Math.log(a.v) + t * (Math.log(b.v) - Math.log(a.v)))
      }
      return a.v + t * (b.v - a.v)
    }
  }
  return points[n - 1].v
}

export type Mode = 'nation' | 'region' | 'age' | 'world'

export interface RankResult {
  topPercent: number // 상위 % (이미 round 처리)
  percentile: number // 백분위(하위 누적 %, 0~100)
  decile: number // n분위 (1~10)
  median: number // 해당 기준 중앙값 (만원)
  top10: number // 상위 10% 컷 (만원)
  top1: number // 상위 1% 컷 (만원)
  toTop10: number // 상위 10%까지 더 필요한 금액 (만원, 음수면 이미 초과)
  toTop1: number // 상위 1%까지 더 필요한 금액 (만원)
  basisLabel: string // "전국 가구" 등
  isEstimate: boolean // 추정 기반 여부
}

/** 만원 단위 순자산 → 순위 결과 */
export function computeRank(mode: Mode, valueManwon: number, groupId?: string): RankResult {
  let p: number
  let median: number
  let top10: number
  let top1: number
  let basisLabel: string
  let isEstimate = false

  const roundP = (x: number) => Math.max(0, Math.min(100, x))

  if (mode === 'world') {
    const usd = (valueManwon * 10000) / USD_KRW
    p = roundP(percentileFromValue(GLOBAL, usd, true))
    median = (valueFromPercentile(GLOBAL, 50, true) * USD_KRW) / 10000
    top10 = (valueFromPercentile(GLOBAL, 90, true) * USD_KRW) / 10000
    top1 = (valueFromPercentile(GLOBAL, 99, true) * USD_KRW) / 10000
    basisLabel = '세계 성인 1인'
    isEstimate = true
  } else if (mode === 'nation') {
    p = roundP(percentileFromValue(NATIONAL, valueManwon))
    median = NATIONAL_MEDIAN
    top10 = valueFromPercentile(NATIONAL, 90)
    top1 = valueFromPercentile(NATIONAL, 99)
    basisLabel = '전국 가구'
  } else {
    // region / age — 전국 분포를 그룹 평균으로 스케일
    const list = mode === 'region' ? REGIONS : AGE_GROUPS
    const g = list.find((x) => x.id === groupId) ?? list[0]
    const k = g.mean / NATIONAL_MEAN
    p = roundP(percentileFromValue(NATIONAL, valueManwon / k))
    median = NATIONAL_MEDIAN * k
    top10 = valueFromPercentile(NATIONAL, 90) * k
    top1 = valueFromPercentile(NATIONAL, 99) * k
    basisLabel = mode === 'region' ? `${g.label} 가구` : `${g.label} 가구`
    isEstimate = true // 그룹 보정은 추정
  }

  const topRounded = roundTop(100 - p)
  // 표시되는 상위%와 분위를 같은 반올림값에서 도출 → "상위 10% = 10분위" 일치 보장
  const decile = Math.max(1, Math.min(10, 11 - Math.ceil(topRounded / 10)))

  return {
    topPercent: topRounded,
    percentile: Math.round(p * 10) / 10,
    decile,
    median,
    top10,
    top1,
    toTop10: top10 - valueManwon,
    toTop1: top1 - valueManwon,
    basisLabel,
    isEstimate,
  }
}

/** 상위 % 표기 반올림: 1% 미만은 소수 2자리, 10% 미만 1자리, 그 외 정수 */
function roundTop(x: number): number {
  if (x < 1) return Math.round(x * 100) / 100
  if (x < 10) return Math.round(x * 10) / 10
  return Math.round(x)
}
