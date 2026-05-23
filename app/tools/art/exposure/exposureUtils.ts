/* 사진 노출 계산기 — 데이터·계산 유틸 */

export type LockAxis = 'aperture' | 'shutter' | 'iso'
export type CropFactor = 'ff' | 'apsc' | 'apscCanon' | 'm43' | 'inch1'

/* ─────────────────────────────────────────────
   조리개 (f-number) — 1/3 stop 단계 포함, 풀스톱 표시
   각 인덱스 = 0.333 stop 차이 (낮을수록 빛 ↑)
   ───────────────────────────────────────────── */
export interface ApertureValue {
  value: number     // 1.4, 2, ...
  label: string     // 'f/1.4'
  isFull: boolean   // 풀 스톱 (f/1.0, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32)
}

export const APERTURES: ApertureValue[] = [
  { value: 1.0,  label: 'f/1.0',  isFull: true },
  { value: 1.2,  label: 'f/1.2',  isFull: false },
  { value: 1.4,  label: 'f/1.4',  isFull: true },
  { value: 1.6,  label: 'f/1.6',  isFull: false },
  { value: 1.8,  label: 'f/1.8',  isFull: false },
  { value: 2.0,  label: 'f/2',    isFull: true },
  { value: 2.2,  label: 'f/2.2',  isFull: false },
  { value: 2.5,  label: 'f/2.5',  isFull: false },
  { value: 2.8,  label: 'f/2.8',  isFull: true },
  { value: 3.2,  label: 'f/3.2',  isFull: false },
  { value: 3.5,  label: 'f/3.5',  isFull: false },
  { value: 4.0,  label: 'f/4',    isFull: true },
  { value: 4.5,  label: 'f/4.5',  isFull: false },
  { value: 5.0,  label: 'f/5',    isFull: false },
  { value: 5.6,  label: 'f/5.6',  isFull: true },
  { value: 6.3,  label: 'f/6.3',  isFull: false },
  { value: 7.1,  label: 'f/7.1',  isFull: false },
  { value: 8.0,  label: 'f/8',    isFull: true },
  { value: 9.0,  label: 'f/9',    isFull: false },
  { value: 10.0, label: 'f/10',   isFull: false },
  { value: 11.0, label: 'f/11',   isFull: true },
  { value: 13.0, label: 'f/13',   isFull: false },
  { value: 14.0, label: 'f/14',   isFull: false },
  { value: 16.0, label: 'f/16',   isFull: true },
  { value: 18.0, label: 'f/18',   isFull: false },
  { value: 20.0, label: 'f/20',   isFull: false },
  { value: 22.0, label: 'f/22',   isFull: true },
]

/* ─────────────────────────────────────────────
   셔터스피드 (1/3 stop 단계 — 실카메라 일치)
   각 인덱스 = 0.333 stop, value = 초 단위 (1/250 = 0.004)
   ───────────────────────────────────────────── */
export interface ShutterValue {
  value: number
  label: string
}

export const SHUTTERS: ShutterValue[] = [
  { value: 30,     label: '30s'    },
  { value: 25,     label: '25s'    },
  { value: 20,     label: '20s'    },
  { value: 15,     label: '15s'    },
  { value: 13,     label: '13s'    },
  { value: 10,     label: '10s'    },
  { value: 8,      label: '8s'     },
  { value: 6,      label: '6s'     },
  { value: 5,      label: '5s'     },
  { value: 4,      label: '4s'     },
  { value: 3.2,    label: '3.2s'   },
  { value: 2.5,    label: '2.5s'   },
  { value: 2,      label: '2s'     },
  { value: 1.6,    label: '1.6s'   },
  { value: 1.3,    label: '1.3s'   },
  { value: 1,      label: '1s'     },
  { value: 0.8,    label: '0.8s'   },
  { value: 0.6,    label: '0.6s'   },
  { value: 1/2,    label: '1/2'    },
  { value: 0.4,    label: '0.4s'   },
  { value: 1/3,    label: '1/3'    },
  { value: 1/4,    label: '1/4'    },
  { value: 1/5,    label: '1/5'    },
  { value: 1/6,    label: '1/6'    },
  { value: 1/8,    label: '1/8'    },
  { value: 1/10,   label: '1/10'   },
  { value: 1/13,   label: '1/13'   },
  { value: 1/15,   label: '1/15'   },
  { value: 1/20,   label: '1/20'   },
  { value: 1/25,   label: '1/25'   },
  { value: 1/30,   label: '1/30'   },
  { value: 1/40,   label: '1/40'   },
  { value: 1/50,   label: '1/50'   },
  { value: 1/60,   label: '1/60'   },
  { value: 1/80,   label: '1/80'   },
  { value: 1/100,  label: '1/100'  },
  { value: 1/125,  label: '1/125'  },
  { value: 1/160,  label: '1/160'  },
  { value: 1/200,  label: '1/200'  },
  { value: 1/250,  label: '1/250'  },
  { value: 1/320,  label: '1/320'  },
  { value: 1/400,  label: '1/400'  },
  { value: 1/500,  label: '1/500'  },
  { value: 1/640,  label: '1/640'  },
  { value: 1/800,  label: '1/800'  },
  { value: 1/1000, label: '1/1000' },
  { value: 1/1250, label: '1/1250' },
  { value: 1/1600, label: '1/1600' },
  { value: 1/2000, label: '1/2000' },
  { value: 1/2500, label: '1/2500' },
  { value: 1/3200, label: '1/3200' },
  { value: 1/4000, label: '1/4000' },
  { value: 1/5000, label: '1/5000' },
  { value: 1/6400, label: '1/6400' },
  { value: 1/8000, label: '1/8000' },
]

/* ─────────────────────────────────────────────
   ISO (1/3 stop 단계 — 실카메라 일치)
   ───────────────────────────────────────────── */
export interface IsoValue {
  value: number
  label: string
}

export const ISOS: IsoValue[] = [
  { value: 50,    label: 'ISO 50'    },
  { value: 64,    label: 'ISO 64'    },
  { value: 80,    label: 'ISO 80'    },
  { value: 100,   label: 'ISO 100'   },
  { value: 125,   label: 'ISO 125'   },
  { value: 160,   label: 'ISO 160'   },
  { value: 200,   label: 'ISO 200'   },
  { value: 250,   label: 'ISO 250'   },
  { value: 320,   label: 'ISO 320'   },
  { value: 400,   label: 'ISO 400'   },
  { value: 500,   label: 'ISO 500'   },
  { value: 640,   label: 'ISO 640'   },
  { value: 800,   label: 'ISO 800'   },
  { value: 1000,  label: 'ISO 1000'  },
  { value: 1250,  label: 'ISO 1250'  },
  { value: 1600,  label: 'ISO 1600'  },
  { value: 2000,  label: 'ISO 2000'  },
  { value: 2500,  label: 'ISO 2500'  },
  { value: 3200,  label: 'ISO 3200'  },
  { value: 4000,  label: 'ISO 4000'  },
  { value: 5000,  label: 'ISO 5000'  },
  { value: 6400,  label: 'ISO 6400'  },
  { value: 8000,  label: 'ISO 8000'  },
  { value: 10000, label: 'ISO 10000' },
  { value: 12800, label: 'ISO 12800' },
  { value: 16000, label: 'ISO 16000' },
  { value: 20000, label: 'ISO 20000' },
  { value: 25600, label: 'ISO 25600' },
  { value: 32000, label: 'ISO 32000' },
  { value: 40000, label: 'ISO 40000' },
  { value: 51200, label: 'ISO 51200' },
]

/* ─────────────────────────────────────────────
   ND 필터
   ───────────────────────────────────────────── */
export interface NDFilter {
  id: string
  label: string
  stops: number      // 빛 차단 stop 수
  factor: number     // 셔터 시간 배수
  use: string
}

export const ND_FILTERS: NDFilter[] = [
  { id: 'nd2',    label: 'ND2',    stops: 1,  factor: 2,    use: '약한 빛 차단 — 인물·일반' },
  { id: 'nd4',    label: 'ND4',    stops: 2,  factor: 4,    use: '대낮 인물 + 조리개 활짝' },
  { id: 'nd8',    label: 'ND8',    stops: 3,  factor: 8,    use: '인물·풍경 보편 — 가장 인기' },
  { id: 'nd16',   label: 'ND16',   stops: 4,  factor: 16,   use: '폭포 실크 효과 (1/2~2초)' },
  { id: 'nd32',   label: 'ND32',   stops: 5,  factor: 32,   use: '계곡·폭포 (2~5초)' },
  { id: 'nd64',   label: 'ND64',   stops: 6,  factor: 64,   use: '파도·구름 (5~15초)' },
  { id: 'nd400',  label: 'ND400',  stops: 9,  factor: 400,  use: '장노출 — 안개 같은 파도 (15~60초)' },
  { id: 'nd1000', label: 'ND1000', stops: 10, factor: 1000, use: '극장노출 — 일주·구름 (1~5분)' },
]

export const getNDFilter = (id: string) => ND_FILTERS.find((f) => f.id === id) ?? ND_FILTERS[2]

/* ─────────────────────────────────────────────
   크롭 팩터
   ───────────────────────────────────────────── */
export interface CropMeta {
  id: CropFactor
  label: string
  factor: number
  desc: string
}

export const CROPS: CropMeta[] = [
  { id: 'ff',         label: '풀프레임 (Full Frame)',     factor: 1.0,  desc: '소니 A7·캐논 R5·니콘 Z 등 (35mm 표준)' },
  { id: 'apsc',       label: 'APS-C (Sony·Nikon·Fuji)',   factor: 1.5,  desc: '소니 a6700·니콘 Z fc·후지 X-T5' },
  { id: 'apscCanon',  label: 'APS-C (Canon)',             factor: 1.6,  desc: '캐논 R7·R10·R50·R100' },
  { id: 'm43',        label: 'M4/3 (Olympus·Panasonic)',  factor: 2.0,  desc: '오즈 OM-1·파나 GH 시리즈' },
  { id: 'inch1',      label: '1인치',                      factor: 2.7,  desc: '소니 RX100·캐논 G7X' },
]

export const getCrop = (id: CropFactor) => CROPS.find((c) => c.id === id) ?? CROPS[0]

/* ─────────────────────────────────────────────
   상황별 가이드 (Sunny 16 등)
   ───────────────────────────────────────────── */
export interface SceneGuide {
  id: string
  emoji: string
  label: string
  desc: string
  aperture: number
  shutter: number
  iso: number
  tip: string
  needTripod?: boolean
}

export const SCENES: SceneGuide[] = [
  {
    id: 'sunny',
    emoji: '☀️',
    label: 'Sunny 16 (밝은 햇빛)',
    desc: '한낮 야외, 그림자 뚜렷',
    aperture: 16, shutter: 1/100, iso: 100,
    tip: '"Sunny 16 룰" — ISO 100 + 셔터 1/100 + f/16. 카메라 측광 없이도 정확.',
  },
  {
    id: 'cloudy_bright',
    emoji: '⛅',
    label: '약간 흐림',
    desc: '햇빛 부드러움, 그림자 흐릿',
    aperture: 11, shutter: 1/100, iso: 100,
    tip: '햇빛 + 1 stop 늘림. 인물 사진 좋은 자연광.',
  },
  {
    id: 'overcast',
    emoji: '☁️',
    label: '흐림',
    desc: '흐린 날, 그림자 X',
    aperture: 8, shutter: 1/100, iso: 100,
    tip: 'Sunny 16 + 2 stop. 흐림은 자연 디퓨저.',
  },
  {
    id: 'sunset',
    emoji: '🌅',
    label: '일몰·황혼',
    desc: '해질녘 골든 아워',
    aperture: 2.8, shutter: 1/30, iso: 400,
    tip: '시시각각 빛 변함 → 빠르게 촬영. ISO 살짝 ↑ 권장.',
  },
  {
    id: 'indoor',
    emoji: '🏠',
    label: '실내 (창가)',
    desc: '낮 시간 실내 자연광',
    aperture: 2.8, shutter: 1/60, iso: 800,
    tip: '창가 자연광 활용. 인물이면 창 옆으로 90도 배치.',
  },
  {
    id: 'night',
    emoji: '🌃',
    label: '야경 (도시)',
    desc: '도시 야경 + 삼각대',
    aperture: 8, shutter: 30, iso: 100,
    needTripod: true,
    tip: '삼각대 필수 + 리모트·셀프타이머. 가능하면 ISO 100.',
  },
  {
    id: 'star',
    emoji: '⭐',
    label: '별 사진 (점광원)',
    desc: '은하수·별 사진 + 삼각대',
    aperture: 2.8, shutter: 20, iso: 1600,
    needTripod: true,
    tip: '500 룰: 셔터 = 500 / (초점거리 × 크롭). 그 이상은 별 흐림.',
  },
  {
    id: 'concert',
    emoji: '🎤',
    label: '콘서트·실내 무대',
    desc: '조명 변화 큼 + 움직임',
    aperture: 2.8, shutter: 1/250, iso: 3200,
    tip: '조명에 따라 ISO 1600~6400. 셔터 1/250 이상이 흔들림 방지.',
  },
]

/* ─────────────────────────────────────────────
   영상 셔터 룰 (180°)
   ───────────────────────────────────────────── */
export interface VideoFps {
  fps: number
  label: string
  shutter: number
  shutterLabel: string
}

export const VIDEO_FPS: VideoFps[] = [
  { fps: 24,  label: '24p (시네마)',     shutter: 1/50,  shutterLabel: '1/50'   },
  { fps: 25,  label: '25p (PAL)',        shutter: 1/50,  shutterLabel: '1/50'   },
  { fps: 30,  label: '30p (NTSC)',       shutter: 1/60,  shutterLabel: '1/60'   },
  { fps: 60,  label: '60p (슬로우 시작)', shutter: 1/125, shutterLabel: '1/125'  },
  { fps: 120, label: '120p (슬로우)',     shutter: 1/250, shutterLabel: '1/250'  },
  { fps: 240, label: '240p (초슬로우)',   shutter: 1/500, shutterLabel: '1/500'  },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

/** EV 계산: EV100 = log2(N²/t), 보정: -log2(ISO/100) */
export function calcEV(aperture: number, shutter: number, iso: number): number {
  const ev100 = Math.log2((aperture * aperture) / shutter)
  const isoOffset = Math.log2(iso / 100)
  return ev100 - isoOffset
}

/** 두 값 사이 stop 차이 (조리개) */
export function apertureStops(from: number, to: number): number {
  return 2 * Math.log2(to / from)
}

/** 두 값 사이 stop 차이 (셔터: 길수록 stop +) */
export function shutterStops(from: number, to: number): number {
  return Math.log2(to / from)
}

/** 두 값 사이 stop 차이 (ISO: 높을수록 stop +) */
export function isoStops(from: number, to: number): number {
  return Math.log2(to / from)
}

/** 가장 가까운 풀스톱 조리개 인덱스 */
export function nearestApertureIdx(value: number): number {
  let best = 0, bestDiff = Infinity
  APERTURES.forEach((a, i) => {
    const d = Math.abs(a.value - value)
    if (d < bestDiff) { bestDiff = d; best = i }
  })
  return best
}
export function nearestShutterIdx(value: number): number {
  let best = 0, bestDiff = Infinity
  SHUTTERS.forEach((s, i) => {
    const d = Math.abs(Math.log2(s.value) - Math.log2(value))
    if (d < bestDiff) { bestDiff = d; best = i }
  })
  return best
}
export function nearestIsoIdx(value: number): number {
  let best = 0, bestDiff = Infinity
  ISOS.forEach((s, i) => {
    const d = Math.abs(Math.log2(s.value) - Math.log2(value))
    if (d < bestDiff) { bestDiff = d; best = i }
  })
  return best
}

/** 조리개 인덱스 단위 stop (인덱스 1당 1/3 stop) */
export function apertureIdxToStops(idx: number): number {
  return idx / 3
}

/** 등가 노출 — 한 축 변경 시 다른 축 보정 */
export interface EquivalentExposure {
  apertureIdx: number
  shutterIdx: number
  isoIdx: number
  aperture: number
  shutter: number
  iso: number
  shutterLabel: string
  apertureLabel: string
  isoLabel: string
}

/* 등가 노출 5종 추천 */
export function generateEquivalents(currentAptIdx: number, currentShIdx: number, currentIsoIdx: number): EquivalentExposure[] {
  const baseAt = APERTURES[currentAptIdx]
  const baseSh = SHUTTERS[currentShIdx]
  const baseIso = ISOS[currentIsoIdx]
  const baseEV = calcEV(baseAt.value, baseSh.value, baseIso.value)

  const candidates: EquivalentExposure[] = []
  /* 다양한 (aptIdx, shIdx, isoIdx) 조합 시도 */
  for (let dAt = -9; dAt <= 9; dAt += 3) {
    for (let dSh = -9; dSh <= 9; dSh += 3) {
      for (let dIso = -9; dIso <= 9; dIso += 3) {
        if (dAt === 0 && dSh === 0 && dIso === 0) continue
        const aIdx = currentAptIdx + dAt
        const sIdx = currentShIdx + dSh
        const iIdx = currentIsoIdx + dIso
        if (aIdx < 0 || aIdx >= APERTURES.length) continue
        if (sIdx < 0 || sIdx >= SHUTTERS.length) continue
        if (iIdx < 0 || iIdx >= ISOS.length) continue
        const a = APERTURES[aIdx]
        const s = SHUTTERS[sIdx]
        const ii = ISOS[iIdx]
        const ev = calcEV(a.value, s.value, ii.value)
        if (Math.abs(ev - baseEV) < 0.2) {
          candidates.push({
            apertureIdx: aIdx, shutterIdx: sIdx, isoIdx: iIdx,
            aperture: a.value, shutter: s.value, iso: ii.value,
            apertureLabel: a.label, shutterLabel: s.label, isoLabel: ii.label,
          })
        }
      }
    }
  }

  /* 다양성 확보: 조리개 다른 5개 */
  const seen = new Set<number>()
  const result: EquivalentExposure[] = []
  candidates
    .sort((a, b) => Math.abs(a.apertureIdx - currentAptIdx) - Math.abs(b.apertureIdx - currentAptIdx))
    .forEach((c) => {
      if (seen.has(c.apertureIdx)) return
      seen.add(c.apertureIdx)
      result.push(c)
    })
  return result.slice(0, 5)
}

/* ─────────────────────────────────────────────
   조리개·셔터·ISO별 효과 평가 (트레이드오프)
   ───────────────────────────────────────────── */

/** 심도 평가 (조리개 기준) */
export function dofRating(aperture: number): { label: string; emoji: string; desc: string; level: number } {
  if (aperture <= 2.0)  return { label: '매우 얕음', emoji: '🌸', desc: '극단 아웃포커싱, 인물 클로즈업', level: 5 }
  if (aperture <= 2.8)  return { label: '얕음',     emoji: '👤', desc: '인물·물건 부각, 배경 흐림',     level: 4 }
  if (aperture <= 5.6)  return { label: '중간',     emoji: '🚶', desc: '일상·스트리트, 적당한 보케',    level: 3 }
  if (aperture <= 11.0) return { label: '깊음',     emoji: '🏞️', desc: '풍경·단체 사진, 모두 또렷',     level: 2 }
  return                       { label: '매우 깊음', emoji: '🗻', desc: '극풍경·접사, 회절 주의',        level: 1 }
}

/** 흔들림 위험 (셔터 기준) */
export function blurRating(shutter: number): { label: string; emoji: string; desc: string; level: number; tripod: boolean } {
  if (shutter >= 1)        return { label: '극도 흔들림 위험', emoji: '🚨', desc: '삼각대 필수, 1초+ 장노출',      level: 5, tripod: true }
  if (shutter >= 1/30)     return { label: '흔들림 위험',     emoji: '⚠️', desc: '삼각대 권장, 손떨림 보정 활용', level: 4, tripod: true }
  if (shutter >= 1/125)    return { label: '주의',           emoji: '🤚', desc: '광각·표준 손떨림 OK, 망원 위험', level: 3, tripod: false }
  if (shutter >= 1/500)    return { label: '안전',           emoji: '✅', desc: '대부분 손떨림 정지',            level: 2, tripod: false }
  return                          { label: '움직임 정지',     emoji: '⚡', desc: '스포츠·새 액션 정지',           level: 1, tripod: false }
}

/** 노이즈 평가 (ISO 기준) */
export function noiseRating(iso: number): { label: string; emoji: string; desc: string; level: number } {
  if (iso <= 200)   return { label: '극저 노이즈', emoji: '✨', desc: '인쇄·전시 수준, 매우 깨끗',         level: 1 }
  if (iso <= 800)   return { label: '저 노이즈',  emoji: '🌟', desc: '일반 인쇄·웹용 OK',                 level: 2 }
  if (iso <= 3200)  return { label: '중 노이즈',  emoji: '📷', desc: '실내·야간 일반 — 디테일 살짝 손실', level: 3 }
  if (iso <= 12800) return { label: '높은 노이즈', emoji: '⚠️', desc: '야경·실내 어둠 — 흑백 권장',        level: 4 }
  return                   { label: '극심 노이즈', emoji: '🚨', desc: '극한 상황 한정, 디테일 큰 손실',    level: 5 }
}

/* ─────────────────────────────────────────────
   500 룰 (별 사진)
   ───────────────────────────────────────────── */
export function rule500(focalLength: number, crop: CropFactor): number {
  const c = getCrop(crop).factor
  return 500 / (focalLength * c)
}

/* ─────────────────────────────────────────────
   ND 필터 다중 적층
   ───────────────────────────────────────────── */
export function calcNDStackedShutter(originalShutter: number, totalStops: number): number {
  return originalShutter * Math.pow(2, totalStops)
}

/** 셔터 시간 → 가독적 라벨 */
export function fmtShutter(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds - m * 60)
    return s > 0 ? `${m}분 ${s}초` : `${m}분`
  }
  if (seconds >= 1) return `${seconds.toFixed(seconds < 10 ? 1 : 0)} 초`
  /* 1초 미만 → 1/N */
  const denom = Math.round(1 / seconds)
  return `1/${denom}`
}

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */
export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtStop(stops: number): string {
  if (Math.abs(stops) < 0.05) return '0 stop'
  const sign = stops > 0 ? '+' : ''
  return `${sign}${stops.toFixed(2).replace(/\.?0+$/, '')} stop`
}
