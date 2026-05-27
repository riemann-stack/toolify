import Link from 'next/link'
import VatClient from './VatClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/vat',
  title: '부가세 계산기 2026 — 역산·견적서·실입금·세금계산서·일반 간이 비교 | Youtil',
  description: '공급가·세액·합계 자유 역산으로 견적서·세금계산서 그대로. 프리랜서·사업자용 부가세 + 일반 vs 간이과세·실입금 역산까지.',
  keywords: [
    '부가세계산기', 'vat계산기', '부가가치세계산기', '공급가액역산',
    '간이과세계산기', '부가세역산', '프리랜서부가세', '실입금역산',
    '세금계산서계산', '부가세별도', '부가세포함', '크몽수수료부가세',
    '일반과세간이과세비교', '한국부가세', '견적서계산기', '공급대가역산',
  ],
})

const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
)

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '0' }}>
    {children}
  </h2>
)

const FAQ_LD = [
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
              {
                q: '"100만원 부가세 포함"과 "100만원 부가세 별도" 어느 게 더 받는 건가요?',
                a: '부가세 별도가 본인 실수입이 더 많은 계약입니다. 부가세 별도: 100만 + 부가세 10만 = 110만 청구, 본인 실수입 100만. 부가세 포함: 100만 청구 (그 안에 부가세 9만 909원 포함), 실수입 90만 9,091원. 같은 100만 계약이라도 부가세 별도가 약 9만원 더 받습니다. 프리랜서·사업자는 협상 시 "부가세 별도" 명시 필수.',
              },
              {
                q: '실입금 100만원 받으려면 청구를 얼마 해야 하나요?',
                a: '본 도구의 "실입금 역산" 탭에서 사업자 유형·플랫폼별로 자동 계산. 사업자 (직거래, 부가세 별도): 110만, 사업자 (크몽 20%): 약 137.5만, 사업자 (네이버페이 2.5%): 약 112.8만, 프리랜서 (직거래): 약 103.4만, 프리랜서 + 크몽: 약 129.2만. ⚠️ 부가세는 본인 돈이 아닙니다 — 별도 계좌에 보관 후 신고·납부 권장.',
              },
              {
                q: '일반과세자 vs 간이과세자 어느 게 유리한가요?',
                a: '본 도구의 "일반 vs 간이" 탭에서 자동 추천. 일반적으로 매입이 많은 (40%+) B2B는 일반과세 (매입세액 공제 큼), 매입이 적은 B2C는 간이과세 (실효세율 1.5~4%)가 유리합니다. 매출 1억 400만 초과 시 간이 자격 없음. 거래처가 세금계산서를 요구하면 일반과세 권장. 2024년 한도 상향(8천 → 1억 400만)으로 소규모 사업자에게 간이가 더 유리해진 환경입니다.',
              },
              {
                q: '사업자 등록 안 한 프리랜서도 부가세 신고하나요?',
                a: '사업자 등록 X = 부가세 신고 의무 X. 대신 3.3% 원천세(소득세 3% + 지방세 0.3%)가 적용되며, 발주처가 차감 후 입금합니다. 종합소득세 신고 시 정산. 사업자 등록을 고려해야 할 시점: 연 매출 4,800만 이상 (간이 시작), 거래처가 세금계산서 요구, 매입세액 공제 받고 싶을 때, 사업 규모 확장. 사업자 등록 후 부가세 신고 의무 발생.',
              },
              {
                q: '견적서 작성 시 부가세 표시는 어떻게 하나요?',
                a: '권장 형식 (사업자): "공급가액 1,000,000원 / 부가세(10%) 100,000원 / 합계금액 1,100,000원" 또는 "공급가액 1,000,000원 (부가세 별도)". "100만원 부가세 포함" 표기는 모호하므로 가능한 한 "부가세 별도" + 명확한 분리 표시 권장. 본 도구의 "견적서" 탭에서 자동 생성·복사 가능.',
              },
              {
                q: '본 계산기는 세무 신고에 사용해도 되나요?',
                a: '아닙니다. 본 도구는 일반 정보 제공 목적의 참고용 시뮬레이션이며, 세무 자문·신고 도구가 아닙니다. 정확한 부가세 신고는 홈택스(hometax.go.kr) 또는 세무사를 통해 진행하세요. 업종별 세부 규정(의제매입세액·면세 등)이 다양하고 정책이 변경될 수 있으므로 본 도구 결과는 일반 케이스 가정입니다. 문의: 국세청 126 / 한국세무사회 무료 상담 070-5008-1234.',
              },
            ]

export default function VatPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧾 부가세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        공급가·세액·합계 자유 역산. 견적서·세금계산서 그대로 쓰는 <strong style={{ color: 'var(--text)' }}>사업자·프리랜서 도구</strong>.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 부가가치세법 기준" sources={[{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"홈택스","href":"https://hometax.go.kr"}]} />

      <VatClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 역산 공식 (기존 SEO 보존) ── */}
        <Section>
          <H2>역산 공식 — 합계에서 공급가액 구하기</H2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            영수증이나 청구서에 찍힌 <strong style={{ color: 'var(--text)' }}>합계 금액(공급대가)</strong>에서
            공급가액과 부가세를 각각 구해야 할 때 역산 공식을 사용합니다.
            계산기 상단의 <strong style={{ color: 'var(--accent)' }}>「부가세 역산」</strong> 모드를 선택하면 자동으로 계산됩니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
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
                부가세 = 110,000 − 100,000 = <strong style={{ color: '#EA580C' }}>10,000원</strong>
              </p>
            </div>
          </div>
        </Section>

        {/* ── 2. 과세 유형 비교표 (기존 SEO 보존) ── */}
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
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0891B2', marginBottom: '10px' }}>간이과세자 업종별 부가가치율 (2026년 기준)</p>
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
                      <td style={{ padding: '6px 10px', textAlign: 'center', color: '#0891B2', fontWeight: 700 }}>{rate}</td>
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

        {/* ── 3. 계산 예시 (기존 SEO 보존) ── */}
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
                tagColor: '#0891B2',
                title: '자영업자 B씨 — 영수증 합계에서 공급가액 파악',
                content: '매입 세금계산서 합계가 330,000원일 때 역산하면: 공급가액 = 330,000 ÷ 1.1 = 300,000원, 부가세 = 30,000원. 이 매입 부가세 30,000원은 매입세액으로 공제받을 수 있습니다.',
              },
              {
                tag: '천 원 절사',
                tagColor: '#EA580C',
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

        {/* ── 4. 실입금 역산 — 프리랜서·사업자 가이드 (NEW) ── */}
        <Section>
          <H2>💰 실입금 역산 — 프리랜서·사업자 가이드</H2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            「실제로 100만원 받으려면 얼마 청구해야 하나요?」 — 본 도구의 「실입금 역산」 탭에서
            사업자 유형·플랫폼 수수료를 반영해 청구액을 자동 계산합니다.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>실입금 100만원 받으려면</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontWeight: 700 }}>청구액</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['프리랜서 (직거래, 3.3%)',           '약 103.4만',   '원천세만 차감'],
                  ['프리랜서 + 네이버페이 (2.5%)',       '약 106.0만',   '원천세 + 결제 수수료'],
                  ['프리랜서 + 크몽 (20%)',             '약 129.2만',   '큰 수수료 + 원천세'],
                  ['사업자 (직거래, 부가세 별도)',       '110만',        '가장 명료'],
                  ['사업자 + 네이버페이 (부가세 별도)',  '약 112.8만',   '결제 수수료 + 부가세'],
                  ['사업자 + 크몽 (부가세 별도)',        '약 137.5만',   '큰 수수료 + 부가세'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ background: 'rgba(8,145,178,0.04)', border: '1px solid rgba(8,145,178,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#0891B2', fontWeight: 700, marginBottom: 6 }}>3.3% 원천세</p>
              <ul style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li>프리랜서 (사업자 등록 X) 적용</li>
                <li>발주처가 차감 후 입금</li>
                <li>소득세 3% + 지방소득세 0.3%</li>
                <li>종합소득세 신고 시 정산</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(234,88,12,0.04)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 700, marginBottom: 6 }}>10% 부가세</p>
              <ul style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li>사업자 등록자 적용</li>
                <li><strong>본인 돈이 아닙니다</strong> — 신고·납부 의무</li>
                <li>발주처가 별도 지급 또는 포함 청구</li>
                <li>분기별·반기별 신고</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ⚠️ 두 세금은 완전히 다른 세금이며, 사업자가 받는 부가세는 별도 계좌에 보관 후 신고·납부 권장.
          </p>
        </Section>

        {/* ── 5. 부가세 별도 vs 포함 (NEW) ── */}
        <Section>
          <H2>📝 부가세 별도 vs 포함 — 계약 시 주의</H2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            같은 「100만원 계약」이라도 「부가세 별도」와 「부가세 포함」은 본인 실수입이 약 9만원 차이납니다.
            프리랜서·사업자는 협상 시 「부가세 별도」 명시를 권장합니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.40)', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>✅ 부가세 별도 (권장)</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 6 }}>
                &ldquo;100만원 부가세 별도&rdquo; → 110만원 청구
              </p>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
                공급가액 <strong>1,000,000원</strong> + 부가세 100,000원 = 청구 1,100,000원<br />
                <strong style={{ color: 'var(--accent)' }}>본인 실수입: 1,000,000원</strong>
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(220,38,38,0.30)', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, marginBottom: 8 }}>⚠️ 부가세 포함</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 6 }}>
                &ldquo;100만원 부가세 포함&rdquo; → 100만원 청구
              </p>
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
                공급가액 <strong>909,091원</strong> + 부가세 90,909원 = 청구 1,000,000원<br />
                <strong style={{ color: '#DC2626' }}>본인 실수입: 909,091원 (-9만원)</strong>
              </p>
            </div>
          </div>
        </Section>

        {/* ── 6. 일반 vs 간이 — 결정 가이드 (NEW) ── */}
        <Section>
          <H2>⚖️ 일반과세 vs 간이과세 — 어떻게 결정?</H2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 도구의 「일반 vs 간이」 탭에서 자동 추천이 가능합니다. 일반적인 결정 가이드:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>상황</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#9333EA', fontWeight: 700 }}>추천</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['연 매출 1억 400만 초과',           '일반과세 (자격 X)'],
                  ['매입 많음 (40%+) + B2B 거래',      '일반과세 (매입세액 공제 큼)'],
                  ['매입 적음 (~20%) + B2C 위주',      '간이과세 (실효세율 1.5~4%)'],
                  ['거래처가 세금계산서 요구',         '일반과세'],
                  ['신고 단순화 우선 (소규모)',        '간이과세 (연 1회 신고)'],
                  ['음식점업·소매업·서비스업 등',      '간이과세 (실효 2~4%)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: '#9333EA', fontWeight: 700 }}>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 2024년부터 간이과세 한도가 8천만 → 1억 400만으로 상향되어 소규모 사업자에게 간이가 더 유리해진 환경.
            정확한 결정은 본인 업종 코드·예상 매입 비중·거래 형태에 따라 다르며, 세무사 상담 권장.
          </p>
        </Section>

        {/* ── 7. 세금계산서 발급 가이드 (NEW) ── */}
        <Section>
          <H2>📄 세금계산서 발급 가이드</H2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            세금계산서는 사업자 간 거래의 법적 증빙 서류입니다. 사업자 유형에 따라 발급 의무가 다릅니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>사업자 유형</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>발급 의무</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#EA580C', fontWeight: 700 }}>발급 방법</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['일반과세자',         '발급 의무 (모든 거래)',           '홈택스 e세로 (전자세금계산서)'],
                  ['간이과세자 (4,800만↑)', '발급 의무',                       '홈택스 e세로'],
                  ['간이과세자 (4,800만↓)', '영수증 원칙, 거래처 요청 시 가능', '홈택스 또는 종이'],
                  ['면세사업자',         '계산서 발급 (부가세 X)',          '홈택스 계산서 메뉴'],
                  ['프리랜서 (사업자 X)', '발급 X (3.3% 원천세)',            '용역계약서·인보이스로 대체'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: '#EA580C' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 본 도구의 「세금계산서」 탭은 입력 참고용 출력만 제공하며, 법적 효력은 홈택스 e세로 발행본만 인정됩니다.
          </p>
        </Section>

        {/* ── 8. 부가세 신고·납부 시기 (NEW) ── */}
        <Section>
          <H2>📅 부가세 신고·납부 시기</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.20)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>일반과세자 (연 2회)</p>
              <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>1월 1~25일</strong>: 전년 7~12월분 신고</li>
                <li><strong style={{ color: 'var(--text)' }}>7월 1~25일</strong>: 1~6월분 신고</li>
                <li>납부 기한 = 신고 기한 (25일까지)</li>
                <li>예정고지 (4월·10월): 통상 직전 분기의 1/2 납부</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(155,89,182,0.20)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#9333EA', fontWeight: 700, marginBottom: 8 }}>간이과세자 (연 1회)</p>
              <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>1월 1~25일</strong>: 전년 1~12월분 신고</li>
                <li>납부 기한 = 1월 25일</li>
                <li>예정고지 X (간이과세는 연 1회)</li>
                <li>매출 4,800만 미만은 납부 면제</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ※ 신규 사업자는 사업 개시일이 속하는 과세 기간부터 신고 의무 발생. 신고 지연 시 가산세 부과.
            홈택스(hometax.go.kr) 또는 손택스 앱에서 전자 신고 가능.
          </p>
        </Section>

        {/* ── 9. FAQ (accordion - salary style) ── */}
        <Section>
          <H2>자주 묻는 질문 (FAQ)</H2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </Section>

        {/* ── 10. 면책 ── */}
        <Section>
          <div style={{ background: 'rgba(8,145,178,0.04)', border: '1px solid rgba(8,145,178,0.30)', borderRadius: 12, padding: '18px 20px' }}>
            <p style={{ fontSize: 13, color: '#0891B2', fontWeight: 700, marginBottom: 10 }}>ⓘ 면책 조항</p>
            <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85, marginBottom: 8 }}>
              본 부가세 계산기는 <strong style={{ color: 'var(--text)' }}>일반 정보 제공 목적의 참고용 도구</strong>이며, 세무 자문·신고 도구가 아닙니다.
            </p>
            <ul style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 18, marginBottom: 12 }}>
              <li>정확한 부가세 신고는 홈택스 또는 세무사 권장</li>
              <li>업종별 세부 규정 (의제매입세액·면세 등) 다양</li>
              <li>정책 변경 가능 — 본 도구는 2026년 1월 기준</li>
              <li>본 도구의 결과는 일반 케이스 가정이며 실제와 차이 가능</li>
            </ul>
            <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85, marginBottom: 6 }}>
              세무 도움 필요 시:
            </p>
            <ul style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 18 }}>
              <li>한국 국세청: <strong style={{ color: '#0891B2' }}>126</strong></li>
              <li>한국세무사회 무료 상담: <strong style={{ color: '#0891B2' }}>070-5008-1234</strong></li>
              <li>홈택스: <strong style={{ color: '#0891B2' }}>hometax.go.kr</strong></li>
              <li>본인 거주 지역 세무서 직접 문의</li>
            </ul>
          </div>
        </Section>

        {/* ── 11. 함께 쓰면 좋은 도구 ── */}
        <Section>
          <H2>함께 쓰면 좋은 도구</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '사업소득과 근로소득 세후 비교' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '절세한 금액으로 장기 투자 시뮬레이션' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '사업 운영자금 대출 이자 계산' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '사업 잉여금 투자 시 평단 관리' },
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
