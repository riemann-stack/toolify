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
      description="음악(BPM·코드·스케일)·디자인(색상·황금비율)·글쓰기(글자수·더미 텍스트)까지 — 음악인·디자이너·크리에이터·글쓴이를 위한 예술·창작 도구 모음."
    />
  )
}
