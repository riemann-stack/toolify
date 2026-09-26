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
//    - 순자산 마이너스 가구 3.0%(2025.3말)         → p3   = 0
//  ● 그 외 하위~중간 구간은 평균 4.71억·지니 0.625에 맞춘 보간 추정.
// ──────────────────────────────────────────────────────────
export const NATIONAL: Point[] = [
  { p: 0, v: -3000 },
  { p: 3, v: 0 }, // 실측: 순자산 음수 가구 3.0% → 0원은 하위 3%(상위 97%)
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

export const USD_KRW = 1340 // 참고용 고정 환율 — 2026년 9월 초 근사(9/9 종가 약 1,336원). 실시간 환율 아님
export const USD_KRW_ASOF = '2026년 9월 초'

// ── 연령대별 평균 순자산 (가구주 연령계층 기준, 2025.3말, 만원) ──
//   2025년 가계금융복지조사 가구주 연령계층별 순자산 평균. 원 보도자료 표(국가데이터처·KOSIS)는
//   2026-09 검증 환경에서 열람이 막혀 보도 인용치를 교차 확인해 사용:
//     - 39세 이하 2억 1,950만(전년比 −0.9%)·40대 4억 8,389만(+7.4%)·50대 5억 5,161만(+7.9%)
//       — 문화일보 2026.2.12 「50대 5.5억 > 39세 이하 2.1억」(국가데이터처 인용)
//     - 29세 이하 1억 796만·30대 2억 5,060만·40대 4억 8,389만·50대 5억 5,161만·60세 이상 5억 3,591만
//       — 아주경제 2026.9.12 (2025 가계금융복지조사 인용)
//   정합성: 39세 이하(2억 1,950만)는 29세 이하·30대 값 사이에 있고, 60세 이상이 전국 평균(4억 7,144만)보다
//   높아야 연령대 가중 평균이 전국 평균과 맞음(옛 추정 4억 5,500만은 전국 평균보다 낮아 모순이었음).
//   다음 조사 공표(매년 12월) 때 KOSIS 원표로 갱신할 것.
export interface Group { id: string; label: string; mean: number; real: boolean }
export const AGE_GROUPS: Group[] = [
  { id: 'u39', label: '39세 이하', mean: 21950, real: true },
  { id: '40s', label: '40대', mean: 48389, real: true },
  { id: '50s', label: '50대', mean: 55161, real: true },
  { id: '60p', label: '60세 이상', mean: 53591, real: true },
]

// ── 시도별 평균 순자산 (가구 기준, 2025.3말, 만원) ──
//   2025년 가계금융복지조사 시도별 평균 순자산 중 보도로 확인한 값만 둔다:
//     서울 7억 1,288만·세종 6억 648만·경기 5억 6,006만·제주 4억 8,103만(제주 '전국 4위')
//     — 제주매일 「제주 가구당 순자산 4억8103만원 '전국 4위'」(국가데이터처 인용), 전국 평균 4억 7,144만.
//   나머지 13개 시·도도 조사가 공표하지만(KOSIS 시도별 통계표) 2026-09 검증 환경에서 원표
//   (KOSIS·국가데이터처·한국은행)를 열람할 수 없어 값을 확인하지 못했다. 지어낸 추정치를 쓰지 않도록
//   목록에서 뺐으며(옛 추정치 대전 4.85억은 공표 순위 4위 제주보다 높아 모순이었음), 원표 확인 시
//   real:true로 추가할 것. 화면은 REGIONS를 그대로 돌리므로 여기만 고치면 된다.
export const SIDO_COUNT = 17 // 전국 광역자치단체(시·도) 수 — '나머지 N개 시·도' 문구 보간용
export const REGIONS: Group[] = [
  { id: 'seoul', label: '서울', mean: 71288, real: true },
  { id: 'sejong', label: '세종', mean: 60648, real: true },
  { id: 'gyeonggi', label: '경기', mean: 56006, real: true },
  { id: 'jeju', label: '제주', mean: 48103, real: true },
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
