import Link from 'next/link'
import FtpZonesClient from './FtpZonesClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/ftp-zones',
  title: 'FTP·파워존 계산기 — 사이클 훈련 강도 (Coggan)',
  description: '20분·램프·8분 테스트로 FTP를 추정하고 Coggan 7단계 파워존(W)과 W/kg 등급, 즈위프트 레이스 카테고리를 계산. 실내 사이클·즈위프트 훈련용.',
  keywords: [
    'FTP 계산기', 'FTP 테스트', '파워존 계산', '즈위프트 FTP', 'W/kg 등급',
    '사이클 파워존', '20분 파워 테스트', 'Coggan 파워존', '램프 테스트',
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
    q: 'FTP가 뭔가요?',
    a: '<strong>FTP(Functional Threshold Power, 기능적 역치 파워)</strong>는 <strong>1시간 동안 유지할 수 있는 최대 평균 파워(W)</strong>를 뜻합니다. 사이클 훈련 강도의 기준점으로, FTP를 알면 회복·지구력·역치·VO₂max 등 각 훈련 구간을 파워(W)로 정확히 설정할 수 있습니다. 실제로 1시간을 전력으로 타긴 어려워서, 보통 20분·램프 테스트로 추정합니다.',
  },
  {
    q: '20분 테스트에 왜 0.95를 곱하나요?',
    a: '1시간(FTP)보다 <strong>20분은 더 높은 파워</strong>를 낼 수 있기 때문입니다. 20분 전력 평균에 <strong>0.95(95%)</strong>를 곱하면 1시간 유지 가능 파워에 가깝게 보정됩니다. 예를 들어 20분 평균이 260W라면 FTP는 약 247W입니다. 이 방식은 Allen·Coggan의 표준 프로토콜로, 20분 테스트 전 5분 전력 구간을 넣어 무산소 능력을 미리 소진시키는 것이 정석입니다.',
  },
  {
    q: '램프 테스트와 20분 테스트 중 뭐가 정확한가요?',
    a: '<strong>20분 테스트가 더 정확</strong>하다고 보지만 훨씬 고통스럽습니다. 램프 테스트(즈위프트 기본)는 강도를 1분마다 올리다 탈진하는 방식으로, 짧고 편하지만 개인의 무산소 능력에 따라 <strong>과대·과소 추정</strong>될 수 있습니다(최대 1분 파워 × 0.75). 무산소 능력이 좋은 스프린터형은 램프에서 FTP가 높게 나오는 경향이 있습니다. 처음엔 램프로 대략 잡고, 주기적으로 20분 테스트로 보정하는 것을 권합니다.',
  },
  {
    q: 'W/kg는 왜 중요한가요?',
    a: '오르막과 가속에서는 <strong>절대 파워(W)보다 체중당 파워(W/kg)</strong>가 속도를 좌우합니다. 같은 300W라도 60kg 라이더(5.0 W/kg)가 90kg 라이더(3.3 W/kg)보다 언덕을 훨씬 빠르게 오릅니다. 그래서 클라이머는 W/kg을, 평지 스프린터·타임트라이얼은 절대 W를 더 중시합니다. 즈위프트 레이스 카테고리도 대부분 W/kg 기준으로 나눕니다.',
  },
  {
    q: '즈위프트 카테고리는 어떻게 정해지나요?',
    a: '전통적으로 <strong>FTP의 W/kg</strong>으로 나눕니다 — 대략 A(4.0↑)·B(3.2~4.0)·C(2.5~3.2)·D(2.5 미만). 다만 최근에는 W/kg만으로는 페이싱을 못 잡는다는 지적에 따라 <strong>즈위프트 레이싱 스코어(ZRS)</strong> 같은 실제 레이스 결과 기반 배정도 도입되고 있어, 리그·이벤트마다 기준이 다릅니다. 이 계산기의 카테고리는 <strong>전통적 W/kg 기준의 참고값</strong>입니다.',
  },
  {
    q: 'FTP는 얼마나 자주 다시 재나요?',
    a: '보통 <strong>4~6주마다</strong> 재측정합니다. 훈련이 잘 되면 FTP가 오르고, 그에 맞춰 파워존도 다시 계산해야 훈련 강도가 정확해집니다. 다만 테스트 자체가 매우 힘들어 컨디션·수면·더위에 따라 값이 출렁이므로, 한 번의 결과보다 <strong>추세</strong>를 보는 것이 좋습니다. 큰 대회 전에는 테스트로 피로를 쌓지 않도록 시점을 조절하세요.',
  },
]

const RELATED = [
  { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂ Max 계산기', desc: '심폐 체력 추정' },
  { href: '/tools/sports/interval-training', icon: '🔁', name: '인터벌 훈련 계산기', desc: '고강도 인터벌 설계' },
  { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔기록' },
  { href: '/tools/sports/carb-loading', icon: '🍚', name: '카보로딩 계산기', desc: '대회 전 탄수화물' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분·전해질', desc: '실내 라이딩 수분' },
  { href: '/tools/sports/strength-level', icon: '🏋️', name: '파워리프팅 계산기', desc: 'DOTS·1RM' },
]

export default function FtpZonesPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />FTP·파워존 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        20분·램프 테스트로 <strong style={{ color: 'var(--text)' }}>FTP와 7단계 파워존(W)</strong> + W/kg 등급·즈위프트 카테고리.
      </p>

      <FtpZonesClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. FTP 추정식 */}
        <section>
          <h2 style={sectionTitle}>FTP 추정 방법</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>20분 테스트</span> = 20분 평균 파워 × 0.95</div>
            <div><span style={{ color: 'var(--muted)' }}>램프 테스트</span> = 최대 1분 파워 × 0.75</div>
            <div><span style={{ color: 'var(--muted)' }}>8분 테스트</span> = 8분 평균 파워 × 0.90</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ Allen·Coggan <em>Training and Racing with a Power Meter</em> 기준. 실제 역치는 컨디션·측정 조건·무산소 능력에 따라 달라지니 추세로 판단하세요.
          </p>
        </section>

        {/* 2. Coggan 7존 표 */}
        <section>
          <h2 style={sectionTitle}>Coggan 파워존 (FTP 대비 %)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['존', '이름', 'FTP 대비', '목적'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 2 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Z1', '회복', '~55%', '적극적 회복'],
                  ['Z2', '지구력', '56~75%', '유산소 기초·장거리'],
                  ['Z3', '템포', '76~90%', '지속 강도'],
                  ['Z4', '역치', '91~105%', 'FTP 향상 핵심'],
                  ['Z5', 'VO₂max', '106~120%', '최대산소섭취'],
                  ['Z6', '무산소', '121~150%', '무산소 파워'],
                  ['Z7', '신경근', '150%↑', '스프린트'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. W/kg 등급 */}
        <section>
          <h2 style={sectionTitle}>W/kg 등급 참고표</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              ['5.0 W/kg 이상', '엘리트/프로급'],
              ['4.0~5.0', '매우 우수 (레이서)'],
              ['3.2~4.0', '우수 (숙련 동호인)'],
              ['2.5~3.2', '보통 (중급)'],
              ['1.8~2.5', '입문 (초급)'],
              ['1.8 미만', '초보 시작 단계'],
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[0]}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r[1]}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 커뮤니티 통용 참고값(남성 20분 FTP 기준). 성별·연령·종목에 따라 다르며 절대 기준이 아닙니다.
          </p>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
