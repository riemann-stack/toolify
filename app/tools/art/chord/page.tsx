import Link from 'next/link'
import ChordClient from './ChordClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/chord',
  title: '코드 구성음 계산기 — Cmaj7·Dm7·G7 코드 음이름 확인',
  description: 'Cmaj7·Dm7·G7 등 코드 구성음 계산과 음이름 역방향 검색. C메이저·A마이너 다이아토닉 코드표, 슬래시(분수) 코드 읽는 법, 2-5-1·캐논(카논) 등 자주 쓰는 진행까지.',
  keywords: ['코드구성음계산기', 'Cmaj7구성음', '코드음계산기', '다이아토닉코드표', '코드역방향검색', '기타코드구성음', '피아노코드계산기', '음악이론계산기'],
})

const FAQ_LD = [
              {
                q: 'maj7과 7(도미넌트7)의 차이는 무엇인가요?',
                a: '<strong>maj7</strong>은 장7도(근음에서 11반음)를 포함하고, <strong>7(도미넌트7)</strong>은 단7도(10반음)를 포함합니다. <code>Cmaj7 = C, E, G, B</code>이고 <code>C7 = C, E, G, B♭</code>입니다. 도미넌트7은 긴장감이 있어 다음 코드(토닉)로 해결되려는 느낌이 강합니다.',
              },
              {
                q: 'sus4 코드는 어떨 때 사용하나요?',
                a: 'sus4는 <strong>3도 음 대신 4도 음을 사용</strong>해 장단 구별이 없는 모호하고 떠있는 느낌을 줍니다. <code>Csus4 = C, F, G</code>로 C 코드의 E 대신 F를 사용합니다. 해결(resolution) 직전이나 감정적 여운을 남길 때 자주 쓰입니다.',
              },
              {
                q: '다이아토닉 코드란 무엇인가요?',
                a: '특정 조성(Key)의 음계 안의 음들만으로 만들 수 있는 코드입니다. C 메이저 조성에서는 C, D, E, F, G, A, B 7개 음만으로 만든 <strong>Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bm7♭5</strong>가 다이아토닉 코드입니다. 조성 안에서 자연스럽게 어울리는 코드들입니다.',
              },
              {
                q: '코드 전위(Inversion)는 무엇인가요?',
                a: '코드의 구성음 순서를 바꾼 것입니다. C 코드(C, E, G)에서 E를 가장 아래로 내리면 <strong>1전위(E, G, C)</strong>, G를 가장 아래로 내리면 <strong>2전위(G, C, E)</strong>가 됩니다. 같은 코드이지만 음색과 진행감이 달라집니다.',
              },
              {
                q: '텐션(Tension)이 포함된 코드는 어렵게 느껴지는데 어떻게 이해하나요?',
                a: '9th, 11th, 13th는 7th 코드에 색채를 더하는 음들입니다. <strong>9 = 옥타브 위의 2도, 11 = 옥타브 위의 4도, 13 = 옥타브 위의 6도</strong>입니다. 처음에는 maj7(4음)만 익히고, 익숙해지면 9th를 추가하는 방식으로 단계적으로 접근하면 어렵지 않습니다.',
              },
            ]

export default function ChordPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />코드 구성음 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        Cmaj7·Dm7 등 코드의 <strong style={{ color: 'var(--text)' }}>구성음과 역방향 검색</strong> + 다이아토닉 코드표.
      </p>

      <ChordClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 주요 코드 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색하는 주요 코드 구성음
          </h2>

          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-health)', marginBottom: '8px' }}>트라이어드 (3화음)</p>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>코드</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구성음</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>인터벌</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['C',    'C, E, G',     '근음, 장3도, 완전5도'],
                  ['Cm',   'C, E♭, G',    '근음, 단3도, 완전5도'],
                  ['Caug', 'C, E, G♯',    '근음, 장3도, 증5도'],
                  ['Cdim', 'C, E♭, G♭',   '근음, 단3도, 감5도'],
                  ['Csus2','C, D, G',     '근음, 장2도, 완전5도'],
                  ['Csus4','C, F, G',     '근음, 완전4도, 완전5도'],
                ].map(([chord, notes, interval], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{chord}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{notes}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{interval}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-life)', marginBottom: '8px' }}>세븐스(7th) 코드</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>코드</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구성음</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Cmaj7',  'C, E, G, B',     '밝고 부드러운 느낌 (재즈·발라드)'],
                  ['Cm7',    'C, E♭, G, B♭',   '약간 어두운 느낌 (재즈·R&B)'],
                  ['C7',     'C, E, G, B♭',    '블루스·재즈의 도미넌트, 긴장감'],
                  ['Cm7♭5',  'C, E♭, G♭, B♭',  '하프 디미니시드, 마이너 ⅱ'],
                  ['Cdim7',  'C, E♭, G♭, A',   '긴장감·공포감, 모든 음 단3도 간격'],
                  ['CmM7',   'C, E♭, G, B',    '미스터리·필름누아르 분위기'],
                ].map(([chord, notes, feature], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{chord}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{notes}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{feature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 코드 기호 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            코드 기호 읽는 법 완전 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { sym: 'maj7',  desc: '장7도 포함. 밝고 안정적인 느낌',                  color: 'var(--success)' },
              { sym: 'm7',    desc: '단3도 + 단7도. 재즈에서 매우 자주 사용',           color: 'var(--cat-health)' },
              { sym: '7',     desc: '도미넌트7. 장3도 + 단7도. 해결 욕구가 있는 긴장감', color: 'var(--cat-life)' },
              { sym: 'sus4',  desc: '3도 대신 4도. "떠있는" 느낌, 해결 직전에 사용',     color: 'var(--cat-sports)' },
              { sym: 'add9',  desc: '기존 코드에 9도(=옥타브 위 2도) 추가. 색채감',       color: 'var(--accent-ink)' },
              { sym: 'b5',    desc: '5도를 반음 낮춤. 긴장 또는 블루스적 색채',         color: 'var(--danger)' },
              { sym: '#5',    desc: '5도를 반음 올림. aug와 같은 효과',                color: 'var(--danger)' },
              { sym: 'dim',   desc: '감3화음. 단3도 두 개 쌓임. 어둡고 불안정',         color: 'var(--danger)' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${c.color} 19%, transparent)`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 800, color: c.color, marginBottom: '6px' }}>{c.sym}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. C 메이저 다이아토닉 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            C 메이저 다이아토닉 코드 완전표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            C 메이저 스케일(C·D·E·F·G·A·B) 안의 음들로만 만든 7개 코드. 한 곡의 키가 C 메이저라면 이 코드들을 조합해 진행을 만듭니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>코드명</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구성음</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>기능</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { roman: 'Ⅰ',  chord: 'Cmaj7',  notes: 'C, E, G, B',    func: '토닉',         color: 'var(--success)' },
                  { roman: 'ⅱ',  chord: 'Dm7',    notes: 'D, F, A, C',    func: '서브도미넌트', color: 'var(--cat-health)' },
                  { roman: 'ⅲ',  chord: 'Em7',    notes: 'E, G, B, D',    func: '토닉',         color: 'var(--success)' },
                  { roman: 'Ⅳ',  chord: 'Fmaj7',  notes: 'F, A, C, E',    func: '서브도미넌트', color: 'var(--cat-health)' },
                  { roman: 'Ⅴ',  chord: 'G7',     notes: 'G, B, D, F',    func: '도미넌트',     color: 'var(--cat-life)' },
                  { roman: 'ⅵ',  chord: 'Am7',    notes: 'A, C, E, G',    func: '토닉',         color: 'var(--success)' },
                  { roman: 'ⅶø', chord: 'Bm7♭5',  notes: 'B, D, F, A',    func: '도미넌트',     color: 'var(--cat-life)' },
                ].map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)', borderLeft: `3px solid ${d.color}` }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{d.roman}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--text)' }}>{d.chord}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--muted)' }}>{d.notes}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: d.color, fontSize: 12, fontWeight: 600 }}>{d.func}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3-2. A 마이너 다이아토닉 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            A 마이너 다이아토닉 코드표 — 자연 단음계 기준
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            가장 많이 쓰이는 단조 키인 A 마이너의 다이아토닉 코드입니다. A 자연 단음계(A·B·C·D·E·F·G)는 C 메이저와 같은 7개 음을 쓰는 <strong style={{ color: 'var(--text)' }}>나란한조</strong>라서 코드 자체는 위 표와 겹치지만, 중심음이 A로 바뀌면서 각 코드의 순서와 역할이 달라집니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>도수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>코드명</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구성음</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { roman: 'ⅰ',  chord: 'Am7',    notes: 'A, C, E, G',   note: '토닉. 단조의 중심 코드',                    color: 'var(--success)' },
                  { roman: 'ⅱø', chord: 'Bm7♭5',  notes: 'B, D, F, A',   note: '마이너 2-5-1 진행의 Ⅱ 담당',               color: 'var(--cat-health)' },
                  { roman: 'Ⅲ',  chord: 'Cmaj7',  notes: 'C, E, G, B',   note: '나란한조 C 메이저의 Ⅰ과 동일',             color: 'var(--success)' },
                  { roman: 'ⅳ',  chord: 'Dm7',    notes: 'D, F, A, C',   note: '서브도미넌트',                             color: 'var(--cat-health)' },
                  { roman: 'ⅴ',  chord: 'Em7',    notes: 'E, G, B, D',   note: '이끔음이 없어 해결감 약함 → 흔히 E7로 대체', color: 'var(--cat-life)' },
                  { roman: 'Ⅵ',  chord: 'Fmaj7',  notes: 'F, A, C, E',   note: 'C 메이저의 Ⅳ와 동일',                      color: 'var(--cat-health)' },
                  { roman: 'Ⅶ',  chord: 'G7',     notes: 'G, B, D, F',   note: 'C 메이저의 Ⅴ와 동일',                      color: 'var(--cat-life)' },
                ].map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)', borderLeft: `3px solid ${d.color}` }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{d.roman}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--text)' }}>{d.chord}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--muted)' }}>{d.notes}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--cat-life) 19%, transparent)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cat-life)', marginBottom: '6px' }}>자연 단음계 vs 화성 단음계 — Ⅴ가 Em7이 아니라 E7이 되는 이유</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
              자연 단음계의 Ⅴ는 Em7(E·G·B·D)인데, 토닉 A 바로 반음 아래에서 끌어당기는 이끔음이 없어 해결감이 약합니다. 그래서 7음 G를 반음 올린 <strong style={{ color: 'var(--text)' }}>화성 단음계(A·B·C·D·E·F·G♯)</strong>를 쓰면 Ⅴ가 <strong style={{ color: 'var(--text)' }}>E7(E·G♯·B·D)</strong>로 바뀌고, G♯→A의 반음 해결이 생겨 도미넌트 기능이 강해집니다. 실제 단조 곡 대부분이 Ⅴ 자리에 Em이 아닌 E나 E7을 쓰는 이유이며, 마이너 2-5-1 진행도 Bm7♭5 → E7 → Am7으로 만듭니다.
            </p>
          </div>
        </div>

        {/* ── 4. 자주 쓰이는 코드 진행 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 쓰이는 코드 진행 — 출처가 확인된 대표곡
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            대표곡은 <strong style={{ color: 'var(--text)' }}>화성 분석 출처와 조성 출처를 따로 확인한 곡만</strong> 실었습니다. 흔히 도는 &ldquo;이 곡도 같은 진행&rdquo; 목록은 대부분 위키·블로그가 근거라 여기서는 뺐습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                name: '1-5-6-4 진행 (Axis·팝의 왕)',
                deg: 'Ⅰ → Ⅴ → ⅵ → Ⅳ',
                ex: 'C → G → Am → F',
                desc: '팝·록에서 폭넓게 쓰이는 4코드 루프. 아래 1-6-4-5와 코드는 같고 Ⅴ·ⅵ·Ⅳ의 순서만 다릅니다',
                song: 'U2 「With or Without You」(1987) — D장조에서 D → A → Bm → G를 계속 순환합니다. 진행은 음악이론 오픈교재 Open Music Theory, 원 발표 조성(D Major)은 Musicnotes 공식 악보 표기.',
                color: 'var(--accent-ink)',
              },
              {
                name: '6-4-1-5 진행 (싱어송라이터 스키마)',
                deg: 'ⅵ → Ⅳ → Ⅰ → Ⅴ',
                ex: 'Am → F → C → G',
                desc: '위 진행을 ⅵ부터 돌린 회전형이라 Open Music Theory는 둘을 한 스키마로 묶습니다. Ⅳ→Ⅰ의 변격(plagal) 방식으로 토닉에 닿는 것이 두왑(1-6-4-5)과 갈리는 청취 단서',
                song: 'Luis Fonsi & Daddy Yankee 「Despacito」(2017) — Bm → G → D → A. 같은 교재는 이 진행이 D장조 ⅵ-Ⅳ-Ⅰ-Ⅴ로도, B단조 ⅰ-Ⅵ-Ⅲ-Ⅶ으로도 들린다고 설명합니다(조성 모호성). 위 계산기 단조 탭의 「서정적 마이너 진행」이 바로 이 단조 쪽 해석입니다.',
                color: 'var(--cat-art)',
              },
              {
                name: '1-6-4-5 진행 (올드팝·발라드 / 두왑)',
                deg: 'Ⅰ → ⅵ → Ⅳ → Ⅴ',
                ex: 'Cmaj7 → Am7 → Fmaj7 → G7',
                desc: '수많은 올드팝·발라드의 기본. 교재 명칭은 두왑(doo-wop) 스키마',
                song: '',
                color: 'var(--cat-edu)',
              },
              {
                name: '2-5-1 진행 (재즈 기본)',
                deg: 'ⅱ7 → Ⅴ7 → Ⅰmaj7',
                ex: 'Dm7 → G7 → Cmaj7',
                desc: '재즈 스탠더드 대부분에 등장. 도미넌트 모션의 기본이고 장조 품질은 m7 → 7 → maj7',
                song: 'Jerome Kern 「All the Things You Are」 — 종지가 ⅱ-Ⅴ-Ⅰ이며 원 발표 조성은 A♭장조(Open Music Theory·Musicnotes). John Lewis 「Afternoon in Paris」는 C장조 곡인데 A섹션에서 B♭장조 → A♭장조 → C장조로 2-5-1 덩어리를 연달아 쌓습니다.',
                color: 'var(--cat-health)',
              },
              {
                name: '1-4-5 진행 (블루스·록)',
                deg: 'Ⅰ → Ⅳ → Ⅴ',
                ex: 'C → F → G',
                desc: '블루스·록큰롤의 뼈대. 12마디 블루스의 핵심 코드',
                song: '',
                color: 'var(--cat-life)',
              },
              {
                name: '캐논(카논) 진행',
                deg: 'Ⅰ → Ⅴ → ⅵ → ⅲ → Ⅳ → Ⅰ → Ⅳ → Ⅴ',
                ex: 'C → G → Am → Em → F → C → F → G',
                desc: '파헬벨 캐논의 8코드 시퀀스. 발라드·OST에서 자주 사용',
                song: '파헬벨 「Canon in D」 — 원곡은 D장조·4/4에 바이올린 3대와 통주저음 편성이고, 통주저음이 D–A–B–F♯–G–D–G–A 두 마디 패턴을 변형 없이 28회 반복합니다(퍼블릭도메인 조판 악보의 인코딩을 직접 확인, 링컨센터 실내악협회 해설이 교차 확인). 이 베이스를 화성으로 읽은 것이 D → A → Bm → F♯m → G → D → G → A이며, 로마숫자 표기는 Open Music Theory 근거입니다.',
                color: 'var(--cat-sports)',
              },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${p.color} 19%, transparent)`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: p.color, marginBottom: '6px' }}>{p.name}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>{p.deg}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{p.ex}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{p.desc}</p>
                {p.song && (
                  <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <strong style={{ color: 'var(--text)' }}>대표곡</strong> · {p.song}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--cat-sports) 19%, transparent)', borderRadius: '12px', padding: '16px 20px', marginTop: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cat-sports)', marginBottom: '6px' }}>캐논 진행과 팝 4코드는 &lsquo;네 번째 코드&rsquo; 하나가 다르다</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
              캐논 진행의 앞 네 코드는 <strong style={{ color: 'var(--text)' }}>Ⅰ → Ⅴ → ⅵ → ⅲ</strong>(C → G → Am → Em)이고, 팝의 4코드 루프는 <strong style={{ color: 'var(--text)' }}>Ⅰ → Ⅴ → ⅵ → Ⅳ</strong>(C → G → Am → F)입니다. 네 번째 자리의 ⅲ이 Ⅳ로 한 칸 바뀌었을 뿐인데, 동료심사 학술지 <em>Music Theory Online</em>(Mark Richards, 23권 3호, 2017)은 이 작은 변경이 &ldquo;훨씬 흔한 진행&rdquo;을 만들어 낸다고 지적합니다. 즉 둘은 같은 진행의 별칭이 아니라 <strong style={{ color: 'var(--text)' }}>한 코드가 다른 별개 진행</strong>이므로, 어떤 곡이 캐논 진행인지 볼 때는 네 번째 코드가 ⅲ인지 Ⅳ인지부터 확인하면 됩니다. 캐논 진행은 앞 4~5개만 쓰고 뒷부분을 새로 쓰는 축약형, 짝수 자리를 1전위로 바꾸는 변형(Ⅴ6·ⅲ6·Ⅰ6)도 흔합니다.
            </p>
          </div>
        </div>

        {/* ── 4-1. 마이너 2-5-1의 Ⅴ7 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            마이너 2-5-1에서 Ⅴ가 Ⅴ7이 되는 이유
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            자연 단음계만 쓰면 Ⅴ 자리에는 단3화음 ⅴ(A 마이너의 Em7)가 놓입니다. 오픈교재 <strong style={{ color: 'var(--text)' }}>Open Music Theory</strong>는 이 지점을 이렇게 정리합니다 — <strong style={{ color: 'var(--text)' }}>단조에서 이끔음을 반음 올리면 화음의 품질이 바뀌고, 따라서 로마숫자도 바뀐다. 단3화음 ⅴ는 장3화음 Ⅴ가 되고 Ⅶ은 감3화음 ⅶ°가 된다. 그래서 단조 조성에서 Ⅴ나 ⅶ° 표기를 보면 올린 이끔음을 쓰고 있다는 뜻이다.</strong> 자연 단음계의 7음은 으뜸음과 온음 거리라 애초에 &lsquo;이끔음&rsquo;이 아니라 <strong style={{ color: 'var(--text)' }}>아래으뜸음(subtonic)</strong>으로 부르고, 그 음을 반음 올린 음계가 화성 단음계입니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>자리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>장조 품질 (C 메이저)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>단조 품질 (A 마이너)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['ⅱ', 'm7 — Dm7', 'm7♭5(반감7) — Bm7♭5'],
                  ['Ⅴ', '7(도미넌트7) — G7', '7(도미넌트7) — E7'],
                  ['Ⅰ / ⅰ', 'maj7 — Cmaj7', 'm7 — Am7'],
                ].map(([pos, maj, min], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{pos}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{maj}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{min}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            같은 교재의 재즈 장은 마이너 2-5-1의 품질을 <strong style={{ color: 'var(--text)' }}>반감7 → 도미넌트7 → 단7(ø7-7-mi7)</strong>로 못박으면서, <strong style={{ color: 'var(--text)' }}>Ⅴ 화음은 장조든 단조든 장화음</strong>이라고 덧붙입니다. 위 계산기의 단조 다이아토닉 탭에서 마이너 2-5-1만 Ⅴ를 도미넌트7로 바꿔 표기하는 것도 이 규칙 때문입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--cat-edu) 19%, transparent)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cat-edu)', marginBottom: '6px' }}>표기 주의 — 조성 이름은 언제나 자연 단음계 기준</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
              Ⅴ7을 쓴다고 해서 그 곡을 &lsquo;화성 단조 곡&rsquo;이라 부르지는 않습니다. 교재는 조성 이름을 늘 자연 단음계 기준으로 A 마이너·D 마이너라 부르고, 작품이 화성·가락 단음계에 &lsquo;속한다&rsquo;고 말하지 않는다고 명시합니다. 화성·가락 단음계는 조성의 종류가 아니라 <strong style={{ color: 'var(--text)' }}>필요할 때 7음(과 6음)을 올려 쓰는 운용 방식</strong>으로 이해하는 편이 정확합니다. 한편 2-5-1은 장·단조를 가릴 것 없이 변형이 잦아서, 같은 교재는 「A Night in Tunisia」가 Ⅴ의 5음을 낮추고 「Prelude to a Kiss」가 7음은 둔 채 Ⅴ를 증화음으로 쓰며 「Misty」가 도착 코드를 maj7 대신 6화음으로 받는 예를 듭니다.
            </p>
          </div>
        </div>

        {/* ── 4-2. 슬래시 코드 읽는 법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            슬래시 코드(분수 코드) 읽는 법
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            C/E, G/B처럼 슬래시로 표기된 코드는 <strong style={{ color: 'var(--text)' }}>왼쪽 코드를 치되, 베이스(가장 낮은 음)만 오른쪽 음으로</strong> 연주하라는 뜻입니다. 베이스 음이 코드 구성음이면 음의 배치만 바뀌는 <strong style={{ color: 'var(--text)' }}>전위</strong>이고(C/E·G/B), 구성음이 아니면 코드 위에 새 베이스를 얹는 <strong style={{ color: 'var(--text)' }}>비화성 베이스</strong>입니다(Am/G). 어느 쪽이든 코드 사이의 베이스 라인을 매끄럽게 이어줄 때 주로 씁니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>표기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연주 (베이스 + 나머지)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>설명</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['C/E',  '베이스 E + C, G',     'C 코드의 1전위 — 3도 음이 베이스'],
                  ['C/G',  '베이스 G + C, E',     'C 코드의 2전위 — 5도 음이 베이스'],
                  ['G/B',  '베이스 B + G, D',     'G 코드의 1전위. C↔Am 사이를 잇는 단골'],
                  ['Am/G', '베이스 G + A, C, E',  '전위가 아닌 비화성 베이스 — 합치면 Am7과 같은 소리'],
                  ['D/F♯', '베이스 F♯ + D, A',    'D 코드의 1전위. 베이스 라인 연결에 자주 사용'],
                ].map(([chord, notes, desc], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>{chord}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{notes}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--accent) 19%, transparent)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '6px' }}>실전 예 — 하행 베이스 라인</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>C → G/B → Am → Am/G → F → C/E → Dm7 → G7</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
              코드는 C·G·Am·F 정도만 오가지만 베이스는 <strong style={{ color: 'var(--text)' }}>C→B→A→G→F→E→D</strong>로 한 음씩 계단처럼 내려갑니다. C와 Am 사이를 G/B가, Am과 F 사이를 Am/G가 이어주는 구조로, 발라드 인트로나 후렴 진입부에서 자주 들리는 진행입니다. 원리를 알면 어떤 진행이든 사이에 전위 코드를 끼워 베이스 라인을 직접 설계할 수 있습니다.
            </p>
          </div>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
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

        {/* ── 6. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/capo',      icon: '🎸', name: '기타 카포 계산기', desc: '코드를 다른 키로 즉시 이동' },
              { href: '/tools/art/frequency', icon: '🎵', name: '주파수↔음정 변환기',    desc: 'Hz ↔ 음이름 변환' },
              { href: '/tools/art/tap-tempo', icon: '👆', name: '탭 템포 계산기',         desc: '탭으로 BPM 측정' },
              { href: '/tools/art/bpm',       icon: '🎛️', name: 'BPM 딜레이 계산기', desc: '음표별 딜레이 타임 ms 계산' },
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
