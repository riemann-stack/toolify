import ZodiacClient from './ZodiacClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/life/zodiac',
  title: '띠·별자리 계산기 — 60갑자·궁합·탄생석·가족 비교 | Youtil',
  description: '생년월일로 띠·별자리·60갑자·오행·탄생석·탄생화 통합 프로필 카드. 두 사람 궁합 시뮬(삼합·육합·충), 가족 띠 비교, SNS 공유. 재미용 도구.',
  keywords: [
    '띠계산기', '별자리계산기', '12간지', '60갑자', '띠궁합', '생년월일띠',
    '간지계산기', '나의별자리', '띠별자리', '두 사람 궁합', '탄생석',
    '탄생화', '가족 띠', '환갑', '삼합 육합', '쌍둥이자리 사자자리 궁합',
    '닭띠 돼지띠 궁합', '닭띠 호랑이띠', '음력 양력 변환',
  ],
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
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🐯 띠·별자리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        생년월일로 <strong style={{ color: 'var(--text)' }}>띠·별자리·60갑자·오행·탄생석 통합 프로필 카드 + 두 사람 궁합 시뮬(삼합·육합·충) + 가족 띠 비교</strong>까지.
        SNS 공유용 결과 복사 지원.
      </p>

      <ZodiacClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 12간지 순서 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>12간지 순서와 해당 연도</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['띠', '지지', '순서', '최근 해당 연도'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🐭 쥐',     '子 (자)', '1번째',  '1996, 2008, 2020'],
                  ['🐮 소',     '丑 (축)', '2번째',  '1997, 2009, 2021'],
                  ['🐯 호랑이', '寅 (인)', '3번째',  '1998, 2010, 2022'],
                  ['🐰 토끼',   '卯 (묘)', '4번째',  '1999, 2011, 2023'],
                  ['🐲 용',     '辰 (진)', '5번째',  '2000, 2012, 2024'],
                  ['🐍 뱀',     '巳 (사)', '6번째',  '2001, 2013, 2025'],
                  ['🐴 말',     '午 (오)', '7번째',  '2002, 2014, 2026'],
                  ['🐑 양',     '未 (미)', '8번째',  '2003, 2015, 2027'],
                  ['🐵 원숭이', '申 (신)', '9번째',  '2004, 2016, 2028'],
                  ['🐔 닭',     '酉 (유)', '10번째', '2005, 2017, 2029'],
                  ['🐶 개',     '戌 (술)', '11번째', '2006, 2018, 2030'],
                  ['🐷 돼지',   '亥 (해)', '12번째', '2007, 2019, 2031'],
                ].map(([animal, jiji, order, years], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{animal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 600 }}>{jiji}</td>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>별자리 날짜표</h2>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            60갑자 (干支) 표
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
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>
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
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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

        {/* ── 두 사람 궁합 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            💕 두 사람 궁합 가이드 (재미용)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            12간지 궁합은 전통적으로 <strong style={{ color: 'var(--text)' }}>삼합·육합·충</strong>으로 평가합니다.
            본 도구의 「두 사람 궁합」 탭에서 자동 계산.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(62,255,155,0.04)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#3EFF9B', fontWeight: 700, marginBottom: 8 }}>🟢 삼합 (5점) — 환상적 시너지</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>신자진: 원숭이·쥐·용</li>
                <li>사유축: 뱀·닭·소</li>
                <li>인오술: 호랑이·말·개</li>
                <li>해묘미: 돼지·토끼·양</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(200,255,62,0.04)', border: '1px solid rgba(200,255,62,0.30)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>🟡 육합 (4점) — 안정적</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>자축: 쥐·소</li>
                <li>인해: 호랑이·돼지</li>
                <li>묘술: 토끼·개</li>
                <li>진유: 용·닭</li>
                <li>사신: 뱀·원숭이</li>
                <li>오미: 말·양</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>🔴 충 (1점) — 충돌·도전</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>자오: 쥐·말</li>
                <li>축미: 소·양</li>
                <li>인신: 호랑이·원숭이</li>
                <li>묘유: 토끼·닭</li>
                <li>진술: 용·개</li>
                <li>사해: 뱀·돼지</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ⚠️ 본 결과는 재미용. 실제 관계는 두 사람의 노력·소통·이해로 결정됩니다.
            본 결과로 결혼·이별을 결정하지 마세요.
          </p>
        </div>

        {/* ── 별자리 원소 시너지 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🌬️ 별자리 4원소 궁합
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>조합</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>평가</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>해석</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['같은 원소', '🟢 5점', '자연스러운 공감과 이해', '#3EFF9B'],
                  ['🔥 불 + 💨 공기', '🟢 5점', '공기가 불을 살리는 시너지 — 활력·영감', '#3EFF9B'],
                  ['🌿 지 + 💧 물', '🟢 5점', '물과 흙의 시너지 — 안정·성장', '#3EFF9B'],
                  ['🔥 불 + 💧 물', '🔴 2점', '가치관 차이 큼, 타협 필요', '#FF6B6B'],
                  ['🌿 지 + 💨 공기', '🔴 2점', '현실 vs 자유 거리감', '#FF6B6B'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row[3] as string, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ⚠️ 별자리만으로 관계를 판단할 수 없으며, 실제 사람은 모든 원소 면을 갖고 있습니다.
          </p>
        </div>

        {/* ── 탄생석·탄생화·탄생색 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ✨ 월별 탄생석·탄생화·탄생색
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>월</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>탄생석</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>탄생화</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>탄생색</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1월',  '가넷 (Garnet)',           '카네이션·갈란투스',  '진홍·검정'],
                  ['2월',  '아메시스트 (Amethyst)',   '제비꽃·앵초',         '보라'],
                  ['3월',  '아쿠아마린',              '수선화·재스민',       '연파랑'],
                  ['4월',  '다이아몬드',              '데이지·스위트피',     '하양'],
                  ['5월',  '에메랄드 (Emerald)',      '은방울꽃·산사나무',   '진녹·옥'],
                  ['6월',  '진주·문스톤',             '장미·인동',           '연분홍·하양'],
                  ['7월',  '루비 (Ruby)',             '제비고깔·수련',       '빨강'],
                  ['8월',  '페리도트 (Peridot)',      '글라디올러스·양귀비', '연두'],
                  ['9월',  '사파이어 (Sapphire)',     '아스터·나팔꽃',       '파랑'],
                  ['10월', '오팔·전기석 (Opal)',      '코스모스·금잔화',     '무지개'],
                  ['11월', '토파즈·시트린',           '국화',                '노랑·금'],
                  ['12월', '터키석·청금석 (Turquoise)', '수선화·홀리',         '하늘·빨강'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 양력 vs 음력 띠 차이 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📅 양력 vs 음력 띠 차이
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.30)', borderRadius: 12, padding: '16px 18px' }}>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.85 }}>
              <li>한국에서는 일반적으로 <strong>양력 1월 1일</strong>을 기준으로 띠를 사용</li>
              <li>전통 사주명리는 <strong>음력 설날 (양력 1월 21일~2월 20일 사이)</strong>을 기준</li>
              <li>엄격한 사주는 <strong>입춘 (2월 4일 전후)</strong>을 기준 — 절기 기준</li>
              <li>음력 설날 전후 출생자는 띠가 1년 차이날 수 있음</li>
            </ul>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
              📌 예: 양력 1990년 1월 25일 출생<br />
              · 양력 띠 (1월 1일 기준): 말띠 (1990년)<br />
              · 음력 띠 (음력 설날 기준): 뱀띠 (1989년 음력)<br />
              본 도구는 양력 입력 양력 1월 1일 기준으로 계산합니다.
            </p>
          </div>
        </div>

        {/* ── FAQ (accordion - salary style) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '띠는 음력 기준인가요 양력 기준인가요?', a: '엄밀히는 음력 설날을 기준으로 하지만, 실용적으로는 양력 1월 1일을 기준으로 계산하는 경우도 많습니다. 본 계산기는 양력 기준으로 계산합니다. 음력 설날 전후 출생자는 실제 띠와 1년 차이가 날 수 있습니다.' },
              { q: '별자리는 태양 별자리인가요?', a: '네, 본 계산기는 생일 기준 태양 별자리(Sun Sign)를 계산합니다. 점성술에서는 태양 별자리 외에도 달 별자리, 상승 별자리 등이 있으며, 정확한 점성술 분석은 출생 시간과 장소가 필요합니다.' },
              { q: '별자리 경계 날짜에 태어난 경우는?', a: '두 별자리의 경계 날짜(예: 양자리와 황소자리의 경계인 4월 19~20일)에 태어난 경우를 「커스프(Cusp)」라고 합니다. 이 경우 두 별자리의 특징을 모두 가질 수 있습니다. 정확한 별자리는 출생 연도와 시간에 따라 다를 수 있습니다.' },
              { q: '음력 생년월일인 경우 어떻게 해야 하나요?', a: '본 계산기는 양력 기준입니다. 음력 생년월일만 아는 경우 양음력 변환기(/tools/date/lunar)를 통해 양력으로 변환 후 이용하세요. 특히 음력 설날(1~2월) 전후 출생자는 띠가 1년 다를 수 있습니다.' },
              { q: '60갑자란 무엇인가요?', a: '10천간(甲乙丙丁戊己庚辛壬癸)과 12지지(子丑寅卯辰巳午未申酉戌亥)를 조합한 60개의 주기입니다. 연도·월·일·시를 표현하는 데 사용되며, 사주명리학의 기초가 됩니다. 60년마다 같은 간지가 반복되며, 환갑(還甲)은 본인이 태어난 간지가 다시 돌아오는 60세를 뜻합니다.' },
              { q: '두 사람의 띠 궁합은 어떻게 계산하나요?', a: '본 도구의 「두 사람 궁합」 탭 사용. 12간지 궁합 기준 — 삼합(3개씩 묶음, 환상적 시너지: 신자진/사유축/인오술/해묘미), 육합(2개씩, 안정적: 자축/인해/묘술/진유/사신/오미), 충(정반대, 충돌: 자오/축미/인신/묘유/진술/사해). ⚠️ 본 결과는 재미용. 실제 관계는 노력·소통.' },
              { q: '별자리 원소가 잘 맞는다는 게 무슨 뜻인가요?', a: '점성술 4원소: 불(양·사자·사수, 열정), 지(황소·처녀·염소, 안정), 공기(쌍둥이·천칭·물병, 소통), 물(게·전갈·물고기, 감성). 시너지: 같은 원소(자연스러운 공감), 불+공기(산소가 불 살림), 지+물(식물 자라기). 충돌: 불+물(가치관 차이), 지+공기(현실 vs 자유). ⚠️ 별자리만으로 관계를 판단할 수 없으며, 실제 사람은 모든 원소 면을 갖고 있습니다.' },
              { q: '음력 생일이 양력보다 띠가 다를 수 있나요?', a: '네, 가능합니다. 예: 양력 1990년 1월 25일 출생 → 양력 띠(1월 1일 기준) 말띠(1990년), 음력 띠(음력 설날 기준) 뱀띠(1989년 음력). 본 도구는 양력 입력 → 양력 1월 1일 기준. 엄격한 사주 해석은 절기 기준(입춘 2/4 전후)도 사용.' },
              { q: '본 도구의 궁합 결과로 결혼을 결정해도 되나요?', a: '절대 안 됩니다. 본 궁합은 재미·문화 도구입니다. 실제 관계는 두 사람의 가치관·인생관·소통·이해 능력·함께 보낸 시간·노력·헌신·가족 환경으로 결정됩니다. 띠·별자리 궁합은 일반적 성향 참고·대화 소재·자기 이해 도구일 뿐. 결혼·이별 결정은 본인의 직접 경험·소통으로. 관계 갈등 시 한국 결혼관계 상담 1644-2255, 청소년·가족 상담 1388.' },
              { q: '본 도구의 결과는 얼마나 정확한가요?', a: '본 도구는 일반적·재미용·문화적 해석입니다. 점성술·사주명리는 과학적으로 검증되지 않은 영역이며, 인생 결정·운세 예측·미래 예언 도구가 아닙니다. 띠·별자리·60갑자는 한국·동아시아 문화 일부분이며, 자기 이해와 대화 소재로 활용 권장. ⚠️ 본 도구의 어떤 결과도 「반드시」·「절대」·「확실히」 같은 절대적 의미로 해석하지 마세요.' },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* ── 면책 강화 ── */}
        <div style={{
          background: 'rgba(255, 140, 62, 0.04)',
          border: '1px solid rgba(255, 140, 62, 0.30)',
          borderRadius: '12px',
          padding: '18px 20px',
          fontSize: '12.5px',
          color: 'var(--muted)',
          lineHeight: 1.85,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FF8C3E', marginBottom: 10 }}>⚠️ 면책 조항</p>
          <p style={{ marginBottom: 8 }}>
            본 띠·별자리 계산기는 <strong style={{ color: 'var(--text)' }}>재미용·교육용 도구</strong>입니다.
          </p>
          <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
            <li>점성술·사주명리는 재미·문화 영역</li>
            <li>인생 결정 도구 X (결혼·이별·취업·이주)</li>
            <li>운세·미래 예측 X</li>
            <li>절대화 표현 X (「반드시」·「절대 안 됨」)</li>
            <li>한국 사주 ≠ 서양 점성술 (혼동 주의)</li>
          </ul>
          <p style={{ marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>본 도구의 궁합 결과는:</p>
          <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
            <li>일반적 성향 분석 + 문화적 해석</li>
            <li>두 사람 관계 ≠ 띠/별자리만으로 결정</li>
            <li>실제 관계는 노력·소통·이해</li>
          </ul>
          <p style={{ marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>도움이 필요하면:</p>
          <ul style={{ paddingLeft: 18 }}>
            <li>한국 결혼관계 상담: <strong style={{ color: '#FF8C3E' }}>1644-2255</strong></li>
            <li>청소년·가족 상담: <strong style={{ color: '#FF8C3E' }}>1388</strong></li>
            <li>정신건강 위기상담: <strong style={{ color: '#FF8C3E' }}>1577-0199</strong></li>
            <li>사주·점성 자문: 본 도구 영역 X</li>
          </ul>
        </div>

        {/* ── 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/age',          icon: '🎂', name: '만 나이 계산기',            desc: '법 개정 기준 만 나이' },
              { href: '/tools/date/lunar',        icon: '🌙', name: '양음력 변환기',             desc: '음력 ↔ 양력 변환·간지 확인' },
              { href: '/tools/date/history-era',  icon: '📜', name: '연호·연대 변환기',     desc: '단기·조선 왕 연호·간지' },
              { href: '/tools/date/dday',         icon: '📅', name: 'D-Day 계산기',    desc: '생일까지·두 날짜 사이·페이스' },
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
