import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'art')!

export const metadata = buildMetadata({
  path: '/tools/art',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function ArtCategoryPage() {
  return (
    <CategoryView
      catId="art"
      description="음악·디자인·사진·글쓰기 — 크리에이터의 일상 작업을 가볍게 만드는 창작 도구 모음."
    />
  )
}
