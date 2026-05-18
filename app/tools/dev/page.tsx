import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'dev')!

export const metadata = buildMetadata({
  path: '/tools/dev',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function DevCategoryPage() {
  return (
    <CategoryView
      catId="dev"
      description="JSON·정규식·해시·cURL부터 회선 진단까지 — 개발자가 매일 찾는 유틸리티 모음."
    />
  )
}
