import ZodiacClient from './ZodiacClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/zodiac',
  title: '띠·별자리 계산기 — 60갑자·궁합·유명인 확인',
  description: '생년월일로 띠(12간지)와 별자리를 확인합니다. 60갑자(간지), 띠 궁합, 별자리 원소 궁합, 같은 띠 유명인까지 한 번에 확인하세요.',
  keywords: ['띠계산기', '별자리계산기', '12간지', '60갑자', '띠궁합', '생년월일띠', '간지계산기', '나의별자리', '띠별자리'],
})

// 60갑자 데이터 생성
const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const STEMS_HANGUL = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const BRANCHES_HANGUL = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
const BRANCHES_ANIMAL = ['🐭쥐', '🐮소', '🐯호랑이', '🐰토끼', '🐲용', '🐍뱀', '🐴말', '🐑양', '🐵원숭이', '🐔닭', '🐶개', '🐷돼지']

// 60갑자 테이블: 1924~1983 (전반), 1984~2043 (후반)
function ganjiTable(startYear: number) {
  return Array.from({ length: 60 }, (_, i) => {
    const year = startYear + i
    const sIdx = ((year - 4) % 10 + 10) % 10
    const bIdx = ((year - 4) % 12 + 12) % 12
    return {
      year,
      hanja: `${STEMS_HANJA[sIdx]}${BRANCHES_HANJA[bIdx]}`,
      hangul: `${STEMS_HANGUL[sIdx]}${BRANCHES_HANGUL[bIdx]}`,
      animal: BRANCHES_ANIMAL[bIdx],
    }
  })
}

const GANJI_A = ganjiTable(1924) // 1924-1983
const GANJI_B = ganjiTable(1984) // 1984-2043

export default function ZodiacPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🐯 띠·별자리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        생년월일로 <strong style={{ color: 'var(--text)' }}>띠(12간지)·별자리·60갑자·궁합·유명인</strong>을 한 번에 확인합니다.
      </p>

      <ZodiacClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 12간지 순서 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>12간지 순서와 해당 연도</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['띠', '순서', '최근 해당 연도'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🐭 쥐', '1번째', '1996, 2008, 2020'],
                  ['🐮 소', '2번째', '1997, 2009, 2021'],
                  ['🐯 호랑이', '3번째', '1998, 2010, 2022'],
                  ['🐰 토끼', '4번째', '1999, 2011, 2023'],
                  ['🐲 용', '5번째', '2000, 2012, 2024'],
                  ['🐍 뱀', '6번째', '2001, 2013, 2025'],
                  ['🐴 말', '7번째', '2002, 2014, 2026'],
                  ['🐑 양', '8번째', '2003, 2015, 2027'],
                  ['🐵 원숭이', '9번째', '2004, 2016, 2028'],
                  ['🐔 닭', '10번째', '2005, 2017, 2029'],
                  ['🐶 개', '11번째', '2006, 2018, 2030'],
                  ['🐷 돼지', '12번째', '2007, 2019, 2031'],
                ].map(([animal, order, years], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{animal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{order}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{years}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 별자리 날짜표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>별자리 날짜표</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['별자리', '기간', '원소'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['♈ 양자리',    '3/21 ~ 4/19',  '불',   '#FF6B6B'],
                  ['♉ 황소자리',  '4/20 ~ 5/20',  '지',   '#C8FF3E'],
                  ['♊ 쌍둥이자리','5/21 ~ 6/21',  '공기', '#3EC8FF'],
                  ['♋ 게자리',    '6/22 ~ 7/22',  '물',   '#6B8BFF'],
                  ['♌ 사자자리',  '7/23 ~ 8/22',  '불',   '#FF6B6B'],
                  ['♍ 처녀자리',  '8/23 ~ 9/22',  '지',   '#C8FF3E'],
                  ['♎ 천칭자리',  '9/23 ~ 10/23', '공기', '#3EC8FF'],
                  ['♏ 전갈자리',  '10/24 ~ 11/22','물',   '#6B8BFF'],
                  ['♐ 사수자리',  '11/23 ~ 12/21','불',   '#FF6B6B'],
                  ['♑ 염소자리',  '12/22 ~ 1/19', '지',   '#C8FF3E'],
                  ['♒ 물병자리',  '1/20 ~ 2/18',  '공기', '#3EC8FF'],
                  ['♓ 물고기자리','2/19 ~ 3/20',  '물',   '#6B8BFF'],
                ].map(([sign, period, element, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{sign}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{period}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontWeight: 500 }}>{element}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 섹션 A: 60갑자 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            60갑자 (干支) 완전 표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            10천간과 12지지를 조합한 60개의 주기. 내 생년의 간지를 빠르게 확인하세요.
          </p>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>甲子(갑자) 1924 ~ 癸亥(계해) 1983</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px', marginBottom: '20px' }}>
            {GANJI_A.map(g => (
              <div key={g.year} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '12px',
                lineHeight: 1.5,
              }}>
                <div style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>
                  {g.hanja}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  {g.hangul} · {g.year}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>甲子(갑자) 1984 ~ 癸亥(계해) 2043</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px' }}>
            {GANJI_B.map(g => (
              <div key={g.year} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '12px',
                lineHeight: 1.5,
              }}>
                <div style={{ fontFamily: 'Syne, sans-serif', color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>
                  {g.hanja}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
                  {g.hangul} · {g.year}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 섹션 B: 띠별 성격·궁합 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            띠별 성격 및 궁합 요약표
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['띠', '핵심 성격', '최고 궁합', '주의 궁합'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { z: '🐭 쥐',    p: '영리·적응력·기민',   b: '🐲 용, 🐵 원숭이',    a: '🐴 말' },
                  { z: '🐮 소',    p: '성실·인내·신뢰',     b: '🐍 뱀, 🐔 닭',        a: '🐑 양' },
                  { z: '🐯 호랑이', p: '용감·리더십·열정',  b: '🐴 말, 🐶 개',        a: '🐵 원숭이' },
                  { z: '🐰 토끼',  p: '온순·섬세·행운',     b: '🐑 양, 🐷 돼지',      a: '🐔 닭' },
                  { z: '🐲 용',    p: '카리스마·야망',      b: '🐭 쥐, 🐵 원숭이',    a: '🐶 개' },
                  { z: '🐍 뱀',    p: '지혜·직관·신중',     b: '🐮 소, 🐔 닭',        a: '🐷 돼지' },
                  { z: '🐴 말',    p: '자유·활동·열정',     b: '🐯 호랑이, 🐶 개',    a: '🐭 쥐' },
                  { z: '🐑 양',    p: '온화·창의·공감',     b: '🐰 토끼, 🐷 돼지',    a: '🐮 소' },
                  { z: '🐵 원숭이', p: '영리·유머·변화',    b: '🐭 쥐, 🐲 용',        a: '🐯 호랑이' },
                  { z: '🐔 닭',    p: '꼼꼼·성실·솔직',     b: '🐮 소, 🐍 뱀',        a: '🐰 토끼' },
                  { z: '🐶 개',    p: '충직·정직·의리',     b: '🐯 호랑이, 🐴 말',    a: '🐲 용' },
                  { z: '🐷 돼지',  p: '너그러움·낙천·행복', b: '🐰 토끼, 🐑 양',      a: '🐍 뱀' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontWeight: 700 }}>{r.z}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.p}</td>
                    <td style={{ padding: '9px 10px', color: '#3EFF9B' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: '#FF8C3E' }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 섹션 C: 별자리 원소별 특징 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            별자리 원소별 특징
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { el: '🔥 불', signs: '♈ 양 · ♌ 사자 · ♐ 사수', traits: '열정·리더십·직관', c: '#FF6B6B' },
              { el: '🌿 지', signs: '♉ 황소 · ♍ 처녀 · ♑ 염소', traits: '현실적·안정·끈기', c: '#C8FF3E' },
              { el: '💨 공기', signs: '♊ 쌍둥이 · ♎ 천칭 · ♒ 물병', traits: '소통·지성·자유', c: '#3EC8FF' },
              { el: '💧 물', signs: '♋ 게 · ♏ 전갈 · ♓ 물고기', traits: '감성·직관·공감', c: '#6B8BFF' },
            ].map((e, i) => (
              <div key={i} style={{
                background: 'var(--bg2)',
                border: `1px solid ${e.c}44`,
                borderLeft: `3px solid ${e.c}`,
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <p style={{ fontSize: '14px', color: e.c, fontWeight: 700, marginBottom: '6px' }}>{e.el}</p>
                <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px' }}>{e.signs}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{e.traits}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '띠는 음력 기준인가요 양력 기준인가요?', a: '엄밀히는 음력 설날을 기준으로 하지만, 실용적으로는 양력 1월 1일을 기준으로 계산하는 경우도 많습니다. 본 계산기는 양력 기준으로 계산합니다. 음력 설날 전후 출생자는 실제 띠와 1년 차이가 날 수 있습니다.' },
              { q: '별자리는 태양 별자리인가요?', a: '네, 본 계산기는 생일 기준 태양 별자리(Sun Sign)를 계산합니다. 점성술에서는 태양 별자리 외에도 달 별자리, 상승 별자리 등이 있으며, 정확한 점성술 분석은 출생 시간과 장소가 필요합니다.' },
              { q: '별자리 경계 날짜에 태어난 경우는?', a: '두 별자리의 경계 날짜(예: 양자리와 황소자리의 경계인 4월 19~20일)에 태어난 경우를 "커스프(Cusp)"라고 합니다. 이 경우 두 별자리의 특징을 모두 가질 수 있습니다. 정확한 별자리는 출생 연도와 시간에 따라 다를 수 있습니다.' },
              { q: '음력 생년월일인 경우 어떻게 해야 하나요?', a: '본 계산기는 양력 기준입니다. 음력 생년월일만 아는 경우 양음력 변환기를 통해 양력으로 변환 후 이용하세요. 특히 음력 설날(1~2월) 전후 출생자는 띠가 1년 다를 수 있습니다.' },
              { q: '60갑자란 무엇인가요?', a: '10천간(甲乙丙丁戊己庚辛壬癸)과 12지지(子丑寅卯辰巳午未申酉戌亥)를 조합한 60개의 주기입니다. 연도·월·일·시를 표현하는 데 사용되며, 사주명리학의 기초가 됩니다. 60년마다 같은 간지가 반복되며, 환갑(還甲)은 본인이 태어난 간지가 다시 돌아오는 60세를 뜻합니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/age',          icon: '🎂', name: '만 나이 계산기',            desc: '법 개정 기준 만 나이' },
              { href: '/tools/date/lunar',        icon: '🌙', name: '양음력 변환기',             desc: '음력 ↔ 양력 변환·간지 확인' },
              { href: '/tools/date/history-era',  icon: '📜', name: '역사 연호·연대 변환기',     desc: '단기·조선 왕 연호·간지' },
              { href: '/tools/date/diff',         icon: '📆', name: '날짜 차이 계산기',          desc: '두 날짜 사이 기간' },
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',              desc: '생일까지 남은 날 계산' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
