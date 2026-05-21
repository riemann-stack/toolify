import { totalTools } from '@/lib/tools'
import AdSlot from '@/components/AdSlot'
import ToolsBrowser from './ToolsBrowser'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools',
  title: `전체 도구 목록 — 무료 계산기·유틸리티 ${totalTools}가지`,
  description: `연봉 계산기, BMI, 로또 번호 생성기, 부가세, 임신 주수 등 ${totalTools}가지 무료 온라인 도구를 한눈에 확인하세요.`,
})

export default function ToolsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px', overflowX: 'hidden' }}>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        전체 도구 목록
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        총 <strong style={{ color: 'var(--accent)' }}>{totalTools}가지</strong> 무료 도구 · 로그인 없이 즉시 사용
      </p>

      <ToolsBrowser />

      {/* 푸터 광고 슬롯 */}
      <div style={{ marginTop: '48px' }}>
        <AdSlot position="footer" minHeight={250} />
      </div>
    </div>
  )
}