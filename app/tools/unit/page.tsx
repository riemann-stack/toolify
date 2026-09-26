import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/unit',
  title: "단위 변환기 모음 — 평수·사이즈·연비·경도",
  description: "평↔제곱미터, 의류·신발 사이즈, 연비, 타이어 공기압, 방사선량까지 여러 분야 단위를 정확하게 바꾸는 무료 변환기 모음. 한국 전통 도량형도 지원합니다.",
})

export default function UnitCategoryPage() {
  return (
    <CategoryView
      catId="unit"
      description="평수·옷 사이즈·연비·타이어 공기압처럼 자주 헷갈리는 단위를 표준 환산 계수로 바꿉니다."
    />
  )
}
