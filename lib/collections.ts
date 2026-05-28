// ──────────────────────────────────────────────────────
// lib/collections.ts — 상황·라이프이벤트별 큐레이션 컬렉션 (단일 소스)
// 도구는 href로만 참조하고 allTools에서 해석 → 이름/설명 중복·끊긴 링크 방지
// ──────────────────────────────────────────────────────
import { allTools, type Tool } from './tools'

export interface CollectionStep {
  /** 단계명 (예: '출발 전 준비') */
  title: string
  /** 단계 큐레이션 코멘트 (한 문장) */
  note?: string
  /** 이 단계에 묶이는 도구 href 목록 */
  toolHrefs: string[]
}

export interface Collection {
  slug: string
  /** 배너·카드용 짧은 제목 */
  short: string
  /** 랜딩 페이지 H1 풀 제목 */
  title: string
  /** 한 줄 설명 */
  lead: string
  /** 사람이 쓴 듯한 도입 문단 (랜딩 상단) */
  intro: string
  emoji: string
  color: string
  /** 이 컬렉션이 부각될 월(1-12). 없으면 상시 */
  seasonMonths?: number[]
  steps: CollectionStep[]
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'overseas-travel',
    short: '해외여행 준비~귀국',
    title: '완벽한 해외여행, 준비부터 귀국까지',
    lead: '예산·짐·옷 사이즈부터 현지 시차·팁·더치페이, 귀국 시 면세 한도까지 한 번에.',
    intro: '비행기 표만 끊는다고 여행 준비가 끝나는 건 아니죠. 예산을 짜고, 짐을 빠짐없이 챙기고, 현지에서 시차와 팁 문화에 적응하고, 돌아올 땐 면세 한도까지 — 여행의 처음과 끝에 필요한 계산을 순서대로 모았습니다.',
    emoji: '✈️',
    color: '#0891B2',
    seasonMonths: [1, 7, 8, 12],
    steps: [
      { title: '출발 전 준비', note: '환율과 하루 경비로 예산을 잡고, 빠뜨리기 쉬운 준비물과 현지 옷·신발 사이즈를 미리 확인하세요.', toolHrefs: ['/tools/life/travel-budget', '/tools/life/packing', '/tools/unit/size'] },
      { title: '현지에서', note: '한국과의 시차를 확인하고, 나라별 팁 문화에 맞춰 계산하고, 일행과 비용은 깔끔하게 나누세요.', toolHrefs: ['/tools/date/timezone', '/tools/life/travel-tip', '/tools/life/dutch'] },
      { title: '돌아올 때', note: '면세 한도를 넘기면 세관 신고 대상입니다. 귀국 후 며칠은 시차 적응이 필요할 수 있어요.', toolHrefs: ['/tools/life/customs', '/tools/date/jet-lag'] },
    ],
  },
  {
    slug: 'home-buying',
    short: '내집마련~셀프 인테리어',
    title: '내 집 마련부터 셀프 인테리어까지',
    lead: '대출 한도·청약·전월세 비교부터 도배·페인트·바닥재 물량까지, 집에 관한 계산을 한곳에서.',
    intro: '내 집 마련은 인생에서 가장 큰 계산입니다. 빌릴 수 있는 한도를 먼저 확인하고, 매물을 비교하고, 입주 후 셀프 인테리어 자재 물량까지 — 자금 계획부터 마무리 시공까지 단계별로 짚어봤어요.',
    emoji: '🏠',
    color: '#059669',
    steps: [
      { title: '자금·대출 계획', note: 'DSR로 받을 수 있는 대출 한도를 먼저 확인하고, 월 상환액과 청약 가점을 함께 따져보세요.', toolHrefs: ['/tools/finance/dsr', '/tools/finance/loan', '/tools/finance/housing-score'] },
      { title: '집 고르기', note: '전세와 월세 중 무엇이 유리한지, 매매 시 기대 수익률은 어느 정도인지 비교해 보세요.', toolHrefs: ['/tools/finance/rent-jeonse', '/tools/finance/real-estate'] },
      { title: '셀프 인테리어', note: '벽·바닥 면적을 정확히 재면 도배지·페인트·바닥재를 낭비 없이 주문할 수 있습니다.', toolHrefs: ['/tools/interior/room-area', '/tools/interior/paint', '/tools/interior/wallpaper', '/tools/interior/flooring'] },
    ],
  },
  {
    slug: 'family-holiday',
    short: '명절 가족 행사 대비',
    title: '명절 가족 행사 완벽 대비',
    lead: '상차림 인원수, 음력 날짜, 비용 분담까지 — 명절 준비를 매끄럽게.',
    intro: '명절은 챙길 게 많습니다. 몇 인분을 준비할지, 차례·성묘 날짜가 음력으로 언제인지, 흩어진 비용은 어떻게 나눌지 — 가족 행사를 매끄럽게 치르는 데 필요한 도구를 모았어요.',
    emoji: '🍽️',
    color: '#EA580C',
    seasonMonths: [1, 2, 9, 10],
    steps: [
      { title: '상차림·인원', note: '참석 인원에 맞춰 상차림 양과 장보기 분량을 가늠하세요.', toolHrefs: ['/tools/cooking/holiday-table', '/tools/cooking/serving', '/tools/cooking/kimjang'] },
      { title: '날짜·일정', note: '설·추석은 음력 기준이라 해마다 양력 날짜가 달라집니다. D-day로 남은 날도 세어보세요.', toolHrefs: ['/tools/date/lunar', '/tools/date/dday'] },
      { title: '비용 정산', note: '차례 비용이나 가족 여행비는 더치페이로 깔끔하게 나누면 뒤탈이 없습니다.', toolHrefs: ['/tools/life/dutch'] },
    ],
  },
  {
    slug: 'ticketing',
    short: '실패 없는 티켓팅·수강신청',
    title: '실패 없는 티켓팅·수강신청',
    lead: '서버 시간을 ±0초로 맞추고 시작 시각을 카운트다운 — 콘서트 예매·수강신청·선착순 이벤트.',
    intro: '콘서트 예매도, 수강신청도, 선착순 이벤트도 결국 ‘시간 싸움’입니다. 1초 차이로 갈리는 순간을 위해, 서버 시간을 정확히 맞추고 시작 시각을 카운트다운하는 도구를 모았어요.',
    emoji: '🎫',
    color: '#9333EA',
    steps: [
      { title: '정확한 시각 맞추기', note: '내 컴퓨터 시계는 몇 초씩 어긋나 있을 수 있습니다. 서버 시간으로 맞추고, 해외 예매라면 현지 시각도 확인하세요.', toolHrefs: ['/tools/date/server-time', '/tools/date/timezone'] },
      { title: 'D-day·카운트다운', note: '오픈까지 남은 날짜와 시간을 미리 세어두면 마음의 준비가 됩니다.', toolHrefs: ['/tools/date/dday'] },
    ],
  },
  {
    slug: 'office-party',
    short: '회식 자리 인싸 되기',
    title: '회식 자리, 센스 있게',
    lead: '더치페이 정산, 사다리·랜덤 뽑기, 술자리 페이스 관리까지 — 모임을 매끄럽게.',
    intro: '회식 자리에서 센스 있는 사람은 따로 있죠. 계산은 1/N로 깔끔하게, 게임은 사다리·랜덤으로 공정하게, 술자리는 내 페이스를 알고 안전하게 — 분위기를 살리는 도구를 모았습니다.',
    emoji: '🍻',
    color: '#CA8A04',
    seasonMonths: [12],
    steps: [
      { title: '정산·게임', note: '더치페이로 N빵을 정확히 나누고, 사다리타기·랜덤 뽑기로 메뉴나 순서를 공정하게 정하세요.', toolHrefs: ['/tools/life/dutch', '/tools/life/ladder', '/tools/life/random'] },
      { title: '술자리 안전', note: '내 주량과 혈중 알코올 농도를 가늠해 무리하지 마세요. 음주 후에는 절대 운전하지 않습니다.', toolHrefs: ['/tools/life/alcohol', '/tools/health/blood-alcohol'] },
    ],
  },
  {
    slug: 'year-end',
    short: '연말정산·새해 준비',
    title: '연말정산부터 새해 계획까지',
    lead: '연봉 실수령·세금 점검, 만 나이 확인, 새해 D-day까지 — 한 해를 정리하고 새해를 준비.',
    intro: '한 해의 끝은 정리와 시작이 함께 오는 때입니다. 연봉 실수령과 세금을 점검하고, 바뀐 만 나이를 확인하고, 새해 목표까지 D-day로 세어보며 한 해를 마무리해 보세요.',
    emoji: '📅',
    color: '#DC2626',
    seasonMonths: [1, 12],
    steps: [
      { title: '소득·세금 점검', note: '올해 연봉 실수령액을 다시 확인하고, 프리랜서라면 종합소득세를 미리 가늠해 두세요.', toolHrefs: ['/tools/finance/salary', '/tools/finance/freelance-tax'] },
      { title: '날짜·계획', note: '만 나이 통일 이후 내 나이를 정확히 확인하고, 새해 목표일까지 D-day를 세어보세요.', toolHrefs: ['/tools/date/age', '/tools/date/dday'] },
    ],
  },
  {
    slug: 'workout-routine',
    short: '운동·러닝 루틴 만들기',
    title: '운동·러닝 루틴, 작심삼일 없이',
    lead: '기초대사량·근력 1RM·러닝 페이스·심폐능력까지 — 내 기준에 맞는 운동 계획.',
    intro: '운동은 작심삼일이 되기 쉽죠. 막연히 시작하기보다 내 몸의 기준치를 알고, 적절한 강도와 페이스로 계획을 세우면 훨씬 오래갑니다. 근력부터 러닝까지 기록을 관리하는 도구를 모았어요.',
    emoji: '🏃',
    color: '#0D9488',
    seasonMonths: [1, 3, 4],
    steps: [
      { title: '내 몸 기준 알기', note: '기초대사량과 BMI로 현재 상태와 하루 권장 열량을 먼저 파악하세요.', toolHrefs: ['/tools/health/bmr', '/tools/health/bmi'] },
      { title: '근력 운동', note: '1RM(최대 중량)을 추정해 무게와 반복수를 안전하게 설계하고, 3대 측정으로 내 근력 레벨이 어디쯤인지 확인하세요.', toolHrefs: ['/tools/sports/one-rm', '/tools/sports/strength-level'] },
      { title: '러닝·유산소', note: '목표 페이스와 기록을 예측하고, 인터벌 훈련과 심폐능력(VO2max)으로 단계를 높이세요.', toolHrefs: ['/tools/sports/pace', '/tools/sports/race-predictor', '/tools/sports/interval-training', '/tools/sports/vo2max'] },
    ],
  },
  {
    slug: 'diet',
    short: '다이어트·체중 관리',
    title: '다이어트, 숫자로 시작하기',
    lead: 'BMI·기초대사량·목표 감량 기간부터 간식·카페인·영양제 점검까지.',
    intro: '다이어트의 시작은 ‘내 몸을 아는 것’입니다. 목표 체중까지 얼마나 줄여야 하는지, 하루에 얼마나 먹어야 하는지 숫자로 확인하면 막연함이 줄어듭니다. 체중 관리와 식단 점검 도구를 모았어요.',
    emoji: '⚖️',
    color: '#059669',
    seasonMonths: [1, 5, 6],
    steps: [
      { title: '현재 상태 진단', note: 'BMI로 비만도를, 기초대사량으로 하루 소비 열량을, 감량 계산기로 목표까지의 기간을 확인하세요.', toolHrefs: ['/tools/health/bmi', '/tools/health/bmr', '/tools/health/weightloss'] },
      { title: '식단·영양 점검', note: '간식 견과류의 적정량, 카페인 섭취, 영양제 중복까지 챙기면 더 건강하게 관리할 수 있어요.', toolHrefs: ['/tools/cooking/nuts', '/tools/health/caffeine', '/tools/health/supplement'] },
    ],
  },
  {
    slug: 'solo-living',
    short: '자취 시작 필수템',
    title: '처음 시작하는 자취, 필수 도구',
    lead: '실수령 월급·전월세·방 면적부터 라면 물양·빨래 건조·단가 비교까지.',
    intro: '처음 독립하면 챙길 게 한둘이 아니죠. 월급에서 실제로 손에 쥐는 돈부터, 방 크기에 맞는 살림, 장 볼 때 더 싼 선택까지 — 1인 가구의 시작을 돕는 도구를 모았습니다.',
    emoji: '🧰',
    color: '#CA8A04',
    seasonMonths: [2, 3],
    steps: [
      { title: '돈 관리', note: '연봉 실수령액과 4대보험 공제를 확인하고, 매달 얼마를 모을 수 있을지 계획하세요.', toolHrefs: ['/tools/finance/salary', '/tools/finance/4-insurance', '/tools/finance/savings'] },
      { title: '집·살림', note: '전월세 조건을 비교하고, 방 면적을 재서 가구·가전 배치를 가늠하세요.', toolHrefs: ['/tools/finance/rent-jeonse', '/tools/interior/room-area'] },
      { title: '생활 꿀팁', note: '라면 물 양, 빨래 건조 시간, 같은 제품의 단위당 가격 비교까지 — 소소하지만 매일 쓰는 것들.', toolHrefs: ['/tools/cooking/ramen', '/tools/life/laundry-dry', '/tools/life/unit-price'] },
    ],
  },
  {
    slug: 'photography',
    short: '사진 촬영 셋업',
    title: '사진, 감각에 계산을 더하기',
    lead: '노출·화각 계산부터 황금비 구도·색상 코드까지 — 의도한 장면을 담는 법.',
    intro: '좋은 사진은 감각만이 아니라 노출·화각·구도의 이해에서 나옵니다. 카메라 설정값을 계산하고, 어떤 렌즈가 어떤 화각인지, 황금비로 구도를 잡는 도구까지 모았어요.',
    emoji: '📷',
    color: '#9333EA',
    steps: [
      { title: '노출·화각', note: '조리개·셔터·ISO의 노출 관계와 초점거리별 화각을 계산해 원하는 장면을 담으세요.', toolHrefs: ['/tools/art/exposure', '/tools/art/fov'] },
      { title: '구도·색', note: '황금비로 안정적인 구도를 잡고, 색상 코드를 변환해 보정·브랜딩에 활용하세요.', toolHrefs: ['/tools/art/golden-ratio', '/tools/art/color'] },
    ],
  },
  {
    slug: 'camping',
    short: '캠핑·등산 준비',
    title: '캠핑·등산, 든든하게 준비하기',
    lead: '산행 소요 시간·준비물 체크부터 자외선·타이어 공기압 점검까지.',
    intro: '자연으로 떠나기 전, 안전과 편의를 위한 준비가 반입니다. 산행 시간을 가늠하고, 빠진 짐이 없는지 챙기고, 자외선과 차량 타이어까지 점검하면 한결 든든합니다.',
    emoji: '⛺',
    color: '#EA580C',
    seasonMonths: [4, 5, 9, 10],
    steps: [
      { title: '일정·짐', note: '코스별 산행 소요 시간을 예측하고, 캠핑·등산 준비물을 빠짐없이 챙기세요.', toolHrefs: ['/tools/sports/hiking-time', '/tools/life/packing'] },
      { title: '안전·이동', note: '야외 자외선 차단 시간을 확인하고, 출발 전 차량 타이어 공기압을 점검하세요.', toolHrefs: ['/tools/health/uv-protection', '/tools/unit/tire-pressure'] },
    ],
  },
]

// href → Tool 매핑 (단일 소스 유지)
const TOOL_MAP = new Map<string, Tool>(allTools.map((t) => [t.href, t]))

export function resolveTools(hrefs: string[]): Tool[] {
  return hrefs.map((h) => TOOL_MAP.get(h)).filter((t): t is Tool => Boolean(t))
}

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug)
}

export function collectionToolCount(c: Collection): number {
  return c.steps.reduce((n, s) => n + s.toolHrefs.length, 0)
}

/** 시즌(월) 기반 대표 컬렉션 slug — 해당 월 컬렉션 중 일자로 회전, 없으면 전체에서 회전 */
export function getFeaturedSlug(month: number, dayOfYear: number): string {
  const seasonal = COLLECTIONS.filter((c) => c.seasonMonths?.includes(month))
  const pool = seasonal.length > 0 ? seasonal : COLLECTIONS
  return pool[dayOfYear % pool.length].slug
}
