import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'finance')!

export const metadata = buildMetadata({
  path: '/tools/finance',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function FinanceCategoryPage() {
  return (
    <CategoryView
      catId="finance"
      description="연봉·세금·대출·복리·주식·부동산까지 — 일상 재테크 의사결정에 필요한 모든 계산을 한곳에서. 한국 세제와 시중 금리 기준 자동 적용."
    />
  )
}
