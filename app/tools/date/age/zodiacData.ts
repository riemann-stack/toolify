/* ──────────────────────────────────────────────────────
   age/zodiacData.ts
   12간지·12별자리·탄생석/화·전통 호칭·세대·일수 마일스톤
   ────────────────────────────────────────────────────── */

export type ZodiacAnimal = {
  id: string
  name: string
  emoji: string
  traits: string[]
}

/** 12간지 — 한국 띠 (양력 연도 기준 단순화. 정확히는 음력 1월 1일 기준) */
export const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  { id: 'rat',     name: '쥐',     emoji: '🐭', traits: ['지혜', '재치', '적응력'] },
  { id: 'ox',      name: '소',     emoji: '🐂', traits: ['성실', '인내', '신뢰'] },
  { id: 'tiger',   name: '범',     emoji: '🐅', traits: ['용기', '리더십', '열정'] },
  { id: 'rabbit',  name: '토끼',   emoji: '🐇', traits: ['온화', '예술성', '직관'] },
  { id: 'dragon',  name: '용',     emoji: '🐲', traits: ['카리스마', '에너지', '야망'] },
  { id: 'snake',   name: '뱀',     emoji: '🐍', traits: ['지혜', '신비', '전략'] },
  { id: 'horse',   name: '말',     emoji: '🐎', traits: ['활발', '자유', '독립'] },
  { id: 'goat',    name: '양',     emoji: '🐑', traits: ['온순', '예술', '평화'] },
  { id: 'monkey',  name: '원숭이', emoji: '🐒', traits: ['영리', '재치', '사교성'] },
  { id: 'rooster', name: '닭',     emoji: '🐓', traits: ['정직', '근면', '꼼꼼함'] },
  { id: 'dog',     name: '개',     emoji: '🐕', traits: ['충성', '정의', '의리'] },
  { id: 'pig',     name: '돼지',   emoji: '🐖', traits: ['관대', '성실', '복'] },
]

export type WesternZodiac = {
  id: string
  name: string
  emoji: string
  startMonth: number; startDay: number
  endMonth: number;   endDay: number
  element: string
}

/** 12별자리 — 양력 기준 */
export const WESTERN_ZODIAC: WesternZodiac[] = [
  { id: 'capricorn',   name: '염소자리',   emoji: '♑', startMonth: 12, startDay: 22, endMonth: 1,  endDay: 19, element: '흙' },
  { id: 'aquarius',    name: '물병자리',   emoji: '♒', startMonth: 1,  startDay: 20, endMonth: 2,  endDay: 18, element: '공기' },
  { id: 'pisces',      name: '물고기자리', emoji: '♓', startMonth: 2,  startDay: 19, endMonth: 3,  endDay: 20, element: '물' },
  { id: 'aries',       name: '양자리',     emoji: '♈', startMonth: 3,  startDay: 21, endMonth: 4,  endDay: 19, element: '불' },
  { id: 'taurus',      name: '황소자리',   emoji: '♉', startMonth: 4,  startDay: 20, endMonth: 5,  endDay: 20, element: '흙' },
  { id: 'gemini',      name: '쌍둥이자리', emoji: '♊', startMonth: 5,  startDay: 21, endMonth: 6,  endDay: 21, element: '공기' },
  { id: 'cancer',      name: '게자리',     emoji: '♋', startMonth: 6,  startDay: 22, endMonth: 7,  endDay: 22, element: '물' },
  { id: 'leo',         name: '사자자리',   emoji: '♌', startMonth: 7,  startDay: 23, endMonth: 8,  endDay: 22, element: '불' },
  { id: 'virgo',       name: '처녀자리',   emoji: '♍', startMonth: 8,  startDay: 23, endMonth: 9,  endDay: 22, element: '흙' },
  { id: 'libra',       name: '천칭자리',   emoji: '♎', startMonth: 9,  startDay: 23, endMonth: 10, endDay: 22, element: '공기' },
  { id: 'scorpio',     name: '전갈자리',   emoji: '♏', startMonth: 10, startDay: 23, endMonth: 11, endDay: 22, element: '물' },
  { id: 'sagittarius', name: '사수자리',   emoji: '♐', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21, element: '불' },
]

export type BirthGift = { stone: string; stoneEn: string; flower: string; meaning: string }

/** 월별 탄생석·탄생화 */
export const BIRTH_GIFTS: Record<number, BirthGift> = {
  1:  { stone: '가넷',       stoneEn: 'Garnet',     flower: '카네이션',    meaning: '진실' },
  2:  { stone: '자수정',     stoneEn: 'Amethyst',   flower: '아이리스',    meaning: '평화' },
  3:  { stone: '아쿠아마린', stoneEn: 'Aquamarine', flower: '수선화',      meaning: '용기' },
  4:  { stone: '다이아몬드', stoneEn: 'Diamond',    flower: '데이지',      meaning: '순수' },
  5:  { stone: '에메랄드',   stoneEn: 'Emerald',    flower: '은방울꽃',    meaning: '행복' },
  6:  { stone: '진주',       stoneEn: 'Pearl',      flower: '장미',        meaning: '사랑' },
  7:  { stone: '루비',       stoneEn: 'Ruby',       flower: '델피니움',    meaning: '열정' },
  8:  { stone: '페리도트',   stoneEn: 'Peridot',    flower: '글라디올러스', meaning: '강인함' },
  9:  { stone: '사파이어',   stoneEn: 'Sapphire',   flower: '아스터',      meaning: '진실함' },
  10: { stone: '오팔',       stoneEn: 'Opal',       flower: '메리골드',    meaning: '희망' },
  11: { stone: '토파즈',     stoneEn: 'Topaz',      flower: '국화',        meaning: '진심' },
  12: { stone: '터키석',     stoneEn: 'Turquoise',  flower: '포인세티아',  meaning: '축복' },
}

export type DayMilestone = { days: number; name: string; emoji: string }

/** 일수 기준 마일스톤 */
export const DAY_MILESTONES: DayMilestone[] = [
  { days: 100,    name: '백일',       emoji: '🍼' },
  { days: 365,    name: '첫돌',       emoji: '🎂' },
  { days: 1_000,  name: '1,000일',    emoji: '✨' },
  { days: 3_000,  name: '3,000일',    emoji: '🌱' },
  { days: 5_000,  name: '5,000일',    emoji: '⭐' },
  { days: 7_300,  name: '7,300일',    emoji: '🌟' },
  { days: 10_000, name: '10,000일',   emoji: '🎉' },
  { days: 12_345, name: '12,345일',   emoji: '🎯' },
  { days: 15_000, name: '15,000일',   emoji: '💎' },
  { days: 20_000, name: '20,000일',   emoji: '🏆' },
  { days: 25_000, name: '25,000일',   emoji: '👑' },
  { days: 30_000, name: '30,000일',   emoji: '🌠' },
]

export type AgeMilestone = { age: number; name: string; emoji: string }

/** 만 나이 마일스톤 — 법적·사회적·전통 */
export const AGE_MILESTONES: AgeMilestone[] = [
  { age: 1,   name: '만 1세 (첫 돌)',          emoji: '🎂' },
  { age: 7,   name: '만 7세 (취학)',           emoji: '📚' },
  { age: 13,  name: '만 13세 (청소년)',        emoji: '🎒' },
  { age: 18,  name: '만 18세 (선거권·공무원)',  emoji: '🗳️' },
  { age: 19,  name: '만 19세 (성년·주류)',     emoji: '🍷' },
  { age: 20,  name: '만 20세',                 emoji: '🎓' },
  { age: 30,  name: '만 30세',                 emoji: '✨' },
  { age: 40,  name: '만 40세',                 emoji: '🌟' },
  { age: 50,  name: '만 50세',                 emoji: '🏔️' },
  { age: 60,  name: '만 60세 (환갑·還甲)',     emoji: '🎉' },
  { age: 65,  name: '만 65세 (노인복지)',      emoji: '🌸' },
  { age: 70,  name: '만 70세 (고희·칠순)',     emoji: '🌅' },
  { age: 77,  name: '만 77세 (희수·喜壽)',     emoji: '🌺' },
  { age: 80,  name: '만 80세 (산수·팔순)',     emoji: '🎋' },
  { age: 88,  name: '만 88세 (미수·米壽)',     emoji: '🎄' },
  { age: 90,  name: '만 90세 (졸수·구순)',     emoji: '🌟' },
  { age: 99,  name: '만 99세 (백수·白壽)',     emoji: '👑' },
  { age: 100, name: '만 100세 (상수·上壽)',    emoji: '🌠' },
]

export type KoreanAgeName = { age: number; korean: string; meaning: string }

/** 한국 전통 나이 호칭 */
export const KOREAN_AGE_NAMES: KoreanAgeName[] = [
  { age: 60,  korean: '환갑(還甲)·회갑(回甲)', meaning: '60갑자가 한 바퀴 돌아 태어난 해의 간지로 돌아옴' },
  { age: 61,  korean: '진갑(進甲)',            meaning: '환갑 다음해, 새로운 갑자의 시작' },
  { age: 70,  korean: '고희(古稀)·칠순',       meaning: '두보의 시 "人生七十古來稀(인생칠십고래희)"에서 유래' },
  { age: 77,  korean: '희수(喜壽)',            meaning: '"喜"자를 초서로 쓰면 七十七로 보임' },
  { age: 80,  korean: '산수(傘壽)·팔순',       meaning: '"傘"자에 八十이 들어있음' },
  { age: 88,  korean: '미수(米壽)',            meaning: '"米"자를 분해하면 八十八' },
  { age: 90,  korean: '졸수(卒壽)·구순',       meaning: '"卒"의 약자에 九十' },
  { age: 99,  korean: '백수(白壽)',            meaning: '百에서 一을 빼면 99, 흰 머리에서 유래' },
  { age: 100, korean: '상수(上壽)',            meaning: '오랫동안 산다는 의미' },
]

export type Generation = { range: [number, number]; name: string; desc: string }

/** 한국 세대 분류 */
export const GENERATIONS: Generation[] = [
  { range: [1925, 1945], name: '산업화 세대',       desc: '한국 전쟁 전후' },
  { range: [1946, 1954], name: '베이비붐 1세대',    desc: '한국전쟁 직후' },
  { range: [1955, 1964], name: '베이비붐 2세대',    desc: '경제 개발기' },
  { range: [1965, 1979], name: 'X세대',             desc: '고도성장기' },
  { range: [1980, 1994], name: '밀레니얼 세대 (Y)', desc: '디지털 전환기' },
  { range: [1995, 2009], name: 'Z세대',             desc: '디지털 네이티브' },
  { range: [2010, 2024], name: '알파 세대',         desc: 'AI·스마트폰 네이티브' },
  { range: [2025, 2099], name: '베타 세대',         desc: '생성형 AI 시대' },
]
