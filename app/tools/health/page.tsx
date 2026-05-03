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
      description="BMI·기초대사량·체중 감량·임신 주수·반려동물 칼로리·자외선까지 — 일상 건강 관리에 자주 쓰는 무료 계산기 모음."
    />
  )
}
