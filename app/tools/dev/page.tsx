import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev',
  title: "개발자 도구 — JSON·정규식·Base64·cron",
  description: "JSON 포매터, 정규식 테스터, Base64·URL 인코딩, cron 표현식, JWT 디코더까지 개발 중 자주 찾는 유틸리티를 설치 없이 제공합니다.",
})

export default function DevCategoryPage() {
  return (
    <CategoryView
      catId="dev"
      description="JSON·정규식·해시·cURL부터 회선 진단까지 — 개발자가 매일 찾는 유틸리티 모음."
    />
  )
}
