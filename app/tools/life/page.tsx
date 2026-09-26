import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life',
  title: "생활·재미 계산기 — 더치페이·로또·랜덤 추첨",
  description: "더치페이 정산, 로또 번호 생성, 사다리 타기, 여행 예산, 해외직구 관세까지 일상과 모임에서 바로 쓰는 무료 생활 도구 모음.",
})

export default function LifeCategoryPage() {
  return (
    <CategoryView
      catId="life"
      description="모임 정산과 경조사, 여행·직구 준비, 살림처럼 일상의 작은 결정을 돕는 도구입니다. 추첨·운세 도구는 재미로만 쓰세요."
    />
  )
}
