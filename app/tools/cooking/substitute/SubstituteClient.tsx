'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './substitute.module.css'

// ──────────────────────────────────────
// 타입
// ──────────────────────────────────────
type Grade = 'perfect' | 'good' | 'okay' | 'caution'

interface SubstituteOption {
  name: string
  ratio: number
  substituteUnit?: string
  ratioNote?: string
  grade: Grade
  useFor: string[]
  taste: string
  texture: string
  warning?: string
  combinedWith?: string
}

interface SubstituteData {
  original: string
  emoji: string
  category: string
  group: string
  options: SubstituteOption[]
}

// ──────────────────────────────────────
// 등급 정보
// ──────────────────────────────────────
const GRADE_INFO: Record<Grade, { label: string; icon: string; cardClass: string; badgeClass: string; dotClass: string }> = {
  perfect: { label: '완벽 대체',    icon: '⭐', cardClass: styles.optionCardPerfect, badgeClass: styles.gradePerfect, dotClass: styles.browseOptionDotPerfect },
  good:    { label: '훌륭한 대체',  icon: '✅', cardClass: styles.optionCardGood,    badgeClass: styles.gradeGood,    dotClass: styles.browseOptionDotGood },
  okay:    { label: '가능한 대체',  icon: '🔶', cardClass: styles.optionCardOkay,    badgeClass: styles.gradeOkay,    dotClass: styles.browseOptionDotOkay },
  caution: { label: '주의 필요',    icon: '⚠️', cardClass: styles.optionCardCaution, badgeClass: styles.gradeCaution, dotClass: styles.browseOptionDotCaution },
}
const GRADE_RANK: Record<Grade, number> = { perfect: 0, good: 1, okay: 2, caution: 3 }

// ──────────────────────────────────────
// 카테고리 그룹
// ──────────────────────────────────────
const GROUPS: { id: string; label: string; emoji: string }[] = [
  { id: 'fat',     label: '유지방류', emoji: '🧈' },
  { id: 'dairy',   label: '유제품',   emoji: '🥛' },
  { id: 'sweet',   label: '감미료',   emoji: '🍯' },
  { id: 'protein', label: '단백질',   emoji: '🥚' },
  { id: 'flour',   label: '가루류',   emoji: '🌾' },
  { id: 'acid',    label: '산미',     emoji: '🍋' },
  { id: 'season',  label: '양념',     emoji: '🧄' },
  { id: 'herb',    label: '허브·향신료', emoji: '🌿' },
  { id: 'plant',   label: '식물성',   emoji: '🥥' },
]

// ──────────────────────────────────────
// 단위 옵션
// ──────────────────────────────────────
const UNIT_OPTIONS = ['g', 'ml', '큰술', '작은술', '컵', '개']

// ──────────────────────────────────────
// 목적
// ──────────────────────────────────────
const PURPOSE_OPTIONS = [
  { id: 'all',    label: '전체' },
  { id: 'cook',   label: '일반 요리' },
  { id: 'bake',   label: '베이킹' },
  { id: 'diet',   label: '다이어트' },
  { id: 'vegan',  label: '비건' },
  { id: 'gf',     label: '글루텐프리' },
]

// 옵션 → 목적 태그 매핑 (이름·설명 키워드 기반)
function matchPurpose(opt: SubstituteOption, purpose: string): boolean {
  if (purpose === 'all') return true
  const text = (opt.name + ' ' + opt.useFor.join(' ') + ' ' + opt.taste + ' ' + opt.texture + ' ' + (opt.warning || '')).toLowerCase()
  if (purpose === 'cook')  return /요리|소스|수프|드레싱|마리네이드|볶음|카레/.test(text) || opt.useFor.includes('일반 요리')
  if (purpose === 'bake')  return /베이킹|쿠키|머핀|케이크|브라우니|빵|페이스트리|팬케이크|시폰|디저트/.test(text)
  if (purpose === 'diet')  return /저당|다이어트|저칼로리|알룰로스|스테비아|그릭요거트/.test(text)
  if (purpose === 'vegan') return /비건|식물성|두유|아몬드밀크|코코넛|아마씨|치아씨드|두부|바나나|아보카도|오일/.test(text)
  if (purpose === 'gf')    return /쌀가루|아몬드 가루|오트|글루텐프리|타피오카/.test(text)
  return true
}

// ──────────────────────────────────────
// 데이터
// ──────────────────────────────────────
const SUBSTITUTE_DATA: Record<string, SubstituteData> = {
  butter: {
    original: '버터', emoji: '🧈', category: '유지방', group: 'fat',
    options: [
      { name: '식물성 오일 (카놀라/포도씨)', ratio: 0.75, substituteUnit: 'ml', ratioNote: '버터 100g → 오일 75ml', grade: 'good', useFor: ['일반 요리', '머핀', '브라우니'], taste: '풍미가 약간 줄어듦', texture: '더 촉촉함, 부드러움', warning: '쿠키나 페이스트리에는 부적합 (모양 유지 X)' },
      { name: '코코넛 오일',                 ratio: 1.0,  ratioNote: '동량 대체 (실온 고체 상태로 사용)',     grade: 'good', useFor: ['베이킹 전반', '쿠키'],     taste: '약간의 코코넛 향',    texture: '버터와 가장 유사' },
      { name: '아보카도 (으깬 것)',          ratio: 1.0,  grade: 'okay', useFor: ['브라우니', '머핀'],       taste: '약한 풀맛',           texture: '훨씬 촉촉, 색이 약간 녹색', warning: '단맛 베이킹에만 권장' },
      { name: '그릭요거트',                  ratio: 0.5,  ratioNote: '버터의 절반 양 사용',                    grade: 'okay', useFor: ['머핀', '케이크'],         taste: '약간 신맛',           texture: '촉촉하지만 덜 풍부함' },
      { name: '마가린',                      ratio: 1.0,  grade: 'good', useFor: ['베이킹', '일반 요리'],     taste: '거의 동일',           texture: '동일' },
    ],
  },
  margarine: {
    original: '마가린', emoji: '🧈', category: '유지방', group: 'fat',
    options: [
      { name: '버터',         ratio: 1.0, grade: 'perfect', useFor: ['모든 용도'], taste: '더 풍부한 풍미', texture: '동일' },
      { name: '식물성 오일',   ratio: 0.75, substituteUnit: 'ml', grade: 'good', useFor: ['머핀', '브라우니'], taste: '풍미 약함', texture: '더 촉촉' },
      { name: '코코넛 오일',   ratio: 1.0, grade: 'good', useFor: ['베이킹'], taste: '약간 코코넛 향', texture: '비슷' },
    ],
  },
  shortening: {
    original: '쇼트닝', emoji: '🧈', category: '유지방', group: 'fat',
    options: [
      { name: '버터', ratio: 1.0, grade: 'good', useFor: ['쿠키', '파이 크러스트'], taste: '더 풍부한 풍미', texture: '약간 더 무거움', warning: '플레이키한 식감은 약간 줄어듦' },
      { name: '라드 (정제)', ratio: 1.0, grade: 'perfect', useFor: ['파이 크러스트', '비스킷'], taste: '약간의 동물성 풍미', texture: '동일하거나 더 플레이키' },
      { name: '코코넛 오일 (고체)', ratio: 1.0, grade: 'good', useFor: ['파이', '쿠키'], taste: '약한 코코넛 향', texture: '비슷' },
    ],
  },
  lard: {
    original: '라드', emoji: '🧈', category: '유지방', group: 'fat',
    options: [
      { name: '쇼트닝', ratio: 1.0, grade: 'perfect', useFor: ['파이', '비스킷'], taste: '풍미 없음 (라드보다 깔끔)', texture: '동일' },
      { name: '버터',   ratio: 1.0, grade: 'good',    useFor: ['파이', '튀김'],  taste: '더 진한 유지방 풍미', texture: '약간 다름' },
      { name: '식물성 오일', ratio: 0.85, substituteUnit: 'ml', grade: 'okay', useFor: ['튀김'], taste: '풍미 약함', texture: '비슷' },
    ],
  },
  milk: {
    original: '우유', emoji: '🥛', category: '유제품', group: 'dairy',
    options: [
      { name: '두유 (무가당)',     ratio: 1.0, grade: 'perfect', useFor: ['거의 모든 용도'], taste: '약간의 콩 풍미', texture: '동일' },
      { name: '아몬드밀크 (무가당)', ratio: 1.0, grade: 'good',    useFor: ['베이킹', '시리얼'], taste: '약한 너트 향',  texture: '약간 묽음' },
      { name: '귀리밀크',          ratio: 1.0, grade: 'good',    useFor: ['커피', '베이킹'], taste: '약간 단맛',     texture: '크리미함' },
      { name: '코코넛밀크 (희석)',  ratio: 1.0, grade: 'okay',    useFor: ['카레', '디저트'], taste: '코코넛 향',     texture: '진함', warning: '진한 코코넛 향이 음식 풍미를 바꿈' },
      { name: '에바포레이티드 밀크 + 물', ratio: 1.0, grade: 'good', ratioNote: '에바포 1/2컵 + 물 1/2컵 = 우유 1컵', combinedWith: '같은 양의 물', useFor: ['베이킹', '소스'], taste: '거의 동일', texture: '약간 진함' },
    ],
  },
  cream: {
    original: '생크림', emoji: '🥛', category: '유제품', group: 'dairy',
    options: [
      { name: '우유 + 버터',          ratio: 1.0, ratioNote: '생크림 1컵 = 우유 3/4컵 + 버터 1/4컵 녹여서', grade: 'good', useFor: ['소스', '수프', '카레'], taste: '거의 동일', texture: '거품 안 남, 휘핑용 X', combinedWith: '버터 (생크림 양의 1/4)', warning: '휘핑크림 용도로는 사용 불가' },
      { name: '코코넛 크림',           ratio: 1.0, grade: 'good', useFor: ['카레', '수프', '비건 디저트'], taste: '코코넛 향 강함', texture: '비슷하지만 더 진함' },
      { name: '에바포레이티드 밀크',    ratio: 1.0, grade: 'okay', useFor: ['파스타 소스', '수프'], taste: '약간 단맛, 진한 우유맛', texture: '걸쭉함이 약간 부족' },
      { name: '캐슈너트 크림 (블렌딩)', ratio: 1.0, grade: 'good', useFor: ['비건 디저트', '소스'], taste: '약한 너트 향', texture: '진하고 크리미' },
    ],
  },
  sourCream: {
    original: '사워크림', emoji: '🥛', category: '유제품', group: 'dairy',
    options: [
      { name: '그릭요거트 (플레인)', ratio: 1.0, grade: 'perfect', useFor: ['딥', '드레싱', '베이킹'], taste: '거의 동일', texture: '약간 더 묽음' },
      { name: '크림치즈 + 우유',    ratio: 1.0, ratioNote: '크림치즈 4 : 우유 1 비율로 풀어 사용', combinedWith: '우유 약간', grade: 'good', useFor: ['딥', '소스'], taste: '더 진함', texture: '진함' },
      { name: '코티지치즈 (블렌딩)', ratio: 1.0, grade: 'okay', useFor: ['딥', '베이킹'], taste: '약함', texture: '블렌딩 필요' },
    ],
  },
  yogurt: {
    original: '요거트', emoji: '🥛', category: '유제품', group: 'dairy',
    options: [
      { name: '사워크림',     ratio: 1.0, grade: 'perfect', useFor: ['딥', '베이킹'], taste: '거의 동일', texture: '약간 진함' },
      { name: '버터밀크',     ratio: 1.0, grade: 'good',    useFor: ['베이킹', '드레싱'], taste: '비슷한 신맛', texture: '훨씬 묽음' },
      { name: '두유 + 레몬즙', ratio: 1.0, ratioNote: '두유 1컵 + 레몬즙 1큰술 (5분 응고)', combinedWith: '레몬즙 1큰술', grade: 'okay', useFor: ['비건 베이킹'], taste: '신맛 약함', texture: '묽음' },
    ],
  },
  creamCheese: {
    original: '크림치즈', emoji: '🥛', category: '유제품', group: 'dairy',
    options: [
      { name: '마스카포네',           ratio: 1.0, grade: 'perfect', useFor: ['치즈케이크', '디저트'], taste: '더 부드럽고 단맛', texture: '약간 더 부드러움' },
      { name: '리코타치즈 + 그릭요거트', ratio: 1.0, ratioNote: '리코타 1/2 + 그릭요거트 1/2', grade: 'good', useFor: ['치즈케이크', '딥'], taste: '약간 다름', texture: '비슷' },
      { name: '두부 (단단한 것) + 레몬즙', ratio: 1.0, ratioNote: '으깬 두부 + 레몬즙으로 풍미 보완', combinedWith: '레몬즙 + 소금', grade: 'okay', useFor: ['비건 치즈케이크'], taste: '풍미 약함', texture: '비슷', warning: '블렌딩 필수' },
    ],
  },
  sugar: {
    original: '설탕', emoji: '🍯', category: '감미료', group: 'sweet',
    options: [
      { name: '꿀',         ratio: 0.75, ratioNote: '설탕 100g → 꿀 75g, 액체 1/4컵 줄이기', grade: 'good', useFor: ['머핀', '쿠키', '드레싱'], taste: '꿀 특유의 향', texture: '더 촉촉, 갈색 더 진함', warning: '160°C 이하로 굽기 (꿀이 빨리 탐)' },
      { name: '메이플시럽',  ratio: 0.75, substituteUnit: 'ml', ratioNote: '설탕 100g → 시럽 75ml, 액체 줄이기', grade: 'good', useFor: ['팬케이크', '머핀', '쿠키'], taste: '메이플 향, 풍부함', texture: '약간 더 촉촉' },
      { name: '알룰로스',    ratio: 1.3,  ratioNote: '설탕 100g → 알룰로스 130g (단맛 약함)', grade: 'good', useFor: ['저당 디저트', '음료', '드레싱'], taste: '깔끔한 단맛', texture: '거의 동일', warning: '캐러멜화 약함 (색·풍미 약간 차이)' },
      { name: '스테비아',    ratio: 0.01, ratioNote: '설탕 1컵 = 스테비아 1작은술', grade: 'okay', useFor: ['음료', '드레싱', '제로 디저트'], taste: '쓴맛 후미 (제품에 따라 다름)', texture: '부피 손실로 베이킹은 부피 보충 필요', warning: '베이킹은 다른 부피 재료 추가 필요' },
      { name: '바나나 (으깬 것)', ratio: 1.0, ratioNote: '설탕 100g → 바나나 100g, 액체 1/4 줄이기', grade: 'okay', useFor: ['머핀', '브라우니', '바나나브레드'], taste: '바나나 향', texture: '훨씬 촉촉, 진한 색' },
      { name: '코코넛 슈가',  ratio: 1.0, grade: 'good', useFor: ['쿠키', '머핀'], taste: '캐러멜 풍미', texture: '약간 더 진한 색' },
      { name: '황설탕',      ratio: 1.0, grade: 'good', useFor: ['쿠키', '브라우니'], taste: '캐러멜·당밀 풍미', texture: '약간 더 촉촉' },
    ],
  },
  brownSugar: {
    original: '황설탕', emoji: '🍯', category: '감미료', group: 'sweet',
    options: [
      { name: '백설탕 + 당밀',     ratio: 1.0, ratioNote: '백설탕 1컵 + 당밀 1큰술', combinedWith: '당밀 (1컵당 1큰술)', grade: 'perfect', useFor: ['모든 용도'], taste: '거의 동일', texture: '동일' },
      { name: '백설탕',           ratio: 1.0, grade: 'good',    useFor: ['일반 베이킹'], taste: '캐러멜 풍미 없음', texture: '약간 덜 촉촉' },
      { name: '코코넛 슈가',       ratio: 1.0, grade: 'good',    useFor: ['쿠키', '브라우니'], taste: '비슷한 캐러멜 향', texture: '비슷' },
      { name: '메이플시럽',        ratio: 0.75, substituteUnit: 'ml', grade: 'good', useFor: ['머핀', '쿠키'], taste: '메이플 향', texture: '더 촉촉' },
    ],
  },
  honey: {
    original: '꿀', emoji: '🍯', category: '감미료', group: 'sweet',
    options: [
      { name: '메이플시럽', ratio: 1.0, grade: 'perfect', useFor: ['거의 모든 용도'], taste: '메이플 향', texture: '동일' },
      { name: '아가베시럽', ratio: 1.0, grade: 'good',    useFor: ['음료', '디저트'], taste: '깔끔한 단맛', texture: '약간 묽음' },
      { name: '설탕 + 물',  ratio: 1.25, ratioNote: '꿀 100g → 설탕 125g + 물 30ml', combinedWith: '물 (꿀 양의 1/3)', grade: 'okay', useFor: ['베이킹'], taste: '꿀 향 없음', texture: '비슷', warning: '캐러멜 풍미가 없어 색·맛 차이 있음' },
    ],
  },
  mapleSyrup: {
    original: '메이플시럽', emoji: '🍯', category: '감미료', group: 'sweet',
    options: [
      { name: '꿀',          ratio: 1.0, grade: 'perfect', useFor: ['모든 용도'], taste: '꿀 향', texture: '동일' },
      { name: '아가베시럽',  ratio: 1.0, grade: 'good',    useFor: ['팬케이크', '음료'], taste: '깔끔한 단맛', texture: '약간 묽음' },
      { name: '물엿',        ratio: 1.0, grade: 'okay',    useFor: ['졸임', '소스'], taste: '단맛만 있음', texture: '동일' },
    ],
  },
  cornSyrup: {
    original: '물엿', emoji: '🍯', category: '감미료', group: 'sweet',
    options: [
      { name: '꿀',         ratio: 1.0, grade: 'good', useFor: ['졸임', '소스'], taste: '꿀 향', texture: '약간 묽음' },
      { name: '메이플시럽',  ratio: 1.0, grade: 'good', useFor: ['소스'], taste: '메이플 향', texture: '약간 묽음' },
      { name: '설탕 + 물 (졸임)', ratio: 1.0, ratioNote: '설탕 1컵 + 물 1/4컵을 졸여 시럽화', combinedWith: '물 + 졸이기', grade: 'okay', useFor: ['졸임'], taste: '풍미 없음', texture: '비슷' },
    ],
  },
  egg: {
    original: '계란 (1개)', emoji: '🥚', category: '단백질', group: 'protein',
    options: [
      { name: '플랙스에그 (아마씨 + 물)', ratio: 1.0, ratioNote: '계란 1개 = 아마씨 1큰술 + 물 3큰술 (5분 불림)', combinedWith: '물 3큰술', grade: 'good', useFor: ['쿠키', '머핀', '비건 베이킹'], taste: '약한 너트향', texture: '약간 더 진한 색' },
      { name: '치아씨드 + 물',           ratio: 1.0, ratioNote: '계란 1개 = 치아씨드 1큰술 + 물 3큰술 (10분 불림)', combinedWith: '물 3큰술', grade: 'good', useFor: ['머핀', '브레드'], taste: '거의 무미', texture: '약간 젤리 같은 질감' },
      { name: '두부 (으깬 것)',           ratio: 1.0, ratioNote: '계란 1개 = 부드러운 두부 60g', grade: 'okay', useFor: ['스크램블', '키슈', '베이킹'], taste: '거의 무미', texture: '부드럽고 촉촉' },
      { name: '으깬 바나나',              ratio: 1.0, ratioNote: '계란 1개 = 바나나 1/2개', grade: 'okay', useFor: ['머핀', '브라우니', '팬케이크'], taste: '바나나 향', texture: '촉촉, 색 진해짐' },
      { name: '사과소스 (무가당)',         ratio: 1.0, ratioNote: '계란 1개 = 사과소스 1/4컵', grade: 'good', useFor: ['머핀', '케이크'], taste: '약한 사과 향', texture: '촉촉' },
      { name: '아쿠아파바 (병아리콩 삶은 물)', ratio: 1.0, ratioNote: '계란 1개 흰자 = 아쿠아파바 3큰술', grade: 'good', useFor: ['머랭', '비건 디저트'], taste: '거의 무미', texture: '거품 잘 남' },
    ],
  },
  flour: {
    original: '밀가루', emoji: '🌾', category: '가루류', group: 'flour',
    options: [
      { name: '쌀가루 + 잔탄검',   ratio: 1.0, ratioNote: '쌀가루 1컵 + 잔탄검 1/4작은술 (글루텐프리)', combinedWith: '잔탄검 1/4작은술', grade: 'good', useFor: ['글루텐프리 베이킹'], taste: '약한 쌀 풍미', texture: '약간 푸석함' },
      { name: '아몬드 가루',       ratio: 1.0, ratioNote: '액체를 약간 줄이기', grade: 'good', useFor: ['쿠키', '케이크'], taste: '너트 향', texture: '진한 색·촉촉', warning: '글루텐 없어 부풂이 약함, 부피 감소' },
      { name: '오트밀 가루',       ratio: 1.0, grade: 'okay', useFor: ['머핀', '쿠키'], taste: '약한 오트 향', texture: '진한 식감' },
      { name: '시판 글루텐프리 믹스', ratio: 1.0, grade: 'perfect', useFor: ['글루텐프리 베이킹'], taste: '거의 동일', texture: '동일' },
    ],
  },
  cakeFlour: {
    original: '박력분', emoji: '🌾', category: '가루류', group: 'flour',
    options: [
      { name: '중력분 + 콘스타치', ratio: 1.0, ratioNote: '중력분 1컵에서 2큰술 빼고 콘스타치 2큰술 추가', combinedWith: '콘스타치 (1컵당 2큰술)', grade: 'perfect', useFor: ['스폰지케이크', '롤케이크'], taste: '동일', texture: '거의 동일' },
      { name: '중력분만',          ratio: 1.0, grade: 'okay', useFor: ['일반 베이킹'], taste: '동일', texture: '약간 더 단단함' },
    ],
  },
  breadFlour: {
    original: '강력분', emoji: '🌾', category: '가루류', group: 'flour',
    options: [
      { name: '중력분 + 글루텐가루', ratio: 1.0, ratioNote: '중력분 1컵 + 글루텐가루 1큰술', combinedWith: '글루텐가루 1큰술', grade: 'perfect', useFor: ['빵', '피자도우'], taste: '동일', texture: '동일' },
      { name: '중력분만',           ratio: 1.0, grade: 'okay', useFor: ['포카치아', '간단한 빵'], taste: '동일', texture: '쫄깃함이 약함' },
    ],
  },
  bakingPowder: {
    original: '베이킹파우더', emoji: '🧁', category: '팽창제', group: 'flour',
    options: [
      { name: '베이킹소다 + 산성재료', ratio: 0.25, ratioNote: '베이킹파우더 1작은술 = 베이킹소다 1/4작은술 + 식초/레몬즙 1/2작은술', combinedWith: '식초 또는 레몬즙 1/2작은술', grade: 'good', useFor: ['머핀', '팬케이크'], taste: '거의 동일', texture: '동일', warning: '반드시 산성 재료(식초·레몬즙·요거트)와 함께 사용' },
      { name: '계란 흰자 (휘핑)',     ratio: 0,    ratioNote: '머랭으로 베이킹파우더 일부 대체 가능', grade: 'caution', useFor: ['수플레', '시폰케이크'], taste: '거의 동일', texture: '훨씬 가볍고 부드러움', warning: '대체보다는 보완용. 레시피 변형 필요' },
    ],
  },
  bakingSoda: {
    original: '베이킹소다', emoji: '🥄', category: '팽창제', group: 'flour',
    options: [
      { name: '베이킹파우더', ratio: 3.0, ratioNote: '베이킹소다 1작은술 = 베이킹파우더 3작은술', grade: 'okay', useFor: ['일부 베이킹'], taste: '거의 동일', texture: '약간의 차이', warning: '소다보다 약함, 산성 재료가 많은 레시피는 부적합' },
    ],
  },
  lemonJuice: {
    original: '레몬즙', emoji: '🍋', category: '산미', group: 'acid',
    options: [
      { name: '식초 (사과식초/화이트)', ratio: 0.5, ratioNote: '레몬즙 1큰술 = 식초 1/2큰술', grade: 'good', useFor: ['드레싱', '베이킹', '마리네이드'], taste: '레몬 향이 없음', texture: '동일', warning: '맛에서 레몬 향이 핵심인 음식엔 부적합' },
      { name: '라임즙',                ratio: 1.0, grade: 'perfect', useFor: ['거의 모든 용도'], taste: '약간 더 강한 시트러스', texture: '동일' },
      { name: '구연산 (분말) + 물',     ratio: 0.1, ratioNote: '레몬즙 1큰술 = 구연산 1/4작은술 + 물 1큰술', combinedWith: '물 1큰술', grade: 'okay', useFor: ['요리', '청소'], taste: '신맛만 있음, 향 없음', texture: '동일' },
      { name: '화이트와인',            ratio: 1.0, grade: 'okay', useFor: ['소스', '드레싱'], taste: '와인 향', texture: '비슷' },
    ],
  },
  limeJuice: {
    original: '라임즙', emoji: '🍋', category: '산미', group: 'acid',
    options: [
      { name: '레몬즙',  ratio: 1.0, grade: 'perfect', useFor: ['모든 용도'], taste: '약간 다른 시트러스', texture: '동일' },
      { name: '식초',    ratio: 0.5, grade: 'okay',    useFor: ['드레싱', '마리네이드'], taste: '시트러스 향 없음', texture: '동일', warning: '향이 중요한 멕시칸 요리엔 부적합' },
    ],
  },
  vinegar: {
    original: '식초', emoji: '🍋', category: '산미', group: 'acid',
    options: [
      { name: '레몬즙',     ratio: 2.0, ratioNote: '식초 1큰술 = 레몬즙 2큰술', grade: 'good', useFor: ['드레싱', '소스'], taste: '레몬 향', texture: '동일' },
      { name: '라임즙',     ratio: 2.0, grade: 'good', useFor: ['드레싱'], taste: '시트러스 향', texture: '동일' },
      { name: '화이트와인',  ratio: 1.0, grade: 'okay', useFor: ['소스', '졸임'], taste: '와인 향', texture: '비슷' },
    ],
  },
  garlicPaste: {
    original: '다진마늘', emoji: '🧄', category: '양념', group: 'season',
    options: [
      { name: '마늘가루',         ratio: 0.125, ratioNote: '다진마늘 1큰술 = 마늘가루 1/8 작은술', grade: 'good', useFor: ['소스', '드레싱', '수프'], taste: '약간 약함', texture: '식감 없음' },
      { name: '마늘 1쪽 (으깬 것)', ratio: 0.5,   ratioNote: '다진마늘 1큰술 = 마늘 2~3쪽', grade: 'perfect', useFor: ['모든 요리'], taste: '신선해서 더 강함', texture: '동일' },
      { name: '마늘기름',          ratio: 1.0, grade: 'okay', useFor: ['볶음', '드레싱'], taste: '향만 있음, 매운맛 약함', texture: '액체' },
    ],
  },
  gingerPaste: {
    original: '다진생강', emoji: '🧄', category: '양념', group: 'season',
    options: [
      { name: '생강가루',         ratio: 0.25, ratioNote: '다진생강 1큰술 = 생강가루 1/4 작은술', grade: 'good', useFor: ['베이킹', '드레싱'], taste: '약간 다른 풍미', texture: '식감 없음' },
      { name: '생강 (생, 으깬 것)', ratio: 1.0, grade: 'perfect', useFor: ['모든 요리'], taste: '신선하고 더 매운', texture: '동일' },
    ],
  },
  soy: {
    original: '간장', emoji: '🧄', category: '양념', group: 'season',
    options: [
      { name: '타마리 간장 (글루텐프리)', ratio: 1.0, grade: 'perfect', useFor: ['모든 용도'], taste: '약간 더 진하고 깊음', texture: '동일' },
      { name: '코코넛 아미노스',         ratio: 1.0, grade: 'good',    useFor: ['저염 요리'], taste: '단맛, 짠맛 약함', texture: '비슷', warning: '염도가 약 1/3 수준 — 소금 추가 필요' },
      { name: '액젓 (피쉬소스)',         ratio: 0.75, grade: 'okay',   useFor: ['아시안 요리'], taste: '비린향, 더 짠맛', texture: '비슷' },
    ],
  },
  doenjang: {
    original: '된장', emoji: '🧄', category: '양념', group: 'season',
    options: [
      { name: '미소 (적·백미소)', ratio: 1.0, grade: 'good', useFor: ['국·찌개'], taste: '더 부드럽고 단맛', texture: '비슷' },
      { name: '청국장',          ratio: 1.0, grade: 'okay', useFor: ['찌개'], taste: '발효 향 강함', texture: '동일' },
    ],
  },
  basil: {
    original: '바질 (생)', emoji: '🌿', category: '허브', group: 'herb',
    options: [
      { name: '말린 바질', ratio: 0.33, ratioNote: '생 바질 1큰술 = 말린 바질 1작은술', grade: 'good', useFor: ['파스타', '소스'], taste: '풍미 약함', texture: '식감 없음' },
      { name: '오레가노 + 민트', ratio: 1.0, grade: 'okay', useFor: ['이탈리안 요리'], taste: '약간 다른 향', texture: '동일' },
      { name: '시소 (깻잎)',    ratio: 1.0, grade: 'okay', useFor: ['샐러드'], taste: '풋풋함은 비슷, 향 다름', texture: '동일' },
    ],
  },
  parsley: {
    original: '파슬리 (생)', emoji: '🌿', category: '허브', group: 'herb',
    options: [
      { name: '말린 파슬리', ratio: 0.33, ratioNote: '생 파슬리 1큰술 = 말린 파슬리 1작은술', grade: 'good', useFor: ['수프', '드레싱'], taste: '풍미 약함', texture: '식감 없음' },
      { name: '실란트로(고수)', ratio: 1.0, grade: 'okay', useFor: ['장식', '샐러드'], taste: '강한 향, 호불호 큼', texture: '동일' },
      { name: '셀러리 잎',     ratio: 1.0, grade: 'okay', useFor: ['수프', '스튜'], taste: '약간 다른 풀맛', texture: '동일' },
    ],
  },
  oregano: {
    original: '오레가노', emoji: '🌿', category: '허브', group: 'herb',
    options: [
      { name: '바질 + 타임', ratio: 1.0, grade: 'good', useFor: ['이탈리안 요리'], taste: '비슷한 허브 향', texture: '동일' },
      { name: '마조람',     ratio: 1.0, grade: 'perfect', useFor: ['모든 용도'], taste: '매우 비슷', texture: '동일' },
    ],
  },
  pepper: {
    original: '후추 (검정)', emoji: '🌿', category: '향신료', group: 'herb',
    options: [
      { name: '백후추',     ratio: 1.0, grade: 'good',  useFor: ['하얀 소스', '수프'], taste: '비슷, 약간 흙맛', texture: '비슷' },
      { name: '핑크페퍼콘', ratio: 1.0, grade: 'okay', useFor: ['장식', '샐러드'], taste: '과일 향, 매운맛 약함', texture: '동일' },
      { name: '시추안 페퍼', ratio: 0.75, grade: 'okay', useFor: ['중식', '아시안'], taste: '저린맛(마라)', texture: '동일' },
    ],
  },
  coconutMilk: {
    original: '코코넛밀크', emoji: '🥥', category: '식물성', group: 'plant',
    options: [
      { name: '코코넛 크림 + 물',  ratio: 1.0, ratioNote: '코코넛 크림 1/2 + 물 1/2', combinedWith: '같은 양의 물', grade: 'perfect', useFor: ['카레', '디저트'], taste: '동일', texture: '동일' },
      { name: '두유 + 코코넛 오일', ratio: 1.0, ratioNote: '두유 1컵 + 코코넛 오일 1큰술', combinedWith: '코코넛 오일 1큰술', grade: 'good', useFor: ['카레', '베이킹'], taste: '코코넛 향 약함', texture: '비슷' },
      { name: '아몬드밀크',        ratio: 1.0, grade: 'okay', useFor: ['디저트'], taste: '코코넛 향 없음', texture: '묽음', warning: '카레·아시안 요리엔 풍미 부족' },
    ],
  },
  soyMilk: {
    original: '두유', emoji: '🥥', category: '식물성', group: 'plant',
    options: [
      { name: '아몬드밀크', ratio: 1.0, grade: 'perfect', useFor: ['거의 모든 용도'], taste: '너트 향', texture: '약간 묽음' },
      { name: '귀리밀크',   ratio: 1.0, grade: 'perfect', useFor: ['거의 모든 용도'], taste: '단맛 약간', texture: '크리미함' },
      { name: '우유',       ratio: 1.0, grade: 'good',    useFor: ['모든 용도 (비건 X)'], taste: '동물성 풍미', texture: '동일' },
    ],
  },
  almondMilk: {
    original: '아몬드밀크', emoji: '🥥', category: '식물성', group: 'plant',
    options: [
      { name: '두유',     ratio: 1.0, grade: 'perfect', useFor: ['모든 용도'], taste: '콩 풍미', texture: '약간 진함' },
      { name: '귀리밀크', ratio: 1.0, grade: 'perfect', useFor: ['모든 용도'], taste: '단맛', texture: '크리미함' },
      { name: '우유',     ratio: 1.0, grade: 'good',    useFor: ['비건 X'], taste: '동물성 풍미', texture: '진함' },
    ],
  },
}

// ──────────────────────────────────────
// 검색 인덱스
// ──────────────────────────────────────
const SEARCH_INDEX = Object.entries(SUBSTITUTE_DATA).map(([key, data]) => ({
  key,
  original: data.original,
  emoji: data.emoji,
  category: data.category,
  group: data.group,
}))

// ──────────────────────────────────────
// 양 표시
// ──────────────────────────────────────
function formatAmount(value: number): string {
  if (!isFinite(value)) return '0'
  if (value === 0) return '0'
  if (value >= 100) return Math.round(value).toString()
  if (value >= 10)  return (Math.round(value * 10) / 10).toString()
  if (value >= 1)   return (Math.round(value * 100) / 100).toString()
  return (Math.round(value * 1000) / 1000).toString()
}

// ──────────────────────────────────────
// Component
// ──────────────────────────────────────
export default function SubstituteClient() {
  const [tab, setTab] = useState<'search' | 'browse'>('search')
  const [selectedKey, setSelectedKey] = useState<string>('butter')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [amount, setAmount] = useState<string>('100')
  const [unit, setUnit] = useState<string>('g')
  const [purpose, setPurpose] = useState<string>('all')

  const selected = SUBSTITUTE_DATA[selectedKey]

  // 자동 완성 매칭
  const suggestions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return []
    return SEARCH_INDEX.filter(s => s.original.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)).slice(0, 8)
  }, [searchTerm])

  // 옵션 필터·정렬
  const filteredOptions = useMemo(() => {
    if (!selected) return []
    return [...selected.options]
      .filter(o => matchPurpose(o, purpose))
      .sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade])
  }, [selected, purpose])

  // 선택 시 검색 텍스트 업데이트
  function handleSelect(key: string) {
    setSelectedKey(key)
    setSearchTerm(SUBSTITUTE_DATA[key].original)
    setShowSuggestions(false)
  }

  // 카테고리 둘러보기에서 자세히 보기
  function handleBrowseDetail(key: string) {
    handleSelect(key)
    setTab('search')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.wrap}>
      {/* 탭 */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'search' ? styles.tabActive : ''}`} onClick={() => setTab('search')}>🔍 대체 검색</button>
        <button className={`${styles.tab} ${tab === 'browse' ? styles.tabActive : ''}`} onClick={() => setTab('browse')}>📚 카테고리 둘러보기</button>
      </div>

      {tab === 'search' ? (
        <SearchTab
          selectedKey={selectedKey}
          selected={selected}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          suggestions={suggestions}
          handleSelect={handleSelect}
          amount={amount}
          setAmount={setAmount}
          unit={unit}
          setUnit={setUnit}
          purpose={purpose}
          setPurpose={setPurpose}
          filteredOptions={filteredOptions}
        />
      ) : (
        <BrowseTab onDetail={handleBrowseDetail} />
      )}
    </div>
  )
}

// ──────────────────────────────────────
// 탭 1 — 검색
// ──────────────────────────────────────
function SearchTab(props: {
  selectedKey: string
  selected: SubstituteData
  searchTerm: string
  setSearchTerm: (s: string) => void
  showSuggestions: boolean
  setShowSuggestions: (b: boolean) => void
  suggestions: { key: string; original: string; emoji: string; category: string }[]
  handleSelect: (key: string) => void
  amount: string
  setAmount: (s: string) => void
  unit: string
  setUnit: (s: string) => void
  purpose: string
  setPurpose: (s: string) => void
  filteredOptions: SubstituteOption[]
}) {
  const { selected, searchTerm, setSearchTerm, showSuggestions, setShowSuggestions, suggestions, handleSelect, amount, setAmount, unit, setUnit, purpose, setPurpose, filteredOptions, selectedKey } = props

  // 검색창 마운트 시 외부 클릭 닫기
  useEffect(() => {
    if (!showSuggestions) return
    const handler = () => setShowSuggestions(false)
    const t = setTimeout(() => window.addEventListener('click', handler), 0)
    return () => {
      clearTimeout(t)
      window.removeEventListener('click', handler)
    }
  }, [showSuggestions, setShowSuggestions])

  const amountNum = parseFloat(amount) || 0

  return (
    <>
      {/* 검색 박스 */}
      <div className={styles.searchBox}>
        <span className={styles.cardLabel}>대체할 재료 검색</span>
        <div className={styles.searchInputWrap} onClick={e => e.stopPropagation()}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="어떤 재료를 대체하시나요? (예: 버터, 설탕, 계란)"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && searchTerm.trim() && (
            <div className={styles.suggestions}>
              {suggestions.length === 0 ? (
                <div className={styles.searchEmpty}>일치하는 재료가 없습니다. 카테고리에서 직접 선택해 보세요.</div>
              ) : (
                suggestions.map(s => (
                  <div key={s.key} className={styles.suggestionItem} onClick={() => handleSelect(s.key)}>
                    <span className={styles.suggestionEmoji}>{s.emoji}</span>
                    <span>{s.original}</span>
                    <span className={styles.suggestionMeta}>{s.category}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 또는 드롭다운 */}
        <div style={{ marginTop: 14 }}>
          <span className={styles.fieldLabel}>또는 카테고리에서 선택</span>
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={selectedKey}
              onChange={e => handleSelect(e.target.value)}
            >
              {GROUPS.map(g => {
                const items = Object.entries(SUBSTITUTE_DATA).filter(([, d]) => d.group === g.id)
                if (items.length === 0) return null
                return (
                  <optgroup key={g.id} label={`${g.emoji} ${g.label}`}>
                    {items.map(([key, d]) => (
                      <option key={key} value={key}>{d.original}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            <span className={styles.selectArrow}>▼</span>
          </div>
        </div>

        {/* 양 + 단위 */}
        <div className={styles.fieldRow}>
          <div>
            <span className={styles.fieldLabel}>원재료 양</span>
            <input
              type="number"
              className={`${styles.input} ${amount && parseFloat(amount) > 0 ? styles.inputFilled : ''}`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="100"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <span className={styles.fieldLabel}>단위</span>
            <div className={styles.selectWrap}>
              <select className={styles.select} value={unit} onChange={e => setUnit(e.target.value)}>
                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>
        </div>

        {/* 목적 */}
        <div style={{ marginTop: 12 }}>
          <span className={styles.fieldLabel}>목적 (선택)</span>
          <div className={styles.purposeRow}>
            {PURPOSE_OPTIONS.map(p => (
              <button
                key={p.id}
                className={`${styles.purposeChip} ${purpose === p.id ? styles.purposeChipActive : ''}`}
                onClick={() => setPurpose(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 원재료 정보 */}
      <div className={styles.originalCard}>
        <span className={styles.originalEmoji}>{selected.emoji}</span>
        <div className={styles.originalInfo}>
          <div className={styles.originalName}>{selected.original}</div>
          <div className={styles.originalAmount}>
            {amountNum > 0 ? `${formatAmount(amountNum)} ${unit}` : '— '}
          </div>
          <div className={styles.originalCategory}>카테고리: {selected.category}</div>
        </div>
      </div>

      {/* 옵션 카드 */}
      {filteredOptions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyEmoji}>🤔</div>
          <div className={styles.emptyTitle}>해당 목적에 맞는 대체재가 없습니다</div>
          <div className={styles.emptyDesc}>다른 목적을 선택하거나 &lsquo;전체&rsquo;를 선택해 보세요.</div>
        </div>
      ) : (
        <div className={styles.optionList}>
          {filteredOptions.map((opt, i) => (
            <OptionCard key={i} opt={opt} amount={amountNum} unit={unit} />
          ))}
        </div>
      )}
    </>
  )
}

// ──────────────────────────────────────
// 옵션 카드
// ──────────────────────────────────────
function OptionCard({ opt, amount, unit }: { opt: SubstituteOption; amount: number; unit: string }) {
  const grade = GRADE_INFO[opt.grade]
  const subUnit = opt.substituteUnit || unit
  const showConversion = amount > 0 && opt.ratio > 0

  return (
    <div className={`${styles.optionCard} ${grade.cardClass}`}>
      <div className={styles.optionHeader}>
        <div className={styles.optionName}>{opt.name}</div>
        <span className={`${styles.gradeBadge} ${grade.badgeClass}`}>
          {grade.icon} {grade.label}
        </span>
      </div>

      {/* 양 환산 */}
      {showConversion ? (
        <div className={styles.conversion}>
          <span className={styles.convFrom}>{formatAmount(amount)} {unit}</span>
          <span className={styles.convArrow}>→</span>
          <span className={styles.convTo}>{formatAmount(amount * opt.ratio)} {subUnit}</span>
          <span className={styles.convRatio}>×{opt.ratio.toString()}</span>
        </div>
      ) : opt.ratioNote ? (
        <div className={styles.conversion}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{opt.ratioNote}</span>
        </div>
      ) : null}

      {/* 적합 용도 */}
      {opt.useFor.length > 0 && (
        <div className={styles.useForRow}>
          {opt.useFor.map((u, i) => <span key={i} className={styles.useForChip}>{u}</span>)}
        </div>
      )}

      {/* 메타 */}
      <div className={styles.optionMeta}>
        <div className={styles.optionMetaRow}>
          <span className={styles.optionMetaIcon}>🌟</span>
          <span className={styles.optionMetaText}><strong>맛:</strong> {opt.taste}</span>
        </div>
        <div className={styles.optionMetaRow}>
          <span className={styles.optionMetaIcon}>🥄</span>
          <span className={styles.optionMetaText}><strong>질감:</strong> {opt.texture}</span>
        </div>
      </div>

      {/* 주의 */}
      {opt.warning && (
        <div className={styles.warningBox}>
          <span>⚠️</span>
          <span><strong>주의:</strong> {opt.warning}</span>
        </div>
      )}

      {/* 추가 재료 */}
      {opt.combinedWith && (
        <div className={styles.combinedBox}>
          <span>💡</span>
          <span><strong>함께 필요:</strong> {opt.combinedWith}</span>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────
// 탭 2 — 카테고리 둘러보기
// ──────────────────────────────────────
function BrowseTab({ onDetail }: { onDetail: (key: string) => void }) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    fat: true, dairy: false, sweet: false, protein: false, flour: false,
    acid: false, season: false, herb: false, plant: false,
  }))

  function toggle(g: string) {
    setOpenGroups(prev => ({ ...prev, [g]: !prev[g] }))
  }

  return (
    <div className={styles.wrap}>
      {GROUPS.map(g => {
        const items = Object.entries(SUBSTITUTE_DATA).filter(([, d]) => d.group === g.id)
        if (items.length === 0) return null
        const isOpen = openGroups[g.id]
        return (
          <div key={g.id} className={styles.browseSection}>
            <button className={styles.browseHeader} onClick={() => toggle(g.id)}>
              <span className={styles.browseHeaderEmoji}>{g.emoji}</span>
              <span>{g.label}</span>
              <span className={styles.browseCount}>({items.length}종)</span>
              <span className={`${styles.browseHeaderArrow} ${isOpen ? styles.browseHeaderArrowOpen : ''}`}>▼</span>
            </button>
            {isOpen && (
              <div className={styles.browseBody}>
                {items.map(([key, d]) => (
                  <div key={key} className={styles.browseItem}>
                    <div className={styles.browseItemHeader}>
                      <span className={styles.browseItemEmoji}>{d.emoji}</span>
                      <span className={styles.browseItemName}>{d.original}</span>
                      <button className={styles.browseItemDetailLink} onClick={() => onDetail(key)}>
                        자세히 →
                      </button>
                    </div>
                    <div className={styles.browseOptions}>
                      {[...d.options]
                        .sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade])
                        .slice(0, 4)
                        .map((opt, i) => {
                          const gradeMeta = GRADE_INFO[opt.grade]
                          return (
                            <div key={i} className={styles.browseOption}>
                              <span className={`${styles.browseOptionDot} ${gradeMeta.dotClass}`} />
                              <span className={styles.browseOptionName}>{opt.name}</span>
                              <span className={styles.browseOptionRatio}>×{opt.ratio}</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
