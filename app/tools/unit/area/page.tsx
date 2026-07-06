import Link from 'next/link'
import AreaClient from './AreaClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

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

const FAQ_LD = [
              {
                q: '84㎡는 왜 34평이라고 부르나요?',
                a: '한국 아파트는 분양 시 <strong>공급면적(전용 + 주거공용)</strong>을 평수로 표기합니다. 전용 84㎡는 25.4평이지만 주거공용(계단·복도·엘리베이터) 약 26㎡(7.9평)를 더한 공급면적이 약 110㎡(33~34평)이어서 &lsquo;34평형&rsquo;이라 부릅니다. 비슷하게 전용 59㎡ → 24평형, 전용 102㎡ → 40평형입니다.',
              },
              {
                q: '전용면적과 공급면적 어느 게 진짜 우리집 크기인가요?',
                a: '<strong>실제 거주 공간은 전용면적</strong>입니다. 거실·방·주방·화장실이 포함되며(발코니는 전용면적 밖의 서비스면적), 등기부등본에도 전용면적이 기재됩니다. <strong>공급면적은 분양·매매 시 평수 표기 기준</strong>이며 실제 사용 공간보다 약 30% 큽니다. 부동산 검색·비교 시 단위(전용 vs 공급)를 꼭 확인하세요.',
              },
              {
                q: '발코니 확장 시 면적이 늘어나나요?',
                a: '법적 면적은 변하지 않습니다. <strong>발코니는 전용면적에 들어가지 않는 서비스면적</strong>이며(건축법 시행령상 폭 1.5m까지 바닥면적 산정 제외), 확장은 발코니 부분의 새시·바닥을 제거해 거실·방과 통합하는 것입니다. 등기부 면적은 그대로지만 <strong>실사용 공간이 약 5~10㎡ 늘어나는 효과</strong>가 있어 시장에서 선호됩니다.',
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
            ]

const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}

export default function AreaPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="unit" />평수 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        아파트 평형·전용·공급·계약면적 환산 + <strong style={{ color: 'var(--text)' }}>평형별 방 크기</strong> 가이드.
      </p>

      <AreaClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 평수 공식 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>평수 계산 공식</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(176,62,255,0.20)', borderRadius: 14, padding: '20px 22px', textAlign: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: '#9333EA', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>평수 환산 공식</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              1 평 = 400/121 ㎡ ≈ <strong style={{ color: '#9333EA' }}>3.305785 ㎡</strong>
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

        {/* 국민평형 조견표 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>국민평형 조견표 — 전용면적 ↔ 분양 평형</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            아파트 분양 평형은 <strong style={{ color: 'var(--text)' }}>공급면적(전용 + 주거공용)</strong> 기준입니다.
            전용 84㎡는 환산하면 25.4평이지만 계단·복도·엘리베이터 같은 주거공용면적(약 26㎡)을 더한 공급면적이 약 110㎡가 되어
            &lsquo;34평형&rsquo;으로 불립니다. 실무에서 자주 마주치는 전용면적 5종의 대응 관계입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>전용면적</th>
                  <th scope="col" style={headCell}>전용 환산 평수</th>
                  <th scope="col" style={headCell}>통상 분양 평형</th>
                  <th scope="col" style={headCell}>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>59㎡</strong></td><td style={cell}>약 17.8평</td><td style={cell}>24~25평형</td><td style={cell}>2~3인 가구 표준 — &lsquo;새 국민평형&rsquo;으로 불릴 만큼 선호 상승</td></tr>
                <tr><td style={cell}><strong>74㎡</strong></td><td style={cell}>약 22.4평</td><td style={cell}>30평형</td><td style={cell}>59와 84 사이 틈새 평면</td></tr>
                <tr><td style={{ ...cell, color: '#9333EA', fontWeight: 700 }}><strong>84㎡</strong></td><td style={cell}>약 25.4평</td><td style={cell}>33~34평형</td><td style={cell}>&lsquo;국민평형&rsquo; — 국민주택 규모(전용 85㎡ 이하)를 꽉 채우는 평면</td></tr>
                <tr><td style={cell}><strong>101㎡</strong></td><td style={cell}>약 30.6평</td><td style={cell}>40평형</td><td style={cell}>전용 85㎡ 초과 중대형 — 청약·세제 기준이 달라짐</td></tr>
                <tr><td style={cell}><strong>114㎡</strong></td><td style={cell}>약 34.5평</td><td style={cell}>43~46평형</td><td style={cell}>대형 — 단지 전용률에 따라 표기 편차가 가장 큼</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: 12, marginBottom: 12 }}>
            ※ 같은 전용 84㎡라도 단지마다 주거공용면적이 달라 공급면적이 108~113㎡ 안팎으로 벌어지고,
            표기도 33평형·34평형으로 갈립니다. 정확한 값은 해당 단지 입주자모집공고의 타입별 면적표가 기준입니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85 }}>
            기준선인 <strong style={{ color: 'var(--text)' }}>&lsquo;전용 85㎡ 이하(국민주택 규모)&rsquo;</strong>는
            1973년 1인당 적정 주거면적을 5평으로 보고 국민주택을 25평(약 82.6㎡)으로 정한 데서 출발했습니다.
            지금도 청약 제도와 각종 세제의 경계선으로 쓰이며, 전용 84㎡가 &lsquo;국민평형&rsquo;이 된 것도 이 상한을 꽉 채우는 최대 평면이기 때문입니다.
          </p>
        </section>

        {/* 전용률 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>전용률 — 같은 &lsquo;25평형&rsquo;인데 실평수가 다른 이유</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            전용률은 분양면적에서 전용면적이 차지하는 비율입니다. <strong style={{ color: 'var(--text)' }}>아파트는 평균 80% 안팎이지만 오피스텔은 50% 수준</strong>까지 내려갑니다.
            오피스텔은 분양면적을 공급면적이 아닌 <strong style={{ color: 'var(--text)' }}>계약면적(기타공용 포함)</strong> 기준으로 표기하는 관행이라 분모가 크고,
            2014년 12월까지는 벽 두께가 들어가는 중심선치수로 전용면적을 쟀기 때문입니다(아파트는 1998년부터 벽 안쪽만 재는 안목치수 적용).
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              📌 <strong style={{ color: 'var(--text)' }}>같은 &lsquo;25평형&rsquo;(분양면적 약 82.6㎡) 매물 비교</strong><br />
              · 아파트 (전용률 80%): 전용 약 <strong style={{ color: '#9333EA' }}>66㎡</strong><br />
              · 오피스텔 (전용률 50%): 전용 약 <strong style={{ color: '#9333EA' }}>41㎡</strong><br />
              평형 표기가 같아도 실면적이 1.6배 차이 날 수 있습니다 — 비교는 반드시 전용면적(㎡) 기준으로.
            </p>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85 }}>
            같은 아파트끼리도 구조에 따라 갈립니다. <strong style={{ color: 'var(--text)' }}>복도식은 가로로 긴 복도 전체가 주거공용면적</strong>에 들어가
            엘리베이터 홀만 공용인 계단식보다 전용률이 낮습니다. 같은 공급면적의 구축 복도식과 신축 계단식은 실평수가 다를 수 있다는 뜻입니다.
          </p>
        </section>

        {/* 서비스면적 — 84A vs 84B */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>같은 전용 84㎡인데 84A가 더 넓은 이유 — 서비스면적</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            분양 공고의 84A·84B·84C는 전용면적이 똑같이 84㎡인 서로 다른 평면 타입입니다.
            그런데 <strong style={{ color: 'var(--text)' }}>발코니는 전용·공급 어느 면적에도 들어가지 않는 서비스면적</strong>입니다 —
            건축법 시행령(제119조)이 폭 1.5m까지의 발코니를 바닥면적 산정에서 빼주기 때문입니다.
            2005년 발코니 구조변경(확장)이 합법화된 뒤로는 발코니를 방·거실로 터서 쓰는 것이 사실상 표준이 되어,
            서비스면적이 큰 타입일수록 확장 후 실사용 면적이 커집니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85 }}>
            서비스면적은 발코니가 접하는 외벽 길이에 비례하므로 평면 모양의 영향이 큽니다.
            거실과 방들이 한 면에 나란히 붙는 <strong style={{ color: 'var(--text)' }}>4베이 판상형은 발코니 접면이 길어 서비스면적이 대체로 크고, 타워형은 상대적으로 작은 편</strong>입니다.
            같은 전용 84㎡라도 타입에 따라 확장 후 체감 면적이 달라지는 이유입니다.
            계약 전에는 입주자모집공고·분양 카탈로그의 타입별 면적표에서 서비스면적(발코니) 항목을 직접 비교하고, 평면도에서 확장 대상 발코니 표시를 확인하세요.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/converter',     icon: '📐', name: '단위 변환기',     desc: '14개 분야 + 한국 전통 단위' },
              { href: '/tools/finance/loan',       icon: '💳', name: '대출이자 계산기',       desc: '주택담보·전세자금 대출' },
              { href: '/tools/finance/salary',     icon: '💰', name: '연봉 실수령액 계산기', desc: '월 실수령으로 평수 결정' },
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
