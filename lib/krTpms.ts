// lib/krTpms.ts — TPMS(타이어공기압경고장치) 경고 기준 단일 소스: 타이어 공기압 도구(체크 탭 카드·FAQ)·상황별 가이드(캠핑)가 함께 쓴다.
// 서버 컴포넌트(page.tsx)에서도 import하므로 'use client' 파일에 두지 않는다.
//
// 국내: 자동차 및 자동차부품의 성능과 기준에 관한 규칙 [별표 6] 타이어공기압경고장치에 대한 기준(제88조의3 관련)
//   — 타이어 1개의 운행공기압이 20% 감소한 공기압 또는 최소압력 150 kPa 중 큰 공기압에 도달한 뒤
//     10분 누적주행 이내에 경고를 표시해야 함 (UN R141과 같은 기준).
//   장착 의무: 같은 규칙 제12조의2 — 승용자동차와 차량총중량 3.5톤 이하 승합·화물·특수자동차
//     (복륜·피견인·초소형 자동차 제외). 이륜자동차·자전거는 대상이 아니다.
// 미국: FMVSS 138 — 제조사 권장 냉간 공기압보다 25% 낮아지면 경고(차종별 최소 작동압력 별도).

const KPA_PER_PSI = 6.89476

/** 국내(별표 6) 경고 기준: 운행공기압 대비 감소율 */
export const TPMS_DROP_RATIO = 0.2
/** 국내(별표 6) 경고 기준: 최소압력(kPa) — 20% 감소값과 이 값 중 큰 쪽에서 경고 */
export const TPMS_MIN_KPA = 150
/** 미국 FMVSS 138 경고 기준: 권장 공기압 대비 감소율 */
export const TPMS_US_DROP_RATIO = 0.25
/** 최소압력 150 kPa의 psi 환산(약 21.8 psi) */
export const TPMS_MIN_PSI = TPMS_MIN_KPA / KPA_PER_PSI

/** 국내 기준 경고 공기압(psi) = max(권장 × (1 − 20%), 150 kPa) */
export function tpmsWarnPsi(recPsi: number): number {
  return Math.max(recPsi * (1 - TPMS_DROP_RATIO), TPMS_MIN_PSI)
}

/** 미국 FMVSS 138 기준 경고 공기압(psi) = 권장 × (1 − 25%) — 비교 설명용 */
export function usTpmsWarnPsi(recPsi: number): number {
  return recPsi * (1 - TPMS_US_DROP_RATIO)
}

/** 문구 예시에 쓰는 대표 승용차 권장 공기압(psi) */
export const TPMS_EXAMPLE_REC_PSI = 33
