import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'life')!

export const metadata = buildMetadata({
  path: '/tools/life',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function LifeCategoryPage() {
  return (
    <CategoryView
      catId="life"
      description="추첨·더치페이·여행 예산·외계 문명까지 — 일상의 선택과 호기심을 위한 실용 도구."
    />
  )
}
