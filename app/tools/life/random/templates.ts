/* 빠른 시작 템플릿 — 카테고리별 추첨 시작점 */

export type RandomTemplate = {
  id: string
  icon: string
  name: string
  items: string[]
}

export type TemplateCategory = {
  id: string
  name: string
  emoji: string
  templates: string[]   // template ids
}

export const TEMPLATES: RandomTemplate[] = [
  // 음식
  { id: 'lunch',   icon: '🍱', name: '오늘 점심 메뉴',
    items: ['김치찌개', '된장찌개', '비빔밥', '제육덮밥', '돈가스', '냉면', '파스타', '초밥'] },
  { id: 'dinner',  icon: '🍽️', name: '오늘 저녁 메뉴',
    items: ['삼겹살', '치킨', '피자', '족발', '곱창', '회', '한식', '양식', '중식'] },
  { id: 'cafe',    icon: '☕', name: '카페 음료',
    items: ['아메리카노', '카페라떼', '카푸치노', '바닐라라떼', '카라멜 마끼아토', '아인슈페너', '플랫화이트'] },

  // 일·당번
  { id: 'cleaning', icon: '🧹', name: '청소 당번',
    items: ['거실', '주방', '화장실', '침실', '베란다', '쓰레기 분리수거'] },
  { id: 'duty',    icon: '📅', name: '요일 당번',
    items: ['월요일', '화요일', '수요일', '목요일', '금요일'] },

  // 게임·놀이
  { id: 'penalty', icon: '😅', name: '벌칙 뽑기',
    items: ['1분 댄스', '재미있는 표정', '노래 한 소절', '이상한 자세 1분', '얼음물 마시기', '주변 사람 칭찬 5개'] },
  { id: 'game',    icon: '🎮', name: '게임 선택',
    items: ['마리오 카트', 'FIFA', '스플래툰', '스매시 브라더스', '오버쿡드', '보드게임'] },
  { id: 'movie',   icon: '🎬', name: '영화 장르',
    items: ['액션', '코미디', '로맨스', '스릴러', 'SF', '판타지', '다큐멘터리', '애니메이션'] },

  // 여가
  { id: 'travel',  icon: '✈️', name: '여행지',
    items: ['제주도', '부산', '강릉', '경주', '여수', '전주', '서울', '속초'] },
  { id: 'workout', icon: '💪', name: '운동 루틴',
    items: ['상체', '하체', '코어', '유산소', '전신', '요가', '필라테스', '쉬는 날'] },
  { id: 'challenge', icon: '🎯', name: '랜덤 챌린지',
    items: ['1만보 걷기', '찬물 샤워', '독서 30분', '명상 10분', '스마트폰 1시간 금단', '낯선 카페 가기'] },
]

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { id: 'food',     name: '음식·메뉴', emoji: '🍽️', templates: ['lunch', 'dinner', 'cafe'] },
  { id: 'work',     name: '일·당번',   emoji: '💼', templates: ['cleaning', 'duty'] },
  { id: 'fun',      name: '놀이·게임', emoji: '🎮', templates: ['penalty', 'game', 'movie'] },
  { id: 'leisure',  name: '여가·취미', emoji: '🌴', templates: ['travel', 'workout', 'challenge'] },
]

export function getTemplate(id: string): RandomTemplate | null {
  return TEMPLATES.find(t => t.id === id) ?? null
}
