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
      { title: '출발 전 준비', note: '환율과 하루 경비로 예산을 잡고, 빠뜨리기 쉬운 준비물과 현지 옷·신발 사이즈를 확인하세요. 유럽이라면 쉥겐 90/180일 체류 한도도 미리 점검.', toolHrefs: ['/tools/life/travel-budget', '/tools/life/packing', '/tools/unit/size', '/tools/date/schengen'] },
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
      { title: '자금·대출 계획', note: 'DSR로 받을 수 있는 대출 한도를 먼저 확인하고, 월 상환액과 청약 가점을 함께 따져보세요. 경매로 접근한다면 낙찰가 외 부대비용도 미리.', toolHrefs: ['/tools/finance/dsr', '/tools/finance/loan', '/tools/finance/housing-score', '/tools/finance/auction'] },
      { title: '집 고르기', note: '전세와 월세 중 무엇이 유리한지, 매매 시 기대 수익률은 어느 정도인지 비교하고, 평형·전용면적도 환산해 보세요.', toolHrefs: ['/tools/finance/rent-jeonse', '/tools/finance/real-estate', '/tools/unit/area'] },
      { title: '셀프 인테리어', note: '벽·바닥 면적을 정확히 재면 도배지·페인트·바닥재를 낭비 없이 주문할 수 있습니다.', toolHrefs: ['/tools/interior/room-area', '/tools/interior/paint', '/tools/interior/wallpaper', '/tools/interior/flooring'] },
      { title: '쾌적한 환경 만들기', note: '환기량과 공기청정기 용량, 공간별 조명 밝기, 에어컨 평형, 커튼·블라인드 사이즈까지 맞춰 집을 쾌적하게 완성하세요.', toolHrefs: ['/tools/interior/ventilation', '/tools/interior/lighting', '/tools/interior/ac-capacity', '/tools/interior/curtain-blind'] },
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
      { title: '회선·환경 점검', note: '예매는 0.1초 싸움입니다. 핑·지터·실패율로 내 인터넷이 티켓팅에 적합한지, 예매처 응답이 빠른지 먼저 진단하세요.', toolHrefs: ['/tools/dev/network-test'] },
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
    color: '#A16207',
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
      { title: '소득·세금 점검', note: '올해 연봉 실수령액을 다시 확인하고, 프리랜서는 종합소득세를, 퇴직·상속이 있었다면 퇴직소득세·상속증여세까지 미리 가늠해 두세요.', toolHrefs: ['/tools/finance/salary', '/tools/finance/freelance-tax', '/tools/finance/severance', '/tools/finance/inheritance'] },
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
      { title: '러닝·유산소', note: '이지 페이스(LSD)로 토대를 쌓고, 빌드업·인터벌로 강도를 올리고, 목표 기록과 심폐능력(VO2max)을 예측하세요.', toolHrefs: ['/tools/sports/pace', '/tools/sports/lsd', '/tools/sports/buildup', '/tools/sports/interval-training', '/tools/sports/race-predictor', '/tools/sports/vo2max'] },
      { title: '회복·컨디셔닝', note: '운동만큼 회복도 실력입니다. 쌓인 수면 부채를 확인하고, 카페인은 취침을 방해하지 않게 섭취 타이밍을 조절하세요.', toolHrefs: ['/tools/health/sleep-debt', '/tools/health/caffeine'] },
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
    color: '#A16207',
    seasonMonths: [2, 3],
    steps: [
      { title: '돈 관리', note: '연봉 실수령액과 4대보험 공제를 확인하고, 매달 얼마를 모을 수 있을지 계획하세요.', toolHrefs: ['/tools/finance/salary', '/tools/finance/4-insurance', '/tools/finance/savings'] },
      { title: '집·살림', note: '전월세 조건을 비교하고, 방 면적을 재서 가구·가전 배치를 가늠하세요.', toolHrefs: ['/tools/finance/rent-jeonse', '/tools/interior/room-area'] },
      { title: '생활 꿀팁', note: '라면 물 양과 전자레인지 출력 환산, 식재료 보관 기한, 상황별 청소 세제, 빨래 건조 시간, 단위당 가격 비교까지 — 소소하지만 매일 쓰는 것들.', toolHrefs: ['/tools/cooking/ramen', '/tools/cooking/microwave', '/tools/cooking/food-storage', '/tools/life/cleaning', '/tools/life/laundry-dry', '/tools/life/unit-price'] },
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
  {
    slug: 'developer-toolkit',
    short: '개발자 실전 툴킷',
    title: '개발자 실전 툴킷, 자주 쓰는 것만',
    lead: '인코딩·해시·정규식부터 JSON·YAML 변환, API·네트워크 점검까지 — 브라우저에서 바로.',
    intro: '개발하다 보면 잠깐잠깐 필요한 변환·검증 도구들이 있죠. 매번 검색하지 않도록 인코딩과 해시, JSON·YAML 정리, 정규식 테스트, API·네트워크 점검까지 손이 자주 가는 것들을 한곳에 모았습니다. 전부 브라우저에서 처리돼 데이터가 서버로 새어 나가지 않아요.',
    emoji: '🖥️',
    color: '#0EA5E9',
    steps: [
      { title: '인코딩·해시', note: '텍스트·URL·진법을 변환하고, MD5·SHA 해시와 HMAC 서명·파일 무결성을 확인하세요.', toolHrefs: ['/tools/dev/base64', '/tools/dev/url-encode', '/tools/dev/number-base', '/tools/dev/hash'] },
      { title: '데이터·포맷', note: 'JSON·YAML을 정렬·검증·상호 변환하고, CSS 단위를 바꾸고, 정규식을 실시간으로 테스트하세요.', toolHrefs: ['/tools/dev/json', '/tools/dev/yaml-json', '/tools/dev/css-converter', '/tools/dev/regex'] },
      { title: '토큰·스케줄·입력', note: 'JWT 클레임과 만료 시각을 확인하고, 크론 표현식을 한국어로 해석하고, 한영키 오타를 복원하세요.', toolHrefs: ['/tools/dev/jwt', '/tools/dev/cron', '/tools/dev/keyboard-layout'] },
      { title: 'API·네트워크', note: 'cURL을 fetch·axios·Python 코드로 바꾸고, HTTP 상태 코드를 해석하고, 회선 품질을 진단하세요.', toolHrefs: ['/tools/dev/curl', '/tools/dev/http-status', '/tools/dev/network-test'] },
      { title: '웹·AI 개발', note: '공유 카드(OG)를 미리 확인하고, AI 토큰 수·API 비용을 추정하고, 프로젝트 기술 스택을 추천받으세요.', toolHrefs: ['/tools/dev/og-preview', '/tools/dev/token-counter', '/tools/dev/tech-stack'] },
    ],
  },
  {
    slug: 'exam-prep',
    short: '수능·시험 집중',
    title: '수능·시험, 끝까지 집중하기',
    lead: '복습 간격·집중 타이머·인지력 점검부터 D-day 페이스, 학점 환산까지 — 시험 시즌 루틴.',
    intro: '시험은 벼락치기보다 꾸준한 루틴이 이깁니다. 망각곡선에 맞춰 복습하고, 뽀모도로로 집중을 관리하고, D-day로 남은 페이스를 잡으면 시험 시즌을 흔들림 없이 보낼 수 있어요. 수능·기말·자격증까지, 공부의 마지막 구간을 돕는 도구를 모았습니다.',
    emoji: '📚',
    color: '#4F46E5',
    seasonMonths: [6, 11],
    steps: [
      { title: '집중·암기 루틴', note: '뽀모도로로 집중 사이클을 돌리고, 망각곡선·SM-2로 복습 타이밍을 잡고, 인지 테스트로 컨디션을 점검하세요.', toolHrefs: ['/tools/life/pomodoro', '/tools/edu/review-interval', '/tools/edu/cognitive-test'] },
      { title: 'D-day·성적 관리', note: '시험·접수까지 남은 날을 세고, 수강신청·원서접수는 서버 시간으로 정확히. 학점은 4.5↔4.0↔영국 등급으로 환산하세요.', toolHrefs: ['/tools/date/dday', '/tools/date/server-time', '/tools/edu/gpa-converter'] },
    ],
  },
  {
    slug: 'science-lab',
    short: '과학·실험 도구',
    title: '과학이 재미있어지는 계산기',
    lead: '전기 회로·음속·우주 스케일부터 단위 변환·유효숫자·사고 실험까지.',
    intro: '교과서 속 공식이 눈앞에서 움직이면 과학은 한결 재미있어집니다. 옴의 법칙으로 회로를 시뮬레이션하고, 천둥까지의 거리를 음속으로 재고, 138억 년 우주의 역사를 1년 달력으로 압축해 보세요. 학생·교사·과학 덕후를 위한 탐구 도구를 모았어요.',
    emoji: '🔬',
    color: '#2563EB',
    steps: [
      { title: '전기·소리·음향', note: '옴의 법칙으로 직렬·병렬 회로를, 음속으로 천둥 거리를, 룸 모드로 방의 음향 특성을 계산하세요.', toolHrefs: ['/tools/edu/circuit-simulator', '/tools/edu/sound-speed', '/tools/edu/room-mode'] },
      { title: '우주·스케일', note: '다른 행성에서의 내 몸무게와 나이, 138억 년을 1년으로 압축한 코스믹 캘린더로 스케일 감각을 키우세요.', toolHrefs: ['/tools/edu/planet-comparison', '/tools/edu/cosmic-calendar'] },
      { title: '측정·계산·추정', note: '과학 단위를 변환하고, 유효숫자·오차를 다루고, 막막한 문제를 페르미 추정으로 쪼개 보세요.', toolHrefs: ['/tools/edu/sci-units', '/tools/edu/sig-figs', '/tools/edu/fermi-estimate'] },
      { title: '사고 실험', note: '외계 문명의 수를 변수로 추정하고, 몬티홀 문제로 직관을 뒤엎는 확률을 체험하세요.', toolHrefs: ['/tools/life/drake', '/tools/life/monty-hall'] },
    ],
  },
  {
    slug: 'overseas-shopping',
    short: '블프·해외 직구',
    title: '블랙프라이데이·해외직구 똑똑하게',
    lead: '관부가세 포함 진짜 가격, 단가 비교부터 해외 사이즈·단위·배터리 반입까지.',
    intro: '해외 직구는 표시 가격이 끝이 아닙니다. 관부가세 면세 한도를 넘기면 세금이 붙고, 사이즈와 전압·배터리 규격도 우리와 달라요. 블랙프라이데이·광군제 전에 정말 이득인지 따져보고 규격을 미리 확인하는 도구를 모았습니다.',
    emoji: '🛒',
    color: '#F43F5E',
    seasonMonths: [11],
    steps: [
      { title: '진짜 가격 따지기', note: '관부가세를 더한 실제 지불 금액을 계산하고, 국내가와 1개·1g당 단가로 정말 싼지 비교하세요.', toolHrefs: ['/tools/life/customs', '/tools/life/unit-price'] },
      { title: '규격·사이즈 확인', note: '해외 의류·신발 사이즈를 한국 기준으로, 단위를 변환하고, 보조배터리·전자제품의 기내 반입 가능 여부를 확인하세요.', toolHrefs: ['/tools/unit/size', '/tools/unit/converter', '/tools/unit/battery'] },
    ],
  },
  {
    slug: 'car-ownership',
    short: '첫 차 구매·관리',
    title: '첫 차, 사기 전부터 관리까지',
    lead: '유지비·세금·할부 부담부터 연비·타이어 공기압·엔진오일 점도까지.',
    intro: '차는 사는 순간보다 굴리는 동안 돈이 더 듭니다. 보험·세금·감가까지 더한 진짜 유지비를 먼저 가늠하고 할부 이자를 따져본 뒤, 출고 후엔 연비와 타이어·엔진오일을 직접 챙기면 비용을 크게 줄일 수 있어요. 첫 차 오너를 위한 계산 도구를 모았습니다.',
    emoji: '🚗',
    color: '#475569',
    steps: [
      { title: '사기 전 비용 점검', note: '유류·보험·세금·감가까지 더한 연간 유지비, 취득세·자동차세, 할부 이자를 미리 계산해 예산을 잡으세요.', toolHrefs: ['/tools/finance/car-cost', '/tools/finance/car-tax', '/tools/finance/installment'] },
      { title: '출고 후 관리', note: '연비를 기록·환산하고, 타이어 공기압을 점검하고, 엔진오일 점도(0W-20·5W-30 등)를 맞게 고르세요.', toolHrefs: ['/tools/unit/fuel-economy', '/tools/unit/tire-pressure', '/tools/unit/viscosity'] },
    ],
  },
  {
    slug: 'diy-repair',
    short: '셀프 수리·DIY',
    title: '셀프 수리·DIY, 규격부터 정확히',
    lead: '나사·볼트·렌치 규격부터 배관·전선 굵기, 몰딩·지붕·철근까지.',
    intro: '집안 수리나 DIY는 규격만 맞으면 절반은 성공입니다. 나사와 볼트, 스패너 사이즈를 정확히 고르고 배관 호칭과 전선 굵기를 맞추면 두 번 사러 가는 일이 없어요. 작은 손수리부터 시공 자재 산출까지, 규격·계산을 돕는 도구를 모았습니다.',
    emoji: '🔧',
    color: '#B45309',
    steps: [
      { title: '나사·볼트·공구', note: '나사 규격과 탭드릴·관통홀, 볼트별 스패너·렌치 사이즈, 금속 경도(HRC·HV)까지 확인하세요.', toolHrefs: ['/tools/interior/screw', '/tools/interior/bolt-wrench', '/tools/unit/hardness'] },
      { title: '배관·전기', note: '배관 호칭(A·인치·DN)과 재질별 실제 안지름, 사용 가전 W에 맞는 전선 굵기와 차단기 용량을 맞추세요.', toolHrefs: ['/tools/interior/pipe', '/tools/interior/wire'] },
      { title: '마감·구조 자재', note: '몰딩·걸레받이 길이, 지붕 면적, 철근 중량·본수까지 — 시공 전 자재 물량을 산출하세요.', toolHrefs: ['/tools/interior/molding', '/tools/interior/roof', '/tools/interior/rebar'] },
    ],
  },
  {
    slug: 'content-creator',
    short: '콘텐츠 크리에이터',
    title: '콘텐츠 크리에이터의 계산기',
    lead: '영상·음악 편집 BPM부터 썸네일 색·구도·해상도, 글자 수, 공유 카드 미리보기까지.',
    intro: '영상 하나를 올리기까지 편집, 썸네일, 제목, 공유까지 손이 많이 가죠. 편집의 박자를 맞추고 눈에 띄는 색과 구도를 잡고, 제목 글자 수를 다듬고, 공유될 때의 카드까지 미리 확인하면 완성도가 올라갑니다. 크리에이터의 작업을 돕는 도구를 모았어요.',
    emoji: '🎬',
    color: '#C026D3',
    steps: [
      { title: '영상·음악 편집', note: 'BPM으로 딜레이·리버브 ms를, 탭 템포로 곡의 박자를, 주파수↔음정으로 사운드를 잡으세요.', toolHrefs: ['/tools/art/bpm', '/tools/art/tap-tempo', '/tools/art/frequency'] },
      { title: '썸네일·그래픽', note: '색상 코드와 그라디언트, 황금비 구도, 인쇄·고해상 출력에 필요한 해상도까지 디자인을 다듬으세요.', toolHrefs: ['/tools/art/color', '/tools/art/gradient-generator', '/tools/art/golden-ratio', '/tools/art/print-resolution'] },
      { title: '제목·배포', note: '제목·자막 글자 수를 맞추고, 더미 텍스트로 레이아웃을 잡고, 카톡·X에 공유될 카드를 미리 확인하세요.', toolHrefs: ['/tools/art/charcount', '/tools/art/lorem', '/tools/dev/og-preview'] },
    ],
  },
  {
    slug: 'winter-cooking',
    short: '김장·겨울 집밥',
    title: '김장과 겨울 저장 음식',
    lead: '김장 양·비용부터 과일청 비율, 식재료 냉장·냉동 보관, 해동·대체까지.',
    intro: '날이 추워지면 김장과 저장 음식의 계절입니다. 가족 수에 맞는 김장 양과 비용을 잡고, 제철 과일로 청을 담그고, 김치냉장고와 냉동실을 알뜰하게 관리하면 겨우내 든든해요. 겨울 집밥과 저장을 돕는 도구를 모았습니다.',
    emoji: '🥬',
    color: '#15803D',
    seasonMonths: [11, 12],
    steps: [
      { title: '김장·저장식 담그기', note: '가족 수로 김장 배추·양념·비용을 산출하고, 제철 과일로 청 설탕 비율과 숙성 일정을 잡으세요.', toolHrefs: ['/tools/cooking/kimjang', '/tools/cooking/fruit-syrup'] },
      { title: '보관·활용', note: '냉장·냉동 보관 기한을 확인하고, 식품별로 안전하게 해동하고, 떨어진 재료는 대체 비율로 바꿔 쓰세요.', toolHrefs: ['/tools/cooking/food-storage', '/tools/cooking/thawing', '/tools/cooking/substitute'] },
    ],
  },
  {
    slug: 'home-baking',
    short: '홈베이킹·홈카페',
    title: '홈베이킹과 홈카페, 비율부터 정확히',
    lead: '사워도우·베이커 퍼센트·제빵 타임라인부터 제과 비율, 계란, 커피·차 추출까지.',
    intro: '집에서 빵을 굽고 커피를 내리는 일은 결국 비율과 타이밍의 예술입니다. 밀가루 기준 재료 비율을 맞추고 발효·굽기 일정을 역산하면 실패가 줄어요. 빵과 디저트, 브런치와 홈카페까지 — 손맛에 정확함을 더하는 도구를 모았습니다.',
    emoji: '🧁',
    color: '#D97706',
    steps: [
      { title: '빵 만들기', note: '사워도우 스타터를 관리하고, 밀가루 100% 기준 베이커 퍼센트로 재료를 잡고, 완성 시각에서 발효·굽기 일정을 역산하세요.', toolHrefs: ['/tools/cooking/sourdough', '/tools/cooking/baker-percent', '/tools/cooking/baking-schedule'] },
      { title: '디저트·과자', note: '마들렌·파운드·쿠키 등 제과 비율을 맞추고, 인분만 바꿔 모든 재료를 비례 환산하세요.', toolHrefs: ['/tools/cooking/baking-recipe', '/tools/cooking/recipe'] },
      { title: '브런치·홈카페', note: '계란 익힘을 단계별로, 핸드드립·콜드브루 비율과 차 우리기 온도·시간까지 맞추세요.', toolHrefs: ['/tools/cooking/egg-timer', '/tools/cooking/brew', '/tools/cooking/tea'] },
    ],
  },
  {
    slug: 'golf',
    short: '골프 라운드',
    title: '골프 라운드, 준비부터 스코어까지',
    lead: '클럽별 비거리·그립 사이즈부터 핸디캡·라운드 비용 정산까지.',
    intro: '골프는 장비와 숫자를 알면 한결 수월해집니다. 내 손에 맞는 그립과 클럽별 비거리를 파악하고, 라운드 후엔 핸디캡으로 실력을 객관화하고 비용을 깔끔하게 나누세요. 필드에 나가기 전후로 챙기면 좋은 도구를 모았습니다.',
    emoji: '⛳',
    color: '#65A30D',
    seasonMonths: [4, 5, 9, 10],
    steps: [
      { title: '라운드 준비', note: '드라이버·7번 기록으로 전체 클럽 비거리를 추정하고, 손 크기에 맞는 그립 사이즈를 확인하세요.', toolHrefs: ['/tools/sports/golf-distance', '/tools/sports/grip-size'] },
      { title: '스코어·비용', note: 'WHS 핸디캡으로 실력을 객관화하고, 그린피·카트·캐디·식사를 1인당으로 정산하세요.', toolHrefs: ['/tools/sports/golf-handicap', '/tools/sports/golf-cost'] },
    ],
  },
  {
    slug: 'music-making',
    short: '악기·작곡',
    title: '악기 연주와 작곡, 이론은 계산기에게',
    lead: '음역대·주파수부터 코드 구성음·스케일·카포, BPM·탭 템포까지.',
    intro: '연주하고 곡을 만들 때 매번 멈춰서 이론을 떠올릴 필요는 없습니다. 내 음역대를 재고, 코드와 스케일을 즉시 확인하고, 카포 위치와 박자를 맞추면 음악에만 집중할 수 있어요. 연주자·작곡가·버스킹을 위한 도구를 모았습니다.',
    emoji: '🎸',
    color: '#8B5CF6',
    steps: [
      { title: '음정·음역', note: '마이크로 내 최저·최고음을 측정하고, 주파수와 음정·MIDI 번호를 상호 변환하세요.', toolHrefs: ['/tools/art/vocal-range', '/tools/art/frequency'] },
      { title: '코드·스케일', note: '코드 구성음과 역방향 검색, 12키 × 스케일 지판, 원곡 키에 맞는 카포 위치를 확인하세요.', toolHrefs: ['/tools/art/chord', '/tools/art/scale', '/tools/art/capo'] },
      { title: '박자·템포', note: 'BPM으로 딜레이·리버브 ms를 잡고, 박자에 맞춰 탭하면 곡의 템포를 측정합니다.', toolHrefs: ['/tools/art/bpm', '/tools/art/tap-tempo'] },
    ],
  },
  {
    slug: 'investing',
    short: '주식·재테크',
    title: '주식·재테크, 추천 대신 계산으로',
    lead: '복리 효과·월배당 목표·물타기 평단부터 공모주 증거금, 금 시세 환산까지.',
    intro: '투자는 결국 숫자 싸움입니다. 복리가 시간에 따라 만드는 차이를 시뮬레이션하고, 목표 배당액에서 필요한 원금을 역산하고, 추가 매수 시 평단이 어디까지 내려가는지 직접 따져보세요. 종목 추천이 아니라 스스로 판단하도록 돕는 계산 도구를 모았습니다.',
    emoji: '📈',
    color: '#16A34A',
    steps: [
      { title: '자산 굴리기', note: '복리 효과를 시나리오별로 비교하고, 매달 받고 싶은 배당액에서 필요한 원금을 역산하세요.', toolHrefs: ['/tools/finance/compound', '/tools/finance/dividend'] },
      { title: '매매·종목', note: '물타기 시 평단가와 회복 상승률을 계산하고, 매매 전 행동경제학 편향을 점검하고, 공모주 증거금을 확인하세요.', toolHrefs: ['/tools/finance/stock', '/tools/finance/stock-decision', '/tools/finance/ipo-deposit'] },
      { title: '실물·기타', note: '돈·g·트로이온스 단위와 14K/18K/24K 금 시세를 환산하세요.', toolHrefs: ['/tools/finance/gold-converter'] },
    ],
  },
  {
    slug: 'business-owner',
    short: '자영업 사장님',
    title: '자영업·프리랜서, 세금과 원가 챙기기',
    lead: '부가세·종합소득세·4대보험부터 메뉴 원가율, 할부, 현금흐름까지.',
    intro: '장사와 프리랜싱은 버는 것만큼 새는 것을 막는 게 중요합니다. 부가세와 종합소득세를 미리 가늠하고, 메뉴 원가율로 진짜 마진을 확인하고, 현금흐름과 저축까지 관리하면 사업이 한결 단단해져요. 사장님·1인 사업자를 위한 도구를 모았습니다.',
    emoji: '🏪',
    color: '#A16207',
    seasonMonths: [5],
    steps: [
      { title: '세금·보험', note: '공급가↔세액 부가세를 역산하고, 종합소득세를 업종별로 가늠하고, 4대보험 사업주 부담을 확인하세요.', toolHrefs: ['/tools/finance/vat', '/tools/finance/freelance-tax', '/tools/finance/4-insurance'] },
      { title: '원가·자금', note: '재료비·수수료 반영 원가율과 마진을 확인하고, 카드 할부 부담과 현금흐름·저축을 관리하세요.', toolHrefs: ['/tools/finance/cost-rate', '/tools/finance/installment', '/tools/finance/savings'] },
    ],
  },
  {
    slug: 'new-baby',
    short: '임신·출산 준비',
    title: '임신·출산, 차근차근 준비하기',
    lead: '가임기·배란일부터 임신 주수, 출산예정일 D-day, 아기 100일·돌까지.',
    intro: '아기를 기다리는 시간은 설레는 만큼 챙길 것도 많습니다. 가임기를 확인하며 계획하고, 임신 주수와 검사 일정을 따라가고, 출산예정일까지 D-day로 세어보세요. 태어난 뒤엔 100일·돌까지 — 임신부터 육아 초기를 함께하는 도구를 모았습니다.',
    emoji: '👶',
    color: '#EC4899',
    steps: [
      { title: '임신 준비·진행', note: '배란일·가임기를 확인하며 계획하고, 지금 임신 몇 주차인지와 산전 검사·출산예정일 D-day를 따라가세요.', toolHrefs: ['/tools/health/cycle', '/tools/health/pregnancy', '/tools/date/dday'] },
      { title: '아기 맞이', note: '태어난 아기의 100일·돌 같은 기념일을 나이와 D-day로 챙기세요.', toolHrefs: ['/tools/date/age'] },
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
