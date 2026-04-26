import Link from 'next/link'
import { categories, totalTools } from '@/lib/tools'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/about',
  title: 'Youtil 소개 | 자주 쓰는 계산기와 무료 온라인 도구 모음',
  description: 'Youtil은 연봉 계산기, BMI, 날짜 계산, 텍스트 도구 등 일상과 업무 속 번거로운 계산을 가장 빠르고 정확하게 해결해 드리는 무료 서비스입니다.',
})

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>

      {/* ── 1. 도입부 ── */}
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        About Youtil
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '20px', lineHeight: 1.15 }}>
        복잡한 계산은 Youtil에게,<br />
        <span style={{ color: 'var(--accent)' }}>당신의 시간에 집중하세요.</span>
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
        <strong style={{ color: 'var(--text)' }}>Youtil</strong>은 <strong style={{ color: 'var(--text)' }}>「Your Utility」</strong>의 약자로, 일상과 업무 속에서 마주하는 번거로운 계산들을 가장 빠르고 정확하게 해결해 드리기 위해 탄생했습니다.
      </p>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '48px' }}>
        수많은 정보 속에서 믿을 수 있는 수치를 찾는 수고를 덜어드리는 것이 우리의 목표입니다. 단순한 도구 모음을 넘어, <strong style={{ color: 'var(--text)' }}>정확성과 편의성</strong>을 최우선으로 설계된 유틸리티 서비스입니다.
      </p>

      {/* ── 2. 3가지 약속 ── */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
          Youtil만의 3가지 약속
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              icon: '⚡',
              title: '무설치·무로그인',
              desc: '어떠한 가입 절차나 설치 없이 웹브라우저만 있으면 어디서든 즉시 실행됩니다. 사용자의 개인정보를 요구하지 않아 안전합니다.',
              color: '#C8FF3E',
            },
            {
              icon: '🆓',
              title: '지속 가능한 무료 서비스',
              desc: 'Youtil의 모든 도구는 누구나 제한 없이 무료로 이용할 수 있습니다. 쾌적한 서비스 유지를 위해 최소한의 광고로 운영됩니다.',
              color: '#3EC8FF',
            },
            {
              icon: '🎯',
              title: '데이터의 정확성',
              desc: '최신 법령(만 나이 통일법, 2026년 4대보험 요율 등)과 신뢰할 수 있는 수식을 바탕으로 정밀한 계산 결과를 제공합니다.',
              color: '#FF8C3E',
            },
          ].map((item) => (
            <div key={item.title} style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px 22px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: item.color, marginBottom: '6px', fontFamily: 'Noto Sans KR, sans-serif' }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. 제공 도구 목록 ── */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
          제공 도구 — {totalTools}가지
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '20px' }}>
          금융·건강·생활·단위·날짜·개발자까지, 6개 카테고리에 걸쳐 실생활에 꼭 필요한 도구들을 제공합니다.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/tools/${cat.id}`}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '16px 20px',
                textDecoration: 'none',
                display: 'block',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: cat.color }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: 'auto' }}>
                  {cat.tools.length}개 →
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {cat.tools.map(tool => (
                  <span key={tool.href} style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: '99px',
                    padding: '3px 10px',
                  }}>
                    {tool.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. 기술적 정체성 ── */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
          지속적인 업데이트
        </h2>
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '14px', padding: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            Youtil은 <strong style={{ color: 'var(--text)' }}>2026년 최신 데이터</strong>(국민연금 인상분, 개정 세법, 만 나이 통일법 등)를 지속적으로 반영하고 있습니다.
            단순한 계산기를 넘어, 사용자의 삶에 실질적인 도움이 되는 유틸리티를 꾸준히 추가해 나가고 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { icon: '📅', label: '2026년 기준', desc: '4대보험·세법 최신 반영' },
              { icon: '🔧', label: '지속 개선',   desc: '사용자 피드백 반영' },
              { icon: '📱', label: '모바일 최적화', desc: '어떤 기기에서도 편리하게' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'var(--bg3)',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. 사용자 소통 ── */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          사용자의 목소리로 성장합니다
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
          Youtil은 사용자 여러분의 피드백을 통해 매일 더 똑똑해집니다.
          필요한 도구가 없거나 개선이 필요한 부분이 있다면 언제든 편하게 연락해 주세요.
          작은 의견 하나하나가 더 나은 Youtil을 만드는 원동력이 됩니다.
        </p>
        <a href="mailto:contact@youtil.kr" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--accent)',
          color: '#0D0D0D',
          borderRadius: '12px',
          padding: '14px 24px',
          fontSize: '14px',
          fontWeight: 700,
          textDecoration: 'none',
          fontFamily: 'Noto Sans KR, sans-serif',
          transition: 'opacity 0.15s',
        }}>
          <span>📧</span>
          contact@youtil.kr 이메일 보내기
        </a>
      </section>

      {/* ── 하단 링크 ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', gap: '20px', fontSize: '13px' }}>
        <Link href="/tools"   style={{ color: 'var(--muted)' }}>전체 도구 보기</Link>
        <Link href="/privacy" style={{ color: 'var(--muted)' }}>개인정보처리방침</Link>
        <Link href="/terms"   style={{ color: 'var(--muted)' }}>이용약관</Link>
      </div>

    </div>
  )
}