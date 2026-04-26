import type { Metadata } from 'next'
import Link from 'next/link'
import BaseballStatsClient from './BaseballStatsClient'
import AdSlot from '@/components/AdSlot'

export const metadata: Metadata = {
  title: '야구 타율·OPS 계산기 — 출루율·장타율·ERA·WHIP 계산 | Youtil',
  description:
    '야구 타격 기록(타율·출루율·장타율·OPS)과 투수 기록(ERA·WHIP·K/9) 자동 계산. KBO·MLB 리그 평균 비교, 시즌 페이스 환산, 세이버메트릭스 지표 지원.',
  keywords: ['야구타율계산기', 'OPS계산기', '출루율계산기', '장타율계산기', 'ERA계산기', 'WHIP계산기', 'KBO기록', '야구통계계산기'],
}

export default function BaseballStatsPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚾ 야구 타율·OPS 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        타수·안타·홈런·볼넷을 입력하면 <strong style={{ color: 'var(--text)' }}>타율·출루율·장타율·OPS</strong>를 자동 계산하고, KBO·MLB·NPB 리그 평균과 비교합니다. 투수 ERA·WHIP·K/9·FIP, ISO·BABIP·wOBA 등 세이버메트릭스, 시즌 페이스 환산까지 한 번에.
      </p>

      <BaseballStatsClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 타격 지표 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            야구 핵심 타격 지표 공식
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>타율 (AVG)</span> = 안타 ÷ 타수</div>
            <div><span style={{ color: 'var(--muted)' }}>출루율 (OBP)</span> = (안타 + 볼넷 + 사구) ÷ (타수 + 볼넷 + 사구 + 희생플라이)</div>
            <div><span style={{ color: 'var(--muted)' }}>장타율 (SLG)</span> = 루타수 ÷ 타수</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 루타수 = 1루타 + 2루타×2 + 3루타×3 + 홈런×4</div>
            <div><span style={{ color: 'var(--muted)' }}>OPS</span> = 출루율 + 장타율</div>
          </div>
        </div>

        {/* ── 2. OPS 수준 평가 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            OPS 수준 평가 기준
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['OPS', '평가', '대표 선수 (예시)'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { ops: '1.000+',       lv: '🌟 MVP급',       cls: '#FFD700', who: '이정후·트라웃 시즌급' },
                  { ops: '0.900~1.000',  lv: '✅ 올스타급',     cls: '#C8FF3E', who: 'KBO 상위 5%' },
                  { ops: '0.800~0.900',  lv: '주전급',          cls: '#3EFF9B', who: 'KBO 상위 20%' },
                  { ops: '0.700~0.800',  lv: '평균',            cls: '#B8B8B0', who: '리그 평균 수준' },
                  { ops: '0.600~0.700',  lv: '🔶 평균 이하',    cls: '#FF8C3E', who: '백업 후보' },
                  { ops: '0.600 미만',   lv: '❌ 교체 권장',    cls: '#FF6B6B', who: '마이너급' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.ops}</td>
                    <td style={{ padding: '10px 12px', color: r.cls, fontWeight: 600 }}>{r.lv}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.who}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 투수 핵심 지표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            투수 핵심 지표
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>ERA (평균자책점)</span> = (자책점 × 9) ÷ 투구이닝</div>
            <div><span style={{ color: 'var(--muted)' }}>WHIP (이닝당 출루)</span> = (피안타 + 볼넷) ÷ 투구이닝</div>
            <div><span style={{ color: 'var(--muted)' }}>K/9</span> = (탈삼진 × 9) ÷ 투구이닝</div>
            <div><span style={{ color: 'var(--muted)' }}>K/BB</span> = 탈삼진 ÷ 볼넷</div>
            <div><span style={{ color: 'var(--muted)' }}>FIP (간이)</span> = (13×HR + 3×(BB+HBP) − 2×K) ÷ IP + 3.1</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ FIP = 수비·운 요소 제거한 투수 진짜 실력</div>
          </div>
        </div>

        {/* ── 4. 세이버메트릭스 입문 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            세이버메트릭스 입문 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { name: 'ISO', kor: '순수 장타율', formula: 'SLG − AVG', tip: '단타 외 장타 비율 측정. 0.200 이상 = 슬러거급.', color: '#FFD700' },
              { name: 'BABIP', kor: '인플레이 타율', formula: '(H − HR) ÷ (AB − K − HR + SF)', tip: '인플레이 타구의 타율. 0.300 평균, 0.350+ 운빨 의심, 0.250- 불운.', color: '#3EC8FF' },
              { name: 'wOBA', kor: '가중 출루율', formula: '타격 행위별 가중치 통합', tip: '출루율보다 정확한 타자 가치 측정. 0.370+ 엘리트급.', color: '#C8FF3E' },
              { name: 'FIP', kor: '수비 무관 ERA', formula: 'HR·BB·K만 사용', tip: 'ERA보다 낮으면 운 나빴음, 높으면 운 좋았음 신호.', color: '#FF8C3E' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: s.color, marginBottom: 6, fontFamily: 'Syne, sans-serif' }}>{s.name} <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 400 }}>— {s.kor}</span></p>
                <p style={{ fontSize: 12, color: 'var(--text)', fontFamily: "'JetBrains Mono', Menlo, monospace", marginBottom: 6, opacity: 0.85 }}>{s.formula}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. KBO 역대 기록 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            KBO 역대 단일시즌 주요 기록
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 10 }}>타자</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
                <li>최다 안타 — <strong>서건창 201개 (2014)</strong></li>
                <li>최다 홈런 — <strong>이승엽 56개 (2003)</strong>, 박병호 53개 (2015)</li>
                <li>최고 타율 — <strong>백인천 0.412 (1982, 단축)</strong></li>
                <li>최고 OPS — <strong>이승엽 1.124 (2003)</strong></li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, marginBottom: 10 }}>투수</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
                <li>최저 ERA — <strong>선동열 0.78 (1993)</strong></li>
                <li>최다 탈삼진 — <strong>최동원 223개 (1984)</strong></li>
                <li>최다 승 — <strong>정민철 25승 (1996)</strong></li>
                <li>최다 세이브 — <strong>오승환 47세이브 (2006)</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 6. 자주 검색되는 질문 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 시나리오
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { q: '"3할 타자" 기준은?', a: '타율 0.300 = 10타석 3안타', sub: 'KBO 전체 타자 중 10~15%만 달성' },
              { q: '20-20 클럽',         a: '시즌 20+ 홈런 + 20+ 도루', sub: '파워와 스피드 겸비한 5툴 지표' },
              { q: '30-30 클럽',         a: '시즌 30+ 홈런 + 30+ 도루', sub: 'KBO에서 손에 꼽히는 위업' },
              { q: '퀄리티스타트 (QS)',  a: '선발 6이닝+ / 자책 3점 이하', sub: '선발 투수의 기본 평가 지표' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: 4, letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: 'OPS와 wOBA 중 어느 게 더 정확한가요?',
                a: 'wOBA가 이론적으로 더 정확합니다. OPS는 출루율과 장타율을 단순 합산하지만, wOBA는 각 타격 행위(볼넷·1루타·홈런 등)에 다른 가중치를 부여합니다. 다만 OPS는 계산이 간단하고 직관적이라 일반 팬들에게 더 널리 쓰이며, 본 계산기도 두 지표를 모두 제공합니다.',
              },
              {
                q: '타율 3할의 의미는 무엇인가요?',
                a: '타율 0.300(3할)은 100번 타석에 30번 안타를 친다는 의미로 KBO·MLB 모두에서 우수 타자의 기준선으로 통합니다. KBO 전체 타자 중 약 10~15%만이 3할을 달성합니다. 4할(0.400)은 단축시즌 외에는 사실상 불가능에 가까운 기록입니다.',
              },
              {
                q: 'ERA와 FIP 중 어느 것을 봐야 하나요?',
                a: 'ERA는 실제 자책점 기반이라 직관적이지만 수비력에 영향을 받습니다. <strong>FIP는 투수가 직접 컨트롤하는 요소(삼진·볼넷·홈런)만으로 계산</strong>해 투수의 진짜 실력을 더 정확히 보여줍니다. ERA보다 FIP가 낮으면 운이 좋았다는 신호, ERA보다 FIP가 높으면 운이 나빴다는 신호입니다.',
              },
              {
                q: '투수 이닝에서 5.1, 5.2는 무슨 의미인가요?',
                a: '<strong>5.1 = 5와 1/3 이닝</strong>(5이닝 + 아웃 1개 더), <strong>5.2 = 5와 2/3 이닝</strong>입니다. 야구는 한 이닝 = 3아웃이므로 1/3·2/3 이닝 단위로 표기합니다. 본 계산기는 자동으로 정확한 분수로 변환해 ERA를 계산합니다.',
              },
              {
                q: '사회인 야구에서도 같은 공식을 쓰나요?',
                a: '네, 타율·OPS 등 기본 공식은 동일합니다. 다만 사회인 야구는 게임 수가 적고 타석 수도 부족해 프로 기준의 평가는 적절하지 않습니다. 본인 팀 평균과 비교하거나 자신의 시즌별 발전을 추적하는 용도로 활용하세요.',
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

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/sports/football-points', icon: '⚽', name: '축구 승점 계산기',         desc: '승무패·득실차·시즌 시나리오' },
              { href: '/tools/life/golf-handicap',     icon: '⛳', name: '골프 핸디캡 계산기',       desc: 'WHS 방식 핸디캡·코스 핸디캡' },
              { href: '/tools/life/golf-distance',     icon: '🎯', name: '골프 클럽 비거리 계산기', desc: '클럽별 비거리·Gap 분석' },
              { href: '/tools/life/golf-cost',         icon: '🏌️', name: '골프 라운딩 비용 계산기', desc: '그린피·카트·캐디 1인 정산' },
              { href: '/tools/life/random',            icon: '🎲', name: '랜덤 추첨기',             desc: '대진표·순서 무작위 추첨' },
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
