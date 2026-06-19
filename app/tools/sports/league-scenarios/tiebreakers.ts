/* 대회별 순위 결정(타이브레이커) 규정 — 2026년 6월 확인 기준. ⚠️ 시즌·대회별 변동 가능, 공식 규정 확인 권장.
   ★ 핵심: 승자승(맞대결)이 '전체 골득실'보다 앞이냐 뒤냐가 대회마다 정반대 → 결과가 갈림.
     - 승자승 우선: 2026 월드컵·아시안컵·챔스(구 조별)·라리가
     - 전체 골득실/다득점 우선: 2022 월드컵·K리그·EPL·챔스(신 리그페이즈)
   출처: FIFA·UEFA·AFC 공식 규정, 한국프로축구연맹, Premier League/La Liga 핸드북, Wikipedia 대회 문서. */

export type CriterionKey =
  | 'points'
  | 'wins'
  | 'goalDifference'
  | 'goalsScored'
  | 'awayGoals'
  | 'headToHeadPoints'
  | 'headToHeadGoalDiff'
  | 'headToHeadGoals'
  | 'fairPlay'
  | 'drawing'
  | 'playoff'

export const CRITERION_LABEL: Record<CriterionKey, string> = {
  points: '승점',
  wins: '다승',
  goalDifference: '골득실차',
  goalsScored: '다득점',
  awayGoals: '원정 다득점',
  headToHeadPoints: '승자승(맞대결 승점)',
  headToHeadGoalDiff: '승자승 골득실',
  headToHeadGoals: '승자승 다득점',
  fairPlay: '페어플레이 점수',
  drawing: '추첨',
  playoff: '플레이오프 단판',
}

/** 승무패(W/D/L)만으로 확정 가능한 기준(스코어 불필요). 그 외(골득실·다득점·승자승골득실 등)는
 *  골/스코어 의존 → 잔여 경기 있는 동률은 '갈림'으로 분류(Option A). 승자승 승점은 맞대결 결과 입력 시 확정. */
export const WDL_DECIDABLE: ReadonlySet<CriterionKey> = new Set<CriterionKey>([
  'points',
  'wins',
  'headToHeadPoints',
])

export interface Competition {
  id: string
  name: string
  order: CriterionKey[]
  teams: number // 기본 팀 수
  advance: number // 기본 진출 자리(상위 N)
  /** 승자승이 전체 골득실보다 앞 → 맞대결(이미 치른) 결과 입력을 권장 */
  needsHeadToHead: boolean
  note: string
}

export const COMPETITIONS: Competition[] = [
  {
    id: 'worldcup2026',
    name: '월드컵 2026 (승자승 우선)',
    order: ['points', 'headToHeadPoints', 'headToHeadGoalDiff', 'headToHeadGoals', 'goalDifference', 'goalsScored', 'fairPlay'],
    teams: 4, advance: 2, needsHeadToHead: true,
    note: '2026 대회부터 승자승(맞대결)을 전체 골득실보다 먼저 봅니다(2022년과 반대). 최종 동률 시 페어플레이→FIFA 랭킹.',
  },
  {
    id: 'worldcup2022',
    name: '월드컵 2022 방식 (골득실 우선)',
    order: ['points', 'goalDifference', 'goalsScored', 'headToHeadPoints', 'headToHeadGoalDiff', 'headToHeadGoals', 'fairPlay', 'drawing'],
    teams: 4, advance: 2, needsHeadToHead: false,
    note: '2022 카타르까지의 방식: 전체 골득실 → 다득점 → 승자승 순. 과거 대회 분석용.',
  },
  {
    id: 'asiancup',
    name: '아시안컵 (승자승 우선)',
    order: ['points', 'headToHeadPoints', 'headToHeadGoalDiff', 'headToHeadGoals', 'goalDifference', 'goalsScored', 'fairPlay', 'drawing'],
    teams: 4, advance: 2, needsHeadToHead: true,
    note: 'AFC는 승자승(맞대결)을 전체 골득실보다 먼저 적용합니다. 3위 일부 진출 등 본선 규정은 별도.',
  },
  {
    id: 'ucl_group',
    name: '챔피언스리그 조별(구 포맷·승자승 우선)',
    order: ['points', 'headToHeadPoints', 'headToHeadGoalDiff', 'headToHeadGoals', 'goalDifference', 'goalsScored', 'awayGoals', 'wins', 'fairPlay'],
    teams: 4, advance: 2, needsHeadToHead: true,
    note: 'UEFA 구 조별리그(~2023/24): 승자승(맞대결 승점→골득실→다득점)을 전체 골득실보다 먼저 봅니다.',
  },
  {
    id: 'ucl_league',
    name: '챔피언스리그 리그페이즈(신 포맷·골득실 우선)',
    order: ['points', 'goalDifference', 'goalsScored', 'awayGoals', 'wins', 'fairPlay'],
    teams: 36, advance: 8, needsHeadToHead: false,
    note: '2024/25~ 36팀 단일리그: 승자승 없이 전체 골득실 우선. 상위 8위 16강 직행, 9~24위 플레이오프(진출 자리는 조정 가능).',
  },
  {
    id: 'kleague',
    name: 'K리그1 (다득점 우선)',
    order: ['points', 'goalsScored', 'goalDifference', 'wins', 'headToHeadPoints'],
    teams: 12, advance: 6, needsHeadToHead: false,
    note: 'K리그는 승점 다음에 다득점(득점이 많은 팀)을 먼저 봅니다(2016~, 공격 축구 유도). 이어서 골득실 → 다승 → 승자승.',
  },
  {
    id: 'epl',
    name: '프리미어리그·일반 리그 (골득실 우선)',
    order: ['points', 'goalDifference', 'goalsScored', 'headToHeadPoints', 'playoff'],
    teams: 20, advance: 4, needsHeadToHead: false,
    note: '승점 → 골득실 → 다득점 순. 모두 같으면 승자승, 그래도 같고 우승·강등·진출이 걸리면 플레이오프(역사상 거의 없음).',
  },
  {
    id: 'laliga',
    name: '라리가 (승자승 우선)',
    order: ['points', 'headToHeadPoints', 'headToHeadGoalDiff', 'goalDifference', 'goalsScored', 'fairPlay', 'playoff'],
    teams: 20, advance: 4, needsHeadToHead: true,
    note: '라리가는 승자승(맞대결 승점→골득실)을 전체 골득실보다 먼저 봅니다(EPL과 반대).',
  },
  {
    id: 'custom',
    name: '직접 설정',
    order: ['points', 'goalDifference', 'goalsScored', 'headToHeadPoints'],
    teams: 4, advance: 2, needsHeadToHead: false,
    note: '팀 수·진출 자리·타이브레이커 순서를 직접 정합니다.',
  },
]

export function getCompetition(id: string): Competition {
  return COMPETITIONS.find((c) => c.id === id) ?? COMPETITIONS[0]
}
