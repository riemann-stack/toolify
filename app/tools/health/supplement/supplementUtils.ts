/* ──────────────────────────────────────────────────────
   health/supplement/supplementUtils.ts
   영양제 — 약물 상호작용 / 특수 상황 / 오메가3 합산 / 한국 인기 프리셋
   ※ 본 도구는 일반 정보 제공이며 의학적 진단·처방·복용 권유 도구가 아닙니다.
   처방약 복용 중·임신·수유 중·만성질환·65세 이상·18세 미만은 반드시 의사·약사 상담.
   한국 식약처 식품안전정보: 1577-1255 / 의약품안전사용서비스: 1577-2334
   ────────────────────────────────────────────────────── */

/* ─── 오메가3 EPA+DHA 합산 가이드 ─── */
export const OMEGA3_GUIDELINES = {
  minDaily: 250,    // mg (WHO·미국심장협회 최소)
  idealMin: 250,
  idealMax: 500,
  cardiacMin: 1000, // 심혈관 치료 (의사 처방)
  upperLimit: 3000, // FDA 상한
}

export interface Omega3Analysis {
  epa: number
  dha: number
  total: number
  status: 'under' | 'meet' | 'over' | 'exceed'
  statusLabel: string
  statusColor: string
  interpretation: string
}

export function analyzeOmega3(epa: number, dha: number): Omega3Analysis | null {
  if (epa <= 0 && dha <= 0) return null
  const total = epa + dha
  let status: Omega3Analysis['status']
  let statusLabel: string
  let statusColor: string
  let interpretation: string

  if (total < OMEGA3_GUIDELINES.minDaily) {
    status = 'under'
    statusLabel = '🟡 권장 미달'
    statusColor = '#FFD700'
    interpretation = `${total}mg은 권장 (250~500mg)에 못 미칩니다. 식사 (등푸른 생선) 보충 또는 용량 증가 고려.`
  } else if (total <= OMEGA3_GUIDELINES.idealMax) {
    status = 'meet'
    statusLabel = '🟢 적정'
    statusColor = '#3EFF9B'
    interpretation = `${total}mg은 일반 권장 범위 (250~500mg) 안. 안전.`
  } else if (total <= OMEGA3_GUIDELINES.upperLimit) {
    status = 'over'
    statusLabel = '🟡 약간 초과 (안전 범위)'
    statusColor = '#FF8C3E'
    interpretation = `${total}mg은 일반 권장보다 높지만 상한 (3,000mg) 안. 심혈관 치료 목적이면 의사 상담.`
  } else {
    status = 'exceed'
    statusLabel = '🔴 상한 초과'
    statusColor = '#FF6B6B'
    interpretation = `${total}mg은 FDA 상한 (3,000mg) 초과! 출혈 위험 ↑. 즉시 용량 조정·의사 상담.`
  }

  return { epa, dha, total, status, statusLabel, statusColor, interpretation }
}

/* ─── 약물 상호작용 데이터 ─── */
export interface DrugInteraction {
  ingredientName: string  // 매칭할 영양제 이름 (INGREDIENTS의 name과 일치)
  risk: 'high' | 'medium' | 'low'
  desc: string
}

export interface DrugCategory {
  id: string
  name: string
  emoji: string
  desc: string
  risky: DrugInteraction[]
}

export const DRUG_INTERACTIONS: DrugCategory[] = [
  {
    id: 'anticoagulant', emoji: '🩸',
    name: '항응고제·항혈소판제 (와파린·아스피린·플라빅스)',
    desc: '혈액 응고 억제 약물 — 비타민E·K·오메가3 등과 상호작용 큼',
    risky: [
      { ingredientName: '비타민E',         risk: 'high',   desc: '비타민E 고용량 (400IU+) → 출혈 위험 증가' },
      { ingredientName: '비타민K',         risk: 'high',   desc: '와파린 효과 무력화 가능 → 주치의 상담 필수' },
      { ingredientName: '오메가3(EPA)',    risk: 'medium', desc: '고용량 시 항응고 효과 강화 → 출혈 위험' },
      { ingredientName: '오메가3(DHA)',    risk: 'medium', desc: '동일' },
      { ingredientName: '강황(커큐민)',    risk: 'medium', desc: '항응고 효과 추가 → 주의' },
    ],
  },
  {
    id: 'thyroid', emoji: '🦋',
    name: '갑상선약 (신지로이드·씬지로이드)',
    desc: '갑상선 호르몬 보충 약물 — 미네랄이 흡수를 크게 방해',
    risky: [
      { ingredientName: '철분',     risk: 'high',   desc: '갑상선약 흡수 큰 폭 방해 → 4시간 이상 간격' },
      { ingredientName: '칼슘',     risk: 'high',   desc: '동일 → 4시간 이상 간격' },
      { ingredientName: '마그네슘', risk: 'medium', desc: '흡수 방해 → 시간 분리' },
      { ingredientName: '요오드',   risk: 'medium', desc: '갑상선 기능 변화 가능' },
    ],
  },
  {
    id: 'antibiotic', emoji: '💊',
    name: '항생제 (테트라사이클린·플로로퀴놀론)',
    desc: '광범위 항균제 — 미네랄과 결합해 흡수 큰 폭 방해',
    risky: [
      { ingredientName: '칼슘',     risk: 'high',   desc: '항생제 흡수 큰 폭 방해 → 2시간 이상 간격' },
      { ingredientName: '마그네슘', risk: 'high',   desc: '동일' },
      { ingredientName: '철분',     risk: 'high',   desc: '동일' },
      { ingredientName: '아연',     risk: 'medium', desc: '흡수 방해' },
    ],
  },
  {
    id: 'bisphosphonate', emoji: '🦴',
    name: '골다공증약 (포사맥스·악토넬·비스포스포네이트)',
    desc: '골다공증 치료제 — 미네랄과 동시 복용 시 흡수 방해',
    risky: [
      { ingredientName: '칼슘',     risk: 'high', desc: '흡수 방해 → 골다공증약 복용 후 2시간 이상 간격' },
      { ingredientName: '철분',     risk: 'high', desc: '동일' },
      { ingredientName: '마그네슘', risk: 'high', desc: '동일' },
    ],
  },
  {
    id: 'bp', emoji: '💗',
    name: '혈압약 (ACE억제제·ARB·이뇨제)',
    desc: '혈압 조절 약물 — 칼륨·마그네슘과 상호작용',
    risky: [
      { ingredientName: '칼륨',     risk: 'high',   desc: 'ACE억제제·ARB 시 고칼륨혈증 위험 → 주치의 상담' },
      { ingredientName: '마그네슘', risk: 'medium', desc: '이뇨제와 상호작용 가능' },
    ],
  },
  {
    id: 'diabetes', emoji: '🍬',
    name: '당뇨약 (메트포민·인슐린)',
    desc: '혈당 조절 약물 — 일부 영양제가 혈당에 영향',
    risky: [
      { ingredientName: '크롬',         risk: 'medium', desc: '혈당 변화 가능' },
      { ingredientName: '알파리포산',   risk: 'medium', desc: '혈당 ↓ 가능' },
    ],
  },
  {
    id: 'ppi', emoji: '🫃',
    name: '위산억제제 (PPI·H2 차단제)',
    desc: '위산 억제 약물 — 장기 복용 시 흡수 저하',
    risky: [
      { ingredientName: '비타민B12(코발라민)', risk: 'high',   desc: '장기 PPI → B12 흡수 ↓. 주기적 검사 권장' },
      { ingredientName: '철분',                risk: 'medium', desc: '위산 ↓ → 흡수 ↓. 비타민C 함께 권장' },
      { ingredientName: '칼슘',                risk: 'medium', desc: '구연산 칼슘 형태 권장 (탄산 X)' },
      { ingredientName: '마그네슘',            risk: 'medium', desc: '장기 복용 시 결핍 위험' },
    ],
  },
  {
    id: 'contraceptive', emoji: '💕',
    name: '피임약',
    desc: '경구 피임약 — 일부 영양제 결핍 + 효과 무력화 약물 주의',
    risky: [
      { ingredientName: '비타민B6(피리독신)', risk: 'medium', desc: '피임약 → B6 ↓ 가능. 보충 고려' },
      { ingredientName: '비타민B9(엽산)',     risk: 'medium', desc: '엽산 ↓ 가능. 보충 권장' },
    ],
  },
  {
    id: 'statin', emoji: '🫀',
    name: '콜레스테롤약 (스타틴)',
    desc: '콜레스테롤 저하 약물 — CoQ10 ↓ + 나이아신 주의',
    risky: [
      { ingredientName: '코엔자임Q10',      risk: 'low',    desc: '스타틴 → CoQ10 ↓. 보충 권장 (해롭지 않음)' },
      { ingredientName: '비타민B3(나이아신)', risk: 'medium', desc: '고용량 + 스타틴 → 근육통 위험' },
    ],
  },
  {
    id: 'ssri', emoji: '🧠',
    name: '우울증약 (SSRI·SNRI)',
    desc: '항우울제 — 세로토닌 약물 + 영양제 상호작용 주의',
    risky: [
      { ingredientName: '오메가3(EPA)', risk: 'low', desc: 'EPA + SSRI → 시너지 가능 (긍정적)' },
    ],
  },
]

/* ─── 특수 상황 (임신·수유·고령·청소년·만성질환) ─── */
export type LifeStage = 'general' | 'pregnant' | 'lactating' | 'teen' | 'elderly' | 'chronic'

export interface LifeStageInfo {
  id: LifeStage
  name: string
  emoji: string
  desc: string
}

export const LIFE_STAGES: LifeStageInfo[] = [
  { id: 'general',   name: '일반 성인',           emoji: '🟢', desc: '19~64세 건강한 성인' },
  { id: 'pregnant',  name: '임신 중',             emoji: '🤰', desc: '엽산·철분·요오드·DHA·콜린 권장 / 비타민A 레티놀 주의' },
  { id: 'lactating', name: '수유 중',             emoji: '🤱', desc: 'DHA·칼슘·비타민D 충분 / 카페인·알코올 절제' },
  { id: 'teen',      name: '청소년 (12~18세)',    emoji: '👶', desc: '성장기 칼슘·비타민D ↑ / 성인용 종합비타민 X' },
  { id: 'elderly',   name: '65세 이상 고령자',    emoji: '👴', desc: '비타민D·B12·칼슘·오메가3 권장 / 비타민E 주의' },
  { id: 'chronic',   name: '만성질환자 (간·신장·심혈관)', emoji: '🩺', desc: '약물 상호작용·신장 부담 평가 — 의사 상담 필수' },
]

export interface SpecialAlert {
  ingredientName: string
  type: 'recommend' | 'caution' | 'avoid'
  desc: string
  recommendedAmount?: { min?: number; max?: number; unit: string }
}

export const SPECIAL_MODE_ALERTS: Record<LifeStage, SpecialAlert[]> = {
  general: [],
  pregnant: [
    { ingredientName: '비타민B9(엽산)',       type: 'recommend', desc: '600~800μg/일 권장 (신경관 결손 예방). 임신 전 3개월부터 시작 이상적.', recommendedAmount: { min: 600, max: 1000, unit: 'μg' } },
    { ingredientName: '철분',                 type: 'recommend', desc: '27mg/일 권장 (임산부 빈혈 예방). 의사 처방 권장.', recommendedAmount: { min: 27, unit: 'mg' } },
    { ingredientName: '요오드',               type: 'recommend', desc: '150μg/일 정확 (과다·부족 모두 위험).', recommendedAmount: { min: 150, max: 220, unit: 'μg' } },
    { ingredientName: '오메가3(DHA)',         type: 'recommend', desc: '200mg+ 권장 (태아 뇌·시각 발달).', recommendedAmount: { min: 200, unit: 'mg' } },
    { ingredientName: '비타민A(레티놀)',      type: 'caution',   desc: '레티놀 형태 고용량 (3,000μg+) → 1삼분기 기형아 위험. 베타카로틴 형태로 변경 권장.', recommendedAmount: { max: 3000, unit: 'μg' } },
    { ingredientName: '비타민D',              type: 'caution',   desc: '4,000IU 초과 → 태아 위험. 권장 600~2,000IU.', recommendedAmount: { max: 4000, unit: 'IU' } },
  ],
  lactating: [
    { ingredientName: '오메가3(DHA)',     type: 'recommend', desc: '300mg+ 권장 (모유 통해 영아에게 전달).', recommendedAmount: { min: 300, unit: 'mg' } },
    { ingredientName: '칼슘',             type: 'recommend', desc: '1,000mg/일 (모유로 빠져나감)', recommendedAmount: { min: 1000, unit: 'mg' } },
    { ingredientName: '비타민D',          type: 'recommend', desc: '600IU+ 권장 (모유 통해 영아에게)', recommendedAmount: { min: 600, unit: 'IU' } },
  ],
  teen: [
    { ingredientName: '칼슘',         type: 'recommend', desc: '1,300mg/일 (성장기 골밀도)', recommendedAmount: { min: 1300, unit: 'mg' } },
    { ingredientName: '비타민D',      type: 'recommend', desc: '600IU/일 (성장기)', recommendedAmount: { min: 600, unit: 'IU' } },
    { ingredientName: '비타민A(레티놀)', type: 'caution',   desc: '청소년 상한 (남 2,800μg / 여 2,400μg) — 성인보다 낮음', recommendedAmount: { max: 2800, unit: 'μg' } },
  ],
  elderly: [
    { ingredientName: '비타민D',              type: 'recommend', desc: '800~1,000IU/일 (낙상·골절 예방)', recommendedAmount: { min: 800, max: 2000, unit: 'IU' } },
    { ingredientName: '칼슘',                 type: 'recommend', desc: '1,200mg/일 (남 1,000, 여 1,200)', recommendedAmount: { min: 1200, unit: 'mg' } },
    { ingredientName: '비타민B12(코발라민)',  type: 'recommend', desc: '2.4μg+ (위산 ↓로 흡수 ↓)', recommendedAmount: { min: 2.4, unit: 'μg' } },
    { ingredientName: '마그네슘',             type: 'recommend', desc: '부족 흔함 (수면·근육)' },
    { ingredientName: '비타민E',              type: 'caution',   desc: '400IU 초과 → 출혈 위험 ↑', recommendedAmount: { max: 400, unit: 'mg' } },
    { ingredientName: '철분',                 type: 'caution',   desc: '결핍 진단 없으면 X. 노년 산화 스트레스 ↑' },
  ],
  chronic: [
    { ingredientName: '비타민A(레티놀)', type: 'caution', desc: '간 손상 위험 — 베타카로틴 형태 권장' },
    { ingredientName: '비타민E',         type: 'caution', desc: '심혈관 환자: 출혈 위험 평가 필요' },
    { ingredientName: '칼륨',            type: 'caution', desc: '신장 환자: 고칼륨혈증 주의' },
    { ingredientName: '인',              type: 'caution', desc: '신장 환자: 인 제한 필요' },
  ],
}

/* ─── 시너지 조합 (확장) ─── */
export interface SynergyCombo {
  ingredientNames: [string, string]
  title: string
  desc: string
}

export const EXTRA_SYNERGY: SynergyCombo[] = [
  { ingredientNames: ['마그네슘', '비타민B6(피리독신)'],
    title: '마그네슘 + 비타민B6',
    desc: 'B6가 마그네슘의 세포 흡수와 활용을 도와줍니다.' },
  { ingredientNames: ['비타민E', '셀레늄'],
    title: '비타민E + 셀레늄',
    desc: '두 항산화제 시너지로 활성산소 제거 효과 ↑.' },
  { ingredientNames: ['아연', '비타민C'],
    title: '아연 + 비타민C',
    desc: '면역력 강화 시너지.' },
  { ingredientNames: ['프로바이오틱스', '프리바이오틱스'],
    title: '프로바이오틱스 + 프리바이오틱스',
    desc: '유산균 (프로) + 유산균 먹이 (프리) 시너지로 장 건강 효과 ↑.' },
]

/* ─── 한국 인기 영양제 프리셋 (라벨 보고 입력 보조) ─── */
export interface KoreaPreset {
  id: string
  name: string
  category: '종합비타민' | '단일' | '임산부' | '특수'
  ingredients: { name: string; amount: number; unit: 'mg' | 'μg' | 'IU' }[]
}

export const KOREA_POPULAR_PRESETS: KoreaPreset[] = [
  // 종합비타민
  { id: 'multi-women', category: '종합비타민', name: '여성용 종합비타민 (일반)',
    ingredients: [
      { name: '비타민A(레티놀)', amount: 700, unit: 'μg' },
      { name: '비타민D',         amount: 1000, unit: 'IU' },
      { name: '비타민E',         amount: 15, unit: 'mg' },
      { name: '비타민C',         amount: 60, unit: 'mg' },
      { name: '비타민B12(코발라민)', amount: 6, unit: 'μg' },
      { name: '비타민B9(엽산)',  amount: 400, unit: 'μg' },
      { name: '철분',            amount: 18, unit: 'mg' },
      { name: '칼슘',            amount: 200, unit: 'mg' },
    ],
  },
  { id: 'multi-men', category: '종합비타민', name: '남성용 종합비타민 (일반)',
    ingredients: [
      { name: '비타민A(레티놀)', amount: 900, unit: 'μg' },
      { name: '비타민D',         amount: 1000, unit: 'IU' },
      { name: '비타민E',         amount: 15, unit: 'mg' },
      { name: '비타민C',         amount: 90, unit: 'mg' },
      { name: '비타민B12(코발라민)', amount: 6, unit: 'μg' },
      { name: '아연',            amount: 11, unit: 'mg' },
      { name: '셀레늄',          amount: 70, unit: 'μg' },
    ],
  },
  { id: 'multi-silver', category: '종합비타민', name: '실버 종합비타민 (50세+)',
    ingredients: [
      { name: '비타민D',                amount: 1000, unit: 'IU' },
      { name: '비타민B12(코발라민)',    amount: 25, unit: 'μg' },
      { name: '비타민B6(피리독신)',     amount: 3, unit: 'mg' },
      { name: '비타민B9(엽산)',         amount: 400, unit: 'μg' },
      { name: '칼슘',                   amount: 250, unit: 'mg' },
      { name: '루테인',                 amount: 6, unit: 'mg' },
    ],
  },
  // 단일
  { id: 'd1000',   category: '단일', name: '비타민D 1,000IU',
    ingredients: [{ name: '비타민D', amount: 1000, unit: 'IU' }] },
  { id: 'd2000',   category: '단일', name: '비타민D 2,000IU 고함량',
    ingredients: [{ name: '비타민D', amount: 2000, unit: 'IU' }] },
  { id: 'd5000',   category: '단일', name: '비타민D 5,000IU 초고함량',
    ingredients: [{ name: '비타민D', amount: 5000, unit: 'IU' }] },
  { id: 'omega3-rtg', category: '단일', name: '오메가3 rTG (EPA 360 + DHA 240)',
    ingredients: [
      { name: '오메가3(EPA)', amount: 360, unit: 'mg' },
      { name: '오메가3(DHA)', amount: 240, unit: 'mg' },
    ] },
  { id: 'omega3-high', category: '단일', name: '오메가3 고함량 (EPA 600 + DHA 400)',
    ingredients: [
      { name: '오메가3(EPA)', amount: 600, unit: 'mg' },
      { name: '오메가3(DHA)', amount: 400, unit: 'mg' },
    ] },
  // 임산부
  { id: 'prenatal', category: '임산부', name: '임산부 종합비타민 (엽산+철분+요오드)',
    ingredients: [
      { name: '비타민B9(엽산)',  amount: 800, unit: 'μg' },
      { name: '철분',            amount: 27, unit: 'mg' },
      { name: '요오드',          amount: 150, unit: 'μg' },
      { name: '오메가3(DHA)',    amount: 200, unit: 'mg' },
      { name: '비타민D',         amount: 1000, unit: 'IU' },
    ],
  },
  // 특수
  { id: 'milk-thistle', category: '특수', name: '밀크씨슬 (간 건강)',
    ingredients: [{ name: '밀크씨슬(실리마린)', amount: 175, unit: 'mg' }] },
  { id: 'lutein',       category: '특수', name: '루테인 (눈 건강)',
    ingredients: [
      { name: '루테인', amount: 20, unit: 'mg' },
      { name: '지아잔틴', amount: 4, unit: 'mg' },
    ] },
  { id: 'glucosamine',  category: '특수', name: '글루코사민·콘드로이친 (관절)',
    ingredients: [
      { name: '글루코사민', amount: 1500, unit: 'mg' },
      { name: '콘드로이친', amount: 800, unit: 'mg' },
      { name: 'MSM',        amount: 1000, unit: 'mg' },
    ] },
  { id: 'probiotics',   category: '특수', name: '프로바이오틱스 100억 CFU',
    ingredients: [{ name: '프로바이오틱스', amount: 1, unit: 'mg' }] },
  { id: 'collagen',     category: '특수', name: '저분자 콜라겐',
    ingredients: [{ name: '콜라겐', amount: 1000, unit: 'mg' }] },
  { id: 'coq10',        category: '특수', name: '코엔자임Q10 (스타틴 보충용)',
    ingredients: [{ name: '코엔자임Q10', amount: 100, unit: 'mg' }] },
]

/* ─── % vs RDA·UL 시각화 헬퍼 ─── */
export type GaugeStatus = 'low' | 'ok' | 'high' | 'caution' | 'exceed'

export function gaugeStatus(total: number, rda?: number, ul?: number): {
  status: GaugeStatus
  rdaPct: number   // RDA 대비 % (0~)
  ulPct: number    // UL 대비 % (0~)
  color: string
  label: string
} {
  const rdaPct = rda ? (total / rda) * 100 : 0
  const ulPct = ul ? (total / ul) * 100 : 0

  if (ul && total > ul) {
    return { status: 'exceed', rdaPct, ulPct, color: '#FF6B6B', label: '🚨 상한 초과 (즉시 점검)' }
  }
  if (ul && total > ul * 0.8) {
    return { status: 'caution', rdaPct, ulPct, color: '#FF8C3E', label: '🟠 상한 임박 (주의)' }
  }
  if (rda && total > rda * 2) {
    return { status: 'high', rdaPct, ulPct, color: '#FFD700', label: '🟡 권장 초과 (200%+)' }
  }
  if (rda && total >= rda * 0.8) {
    return { status: 'ok', rdaPct, ulPct, color: '#3EFF9B', label: '🟢 적정' }
  }
  if (rda) {
    return { status: 'low', rdaPct, ulPct, color: '#3EC8FF', label: '🔵 권장 미달' }
  }
  return { status: 'ok', rdaPct: 0, ulPct: 0, color: 'var(--muted)', label: '기준 없음' }
}
