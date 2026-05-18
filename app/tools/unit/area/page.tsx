import Link from 'next/link'
import AreaClient from './AreaClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/unit/area',
  title: '평수 변환기 — 아파트 평형·전용·공급면적·평형별 방 가이드',
  description:
    '아파트 평형·전용·공급·계약면적 환산 + 평형별 방 크기 가이드로 부동산·인테리어 면적 감 잡기.',
  keywords: [
    '평수계산기', '평수변환', '제곱미터변환', '㎡평수', '아파트평수',
    '평수㎡변환', '전용면적', '공급면적', '계약면적',
    '84제곱미터 평수', '34평 몇제곱미터', '국민평형',
  ],
})

export default function AreaPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏠 평수 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        아파트 평형·전용·공급·계약면적 환산 + <strong style={{ color: 'var(--text)' }}>평형별 방 크기</strong> 가이드.
      </p>

      <AreaClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 평수 공식 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>평수 계산 공식</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(176,62,255,0.20)', borderRadius: 14, padding: '20px 22px', textAlign: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: '#C485E0', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>평수 환산 공식</p>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              1 평 = 400/121 ㎡ ≈ <strong style={{ color: '#C485E0' }}>3.305785 ㎡</strong>
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              평 → ㎡: 평수 × 3.3058 / ㎡ → 평: 면적 ÷ 3.3058
            </p>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85 }}>
            1평은 정확히 6자×6자 = 36 제곱자입니다. 일반적으로 3.3㎡로 어림하지만 정확히는 약 3.3058㎡로 약간 큽니다.
            <strong style={{ color: 'var(--text)' }}> 한국 부동산에서 가장 흔한 환산 — 84㎡ ≈ 25.4평 (분양 34평) / 59㎡ ≈ 17.85평 (분양 24평).</strong>
          </p>
        </section>

        {/* 84㎡ vs 34평 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>왜 전용 84㎡를 34평이라 부를까?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            한국 아파트는 <strong style={{ color: 'var(--text)' }}>전용면적과 분양면적(공급면적)을 다르게 표기</strong>하기 때문입니다.
            전용 84㎡는 평수로 약 25.4평이지만, 여기에 주거공용면적(계단·복도·엘리베이터 약 26㎡)을 더한 분양면적이 약 110㎡(33~34평)이 됩니다.
            그래서 광고에서는 &lsquo;34평형&rsquo;으로 부릅니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              📌 <strong style={{ color: 'var(--text)' }}>예시 — 전용 84㎡ 아파트</strong><br />
              · 전용면적: 84㎡ ≈ 25.4평 (실제 사용 공간)<br />
              · 주거공용: ≈ 26㎡ ≈ 7.9평 (계단·복도·엘리베이터)<br />
              · <strong style={{ color: '#C485E0' }}>분양면적(공급면적): ≈ 110㎡ ≈ 33~34평</strong> (광고 표기)<br />
              · 계약면적: ≈ 160㎡ ≈ 48평 (지하주차장 포함, 분양가 산정 기준)
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '84㎡는 왜 34평이라고 부르나요?',
                a: '한국 아파트는 분양 시 <strong>공급면적(전용 + 주거공용)</strong>을 평수로 표기합니다. 전용 84㎡는 25.4평이지만 주거공용(계단·복도·엘리베이터) 약 26㎡(7.9평)를 더한 공급면적이 약 110㎡(33~34평)이어서 &lsquo;34평형&rsquo;이라 부릅니다. 비슷하게 전용 59㎡ → 24평형, 전용 102㎡ → 40평형입니다.',
              },
              {
                q: '전용면적과 공급면적 어느 게 진짜 우리집 크기인가요?',
                a: '<strong>실제 거주 공간은 전용면적</strong>입니다. 거실·방·주방·화장실·발코니가 포함되며, 등기부등본에도 전용면적이 기재됩니다. <strong>공급면적은 분양·매매 시 평수 표기 기준</strong>이며 실제 사용 공간보다 약 30% 큽니다. 부동산 검색·비교 시 단위(전용 vs 공급)를 꼭 확인하세요.',
              },
              {
                q: '발코니 확장 시 면적이 늘어나나요?',
                a: '법적 면적은 변하지 않습니다. <strong>발코니는 원래 전용면적에 포함</strong>되며, 확장은 발코니 부분의 새시·바닥을 제거해 거실·방과 통합하는 것입니다. 등기부 면적은 그대로지만 <strong>실사용 공간이 약 5~10㎡ 늘어나는 효과</strong>가 있어 시장에서 선호됩니다.',
              },
              {
                q: '등기부등본 면적과 분양 평수가 다른 이유는?',
                a: '등기부등본은 <strong>전용면적</strong>을 기재합니다 (실제 거주 공간). 분양 평수는 <strong>공급면적</strong>(전용 + 주거공용) 또는 <strong>계약면적</strong>(공급 + 기타공용)으로 표기되어 더 큽니다. 같은 아파트도 등기부 25.4평이 분양 광고에서는 34평으로 표기될 수 있습니다.',
              },
              {
                q: '평수로 부동산 가격 비교 시 주의점은?',
                a: '<strong>같은 기준(공급면적)으로 비교</strong>해야 합니다. 부동산 사이트(네이버부동산·직방·다방)는 보통 공급면적 평수로 표시합니다. 단, 빌라·오피스텔은 전용면적 표기가 많고, 같은 84㎡ 아파트도 발코니 확장 여부·주거공용 비율(복도식 vs 계단식)에 따라 실사용 면적 차이가 있어 단순 평수 비교만으로는 부족합니다.',
              },
              {
                q: '평형별 적정 가구 수는?',
                a: '한국 부동산 통상 기준 — 11~14평(원룸·1인) / 17평(59㎡, 1~2인) / 24평(84㎡, 3~4인 표준) / 30평(102㎡, 4인 여유) / 40평+(135㎡, 4~5인 대가족). 1인당 약 5~7평이 쾌적한 기준이며, 한국 표준은 4인 가족 25~34평입니다.',
              },
              {
                q: '평(坪)은 일본식 단위인가요?',
                a: '평(坪)은 동아시아 공통 단위입니다. 한국·일본·중국 모두 사용했지만 정의가 약간 다릅니다 — <strong>한국·일본 1평 ≈ 3.306㎡</strong>(6자×6자), 중국 1평(亩, 묘)은 약 666㎡로 완전히 다릅니다. 한국에서는 일제강점기를 거치며 일본식 정의(약 3.306㎡)가 표준화되었고 현재까지 유지되고 있습니다. 2007년부터 법정계량단위는 ㎡로 일원화되었지만 부동산 관행은 여전히 평수를 함께 씁니다.',
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

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/converter',     icon: '📐', name: '단위 변환기',     desc: '9개 카테고리 + 한국 전통 단위' },
              { href: '/tools/finance/loan',       icon: '💳', name: '대출이자 계산기',       desc: '주택담보·전세자금 대출' },
              { href: '/tools/finance/salary',     icon: '💴', name: '연봉 실수령액 계산기', desc: '월 실수령으로 평수 결정' },
              { href: '/tools/finance/compound',   icon: '📈', name: '복리 계산기',           desc: '청약·전세금 적립 계산' },
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
