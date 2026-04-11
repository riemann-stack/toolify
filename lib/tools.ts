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
    id: 'health', icon: '🏃', name: '건강·피트니스', color: '#3EC8FF',
    tools: [
      { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',               desc: '체질량지수 비만도 확인' },
      { href: '/tools/health/bmr',        icon: '🔥', name: '기초대사량 계산기',         desc: '하루 권장 칼로리 계산' },
      { href: '/tools/health/pace',       icon: '🏃', name: '러닝 페이스 계산기',       desc: '마라톤 목표 기록별 페이스' },
      { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 기간 계산기', desc: '칼로리 적자로 달성일 예측' },
      { href: '/tools/health/pregnancy',  icon: '🤰', name: '임신 주수 계산기',         desc: '출산 예정일·산전 검사 일정', badge: 'new' },
    ],
  },
  {
    id: 'life', icon: '🎲', name: '생활·재미', color: '#FF8C3E',
    tools: [
      { href: '/tools/life/lotto',    icon: '🎰', name: '로또 번호 생성기',       desc: '행운의 번호 자동 추첨',         badge: 'hot' },
      { href: '/tools/life/random',   icon: '🎲', name: '랜덤 추첨기',            desc: '숫자·항목 무작위 뽑기' },
      { href: '/tools/life/ladder',   icon: '🪜', name: '사다리타기',             desc: '공정한 무작위 사다리' },
      { href: '/tools/life/dutch',    icon: '🍻', name: '더치페이(N빵) 계산기',   desc: '술값 따로, 단위 올림 옵션' },
      { href: '/tools/life/zodiac',   icon: '🐯', name: '띠·별자리 계산기',      desc: '생년월일로 띠·별자리 확인', badge: 'new' },
      { href: '/tools/life/pomodoro', icon: '🍅', name: '뽀모도로 타이머',        desc: '25분 집중·5분 휴식 사이클' },
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
      { href: '/tools/date/age',      icon: '🎂', name: '만 나이 계산기',          desc: '법 개정 기준 만 나이',   badge: 'hot' },
      { href: '/tools/date/dday',     icon: '📅', name: 'D-day 계산기',            desc: '목표까지 남은 일수' },
      { href: '/tools/date/diff',     icon: '📆', name: '날짜 차이 계산기',        desc: '두 날짜 사이 기간 계산' },
      { href: '/tools/date/military', icon: '🎖️', name: '군 전역일·복무율 계산기', desc: '전역일·복무율 계산', badge: 'new' },
    ],
  },
  {
    id: 'dev', icon: '🖥️', name: '개발자·텍스트', color: '#C8FF3E',
    tools: [
      { href: '/tools/dev/charcount', icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
      { href: '/tools/dev/base64',    icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 즉시 변환' },
      { href: '/tools/dev/json',      icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·유효성 검사' },
      { href: '/tools/dev/lorem',     icon: '📝', name: '더미 텍스트 생성기',   desc: 'Lorem Ipsum·한글 더미 생성' },
      { href: '/tools/dev/color',     icon: '🎨', name: '색상 코드 변환기',     desc: 'HEX·RGB·HSL 즉시 변환', badge: 'new' },
    ],
  },
]

// 전체 툴 flat 배열 (검색·홈 인기 툴용)
export const allTools: Tool[] = categories.flatMap(c => c.tools)

// 총 툴 수
export const totalTools = allTools.length