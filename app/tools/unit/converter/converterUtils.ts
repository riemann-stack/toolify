/* ──────────────────────────────────────────────────────
   unit/converter/converterUtils.ts
   9개 카테고리 단위 변환기 — 한국 전통·생활 단위 포함
   ────────────────────────────────────────────────────── */

export type CategoryId = 'length' | 'area' | 'weight' | 'volume' | 'temperature' | 'time' | 'speed' | 'pressure' | 'torque' | 'energy' | 'data' | 'brix' | 'concentration' | 'angle'

export interface UnitDef {
  id: string
  name: string
  shortName: string
  toBase: number       // base 단위(첫 단위)로의 환산 계수
  isKorean?: boolean   // 한국 전통/생활 단위
  note?: string
}

export interface Category {
  id: CategoryId
  name: string
  icon: string
  baseUnit: string
  units: UnitDef[]
}

/* ─── 길이 (base: m) ─── */
const UNITS_LENGTH: UnitDef[] = [
  { id: 'mm',    name: '밀리미터',  shortName: 'mm',    toBase: 0.001 },
  { id: 'cm',    name: '센티미터',  shortName: 'cm',    toBase: 0.01 },
  { id: 'm',     name: '미터',      shortName: 'm',     toBase: 1 },
  { id: 'km',    name: '킬로미터',  shortName: 'km',    toBase: 1000 },
  { id: 'inch',  name: '인치',      shortName: 'in',    toBase: 0.0254 },
  { id: 'ft',    name: '피트',      shortName: 'ft',    toBase: 0.3048 },
  { id: 'yard',  name: '야드',      shortName: 'yd',    toBase: 0.9144 },
  { id: 'mile',  name: '마일',      shortName: 'mi',    toBase: 1609.344 },
  { id: 'pun',   name: '푼 (分)',    shortName: '푼',    toBase: 0.00303,   isKorean: true, note: '약 3.03mm · 1/10 치 · 1/100 자' },
  { id: 'chi',   name: '치/촌 (寸)', shortName: '치',    toBase: 0.0303,    isKorean: true, note: '약 3.03cm · 10푼 · 1/10 자' },
  { id: 'ja',    name: '자/척 (尺)', shortName: '자',    toBase: 0.303,     isKorean: true, note: '약 30.3cm · 10치 (척과 같음)' },
  { id: 'bo',    name: '보 (步)',    shortName: '보',    toBase: 1.818,     isKorean: true, note: '약 1.818m · 6자' },
  { id: 'gan',   name: '간 (間)',    shortName: '간',    toBase: 1.818,     isKorean: true, note: '건축 단위 · 보와 동일' },
  { id: 'jeong', name: '정 (町)',    shortName: '정',    toBase: 109,       isKorean: true, note: '약 109m' },
  { id: 'ri',    name: '리 (里, 한국)', shortName: '리', toBase: 393,       isKorean: true, note: '한국 약 393m (일본 리는 3,927m)' },
]

/* ─── 면적 (base: ㎡) ─── */
const UNITS_AREA: UnitDef[] = [
  { id: 'sqm',     name: '제곱미터',     shortName: '㎡',       toBase: 1 },
  { id: 'a',       name: '아르',         shortName: 'a',        toBase: 100 },
  { id: 'ha',      name: '헥타르',       shortName: 'ha',       toBase: 10000 },
  { id: 'sqkm',    name: '제곱킬로미터', shortName: 'km²',      toBase: 1000000 },
  { id: 'sqft',    name: '제곱피트',     shortName: 'ft²',      toBase: 0.092903 },
  { id: 'sqyd',    name: '제곱야드',     shortName: 'yd²',      toBase: 0.836127 },
  { id: 'acre',    name: '에이커',       shortName: 'acre',     toBase: 4046.86 },
  { id: 'pyeong',  name: '평 (坪)',       shortName: '평',       toBase: 3.305785, isKorean: true, note: '정확히 400/121 ㎡ · 1평 ≈ 3.3057㎡' },
  { id: 'danbo',   name: '단보 (段步)',   shortName: '단',       toBase: 991.74,   isKorean: true, note: '약 300평 · 1/10 정보' },
  { id: 'jeongbo', name: '정보 (町步)',   shortName: '정보',      toBase: 9917.36,  isKorean: true, note: '약 3,000평 · 10단보' },
  { id: 'majigi',  name: '마지기',        shortName: '마지기',    toBase: 661.16,   isKorean: true, note: '약 200평 (지역별 차이 큼)' },
]

/* ─── 무게 (base: g) ─── */
const UNITS_WEIGHT: UnitDef[] = [
  { id: 'mg',  name: '밀리그램',  shortName: 'mg',   toBase: 0.001 },
  { id: 'g',   name: '그램',      shortName: 'g',    toBase: 1 },
  { id: 'kg',  name: '킬로그램',  shortName: 'kg',   toBase: 1000 },
  { id: 'ton', name: '톤',        shortName: 't',    toBase: 1000000 },
  { id: 'oz',  name: '온스',      shortName: 'oz',   toBase: 28.3495 },
  { id: 'lb',  name: '파운드',    shortName: 'lb',   toBase: 453.592 },
  { id: 'don', name: '돈 (錢)',    shortName: '돈',   toBase: 3.75,   isKorean: true, note: '귀금속 단위 · 1돈 = 3.75g' },
  { id: 'nyang', name: '냥 (兩)',  shortName: '냥',   toBase: 37.5,   isKorean: true, note: '10돈 · 37.5g' },
  { id: 'geun',  name: '근 (斤)',   shortName: '근',   toBase: 600,   isKorean: true, note: '한국 시장 관행 600g · 옛날 400g · 중국 500g' },
  { id: 'gwan',  name: '관 (貫)',   shortName: '관',   toBase: 3750,  isKorean: true, note: '100냥 · 3,750g' },
]

/* ─── 부피 (base: ml) ─── */
const UNITS_VOLUME: UnitDef[] = [
  { id: 'ml',         name: '밀리리터',          shortName: 'ml',  toBase: 1 },
  { id: 'L',          name: '리터',              shortName: 'L',   toBase: 1000 },
  { id: 'fl_oz',      name: '플루이드 온스 (US)', shortName: 'fl oz', toBase: 29.5735 },
  { id: 'gallon',     name: '갤런 (US)',         shortName: 'gal', toBase: 3785.41 },
  { id: 'tbsp',       name: '큰술 (Tbsp, 표준)',  shortName: 'Tbsp', toBase: 15 },
  { id: 'tsp',        name: '작은술 (tsp, 표준)', shortName: 'tsp',  toBase: 5 },
  { id: 'cup_kr',     name: '컵 (한국 표준)',     shortName: '컵', toBase: 200, isKorean: true, note: '한국 계량컵 1컵 = 200ml' },
  { id: 'cup_us',     name: '컵 (미국)',         shortName: 'cup', toBase: 240 },
  { id: 'paper_cup',  name: '종이컵 (생활)',     shortName: '종이컵', toBase: 180, isKorean: true, note: '정수기·자판기 표준 약 180ml' },
  { id: 'soju',       name: '소주잔',            shortName: '소주잔', toBase: 50,  isKorean: true, note: '약 50ml (1샷)' },
  { id: 'beer_500',   name: '맥주 호프잔',       shortName: '호프잔', toBase: 500, isKorean: true, note: '500ml 호프잔' },
  { id: 'rice_spoon', name: '밥숟가락 (어림)',   shortName: '밥숟가락', toBase: 12, isKorean: true, note: '약 12ml · 큰술과 다름' },
  { id: 'tea_spoon',  name: '티스푼 (어림)',     shortName: '티스푼', toBase: 4,   isKorean: true, note: '약 4ml · 작은술과 다름' },
  { id: 'jongji',     name: '종지',              shortName: '종지', toBase: 40,  isKorean: true, note: '양념용 작은 그릇 · 약 30~50ml' },
  { id: 'hop',        name: '홉 (合)',           shortName: '홉',   toBase: 180, isKorean: true, note: '180ml · 한국 전통' },
  { id: 'doe',        name: '되 (升)',           shortName: '되',   toBase: 1800, isKorean: true, note: '10홉 · 1.8L' },
  { id: 'mal',        name: '말 (斗)',           shortName: '말',   toBase: 18000, isKorean: true, note: '10되 · 18L' },
  { id: 'seom',       name: '섬 (石)',           shortName: '섬',   toBase: 180000, isKorean: true, note: '10말 · 180L' },
]

/* ─── 시간 (base: s) ─── */
const UNITS_TIME: UnitDef[] = [
  { id: 'ms',     name: '밀리초',  shortName: 'ms',   toBase: 0.001 },
  { id: 's',      name: '초',      shortName: 's',    toBase: 1 },
  { id: 'min',    name: '분',      shortName: 'min',  toBase: 60 },
  { id: 'h',      name: '시간',    shortName: 'h',    toBase: 3600 },
  { id: 'day',    name: '일',      shortName: 'd',    toBase: 86400 },
  { id: 'week',   name: '주',      shortName: 'wk',   toBase: 604800 },
  { id: 'month',  name: '월 (30일)', shortName: 'mo', toBase: 2592000, note: '30일 가정' },
  { id: 'year',   name: '년 (365일)', shortName: 'yr', toBase: 31536000, note: '365일 가정' },
  { id: 'work_h', name: '근무시간', shortName: '근무h', toBase: 3600, note: '주 40시간 / 월 209시간 / 연 2,508시간' },
]

/* ─── 속도 (base: m/s) ─── */
const UNITS_SPEED: UnitDef[] = [
  { id: 'mps',  name: '미터/초',     shortName: 'm/s',  toBase: 1 },
  { id: 'kmh',  name: '킬로미터/시',  shortName: 'km/h', toBase: 0.27778 },
  { id: 'mph',  name: '마일/시',      shortName: 'mph',  toBase: 0.44704 },
  { id: 'knot', name: '노트',         shortName: 'kn',   toBase: 0.51444 },
  { id: 'ftps', name: '피트/초',      shortName: 'ft/s', toBase: 0.3048 },
]

/* ─── 압력 (base: Pa) ─── */
const UNITS_PRESSURE: UnitDef[] = [
  { id: 'Pa',      name: '파스칼',           shortName: 'Pa',      toBase: 1 },
  { id: 'hPa',     name: '헥토파스칼 (기상)', shortName: 'hPa',     toBase: 100 },
  { id: 'kPa',     name: '킬로파스칼',        shortName: 'kPa',     toBase: 1000 },
  { id: 'MPa',     name: '메가파스칼',        shortName: 'MPa',     toBase: 1000000 },
  { id: 'bar',     name: '바',               shortName: 'bar',     toBase: 100000 },
  { id: 'mbar',    name: '밀리바',            shortName: 'mbar',    toBase: 100 },
  { id: 'psi',     name: 'PSI (타이어·미국)', shortName: 'psi',     toBase: 6894.76 },
  { id: 'atm',     name: '기압',             shortName: 'atm',     toBase: 101325 },
  { id: 'mmHg',    name: 'mmHg (혈압·기상)',  shortName: 'mmHg',    toBase: 133.322 },
  { id: 'kgfcm2',  name: 'kgf/cm² (산업·공조)', shortName: 'kgf/cm²', toBase: 98066.5, note: '1 kgf/cm² ≈ 0.98 bar ≈ 14.22 psi · 한국 산업·기계 표준' },
  { id: 'inHg',    name: 'inHg (기압·항공)',  shortName: 'inHg',    toBase: 3386.39 },
  { id: 'torr',    name: '토르 (Torr, 진공)',  shortName: 'Torr',    toBase: 133.322 },
]

/* ─── 토크 (base: N·m) ─── */
const UNITS_TORQUE: UnitDef[] = [
  { id: 'Nm',     name: '뉴턴미터',          shortName: 'N·m',    toBase: 1 },
  { id: 'kNm',    name: '킬로뉴턴미터',       shortName: 'kN·m',   toBase: 1000 },
  { id: 'Ncm',    name: '뉴턴센티미터',       shortName: 'N·cm',   toBase: 0.01 },
  { id: 'kgfm',   name: 'kgf·m (한국·일본)',  shortName: 'kgf·m',  toBase: 9.80665, note: '한국 정비·기계 현장 표준' },
  { id: 'kgfcm',  name: 'kgf·cm',            shortName: 'kgf·cm', toBase: 0.0980665 },
  { id: 'lbfft',  name: 'lbf·ft (미국)',     shortName: 'lbf·ft', toBase: 1.35582,  note: '자동차 매뉴얼 미국 표기' },
  { id: 'lbfin',  name: 'lbf·in',           shortName: 'lbf·in', toBase: 0.112985 },
  { id: 'ozfin',  name: 'ozf·in (소형)',    shortName: 'ozf·in', toBase: 0.00706155 },
  { id: 'dyn_cm', name: 'dyn·cm (CGS)',     shortName: 'dyn·cm', toBase: 1e-7 },
]

/* ─── 에너지 (base: J) ─── */
const UNITS_ENERGY: UnitDef[] = [
  { id: 'J',       name: '줄',                  shortName: 'J',     toBase: 1 },
  { id: 'kJ',      name: '킬로줄',               shortName: 'kJ',    toBase: 1000 },
  { id: 'MJ',      name: '메가줄',               shortName: 'MJ',    toBase: 1000000 },
  { id: 'cal',     name: '칼로리 (소·물리)',      shortName: 'cal',   toBase: 4.184 },
  { id: 'kcal',    name: '킬로칼로리 (Cal·식품)', shortName: 'kcal',  toBase: 4184, note: '식품 영양 라벨의 "Cal" = kcal' },
  { id: 'Wh',      name: '와트시',               shortName: 'Wh',    toBase: 3600 },
  { id: 'kWh',     name: '킬로와트시 (전기요금)', shortName: 'kWh',   toBase: 3600000, note: '한전 요금 단위' },
  { id: 'MWh',     name: '메가와트시',           shortName: 'MWh',   toBase: 3.6e9 },
  { id: 'BTU',     name: 'BTU (에어컨·보일러)',  shortName: 'BTU',   toBase: 1055.06, note: '에어컨 냉방능력 표기 단위' },
  { id: 'kBTU',    name: '천 BTU',              shortName: 'kBTU',  toBase: 1055060 },
  { id: 'ftlb',    name: 'ft·lb (일·에너지)',    shortName: 'ft·lb', toBase: 1.35582 },
  { id: 'erg',     name: '에르그 (CGS)',         shortName: 'erg',   toBase: 1e-7 },
  { id: 'eV',      name: '전자볼트 (원자물리)',   shortName: 'eV',    toBase: 1.602176634e-19 },
  { id: 'TNT_g',   name: 'TNT 그램 등가',        shortName: 'g TNT', toBase: 4184, note: '1g TNT = 4,184 J · 폭발력 비교' },
  { id: 'TNT_t',   name: 'TNT 톤 등가',          shortName: 't TNT', toBase: 4.184e9 },
]

/* ─── 데이터 (base: byte, 1024 진법) ─── */
const UNITS_DATA: UnitDef[] = [
  { id: 'bit',  name: '비트',     shortName: 'bit',  toBase: 1 / 8 },
  { id: 'B',    name: '바이트',   shortName: 'B',    toBase: 1 },
  { id: 'KB',   name: '킬로바이트 (1000)', shortName: 'KB',  toBase: 1000 },
  { id: 'MB',   name: '메가바이트 (1000²)', shortName: 'MB', toBase: 1000000 },
  { id: 'GB',   name: '기가바이트 (1000³)', shortName: 'GB', toBase: 1000000000 },
  { id: 'TB',   name: '테라바이트 (1000⁴)', shortName: 'TB', toBase: 1000000000000 },
  { id: 'KiB',  name: '키비바이트 (1024)',  shortName: 'KiB', toBase: 1024 },
  { id: 'MiB',  name: '메비바이트 (1024²)', shortName: 'MiB', toBase: 1048576 },
  { id: 'GiB',  name: '기비바이트 (1024³)', shortName: 'GiB', toBase: 1073741824 },
  { id: 'TiB',  name: '테비바이트 (1024⁴)', shortName: 'TiB', toBase: 1099511627776 },
]

/* ─── 당도·염도 (base: % m/m) ─── */
const UNITS_BRIX: UnitDef[] = [
  { id: 'brix',      name: 'Brix (당도)',          shortName: '°Bx',     toBase: 1,       note: '1°Bx = 100g 용액 중 1g 자당 (수용액 가정)' },
  { id: 'pct_mm',    name: '% (질량 분율)',         shortName: '%',       toBase: 1,       note: '1% = 1 g / 100 g (= Brix)' },
  { id: 'g_100g',    name: 'g/100g',               shortName: 'g/100g',  toBase: 1,       note: '질량 분율 % 와 동일' },
  { id: 'g_L',       name: 'g/L (용액 1L 기준)',    shortName: 'g/L',     toBase: 0.1,     note: '물 가정(밀도 1 g/mL) · 1 g/L = 0.1%' },
  { id: 'ppm_food',  name: 'ppm (백만분율)',        shortName: 'ppm',     toBase: 0.0001,  note: '1% = 10,000 ppm' },
  { id: 'salinity',  name: '염도 % (소금 질량비)',   shortName: '염%',     toBase: 1,       note: '소금 / 용액 질량 % · 김치·장아찌 표준' },
  { id: 'brine_gL',  name: '소금물 농도 (g/L)',     shortName: '소금 g/L', toBase: 0.1,     note: '용액 1L 당 소금 그램 · 절임 레시피용' },
]

/* ─── 농도 (base: % m/m) ─── */
const UNITS_CONC: UnitDef[] = [
  { id: 'pct_c',     name: '% (백분율)',           shortName: '%',     toBase: 1 },
  { id: 'permil',    name: '‰ (천분율)',           shortName: '‰',     toBase: 0.1,       note: '해수 평균 약 35‰ (35 g/kg)' },
  { id: 'ppm_c',     name: 'ppm (백만분율)',        shortName: 'ppm',   toBase: 0.0001,    note: '1% = 10,000 ppm' },
  { id: 'ppb_c',     name: 'ppb (10억분율)',        shortName: 'ppb',   toBase: 1e-7,      note: '1 ppm = 1,000 ppb · 미량 분석' },
  { id: 'mg_L',      name: 'mg/L',                 shortName: 'mg/L',  toBase: 0.0001,    note: '수용액 가정 · 1 mg/L ≈ 1 ppm' },
  { id: 'ug_L',      name: 'µg/L (마이크로그램/L)', shortName: 'µg/L',  toBase: 1e-7,      note: '수용액 가정 · 1 µg/L ≈ 1 ppb' },
  { id: 'g_L_c',     name: 'g/L',                  shortName: 'g/L',   toBase: 0.1,       note: '수용액 가정 · 1 g/L = 0.1%' },
]

/* ─── 각도·기울기 (base: 도 °) — 비선형 ─── */
const UNITS_ANGLE: UnitDef[] = [
  { id: 'deg',     name: '도 (°)',                  shortName: '°',     toBase: 1 },
  { id: 'rad',     name: '라디안',                  shortName: 'rad',   toBase: 1,       note: '1 rad ≈ 57.2958° · 180° = π rad' },
  { id: 'grad',    name: '그레이드 (그라디안)',      shortName: 'grad',  toBase: 1,       note: '직각 = 100 grad · 측량용' },
  { id: 'percent_slope', name: '% 경사',            shortName: '%',     toBase: 1,       note: '100 × tan(각도) · 5% ≈ 2.86° · 도로 경사' },
  { id: 'permil_slope',  name: '‰ 구배',           shortName: '‰',     toBase: 1,       note: '1000 × tan(각도) · 철도·하수 구배' },
  { id: 'ratio_n1',      name: '수평:수직 비율 (N:1)', shortName: 'N:1', toBase: 1,       note: '수평 N : 수직 1 · 20:1 ≈ 2.86° · 토목 비탈면' },
  { id: 'one_over_n',    name: '1/n 구배',          shortName: '1/n',   toBase: 1,       note: '수직 1 : 수평 N · 1/100 = 1% · 도로·배관' },
  { id: 'mulae',         name: '한국 물매 (치/자)',  shortName: '물매',  toBase: 1,       isKorean: true, note: 'N치 물매 = 1자(10치) 수평당 N치 수직 · 한옥 지붕' },
]

/* ─── 카테고리 모음 ─── */
export const CATEGORIES: Category[] = [
  { id: 'length',      name: '길이',   icon: '📏', baseUnit: 'm',  units: UNITS_LENGTH },
  { id: 'area',        name: '면적',   icon: '🏠', baseUnit: '㎡', units: UNITS_AREA },
  { id: 'weight',      name: '무게',   icon: '⚖️', baseUnit: 'g',  units: UNITS_WEIGHT },
  { id: 'volume',      name: '부피',   icon: '🧴', baseUnit: 'ml', units: UNITS_VOLUME },
  { id: 'temperature', name: '온도',   icon: '🌡️', baseUnit: '℃', units: [
    { id: 'C', name: '섭씨',  shortName: '℃', toBase: 1 },
    { id: 'F', name: '화씨',  shortName: '℉', toBase: 1 },
    { id: 'K', name: '켈빈',  shortName: 'K', toBase: 1 },
    { id: 'R', name: '랭킨',  shortName: '°R', toBase: 1 },
  ] },
  { id: 'time',        name: '시간',   icon: '⏱️', baseUnit: 's',   units: UNITS_TIME },
  { id: 'speed',       name: '속도',   icon: '🚗', baseUnit: 'm/s', units: UNITS_SPEED },
  { id: 'pressure',    name: '압력',   icon: '💨', baseUnit: 'Pa',  units: UNITS_PRESSURE },
  { id: 'torque',      name: '토크',   icon: '🔧', baseUnit: 'N·m', units: UNITS_TORQUE },
  { id: 'energy',      name: '에너지', icon: '⚡', baseUnit: 'J',   units: UNITS_ENERGY },
  { id: 'data',        name: '데이터', icon: '💾', baseUnit: 'B',   units: UNITS_DATA },
  { id: 'brix',        name: '당도·염도', icon: '🍯', baseUnit: '%',  units: UNITS_BRIX },
  { id: 'concentration', name: '농도',   icon: '🧪', baseUnit: '%',  units: UNITS_CONC },
  { id: 'angle',       name: '각도·기울기', icon: '📐', baseUnit: '°', units: UNITS_ANGLE },
]

/* ─── 변환 ─── */
export function convert(value: number, from: UnitDef, to: UnitDef, categoryId?: CategoryId): number {
  if (categoryId === 'temperature') return convertTemperature(value, from.id, to.id)
  if (categoryId === 'angle')       return convertAngle(value, from.id, to.id)
  // 일반 변환 (선형)
  const baseValue = value * from.toBase
  return baseValue / to.toBase
}

export function convertTemperature(value: number, from: string, to: string): number {
  // 1) 섭씨로 변환
  let c: number
  switch (from) {
    case 'C': c = value; break
    case 'F': c = (value - 32) * 5 / 9; break
    case 'K': c = value - 273.15; break
    case 'R': c = (value - 491.67) * 5 / 9; break
    default:  c = value
  }
  // 2) 목표 단위로 변환
  switch (to) {
    case 'C': return c
    case 'F': return c * 9 / 5 + 32
    case 'K': return c + 273.15
    case 'R': return c * 9 / 5 + 491.67
    default:  return c
  }
}

/* ─── 각도·기울기 변환 (비선형) ─── */
export function convertAngle(value: number, from: string, to: string): number {
  // 1) 입력 → 도(°)로 변환
  let deg: number
  switch (from) {
    case 'deg':            deg = value; break
    case 'rad':            deg = value * 180 / Math.PI; break
    case 'grad':           deg = value * 0.9; break  // 100 grad = 90°
    case 'percent_slope':  deg = Math.atan(value / 100) * 180 / Math.PI; break
    case 'permil_slope':   deg = Math.atan(value / 1000) * 180 / Math.PI; break
    case 'ratio_n1':       deg = value === 0 ? 90 : Math.atan(1 / value) * 180 / Math.PI; break  // N:1 → tan = 1/N
    case 'one_over_n':     deg = value === 0 ? 90 : Math.atan(1 / value) * 180 / Math.PI; break  // 1:N → tan = 1/N
    case 'mulae':          deg = Math.atan(value / 10) * 180 / Math.PI; break  // N치/10치
    default:               deg = value
  }
  // 2) 도(°) → 출력 단위로 변환
  const rad = deg * Math.PI / 180
  const t = Math.tan(rad)
  switch (to) {
    case 'deg':            return deg
    case 'rad':            return rad
    case 'grad':           return deg / 0.9
    case 'percent_slope':  return t * 100
    case 'permil_slope':   return t * 1000
    case 'ratio_n1':       return Math.abs(t) < 1e-12 ? Infinity : 1 / t
    case 'one_over_n':     return Math.abs(t) < 1e-12 ? Infinity : 1 / t
    case 'mulae':          return t * 10
    default:               return deg
  }
}

/* ─── 포맷 ─── */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 1e9 || abs < 1e-4) return n.toExponential(4)
  // 6 유효숫자 + 천단위 콤마
  const fixed = parseFloat(n.toPrecision(8))
  if (Number.isInteger(fixed) && abs < 1e9) return fixed.toLocaleString('ko-KR')
  // 소수점 처리
  const decimals = abs >= 1000 ? 2 : abs >= 1 ? 4 : 6
  return fixed.toLocaleString('ko-KR', { maximumFractionDigits: decimals })
}
