import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'date')!

export const metadata = buildMetadata({
  path: '/tools/date',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function DateCategoryPage() {
  return (
    <CategoryView
      catId="date"
      description="만 나이·D-day부터 음력·시차·연호까지 — 시간과 날짜에 관한 모든 계산."
    />
  )
}
