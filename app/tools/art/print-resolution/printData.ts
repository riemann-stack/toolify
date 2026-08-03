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
  /* ⚠️ 3R의 공식 규격은 3×5인치가 아니라 **3.5×5인치**(89×127mm)다.
        이름만 '3×5″'로 적혀 있어 사용자가 3×5인치(76.2×127mm)로 오해할 수 있었다.
     ⚠️ 일본 'L판'은 89×127mm(=3R)이고, 102×152mm는 **KG판(하가키)**로 별개 상품이다
        (후지필름 공식 스토어: Lサイズ 89×127 / KG（はがき）サイズ 102×152).
        L판을 4×6에 붙이면 일본에서 주문할 때 다른 크기를 받게 된다. */
  { id: 'p3x5',   name: '3.5×5″ (3R·L판)', group: '사진', w: 89,  h: 127 },
  { id: 'p4x6',   name: '4×6″ (4R·KG판)',  group: '사진', w: 102, h: 152 },
  { id: 'p5x7',   name: '5×7″ (5R·2L판)',  group: '사진', w: 127, h: 178 },
  { id: 'p8x10',  name: '8×10″ (8R)',      group: '사진', w: 203, h: 254 },
  { id: 'p11x14', name: '11×14″ (11R)',    group: '사진', w: 279, h: 356 },
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
  /* ⚠️ '화면은 72 DPI'는 초기 매킨토시·PostScript 포인트(1pt=1/72in)에서 온 유산이다.
        W3C CSS 표준의 기준 해상도는 1in = 96px이고, 무엇보다 **웹 이미지는 DPI가 아니라
        픽셀 수로 표시된다** — 파일의 DPI 메타데이터는 화면 표시에 영향을 주지 않는다. */
  { id: 'screen',      label: '화면·웹 (CSS 기준)',  dpi: 96,  note: 'CSS 1인치 = 96px 기준 환산값 — 웹 표시는 DPI가 아니라 픽셀 수로 결정됩니다' },
]

/** tint = 점·막대 등 비텍스트용, ink = 텍스트용(AA 통과 토큰).
    예전에는 한 색을 배지 배경(흰 글자)과 큰 숫자 양쪽에 썼는데,
    #0EA5E9는 흰 배경 대비 2.77:1로 큰 글씨 기준 3:1에도 미달했다. */
export interface QualityBand { min: number; label: string; tint: string; ink: string; desc: string }

// effective DPI 기준 — 내림차순으로 첫 매치
export const QUALITY_BANDS: QualityBand[] = [
  { min: 300, label: '고품질',      tint: 'var(--success)',    ink: 'var(--success)',    desc: '사진·고급 인쇄에 충분' },
  { min: 200, label: '우수',        tint: 'var(--accent)',     ink: 'var(--accent-ink)', desc: '일반 인쇄에 적합' },
  { min: 150, label: '보통',        tint: 'var(--cat-sports)', ink: 'var(--cat-sports)', desc: '포스터·근거리 OK, 사진은 다소 아쉬움' },
  { min: 72,  label: '낮음',        tint: 'var(--cat-life)',   ink: 'var(--warning)',    desc: '대형·원거리 인쇄 전용' },
  { min: 0,   label: '매우 낮음',   tint: 'var(--danger)',     ink: 'var(--danger)',     desc: '가까이서 보면 흐려짐 — 관람 거리를 확인하세요' },
]

export function bandFor(dpi: number): QualityBand {
  return QUALITY_BANDS.find((b) => dpi >= b.min) ?? QUALITY_BANDS[QUALITY_BANDS.length - 1]
}

/**
 * 선택한 용도의 목표 DPI 대비 판정.
 * ⚠️ 절대 밴드만 쓰면 용도를 무시한다 — 멀리서 보는 현수막(목표 72)을 40 DPI로 뽑아도
 *    '인쇄 부적합 · 화면용'이라고 답했다. 실제로는 목표 대비 얼마나 모자란지가 판단 기준이다.
 */
export interface UseVerdict {
  ratio: number
  verdict: '충분' | '거의 충분' | '부족' | '많이 부족'
  message: string
}

export function judgeForUse(effDpi: number, targetDpi: number, useLabel: string): UseVerdict {
  if (!(targetDpi > 0) || !Number.isFinite(effDpi) || effDpi <= 0) {
    return { ratio: 0, verdict: '많이 부족', message: '이미지 크기를 입력하세요.' }
  }
  const ratio = effDpi / targetDpi
  if (ratio >= 1) return { ratio, verdict: '충분', message: `${useLabel} 기준(${targetDpi} DPI)을 넘습니다.` }
  if (ratio >= 0.8) return { ratio, verdict: '거의 충분', message: `${useLabel} 기준(${targetDpi} DPI)에 살짝 못 미치지만 실사용에는 대체로 무리 없습니다.` }
  if (ratio >= 0.5) return { ratio, verdict: '부족', message: `${useLabel} 기준(${targetDpi} DPI)의 ${Math.round(ratio * 100)}% 수준입니다 — 인쇄 크기를 줄이거나 더 큰 원본이 필요합니다.` }
  return { ratio, verdict: '많이 부족', message: `${useLabel} 기준(${targetDpi} DPI)의 ${Math.round(ratio * 100)}%뿐입니다 — 이 크기로는 눈에 띄게 흐려집니다.` }
}

/* ─────────────────────────────────────────────
   맞춤(fit) / 채우기(fill) — 종횡비가 다를 때
   ⚠️ 예전에는 긴 변·짧은 변을 각각 대응해 **낮은 쪽**만 썼다. 그건 "이미지를 자동 회전한 뒤
      용지를 꽉 채우도록 잘라낸다"는 가정인데 화면에 아무 설명이 없었다.
      정사각 3000×3000을 A4로 두면 257 PPI라고만 답하고, 그러려면 이미지의 29.3%를
      잘라내야 한다는 사실은 알려주지 않았다(전체를 남기면 21×21cm·363 PPI).
   ───────────────────────────────────────────── */
export interface FitResult {
  /** 용지를 꽉 채울 때의 유효 PPI (일부 잘림) */
  fillPpi: number
  /** 전체 이미지를 남길 때의 유효 PPI (여백 생김) */
  fitPpi: number
  /** 채우기에서 잘려 나가는 비율 (0~1, 잘리는 축 기준) */
  cropFrac: number
  /** 맞춤일 때 실제 인쇄되는 크기 (mm) */
  fitLongMm: number
  fitShortMm: number
}

export function fitFill(imgW: number, imgH: number, paperWmm: number, paperHmm: number): FitResult {
  const blank: FitResult = { fillPpi: 0, fitPpi: 0, cropFrac: 0, fitLongMm: 0, fitShortMm: 0 }
  if (!(imgW > 0) || !(imgH > 0) || !(paperWmm > 0) || !(paperHmm > 0)) return blank
  const imgLong = Math.max(imgW, imgH), imgShort = Math.min(imgW, imgH)
  const inLong = Math.max(paperWmm, paperHmm) / MM_PER_INCH
  const inShort = Math.min(paperWmm, paperHmm) / MM_PER_INCH
  const fillPpi = Math.min(imgLong / inLong, imgShort / inShort)
  const fitPpi = Math.max(imgLong / inLong, imgShort / inShort)
  /* 채우기 배율에서 인쇄되는 크기 — 한 변은 용지와 같고 다른 변이 넘쳐 잘린다 */
  const printedLong = imgLong / fillPpi, printedShort = imgShort / fillPpi
  const cropFrac = 1 - Math.min(inLong / printedLong, inShort / printedShort)
  return {
    fillPpi,
    fitPpi,
    cropFrac: Math.max(0, cropFrac),
    fitLongMm: (imgLong / fitPpi) * MM_PER_INCH,
    fitShortMm: (imgShort / fitPpi) * MM_PER_INCH,
  }
}

/* ─────────────────────────────────────────────
   도련(bleed) — 재단 여유. 명함·전단·포스터는 사방으로 더 크게 인쇄한 뒤 잘라낸다.
   ───────────────────────────────────────────── */
export const BLEED_OPTIONS = [0, 1, 2, 3, 5] as const
export type BleedMm = typeof BLEED_OPTIONS[number]

/** 도련을 포함한 실제 인쇄 크기 (사방으로 bleed mm씩) */
export function withBleed(wMm: number, hMm: number, bleed: number) {
  const b = Number.isFinite(bleed) && bleed > 0 ? bleed : 0
  return { w: wMm + b * 2, h: hMm + b * 2 }
}
