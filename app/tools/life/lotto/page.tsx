import type { Metadata } from 'next'
import LottoClient from './LottoClient'

export const metadata: Metadata = {
  title: '로또 번호 생성기 — 무료 자동 추첨 | Toolify',
  description: '로또 6/45 번호를 무료로 자동 생성합니다. 1~5게임 동시 생성, 제외 번호 설정 가능. 로그인 없이 즉시 사용.',
  keywords: ['로또번호생성기', '로또자동', '로또번호추천', '로또6/45'],
}

export default function LottoPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>

      {/* SEO용 헤딩 */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
          생활·재미
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
          🎰 로또 번호 생성기
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7 }}>
          로또 6/45 번호를 무작위로 자동 생성합니다. 최대 5게임까지 한 번에 생성할 수 있어요.
        </p>
      </div>

      {/* 인터랙티브 UI */}
      <LottoClient />

      {/* SEO 설명 콘텐츠 */}
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
          로또 번호 생성기 사용법
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
          생성할 게임 수(1~5게임)를 선택한 후 <strong style={{ color: 'var(--accent)' }}>번호 생성</strong> 버튼을 누르면 1부터 45까지의 숫자 중 6개를 무작위로 추첨합니다.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          로또 6/45는 매주 토요일 오후 8시 35분에 추첨이 진행됩니다. 본 생성기는 순수 난수를 사용하므로 당첨을 보장하지 않습니다.
        </p>
      </div>

    </div>
  )
}