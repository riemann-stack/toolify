/* ──────────────────────────────────────────────────────
   life/ladder/ladderTemplates.ts
   사다리타기 빠른 시작 템플릿 6종
   ────────────────────────────────────────────────────── */

export type LadderTemplate = {
  id: string
  name: string
  icon: string
  desc: string
  participants: string[]
  results: string[]
  /** 참가자 = 결과 (선물 교환처럼) */
  mirror?: boolean
}

export const LADDER_TEMPLATES: LadderTemplate[] = [
  {
    id: 'lunch',
    name: '점심 메뉴',
    icon: '🍱',
    desc: '못 정할 때 무작위 선택',
    participants: ['김민수', '이지은', '박서준', '최수아'],
    results: ['김치찌개', '비빔밥', '돈가스', '국밥'],
  },
  {
    id: 'cleaning',
    name: '청소 당번',
    icon: '🧹',
    desc: '공정한 역할 분담',
    participants: ['김민수', '이지은', '박서준', '최수아'],
    results: ['거실', '주방', '화장실', '쓰레기 분리수거'],
  },
  {
    id: 'penalty',
    name: '벌칙 뽑기',
    icon: '😅',
    desc: '게임·내기 벌칙 정하기',
    participants: ['1번', '2번', '3번', '4번', '5번', '6번'],
    results: ['커피 사기', '꽝', '꽝', '꽝', '재밌는 표정', '꽝'],
  },
  {
    id: 'gift',
    name: '선물 교환 (시크릿 산타)',
    icon: '🎁',
    desc: '익명 모드와 함께 — 누가 누구에게 줄지',
    participants: ['김민수', '이지은', '박서준', '최수아'],
    results: ['김민수', '이지은', '박서준', '최수아'],
    mirror: true,
  },
  {
    id: 'presentation',
    name: '발표 순서',
    icon: '🎤',
    desc: '학교·회사 발표 순서',
    participants: ['김민수', '이지은', '박서준', '최수아'],
    results: ['1번', '2번', '3번', '4번'],
  },
  {
    id: 'pay',
    name: '회식 분담',
    icon: '🍻',
    desc: '비용·역할 무작위 배분',
    participants: ['김민수', '이지은', '박서준', '최수아'],
    results: ['많이 결제', '보통', '조금', '꽝 (공짜)'],
  },
]

export function getTemplate(id: string): LadderTemplate | null {
  return LADDER_TEMPLATES.find(t => t.id === id) ?? null
}
