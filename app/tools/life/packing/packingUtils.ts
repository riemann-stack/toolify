/* 여행 짐 계산기 — 데이터·계산 유틸 */

export type Climate = 'frigid' | 'winter' | 'spring' | 'mild' | 'summer' | 'hot'
export type Laundry = 'none' | 'daily' | 'weekly'
export type Activity = 'rest' | 'city' | 'active' | 'beach'
export type PhotoLevel = 'normal' | 'important' | 'very'

/* ─────────────────────────────────────────────
   기온대 메타
   ───────────────────────────────────────────── */

export interface ClimateMeta {
  id: Climate
  emoji: string
  label: string
  range: string
  tops: string
  outers: string
  outerCount: number      // 아우터 개수
  accessories: string
  tip: string
  color: string
}

export const CLIMATES: ClimateMeta[] = [
  { id: 'frigid', emoji: '❄️', label: '혹한', range: '-10°C 이하',
    tops: '두꺼운 니트·기모 티·플리스', outers: '롱패딩·다운·롱코트', outerCount: 3,
    accessories: '내복·핫팩·털모자·장갑·머플러', tip: '레이어드 필수 (이너+미들+아우터)',
    color: '#3EC8FF' },
  { id: 'winter', emoji: '🥶', label: '겨울·초봄', range: '0~10°C',
    tops: '니트·후리스·긴팔', outers: '패딩·트렌치·코트', outerCount: 2,
    accessories: '머플러·장갑·비니', tip: '낮·밤 온도 차 큼 → 가벼운 이너 추가',
    color: '#9B59B6' },
  { id: 'spring', emoji: '🍂', label: '봄·가을', range: '10~20°C',
    tops: '긴팔·맨투맨·셔츠', outers: '자켓·가디건·바람막이', outerCount: 2,
    accessories: '얇은 머플러·우산', tip: '환절기 → 일교차 큼, 얇은 옷 여러 겹',
    color: '#FFB83E' },
  { id: 'mild', emoji: '🌤️', label: '초여름', range: '20~25°C',
    tops: '반팔·긴팔 혼용', outers: '얇은 가디건·셔츠', outerCount: 1,
    accessories: '우산·선글라스', tip: '실내 냉방 대비 가벼운 가디건 1벌',
    color: '#3EFFD0' },
  { id: 'summer', emoji: '☀️', label: '여름', range: '25~30°C',
    tops: '반팔·민소매·린넨', outers: '얇은 셔츠 (실내 냉방)', outerCount: 1,
    accessories: '모자·선글라스·선크림·우산', tip: '땀 많이 → 옷 +30%, 통풍 소재',
    color: '#FF8C3E' },
  { id: 'hot', emoji: '🔥', label: '한여름·열대', range: '30°C 이상',
    tops: '통풍 셔츠·드라이핏·민소매', outers: '얇은 자켓 (UV·실내 냉방)', outerCount: 1,
    accessories: '모자·선글라스·선크림·수영복·휴대용 선풍기', tip: '땀 많이 + 빈번한 갈아입음 → 옷 +50%',
    color: '#FF3E8C' },
]

export const getClimate = (id: Climate) => CLIMATES.find((c) => c.id === id)!

/* ─────────────────────────────────────────────
   세탁
   ───────────────────────────────────────────── */

export interface LaundryMeta {
  id: Laundry
  emoji: string
  label: string
  cycle: number       // 세탁 주기 (일)
  multiplier: number  // 옷 수 보정 (1/cycle)
  desc: string
}

export const LAUNDRIES: LaundryMeta[] = [
  { id: 'none',   emoji: '❌', label: '세탁 불가',         cycle: 99, multiplier: 1.0,  desc: '세탁 없음 — 일수 그대로 옷 필요' },
  { id: 'weekly', emoji: '🌀', label: '코인·호텔 세탁',    cycle: 4,  multiplier: 0.5,  desc: '3~4일에 1회 — 옷 절반 가능' },
  { id: 'daily',  emoji: '🧺', label: '숙소 매일 세탁',    cycle: 2,  multiplier: 0.35, desc: '매일·격일 — 옷 1/3 가능 (장기 여행 추천)' },
]

export const getLaundry = (id: Laundry) => LAUNDRIES.find((l) => l.id === id)!

/* ─────────────────────────────────────────────
   활동량
   ───────────────────────────────────────────── */

export interface ActivityMeta {
  id: Activity
  emoji: string
  label: string
  multiplier: number
  desc: string
}

export const ACTIVITIES: ActivityMeta[] = [
  { id: 'rest',   emoji: '🛏️', label: '휴양·휴식',       multiplier: 0.9, desc: '리조트·풀빌라·온천' },
  { id: 'city',   emoji: '🚶', label: '도시 관광',        multiplier: 1.0, desc: '미술관·쇼핑·레스토랑' },
  { id: 'active', emoji: '🏃', label: '액티비티·등산',    multiplier: 1.2, desc: '하이킹·자전거·트레킹 (땀 多)' },
  { id: 'beach',  emoji: '🏖️', label: '비치·해양 스포츠', multiplier: 1.3, desc: '서핑·스노쿨링 (바닷물·모래)' },
]

export const getActivity = (id: Activity) => ACTIVITIES.find((a) => a.id === id)!

/* ─────────────────────────────────────────────
   사진 중요도
   ───────────────────────────────────────────── */

export interface PhotoMeta {
  id: PhotoLevel
  emoji: string
  label: string
  bonus: number
}

export const PHOTOS: PhotoMeta[] = [
  { id: 'normal',    emoji: '📷', label: '보통',         bonus: 0 },
  { id: 'important', emoji: '📸', label: '중요',         bonus: 1 },
  { id: 'very',      emoji: '🎥', label: '매우 중요 (인스타·기념일)', bonus: 2 },
]

export const getPhoto = (id: PhotoLevel) => PHOTOS.find((p) => p.id === id)!

/* ─────────────────────────────────────────────
   계산
   ───────────────────────────────────────────── */

export interface PackingInputs {
  days: number
  climate: Climate
  laundry: Laundry
  activity: Activity
  photo: PhotoLevel
  needSports: boolean
  needFormal: boolean
  people: number
}

export interface PackingItem {
  id: string
  emoji: string
  label: string
  count: number       // 1인 기준
  weight: number      // 1개 무게 (g)
  totalWeight: number // count × weight × people
}

export interface PackingResult {
  items: PackingItem[]
  totalWeight: number   // kg
  totalWeightCompressed: number  // 압축팩 -30%
  carrier: { id: string; label: string; capacity: string; }
  airline: string
}

const ITEM_WEIGHTS: Record<string, number> = {
  top: 200, bottom: 400, underwear: 50, sock: 30,
  outer: 800, shoe: 700, sports: 250, formal: 600, swim: 150,
}

export function calcPacking(inp: PackingInputs, mode: 'min' | 'comfort' = 'comfort'): PackingResult {
  const days = Math.max(1, inp.days)
  const people = Math.max(1, inp.people)
  const lau = getLaundry(inp.laundry)
  const act = getActivity(inp.activity)
  const cli = getClimate(inp.climate)
  const ph = getPhoto(inp.photo)

  /* 상의 = ceil(일수 × 활동량 × 세탁 보정) + 1 + 사진 보너스 */
  const topsBase = Math.ceil(days * act.multiplier * lau.multiplier)
  const topsCount = Math.max(2, topsBase + (mode === 'comfort' ? 1 : 0) + ph.bonus)

  /* 하의 = ceil(일수 / 3 × 세탁 보정) + 1 */
  const bottomsBase = Math.ceil((days / 3) * (lau.cycle === 99 ? 1 : lau.cycle / 4))
  const bottomsCount = Math.max(1, bottomsBase + (mode === 'comfort' ? 1 : 0))

  /* 속옷·양말 = 일수 + 1 (세탁 가능 시 절반) */
  const underwearCount = lau.id === 'none'
    ? Math.max(3, days + (mode === 'comfort' ? 2 : 1))
    : Math.max(3, Math.ceil(days * lau.multiplier) + (mode === 'comfort' ? 2 : 1))
  const sockCount = underwearCount

  /* 아우터 = 기온대별 (min은 -1) */
  const outerCount = Math.max(1, cli.outerCount - (mode === 'min' ? 1 : 0))

  /* 신발 */
  let shoeCount = 1
  if (inp.needSports) shoeCount++
  if (inp.needFormal) shoeCount++
  if (mode === 'min') shoeCount = Math.min(shoeCount, 2)
  shoeCount = Math.min(shoeCount, 3)

  /* 운동복 1세트 (상하의) */
  const sportsCount = inp.needSports ? (mode === 'comfort' ? 2 : 1) : 0

  /* 격식 옷 1세트 */
  const formalCount = inp.needFormal ? 1 : 0

  /* 수영복 (해양 활동 또는 한여름) */
  const swimCount = (inp.activity === 'beach' || inp.climate === 'hot') ? (mode === 'comfort' ? 2 : 1) : 0

  const items: PackingItem[] = [
    { id: 'top',       emoji: '👕', label: '상의 (티·셔츠)',      count: topsCount,    weight: ITEM_WEIGHTS.top,       totalWeight: topsCount * ITEM_WEIGHTS.top * people },
    { id: 'bottom',    emoji: '👖', label: '하의 (바지·치마)',     count: bottomsCount, weight: ITEM_WEIGHTS.bottom,    totalWeight: bottomsCount * ITEM_WEIGHTS.bottom * people },
    { id: 'underwear', emoji: '🩲', label: '속옷',                count: underwearCount, weight: ITEM_WEIGHTS.underwear, totalWeight: underwearCount * ITEM_WEIGHTS.underwear * people },
    { id: 'sock',      emoji: '🧦', label: '양말',                count: sockCount,     weight: ITEM_WEIGHTS.sock,      totalWeight: sockCount * ITEM_WEIGHTS.sock * people },
    { id: 'outer',     emoji: '🧥', label: '아우터',              count: outerCount,    weight: ITEM_WEIGHTS.outer,     totalWeight: outerCount * ITEM_WEIGHTS.outer * people },
    { id: 'shoe',      emoji: '👟', label: '신발',                count: shoeCount,     weight: ITEM_WEIGHTS.shoe,      totalWeight: shoeCount * ITEM_WEIGHTS.shoe * people },
  ]
  if (sportsCount > 0) items.push({ id: 'sports', emoji: '🏃', label: '운동복 (상하)', count: sportsCount, weight: ITEM_WEIGHTS.sports, totalWeight: sportsCount * ITEM_WEIGHTS.sports * people })
  if (formalCount > 0) items.push({ id: 'formal', emoji: '👔', label: '격식 옷',       count: formalCount, weight: ITEM_WEIGHTS.formal, totalWeight: formalCount * ITEM_WEIGHTS.formal * people })
  if (swimCount > 0) items.push({ id: 'swim',     emoji: '🩱', label: '수영복',         count: swimCount,   weight: ITEM_WEIGHTS.swim,   totalWeight: swimCount * ITEM_WEIGHTS.swim * people })

  const totalGrams = items.reduce((s, it) => s + it.totalWeight, 0)
  const totalKg = totalGrams / 1000
  const totalKgCompressed = totalKg * 0.85  // 압축팩으로 부피만 줄어 무게는 -15% 정도

  /* 캐리어 추천 */
  let carrier = { id: 'cabin', label: '기내용 (20인치)', capacity: '~ 7kg' }
  if (totalKg > 7 && totalKg <= 15) carrier = { id: '24', label: '24인치 (중형)', capacity: '~ 15kg' }
  else if (totalKg > 15 && totalKg <= 23) carrier = { id: '28', label: '28인치 (대형)', capacity: '~ 23kg' }
  else if (totalKg > 23) carrier = { id: 'large', label: '28인치+ 또는 분할', capacity: '23kg+' }

  /* 항공사 한도 안내 */
  let airline = ''
  if (totalKg <= 7) airline = '✅ 기내 휴대 가능 (대부분 LCC 7~10kg, 풀서비스 7~12kg)'
  else if (totalKg <= 15) airline = '⚠️ 위탁 수하물 (대부분 LCC 15~20kg, 풀서비스 23kg)'
  else if (totalKg <= 23) airline = '⚠️ 위탁 수하물 (풀서비스 표준 23kg, LCC 추가 요금 가능)'
  else airline = '🚨 23kg 초과 — 추가 요금 또는 짐 분할 필요 (대부분 항공사 30kg 한도)'

  return {
    items,
    totalWeight: totalKg,
    totalWeightCompressed: totalKgCompressed,
    carrier,
    airline,
  }
}

/* ─────────────────────────────────────────────
   체크리스트 (옷 외 항목)
   ───────────────────────────────────────────── */

export interface ChecklistCategory {
  id: string
  emoji: string
  label: string
  items: string[]
  optional?: boolean
}

export const CHECKLISTS: ChecklistCategory[] = [
  {
    id: 'toiletry', emoji: '🧴', label: '세면도구',
    items: ['칫솔·치약', '샴푸·린스', '바디워시·비누', '폼클렌징', '로션·스킨', '선크림', '면도기·면도크림', '여성용품', '면봉·면도면', '헤어 빗·드라이어'],
  },
  {
    id: 'medicine', emoji: '💊', label: '비상약',
    items: ['상비약 키트', '소화제·지사제', '진통제', '반창고·밴드', '멀미약', '해열제', '연고 (피부)', '안약', '비타민', '복용 중인 약 (처방전 사본)'],
  },
  {
    id: 'electronics', emoji: '📱', label: '전자기기',
    items: ['핸드폰·충전기', '보조배터리 (위탁 X)', '이어폰·헤드폰', '카메라·메모리카드', '돼지코 (멀티 어댑터)', 'eSim·로밍 유심', '노트북·태블릿', '셀카봉·삼각대', '드라이기 (없는 호텔 대비)'],
  },
  {
    id: 'misc', emoji: '🧳', label: '잡화',
    items: ['우산·우비', '접이식 가방·에코백', '압축팩 (의류)', '빨래비누·세제', '옷걸이 (비치 호텔 적음)', '자물쇠·TSA 락', '안대·목 베개', '수건 (호스텔)', '실내화·슬리퍼', '비닐봉투 (젖은 옷)'],
  },
  {
    id: 'docs', emoji: '🆔', label: '서류 (필수)',
    items: ['여권 (만료 6개월 이상)', '여권 사본 + 사진', '항공권·E-티켓', '호텔·숙소 예약 확인서', '여행자보험증', '환전·신용카드', '국제운전면허증 (필요시)', '비자 (해당 국가)', '백신 증명서 (해당 국가)', '비상 연락처 메모'],
  },
  {
    id: 'beauty', emoji: '💄', label: '화장품·뷰티',
    items: ['기초화장품 (스킨·로션·에센스)', '메이크업 (파운데이션·립·아이)', '향수 (소형)', '헤어롤·고데기', '네일 키트', '클렌징 티슈', '미니어처 사이즈 (액체 100ml 룰)'],
  },
  {
    id: 'baby', emoji: '👶', label: '아기 동반', optional: true,
    items: ['기저귀 (충분히)', '물티슈', '분유·이유식', '젖병·이유식 도구', '아기띠·유모차', '담요·블랭킷', '아기 옷 (1일 2~3벌)', '아기 약·체온계', '장난감·인형', '카시트 (해당 시)'],
  },
]

/* ─────────────────────────────────────────────
   시나리오 프리셋
   ───────────────────────────────────────────── */

export interface PackingScenario {
  id: string
  emoji: string
  title: string
  desc: string
  inputs: PackingInputs
  notes: string[]
}

export const SCENARIOS: PackingScenario[] = [
  {
    id: 'honeymoon',
    emoji: '🥂',
    title: '신혼여행 (해외 7박)',
    desc: '사진 매우 중요 + 격식 디너 일정 + 휴양·관광 혼합',
    inputs: { days: 7, climate: 'mild', laundry: 'weekly', activity: 'city', photo: 'very', needSports: false, needFormal: true, people: 2 },
    notes: ['📸 콘셉트 의상 3~4벌 (커플룩 1세트)', '👔 격식 디너용 정장·드레스 1세트', '💍 결혼반지·악세서리', '📷 카메라·삼각대'],
  },
  {
    id: 'sea_resort',
    emoji: '🏖️',
    title: '동남아 휴양 (5박)',
    desc: '비치·풀빌라 + 매일 세탁 가능 + 한여름',
    inputs: { days: 5, climate: 'hot', laundry: 'daily', activity: 'beach', photo: 'important', needSports: false, needFormal: false, people: 2 },
    notes: ['🩱 수영복 2벌 (갈아입기)', '🌞 선크림 SPF 50+', '🕶️ 모자·선글라스', '🩴 슬리퍼·아쿠아슈즈', '👜 비치백·방수 가방'],
  },
  {
    id: 'eu_city',
    emoji: '🏛️',
    title: '유럽 자유여행 (10박)',
    desc: '도시 관광 + 환절기 + 매일 걷기',
    inputs: { days: 10, climate: 'spring', laundry: 'weekly', activity: 'city', photo: 'important', needSports: false, needFormal: false, people: 1 },
    notes: ['👟 편한 운동화 (매일 1만보+)', '🧥 가벼운 자켓·바람막이 (일교차)', '🎒 데이팩 (관광용)', '🔌 유럽식 멀티 어댑터', '☂️ 접이식 우산'],
  },
  {
    id: 'golf',
    emoji: '⛳',
    title: '골프투어 (4박, 동남아)',
    desc: '운동복 필수 + 라운드 4회 + 휴양',
    inputs: { days: 4, climate: 'summer', laundry: 'daily', activity: 'active', photo: 'normal', needSports: true, needFormal: false, people: 4 },
    notes: ['⛳ 골프복 4세트 (라운드별)', '🧤 골프 장갑 2~3개', '👟 골프화 + 일반화', '🧴 골프공·티 (현지 비싸요)', '☔ 비옷 (스콜 대비)'],
  },
  {
    id: 'camping',
    emoji: '🎒',
    title: '캠핑·등산 (3박)',
    desc: '액티비티 + 변덕스러운 날씨 + 짧은 일정',
    inputs: { days: 3, climate: 'spring', laundry: 'none', activity: 'active', photo: 'normal', needSports: true, needFormal: false, people: 2 },
    notes: ['🥾 등산화·트래킹화', '🧥 방수·방풍 자켓', '🦟 모기·벌레 퇴치제', '🔦 헤드랜턴', '🧴 응급 키트 (찰과상·뱀·벌)'],
  },
  {
    id: 'baby_family',
    emoji: '👨‍👩‍👧‍👦',
    title: '아기 동반 가족여행 (5박)',
    desc: '아기 항목 추가 + 가족 4인 + 도시 관광',
    inputs: { days: 5, climate: 'mild', laundry: 'weekly', activity: 'city', photo: 'important', needSports: false, needFormal: false, people: 4 },
    notes: ['👶 기저귀·물티슈 충분히', '🍼 분유·이유식 (현지 어려움)', '🚼 아기띠 + 휴대용 유모차', '🛏️ 아기 담요·블랭킷', '💊 아기 상비약·체온계'],
  },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtKg(kg: number): string {
  return `${fmt(kg, 1)} kg`
}
