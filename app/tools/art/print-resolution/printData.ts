// ─────────────────────────────────────────────────────────
// 인쇄 해상도 데이터
//  픽셀 = (mm ÷ 25.4) × DPI.  관람 거리가 멀수록 낮은 DPI로 충분.
// ─────────────────────────────────────────────────────────

export const MM_PER_INCH = 25.4

export interface PrintSize {
  id: string
  name: string
  group: '사진' | 'A규격' | '기타'
  w: number // mm (짧은 쪽이 아니라 표기 기준 — 세로 기준)
  h: number // mm
}

export const PRINT_SIZES: PrintSize[] = [
  { id: 'p3x5',   name: '3×5″ (3R)',       group: '사진', w: 89,  h: 127 },
  { id: 'p4x6',   name: '4×6″ (4R·L판)',   group: '사진', w: 102, h: 152 },
  { id: 'p5x7',   name: '5×7″ (5R)',       group: '사진', w: 127, h: 178 },
  { id: 'p8x10',  name: '8×10″ (8R)',      group: '사진', w: 203, h: 254 },
  { id: 'p11x14', name: '11×14″',          group: '사진', w: 279, h: 356 },
  { id: 'a6', name: 'A6 (엽서)',  group: 'A규격', w: 105, h: 148 },
  { id: 'a5', name: 'A5',        group: 'A규격', w: 148, h: 210 },
  { id: 'a4', name: 'A4',        group: 'A규격', w: 210, h: 297 },
  { id: 'a3', name: 'A3',        group: 'A규격', w: 297, h: 420 },
  { id: 'a2', name: 'A2 (포스터)', group: 'A규격', w: 420, h: 594 },
  { id: 'a1', name: 'A1 (포스터)', group: 'A규격', w: 594, h: 841 },
  { id: 'a0', name: 'A0 (포스터)', group: 'A규격', w: 841, h: 1189 },
  { id: 'card',      name: '명함 (90×50)',     group: '기타', w: 90, h: 50 },
  { id: 'idphoto',   name: '증명사진 (35×45)', group: '기타', w: 35, h: 45 },
  { id: 'photocard', name: '포토카드 (55×85)', group: '기타', w: 55, h: 85 },
]

export const SIZE_MAP: Record<string, PrintSize> = Object.fromEntries(PRINT_SIZES.map((s) => [s.id, s]))

export interface UseCase {
  id: string
  label: string
  dpi: number
  note: string
}

export const USE_CASES: UseCase[] = [
  { id: 'photo',       label: '사진 인화·고급 인쇄', dpi: 300, note: '근거리에서 보는 사진·잡지·명함' },
  { id: 'general',     label: '일반 인쇄(전단·문서)', dpi: 250, note: '사무·홍보물' },
  { id: 'poster_near', label: '근거리 포스터(실내)', dpi: 150, note: '1~2m에서 보는 실내 포스터' },
  { id: 'poster_far',  label: '대형 포스터(원거리)', dpi: 100, note: '몇 m 떨어져 보는 대형' },
  { id: 'banner',      label: '현수막·배너(원거리)', dpi: 72,  note: '멀리서 보는 옥외 배너' },
  { id: 'screen',      label: '화면·웹(참고)',       dpi: 72,  note: '인쇄가 아닌 디지털 표시용' },
]

export interface QualityBand { min: number; label: string; color: string; desc: string }

// effective DPI 기준 — 내림차순으로 첫 매치
export const QUALITY_BANDS: QualityBand[] = [
  { min: 300, label: '고품질',      color: '#059669', desc: '사진·고급 인쇄에 충분' },
  { min: 200, label: '우수',        color: '#0EA5E9', desc: '일반 인쇄에 적합' },
  { min: 150, label: '보통',        color: '#CA8A04', desc: '포스터·근거리 OK, 사진은 다소 아쉬움' },
  { min: 72,  label: '낮음',        color: '#EA580C', desc: '대형·원거리 인쇄 전용' },
  { min: 0,   label: '인쇄 부적합', color: '#DC2626', desc: '화면용 — 인쇄 시 흐려짐' },
]

export function bandFor(dpi: number): QualityBand {
  return QUALITY_BANDS.find((b) => dpi >= b.min) ?? QUALITY_BANDS[QUALITY_BANDS.length - 1]
}
