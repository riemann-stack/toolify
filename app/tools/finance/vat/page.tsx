import type { Metadata } from 'next'
import Link from 'next/link'
import VatClient from './VatClient'

export const metadata: Metadata = {
  title: '부가세 계산기 2026 — 공급가액·역산·간이과세 | Youtil',
  description: '공급가액에 부가세(VAT) 추가, 합계에서 공급가액 역산, 간이과세·면세·프리랜서 3.3% 안내. 원/천 단위 절사 옵션 지원.',
  keywords: ['부가세계산기', 'vat계산기', '부가가치세계산기', '공급가액역산', '간이과세계산기', '부가세역산', '프리랜서부가세'],
}

const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
)

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '0' }}>
    {children}
  </h2>
)

export default function VatPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧾 부가세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        공급가액과 부가세를 빠르게 계산합니다. 합계에서 역산, 원·천 단위 절사도 지원합니다.
      </p>

      <VatClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 역산 공식 ── */}
        <Section>
          <H2>역산 공식 — 합계에서 공급가액 구하기</H2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            영수증이나 청구서에 찍힌 <strong style={{ color: 'var(--text)' }}>합계 금액(공급대가)</strong>에서
            공급가액과 부가세를 각각 구해야 할 때 역산 공식을 사용합니다.
            계산기 상단의 <strong style={{ color: 'var(--accent)' }}>「부가세 역산」</strong> 모드를 선택하면 자동으로 계산됩니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>역산 공식 (부가세율 10% 기준)</p>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2.2 }}>
                <p>공급가액 = 공급대가(합계) ÷ <strong style={{ color: 'var(--accent)' }}>1.1</strong></p>
                <p>부가세 &nbsp;&nbsp;= 공급대가(합계) − 공급가액</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 영수증 합계 110,000원 →
                공급가액 = 110,000 ÷ 1.1 = <strong style={{ color: 'var(--accent)' }}>100,000원</strong>,
                부가세 = 110,000 − 100,000 = <strong style={{ color: '#FF8C3E' }}>10,000원</strong>
              </p>
            </div>
          </div>
        </Section>

        {/* ── 2. 과세 유형 비교표 (간이과세 포함) ── */}
        <Section>
          <H2>2026년 부가세 과세 유형 비교</H2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            사업자 유형에 따라 부가세 신고 방식과 세율이 다릅니다.
            2024년부터 간이과세 기준 금액이 연 매출 <strong style={{ color: 'var(--text)' }}>1억 400만 원</strong>으로 상향되었습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '일반과세자', '간이과세자', '면세사업자'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: h === '구분' ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['기준 매출',    '연 1억 400만 원 이상', '연 1억 400만 원 미만', '매출 무관'],
                  ['부가세율',     '10%',                  '업종별 1.5~4%',        '0% (면세)'],
                  ['세금계산서',   '발급 의무',             '발급 가능 (선택)',      '계산서 발급'],
                  ['신고 횟수',    '연 2회 (1월·7월)',     '연 1회 (1월)',          '해당 없음'],
                  ['매입세액공제', '가능',                  '부분 가능',            '불가'],
                  ['대상 예시',    '대부분 사업자',         '소규모 자영업·식당',   '병원·학원 등'],
                ].map(([label, a, b, c], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{b}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 간이과세 업종별 부가율 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#3EC8FF', marginBottom: '10px' }}>간이과세자 업종별 부가가치율 (2026년 기준)</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>업종</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>부가가치율</th>
                    <th style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>실효 세율</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['소매업·재생용 재료수집업', '15%', '1.5%'],
                    ['제조업·농업·숙박업',       '20%', '2.0%'],
                    ['음식점업',                 '25%', '2.5%'],
                    ['건설업·부동산임대업',      '30%', '3.0%'],
                    ['서비스업·금융보험업',      '40%', '4.0%'],
                  ].map(([biz, rate, eff], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--muted)' }}>{biz}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'center', color: '#3EC8FF', fontWeight: 700 }}>{rate}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text)' }}>{eff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
              ※ 실효 세율 = 부가세율(10%) × 부가가치율. 간이과세자는 부가가치율이 적용된 낮은 세율로 납부합니다.
            </p>
          </div>
        </Section>

        {/* ── 3. 계산 예시 ── */}
        <Section>
          <H2>계산 예시 시나리오</H2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                tag: '부가세 추가',
                tagColor: 'var(--accent)',
                title: '프리랜서 디자이너 A씨 — 용역비 200만 원 청구',
                content: '부가세 사업자 등록을 한 A씨가 클라이언트에게 200만 원 용역비를 청구할 때: 공급가액 2,000,000원 + 부가세 200,000원 = 세금계산서 합계 2,200,000원. 부가세 200,000원은 다음 분기에 신고·납부합니다.',
              },
              {
                tag: '부가세 역산',
                tagColor: '#3EC8FF',
                title: '자영업자 B씨 — 영수증 합계에서 공급가액 파악',
                content: '매입 세금계산서 합계가 330,000원일 때 역산하면: 공급가액 = 330,000 ÷ 1.1 = 300,000원, 부가세 = 30,000원. 이 매입 부가세 30,000원은 매입세액으로 공제받을 수 있습니다.',
              },
              {
                tag: '천 원 절사',
                tagColor: '#FF8C3E',
                title: '세금계산서 발행 시 부가세 절사',
                content: '공급가액 1,543,000원의 부가세는 154,300원이지만, 세금계산서 관행상 천 원 단위로 절사해 154,000원으로 발행하는 경우가 많습니다. 절사 옵션을 활용해 정확한 발행 금액을 미리 확인하세요.',
              },
            ].map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', background: `${ex.tagColor}18`, border: `1px solid ${ex.tagColor}50`, color: ex.tagColor, borderRadius: '99px', padding: '2px 10px' }}>{ex.tag}</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{ex.title}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{ex.content}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4. FAQ ── */}
        <Section>
          <H2>자주 묻는 질문 (FAQ)</H2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '3.3% 프리랜서는 부가세 신고 의무가 있나요?',
                a: '사업자 등록을 하지 않은 프리랜서(인적용역 제공자)는 부가세 신고 의무가 없습니다. 프리랜서 소득에 대해서는 원천징수 3.3%(소득세 3% + 지방소득세 0.3%)가 적용될 뿐이며, 부가가치세와는 완전히 별개입니다. 다만 사업자 등록 후 매출이 발생하면 부가세 신고 의무가 생기므로, 사업 규모에 따라 등록 여부를 판단하세요.',
              },
              {
                q: '부가세 신고는 언제 해야 하나요?',
                a: '일반과세자는 연 2회(1월 25일: 전년 7~12월분, 7월 25일: 1~6월분) 신고·납부합니다. 간이과세자는 연 1회(1월 25일) 신고합니다. 신규 사업자는 사업 개시일이 속하는 과세 기간부터 신고 의무가 발생합니다.',
              },
              {
                q: '부가세 절사(버림)는 왜 하나요?',
                a: '세금계산서 발행 실무에서는 부가세를 원 단위 이하 또는 10원·100원·1,000원 단위로 절사하는 관행이 있습니다. 국세청도 원 미만 금액을 버림 처리하도록 규정하고 있습니다. 거래처와 협의해 적용 단위를 정하는 것이 일반적입니다.',
              },
              {
                q: '공급가액과 공급대가의 차이는?',
                a: '공급가액은 부가세를 제외한 순수 재화·용역 금액이고, 공급대가(합계금액)는 공급가액에 부가세를 더한 금액입니다. 세금계산서에는 공급가액과 부가세, 합계 금액이 모두 표기됩니다. 영수증에 표시된 금액은 대부분 부가세가 포함된 공급대가입니다.',
              },
              {
                q: '간이과세자는 세금계산서를 발급할 수 없나요?',
                a: '2021년 7월부터 간이과세자도 연 매출 4,800만 원 이상이면 세금계산서 발급이 의무화되었습니다. 4,800만 원 미만 간이과세자는 영수증 발급이 원칙이지만 거래처 요청 시 세금계산서 발급이 가능합니다. 단, 이 경우 일반과세자와 동일하게 10% 부가세를 징수해야 합니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <Section>
          <H2>함께 쓰면 좋은 도구</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '사업소득과 근로소득 세후 비교' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '절세한 금액으로 장기 투자 시뮬레이션' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '사업 운영자금 대출 이자 계산' },
              { href: '/tools/dev/charcount',    icon: '🔡', name: '글자수 세기',          desc: '세금계산서·공문서 작성 시 활용' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}