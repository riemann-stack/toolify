import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu',
  title: '교육·학습 도구 — 내신·학점 환산·유효숫자·복습 간격',
  description: '내신 5등급·학점(GPA) 환산, 복습 간격, 유효숫자·과학 단위, 옴의 법칙 회로처럼 공부와 수업에 쓰는 무료 교육 도구 모음입니다.',
})

export default function EduCategoryPage() {
  return (
    <CategoryView
      catId="edu"
      description="내신·학점 환산, 복습 간격, 실험 데이터의 유효숫자처럼 공부와 수업에 쓰는 도구입니다."
    />
  )
}
