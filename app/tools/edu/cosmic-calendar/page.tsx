import Link from 'next/link'
import CosmicCalendarClient from './CosmicCalendarClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/edu/cosmic-calendar',
  title: '코스믹 캘린더 — 138억 년 우주 역사를 1년으로 압축',
  description: '빅뱅부터 인류까지 138억 년의 우주 역사를 1년 달력으로 압축한 인터랙티브 타임라인. 지구·생명·공룡·인류 등장 시점, 12월 31일 인류의 시간, 칼 세이건 코스믹 캘린더 시각화.',
  keywords: ['코스믹캘린더', '우주달력', '우주역사', '빅뱅', '칼세이건', '우주시간', '인류역사', '우주시각화', '138억년', '우주1년'],
})

export default function CosmicCalendarPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        교육·학습
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🌌 코스믹 캘린더
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        칼 세이건이 만든 <strong style={{ color: 'var(--text)' }}>138억 년 우주 역사를 1년으로 압축</strong>한 인터랙티브 타임라인.
        빅뱅·은하·태양계·생명·공룡·인류 등장을 우주 달력 위에서 시각화하고, <strong style={{ color: 'var(--text)' }}>내 인생이 우주 1년에서 몇 초인지</strong>도 계산합니다.
      </p>

      <CosmicCalendarClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 코스믹 캘린더란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            코스믹 캘린더란?
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>코스믹 캘린더(Cosmic Calendar)</strong>는 천문학자 <strong style={{ color: '#C485E0' }}>칼 세이건</strong>이 그의 책
            "에덴의 용(The Dragons of Eden, 1977)"에서 제안한 개념입니다.
            138억 년의 우주 역사를 1년(365일)으로 압축해, 인간이 직관적으로 이해하기 어려운 우주의 시간 스케일을 체감하게 합니다.
          </div>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
            marginTop: 12,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>1년</span> = 138억 년</div>
            <div><span style={{ color: 'var(--muted)' }}>1일</span> ≈ 3,778만 년</div>
            <div><span style={{ color: 'var(--muted)' }}>1시간</span> ≈ 157만 년</div>
            <div><span style={{ color: 'var(--muted)' }}>1분</span> ≈ <strong style={{ color: '#3EFFD0' }}>26,200년</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>1초</span> ≈ <strong style={{ color: '#3EFFD0' }}>437년</strong></div>
          </div>
        </div>

        {/* ── 2. 주요 사건 요약 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            우주 달력의 주요 사건 (요약)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['코스믹 날짜', '사건', '실제 연도'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i === 2 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '1월 1일',           e: '💥 빅뱅 (우주 탄생)',         r: '138억 년 전',  c: '#9B59B6' },
                  { d: '1월 22일',          e: '🌌 최초의 은하 형성',         r: '134억 년 전',  c: '#9B59B6' },
                  { d: '3월 16일',          e: '🌠 우리 은하수 형성',         r: '135억 년 전',  c: '#9B59B6' },
                  { d: '8월 31일',          e: '☀️ 태양계 형성',              r: '46억 년 전',   c: '#FFD700' },
                  { d: '9월 2일',           e: '🌍 지구 형성',                r: '45.4억 년 전', c: '#3EC8FF' },
                  { d: '9월 21일',          e: '🦠 최초의 생명',              r: '38억 년 전',   c: '#3EFF9B' },
                  { d: '12월 17일',         e: '🦑 캄브리아기 대폭발',        r: '5.4억 년 전',  c: '#3EFF9B' },
                  { d: '12월 25일',         e: '🦕 공룡 등장',                r: '2.3억 년 전',  c: '#3EFF9B' },
                  { d: '12월 30일',         e: '☄️ 공룡 멸종 / 영장류',       r: '6,600만 년 전',c: '#3EFF9B' },
                  { d: '12월 31일 22:24',   e: '🧍 인류 조상',                r: '400만 년 전',  c: '#FF8C3E' },
                  { d: '12월 31일 23:48',   e: '👤 현생 인류',                r: '30만 년 전',   c: '#FF8C3E' },
                  { d: '12월 31일 23:59:32',e: '🌾 농업 혁명',                r: '12,000년 전',  c: '#FF6B6B' },
                  { d: '12월 31일 23:59:46',e: '📜 문자 발명',                r: '5,500년 전',   c: '#FF6B6B' },
                  { d: '12월 31일 23:59:59.4',e: '⚙️ 산업혁명',               r: '250년 전',     c: '#FF6B6B' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#3EFFD0', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: r.c, marginRight: 8, verticalAlign: 'middle' }} />
                      {r.e}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 12월 31일 충격 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            12월 31일의 충격 — 인류의 시간
          </h2>
          <div style={{
            background: 'rgba(255,107,107,0.05)',
            border: '1px solid rgba(255,107,107,0.30)',
            borderRadius: 14,
            padding: '18px 22px',
            fontSize: 13.5,
            color: 'var(--text)',
            lineHeight: 2,
          }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>인류는 우주 달력의 마지막 <strong style={{ color: '#FF8C8C' }}>1시간 36분</strong>에 등장했습니다.</li>
              <li>현생 인류(호모 사피엔스)는 마지막 <strong style={{ color: '#FF8C8C' }}>12분</strong>.</li>
              <li>문자가 발명된 후 모든 인류 역사는 마지막 <strong style={{ color: '#FF8C8C' }}>14초</strong>.</li>
              <li>산업혁명 이후는 <strong style={{ color: '#FF8C8C' }}>0.6초</strong>.</li>
              <li>인터넷 시대는 <strong style={{ color: '#FF8C8C' }}>0.07초</strong>.</li>
            </ul>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
              인류의 모든 문명·과학·예술은 우주 1년 중 마지막 30초에 만들어졌습니다.
            </p>
          </div>
        </div>

        {/* ── 4. 압축 단위 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            우주 1년 vs 24시간 vs 1km 비교
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🗓️ 1년 압축',       c: '#9B59B6', items: ['인류 등장: 12월 31일 23:48', '인류 문명: 마지막 14초', '산업혁명: 마지막 0.6초'] },
              { t: '🕐 24시간 압축',    c: '#3EFFD0', items: ['인류 등장: 23:59:58', '인류 문명: 마지막 0.075초', '산업혁명: 마지막 0.0016초'] },
              { t: '📐 1km 압축',       c: '#FFD700', items: ['1m = 1,380만 년', '인류 등장: 999.978m', '인류 문명: 마지막 0.9mm'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => (<li key={j}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 138억 년 핵심 시기 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            우주 138억 년의 핵심 시기
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '초기 우주 (1월~3월)',        c: '#9B59B6', d: '빅뱅, 원자 형성, 최초의 별·은하 등장' },
              { t: '별·행성의 시대 (3월~8월)',    c: '#FFD700', d: '별이 폭발하며 무거운 원소 생성, 우주의 화학적 다양성 확대' },
              { t: '태양계와 지구 (9월)',         c: '#3EC8FF', d: '태양 형성, 지구·달 형성, 생명이 등장' },
              { t: '생명의 진화 (10월~12월)',     c: '#3EFF9B', d: '단세포 → 다세포 → 동식물, 캄브리아기 폭발 → 공룡 → 포유류' },
              { t: '인류의 등장 (12월 31일)',     c: '#FF6B6B', d: '단 하루 안에 모든 인류 진화·문명 발생' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 칼 세이건 관점 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            칼 세이건의 코스믹 관점
          </h2>
          <div style={{
            background: 'rgba(155,89,182,0.06)',
            borderLeft: '4px solid #9B59B6',
            borderRadius: 8,
            padding: '16px 20px',
            fontStyle: 'italic',
            fontFamily: '"Noto Sans KR", sans-serif',
            color: 'var(--text)',
            fontSize: 14,
            lineHeight: 1.85,
          }}>
            "우리는 별의 잔해다. 우주가 자신을 알아가기 위한 한 방법이다."
            <br /><br />
            "우리 모두는 별의 자녀다. 별의 잔해로 만들어진 존재다."
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
            칼 세이건은 코스믹 캘린더를 통해 두 가지 메시지를 전했습니다:
            <ul style={{ paddingLeft: 22, margin: '8px 0 0', color: 'var(--muted)' }}>
              <li><strong style={{ color: 'var(--text)' }}>인류의 짧음에 대한 겸손</strong> — 우주 시간에서 우리는 마지막 14초</li>
              <li><strong style={{ color: 'var(--text)' }}>인류의 특별함에 대한 경이</strong> — 우주가 우주를 이해하는 유일한 존재</li>
            </ul>
          </div>
        </div>

        {/* ── 7. 우주 시간 이해의 의미 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            우주 시간 이해의 의미
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🤔 철학적 사색', d: '인간 중심 사고에서 벗어나는 관점, 종교·철학적 출발점' },
              { t: '🌱 환경 책임감', d: '우리가 머무는 시간이 짧음을 자각, 환경 보호의 시간적 책임' },
              { t: '🎓 과학 교육',  d: '학교 천문학·진화론 수업, 박물관 전시, 다큐멘터리 자료' },
              { t: '📲 SNS 콘텐츠', d: '"내 30년 인생 = 0.07초" 같은 충격적 사실 공유' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#3EFFD0', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '코스믹 캘린더는 누가 만들었나요?',
                a: '미국 천문학자 <strong>칼 세이건(Carl Sagan, 1934-1996)</strong>이 1977년 책 "에덴의 용"에서 처음 제안했습니다. 이후 그의 다큐멘터리 <strong>"코스모스(Cosmos, 1980)"</strong>에서 시각화되어 전 세계적으로 알려진 개념이 되었습니다. 138억 년의 우주 역사를 1년으로 압축해 일반인이 이해할 수 있도록 한 천재적 발상입니다.',
              },
              {
                q: '코스믹 캘린더에서 1초는 실제 몇 년인가요?',
                a: '코스믹 캘린더에서 1초는 실제 <strong>약 437.5년</strong>에 해당합니다. 따라서 인류 문명 12,000년은 코스믹 캘린더로 약 27.5초이며, 산업혁명 이후 250년은 약 0.57초, 인터넷 시대 30년은 약 0.07초에 불과합니다. <strong>당신의 30년 인생도 코스믹 캘린더로는 약 0.07초</strong>입니다.',
              },
              {
                q: '인류는 코스믹 캘린더의 어디에 위치하나요?',
                a: '현생 인류(호모 사피엔스)는 <strong>12월 31일 23시 48분경</strong> 등장했습니다. 마지막 12분에 모든 인류 역사가 압축되어 있다는 뜻입니다. 특히 문자·문명·과학·인터넷 모든 것이 마지막 14초 안에 발생했습니다. 이는 우주 138억 년 중 인류 문명이 차지하는 비율이 <strong>0.0001% 미만</strong>이라는 의미입니다.',
              },
              {
                q: '빅뱅 이후 첫 별은 언제 만들어졌나요?',
                a: '빅뱅 이후 약 2억 년 후에 최초의 별들이 핵융합을 시작했습니다. 코스믹 캘린더로는 <strong>1월 10일</strong> 정도입니다. 그 이전(빅뱅 ~ 38만 년)은 우주가 너무 뜨거워 빛이 자유롭게 다닐 수 없는 "암흑 시대"였습니다. 약 38만 년 후 우주가 충분히 식어 최초의 원자(수소·헬륨)가 형성되었고, 이후 중력으로 모여 첫 별들이 빛나기 시작했습니다.',
              },
              {
                q: '코스믹 캘린더의 사건 시점은 정확한가요?',
                a: '현재 과학계의 추정치를 기반으로 하며, <strong>새로운 발견에 따라 조정될 수 있습니다</strong>. 우주 나이는 한때 100억 년으로 추정되었으나 현재는 약 137~138억 년으로 정착되었습니다. 지구 나이도 정확한 측정 기술로 45.4억 년이 정설입니다. 본 도구는 NASA, ESA(유럽 우주국), 국제 천문학 연합(IAU) 등의 공식 데이터를 참조했습니다.',
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

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 시각화',     desc: '8개 행성에서 내 몸무게·나이·하루' },
              { href: '/tools/unit/time',             icon: '⏱️', name: '시간 단위 변환기',     desc: '초·분·시간·일·주·년 변환' },
              { href: '/tools/date/history-era',      icon: '📜', name: '역사 연호·연대 변환기', desc: '단기·왕 연호·간지 ↔ 서기 변환' },
              { href: '/tools/date/age',              icon: '🎂', name: '만 나이 계산기',        desc: '법 개정 기준 만 나이' },
              { href: '/tools/date/life-time',        icon: '⏳', name: '생애 시간 계산기',      desc: '기대수명 기준 살아온 시간·앞으로의 시간' },
              { href: '/tools/edu',                   icon: '🔬', name: '교육·학습 카테고리',    desc: '추가 교육 도구 더보기' },
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

        {/* ── 10. 참고 자료 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            참고 자료
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 12.5, color: 'var(--muted)', lineHeight: 2 }}>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>칼 세이건, "에덴의 용"(The Dragons of Eden), 1977</li>
              <li>칼 세이건, "코스모스"(Cosmos), 1980 다큐멘터리</li>
              <li>NASA: nasa.gov</li>
              <li>한국천문연구원(KASI): kasi.re.kr</li>
              <li>국제 천문학 연합(IAU): iau.org</li>
              <li>ESA(유럽 우주국): esa.int</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
