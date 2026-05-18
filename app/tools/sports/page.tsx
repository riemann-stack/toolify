import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'sports')!

export const metadata = buildMetadata({
  path: '/tools/sports',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function SportsCategoryPage() {
  return (
    <CategoryView
      catId="sports"
      description="러닝·골프·축구·웨이트 — VDOT·1RM·WHS 핸디캡까지 한국 대회 기준으로 정확하게."
    />
  )
}
