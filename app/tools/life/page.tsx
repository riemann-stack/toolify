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
      description="로또·랜덤·사다리타기·더치페이부터 페르미·드레이크 추정까지 — 일상 의사결정과 재미를 위한 실용 도구 모음."
    />
  )
}
