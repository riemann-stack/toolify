import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu',
  title: '교육·학습 도구 — 과학·수학·언어 학습 시각화',
  description: '학생 과제·교사 수업·일반 호기심을 위한 무료 교육 도구 모음. 과학 시각화, 화학·물리 계산기, 학습 시뮬레이션을 제공합니다.',
  keywords: ['교육도구', '학습계산기', '과학시각화', '학생과제', '교사수업', '과학실험'],
})

export default function EduCategoryPage() {
  return (
    <CategoryView
      catId="edu"
      description="우주·물리·인지·기억·페르미 추정까지 — 학습을 시각으로 이해하는 인터랙티브 도구."
    />
  )
}
