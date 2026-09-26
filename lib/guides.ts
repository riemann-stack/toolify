/* lib/guides.ts — '계산 해설'(독립 롱폼 글) 레지스트리.
   스펙 §10.20: 게시된 글이 GUIDES_MIN_TO_SHOW편 이상일 때만 홈·헤더에 '계산 해설'을 렌더한다(빈 지면 = 얇은 사이트 신호).
   아직 게시된 글이 없으므로 빈 배열이다 — 글을 추가할 때 실제로 /guides/<slug> 페이지가 존재해야 하고,
   날짜는 그 페이지의 git 첫 커밋일, 작성자는 필명 '리만'(1인 운영)만 쓴다. 수치는 계산기와 같은 lib 단일 소스에서. */

export interface GuideArticle {
  slug: string          // '/guides/<slug>'
  title: string
  summary: string
  catId: string         // 분야 점 색 (lib/tools categories id)
  published: string     // 'YYYY-MM-DD' (git 첫 커밋)
  readMinutes: number
  /** 카드 핵심 수치 — 반드시 lib 단일 소스에서 계산한 값 */
  figure?: { value: string; caption: string }
}

export const GUIDES: readonly GuideArticle[] = []

/** 홈 '계산 해설' 섹션 노출 최소 편수 */
export const GUIDES_MIN_TO_SHOW = 3

export const showGuides = (): boolean => GUIDES.length >= GUIDES_MIN_TO_SHOW
