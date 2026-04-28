'use client'

import { useMemo, useState } from 'react'
import styles from './lorem.module.css'

/* ───────── 타입 ───────── */
type Tab = 'paragraph' | 'ui' | 'json' | 'card' | 'ux' | 'length'
type Tone = 'default' | 'friendly' | 'professional' | 'commerce' | 'saas' | 'finance' | 'health' | 'education' | 'game'
type Lang = 'ko' | 'en'
type LengthKey = 'veryShort' | 'short' | 'medium' | 'long' | 'veryLong'
type UIElement =
  | 'titles' | 'subtitles' | 'paragraphs' | 'buttons'
  | 'cardTitles' | 'cardDescriptions' | 'productNames' | 'productDescriptions'
  | 'reviews' | 'comments' | 'names' | 'nicknames'
  | 'notifications' | 'errors' | 'emptyStates' | 'onboarding'
  | 'pricing' | 'faqQuestions' | 'faqAnswers'
type DataType =
  | 'userProfile' | 'product' | 'order' | 'review' | 'article'
  | 'transaction' | 'comment' | 'event' | 'address' | 'task'
type FormatType = 'json' | 'jsonl' | 'csv' | 'yaml' | 'markdown' | 'html' | 'jsx' | 'ts'
type Scenario = 'login' | 'signup' | 'payment' | 'delete' | 'empty'

/* ───────── 톤 옵션 ───────── */
const TONE_OPTIONS: { key: Tone; label: string }[] = [
  { key: 'default',      label: '기본' },
  { key: 'friendly',     label: '친근체' },
  { key: 'professional', label: '전문가' },
  { key: 'commerce',     label: '커머스' },
  { key: 'saas',         label: 'SaaS' },
  { key: 'finance',      label: '금융' },
  { key: 'health',       label: '헬스' },
  { key: 'education',    label: '교육' },
  { key: 'game',         label: '게임' },
]

/* ───────── 길이 프리셋 ───────── */
const LENGTH_PRESETS: { key: LengthKey; label: string; sentences: number; targetChars: number }[] = [
  { key: 'veryShort', label: '아주 짧게', sentences: 1, targetChars: 30 },
  { key: 'short',     label: '짧게',      sentences: 2, targetChars: 80 },
  { key: 'medium',    label: '보통',      sentences: 3, targetChars: 150 },
  { key: 'long',      label: '길게',      sentences: 5, targetChars: 280 },
  { key: 'veryLong',  label: '매우 길게', sentences: 8, targetChars: 480 },
]

/* ───────── 한글 더미 풀 ───────── */
const TITLE_POOLS: Record<Tone, string[]> = {
  default:      ['시작하기 좋은 하루', '새로운 가능성을 만나다', '오늘의 기록', '함께하는 시간', '깊이 있는 시선'],
  friendly:     ['오늘도 반가워요!', '함께라서 즐거운 시간', '편하게 시작해보세요', '이렇게 하면 정말 쉬워요', '잠깐, 이거 보고 가실래요?'],
  professional: ['전략적 의사결정 프레임워크', '비즈니스 성과 극대화 방안', '데이터 기반 인사이트', '핵심 성장 동력 분석', '운영 효율성 개선 전략'],
  commerce:     ['오늘의 베스트 셀러', '회원님께만 드리는 특별 혜택', '신상품 단독 출시', '한정 수량 SALE', '오늘만 무료배송'],
  saas:         ['워크플로우를 자동화하세요', '팀 생산성을 한 단계 올리는 법', '실시간 협업의 새로운 기준', '데이터로 일하는 방식의 진화', '한 곳에서 모든 작업을'],
  finance:      ['장기 자산 배분 전략', '안정적 수익률을 위한 포트폴리오', '리스크 관리의 핵심', '복리의 힘 이해하기', '시장 변동성에 대응하는 방법'],
  health:       ['하루 5분 스트레칭의 힘', '건강한 습관 만들기', '내 몸을 이해하는 첫걸음', '꾸준함이 만드는 변화', '잘 자는 사람의 비밀'],
  education:    ['학습 효율을 높이는 5가지 방법', '오늘의 핵심 개념 정리', '문제 해결 능력 키우기', '집중력 향상 가이드', '복습이 중요한 이유'],
  game:         ['전설의 영웅이 되어보세요', '새로운 모험이 시작됩니다', '도전, 그 이상의 짜릿함', '한정 이벤트 참전 알림', '랭커가 되는 가장 빠른 길'],
}

const SUBTITLE_POOLS: Record<Tone, string[]> = {
  default:      ['오늘 하루를 위한 작은 가이드', '당신의 시작을 응원합니다', '함께 만들어가는 경험'],
  friendly:     ['편안하게 둘러보세요 :)', '부담 없이 시작해 보세요', '몰라도 괜찮아요, 차근차근 알려드릴게요'],
  professional: ['핵심 KPI 기반의 종합 분석', '실무 적용을 위한 단계별 가이드', '검증된 방법론 기반의 접근'],
  commerce:     ['오늘만 가능한 할인가로 만나보세요', '회원 전용 혜택을 놓치지 마세요', '베스트 리뷰가 증명하는 만족도'],
  saas:         ['반복 업무는 자동화에 맡기세요', '5분만에 시작, 평생 사용', '팀 단위로 성과를 끌어올리는 도구'],
  finance:      ['전문 애널리스트의 분석을 바탕으로', '장기 투자 관점에서 살펴봅니다', '리스크 대비 수익률 기준으로 평가'],
  health:       ['전문가가 추천하는 일상 루틴', '꾸준히 실천 가능한 작은 변화부터', '몸이 보내는 신호에 귀 기울이기'],
  education:    ['처음 배우는 분도 따라할 수 있는', '한 번에 이해되는 핵심 정리', '실전 문제로 다지는 개념'],
  game:         ['지금 바로 전장에 합류하세요', '한정 보상이 기다립니다', '친구와 함께라면 더 짜릿하게'],
}

const PARAGRAPH_POOLS: Record<Tone, string[]> = {
  default:      [
    '디자인 작업을 할 때 실제 콘텐츠 대신 더미 텍스트를 사용하면 레이아웃에 집중할 수 있습니다.',
    '한국어 더미 텍스트는 글자 폭과 자간을 실제와 비슷하게 반영하므로, UI 검증에 유용합니다.',
    '프로토타입 단계에서는 콘텐츠보다 구조와 흐름을 점검하는 것이 더 중요할 수 있습니다.',
    '반응형 레이아웃을 점검할 때는 다양한 길이의 텍스트로 줄바꿈과 여백을 확인해 보세요.',
    '타이포그래피는 시각 디자인의 핵심으로, 폰트 선택과 줄 높이가 가독성을 좌우합니다.',
  ],
  friendly:     [
    '안녕하세요! 처음 오신 분들도 부담 없이 둘러보실 수 있도록 준비했어요.',
    '복잡해 보일 수 있지만, 차근차근 따라오시면 금방 익숙해지실 거예요.',
    '혹시 궁금한 점이 생기면 언제든 편하게 물어봐 주세요. 친절히 도와드릴게요.',
    '오늘 하루도 수고 많으셨어요. 잠깐 쉬어가는 시간이 되었으면 좋겠어요.',
    '작은 변화가 큰 차이를 만든답니다. 함께 시작해 볼까요?',
  ],
  professional: [
    '본 분석은 지난 12개월 간의 시장 데이터를 기반으로 진행되었으며, 통계적 유의성을 확보한 표본을 활용하였습니다.',
    '전략적 우선순위 설정을 위해서는 핵심 KPI를 먼저 정의한 후, 단계별 실행 계획을 수립하는 것이 효율적입니다.',
    '운영 효율성 개선을 위해서는 프로세스 가시화와 병목 구간 분석이 선행되어야 합니다.',
    '의사결정 과정에서 데이터 기반 인사이트의 활용은 더 이상 선택이 아닌 필수 요소로 자리잡고 있습니다.',
    '구조적 변화를 추진할 때는 조직 문화와 거버넌스 측면을 함께 고려해야 합니다.',
  ],
  commerce:     [
    '오늘만 단독 할인! 회원가 적용 시 추가 5% 즉시 할인 혜택을 누려보세요.',
    '베스트 셀러 1위 상품을 지금 만나보세요. 만족도 98%의 검증된 후기가 함께합니다.',
    '한정 수량으로 진행되는 특가 이벤트입니다. 매진되기 전에 빠르게 담아주세요.',
    '오늘 주문하시면 내일 도착! 무료배송과 무료반품으로 부담 없이 시작하세요.',
    '신상품 출시 기념 첫 구매 고객 대상 사은품 증정 이벤트가 진행 중입니다.',
  ],
  saas:         [
    '반복적인 작업은 자동화에 맡기고, 팀이 정말 중요한 일에 집중할 수 있도록 도와드립니다.',
    '실시간 협업, 통합 대시보드, API 연동까지 한 곳에서 모든 워크플로우를 관리하세요.',
    '5분이면 시작할 수 있고, 별도 설치 없이 브라우저에서 바로 사용할 수 있습니다.',
    '팀 규모에 맞는 유연한 요금제와 엔터프라이즈급 보안을 함께 제공합니다.',
    '데이터 기반 의사결정을 위해 필요한 모든 지표를 자동으로 수집하고 시각화합니다.',
  ],
  finance:      [
    '장기 자산 배분에서는 위험 자산과 안전 자산의 비중을 본인의 투자 성향에 맞게 조정하는 것이 중요합니다.',
    '복리 효과는 시간과 함께 누적되므로, 일찍 시작할수록 작은 금액도 큰 자산이 될 수 있습니다.',
    '시장 변동성에 대응하기 위해서는 정기적인 리밸런싱과 분산 투자 전략이 필요합니다.',
    '본 자료는 정보 제공을 목적으로 하며, 투자 권유나 자문이 아닌 점을 유의해 주시기 바랍니다.',
    '리스크 허용 범위는 자산 규모뿐 아니라 본인의 심리적 감내 수준까지 고려해 결정해야 합니다.',
  ],
  health:       [
    '하루 30분 정도의 가벼운 유산소 운동만으로도 심혈관 건강에 긍정적인 영향을 줄 수 있습니다.',
    '잠들기 1~2시간 전에는 강한 빛을 줄이고, 카페인 섭취를 피하면 수면의 질을 개선할 수 있습니다.',
    '꾸준함이 강도보다 중요합니다. 무리한 계획보다 지속 가능한 작은 습관부터 시작해 보세요.',
    '본 정보는 일반적인 건강 정보이며, 의학적 진단이나 치료를 대체할 수 없습니다.',
    '몸이 보내는 신호에 귀 기울이고, 통증이나 이상 증상이 지속되면 전문가와 상담하세요.',
  ],
  education:    [
    '새로운 개념을 학습할 때는 자신의 언어로 다시 설명해 보는 것이 이해도를 높이는 데 큰 도움이 됩니다.',
    '복습 간격을 점차 늘려가는 분산 학습은 단기간 집중 학습보다 장기 기억에 효과적입니다.',
    '문제를 풀 때 정답보다 풀이 과정을 점검하는 습관이 사고력을 키웁니다.',
    '학습 환경을 정돈하고 알림을 차단하면, 깊이 있는 몰입을 경험할 수 있습니다.',
    '오늘 배운 내용을 자기 전 5분 동안 정리해 보면 기억 정착에 큰 도움이 됩니다.',
  ],
  game:         [
    '전설의 무기를 모아 최강의 캐릭터를 완성하세요. 한정 시간 동안 강화 확률이 두 배로 증가합니다.',
    '새로운 시즌이 시작되었습니다. 랭킹 보상과 한정 스킨이 당신을 기다립니다.',
    '친구와 파티를 결성하면 경험치 30% 추가 획득 버프가 적용됩니다.',
    '주간 던전을 클리어하고 전설 등급의 장비를 손에 넣으세요. 매주 일요일 자정 초기화됩니다.',
    '시즌 패스를 활성화하고 매일 진행되는 도전 과제를 통해 풍성한 보상을 획득하세요.',
  ],
}

const BUTTON_POOLS: Record<Tone, string[]> = {
  default:      ['시작하기', '자세히 보기', '확인', '취소', '저장', '돌아가기', '다음', '완료'],
  friendly:     ['지금 시작해요!', '편하게 둘러보기', '네, 좋아요', '잠시만요', '이걸로 할게요', '아직요', '계속할게요'],
  professional: ['프로젝트 시작', '상세 분석 보기', '승인', '반려', '제출', '재검토', '다음 단계', '최종 확정'],
  commerce:     ['장바구니 담기', '바로 구매', '쿠폰 받기', '리뷰 보기', '관심 상품 추가', '결제하기', '주문 완료', '재구매'],
  saas:         ['무료로 시작하기', '데모 요청', '플랜 비교', '워크스페이스 만들기', '팀 초대', '대시보드 열기', 'API 키 발급', '내보내기'],
  finance:      ['포트폴리오 보기', '입금하기', '출금 신청', '약관 동의', '계약 체결', '거래 내역', '이체', '인증'],
  health:       ['오늘의 운동 시작', '식단 기록', '체중 입력', '루틴 추가', '명상 시작', '진단 받기', '예약하기', '리마인더 설정'],
  education:    ['수업 시작', '복습 시작', '문제 풀기', '오답 노트', '진도 확인', '강의 보기', '제출하기', '북마크'],
  game:         ['전투 시작!', '소환하기', '강화', '뽑기', '입장', '보상 수령', '레이드 참가', '리스폰'],
}

const CARD_TITLE_POOLS: Record<Tone, string[]> = {
  default:      ['오늘의 추천 콘텐츠', '인기 있는 모음', '새로 등장한 항목', '꼭 한 번 봐야 할 것', '에디터의 선택'],
  friendly:     ['지금 다들 보고 있어요', '이거 진짜 좋아요!', '몰래 알려드리는 꿀팁', '오늘의 작은 행복', '편하게 즐기는 시간'],
  professional: ['주요 성과 지표', '월간 리포트 요약', '핵심 인사이트', '벤치마크 분석', '전략 실행 현황'],
  commerce:     ['오늘만 특가', '베스트 리뷰', '신상 입고', '회원 전용 SALE', '단독 기획전'],
  saas:         ['이번 주 활동 요약', '대시보드 인사이트', '팀 활동 리포트', '자동화 추천', 'API 사용량'],
  finance:      ['이달의 자산 변동', '추천 상품', '시장 동향', '포트폴리오 점검', '관심 종목 알림'],
  health:       ['오늘의 컨디션', '추천 루틴', '주간 활동량', '식단 점검', '수면 분석'],
  education:    ['오늘 배운 내용', '추천 강의', '복습 알림', '학습 진도', '오답 다시 보기'],
  game:         ['신규 시즌 오픈', '한정 이벤트', '주간 랭킹', '친구 활동', '오늘의 도전 과제'],
}

const CARD_DESC_POOLS: Record<Tone, string[]> = {
  default:      ['짧은 시간 안에 핵심을 파악할 수 있도록 정리했습니다.', '오늘 하루를 풍성하게 만들어 줄 가이드입니다.', '꾸준히 업데이트되는 인기 콘텐츠를 만나보세요.'],
  friendly:     ['커피 한 잔 하면서 편하게 보세요!', '읽다 보면 시간 가는 줄 모르실 거예요 :)', '모르면 손해, 알면 든든한 정보들이에요.'],
  professional: ['데이터 기반의 객관적 분석 결과를 정리했습니다.', '실무 적용을 위한 단계별 가이드를 제공합니다.', '핵심 지표 변화와 인사이트를 한눈에 확인하세요.'],
  commerce:     ['지금 가장 인기 있는 아이템을 모았습니다.', '오늘만 적용되는 특별 할인가로 만나보세요.', '리뷰 4.8점 이상의 검증된 베스트 상품들입니다.'],
  saas:         ['팀 활동을 한눈에 확인할 수 있는 요약 리포트입니다.', '워크플로우 자동화로 절약된 시간을 보여드려요.', 'API 사용량과 청구 정보를 함께 확인하세요.'],
  finance:      ['최근 시장 변동을 반영한 종합 분석입니다.', '본인의 투자 성향에 맞는 상품을 추천합니다.', '주요 지표와 추세를 함께 살펴보세요.'],
  health:       ['오늘 입력한 데이터를 기반으로 분석한 결과입니다.', '꾸준한 실천을 위한 작은 미션을 추천드려요.', '주간 활동량과 수면, 식단을 종합한 리포트입니다.'],
  education:    ['오늘 학습한 핵심 개념을 다시 한 번 정리합니다.', '추천 학습 자료와 함께 복습해 보세요.', '진도와 정답률을 시각화해 보여드립니다.'],
  game:         ['시즌 한정 보상과 새로운 콘텐츠가 추가되었습니다.', '친구와 함께하면 더 큰 보상이 기다리고 있어요.', '이번 주 주요 업데이트를 한눈에 확인하세요.'],
}

const PRODUCT_NAME_POOLS: string[] = [
  '시그니처 라이트 자켓', '클래식 데일리 스니커즈', '오가닉 코튼 티셔츠', '미니멀 가죽 백팩',
  '스마트 무선 이어폰', '프리미엄 머그컵 세트', '내추럴 우드 책상', '어쿠스틱 블루투스 스피커',
  '컴포트 라운지웨어', '에센셜 트래블 키트', '하이엔드 화이트 셔츠', '메탈 프레임 안경',
  '스테인리스 텀블러', '프리미엄 가죽 지갑', '레인지 스마트 시계',
]

const PRODUCT_DESC_POOLS: string[] = [
  '데일리룩에 가볍게 매치하기 좋은 베이직 아이템입니다.',
  '편안한 착용감과 깔끔한 실루엣으로 사계절 활용도가 높습니다.',
  '친환경 소재를 사용해 피부에 자극이 적고 부드럽습니다.',
  '심플한 디자인과 견고한 마감으로 오래 사용할 수 있습니다.',
  '실용성과 디자인을 모두 갖춘 미니멀한 액세서리입니다.',
  '직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다.',
]

const REVIEW_POOLS: string[] = [
  '실물이 사진보다 더 예쁘네요. 만족스러운 구매였습니다.',
  '배송도 빠르고 포장도 꼼꼼해서 좋았어요. 추천합니다!',
  '가격 대비 품질이 정말 좋네요. 재구매 의사 있습니다.',
  '생각했던 것보다 사이즈가 살짝 큰 편이지만, 디자인은 마음에 들어요.',
  '오랫동안 고민하다 구매했는데 정말 잘 산 것 같아요. 매일 사용 중입니다.',
  '색감이 모니터로 본 것과 거의 동일해서 만족스럽습니다.',
  '소재가 부드럽고 가벼워서 부담 없이 입을 수 있어요.',
]

const COMMENT_POOLS: string[] = [
  '정말 유용한 정보 감사합니다!',
  '저도 비슷한 경험이 있어서 공감하며 봤어요.',
  '글이 술술 읽히네요. 잘 봤습니다.',
  '혹시 후속 글도 작성하실 계획 있으신가요?',
  '북마크 해두고 천천히 다시 읽어볼게요.',
  '명쾌한 정리에 감사드립니다. 큰 도움이 되었어요.',
  '저는 다른 의견을 가지고 있는데, 그래도 잘 읽었습니다.',
]

const NAME_POOLS: string[] = [
  '김민수', '이지은', '박서준', '최유진', '정현우',
  '강하늘', '윤소희', '조현준', '한지민', '서민호',
  '오세영', '신예린', '임도윤', '배지원', '권태현',
]

const NICKNAME_POOLS: string[] = [
  'sleepyowl', 'morning_dew', 'pixel_runner', 'cloudwalker', 'midnight_chef',
  'cosmic_lemon', 'silent_river', 'paper_dragon', 'mellow_mint', 'echo_keeper',
  'moonlit_fox', 'urban_sailor', 'velvet_storm', 'tiny_atlas', 'amber_glow',
]

const NOTIFICATION_POOLS: Record<Tone, string[]> = {
  default:      ['새로운 알림이 도착했습니다.', '업데이트가 완료되었습니다.', '저장되었습니다.'],
  friendly:     ['새 메시지가 도착했어요!', '저장 완료, 한숨 돌리셔도 돼요 :)', '오늘도 잘 하고 계세요!'],
  professional: ['리포트 생성이 완료되었습니다.', '승인 요청이 등록되었습니다.', '시스템 점검이 예약되었습니다.'],
  commerce:     ['주문하신 상품이 발송되었습니다.', '관심 상품에 할인이 시작되었어요!', '리뷰 작성 시 적립금이 지급됩니다.'],
  saas:         ['워크플로우가 정상 실행되었습니다.', '팀에 새 멤버가 합류했습니다.', 'API 사용량이 한도의 80%에 도달했습니다.'],
  finance:      ['거래가 정상 처리되었습니다.', '관심 종목이 5% 이상 상승했습니다.', '월간 거래 내역이 발급되었습니다.'],
  health:       ['오늘 운동 목표를 달성했어요!', '수분 섭취 시간입니다.', '주간 리포트가 도착했습니다.'],
  education:    ['오늘의 복습이 도착했어요.', '새 강의가 업데이트 되었습니다.', '학습 목표를 달성했어요!'],
  game:         ['던전 입장 가능 시간입니다!', '아이템 강화에 성공했습니다.', '새 시즌이 시작되었습니다.'],
}

const ERROR_POOLS: Record<Tone, string[]> = {
  default:      ['요청을 처리할 수 없습니다.', '잠시 후 다시 시도해 주세요.', '일시적인 오류가 발생했습니다.'],
  friendly:     ['앗, 뭔가 잘못된 것 같아요. 잠시 후 다시 시도해 주세요!', '죄송해요, 지금은 처리가 어려워요. 곧 정상으로 돌아올게요.', '입력 내용을 한 번만 더 확인해 주실래요?'],
  professional: ['요청 처리 중 시스템 오류가 발생했습니다. 관리자에게 문의해 주십시오.', '인증이 만료되었습니다. 다시 로그인해 주십시오.', '필수 입력값이 누락되었습니다.'],
  commerce:     ['결제가 정상 처리되지 않았습니다. 카드 정보를 확인해 주세요.', '재고가 부족합니다. 다른 옵션을 선택해 주세요.', '쿠폰 적용 조건을 충족하지 않았습니다.'],
  saas:         ['워크플로우 실행에 실패했습니다. 로그를 확인해 주세요.', 'API 사용량 한도를 초과했습니다.', '연동 설정을 다시 확인해 주세요.'],
  finance:      ['거래가 거절되었습니다. 잔고와 한도를 확인해 주세요.', '인증이 일치하지 않습니다.', '본 거래는 보안 정책상 차단되었습니다.'],
  health:       ['데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', '동기화에 실패했습니다.', '센서가 응답하지 않습니다.'],
  education:    ['답안 제출에 실패했어요. 인터넷 연결을 확인해 주세요.', '강의를 불러오지 못했습니다.', '진도 정보를 동기화하지 못했어요.'],
  game:         ['서버 연결이 끊겼습니다. 재접속해 주세요.', '아이템 사용에 실패했습니다.', '인벤토리가 가득 찼습니다.'],
}

const EMPTY_POOLS: Record<Tone, string[]> = {
  default:      ['표시할 항목이 없습니다.', '아직 등록된 데이터가 없어요.', '검색 결과가 없습니다.'],
  friendly:     ['아직 아무것도 없어요. 첫 항목을 추가해 보세요!', '여기는 잠시 비어있네요 :)', '곧 무언가 채워질 거예요!'],
  professional: ['표시 가능한 데이터가 존재하지 않습니다.', '필터 조건에 부합하는 결과가 없습니다.', '아직 등록된 항목이 없습니다.'],
  commerce:     ['장바구니가 비어 있습니다. 마음에 드는 상품을 담아 보세요!', '관심 상품이 아직 없습니다.', '주문 내역이 없습니다.'],
  saas:         ['아직 워크스페이스에 활동이 없어요. 첫 프로젝트를 만들어 보세요.', '연동된 서비스가 없습니다.', '대시보드를 채워줄 데이터가 없어요.'],
  finance:      ['거래 내역이 없습니다.', '관심 종목이 등록되지 않았습니다.', '포트폴리오에 자산을 추가해 보세요.'],
  health:       ['오늘 기록한 데이터가 없어요. 첫 기록을 시작해 보세요!', '수면 데이터가 없습니다.', '운동 기록이 비어있어요.'],
  education:    ['아직 들은 강의가 없어요. 첫 강의를 시작해 보세요!', '오답 노트가 비어있습니다.', '학습 기록이 아직 없어요.'],
  game:         ['인벤토리가 비어있습니다.', '친구 목록이 비어있어요. 함께 모험을 떠나 보세요!', '진행 중인 퀘스트가 없습니다.'],
}

const ONBOARDING_POOLS: Record<Tone, string[]> = {
  default:      ['처음 오신 것을 환영합니다.', '몇 가지 설정을 도와드릴게요.', '곧 모든 준비가 끝납니다.'],
  friendly:     ['처음이신가요? 걱정 마세요, 같이 천천히 가볼게요!', '잠깐만 시간을 내주시면 더 편하게 사용할 수 있어요 :)', '여기까지 정말 잘 오셨어요!'],
  professional: ['초기 설정을 진행하겠습니다.', '계정 정보를 확인 후 다음 단계로 이동합니다.', '설정 완료까지 약 3분 소요됩니다.'],
  commerce:     ['첫 구매 고객님을 위한 5,000원 쿠폰이 도착했어요!', '관심 카테고리를 선택하면 더 정확한 추천을 받아볼 수 있어요.', '주소를 등록하면 빠른 배송이 가능합니다.'],
  saas:         ['첫 워크스페이스를 만들고 팀원을 초대해 보세요.', '템플릿으로 시작하면 더 빠르게 셋업할 수 있어요.', '연동을 통해 기존 데이터를 가져오세요.'],
  finance:      ['투자 성향 분석으로 시작하세요.', '본인 인증 후 자산 등록이 가능합니다.', '포트폴리오 추천까지 단 3단계입니다.'],
  health:       ['목표를 설정하고 작은 한 걸음을 시작해 봐요.', '신체 정보를 입력하면 맞춤 분석을 제공해 드려요.', '주간 알림을 켜두시면 꾸준한 실천에 도움이 됩니다.'],
  education:    ['관심 과목을 선택하면 맞춤 강의를 추천해 드려요.', '학습 목표를 설정하고 진도를 관리해 보세요.', '복습 알림으로 잊지 않고 꾸준히 학습할 수 있습니다.'],
  game:         ['튜토리얼을 완료하고 첫 보상을 받아보세요!', '캐릭터를 생성하고 모험을 시작합니다.', '친구를 초대하면 더 큰 혜택이 기다려요.'],
}

const PRICING_POOLS: Record<Tone, string[]> = {
  default:      ['Free / 무료로 시작하세요', 'Pro / ₩9,900 월', 'Team / ₩29,900 월', 'Enterprise / 문의'],
  friendly:     ['처음엔 무료로 부담 없이!', '가성비 갑 Pro 플랜', '팀끼리 함께라면 Team 플랜', '특별한 분들을 위한 맞춤 플랜'],
  professional: ['Free Tier · 평가용 무료 사용', 'Pro · 단일 사용자, 모든 핵심 기능', 'Business · 팀 협업 + 권한 관리', 'Enterprise · SLA 및 전담 지원'],
  commerce:     ['BASIC · 5,900원', 'STANDARD · 12,900원', 'PREMIUM · 24,900원', 'VIP · 39,900원'],
  saas:         ['Starter — $0/월', 'Growth — $19/월', 'Scale — $49/월', 'Enterprise — Custom'],
  finance:      ['Standard · 수수료 0.05%', 'Plus · 수수료 0.03% + 리포트', 'Premium · 수수료 0.015% + 전담 PB', 'Private · 협의'],
  health:       ['일반 · 무료 / 광고 포함', '플러스 · 월 4,900원', '프리미엄 · 월 9,900원', '패밀리 · 월 14,900원'],
  education:    ['무료 체험 · 7일', '기본 · 월 9,900원', '심화 · 월 19,900원', '1:1 코칭 · 월 49,900원'],
  game:         ['Free To Play · 무료', '시즌 패스 · 9,900원', '얼티밋 패스 · 19,900원', '컬렉터 에디션 · 79,900원'],
}

const FAQ_Q_POOLS: string[] = [
  '서비스를 처음 이용하려면 어떻게 시작해야 하나요?',
  '결제 후 환불은 어떤 조건에서 가능한가요?',
  '한 계정으로 여러 기기에서 사용할 수 있나요?',
  '데이터는 어디에 저장되며, 보안은 어떻게 관리되나요?',
  '구독 플랜은 언제든지 변경하거나 해지할 수 있나요?',
]

const FAQ_A_POOLS: string[] = [
  '회원 가입 후 안내되는 단계별 가이드를 따라 진행하시면 누구나 쉽게 시작할 수 있습니다.',
  '결제일로부터 7일 이내, 사용 이력이 없을 경우 전액 환불이 가능합니다.',
  '하나의 계정으로 최대 3대의 기기에서 동시에 사용할 수 있습니다.',
  '모든 데이터는 국내 IDC에 암호화되어 저장되며, 정기적인 보안 감사를 받고 있습니다.',
  '언제든 마이페이지에서 자유롭게 플랜 변경 또는 해지가 가능하며, 잔여 기간만큼 일할 환불됩니다.',
]

/* ───────── 영문 ───────── */
const EN_PARAS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.',
]

/* ───────── 헬퍼 ───────── */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function picks<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) return [...arr].sort(() => Math.random() - 0.5)
  const out: T[] = []
  const used = new Set<number>()
  while (out.length < n) {
    const idx = Math.floor(Math.random() * arr.length)
    if (!used.has(idx)) { used.add(idx); out.push(arr[idx]) }
  }
  return out
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function pad2(n: number) { return n < 10 ? '0' + n : '' + n }
function randomDateISO() {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, 365))
  return d.toISOString().slice(0, 10)
}
function randomDateTimeISO() {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, 365))
  d.setHours(randInt(0, 23), randInt(0, 59), randInt(0, 59), 0)
  return d.toISOString().replace('T', ' ').slice(0, 19)
}
function randomEmail(name: string) {
  const handle = name.replace(/\s+/g, '').toLowerCase() || pick(NICKNAME_POOLS)
  const domain = pick(['gmail.com', 'naver.com', 'kakao.com', 'youtil.kr', 'example.com'])
  return `${handle}${randInt(10, 9999)}@${domain}`
}
function randomPhone() {
  return `010-${pad2(randInt(0, 99))}${randInt(10, 99)}-${pad2(randInt(0, 99))}${randInt(10, 99)}`
}
function uuid() {
  // simple v4-ish (cosmetic only)
  const hex = '0123456789abcdef'
  let s = ''
  for (let i = 0; i < 32; i++) s += hex[Math.floor(Math.random() * 16)]
  return `${s.slice(0,8)}-${s.slice(8,12)}-4${s.slice(13,16)}-${'89ab'[Math.floor(Math.random()*4)]}${s.slice(17,20)}-${s.slice(20,32)}`
}

/* ───────── 문단 생성 ───────── */
function generateParagraph(tone: Tone, lengthKey: LengthKey, lang: Lang): string {
  const preset = LENGTH_PRESETS.find(p => p.key === lengthKey)!
  if (lang === 'en') {
    return picks(EN_PARAS, Math.min(preset.sentences, EN_PARAS.length))
      .slice(0, preset.sentences)
      .join(' ')
  }
  const pool = PARAGRAPH_POOLS[tone]
  return picks(pool, Math.min(preset.sentences, pool.length)).slice(0, preset.sentences).join(' ')
}

function generateParagraphs(tone: Tone, lengthKey: LengthKey, count: number, lang: Lang): string {
  return Array.from({ length: count }, () => generateParagraph(tone, lengthKey, lang)).join('\n\n')
}

/* ───────── UI 요소 생성 ───────── */
const UI_ELEMENT_OPTIONS: { key: UIElement; icon: string; label: string }[] = [
  { key: 'titles',              icon: '📰', label: '타이틀' },
  { key: 'subtitles',           icon: '✏️', label: '서브타이틀' },
  { key: 'paragraphs',          icon: '📝', label: '문단' },
  { key: 'buttons',             icon: '🔘', label: '버튼' },
  { key: 'cardTitles',          icon: '🃏', label: '카드 제목' },
  { key: 'cardDescriptions',    icon: '🗂️', label: '카드 설명' },
  { key: 'productNames',        icon: '🛍️', label: '상품명' },
  { key: 'productDescriptions', icon: '📦', label: '상품 설명' },
  { key: 'reviews',             icon: '⭐', label: '리뷰' },
  { key: 'comments',            icon: '💬', label: '댓글' },
  { key: 'names',               icon: '👤', label: '이름' },
  { key: 'nicknames',           icon: '🆔', label: '닉네임' },
  { key: 'notifications',       icon: '🔔', label: '알림' },
  { key: 'errors',              icon: '⚠️', label: '에러' },
  { key: 'emptyStates',         icon: '🫥', label: '빈 상태' },
  { key: 'onboarding',          icon: '🚀', label: '온보딩' },
  { key: 'pricing',             icon: '💰', label: '가격 플랜' },
  { key: 'faqQuestions',        icon: '❓', label: 'FAQ 질문' },
]

function generateUIElement(el: UIElement, tone: Tone): string {
  switch (el) {
    case 'titles':              return pick(TITLE_POOLS[tone])
    case 'subtitles':           return pick(SUBTITLE_POOLS[tone])
    case 'paragraphs':          return pick(PARAGRAPH_POOLS[tone])
    case 'buttons':             return pick(BUTTON_POOLS[tone])
    case 'cardTitles':          return pick(CARD_TITLE_POOLS[tone])
    case 'cardDescriptions':    return pick(CARD_DESC_POOLS[tone])
    case 'productNames':        return pick(PRODUCT_NAME_POOLS)
    case 'productDescriptions': return pick(PRODUCT_DESC_POOLS)
    case 'reviews':             return pick(REVIEW_POOLS)
    case 'comments':            return pick(COMMENT_POOLS)
    case 'names':               return pick(NAME_POOLS)
    case 'nicknames':           return pick(NICKNAME_POOLS)
    case 'notifications':       return pick(NOTIFICATION_POOLS[tone])
    case 'errors':              return pick(ERROR_POOLS[tone])
    case 'emptyStates':         return pick(EMPTY_POOLS[tone])
    case 'onboarding':          return pick(ONBOARDING_POOLS[tone])
    case 'pricing':             return pick(PRICING_POOLS[tone])
    case 'faqQuestions':        return pick(FAQ_Q_POOLS)
    case 'faqAnswers':          return pick(FAQ_A_POOLS)
  }
}

/* ───────── JSON 더미 데이터 ───────── */
const DATA_TYPE_OPTIONS: { key: DataType; icon: string; label: string }[] = [
  { key: 'userProfile', icon: '👤', label: '회원 정보' },
  { key: 'product',     icon: '🛍️', label: '상품' },
  { key: 'order',       icon: '📦', label: '주문' },
  { key: 'review',      icon: '⭐', label: '리뷰' },
  { key: 'article',     icon: '📰', label: '게시글' },
  { key: 'transaction', icon: '💳', label: '거래' },
  { key: 'comment',     icon: '💬', label: '댓글' },
  { key: 'event',       icon: '📅', label: '이벤트' },
  { key: 'address',     icon: '🏠', label: '주소' },
  { key: 'task',        icon: '✅', label: '할 일' },
]

const FORMAT_OPTIONS: { key: FormatType; label: string }[] = [
  { key: 'json',     label: 'JSON' },
  { key: 'jsonl',    label: 'JSON Lines' },
  { key: 'csv',      label: 'CSV' },
  { key: 'yaml',     label: 'YAML' },
  { key: 'markdown', label: 'Markdown' },
  { key: 'html',     label: 'HTML 표' },
  { key: 'jsx',      label: 'JSX 배열' },
  { key: 'ts',       label: 'TS interface' },
]

type DataItem = Record<string, string | number | boolean | null>

function generateOne(type: DataType): DataItem {
  switch (type) {
    case 'userProfile': {
      const name = pick(NAME_POOLS)
      return {
        id: uuid(),
        name,
        nickname: pick(NICKNAME_POOLS),
        email: randomEmail(name),
        age: randInt(20, 65),
        phone: randomPhone(),
        joinedAt: randomDateISO(),
      }
    }
    case 'product': {
      return {
        id: 'P' + randInt(10000, 99999),
        name: pick(PRODUCT_NAME_POOLS),
        price: randInt(5, 250) * 1000,
        stock: randInt(0, 200),
        category: pick(['패션', '뷰티', '디지털', '리빙', '식품', '도서']),
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        createdAt: randomDateISO(),
      }
    }
    case 'order': {
      return {
        orderId: 'ORD-' + randInt(100000, 999999),
        customer: pick(NAME_POOLS),
        amount: randInt(10, 500) * 1000,
        status: pick(['결제완료', '배송준비', '배송중', '배송완료', '환불요청']),
        items: randInt(1, 5),
        orderedAt: randomDateTimeISO(),
      }
    }
    case 'review': {
      return {
        id: uuid(),
        author: pick(NICKNAME_POOLS),
        rating: randInt(3, 5),
        title: pick(['만족스러운 구매', '재구매 의사 있음', '가성비 좋아요', '디자인 마음에 들어요']),
        body: pick(REVIEW_POOLS),
        createdAt: randomDateISO(),
      }
    }
    case 'article': {
      return {
        slug: 'post-' + randInt(1000, 9999),
        title: pick(TITLE_POOLS.default),
        excerpt: pick(SUBTITLE_POOLS.default),
        author: pick(NAME_POOLS),
        views: randInt(50, 50000),
        likes: randInt(0, 5000),
        publishedAt: randomDateISO(),
      }
    }
    case 'transaction': {
      const amt = randInt(-500, 500) * 1000
      return {
        txId: 'TX' + randInt(10000000, 99999999),
        type: amt >= 0 ? '입금' : '출금',
        amount: Math.abs(amt),
        balance: randInt(50, 5000) * 1000,
        memo: pick(['월급', '관리비', '카페', '식비', '교통비', '공과금', '쇼핑']),
        at: randomDateTimeISO(),
      }
    }
    case 'comment': {
      return {
        id: uuid(),
        author: pick(NICKNAME_POOLS),
        body: pick(COMMENT_POOLS),
        likes: randInt(0, 200),
        replies: randInt(0, 30),
        createdAt: randomDateTimeISO(),
      }
    }
    case 'event': {
      const start = new Date()
      start.setDate(start.getDate() + randInt(-30, 30))
      const end = new Date(start)
      end.setHours(end.getHours() + randInt(1, 6))
      return {
        id: uuid(),
        title: pick(['신제품 발표회', '워크숍', '오프라인 모임', '웨비나', '핸즈온 세션', '연말 모임']),
        location: pick(['서울 강남', '서울 성수', '판교 테크노밸리', '온라인', '부산 해운대']),
        startsAt: start.toISOString().slice(0, 16).replace('T', ' '),
        endsAt: end.toISOString().slice(0, 16).replace('T', ' '),
        capacity: randInt(20, 500),
      }
    }
    case 'address': {
      return {
        recipient: pick(NAME_POOLS),
        zipcode: pad2(randInt(1, 99)) + pad2(randInt(0, 99)) + pad2(randInt(0, 9)),
        addr1: pick(['서울특별시 강남구 테헤란로', '경기도 성남시 분당구 판교역로', '서울특별시 마포구 양화로', '부산광역시 해운대구 우동']) + ' ' + randInt(1, 999),
        addr2: pick(['101호', '202호', '305호', '503호', 'A동 1201호']),
        phone: randomPhone(),
        isDefault: Math.random() < 0.3,
      }
    }
    case 'task': {
      return {
        id: uuid(),
        title: pick(['보고서 초안 작성', 'PR 리뷰', '디자인 시안 검토', '회의 안건 정리', '주간 데일리 작성', 'API 문서 업데이트']),
        priority: pick(['low', 'medium', 'high', 'urgent']),
        status: pick(['todo', 'doing', 'review', 'done']),
        assignee: pick(NAME_POOLS),
        dueDate: randomDateISO(),
        done: Math.random() < 0.3,
      }
    }
  }
}

function generateMany(type: DataType, count: number): DataItem[] {
  return Array.from({ length: count }, () => generateOne(type))
}

/* ───────── 포맷터 ───────── */
function toJSON(data: DataItem[]): string {
  return JSON.stringify(data, null, 2)
}
function toJSONL(data: DataItem[]): string {
  return data.map(d => JSON.stringify(d)).join('\n')
}
function toCSV(data: DataItem[]): string {
  if (data.length === 0) return ''
  const keys = Object.keys(data[0])
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [keys.join(','), ...data.map(d => keys.map(k => escape(d[k])).join(','))].join('\n')
}
function toYAML(data: DataItem[]): string {
  return data.map(d => {
    const lines = Object.entries(d).map(([k, v]) => {
      const isStr = typeof v === 'string'
      const needQuote = isStr && /[:#\-]/.test(v as string)
      const val = needQuote ? `"${(v as string).replace(/"/g, '\\"')}"` : v
      return `  ${k}: ${val}`
    }).join('\n')
    return `- \n${lines}`
  }).join('\n')
}
function toMarkdown(data: DataItem[]): string {
  if (data.length === 0) return ''
  const keys = Object.keys(data[0])
  const header = '| ' + keys.join(' | ') + ' |'
  const sep    = '| ' + keys.map(() => '---').join(' | ') + ' |'
  const rows   = data.map(d => '| ' + keys.map(k => String(d[k] ?? '')).join(' | ') + ' |')
  return [header, sep, ...rows].join('\n')
}
function toHTML(data: DataItem[]): string {
  if (data.length === 0) return ''
  const keys = Object.keys(data[0])
  const head = `<thead><tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr></thead>`
  const body = `<tbody>${data.map(d => `<tr>${keys.map(k => `<td>${d[k] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>`
  return `<table>\n  ${head}\n  ${body}\n</table>`
}
function toJSX(data: DataItem[]): string {
  return `const items = ${JSON.stringify(data, null, 2)} as const\n\n` +
    `export function List() {\n` +
    `  return (\n    <ul>\n      {items.map((item) => (\n        <li key={String(item.id ?? Math.random())}>{JSON.stringify(item)}</li>\n      ))}\n    </ul>\n  )\n}`
}
function toTS(data: DataItem[], type: DataType): string {
  if (data.length === 0) return ''
  const sample = data[0]
  const fields = Object.entries(sample).map(([k, v]) => {
    const t = typeof v === 'number' ? 'number'
            : typeof v === 'boolean' ? 'boolean'
            : v === null ? 'string | null'
            : 'string'
    return `  ${k}: ${t}`
  }).join('\n')
  const name = type[0].toUpperCase() + type.slice(1)
  return `export interface ${name} {\n${fields}\n}\n\nexport const data: ${name}[] = ${JSON.stringify(data, null, 2)}`
}

function formatData(data: DataItem[], format: FormatType, type: DataType): string {
  switch (format) {
    case 'json':     return toJSON(data)
    case 'jsonl':    return toJSONL(data)
    case 'csv':      return toCSV(data)
    case 'yaml':     return toYAML(data)
    case 'markdown': return toMarkdown(data)
    case 'html':     return toHTML(data)
    case 'jsx':      return toJSX(data)
    case 'ts':       return toTS(data, type)
  }
}

/* ───────── UX 시나리오 ───────── */
const SCENARIOS: { key: Scenario; icon: string; label: string }[] = [
  { key: 'login',    icon: '🔐', label: '로그인 실패' },
  { key: 'signup',   icon: '✍️', label: '회원가입 안내' },
  { key: 'payment',  icon: '💳', label: '결제 실패' },
  { key: 'delete',   icon: '🗑️', label: '삭제 확인' },
  { key: 'empty',    icon: '🫥', label: '빈 상태' },
]

function generateUX(scenario: Scenario, tone: Tone): { title: string; body: string; primary: string; secondary: string } {
  const friendly = tone === 'friendly'
  const game = tone === 'game'
  const pro = tone === 'professional' || tone === 'finance'

  switch (scenario) {
    case 'login':
      return {
        title:     friendly ? '로그인이 안 되네요!' : pro ? '로그인 실패' : game ? '입장이 거부되었습니다!' : '로그인할 수 없습니다',
        body:      friendly ? '아이디나 비밀번호를 한 번만 더 확인해 주실래요?' : pro ? '입력하신 자격 증명이 일치하지 않습니다. 다시 시도해 주십시오.' : game ? '계정 정보를 다시 확인하고 재도전하세요!' : '아이디 또는 비밀번호가 올바르지 않습니다.',
        primary:   friendly ? '다시 해볼래요' : '다시 시도',
        secondary: '비밀번호 찾기',
      }
    case 'signup':
      return {
        title:     friendly ? '환영해요! 함께 시작해요' : pro ? '계정 생성 안내' : game ? '새로운 모험가의 등장!' : '회원가입을 시작합니다',
        body:      friendly ? '몇 가지 정보만 입력하시면 곧바로 시작할 수 있어요. 1분이면 끝나요!' : pro ? '서비스 이용을 위해 계정 등록이 필요합니다. 약관 동의 후 다음 단계로 진행해 주십시오.' : game ? '닉네임을 정하고 첫 모험을 떠나보세요. 영웅의 이름이 영원히 기록됩니다.' : '간단한 정보 입력 후 바로 사용할 수 있습니다.',
        primary:   friendly ? '시작할래요!' : pro ? '약관 동의 및 계속' : game ? '모험 시작!' : '계속',
        secondary: '이미 계정이 있어요',
      }
    case 'payment':
      return {
        title:     friendly ? '앗, 결제가 안 됐어요' : pro ? '결제 처리 실패' : game ? '거래가 실패했습니다!' : '결제할 수 없습니다',
        body:      friendly ? '카드 정보나 잔고를 한 번만 더 확인해 주실래요? 다시 시도하면 잘 될 거예요!' : pro ? '카드 발급사로부터 거절 응답이 수신되었습니다. 카드 한도 및 정보를 확인 후 재시도 바랍니다.' : game ? '인벤토리 골드가 부족하거나 결제 방식에 문제가 있습니다. 확인 후 다시 시도하세요.' : '카드 정보 또는 잔고를 확인해 주세요.',
        primary:   '다시 결제',
        secondary: '다른 방법으로',
      }
    case 'delete':
      return {
        title:     friendly ? '정말 삭제하시는 건가요?' : pro ? '삭제 작업 확인' : game ? '아이템을 폐기하시겠습니까?' : '삭제하시겠습니까?',
        body:      friendly ? '삭제하면 되돌리기 어려워요. 한 번만 더 확인해 주세요!' : pro ? '본 작업은 복구할 수 없습니다. 진행 시 영구히 삭제되며 관련 로그만 보관됩니다.' : game ? '폐기한 아이템은 복구되지 않습니다. 정말 진행하시겠습니까?' : '삭제하면 복구할 수 없습니다.',
        primary:   pro ? '영구 삭제' : '삭제',
        secondary: '취소',
      }
    case 'empty':
      return {
        title:     friendly ? '아직 비어있어요!' : pro ? '데이터 없음' : game ? '인벤토리가 텅 비었네요!' : '항목이 없습니다',
        body:      friendly ? '첫 항목을 추가해서 이곳을 채워 보세요. 어렵지 않아요!' : pro ? '표시 가능한 데이터가 존재하지 않습니다. 새 항목을 등록해 주십시오.' : game ? '필드를 탐험하고 첫 전리품을 손에 넣어 보세요!' : '첫 항목을 추가해 보세요.',
        primary:   friendly ? '지금 추가하기' : pro ? '항목 등록' : game ? '모험 시작!' : '추가',
        secondary: '나중에 할게요',
      }
  }
}

/* ───────── 길이 테스트 ───────── */
const OVERFLOW_TESTS: { key: string; label: string; text: string }[] = [
  { key: 'short',     label: 'SHORT',     text: '짧은 텍스트' },
  { key: 'medium',    label: 'MEDIUM',    text: '레이아웃 점검을 위한 보통 길이의 텍스트입니다.' },
  { key: 'long',      label: 'LONG',      text: '레이아웃과 줄바꿈, 컨테이너 폭이 변할 때 어떻게 흐르는지 확인하기 위한 적당히 긴 길이의 텍스트입니다. 두세 줄에 걸쳐 자연스럽게 흐릅니다.' },
  { key: 'veryLong',  label: 'VERY LONG', text: '매우 긴 텍스트는 카드, 모달, 툴팁, 리스트 아이템 등 모든 컨테이너에서 오버플로 처리, 줄바꿈, 말줄임표(ellipsis) 동작이 일관되게 유지되는지를 확인할 때 사용합니다. 본 문장은 의도적으로 길게 작성되어 다양한 폰트 크기와 줄 높이에서의 가독성을 검증할 수 있습니다.' },
  { key: 'noSpace',   label: 'NO SPACE',  text: '띄어쓰기없는한국어아주긴문자열에서워드브레이크가어떻게동작하는지테스트할때사용합니다레이아웃이깨지지않는지확인해보세요' },
  { key: 'urlLike',   label: 'URL',       text: 'https://www.example.com/very/long/path/segment/with-many-dashes-and-slashes/test?query=parameter&value=12345' },
  { key: 'emoji',     label: 'EMOJI',     text: '🎉 축하합니다! 🚀 모든 테스트가 통과했어요 ✅ 다음 단계로 진행할 수 있어요 💯' },
  { key: 'mixed',     label: 'MIXED',     text: 'Mixed 한글 English 数字123 and special!@#$ characters를 함께 테스트' },
]

/* ───────── 클립보드 ───────── */
function useCopy(): [string | null, (key: string, text: string) => void] {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = (key: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    })
  }
  return [copiedKey, copy]
}

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function LoremClient() {
  const [tab, setTab] = useState<Tab>('paragraph')
  const [tone, setTone] = useState<Tone>('default')
  const [copiedKey, copy] = useCopy()

  /* 문단 탭 */
  const [lang, setLang] = useState<Lang>('ko')
  const [pLen, setPLen] = useState<LengthKey>('medium')
  const [pCount, setPCount] = useState(3)
  const [pOutput, setPOutput] = useState('')
  const handleGenerateP = () => {
    setPOutput(generateParagraphs(tone, pLen, pCount, lang))
  }

  /* UI 요소 탭 */
  const [uiEl, setUiEl] = useState<UIElement>('titles')
  const [uiCount, setUiCount] = useState(8)
  const [uiOutput, setUiOutput] = useState<string[]>([])
  const handleGenerateUI = () => {
    setUiOutput(Array.from({ length: uiCount }, () => generateUIElement(uiEl, tone)))
  }

  /* JSON 탭 */
  const [dType, setDType] = useState<DataType>('userProfile')
  const [dFormat, setDFormat] = useState<FormatType>('json')
  const [dCount, setDCount] = useState(5)
  const [dOutput, setDOutput] = useState('')
  const handleGenerateD = () => {
    const data = generateMany(dType, dCount)
    setDOutput(formatData(data, dFormat, dType))
  }

  /* 카드 UI 미리보기 탭 */
  type CardStyle = 'product' | 'article' | 'profile'
  const [cardStyle, setCardStyle] = useState<CardStyle>('product')
  const [cardCount, setCardCount] = useState(6)
  type CardData =
    | { kind: 'product'; icon: string; title: string; desc: string; price: string; rating: string; badge?: string }
    | { kind: 'article'; icon: string; title: string; desc: string; author: string; date: string }
    | { kind: 'profile'; icon: string; title: string; desc: string; followers: string; nickname: string }
  const [cards, setCards] = useState<CardData[]>([])
  const generateCards = () => {
    const ICONS_PRODUCT = ['🛍️', '👜', '👟', '⌚', '🎧', '📱', '💄', '🧴', '🪑', '📚']
    const ICONS_ARTICLE = ['📰', '📖', '🗞️', '📓', '🧠', '✍️', '📝', '📊']
    const ICONS_PROFILE = ['😀', '🐶', '🐱', '🦊', '🦁', '🐼', '🐨', '🦄', '🐯', '🐻']
    const out: CardData[] = []
    for (let i = 0; i < cardCount; i++) {
      if (cardStyle === 'product') {
        out.push({
          kind: 'product',
          icon: pick(ICONS_PRODUCT),
          title: pick(PRODUCT_NAME_POOLS),
          desc: pick(PRODUCT_DESC_POOLS),
          price: '₩' + (randInt(5, 250) * 1000).toLocaleString(),
          rating: '★ ' + (3.5 + Math.random() * 1.5).toFixed(1),
          badge: Math.random() < 0.4 ? pick(['NEW', 'HOT', 'SALE', 'BEST']) : undefined,
        })
      } else if (cardStyle === 'article') {
        out.push({
          kind: 'article',
          icon: pick(ICONS_ARTICLE),
          title: pick(TITLE_POOLS[tone]),
          desc: pick(SUBTITLE_POOLS[tone]),
          author: pick(NAME_POOLS),
          date: randomDateISO(),
        })
      } else {
        const name = pick(NAME_POOLS)
        out.push({
          kind: 'profile',
          icon: pick(ICONS_PROFILE),
          title: name,
          desc: pick(SUBTITLE_POOLS[tone]),
          followers: randInt(50, 50000).toLocaleString() + ' 팔로워',
          nickname: '@' + pick(NICKNAME_POOLS),
        })
      }
    }
    setCards(out)
  }

  /* UX 라이팅 탭 */
  const [scenario, setScenario] = useState<Scenario>('login')
  const ux = useMemo(() => generateUX(scenario, tone), [scenario, tone])

  /* 길이 테스트 탭 */
  const lenSamples = useMemo(() => {
    return LENGTH_PRESETS.map(p => {
      // 한 문단 만들고 글자수에 맞춰 자르거나 반복
      const base = generateParagraph(tone, p.key, 'ko')
      let text = base
      while (text.length < p.targetChars) text += ' ' + base
      return { key: p.key, label: p.label, text: text.slice(0, p.targetChars), len: text.slice(0, p.targetChars).length }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tone])

  /* ═════════════════════════════════════════ UI ═════════════════════════════════════════ */
  return (
    <div className={styles.wrap}>

      {/* 면책 */}
      <div className={styles.disclaimer}>
        💡 <strong>참고용 더미 콘텐츠</strong> — 본 도구로 생성된 모든 텍스트와 데이터는 무작위 조합된 가상 정보입니다. 실제 인물·회사·서비스와 무관하며 자유롭게 사용하실 수 있습니다.
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {([
          ['paragraph', '문단'],
          ['ui',        'UI 요소'],
          ['json',      'JSON 데이터'],
          ['card',      '카드 목업'],
          ['ux',        'UX 라이팅'],
          ['length',    '길이 테스트'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button key={key}
            className={`${styles.tabBtn} ${tab === key ? styles.tabActive : ''}`}
            onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* 톤 (모든 탭 공통) */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          톤 선택
          <span className={styles.cardLabelHint}>9가지 분위기 중에서 선택</span>
        </label>
        <div className={styles.toneRow}>
          {TONE_OPTIONS.map(t => (
            <button key={t.key}
              className={`${styles.toneBtn} ${tone === t.key ? styles.toneActive : ''}`}
              onClick={() => setTone(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 문단 탭 ─── */}
      {tab === 'paragraph' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>언어</label>
            <div className={styles.toggleRow}>
              <button className={`${styles.toggleBtn} ${lang === 'ko' ? styles.toggleActive : ''}`} onClick={() => setLang('ko')}>🇰🇷 한글</button>
              <button className={`${styles.toggleBtn} ${lang === 'en' ? styles.toggleActive : ''}`} onClick={() => setLang('en')}>🇺🇸 영문 (Lorem)</button>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>길이 프리셋</label>
            <div className={styles.optRow}>
              {LENGTH_PRESETS.map(p => (
                <button key={p.key}
                  className={`${styles.optBtn} ${pLen === p.key ? styles.optActive : ''}`}
                  onClick={() => setPLen(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              문단 수
              <span className={styles.cardLabelHint}>{pCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input type="range" min={1} max={20} value={pCount} onChange={e => setPCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{pCount}</span>
            </div>
          </div>

          <div className={styles.btnRow}>
            <button className={styles.actionBtn} onClick={handleGenerateP}>✨ 문단 생성</button>
          </div>

          {pOutput && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                생성 결과
                <span className={styles.cardLabelHint}>{pOutput.length}자 · {pOutput.split('\n\n').length}문단</span>
              </label>
              <div className={styles.outputBox}>{pOutput}</div>
              <div style={{ marginTop: '12px' }}>
                <button
                  className={`${styles.copyBtn} ${copiedKey === 'p' ? styles.copied : ''}`}
                  onClick={() => copy('p', pOutput)}>
                  {copiedKey === 'p' ? '✓ 복사됨' : '📋 전체 복사'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── UI 요소 탭 ─── */}
      {tab === 'ui' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>요소 종류</label>
            <div className={styles.elementGrid}>
              {UI_ELEMENT_OPTIONS.map(opt => (
                <button key={opt.key}
                  className={`${styles.elementCard} ${uiEl === opt.key ? styles.elementActive : ''}`}
                  onClick={() => setUiEl(opt.key)}>
                  <small>{opt.icon}</small>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              생성 개수
              <span className={styles.cardLabelHint}>{uiCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input type="range" min={1} max={30} value={uiCount} onChange={e => setUiCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{uiCount}</span>
            </div>
          </div>

          <div className={styles.btnRow}>
            <button className={styles.actionBtn} onClick={handleGenerateUI}>✨ UI 요소 생성</button>
          </div>

          {uiOutput.length > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                생성 결과
                <span className={styles.cardLabelHint}>{uiOutput.length}개</span>
              </label>
              <div className={styles.resultList}>
                {uiOutput.map((item, i) => (
                  <div key={i} className={styles.resultItem}>
                    <span>{item}</span>
                    <button
                      className={`${styles.miniCopyBtn} ${copiedKey === 'ui-' + i ? styles.miniCopied : ''}`}
                      onClick={() => copy('ui-' + i, item)}>
                      {copiedKey === 'ui-' + i ? '✓' : '복사'}
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px' }}>
                <button
                  className={`${styles.copyBtn} ${copiedKey === 'ui-all' ? styles.copied : ''}`}
                  onClick={() => copy('ui-all', uiOutput.join('\n'))}>
                  {copiedKey === 'ui-all' ? '✓ 복사됨' : '📋 전체 복사 (줄바꿈 구분)'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── JSON 데이터 탭 ─── */}
      {tab === 'json' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>데이터 종류</label>
            <div className={styles.dataTypeGrid}>
              {DATA_TYPE_OPTIONS.map(opt => (
                <button key={opt.key}
                  className={`${styles.dataTypeBtn} ${dType === opt.key ? styles.dataTypeActive : ''}`}
                  onClick={() => setDType(opt.key)}>
                  <small>{opt.icon}</small>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>출력 형식</label>
            <div className={styles.formatRow}>
              {FORMAT_OPTIONS.map(opt => (
                <button key={opt.key}
                  className={`${styles.formatBtn} ${dFormat === opt.key ? styles.formatActive : ''}`}
                  onClick={() => setDFormat(opt.key)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              레코드 수
              <span className={styles.cardLabelHint}>{dCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input type="range" min={1} max={50} value={dCount} onChange={e => setDCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{dCount}</span>
            </div>
          </div>

          <div className={styles.btnRow}>
            <button className={styles.actionBtn} onClick={handleGenerateD}>✨ 데이터 생성</button>
          </div>

          {dOutput && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                생성 결과
                <span className={styles.cardLabelHint}>{dCount}개 · {dFormat.toUpperCase()}</span>
              </label>
              <pre className={styles.codeBlock}>{dOutput}</pre>
              <div style={{ marginTop: '12px' }}>
                <button
                  className={`${styles.copyBtn} ${copiedKey === 'd' ? styles.copied : ''}`}
                  onClick={() => copy('d', dOutput)}>
                  {copiedKey === 'd' ? '✓ 복사됨' : '📋 복사'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── 카드 UI 목업 탭 ─── */}
      {tab === 'card' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>카드 스타일</label>
            <div className={styles.optRow}>
              {([['product', '상품 카드'], ['article', '아티클 카드'], ['profile', '프로필 카드']] as [CardStyle, string][]).map(([k, l]) => (
                <button key={k}
                  className={`${styles.optBtn} ${cardStyle === k ? styles.optActive : ''}`}
                  onClick={() => setCardStyle(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              카드 수
              <span className={styles.cardLabelHint}>{cardCount}개</span>
            </label>
            <div className={styles.sliderRow}>
              <input type="range" min={2} max={12} value={cardCount} onChange={e => setCardCount(parseInt(e.target.value))} />
              <span className={styles.sliderValue}>{cardCount}</span>
            </div>
          </div>

          <div className={styles.btnRow}>
            <button className={styles.actionBtn} onClick={generateCards}>✨ 카드 목업 생성</button>
          </div>

          {cards.length > 0 && (
            <div className={styles.previewGrid3}>
              {cards.map((c, i) => (
                <div key={i} className={styles.previewCard}>
                  {c.kind === 'product' && c.badge && <span className={styles.previewBadge}>{c.badge}</span>}
                  <div className={styles.previewIcon}>{c.icon}</div>
                  <div className={styles.previewTitle}>{c.title}</div>
                  <div className={styles.previewDesc}>{c.desc}</div>
                  {c.kind === 'product' && (
                    <div className={styles.previewMeta}>
                      <span className={styles.previewPrice}>{c.price}</span>
                      <span className={styles.previewRating}>{c.rating}</span>
                    </div>
                  )}
                  {c.kind === 'article' && (
                    <div className={styles.previewMeta}>
                      <span>{c.author}</span>
                      <span>{c.date}</span>
                    </div>
                  )}
                  {c.kind === 'profile' && (
                    <div className={styles.previewMeta}>
                      <span>{c.nickname}</span>
                      <span>{c.followers}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── UX 라이팅 탭 ─── */}
      {tab === 'ux' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>시나리오</label>
            <div className={styles.scenarioGrid}>
              {SCENARIOS.map(s => (
                <button key={s.key}
                  className={`${styles.scenarioBtn} ${scenario === s.key ? styles.scenarioActive : ''}`}
                  onClick={() => setScenario(s.key)}>
                  <small>{s.icon}</small>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              UX 카피 (현재 톤: {TONE_OPTIONS.find(t => t.key === tone)?.label})
            </label>
            <div className={styles.uxResultCard}>
              <div className={styles.uxRow}><strong>제목</strong>{ux.title}</div>
              <div className={styles.uxRow}><strong>본문</strong>{ux.body}</div>
              <div className={styles.uxRow}><strong>주 버튼</strong>{ux.primary}</div>
              <div className={styles.uxRow}><strong>보조 버튼</strong>{ux.secondary}</div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <span className={styles.subLabel}>실제 UI 미리보기</span>
              <div className={styles.previewCard}>
                <div className={styles.previewTitle}>{ux.title}</div>
                <div className={styles.previewDesc}>{ux.body}</div>
                <div className={styles.btnPreviewRow}>
                  <button className={styles.btnPrimary}>{ux.primary}</button>
                  <button className={styles.btnSecondary}>{ux.secondary}</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                className={`${styles.copyBtn} ${copiedKey === 'ux' ? styles.copied : ''}`}
                onClick={() => copy('ux', `[${ux.title}]\n${ux.body}\n\n${ux.primary} / ${ux.secondary}`)}>
                {copiedKey === 'ux' ? '✓ 복사됨' : '📋 카피 복사'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── 길이 테스트 탭 ─── */}
      {tab === 'length' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>
              길이 샘플
              <span className={styles.cardLabelHint}>5단계 — 카드/모달 디자인용</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lenSamples.map(s => (
                <div key={s.key} className={styles.lenItem}>
                  <span className={styles.lenLabel}>{s.label}</span>
                  <span className={styles.lenText}>{s.text}</span>
                  <span className={styles.lenSize}>{s.len}자</span>
                  <button
                    className={`${styles.miniCopyBtn} ${copiedKey === 'l-' + s.key ? styles.miniCopied : ''}`}
                    onClick={() => copy('l-' + s.key, s.text)}>
                    {copiedKey === 'l-' + s.key ? '✓' : '📋'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              오버플로 테스트
              <span className={styles.cardLabelHint}>truncate / 줄바꿈 / 특수문자 검증용</span>
            </label>
            <div className={styles.previewBoxRow}>
              {OVERFLOW_TESTS.map(t => (
                <div key={t.key} className={styles.previewBox}>
                  <div className={styles.previewBoxLabel}>{t.label}</div>
                  <div>{t.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              truncate 동작 비교
              <span className={styles.cardLabelHint}>1줄 / 2줄 / 3줄 말줄임</span>
            </label>
            <div className={styles.previewBoxRow}>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>1줄 truncate</div>
                <div className={styles.truncate1}>{lenSamples[3]?.text}</div>
              </div>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>2줄 truncate</div>
                <div className={styles.truncate2}>{lenSamples[3]?.text}</div>
              </div>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>3줄 truncate</div>
                <div className={styles.truncate3}>{lenSamples[3]?.text}</div>
              </div>
              <div className={styles.previewBox}>
                <div className={styles.previewBoxLabel}>제한 없음</div>
                <div>{lenSamples[3]?.text}</div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
