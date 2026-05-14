import Link from 'next/link'
import GoldConverterClient from './GoldConverterClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/finance/gold-converter',
  title: '금 단위·가격 계산기 — 돈·g·트로이온스 변환 + 순도 환산 + 시세',
  description:
    '한국 금 거래 종합 도구 — 돈·g·트로이온스·푼·냥 9단위 동시 변환, 14K/18K/22K/24K 순도 환산, 24K 시세 입력 시 매수·매도 실거래가 자동(부가세·스프레드·수수료·세공비), KRX 금현물 vs 골드바 vs 금통장 비교, 자산 가치 합산기, 코리아 프리미엄 계산.',
  keywords: [
    '금 단위 변환', '돈 g 변환', '한돈 g', '한냥 g', '1돈 그램',
    '트로이온스 변환', '트로이온스 g', 'oz t 변환',
    '14K 순도', '18K 순도', '24K 순도', 'K 함량', 'K 환산', '순금 환산',
    '금 시세 계산', '골드바 가격', '1돈 가격', '금 1g 가격',
    'KRX 금현물', 'KRX 금현물 부가세', '금통장', '금통장 양도세',
    '한국조폐공사 골드바', '한국금거래소', '은행 골드바',
    '돌반지 무게', '돌반지 한돈', '결혼반지 g', '세배돈 무게',
    '코리아 프리미엄', '국제 금시세', '금 부가세',
    '푼 돈 냥', '한국 무게 단위', '냥 그램',
    '금 매수 매도', '금 스프레드', '귀금속 세공비',
    '금 단위 환산', '금 가격 계산기',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '-0.01em',
}
const faqQuestion: React.CSSProperties = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '8px',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}

export default function GoldConverterPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪙 금 단위·가격 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        한국 금 거래의 모든 변수 — 돈·g·트로이온스·푼·냥 9단위 동시 변환, 14K~24K 순도 환산, 24K 시세 입력 시 부가세·스프레드·수수료를 반영한 매수/매도 실거래가, KRX 금현물·골드바·금통장 부가세·양도세 비교, 자산 합산까지 한 번에.
      </p>

      <GoldConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 한국 무게 단위 */}
        <section>
          <h2 style={sectionTitle}>한국 무게 단위 변환표</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            한국 금 거래는 전통적으로 <strong style={{ color: 'var(--text)' }}>돈</strong>을 사용합니다. 1돈 = 3.75g이며, 1냥 = 10돈 = 37.5g, 1푼 = 0.1돈 = 0.375g입니다. 국제 거래는 트로이온스(oz t = 31.1035g)가 기준.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단위', '환산 (g)', '환산 (돈)', '용도'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['푼 (分)',          '0.375g',     '0.1돈',    '미세 무게·세배돈'],
                  ['돈 (錢)',          '3.75g',      '1돈',     '한국 거래 표준 (돌반지·골드바)'],
                  ['냥 (兩)',          '37.5g',      '10돈',    '대량 골드바·전통 표기'],
                  ['그램 (g)',         '1g',         '0.267돈', 'SI 단위·정밀 거래'],
                  ['킬로그램 (kg)',    '1,000g',     '266.67돈', '대량 골드바·투자'],
                  ['트로이온스 (oz t)','31.1035g',   '8.294돈', '국제 금 거래 표준'],
                  ['펜니웨이트 (dwt)', '1.5552g',    '0.415돈', '미국 귀금속'],
                  ['그레인 (gn)',      '0.0648g',    '0.017돈', '극미세 무게'],
                  ['일반 온스 (oz)',   '28.35g',     '7.560돈', '⚠️ 금에는 사용 X (혼동 주의)'],
                ].map(([unit, g, don, use], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Noto Sans KR, sans-serif' }}>{unit}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{g}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{don}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. K 순도 표 */}
        <section>
          <h2 style={sectionTitle}>금 순도 (Karat) 가이드</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            24K는 순금(99.9%) — 부드럽고 투자·기념품용. 18K/14K는 합금이며 단단하고 색상 다양 — 일상 보석류에 적합. K 숫자는 24분의 X로 순금 비율을 나타냅니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Karat', '순도 (%)', '표기', '특징·용도'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['24K',  '99.9%', '999.9 / 999', '순금 — 골드바·돌반지·투자용. 부드러워 일상 착용 X'],
                  ['22K',  '91.7%', '917',          '동남아 결혼반지·문화권 표준. 단단함과 색상의 균형'],
                  ['21K',  '87.5%', '875',          '중동 보석. 짙은 황금색'],
                  ['18K',  '75.0%', '750',          '한국 결혼반지·고급 보석 표준. 색상 풍부 (옐로/화이트/로즈)'],
                  ['14K',  '58.3%', '585',          '미국 표준·일상 보석. 단단·저알러지'],
                  ['10K',  '41.7%', '417',          '저가 보석·체인. 변색 가능성 ↑'],
                ].map(([k, ratio, mark, note], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#FFD700', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{k}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{ratio}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{mark}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. KRX 비교표 */}
        <section>
          <h2 style={sectionTitle}>KRX 금현물 vs 골드바 vs 금통장</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', 'KRX 금현물', '골드바', '금통장'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['부가세',          '면제 ✓',          '10% 부담 ✗',     '면제 ✓ (실물 인출 시 10%)'],
                  ['양도소득세',      '비과세 ✓',         '비과세 ✓',       '15.4% 부과 ✗'],
                  ['매수-매도 스프레드','0.3~0.5% (낮음)', '7~10% (높음)',  '1~2% (중간)'],
                  ['최소 거래 단위',   '1g',             '1g~1돈',        '0.01g'],
                  ['보관 형태',       '디지털',          '실물',           '디지털'],
                  ['환매·매도',       '즉시 (장중)',     '매장 방문',      '영업일 매도'],
                  ['수수료',         '0.3% 내외',       '매장별 1~3%',    '은행별 1~2%'],
                  ['실물 전환',       '가능 (수수료)',    '이미 실물',      '가능 (부가세 10%)'],
                  ['추천 용도',       '단기·중기 투자',   '선물·증여·실물', '소액 적립'],
                ].map(([item, krx, bar, bank], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{item}</td>
                    <td style={{ padding: '10px 12px', color: '#3EFF9B' }}>{krx}</td>
                    <td style={{ padding: '10px 12px', color: '#FFD700' }}>{bar}</td>
                    <td style={{ padding: '10px 12px', color: '#3EC8FF' }}>{bank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '12px', fontSize: '12px' }}>
            ※ 2026년 기준. KRX 금현물은 한국거래소 KRX 금시장 (증권사 계좌 필요). 금통장은 KB·신한·우리·하나 등 은행 상품. 실물 인출·환매 시 추가 비용 발생.
          </p>
        </section>

        {/* 4. 골드바 종류 */}
        <section>
          <h2 style={sectionTitle}>한국 인기 골드바 종류</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 2 }}>
            <li><strong style={{ color: 'var(--text)' }}>한국조폐공사 (KOMSCO)</strong> — 정부기관. 신뢰도 최고. 1g · 3.75g (1돈) · 10g · 한냥 · 100g · 1kg</li>
            <li><strong style={{ color: 'var(--text)' }}>한국금거래소</strong> — 다양한 무게·디자인. 카드 매수·온라인 주문 가능</li>
            <li><strong style={{ color: 'var(--text)' }}>은행 골드바</strong> — KB·신한·우리·하나. 영업점 픽업·증정용 케이스</li>
            <li><strong style={{ color: 'var(--text)' }}>대형 귀금속 매장</strong> — 종로·남대문 도매. 가격 협상 가능 / 신뢰도 매장별 차이</li>
            <li><strong style={{ color: 'var(--text)' }}>해외 브랜드</strong> — PAMP·Heraeus·Royal Canadian Mint (직구 시 통관·부가세·환차손 별도)</li>
          </ul>
        </section>

        {/* 5. 거래 비용 구조 */}
        <section>
          <h2 style={sectionTitle}>골드바 거래 비용 구조</h2>
          <p style={faqAnswer}>
            골드바는 매수 시점에 부가세 10% + 매장 수수료 1~3% + (보석류) 세공비를 부담하고, 매도 시에는 매장이 시세보다 5~10% 낮은 매수가로 사들이며 수수료를 또 차감합니다. <strong style={{ color: 'var(--text)' }}>매수-매도 즉시 실현하면 약 15~20% 손실</strong>이 발생합니다.
          </p>
          <p style={{ ...faqAnswer, marginTop: '12px' }}>
            장기 보유로 시세 상승분이 이 손실을 넘어서야 수익. <strong style={{ color: 'var(--text)' }}>단기 거래 의도라면 KRX 금현물</strong> (부가세 면제 + 스프레드 0.3% 내외)이 압도적으로 유리합니다. 골드바는 <em style={{ color: 'var(--text)', fontStyle: 'normal' }}>실물 보유·선물·증여</em> 목적에만 적합합니다.
          </p>
        </section>

        {/* 6. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '1돈은 정확히 몇 그램인가요?',
                a: '<strong>1돈 = 3.75g</strong>입니다. 한국 금 거래의 표준 단위로, 돌반지·골드바·돈치레 등 거의 모든 거래에 사용됩니다.<br/><br/>관련 단위 — 1푼 = 0.375g (1/10돈), 1냥 = 37.5g (10돈). 1kg = 266.67돈, 1트로이온스(oz t) = 31.1g ≈ 8.294돈.',
              },
              {
                q: '트로이온스(oz t)와 일반 온스(oz)는 같나요?',
                a: '<strong>아닙니다. 헷갈리지 마세요!</strong><br/>• <strong>트로이온스 (oz t) = 31.1035g</strong> — 귀금속 전용 단위. 국제 금 거래 표준.<br/>• <strong>일반 온스 (avoirdupois oz) = 28.3495g</strong> — 식료품 등 일반 용도. 금에는 사용하지 않음.<br/><br/>국제 시세는 항상 트로이온스 기준 (예: $3,300/oz t). 일반 온스로 환산하면 가격이 다르게 보이니 주의.',
              },
              {
                q: '18K 반지를 녹이면 순금이 얼마나 나오나요?',
                a: '18K = 75.0% 순금이므로 <strong>18K 10g → 순금 7.5g</strong> (24K 환산). 14K 10g → 순금 5.83g, 22K 10g → 순금 9.17g.<br/><br/>실제 매도 시 매장이 순금 환산 후 다시 스프레드(5~10%)와 정련 수수료(1~3%)를 차감하므로 18K 10g을 매도하면 순금 7.5g 시세의 87~92% 정도 받습니다. 본 도구의 [가격 계산] 탭에서 자동 시뮬 가능합니다.',
              },
              {
                q: '골드바 살 때 정말 부가세 10%를 내나요?',
                a: '네. <strong>개인이 골드바를 매수할 때 부가세 10%가 부과</strong>됩니다. 시세 1g = 14만원이면 매수 가격은 약 15.4만원 + 매장 수수료.<br/><br/><strong>매도 시 부가세는 환급되지 않습니다.</strong> 즉, 매수 시 낸 부가세는 회수 불가. 따라서 시세가 부가세+스프레드를 상쇄할 만큼 상승해야 손익분기 — 단기 매매에 큰 함정.<br/><br/>예외 — <strong>KRX 금현물·금통장은 부가세 면제</strong> (단, 금통장 실물 인출 시 10% 추가 부과).',
              },
              {
                q: 'KRX 금현물이 가장 유리한 이유?',
                a: '3가지 이유:<br/>• <strong>부가세 면제</strong> — 매수 시 10% 절약<br/>• <strong>양도소득세 비과세</strong> — 시세 차익에 세금 없음<br/>• <strong>매수-매도 스프레드 0.3~0.5%</strong> — 골드바(7~10%) 대비 압도적<br/><br/>단점 — 실물 보유가 아닌 디지털 등록. 실물 전환 시 한국거래소 → 한국조폐공사 출고 절차 + 수수료. 증권사 계좌가 필요 (NH·키움·삼성·미래에셋 등 대부분 지원).',
              },
              {
                q: '금통장은 정말 양도세 15.4%를 내나요?',
                a: '네. <strong>금통장(KB·신한·우리·하나)의 매매차익은 배당소득으로 분류되어 15.4%(원천징수)</strong>가 부과됩니다. 또한 매도 차익이 2,000만원 초과 시 종합과세 합산.<br/><br/>예 — 1,000만원 투자 → 1,500만원 매도 → 차익 500만원 × 15.4% = 약 77만원 세금. 결국 423만원 수령. 같은 시세 차이를 KRX 금현물로 거래하면 비과세 — 500만원 그대로 수령.<br/><br/>금통장의 장점은 0.01g 단위 적립 가능 (소액 투자), 은행 직접 가입. 단점은 양도세 + 스프레드 1~2% + 실물 인출 시 부가세 10%.',
              },
              {
                q: '매수-매도 스프레드가 뭐고 왜 7~10%나 되나요?',
                a: '<strong>스프레드 = 매장이 사는 가격(매수가)과 파는 가격(매도가)의 차이</strong>. 매장의 마진과 위험 비용입니다.<br/><br/>예 — 시세 1g = 14만원이면 매장은 14.5만원에 판매(매도가)하고 13만원에 매입(매수가). 차이 1.5만원 = 약 10% 스프레드.<br/><br/>스프레드가 큰 이유 — 실물 골드바 보관·정련·재가공·시세 변동 대비 마진 확보 + 매장 운영비 + 부가세 마진. KRX 금현물은 디지털·중앙거래소라 0.3~0.5%로 압도적으로 낮습니다.',
              },
              {
                q: '코리아 프리미엄이란?',
                a: '<strong>한국 금 시세가 국제 시세보다 비싼 비율</strong>. 환율을 적용해 한국 1g 시세를 트로이온스(oz t)로 환산한 뒤 국제 시세(USD/oz)와 비교합니다.<br/><br/>정상 범위는 ±5%. 한국이 +5% 초과로 비싸면 「프리미엄」, -5% 미만으로 싸면 「디스카운트」라 부릅니다. 보통 환율 변동·국내 수급·세금 차이로 발생. 한국은 부가세 10%로 인해 골드바 가격 자체가 국제 시세 대비 +10% 베이스에서 시작.<br/><br/>본 도구의 [가격 계산] 탭에서 한국 시세 + USD/KRW 환율 + 국제 시세를 입력하면 자동 계산. 프리미엄이 너무 높을 때(7%+)는 매수 자제, 낮을 때(-3%)는 매수 기회로 활용.',
              },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/vat',       icon: '🧾', name: '부가세 계산기',          desc: '부가세 역산·견적서' },
              { href: '/tools/finance/compound',  icon: '📈', name: '복리 계산기',            desc: '금 vs 예금·주식 장기 수익' },
              { href: '/tools/finance/stock',     icon: '📉', name: '주식 물타기 계산기',     desc: '평단가·추가 매수 시뮬' },
              { href: '/tools/finance/savings',   icon: '💰', name: '월 저축 가능 금액 계산기', desc: '금 적립 시뮬·예산 분배' },
              { href: '/tools/unit/converter',    icon: '📐', name: '단위 변환기',            desc: '길이·부피·온도 등 일반 단위' },
              { href: '/tools/finance/loan',      icon: '🏦', name: '대출 이자 계산기',       desc: '원리금·총 이자 시뮬' },
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
        </section>

      </div>
    </div>
  )
}
