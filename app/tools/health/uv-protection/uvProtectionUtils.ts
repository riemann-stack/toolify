/* 자외선 계산 공용 상수·식 — UvProtectionClient.tsx(계산기)와 page.tsx(본문 표)가 함께 import.
   CSS 모듈 클래스에 묶인 옵션 목록(SPF·환경·UV 등급)은 클라이언트에 두고, 값 계산의 핵심만 여기 둔다. */

export type SkinTypeId = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'

export interface SkinType {
  id: SkinTypeId
  name: string
  desc: string
  swatch: string
  medJm2: number       // 최소홍반량(MED, J/㎡ 홍반가중) — 타입 범위의 낮은(민감한) 쪽
  multiplier: number   // 단순식 피부 계수
  isKoreanCommon: boolean
}

export const SKIN_TYPES: SkinType[] = [
  { id: 'I',   name: '타입 I',   desc: '매우 흰 피부, 항상 화상',          swatch: '#FFE4D6', medJm2: 200,  multiplier: 2.5, isKoreanCommon: false },
  { id: 'II',  name: '타입 II',  desc: '흰 피부, 보통 화상',                 swatch: '#FFD4BB', medJm2: 250,  multiplier: 3,   isKoreanCommon: false },
  { id: 'III', name: '타입 III', desc: '가끔 화상, 서서히 그을림',            swatch: '#E8B894', medJm2: 300,  multiplier: 4,   isKoreanCommon: true },
  { id: 'IV',  name: '타입 IV',  desc: '약간 어두움, 드물게 화상',            swatch: '#C8956D', medJm2: 450,  multiplier: 5,   isKoreanCommon: true },
  { id: 'V',   name: '타입 V',   desc: '어두운 피부, 매우 드물게 화상',       swatch: '#8D5524', medJm2: 600,  multiplier: 8,   isKoreanCommon: false },
  { id: 'VI',  name: '타입 VI',  desc: '매우 어두움, 거의 화상 X',           swatch: '#553A29', medJm2: 1000, multiplier: 12,  isKoreanCommon: false },
]

/* 무보호 일광화상 중앙값(분) — 두 식 중 짧은(보수적) 쪽
   ① 단순식 200 × 피부 계수 ÷ (3 × UVI)
   ② MED ÷ 홍반 조도(UVI × 0.025 W/㎡) ÷ 60초 */
export function baseBurnMinutes(adjustedUvi: number, skin: Pick<SkinType, 'medJm2' | 'multiplier'>): number {
  const t1 = (200 * skin.multiplier) / (3 * adjustedUvi)
  const t2 = skin.medJm2 / (adjustedUvi * 0.025 * 60)
  return Math.min(t1, t2)
}

/* 실사용 SPF — 도포량 부족을 감안해 표시 SPF의 절반 효과로 보수 가정 */
export function effectiveSpf(spf: number): number {
  return 1 + 0.5 * (spf - 1)
}

/* 분 → 'N분' / 'N시간 M분' (먼저 분 단위로 반올림해 '1시간 60분'·'60분' 표기를 막는다) */
export function fmtMinutes(min: number): string {
  if (!Number.isFinite(min)) return '-'
  if (min < 1) return '< 1분'
  const r = Math.round(min)
  if (r < 60) return `${r}분`
  const h = Math.floor(r / 60)
  const m = r % 60
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}
