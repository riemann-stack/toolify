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
      description="BMI부터 카페인·수면 부채까지 — 매일 챙기는 건강 지표를 정확한 숫자로 시각화."
    />
  )
}
