import LadderClient from './LadderClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { DIFFICULTIES, MAX_PARTICIPANTS } from './ladderUtils'

export const metadata = buildMetadata({
  path: '/tools/life/ladder',
  title: '사다리타기 — 무료 온라인 사다리 게임 (캐릭터·실시간 미리보기)',
  description:
    '캐릭터 16종 + 공개 모드(클릭 개별·역추적·전체) + 시크릿 산타 자기배정 방지 + 결과 텍스트 복사로 한 번에 끝나는 사다리.',
  keywords: [
    '사다리타기', '온라인 사다리', '사다리 게임', '청소 당번', '벌칙 뽑기',
    '선물 교환', '점심 메뉴', '발표 순서', '사다리 무료', '회식 분담', '제비뽑기',
  ],
})

// ── 본문 표·FAQ 수치는 빌드 시 도구와 같은 규칙으로 계산 (난이도·행 수를 바꾸면 본문도 따라 바뀐다) ──
const NORMAL = DIFFICULTIES.find(d => d.id === 'normal')!
const HARD = DIFFICULTIES.find(d => d.id === 'hard')!
/** LadderClient와 같은 행 수 식: 최소 8행, 참가자 × 난이도 배수 */
const rowsFor = (n: number, mul: number) => Math.max(8, Math.ceil(n * mul))

/** '순열 보정 없는' 일반 사다리에서 맨 왼쪽(1번) 출발자의 도착 확률 분포.
 *  가로줄 규칙은 ladderUtils.generateLadder와 같다(행마다 왼쪽부터 확률 p로 가로줄, 놓으면 다음 칸 건너뜀 = 인접 금지).
 *  행이 서로 독립이므로 한 행의 전이확률을 rows번 곱하면 정확한 값이 나온다(모의실험 아님). */
function naiveArrival(n: number, rows: number, p: number): number[] {
  // reach[c] = 왼쪽부터 훑을 때 c번 틈에 도달할 확률 → 그 틈에 가로줄이 놓일 확률 q[c] = reach[c] × p
  const reach: number[] = []
  for (let c = 0; c < n - 1; c++) reach[c] = c === 0 ? 1 : c === 1 ? 1 - p : reach[c - 1] * (1 - p) + reach[c - 2] * p
  const q = reach.map(r => r * p)
  let dist = Array(n).fill(0)
  dist[0] = 1
  for (let k = 0; k < rows; k++) {
    const next = Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      const right = i < n - 1 ? q[i] : 0
      const left = i > 0 ? q[i - 1] : 0
      next[i] += dist[i] * (1 - right - left)
      if (i < n - 1) next[i + 1] += dist[i] * right
      if (i > 0) next[i - 1] += dist[i] * left
    }
    dist = next
  }
  return dist
}
const pct = (x: number) => `${(x * 100).toFixed(1)}%`
const BIAS_ROWS = [4, 6, 8, 12, MAX_PARTICIPANTS].map(n => {
  const rn = rowsFor(n, NORMAL.rowsMul)
  const rh = rowsFor(n, HARD.rowsMul)
  const dn = naiveArrival(n, rn, NORMAL.rungProb)
  const dh = naiveArrival(n, rh, HARD.rungProb)
  return { n, rn, rh, sameN: dn[0], farN: dn[n - 1], sameH: dh[0], farH: dh[n - 1] }
})
const B8 = BIAS_ROWS.find(r => r.n === 8)!
const B16 = BIAS_ROWS.find(r => r.n === MAX_PARTICIPANTS)!

/** 완전순열(자기 자신에게 배정되지 않는 배정) 수 D(n) = (n−1)(D(n−1) + D(n−2)) */
function derangements(n: number): number {
  let a = 1, b = 0 // D(0), D(1)
  for (let k = 2; k <= n; k++) [a, b] = [b, (k - 1) * (a + b)]
  return n === 0 ? 1 : b
}
const factorial = (n: number) => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f }
const DERANGE_ROWS = [2, 3, 4, 5, 6, 8, 10, MAX_PARTICIPANTS].map(n => {
  const all = factorial(n), ok = derangements(n)
  return { n, all, ok, ratio: ok / all }
})
const D4 = DERANGE_ROWS.find(r => r.n === 4)!
/** 1회 생성 성공률이 가장 낮은 인원(표 기준 3명, 1/3) — 200회 모두 실패할 확률 (1−p)^200 */
const D_WORST = DERANGE_ROWS.reduce((m, r) => (r.ratio < m.ratio ? r : m))
const FAIL_LOG10 = 200 * Math.log10(1 - D_WORST.ratio)
const FAIL_EXP = Math.floor(FAIL_LOG10)
const FAIL_MANT = Math.round(10 ** (FAIL_LOG10 - FAIL_EXP))
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
const W_G = gcd(D_WORST.all - D_WORST.ok, D_WORST.all)
const fmtInt = (x: number) => x.toLocaleString('ko-KR')

const FAQ_LD = [
              {
                q: '사다리타기는 정말 공정한가요?',
                a: '네. 본 도구는 ① <strong>누가 어느 결과로 갈지(순열)를 먼저 균등하게 무작위로 뽑고</strong>(<code>Math.random()</code> 기반 Fisher-Yates), ② 그 순열이 되도록 가로줄을 배치하며, 나머지 가로줄은 평소처럼 무작위로 채웁니다. ③ 인접 가로줄은 만들지 않고(사다리 규칙), ④ 모든 참가자가 서로 다른 결과에 1:1로 도착합니다. 그래서 <strong>시작 위치·입력 순서·난이도와 관계없이 각 참가자가 각 결과에 닿을 확률은 모두 1/N</strong>로 같습니다. 같은 명단으로 새 추첨을 하려면 [가로선 새로 만들기]를 누르세요.',
              },
              {
                q: '사다리타기에서 유리한 시작 위치가 있나요?',
                a: `<strong>이 도구에서는 없습니다.</strong> 가로줄을 순전히 무작위로만 그리는 일반 사다리는 시작 위치 바로 아래 결과로 내려갈 확률이 큽니다. 이 도구와 같은 가로줄 규칙으로 보정 없이 계산하면 8명·가로줄 ${B8.rn}행에서 첫 번째 사람이 첫 번째 결과에 닿을 확률이 ${pct(B8.sameN)}, 반대쪽 끝 결과는 ${pct(B8.farN)}입니다(균등이면 12.5%). 인원이 많을수록 차이가 커집니다. 본 도구는 도착 순열을 먼저 균등하게 뽑고 그에 맞춰 가로줄을 배치하므로, <strong>어느 위치에서 출발해도 각 결과에 닿을 확률이 1/N</strong>입니다. [순서 섞기]는 공정성과 무관하게 분위기용으로 써도 됩니다.`,
              },
              {
                q: '시크릿 산타(선물 교환)는 어떻게 하나요?',
                a: '<strong>[선물 교환 (시크릿 산타)] 템플릿</strong>을 누르면 참가자=결과로 채워지고 <strong>[자기 배정 피하기] 옵션이 켜져</strong>, 자기 자신에게 배정되지 않도록 가로줄을 만듭니다. 템플릿 없이 직접 입력할 때는 옵션에서 켜면 되고, 명단을 고친 뒤 본인 배정이 남으면 안내와 함께 [가로선 새로 만들기] 버튼이 표시됩니다. 진행은 각자 차례로 <strong>본인 이름 카드를 클릭</strong>해 누구에게 선물할지 확인하고 다른 사람은 잠시 화면을 보지 않으면 됩니다. ※ 화면을 가려 주는 별도의 &quot;익명 모드&quot;는 없으며, 클릭한 경로는 화면에 함께 표시됩니다.',
              },
              {
                q: '참가자와 결과 개수가 다르면 어떻게 되나요?',
                a: '본 도구는 <strong>참가자 수에 맞춰 결과 칸을 자동으로 맞춥니다</strong> — 결과가 모자라면 빈 칸이 추가되고, 많으면 잘립니다. [+ 늘리기]로 참가자를 추가하면 결과 칸에 기본값 &quot;꽝&quot;이 채워지며, 각 결과 칸은 직접 수정할 수 있습니다. 사다리는 항상 <strong>참가자 N명 ↔ 결과 N칸</strong>이 1:1로 대응합니다. 당첨 1명·꽝 여러 명처럼 결과가 겹쳐도 되며, 이때 당첨 확률은 (같은 결과 칸 수 ÷ N)입니다.',
              },
              {
                q: '결과를 미리 정해놓을 수 있나요?',
                a: '<strong>아닙니다.</strong> 본 사다리타기는 가로줄 무작위 생성이 핵심이며 누가 어떤 결과를 받을지 미리 정할 수 없습니다. 만약 특정 사람에게 특정 결과를 주고 싶다면 사다리타기보다 직접 배정 또는 다른 방법을 권장합니다. 사다리타기의 본질은 <strong>"공정한 무작위 분배"</strong>입니다.',
              },
              {
                q: '가로줄을 \'많이\'로 바꾸면 더 공정해지나요?',
                a: `<strong>이 도구에서는 차이가 없습니다</strong> — 보통·많이 모두 도착 확률이 정확히 1/N이고, 난이도는 보이는 복잡도만 바꿉니다. 다만 순열 보정 없이 가로줄만 뿌리는 일반 사다리라면 행이 많을수록 편향이 줄어듭니다. 8명 기준 첫 번째 사람이 바로 아래 결과에 닿을 확률은 ${B8.rn}행에서 ${pct(B8.sameN)}, ${B8.rh}행에서 ${pct(B8.sameH)}로 내려가지만 여전히 균등(12.5%)보다 높습니다. 종이 사다리를 직접 그린다면 가로줄을 넉넉히 긋고, 이름은 사다리를 다 그린 뒤 무작위로 적는 편이 공정합니다.`,
              },
              {
                q: '자주 쓰는 명단을 저장해 두고 다시 쓸 수 있나요?',
                a: '네. 도구 아래 저장 영역에서 게임 이름을 붙여 <strong>최대 30개</strong>까지 보관할 수 있고, 저장할 때의 가로선·난이도까지 함께 저장돼 불러오면 <strong>같은 사다리와 결과가 그대로 복원</strong>됩니다(불러온 뒤 인원을 바꾸면 새 가로선이 만들어집니다). 저장은 이 브라우저의 localStorage에만 되므로 다른 기기로 옮기거나 캐시 삭제에 대비하려면 <strong>[백업 다운로드]</strong>로 JSON 파일을 받아 두고 [가져오기]로 복원하세요.',
              },
            ]

export default function LadderPage() {
  return (
    <ToolPage width={880} slug="/tools/life/ladder">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />사다리타기
      </h1>
      <p className="tp-lead">
        캐릭터 16종 + 클릭·전체·역추적 공개 + <strong style={{ color: 'var(--text)' }}>결과 텍스트 복사</strong>. 진짜 한 번에 끝나는 사다리.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="도구 알고리즘(균등 순열 선추첨 + 홀짝 교환 정렬 배치) · 위치 편향·완전순열 표는 빌드 시 도구와 같은 규칙으로 계산"
        sources={[
          { label: 'MDN — Math.random()', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random' },
          { label: 'OEIS A000166 — 완전순열 수', href: 'https://oeis.org/A000166' },
        ]}
      />

      <LadderClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사다리타기 원리 */}
        <section>
          <h2 className="g-h2">사다리타기 원리 — 가로줄 하나는 &lsquo;자리 바꾸기&rsquo;</h2>
          <p className="g-p">
            참가자 N명이 위에서 출발해 사다리를 따라 내려가며 가로줄을 만나면 옆으로 이동, 결국 N개 결과 중 하나에 도착하는 게임입니다.
            가로줄 하나는 <strong>이웃한 두 세로줄에 있는 사람의 자리를 맞바꾸는 동작</strong>과 같습니다. 위에서부터 이런 맞바꿈을 차례로 적용하므로
            사다리 전체는 출발 N칸을 도착 N칸에 하나씩 짝지어 주는 &lsquo;순열&rsquo;이 되고, 두 사람이 같은 결과에 도착하거나 아무도 오지 않는 결과가 생기는 일은
            구조적으로 일어나지 않습니다. 같은 높이에 가로줄을 이어 붙이지 않는 규칙도 그래서 있습니다 — 한 세로줄에서 좌우 가로줄을 동시에 만나면 갈 곳이 정해지지 않으니까요.
          </p>
          <p className="g-p">
            거꾸로, 원하는 배정은 무엇이든 가로줄로 만들 수 있습니다. 이웃끼리 자리만 바꿔도 어떤 순서든 정렬할 수 있기 때문(버블 정렬과 같은 원리)이고,
            필요한 가로줄의 최소 개수는 그 배정에서 순서가 뒤바뀐 쌍의 수와 같습니다. 예를 들어 4명이 완전히 거꾸로 도착하는 배정은 4×3÷2 = 6개가 최소입니다.
          </p>
          <p className="g-p">본 도구가 사다리를 만드는 순서:</p>
          <ul className="g-list">
            <li>행 수는 참가자 × <strong>{NORMAL.rowsMul}배(보통)</strong> 또는 <strong>× {HARD.rowsMul}배(많이)</strong>, 최소 8행 — 4명 보통 {rowsFor(4, NORMAL.rowsMul)}행, 8명 보통 {rowsFor(8, NORMAL.rowsMul)}행</li>
            <li>① 누가 어느 결과로 갈지(도착 순열)를 Fisher-Yates 셔플로 먼저 균등하게 뽑습니다</li>
            <li>② 위·아래 구간은 행마다 왼쪽부터 확률 {NORMAL.rungProb * 100}%(많이 {HARD.rungProb * 100}%)로 가로줄을 놓되 바로 옆 칸에는 놓지 않습니다</li>
            <li>③ 가운데 N행에는 홀짝 교환 정렬(odd-even transposition sort)로 가로줄을 놓아, 전체 도착이 ①의 순열과 정확히 같아지게 맞춥니다</li>
            <li>가로줄은 공개 전까지 숨겨 두어 눈으로 경로를 미리 따라가 볼 수 없습니다</li>
          </ul>
        </section>

        {/* 2. 위치 편향 */}
        <section>
          <h2 className="g-h2">일반 사다리의 위치 편향 — 순열을 먼저 뽑는 이유</h2>
          <p className="g-p">
            가로줄을 무작위로만 뿌리면 한 사람이 지나는 가로줄 수가 한정돼 있어 <strong>출발한 자리 근처에서 멈출 가능성</strong>이 큽니다.
            아래 표는 이 도구와 같은 가로줄 규칙(행마다 왼쪽부터 확률 {NORMAL.rungProb * 100}%, 인접 금지)을 순열 보정 없이 썼을 때,
            맨 왼쪽(1번)에서 출발한 사람이 바로 아래 결과(1번)와 반대쪽 끝 결과(N번)에 도착할 확률입니다. 행마다의 이동 확률을 행 수만큼 곱해 정확히 계산한 값이며, 이 페이지를 만들 때 자동으로 다시 계산됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>인원</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>이 도구 (모든 칸)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>일반 사다리 · 보통<br />바로 아래 / 반대 끝</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>일반 사다리 · 많이<br />바로 아래 / 반대 끝</th>
                </tr>
              </thead>
              <tbody>
                {BIAS_ROWS.map((r, i) => (
                  <tr key={r.n} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>{r.n}명</th>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>{pct(1 / r.n)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{pct(r.sameN)} / {pct(r.farN)} <span style={{ color: 'var(--muted)', fontSize: 12 }}>({r.rn}행)</span></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{pct(r.sameH)} / {pct(r.farH)} <span style={{ color: 'var(--muted)', fontSize: 12 }}>({r.rh}행)</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            8명·{B8.rn}행이면 바로 아래 결과가 {pct(B8.sameN)}로 균등(12.5%)의 {(B8.sameN * 8).toFixed(1)}배이고, 반대쪽 끝은 {pct(B8.farN)}에 그칩니다.
            인원이 늘수록 격차가 벌어져 {B16.n}명이면 반대쪽 끝에 닿을 확률이 {pct(B16.farN)}까지 떨어집니다. 행을 늘리면(&lsquo;많이&rsquo;) 편향이 줄지만 사라지지는 않습니다.
            그래서 이름을 적는 순서가 결과를 좌우하게 되는데, 이 도구는 도착 순열을 먼저 뽑고 가로줄을 그에 맞추기 때문에 출발 위치·입력 순서·난이도와 관계없이 모든 칸이 정확히 1/N입니다.
          </p>
          <Callout tone="tip" title="입력 순서가 결과에 영향을 주나요?">
            이 도구에서는 주지 않습니다. [순서 섞기]는 참가자·결과 입력 순서를 무작위로 섞고 새 가로줄을 만드는 버튼으로, 확률을 바꾸지 않으니 명단 배치를 바꿔 보고 싶을 때나 분위기용으로 쓰세요.
            종이에 사다리를 직접 그릴 때는 반대로 순서가 중요합니다 — 사다리를 다 그린 뒤에 이름을 무작위로 적어야 위 표의 편향을 피할 수 있습니다.
          </Callout>
        </section>

        {/* 3. 결과 공개 방식 */}
        <section>
          <h2 className="g-h2">결과 공개 — 3가지 방법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '🖱️', name: '클릭 개별 공개', desc: '이름을 클릭하면 그 사람의 경로만 그려지며 공개·숨김 (느림·빠름 그리기 속도 선택)' },
              { icon: '🔁', name: '역추적 공개', desc: '결과를 클릭하면 그 결과로 도착한 사람을 거꾸로 찾아 경로를 표시' },
              { icon: '👥', name: '한 번에 공개', desc: '[한 번에 공개] 버튼으로 모든 참가자 경로를 동시에 표시' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.icon} {m.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            참가자·결과를 입력하는 즉시 사다리에 반영되지만 <strong>가로줄은 공개 전까지 숨겨져</strong> 인원·세로줄 구조만 보입니다.
            공개한 뒤 이름이나 결과 칸을 고치면 공개 상태가 닫혀, 추첨 후에 결과를 바꾼 것처럼 보이는 일을 막습니다.
            당첨 하나를 두고 긴장감을 살리고 싶다면 꽝부터 한 명씩 클릭하거나, 당첨 칸을 눌러 역추적으로 마지막에 공개하는 방식이 잘 맞습니다.
          </p>
        </section>

        {/* 4. 시크릿 산타 */}
        <section>
          <h2 className="g-h2">시크릿 산타 — 자기 배정 피하기의 확률</h2>
          <p className="g-p">
            [선물 교환 (시크릿 산타)] 템플릿을 고르거나 옵션에서 [자기 배정 피하기]를 켜면, 참가자 이름과 똑같은 결과 칸이 그 사람에게 가지 않도록 가로선을 만듭니다.
            방식은 단순합니다 — 균등한 사다리를 만든 뒤 본인 배정이 하나라도 있으면 버리고 다시 뽑습니다(최대 200회). 조건에 맞지 않는 배정만 버리므로
            남은 배정(수학 용어로 <strong>완전순열</strong>)끼리는 여전히 모두 같은 확률입니다. 4명이면 가능한 {D4.ok}가지 배정이 각각 1/{D4.ok}입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>인원</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>가능한 배정 (N!)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>자기 배정 없는 배정</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>비율</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>평균 생성 횟수</th>
                </tr>
              </thead>
              <tbody>
                {DERANGE_ROWS.map((r, i) => (
                  <tr key={r.n} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>{r.n}명</th>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{fmtInt(r.all)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{fmtInt(r.ok)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>{pct(r.ratio)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{(1 / r.ratio).toFixed(2)}회</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            인원이 늘어도 자기 배정 없는 비율은 약 36.8%(1/e)로 수렴해, 평균 2~3번 생성(재생성 1~2번)이면 끝납니다. 200번 안에 끝나지 않을 확률은 가장 불리한 {D_WORST.n}명({pct(D_WORST.ratio)})일 때도
            ({(D_WORST.all - D_WORST.ok) / W_G}/{D_WORST.all / W_G})의 200제곱(약 {FAIL_MANT}×10<sup>{FAIL_EXP}</sup>)으로, 사실상 0입니다.
            실제로 쓸 때 헷갈리기 쉬운 점은 다음과 같습니다.
          </p>
          <ul className="g-list">
            <li><strong>이름은 글자 그대로 비교합니다</strong> — &lsquo;김민수&rsquo;와 &lsquo;김민수 &rsquo;(끝 공백)·&lsquo;민수&rsquo;는 다른 이름으로 봐서 피해 주지 않습니다. 결과 칸을 참가자 칸과 똑같이 적으세요.</li>
            <li><strong>동명이인</strong>은 구별할 수 없으니 &lsquo;김민수A&rsquo;처럼 표기를 나누세요.</li>
            <li>공개 전에 명단을 고치면 기존 가로선이 그대로라 본인 배정이 생길 수 있습니다. 이때는 경고와 함께 [가로선 새로 만들기] 버튼이 나타납니다.</li>
            <li>옵션을 끄면 순수 균등 추첨이라, 4명 기준 누군가 자기 이름을 뽑을 확률이 {pct(1 - D4.ratio)}입니다.</li>
          </ul>
        </section>

        {/* 5. 6가지 활용 템플릿 */}
        <section>
          <h2 className="g-h2">6가지 빠른 시작 템플릿</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🍱', name: '점심 메뉴',           desc: '못 정할 때 무작위 선택 — 김치찌개·비빔밥·돈가스·국밥' },
              { icon: '🧹', name: '청소 당번',           desc: '공정한 역할 분담 — 거실·주방·화장실·쓰레기' },
              { icon: '😅', name: '벌칙 뽑기',           desc: '게임·내기 벌칙 — 커피·꽝·재밌는 표정' },
              { icon: '🎁', name: '선물 교환 (시크릿 산타)', desc: '자기 배정 방지 자동 — 본인 카드만 클릭해 확인' },
              { icon: '🎤', name: '발표 순서',           desc: '학교·회사 발표 순서 정하기' },
              { icon: '🍻', name: '회식 분담',           desc: '비용·역할 무작위 — 많이/보통/조금/꽝(공짜)' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{t.icon} {t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            벌칙 뽑기처럼 같은 결과(꽝)가 여러 칸이면 당첨 확률은 &lsquo;그 결과 칸 수 ÷ 인원&rsquo;입니다. 6명 중 &lsquo;커피 사기&rsquo; 1칸이면 1/6(약 16.7%)이고, 벌칙을 2칸으로 늘리면 1/3이 됩니다.
          </p>
        </section>

        {/* 6. 옵션 (속도·난이도) */}
        <section>
          <h2 className="g-h2">옵션 — 애니메이션 속도·가로줄 난이도</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '6px' }}>애니메이션 속도</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· <strong style={{ color: 'var(--text)' }}>느림</strong> — 경로 그리기 2초 (긴장감 ↑)</li>
                <li>· <strong style={{ color: 'var(--text)' }}>빠름</strong> — 0.7초 (빠른 확인)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '6px' }}>가로줄 난이도</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· <strong style={{ color: 'var(--text)' }}>보통</strong> — 참가자 × {NORMAL.rowsMul}배 행 (최소 8행, 권장)</li>
                <li>· <strong style={{ color: 'var(--text)' }}>많이</strong> — 참가자 × {HARD.rowsMul}배 행, 가로줄 더 촘촘 (보기만 복잡해지고 확률은 같음)</li>
              </ul>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            참가자마다 16가지 동물 캐릭터(🐶 🐱 🐰 🦊 …)와 경로 색이 자동으로 붙습니다. 색은 색상환을 인원수로 똑같이 나눈 HSL 값이라 누가 어디로 갔는지 한눈에 구별되고,
            최대 인원이 {MAX_PARTICIPANTS}명이라 캐릭터가 겹치지 않습니다. 인원이 많아 세로줄 간격이 좁아지면 휴대폰에서는 사다리를 옆으로 스크롤해 확인하세요.
          </p>
        </section>

        {/* 7. 사다리타기 vs 다른 추첨 */}
        <section>
          <h2 className="g-h2">사다리타기 vs 다른 추첨</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '6px' }}>사다리타기</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 참가자 ↔ 결과 매칭 (N:N)</li>
                <li>· 시각적 재미 강함</li>
                <li>· 모든 참가자에게 결과 분배</li>
                <li>· 선물 교환·역할 분담 적합</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--yellow-700)', marginBottom: '6px' }}>랜덤 추첨기 (별도 도구)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 1명 또는 N명 선택</li>
                <li>· 가중치·룰렛 가능</li>
                <li>· 팀 나누기 전용</li>
                <li>· 한 항목 선택 적합</li>
              </ul>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            <strong>언제 사다리타기?</strong> — 모든 참가자에게 다른 결과를 배정해야 할 때, 시각적 재미가 우선일 때, 선물 교환·발표 순서.
            {' '}
            <strong>언제 랜덤 추첨기?</strong> — 단순 1명 뽑기, 가중치, 팀 나누기.
          </p>
          <Callout tone="note" title="경품·돈이 걸린 추첨이라면">
            이 도구의 난수는 브라우저의 <code>Math.random()</code>으로, 놀이·당번 정하기에는 충분하지만 암호학적으로 안전한 난수는 아니며 추첨 과정을 나중에 검증할 기록도 남지 않습니다.
            상금·경품처럼 이해관계가 큰 추첨은 참가자 앞에서 공개로 진행하고 결과 화면을 캡처하거나 [결과 텍스트 복사]로 바로 공유해 두세요.
          </Callout>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/life/random',     icon: '🎲', name: '랜덤 추첨기', desc: '가중치 추첨·룰렛·팀 나누기' },
              { href: '/tools/life/lotto',      icon: '🎰', name: '로또 번호 생성기',         desc: '8가지 모드·확률 시뮬' },
              { href: '/tools/life/dutch',      icon: '🍻', name: '더치페이 계산기',          desc: '회식·모임 비용 분배' },
              { href: '/tools/life/unit-price', icon: '💵', name: '단가 비교 계산기',         desc: '쇼핑 가성비 비교' },
              { href: '/tools/life/zodiac',     icon: '🐲', name: '띠·별자리 계산기',         desc: '재미용 운세' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',          desc: '집중·휴식 사이클' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
