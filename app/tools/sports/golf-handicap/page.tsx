import Link from 'next/link'
import GolfHandicapClient from './GolfHandicapClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { calcDifferential, handicapIndexFromDiffs, getUsedCount, lowRoundAdjustment, MAX_HANDICAP_INDEX, MAX_ROUNDS } from './golfHandicapUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/golf-handicap',
  title: '골프 핸디캡 계산기 — WHS·코스 핸디캡·발전 추이·자동 저장',
  description: 'WHS 공식으로 핸디캡 지수·코스 핸디캡·네트·스태블포드 계산. 라운드 자동 저장과 발전 추이 그래프, 9홀 환산·티별 추천까지 — 계산 예시와 공식 인증(KGA) 안내 포함.',
  keywords: ['골프핸디캡계산기', '핸디캡지수계산', 'WHS핸디캡', '코스핸디캡계산기', '스코어디퍼런셜', '네트스코어계산기', '스태블포드계산기', '골프핸디캡', '슬로프 레이팅', '코스 레이팅', '한국 골프 핸디캡', '핸디캡 추이', 'KGA 핸디캡'],
})

/* ── 표 공통 ── */
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBg = (i: number) => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const tableBase: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const formulaBox: React.CSSProperties = { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 12px', fontVariantNumeric: 'tabular-nums' }
const f1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1)

/* ── 가이드 수치 — 도구와 같은 golfHandicapUtils로 빌드 시 계산 ── */
// 라운드 수별 사용 개수·조정값: 3~20라운드를 같은 (개수, 조정) 구간끼리 묶는다
const USED_ROWS: { from: number; to: number; used: number; adj: number }[] = []
for (let n = 3; n <= 20; n++) {
  const used = getUsedCount(n)
  const adj = lowRoundAdjustment(n)
  const last = USED_ROWS[USED_ROWS.length - 1]
  if (last && last.used === used && last.adj === adj) last.to = n
  else USED_ROWS.push({ from: n, to: n, used, adj })
}

// 예시 1 — 입문자 5라운드 (CR 72.0 · 슬로프 113)
const EX1_SCORES = [108, 103, 99, 105, 101]
const EX1_DIFFS = EX1_SCORES.map((g) => calcDifferential(g, 72, 113))
const EX1_HI = handicapIndexFromDiffs(EX1_DIFFS)
// 예시 1-2 — 같은 사람이 앞의 3라운드만 냈을 때 (−2.0 조정)
const EX3_DIFFS = EX1_DIFFS.slice(0, 3)
const EX3_HI = handicapIndexFromDiffs(EX3_DIFFS)

// 예시 2 — 코스 핸디캡·플레잉 핸디캡 (계산기 [코스 핸디캡] 탭과 같은 식)
const EX2 = { hi: 10.5, slope: 128, cr: 72.5, par: 72, gross: 85 }
const EX2_CH_RAW = EX2.hi * (EX2.slope / 113) + (EX2.cr - EX2.par)
const EX2_CH = Math.round(EX2_CH_RAW)
const EX2_PH = Math.round(EX2_CH_RAW * 0.95)
const EX2_NET = EX2.gross - EX2_CH

// 예시 3 — 9홀 45타 (9홀 CR 36.0 · 슬로프 120): 단순 2배 근사
const EX9 = { gross: 45, cr: 36.0, slope: 120 }
const EX9_DIFF = calcDifferential(EX9.gross, EX9.cr, EX9.slope, true)

// 코스 핸디캡 조견표 — CR = 파일 때 HI × 슬로프 ÷ 113 반올림
const CH_SLOPES = [113, 120, 125, 130, 135, 140]
const CH_INDEXES = [0, 5, 10, 15, 20, 25, 30, 36]

const FAQ_LD = [
              {
                q: 'WHS 핸디캡은 예전 핸디캡과 어떻게 다른가요?',
                a: '2020년 USGA와 R&A가 USGA·EGA(유럽)·CONGU(영국·아일랜드)·호주·남아공·아르헨티나 등 6개 핸디캡 시스템을 WHS(World Handicap System)로 통합했습니다. 지수는 최근 20라운드 중 최저 8개 디퍼런셜의 평균(라운드 부족 시 조정)으로 산출하며, 과거 USGA가 쓰던 0.96 계수는 폐지됐습니다. 전 세계 어느 골프장에서든 같은 방식으로 코스 핸디캡을 환산할 수 있다는 점이 핵심입니다.',
              },
              {
                q: '코스 레이팅과 슬로프 레이팅은 어디서 확인하나요?',
                a: '골프장 스코어카드나 클럽하우스 안내판에 티잉 구역(블랙·화이트·옐로 등)별로 적혀 있습니다. 레이팅은 각국 골프 협회가 코스를 실측해 부여하는 값으로, 국내에서는 대한골프협회(KGA)가 담당합니다. 스코어카드에 값이 없으면 골프장에 문의하고, 끝내 알 수 없다면 CR은 파, 슬로프는 113으로 두고 계산한 값이 근사치라는 점을 감안하세요.',
              },
              {
                q: '9홀 라운드도 핸디캡 계산에 사용할 수 있나요?',
                a: '네. 다만 방식이 바뀌었습니다. WHS는 2024년 개정부터 9홀 디퍼런셜에 본인 핸디캡 지수로 계산한 &lsquo;나머지 9홀의 기대 디퍼런셜&rsquo;을 더해 18홀 디퍼런셜을 만듭니다. 본 계산기는 핸디캡 지수가 없어도 쓸 수 있도록 <strong>9홀 스코어와 9홀 코스 레이팅을 각각 두 배로 늘리는 단순 근사</strong>를 사용하므로 공식 값과 차이가 날 수 있습니다. 9홀을 고르면 CR 칸에는 <strong>9홀 레이팅(보통 30~40대)</strong>을 넣으세요. 18홀 레이팅(50 초과)을 넣으면 두 배 하지 않고 그대로 계산합니다.',
              },
              {
                q: 'WHS도 0.96(보너스 팩터)을 곱하나요?',
                a: '<strong>아닙니다.</strong> 0.96 &ldquo;보너스 팩터(Bonus for Excellence)&rdquo;는 2020년 이전 USGA 핸디캡 시스템에서 쓰던 계수로, 현행 WHS에서는 폐지됐습니다. WHS 핸디캡 지수는 최근 20라운드 중 최저 8개 디퍼런셜의 단순 평균이며, 제출 라운드가 3·4·6개로 적을 때만 평균에 −2.0/−1.0/−1.0을 더해 보정합니다. 본 도구도 0.96 없이 WHS 방식으로 산출합니다.',
              },
              {
                q: '핸디캡 지수 최대값은?',
                a: 'WHS에서는 남녀 모두 최대 54.0입니다. 예전 USGA 방식은 남성 36.4·여성 40.4, CONGU 방식은 남성 28·여성 36이 상한이어서, 통합 이후 더 많은 입문 골퍼가 공식 핸디캡을 가질 수 있게 됐습니다. 본 도구도 계산된 지수가 54.0을 넘으면 54.0으로 표시합니다(개별 디퍼런셜 값은 그대로 두고 최종 지수만 제한).',
              },
              {
                q: '스태블포드와 스트로크 플레이의 차이는?',
                a: '스트로크 플레이는 18홀 총 타수가 기준이고, 스태블포드는 홀마다 네트 스코어(핸디캡 스트로크를 뺀 타수)로 점수를 받습니다(네트 파 2점, 네트 버디 3점, 네트 보기 1점, 네트 더블보기 이상 0점). 한 홀을 크게 망쳐도 0점으로 끝나 나쁜 홀의 영향이 작아, 아마추어 대회나 친선 라운드에 널리 쓰입니다.',
              },
              {
                q: '한 홀에서 크게 무너진 라운드는 어떻게 처리되나요?',
                a: '정식 WHS는 홀별 최고 타수를 <strong>네트 더블보기</strong>(파 + 2 + 그 홀에서 받는 핸디캡 스트로크)로 잘라 조정 총타수(AGS)를 만든 뒤 디퍼런셜을 계산합니다. 핸디캡 지수가 아직 없는 사람은 홀당 파 + 5가 상한입니다. 본 도구는 총 타수만 입력받아 이 보정을 하지 않으므로, 양파·트리플 보기가 여러 번 나온 라운드는 공식 값보다 디퍼런셜이 높게(불리하게) 나옵니다. 최저 8개 평균에는 좋은 라운드만 들어가므로 지수에 미치는 영향은 대개 제한적입니다.',
              },
              {
                q: '본 도구의 핸디캡이 공식 핸디캡인가요?',
                a: '<strong>아닙니다.</strong> 본 도구는 WHS 지수 공식을 기반으로 하되 네트 더블보기 보정(AGS)·플레잉 컨디션 계산(PCC)·지수 상승 제한(소프트·하드 캡)·특별 스코어 감산(ESR) 같은 절차를 생략한 <strong>비공식 산출</strong>입니다. 공식 핸디캡은 대한골프협회(KGA) 또는 소속 골프 클럽을 통해 스코어를 제출·관리받아야 하며, 공식 대회 출전에는 공식 핸디캡이 필요합니다.',
              },
              {
                q: '핸디캡 지수가 자주 바뀌는데 정상인가요?',
                a: '네, 정상입니다. WHS 핸디캡은 라운드를 추가할 때마다 재계산되며, 최근 20라운드 중 최저 8개의 평균으로 산출됩니다.<br/>• 좋은 라운드가 추가되면 지수가 내려갑니다.<br/>• 나쁜 라운드는 최저 8개에 들지 않으면 지수에 거의 영향이 없습니다.<br/>• 21번째 라운드부터는 가장 오래된 라운드가 빠지므로, 예전의 좋은 라운드가 밀려나면 지수가 오를 수도 있습니다.<br/>라운드가 적을 때는 1~2개 디퍼런셜만 쓰기 때문에 한 라운드로 몇 포인트씩 움직이는 것이 보통이고, 20라운드를 채우면 안정됩니다.',
              },
              {
                q: '다른 기기로 기록을 옮기려면 어떻게 하나요?',
                a: '라운드 기록은 이 브라우저에만 저장되고 기기 간 자동 동기화는 되지 않습니다. [내 기록] 탭에서 CSV로 내려받은 뒤, 새 기기의 [내 기록] 탭에서 &lsquo;CSV 가져오기&rsquo;로 불러오면 됩니다(같은 라운드는 중복으로 들어가지 않습니다). CSV는 UTF-8 BOM이 포함되어 엑셀에서도 한글이 깨지지 않으니, 브라우저 데이터 정리 전에 한 번 내려받아 두세요.',
              },
            ]

export default function GolfHandicapPage() {
  return (
    <ToolPage width={760} slug="/tools/sports/golf-handicap">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />골프 핸디캡 계산기
      </h1>
      <p className="tp-lead">
        WHS 핸디캡·코스 핸디캡·스태블포드 + 라운드 자동 저장으로 <strong style={{ color: 'var(--text)' }}>발전 추이</strong>까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="WHS 핸디캡 규칙(2024 개정) — 스코어 디퍼런셜 = (스코어 − CR) × 113 ÷ 슬로프, 최근 20라운드 중 최저 8개 평균·최대 54.0, 코스 핸디캡 = 지수 × 슬로프 ÷ 113 + (CR − 파), 스트로크 플레이 허용률 95% · AGS·PCC·캡 절차는 생략"
        sources={[
          { label: 'World Handicap System (USGA·R&A)', href: 'https://www.whs.com' },
          { label: 'R&A (WHS 공동 운영)', href: 'https://www.randa.org' },
          { label: '대한골프협회(KGA)', href: 'https://www.kgagolf.or.kr' },
        ]}
      />

      <GolfHandicapClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 ── */}
        <div>
          <h2 className="g-h2">WHS 핵심 공식 세 가지</h2>
          <p className="g-p">
            핸디캡 계산은 세 단계로 이뤄집니다. 라운드마다 <strong>스코어 디퍼런셜</strong>을 구하고, 그 디퍼런셜들로 <strong>핸디캡 지수</strong>를 만들고,
            오늘 칠 코스와 티에 맞춰 <strong>코스 핸디캡</strong>으로 바꿉니다. 지수는 골퍼의 실력, 코스 핸디캡은 &lsquo;이 코스에서 받는 타수&rsquo;입니다.
          </p>
          <div style={formulaBox}>
            ① 스코어 디퍼런셜 = (스코어 − 코스 레이팅) × 113 ÷ 슬로프 레이팅<br />
            ② 핸디캡 지수 = 최근 20라운드 디퍼런셜 중 최저 N개 평균 (+ 라운드 부족 시 조정, 최대 {MAX_HANDICAP_INDEX.toFixed(1)})<br />
            ③ 코스 핸디캡 = 핸디캡 지수 × (슬로프 ÷ 113) + (코스 레이팅 − 파)
          </div>
          <p className="g-p">
            113은 &lsquo;표준 난이도 코스&rsquo;의 슬로프입니다. 디퍼런셜은 각 라운드를 표준 코스에서 쳤다면 몇 타 오버였을지로 환산한 값이라,
            쉬운 코스에서 친 80타와 어려운 코스에서 친 85타를 같은 잣대로 비교할 수 있게 해 줍니다. 정식 WHS는 스코어 대신 홀별 최고 타수를
            네트 더블보기로 자른 <strong>조정 총타수(AGS)</strong>를 쓰고, 그날 날씨·코스 상태를 반영하는 PCC 보정도 더하지만, 본 도구는 총 타수만
            입력받아 두 보정을 생략합니다.
          </p>
        </div>

        {/* ── 2. 계산 예시 ── */}
        <div>
          <h2 className="g-h2">계산 예시 — 도구에 넣으면 이렇게 나옵니다</h2>
          <h3 className="g-h3">예시 1 — 입문자 {EX1_SCORES.length}라운드</h3>
          <p className="g-p">코스 레이팅 72.0 · 슬로프 113인 같은 코스에서 {EX1_SCORES.join(', ')}타를 기록했습니다. 슬로프가 113이면 디퍼런셜은 그냥 &lsquo;스코어 − 72&rsquo;입니다.</p>
          <div style={formulaBox}>
            {EX1_SCORES.map((g, i) => `${g} → ${f1(EX1_DIFFS[i])}`).join(' · ')}<br />
            {EX1_SCORES.length}라운드 → 최저 {getUsedCount(EX1_SCORES.length)}개 사용, 조정 {lowRoundAdjustment(EX1_SCORES.length).toFixed(1)}<br />
            핸디캡 지수 = <strong>{EX1_HI !== null ? f1(EX1_HI) : '—'}</strong>
          </div>
          <p className="g-p">
            같은 사람이 앞의 라운드 3개({EX3_DIFFS.map(f1).join(', ')})만 냈다면 최저 1개({f1(Math.min(...EX3_DIFFS))})에 −2.0을 더해 지수는
            {' '}<strong>{EX3_HI !== null ? f1(EX3_HI) : '—'}</strong>가 됩니다. 라운드가 적을 때 가장 좋은 한 라운드만 쓰는 대신, 그 한 번이 운이었을
            가능성을 감안해 지수를 조금 낮춰 주는 장치입니다.
          </p>

          <h3 className="g-h3">예시 2 — 중급자, 오늘 코스의 핸디캡</h3>
          <p className="g-p">
            핸디캡 지수 {EX2.hi}인 골퍼가 슬로프 {EX2.slope} · CR {EX2.cr} · 파 {EX2.par}인 티에서 {EX2.gross}타를 쳤습니다.
          </p>
          <div style={formulaBox}>
            코스 핸디캡 = {EX2.hi} × ({EX2.slope} ÷ 113) + ({EX2.cr} − {EX2.par}) = {f1(EX2_CH_RAW)} → <strong>{EX2_CH}</strong><br />
            플레잉 핸디캡(스트로크 플레이 95%) = {EX2_CH_RAW.toFixed(2)} × 0.95 = {(EX2_CH_RAW * 0.95).toFixed(2)} → <strong>{EX2_PH}</strong><br />
            네트 스코어 = {EX2.gross} − {EX2_CH} = <strong>{EX2_NET}</strong> ({EX2_NET - EX2.par >= 0 ? '+' : ''}{EX2_NET - EX2.par})
          </div>
          <p className="g-p">
            WHS 2024 개정부터는 코스 핸디캡을 반올림하지 않은 값에 허용률(95%)을 곱하고 마지막에 한 번만 반올림합니다. 계산기의 플레잉 핸디캡도 같은
            순서로 계산합니다. 슬로프가 113보다 높은 코스라서 지수 {EX2.hi}인 골퍼가 이 코스에서는 {EX2_CH}타를 받는다는 점이 핵심입니다.
          </p>
        </div>

        {/* ── 3. 라운드 수별 사용 디퍼런셜 표 ── */}
        <div>
          <h2 className="g-h2">라운드 수별 사용 디퍼런셜 개수</h2>
          <p className="g-p">
            WHS는 라운드가 20개 미만일 때 사용하는 디퍼런셜 수를 단계적으로 줄이고, 3·4·6라운드에는 평균에 조정값을 더합니다. 아래 표는 계산기가 실제로
            쓰는 규칙을 그대로 옮긴 것입니다. 2라운드 이하에서는 지수가 나오지 않습니다.
          </p>
          <div className="tableScroll">
            <table style={tableBase}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>제출 라운드 수</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>계산에 쓰는 개수</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>평균에 더하는 조정</th>
                </tr>
              </thead>
              <tbody>
                {USED_ROWS.map((r, i) => (
                  <tr key={r.from} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 600 }}>{r.from === r.to ? r.from : `${r.from}~${r.to}`}</td>
                    <td style={tdNum}>최저 {r.used}개</td>
                    <td style={tdNum}>{r.adj === 0 ? '—' : r.adj.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            21번째 라운드부터는 가장 오래된 라운드가 빠지고 최근 20개만 씁니다. 기록은 최대 {MAX_ROUNDS}라운드까지 보관합니다.
          </p>
        </div>

        {/* ── 4. 코스 핸디캡 조견표 ── */}
        <div>
          <h2 className="g-h2">코스 핸디캡 조견표 — 슬로프가 받는 타수를 바꾼다</h2>
          <p className="g-p">
            같은 핸디캡 지수라도 슬로프가 높은 코스에서는 더 많은 타수를 받습니다. 아래 표는 코스 레이팅이 파와 같을 때(CR − 파 = 0) 지수 × 슬로프 ÷ 113을
            반올림한 값입니다. CR이 파와 다르면 지수 × 슬로프 ÷ 113에 (CR − 파)를 더한 뒤 한 번만 반올림하세요(이미 반올림된 표 값에 더하면 1타 차이가 날 수 있습니다).
          </p>
          <div className="tableScroll">
            <table style={{ ...tableBase, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>지수 \ 슬로프</th>
                  {CH_SLOPES.map((s) => <th key={s} scope="col" style={{ ...th, textAlign: 'right' }}>{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {CH_INDEXES.map((hi, i) => (
                  <tr key={hi} style={rowBg(i)}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{hi.toFixed(1)}</th>
                    {CH_SLOPES.map((s) => <td key={s} style={tdNum}>{Math.round(hi * s / 113)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            지수가 높을수록 슬로프의 영향이 커집니다. 지수 5인 골퍼는 슬로프 113과 140 사이에서 1타 차이지만, 지수 30이면 {Math.round(30 * 140 / 113) - 30}타 차이가 납니다.
          </p>
        </div>

        {/* ── 5. 슬로프 레이팅 기준 ── */}
        <div>
          <h2 className="g-h2">슬로프 레이팅 읽는 법</h2>
          <p className="g-p">
            코스 레이팅(CR)은 스크래치 골퍼(지수 0)가 그 티에서 칠 것으로 예상되는 타수이고, 슬로프 레이팅은 보기 플레이어(지수 약 20)에게 그 코스가
            스크래치 골퍼보다 상대적으로 얼마나 더 어려운지를 나타냅니다. 범위는 55~155이며 <strong>113이 표준 기준값</strong>입니다. 113은 기준점일 뿐
            실제 코스의 평균이 아니어서, 정규 18홀 코스의 정규 티는 113보다 높은 경우가 흔합니다.
          </p>
          <div className="tableScroll">
            <table style={tableBase}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>슬로프</th>
                  <th scope="col" style={th}>체감 난이도</th>
                  <th scope="col" style={th}>흔한 코스 특징</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['55~94', '매우 쉬움', '짧은 파3 위주 숏코스'],
                  ['95~112', '쉬운 편', '넓은 페어웨이, 적은 벙커·해저드'],
                  ['113', '표준 기준값', '디퍼런셜·코스 핸디캡 공식의 기준점'],
                  ['114~129', '보통~약간 어려움', '정규 코스 정규 티에서 흔한 구간'],
                  ['130~139', '어려움', '좁은 페어웨이, 해저드·OB 구역 많음'],
                  ['140~155', '매우 어려움', '긴 백 티, 대회 세팅'],
                ].map((r, i) => (
                  <tr key={r[0]} style={rowBg(i)}>
                    <td style={{ ...tdNum, textAlign: 'left', fontWeight: 700, color: 'var(--accent-ink)' }}>{r[0]}</td>
                    <td style={td}>{r[1]}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">난이도 구간은 이해를 돕기 위한 대략적 구분이며 공식 분류가 아닙니다. 실제 값은 스코어카드의 티별 표기를 확인하세요.</p>
        </div>

        {/* ── 6. 핸디캡 등급 ── */}
        <div>
          <h2 className="g-h2">핸디캡 지수 구간별 흔한 호칭</h2>
          <p className="g-p">
            WHS에 공식 등급은 없지만, 골프장과 동호회에서는 지수 구간을 대략 다음처럼 부릅니다. 지수 0보다 잘 치는 골퍼는 &lsquo;+2.1&rsquo;처럼 플러스 기호로
            표기하며, 이들은 코스 핸디캡만큼 타수를 받는 대신 스코어에 더합니다.
          </p>
          <div className="tableScroll">
            <table style={tableBase}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>지수</th>
                  <th scope="col" style={th}>호칭</th>
                  <th scope="col" style={th}>잘 친 날 스코어 (CR 72 · 슬로프 113 코스)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['+ (0 미만)', '플러스 핸디캐퍼', '71타 이하 (프로·엘리트 아마추어)'],
                  ['0.0', '스크래치', '72타 안팎'],
                  ['0.1~9.9', '로우 핸디캐퍼', '73~82타'],
                  ['10.0~18.9', '미드 핸디캐퍼', '82~91타'],
                  ['19.0~28.9', '하이 핸디캐퍼', '91~101타'],
                  ['29.0~54.0', '입문 단계', '101타 이상'],
                ].map((r, i) => (
                  <tr key={r[0]} style={rowBg(i)}>
                    <td style={{ ...tdNum, textAlign: 'left', fontWeight: 700 }}>{r[0]}</td>
                    <td style={td}>{r[1]}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            스코어 열은 슬로프 113 코스에서 디퍼런셜 = 스코어 − 72이므로 &lsquo;72 + 지수&rsquo;로 구한 값입니다. 지수는 &lsquo;최저 8개 평균&rsquo;이라 평소 평균 스코어보다
            낮게 나옵니다. 지수 18이 &lsquo;매번 90타&rsquo;를 뜻하지 않고, 잘 친 날 90타 안팎이라는 뜻입니다.
          </p>
        </div>

        {/* ── 7. 티별 차이 가이드 ── */}
        <div>
          <h2 className="g-h2">티별 차이 — 본인 실력에 맞는 티 선택</h2>
          <p className="g-p">
            같은 골프장도 티에 따라 CR·슬로프가 달라집니다. [코스 핸디캡] 탭에 티별 CR·슬로프를 넣으면 티마다 받는 타수를 비교할 수 있습니다. 아래는 파 72
            정규 코스에서 흔히 보이는 범위의 예시입니다.
          </p>
          <div className="tableScroll">
            <table style={tableBase}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>티</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>CR 예시</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>슬로프 예시</th>
                  <th scope="col" style={th}>적합 실력</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '블랙 (백 티)', cr: '73~74', sl: '128~135', lv: '지수 0~5 (상급)' },
                  { t: '화이트 (정규)', cr: '71~72', sl: '120~128', lv: '지수 6~18 (중급)' },
                  { t: '옐로 (시니어)', cr: '70~71', sl: '115~122', lv: '지수 19+ / 시니어' },
                  { t: '레드 (여성·입문)', cr: '68~70', sl: '108~118', lv: '입문·여성·주니어' },
                ].map((r, i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 700 }}>{r.t}</td>
                    <td style={tdNum}>{r.cr}</td>
                    <td style={tdNum}>{r.sl}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r.lv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            티 색상과 CR·슬로프는 골프장마다 다릅니다. 레이팅은 남녀별로 따로 매겨지므로, 같은 티라도 여성용 CR·슬로프가 따로 표기돼 있으면 그 값을 쓰세요.
          </p>
        </div>

        {/* ── 8. 9홀 라운드 환산 ── */}
        <div>
          <h2 className="g-h2">9홀 라운드 환산</h2>
          <p className="g-p">
            퇴근 후 9홀이나 9홀 대중제 코스 기록도 넣을 수 있습니다. 각 라운드에서 [9홀]을 고르면 CR 칸이 9홀 코스 레이팅으로 바뀌고, 이미 넣어 둔 18홀 CR은
            절반으로 자동 환산됩니다. 계산은 스코어와 9홀 CR을 모두 두 배로 늘리는 단순 근사입니다.
          </p>
          <div style={formulaBox}>
            디퍼런셜 = (9홀 스코어 × 2 − 9홀 CR × 2) × 113 ÷ 슬로프<br />
            예) 9홀 {EX9.gross}타 · 9홀 CR {EX9.cr.toFixed(1)} · 슬로프 {EX9.slope} → ({EX9.gross * 2} − {EX9.cr * 2}) × 113 ÷ {EX9.slope} = <strong>{f1(EX9_DIFF)}</strong>
          </div>
          <p className="g-p">
            <strong>공식 방식과의 차이</strong>: WHS는 2024년 개정부터 9홀 디퍼런셜에 핸디캡 지수로 산출한 &lsquo;나머지 9홀 기대 디퍼런셜&rsquo;을 더합니다.
            단순 2배는 9홀의 좋고 나쁨을 그대로 두 배로 키우므로 공식 값과 차이가 날 수 있어, 정확한 지수가 필요하면 18홀 라운드를 권합니다.
            스코어카드에 9홀(전·후반) 레이팅이 있으면 그 값을 넣고, 없으면 18홀 CR의 절반이 근사치입니다.
          </p>
        </div>

        {/* ── 9. 스태블포드 점수표 ── */}
        <div>
          <h2 className="g-h2">스태블포드 점수표</h2>
          <p className="g-p">
            [스코어] 탭의 스태블포드 모드는 홀별 타수에서 그 홀에 배정된 핸디캡 스트로크를 뺀 네트 타수로 점수를 매깁니다.
          </p>
          <div className="tableScroll">
            <table style={tableBase}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>홀 네트 결과</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>점수</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['네트 더블보기 이상', 0], ['네트 보기', 1], ['네트 파', 2], ['네트 버디', 3], ['네트 이글', 4], ['네트 알바트로스 이하', 5],
                ].map(([k, v], i) => (
                  <tr key={String(k)} style={rowBg(i)}>
                    <td style={td}>{k}</td>
                    <td style={tdNum}>{v}점</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            계산기는 코스 핸디캡만큼의 스트로크를 1번 홀부터 순서대로 한 타씩 나눠 줍니다. 실제 대회에서는 스코어카드의 홀 핸디캡(스트로크 인덱스) 순서,
            즉 가장 어려운 홀부터 받으므로 홀별 점수는 다를 수 있습니다. 18홀 합계 점수는 대부분 비슷하게 나옵니다.
          </p>
        </div>

        {/* ── 10. 라운드 저장·발전 추이 ── */}
        <div>
          <h2 className="g-h2">라운드 기록과 발전 추이 읽기</h2>
          <p className="g-p">
            [내 기록] 탭에 라운드를 추가하면 이 브라우저에 저장되고, 라운드마다 &lsquo;그 시점까지의 기록으로 계산한 지수&rsquo;를 이어 그린 추이 그래프가
            만들어집니다. 자주 가는 골프장의 티별 CR·슬로프·파를 저장해 두면 다음 입력이 빨라집니다.
          </p>
          <div className="tableScroll">
            <table style={tableBase}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>지표</th>
                  <th scope="col" style={th}>의미</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['시작 핸디캡', '지수가 처음 계산된 시점(3라운드째)의 값'],
                  ['현재 핸디캡', '최신 라운드까지 반영한 현재 지수'],
                  ['변화', '현재 − 시작 (음수면 발전)'],
                  ['월 평균 라운드', '첫 기록부터 마지막 기록까지 기간 대비 라운드 빈도'],
                  ['최고 라운드', '디퍼런셜이 가장 낮은 라운드와 날짜'],
                ].map((r, i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            초반 라운드에서는 최저 1~2개만 쓰므로 그래프가 크게 출렁입니다. 추세는 라운드가 10개 이상 쌓인 뒤부터 보는 것이 의미 있습니다.
          </p>
        </div>

        {/* ── 11. 한국 공식 핸디캡 인증 안내 ── */}
        <div>
          <h2 className="g-h2">공식 핸디캡과 이 계산기의 차이</h2>
          <p className="g-p">
            본 도구는 WHS 핸디캡 지수 공식을 따르지만 일부 절차를 생략한 <strong>비공식 산출(참고용)</strong>입니다. 동호회 친선전이나 본인 실력 추적에는
            충분하지만, 공식 대회 출전에는 협회·클럽을 통해 관리되는 공식 핸디캡이 필요합니다.
          </p>
          <div className="tableScroll">
            <table style={tableBase}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>절차</th>
                  <th scope="col" style={th}>공식 WHS</th>
                  <th scope="col" style={th}>이 계산기</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['홀별 최고 타수', '네트 더블보기로 제한(AGS)', '총 타수 그대로'],
                  ['플레잉 컨디션(PCC)', '그날 전체 스코어로 −1~+3 보정', '없음'],
                  ['지수 상승 제한', '최근 12개월 최저 지수 대비 +3.0부터 완화, +5.0 상한', '없음'],
                  ['특별 스코어 감산(ESR)', '지수보다 7.0 이상 낮으면 −1, 10.0 이상이면 −2', '없음'],
                  ['9홀 라운드', '핸디캡 지수로 기대 디퍼런셜을 더함', '스코어·CR 단순 2배'],
                  ['스코어 제출', '협회·클럽 시스템에 제출·검증', '브라우저에 개인 저장'],
                ].map((r, i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={td}>{r[1]}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="note" title="공식 핸디캡이 필요하다면">
              대한골프협회(KGA, kgagolf.or.kr) 또는 소속 골프 클럽에 공식 핸디캡 발급·관리 절차를 문의하세요. 비공식 지수는 참고용이며, 대회 요강에서
              요구하는 핸디캡 증빙으로 쓸 수 없습니다.
            </Callout>
          </div>
        </div>

        {/* ── 12. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 13. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/golf-distance', icon: '🎯', name: '골프 비거리 계산기', desc: '클럽별 비거리·환경 보정' },
              { href: '/tools/sports/golf-cost',     icon: '🏌️', name: '골프 비용 계산기',  desc: '그린피·캐디·1인당 정산' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',           desc: '다음 라운드까지' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',    desc: '골프장 왕복 유류비' },
              { href: '/tools/life/dutch',         icon: '🍻', name: '더치페이 계산기',         desc: '내기 골프 정산·N빵' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',         desc: '스윙 연습 루틴' },
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
