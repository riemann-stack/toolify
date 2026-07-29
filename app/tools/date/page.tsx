import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date',
  title: "날짜·시간 계산기 — 만 나이·D-Day·전역일·시차",
  description: "만 나이, 디데이, 전역일, 음력↔양력 변환, 시차 적응, 티켓팅용 실시간 서버 시간까지 날짜와 시간에 관한 계산을 무료로 제공합니다.",
})

export default function DateCategoryPage() {
  return (
    <CategoryView
      catId="date"
      description="만 나이·D-day부터 음력·시차·연호까지 — 시간과 날짜에 관한 모든 계산."
    />
  )
}
