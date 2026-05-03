import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'music')!

export const metadata = buildMetadata({
  path: '/tools/music',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function MusicCategoryPage() {
  return (
    <CategoryView
      catId="music"
      description="BPM·딜레이·주파수·음정·코드·기타 카포까지 — 작·편곡과 연주, 보컬 연습에 바로 쓰는 무료 음악 도구."
    />
  )
}
