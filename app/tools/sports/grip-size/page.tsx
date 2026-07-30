import Link from 'next/link'
import GripSizeClient from './GripSizeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/grip-size',
  title: '그립 사이즈 계산기 — 테니스·골프·배드민턴·스쿼시 한 번에',
  description:
    '손 측정 한 번으로 테니스(L1~L5)·골프(언더/표준/미드/점보)·배드민턴(G2~G6)·스쿼시까지 4종목 그립 사이즈 동시 추천. 자/펜슬 테스트 + 오버그립 보정 + 글러브 호수 매핑 + 그립 굵기와 부상 연구 정리.',
  keywords: [
    '그립 사이즈', '그립 굵기', '테니스 그립 사이즈', '골프 그립 사이즈',
    '배드민턴 그립', '스쿼시 그립', '테니스 L1 L2 L3', '골프 글러브 호수',
    '그립 측정 방법', '펜슬 테스트', '오버그립', '테니스 엘보 예방',
    '라켓 그립', '손 크기 측정',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
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
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { "q":"그립 사이즈를 잘 모르겠으면 큰 걸로 가야 하나요, 작은 걸로 가야 하나요?","a":"의심스러우면 작은 쪽으로 가세요. 그 후 오버그립 1~2겹으로 미세 조정이 가능합니다. 반대로 너무 큰 그립을 산 경우, 손잡이를 깎거나 갈아내는 방법밖에 없어 사실상 불가능합니다. 테니스라면 L2~L3, 골프라면 표준, 배드민턴이라면 G5에서 출발하세요." },
  { "q":"테니스에서 L1과 L2 중 고민될 때 어떻게 선택?","a":"플레이 스타일과 쥐는 느낌으로 결정합니다. L1 추천: 손목 스냅 활용·톱스핀 위주·검지를 그립에서 떼는 동양식 그립. L2 추천: 발리·서브가 중요·플랫샷 위주·손이 큰 편. 잘 모르겠으면 L2로 시작 + 오버그립으로 보정이 안전합니다. 참고로 권장 치수 ±1/4인치 범위에서는 전완 근활성 차이가 확인되지 않았다는 연구(Hatch 외, AJSM 2006)가 있어, 두 사이즈 사이에서 고민할 때는 부상 예방보다 손에 맞는 느낌을 우선해도 됩니다." },
  { "q":"골프 그립을 미드사이즈로 바꾸면 정말 슬라이스가 줄어드나요?","a":"일부 골퍼에게 효과적입니다. 미드사이즈 그립은 손목 회전을 약간 제한하여, 다운스윙에서 손목이 과하게 닫히는(closed) 골퍼의 슬라이스를 줄여줄 수 있습니다. 반대로 손목 회전이 부족해서 슬라이스가 나는 골퍼는 미드사이즈로 가면 더 악화됩니다. 티칭프로에게 스윙 진단을 받은 후 결정하는 게 안전합니다." },
  { "q":"배드민턴에서 G4 + 오버그립 2겹과 G3 단독은 동일한가요?","a":"거의 비슷하지만 미세하게 다릅니다. 오버그립 2겹은 G3와 비슷한 둘레가 되지만, 오버그립은 표면 마찰력이 높아 땀 잡기에 좋고 · G3 단독은 오각형 모서리 감이 살아 그립 위치 인식에 좋습니다 · 오버그립은 마모되면 교체해야 합니다. 한국에서는 G4 + 오버그립 조합이 압도적 다수입니다." },
  { "q":"평생 같은 그립 사이즈를 써도 되나요?","a":"일반적으로 OK이지만, 다음 경우 재측정하세요: 10대~20대 초반은 손이 아직 자라는 중이라 매년 측정 · 관절염·손목 통증이 시작되면 한 단계 굵게(압력 분산 효과) · 체중·근육의 큰 변화 시 손 크기는 거의 안 변하지만 그립 감이 달라질 수 있음 · 고령은 손가락 굴곡이 줄어 약간 굵게 권장." },
  { "q":"본 도구의 추천은 얼마나 정확한가요?","a":"출발점으로 충분합니다. 일반적으로 알려진 손 크기 분포를 바탕으로 한 Youtil 자체 추정 권장값(공식 통계 아님)입니다. 다만 손가락 비율·관절 두께 등 개인차가 크고 · 스타일(스핀 vs 플랫·정타 vs 손목 활용)에 따라 ±1단계 차이가 날 수 있으며 · 땀 양·기온 등도 영향을 줍니다. 매장 시타와 함께 최종 결정을 권장합니다." }
]

export default function GripSizePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />그립 사이즈 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        손 측정 한 번으로 <strong style={{ color: 'var(--text)' }}>테니스·골프·배드민턴·스쿼시 4종목</strong> 그립 사이즈 동시 추천. 자·펜슬 테스트 두 방식과 오버그립·글러브 호수 보정까지.
      </p>

      <GripSizeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 왜 그립 사이즈가 중요한가 */}
        <section>
          <h2 style={sectionTitle}>그립 사이즈가 왜 중요한가?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            라켓·골프 클럽의 그립이 손 크기와 맞지 않으면 <strong style={{ color: 'var(--text)' }}>쥐는 힘의 크기와 분포가 달라져</strong>
            컨트롤과 편안함이 떨어집니다. 잘못된 그립 사이즈는 테니스 엘보(외측 상과염)의 원인으로 흔히 지목되지만,
            이를 뒷받침하는 연구 근거는 생각보다 제한적입니다 — 아래 &lsquo;그립 굵기와 부상&rsquo; 섹션에서 자세히 다룹니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            반대로 너무 큰 그립은 손목 회전을 방해해 컨트롤·스핀이 떨어지고, 골프에서는 슬라이스(우측 빠짐)의 원인이 됩니다.
            본 도구는 일반적으로 알려진 손 크기 분포·라켓 표준을 Youtil이 정리한 추정 기준(공식 통계 아님, 기준 2026.06)으로 출발점을 제시하니, 매장 시타와 함께 결정하세요.
          </p>
        </section>

        {/* 2. 측정 방법 비교 */}
        <section>
          <h2 style={sectionTitle}>측정 방법 2가지 — 자 vs 펜슬 테스트</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>방법</th>
                    <th scope="col" style={headCell}>방식</th>
                    <th scope="col" style={headCell}>장점</th>
                    <th scope="col" style={headCell}>단점</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}>📏 <strong>자로 측정</strong></td>
                    <td style={cell}>손바닥 두 번째 주름 ~ 약지 끝까지 cm 측정</td>
                    <td style={cell}>정확도 ↑ · 라켓 없어도 OK</td>
                    <td style={cell}>약지·중지 헷갈리기 쉬움</td>
                  </tr>
                  <tr>
                    <td style={cell}>✏️ <strong>펜슬 테스트</strong></td>
                    <td style={cell}>이스턴 포핸드 그립으로 잡고, 빈 공간에 검지 넣기</td>
                    <td style={cell}>즉각 확인 · 직관적</td>
                    <td style={cell}>라켓 필요 · 사이즈 가늠 모호</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 가장 좋은 방법은 <strong style={{ color: 'var(--text)' }}>매장 시타 + 본 도구 결과 비교</strong>.
            매장 라켓을 자로 측정해 둔 본인 사이즈와 일치하는지 확인하면 확실합니다.
          </p>
        </section>

        {/* 3. 종목별 표기 가이드 */}
        <section>
          <h2 style={sectionTitle}>종목별 그립 사이즈 표기</h2>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 18, marginBottom: 8 }}>🎾 테니스</h3>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>인치</th>
                  <th scope="col" style={headCell}>유럽 (EU)</th>
                  <th scope="col" style={headCell}>미국 (US)</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>4 1/8&quot;</td><td style={cell}><strong>L1</strong></td><td style={cell}>0</td><td style={cell}>여성·청소년 평균</td></tr>
                <tr><td style={cell}>4 1/4&quot;</td><td style={cell}><strong>L2</strong></td><td style={cell}>1</td><td style={cell}>여성·체형 작은 남성</td></tr>
                <tr><td style={cell}>4 3/8&quot;</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>L3</strong></td><td style={cell}>2</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>한국 남성 표준 (가장 흔함)</strong></td></tr>
                <tr><td style={cell}>4 1/2&quot;</td><td style={cell}><strong>L4</strong></td><td style={cell}>3</td><td style={cell}>큰 손 남성</td></tr>
                <tr><td style={cell}>4 5/8&quot;</td><td style={cell}><strong>L5</strong></td><td style={cell}>4</td><td style={cell}>매우 큰 손 (특주)</td></tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>⛳ 골프</h3>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>등급</th>
                  <th scope="col" style={headCell}>지름 (인치)</th>
                  <th scope="col" style={headCell}>글러브 호수 (한국)</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>언더사이즈</strong></td><td style={cell}>0.560&quot; (−1/64)</td><td style={cell}>20~22호</td><td style={cell}>여성·청소년·작은 손</td></tr>
                <tr><td style={cell}><strong style={{ color: 'var(--accent)' }}>표준</strong></td><td style={cell}>0.580&quot;</td><td style={cell}>23~25호</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>한국 남성 표준(추정)</strong></td></tr>
                <tr><td style={cell}><strong>미드사이즈</strong></td><td style={cell}>0.640&quot; (+1/16)</td><td style={cell}>26~27호</td><td style={cell}>큰 손·관절염</td></tr>
                <tr><td style={cell}><strong>점보</strong></td><td style={cell}>0.680&quot; (+1/8)</td><td style={cell}>28호+</td><td style={cell}>아주 큰 손·슬라이스 교정</td></tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>🏸 배드민턴</h3>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>등급</th>
                  <th scope="col" style={headCell}>그립 둘레</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>G2</strong></td><td style={cell}>98mm</td><td style={cell}>아주 큰 손 (드뭄, 한국 출고 거의 없음)</td></tr>
                <tr><td style={cell}><strong>G3</strong></td><td style={cell}>95mm</td><td style={cell}>큰 손 남성 (드뭄)</td></tr>
                <tr><td style={cell}><strong style={{ color: 'var(--accent)' }}>G4</strong></td><td style={cell}>92mm</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>한국 남성 표준 — 라켓 기본 출고</strong></td></tr>
                <tr><td style={cell}><strong>G5</strong></td><td style={cell}>89mm</td><td style={cell}>여성·작은 손 남성 표준</td></tr>
                <tr><td style={cell}><strong>G6</strong></td><td style={cell}>86mm</td><td style={cell}>여성·청소년</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            💡 한국 동호인 상당수가 <strong style={{ color: 'var(--text)' }}>오버그립 1~2겹</strong>을 추가로 감습니다(동호회 현장 체감 기준).
            G4 + 오버그립 1겹이 가장 흔한 조합으로 알려져 있습니다.
          </p>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>🥎 스쿼시</h3>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>등급</th>
                  <th scope="col" style={headCell}>둘레 (인치)</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>Small</strong></td><td style={cell}>3 7/8&quot;</td><td style={cell}>작은 손·여성</td></tr>
                <tr><td style={cell}><strong style={{ color: 'var(--accent)' }}>Medium</strong></td><td style={cell}>4 1/8&quot;</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>한국 표준</strong></td></tr>
                <tr><td style={cell}><strong>Large</strong></td><td style={cell}>4 3/8&quot;</td><td style={cell}>큰 손 남성</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            💡 스쿼시 라켓은 테니스와 달리 <strong style={{ color: 'var(--text)' }}>대부분 단일(표준) 사이즈로 출고</strong>되어, 실제 조절은 <strong style={{ color: 'var(--text)' }}>오버그립 겹수</strong>로 하는 것이 표준입니다.
            작은 손은 기본 그대로(0겹), 표준은 0~1겹, 큰 손은 1~2겹을 감아 위 둘레에 맞추세요.
          </p>
        </section>

        {/* 4. 오버그립 가이드 */}
        <section>
          <h2 style={sectionTitle}>오버그립 — 사이즈 미세 조정의 정석</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            오버그립 1겹은 약 <strong style={{ color: 'var(--text)' }}>0.5mm 두께</strong>로, 실제로 감으면 그립 둘레가 약 1.5mm(그립 약 0.5단계) 굵어집니다.
            테니스/배드민턴 그립 한 단계 차이의 약 절반에 해당하므로 <strong style={{ color: 'var(--text)' }}>오버그립 2겹으로 한 사이즈 키우는 효과</strong>가 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { type: '얇은 오버그립', thickness: '0.5mm', desc: '윌슨 프로 · 가장 흔함', color: '#0891B2' },
              { type: '쿠션 오버그립', thickness: '0.6~0.8mm', desc: '바볼랏 VS 오리지널', color: '#D97706' },
              { type: '두꺼운 타월그립', thickness: '~1.5mm', desc: '땀 많은 손·여름용', color: '#EA580C' },
            ].map((o, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${o.color}44`, borderRadius: 12, padding: '12px 16px' }}>
                <p style={{ fontSize: 13, color: o.color, fontWeight: 700, marginBottom: 4 }}>{o.type}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{o.thickness}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 부상 가이드 */}
        <section>
          <h2 style={sectionTitle}>그립 굵기와 부상 — 통념과 연구가 말하는 것</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            &ldquo;그립이 가늘면 라켓을 더 세게 쥐게 되어 테니스 엘보가 온다&rdquo;는 이야기는 동호인 사이에서 정설처럼 통합니다.
            그런데 이 통념을 직접 검증한 연구진조차 논문 서두에서, 부적절한 그립 굵기가 전완·팔꿈치 과사용 부상의 위험 요인으로
            자주 지목되는 곳으로 <strong style={{ color: 'var(--text)' }}>대중 매체</strong>를 들며 시작합니다(Hatch 외, AJSM 2006).
          </p>
          <div style={{ ...card, marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>🔬 근전도(EMG) 검증 실험 — Hatch 외, Am J Sports Med 2006</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
              무증상 대학(NCAA) 테니스 선수 16명에게 권장 치수 그립, 1/4인치(6.35mm) 가는 그립, 1/4인치 굵은 그립 3종으로
              한손 백핸드를 치게 하고 전완 근육 5곳의 활동을 근전도로 측정한 결과,
              <strong style={{ color: 'var(--text)' }}>세 굵기 사이에 어느 근육에서도 유의한 차이가 없었습니다</strong>.
              1/4인치면 위 테니스 표 기준 두 단계에 해당하는 큰 차이입니다. 저자들은 학회(AOSSM 미국정형외과스포츠의학회)
              보도자료에서 &ldquo;그런 (부상 예방 목적의 그립 사이즈) 권고에는 과학적 근거가 없다&rdquo;고 논평하며,
              측정법은 출발점으로 쓰되 실제 선택은 가장 편하게 느껴지는 굵기로 하라고 권했습니다.
            </p>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            물론 한계도 분명합니다. 통증이 없는 선수들의 순간적인 근육 활동만 본 실험실 연구라서, 그립 굵기가 실제 부상
            발생률을 바꾸는지에 대한 근거는 여전히 제한적입니다. &lsquo;가늘어도 무해하다&rsquo;는 단정도 &lsquo;가늘면 위험하다&rsquo;는
            단정도 어렵다는 뜻입니다. 다만 분명한 것은, <strong style={{ color: 'var(--text)' }}>권장 치수 근처의 한두 단계 차이에
            과민할 이유가 연구로는 확인되지 않는다</strong>는 점입니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            참고로 본 도구의 자 측정 방식 — <strong style={{ color: 'var(--text)' }}>근위 손바닥 주름(손바닥 안쪽 큰 주름)에서 약지
            끝까지의 거리</strong> — 는 Nirschl이 제안한 측정법으로, 라켓 제조사들이 권장 그립 사이즈를 정할 때 널리 쓰는
            업계 표준 관행이라는 사실이 같은 논문(Hatch 2006) 본문에 명시돼 있습니다. 측정법 자체는 출처가 분명한 셈이고,
            연구가 유보하는 것은 &lsquo;거기서 벗어나면 다친다&rsquo;는 주장 쪽입니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            실전 기준은 이렇게 정리됩니다. ① 측정값(본 도구 추천)으로 출발 ② 시타에서 쥐었을 때 편하고 스트로크 중 그립이
            돌지 않는 굵기를 선택 ③ 애매하면 작은 쪽 + 오버그립 미세 조정(위 섹션). 그리고 팔꿈치·손목 통증이 몇 주째
            계속된다면 그립 교체로 해결을 기대하기보다 <strong style={{ color: 'var(--text)' }}>플레이 시간·빈도를 줄이고 의료 상담을
            받는 것이 순서</strong>입니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 매장 실전 팁 — 지금 쓰는 라켓의 사이즈는 <strong style={{ color: 'var(--text)' }}>손잡이 끝 버트캡</strong>에서 확인합니다.
            테니스 라켓은 버트캡에 유럽식 번호(2 = L2)나 인치 표기가 각인·인쇄돼 있고, 배드민턴 라켓은 버트캡·콘 부근
            스티커의 무게·그립 표기(3U G5 식)로 확인합니다. 오버그립을 이미 감아 둔 라켓은 표기 사이즈보다 실제 둘레가
            반 단계~한 단계 굵어져 있으니, 매장 시타 때는 감긴 상태 그대로 비교하세요.
          </p>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
            출처: Hatch GF 외, Am J Sports Med 2006;34(12):1977-1983 · 저자 논평: AOSSM 보도자료(2006)
          </p>
        </section>

        {/* 6. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 그립 사이즈를 잘 모르겠으면 큰 걸로 가야 하나요, 작은 걸로 가야 하나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>의심스러우면 작은 쪽으로 가세요.</strong>
              그 후 <strong>오버그립 1~2겹으로 미세 조정</strong>이 가능합니다.
              반대로 너무 큰 그립을 산 경우, 손잡이를 깎거나 갈아내는 방법밖에 없어 사실상 불가능합니다.
              테니스라면 L2~L3, 골프라면 표준, 배드민턴이라면 G5에서 출발하세요.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 테니스에서 L1과 L2 중 고민될 때 어떻게 선택?</summary>
            <div style={faqAnswer}>
              <strong>플레이 스타일과 쥐는 느낌으로 결정</strong>합니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong style={{ color: 'var(--text)' }}>L1 추천</strong>: 손목 스냅 활용·톱스핀 위주·검지를 그립에서 떼는 동양식 그립</li>
                <li><strong style={{ color: 'var(--text)' }}>L2 추천</strong>: 발리·서브가 중요·플랫샷 위주·손이 큰 편</li>
              </ul>
              잘 모르겠으면 L2로 시작 + 오버그립으로 보정이 안전합니다.
              참고로 권장 치수 ±1/4인치 범위에서는 전완 근활성 차이가 확인되지 않았다는 연구(Hatch 외, AJSM 2006)가 있어,
              두 사이즈 사이에서 고민할 때는 부상 예방보다 손에 맞는 느낌을 우선해도 됩니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 골프 그립을 미드사이즈로 바꾸면 정말 슬라이스가 줄어드나요?</summary>
            <div style={faqAnswer}>
              <strong>일부 골퍼에게 효과적</strong>입니다. 미드사이즈 그립은 손목 회전을 약간 제한하여,
              <strong style={{ color: 'var(--text)' }}>다운스윙에서 손목이 과하게 닫히는(closed) 골퍼</strong>의 슬라이스를 줄여줄 수 있습니다.
              반대로 손목 회전이 부족해서 슬라이스가 나는 골퍼는 미드사이즈로 가면 더 악화됩니다.
              티칭프로에게 스윙 진단을 받은 후 결정하는 게 안전합니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 배드민턴에서 G4 + 오버그립 2겹과 G3 단독은 동일한가요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>거의 비슷하지만 미세하게 다릅니다.</strong>
              오버그립 2겹은 G3와 비슷한 둘레가 되지만,
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>오버그립은 <strong>표면 마찰력 ↑</strong> (땀 잡기 좋음)</li>
                <li>G3 단독은 <strong>오각형 모서리 감 ↑</strong> (그립 위치 인식 좋음)</li>
                <li>오버그립은 마모되면 교체 — 한국에서 G4 + 오버그립이 압도적 다수</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 평생 같은 그립 사이즈를 써도 되나요?</summary>
            <div style={faqAnswer}>
              일반적으로 OK이지만, 다음 경우 재측정하세요:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong>10대~20대 초반</strong>: 손이 아직 자라는 중 — 매년 측정</li>
                <li><strong>관절염·손목 통증 시작</strong>: 한 단계 굵게 (압력 분산 효과)</li>
                <li><strong>체중·근육 큰 변화</strong>: 손 크기는 거의 안 변하지만 그립 감이 달라질 수 있음</li>
                <li><strong>고령</strong>: 손가락 굴곡 감소 → 약간 굵게 권장</li>
              </ul>
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 본 도구의 추천은 얼마나 정확한가요?</summary>
            <div style={faqAnswer}>
              <strong>출발점으로 충분</strong>합니다. 일반적으로 알려진 손 크기 분포를 바탕으로 한 Youtil 자체 추정 권장값(공식 통계 아님)입니다.
              그러나:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>손가락 비율·관절 두께 등 개인차 큼</li>
                <li>스타일(스핀 vs 플랫·정타 vs 손목 활용)에 따라 ±1단계 차이 가능</li>
                <li>땀 양·기온 등도 영향</li>
              </ul>
              <strong style={{ color: 'var(--text)' }}>매장 시타와 함께</strong> 최종 결정을 권장합니다.
            </div>
          </details>
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/sports/golf-distance" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>골프 비거리 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>클럽별 비거리·환경 보정</div>
            </Link>
            <Link href="/tools/sports/golf-handicap" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⛳</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>골프 핸디캡</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>WHS 핸디캡 자동 관리</div>
            </Link>
            <Link href="/tools/sports/golf-cost" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏌️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>골프 비용 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>그린피·정산</div>
            </Link>
            <Link href="/tools/sports/one-rm" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏋️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1RM 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>최대 무게 추정</div>
            </Link>
            <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>훈련 페이스</div>
            </Link>
            <Link href="/tools/unit/size" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛍️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>사이즈 변환기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>의류·신발 한국 사이즈</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
