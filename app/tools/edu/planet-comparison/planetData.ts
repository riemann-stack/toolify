// ─────────────────────────────────────────────
// 행성 데이터 · 파생 계산
//  출처: NASA Planetary Fact Sheet
//  https://nssdc.gsfc.nasa.gov/planetary/factsheet/
//  ⚠️ 클라이언트에서 분리한 이유: 값끼리 서로 맞아야 하는 항목이 많은데
//     (반지름비 = 반지름/지구반지름, 광행시간 = 거리/c 등) 인라인이면 검산할 수 없다.
// ─────────────────────────────────────────────

export type Planet = {
  id: string
  name: string
  emoji: string
  nameEn: string
  radiusKm: number
  radiusRatio: number
  gravityRatio: number
  yearDays: number
  /** 항성일 — 별을 기준으로 한 바퀴 도는 시간 (NASA 'Rotation Period') */
  rotationHours: number
  /** 태양일 — 해가 다시 남중할 때까지 (NASA 'Length of Day'). 일반적인 '하루'는 이쪽이다. */
  solarDayHours: number
  /** 자전 방향이 공전과 반대인가 (자전축 기울기 > 90°). 부호로 인코딩하지 않는다 —
      태양일은 역행 행성도 양수라서 부호가 사라진다. */
  isRetrograde: boolean
  surfaceTempC: { min: number; max: number; avg: number }
  distanceFromSunKm: number
  color: string
  funFact: string
}

export const PLANETS: Planet[] = [
  { id: 'mercury', name: '수성',   emoji: '☿️', nameEn: 'Mercury',
    radiusKm: 2_439.7,  radiusRatio: 0.383, gravityRatio: 0.378,
    yearDays: 87.97,   rotationHours: 1407.6, solarDayHours: 4222.6, isRetrograde: false,
    surfaceTempC: { min: -173, max: 427, avg: 167 },
    distanceFromSunKm: 57_910_000, color: '#A8A29E',
    funFact: '태양에 가장 가깝지만 가장 뜨거운 행성은 아닙니다(금성이 더 뜨거움).' },
  { id: 'venus', name: '금성',   emoji: '♀️', nameEn: 'Venus',
    radiusKm: 6_051.8,  radiusRatio: 0.949, gravityRatio: 0.907,
    yearDays: 224.7,   rotationHours: 5832.5, solarDayHours: 2802.0, isRetrograde: true,
    surfaceTempC: { min: 464, max: 464, avg: 464 },
    distanceFromSunKm: 108_200_000, color: '#FFC857',
    funFact: '별 기준 자전(243일)이 공전(225일)보다 길어 "하루가 1년보다 길다"는 말이 나왔지만, 해가 다시 뜨는 진짜 하루는 117일로 1년보다 짧습니다. 자전 방향도 거꾸로예요.' },
  { id: 'earth', name: '지구',   emoji: '🌍', nameEn: 'Earth',
    radiusKm: 6_371,    radiusRatio: 1.0,   gravityRatio: 1.0,
    yearDays: 365.25,  rotationHours: 23.9345, solarDayHours: 24.0, isRetrograde: false,
    surfaceTempC: { min: -89, max: 56.7, avg: 15 },
    distanceFromSunKm: 149_600_000, color: '#0891B2',
    funFact: '우리 집입니다. 표면의 71%가 물로 덮여 있습니다.' },
  { id: 'mars', name: '화성',   emoji: '♂️', nameEn: 'Mars',
    radiusKm: 3_389.5,  radiusRatio: 0.532, gravityRatio: 0.377,
    yearDays: 686.97,  rotationHours: 24.6229, solarDayHours: 24.6597, isRetrograde: false,
    surfaceTempC: { min: -143, max: 35, avg: -65 },
    distanceFromSunKm: 227_900_000, color: '#DC2626',
    funFact: '하루(솔) 길이가 지구와 비슷합니다 — 24시간 40분(별 기준 자전은 24시간 37분). 최고봉은 올림푸스 산으로 높이 약 22km.' },
  { id: 'jupiter', name: '목성', emoji: '♃', nameEn: 'Jupiter',
    radiusKm: 69_911,   radiusRatio: 10.97, gravityRatio: 2.36,
    yearDays: 4_332.59, rotationHours: 9.9250, solarDayHours: 9.9259, isRetrograde: false,
    surfaceTempC: { min: -145, max: -110, avg: -110 },
    distanceFromSunKm: 778_500_000, color: '#EA580C',
    funFact: '나머지 일곱 행성을 모두 합친 것보다 두 배 넘게 무겁습니다. 대적반(거대 폭풍)은 350년 이상 지속.' },
  { id: 'saturn', name: '토성',  emoji: '♄', nameEn: 'Saturn',
    radiusKm: 58_232,   radiusRatio: 9.14,  gravityRatio: 0.916,
    yearDays: 10_759.22, rotationHours: 10.656, solarDayHours: 10.656, isRetrograde: false,
    surfaceTempC: { min: -178, max: -140, avg: -140 },
    distanceFromSunKm: 1_434_000_000, color: '#A16207',
    funFact: '아름다운 고리는 얼음과 암석. 평균 밀도가 0.69 g/cm³로 태양계에서 유일하게 물보다 가벼워, "충분히 큰 욕조가 있다면 뜬다"는 비유가 여기서 나왔습니다(실제로는 기체 덩어리라 형체를 유지하지 못합니다).' },
  { id: 'uranus', name: '천왕성', emoji: '♅', nameEn: 'Uranus',
    radiusKm: 25_362,   radiusRatio: 3.98,  gravityRatio: 0.889,
    yearDays: 30_688.5, rotationHours: 17.24, solarDayHours: 17.24, isRetrograde: true,
    surfaceTempC: { min: -224, max: -195, avg: -195 },
    distanceFromSunKm: 2_871_000_000, color: '#0D9488',
    funFact: '자전축이 98° 기울어져 옆으로 굴러갑니다. 관측된 최저 기온 -224°C는 행성 중 가장 낮지만, 평균 기온은 해왕성(-200°C)이 더 낮습니다.' },
  { id: 'neptune', name: '해왕성', emoji: '♆', nameEn: 'Neptune',
    radiusKm: 24_622,   radiusRatio: 3.86,  gravityRatio: 1.12,
    yearDays: 60_182,  rotationHours: 16.11, solarDayHours: 16.11, isRetrograde: false,
    surfaceTempC: { min: -218, max: -200, avg: -200 },
    distanceFromSunKm: 4_495_000_000, color: '#3E5BFF',
    funFact: '태양계에서 바람이 가장 강한 행성. 시속 2,100km의 폭풍이 분다.' },
]

// 거리 표기 헬퍼
export const fmt = (v: number, dp = 0): string =>
  Number.isFinite(v) ? v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp }) : '-'
export const round = (v: number, dp = 1) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp)

/** 거리를 한국어 큰 수 단위로.
    ⚠️ 예전 구현은 단위가 통째로 어긋나 있었다 — 100,000,000 미만이면 `km / 1_000_000`을
       '만'이라 적어 9,200만 km가 **"92만 km"**로, `km / 1_000_000_000`을 '억'이라 적어
       12.8억 km가 **"1.28억 km"**로 나왔다. 만 = 10⁴, 억 = 10⁸이다. */
export function fmtDistance(km: number): string {
  if (!Number.isFinite(km) || km <= 0) return '—'
  const EOK = 100_000_000        // 억
  const MAN = 10_000             // 만
  if (km >= EOK) {
    const v = km / EOK
    return `${fmt(round(v, v >= 100 ? 0 : 1), v >= 100 ? 0 : 1)}억 km`
  }
  if (km >= MAN) return `${fmt(round(km / MAN))}만 km`
  return `${fmt(round(km))} km`
}
export function fmtLightTime(min: number): string {
  if (min < 1) return '0분'
  if (min < 60) return `${round(min, 1)}분`
  const h = min / 60
  if (h < 1.5) return `${round(h, 2)}시간`
  return `${round(h, 1)}시간`
}


/** 빛의 속도 (km/s, 정의값) */
export const C_KM_S = 299_792.458

/** 지구 반지름 (km) — 비율의 기준 */
export const EARTH_RADIUS_KM = 6371

export function lightMinutesFor(km: number): number {
  return km / C_KM_S / 60
}

/* ── 지구에서의 거리 ──
   ⚠️ 예전에는 거리와 광행시간을 손으로 적어 넣어 서로 어긋났다:
      · 화성은 거리 7,830만 km(빛 4.4분)를 적어 놓고 광행시간은 12.7분이라 했다
        — 12.7분은 '태양→화성' 값이라 애초에 다른 구간이었다.
      · 수성만 7,700만 km로 다른 7개가 따르던 규칙(반장축 차)에서 벗어나 있었다.
      · 필드 이름은 'Avg'인데 값은 최소 접근 거리였다.
   이제 두 값을 **궤도 반장축에서 파생**한다. 손으로 적는 값이 없으니 어긋날 수 없다.
   원 궤도·동일 평면으로 단순화한 근사이며, 실제로는 궤도 이심률 때문에 조금씩 다르다
   (특히 화성은 이심률 0.093이라 실제 최소 접근이 이 근사보다 가깝다). */
export interface EarthDistance {
  /** 가장 가까워질 때 (km) — 두 궤도 반지름의 차 */
  minKm: number
  /** 가장 멀어질 때 (km) — 태양 반대편, 두 궤도 반지름의 합 */
  maxKm: number
  minLightMin: number
  maxLightMin: number
}

const EARTH_ORBIT_KM = 149_600_000

export function earthDistance(p: Planet): EarthDistance {
  const minKm = Math.abs(p.distanceFromSunKm - EARTH_ORBIT_KM)
  const maxKm = p.distanceFromSunKm + EARTH_ORBIT_KM
  return {
    minKm,
    maxKm,
    minLightMin: lightMinutesFor(minKm),
    maxLightMin: lightMinutesFor(maxKm),
  }
}
