import CharCountClient from './CharCountClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/charcount',
  title: '글자수 세기 — 공백 포함·제외 실시간 카운트',
  description: '텍스트 글자수를 실시간으로 세어드립니다. 공백 포함·제외, 단어수, 줄수, 바이트 수 확인. SNS 글자수 제한 비교 지원.',
  keywords: ['글자수세기', '글자수계산기', '자수세기', '단어수세기', '글자수확인', '바이트계산'],
})

export default function CharCountPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔡 글자수 세기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        텍스트를 입력하면 글자수, 단어수, 줄수를 실시간으로 계산합니다.
      </p>

      <CharCountClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>SNS·플랫폼별 글자수 제한</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>플랫폼</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>글자수 제한</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['X (트위터)', '280자', '한글은 2자로 계산 (실질 140자)'],
                  ['인스타그램 피드', '2,200자', '해시태그 포함'],
                  ['인스타그램 스토리', '2,200자', ''],
                  ['카카오톡 메시지', '10,000자', ''],
                  ['네이버 블로그 제목', '100자', ''],
                  ['유튜브 제목', '100자', '검색 최적화는 70자 이내 권장'],
                  ['유튜브 설명', '5,000자', '처음 150자가 검색 결과에 표시'],
                  ['문자 메시지 (SMS)', '90바이트', '한글 45자 / 영문 90자'],
                ].map(([platform, limit, note], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{platform}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{limit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>바이트 계산이 중요한 이유</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            문자 메시지(SMS)는 글자수가 아닌 바이트로 제한됩니다. 한글 1자는 UTF-8 기준 3바이트, EUC-KR 기준 2바이트입니다. 영문과 숫자는 1바이트입니다. 90바이트 제한인 SMS에는 한글 약 45자 또는 영문 90자를 담을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}