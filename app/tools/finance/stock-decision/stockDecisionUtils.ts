// ─────────────────────────────────────────────────────────────
// 주식 결정 보조 — 자가진단 체크리스트 + 행동경제학 사례 + 편향
// ─────────────────────────────────────────────────────────────

export type Direction = 'buy' | 'sell' | 'hold'

export const DIRECTION_LABEL: Record<Direction, string> = {
  buy: '🟢 매수 검토 중',
  sell: '🔴 매도 검토 중',
  hold: '🟡 보유 vs 정리 고민',
}

// ── 자가진단 체크리스트 (방향별) ─────────
export interface CheckItem {
  id: string
  label: string
  /** 체크하면 위험 신호 (true) / 이성적 신호 (false) */
  isRiskSignal: boolean
  bias?: string  // 연결된 편향
  /** 치명적 위험 신호 — 체크 시 이성 신호로 희석되지 않고 결과 강제 상향 */
  critical?: boolean
}

export const CHECKLIST: Record<Direction, CheckItem[]> = {
  buy: [
    { id: 'b1', label: '최근 주가가 급등하는 걸 보고 마음이 급해졌다', isRiskSignal: true, bias: 'FOMO' },
    { id: 'b2', label: '주변·SNS·유튜브에서 모두 추천한다', isRiskSignal: true, bias: '군중심리' },
    { id: 'b3', label: '왜 사려는지 한 줄로 설명할 수 있다', isRiskSignal: false },
    { id: 'b4', label: '사업 모델·매출 구조를 대략 안다', isRiskSignal: false },
    { id: 'b5', label: '이번 매수가 총 자산의 10% 미만이다', isRiskSignal: false },
    { id: 'b6', label: '-30% 손실에도 1년 이상 버틸 자신이 있다', isRiskSignal: false },
    { id: 'b7', label: '내 매수 후 더 떨어지면 추가 매수 계획이 있다', isRiskSignal: false },
    { id: 'b8', label: '"이번엔 다르다·놓치면 후회한다"는 생각이 든다', isRiskSignal: true, bias: 'FOMO' },
    { id: 'b9', label: '이미 비슷한 종목 비중이 충분하다 (산업 집중)', isRiskSignal: true, bias: '집중 위험' },
    { id: 'b10', label: '대출·신용·미수로 살 생각이 든다', isRiskSignal: true, bias: '레버리지 위험', critical: true },
  ],
  sell: [
    { id: 's1', label: '최근 -10~20% 하락에 불안해서 팔고 싶다', isRiskSignal: true, bias: '손실 회피', critical: true },
    { id: 's2', label: '본전(매수가)만 회복하면 바로 팔 생각이다', isRiskSignal: true, bias: '본전 효과' },
    { id: 's3', label: '매도 이유가 회사 펀더멘털 변화 때문이다', isRiskSignal: false },
    { id: 's4', label: '이 돈이 곧(3개월 내) 필요하다', isRiskSignal: false },
    { id: 's5', label: '비중 조절(리밸런싱)이 목적이다', isRiskSignal: false },
    { id: 's6', label: '주변·SNS에서 "이제 폭락 시작"이라고 한다', isRiskSignal: true, bias: '군중심리' },
    { id: 's7', label: '이미 차익이 충분해서 만족한다', isRiskSignal: false },
    { id: 's8', label: '판 후에도 더 오를 것 같지만 "그건 어쩔 수 없다" 받아들일 수 있다', isRiskSignal: false },
    { id: 's9', label: '"오늘 급등 마감"이라 빨리 팔아야 할 것 같다', isRiskSignal: true, bias: '처분 효과' },
    { id: 's10', label: '판 돈으로 다른 더 좋은 종목 살 계획이 구체적이다', isRiskSignal: false },
  ],
  hold: [
    { id: 'h1', label: '매수 당시의 이유가 지금도 유효하다', isRiskSignal: false },
    { id: 'h2', label: '"오를 때까지 버텨야 한다"는 생각만 든다', isRiskSignal: true, bias: '매몰 비용' },
    { id: 'h3', label: '회사 실적·뉴스를 최근 1주일 내 확인했다', isRiskSignal: false },
    { id: 'h4', label: '비중이 총자산의 30% 이상으로 과한 편이다', isRiskSignal: true, bias: '집중 위험' },
    { id: 'h5', label: '매일 주가 확인이 일상에 영향을 준다', isRiskSignal: true, bias: '과민 반응' },
    { id: 'h6', label: '같은 자금으로 더 나은 투자처가 떠오르지 않는다', isRiskSignal: false },
    { id: 'h7', label: '"내가 사면 떨어지고 팔면 오른다"는 트라우마가 있다', isRiskSignal: true, bias: '통제 착각' },
    { id: 'h8', label: '분할 매수·매도 계획이 있다 (감정 X 규칙)', isRiskSignal: false },
    { id: 'h9', label: '이미 -30%인데 손절선을 안 정했다', isRiskSignal: true, bias: '계획 부재', critical: true },
    { id: 'h10', label: '잠 못 잘 정도로 신경 쓰인다', isRiskSignal: true, bias: '심리 한계', critical: true },
  ],
}

// ── 점수 결과 카드 ─────────────────────
export type Band = 'green' | 'yellow' | 'orange' | 'red'

export interface DiagnoseResult {
  direction: Direction
  riskScore: number       // 위험 신호 체크 수
  rationalScore: number   // 이성적 신호 체크 수
  total: number           // 총 체크 수
  band: Band
  title: string
  message: string
  triggeredBiases: string[]
  criticalSignals: string[]  // 체크된 치명적 위험 신호 (강제 상향 트리거)
}

const BAND_ORDER: Band[] = ['green', 'yellow', 'orange', 'red']

const BAND_INFO: Record<Band, { title: string; message: string }> = {
  green: {
    title: '✅ 비교적 이성적 — 본인 판단 위주로 점검',
    message: '체크한 항목 대부분이 이성적 신호. 다만 "확신"이 클수록 과신 위험. 결정 전 5초 더 생각.',
  },
  yellow: {
    title: '🟡 이성·감정 균형 — 결정 보류 권장',
    message: '판단 근거와 감정 신호가 비슷함. 1~2일 보류 후 같은 결정인지 다시 점검 권장.',
  },
  orange: {
    title: '🟠 감정 신호 ↑ — 신중',
    message: '위험 신호가 이성 신호보다 많음. 분할 진행·소액 테스트 등 영향 줄이는 방법 검토.',
  },
  red: {
    title: '🔴 강한 감정 신호 — 결정 보류 강력 권장',
    message: '감정·편향 신호가 큼. 24~48시간 보류 후 같은 결정인지 재검토. 무작위 모드는 결정용이 아닌 감정 확인용입니다.',
  },
}

export function diagnose(direction: Direction, checked: string[]): DiagnoseResult {
  const items = CHECKLIST[direction]
  const checkedItems = items.filter((i) => checked.includes(i.id))
  const risk = checkedItems.filter((i) => i.isRiskSignal).length
  const rational = checkedItems.filter((i) => !i.isRiskSignal).length
  const triggeredBiases = Array.from(new Set(
    checkedItems.filter((i) => i.isRiskSignal && i.bias).map((i) => i.bias!),
  ))
  const criticalSignals = checkedItems.filter((i) => i.isRiskSignal && i.critical).map((i) => i.label)

  // 위험-이성 격차로 기본 밴드
  const diff = risk - rational
  let bandIdx = diff <= -3 ? 0 : diff <= 0 ? 1 : diff <= 2 ? 2 : 3

  // 치명적 위험 신호는 이성 신호로 희석되지 않도록 강제 상향
  // (예: 대출·신용 매수, -30% 손절선 미정, 수면 불안 — 이성 항목을 같이 체크해도 위험은 유지)
  if (criticalSignals.length >= 1) bandIdx = Math.max(bandIdx, 2) // 최소 🟠
  if (criticalSignals.length >= 2) bandIdx = Math.max(bandIdx, 3) // 🔴

  const band = BAND_ORDER[bandIdx]
  const info = BAND_INFO[band]

  return {
    direction,
    riskScore: risk,
    rationalScore: rational,
    total: checkedItems.length,
    band,
    title: info.title,
    message: info.message,
    triggeredBiases,
    criticalSignals,
  }
}

// ── 무작위 결정 모드 ──────────────────
export type RandomMode = 'coin' | 'chinchilla' | 'dart' | 'cat' | 'roulette'

export const MODE_META: Record<RandomMode, { label: string; emoji: string; story: string }> = {
  coin:       { label: '동전 던지기',       emoji: '🪙', story: '가장 단순. 50:50 확률 — 결정장애 즉시 해소.' },
  chinchilla: { label: '친칠라 픽',         emoji: '🐭', story: '러시아 침팬지 Lusha(2009) 영감. 펀드 매니저 94% 이김.' },
  dart:       { label: '다트 던지기',       emoji: '🎯', story: 'Burton Malkiel "눈 가린 원숭이"(1973) 영감.' },
  cat:        { label: '고양이 발',         emoji: '🐱', story: '영국 고양이 Orlando(2012) 영감. Observer 1년 실험 1등.' },
  roulette:   { label: '룰렛',              emoji: '🎰', story: 'Cass Business School(2013) — 1만 무작위 포트폴리오.' },
}

// ── 행동경제학 편향 7개 ─────────────
export interface Bias {
  key: string
  name: string
  emoji: string
  desc: string
  example: string
  tip: string
}

export const BIASES: Bias[] = [
  { key: 'fomo', name: 'FOMO (놓침의 두려움)', emoji: '😰',
    desc: '남이 다 사는데 나만 안 사면 손해라는 두려움. 고점 매수의 가장 큰 원인.',
    example: '"○○ 코인 10배 갔대" → 다음날 매수 → 고점 폭락',
    tip: '오르는 종목보다 "왜 오르는지 설명 가능한가"를 먼저 자문' },
  { key: 'loss', name: '손실 회피', emoji: '🛡️',
    desc: '같은 크기의 이익보다 손실이 약 2배 더 아프게 느껴짐 (Kahneman·Tversky).',
    example: '+10%엔 무덤덤, -10%엔 잠 못 잠 → 너무 빨리 매도',
    tip: '매수 전 "-30% 견딜 수 있는 금액인가" 사전 점검' },
  { key: 'sunk', name: '매몰 비용', emoji: '🪨',
    desc: '이미 들어간 비용이 아까워서 손절 못함. "본전만 오면 팔 텐데"의 함정.',
    example: '-50%인데 "이미 잃었으니 버텨야지" → -80%까지 버팀',
    tip: '"오늘 처음 보는 종목이라면 살까?" 자문 → 답이 No면 정리' },
  { key: 'confirm', name: '확증 편향', emoji: '🔍',
    desc: '내가 산 종목의 호재만 찾고 악재는 무시함.',
    example: '관련 유튜브 긍정 채널만 구독, 부정 분석은 "안티"로 치부',
    tip: '주 1회 일부러 부정적 분석을 찾아 읽기' },
  { key: 'overconf', name: '과신', emoji: '💪',
    desc: '운으로 1~2번 맞춘 후 "내가 잘한다"고 확신. 통계상 60~70% 투자자에서 관찰.',
    example: '단타 3회 성공 → 신용·미수까지 → 한 번에 큰 손실',
    tip: '월별 수익률 기록 → 1년 평균이 코스피보다 나은가 자문' },
  { key: 'anchor', name: '앵커링', emoji: '⚓',
    desc: '처음 본 가격(매수가·52주 고점)에 집착해 객관적 판단 X.',
    example: '"10만 원에 샀으니 9만 원에 팔면 손해야"',
    tip: '본인 매수가 모른 척 + 지금 처음 보는 종목으로 판단' },
  { key: 'crowd', name: '군중 심리', emoji: '👥',
    desc: '대중이 사면 안전, 팔면 위험하다고 느낌. 실제는 반대인 경우 多.',
    example: '"개미 90%가 매수" 뉴스 → 대형 매도 시작 신호일 수 있음',
    tip: '시장이 한 방향으로 쏠릴 때 본인 결정을 한 번 더 점검' },
]

// ── 사례 데이터 ──────────────────────
export interface CaseStudy {
  key: string
  title: string
  year: string
  who: string
  result: string
  source: string
}

export const CASES: CaseStudy[] = [
  { key: 'lusha', title: 'Lusha 침팬지 (러시아)', year: '2009',
    who: '서커스 침팬지가 종목명 적힌 큐브 30개 중 8개를 골라 1년 보유',
    result: '초기 자본 약 3배 — 러시아 펀드 매니저 94% 이상 이김.',
    source: 'CBS·TASS 등 언론 보도' },
  { key: 'orlando', title: 'Orlando 고양이 (영국)', year: '2012',
    who: 'Observer 1년 실험 — 전문가팀 vs 학생팀 vs 고양이(쥐 인형으로 종목 선택)',
    result: '고양이 1등. 전문가팀 ₤8,400 vs 고양이 ₤10,800.',
    source: 'The Observer / The Guardian' },
  { key: 'monkey', title: 'Burton Malkiel "눈 가린 원숭이"', year: '1973',
    who: 'Princeton 교수 Burton Malkiel "A Random Walk Down Wall Street"',
    result: '"눈 가린 원숭이가 던지는 다트가 펀드 매니저와 통계적 차이 없다"',
    source: 'Princeton·WSJ "Investment Dartboard" 14년 후속 실험' },
  { key: 'cass', title: 'Cass Business School 1만 원숭이', year: '2013',
    who: '미국 1,000개 대형주 무작위 포트폴리오 1만 개 시뮬',
    result: '시총가중 지수보다 거의 모든 무작위 포트폴리오가 우수',
    source: 'Cass Business School (현 Bayes)' },
  { key: 'dalbar', title: 'DALBAR — 인간 vs 펀드', year: '매년',
    who: '미국 일반 투자자 vs S&P 500 평균 비교 (DALBAR 매년 발표)',
    result: '20년 평균 일반 투자자 ~3% / S&P 500 ~7~10% — 절반 이하',
    source: 'DALBAR QAIB Report (1994~)' },
]

/** 오늘 날짜 (KST 기준) YYYY-MM-DD — UTC 자정 직후 하루 밀림 방지 */
export function todayKST(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

// ── localStorage (익명, 점수만) ────────
export interface DiagnoseHistory {
  id: string
  date: string  // YYYY-MM-DD
  direction: Direction
  band: DiagnoseResult['band']
  riskScore: number
  rationalScore: number
}

const STORAGE_KEY = 'youtil:stock-decision:history-v1'
const MAX_HISTORY = 50

export function loadHistory(): DiagnoseHistory[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DiagnoseHistory[]) : []
  } catch { return [] }
}
export function saveHistory(history: DiagnoseHistory[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
  } catch { /* quota */ }
}

// ── 무작위 픽 ────────────────────────
export function pickRandom<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)]
}
