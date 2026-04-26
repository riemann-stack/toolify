import AgeClient from './AgeClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/age',
  title: '만 나이 계산기 2026 — 법 개정 기준 만 나이',
  description: '2023년 6월 시행된 만 나이 통일법 기준으로 만 나이를 즉시 계산합니다. 세는 나이·연 나이 비교, 다음 생일까지 D-day 제공.',
  keywords: ['만나이계산기', '만나이계산', '나이계산기', '만나이통일법', '세는나이', '만나이변환'],
})

export default function AgePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎂 만 나이 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        생년월일을 입력하면 현재 기준 만 나이를 즉시 계산합니다.
      </p>

      <AgeClient />

      {/* SEO 콘텐츠 */}
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>만 나이 vs 세는 나이 vs 연 나이 비교</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국에서는 전통적으로 3가지 나이 계산법이 혼용되어 왔습니다. 2023년 6월 28일 만 나이 통일법 시행 이후 공식적인 나이는 <strong style={{ color: 'var(--text)' }}>만 나이</strong>로 통일되었습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>만 나이</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>세는 나이</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>연 나이</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['계산 방법', '생일 기준, 생일 전 1살 적음', '태어나자마자 1세, 1월 1일 +1살', '현재 연도 - 출생 연도'],
                  ['적용 범위', '법령·행정·계약 (2023년~)', '일상 대화, 병역법 일부', '학교 학년 기준 등'],
                  ['예시', '2000년 5월생 → 2026년 4월 = 25세', '2000년생 → 2026년 = 27세', '2026 - 2000 = 26세'],
                  ['특징', '국제 표준, 정확함', '한국 전통 방식', '간단하지만 오차 있음'],
                ].map(([label, man, se, yeon], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{man}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{se}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{yeon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>만 나이 통일법 — 무엇이 달라졌나?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '법 시행일', content: '2023년 6월 28일부터 민법 및 행정기본법 개정으로 법령·계약·공문서에서 나이 표기는 모두 만 나이로 통일되었습니다.' },
              { title: '달라지는 것', content: '의료기관 나이 기준, 보험 계약, 법적 서류 등에서 만 나이를 사용합니다. 예를 들어 65세 기준 의료 혜택은 만 65세 생일이 지난 날부터 적용됩니다.' },
              { title: '달라지지 않는 것', content: '학교 입학(3월 2일 기준 연도), 병역 의무(연 나이 기준), 주민등록상 나이 표기 방식 등 일부 특별법은 기존 방식을 유지합니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '만 나이는 생일이 지나야 한 살이 되나요?',
                a: '맞습니다. 만 나이는 태어난 날을 0세로 시작해 생일이 지날 때마다 1살씩 증가합니다. 생일 전날까지는 이전 나이이고, 생일 당일부터 한 살 더 많아집니다.',
              },
              {
                q: '2000년 1월 1일 생의 2026년 만 나이는 몇 살인가요?',
                a: '2026년 4월 기준으로 이미 생일(1월 1일)이 지났으므로 만 26세입니다. 만약 생일이 아직 안 지났다면 만 25세가 됩니다.',
              },
              {
                q: '병역 의무는 만 나이 기준인가요?',
                a: '병역법은 만 나이 통일법 적용 예외로, 여전히 연 나이(출생 연도 기준)를 사용합니다. 예를 들어 징병 검사는 만 나이가 아닌 해당 연도 기준으로 적용됩니다.',
              },
              {
                q: '외국인의 나이는 어떻게 계산하나요?',
                a: '대부분의 국가는 만 나이를 사용합니다. 한국도 2023년 이후 만 나이로 통일되어 외국인과 동일한 기준을 사용합니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}