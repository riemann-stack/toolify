import Link from 'next/link'
import FootballPointsClient from './FootballPointsClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports/football-points',
  title: '축구 승점 계산기 — K리그·EPL 순위 시나리오·우승 가능성',
  description:
    '축구 승점, 득실차, 목표 승점 도달 가능성을 계산합니다. K리그·EPL·라리가 등 주요 리그 프리셋, 라이벌 팀 추격 시나리오, 남은 경기 시뮬레이션.',
  keywords: ['축구승점계산기', 'K리그승점', 'EPL승점', '승점계산', '리그순위계산기', '우승가능성계산', '축구시뮬레이션'],
})

export default function FootballPointsPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚽ 축구 승점·순위 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        승·무·패와 득실차를 입력하면 <strong style={{ color: 'var(--text)' }}>현재 승점·시즌 종료 예상 승점·목표 달성 가능성</strong>을 한 번에 분석합니다. K리그·EPL·라리가·분데스리가 등 주요 리그 프리셋과 라이벌 팀 추격 시나리오, 슬라이더 시뮬레이션을 지원합니다.
      </p>

      <FootballPointsClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 축구 승점 시스템 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            축구 승점 시스템 가이드
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 18px',
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: 1.85,
          }}>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--accent)' }}>현대 표준 (3-1-0)</strong> — 승 3점 / 무 1점 / 패 0점.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.85 }}>
              1981년 잉글랜드 1부 리그(현 EPL의 전신)에서 처음 도입되었으며, 1994년 미국 월드컵부터 FIFA가 공식 채택하면서 전 세계 표준이 되었습니다.
              이전에는 <strong style={{ color: 'var(--text)' }}>2-1-0 시스템</strong>(승 2점)이 사용되었으나, 무승부 가치가 너무 높아 수비적 경기가 늘어나자 “공격 축구를 장려하라”는 명분으로 승점 가치를 1점 더 높였습니다.
            </p>
          </div>
        </div>

        {/* ── 2. 주요 리그 정보표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            주요 리그 정보 — 우승·강등 평균 승점
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['리그', '팀 수', '경기 수', '우승 평균', '강등권 평균'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { l: '🇰🇷 K리그1',    t: '12팀', g: '38경기', c: '75~80점', s: '35점 이하' },
                  { l: '🏴 EPL',         t: '20팀', g: '38경기', c: '85~95점', s: '30점 이하' },
                  { l: '🇪🇸 라리가',    t: '20팀', g: '38경기', c: '85~90점', s: '35점 이하' },
                  { l: '🇮🇹 세리에A',  t: '20팀', g: '38경기', c: '82~88점', s: '32점 이하' },
                  { l: '🇩🇪 분데스리가',t: '18팀', g: '34경기', c: '75~80점', s: '30점 이하' },
                  { l: '🇫🇷 리그앙',    t: '18팀', g: '34경기', c: '78~85점', s: '30점 이하' },
                  { l: '🇯🇵 J리그',     t: '18팀', g: '34경기', c: '70~75점', s: '30점 이하' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.g}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: '#FF8C3E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 승점 범위는 최근 5~10시즌 통계 기준 추정치이며 시즌별로 차이가 있습니다. K리그1은 12팀 체제 기준이며 강등권은 11위(승강 PO) 또는 12위(직강) 기준입니다.
          </p>
        </div>

        {/* ── 3. 순위 결정 기준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            순위 결정 기준 (Tie-Breaker)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            대부분의 리그가 승점이 동률일 때 아래 순서로 순위를 가르지만, <strong style={{ color: 'var(--text)' }}>리그마다 우선순위가 다릅니다.</strong>
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <ol style={{ paddingLeft: 22, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
              <li><strong>1차</strong> — 승점</li>
              <li><strong>2차</strong> — 득실차 (득점 − 실점)</li>
              <li><strong>3차</strong> — 다득점 (Goals For)</li>
              <li><strong>4차</strong> — 상대 전적 (Head-to-Head)</li>
              <li><strong>5차</strong> — 원정 다득점</li>
              <li><strong>6차</strong> — 추첨 또는 플레이오프</li>
            </ol>
          </div>
          <div style={{
            background: 'rgba(62,200,255,0.06)',
            border: '1px solid rgba(62,200,255,0.2)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.8,
            marginTop: 12,
          }}>
            <strong style={{ color: '#3EC8FF' }}>리그별 차이</strong> — EPL·K리그·분데스리가는 <strong>득실차 → 다득점</strong> 순서이지만,
            라리가는 <strong>head-to-head 우선</strong> 적용으로 시즌 막판 동률 다툼에서 결과가 자주 갈립니다.
          </div>
        </div>

        {/* ── 4. 자주 검색되는 시나리오 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 시나리오 예시
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {[
              { q: 'EPL에서 우승하려면 몇 점 필요?', a: '평균 88점 / 안전권 92점 이상', sub: '맨시티 2017–18 시즌 100점 사례 존재' },
              { q: 'K리그1 잔류하려면?',              a: '12팀 체제 기준 약 35점',       sub: '11위 승강 PO / 12위 자동 강등' },
              { q: '챔피언스리그 진출권 (EPL)',       a: '1~4위 — 보통 65~70점',          sub: '5위는 유로파 자동 진출' },
              { q: '수학적 우승 확정이란?',            a: '필요 승점 = 라이벌 최대 승점 + 1', sub: '남은 경기 결과와 무관하게 1위 보장' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: 4, letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 무승부 가치 전략 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 승점 활용 전략 — 무승부 가치
          </h2>
          <div style={{
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid rgba(200,255,62,0.25)',
            borderRadius: '12px',
            padding: '16px 18px',
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: 1.9,
          }}>
            <p style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--accent)' }}>3-1-0 시스템에서</strong>:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>1승 1패 = 3점</li>
              <li>2무 = 2점</li>
              <li>→ 같은 2경기에서 승 1경기가 무 2경기보다 50% 더 많은 승점 획득</li>
            </ul>
            <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13 }}>
              하지만 강팀 상대로 무승부는 <strong style={{ color: 'var(--text)' }}>사실상 승점 획득</strong>입니다. 시즌 막판 “0:0 무승부도 1점은 1점”이라는 말이 나오는 이유입니다. 강등권 팀들은 강팀 원정에서 무승부만 거둬도 잔류 확률이 크게 올라갑니다.
            </p>
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '승점이 같을 때 순위는 어떻게 정해지나요?',
                a: '대부분 리그는 1차 <strong>득실차</strong>, 2차 <strong>다득점</strong> 순으로 결정합니다. EPL과 K리그는 이 방식이지만, 라리가는 <strong>head-to-head(상대 전적)</strong>를 먼저 적용합니다. 분데스리가도 득실차 → 다득점 순서입니다. 리그마다 다르므로 해당 리그 규정을 확인하세요.',
              },
              {
                q: '우승 확정은 언제 가능한가요?',
                a: '수학적으로 라이벌 팀이 남은 경기 모두 승리해도 나의 현재 승점을 따라잡지 못할 때 우승이 확정됩니다. 예를 들어 5경기 남은 시점에서 라이벌과의 격차가 16점 이상이면, 라이벌이 5승(15점)을 거둬도 따라잡을 수 없어 <strong>우승 확정</strong>입니다.',
              },
              {
                q: '잔류는 몇 점 정도면 안전한가요?',
                a: '리그마다 다르지만 <strong>EPL은 40점</strong>이 “안전 승점”으로 통합니다. K리그1은 35점, 분데스리가는 35~38점이 통상적인 잔류 기준입니다. 다만 시즌 양상에 따라 30점 안팎에서 강등이 결정되는 경우도 있어 가능한 한 빨리 잔류 승점을 확보하는 것이 안전합니다.',
              },
              {
                q: '득실차는 왜 중요한가요?',
                a: '승점이 동률일 때 순위를 가르는 핵심 지표이기 때문입니다. 시즌 막판 우승·강등권 다툼에서 <strong>득실차 1점 차이로 순위가 갈리는 사례</strong>가 자주 있습니다. 이 때문에 강팀들은 약팀 상대로 골 차이를 벌리려 하고, 강등권 팀들은 패배해도 실점을 줄이려 노력합니다.',
              },
              {
                q: '챔피언스리그 진출권은 몇 위까지인가요?',
                a: 'EPL·라리가·분데스리가는 <strong>1~4위</strong>, 세리에A는 1~4위(2024–25 시즌부터 1~5위로 확대 가능), 리그앙은 1~3위까지 챔피언스리그 본선·플레이오프 진출권을 가집니다. K리그1은 1위가 챔피언스리그 엘리트, 2~3위가 챔피언스리그 투(아시아 대회) 출전권을 받습니다.',
              },
            ].map((f, i) => (
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
        </div>

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/life/golf-handicap', icon: '⛳', name: '골프 핸디캡 계산기',     desc: 'WHS 방식 핸디캡·코스 핸디캡 계산' },
              { href: '/tools/life/golf-cost',     icon: '🏌️', name: '골프 라운딩 비용 계산기', desc: '그린피·카트·캐디·식사 1인 정산' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',           desc: '다음 경기까지 D-day' },
              { href: '/tools/life/random',        icon: '🎲', name: '랜덤 추첨기',             desc: '대진표·순서 무작위 추첨' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
