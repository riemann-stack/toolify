import Link from 'next/link'
import ShoeMileageClient from './ShoeMileageClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/shoe-mileage',
  title: '러닝화 수명·교체주기 계산기 — 몇 km에 바꿀까',
  description: '주간 거리·체중·미드솔 소재(EVA·TPU·PEBA)로 러닝화 예상 수명(km)과 교체 예상일을 계산. 2족 로테이션 연장 효과와 교체 신호까지.',
  keywords: [
    '러닝화 교체주기', '러닝화 수명', '러닝화 몇 km', '러닝화 로테이션',
    '카본화 수명', '미드솔 수명', '러닝화 교체 시기',
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
    q: '러닝화는 몇 km에 바꿔야 하나요?',
    a: '일반적으로 <strong>500~800km</strong>가 교체 기준으로 통용됩니다. 다만 이는 미드솔 소재·체중·주법에 따라 크게 달라집니다 — 일반 EVA 폼은 400~600km, 내구성 좋은 TPU·슈퍼폼(PEBA)은 500~700km 수준입니다. 위 계산기에 소재·체중·주간 거리를 넣으면 예상 수명과 교체 예상일이 나옵니다. 무엇보다 <strong>km는 참고치</strong>이며, 쿠션이 꺼진 느낌이나 통증이 있으면 수치와 상관없이 바꾸는 게 맞습니다.',
  },
  {
    q: '왜 미드솔이 닳으면 바꿔야 하나요?',
    a: '러닝화의 <strong>충격 흡수는 대부분 미드솔(중창) 폼</strong>이 담당합니다. 오래 쓰면 폼이 반복 압축돼 복원력을 잃고, 겉은 멀쩡해 보여도 <strong>충격이 그대로 무릎·발목·발바닥에 전달</strong>됩니다. 아웃솔(바닥 고무)이 닳지 않았어도 미드솔이 죽었으면 부상 위험이 커지므로 교체가 필요합니다. 그래서 겉모습보다 누적 거리와 착화감으로 판단합니다.',
  },
  {
    q: '2족을 번갈아 신으면 정말 오래 쓰나요?',
    a: '네, 도움이 됩니다. 미드솔 폼은 한 번 눌린 뒤 <strong>완전히 복원되는 데 하루 이상</strong>이 걸립니다. 매일 같은 신발만 신으면 폼이 회복할 시간 없이 계속 압축되지만, <strong>2족 이상을 번갈아 신으면</strong> 쉬는 동안 폼이 회복해 전체 수명이 늘어납니다(연구·브랜드 가이드에서 부상 감소·수명 연장 효과 보고). 소재·용도가 다른 신발을 섞으면 근육 자극도 다양해집니다.',
  },
  {
    q: '카본화(슈퍼슈즈)는 왜 수명이 짧다고 하나요?',
    a: 'PEBA 같은 <strong>슈퍼폼은 반발력이 뛰어난 대신, 레이싱용은 얇고 가볍게 만들어 반발 성능이 빨리 떨어진다</strong>는 인식이 있습니다. 실제 미드솔 내구 거리는 일반화 400~600km 수준으로 데일리화와 비슷하거나 조금 짧게 보기도 합니다. 다만 <strong>"레이스 반발감"이 필요한 대회용</strong>이라면, 내구 한계와 별개로 최고 성능이 유지되는 초반 구간에서 아껴 쓰는 사람이 많습니다. 데일리 슈퍼슈즈는 더 길게 쓸 수 있습니다.',
  },
  {
    q: '체중이 무거우면 더 빨리 닳나요?',
    a: '네. 착지할 때 <strong>미드솔이 받는 충격은 체중에 비례</strong>하므로, 무거울수록 폼이 빨리 압축되어 수명이 짧아지는 경향이 있습니다. 이 계산기도 체중이 클수록 예상 수명을 낮게 잡습니다. 반대로 가벼운 러너는 같은 신발을 더 오래 쓸 수 있습니다. 정확한 수명은 개인차가 크니 참고로만 보세요.',
  },
  {
    q: '누적 거리를 어떻게 기록하나요?',
    a: '가민·애플워치·나이키런클럽·스트라바 같은 앱에서 <strong>신발(기어)을 등록</strong>하면 러닝마다 자동으로 거리가 누적됩니다. 앱을 안 쓴다면 구매일과 대략의 주간 거리로 추정할 수 있습니다. 여러 켤레를 로테이션한다면 각 신발의 거리를 따로 관리해야 정확합니다.',
  },
]

const RELATED = [
  { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔기록 환산' },
  { href: '/tools/sports/carb-loading', icon: '🍚', name: '카보로딩 계산기', desc: '대회 전 탄수화물' },
  { href: '/tools/sports/race-predictor', icon: '⏱️', name: '마라톤 기록 계산기', desc: '완주 예상 시간' },
  { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂ Max 계산기', desc: '심폐 체력 추정' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분·전해질', desc: '여름 러닝 수분' },
  { href: '/tools/sports/ftp-zones', icon: '🚴', name: 'FTP·파워존 계산기', desc: '사이클 훈련존' },
]

export default function ShoeMileagePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />러닝화 수명 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        주간 거리·체중·소재로 <strong style={{ color: 'var(--text)' }}>러닝화 예상 수명(km)과 교체 예상일</strong> + 로테이션 연장 효과.
      </p>

      <ShoeMileageClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 방식 */}
        <section>
          <h2 style={sectionTitle}>수명 계산 방식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>수명(km)</span> = 소재 기본 × 체중보정 × 로테이션</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>소재: EVA 500 · TPU 600 · PEBA 600 (중앙값)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>체중: ~60kg ×1.1 · ~75 ×1.0 · ~90 ×0.9 · 90+ ×0.8</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>2족 로테이션 ×1.15</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 소재별 기본 수명은 브랜드 가이드·러닝 문헌의 통용 범위이며, 체중·로테이션 보정은 관행 배수입니다. 실제 수명은 노면·주법·보관에 따라 달라집니다.
          </p>
        </section>

        {/* 2. 소재별 표 */}
        <section>
          <h2 style={sectionTitle}>미드솔 소재별 수명 가이드</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['소재', '수명', '특징'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['EVA', '400~600km', '가장 흔한 데일리 트레이너 폼'],
                  ['TPU (부스트 등)', '500~700km', '내구성·반발 좋은 발포폼'],
                  ['PEBA (슈퍼폼)', '500~700km', '카본화·레이싱 슈퍼폼 (레이싱용은 짧게 보기도)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 교체 신호 */}
        <section>
          <h2 style={sectionTitle}>이런 신호면 바로 교체하세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '쿠션이 꺼진 느낌', d: '착지가 딱딱해지고 반발이 사라짐' },
              { t: '달린 뒤 관절 통증', d: '무릎·발목·정강이·발바닥이 예전보다 아픔' },
              { t: '아웃솔 마모', d: '바닥 고무가 닳아 미끄럽거나 평평해짐' },
              { t: '미드솔 주름·갈라짐', d: '옆면 폼에 깊은 주름·크랙이 보임' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>⚠️ {c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
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
