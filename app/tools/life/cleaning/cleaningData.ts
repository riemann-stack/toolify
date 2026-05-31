// ─────────────────────────────────────────────────────────
// 상황별 청소 세제 데이터
//  ⚠️ 안전 원칙: 한 번에 한 가지 세제만. 락스는 물로만 희석·단독·환기.
//     락스 + 산성(구연산·식초)·암모니아·과탄산은 절대 혼합 금지(유독가스).
//  ※ 희석량은 일반적인 권장 근사치이며 제품 농도·오염 정도에 따라 조절하세요.
// ─────────────────────────────────────────────────────────

export interface Agent {
  id: string
  name: string
  sub: string            // 성분/구분
  type: '산성' | '알칼리' | '표백·살균' | '중성'
  ph: string
  uses: string           // 잘 맞는 오염
  tip: string            // 핵심 사용/주의
  color: string
  gPerTbsp?: number      // 가루 1큰술(약 15ml)당 g — 액체는 없음
}

export const AGENTS: Agent[] = [
  { id: 'baking',   name: '베이킹소다',   sub: '탄산수소나트륨 NaHCO₃', type: '알칼리', ph: '약 8', uses: '가벼운 기름때·냄새·연마', tip: '가루로 문지르거나 물에 풀어 사용. 가장 순함', color: '#0891B2', gPerTbsp: 14 },
  { id: 'sesqui',   name: '세스퀴소다',   sub: '세스퀴탄산소다',          type: '알칼리', ph: '약 9~10', uses: '손때·생활 기름때·물걸레 만능', tip: '베이킹·소다회 중간 세기, 물에 잘 녹음', color: '#0EA5E9', gPerTbsp: 12 },
  { id: 'percarb',  name: '과탄산소다',   sub: '산소계 표백 (퍼카보네이트)', type: '표백·살균', ph: '약 10~11', uses: '표백·찌든때·곰팡이·삶기', tip: '40~60℃ 따뜻한 물에서 활성. 밀폐보관·락스 혼합 금지', color: '#059669', gPerTbsp: 13 },
  { id: 'washsoda', name: '소다회',       sub: '탄산나트륨 (워싱소다)',    type: '알칼리', ph: '약 11', uses: '강한 기름때·찌든때', tip: '세기 강함 — 장갑·환기. 알루미늄 변색 주의', color: '#16A34A', gPerTbsp: 18 },
  { id: 'citric',   name: '구연산',       sub: '시트르산 (산성)',          type: '산성', ph: '약 3~4', uses: '물때·석회·소변석·스케일·섬유유연', tip: '대리석·철 부식 주의. 락스와 절대 혼합 금지', color: '#EA580C', gPerTbsp: 12 },
  { id: 'vinegar',  name: '식초',         sub: '아세트산 (산성)',          type: '산성', ph: '약 2~3', uses: '물때·유리·냄새·섬유유연', tip: '구연산과 용도 유사(냄새 강함). 락스와 절대 혼합 금지', color: '#D97706' },
  { id: 'bleach',   name: '락스',         sub: '차아염소산나트륨 4~6%',    type: '표백·살균', ph: '약 11~13', uses: '살균·표백·곰팡이 제거', tip: '☠️ 물로만 희석·단독·환기·헹굼. 산성/암모니아 혼합 시 유독가스', color: '#DC2626' },
  { id: 'peroxide', name: '과산화수소',   sub: '3% 옥시풀',               type: '표백·살균', ph: '중성~약산', uses: '표백·살균(순한 대안)', tip: '빛에 분해. 단독 사용, 락스와 혼합 금지', color: '#7C3AED' },
  { id: 'neutral',  name: '중성세제',     sub: '주방세제 등',             type: '중성', ph: '약 6~8', uses: '일반 기름때·식기', tip: '가장 안전·무난. 식품접촉면에도 사용', color: '#64748B' },
  { id: 'alcohol',  name: '소독용 알코올', sub: '에탄올 70%',             type: '표백·살균', ph: '중성', uses: '살균·유리·전자제품', tip: '인화성(화기 주의). 일부 도장·플라스틱 손상', color: '#9333EA' },
]

export const AGENT_MAP: Record<string, Agent> = Object.fromEntries(AGENTS.map((a) => [a.id, a]))

export interface Situation {
  id: string
  place: string
  stain: string
  emoji: string
  agentId: string
  altId?: string
  gPerL?: number   // 가루 권장 농도
  mlPerL?: number  // 액체(식초·락스) 권장 농도
  ratio?: string   // 비율 표기(식초 1:1 등)
  hot?: boolean    // 따뜻한 물 필요
  steps: string[]
  caution: string
  never: string    // 이 상황에서 함께 쓰면 안 되는 것
}

export const SITUATIONS: Situation[] = [
  { id: 'bath-scale', place: '화장실', stain: '물때·석회', emoji: '🚿', agentId: 'citric', gPerL: 50, steps: ['구연산수를 뿌리고 5~10분 둔다', '수세미·솔로 문지른다', '물로 충분히 헹군다'], caution: '대리석·천연석은 부식되니 사용 금지', never: '락스(염소가스)' },
  { id: 'bath-mold', place: '화장실', stain: '곰팡이·살균', emoji: '🦠', agentId: 'bleach', altId: 'percarb', mlPerL: 50, steps: ['창문·환풍기로 충분히 환기한다', '희석 락스를 곰팡이에 바르고 휴지로 덮어 10~30분', '솔로 닦고 물로 충분히 헹군다'], caution: '단독 사용·장갑·마스크. 색 있는 줄눈은 탈색 주의', never: '구연산·식초·과탄산(유독가스)' },
  { id: 'bath-urine', place: '화장실', stain: '변기 소변석·누런때', emoji: '🚽', agentId: 'citric', altId: 'percarb', gPerL: 60, steps: ['변기 물을 줄이고 구연산 가루/진한 구연산수를 뿌린다', '30분~1시간 불린 뒤 변기솔로 문지른다', '물 내려 헹군다'], caution: '심한 요석은 전용 세정제 고려', never: '락스(염소가스)' },
  { id: 'kitchen-oil', place: '주방', stain: '기름때(레인지·후드)', emoji: '🍳', agentId: 'percarb', altId: 'washsoda', gPerL: 20, hot: true, steps: ['따뜻한 물에 과탄산을 녹여 분무/도포', '10~20분 불린 뒤 닦아낸다', '물걸레로 마무리'], caution: '알루미늄·코팅면은 변색될 수 있어 눈에 안 띄는 곳 먼저 테스트', never: '락스' },
  { id: 'kitchen-burnt', place: '주방', stain: '냄비·팬 눌은때', emoji: '🥘', agentId: 'percarb', gPerL: 30, hot: true, steps: ['냄비에 따뜻한 물 + 과탄산을 넣고 약불로 데운다', '식을 때까지 불린 뒤 부드러운 수세미로 닦는다', '헹군다'], caution: '알루미늄 냄비는 변색되니 스테인리스에 권장', never: '락스' },
  { id: 'fridge', place: '냉장고', stain: '냄새·세척(식품접촉)', emoji: '🧊', agentId: 'baking', altId: 'sesqui', gPerL: 28, steps: ['전원/식품을 정리하고 베이킹소다수로 내부를 닦는다', '깨끗한 물걸레로 한 번 더 닦아 잔여물 제거', '문을 열어 말린다'], caution: '식품이 닿는 곳이라 잔여물은 반드시 물로 헹궈낸다', never: '락스(식품접촉면 부적합)' },
  { id: 'window-frame', place: '창틀·새시', stain: '먼지+곰팡이', emoji: '🪟', agentId: 'baking', altId: 'percarb', gPerL: 28, steps: ['마른 솔·청소솔로 먼지를 먼저 쓸어낸다', '베이킹소다수로 문지른 뒤 닦아낸다', '곰팡이가 심하면 과탄산수 도포 후 헹군다'], caution: '고무 패킹 곰팡이는 과탄산/소량 락스 도포(환기). 두 가지를 함께 쓰지 말 것', never: '락스+과탄산 동시 사용' },
  { id: 'glass', place: '유리·거울', stain: '얼룩·물때', emoji: '🪞', agentId: 'vinegar', altId: 'citric', ratio: '물:식초 1:1', mlPerL: 500, steps: ['식초수를 분무한다', '극세사 천이나 신문지로 한 방향으로 닦는다', '마른 천으로 광을 낸다'], caution: '직사광선 아래선 빨리 말라 얼룩지니 그늘에서', never: '락스(염소가스)' },
  { id: 'laundry-bleach', place: '세탁·삶기', stain: '행주·수건 표백', emoji: '🧺', agentId: 'percarb', gPerL: 20, hot: true, steps: ['40~60℃ 물에 과탄산을 녹인다', '30분~수 시간 담가둔다(찌든 정도)', '헹궈 건조'], caution: '울·실크·금속 장식은 손상되니 면·수건류에', never: '락스(혼합 금지·옷감 손상)' },
  { id: 'fabric-soft', place: '세탁', stain: '섬유유연제 대체', emoji: '👕', agentId: 'citric', gPerL: 20, steps: ['마지막 헹굼물에 구연산을 푼다(또는 식초)', '평소처럼 헹군다'], caution: '세제(알칼리)와 동시에 넣지 말고 헹굼 단계에', never: '락스' },
  { id: 'drain', place: '배수구', stain: '냄새·기름막힘', emoji: '🕳️', agentId: 'baking', altId: 'percarb', gPerL: 0, steps: ['베이킹소다 한 컵을 배수구에 붓는다', '뜨거운 물을 천천히 흘려보낸다(거품이 필요하면 식초 약간)', '5~10분 뒤 더운물로 마무리'], caution: '식초+소다 거품은 세정력이 크진 않음 — 심한 막힘은 전용 제품/도구', never: '락스+산성(염소가스)' },
  { id: 'kettle-scale', place: '전기포트·가습기', stain: '석회 스케일', emoji: '☕', agentId: 'citric', gPerL: 30, steps: ['물을 채우고 구연산을 넣어 끓이거나 1~2시간 둔다', '버린 뒤 깨끗한 물로 2~3회 헹군다', '한 번 끓여 잔여 제거'], caution: '입에 닿는 기구라 헹굼을 충분히', never: '락스' },
  { id: 'washer', place: '세탁조', stain: '세탁조 곰팡이·세척', emoji: '🌀', agentId: 'percarb', gPerL: 0, hot: true, steps: ['빈 세탁조에 과탄산 1~2컵(약 300~500g)을 넣는다', '따뜻한 물 통세척 코스로 돌린다', '이물이 나오면 한 번 더 헹굼 코스'], caution: '제품·세탁기 권장량을 우선 따른다', never: '락스+과탄산 동시 투입' },
]

// 혼합 위험 — 안전 카드용
export interface MixRisk { level: 'danger' | 'caution'; combo: string; result: string }
export const MIX_RISKS: MixRisk[] = [
  { level: 'danger', combo: '락스 + 구연산·식초(산성)', result: '☠️ 염소가스 발생 — 호흡곤란·중독, 밀폐공간에선 치명적' },
  { level: 'danger', combo: '락스 + 암모니아 세제', result: '☠️ 클로라민 가스 발생' },
  { level: 'danger', combo: '락스 + 과탄산소다·과산화수소', result: '⚠️ 가스 발생 + 표백 효과 상쇄' },
  { level: 'danger', combo: '락스 + 알코올', result: '⚠️ 유해 부산물 — 함께 쓰지 말 것' },
  { level: 'caution', combo: '산성(구연산·식초) + 알칼리(베이킹·과탄산·소다회)', result: '🟠 서로 중화 — 세정력이 사라짐(위험은 낮음)' },
]
