/* ──────────────────────────────────────────────────────
   sports/shoe-mileage/shoeMileageData.ts
   러닝화 수명(km)·교체 예상일 — 소재·체중·착지·로테이션 보정
   ──────────────────────────────────────────────────────
   근거·주의
   - 미드솔 소재별 기본 수명은 브랜드 가이드·러닝 문헌의 통용 범위(참고값):
     EVA 400~600 / TPU 500~700 / PEBA 데일리 슈퍼트레이너 450~650 / 카본 레이싱(얇은 PEBA) 300~500 km.
     레이싱화는 가볍게 만들려고 폼을 얇게 써 반발 성능이 빨리 떨어진다(Outside Online 등 — 실사용 약 300~600km).
   - 체중·착지·로테이션 보정은 '관행 배수' — 정밀 측정 상수가 아님.
   - 실제 교체 시점은 쿠션 꺼짐·통증·아웃솔 마모로 판단하는 것이 우선.
   ────────────────────────────────────────────────────── */

export interface Midsole {
  id: string
  name: string
  base: number   // 기본 수명(km) 중앙값
  range: [number, number]
  desc: string
}
/* 수명값은 제조사 공식 교체 주기(브룩스·아식스 US 300~500마일 ≈ 483~805km,
   아식스 NZ 800~1,000km, 나이키 코리아 표기 등 — 출처별 상이, page.tsx §교체 주기 표 참조)
   범위 안에서 잡은 본 도구의 기준값. 소재별 세분(EVA vs TPU vs PEBA)은 제조사가
   정량 공식값을 공개하지 않아 통용 관행에 따른 근사 구분이다. */
export const MIDSOLES: Midsole[] = [
  { id: 'eva',  name: 'EVA (일반)',      base: 500, range: [400, 600], desc: '대부분의 데일리 트레이너' },
  { id: 'tpu',  name: 'TPU (부스트 등)', base: 600, range: [500, 700], desc: '내구성 좋은 발포폼' },
  { id: 'peba-daily', name: 'PEBA 데일리 (슈퍼 트레이너)', base: 550, range: [450, 650], desc: '두툼한 슈퍼폼 데일리화' },
  { id: 'peba-race',  name: '카본 레이싱화 (얇은 PEBA)',  base: 400, range: [300, 500], desc: '대회용 — 가볍게 만든 만큼 수명이 짧음' },
]

/** 체중 구간별 보정 (무거울수록 미드솔 압축 빨라 수명 ↓) */
export function weightFactor(kg: number): number {
  if (kg <= 0) return 1
  if (kg < 60) return 1.1
  if (kg < 75) return 1.0
  if (kg < 90) return 0.9
  return 0.8
}

export interface Landing {
  id: string
  name: string
  factor: number
}
export const LANDINGS: Landing[] = [
  { id: 'heel', name: '뒤꿈치',  factor: 0.95 },
  { id: 'mid',  name: '미드풋',  factor: 1.0 },
  { id: 'fore', name: '앞발',    factor: 1.0 },
]

/** 2족 이상 번갈아 신으면 미드솔이 회복(감압)할 시간이 생겨 수명 연장 */
export const ROTATION_FACTOR = 1.15
export const ROTATION_PAIRS_MIN = 2
export const ROTATION_PAIRS_MAX = 5
/** 교체 예상일 표시 상한 — 이보다 멀면 날짜 대신 '10년 이상'으로 표기 */
export const MAX_DAYS_SHOWN = 3650

export interface ShoeResult {
  lifespanKm: number
  lifeLo: number
  lifeHi: number
  remainKm: number
  /** 이 신발 한 켤레의 주간 거리 (로테이션 시 총거리 ÷ 켤레 수) */
  weeklyPerShoe: number
  weeksLeft: number | null
  daysLeft: number | null
}

export function calcShoeLife(
  midsole: Midsole,
  weightKg: number,
  landing: Landing,
  rotate: boolean,
  currentKm: number,
  weeklyKm: number,
  /** 로테이션 켤레 수 — 주간 총거리를 켤레 수만큼 나눠 이 신발의 주간 거리로 본다 */
  pairs: number = ROTATION_PAIRS_MIN,
): ShoeResult {
  const wf = weightFactor(weightKg)
  const rf = rotate ? ROTATION_FACTOR : 1
  const mult = wf * landing.factor * rf

  const lifespanKm = Math.round(midsole.base * mult)
  const lifeLo = Math.round(midsole.range[0] * mult)
  const lifeHi = Math.round(midsole.range[1] * mult)

  const cur = Math.max(0, currentKm)
  const remainKm = Math.max(0, lifespanKm - cur)

  const share = rotate ? Math.min(ROTATION_PAIRS_MAX, Math.max(ROTATION_PAIRS_MIN, Math.round(pairs) || ROTATION_PAIRS_MIN)) : 1
  const wk = Math.max(0, weeklyKm) / share
  const weeksLeft = wk > 0 ? remainKm / wk : null
  const daysLeft = weeksLeft !== null ? Math.round(weeksLeft * 7) : null

  return { lifespanKm, lifeLo, lifeHi, remainKm, weeklyPerShoe: wk, weeksLeft, daysLeft }
}

/** 교체 예상일 = 오늘 + daysLeft (로컬 기준) */
export function replaceDate(today: Date, daysLeft: number): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysLeft)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}. ${m}. ${day}`
}
