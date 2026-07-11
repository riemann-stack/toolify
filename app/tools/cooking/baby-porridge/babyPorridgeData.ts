/* ──────────────────────────────────────────────────────
   cooking/baby-porridge/babyPorridgeData.ts
   이유식 배죽 물양 계산 — 단계별 배죽 비율 + 재료 기준(불린쌀/생쌀/쌀가루/밥) 환산
   ──────────────────────────────────────────────────────
   근거 (2026-07 웹검증 — 리서치+적대검증 워크플로)
   - N배죽 = "불린쌀 1 : 물 N"이 지배적 관행 (만개의레시피 대표 레시피: 불린쌀 50g+물 500ml,
     쌀 g : 물 ml 계량 — 물 1ml≈1g이므로 사실상 무게비). 단 생쌀/쌀가루 기준 용법도 혼재
     → 기준 선택 UI 필수.
   - 단계별 통용값: 초기 10배죽 미음(쌀가루는 15~20배), 중기 7배죽(범위 7~5),
     후기 5~3배죽 무른밥, 완료기 2배죽 진밥 (삐뽀삐뽀 119 이유식·굿대디·베베스냅·만개의레시피 종합).
   - 불린쌀 = 생쌀 × 약 1.3배 (범위 1.2~1.35, 82cook 실측 1.33~1.35).
   - 밥 = 생쌀 × 약 2.2~2.5배 → 밥죽: 초기 밥 1:물 5~6, 중기 1:3.5 내외, 후기 1:2 안팎,
     완료기 어른밥+국물 2~3큰술 (만개의레시피 6배 밥죽·3.5배죽 레시피 실존 확인).
   - 한 끼 양: 초기 30~80g×1회(첫 1~2주 5~25ml), 중기 70~120g×2회, 후기 100~150g×3회,
     완료기 120~200g×3회 (굿대디·아기한끼·베베스냅·대한모유수유의사회 종합).
   - 큐브 소분 관행: 3일분×하루 횟수 = 6~9개 (아기한끼: 중기 130~150ml×9개=3일분).
   - 쌀 계량: 밥솥 계량컵 180ml = 쌀 약 150g.
   ⚠️ 질병관리청 국가건강정보포털·병원 자료엔 'N배죽' 수치 표준이 없음 — 배죽은 서적·레시피
      플랫폼의 통용 관행이며 기준에 따라 수치가 달라짐을 콘텐츠에 고지할 것.
   ────────────────────────────────────────────────────── */

/** 생쌀 → 불린쌀 무게 배수 (대표값, 범위 1.2~1.35) */
export const SOAK_FACTOR = 1.3
/** 생쌀 → 밥 무게 배수 (대표값, 범위 2.2~2.5) */
export const COOK_FACTOR = 2.4
/** 조리 후 완성량 ≈ (재료+물) × 수율 — 아기한끼 사례(재료 1,350g→완성 1,170~1,350ml) 기반 참고치 */
export const YIELD_RATE = 0.9
/** 밥솥 계량컵 1컵(180ml) = 쌀 g */
export const RICE_CUP_G = 150

export type StageId = 'early' | 'mid' | 'late' | 'complete'
export type BasisId = 'soaked' | 'dry' | 'flour' | 'bap'

export interface Stage {
  id: StageId
  label: string
  months: string
  texture: string
  /** 불린쌀 기준 배죽 기본값 */
  ratioDefault: number
  /** 불린쌀 기준 배죽 선택지 (되직해지는 순) */
  ratioOptions: number[]
  /** 쌀가루 기준 배수 범위 (초기 위주) */
  flourRatio: [number, number] | null
  /** 밥 기준 물 배수 (대표값) — null이면 밥죽 대신 안내 */
  bapRatio: number | null
  /** 한 끼 양 범위 (g) */
  mealG: [number, number]
  /** 하루 이유식 횟수 */
  mealsPerDay: number
  note: string
}

export const STAGES: Stage[] = [
  {
    id: 'early', label: '초기', months: '만 4~6개월 시작', texture: '미음 (주르륵 흐르는 수프)',
    ratioDefault: 10, ratioOptions: [10, 8],
    flourRatio: [15, 20], bapRatio: 5.5,
    mealG: [30, 80], mealsPerDay: 1,
    note: '첫 1~2주는 5~25ml(1~5스푼)부터 시작해 점차 늘립니다.',
  },
  {
    id: 'mid', label: '중기', months: '만 7~8개월', texture: '알갱이 있는 죽',
    ratioDefault: 7, ratioOptions: [7, 6, 5],
    flourRatio: null, bapRatio: 3.5,
    mealG: [70, 120], mealsPerDay: 2,
    note: '7배죽이 가장 널리 통용되고, 익숙해지면 6~5배죽으로 되직하게.',
  },
  {
    id: 'late', label: '후기', months: '만 9~11개월', texture: '무른밥',
    ratioDefault: 5, ratioOptions: [5, 4, 3],
    flourRatio: null, bapRatio: 2,
    mealG: [100, 150], mealsPerDay: 3,
    note: '후기 초반 5배죽 → 후반 3배죽(무른밥)으로 좁혀가는 진행이 무난합니다.',
  },
  {
    id: 'complete', label: '완료기', months: '만 12개월~', texture: '진밥',
    ratioDefault: 2, ratioOptions: [2],
    flourRatio: null, bapRatio: null,
    mealG: [120, 200], mealsPerDay: 3,
    note: '2배죽 진밥. 밥으로는 어른 밥에 국물 2~3큰술 섞은 정도의 되기입니다.',
  },
]

export const BASES: { id: BasisId; label: string; unit: string }[] = [
  { id: 'soaked', label: '불린쌀', unit: 'g' },
  { id: 'dry', label: '생쌀', unit: 'g' },
  { id: 'flour', label: '쌀가루', unit: 'g' },
  { id: 'bap', label: '밥', unit: 'g' },
]

export interface PorridgeResult {
  waterMl: number | null
  /** 표시용 배수 (선택 기준 대비 물 배수) */
  effectiveRatio: number | null
  /** 불린쌀 환산량 g (flour/bap 제외) */
  soakedEquivG: number | null
  /** 예상 완성량 범위 (g, 참고) */
  yieldG: [number, number] | null
  /** 한 끼 양 기준 끼니 수 범위 (참고) */
  meals: [number, number] | null
  /** 밥죽 미지원(완료기) 등 안내 */
  notice: string | null
}

/** 5g/5ml 단위 반올림 */
export function round5(n: number): number {
  return Math.round(n / 5) * 5
}

export function calcPorridge(stage: Stage, basis: BasisId, amountRaw: string, ratio: number): PorridgeResult {
  const amount = parseFloat(amountRaw)
  const empty: PorridgeResult = { waterMl: null, effectiveRatio: null, soakedEquivG: null, yieldG: null, meals: null, notice: null }
  if (!isFinite(amount) || amount <= 0) return empty
  if (amount > 2000) return { ...empty, notice: '한 번에 조리하는 양으로는 너무 많아요. 2,000g 이하로 입력해 주세요.' }

  let waterMl: number
  let effectiveRatio: number
  let soakedEquivG: number | null = null

  if (basis === 'soaked') {
    soakedEquivG = amount
    waterMl = amount * ratio
    effectiveRatio = ratio
  } else if (basis === 'dry') {
    soakedEquivG = amount * SOAK_FACTOR
    waterMl = soakedEquivG * ratio
    effectiveRatio = waterMl / amount
  } else if (basis === 'flour') {
    if (!stage.flourRatio) {
      return { ...empty, notice: '쌀가루는 주로 초기(미음)에 사용해요. 중기부터는 불린쌀·생쌀 기준을 사용해 주세요.' }
    }
    const mid = (stage.flourRatio[0] + stage.flourRatio[1]) / 2
    waterMl = amount * mid
    effectiveRatio = mid
  } else {
    if (stage.bapRatio === null) {
      return { ...empty, notice: '완료기는 밥에 물을 더해 끓이기보다 "어른 밥 + 국물 2~3큰술" 되기의 진밥이 통용돼요.' }
    }
    waterMl = amount * stage.bapRatio
    effectiveRatio = stage.bapRatio
  }

  const totalInput = amount + waterMl
  const yieldLo = totalInput * (YIELD_RATE - 0.05)
  const yieldHi = totalInput
  const mealsLo = yieldLo / stage.mealG[1]
  const mealsHi = yieldHi / stage.mealG[0]

  return {
    waterMl: round5(waterMl),
    effectiveRatio: Math.round(effectiveRatio * 10) / 10,
    soakedEquivG: soakedEquivG !== null ? Math.round(soakedEquivG) : null,
    yieldG: [round5(yieldLo), round5(yieldHi)],
    meals: [Math.max(1, Math.floor(mealsLo)), Math.max(1, Math.floor(mealsHi))],
    notice: null,
  }
}

export interface BatchResult {
  totalG: number
  soakedG: number
  waterMl: number
  cubeMl: number
  cubeCount: number
}

/** 역방향: 며칠치 × 하루 횟수 → 필요한 불린쌀·물·큐브 (한 끼 = 단계 중앙값) */
export function calcBatch(stage: Stage, days: number, ratio: number): BatchResult | null {
  if (days <= 0 || days > 7) return null
  const mealMid = (stage.mealG[0] + stage.mealG[1]) / 2
  const count = days * stage.mealsPerDay
  const totalG = mealMid * count
  // 완성량 = (불린쌀 + 물) × 수율, 물 = 불린쌀 × N → 불린쌀 = 완성량 / (수율 × (1+N))
  // 불린쌀을 먼저 g 단위로 확정한 뒤 물을 그 값에서 계산해 표시 배죽이 어긋나지 않게 한다
  const soakedG = Math.round(totalG / (YIELD_RATE * (1 + ratio)))
  return {
    totalG: round5(totalG),
    soakedG,
    waterMl: round5(soakedG * ratio),
    cubeMl: Math.round(mealMid),
    cubeCount: count,
  }
}
