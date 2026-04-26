import ColorClient from './ColorClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/color',
  title: '색상 코드 변환기 — HEX RGB HSL 변환',
  description: 'HEX, RGB, HSL 색상 코드를 즉시 변환합니다. 컬러 피커로 색상 선택, 클립보드 복사 지원. 웹 개발·디자인 필수 도구.',
  keywords: ['색상코드변환기', 'hex rgb변환', 'rgb hsl변환', '컬러코드변환', '색상변환기', 'hex변환'],
})

export default function ColorPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎨 색상 코드 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        HEX, RGB, HSL 색상 코드를 즉시 변환하고 복사합니다.
      </p>

      <ColorClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>색상 코드 형식 비교</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['형식', '예시', '범위', '주요 사용처'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['HEX', '#FF6B00', '00~FF (16진수)', 'HTML, CSS, 디자인 툴'],
                  ['RGB', 'rgb(255, 107, 0)', '0~255 (정수)', 'CSS, 이미지 편집'],
                  ['HSL', 'hsl(25, 100%, 50%)', 'H:0~360, S/L:0~100%', 'CSS, 색상 설계'],
                  ['RGBA', 'rgba(255,107,0,0.5)', 'RGB + 투명도(0~1)', 'CSS 투명 레이어'],
                ].map(([fmt, ex, range, use], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>{fmt}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'monospace' }}>{ex}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{range}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'HEX, RGB, HSL 중 어느 것을 사용해야 하나요?', a: 'HEX는 디자이너와 개발자 모두에게 가장 친숙한 형식으로 HTML/CSS에서 널리 사용됩니다. RGB는 이미지 편집이나 프로그래밍에서 직관적입니다. HSL은 색상(Hue), 채도(Saturation), 명도(Lightness)로 구성되어 색상을 조절할 때 가장 직관적입니다.' },
              { q: 'HEX 코드 3자리와 6자리의 차이는?', a: '#RGB 형식(3자리)은 #RRGGBB 형식(6자리)의 축약형입니다. #F60은 #FF6600과 동일합니다. 각 자리의 두 값이 동일한 경우에만 축약이 가능합니다.' },
              { q: '투명도(알파)가 포함된 색상은?', a: '투명도가 포함된 형식은 RGBA(rgba(255,107,0,0.5))와 HEXA(#FF6B0080) 형식이 있습니다. 본 변환기는 불투명 색상(알파=1.0) 기준으로 변환합니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 변환기', desc: '이미지를 Base64로 인코딩' },
              { href: '/tools/dev/json',   icon: '📋', name: 'JSON 포맷터',   desc: 'CSS 설정 JSON으로 관리' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}