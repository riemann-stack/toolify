import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking',
  title: "요리·식품 계산기 — 레시피 비율·베이킹·해동·커피",
  description: "인분만 바꾸면 재료가 비례 계산되는 레시피 변환부터 베이커 퍼센트, 해동 시간, 김장 비용, 커피 추출까지 주방에서 바로 쓰는 무료 도구 모음.",
})

export default function CookingCategoryPage() {
  return (
    <CategoryView
      catId="cooking"
      description="인분 환산부터 김장·해동·제빵 타임라인까지 — 주방의 모든 계산을 한 곳에서."
    />
  )
}
