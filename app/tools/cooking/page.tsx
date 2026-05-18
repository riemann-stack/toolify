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
      description="인분 환산부터 김장·해동·제빵 타임라인까지 — 주방의 모든 계산을 한 곳에서."
    />
  )
}
