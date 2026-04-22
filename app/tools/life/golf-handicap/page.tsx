import type { Metadata } from 'next'
import Link from 'next/link'
import GolfHandicapClient from './GolfHandicapClient'

export const metadata: Metadata = {
  title: '골프 핸디캡 계산기 2026 — WHS 방식 핸디캡 지수·코스 핸디캡 | Youtil',
  description: 'WHS(세계핸디캡시스템) 방식으로 골프 핸디캡 지수를 계산합니다. 스코어 디퍼런셜, 코스 핸디캡, 네트 스코어, 스태블포드 포인트 계산. 최근 20라운드 관리 지원.',
  keywords: ['골프핸디캡계산기', '핸디캡지수계산', 'WHS핸디캡', '코스핸디캡계산기', '스코어디퍼런셜', '네트스코어계산기', '스태블포드계산기', '골프핸디캡'],
}

export default function GolfHandicapPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⛳ 골프 핸디캡 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        WHS(세계핸디캡시스템) 방식으로 핸디캡 지수를 산출하고 코스 핸디캡·네트 스코어·스태블포드 포인트까지 계산합니다.
      </p>

      <GolfHandicapClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 시각화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            WHS 핵심 공식
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '14px', padding: '20px 22px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Score Differential</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6 }}>
                스코어 디퍼런셜 = (그로스 스코어 − 코스 레이팅) × 113 ÷ 슬로프 레이팅
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
                각 라운드의 실력을 "표준 코스(슬로프 113)" 기준으로 환산한 값. 낮을수록 좋은 성적입니다.
              </p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,255,155,0.25)', borderRadius: '14px', padding: '20px 22px' }}>
              <p style={{ fontSize: '12px', color: '#3EFF9B', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Handicap Index</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6 }}>
                핸디캡 지수 = 최근 20라운드 중 최저 N개 평균 × 0.96
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
                라운드 수에 따라 사용하는 디퍼런셜 개수(N)가 달라집니다. 0.96은 "최고 성적이 일반 실력은 아니다"를 보정하는 계수.
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. 계산 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            계산 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,255,155,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#3EFF9B', marginBottom: '8px' }}>예시 1 — 입문자 (5라운드)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                코스레이팅 72.0 / 슬로프 113 동일 코스에서 108, 103, 99, 105, 101타 기록
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '10px' }}>
                디퍼런셜 = (그로스 − 72.0) × 113 ÷ 113 = 그로스 − 72<br/>
                108 → 36.0 · 103 → 31.0 · 99 → 27.0 · 105 → 33.0 · 101 → 29.0<br/>
                <span style={{ color: '#3EFF9B' }}>5라운드 → 최저 1개 사용: 27.0</span><br/>
                핸디캡 지수 = 27.0 × 0.96 = <strong style={{ color: 'var(--accent)' }}>25.9</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 하이 핸디캐퍼 등급. 꾸준히 라운드를 쌓으면 최저 N개가 늘어나 지수가 안정화됩니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>예시 2 — 중급자 (20라운드)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                20라운드 디퍼런셜 중 최저 8개 평균이 10.5라고 가정
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '10px' }}>
                핸디캡 지수 = 10.5 × 0.96 = <strong style={{ color: 'var(--accent)' }}>10.1</strong><br/>
                <br/>
                <span style={{ color: '#C8FF3E' }}>오늘 코스</span> 슬로프 128 / CR 72.5 / 파 72<br/>
                코스 핸디캡 = 10.1 × (128 ÷ 113) + (72.5 − 72) = 11.4 + 0.5 ≈ <strong style={{ color: 'var(--accent)' }}>12</strong><br/>
                <br/>
                <span style={{ color: '#3EC8FF' }}>그로스 85타 쳤다면</span><br/>
                네트 스코어 = 85 − 12 = <strong style={{ color: 'var(--accent)' }}>73 (+1)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 미드 핸디캐퍼 등급. 플레잉 핸디캡은 코스 핸디캡 × 0.95 = 11.</p>
            </div>
          </div>
        </div>

        {/* ── 3. 라운드 수별 사용 디퍼런셜 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            라운드 수별 사용 디퍼런셜 개수
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>제출 라운드 수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>계산에 사용하는 개수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['3',      '최저 1개', '지수 산출 최소 기준'],
                  ['4~5',    '최저 1개', '초기 단계'],
                  ['6~8',    '최저 2개', ''],
                  ['9~11',   '최저 3개', ''],
                  ['12~14',  '최저 4개', ''],
                  ['15~16',  '최저 5개', ''],
                  ['17',     '최저 6개', ''],
                  ['18',     '최저 7개', ''],
                  ['19~20',  '최저 8개', '표준 기준 (안정화)'],
                ].map(([rounds, used, note], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'Syne, sans-serif' }}>{rounds}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{used}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * WHS는 "최고 성적 8개 평균"을 기준으로 하되, 라운드가 부족할 때는 단계적으로 개수를 줄여 운영합니다.
          </p>
        </div>

        {/* ── 4. 슬로프 레이팅 기준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 슬로프 레이팅 기준 안내
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            슬로프 레이팅은 "평균 보기 플레이어 난이도"를 나타내는 수치입니다.
            <strong style={{ color: 'var(--text)' }}>113이 표준 기준값</strong>이며, 숫자가 클수록 일반 아마추어에게 어려운 코스입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
            {[
              { range: '55~95',   level: '매우 쉬움',  color: '#3EFF9B', sub: '짧은 파3 위주 숏코스' },
              { range: '95~110',  level: '쉬운 코스',  color: '#C8FF3E', sub: '넓은 페어웨이, 적은 벙커' },
              { range: '110~125', level: '보통 코스',  color: '#3EC8FF', sub: '한국 주요 골프장 평균 구간' },
              { range: '125~140', level: '어려운 코스', color: '#FF8C3E', sub: '좁은 페어웨이, 많은 해저드' },
              { range: '140~155', level: '최상급 난이도', color: '#FF6B6B', sub: '대회 세팅·프로 토너먼트 코스' },
              { range: '113',     level: '표준 기준값', color: '#FFD700', sub: '공식 기준점, 평균 난이도' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}25`, borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, color: item.color, marginBottom: '4px' }}>{item.range}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{item.level}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>{item.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
              <strong style={{ color: '#3EC8FF' }}>한국 주요 골프장 평균</strong>: 약 118~128 수준.
              스코어카드, 클럽하우스 안내판, 또는 한국골프장경영협회(KGBA) 홈페이지에서 정확한 값을 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* ── 5. 핸디캡 등급 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🏆 핸디캡 등급
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            {[
              { range: '≤ 0',    name: '스크래치',     color: '#FFD700', sub: '프로 수준' },
              { range: '0~9',    name: '로우 핸디캐퍼',  color: '#3EFF9B', sub: '상급자' },
              { range: '10~18',  name: '미드 핸디캐퍼',  color: '#C8FF3E', sub: '중급자' },
              { range: '19~28',  name: '하이 핸디캐퍼',  color: '#FF8C3E', sub: '입문~초급' },
              { range: '29~54',  name: '맥스 핸디캐퍼',  color: '#FF6B6B', sub: '초보자' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.color}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: g.color, marginBottom: '6px' }}>{g.range}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{g.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{g.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: 'WHS 핸디캡은 EGA 핸디캡과 어떻게 다른가요?',
                a: '2020년 세계골프협회가 기존 6개 핸디캡 시스템(EGA·USGA·CONGU 등)을 WHS(World Handicap System)로 통합했습니다. 기존 EGA 방식은 유럽 중심이었고 버퍼존 개념을 사용했지만, WHS는 스코어 디퍼런셜과 0.96 조정 계수를 적용해 더 공정하고 전 세계에서 통용됩니다.',
              },
              {
                q: '코스 레이팅과 슬로프 레이팅은 어디서 확인하나요?',
                a: '골프장 스코어카드, 클럽하우스 안내판, 또는 해당 골프장 공식 홈페이지에서 확인할 수 있습니다. 한국골프장경영협회(KGBA) 홈페이지에서도 조회 가능하며, 티잉 그라운드(블랙·화이트·옐로 등)별로 값이 다르게 표기됩니다.',
              },
              {
                q: '9홀 라운드도 핸디캡 계산에 사용할 수 있나요?',
                a: '네. 9홀 스코어는 두 배로 환산하거나 동일 코스를 두 번 플레이한 것으로 간주해 18홀 디퍼런셜로 변환합니다. 단 9홀 레이팅값이 별도로 필요하며, 본 계산기는 단순 2배 환산 방식을 사용합니다.',
              },
              {
                q: '0.96을 곱하는 이유는?',
                a: 'WHS에서는 선수가 최고 컨디션일 때의 성적을 반영하면서 동시에 "최고 성적이 그 선수의 일반적 실력은 아니다"라는 점을 보정하기 위해 평균에 0.96(약 4% 할인)을 적용합니다. 이를 "봉 팩터(Bonus for Excellence)"라고 부릅니다.',
              },
              {
                q: '핸디캡 지수 최대값은?',
                a: 'WHS 기준 남성 최대 54.0, 여성 최대 54.0입니다. 이전 EGA 방식의 남성 36, 여성 54보다 상향되어 더 많은 초보 골퍼가 공식 핸디캡을 가질 수 있게 됐습니다. 54를 초과하는 디퍼런셜은 자동으로 54로 캡(cap) 처리됩니다.',
              },
              {
                q: '스태블포드와 스트로크 플레이의 차이는?',
                a: '스트로크 플레이는 18홀 총 타수가 기준이며, 스태블포드는 각 홀에서 파 기준 타수에 따라 포인트를 획득합니다(파 2점, 버디 3점 등). 스태블포드는 한 홀에서 크게 망쳐도 0점으로 처리되어 나쁜 홀이 전체 스코어에 미치는 영향이 적어, 아마추어 대회에 널리 쓰입니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',        icon: '📅', name: 'D-day 계산기',        desc: '다음 라운드까지 D-day' },
              { href: '/tools/life/pomodoro',    icon: '🍅', name: '뽀모도로 타이머',       desc: '스윙 연습 루틴 관리' },
              { href: '/tools/life/dutch',       icon: '🍻', name: '더치페이 계산기',       desc: '내기 골프 정산·N빵' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 계산기',  desc: '비거리 향상 체중 관리' },
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
        </div>

      </div>
    </div>
  )
}
