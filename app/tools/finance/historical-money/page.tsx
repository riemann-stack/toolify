import Link from 'next/link'
import HistoricalMoneyClient from './HistoricalMoneyClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/finance/historical-money',
  title: '한국 화폐가치 환산기 — 圓·환·원 + 1945~2026 구매력 계산',
  description:
    '1960년 50환, 1980년 만원의 현재 가치는? 한국 圓·환·원 화폐사 + 통계청 CPI 기반 구매력 환산. 화폐개혁 환산표와 시대별 짜장면·집값·월급 비교.',
  keywords: [
    '한국 화폐사', '화폐 가치 환산', '구매력 환산', '인플레이션 계산기',
    '환 원 변환', '1953 화폐개혁', '1962 화폐개혁',
    '옛날 돈 가치', '과거 화폐 가치',
    '한국 CPI', '소비자물가지수', '인플레이션',
    '1960년 짜장면', '1970년 월급', '1980년 집값',
    '圓 환 원', '환 원 환산', '한국은행 화폐사',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
              {
                q: '환과 원은 같은 거 아닌가요?',
                a: '아닙니다. <strong>환(圜)은 1953~1962년만 사용</strong>된 별개의 통화 단위입니다. 1962년 6월 화폐개혁으로 <strong>10환 = 1원</strong>으로 절하되며 현재의 원으로 바뀌었어요. 가끔 한자 圓(원)과 圜(환)이 혼동되지만 둘은 다른 글자·다른 통화입니다. 1953년 이전의 옛 圓은 또 다른 단위로, 한국전쟁기 통화입니다.',
              },
              {
                q: '왜 1965년 이전 데이터는 추정치인가요?',
                a: '통계청의 공식 소비자물가지수 시계열은 <strong>1965년부터 시작</strong>합니다. 그 이전(1945~1964)은 한국은행·역사학계의 자료를 기반으로 재구성된 추정치이며, 한국전쟁기와 그 직후의 초인플레이션 시기는 자료 자체가 불완전해 오차가 큽니다. 1965년 이후만 비교하시면 비교적 정확한 결과를 얻을 수 있어요.',
              },
              {
                q: '1960년 짜장면이 250환인데 단순 환산하면 왜 몇천 원밖에 안 되나요?',
                a: '본 도구는 <strong>전체 소비자물가</strong> 기준 환산입니다. 250환(1960)은 화폐개혁 단위로 25원(현재 단위)이고, 누적 물가를 곱하면 현재 가치 약 2,700원 수준이에요. 그런데 실제 짜장면은 약 7,000원이죠 — 외식비가 평균 CPI보다 훨씬 빠르게 올랐기 때문(노동력·임대료·식자재 인플레이션이 외식에 집중). 또한 1960년 짜장면 가격은 자료마다 차이가 큽니다(150~250환 범위). 시대별 가격 비교 카드의 "실질 +X%"는 <strong>실질가격 변동률</strong>을 보여주며, 양수면 CPI보다 더 빠르게 올랐다는 뜻입니다.',
              },
              {
                q: '1950년 월급이 만원(圓)이었는데 지금 얼마예요?',
                a: '1만 圓(1950) = 100환(1953) = 10원(현재 단위). 거기에 1950~2026년 누적 물가를 곱하면 <strong>현재 가치 약 8만 원 수준</strong>이 나옵니다. 그만큼 1950년 명목 화폐의 실질 구매력이 낮았다는 뜻이에요. 1950년은 전쟁 발발 직후 초인플레이션 시기라 추정 오차가 특히 크지만, 1960년대 이후 한국의 실질 임금이 폭발적으로 성장했다는 걸 보여주는 사례입니다.',
              },
              {
                q: '집값은 왜 일반 CPI보다 훨씬 많이 올랐나요?',
                a: 'CPI 바스켓에서 주거 비용은 <strong>월세·전세 환산값</strong>으로 들어가며 실제 매매가의 변동을 그대로 반영하지 않습니다. 한국은 1990년대 이후 자산가격 상승률이 일반 물가 상승률을 크게 앞질러, 평균 CPI로 환산한 1980년 1천만원은 현재 가치로 약 5천만원 수준(본 도구로 확인 가능)이지만 실제 서울 아파트 가격은 같은 기간 100배 이상 올랐어요. 자산 인플레이션과 소비자 인플레이션은 서로 다른 현상입니다.',
              },
              {
                q: '제3차 화폐개혁이 있을까요?',
                a: '주기적으로 논의(특히 "리디노미네이션" 명목, 예: 1000원 → 1원)되지만 한국은행과 정부는 <strong>단기 시행 계획이 없다</strong>고 일관되게 답해왔습니다. 화폐개혁은 시스템 비용이 크고(ATM·계산기·표시 일괄 교체), 인플레이션 기대를 자극할 수 있어 신중하게 접근하는 편이에요. 다만 1원·5원 동전 폐지 등 부분 개혁은 꾸준히 거론됩니다.',
              },
              {
                q: '환은 한자로 어떻게 쓰나요?',
                a: '한자로 <strong>圜(둥글 환)</strong>입니다. 한자 圓(둥글 원)과 모양이 비슷해서 혼동되지만 별개의 글자. 한국 외에 마카오 파타카(MOP)도 圜 표기를 사용한 역사가 있어요. 1953년 발행된 환권 지폐에는 한글 "환"과 한자 "圜"이 함께 표기되어 있었습니다.',
              },
              {
                q: '이 도구로 유언장·세금 계산을 해도 되나요?',
                a: '<strong>안 됩니다.</strong> CPI 기반 추정치이며, 법적 효력이 있는 화폐가치 산정(예: 상속·증여세 시점가액, 손해배상 환산)에는 법원·세무 전문가의 공식 기준을 따라야 합니다. 본 도구는 <strong>역사 학습·콘텐츠 작성·체감 비교</strong> 목적의 참고용이에요.',
              },
            ]

export default function HistoricalMoneyPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="finance" />한국 화폐가치 환산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        圓·환·원 화폐사 + <strong style={{ color: 'var(--text)' }}>1945~2026 구매력 환산</strong>. &ldquo;1960년 짜장면 250환은 지금 얼마?&rdquo;
      </p>

      <UpdatedMeta date="2026년 7월" basis="통계청 KOSIS 소비자물가지수(CPI, 2020=100) 기반 · 1965년 이후 공식 통계, 이전은 추정치 · 2026년 물가 추정(연 +1.8%)" sources={[{"label":"통계청 KOSIS","href":"https://kosis.kr"},{"label":"한국은행 경제통계시스템","href":"https://ecos.bok.or.kr"}]} />

      <HistoricalMoneyClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 한국 화폐사 한눈에 */}
        <section>
          <h2 style={sectionTitle}>한국 화폐사 — 圓·환·원 한눈에</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            대한민국은 광복 이후 두 번의 화폐개혁(1953·1962)을 거치며 통화 단위가 바뀌었습니다. 단순 단위 변환과 구매력 변환을 혼동하지 않는 게 중요해요 — 화폐개혁은 단위 이름만 바꾸는 <strong style={{ color: 'var(--text)' }}>리디노미네이션(redenomination)</strong>이라 그 시점 구매력은 동일하지만, 시간이 흐르면 인플레이션으로 가치가 달라집니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시기', '단위', '환산 누적', '맥락'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1945~1952', '圓 (옛 원)', '1,000 圓 = 1 원(현재)', '광복 후 일본 圓 명목 계승. 한국전쟁기 초인플레이션.'],
                  ['1953.02~1962.05', '환 (Hwan)', '10 환 = 1 원(현재)', '1차 화폐개혁(100圓=1환). 전후 통화 정리 + 강제 저축 효과.'],
                  ['1962.06~현재', '원 (Won)', '기준 단위', '2차 화폐개혁(10환=1원). 박정희 정부, 음성 자금 흡수가 목적.'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. 두 번의 화폐개혁 상세 */}
        <section>
          <h2 style={sectionTitle}>두 번의 화폐개혁 — 무엇이 어떻게 바뀌었나</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                t: '1953년 1차 화폐개혁',
                d: '한국전쟁 중 인플레이션과 위조지폐가 통제 불능 수준이 되자 1953년 2월 15일 단행. <strong>100圓 = 1환</strong>으로 단위 절하하면서 동시에 일정 한도까지만 환전을 허용해 사실상 강제 저축 효과를 노렸습니다. 다만 전쟁 중이라 통화 안정 효과는 제한적.',
                c: '#D97706',
              },
              {
                t: '1962년 2차 화폐개혁',
                d: '5·16 직후 박정희 정부가 1962년 6월 10일 단행. <strong>10환 = 1원</strong>으로 다시 절하. 명목 목표는 음성 자금 흡수와 산업자금 동원이었지만 실제 동원 효과는 적었고 결과적으로 단위 절하 효과만 정착. 이후 60년 넘게 같은 단위 유지.',
                c: '#059669',
              },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${r.c}`, borderRadius: 10, padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: r.c, fontWeight: 700, margin: '0 0 6px' }}>{r.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.85, margin: 0 }} dangerouslySetInnerHTML={{ __html: r.d }} />
              </div>
            ))}
          </div>
        </section>

        {/* 3. CPI 기반 구매력 환산 작동 원리 */}
        <section>
          <h2 style={sectionTitle}>구매력 환산은 어떻게 계산되나</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            본 도구의 환산은 통계청 KOSIS 소비자물가지수(CPI)를 기반으로 합니다. 두 단계로 진행돼요:
          </p>
          <ol style={{ paddingLeft: 20, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
            <li><strong style={{ color: 'var(--text)' }}>단위 통일</strong> — 입력 금액을 화폐개혁 비율로 현재 원(post-1962)에 맞춰 환산. 50환(1960)은 5원으로, 1만 圓(1950)은 10원으로.</li>
            <li><strong style={{ color: 'var(--text)' }}>CPI 비율 곱셈</strong> — <code style={{ color: 'var(--text)' }}>현재가치 = 입력가치 × CPI(현재) / CPI(과거)</code>. 2020=100 기준으로 정규화된 CPI 시계열을 사용.</li>
          </ol>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, marginTop: 12 }}>
            CPI는 식료품·교통·주거·통신·교육 등 약 460개 품목 가중평균이라 <strong style={{ color: 'var(--text)' }}>품목별 체감과 다를 수 있습니다</strong>. 특히 부동산은 CPI 대비 훨씬 가파르게 올랐고, 가전제품·통신비는 CPI보다 덜 올랐어요(또는 하락).
          </p>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 5. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/finance/compound',     icon: '📈', name: '복리 계산기',           desc: '시간이 만드는 자산 시뮬' },
              { href: '/tools/finance/salary',       icon: '💰', name: '연봉 실수령액',          desc: '현재 기준 월급·세후' },
              { href: '/tools/finance/savings',      icon: '💰', name: '저축액 계산기',          desc: '월 저축으로 자산 만들기' },
              { href: '/tools/finance/inheritance',  icon: '🏛️', name: '상속·증여세 계산기',     desc: '관계별 공제·10년 합산' },
              { href: '/tools/finance/real-estate',  icon: '🏘️', name: '부동산 수익률',          desc: '매매 vs 임대 ROI' },
              { href: '/tools/finance/gold-converter', icon: '🥇', name: '금시세·돈 환산',       desc: '한돈·g·돈 단위 변환' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
