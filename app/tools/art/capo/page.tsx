import Link from 'next/link'
import CapoClient from './CapoClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/capo',
  title: '기타 카포 계산기 — 카포 위치별 코드 변환·쉬운 코드 추천',
  description: '원곡 키와 카포 위치로 변환된 코드 + 쉬운 코드 추천. 노래 키를 바꿔 부르거나 어려운 코드를 피할 때.',
  keywords: ['기타카포계산기', '카포위치계산', '기타전조계산기', '코드변환계산기', '카포코드표', '기타코드이동', '전조계산기'],
})

const FAQ_LD = [
              { q: '카포를 쓰면 음질이 나빠지나요?',
                a: '<strong>고품질 카포 사용 시 음질 차이는 거의 없습니다.</strong> 다만 카포가 너무 느슨하거나 타이트하면 음정이 틀어질 수 있습니다. 카포 장착 후 반드시 튜닝을 다시 확인하세요.' },
              { q: '카포 7프렛 이상은 왜 잘 안 쓰나요?',
                a: '프렛이 높아질수록 현의 장력이 높아져 음정이 불안정해지고 코드 잡기도 어려워집니다. 또한 가청 음역대가 너무 높아져 기타 특유의 따뜻한 음색이 사라집니다. 일반적으로 <strong>카포 5프렛 이하를 권장</strong>합니다.' },
              { q: '카포 없이 전조하려면 어떻게 하나요?',
                a: '모든 코드를 반음 단위로 이동하면 됩니다. 예를 들어 C키를 D키로 올리려면 모든 코드를 2반음 올립니다. <code>C→D, Am→Bm, F→G, G→A</code>. 이 계산기의 "전조" 탭을 활용하세요.' },
              { q: '같은 키라도 카포 위치에 따라 음색이 다른가요?',
                a: '네, 다릅니다. 카포가 높을수록 현의 진동 부분이 짧아져 <strong>더 밝고 날카로운 소리</strong>가 납니다. 카포 없는 낮은 포지션은 따뜻하고 풍부한 음색, 카포 5프렛 이상은 맑고 영롱한 음색입니다. 같은 C키라도 카포 없음(C코드)과 카포 3프렛(A코드)은 음색이 확실히 다릅니다.' },
              { q: '우쿨렐레에도 카포를 쓸 수 있나요?',
                a: '네. <strong>우쿨렐레용 카포가 별도로 있으며</strong> 기타와 같은 원리로 작동합니다. 다만 우쿨렐레는 G-C-E-A 조율이 기본이라 코드 이름이 기타와 다를 수 있습니다. 이 계산기의 반음 단위 계산 원리는 동일하게 적용됩니다.' },
              { q: '여성 키 곡을 남성 키로 바꾸려면 몇 키를 내려야 하나요?',
                a: '정해진 표준은 없으며, <strong>통상 3~5키(반음) 범위에서 곡과 본인 음역대에 맞춰 조정</strong>하는 것이 일반적입니다. 참고로 노래방에서 말하는 \'한 키\'는 반음 1개에 해당합니다. 키를 내린 뒤에는 본문 가이드의 역산 절차대로 <code>카포 위치 = 목표 키 − 코드 모양 키</code>를 계산하면 익숙한 코드 모양을 유지할 수 있습니다.' },
            ]

export default function CapoPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />기타 카포 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        원곡 키와 카포 위치로 <strong style={{ color: 'var(--text)' }}>변환된 코드</strong> + 쉬운 코드 추천.
      </p>

      <CapoClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 카포란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카포(Capo)란 무엇인가?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            카포(Capo)는 기타·우쿨렐레 등 프렛 악기의 특정 프렛에 끼워 <strong style={{ color: 'var(--text)' }}>모든 현을 동시에 높이 조율하는 장치</strong>입니다.
            카포를 1프렛에 끼우면 모든 현이 반음 올라가고, 3프렛에 끼우면 단3도 올라갑니다.
            쉬운 코드 모양을 유지하면서 다른 키로 이조할 수 있어 기타 편곡의 핵심 도구입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '14px', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>카포 계산 공식</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              실제 울리는 키 = 연주 코드 + 카포 프렛 수(반음)
            </p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              예: G 코드 + 카포 3프렛 → B♭ 키
            </p>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>왜 카포를 쓰나요?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '보컬 음역대 맞추기', desc: '원곡 키가 보컬에게 너무 높거나 낮을 때 카포로 키를 옮겨 부르기 편한 높이로 조정합니다.' },
              { n: '②', title: '쉬운 코드로 편곡',   desc: '바레 코드가 많은 F·B♭ 키를 카포 1~5프렛으로 옮겨 E·C·G·D 같은 오픈 코드로 연주합니다.' },
              { n: '③', title: '앙상블 보이싱',      desc: '다른 기타와 같은 곡을 다른 카포로 연주하면 겹치지 않는 코드 보이싱이 생겨 풍성한 사운드가 됩니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 카포 위치별 코드 변환 예시 (C키 기준) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카포 위치별 코드 변환 — C키 기준
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            같은 C키 곡이라도 카포 위치에 따라 잡는 코드 모양과 난이도가 완전히 달라집니다. 아래는 C키 곡을 카포별로 어떻게 연주할 수 있는지 정리한 표입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['카포', '연주 코드', '실제 키', '난이도'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { fret: '없음',  chord: 'C',  key: 'C', diff: '보통 (F코드 포함)', badge: null },
                  { fret: '1프렛', chord: 'B',  key: 'C', diff: '어려움 (바레 다수)', badge: null },
                  { fret: '2프렛', chord: 'A♯', key: 'C', diff: '어려움',           badge: null },
                  { fret: '3프렛', chord: 'A',  key: 'C', diff: '✨ 쉬움',          badge: 'rec' },
                  { fret: '4프렛', chord: 'G♯', key: 'C', diff: '어려움',           badge: null },
                  { fret: '5프렛', chord: 'G',  key: 'C', diff: '✨ 쉬움',          badge: 'rec' },
                  { fret: '7프렛', chord: 'F',  key: 'C', diff: '어려움 (바레)',    badge: null },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: row.badge === 'rec' ? 'rgba(16,185,129,0.05)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row.fret}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row.chord}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{row.key}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.badge === 'rec' ? '#059669' : 'var(--muted)' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 오픈 코드 vs 바레 코드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            오픈 코드 vs 바레 코드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#059669', fontWeight: 700, marginBottom: '8px' }}>🟢 오픈 코드 (쉬움)</p>
              <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                C · G · D · Em · Am · A · E · Dm
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                개방현(아무 프렛도 안 누른 현)을 활용하여 손가락 부담이 적은 코드.
                입문자가 가장 먼저 배우는 코드이며 풍부한 울림이 특징입니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.3)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '8px' }}>🔴 바레 코드 (어려움)</p>
              <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                F · B♭ · E♭ · A♭ · D♭ · G♭ · B
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                검지로 여러 현을 동시에 누르는(바레) 코드. 악력과 정확한 폼이 필요해 입문자에게 진입장벽이 높습니다.
                카포로 대부분 오픈 코드로 대체 가능합니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. 자주 쓰는 키별 추천 카포 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 쓰는 키별 추천 카포 위치
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['키', '추천 카포', '연주 코드 모양', '난이도'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: 'C',  fret: '없음 / 3프렛',  play: 'C / A',      diff: '쉬움' },
                  { k: 'D',  fret: '2프렛',         play: 'C',          diff: '쉬움' },
                  { k: 'E',  fret: '4프렛',         play: 'C',          diff: '쉬움' },
                  { k: 'F',  fret: '1프렛 / 5프렛', play: 'E / C',      diff: '쉬움' },
                  { k: 'G',  fret: '없음',          play: 'G',          diff: '쉬움' },
                  { k: 'A',  fret: '없음 / 2프렛',  play: 'A / G',      diff: '쉬움' },
                  { k: 'B♭', fret: '1프렛 / 3프렛', play: 'A / G',      diff: '쉬움' },
                  { k: 'B',  fret: '2프렛 / 4프렛', play: 'A / G',      diff: '쉬움' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, fontSize: '15px' }}>{row.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.fret}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#059669', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.play}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 모든 키는 카포를 쓰면 어려운 바레 코드(F·B♭ 등)를 오픈 코드로 대체할 수 있습니다.
          </p>
        </div>

        {/* ── 5. 통기타 애창곡 실전 카포 사례 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            통기타 애창곡 실전 카포 사례
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            악보 사이트에서 통용되는 편곡 기준으로, 통기타로 많이 연주되는 곡들의 원곡 키와 카포 위치를 정리했습니다.
            플랫(♭) 계열 키(B♭·E♭·A♭)의 곡은 오픈 코드 모양이 없어 카포가 사실상 필수인 반면,
            E키인 벚꽃 엔딩처럼 오픈 코드가 가능한 키는 카포 없이 원키 연주가 통용됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['곡 — 아티스트', '원곡 키', '통용 카포', '연주 코드 모양'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { song: '밤편지 — 아이유',                 key: 'A♭', capo: '3프렛', shape: 'F키 (F·G·Em·Am·Dm)' },
                  { song: '주저하는 연인들을 위해 — 잔나비',  key: 'B♭', capo: '1프렛', shape: 'A키 (Bm·C♯m 포함)' },
                  { song: '모든 날, 모든 순간 — 폴킴',        key: 'E♭', capo: '1프렛', shape: 'D키 (바레는 Bm 하나)' },
                  { song: '벚꽃 엔딩 — 버스커버스커',         key: 'E',  capo: '없음',  shape: 'E키 오픈 코드' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row.song}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>{row.key}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{row.capo}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.shape}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 악보 사이트·편곡자에 따라 카포 위치는 달라질 수 있습니다. 검산은 이 계산기 공식 그대로 —
            연주 코드 모양의 키 + 카포 반음 수 = 원곡 키 (예: F키 모양 + 3반음 = A♭).
          </p>
        </div>

        {/* ── 6. 카포 종류별 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카포 종류별 비교 — 스프링·스크류·롤링·파셜
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            카포는 장착 방식에 따라 속도와 튜닝 안정성이 크게 달라집니다.
            스프링(트리거)식은 한 손으로 가장 빠르게 옮길 수 있지만 압력이 고정이라 세게 눌리면 음이 샤프(♯)하게 뜰 수 있고,
            스크류식은 느린 대신 나사로 압력을 미세 조절할 수 있어 튜닝이 가장 안정적입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '장착·이동', '압력 조절', '적합 상황·주의점'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { type: '스프링(트리거)', move: '한 손 · 가장 빠름',     adj: '불가 (스프링 고정)', fit: '라이브·잦은 키 변경. 과압착 시 샤프 주의' },
                  { type: '스크류',         move: '두 손 · 느림',          adj: '나사로 미세 조절',   fit: '녹음·연습. 튜닝 안정성이 가장 좋음' },
                  { type: '롤링(롤러)',     move: '떼지 않고 밀어서 이동', adj: '불가',               fit: '곡 중간 전조 라이브. 접촉면이 넓어 압력이 비교적 고른 편' },
                  { type: '파셜',           move: '일반 카포와 비슷',      adj: '제품별 상이',        fit: '일부 현만 눌러 오픈 튜닝 느낌의 보이싱. 숙련자용' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 600 }}>{row.move}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.adj}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 어떤 종류든 프렛 바로 뒤(프렛 위 아님)에 장착하고, 장착 후에는 튜닝을 다시 확인하세요.
            버징 없이 소리가 나는 최소한의 압력이 이상적입니다.
          </p>
        </div>

        {/* ── 7. 남성 키 ↔ 여성 키 전환 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            남성 키 ↔ 여성 키 전환 — 카포 역산 3단계
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            같은 곡도 남성·여성 보컬의 음역이 달라 키를 옮겨 부르는 경우가 많습니다.
            몇 키를 옮길지 정해진 표준은 없으며, <strong style={{ color: 'var(--text)' }}>통상 3~5키(반음) 범위에서 곡과 본인 음역대에 맞춰 조정</strong>하는 것이 일반적입니다.
            노래방에서 말하는 &lsquo;한 키&rsquo;는 반음 1개에 해당합니다. 키를 정한 뒤에는 아래 순서로 카포를 역산하면 익숙한 코드 모양을 그대로 쓸 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { n: '①', title: '목표 키 계산',     desc: '원곡 키에서 내릴 반음 수를 뺍니다. 예: A♭에서 4키(4반음) 내리면 E.' },
              { n: '②', title: '코드 모양 선택',   desc: '카포 위치 = 목표 키 − 코드 모양 키(반음). 카포가 0~5프렛이 되는 모양을 고릅니다. E키 = E모양+카포 없음 = D모양+2프렛 = C모양+4프렛.' },
              { n: '③', title: '기존 악보 재활용', desc: '같은 코드 모양을 유지하려면 새 카포 = 기존 카포 − 내린 반음 수. 음수가 나오면 그 모양은 불가능하므로 ②에서 다른 모양을 고릅니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '14px', padding: '20px 22px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>실전 예시 — 밤편지를 남성 키로</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              원곡 A♭ (카포 3 + F키 모양) → 4키 내려 E키
            </p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              F 모양 유지 시 카포 3 − 4 = −1프렛(불가) → 카포 없이 E 오픈 코드, 또는 카포 2 + D키 모양
            </p>
          </div>
        </div>

        {/* ── 8. FAQ ── */}
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

        {/* ── 9. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/frequency', icon: '🎵', name: '주파수↔음정 변환기', desc: 'Hz ↔ 음정·MIDI·파장' },
              { href: '/tools/art/bpm',       icon: '🎛️', name: 'BPM 딜레이 타임',   desc: '딜레이·리버브 ms 계산' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',    desc: '연습 루틴·집중 관리' },
              { href: '/tools/date/dday',       icon: '📅', name: 'D-day 계산기',      desc: '공연·합주 D-day 관리' },
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
