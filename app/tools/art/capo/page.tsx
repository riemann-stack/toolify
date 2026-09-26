import Link from 'next/link'
import CapoClient from './CapoClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/art/capo',
  title: '기타 카포 계산기 — 카포 위치별 코드 변환·쉬운 코드 추천',
  description: '원곡 키·카포 위치로 변환 코드와 쉬운 코드 자동 추천. 밤편지·벚꽃 엔딩 등 애창곡 실전 카포 사례, 남성 키↔여성 키 역산 3단계, 카포 종류 비교까지.',
  keywords: ['기타카포계산기', '카포위치계산', '기타전조계산기', '코드변환계산기', '카포코드표', '기타코드이동', '전조계산기'],
})

const FAQ_LD = [
              { q: '카포를 쓰면 음질이 나빠지나요?',
                a: '<strong>고품질 카포 사용 시 음질 차이는 거의 없습니다.</strong> 다만 카포가 너무 느슨하거나 타이트하면 음정이 틀어질 수 있습니다. 카포 장착 후 반드시 튜닝을 다시 확인하세요.' },
              { q: '카포 7프렛 이상은 왜 잘 안 쓰나요?',
                a: '카포를 높이 끼운다고 현의 장력이 눈에 띄게 커지는 것은 아닙니다. 실제 이유는 <strong>프렛 간격이 좁아지고, 진동하는 현이 짧아져 체감 텐션이 뻣뻣해지기 때문</strong>입니다. 카포 압착에 의한 미세한 샤프(음정 틀어짐)는 위치와 무관하게 생길 수 있어 장착 후 재튜닝이 필요합니다. 또한 연주 음역이 높아져 기타 특유의 따뜻한 음색이 옅어집니다. 일반적으로 <strong>카포 5프렛 이하를 권장</strong>합니다.' },
              { q: '카포 없이 전조하려면 어떻게 하나요?',
                a: '모든 코드를 반음 단위로 이동하면 됩니다. 예를 들어 C키를 D키로 올리려면 모든 코드를 2반음 올립니다. <code>C→D, Am→Bm, F→G, G→A</code>. 이 계산기의 "전조" 탭을 활용하세요.' },
              { q: '같은 키라도 카포 위치에 따라 음색이 다른가요?',
                a: '네, 다릅니다. 카포가 높을수록 현의 진동 부분이 짧아져 <strong>더 밝고 날카로운 소리</strong>가 납니다. 카포 없는 낮은 포지션은 따뜻하고 풍부한 음색, 카포 5프렛 이상은 맑고 영롱한 음색입니다. 같은 C키라도 카포 없음(C코드)과 카포 3프렛(A코드)은 음색이 확실히 다릅니다.' },
              { q: '우쿨렐레에도 카포를 쓸 수 있나요?',
                a: '네. <strong>우쿨렐레용 카포가 별도로 있으며</strong> 기타와 같은 원리(1프렛 = 반음 1개)로 작동합니다. 다만 같은 손 모양이라도 <strong>코드 이름이 기타와 다릅니다</strong> — 표준 우쿨렐레 조율 G-C-E-A는 기타 4~1번 줄(D-G-B-E)에 카포 5를 낀 것과 줄 사이 음정 관계가 같아서, 기타의 G 모양(0-0-0-3)을 우쿨렐레에서 잡으면 C 코드가 됩니다. 키 계산(연주 모양 키 + 카포 반음 = 실제 키)은 이 계산기와 똑같이 적용하되, 모양 키는 우쿨렐레 코드 이름으로 읽으세요.' },
              { q: '단조(마이너) 곡은 어떻게 계산하나요?',
                a: '이 계산기는 <strong>장조 기준</strong>입니다. 단조 곡은 나란한 장조(같은 조표)로 선택하세요 — <code>Am→C, Em→G, Bm→D, Dm→F</code>. 나란조는 다이아토닉 코드 구성이 완전히 같아서 카포 추천과 코드 변환 결과가 그대로 적용됩니다.' },
              { q: '여성 키 곡을 남성 키로 바꾸려면 몇 키를 내려야 하나요?',
                a: '정해진 표준은 없으며, <strong>통상 3~5키(반음) 범위에서 곡과 본인 음역대에 맞춰 조정</strong>하는 것이 일반적입니다. 참고로 노래방 반주기의 키 조절 1단계(\'한 키\')는 반음 1개입니다. 키를 내린 뒤에는 본문 가이드의 역산 절차대로 <code>카포 위치 = 목표 키 − 코드 모양 키</code>를 계산하면 익숙한 코드 모양을 유지할 수 있습니다.' },
            ]

export default function CapoPage() {
  return (
    <ToolPage width={760} slug="/tools/art/capo">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />기타 카포 계산기
      </h1>
      <p className="tp-lead">
        원곡 키와 카포 위치로 <strong style={{ color: 'var(--text)' }}>변환된 코드</strong> + 쉬운 코드 추천.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="카포 1프렛 = 반음 1개(12평균율 프렛) · 추천 = 장조 다이아토닉 3화음(M-m-m-M-M-m-°) 중 오픈 코드 수 → 바레 수 → 낮은 프렛 순(0~5프렛) · 단조 곡은 같은 조표의 나란한 장조로 계산 · 애창곡 원키·통용 카포 = 악보바다·ezcho·Ultimate Guitar(2026-07 확인)"
        sources={[
          { label: 'Merriam-Webster — capotasto(카포) 정의', href: 'https://www.merriam-webster.com/dictionary/capotasto' },
          { label: 'Music Theory for the 21st-Century Classroom — 장조의 다이아토닉 화음', href: 'https://musictheory.pugetsound.edu/mt21c/DiatonicChordsInMajor.html' },
          { label: 'Music Theory for the 21st-Century Classroom — 단조 조표와 나란한조', href: 'https://musictheory.pugetsound.edu/mt21c/MinorKeySignatures.html' },
        ]}
      />

      <CapoClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 카포란? ── */}
        <div>
          <h2 className="g-h2">
            카포(Capo)란 무엇인가?
          </h2>
          <p className="g-p">
            카포(Capo)는 기타·우쿨렐레 등 프렛 악기의 특정 프렛에 끼워 <strong style={{ color: 'var(--text)' }}>모든 현을 동시에 높이 조율하는 장치</strong>입니다.
            카포를 1프렛에 끼우면 모든 현이 반음 올라가고, 3프렛에 끼우면 단3도 올라갑니다.
            쉬운 코드 모양을 유지하면서 다른 키로 이조할 수 있어 기타 편곡의 핵심 도구입니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent-line)', borderRadius: 'var(--radius-card)', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>카포 계산 공식</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              실제 울리는 키 = 연주 코드 + 카포 프렛 수(반음)
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              예: G 코드 + 카포 3프렛 → B♭ 키
            </p>
          </div>

          <h3 className="g-h3">왜 카포를 쓰나요?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '보컬 음역대 맞추기', desc: '원곡 키가 보컬에게 너무 높거나 낮을 때 카포로 키를 옮겨 부르기 편한 높이로 조정합니다.' },
              { n: '②', title: '쉬운 코드로 편곡',   desc: '바레 코드가 많은 F·B♭ 키를 카포 1~5프렛으로 옮겨 E·C·G·D 같은 오픈 코드로 연주합니다.' },
              { n: '③', title: '앙상블 보이싱',      desc: '다른 기타와 같은 곡을 다른 카포로 연주하면 겹치지 않는 코드 보이싱이 생겨 풍성한 사운드가 됩니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '4px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 카포 위치별 코드 변환 예시 (C키 기준) ── */}
        <div>
          <h2 className="g-h2">
            카포 위치별 코드 변환 — C키 기준
          </h2>
          <p className="g-p">
            같은 C키 곡이라도 카포 위치에 따라 잡는 코드 모양과 난이도가 완전히 달라집니다. 아래는 C키 곡을 카포별로 어떻게 연주할 수 있는지 정리한 표입니다.
          </p>
          <div className="tableScroll">
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
                  { fret: '없음',  chord: 'C',      key: 'C', diff: '쉬움 (바레는 F 하나)',  badge: 'rec' },
                  { fret: '1프렛', chord: 'B',      key: 'C', diff: '어려움 (바레 다수)',       badge: null },
                  { fret: '2프렛', chord: 'A♯(B♭)', key: 'C', diff: '어려움',                  badge: null },
                  { fret: '3프렛', chord: 'A',      key: 'C', diff: '보통 (Bm·F♯m·C♯m 바레)',  badge: null },
                  { fret: '4프렛', chord: 'G♯(A♭)', key: 'C', diff: '어려움',                  badge: null },
                  { fret: '5프렛', chord: 'G',      key: 'C', diff: '쉬움 (바레는 Bm 하나)', badge: 'rec' },
                  { fret: '7프렛', chord: 'F',      key: 'C', diff: '어려움 (바레)',            badge: null },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: row.badge === 'rec' ? 'color-mix(in srgb, var(--success) 6%, transparent)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.fret}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{row.chord}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{row.key}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.badge === 'rec' ? 'var(--success)' : 'var(--muted)' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 오픈 코드 vs 바레 코드 ── */}
        <div>
          <h2 className="g-h2">
            오픈 코드 vs 바레 코드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700, marginBottom: '8px' }}>오픈 코드 (쉬움)</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                C · G · D · Em · Am · A · E · Dm
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                개방현(아무 프렛도 안 누른 현)을 활용하여 손가락 부담이 적은 코드.
                입문자가 가장 먼저 배우는 코드이며 풍부한 울림이 특징입니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 700, marginBottom: '8px' }}>바레 코드 (어려움)</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                F · B♭ · E♭ · A♭ · D♭ · G♭ · B + Bm · Cm · F♯m · Gm 등
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
                검지로 여러 현을 동시에 누르는(바레) 코드. 악력과 정확한 폼이 필요해 입문자에게 진입장벽이 높습니다.
                카포로 상당 부분 오픈 코드로 대체할 수 있지만, 키·진행에 따라 일부 바레(Bm 등)는 남습니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. 자주 쓰는 키별 추천 카포 ── */}
        <div>
          <h2 className="g-h2">
            자주 쓰는 키별 추천 카포 위치
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['키', '추천 카포', '연주 코드 모양', '바레 코드 수'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: 'C',  fret: '없음 / 5프렛',  play: 'C / G', diff: '1개 (F) / 1개 (Bm)' },
                  { k: 'D',  fret: '2프렛 / 없음',  play: 'C / D', diff: '1개 (F) / 2개' },
                  { k: 'E',  fret: '4프렛 / 2프렛', play: 'C / D', diff: '1개 (F) / 2개' },
                  { k: 'F',  fret: '5프렛 / 3프렛', play: 'C / D', diff: '1개 (F) / 2개' },
                  { k: 'G',  fret: '없음 / 5프렛',  play: 'G / D', diff: '1개 (Bm) / 2개' },
                  { k: 'A',  fret: '2프렛 / 없음',  play: 'G / A', diff: '1개 (Bm) / 3개' },
                  { k: 'B♭', fret: '3프렛 / 1프렛', play: 'G / A', diff: '1개 (Bm) / 3개' },
                  { k: 'B',  fret: '4프렛 / 2프렛', play: 'G / A', diff: '1개 (Bm) / 3개' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '15px' }}>{row.k}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.fret}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--success)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.play}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 위 계산기의 추천 알고리즘(다이아토닉 7코드 중 쉬운 오픈 코드 최다 → 바레 최소 → 낮은 프렛 순, 0~5프렛)과 동일한 기준으로 산출한 1·2순위입니다.
            바레 수는 vii°(감화음)를 뺀 6개 코드 기준 — 1순위는 위 8개 키 모두 C 모양(F 하나) 또는 G 모양(Bm 하나)이고(표에 없는 F♯/G♭ 키만 카포 4 + D 모양, 바레 F♯m·Bm 2개가 1순위),
            D 모양 2순위는 F♯m·Bm, A 모양 2순위는 Bm·C♯m·F♯m이 바레입니다.
            E 모양(카포 1로 F키 등)도 통용되지만 F♯m·G♯m·B·C♯m 바레가 4개라 순위에서 밀립니다.
          </p>
        </div>

        {/* ── 5. 통기타 애창곡 실전 카포 사례 ── */}
        <div>
          <h2 className="g-h2">
            통기타 애창곡 실전 카포 사례
          </h2>
          <p className="g-p">
            악보 사이트에서 통용되는 편곡 기준으로, 통기타로 많이 연주되는 곡들의 원곡 키와 카포 위치를 정리했습니다.
            플랫(♭) 계열 키(B♭·E♭·A♭)의 곡은 오픈 코드 모양이 없어 — 바레·부분 보이싱으로 칠 수는 있지만 — 오픈 코드 위주의 통기타 편곡에서는 카포 사용이 표준이고,
            벚꽃 엔딩(A장조)처럼 샤프 키 곡도 실음 첫 코드가 Bm7이라 카포 2 + G키 모양으로 치는 편곡이 표준입니다.
            모양 키는 편곡의 첫 코드가 아니라 <strong style={{ color: 'var(--text)' }}>다이아토닉 코드 세트 기준</strong>입니다 —
            밤편지 편곡은 F로 시작하지만 F·G·Em·Am·Dm은 C키 세트라 &lsquo;C키 모양&rsquo;입니다.
          </p>
          <div className="tableScroll">
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
                  { song: '밤편지 — 아이유',                 key: 'E♭', capo: '3프렛', shape: 'C키 모양 (F로 시작 — F·G·Em·Am·Dm)' },
                  { song: '주저하는 연인들을 위해 — 잔나비',  key: 'B♭', capo: '3프렛', shape: 'G키 모양 (G·Bm·C·Cm)' },
                  { song: '모든 날, 모든 순간 — 폴킴',        key: 'A♭', capo: '1프렛', shape: 'G키 모양 (사실상 바레 없음)' },
                  { song: '벚꽃 엔딩 — 버스커버스커',         key: 'A',  capo: '2프렛', shape: 'G키 모양 (Am7로 시작)' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row.song}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--accent-ink)' }}>{row.key}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{row.capo}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.shape}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 악보 사이트·편곡자에 따라 카포 위치는 달라질 수 있습니다. 검산은 이 계산기 공식 그대로 —
            연주 코드 모양의 키 + 카포 반음 수 = 원곡 키 (예: C키 모양 + 3반음 = E♭).
            원곡 키·통용 카포 출처: 악보바다 원키 표기·ezcho 코드 자료실·Ultimate Guitar (2026-07 확인).
          </p>
        </div>

        {/* ── 6. 카포 종류별 비교 ── */}
        <div>
          <h2 className="g-h2">
            카포 종류별 비교 — 스프링·스크류·롤링·파셜
          </h2>
          <p className="g-p">
            카포는 장착 방식에 따라 속도와 튜닝 안정성이 크게 달라집니다.
            스프링(트리거)식은 한 손으로 가장 빠르게 옮길 수 있지만 압력이 고정이라 세게 눌리면 음이 샤프(♯)하게 뜰 수 있고,
            스크류식은 느린 대신 나사로 압력을 미세 조절할 수 있어 튜닝이 가장 안정적입니다.
          </p>
          <div className="tableScroll">
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
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 600 }}>{row.move}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.adj}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 어떤 종류든 프렛 바로 뒤(프렛 위 아님)에 장착하고, 장착 후에는 튜닝을 다시 확인하세요.
            버징 없이 소리가 나는 최소한의 압력이 이상적입니다.
          </p>
        </div>

        {/* ── 7. 남성 키 ↔ 여성 키 전환 ── */}
        <div>
          <h2 className="g-h2">
            남성 키 ↔ 여성 키 전환 — 카포 역산 3단계
          </h2>
          <p className="g-p">
            같은 곡도 남성·여성 보컬의 음역이 달라 키를 옮겨 부르는 경우가 많습니다.
            몇 키를 옮길지 정해진 표준은 없으며, <strong style={{ color: 'var(--text)' }}>통상 3~5키(반음) 범위에서 곡과 본인 음역대에 맞춰 조정</strong>하는 것이 일반적입니다.
            노래방 반주기의 키 조절 1단계(&lsquo;한 키&rsquo;)는 반음 1개입니다. 키를 정한 뒤에는 아래 순서로 카포를 역산하면 익숙한 코드 모양을 그대로 쓸 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { n: '①', title: '목표 키 계산',     desc: '원곡 키에서 내릴 반음 수를 뺍니다. 예: E♭에서 3키(3반음) 내리면 C.' },
              { n: '②', title: '코드 모양 선택',   desc: '카포 위치 = 목표 키 − 코드 모양 키(반음). 카포가 0~5프렛이 되는 모양을 고릅니다. C키 = C모양+카포 없음 = A모양+3프렛 = G모양+5프렛.' },
              { n: '③', title: '기존 악보 재활용', desc: '같은 코드 모양을 유지하려면 새 카포 = 기존 카포 − 내린 반음 수. 음수가 나오면 그 모양은 불가능하므로 ②에서 다른 모양을 고릅니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '4px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent-line)', borderRadius: 'var(--radius-card)', padding: '20px 22px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>실전 예시 — 밤편지를 남성 키로</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              원곡 E♭ (카포 3 + C키 모양) → 3키 내려 C키
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '-0.2px' }}>
              C 모양 유지 시 새 카포 = 3 − 3 = 0 → 카포만 빼면 됩니다. 4키 내려 B키라면 3 − 4 = −1(불가) → 카포 4 + G키 모양(G+4=B)
            </p>
          </div>
        </div>

        {/* ── 7-2. 자주 틀리는 계산 ── */}
        <div>
          <h2 className="g-h2">
            카포 계산에서 자주 틀리는 네 가지
          </h2>
          <p className="g-p">
            계산식은 &lsquo;실제 키 = 모양 키 + 카포 반음 수&rsquo; 하나뿐이지만, 악보 표기와 튜닝이 섞이면 결과가 반음~몇 반음씩 어긋납니다.
            아래 네 경우는 계산기 결과가 맞는데도 실제 소리가 원곡과 다르게 들리는 대표적인 원인입니다.
          </p>
          <ul className="g-list">
            <li>
              <strong>모양 코드와 실음 코드를 섞어 읽기</strong> — &lsquo;Capo 3&rsquo; 표기와 G·C·D가 함께 적힌 악보라면 G·C·D는 손 모양이고 실제 소리는 B♭·E♭·F입니다.
              반대로 실음 코드(B♭·E♭·F)만 적힌 악보를 보면서 카포 3을 끼운 채 그 이름대로 잡으면 3반음이 더해져 D♭ 키로 울립니다.
              카포는 음을 올리기만 하므로, 모양 키를 구할 때는 반드시 빼기(실제 키 − 카포)를 씁니다.
            </li>
            <li>
              <strong>반음 내림 튜닝 곡</strong> — 이 계산기는 표준 튜닝(E-A-D-G-B-E)을 전제합니다. 원곡이 모든 줄을 반음 내린 튜닝(E♭-A♭-D♭-G♭-B♭-E♭)으로 연주됐다면
              같은 모양·같은 카포라도 반음 낮게 울리므로 <strong>실제 키 = 모양 키 + 카포 − 1</strong>입니다. 표준 튜닝으로 맞추려면 카포를 한 칸 내리고,
              이미 카포가 없다면 한 반음 낮은 키의 모양을 골라 역산 절차 ②를 다시 적용합니다.
            </li>
            <li>
              <strong>7th·sus·슬래시 코드</strong> — 카포로 옮겨도 코드 종류는 변하지 않고 루트와 베이스음만 같은 반음 수만큼 이동합니다.
              카포 2에서 잡는 Cmaj7/E 모양은 실제로 Dmaj7/F♯이고, Asus4 모양은 Bsus4입니다. 전조 탭의 &lsquo;코드 진행 직접 변환&rsquo;도 이 규칙대로 루트·슬래시 베이스만 옮기고 서픽스(maj7·sus4·add9 등)는 그대로 둡니다.
            </li>
            <li>
              <strong>다이아토닉 밖의 코드</strong> — 추천 순위는 장조 다이아토닉 7코드만 셉니다. C키 곡에 B♭·Fm 같은 차용 화음이나 E7·A7 같은 세컨더리 도미넌트가 자주 나오면 실제 바레 수는 표보다 늘어납니다.
              곡 전체 코드를 전조 탭에 붙여 넣고 &lsquo;↓ 내리기&rsquo;로 카포 프렛 수만큼 내리면, 그 카포에서 실제로 잡게 될 모양 코드를 한 번에 확인할 수 있습니다(1~6반음).
            </li>
          </ul>
        </div>

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/vocal-range', icon: '🎤', name: '음역대 측정기',      desc: '내 음역대 측정 → 부르기 편한 키 결정' },
              { href: '/tools/art/frequency',   icon: '🎵', name: '주파수↔음정 변환기', desc: 'Hz ↔ 음정·MIDI·파장' },
              { href: '/tools/art/tap-tempo',   icon: '🥁', name: '탭 템포',            desc: '박자에 맞춰 탭해 BPM 측정' },
              { href: '/tools/art/chord',       icon: '🎹', name: '코드 구성음 계산기', desc: '코드 이름 → 구성음·역방향 검색' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
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
    </ToolPage>
  )
}
