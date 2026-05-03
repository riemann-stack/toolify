import CategoryView, { type ComingSoonItem } from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu',
  title: '교육·학습 도구 — 과학·수학·언어 학습 시각화',
  description: '학생 과제·교사 수업·일반 호기심을 위한 무료 교육 도구 모음. 과학 시각화, 화학·물리 계산기, 학습 시뮬레이션을 제공합니다.',
  keywords: ['교육도구', '학습계산기', '과학시각화', '학생과제', '교사수업', '과학실험'],
})

const COMING_SOON: ComingSoonItem[] = [
  { icon: '🌟', name: '빛의 속도 체감 시각화',  desc: '빛이 달·태양·별까지 가는 시간 비교' },
  { icon: '🧪', name: '화학 농도 계산기',       desc: 'mol·M·% 농도·희석 계산' },
  { icon: '🧬', name: 'pH 계산기',              desc: '산·염기·완충용액 pH 계산' },
  { icon: '🔭', name: '진자 시뮬레이션',        desc: '단진자 주기·중력 가속도 실험' },
  { icon: '🧮', name: '수학 함수 그래프',       desc: '이차함수·삼각함수 시각화' },
  { icon: '🌍', name: '판구조 시뮬레이션',      desc: '대륙 이동·지진 시각화' },
]

export default function EduCategoryPage() {
  return (
    <CategoryView
      catId="edu"
      description="과학·수학·언어 학습을 돕는 시각화 도구와 계산기 모음. 학생 과제·교사 수업·일반 호기심을 위한 무료 도구."
      comingSoon={COMING_SOON}
    />
  )
}
