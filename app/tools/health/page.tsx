import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'health')!

export const metadata = buildMetadata({
  path: '/tools/health',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function HealthCategoryPage() {
  return (
    <CategoryView
      catId="health"
      description="BMI부터 카페인·수면 부채까지 — 매일 챙기는 건강 지표를 정확한 숫자로 시각화."
    />
  )
}
