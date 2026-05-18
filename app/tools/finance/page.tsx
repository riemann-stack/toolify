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
      description="월급·대출·세금·투자 — 한국 세제와 2026년 시중 금리를 그대로 반영한 재테크 도구 모음."
    />
  )
}
