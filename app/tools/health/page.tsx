import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/health',
  title: "건강·웰빙 계산기 — BMI·기초대사량·임신 주수",
  description: "BMI와 체지방, 기초대사량과 목표 칼로리, 카페인 반감기, 임신 주수, 수면 부채까지 몸 상태를 숫자로 확인하는 무료 건강 계산기 모음.",
})

export default function HealthCategoryPage() {
  return (
    <CategoryView
      catId="health"
      description="체중·영양, 임신·주기, 카페인·수면처럼 몸 상태를 숫자로 가늠하는 계산기입니다. 결과는 널리 쓰는 공식에 따른 추정이며 진단을 대신하지 않습니다."
    />
  )
}
