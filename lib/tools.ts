export interface Tool {
  href:  string
  icon:  string
  name:  string
  desc:  string
  badge?: 'hot' | 'new'
}

export interface Category {
  id:    string
  icon:  string
  name:  string
  color: string
  tools: Tool[]
}

export const categories: Category[] = [
  {
    id: 'finance', icon: '💰', name: '금융·재테크', color: '#3EFF9B',
    tools: [
      { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '2026년 기준 세후 월 실수령액',    badge: 'hot' },
      { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '원리금균등·원금균등 비교' },
      { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '거치식·적립식 복리 수익' },
      { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '추가 매수 후 새 평단가 계산' },
      { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',        desc: '공급가액·부가세 역산 계산' },
      { href: '/tools/finance/dividend', icon: '💰', name: '월배당 자산 계산기', desc: '목표 월배당금 받기 위한 필요 원금' },
      { href: '/tools/finance/inheritance', icon: '🏛️', name: '상속·증여세 비교 계산기', desc: '증여세·상속세 예상 세액 비교 및 분할 증여 시뮬레이션' },
      { href: '/tools/finance/car-cost', icon: '🚗', name: '자동차 유지비 계산기', desc: '유류비·보험·소모품·감가상각 월·일 단위 환산' },
      { href: '/tools/finance/real-estate', icon: '🏘️', name: '부동산 투자 수익률 계산기', desc: '매매·임대·대출 레버리지 반영 자기자본 수익률' },
      { href: '/tools/finance/cost-rate', icon: '🍽️', name: '메뉴 원가율 계산기', desc: '재료비·배달 수수료·포장재 반영 실질 원가율 및 마진' },
      { href: '/tools/finance/installment', icon: '💳', name: '카드 할부 계산기', desc: '월 납부액·총 이자·일시불 vs 무이자 비교·개월수별 분석' },
      { href: '/tools/finance/4-insurance', icon: '🏥', name: '4대보험 계산기', desc: '국민연금·건강보험·고용보험·산재보험 근로자/사업주 부담·알바·프리랜서 비교' },
    ],
  },
  {
    id: 'health', icon: '🏃', name: '건강·웰빙', color: '#3EC8FF',
    tools: [
      { href: '/tools/health/bmi',           icon: '⚖️', name: '비만도(BMI) 계산기',         desc: '체질량지수로 비만도 빠르게 확인' },
      { href: '/tools/health/bmr',           icon: '🔥', name: '기초대사량(BMR) 계산기',     desc: '하루 권장 칼로리·BMR 계산' },
      { href: '/tools/health/weightloss',    icon: '🎯', name: '체중 감량 기간 계산기',     desc: '목표 체중까지 칼로리 적자 계산' },
      { href: '/tools/health/pregnancy',     icon: '🤰', name: '임신 주수 계산기',          desc: '출산 예정일·산전 검사 일정' },
      { href: '/tools/health/pet',           icon: '🐾', name: '반려동물 나이·칼로리 계산기', desc: '강아지·고양이 나이·하루 사료량' },
      { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 소멸 계산기',     desc: '음주량·체중 기반 BAC·운전 가능 시각' },
      { href: '/tools/health/supplement',    icon: '💊', name: '영양제 성분 체크 계산기',   desc: '영양제 성분 중복·상한량 초과 체크' },
      { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 노출 가이드 계산기', desc: 'UV 지수·피부 타입·SPF 기준 일광화상 위험 시간과 자외선 차단 가이드' },
    ],
  },
  {
    id: 'cooking', icon: '🍳', name: '요리·식품', color: '#FFB83E',
    tools: [
      { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',      desc: '인분 수에 맞게 재료 비율 자동 계산' },
      { href: '/tools/cooking/thawing', icon: '🧊', name: '냉동·해동 시간 계산기',    desc: '식품 두께·무게 기반 해동 시간 예측·식품 안전 가이드' },
      { href: '/tools/cooking/unit',    icon: '🥄', name: '요리 단위 변환기',         desc: '재료별 컵·큰술·g 정확 환산' },
      { href: '/tools/cooking/sourdough', icon: '🍞', name: '사워도우 스타터 계산기', desc: '르방 안정화 진단·피크 시간 예측·급이 스케줄러' },
      { href: '/tools/cooking/frying',    icon: '🍳', name: '튀김 시간·온도 계산기',   desc: '재료별 최적 기름 온도·튀김 시간·에어프라이어 변환 가이드' },
      { href: '/tools/cooking/nuts',      icon: '🌰', name: '견과류 섭취량 계산기',     desc: '견과류별 하루 권장량·칼로리·영양소' },
      { href: '/tools/cooking/serving',   icon: '🍽️', name: '1인분 분량 계산기',         desc: '파스타·고기·쌀 등 재료별 인분 분량·장보기 가이드' },
      { href: '/tools/cooking/food-storage', icon: '🧊', name: '식재료 보관 기간 계산기', desc: '냉장·냉동 식재료 보관 기간 추적·소비 기한 알림' },
      { href: '/tools/cooking/substitute', icon: '🔄', name: '식재료 대체 비율 계산기', desc: '버터·설탕·계란·생크림 등 재료 대체 비율 및 주의사항' },
      { href: '/tools/cooking/baker-percent', icon: '🥖', name: '베이커 퍼센트 계산기', desc: '제빵 배합비·수분율·르방 자동 계산, 빵 종류별 프리셋 8종' },
    ],
  },
  {
    id: 'life', icon: '🎲', name: '생활·재미', color: '#FF8C3E',
    tools: [
      { href: '/tools/life/lotto',         icon: '🎰', name: '로또 번호 생성기',    desc: '행운의 번호 자동 추첨',                 badge: 'hot' },
      { href: '/tools/life/random',        icon: '🎲', name: '랜덤 추첨기',         desc: '숫자·항목 무작위 뽑기' },
      { href: '/tools/life/ladder',        icon: '🪜', name: '사다리타기',          desc: '공정한 무작위 사다리' },
      { href: '/tools/life/dutch',         icon: '🍻', name: '더치페이(N빵) 계산기', desc: '술값 따로, 단위 올림 옵션' },
      { href: '/tools/life/zodiac',        icon: '🐯', name: '띠·별자리 계산기',    desc: '생년월일로 띠·별자리 확인' },
      { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',     desc: '25분 집중·5분 휴식 사이클' },
      { href: '/tools/life/alcohol',       icon: '🍺', name: '알코올 도수 계산기',  desc: '혼합 음료 도수·표준 음주량 계산' },
      { href: '/tools/life/golden-ratio',  icon: '🌀', name: '황금 비율 계산기',    desc: '황금 비율·피보나치 나선 계산 및 시각화' },
      { href: '/tools/life/drake',         icon: '👽', name: '드레이크 방정식 계산기', desc: '우주의 지적 문명 수 추정·변수 조정 시뮬레이터' },
      { href: '/tools/life/laundry-dry',   icon: '🧺', name: '빨래 건조 시간 계산기', desc: '온도·습도·소재별 건조 예상 시간 및 단축 팁' },
      { href: '/tools/life/monty-hall',    icon: '🚪', name: '몬티홀 문제 시뮬레이터', desc: '바꾸기 vs 유지하기 — 직접 1,000번 돌려보는 확률 실험' },
      { href: '/tools/life/fart-risk',     icon: '💨', name: '방귀 유발 가능성 계산기', desc: '오늘 먹은 음식으로 가스 유발 가능성 체크' },
      { href: '/tools/life/unit-price',    icon: '🏷️', name: '단가 비교 계산기',        desc: '용량·덤·할인·배송비 반영 가성비 단가 비교' },
    ],
  },
  {
    id: 'sports', icon: '⛳', name: '스포츠', color: '#FFD93E',
    tools: [
      { href: '/tools/sports/fight-weight',    icon: '🥊', name: '격투기 체급 계산기',     desc: '복싱·UFC·MMA 체급별 감량 계획·D-day 일정·위험도' },
      { href: '/tools/sports/baseball-stats',  icon: '⚾', name: '야구 타율·OPS 계산기',   desc: '타율·출루율·장타율·OPS·ERA·WHIP 및 KBO 비교' },
      { href: '/tools/sports/football-points', icon: '⚽', name: '축구 승점·순위 계산기',  desc: '승무패·득실차·목표 승점·라이벌 추격 시나리오' },
      { href: '/tools/sports/pace',            icon: '🏃', name: '러닝 페이스 계산기',     desc: '마라톤 목표 기록별 페이스' },
      { href: '/tools/sports/race-predictor',  icon: '🏅', name: '마라톤 기록 예측 계산기', desc: 'Riegel·VDOT 공식 기록 예측' },
      { href: '/tools/sports/one-rm',          icon: '🏋️', name: '1RM 계산기',             desc: '최대 중량 추정·강도별 훈련 중량' },
      { href: '/tools/sports/interval-training',icon: '🏃‍♂️', name: '인터벌 훈련 계산기',   desc: '400m·800m·야소 800 풀코스 예측·8주 스케줄' },
      { href: '/tools/life/golf-handicap',     icon: '⛳', name: '골프 핸디캡 계산기',     desc: 'WHS 방식 핸디캡 지수·코스 핸디캡·네트 스코어' },
      { href: '/tools/life/golf-cost',         icon: '🏌️', name: '골프 라운딩 비용 계산기', desc: '그린피·카트비·캐디피·식사 합산 1인당 정산' },
      { href: '/tools/life/golf-distance',     icon: '🎯', name: '골프 클럽 비거리 계산기', desc: '클럽별 비거리·Gap 분석·보완 클럽 추천' },
    ],
  },
  {
    id: 'interior', icon: '🛋️', name: '인테리어', color: '#E89757',
    tools: [
      { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피 한 번에 (도배·페인트·에어컨 활용)' },
      { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 소요량 계산기',         desc: '벽지 롤 수·면적·셀프 시공 비용 견적' },
      { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 소요량 계산기',       desc: '벽·천장 면적·칠할 횟수·페인트 종류별 필요량 및 구매 조합' },
      { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈 계산기', desc: '창문 사이즈로 커튼·블라인드·롤스크린 추천 사이즈' },
      { href: '/tools/interior/lighting',      icon: '💡', name: '조명 밝기 계산기',           desc: '공간별 권장 루멘·조명 개수·W↔lm 환산·색온도 가이드' },
      { href: '/tools/interior/ac-capacity',   icon: '❄️', name: '에어컨 평형 계산기',         desc: '면적·향·층수·단열 반영 추천 평형 및 BTU·W 환산' },
      { href: '/tools/interior/flooring',      icon: '🪵', name: '바닥재 소요량 계산기',       desc: '장판·강화마루·강마루·원목·데코타일 박스 수·비용 계산' },
      { href: '/tools/interior/molding',       icon: '📏', name: '몰딩 길이 계산기',           desc: '천장 몰딩·걸레받이·띠몰딩 길이·개수·비용 계산' },
    ],
  },
  {
    id: 'unit', icon: '📐', name: '단위·변환', color: '#B03EFF',
    tools: [
      { href: '/tools/unit/area',        icon: '🏠', name: '평수 ↔ ㎡ 변환기',       desc: '아파트 면적 단위 변환' },
      { href: '/tools/unit/length',      icon: '📏', name: '길이 변환기',             desc: 'cm·m·inch·ft·mile 변환' },
      { href: '/tools/unit/weight',      icon: '⚖️', name: '무게 변환기',             desc: 'kg·g·lb·oz·근·돈 변환' },
      { href: '/tools/unit/size',        icon: '🛍️', name: '해외 직구 사이즈 변환기', desc: 'US·EU → 한국 사이즈' },
      { href: '/tools/unit/temperature', icon: '🌡️', name: '온도 변환기',             desc: '섭씨·화씨·켈빈 즉시 변환' },
      { href: '/tools/unit/time',        icon: '⏱️', name: '시간 단위 변환기',         desc: '초·분·시간·일·주·월·년 + 근무시간 기준 변환' },
      { href: '/tools/unit/battery',     icon: '🔋', name: '배터리 용량 변환기',       desc: 'mAh·Wh·Ah 변환 및 비행기 반입 가능 여부' },
      { href: '/tools/unit/fuel-economy',icon: '⛽', name: '연비 단위 변환기',         desc: 'km/L · L/100km · mpg · 전기차 전비 변환' },
      { href: '/tools/unit/tire-pressure',icon: '🛞', name: '타이어 공기압 변환기',    desc: 'psi · kPa · bar 변환 및 권장 공기압 체크', badge: 'new' },
    ],
  },
  {
    id: 'date', icon: '📅', name: '날짜·시간', color: '#FF3E8C',
    tools: [
      { href: '/tools/date/age',         icon: '🎂', name: '만 나이·생일·인생 통계 계산기', desc: '만 나이부터 D-day, 1만일 기념, 인생 시간 통계, 띠·별자리·생일 카운트다운까지', badge: 'hot' },
      { href: '/tools/date/dday',        icon: '📅', name: 'D-day 계산기·일정 관리', desc: '여러 D-day 저장, 진행률·평일·영업일·페이스 계산, 반복 D-day, 두 날짜 사이까지' },
      { href: '/tools/date/military',    icon: '🎖️', name: '군 전역일·복무율 계산기', desc: '전역일·복무율 계산' },
      { href: '/tools/date/history-era', icon: '📜', name: '역사 연호·연대 변환기',   desc: '단기·조선 왕 연호·간지 ↔ 서기 변환' },
      { href: '/tools/date/lunar',       icon: '🌙', name: '양음력 변환기',           desc: '음력 ↔ 양력 날짜 변환 · 간지 확인' },
      { href: '/tools/date/jet-lag',     icon: '✈️', name: '시차 적응 계산기',          desc: '여행 전·중·후 시차 적응 일정·수면 타이밍 계산' },
      { href: '/tools/date/life-time',   icon: '⏳', name: '생애 시간 계산기',         desc: '기대수명 기준 살아온 시간·앞으로의 시간·행동 가치 환산', badge: 'new' },
    ],
  },
  {
    id: 'music', icon: '🎵', name: '음악', color: '#C83EFF',
    tools: [
      { href: '/tools/music/bpm',       icon: '🎛️', name: 'BPM 딜레이 타임 계산기', desc: '딜레이·리버브 ms 값 즉시 계산' },
      { href: '/tools/music/frequency', icon: '🎵', name: '주파수 음정 변환기',    desc: 'Hz ↔ 음정 변환·MIDI 번호·파장 계산' },
      { href: '/tools/music/capo',      icon: '🎸', name: '기타 카포·전조 계산기', desc: '카포 위치별 코드 변환·쉬운 코드 추천' },
      { href: '/tools/music/tap-tempo', icon: '👆', name: '탭 템포 계산기',         desc: '탭으로 BPM 측정·메트로놈·박자감 테스트' },
      { href: '/tools/music/chord',     icon: '🎹', name: '코드 구성음 계산기',     desc: 'Cmaj7·Dm7 등 코드 구성음·역방향 검색·다이아토닉 코드표', badge: 'new' },
    ],
  },
  {
    id: 'edu', icon: '🔬', name: '교육·학습', color: '#3EFFD0',
    tools: [
      { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 시각화', desc: '8개 행성에서 내 몸무게·나이·하루 길이가 어떻게 다른지 시각화' },
      { href: '/tools/edu/cosmic-calendar',   icon: '🌌', name: '코스믹 캘린더',     desc: '138억 년 우주 역사를 1년 달력으로 압축한 인터랙티브 타임라인' },
      { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 시뮬레이터', desc: '직렬·병렬 회로 전압·전류·저항·전력 시각화 + 단계별 풀이·시험 빈출 7문제' },
      { href: '/tools/edu/sound-speed',        icon: '🔊', name: '음속 시뮬레이터',     desc: '천둥·번개 거리, 소리 도달 시간, 빛 vs 소리 비교, 반향·에코·RT60' },
      { href: '/tools/edu/review-interval',    icon: '🧠', name: '복습 간격 계산기',     desc: '에빙하우스 망각곡선·SM-2 알고리즘으로 다음 복습일 계산, 학습 항목 관리' },
      { href: '/tools/edu/cognitive-test',     icon: '🧠', name: '인지 능력 테스트',     desc: '반응속도·스트룹 효과·이중 과제로 집중력과 인지 처리 속도를 측정하는 게임' },
      { href: '/tools/edu/fermi-estimate',     icon: '🧮', name: '페르미 추정 계산기',   desc: '문제를 변수로 쪼개고 시나리오로 비교해 대략적인 답을 추정하는 사고력 도구', badge: 'new' },
    ],
  },
  {
    id: 'dev', icon: '🖥️', name: '개발자·텍스트', color: '#C8FF3E',
    tools: [
      { href: '/tools/dev/charcount', icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
      { href: '/tools/dev/base64',    icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 즉시 변환' },
      { href: '/tools/dev/json',      icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·유효성 검사' },
      { href: '/tools/dev/lorem',     icon: '📝', name: '더미 텍스트·UI 콘텐츠 생성기', desc: '문단·버튼·카드·리뷰·JSON 더미 데이터까지 UI 목업에 바로 쓸 수 있는 종합 더미 콘텐츠 생성기' },
      { href: '/tools/dev/color',     icon: '🎨', name: '색상 코드 변환·디자인 도구', desc: 'HEX·RGB·HSL·OKLCH·알파 변환부터 WCAG 대비비, 팔레트, Tailwind 매칭, CSS 변수, 그라디언트, 이미지 추출' },
      { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 값 변환기',    desc: 'px·rem·em·clamp()·aspect-ratio CSS 단위 변환 및 생성' },
      { href: '/tools/dev/number-base',   icon: '🔢', name: '진법 변환기',       desc: '2진·8진·10진·16진 변환, 비트 시각화, 2의 보수, ASCII, 비트 연산' },
    ],
  },
]

// 전체 툴 flat 배열 (검색·홈 인기 툴용)
export const allTools: Tool[] = categories.flatMap(c => c.tools)

// 총 툴 수
export const totalTools = allTools.length
