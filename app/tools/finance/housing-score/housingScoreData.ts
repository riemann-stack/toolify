/* ───────────────────────────────────────────────────────────
   주택 청약 가점제 — 84점 만점 (「주택공급에 관한 규칙」 별표1)
   - 무주택 기간 (0~32점) + 부양가족 (5~35점) + 통장 (1~17점)
   - 2026년 기준 (최신 정보는 청약홈·LH·HUG 공식 사이트에서 확인)
   ─────────────────────────────────────────────────────────── */

/* ─── 점수 테이블 ─── */

/** 무주택 기간 점수 — 햇수 기준 (1년 이상부터 1년당 +2점, 1년 미만 2점) */
export function unhomedScore(years: number): number {
  if (years < 0) return 0
  if (years < 1) return 2
  if (years >= 15) return 32
  return Math.min(32, 2 + Math.floor(years) * 2)
}

/** 부양가족 수 점수 — 본인 제외 0명 = 5점, 1명당 +5점, 최대 6명 = 35점 */
export function dependentScore(count: number): number {
  if (count <= 0) return 5
  if (count >= 6) return 35
  return 5 + count * 5
}

/** 청약통장 가입기간 점수 — 6개월 미만 1점, 6m~1y 2점, 1년부터 +1점/년 */
export function bankbookScore(years: number): number {
  if (years < 0) return 0
  if (years < 0.5) return 1
  if (years < 1)   return 2
  if (years >= 15) return 17
  return Math.min(17, 2 + Math.floor(years))
}

/* ─── 무주택 기간 자동 산정 ─── */

/** 만 30세 또는 결혼일 중 빠른 쪽부터 카운트
 *  - 30세 이전 결혼: 결혼일부터
 *  - 30세 이후 결혼·미혼: 만 30세 생일부터
 *  - 30세 미만 미혼: 0년 */
export function computeUnhomedYears(
  birthDate: Date,
  marriedDate: Date | null,
  refDate: Date,
): number {
  const age30 = new Date(birthDate)
  age30.setFullYear(age30.getFullYear() + 30)

  let startDate: Date
  if (marriedDate && marriedDate.getTime() < age30.getTime()) {
    startDate = marriedDate
  } else {
    startDate = age30
  }

  if (refDate.getTime() < startDate.getTime()) return 0
  const diffMs = refDate.getTime() - startDate.getTime()
  return diffMs / (365.25 * 24 * 3600 * 1000)
}

/* ─── 통장 가입기간 ─── */
export function computeBankbookYears(joinedDate: Date, refDate: Date): number {
  if (refDate.getTime() < joinedDate.getTime()) return 0
  return (refDate.getTime() - joinedDate.getTime()) / (365.25 * 24 * 3600 * 1000)
}

/* ─── 종합 등급 ─── */
export interface ScoreGrade {
  grade: string
  color: string
  desc: string
  minScore: number
}

export const GRADES: ScoreGrade[] = [
  { grade: 'S', color: '#CA8A04', desc: '서울 인기 단지 당첨 가능권 (강남·송파·서초)', minScore: 70 },
  { grade: 'A', color: '#059669', desc: '서울 일반·수도권 인기 단지 당첨권',          minScore: 60 },
  { grade: 'B', color: '#0891B2', desc: '수도권 일반·지방 광역시 인기 단지권',          minScore: 50 },
  { grade: 'C', color: '#D97706', desc: '지방 광역시 일반·중소도시 당첨권',            minScore: 40 },
  { grade: 'D', color: '#EA580C', desc: '지방 중소도시 + 특별공급 검토 권장',         minScore: 25 },
  { grade: 'E', color: '#DC2626', desc: '가점 부족 — 특별공급·추첨제 우선 검토',      minScore: 0 },
]

export function getGrade(score: number): ScoreGrade {
  return GRADES.find(g => score >= g.minScore) ?? GRADES[GRADES.length - 1]
}

/* ─── 최근 인기 단지 평균 당첨 가점 (2023~2025 KAB·HUG 추이 평균 — 참고용) ─── */
export interface RegionCutline {
  region: string
  avg: number       // 평균 당첨 가점
  min: number       // 최저 당첨 가점
  desc: string
}

export const CUTLINES: RegionCutline[] = [
  { region: '🏙️ 서울 강남·서초·송파',   avg: 72, min: 67, desc: '래미안·디에이치·아크로 등 최상위 단지' },
  { region: '🏙️ 서울 마포·성동·용산',   avg: 67, min: 60, desc: '한강뷰·도심접근 우수' },
  { region: '🏙️ 서울 일반구',           avg: 60, min: 54, desc: '동작·관악·구로·노원·은평 등' },
  { region: '🏘️ 수도권 인기',           avg: 58, min: 50, desc: '판교·과천·분당·동탄2' },
  { region: '🏘️ 수도권 일반',           avg: 48, min: 40, desc: '용인·시흥·평택·의정부' },
  { region: '🏞️ 지방 광역시 인기',      avg: 50, min: 42, desc: '부산 해운대·대구 수성·대전 유성' },
  { region: '🏞️ 지방 광역시 일반',      avg: 40, min: 32, desc: '광주·울산·인천 일반구' },
  { region: '🌾 지방 중소도시',          avg: 32, min: 22, desc: '특별공급 추천 — 일반 가점 낮음' },
]

/* ─── 특별공급 자격 (점수 무관) ─── */
export interface SpecialSupply {
  id: string
  name: string
  emoji: string
  ratio: string       // 공급 비율
  desc: string
  conditions: string[]
}

export const SPECIAL_SUPPLIES: SpecialSupply[] = [
  {
    id: 'newlywed',
    name: '신혼부부',
    emoji: '💑',
    ratio: '민영 20% / 공공 30%',
    desc: '혼인 7년 이내 또는 만 6세 이하 자녀 있는 부부',
    conditions: [
      '혼인 신고 7년 이내 (또는 만 6세 이하 자녀)',
      '무주택 세대',
      '소득 기준: 도시근로자 가구당 월평균 130% 이하 (맞벌이 140%)',
      '자산 약 3.5억 원 이하 (매년 갱신 — 청약홈 확인)',
    ],
  },
  {
    id: 'first-life',
    name: '생애최초',
    emoji: '🆕',
    ratio: '민영 7% / 공공 25%',
    desc: '평생 한 번도 주택 소유 X — 일반·생애최초 모두 가능',
    conditions: [
      '평생 주택 소유 이력 없음 (배우자 포함)',
      '청약통장 1순위 + 5년 이상 가입',
      '근로소득세 5년 이상 납부 (최소 한 번)',
      '소득 130% (맞벌이 140%), 자산 약 3.5억 이하 (매년 갱신)',
    ],
  },
  {
    id: 'multi-child',
    name: '다자녀',
    emoji: '👨‍👩‍👧‍👦',
    ratio: '민영 10% / 공공 10%',
    desc: '미성년 자녀 3명 이상 (최근 일부 단지 2자녀로 완화)',
    conditions: [
      '미성년 자녀 3명 이상 (태아 포함, 2자녀 인정 단지 점차 확대)',
      '무주택 세대',
      '소득 120% (맞벌이 200%)',
      '자녀 수·연령에 따른 가점제 별도',
    ],
  },
  {
    id: 'elderly',
    name: '노부모부양',
    emoji: '👴',
    ratio: '민영 3% / 공공 5%',
    desc: '만 65세 이상 직계존속 3년 이상 동거 부양',
    conditions: [
      '만 65세 이상 직계존속 동거 3년 이상',
      '무주택 세대 + 일반공급 1순위',
      '본인·배우자·부양 부모 모두 무주택',
      '가점제로 경쟁',
    ],
  },
  {
    id: 'institution',
    name: '기관추천',
    emoji: '🏛️',
    ratio: '민영 10% / 공공 15%',
    desc: '국가유공자·장애인·장기복무군인·중소기업 종사자 등',
    conditions: [
      '대상: 국가유공자, 장애인, 한부모, 장기복무군인, 중기 종사자 등',
      '기관 추천서 발급 필요',
      '무주택 세대',
      '기관별 별도 자격 기준',
    ],
  },
]

/* ─── 함정·실수 가이드 ─── */
export interface Pitfall {
  title: string
  level: 'high' | 'mid'
  desc: string
}

export const PITFALLS: Pitfall[] = [
  {
    title: '위장전입 (적발 시 자격 박탈 + 형사처벌)',
    level: 'high',
    desc: '부양가족 가점을 위해 부모를 형식상 전입 X. 실거주·생활비 지원 증빙 필수. 3년 이상 동일 세대 요건.',
  },
  {
    title: '1주택자 처분서약 미이행',
    level: 'high',
    desc: '입주 시까지 기존 주택 미처분 시 분양 취소 + 향후 10년 청약 제한. 처분 시점·매매계약서 보관 필수.',
  },
  {
    title: '재당첨 제한 (5년·10년)',
    level: 'high',
    desc: '분양가상한제 적용 단지 당첨자는 5~10년간 다른 분양가상한제 단지 청약 불가. 세대원 전체 적용.',
  },
  {
    title: '부양가족 인정 기준 오해',
    level: 'mid',
    desc: '형제·자매는 방계라 부양가족 X. 부모·조부모·외조부모는 직계존속으로 인정되나, 만 60세 이상 + 3년 이상 동일 세대 등록 + 무주택 요건을 모두 충족해야 합니다.',
  },
  {
    title: '자녀 만 30세 이상·기혼 = 부양가족 X',
    level: 'mid',
    desc: '미성년 또는 만 30세 미만 미혼 자녀만 부양가족으로 인정. 결혼·30세 이상이면 분리.',
  },
  {
    title: '청약통장 1순위 자격 별도',
    level: 'mid',
    desc: '가입 12개월 + 납입 12회 이상 (수도권 24회). 가점은 가입기간만 보지만 1순위는 납입 횟수가 핵심.',
  },
  {
    title: '미혼·30세 미만 = 무주택 기간 0',
    level: 'mid',
    desc: '만 30세 이전 미혼은 무주택 기간 0점. 결혼 시 결혼일부터 카운트 시작 → 결혼이 가점에 큰 영향.',
  },
]

/* ─── 종합 점수 계산 ─── */
export interface ScoreResult {
  total: number
  unhomedYears: number
  unhomedPoints: number
  dependentCount: number
  dependentPoints: number
  bankbookYears: number
  bankbookPoints: number
  grade: ScoreGrade
}

export function calcTotalScore(opts: {
  unhomedYears: number
  dependentCount: number
  bankbookYears: number
}): ScoreResult {
  const u = unhomedScore(opts.unhomedYears)
  const d = dependentScore(opts.dependentCount)
  const b = bankbookScore(opts.bankbookYears)
  const total = u + d + b
  return {
    total,
    unhomedYears: opts.unhomedYears,
    unhomedPoints: u,
    dependentCount: opts.dependentCount,
    dependentPoints: d,
    bankbookYears: opts.bankbookYears,
    bankbookPoints: b,
    grade: getGrade(total),
  }
}

/* ─── 시뮬레이션 시나리오 ─── */
export interface Simulation {
  label: string
  emoji: string
  desc: string
  apply: (current: { unhomedYears: number; dependentCount: number; bankbookYears: number }) => {
    unhomedYears: number
    dependentCount: number
    bankbookYears: number
  }
}

export const SIMULATIONS: Simulation[] = [
  {
    label: '1년 더 기다리면',
    emoji: '⏳',
    desc: '무주택 1년 + 통장 1년 추가',
    apply: (c) => ({
      unhomedYears: c.unhomedYears + 1,
      dependentCount: c.dependentCount,
      bankbookYears: c.bankbookYears + 1,
    }),
  },
  {
    label: '자녀 1명 더 생기면',
    emoji: '👶',
    desc: '부양가족 +1',
    apply: (c) => ({
      unhomedYears: c.unhomedYears,
      dependentCount: c.dependentCount + 1,
      bankbookYears: c.bankbookYears,
    }),
  },
  {
    label: '결혼하면 (미혼 가정)',
    emoji: '💍',
    desc: '배우자 +1 (무주택 기간 별도 재산정 필요)',
    apply: (c) => ({
      unhomedYears: c.unhomedYears,
      dependentCount: c.dependentCount + 1,
      bankbookYears: c.bankbookYears,
    }),
  },
  {
    label: '3년 더 기다리면',
    emoji: '⏰',
    desc: '무주택 +3년 + 통장 +3년',
    apply: (c) => ({
      unhomedYears: c.unhomedYears + 3,
      dependentCount: c.dependentCount,
      bankbookYears: c.bankbookYears + 3,
    }),
  },
  {
    label: '무주택 15년 (만점)',
    emoji: '🏆',
    desc: '무주택 기간 32점 만점 달성',
    apply: (c) => ({
      unhomedYears: 15,
      dependentCount: c.dependentCount,
      bankbookYears: c.bankbookYears,
    }),
  },
  {
    label: '통장 15년 (만점)',
    emoji: '💳',
    desc: '청약통장 17점 만점 달성',
    apply: (c) => ({
      unhomedYears: c.unhomedYears,
      dependentCount: c.dependentCount,
      bankbookYears: 15,
    }),
  },
]
