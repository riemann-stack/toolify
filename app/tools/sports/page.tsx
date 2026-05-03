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
      description="러닝·골프·격투기·야구·축구·웨이트까지 — 종목별 수치 분석과 훈련 계획을 한 곳에서. 한국 대회 일정·VDOT·1RM·핸디캡 자동 계산."
    />
  )
}
