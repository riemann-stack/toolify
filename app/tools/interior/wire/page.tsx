import Link from 'next/link'
import WireClient from './WireClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/interior/wire',
  title: '전선 굵기 계산기 — KEC 2021 + 차단기·전압강하 + EV 충전기',
  description: '사용 가전 W에 맞는 전선 굵기와 차단기 + 전압강하 자동. KEC 2021 기준 + 에어컨·EV충전기·인덕션 등 한국 가전 12프리셋.',
  keywords: ['전선 굵기 계산기', '허용전류 sq', '차단기 용량', 'KEC 2021', '전압강하 계산', '에어컨 전선', 'EV 충전기 전선', '인덕션 차단기', 'HIV IV VCT', '단상 삼상'],
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
  marginBottom: '14px',
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
  { "q":"1.5sq 전선은 몇 A까지 가능한가요?","a":"HIV 동선·30°C·기중 직접고정(참조 부설방법 C) 기준 약 19A입니다. 허용전류는 부설방법(관내·매설·기중)에 따라 달라지며, 이 값은 KEC가 채택한 IEC 60364-5-52 표의 방법 C를 기준선으로 씁니다. 여기에 보정계수(주위온도·다회로 묶음·매설)를 곱하면 70~85% 수준으로 떨어집니다. 예: 40°C에서 1.5sq → 19 × 0.87 = 약 16.5A. 콘센트 회로(20A 차단기)에는 일반적으로 2.5sq 이상을 권장합니다." },
  { "q":"에어컨 2kW(1.5RT)면 전선 몇 sq?","a":"단상 220V·역률 0.8 기준: I = 2000 / (220 × 0.8) ≈ 11.4 A. 1.5sq(19A)로도 가능하지만 실무는 2.5sq + 15A 차단기가 표준입니다. 기동 전류·여름철 고온·장시간 운전을 고려한 안전 마진이에요. 시스템에어컨·3RT 이상은 4~6sq + 20~40A 차단기 + 단독 분기를 권장합니다." },
  { "q":"EV 완속 충전기 7kW는 전선 굵기와 차단기?","a":"단상 220V 7kW = 약 32A (역률 1.0). 연속부하 125% 설계 여유로 40A 차단기 + 6sq HIV/F-CV가 한국 표준 조합입니다. 매설 구간은 F-CV(가교폴리에틸렌, 90°C)를 사용하고, EV 콘센트는 단독 분기 + RCBO(누전·과전류 통합) 30mA가 의무. 한전 신청·전기안전공사 검사가 별도로 필요합니다. 22kW 삼상(완속·중속)은 380V로 상(相) 분산되어 전선을 상대적으로 가늘게 가져갈 수 있습니다(6sq + 40A). 진짜 급속(DC 50kW+)은 별도의 충전 방식입니다." },
  { "q":"같은 sq인데 HIV와 IV 허용전류가 왜 달라요?","a":"절연체 내열온도가 다르기 때문입니다. IV는 60°C, HIV는 70°C까지 견딜 수 있어요. 같은 두께라도 더 높은 온도까지 안전하면 더 많은 전류를 흘릴 수 있습니다 (HIV가 약 15% 큰 허용전류). 최근에는 더 고온인 90°C급 F-CV가 매설용으로 표준화되어 약 20% 더 큰 허용전류를 갖습니다." },
  { "q":"전선이 길어지면 왜 더 굵어야 하나요?","a":"전압강하(Voltage Drop) 때문입니다. 전선 자체의 저항으로 전압이 점점 떨어져, 도착 지점에서는 220V가 아니라 215V·210V로 낮아져요. 공식: e = (35.6 × L × I) / (1000 × A)(단상) 허용전류는 충분해도 전압강하 한도(가정 2% / 옥내 3% / 옥외 5%)를 넘으면 한 단계 굵은 전선을 사용해야 합니다. EV 충전기·시스템 에어컨처럼 거리가 긴 부하에서 특히 중요해요." },
  { "q":"단상 220V와 삼상 380V 어느 게 유리한가요?","a":"같은 W면 삼상이 압도적으로 유리합니다. 전류 = P / (√3 × V) 공식에서 √3 × 380 ≈ 658 — 단상 220 대비 약 3배. 예: 10kW를 단상 220V로 흘리면 45.5A지만, 삼상 380V로는 15.2A에 불과해요. → 전선 가늘어도 됨, 차단기 작아도 됨, 변압기 효율 ↑. 산업·공장·시스템 에어컨·EV 22kW 삼상 완속·급속(DC) 등은 삼상이 표준이며, 가정도 시스템 에어컨이 들어가면 부분적으로 삼상을 끌어 쓰는 경우가 많아요." },
  { "q":"차단기 용량은 어떻게 정하나요?","a":"차단기 = 부하전류 × 1.25 이상의 가장 작은 표준값(연속부하 125% 설계 여유). 예: 부하 32A → 32 × 1.25 = 40A → 40A 차단기 선택. 단 과전류 보호의 기본 원칙(KEC 212)상 차단기 정격은 전선 허용전류 이하여야 합니다(IB≤차단기≤전선허용전류). 너무 크면 과부하·과열을 막지 못하고, 너무 작으면 정상 운전 시 트립이 자주 일어납니다. 모터 부하는 기동전류가 정격의 5~7배이므로 차단기를 한 단계 큰 것으로 또는 D-curve(모터용) 차단기를 선택하기도 합니다." },
  { "q":"누전차단기와 배선용차단기 차이는?","a":"배선용차단기(MCCB)는 과부하·단락(쇼트)으로부터 전선·기기를 보호 — 화재 예방. 누전차단기(ELCB)는 누전·감전으로부터 사람을 보호 — 감전사 예방. 가정용 분기 회로는 누전차단기 30mA·0.03초 의무이며, 욕실·EV 충전기는 더 민감한 15mA를 추가합니다. 최근에는 둘을 합친 RCBO가 신축에서 표준화되고 있어요." },
  { "q":"옥외 매설용 전선은 무엇을 쓰나요?","a":"F-CV (가교폴리에틸렌, 90°C 내열)가 표준입니다. 기존 CV 케이블의 개량형으로, 자외선·습기·화학물질에 강하고 매설·옥외·노출 모두 가능해요. 공동주택 간선·EV 충전기 인입선·옥외 조명에 가장 흔합니다. 반면 옥내 일반 콘센트·조명은 HIV(내열비닐절연전선, KS C IEC 60227-3)가 표준입니다. 소방·통신·아파트 간선처럼 화재 시 연소 확산이 우려되는 곳은 FR-CV(난연)를 씁니다." },
  { "q":"전기 자가시공이 가능한가요?","a":"일반인의 옥내·옥외 배선 시공은 전기공사업법상 불가능합니다. 반드시 전기기능사·전기공사기능사·전기공사업 등록 사업자를 통해 시공하고 한전·전기안전공사 검사를 받아야 해요. 무자격 자가시공은 화재·감전사뿐 아니라 법적 처벌(전기공사업법 제42조), 화재 보험 거부 사유가 됩니다. 단순 콘센트 커버 교체·전구 교환·플러그 교체 정도가 일반인이 할 수 있는 범위입니다. 이 도구는 견적 검토·학습·기술자와의 의사소통용으로만 사용해 주세요." }
]

export default function WirePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        주거·인테리어
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="interior" />전선 굵기 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        사용 가전 W에 맞는 <strong style={{ color: 'var(--text)' }}>전선 굵기와 차단기</strong> + 전압강하 자동. KEC 2021 기준.
      </p>

      <WireClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>전압·부하 종류·전선·환경 선택</strong> — 회로 조건 4가지</li>
          <li><strong>소비전력(kW)과 배선 거리 입력</strong></li>
          <li><strong>결과 확인</strong> — 예상 전류 / 권장 전선 / 차단기 / 전압강하</li>
          <li><strong>전선 용량 조회</strong> 탭에서 <strong>sq → 허용 W</strong>, 차단기 → 전선도 가능</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>가전 프리셋 탭</strong>에서 에어컨·EV 충전기·인덕션 등
          한국 시장 12개 프리셋의 표준 사양을 확인할 수 있어요.
        </p>
      </div>

      {/* 2. 4가지 관계 */}
      <h2 style={sectionTitle}>🔗 sq · A · 차단기 · 전압강하 4가지 관계</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          전선·차단기 선정은 4단계로 정해집니다.
        </p>
        <ol style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 2 }}>
          <li>
            <strong style={{ color: 'var(--text)' }}>① 부하 W → 전류 I</strong>{' '}
            <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--accent)' }}>
              I = P / (V × cosφ)
            </span>{' '}
            (삼상은 ÷ √3 추가)
          </li>
          <li>
            <strong style={{ color: 'var(--text)' }}>② 전류 I → 허용전류표에서 sq 결정</strong>{' '}
            (HIV/IV·30°C·일반 부설 기준)
          </li>
            <li>
            <strong style={{ color: 'var(--text)' }}>③ 차단기 = I × 1.25 이상</strong>{' '}
            의 가장 작은 표준값 (연속부하 125% 설계 여유) — 단, 차단기 정격 ≤ 전선 허용전류 (KEC 212 과전류 보호, IB≤In≤Iz)
          </li>
          <li>
            <strong style={{ color: 'var(--text)' }}>④ 거리가 길면 전압강하로 한 단계 큰 sq</strong>{' '}
            (가정 2% / 옥내 3% / 옥외 5% 한도)
          </li>
        </ol>
      </div>

      {/* 3. KEC */}
      <h2 style={sectionTitle}>📜 KEC 2021 (한국전기설비규정) 핵심</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          <strong>2021년 1월 1일 시행</strong>된 한국전기설비규정(KEC)은 종전의 &quot;내선규정·배전규정&quot;을
          대체하는 새 표준입니다. ISO/IEC 국제 표준에 정합화되어 전기 안전 기준이 전면 개정되었어요.
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>전기설비 기준 통합</strong> — 저압·고압·특고압 일관 기준</li>
          <li><strong style={{ color: 'var(--text)' }}>안전 기준 강화</strong> — 누전·과부하·접지 강화</li>
          <li><strong style={{ color: 'var(--text)' }}>국제 정합</strong> — IEC 60364 시리즈 부합</li>
          <li><strong style={{ color: 'var(--text)' }}>전기 안전 관리자 의무 확대</strong></li>
        </ul>
      </div>

      {/* 4. 단상 vs 삼상 */}
      <h2 style={sectionTitle}>⚙️ 단상 220V vs 삼상 380V 차이</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: '0 0 6px' }}>단상 220V</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              가정·소형 사무실·일반 콘센트.<br />
              R + N (2선) 또는 R + N + 접지(3선).
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: '0 0 6px' }}>삼상 380V</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              산업·공장·시스템 에어컨·EV 급속.<br />
              R + S + T (3선) — 같은 W에서 전류 분산으로 전선 가늘어도 OK.
            </p>
          </div>
        </div>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.9 }}>
            예시: <strong style={{ color: 'var(--accent)' }}>10kW 부하</strong><br />
            • 단상 220V: I = 10000 / 220 = <strong style={{ color: 'var(--accent)' }}>45.5 A</strong> (10sq 필요)<br />
            • 삼상 380V: I = 10000 / (√3 × 380) = <strong style={{ color: 'var(--accent)' }}>15.2 A</strong> (2.5sq면 충분)
          </p>
        </div>
      </div>

      {/* 5. 누전·배선용 차이 */}
      <h2 style={sectionTitle}>🛡️ 누전차단기 vs 배선용차단기 차이</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid var(--accent)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: '0 0 6px' }}>배선용차단기 (MCCB)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              과부하·단락(쇼트) 보호.<br />
              전선·기기를 화재로부터 보호.<br />
              분전반 메인·간선용.
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #DB2777', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: '#DB2777', fontWeight: 700, margin: '0 0 6px' }}>누전차단기 (ELCB·RCBO)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              누전·감전 방지.<br />
              사람을 감전사로부터 보호.<br />
              <strong>가정용 분기 30mA·0.03초 의무</strong>.
            </p>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 욕실·발코니 등 물기 있는 특수장소는 <strong>고감도 누전차단기(예: 15mA)</strong>를 추가하고,
          EV 충전 회로는 <strong>직류 누설까지 검출하는 EV 전용 누전차단기(RCD Type A/B·RCBO 등)</strong>를 사용합니다.
          최근에는 과전류·누전을 통합한 <strong>RCBO(Residual Current Breaker with Overcurrent)</strong>가 표준화되고 있어요.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 1.5sq 전선은 몇 A까지 가능한가요?</summary>
        <p style={faqAnswer}>
          <strong>HIV 동선·30°C·기중 직접고정(참조 부설방법 C) 기준 약 19A</strong>입니다.
          허용전류는 부설방법(관내·매설·기중)에 따라 달라지며, 이 값은 KEC가 채택한
          IEC 60364-5-52 표의 방법 C를 기준선으로 씁니다.
          여기에 보정계수(주위온도·다회로 묶음·매설)를 곱하면 70~85% 수준으로 떨어집니다.
          예: 40°C에서 1.5sq → 19 × 0.87 = 약 16.5A. 콘센트 회로(20A 차단기)에는 일반적으로
          <strong> 2.5sq 이상</strong>을 권장합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 에어컨 2kW(1.5RT)면 전선 몇 sq?</summary>
        <p style={faqAnswer}>
          단상 220V·역률 0.8 기준: I = 2000 / (220 × 0.8) ≈ <strong>11.4 A</strong>.
          1.5sq(19A)로도 가능하지만 <strong>실무는 2.5sq + 15A 차단기</strong>가 표준입니다.
          기동 전류·여름철 고온·장시간 운전을 고려한 안전 마진이에요.
          시스템에어컨·3RT 이상은 4~6sq + 20~40A 차단기 + 단독 분기를 권장합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. EV 완속 충전기 7kW는 전선 굵기와 차단기?</summary>
        <p style={faqAnswer}>
          단상 220V 7kW = <strong>약 32A</strong> (역률 1.0). 연속부하 125% 설계 여유로
          <strong> 40A 차단기 + 6sq HIV/F-CV</strong>가 한국 표준 조합입니다.
          매설 구간은 F-CV(가교폴리에틸렌, 90°C)를 사용하고, EV 콘센트는 단독 분기 + RCBO(누전·과전류 통합) 30mA가 의무.
          한전 신청·전기안전공사 검사가 별도로 필요합니다. 22kW 삼상(완속·중속)은 380V로 상(相) 분산되어
          전선을 상대적으로 가늘게 가져갈 수 있습니다(<strong>6sq + 40A</strong>). 진짜 급속(DC 50kW+)은 별도의 충전 방식입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 같은 sq인데 HIV와 IV 허용전류가 왜 달라요?</summary>
        <p style={faqAnswer}>
          <strong>절연체 내열온도</strong>가 다르기 때문입니다.
          IV는 60°C, HIV는 70°C까지 견딜 수 있어요. 같은 두께라도 더 높은 온도까지 안전하면
          더 많은 전류를 흘릴 수 있습니다 (HIV가 약 15% 큰 허용전류).
          최근에는 더 고온인 90°C급 F-CV가 매설용으로 표준화되어 약 20% 더 큰 허용전류를 갖습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 전선이 길어지면 왜 더 굵어야 하나요?</summary>
        <p style={faqAnswer}>
          <strong>전압강하(Voltage Drop)</strong> 때문입니다.
          전선 자체의 저항으로 전압이 점점 떨어져, 도착 지점에서는 220V가 아니라 215V·210V로 낮아져요.
          공식: <strong>e = (35.6 × L × I) / (1000 × A)</strong>(단상)<br />
          허용전류는 충분해도 전압강하 한도(가정 2% / 옥내 3% / 옥외 5%)를 넘으면
          한 단계 굵은 전선을 사용해야 합니다. EV 충전기·시스템 에어컨처럼 거리가 긴 부하에서 특히 중요해요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 단상 220V와 삼상 380V 어느 게 유리한가요?</summary>
        <p style={faqAnswer}>
          <strong>같은 W면 삼상이 압도적으로 유리</strong>합니다.
          전류 = P / (√3 × V) 공식에서 √3 × 380 ≈ 658 — 단상 220 대비 약 3배.
          예: 10kW를 단상 220V로 흘리면 45.5A지만, 삼상 380V로는 15.2A에 불과해요.
          → 전선 가늘어도 됨, 차단기 작아도 됨, 변압기 효율 ↑.
          <strong> 산업·공장·시스템 에어컨·EV 22kW 삼상 완속·급속(DC) 등은 삼상</strong>이 표준이며,
          가정도 시스템 에어컨이 들어가면 부분적으로 삼상을 끌어 쓰는 경우가 많아요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 차단기 용량은 어떻게 정하나요?</summary>
        <p style={faqAnswer}>
          <strong>차단기 = 부하전류 × 1.25 이상의 가장 작은 표준값</strong>(연속부하 125% 설계 여유).
          예: 부하 32A → 32 × 1.25 = 40A → 40A 차단기 선택. 단 과전류 보호 기본 원칙(KEC 212)상
          <strong>차단기 정격은 전선 허용전류 이하</strong>여야 합니다(IB≤차단기≤전선허용전류).
          너무 크면 과부하·과열을 막지 못하고, 너무 작으면 정상 운전 시 트립이 자주 일어납니다.
          모터 부하는 <strong>기동전류가 정격의 5~7배</strong>이므로 차단기를 한 단계 큰 것으로
          또는 D-curve(모터용) 차단기를 선택하기도 합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 누전차단기와 배선용차단기 차이는?</summary>
        <p style={faqAnswer}>
          <strong>배선용차단기(MCCB)</strong>는 <strong>과부하·단락(쇼트)</strong>으로부터 전선·기기를 보호 — 화재 예방.<br />
          <strong>누전차단기(ELCB)</strong>는 <strong>누전·감전</strong>으로부터 사람을 보호 — 감전사 예방.<br />
          가정용 분기 회로는 누전차단기 30mA·0.03초 의무이며, 욕실·EV 충전기는 더 민감한 15mA를 추가합니다.
          최근에는 둘을 합친 <strong>RCBO</strong>가 신축에서 표준화되고 있어요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 옥외 매설용 전선은 무엇을 쓰나요?</summary>
        <p style={faqAnswer}>
          <strong>F-CV (가교폴리에틸렌, 90°C 내열)</strong>가 표준입니다.
          기존 CV 케이블의 개량형으로, 자외선·습기·화학물질에 강하고 매설·옥외·노출 모두 가능해요.
          공동주택 간선·EV 충전기 인입선·옥외 조명에 가장 흔합니다.
          반면 옥내 일반 콘센트·조명은 <strong>HIV(KS C IEC 60227-3)</strong>가 표준입니다.
          소방·통신·아파트 간선처럼 화재 시 연소 확산이 우려되는 곳은 <strong>FR-CV(난연)</strong>를 씁니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 전기 자가시공이 가능한가요?</summary>
        <p style={faqAnswer}>
          <strong>일반인의 옥내·옥외 배선 시공은 전기공사업법상 불가능</strong>합니다.
          반드시 <strong>전기기능사·전기공사기능사·전기공사업 등록 사업자</strong>를 통해 시공하고
          <strong>한전·전기안전공사 검사</strong>를 받아야 해요. 무자격 자가시공은 화재·감전사뿐 아니라
          법적 처벌(전기공사업법 제42조), 화재 보험 거부 사유가 됩니다.
          단순 콘센트 커버 교체·전구 교환·플러그 교체 정도가 일반인이 할 수 있는 범위입니다.
          이 도구는 <strong>견적 검토·학습·기술자와의 의사소통용</strong>으로만 사용해 주세요.
        </p>
      </details>

      {/* 인테리어 도구 크로스링크 — 표준 2열 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { href: '/tools/interior/lighting', icon: '💡', name: '조명 밝기 계산기', desc: '공간별 권장 루멘·조명 개수' },
          { href: '/tools/interior/ac-capacity', icon: '❄️', name: '에어컨 평형 계산기', desc: '평형 추천·BTU·W 환산' },
          { href: '/tools/interior/pipe', icon: '🔧', name: '배관 규격 변환기', desc: 'A호칭·인치·DN + 6재질' },
          { href: '/tools/interior/room-area', icon: '📐', name: '방 면적 계산기', desc: '평↔㎡·바닥/벽 면적' },
        ].map((t) => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px', textDecoration: 'none',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
