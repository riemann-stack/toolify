import Link from 'next/link'
import CaffeineClient from './CaffeineClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/health/caffeine',
  title: '카페인 잔존량 트래커 — 반감기 5시간 + 수면 영향·일일 권장량 (mg)',
  description:
    '지금 체내 카페인 mg과 취침 시 잔존량을 반감기 5h 모델로 실시간 추적. 24+ 한국 음료 + FDA 400mg 권장량과 흡연·임신 보정.',
  keywords: [
    '카페인 계산기', '카페인 잔존량', '카페인 반감기', '카페인 수면 영향',
    '아메리카노 카페인', '콜드브루 카페인', '에너지드링크 카페인', '레드불 카페인',
    '몬스터 카페인', '핫식스 카페인', '녹차 카페인', '콜라 카페인',
    'FDA 카페인 400mg', '임산부 카페인 200mg', '카페인 권장량',
    '카페인 트래커', '카페인 일일 섭취량', 'CYP1A2', '카페인 대사',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}
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

const FAQ_LD = [
  { "q":"디카페인 커피는 정말 카페인이 없나요?","a":"아니요, 약 5~15mg 정도 남습니다. EU 규정상 디카페인은 카페인 0.1% 이하인데, Tall 사이즈 기준 약 10mg 수준. 임산부나 매우 민감한 사람은 디카페인이라도 늦은 오후 이후엔 자제 권장." },
  { "q":"콜드브루가 아메리카노보다 카페인이 많은 이유는?","a":"오랜 추출 시간 + 더 많은 원두 사용 때문입니다. 차가운 물은 추출 효율이 낮아 12~24시간 우려내며, 그만큼 원두를 1.5~2배 사용. 결과적으로 Tall 기준 195mg ≈ 아메리카노 그란데(225mg)와 비슷한 수준. 「부드러운 맛 = 약함」 통념과 달리 카페인은 높음." },
  { "q":"카페인 마지노선 = “취침 6시간 전”이 진짜?","a":"2013년 Journal of Clinical Sleep Medicine에 실린 연구(Drake 외)에서 <strong>취침 6시간 전에 마신 400mg 카페인도 수면을 1시간 넘게 줄였다</strong>고 보고했습니다. 본 도구의 모델로는 14:00에 아메리카노 150mg → 23:00 취침 시 잔존 약 43mg (가벼운 영향 가능 수준). 하지만 본인 반감기가 길거나 (피임약·임신) 양이 많으면 8~12시간 전부터 컷이 필요할 수 있습니다." },
  { "q":"카페인 내성·금단이 진짜 있나요?","a":"둘 다 진짜입니다. 내성: 매일 같은 양 섭취 시 1~2주 내 효과 ↓. 「커피 마셔도 안 깬다」 호소. 금단: 갑자기 끊으면 12~24시간 후 두통·피로·집중력 ↓·짜증 (1~3일 지속). 해결: 2주마다 1~2일 「카페인 휴식일」 또는 양 점진적 감량." },
  { "q":"“커피 낮잠(Coffee Nap)”이 효과 있다는 게 진짜?","a":"네, 여러 연구로 확인됐습니다. 방법: 커피 200mg을 빠르게 마시고 즉시 20분 낮잠. 카페인 효과 발현이 약 20~30분 후라 낮잠 후 깰 때 카페인 효과 + 졸음 클리어 모두 작용. 30분 넘게 자면 깊은 수면 단계에 들어가 오히려 더 멍해집니다." },
  { "q":"임산부 200mg은 어느 정도인가요?","a":"아메리카노 Tall 약 1.3잔 또는 Grande 1잔 정도입니다. 주의: 임신 중에는 반감기가 10~15시간으로 매우 길어져 평소 양도 체내에 오래 남습니다(수유 중에는 출산 후 보통 수준으로 회복). 본 도구 「반감기: 임신 중」 선택 시 자동 반영됩니다. 차·콜라·초콜릿, 그리고 일부 복합 진통제·감기약(카페인 함유 제품)에도 카페인이 들어 있어 합산에 주의하세요." },
  { "q":"본 도구의 데이터는 어디 저장되나요?","a":"본인 브라우저(localStorage)에만 저장됩니다. youtil 서버로는 전송하지 않습니다. 72시간이 지난 항목은 자동으로 정리됩니다(느린 반감기 12시간에서도 3일이면 잔존이 미미). 시크릿 모드나 다른 기기와는 자동 동기화되지 않습니다." }
]

export default function CaffeinePage() {
  return (
    <ToolPage width={880} slug="/tools/health/caffeine">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />카페인 잔존량 트래커
      </h1>
      <p className="tp-lead">
        지금 체내 카페인 mg과 <strong style={{ color: 'var(--text)' }}>취침 시 잔존량</strong>을 반감기 5h로 실시간 추적. 24+ 한국 음료 프리셋.
      </p>

      <UpdatedMeta date="2026년 7월" basis="반감기 지수감쇠 모델(기본 5시간, 3~12시간 선택) · 1일 한도 성인 400mg(FDA·식약처)·임산부 200mg(ACOG)·어린이·청소년 체중 1kg당 2.5mg(식약처)" sources={[{ label: 'FDA — 카페인 섭취 안내', href: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much' }, { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' }, { label: 'ACOG — 임신 중 카페인', href: 'https://www.acog.org/womens-health/experts-and-stories/ask-acog/how-much-coffee-can-i-drink-while-pregnant' }]} />

      <CaffeineClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 카페인 반감기란? */}
        <section>
          <h2 style={sectionTitle}>카페인 반감기란?</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>반감기(half-life)</strong>는 체내 카페인이 절반으로 줄어드는 데 걸리는 시간입니다.
            성인 평균 <strong style={{ color: 'var(--accent)' }}>약 5시간</strong> — 즉, 오후 2시에 아메리카노 150mg을 마시면
            오후 7시(5시간) ≈ 75mg, 자정(약 10시간) ≈ 약 38mg이 남습니다.
          </p>
          <p className="g-p">
            카페인은 간의 <strong style={{ color: 'var(--text)' }}>CYP1A2 효소</strong>에 의해 분해됩니다.
            이 효소 활성은 유전·약물·생활 습관에 따라 큰 차이가 나서 같은 양을 마셔도 사람마다 효과·지속 시간이 다릅니다.
          </p>
        </section>

        {/* 2. 음료별 카페인 함량 표 */}
        <section>
          <h2 style={sectionTitle}>음료별 카페인 함량 (한국 시장 기준)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>음료</th>
                    <th scope="col" style={headCell}>용량</th>
                    <th scope="col" style={headCell}>카페인</th>
                    <th scope="col" style={headCell}>비교</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}>☕ 아메리카노 (Tall)</td><td style={cell}>355ml</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>150mg</strong></td><td style={cell}>기준</td></tr>
                  <tr><td style={cell}>☕ 아메리카노 (Grande)</td><td style={cell}>473ml</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>225mg</strong></td><td style={cell}>1.5배</td></tr>
                  <tr><td style={cell}>🧊 콜드브루 (Tall)</td><td style={cell}>355ml</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>195mg</strong></td><td style={cell}>1.3배</td></tr>
                  <tr><td style={cell}>☕ 에스프레소 1샷</td><td style={cell}>30ml</td><td style={cell}>75mg</td><td style={cell}>0.5배</td></tr>
                  <tr><td style={cell}>🥛 카페라떼 (Tall)</td><td style={cell}>355ml</td><td style={cell}>75mg</td><td style={cell}>0.5배</td></tr>
                  <tr><td style={cell}>☕ 믹스커피 1포</td><td style={cell}>150ml</td><td style={cell}>50mg</td><td style={cell}>0.3배</td></tr>
                  <tr><td style={cell}>☕ 디카페인</td><td style={cell}>355ml</td><td style={cell}>10mg</td><td style={cell}>0.07배</td></tr>
                  <tr><td style={cell}>🍵 녹차 (1티백)</td><td style={cell}>200ml</td><td style={cell}>30mg</td><td style={cell}>0.2배</td></tr>
                  <tr><td style={cell}>🍵 홍차 (1티백)</td><td style={cell}>200ml</td><td style={cell}>47mg</td><td style={cell}>0.3배</td></tr>
                  <tr><td style={cell}>🍵 말차 1잔</td><td style={cell}>200ml</td><td style={cell}>70mg</td><td style={cell}>0.5배</td></tr>
                  <tr><td style={cell}>🥤 콜라 캔</td><td style={cell}>355ml</td><td style={cell}>35mg</td><td style={cell}>0.2배</td></tr>
                  <tr><td style={cell}>🥤 다이어트콜라</td><td style={cell}>355ml</td><td style={cell}>47mg</td><td style={cell}>0.3배</td></tr>
                  <tr><td style={cell}>⚡ 레드불</td><td style={cell}>250ml</td><td style={cell}><strong style={{ color: '#D97706' }}>62.5mg</strong></td><td style={cell}>0.4배</td></tr>
                  <tr><td style={cell}>⚡ 몬스터</td><td style={cell}>355ml</td><td style={cell}><strong style={{ color: '#EA580C' }}>100mg</strong></td><td style={cell}>0.7배</td></tr>
                  <tr><td style={cell}>⚡ 핫식스</td><td style={cell}>250ml</td><td style={cell}>60mg</td><td style={cell}>0.4배</td></tr>
                  <tr><td style={cell}>⚡ 박카스</td><td style={cell}>100ml</td><td style={cell}>30mg</td><td style={cell}>0.2배</td></tr>
                  <tr><td style={cell}>🍫 다크초콜릿 28g</td><td style={cell}>—</td><td style={cell}>24mg</td><td style={cell}>0.16배</td></tr>
                  <tr><td style={cell}>🍫 밀크초콜릿 28g</td><td style={cell}>—</td><td style={cell}>9mg</td><td style={cell}>0.06배</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px' }}>
            ※ 평균값. 브랜드·로스팅·추출법·계절에 따라 ±20% 차이 가능 (출처: 스타벅스 영양 정보, USDA, 식약처). 에너지음료는 국내 유통 제품의 표기 기준이며(레드불코리아 250ml 62.5mg, 국내 몬스터 355ml 100mg), 해외 제품은 용량·함량이 다릅니다.
          </p>
        </section>

        {/* 3. 대사 속도 보정 */}
        <section>
          <h2 style={sectionTitle}>왜 사람마다 카페인 효과가 다른가? (CYP1A2)</h2>
          <p className="g-p">
            카페인 분해 속도는 간 효소 <strong style={{ color: 'var(--text)' }}>CYP1A2</strong>가 결정합니다. 다음 요인으로 반감기가 크게 달라집니다:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { name: '🚬 흡연자', color: '#FFD93E', desc: '반감기 ≈ 3시간 — 니코틴이 CYP1A2 강력 활성화. 같은 양 마셔도 효과 짧음' },
              { name: '💊 경구 피임약', color: '#B885DA', desc: '반감기 ≈ 8~10시간 — 에스트로겐이 효소 억제. 잠 안 옴 호소 흔함' },
              { name: '🤰 임신 (후기)', color: '#DC2626', desc: '반감기 ≈ 10~15시간 — 호르몬 변화로 느림. 수유 중엔 출산 후 보통 수준으로 회복(LactMed). 섭취는 ACOG 200mg 미만 권장' },
              { name: '🧬 유전 fast/slow', color: '#0891B2', desc: 'CYP1A2 변이로 빠른/느린 대사자. 한국인 약 50%가 보통, 25%가 빠름' },
              { name: '👶 청소년·어린이', color: '#EA580C', desc: '반감기 ≈ 4시간이지만 체중 대비 영향 큼. WHO·식약처 권장량 낮음' },
              { name: '👴 고령자', color: '#059669', desc: '간 기능 ↓로 약간 느려질 수 있음. 야간 깊은 수면 영향 ↑' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '6px' }}>{b.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 일일 권장량 */}
        <section>
          <h2 style={sectionTitle}>일일 카페인 섭취 기준 (FDA·식약처)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>대상</th>
                  <th scope="col" style={headCell}>일일 권장 최대</th>
                  <th scope="col" style={headCell}>아메리카노 환산</th>
                  <th scope="col" style={headCell}>출처</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}>건강한 성인</td>
                  <td style={cell}><strong style={{ color: 'var(--accent)' }}>400mg</strong></td>
                  <td style={cell}>Tall 약 2.7잔 / Grande 약 1.8잔</td>
                  <td style={cell}>FDA·식약처</td>
                </tr>
                <tr>
                  <td style={cell}>임산부·수유부</td>
                  <td style={cell}><strong style={{ color: '#EA580C' }}>200mg</strong></td>
                  <td style={cell}>Tall 약 1.3잔</td>
                  <td style={cell}>ACOG (보수적)</td>
                </tr>
                <tr>
                  <td style={cell}>청소년 (만 11~18)</td>
                  <td style={cell}><strong style={{ color: '#EA580C' }}>2.5mg/kg/일 (≈125mg)</strong></td>
                  <td style={cell}>Tall 약 0.8잔</td>
                  <td style={cell}>식약처·EFSA</td>
                </tr>
                <tr>
                  <td style={cell}>어린이 (~만 10)</td>
                  <td style={cell}><strong style={{ color: '#DC2626' }}>2.5mg/kg/일 (≈45mg)</strong></td>
                  <td style={cell}>콜라 캔 1.3개 이하</td>
                  <td style={cell}>식약처·EFSA</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 성인 400mg은 FDA가 &ldquo;권장량&rdquo;이 아니라 <strong style={{ color: 'var(--text)' }}>&ldquo;대부분 건강한 성인에게 부정적 영향과 일반적으로 연관되지 않는 양&rdquo;</strong>으로 안내하는 수치입니다.
            임산부 기준은 기관마다 달라 — <strong style={{ color: 'var(--text)' }}>ACOG는 200mg 미만</strong>, <strong style={{ color: 'var(--text)' }}>식약처는 300mg 이하</strong>를 제시하고, 수유부는 <strong style={{ color: 'var(--text)' }}>CDC 기준 약 300mg 이하</strong>가 일반적으로 무난합니다. 본 도구는 보수적으로 200mg을 기본값으로 둡니다.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⚠️ 기준 초과 시: 불면·심박 ↑·불안·소화 불량·골밀도 영향(고용량 장기 시)·임신 시 저체중·유산 위험.
            한 번에 1,000mg+ 섭취는 급성 중독 (응급실 방문) 가능.
          </p>
        </section>

        {/* 5. 수면과 카페인 */}
        <section>
          <h2 style={sectionTitle}>카페인과 수면 — 왜 「잠은 잘 자지는데 피곤」한가?</h2>
          <p className="g-p">
            카페인은 뇌의 <strong style={{ color: 'var(--text)' }}>아데노신 수용체</strong>를 막아 졸음을 느끼지 못하게 합니다.
            잠드는 데 큰 문제 없어도, 깊은 수면(N3·서파수면)이 줄어 다음날 피로감이 누적됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { range: '< 30mg', desc: '수면 영향 거의 없음', color: '#059669' },
              { range: '30~50mg', desc: '가벼운 영향 가능', color: '#0891B2' },
              { range: '50~100mg', desc: '입면 지연 가능 · 깊은 수면(N3) ↓', color: '#D97706' },
              { range: '100~200mg', desc: '수면 질 큰 영향 · 다음날 피로', color: '#EA580C' },
              { range: '≥ 200mg', desc: '깊은 수면 차단 수준 · 심박 ↑', color: '#DC2626' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '6px', fontFamily: 'var(--font-sans)' }}>{b.range}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.8 }}>
            💡 본 도구의 <strong style={{ color: 'var(--text)' }}>「수면 영향 예측」</strong> 카드에서 목표 취침 시각의 잔존량을 즉시 확인하세요.
            취침 시 잔존을 30·50·100mg(내부 참고치) 이하로 두려면 지금부터 얼마나 더 마실 수 있는지도 역산해 줍니다 (일일 섭취 기준 잔여 한도 안에서).
          </p>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 면책 */}
        <section>
          <h2 style={sectionTitle}>⚠️ 의료 면책</h2>
          <div style={{
            background: 'rgba(217, 119, 6, 0.06)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 22px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.8,
          }}>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>본 도구는 <strong>일반 참고 안내</strong>이며 의학 진단·약물 처방 X.</li>
              <li>반감기 5시간은 평균 — 개인차 ±30~50% 가능 (유전·약물·생활).</li>
              <li>음료 카페인 함량은 평균값 — 브랜드·로스팅·추출법으로 변동.</li>
              <li>심박 이상·고혈압·임신·복용 약물 있으면 의사·약사 상담 우선.</li>
              <li>한국 식약처 부정·불량 식품 신고 <strong>1399</strong>.</li>
            </ul>
          </div>
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/cooking/brew" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>☕</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>커피 브루잉 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>핸드드립·콜드브루 6 추출법</div>
            </Link>
            <Link href="/tools/cooking/tea" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍵</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>차 우리기 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>9종 차·카페인 비교</div>
            </Link>
            <Link href="/tools/health/blood-alcohol" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍺</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>혈중알코올 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>알코올 분해 시간</div>
            </Link>
            <Link href="/tools/life/pomodoro" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍅</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>뽀모도로 타이머</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>집중 관리 + 휴식</div>
            </Link>
            <Link href="/tools/health/supplement" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💊</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>영양제 성분 체크</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>약물·카페인 상호작용</div>
            </Link>
            <Link href="/tools/date/server-time" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>실시간 서버 시간</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>티켓팅·수강신청 카운트다운</div>
            </Link>
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
