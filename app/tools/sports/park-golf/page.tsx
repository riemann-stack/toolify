import Link from 'next/link'
import ParkGolfClient from './ParkGolfClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/park-golf',
  title: '파크골프 스코어카드 — 9홀·18홀 점수 계산기',
  description: '파크골프 스코어카드 계산기 — 9홀 파33·18홀 파66, 최대 4인 동반 실시간 합계·순위 + OB 2벌타 규칙·라운드 기록 저장. 대한파크골프협회 경기규칙 기준.',
  keywords: [
    '파크골프 스코어카드', '파크골프 점수 계산', '파크골프 규칙', '파크골프 OB 벌타',
    '파크골프 파33', '파크골프 용어', '파크골프 스코어 기록', '파크골프장',
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
    q: '파크골프 9홀은 파 몇인가요?',
    a: '표준 9홀은 <strong>파33 — 파3 홀 4개 + 파4 홀 4개 + 파5 홀 1개</strong> 구성입니다(국내·국제 공통). 18홀(2코스)은 파66이에요. 홀 길이는 국내 협회 계열 기준 파3 40~60m, 파4 60~100m, 파5 100~150m로 9홀 합계 500~790m이고, 국제파크골프협회(IPGA) 기준은 1홀 최대 100m·9홀 총 500m 이내로 더 짧습니다. 구장마다 홀 순서·배치가 다르니 위 스코어카드에서 홀별 파를 조정해 쓰세요.',
  },
  {
    q: 'OB가 나면 몇 벌타인가요?',
    a: '대한파크골프협회 경기규칙은 <strong>"모든 벌타는 2타"</strong> 체계라 OB도 2벌타입니다. 처리 방법은 공이 나간 것으로 추정되는 지점에서 깃대를 바라보고 서서 <strong>좌우 2클럽 이내, 홀컵에 가깝지 않은 곳</strong>에 공을 놓고 계속 칩니다(홀컵 쪽에 놓으면 추가 2벌타). 예를 들어 티샷이 OB면 티샷 1타 + 벌타 2타로 다음 샷이 4타째예요. 스코어카드에는 벌타를 합산한 총 타수를 적습니다.',
  },
  {
    q: '버디·이글 같은 용어를 파크골프에서도 쓰나요?',
    a: '네, 골프와 동일합니다. 기준 타수(파) 대비 <strong>−1 버디, −2 이글, −3 알바트로스, +1 보기, +2 더블보기</strong>이고, 파의 2배를 치면 더블파(속칭 양파)예요. 파크골프는 홀이 짧아 <strong>파4·파5에서도 홀인원이 실제로 나옵니다</strong> — 파4 홀인원은 −3으로 알바트로스와 같은 값이죠. 위 스코어카드는 입력하면 용어를 자동으로 표시해 줍니다.',
  },
  {
    q: '한 홀 최대 타수 제한(양파 컷)이 있나요?',
    a: '<strong>공식 경기규칙에는 최대 타수 제한이 없습니다</strong> — 원칙은 홀아웃(컵인)까지 치는 것이에요. 다만 진행 속도를 위해 대회위원회나 구장에서 <strong>더블파(파의 2배)에서 끊는 로컬룰</strong>을 두는 관행이 흔하고, 파+4로 정하는 곳도 있습니다. 위 스코어카드의 &lsquo;더블파 컷&rsquo; 옵션을 켜면 로컬룰대로 입력이 제한돼요.',
  },
  {
    q: '몇 명이 한 조로 치나요? 순서는요?',
    a: '경기규칙상 조 편성은 <strong>3~4명</strong>이 원칙입니다. 1번 홀 티샷 순서는 추첨(번호 뽑기 등)으로 정하고, <strong>2번 홀부터는 직전 홀에서 가장 적게 친 사람이 먼저</strong> 칩니다(아너·동타면 이전 순서 유지). 티샷은 반드시 티 위에 공을 올려서 치고, 조원 전원이 홀아웃할 때까지 그린 주변에서 기다리는 게 매너이자 규칙이에요.',
  },
  {
    q: '파크골프 클럽과 공 규격은요?',
    a: '클럽은 <strong>1자루만</strong> 사용합니다(경기규칙 제7조) — 전장 86cm 이하, 무게 600g 이하, 헤드는 목재. 시판품 실중량은 440~565g대예요. 공은 <strong>지름 6cm, 무게 80~95g</strong>의 합성수지 재질(물에 뜹니다). 골프처럼 클럽을 바꿔 드는 게임이 아니라 한 자루로 티샷부터 퍼팅까지 해결하는 것이 파크골프의 핵심 재미입니다.',
  },
  {
    q: '전국에 파크골프장이 얼마나 있나요?',
    a: '대한파크골프협회 집계 기준 <strong>2025년 7월 말 약 490개소</strong>로, 2020년(254개소)의 약 2배로 늘었습니다(비공인 구장 포함 1,000여 개소 추산 보도도 있어요). 협회 등록 회원은 2025년 약 23만 명에 도달했고, 비등록 동호인까지 포함하면 50만~100만 명 수준으로 추정하는 보도가 있습니다(공식 통계는 없음). 60대 이상에게 무릎 부담이 적은 생활체육으로 인기가 높아요.',
  },
]

const RELATED = [
  { href: '/tools/sports/golf-handicap', icon: '⛳', name: '골프 핸디캡 계산기', desc: '라운드 기록 핸디 산출' },
  { href: '/tools/sports/golf-distance', icon: '🏌️', name: '골프 거리 계산기', desc: '클럽별 비거리 관리' },
  { href: '/tools/sports/golf-cost', icon: '💰', name: '골프 비용 계산기', desc: '라운드 비용 정산' },
  { href: '/tools/sports/hiking-time', icon: '⛰️', name: '등산 시간 계산기', desc: '코스별 소요 시간' },
  { href: '/tools/life/dutch', icon: '🍻', name: '더치페이 계산기', desc: '라운드 후 정산' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분 계산기', desc: '야외 운동 수분 보충' },
]

export default function ParkGolfPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />파크골프 스코어카드
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        9홀 파33부터 18홀까지 — <strong style={{ color: 'var(--text)' }}>최대 4인 실시간 합계·순위</strong>에 라운드 기록 저장까지. 종이 스코어카드는 이제 그만.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="대한파크골프협회 경기규칙 (파 구성·OB 2벌타·조 편성) + IPGA 코스 기준"
        sources={[
          { label: '대한파크골프협회', href: 'https://www.kpga7330.com' },
        ]}
      />

      <ParkGolfClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 스코어 용어 */}
        <section>
          <h2 style={sectionTitle}>스코어 용어 — 골프와 똑같아요</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['파 대비', '명칭', '파4 홀 기준'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['−3', '알바트로스', '1타 (홀인원)'],
                  ['−2', '이글', '2타'],
                  ['−1', '버디', '3타'],
                  ['0', '파', '4타'],
                  ['+1', '보기', '5타'],
                  ['+2', '더블보기', '6타'],
                  ['파×2', '더블파 (양파)', '8타'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 파크골프는 홀이 짧아 파4·파5 홀인원도 실제로 나옵니다 — 파4 홀인원은 −3으로 알바트로스와 같은 값이에요.
          </p>
        </section>

        {/* 2. OB 규칙 */}
        <section>
          <h2 style={sectionTitle}>OB 처리 3단계 — 스코어가 갈리는 지점</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '1️⃣ 2벌타 가산', d: '협회 규칙상 모든 벌타는 2타. OB가 확인되면 지금까지 친 타수에 2벌타를 더합니다. 티샷 OB면 1+2=3타 소진.' },
              { t: '2️⃣ 처치 위치', d: '공이 나간 것으로 추정되는 지점에서 깃대를 보고 서서 좌우 2클럽 이내, 홀컵에 가깝지 않은 곳에 공을 놓아요.' },
              { t: '3️⃣ 다음 샷 계산', d: '티샷 OB라면 처치 후 치는 샷이 4타째. 그 샷이 바로 컵인되면 총 4타 — 파4 홀이면 파로 기록됩니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 처치한 공을 홀컵 쪽(전방)에 놓으면 추가 2벌타가 붙으니 주의하세요. 벌타는 별도 칸이 아니라 홀 타수에 합산해 기록합니다.
          </p>
        </section>

        {/* 3. 코스 규격 */}
        <section>
          <h2 style={sectionTitle}>코스 규격 — 국내 기준 vs 국제 기준</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>🇰🇷 국내 (협회 계열 공인)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>파3 40~60m · 파4 60~100m · 파5 100~150m</li>
                <li>9홀 합계 500~790m — 확장형 코스 허용</li>
                <li>9홀 파33 (파3×4 + 파4×4 + 파5×1)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-health)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--cat-health)', fontWeight: 700, marginBottom: 8 }}>🌏 국제 (IPGA·일본 NPGA 기준)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>1홀 최대 100m</li>
                <li>9홀 총 500m 이내 — 콤팩트 지향</li>
                <li>파 구성은 국내와 동일 (9홀 파33)</li>
              </ul>
            </div>
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
