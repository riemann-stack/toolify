import Link from 'next/link'
import ChordClient from './ChordClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/chord',
  title: '코드 구성음 계산기 — Cmaj7·Dm7·G7 코드 음이름 확인',
  description: 'Cmaj7·Dm7 등 코드의 구성음과 역방향 검색 + 다이아토닉 코드표. 작곡·편곡에.',
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
                  { roman: 'Ⅱ',  chord: 'Dm7',    notes: 'D, F, A, C',    func: '서브도미넌트', color: 'var(--cat-health)' },
                  { roman: 'Ⅲ',  chord: 'Em7',    notes: 'E, G, B, D',    func: '토닉',         color: 'var(--success)' },
                  { roman: 'Ⅳ',  chord: 'Fmaj7',  notes: 'F, A, C, E',    func: '서브도미넌트', color: 'var(--cat-health)' },
                  { roman: 'Ⅴ',  chord: 'G7',     notes: 'G, B, D, F',    func: '도미넌트',     color: 'var(--cat-life)' },
                  { roman: 'Ⅵ',  chord: 'Am7',    notes: 'A, C, E, G',    func: '토닉',         color: 'var(--success)' },
                  { roman: 'Ⅶ',  chord: 'Bm7♭5',  notes: 'B, D, F, A',    func: '도미넌트',     color: 'var(--cat-life)' },
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
                  { roman: 'Ⅰ',  chord: 'Am7',    notes: 'A, C, E, G',   note: '토닉. 단조의 중심 코드',                    color: 'var(--success)' },
                  { roman: 'Ⅱ',  chord: 'Bm7♭5',  notes: 'B, D, F, A',   note: '마이너 2-5-1 진행의 Ⅱ 담당',               color: 'var(--cat-health)' },
                  { roman: 'Ⅲ',  chord: 'Cmaj7',  notes: 'C, E, G, B',   note: '나란한조 C 메이저의 Ⅰ과 동일',             color: 'var(--success)' },
                  { roman: 'Ⅳ',  chord: 'Dm7',    notes: 'D, F, A, C',   note: '서브도미넌트',                             color: 'var(--cat-health)' },
                  { roman: 'Ⅴ',  chord: 'Em7',    notes: 'E, G, B, D',   note: '이끔음이 없어 해결감 약함 → 흔히 E7로 대체', color: 'var(--cat-life)' },
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
            자주 쓰이는 코드 진행 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                name: '1-6-4-5 진행 (올드팝·발라드)',
                deg: 'Ⅰ → Ⅵm → Ⅳ → Ⅴ',
                ex: 'Cmaj7 → Am7 → Fmaj7 → G7',
                desc: "수많은 팝·발라드의 기본. '팝의 왕'으로 불리는 1-5-6-4(Ⅰ→Ⅴ→Ⅵm→Ⅳ)는 같은 코드의 순서 변형",
                color: 'var(--accent-ink)',
              },
              {
                name: '2-5-1 진행 (재즈 기본)',
                deg: 'Ⅱm7 → Ⅴ7 → Ⅰmaj7',
                ex: 'Dm7 → G7 → Cmaj7',
                desc: '재즈 스탠더드 대부분에 등장. 도미넌트 모션의 기본',
                color: 'var(--cat-health)',
              },
              {
                name: '1-4-5 진행 (블루스·록)',
                deg: 'Ⅰ → Ⅳ → Ⅴ',
                ex: 'C → F → G',
                desc: '블루스·록큰롤의 뼈대. 12마디 블루스의 핵심 코드',
                color: 'var(--cat-life)',
              },
              {
                name: '카논 진행',
                deg: 'Ⅰ → Ⅴ → Ⅵm → Ⅲm → Ⅳ → Ⅰ → Ⅳ → Ⅴ',
                ex: 'C → G → Am → Em → F → C → F → G',
                desc: '파헬벨 카논의 8코드 시퀀스. 발라드·OST에서 자주 사용',
                color: 'var(--cat-sports)',
              },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${p.color} 19%, transparent)`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: p.color, marginBottom: '6px' }}>{p.name}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>{p.deg}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{p.ex}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4-2. 슬래시 코드 읽는 법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            슬래시 코드(분수 코드) 읽는 법
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            C/E, G/B처럼 슬래시로 표기된 코드는 <strong style={{ color: 'var(--text)' }}>왼쪽 코드를 치되, 베이스(가장 낮은 음)만 오른쪽 음으로</strong> 연주하라는 뜻입니다. 구성음이 달라지는 게 아니라 음의 배치(전위)가 바뀌는 것으로, 코드와 코드 사이의 베이스 라인을 매끄럽게 이어줄 때 주로 씁니다.
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
                  ['Am/G', '베이스 G + A, C, E',  '구성음 합치면 A·C·E·G = Am7과 동일'],
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
