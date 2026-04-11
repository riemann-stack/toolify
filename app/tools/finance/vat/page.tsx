import type { Metadata } from 'next'
import VatClient from './VatClient'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '부가세 계산기 2026 — 공급가액·부가세 역산 | Youtil',
  description: '공급가액에 부가세(VAT) 추가, 부가세 포함 금액에서 역산, 부가세만 계산. 10% 일반과세·면세 모두 지원. 사업자·프리랜서 필수.',
  keywords: ['부가세계산기', 'vat계산기', '부가가치세계산기', '공급가액계산기', '부가세역산', '세금계산기'],
}

export default function VatPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧾 부가세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        공급가액과 부가세를 빠르게 계산합니다. 부가세 포함 금액에서 역산도 가능합니다.
      </p>

      <VatClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 계산 예시 시나리오 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>계산 예시</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                title: '프리랜서 A씨 — 용역비 200만 원 청구',
                content: '공급가액 2,000,000원에 부가세 10%를 더하면 세금계산서 발행 금액은 2,200,000원입니다. 부가세 200,000원은 분기별로 신고·납부해야 합니다.',
                tag: '부가세 추가',
              },
              {
                title: '자영업자 B씨 — 영수증에 찍힌 금액에서 공급가액 파악',
                content: '총액 330,000원짜리 영수증에서 공급가액을 역산하면 300,000원, 부가세는 30,000원입니다. 매입 세액공제 신고 시 이 공급가액을 기준으로 작성합니다.',
                tag: '부가세 제거',
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', background: 'var(--accent-dim)', border: '1px solid rgba(200,255,62,0.3)', color: 'var(--accent)', borderRadius: '99px', padding: '2px 10px' }}>{ex.tag}</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{ex.title}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{ex.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>부가세 기본 개념</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            부가가치세(VAT)는 재화와 용역의 소비에 부과되는 세금입니다. 한국의 일반 부가세율은 <strong style={{ color: 'var(--text)' }}>10%</strong>이며, 공급가액의 10%를 추가로 부담하게 됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>세율</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>대상</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['일반과세', '10%', '대부분의 재화·용역 (음식, 의류, 전자제품 등)'],
                  ['면세', '0%', '기초 식품, 의료용역, 교육 서비스, 금융 서비스 등'],
                  ['영세율', '0%', '수출 재화, 국제 운송, 외화 획득 용역 등'],
                ].map(([type, rate, target], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{target}</td>
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
              { q: '부가세 신고는 언제 해야 하나요?', a: '일반과세자는 1월(1~12월분)과 7월(1~6월분) 연 2회 신고합니다. 간이과세자는 1월에 연 1회 신고합니다. 신규 사업자는 사업 개시일로부터 해당 과세 기간 종료일까지의 매출을 신고합니다.' },
              { q: '공급가액과 공급대가의 차이는?', a: '공급가액은 부가세를 제외한 순수 재화·용역 금액이고, 공급대가(합계액)는 공급가액에 부가세를 더한 금액입니다. 세금계산서에는 두 금액이 모두 표기됩니다.' },
              { q: '간이과세자도 부가세를 내나요?', a: '간이과세자는 업종별로 1.5%~4%의 낮은 세율을 적용받습니다. 연 매출 4,800만 원 미만 간이과세자는 부가세 납부 의무가 면제되지만, 세금계산서 발급 의무는 있을 수 있습니다.' },
              { q: '프리랜서(인적용역)의 부가세는?', a: '인적용역(강의, 컨설팅, 디자인 등 개인이 제공하는 서비스)은 부가세 면세 대상입니다. 그러나 사업자 등록을 한 개인 사업자가 용역을 제공하는 경우 부가세가 부과됩니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 함께 쓰면 좋은 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '세후 월급 계산' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '사업 수익 투자 계획' },
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