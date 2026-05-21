/* ──────────────────────────────────────────────────────
   unit/hardness/hardnessData.ts
   강철 경도 환산 — ASTM E140 기반 (Rockwell·Vickers·Brinell)
   ──────────────────────────────────────────────────────
   ⚠️ 본 환산은 강철(steel) 기준입니다. 알루미늄·구리·니켈 합금 등
      비철금속, 카바이드(텅스텐), 고무·플라스틱(Shore A/D)에는
      직접 적용할 수 없습니다.
   ────────────────────────────────────────────────────── */

export type Scale = 'hrc' | 'hv' | 'hb' | 'hrb' | 'tensile'

export interface ScaleInfo {
  id: Scale
  name: string
  fullName: string
  indenter: string
  load: string
  range: [number, number]   // 실용 측정 범위
  unit: string
  desc: string
}

export const SCALES: ScaleInfo[] = [
  { id: 'hrc',     name: 'HRC',     fullName: '로크웰 C',  indenter: '120° 다이아 원뿔', load: '150 kgf',     range: [20, 70],   unit: '', desc: '경강·공구강·HSS·칼날 — 가장 흔한 경도 표기' },
  { id: 'hv',      name: 'HV',      fullName: '비커스',    indenter: '136° 다이아 피라미드', load: '1~50 kgf', range: [50, 1500], unit: '', desc: '박판·코팅·미세 영역. 가장 광범위(연강~카바이드)' },
  { id: 'hb',      name: 'HB',      fullName: '브리넬',    indenter: '10mm 강구 (또는 텅스텐 구)', load: '3000 kgf', range: [80, 650], unit: '', desc: '주철·주강 등 큰 부품. 표면이 거친 시편에 적합' },
  { id: 'hrb',     name: 'HRB',     fullName: '로크웰 B',  indenter: '1/16" 강구', load: '100 kgf', range: [40, 100], unit: '', desc: '연강·황동·구리 등 비교적 무른 금속. 100 초과는 HRC로 전환' },
  { id: 'tensile', name: '인장강도', fullName: 'Tensile Strength', indenter: '—', load: '—', range: [200, 2700], unit: 'MPa', desc: '대략 추정 (HV·HB와 강한 상관). 실측치는 인장시험 필요' },
]

/** ASTM E140 강철 경도 환산표 — HV 기준 내림차순.
 *  값이 없는 셀(null)은 해당 스케일의 측정 가능 범위를 벗어남. */
type Row = { hv: number; hrc: number | null; hrb: number | null; hb: number | null; tensile: number | null }

export const TABLE: Row[] = [
  { hv: 940, hrc: 68, hrb: null, hb: null, tensile: null },
  { hv: 900, hrc: 67, hrb: null, hb: null, tensile: null },
  { hv: 865, hrc: 66, hrb: null, hb: null, tensile: null },
  { hv: 832, hrc: 65, hrb: null, hb: null, tensile: null },
  { hv: 800, hrc: 64, hrb: null, hb: null, tensile: 2640 },
  { hv: 772, hrc: 63, hrb: null, hb: null, tensile: 2510 },
  { hv: 746, hrc: 62, hrb: null, hb: null, tensile: 2400 },
  { hv: 720, hrc: 61, hrb: null, hb: null, tensile: 2290 },
  { hv: 697, hrc: 60, hrb: null, hb: 654, tensile: 2200 },
  { hv: 674, hrc: 59, hrb: null, hb: 634, tensile: 2100 },
  { hv: 653, hrc: 58, hrb: null, hb: 615, tensile: 2010 },
  { hv: 633, hrc: 57, hrb: null, hb: 595, tensile: 1930 },
  { hv: 613, hrc: 56, hrb: null, hb: 577, tensile: 1850 },
  { hv: 595, hrc: 55, hrb: null, hb: 560, tensile: 1770 },
  { hv: 577, hrc: 54, hrb: null, hb: 543, tensile: 1700 },
  { hv: 560, hrc: 53, hrb: null, hb: 525, tensile: 1630 },
  { hv: 544, hrc: 52, hrb: null, hb: 512, tensile: 1560 },
  { hv: 528, hrc: 51, hrb: null, hb: 496, tensile: 1500 },
  { hv: 513, hrc: 50, hrb: null, hb: 481, tensile: 1450 },
  { hv: 498, hrc: 49, hrb: null, hb: 469, tensile: 1390 },
  { hv: 484, hrc: 48, hrb: null, hb: 455, tensile: 1340 },
  { hv: 471, hrc: 47, hrb: null, hb: 443, tensile: 1290 },
  { hv: 458, hrc: 46, hrb: null, hb: 432, tensile: 1240 },
  { hv: 446, hrc: 45, hrb: null, hb: 421, tensile: 1190 },
  { hv: 434, hrc: 44, hrb: null, hb: 409, tensile: 1150 },
  { hv: 423, hrc: 43, hrb: null, hb: 400, tensile: 1110 },
  { hv: 412, hrc: 42, hrb: null, hb: 390, tensile: 1070 },
  { hv: 402, hrc: 41, hrb: null, hb: 381, tensile: 1030 },
  { hv: 392, hrc: 40, hrb: null, hb: 371, tensile: 1000 },
  { hv: 382, hrc: 39, hrb: null, hb: 362, tensile: 965  },
  { hv: 372, hrc: 38, hrb: null, hb: 353, tensile: 930  },
  { hv: 363, hrc: 37, hrb: null, hb: 344, tensile: 900  },
  { hv: 354, hrc: 36, hrb: null, hb: 336, tensile: 870  },
  { hv: 345, hrc: 35, hrb: null, hb: 327, tensile: 840  },
  { hv: 336, hrc: 34, hrb: null, hb: 319, tensile: 810  },
  { hv: 327, hrc: 33, hrb: null, hb: 311, tensile: 780  },
  { hv: 318, hrc: 32, hrb: null, hb: 301, tensile: 750  },
  { hv: 310, hrc: 31, hrb: null, hb: 294, tensile: 720  },
  { hv: 302, hrc: 30, hrb: null, hb: 286, tensile: 690  },
  { hv: 294, hrc: 29, hrb: null, hb: 279, tensile: 670  },
  { hv: 286, hrc: 28, hrb: null, hb: 271, tensile: 650  },
  { hv: 279, hrc: 27, hrb: null, hb: 264, tensile: 630  },
  { hv: 272, hrc: 26, hrb: null, hb: 258, tensile: 610  },
  { hv: 266, hrc: 25, hrb: null, hb: 253, tensile: 590  },
  { hv: 260, hrc: 24, hrb: null, hb: 247, tensile: 570  },
  { hv: 254, hrc: 23, hrb: null, hb: 243, tensile: 555  },
  { hv: 248, hrc: 22, hrb: null, hb: 237, tensile: 540  },
  { hv: 243, hrc: 21, hrb: null, hb: 231, tensile: 525  },
  { hv: 238, hrc: 20, hrb: 100,  hb: 226, tensile: 510  },
  // HRC 측정 가능 범위 아래로는 HRB
  { hv: 229, hrc: null, hrb: 99, hb: 219, tensile: 490 },
  { hv: 222, hrc: null, hrb: 98, hb: 212, tensile: 470 },
  { hv: 216, hrc: null, hrb: 97, hb: 206, tensile: 455 },
  { hv: 210, hrc: null, hrb: 96, hb: 200, tensile: 440 },
  { hv: 204, hrc: null, hrb: 95, hb: 195, tensile: 425 },
  { hv: 198, hrc: null, hrb: 94, hb: 190, tensile: 410 },
  { hv: 192, hrc: null, hrb: 93, hb: 184, tensile: 400 },
  { hv: 186, hrc: null, hrb: 92, hb: 179, tensile: 385 },
  { hv: 180, hrc: null, hrb: 91, hb: 174, tensile: 375 },
  { hv: 175, hrc: null, hrb: 90, hb: 169, tensile: 365 },
  { hv: 170, hrc: null, hrb: 89, hb: 164, tensile: 350 },
  { hv: 166, hrc: null, hrb: 88, hb: 159, tensile: 340 },
  { hv: 161, hrc: null, hrb: 87, hb: 154, tensile: 330 },
  { hv: 156, hrc: null, hrb: 86, hb: 149, tensile: 320 },
  { hv: 152, hrc: null, hrb: 85, hb: 144, tensile: 310 },
  { hv: 148, hrc: null, hrb: 84, hb: 140, tensile: 305 },
  { hv: 143, hrc: null, hrb: 83, hb: 136, tensile: 295 },
  { hv: 140, hrc: null, hrb: 82, hb: 132, tensile: 285 },
  { hv: 135, hrc: null, hrb: 81, hb: 128, tensile: 280 },
  { hv: 131, hrc: null, hrb: 80, hb: 125, tensile: 270 },
  { hv: 127, hrc: null, hrb: 79, hb: 121, tensile: 265 },
  { hv: 124, hrc: null, hrb: 78, hb: 117, tensile: 255 },
  { hv: 120, hrc: null, hrb: 77, hb: 114, tensile: 250 },
  { hv: 117, hrc: null, hrb: 76, hb: 111, tensile: 245 },
  { hv: 114, hrc: null, hrb: 75, hb: 108, tensile: 235 },
  { hv: 111, hrc: null, hrb: 74, hb: 105, tensile: 230 },
  { hv: 108, hrc: null, hrb: 73, hb: 102, tensile: 225 },
  { hv: 105, hrc: null, hrb: 72, hb: 100, tensile: 220 },
  { hv: 102, hrc: null, hrb: 71, hb:  98, tensile: 215 },
  { hv: 100, hrc: null, hrb: 70, hb:  95, tensile: 210 },
  { hv:  95, hrc: null, hrb: 68, hb:  91, tensile: 200 },
  { hv:  90, hrc: null, hrb: 66, hb:  87, tensile: 195 },
  { hv:  85, hrc: null, hrb: 64, hb:  83, tensile: 180 },
  { hv:  80, hrc: null, hrb: 60, hb:  79, tensile: 175 },
]

// HV 내림차순 보장
TABLE.sort((a, b) => b.hv - a.hv)

/**
 * 한 스케일의 값을 입력받아 다른 스케일들의 값을 보간 산출.
 * - 입력 스케일의 값이 표 양 끝을 벗어나면 null 반환
 * - 대상 스케일의 값이 null인 구간은 해당 결과만 null
 */
export interface Converted {
  hrc: number | null
  hv:  number | null
  hb:  number | null
  hrb: number | null
  tensile: number | null
  /** 입력값이 ASTM E140 표 범위를 벗어났는지 */
  outOfRange: boolean
}

export function convertHardness(scale: Scale, value: number): Converted {
  // 표에서 해당 스케일이 null이 아닌 두 인접 행을 찾고, 그 사이에서 보간
  const rows = TABLE.filter((r) => r[scale] !== null) as { [K in keyof Row]: number }[]
  // rows 는 HV 내림차순이지만, 각 스케일도 동일 방향이라고 가정.
  if (rows.length === 0) return emptyResult(true)

  // 입력값의 보간 비율 산출 (인접 두 행 사이)
  const sorted = [...rows].sort((a, b) => a[scale] - b[scale])  // 오름차순
  const min = sorted[0][scale]
  const max = sorted[sorted.length - 1][scale]
  const outOfRange = value < min || value > max

  // 가장 가까운 두 점 찾기 — value를 감싸는 lo/hi
  let lo = sorted[0]
  let hi = sorted[sorted.length - 1]
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i][scale] <= value && value <= sorted[i + 1][scale]) {
      lo = sorted[i]
      hi = sorted[i + 1]
      break
    }
  }
  const t = hi[scale] === lo[scale] ? 0 : (value - lo[scale]) / (hi[scale] - lo[scale])

  const lerp = (key: Scale): number | null => {
    // 두 점 중 하나라도 해당 스케일이 null이면 보간 불가 → 가장 가까운 표의 행에서 끌어옴
    const fullRows = TABLE.filter((r) => r[key] !== null)
    if (fullRows.length === 0) return null
    // value를 입력 스케일에서 비율 t로 보간한 hv 추정 후, hv 기준으로 key를 보간
    const hvEst = lo.hv + (hi.hv - lo.hv) * t
    // hv를 기준으로 key 보간
    const arr = fullRows.sort((a, b) => a.hv - b.hv)
    if (hvEst <= arr[0].hv) return arr[0][key]!
    if (hvEst >= arr[arr.length - 1].hv) return arr[arr.length - 1][key]!
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].hv <= hvEst && hvEst <= arr[i + 1].hv) {
        const tHv = arr[i + 1].hv === arr[i].hv ? 0 : (hvEst - arr[i].hv) / (arr[i + 1].hv - arr[i].hv)
        return (arr[i][key] as number) + ((arr[i + 1][key] as number) - (arr[i][key] as number)) * tHv
      }
    }
    return null
  }

  return {
    hrc: scale === 'hrc' ? value : lerp('hrc'),
    hv:  scale === 'hv'  ? value : lerp('hv'),
    hb:  scale === 'hb'  ? value : lerp('hb'),
    hrb: scale === 'hrb' ? value : lerp('hrb'),
    tensile: scale === 'tensile' ? value : lerp('tensile'),
    outOfRange,
  }
}

function emptyResult(outOfRange = false): Converted {
  return { hrc: null, hv: null, hb: null, hrb: null, tensile: null, outOfRange }
}

/** 각 스케일이 실용 측정 범위 안에 있는지 */
export function inRange(scale: Scale, value: number | null): boolean {
  if (value === null || !isFinite(value)) return false
  const info = SCALES.find((s) => s.id === scale)!
  return value >= info.range[0] && value <= info.range[1]
}

// ─── 칼 경도 가이드 ────────────────────────────────────────
export interface HardnessExample { name: string; hrcMin: number; hrcMax: number; note?: string }

export const KNIFE_EXAMPLES: HardnessExample[] = [
  { name: '일반 주방칼 (스테인리스)', hrcMin: 54, hrcMax: 56, note: '저렴~중급. 자주 갈아 써도 OK' },
  { name: '고급 주방칼 (X50CrMoV15)',  hrcMin: 56, hrcMax: 58, note: 'Wüsthof·Henckels 등' },
  { name: '미들급 (VG-10, AUS-10, 154CM)', hrcMin: 60, hrcMax: 61, note: 'EDC 폴딩·일본 주방칼' },
  { name: '프리미엄 (M390, ELMAX, S35VN)',  hrcMin: 60, hrcMax: 62, note: '하이엔드 폴딩 나이프' },
  { name: '초고경도 (ZDP-189, K390, MagnaCut)', hrcMin: 62, hrcMax: 65, note: '인성 ↓ 날끝 유지 ↑' },
  { name: '일본도 (전통 카타나)',       hrcMin: 60, hrcMax: 65, note: '날 부분 (心鋼 30~40으로 점이로움)' },
  { name: '외과 메스',                  hrcMin: 60, hrcMax: 65, note: '일회용 카본 스틸' },
  { name: '면도날',                     hrcMin: 65, hrcMax: 70, note: '얇은 날·고탄소강' },
]

export const TOOL_EXAMPLES: HardnessExample[] = [
  { name: 'HSS 드릴 비트',         hrcMin: 62, hrcMax: 65, note: 'M2·M35 고속도강' },
  { name: '코발트 HSS (M42)',     hrcMin: 65, hrcMax: 67, note: '내열 강화' },
  { name: '줄(file)',             hrcMin: 65, hrcMax: 70 },
  { name: '베어링 강 (52100)',    hrcMin: 60, hrcMax: 64 },
  { name: '앤빌(anvil) 작업면',    hrcMin: 50, hrcMax: 55 },
  { name: '자동차 크랭크샤프트',    hrcMin: 30, hrcMax: 38 },
  { name: '일반 구조용강 (저탄소)', hrcMin: 15, hrcMax: 22, note: 'HRB 80~100' },
]

// ─── 모스 경도 비교 (대략) ────────────────────────────────
export const MOHS_TABLE: { mohs: number; mineral: string; approxHv?: string; note?: string }[] = [
  { mohs: 1,  mineral: '활석(talc)',     approxHv: '~1',     note: '손톱으로도 긁힘' },
  { mohs: 2,  mineral: '석고(gypsum)',   approxHv: '~36',    note: '손톱(2.5)' },
  { mohs: 3,  mineral: '방해석(calcite)', approxHv: '~110',   note: '동전(3)' },
  { mohs: 4,  mineral: '형석(fluorite)', approxHv: '~190',   note: '강철 못으로 긁힘' },
  { mohs: 5,  mineral: '인회석(apatite)', approxHv: '~540',   note: '유리(5.5)' },
  { mohs: 6,  mineral: '정장석',         approxHv: '~800',   note: '강철줄(6.5)' },
  { mohs: 7,  mineral: '석영(quartz)',   approxHv: '~1100',  note: '카바이드 비트' },
  { mohs: 8,  mineral: '토파즈',         approxHv: '~1400' },
  { mohs: 9,  mineral: '강옥(사파이어)', approxHv: '~2200' },
  { mohs: 10, mineral: '다이아몬드',      approxHv: '~10000', note: '자연 최고 경도' },
]

// ─── Shore 경도 (별개 스케일) ───────────────────────────────
export const SHORE_NOTE = {
  title: 'Shore 경도는 금속 환산과 별개',
  body: 'Shore A/D는 고무·플라스틱용, Shore C/D는 가벼운 금속·플라스틱용 압자입니다. 강철의 HRC/HV/HB와는 측정 원리·범위가 달라 직접 변환할 수 없어요. Shore A 70 ≈ 자동차 타이어 / Shore A 95 ≈ 신발 밑창 / Shore D 60 ≈ 단단한 플라스틱.',
}
