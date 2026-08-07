// ─────────────────────────────────────────────
// 코스믹 캘린더 데이터 · 파생 계산
//  우주 138억 년을 1년으로 압축한 칼 세이건의 시각화.
//  ⚠️ 클라이언트에서 분리한 이유: 예전에는 각 사건의 실제 연대(realYearsAgo)와
//     달력 날짜(cosmicDate·month·day·hour…)를 **둘 다 손으로 적어** 서로 어긋났다.
//     은하수는 66일이나 벌어져 있었다(표기 3월 16일 vs 계산 1월 8일).
//     이제 날짜는 연대에서 **파생**하므로 어긋날 수 없다.
// ─────────────────────────────────────────────

/** 우주 나이 — Planck 2018 (13.787 ± 0.020 Gyr) */
export const COSMIC_YEAR_REAL_YEARS = 13_787_000_000

/** 달력이 12달 · 12월 31일 자정에 끝나므로 365일로 잡는다.
    ⚠️ 예전에는 365.25를 썼는데, 그러면 12월 31일 24:00이 연말이 아니게 된다
       (0.25일이 남는다). 널리 쓰이는 "1초 ≈ 437.5년"도 365일 기준 값이다. */
export const DAYS_IN_COSMIC_YEAR = 365

export const COSMIC_DAY_REAL_YEARS = COSMIC_YEAR_REAL_YEARS / DAYS_IN_COSMIC_YEAR
export const COSMIC_HOUR_REAL_YEARS = COSMIC_DAY_REAL_YEARS / 24
export const COSMIC_MINUTE_REAL_YEARS = COSMIC_HOUR_REAL_YEARS / 60
/** 약 437.5년 */
export const COSMIC_SECOND_REAL_YEARS = COSMIC_MINUTE_REAL_YEARS / 60

export type CatKey = 'cosmic' | 'solar' | 'earth' | 'life' | 'human' | 'civilization' | 'now'

export type CosmicEvent = {
  id: string
  name: string
  /** 실제 연대(년 전). 역사 시대 사건은 year로 적고 현재 연도에서 계산한다. */
  realYearsAgo?: number
  /** 서기 연도(기원전은 음수). 이 값이 있으면 realYearsAgo를 현재 연도에서 구한다.
      ⚠️ 예전에는 '예수 탄생 2026년 전'처럼 특정 연도를 박아 둬서 해가 바뀌면 틀렸다. */
  year?: number
  category: CatKey
  icon: string
  description: string
}

/* 연대 출처 메모
   · 빅뱅 13.787 Gyr — Planck 2018
   · 최초의 별 ~13.6 · 최초의 은하 ~13.4 (JWST가 z≈14, 빅뱅 후 약 3억 년까지 밀어 올림)
   · 은하수 ~11 Gyr — ⚠️ 예전 값 13.5는 '최초의 은하(13.4)'보다 오래됐다는 모순이었다.
   · 태양계 4.57 · 지구 4.54 · 달 4.51 · 최초 생명 3.8
   · 광합성 3.4 (초기 광합성은 산소를 만들지 않는 방식이었다 — 설명도 함께 정정)
   · 대산소화 사건 2.4 · 다세포 2.0(그리파니아 등 초기 사례) */
export const EVENTS: CosmicEvent[] = [
  { id: 'bigbang',        name: '빅뱅 (우주 탄생)',              realYearsAgo: 13_787_000_000, category: 'cosmic',       icon: '💥', description: '시공간이 시작된 순간. 모든 물질·에너지가 한 점에서 폭발적으로 팽창 시작.' },
  { id: 'firstAtoms',     name: '최초의 원자 형성',               realYearsAgo: 13_786_620_000, category: 'cosmic',       icon: '⚛️', description: '38만 년 후 우주가 식으면서 수소·헬륨 원자가 만들어짐.' },
  { id: 'firstStars',     name: '최초의 별 형성',                 realYearsAgo: 13_600_000_000, category: 'cosmic',       icon: '⭐', description: '약 2억 년 후 첫 별들이 핵융합으로 빛나기 시작.' },
  { id: 'firstGalaxies',  name: '최초의 은하 형성',               realYearsAgo: 13_400_000_000, category: 'cosmic',       icon: '🌌', description: '별들이 모여 최초의 은하가 형성됨. 제임스 웹 망원경이 빅뱅 후 약 3억 년의 은하까지 찾아냈다.' },
  { id: 'milkyWay',       name: '우리 은하 형성',                 realYearsAgo: 11_000_000_000, category: 'cosmic',       icon: '🌠', description: '우리 태양계가 속한 우리 은하가 지금의 모습을 갖춰 감.' },
  { id: 'solarSystem',    name: '태양계 형성',                    realYearsAgo: 4_570_000_000,  category: 'solar',        icon: '☀️', description: '가스·먼지 구름이 뭉쳐 태양과 행성들이 형성됨.' },
  { id: 'earth',          name: '지구 형성',                      realYearsAgo: 4_540_000_000,  category: 'earth',        icon: '🌍', description: '약 45억 4천만 년 전 지구가 형성됨.' },
  { id: 'moon',           name: '달 형성',                        realYearsAgo: 4_510_000_000,  category: 'earth',        icon: '🌙', description: '거대 충돌설: 화성 크기 천체가 지구와 충돌 → 달 형성.' },
  { id: 'firstLife',      name: '최초의 생명체 (단세포)',          realYearsAgo: 3_800_000_000,  category: 'life',         icon: '🦠', description: '최초의 단세포 생명(원시 박테리아) 등장.' },
  { id: 'photosynthesis', name: '광합성 시작',                    realYearsAgo: 3_400_000_000,  category: 'life',         icon: '🌱', description: '최초의 광합성 생물 등장. 다만 이때의 광합성은 산소를 만들지 않는 방식이었다.' },
  { id: 'oxygen',         name: '대기에 산소 축적 (대산소화 사건)', realYearsAgo: 2_400_000_000,  category: 'life',         icon: '💨', description: '산소를 만드는 광합성이 퍼지면서 대기에 산소가 쌓이기 시작 — 이후 생물 다양성 폭발의 기반.' },
  { id: 'multicellular',  name: '다세포 생물 등장',               realYearsAgo: 2_000_000_000,  category: 'life',         icon: '🧬', description: '단세포에서 다세포로 넘어간 초기 사례가 나타남(복잡한 다세포 생물은 훨씬 뒤).' },
  { id: 'cambrian',       name: '캄브리아기 대폭발',              realYearsAgo: 540_000_000,    category: 'life',         icon: '🦑', description: '다양한 생물 형태가 폭발적으로 등장.' },
  { id: 'plants',         name: '육상 식물 등장',                 realYearsAgo: 470_000_000,    category: 'life',         icon: '🌿', description: '식물이 바다에서 육지로 진출.' },
  { id: 'firstAnimals',   name: '육상 동물 등장',                 realYearsAgo: 400_000_000,    category: 'life',         icon: '🦎', description: '척추동물이 육지에 진출.' },
  { id: 'dinosaurs',      name: '공룡 등장',                      realYearsAgo: 230_000_000,    category: 'life',         icon: '🦕', description: '약 2억 3천만 년 전 공룡 등장.' },
  { id: 'mammals',        name: '포유류 등장',                    realYearsAgo: 200_000_000,    category: 'life',         icon: '🐀', description: '약 2억 년 전 작은 포유류 등장 (공룡과 공존).' },
  { id: 'flowers',        name: '꽃 식물 등장',                   realYearsAgo: 130_000_000,    category: 'life',         icon: '🌸', description: '꽃을 피우는 식물(속씨식물) 진화.' },
  { id: 'dinoExtinction', name: '공룡 멸종 (K-Pg 대멸종)',        realYearsAgo: 66_000_000,     category: 'life',         icon: '☄️', description: '약 6,600만 년 전 운석 충돌로 공룡 멸종 → 포유류 시대 시작.' },
  { id: 'primates',       name: '영장류 등장',                    realYearsAgo: 55_000_000,     category: 'life',         icon: '🐒', description: '최초의 영장류 등장.' },
  { id: 'humanAncestor',  name: '인류 조상 (오스트랄로피테쿠스)',   realYearsAgo: 4_000_000,      category: 'human',        icon: '🧍', description: '루시(Lucy) 같은 직립보행 영장류 등장.' },
  { id: 'genusHomo',      name: '호모(Homo) 속 등장',             realYearsAgo: 2_500_000,      category: 'human',        icon: '🪨', description: '도구를 만들기 시작한 호모 하빌리스 등장.' },
  { id: 'fire',           name: '불 사용 시작',                   realYearsAgo: 1_500_000,      category: 'human',        icon: '🔥', description: '호모 에렉투스가 불을 통제하기 시작.' },
  { id: 'homoSapiens',    name: '현생 인류 (호모 사피엔스) 등장',   realYearsAgo: 300_000,        category: 'human',        icon: '👤', description: '약 30만 년 전 현생 인류 등장.' },
  { id: 'language',       name: '언어·예술의 발달',               realYearsAgo: 50_000,         category: 'civilization', icon: '🎨', description: '동굴벽화, 복잡한 언어, 상징적 사고 발달.' },
  { id: 'agriculture',    name: '농업 혁명',                      realYearsAgo: 12_000,         category: 'civilization', icon: '🌾', description: '약 1만 2천 년 전 농업 시작 → 정착 생활.' },
  /* 아래는 서기 연도로 적는다 — 해가 바뀌어도 '몇 년 전'이 자동으로 맞는다 */
  { id: 'writing',        name: '문자 발명',                      year: -3400,                  category: 'civilization', icon: '📜', description: '메소포타미아 쐐기문자 등 최초의 문자.' },
  { id: 'pyramids',       name: '이집트 피라미드 건설',            year: -2560,                  category: 'civilization', icon: '🔺', description: '기자 대피라미드 건설.' },
  { id: 'romanEmpire',    name: '로마 건국',                      year: -753,                   category: 'civilization', icon: '🏛️', description: '전승상 로마 건국(기원전 753년).' },
  { id: 'jesus',          name: '서기 1년',                       year: 1,                      category: 'civilization', icon: '📅', description: '현재 달력의 기준점.' },
  { id: 'goryeo',         name: '고려 건국 (한국 역사)',           year: 918,                    category: 'civilization', icon: '🇰🇷', description: '왕건이 고려 건국 (918년).' },
  { id: 'industrial',     name: '산업혁명',                       year: 1760,                   category: 'civilization', icon: '⚙️', description: '18세기 후반 영국에서 시작된 산업혁명.' },
  { id: 'electricity',    name: '전기·전구 발명',                 year: 1879,                   category: 'civilization', icon: '💡', description: '에디슨의 백열전구 (1879년).' },
  { id: 'moonLanding',    name: '달 착륙',                        year: 1969,                   category: 'civilization', icon: '🚀', description: '아폴로 11호 달 착륙 (1969년).' },
  { id: 'internet',       name: '월드와이드웹 공개',               year: 1993,                   category: 'civilization', icon: '🌐', description: 'CERN이 웹 기술을 퍼블릭 도메인으로 공개 (1993년).' },
  { id: 'now',            name: '현재',                           year: 0 /* 런타임에 올해로 치환 */, category: 'now', icon: '⏰', description: '지금 이 순간. 우주 138억 년의 마지막 1초도 지나기 전.' },
]

/** 이 사건이 몇 년 전인지 — year로 적힌 사건은 기준 연도에서 계산한다.
    (기원전/서기 사이에 0년이 없지만, 억 단위 스케일에서 1년 차이는 의미가 없어 무시한다) */
export function yearsAgoOf(e: CosmicEvent, currentYear: number): number {
  if (e.id === 'now') return 0
  if (typeof e.year === 'number') return Math.max(0, currentYear - e.year)
  return e.realYearsAgo ?? 0
}

export type CosmicPosition = {
  /** 우주 원년 시작부터 흐른 일수 (0 ~ 365) */
  elapsedDays: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  /** '12월 31일 23:59:32' 같은 표시용 문자열 */
  label: string
  /** 타임라인 가로 위치 (0~1) */
  pct: number
}

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]  // 합 365

/** 실제 연대 → 달력 위치. 손으로 적던 month/day/hour를 대체한다. */
export function cosmicPosition(realYearsAgo: number): CosmicPosition {
  const frac = Math.min(1, Math.max(0, (COSMIC_YEAR_REAL_YEARS - realYearsAgo) / COSMIC_YEAR_REAL_YEARS))
  const elapsedDays = frac * DAYS_IN_COSMIC_YEAR

  if (frac >= 1) {
    return { elapsedDays, month: 12, day: 31, hour: 24, minute: 0, second: 0, label: '12월 31일 24:00:00', pct: 1 }
  }

  let rest = elapsedDays
  let month = 1
  for (let i = 0; i < 12; i++) {
    if (rest < MONTH_DAYS[i]) { month = i + 1; break }
    rest -= MONTH_DAYS[i]
    month = i + 2
  }
  const day = Math.floor(rest) + 1
  const dayFrac = rest - Math.floor(rest)
  const totalSec = dayFrac * 86400
  const hour = Math.floor(totalSec / 3600)
  const minute = Math.floor((totalSec % 3600) / 60)
  const second = totalSec % 60

  /* 12월 31일은 초 단위까지, 그 밖에는 날짜만 보여 준다 — 세이건 캘린더의 관례 */
  const isLastDay = month === 12 && day === 31
  const label = isLastDay
    ? `12월 31일 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${second < 10 ? '0' : ''}${second >= 59 ? second.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') : Math.floor(second)}`
    : `${month}월 ${day}일`

  return { elapsedDays, month, day, hour, minute, second, label, pct: frac }
}

/** 한국어 큰 수 표기.
    ⚠️ 예전 구현은 `yearsAgo / 1_000_000_000`(십억)을 '억'이라 적어
       **138억 년 전이 "13.8억 년 전"으로** 나왔다. 이 도구의 핵심 숫자가 10분의 1이었다.
       억 = 10⁸, 만 = 10⁴다. */
export function fmtRealYears(yearsAgo: number): string {
  if (!Number.isFinite(yearsAgo) || yearsAgo <= 0) return '현재'
  const EOK = 100_000_000
  const MAN = 10_000
  if (yearsAgo >= EOK) {
    const v = yearsAgo / EOK
    // 100억을 넘으면 소수점 없이, 그 아래는 한 자리
    return v >= 100 ? `약 ${Math.round(v).toLocaleString('ko-KR')}억 년 전` : `약 ${Math.round(v * 10) / 10}억 년 전`
  }
  if (yearsAgo >= MAN) {
    const v = yearsAgo / MAN
    return v >= 100 ? `약 ${Math.round(v).toLocaleString('ko-KR')}만 년 전` : `약 ${Math.round(v * 10) / 10}만 년 전`
  }
  return `약 ${Math.round(yearsAgo).toLocaleString('ko-KR')}년 전`
}

/** 사용자 나이 → 코스믹 시간 */
export function ageToCosmic(ageYears: number) {
  const cosmicSeconds = ageYears / COSMIC_SECOND_REAL_YEARS
  return { cosmicSeconds, cosmicMinutes: cosmicSeconds / 60 }
}

export const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
