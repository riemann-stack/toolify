import Link from 'next/link'
import LifeTimeClient from './LifeTimeClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/life-time',
  title: '생애 시간 계산기 — 기대수명 기준 시간 환산',
  description:
    '기대수명 기준 살아온 날·앞으로의 날을 계산하고, 매일 30분의 행동이 누적되어 만드는 시간 가치를 환산합니다. 메멘토 모리 철학 기반 동기부여 도구.',
  keywords: ['생애시간계산기', '메멘토모리', '인생진행률', '기대수명계산', '시간가치환산', '인생시계', '하루의가치'],
})

export default function LifeTimePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        날짜·시간
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⏳ 생애 시간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        기대수명을 기준으로 시간을 가늠하고, <strong style={{ color: 'var(--text)' }}>오늘을 더 의미 있게 쓰는</strong> 도구입니다.
        성장·균형·메멘토 모리 3가지 톤을 선택할 수 있고, 매일 30분의 작은 습관이 1년·5년 뒤 어떻게 누적되는지 확인할 수 있습니다.
      </p>

      <LifeTimeClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 도구 소개 (긍정적 프레이밍) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            이 도구를 만든 이유
          </h2>
          <div style={{
            background: 'rgba(62,255,155,0.05)',
            border: '1px solid rgba(62,255,155,0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.85,
          }}>
            <p>
              생애 시간 계산기는 시간의 유한성을 직시하기 위한 도구가 아니라,
              <strong style={{ color: 'var(--accent)' }}> 매일의 작은 선택이 어떻게 누적되어 큰 시간이 되는지</strong> 보여주는 도구입니다.
            </p>
            <p style={{ marginTop: 10 }}>
              하루 30분의 독서가 1년이면 약 <strong>182시간</strong>, 10년이면 약 <strong>1,820시간</strong>이 됩니다.
              이는 한 분야의 전문가가 되기에 충분한 시간입니다.
              "시간이 없다"는 말은 종종 "30분이 무력하다"고 느끼기 때문에 생깁니다 — 이 도구는 그 30분의 무게를 다시 보여줍니다.
            </p>
          </div>
        </div>

        {/* ── 2. 메멘토 모리 철학 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📿 메멘토 모리 — 철학적 배경
          </h2>
          <div style={{
            background: 'rgba(155,89,182,0.05)',
            border: '1px solid rgba(155,89,182,0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: 1.9,
          }}>
            <p>
              라틴어 <strong style={{ color: '#D7B6E8' }}>'Memento Mori'</strong>(메멘토 모리)는 <em>"죽음을 기억하라"</em>는 뜻으로,
              고대 로마 시대부터 사용된 철학 개념입니다.
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 10, color: 'var(--muted)' }}>
              <li><strong style={{ color: 'var(--text)' }}>스토아 철학자들</strong>은 시간의 유한성을 자각하면 현재를 더 충실히 살 수 있다고 봤습니다.</li>
              <li>로마 개선장군 행렬 뒤에서 노예가 속삭였다는 <em>“Memento mori”</em> — 영광 속에서도 인간임을 잊지 말라는 의미.</li>
              <li>현대적으로는 <strong style={{ color: 'var(--text)' }}>"시간은 가장 비싼 자원이다"</strong>라는 인식과 연결됩니다.</li>
              <li>본 도구는 무거운 죽음의 카운트다운이 아닌, 시간의 가치를 인식하는 도구입니다.</li>
            </ul>
          </div>
        </div>

        {/* ── 3. 한국인 기대수명 통계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국인 기대수명 통계 (통계청 2024년 기준)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '기대수명', '건강수명'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '남성', l: '80.9세', h: '71.3세' },
                  { c: '여성', l: '86.7세', h: '74.7세' },
                  { c: '평균', l: '83.6세', h: '73.0세' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: '#3EC8FF', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 건강수명: 질병이나 부상으로 활동에 제약이 없는 기간. 실제 수명은 유전·생활습관·환경에 따라 크게 달라집니다.
          </p>
        </div>

        {/* ── 4. 1만 시간 법칙 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 1만 시간 법칙과 시간 환산
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            말콤 글래드웰의 1만 시간 법칙 — “어떤 분야에서 세계적 수준에 도달하려면 약 1만 시간의 의도적 연습이 필요” 라는 가설.
            매일 시간을 어떻게 쓰느냐에 따라 1만 시간 도달 시점이 크게 달라집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {[
              { p: '하루 1시간', t: '27.4년' },
              { p: '하루 2시간', t: '13.7년' },
              { p: '하루 3시간', t: '9.1년' },
              { p: '하루 4시간', t: '6.8년' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{r.p}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{r.t}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            30대에 시작해도 50~60대에 새 분야 전문가가 될 수 있다는 의미입니다. 늦었다고 느낄 때가 가장 빠른 때.
          </p>
        </div>

        {/* ── 5. 시간 활용 명언 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            시간 활용에 관한 통찰
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: '삶이 짧은 게 아니라, 우리가 시간을 낭비할 뿐이다.', a: '세네카 (로마 철학자)' },
              { q: '당신이 가진 가장 비싼 자원은 시간입니다.',          a: '워런 버핏' },
              { q: '오늘 죽을 수 있는 것처럼 행동하라. 그러나 영원히 살 것처럼 계획하라.', a: '마르쿠스 아우렐리우스' },
              { q: '하루를 시작할 때마다 자신에게 말하라 — 오늘은 다시 오지 않는다.',     a: '에픽테토스' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, fontStyle: 'italic', marginBottom: 6 }}>“{m.q}”</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>— {m.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 작은 습관 누적 효과 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🌱 하루 작은 습관의 누적 효과 (실제 연구)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { i: '🏃', t: '주 5회 30분 운동',  e: '평균 수명 +4.2년',                 src: 'Lancet, 2017' },
              { i: '📖', t: '매일 독서 30분',    e: '어휘력·이해력 큰 향상',             src: 'Yale, 2016' },
              { i: '✍️', t: '매일 글쓰기 20분',  e: '정신건강 지표 개선',                src: 'UT Austin, 2005' },
              { i: '🧘', t: '명상 10분/일',      e: '스트레스 호르몬 25% 감소',          src: 'Harvard, 2011' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 22, marginBottom: 6 }}>{r.i}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{r.t}</p>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 4 }}>{r.e}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>출처: {r.src}</p>
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
                q: '이 계산기가 실제 수명을 예측하나요?',
                a: '<strong>아니요.</strong> 본 도구는 한국인 평균 기대수명을 기준으로 시간을 환산해 보여주는 참고용 도구입니다. 실제 수명은 유전·생활습관·환경에 따라 크게 달라집니다. 본 도구는 시간 인식과 동기부여를 위한 가이드일 뿐 의학적 예측이 아닙니다.',
              },
              {
                q: '메멘토 모리가 무엇인가요?',
                a: '라틴어로 <strong>"죽음을 기억하라"</strong>는 뜻이며 고대 로마 시대부터 시간의 유한성을 인식하고 현재를 더 충실히 살기 위한 철학적 개념으로 사용되어 왔습니다. 본 도구는 이 전통을 따르되, 무거움보다 동기부여에 초점을 맞춥니다.',
              },
              {
                q: '매일 30분이 정말 큰 차이를 만드나요?',
                a: '네. 매일 30분을 5년간 지속하면 약 <strong>912시간</strong>이 누적됩니다. 이는 한 분야의 중급자 수준에 충분한 시간이며, 매일 1시간씩 10년이면 약 3,650시간으로 한 분야의 전문가급 시간입니다. <strong>"복리의 힘"</strong>은 시간에도 적용됩니다.',
              },
              {
                q: '기대수명을 직접 입력할 수 있나요?',
                a: '네. 한국 남성·여성 평균 외에도 본인이 원하는 값을 직접 입력할 수 있습니다. 예를 들어 100세를 입력하면 100세 시대를 가정한 시간 환산 결과를 볼 수 있습니다. 다만 이 값은 모두 가정일 뿐이며 실제 예측은 아닙니다.',
              },
              {
                q: '이 도구가 무겁게 느껴진다면 어떻게 해야 하나요?',
                a: '<strong>"성장 모드"</strong>를 선택하시면 살아온 시간의 성취와 앞으로 가능한 시간에 초점을 맞춘 부드러운 톤으로 결과를 볼 수 있습니다. 도구 사용이 부담스럽다면 언제든 닫으셔도 좋습니다. 심리적 어려움이 지속되면 <strong>자살예방상담전화 1393</strong>에서 24시간 무료 상담을 받으실 수 있습니다.',
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
              { href: '/tools/date/dday',    icon: '📅', name: 'D-day 계산기',     desc: '목표일까지 남은 일수' },
              { href: '/tools/date/age',     icon: '🎂', name: '만 나이 계산기',    desc: '법 개정 기준 만 나이' },
              { href: '/tools/unit/time',    icon: '⏱️', name: '시간 단위 변환기',  desc: '1만 시간이 몇 년인지 환산' },
              { href: '/tools/life/pomodoro',icon: '🍅', name: '뽀모도로 타이머',   desc: '오늘의 시간 활용' },
              { href: '/tools/life/zodiac',  icon: '🐯', name: '띠·별자리 계산기',  desc: '생년월일로 띠·별자리 확인' },
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
