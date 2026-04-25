import type { Metadata } from 'next'
import Link from 'next/link'
import TimeUnitClient from './TimeUnitClient'

export const metadata: Metadata = {
  title: '시간 단위 변환기 — 초·분·시간·일·주·월·년 변환 | Youtil',
  description: '초, 분, 시간, 일, 주, 월, 년 시간 단위를 즉시 변환합니다. 근무시간 기준(8시간/일, 40시간/주) 변환 지원. 10,000시간 법칙 등 인기 사례.',
  keywords: ['시간변환기', '시간단위변환', '10000시간', '근무시간계산', '시간초변환', '주시간변환'],
}

export default function TimeUnitPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⏱️ 시간 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        초, 분, 시간, 일, 주, 월, 년 시간 단위를 즉시 변환합니다. <strong style={{ color: 'var(--text)' }}>근무시간 기준</strong>(8시간/일, 40시간/주) 변환 지원. 10,000시간 법칙 등 인기 검색 사례 포함.
      </p>

      <TimeUnitClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 기본 시간 단위 환산표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            기본 시간 단위 환산표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            가장 자주 쓰이는 시간 단위를 한눈에 비교할 수 있는 환산표입니다. 월은 30일, 년은 365일 기준입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단위', '초(s)', '분(min)', '시간(h)', '일(d)', '년(y)'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { u: '1초',     s: '1',          m: '0.0167',   h: '0.000278',  d: '0.0000116', y: '~3.17e-8' },
                  { u: '1분',     s: '60',         m: '1',        h: '0.0167',    d: '0.000694',  y: '~1.9e-6' },
                  { u: '1시간',   s: '3,600',      m: '60',       h: '1',         d: '0.0417',    y: '0.000114' },
                  { u: '1일',     s: '86,400',     m: '1,440',    h: '24',        d: '1',         y: '0.00274' },
                  { u: '1주',     s: '604,800',    m: '10,080',   h: '168',       d: '7',         y: '0.0192' },
                  { u: '1개월',   s: '2,592,000',  m: '43,200',   h: '720',       d: '30',        y: '0.0822' },
                  { u: '1년',     s: '31,536,000', m: '525,600',  h: '8,760',     d: '365',       y: '1' },
                  { u: '10년',    s: '315,360,000',m: '5,256,000',h: '87,600',    d: '3,650',     y: '10' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.s}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.m}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.h}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.d}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 근무시간 기준 변환표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            근무시간 기준 변환표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            한국 일반 근무 기준(<strong style={{ color: 'var(--text)' }}>1일 8시간, 주 40시간, 월 22일, 연 2,000시간</strong>)으로 환산한 표입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['총 시간', '근무일(8h)', '근무주(40h)', '근무월(22일)', '근무년(2,000h)'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '100시간',    d: '12.5일',   w: '2.5주',    mo: '0.57개월', y: '0.05년' },
                  { t: '500시간',    d: '62.5일',   w: '12.5주',   mo: '2.84개월', y: '0.25년' },
                  { t: '1,000시간',  d: '125일',    w: '25주',     mo: '5.68개월', y: '0.5년' },
                  { t: '2,000시간',  d: '250일',    w: '50주',     mo: '11.36개월',y: '1년' },
                  { t: '5,000시간',  d: '625일',    w: '125주',    mo: '28.4개월', y: '2.5년' },
                  { t: '10,000시간', d: '1,250일',  w: '250주',    mo: '56.8개월', y: '5년' },
                  { t: '20,000시간', d: '2,500일',  w: '500주',    mo: '113.6개월',y: '10년' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{r.t}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.d}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.w}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.mo}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 자주 검색되는 변환 사례 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 변환 사례
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {[
              { q: '10,000시간은 몇 년?', a: '약 1.14년 (24시간 연속), 약 4.8년 (8시간/일 근무 기준)', sub: '말콤 글래드웰 「아웃라이어」 10,000시간 법칙' },
              { q: '1억 초는 몇 년?',     a: '약 3.17년',                                                  sub: '100,000,000초 ÷ 31,536,000초 = 3.17년' },
              { q: '1만 분은 며칠?',       a: '약 6.94일 (≈ 1주)',                                        sub: '10,000분 ÷ 1,440분(하루) = 6.94일' },
              { q: '1년은 몇 분?',         a: '525,600분',                                                sub: '뮤지컬 「렌트」 명곡 “Seasons of Love” 가사' },
              { q: '1년은 몇 초?',         a: '31,536,000초 (약 3,153만 초)',                             sub: '윤년은 31,622,400초' },
              { q: '백만 초는 며칠?',      a: '약 11.57일',                                               sub: '1,000,000초 ÷ 86,400초 = 11.57일' },
              { q: '1주일은 몇 분?',       a: '10,080분',                                                 sub: '7일 × 1,440분/일' },
              { q: '한 달(30일)은 몇 시간?', a: '720시간',                                                 sub: '30일 × 24시간' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: '4px', letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 10,000시간 법칙 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🌟 10,000시간 법칙이란?
          </h2>
          <div style={{ background: 'rgba(200,255,62,0.05)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
              심리학자 <strong style={{ color: 'var(--text)' }}>안데르스 에릭슨</strong>의 연구에서 출발해, 말콤 글래드웰의 베스트셀러 <strong style={{ color: 'var(--text)' }}>「아웃라이어(Outliers)」</strong>를 통해 대중화된 개념입니다. 어떤 분야의 세계적 수준 전문가가 되기 위해서는 약 <strong style={{ color: 'var(--accent)' }}>10,000시간의 의도적 연습(deliberate practice)</strong>이 필요하다는 이론입니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { p: '하루 1시간 (주 5일)',  t: '약 38.5년' },
                { p: '하루 2시간 (주 5일)',  t: '약 19.2년' },
                { p: '하루 3시간 (주 7일)',  t: '약 9.1년' },
                { p: '하루 4시간 (주 5일)',  t: '약 9.6년' },
                { p: '하루 8시간 (주 5일)',  t: '약 4.8년' },
                { p: '24시간 연속 (이론값)', t: '약 1.14년' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.p}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--accent)', fontSize: '14px' }}>{r.t}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px', opacity: 0.8 }}>
              ⚠️ 단순한 시간 누적이 아니라 <strong style={{ color: 'var(--text)' }}>피드백을 받으며 약점을 개선하는 의도적 연습</strong>이 핵심입니다. 같은 일을 반복하는 것만으로는 전문가가 되지 않는다는 점은 에릭슨 본인이 여러 번 강조한 부분입니다.
            </p>
          </div>
        </div>

        {/* ── 5. 시간 관련 명언 + 환산 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            시간 관련 명언 + 환산
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { quote: '"Time is money."',                      author: '벤저민 프랭클린', conv: '하루 24시간 = 1,440분 = 86,400초. 1초도 다시 오지 않습니다.' },
              { quote: '"525,600 minutes... how do you measure a year in the life?"', author: '뮤지컬 「Rent」 — Seasons of Love', conv: '1년 = 525,600분 = 31,536,000초' },
              { quote: '"잃어버린 시간은 결코 다시 찾을 수 없다."', author: '벤저민 프랭클린', conv: '인생 80년 ≈ 700,800시간 ≈ 4,204만 분' },
              { quote: '"천재는 1%의 영감과 99%의 노력이다."',     author: '토머스 에디슨',   conv: '하루 8시간 × 30년 = 약 87,600시간의 노력' },
              { quote: '"한 시간을 잘못 보내는 것이 한평생을 잘못 사는 것이다."', author: '한국 속담',        conv: '인생 80년 = 약 70만 시간. 1시간은 0.00014%' },
            ].map((q, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '6px', fontStyle: 'italic' }}>{q.quote}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>— {q.author}</p>
                <p style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: 1.6, opacity: 0.9 }}>📊 {q.conv}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '한 달은 30일, 31일, 28일 중 어떤 기준인가요?',
                a: '본 변환기에서는 가장 일반적으로 쓰이는 평균값인 <strong>30일 기준</strong>을 사용합니다. 정확한 환산이 필요하다면 일(day) 단위로 직접 입력하세요. 평균 그레고리력 1개월은 30.44일입니다.',
              },
              {
                q: '1년이 365일이면 윤년은 어떻게 처리되나요?',
                a: '본 도구는 일반 해를 기준으로 한 <strong>365일 = 1년</strong>으로 환산합니다. 윤년은 366일이며, 4년 평균으로는 365.25일이 더 정확합니다. 정밀한 천문학적 계산이 필요하다면 별도 보정이 필요합니다.',
              },
              {
                q: '근무 기준 변환의 “연 2,000시간”은 어떻게 나온 숫자인가요?',
                a: '한국 노동법상 주 40시간 × 52주 = 2,080시간이지만, 휴가·공휴일을 빼면 일반적으로 <strong>연 2,000시간 안팎</strong>을 표준 근로 시간으로 봅니다. OECD 평균 근로시간 비교 시 자주 인용되는 기준입니다.',
              },
              {
                q: '10,000시간 법칙은 정말 사실인가요?',
                a: '원 연구자인 안데르스 에릭슨은 “10,000시간”이라는 정확한 숫자보다 <strong>의도적 연습(deliberate practice)의 질</strong>이 핵심이라고 강조합니다. 분야와 개인차에 따라 5,000시간으로도 가능하거나 20,000시간이 필요할 수도 있습니다.',
              },
              {
                q: '“N년 N개월” 형태로 표시하려면?',
                a: '본 변환기는 단일 단위 환산이 목적입니다. <strong>“N년 N개월”</strong> 형태가 필요하면 D-day 계산기나 날짜 차이 계산기를 활용하세요. 예: 1.5년 → 1년 6개월.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}
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
              { href: '/tools/date/dday',     icon: '📅', name: 'D-day 계산기',     desc: '목표일까지 남은 일수' },
              { href: '/tools/date/age',      icon: '🎂', name: '만 나이 계산기',     desc: '법 개정 기준 만 나이' },
              { href: '/tools/life/pomodoro', icon: '🍅', name: '뽀모도로 타이머',    desc: '25분 집중·5분 휴식 사이클' },
              { href: '/tools/date/diff',     icon: '📆', name: '날짜 차이 계산기',   desc: '두 날짜 사이 기간 계산' },
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
