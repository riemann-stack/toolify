/* ──────────────────────────────────────────────────────
   life/zodiac/zodiacUtils.ts
   띠·별자리 — 통합 프로필·144 궁합 매트릭스·탄생석·60갑자·가족
   ※ 본 도구는 재미용·문화적 해석입니다. 운세·미래 예측·인생 결정 도구가 아닙니다.
   결혼·이별·취업 결정에 사용 X. 관계 갈등 시 전문 상담 권장.
   ────────────────────────────────────────────────────── */

/* ─── 12 띠 (간지) ─── */
export type ZodiacName =
  | '쥐' | '소' | '호랑이' | '토끼' | '용' | '뱀'
  | '말' | '양' | '원숭이' | '닭' | '개' | '돼지'

export interface ZodiacInfo {
  name: ZodiacName
  emoji: string
  element: '수' | '토' | '목' | '금' | '화'
  hanja: string
  traits: string[]
  personality: string
  years: number[]
}

export const CHINESE_ZODIAC: ZodiacInfo[] = [
  { name: '쥐',     emoji: '🐭', element: '수', hanja: '子', traits: ['영리함', '적응력', '기민함'],
    personality: '쥐띠는 영리하고 재치 있으며 적응력이 뛰어납니다. 사교적이고 관찰력이 좋아 주변 상황을 빠르게 파악합니다.',
    years: [1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020] },
  { name: '소',     emoji: '🐮', element: '토', hanja: '丑', traits: ['성실함', '인내심', '신뢰감'],
    personality: '소띠는 성실하고 참을성이 강합니다. 한 번 마음먹은 일은 끝까지 해내는 추진력이 있으며 신뢰를 줍니다.',
    years: [1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021] },
  { name: '호랑이', emoji: '🐯', element: '목', hanja: '寅', traits: ['용감함', '리더십', '열정'],
    personality: '호랑이띠는 용감하고 열정적입니다. 타고난 리더십으로 주목받으며 모험심이 강하고 도전을 즐깁니다.',
    years: [1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022] },
  { name: '토끼',   emoji: '🐰', element: '목', hanja: '卯', traits: ['온순함', '섬세함', '행운'],
    personality: '토끼띠는 온순하고 섬세합니다. 예술적 감각이 뛰어나고 주변 사람들과 조화를 이루는 것을 좋아합니다.',
    years: [1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023] },
  { name: '용',     emoji: '🐲', element: '토', hanja: '辰', traits: ['카리스마', '야망', '자신감'],
    personality: '용띠는 12간지 중 가장 강한 카리스마를 가집니다. 야망이 크고 자신감이 넘치며 사람들을 이끄는 매력이 있습니다.',
    years: [1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024] },
  { name: '뱀',     emoji: '🐍', element: '화', hanja: '巳', traits: ['지혜로움', '직관력', '신중함'],
    personality: '뱀띠는 지혜롭고 직관력이 뛰어납니다. 신중하게 생각하고 행동하며 내면의 깊이가 있습니다.',
    years: [1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025] },
  { name: '말',     emoji: '🐴', element: '화', hanja: '午', traits: ['자유로움', '활동성', '열정'],
    personality: '말띠는 자유를 사랑하고 활동적입니다. 에너지가 넘치고 여행과 모험을 즐깁니다.',
    years: [1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026] },
  { name: '양',     emoji: '🐑', element: '토', hanja: '未', traits: ['온화함', '창의성', '공감능력'],
    personality: '양띠는 온화하고 창의적입니다. 예술적 감수성이 뛰어나고 공감 능력이 높습니다.',
    years: [1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027] },
  { name: '원숭이', emoji: '🐵', element: '금', hanja: '申', traits: ['영리함', '유머', '변화'],
    personality: '원숭이띠는 영리하고 유머 감각이 넘칩니다. 변화를 즐기고 문제 해결 능력이 뛰어납니다.',
    years: [1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028] },
  { name: '닭',     emoji: '🐔', element: '금', hanja: '酉', traits: ['꼼꼼함', '성실함', '솔직함'],
    personality: '닭띠는 꼼꼼하고 성실합니다. 관찰력이 뛰어나고 세밀한 부분까지 신경 씁니다.',
    years: [1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029] },
  { name: '개',     emoji: '🐶', element: '토', hanja: '戌', traits: ['충직함', '정직함', '의리'],
    personality: '개띠는 충직하고 의리가 있습니다. 한 번 맺은 관계를 소중히 여기고 정직함을 중요시합니다.',
    years: [1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030] },
  { name: '돼지',   emoji: '🐷', element: '수', hanja: '亥', traits: ['너그러움', '성실함', '행복'],
    personality: '돼지띠는 너그럽고 성실합니다. 낙천적인 성격으로 주변에 행복을 가져다줍니다.',
    years: [1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031] },
]

export function getZodiacByYear(year: number): ZodiacInfo {
  // 양력 1900년은 쥐띠 (1900 % 12 = 4 → 쥐 인덱스 0)
  // 1924 = 갑자년 = 쥐. 1924 % 12 = 8 → 인덱스 0이 되도록 보정
  const idx = ((year - 4) % 12 + 12) % 12
  return CHINESE_ZODIAC[idx]
}

/* ─── 별자리 ─── */
export type Element = '불' | '지' | '공기' | '물'
export type StarSignName =
  | '양자리' | '황소자리' | '쌍둥이자리' | '게자리'
  | '사자자리' | '처녀자리' | '천칭자리' | '전갈자리'
  | '사수자리' | '염소자리' | '물병자리' | '물고기자리'

export interface StarSignInfo {
  name: StarSignName
  emoji: string
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
  element: Element
  color: string
  traits: string[]
  strengths: string[]
  cautions: string[]
}

export const STAR_SIGNS: StarSignInfo[] = [
  { name: '양자리',     emoji: '♈', startMonth: 3, startDay: 21, endMonth: 4,  endDay: 19, element: '불',   color: '#FF6B6B',
    traits: ['용기', '열정', '솔직함'], strengths: ['리더십', '추진력', '도전 정신'], cautions: ['성급함', '충동적', '독불장군'] },
  { name: '황소자리',   emoji: '♉', startMonth: 4, startDay: 20, endMonth: 5,  endDay: 20, element: '지',   color: '#C8FF3E',
    traits: ['안정', '인내', '신뢰'], strengths: ['끈기', '실용성', '신뢰감'], cautions: ['고집', '변화 거부', '느림'] },
  { name: '쌍둥이자리', emoji: '♊', startMonth: 5, startDay: 21, endMonth: 6,  endDay: 21, element: '공기', color: '#3EC8FF',
    traits: ['호기심', '유연성', '소통'], strengths: ['빠른 학습', '풍부한 대화', '적응력'], cautions: ['변덕', '집중 어려움', '결단력 ↓'] },
  { name: '게자리',     emoji: '♋', startMonth: 6, startDay: 22, endMonth: 7,  endDay: 22, element: '물',   color: '#6B8BFF',
    traits: ['감성', '보호본능', '직관'], strengths: ['공감력', '가족애', '책임감'], cautions: ['예민함', '변덕', '집착'] },
  { name: '사자자리',   emoji: '♌', startMonth: 7, startDay: 23, endMonth: 8,  endDay: 22, element: '불',   color: '#FF6B6B',
    traits: ['자신감', '창의성', '관대함'], strengths: ['카리스마', '리더십', '관대함'], cautions: ['자만', '독선', '과시욕'] },
  { name: '처녀자리',   emoji: '♍', startMonth: 8, startDay: 23, endMonth: 9,  endDay: 22, element: '지',   color: '#C8FF3E',
    traits: ['분석력', '꼼꼼함', '성실'], strengths: ['디테일', '분석력', '책임감'], cautions: ['완벽주의', '비판적', '걱정'] },
  { name: '천칭자리',   emoji: '♎', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23, element: '공기', color: '#3EC8FF',
    traits: ['균형', '공정함', '우아함'], strengths: ['중재', '미적 감각', '외교력'], cautions: ['우유부단', '회피', '의존적'] },
  { name: '전갈자리',   emoji: '♏', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22, element: '물',   color: '#6B8BFF',
    traits: ['집중력', '열정', '통찰'], strengths: ['깊은 통찰', '집중력', '의지'], cautions: ['질투', '비밀스러움', '복수심'] },
  { name: '사수자리',   emoji: '♐', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21, element: '불',   color: '#FF6B6B',
    traits: ['낙관', '자유', '철학'], strengths: ['모험심', '낙천적', '솔직함'], cautions: ['무책임', '말 많음', '경솔'] },
  { name: '염소자리',   emoji: '♑', startMonth: 12, startDay: 22, endMonth: 1,  endDay: 19, element: '지',   color: '#C8FF3E',
    traits: ['인내', '실용성', '야망'], strengths: ['책임감', '근면', '인내'], cautions: ['엄격함', '비관적', '지나친 야망'] },
  { name: '물병자리',   emoji: '♒', startMonth: 1, startDay: 20, endMonth: 2,  endDay: 18, element: '공기', color: '#3EC8FF',
    traits: ['독창성', '인도주의', '독립'], strengths: ['창의성', '독립성', '개혁적'], cautions: ['고독', '냉정함', '예측 불가'] },
  { name: '물고기자리', emoji: '♓', startMonth: 2, startDay: 19, endMonth: 3,  endDay: 20, element: '물',   color: '#6B8BFF',
    traits: ['감수성', '직관력', '공감'], strengths: ['예술성', '공감력', '직관'], cautions: ['현실 도피', '예민함', '의존적'] },
]

export function getStarSign(month: number, day: number): StarSignInfo {
  return STAR_SIGNS.find(s => {
    if (s.startMonth > s.endMonth) {
      return (month === s.startMonth && day >= s.startDay) || (month === s.endMonth && day <= s.endDay)
    }
    return (month === s.startMonth && day >= s.startDay) || (month === s.endMonth && day <= s.endDay)
  }) ?? STAR_SIGNS[0]
}

/* ─── 60갑자 ─── */
export const HEAVENLY_STEMS = [
  { h: '甲', k: '갑', element: '목', yang: true,  desc: '큰 나무·강한 의지' },
  { h: '乙', k: '을', element: '목', yang: false, desc: '풀·유연함' },
  { h: '丙', k: '병', element: '화', yang: true,  desc: '태양·강한 빛' },
  { h: '丁', k: '정', element: '화', yang: false, desc: '촛불·세밀함' },
  { h: '戊', k: '무', element: '토', yang: true,  desc: '큰 산·안정' },
  { h: '己', k: '기', element: '토', yang: false, desc: '땅·포용' },
  { h: '庚', k: '경', element: '금', yang: true,  desc: '큰 쇠·강함' },
  { h: '辛', k: '신', element: '금', yang: false, desc: '보석·정밀함' },
  { h: '壬', k: '임', element: '수', yang: true,  desc: '큰 강·흐름' },
  { h: '癸', k: '계', element: '수', yang: false, desc: '이슬·은은함' },
] as const

export const EARTHLY_BRANCHES = [
  { h: '子', k: '자', animal: '쥐'    as ZodiacName, time: '23~01', element: '수' },
  { h: '丑', k: '축', animal: '소'    as ZodiacName, time: '01~03', element: '토' },
  { h: '寅', k: '인', animal: '호랑이' as ZodiacName, time: '03~05', element: '목' },
  { h: '卯', k: '묘', animal: '토끼'  as ZodiacName, time: '05~07', element: '목' },
  { h: '辰', k: '진', animal: '용'    as ZodiacName, time: '07~09', element: '토' },
  { h: '巳', k: '사', animal: '뱀'    as ZodiacName, time: '09~11', element: '화' },
  { h: '午', k: '오', animal: '말'    as ZodiacName, time: '11~13', element: '화' },
  { h: '未', k: '미', animal: '양'    as ZodiacName, time: '13~15', element: '토' },
  { h: '申', k: '신', animal: '원숭이' as ZodiacName, time: '15~17', element: '금' },
  { h: '酉', k: '유', animal: '닭'    as ZodiacName, time: '17~19', element: '금' },
  { h: '戌', k: '술', animal: '개'    as ZodiacName, time: '19~21', element: '토' },
  { h: '亥', k: '해', animal: '돼지'  as ZodiacName, time: '21~23', element: '수' },
] as const

export interface GanjiInfo {
  stem: { h: string; k: string; element: string; desc: string }
  branch: { h: string; k: string; animal: ZodiacName; element: string }
  order: number
  hanja: string
  hangul: string
}

export function getGanji(year: number): GanjiInfo {
  const stemIdx = ((year - 4) % 10 + 10) % 10
  const branchIdx = ((year - 4) % 12 + 12) % 12
  const order = (((year - 4) % 60) + 60) % 60 + 1
  const stem = HEAVENLY_STEMS[stemIdx]
  const branch = EARTHLY_BRANCHES[branchIdx]
  return {
    stem: { h: stem.h, k: stem.k, element: stem.element, desc: stem.desc },
    branch: { h: branch.h, k: branch.k, animal: branch.animal, element: branch.element },
    order,
    hanja: stem.h + branch.h,
    hangul: stem.k + branch.k,
  }
}

/* ─── 12간지 궁합 (삼합·육합·충) ─── */
export type CompatScore = 1 | 2 | 3 | 4 | 5
export type CompatType = '삼합' | '육합' | '평범' | '평범+' | '충'

export interface CompatRelation {
  score: CompatScore
  type: CompatType
  desc: string
}

/* 삼합: 같은 그룹은 환상적 시너지 */
const SAMHAP_GROUPS: ZodiacName[][] = [
  ['원숭이', '쥐', '용'],          // 신자진 — 물의 삼합
  ['뱀', '닭', '소'],              // 사유축 — 금의 삼합
  ['호랑이', '말', '개'],          // 인오술 — 불의 삼합
  ['돼지', '토끼', '양'],          // 해묘미 — 목의 삼합
]

/* 육합: 짝을 이루는 안정적 조합 */
const YUKHAP_PAIRS: [ZodiacName, ZodiacName][] = [
  ['쥐', '소'],     // 자축
  ['호랑이', '돼지'], // 인해
  ['토끼', '개'],   // 묘술
  ['용', '닭'],     // 진유
  ['뱀', '원숭이'], // 사신
  ['말', '양'],     // 오미
]

/* 충: 정반대로 충돌 */
const CHUNG_PAIRS: [ZodiacName, ZodiacName][] = [
  ['쥐', '말'],     // 자오
  ['소', '양'],     // 축미
  ['호랑이', '원숭이'], // 인신
  ['토끼', '닭'],   // 묘유
  ['용', '개'],     // 진술
  ['뱀', '돼지'],   // 사해
]

export function evalZodiacPair(a: ZodiacName, b: ZodiacName): CompatRelation {
  // 같은 띠
  if (a === b) {
    return { score: 3, type: '평범', desc: '같은 띠 — 비슷한 성향, 서로 잘 이해하지만 자극 ↓' }
  }
  // 충
  for (const [x, y] of CHUNG_PAIRS) {
    if ((a === x && b === y) || (a === y && b === x)) {
      return { score: 1, type: '충', desc: '서로 충돌하기 쉬운 조합 — 노력과 이해 필요' }
    }
  }
  // 삼합
  for (const group of SAMHAP_GROUPS) {
    if (group.includes(a) && group.includes(b)) {
      return { score: 5, type: '삼합', desc: '환상적인 시너지 — 잘 맞는 대표 조합' }
    }
  }
  // 육합
  for (const [x, y] of YUKHAP_PAIRS) {
    if ((a === x && b === y) || (a === y && b === x)) {
      return { score: 4, type: '육합', desc: '안정적이고 조화로운 조합' }
    }
  }
  return { score: 3, type: '평범', desc: '특별한 합·충 X — 일반적' }
}

/* ─── 별자리 원소 궁합 ─── */
export function evalElementPair(a: Element, b: Element): CompatRelation {
  if (a === b) return { score: 5, type: '삼합', desc: '같은 원소 — 자연스러운 공감과 이해' }
  // 시너지 조합
  if ((a === '불' && b === '공기') || (a === '공기' && b === '불')) {
    return { score: 5, type: '삼합', desc: '공기가 불을 살리는 조합 — 활력과 영감' }
  }
  if ((a === '지' && b === '물') || (a === '물' && b === '지')) {
    return { score: 5, type: '삼합', desc: '물이 흙을 적시는 조합 — 안정과 성장' }
  }
  // 충돌 조합
  if ((a === '불' && b === '물') || (a === '물' && b === '불')) {
    return { score: 2, type: '충', desc: '불과 물 — 가치관 차이 큼, 타협 필요' }
  }
  if ((a === '지' && b === '공기') || (a === '공기' && b === '지')) {
    return { score: 2, type: '충', desc: '땅과 바람 — 현실 vs 자유 거리감' }
  }
  return { score: 3, type: '평범', desc: '평범한 조합 — 노력으로 좋아짐' }
}

/* ─── 탄생석·탄생화·탄생색 ─── */
export interface BirthMonthInfo {
  month: number
  stone: string
  flower: string
  color: string
}

export const BIRTH_MONTHS: BirthMonthInfo[] = [
  { month: 1,  stone: '가넷 (Garnet)',           flower: '카네이션·갈란투스',  color: '진홍·검정' },
  { month: 2,  stone: '아메시스트 (Amethyst)',   flower: '제비꽃·앵초',         color: '보라' },
  { month: 3,  stone: '아쿠아마린 (Aquamarine)', flower: '수선화·재스민',       color: '연파랑' },
  { month: 4,  stone: '다이아몬드 (Diamond)',    flower: '데이지·스위트피',     color: '하양' },
  { month: 5,  stone: '에메랄드 (Emerald)',      flower: '은방울꽃·산사나무',   color: '진녹·옥' },
  { month: 6,  stone: '진주·문스톤 (Pearl)',     flower: '장미·인동',           color: '연분홍·하양' },
  { month: 7,  stone: '루비 (Ruby)',             flower: '제비고깔·수련',       color: '빨강' },
  { month: 8,  stone: '페리도트 (Peridot)',      flower: '글라디올러스·양귀비', color: '연두' },
  { month: 9,  stone: '사파이어 (Sapphire)',     flower: '아스터·나팔꽃',       color: '파랑' },
  { month: 10, stone: '오팔·전기석 (Opal)',      flower: '코스모스·금잔화',     color: '무지개' },
  { month: 11, stone: '토파즈·시트린 (Topaz)',   flower: '국화',                color: '노랑·금' },
  { month: 12, stone: '터키석·청금석 (Turquoise)', flower: '수선화·홀리',         color: '하늘·빨강' },
]

export function getBirthMonth(month: number): BirthMonthInfo {
  return BIRTH_MONTHS[month - 1] ?? BIRTH_MONTHS[0]
}

/* ─── 다음 생일·만 나이·환갑 ─── */
export interface AgeInfo {
  age: number               // 만 나이
  daysToBirthday: number    // 다음 생일까지 일수
  nextBirthday: Date
  hwangapYear: number       // 환갑 연도 (60주년)
}

export function getAgeInfo(year: number, month: number, day: number, today = new Date()): AgeInfo {
  let age = today.getFullYear() - year
  const md = today.getMonth() + 1 - month
  if (md < 0 || (md === 0 && today.getDate() < day)) age--

  const nextBirthday = new Date(today.getFullYear(), month - 1, day)
  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday.setFullYear(today.getFullYear() + 1)
  }
  const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000)

  return {
    age, daysToBirthday, nextBirthday,
    hwangapYear: year + 60,
  }
}

/* ─── 가족 구성원 (localStorage) ─── */
export interface FamilyMember {
  id: string
  name: string
  relation: '본인' | '배우자' | '자녀' | '부모' | '형제자매' | '기타'
  year: number
  month: number
  day: number
}

export const FAMILY_STORAGE_KEY = 'youtil-zodiac-family'

export function loadFamily(): FamilyMember[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(FAMILY_STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveFamily(family: FamilyMember[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(family))
  } catch { /* ignore */ }
}

export function newFamilyId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/* ─── 관계별 궁합 팁 ─── */
export type RelationKind = 'lover' | 'friend' | 'family' | 'colleague' | 'business'

export const RELATION_KINDS: { id: RelationKind; label: string; emoji: string }[] = [
  { id: 'lover',     label: '연인·부부',          emoji: '💕' },
  { id: 'friend',    label: '친구',              emoji: '👯' },
  { id: 'family',    label: '가족',              emoji: '👨‍👩‍👧' },
  { id: 'colleague', label: '동료',              emoji: '👔' },
  { id: 'business',  label: '비즈니스 파트너',    emoji: '🤝' },
]

export function relationTip(kind: RelationKind, score: CompatScore): string {
  const base: Record<RelationKind, Record<'high' | 'mid' | 'low', string>> = {
    lover: {
      high: '서로의 매력을 인정하고 함께 취미를 즐겨보세요. 솔직한 소통이 핵심입니다.',
      mid:  '서로 다른 점을 보완으로 받아들이면 좋은 관계가 됩니다. 갈등 시 대화 우선.',
      low:  '서로의 차이를 노력으로 메워야 하는 관계. 솔직한 대화와 인내가 필수입니다.',
    },
    friend: {
      high: '취미·여행·일상 공유에 잘 맞는 친구. 오래 이어질 가능성 ↑.',
      mid:  '거리감을 인정하면 좋은 친구. 일정한 거리와 존중이 중요.',
      low:  '관점 차이가 있을 수 있어 주제 선택에 신중하면 좋은 관계.',
    },
    family: {
      high: '가족 화목에 잘 맞는 조합. 자주 시간을 보내세요.',
      mid:  '가족이라도 서로의 영역을 존중하면 더 좋아집니다.',
      low:  '서로의 가치관이 달라도 가족이라는 끈으로 이어집니다. 인내·이해 우선.',
    },
    colleague: {
      high: '협업 시너지가 좋은 조합. 역할 분담을 명확히 하세요.',
      mid:  '업무 영역을 분리하면 잘 협력할 수 있습니다.',
      low:  '의견 차이가 있을 수 있어 의사소통을 명확하게.',
    },
    business: {
      high: '비즈니스 시너지 좋음. 한 명은 실무, 한 명은 대외 관계 분업 권장.',
      mid:  '계약·역할을 명확히 하면 안정적 파트너십.',
      low:  '의사 결정 기준을 사전에 합의하면 마찰 ↓.',
    },
  }
  const tier = score >= 4 ? 'high' : score === 3 ? 'mid' : 'low'
  return base[kind][tier]
}

/* ─── 별자리 시너지·충돌 텍스트 ─── */
export function elementSynergyText(a: Element, b: Element): string {
  if (a === b) return `같은 ${a} 원소 — 자연스러운 공감대.`
  const set = new Set([a, b])
  if (set.has('불') && set.has('공기')) return '공기가 불을 살리는 시너지 — 활력과 영감의 조합.'
  if (set.has('지') && set.has('물')) return '물과 흙의 시너지 — 안정과 성장의 조합.'
  if (set.has('불') && set.has('물')) return '불과 물 — 가치관 차이 큼, 타협 필요.'
  if (set.has('지') && set.has('공기')) return '땅과 바람 — 현실과 자유의 거리감.'
  return '평범한 조합 — 노력으로 좋아질 수 있습니다.'
}
