import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'cooking')!

export const metadata = buildMetadata({
  path: '/tools/cooking',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function CookingCategoryPage() {
  return (
    <CategoryView
      catId="cooking"
      description="레시피 비율 환산·요리 단위·해동 시간·제빵·베이킹 비율 진단까지 — 가정 요리와 홈베이킹 실전 도구 모음."
    />
  )
}
