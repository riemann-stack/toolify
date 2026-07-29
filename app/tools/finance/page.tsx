import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance',
  title: "금융·재테크 계산기 — 연봉·대출·연말정산·부동산",
  description: "연봉 실수령액부터 대출 상환, 연말정산 환급, 전세↔월세 전환, 주식 수익률까지 돈 계산을 한곳에서. 2026년 세율·요율 기준 무료 금융 계산기 모음.",
})

export default function FinanceCategoryPage() {
  return (
    <CategoryView
      catId="finance"
      description="월급·대출·세금·투자 — 한국 세제와 2026년 시중 금리를 그대로 반영한 재테크 도구 모음."
    />
  )
}
