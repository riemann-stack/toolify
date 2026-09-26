import Link from 'next/link'
import FrequencyClient from './FrequencyClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/art/frequency',
  title: '주파수↔음정 변환기 — Hz ↔ 음이름·MIDI·파장 계산',
  description: 'Hz ↔ 음이름·MIDI 번호·파장 상호 변환 + 센트 오차 계산. 기타·바이올린·첼로·우쿨렐레 개방현 튜닝표, 440Hz vs 432Hz, 평균율·순정률 센트 비교까지.',
  keywords: ['주파수 음정 변환기', 'Hz 음정 변환', 'MIDI 번호 계산', '튜닝 계산기', '음정 계산기'],
})

/* ── 표 공용 스타일 ── */
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, textAlign: 'center', fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }

/* ── 표의 수치는 도구와 같은 식(FrequencyClient midiToHz·SPEED_CM)으로 빌드 시 계산 — 손으로 옮겨 적지 않는다 ── */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const SPEED_CM = 34300 // 20°C 공기 중 음속(cm/s)
const midiToHz = (m: number, a4 = 440) => a4 * Math.pow(2, (m - 69) / 12)
const midiName = (m: number) => `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`
const nameToMidi = (name: string) => {
  const mm = name.match(/^([A-G]#?)(-?\d)$/)
  return mm ? (Number(mm[2]) + 1) * 12 + NOTE_NAMES.indexOf(mm[1]) : NaN
}
const cents = (f: number, ref: number) => 1200 * Math.log2(f / ref)
const signed = (v: number, digits = 1) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}`

const PITCH_ROWS: { midi: number; note?: string }[] = [
  { midi: 48 }, { midi: 55 }, { midi: 60, note: '중간 도' }, { midi: 62 }, { midi: 64 }, { midi: 65 },
  { midi: 67 }, { midi: 69, note: '국제 표준' }, { midi: 71 }, { midi: 72 }, { midi: 81 },
]

const A4_ROWS = [
  { hz: 440, badge: '현재 국제 표준', era: '1939년 국제 표준화',
    desc: '1939년 런던 국제회의에서 채택된 표준 피치. 1955년 ISO 권고(R 16)를 거쳐 ISO 16:1975로 공식화. 현대 클래식, 팝, 재즈, 방송 등 대부분의 음악에서 사용됩니다.' },
  { hz: 443, badge: '오케스트라', era: '유럽 오케스트라',
    desc: '베를린 필하모닉, 빈 필하모닉 등 일부 유럽 오케스트라는 더 밝고 화려한 음색을 위해 443–445 Hz를 사용합니다.' },
  { hz: 432, badge: '대안 튜닝', era: '일부 뮤지션 선호',
    desc: '432 Hz는 일부 음악가들이 "더 자연스럽고 따뜻한 음색"이라고 주장하는 대안 피치입니다. 효능 주장의 과학적 근거는 입증되지 않았지만, 특정 장르(명상 음악, 힐링 음악)에서 의도적으로 사용됩니다.' },
  { hz: 415, badge: '바로크 피치', era: '17–18세기 바로크 시대',
    desc: '바로크 시대의 실제 피치는 지역·용도별로 크게 달랐지만(프랑스 약 392 Hz, 독일 교회 460~470 Hz 등), 현대 시대 연주(HIP) 앙상블은 A=415 Hz를 합의된 표준 관행으로 사용합니다.' },
]

const STRING_ROWS: [string, string, string][] = [
  ['바이올린', '4번줄', 'G3'], ['바이올린', '3번줄', 'D4'], ['바이올린', '2번줄', 'A4'], ['바이올린', '1번줄', 'E5'],
  ['첼로', '4번줄', 'C2'], ['첼로', '3번줄', 'G2'], ['첼로', '2번줄', 'D3'], ['첼로', '1번줄', 'A3'],
  ['더블베이스', '4번줄', 'E1'], ['더블베이스', '3번줄', 'A1'], ['더블베이스', '2번줄', 'D2'], ['더블베이스', '1번줄', 'G2'],
  ['우쿨렐레', '4번줄', 'G4'], ['우쿨렐레', '3번줄', 'C4'], ['우쿨렐레', '2번줄', 'E4'], ['우쿨렐레', '1번줄', 'A4'],
]

/* 도구 인터벌 탭(FrequencyClient INTERVAL_NAMES·INTERVAL_JI)과 같은 13개 음정 */
const JI_ROWS: [string, number, number][] = [
  ['완전1도 (유니즌)', 1, 1], ['단2도', 16, 15], ['장2도', 9, 8], ['단3도', 6, 5], ['장3도', 5, 4], ['완전4도', 4, 3],
  ['증4도/감5도 (삼전음)', 45, 32], ['완전5도', 3, 2], ['단6도', 8, 5], ['장6도', 5, 3], ['단7도', 16, 9], ['장7도', 15, 8], ['완전8도 (옥타브)', 2, 1],
]

const FAQ_LD = [
              { q: '440 Hz와 432 Hz의 차이는 무엇인가요?',
                a: '<strong>440 Hz는 ISO 16:1975 국제 표준</strong>이고, 432 Hz는 그보다 약 32센트(0.32 반음) 낮은 대안 피치입니다. 두 피치를 나란히 직접 비교하면 약 1/3반음의 차이를 들을 수 있지만(따로 들으면 비훈련 청자는 구분하기 어렵다는 보고가 많습니다), 432 Hz가 심리적·생리적으로 더 이롭다는 주장은 과학적으로 입증되지 않았습니다.' },
              { q: '센트(cent)란 무엇인가요?',
                a: '센트는 음정 차이를 측정하는 단위입니다. <strong>1옥타브 = 1200센트, 1반음 = 100센트</strong>. 따라서 1센트는 반음의 1/100입니다. ±50센트는 가장 가까운 그 음으로 분류되는 <strong>반올림 경계</strong>이며(넘으면 옆 반음으로 인식), 튜닝의 정확 판정은 통상 ±5센트 안팎을 기준으로 합니다.' },
              { q: 'MIDI 번호는 어떻게 활용하나요?',
                a: 'MIDI(Musical Instrument Digital Interface) 번호는 0~127 범위의 정수로 음정을 표현합니다. <strong>중간 C(C4) = MIDI 60, A4 = MIDI 69</strong>. DAW(디지털 오디오 워크스테이션), 미디 편집 소프트웨어, 신디사이저에서 음정을 숫자로 다룰 때 필수적입니다. 다만 <strong>옥타브 번호 표기는 제조사마다 다릅니다</strong> — MIDI 60을 이 도구처럼 C4로 적는 곳도 있고, 야마하 방식처럼 C3로 적는 곳도 있습니다. 번호(60)는 같고 이름만 한 옥타브 어긋나므로, DAW와 악보를 오갈 때는 이름보다 MIDI 번호나 Hz로 맞추는 것이 안전합니다.' },
              { q: '인간이 들을 수 있는 주파수 범위는?',
                a: '일반적으로 <strong>20 Hz ~ 20,000 Hz (20 kHz)</strong>입니다. 나이가 들면서 고주파 가청 범위가 줄어들어 성인은 보통 15~17 kHz 이상의 소리를 듣기 어려워집니다. 음악에서 실용적으로 사용되는 범위는 약 27.5 Hz(88건반 피아노 최저음 A0) ~ 4,186 Hz(피아노 최고음 C8)입니다.' },
              { q: '기타 개방현의 표준 튜닝 주파수는?',
                a: '<code>기타 6번줄(E2) = 82.41 Hz, 5번줄(A2) = 110 Hz, 4번줄(D3) = 146.83 Hz, 3번줄(G3) = 196 Hz, 2번줄(B3) = 246.94 Hz, 1번줄(E4) = 329.63 Hz</code>입니다. 이 계산기의 "음정 → Hz" 탭에서 각 음을 선택해 정확한 주파수를 확인하고 튜닝에 활용할 수 있습니다.' },
            ]

export default function FrequencyPage() {
  return (
    <ToolPage width={760} slug="/tools/art/frequency">
      <h1 className="tp-h1">
        <ToolIconBadge catId="art" />주파수↔음정 변환기
      </h1>
      <p className="tp-lead">
        Hz ↔ 음정 변환 + <strong style={{ color: 'var(--text)' }}>MIDI 번호와 파장</strong> 계산. 튜닝과 사운드 디자인용.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="ISO 16:1975(2022년 재확인) 기준 조율 주파수 · ISO 226:2023 등청감곡선 · 12음 평균율 산출식"
        sources={[
          { label: 'ISO 16:1975', href: 'https://www.iso.org/standard/3601.html' },
          { label: 'ISO 226:2023', href: 'https://www.iso.org/standard/83117.html' },
          { label: 'UNSW Music Acoustics — 음이름·주파수', href: 'https://newt.phys.unsw.edu.au/jw/notes.html' },
        ]}
      />

      <FrequencyClient />

      <GuideDivider />
      <div>

        {/* ── 1. 음정과 주파수의 관계 ── */}
        <div>
          <h2 className="g-h2">
            음정과 주파수의 관계
          </h2>
          <p className="g-p">
            서양 음악의 12음 평균율(Equal Temperament)에서는 한 옥타브(12반음)를 수학적으로 균등하게 나눕니다.
            A4 = 440 Hz를 기준으로 반음마다 2^(1/12) ≈ 1.0595배씩 주파수가 증가합니다.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '20px 22px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>핵심 공식</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Hz → MIDI',       formula: 'MIDI = 69 + 12 × log₂(Hz / 440)' },
                { label: 'MIDI → Hz',       formula: 'Hz = 440 × 2^((MIDI − 69) / 12)' },
                { label: '센트 오차',       formula: 'cents = 1200 × log₂(실제Hz / 이론Hz)' },
                { label: '파장(cm)',        formula: 'λ = 34,300 cm/s ÷ Hz' },
              ].map(({ label, formula }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-ink)', fontWeight: 600, minWidth: 70, letterSpacing: '0.03em' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--text)', fontWeight: 700 }}>{formula}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="g-p">
            한 옥타브 위의 음은 주파수가 정확히 2배입니다.
            예: A4 = 440 Hz → A5 = 880 Hz → A3 = 220 Hz.
            1200센트 = 1옥타브, 100센트 = 1반음.
            ±50센트는 그 음으로 분류되는 반올림 경계이고(넘으면 옆 반음), 위 게이지처럼 ±5센트 안팎이면 사실상 정확한 튜닝으로 봅니다.
          </p>
          <p className="g-p">
            계산 예시로 튜너가 <strong>445 Hz</strong>를 가리킨다면 MIDI = 69 + 12 × log₂(445 ÷ 440) = {(69 + 12 * Math.log2(445 / 440)).toFixed(2)}이므로 가장 가까운 음은 A4이고,
            오차는 1200 × log₂(445 ÷ 440) = {signed(cents(445, 440))}센트입니다. ±5센트를 넘으니 줄을 조금 풀어야 합니다.
            기준음을 바꿔도 식은 같고 440 자리에 기준 A4 값만 넣으면 됩니다 — 도구의 기준음 선택(440·432·443·415 Hz)이 바로 이 값을 바꿉니다.
          </p>
        </div>

        {/* ── 2. 주요 음정 주파수 기준표 ── */}
        <div>
          <h2 className="g-h2">
            주요 음정 주파수 기준표 (A4 = 440 Hz)
          </h2>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['음정', 'Hz', 'MIDI', '파장(cm)', '옥타브'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PITCH_ROWS.map(({ midi, note }, i) => {
                  const hz = midiToHz(midi)
                  return (
                    <tr key={midi} style={rowStyle(i)}>
                      <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{midiName(midi)}{note ? ` (${note})` : ''}</th>
                      <td style={{ ...tdNum, fontWeight: 700 }}>{hz.toFixed(2)}</td>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{midi}</td>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{(SPEED_CM / hz).toFixed(1)}</td>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{Math.floor(midi / 12) - 1}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 파장 = 34,300 cm/s (20°C 공기 중 음속) ÷ 주파수. 온도·습도에 따라 음속이 달라집니다.
          </p>
        </div>

        {/* ── 3. 기준음 A4 변천사 ── */}
        <div>
          <h2 className="g-h2">
            기준음 A4 변천사와 용도
          </h2>
          <p className="g-p">
            기준음을 바꾸면 모든 음이 같은 비율로 함께 움직입니다. 아래 표의 &lsquo;440 Hz 대비&rsquo;는 1200 × log₂(기준음 ÷ 440)으로 계산한 센트 차이이고, &lsquo;C4(중간 도)&rsquo;는 그 기준음에서 평균율로 환산한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기준 A4', '440 Hz 대비', 'C4(중간 도)', '시기·쓰임', '설명'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {A4_ROWS.map((r, i) => (
                  <tr key={r.hz} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 800, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.hz} Hz</th>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.hz === 440 ? '0 (기준)' : `${signed(cents(r.hz, 440))}센트`}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{midiToHz(60, r.hz).toFixed(2)} Hz</td>
                    <td style={{ ...td, color: 'var(--muted)', minWidth: 120 }}><strong style={{ color: 'var(--text)' }}>{r.badge}</strong><br />{r.era}</td>
                    <td style={{ ...td, color: 'var(--muted)', lineHeight: 1.7, minWidth: 260 }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            443–445 Hz는 440 Hz보다 {signed(cents(443, 440), 0)}~{signed(cents(445, 440), 0)}센트 높고, 415 Hz는 {signed(cents(415, 440), 0)}센트로 거의 정확히 반음(100센트) 낮습니다. 415 Hz가 관행으로 굳은 이유로는 440 Hz 악기와 약 반음(≈{Math.abs(Math.round(cents(415, 440)))}센트) 차이라 건반을 한 칸 옮겨 두 피치를 오갈 수 있다는 실용성이 흔히 거론됩니다.
            한편 C4 = 256 Hz(2의 거듭제곱으로 맞춘 이른바 &lsquo;과학적 피치&rsquo;)를 평균율로 환산하면 A4 ≈ {(256 * Math.pow(2, 9 / 12)).toFixed(2)} Hz가 됩니다. 흔히 함께 거론되는 432 Hz는 같은 C4 = 256 Hz에 피타고라스 음률의 장6도 비율 27:16을 곱한 값(256 × 27/16 = {256 * 27 / 16})이라, 평균율로 맞춘 피아노·튜너의 A4와는 일치하지 않습니다.
          </p>
        </div>

        {/* ── 4. 현악기 개방현 튜닝 주파수 ── */}
        <div>
          <h2 className="g-h2">
            현악기 개방현 튜닝 주파수 (A4 = 440 Hz)
          </h2>
          <p className="g-p">
            기타 외의 현악기도 같은 방식으로 튜닝할 수 있습니다.
            평균율 A4 = 440 Hz 기준으로 계산한 주요 현악기의 개방현 주파수입니다.
            바이올린·첼로는 인접한 현이 완전5도 간격, 더블베이스는 완전4도 간격으로 조율되며,
            우쿨렐레(하이 G 표준 튜닝)는 4번줄 G4가 3번줄 C4보다 높은 &lsquo;리엔트런트(reentrant)&rsquo; 배열이라는 점이 특징입니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['악기', '현', '음이름', 'Hz', 'MIDI'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STRING_ROWS.map(([inst, str, note], i) => {
                  const midi = nameToMidi(note)
                  return (
                    <tr key={`${inst}-${str}`} style={rowStyle(i)}>
                      <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{inst}</th>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{str}</td>
                      <td style={{ ...tdNum, fontWeight: 700 }}>{note}</td>
                      <td style={{ ...tdNum, fontWeight: 700 }}>{midiToHz(midi).toFixed(2)}</td>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{midi}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            바이올린 2번줄과 우쿨렐레 1번줄은 기준음 A4(440 Hz) 그 자체여서 튜너 없이 기준음만 듣고도 맞출 수 있습니다.
            더블베이스 최저현 E1은 41.2 Hz로 사람 가청 하한(20 Hz)의 약 두 배에 불과할 만큼 낮은 음이므로,
            튜너 표시가 의심스러울 때 이 계산기로 목표 Hz와 MIDI 번호를 교차 확인해 두면 좋습니다.
          </p>
        </div>

        {/* ── 5. 평균율 vs 순정률 ── */}
        <div>
          <h2 className="g-h2">
            평균율 vs 순정률 — 주요 음정 센트 비교
          </h2>
          <p className="g-p">
            평균율(12-TET)은 옥타브를 정확히 100센트짜리 반음 12개로 균등 분할한 체계이고,
            순정률(Just Intonation)은 3:2, 5:4처럼 단순한 정수비로 음정을 쌓는 체계입니다.
            순정률 음정을 센트로 환산(1200 × log₂(비율))해 평균율과 비교하면 두 체계의 차이가 명확해집니다.
            아래 13개 음정과 비율은 도구의 &lsquo;음정 차이&rsquo; 탭이 표시하는 것과 같습니다.
          </p>
          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['음정', '순정률 비율', '순정률(센트)', '평균율(센트)', '차이(순정−평균)'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JI_ROWS.map(([name, n, d], i) => {
                  const ji = 1200 * Math.log2(n / d)
                  const et = i * 100
                  const diff = ji - et
                  return (
                    <tr key={name} style={rowStyle(i)}>
                      <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{name}</th>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{n}:{d}</td>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{ji.toFixed(1)}</td>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{et}</td>
                      <td style={{ ...tdNum, fontWeight: 700 }}>{Math.abs(diff) < 0.05 ? '0' : signed(diff)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            기타 튜닝에서 3번줄(G)과 2번줄(B) 사이가 유난히 안 맞는 것처럼 들리는 이유가 여기에 있습니다.
            두 줄의 간격은 장3도인데, 귀로 맥놀이(울림의 떨림)가 사라지게 맞추면 순정 장3도(약 386센트)가 되어
            평균율 기준보다 약 14센트 낮아집니다. 반대로 튜너로 평균율에 정확히 맞추면
            이 장3도는 순정률보다 14센트 가까이 넓어 미세한 맥놀이가 남습니다.
            튜너가 고장 난 것이 아니라, 모든 조(key)에서 균등하게 연주하기 위해
            평균율이 장3도를 조금 넓게 잡는 타협을 선택한 결과입니다.
          </p>
        </div>

        {/* ── 6. 출처가 확인된 기준 주파수 ── */}
        <div>
          <h2 className="g-h2">
            출처가 확인된 기준 주파수
          </h2>
          <p className="g-p">
            아래는 국제 표준 문서·제조사 공식 자료·대학 규준표에서 원문이 확인되는 값만 모은 표입니다.
          </p>

          <Callout tone="note" title="기음과 배음">
            Shure 공식자료는 <strong>기음(fundamental)</strong>을 &lsquo;복합 파형에서 가장 낮은 주파수 성분으로 음의 기본 음높이를 결정하는 것&rsquo;,
            <strong> 배음(harmonic)</strong>을 &lsquo;기음 위의 성분으로 대개 기음의 정수배이며 음색을 결정하는 것&rsquo;으로 정의합니다.
            튜너와 이 계산기가 다루는 숫자는 전부 기음이며, 같은 A4라도 악기마다 다르게 들리는 이유는 배음 구성입니다.
          </Callout>

          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기준 항목', '확인된 값', '출처'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...th, textAlign: i === 1 ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['기준 조율 주파수 A4', '440 Hz (조율 오차 0.5 Hz 이내)', 'ISO 16:1975'],
                  ['반음 1개 비율', '2^(1/12) ≈ 1.0595배', 'UNSW 음향학 · Auditory Neuroscience'],
                  ['피아노 88건반 기음', 'A0 27.5 ~ C8 4,186 Hz (7¼옥타브)', 'Yamaha 공식 · HyperPhysics'],
                  ['기타 개방현 6줄', 'E2 82.41 ~ E4 329.63 Hz', 'ISO 16 + 평균율 산출값'],
                  ['베이스 개방현 4줄', 'E1 41.20 ~ G2 98.00 Hz', 'ISO 16 + 평균율 산출값'],
                  ['스네어드럼 기음', '150 ~ 250 Hz', 'Shure 공식'],
                  ['말소리 평균 F0', '남 115 Hz · 여 199 Hz', '시드니대 음성연구실'],
                  ['발성 음역(훈련자)', '남 78~698 Hz · 여 139~1,108 Hz', '시드니대 음성연구실'],
                ].map(([item, val, src], i) => (
                  <tr key={item} style={rowStyle(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{item}</th>
                    <td style={{ ...tdNum, fontWeight: 700 }}>{val}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{src}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="g-p" style={{ marginTop: 16 }}>
            베이스 기타 4현 표준조율은 더블베이스와 같은 E1 41.20 / A1 55.00 / D2 73.42 / G2 98.00 Hz입니다.
            기타·베이스 값은 제조사 인쇄 표가 아니라 A4 = 440 Hz와 반음비 2^(1/12)로 계산한 값입니다.
            말소리 F0·발성 음역 규준은 호주 영어 화자 대상이고, 음역 표에는 원문에
            &lsquo;성악·음성 훈련 경험자 대상&rsquo;이라는 단서가 있어 일반인에 일반화할 수 없습니다.
          </p>
          <p className="g-note">
            * 킥드럼·베이스의 &lsquo;연주 대역&rsquo;처럼 널리 인용되는 수치는 제조사 공식 문서에 명시가 없고 자료마다 어긋나 뺐습니다.
            Shure의 악기 차트도 막대 끝에 Hz가 인쇄되지 않은 로그축 그래픽이라, 눈으로 읽어 옮기면 근거 없는 숫자가 됩니다.
          </p>
        </div>

        {/* ── 7. 가청 범위와 주파수 대역 ── */}
        <div>
          <h2 className="g-h2">
            가청 범위와 주파수 대역 — 어디까지가 사실인가
          </h2>
          <p className="g-p">
            OpenStax College Physics는 정상 청력을 20 Hz ~ 20,000 Hz로 보고 20 Hz 미만을 초저주파(infrasound), 20 kHz 초과를 초음파(ultrasound)로 구분하며,
            귀의 감도가 가장 높은 구간을 <strong>2,000~5,000 Hz</strong>로 서술합니다 — 세기가 같아도 더 크게 들립니다.
            Shure도 마이크 주파수 응답 차트를 20 Hz~20 kHz로 그리며 인간의 청각 범위라고 명시합니다.
          </p>

          <Callout tone="warn" title="자주 보이는 오귀속">
            20~20 kHz의 근거로 <strong>ISO 226 등청감곡선</strong>을 드는 글이 많습니다.
            그러나 현행 ISO 226:2023(Normal equal-loudness-level contours, 2023년 3월 제3판)이 수치로 규정하는 범위는
            ISO 266 1/3옥타브 계열의 <strong>20 Hz ~ 12,500 Hz</strong>까지이고, 상한 20 kHz는 정의하지 않습니다.
            20~20 kHz는 국제표준 규정치가 아니라 교과서·업계 통용치로 적는 것이 정확합니다(구판 ISO 226:2003은 폐지).
          </Callout>

          <div className="tableScroll">
            <table style={table}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대역 이름', '범위', '대표 음 (하한 기준)'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ['서브베이스 Sub-bass', 20, 60],
                  ['베이스 Bass', 60, 250],
                  ['로우 미드 Low midrange', 250, 500],
                  ['미드레인지 Midrange', 500, 2000],
                  ['어퍼 미드 Upper midrange', 2000, 4000],
                  ['프레즌스 Presence', 4000, 6000],
                  ['브릴리언스 Brilliance', 6000, 20000],
                ] as [string, number, number][]).map(([band, lo, hi], i) => {
                  const m = Math.round(69 + 12 * Math.log2(lo / 440))
                  return (
                    <tr key={band} style={rowStyle(i)}>
                      <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{band}</th>
                      <td style={{ ...tdNum, fontWeight: 700 }}>{lo.toLocaleString('en-US')} ~ {hi.toLocaleString('en-US')} Hz</td>
                      <td style={{ ...tdNum, color: 'var(--muted)' }}>{lo.toLocaleString('en-US')} Hz ≈ {midiName(m)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 출처: Teach Me Audio(오디오 교육 사이트). 표준화 기구가 정한 구분이 <strong>아니라</strong> 믹싱 실무의 관행이며,
            원문도 &lsquo;일곱 대역으로 나눌 수 있다&rsquo;고만 서술합니다. &lsquo;대표 음&rsquo; 열은 각 대역 하한 주파수에 가장 가까운 평균율 음을 이 페이지에서 계산해 덧붙인 값입니다.
          </p>

          <p className="g-p" style={{ marginTop: 16 }}>
            특히 <strong>프레즌스</strong>는 출처마다 범위가 다릅니다.
            AES(오디오공학회) 용어사전은 프레즌스 피크를 <strong>2,000~10,000 Hz</strong>에서의 마이크 출력 증가(명료도·발음·근접감·펀치 상승)로 정의하는데,
            위 관행표는 같은 이름을 4,000~6,000 Hz에 붙이므로 &lsquo;프레즌스를 올리자&rsquo;는 말은 어느 정의인지 확인해야 합니다.
          </p>
          <p className="g-p">
            대역 구분의 실익은 <strong>마스킹</strong>입니다.
            AES 용어사전은 마스킹을 &lsquo;두 소리가 도달했는데 한 소리만 들리는 현상&rsquo;으로 정의하고,
            중역대가 저역대보다 마스킹 능력이 강하다고 덧붙입니다(임계대역·시간적 마스킹과 함께 다룹니다).
            다만 마스킹 임계값 같은 정량 수치는 유료 규격에만 있어 제시하지 않습니다.
          </p>

          <h3 className="g-h3">Shure 공식 믹싱 가이드의 실무 컷오프</h3>
          <ul className="g-list">
            <li>남성 보컬 로우컷 약 <strong>80 Hz</strong>, 여성 보컬 <strong>140 Hz</strong> — 문서는 &lsquo;보컬은 80 Hz보다 낮게 노래할 수 없다&rsquo;고 씁니다. 80 Hz는 기타 6번줄 E2(82.41 Hz)보다 살짝 낮고, 140 Hz는 C♯3(138.59 Hz) 바로 위입니다.</li>
            <li>바이올린 로우컷 약 150 Hz(190 Hz 아래로는 소리가 거의 나오지 않음), 피콜로 로우컷 400 Hz(최저음 523 Hz = C5).</li>
            <li>킥드럼 하이컷 10 kHz, 하이 셸빙은 12 kHz 이상, 로우 셸빙은 80 Hz 이하.</li>
            <li>명료도는 1,000~1,500 Hz 부스트, 프레즌스·펀치는 4 kHz에서 +3 dB, 비음(nasal honk)은 600 Hz 부근 컷, 답답함은 200 Hz 부근 컷, 스네어의 붐은 100~150 Hz.</li>
          </ul>
          <p className="g-note">
            * 컷오프 값을 위 &lsquo;Hz → 음정&rsquo; 탭에 넣으면 어떤 음을 자르는지 확인됩니다.
            위 수치는 모두 국제 자료(ISO·Shure·Yamaha·OpenStax·AES·시드니대) 기준이며, 대응하는 한국 기관 발행 기준은 찾지 못했습니다.
          </p>
        </div>

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 출처 ── */}
        <p className="g-note">
          출처: <a href="https://www.iso.org/standard/3601.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>ISO 16:1975 — 표준 조율 주파수(A4=440 Hz)</a> ·{' '}
          <a href="https://midi.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>MIDI Association — MIDI 사양(노트 번호 0~127)</a> ·{' '}
          <a href="https://en.wikipedia.org/wiki/Concert_pitch" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Concert pitch — 연주회 피치의 역사</a> ·{' '}
          <a href="https://www.iso.org/standard/83117.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>ISO 226:2023 — 등청감곡선(20 Hz~12.5 kHz)</a> ·{' '}
          <a href="https://courses.lumenlearning.com/suny-physics/chapter/17-6-hearing/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>OpenStax College Physics 17.6 Hearing</a> ·{' '}
          <a href="https://www.shure.com/en-US/insights/how-to-read-a-microphone-frequency-response-chart" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Shure — 마이크 주파수 응답 차트 읽는 법</a> ·{' '}
          <a href="https://www.shure.com/en-US/insights/professional-mixing-tips-for-church-sound" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Shure — 실무 믹싱 팁(컷오프)</a> ·{' '}
          <a href="https://www.yamaha.com/en/musical_instrument_guide/piano/trivia/trivia007.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Yamaha — 피아노 88건반 27.5~4,186 Hz</a> ·{' '}
          <a href="https://hyperphysics.gsu.edu/hbase/Music/pianof.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>HyperPhysics — The Piano</a> ·{' '}
          <a href="https://www.aes.org/par/m/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>AES Pro Audio Reference — masking</a> ·{' '}
          <a href="https://www.aes.org/par/p/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>AES Pro Audio Reference — presence peak</a> ·{' '}
          <a href="https://newt.phys.unsw.edu.au/jw/notes.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>UNSW Music Acoustics — 음이름·주파수 산출식</a> ·{' '}
          <a href="https://www.teachmeaudio.com/mixing/techniques/audio-spectrum" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>Teach Me Audio — Audio Spectrum(관행 7대역)</a>
        </p>

        {/* ── 9. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/tap-tempo?tab=delay', icon: '🎛️', name: '딜레이 타임 계산', desc: '음표별 딜레이 ms — 탭 템포 계산기의 딜레이 탭' },
              { href: '/tools/art/golden-ratio',icon: '🌀', name: '황금 비율 계산기',       desc: '음악 구성에 황금 비율 적용' },
              { href: '/tools/art/tap-tempo',    icon: '🥁', name: '탭 템포',               desc: '박자에 맞춰 탭해 BPM 측정' },
              { href: '/tools/art/vocal-range',  icon: '🎤', name: '음역대 측정기',         desc: '마이크로 최저·최고음 측정' },
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
