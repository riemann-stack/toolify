/* ──────────────────────────────────────────────────────
   lib/krDrunkDriving.ts
   음주운전 BAC 기준·형사처벌·면허 결격기간·자전거/PM 범칙금 — 단일 소스
   기준일: 2026-09 (도로교통법 제148조의2 현행 구간은 2019.6.25 시행 이후 동일)
   출처: 국가법령정보센터 도로교통법 제44조(술에 취한 상태에서의 운전 금지)·제82조(결격기간)·
         제148조의2(벌칙), 같은 법 시행령 별표 8(범칙금액) — https://www.law.go.kr/법령/도로교통법
   사용처: health/blood-alcohol (bacUtils가 재수출)
   ────────────────────────────────────────────────────── */

/* ─── 한국 음주운전 처벌 임계값 (도로교통법·윤창호법, 직군 무관 동일) ─── */
export const BAC_THRESHOLDS = {
  GENERAL_SUSPEND:    0.03,   // 면허정지 (단속 기준)
  REVOKE:             0.08,   // 면허취소
  AGGRAVATED:         0.20,   // 가중처벌 구간 (형량은 아래 DRUNK_DRIVING_PENALTIES 'aggravated')
}

/* ─── 음주운전 형사처벌·행정처분 (참고) ───
   page.tsx·Client 문구는 여기서만 가져다 쓴다 (health/blood-alcohol은 bacUtils 재수출 경유) */

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
