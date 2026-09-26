import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance',
  title: "금융·재테크 계산기 — 연봉·대출·연말정산·부동산",
  description: "연봉 실수령액부터 대출 상환, 연말정산 환급, 전세↔월세 전환, 주식 수익률까지 돈 계산을 한곳에서. 2026년 세율·4대보험 요율을 반영한 무료 금융 계산기 모음.",
})

export default function FinanceCategoryPage() {
  return (
    <CategoryView
      catId="finance"
      description="월급·세금·대출·투자까지, 돈에 관한 결정을 어림짐작이 아니라 숫자로 점검하는 계산기입니다. 2026년 세율과 4대보험 요율을 반영했습니다."
    />
  )
}
