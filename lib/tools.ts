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
    ],
  },
  {
    id: 'health', icon: '🏃', name: '건강·안전', color: '#3EC8FF',
    tools: [
      { href: '/tools/health/bmi',           icon: '⚖️', name: 'BMI 계산기',                desc: '체질량지수 비만도 확인' },
      { href: '/tools/health/bmr',           icon: '🔥', name: '기초대사량 계산기',          desc: '하루 권장 칼로리 계산' },
      { href: '/tools/health/pace',          icon: '🏃', name: '러닝 페이스 계산기',        desc: '마라톤 목표 기록별 페이스' },
      { href: '/tools/health/weightloss',    icon: '🎯', name: '목표 체중 감량 기간 계산기',  desc: '칼로리 적자로 달성일 예측' },
      { href: '/tools/health/pregnancy',     icon: '🤰', name: '임신 주수 계산기',          desc: '출산 예정일·산전 검사 일정' },
      { href: '/tools/health/pet',           icon: '🐾', name: '반려동물 나이·칼로리 계산기', desc: '강아지·고양이 사람 나이 환산·하루 사료량 계산' },
      { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 소멸 계산기',     desc: '음주량·체중 기반 BAC 추정·운전 가능 시각 계산', badge: 'new' },
    ],
  },
  {
    id: 'cooking', icon: '🍳', name: '요리·식품', color: '#FFB83E',
    tools: [
      { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',      desc: '인분 수에 맞게 재료 비율 자동 계산' },
      { href: '/tools/cooking/thawing', icon: '🧊', name: '냉동·해동 시간 계산기',    desc: '식품 두께·무게 기반 해동 시간 예측·식품 안전 가이드', badge: 'new' },
      { href: '/tools/cooking/unit',    icon: '🥄', name: '요리 단위 변환기',         desc: '컵·큰술·oz·근 등 요리 단위 즉시 변환' },
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
      { href: '/tools/life/golf-handicap', icon: '⛳', name: '골프 핸디캡 계산기',  desc: 'WHS 방식 핸디캡 지수·코스 핸디캡·네트 스코어 계산' },
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
    ],
  },
  {
    id: 'date', icon: '📅', name: '날짜·시간', color: '#FF3E8C',
    tools: [
      { href: '/tools/date/age',         icon: '🎂', name: '만 나이 계산기',         desc: '법 개정 기준 만 나이',         badge: 'hot' },
      { href: '/tools/date/dday',        icon: '📅', name: 'D-day 계산기',           desc: '목표까지 남은 일수' },
      { href: '/tools/date/diff',        icon: '📆', name: '날짜 차이 계산기',       desc: '두 날짜 사이 기간 계산' },
      { href: '/tools/date/military',    icon: '🎖️', name: '군 전역일·복무율 계산기', desc: '전역일·복무율 계산' },
      { href: '/tools/date/history-era', icon: '📜', name: '역사 연호·연대 변환기',   desc: '단기·조선 왕 연호·간지 ↔ 서기 변환' },
    ],
  },
  {
    id: 'music', icon: '🎵', name: '음악', color: '#C83EFF',
    tools: [
      { href: '/tools/music/bpm',       icon: '🎛️', name: 'BPM 딜레이 타임 계산기', desc: '딜레이·리버브 ms 값 즉시 계산' },
      { href: '/tools/music/frequency', icon: '🎵', name: '주파수 음정 변환기',    desc: 'Hz ↔ 음정 변환·MIDI 번호·파장 계산' },
      { href: '/tools/music/capo',      icon: '🎸', name: '기타 카포·전조 계산기', desc: '카포 위치별 코드 변환·쉬운 코드 추천', badge: 'new' },
    ],
  },
  {
    id: 'dev', icon: '🖥️', name: '개발자·텍스트', color: '#C8FF3E',
    tools: [
      { href: '/tools/dev/charcount', icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
      { href: '/tools/dev/base64',    icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 즉시 변환' },
      { href: '/tools/dev/json',      icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·유효성 검사' },
      { href: '/tools/dev/lorem',     icon: '📝', name: '더미 텍스트 생성기',   desc: 'Lorem Ipsum·한글 더미 생성' },
      { href: '/tools/dev/color',     icon: '🎨', name: '색상 코드 변환기',     desc: 'HEX·RGB·HSL 즉시 변환' },
    ],
  },
]

// 전체 툴 flat 배열 (검색·홈 인기 툴용)
export const allTools: Tool[] = categories.flatMap(c => c.tools)

// 총 툴 수
export const totalTools = allTools.length
