import DutchClient from './DutchClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { ROUNDING_OPTIONS, calcSimpleSplit, calcDrinkSplit } from './dutchUtils'

export const metadata = buildMetadata({
  path: '/tools/life/dutch',
  title: '더치페이 계산기 — N빵·술값 분리·개인별 메뉴·선결제자 최소 송금·카톡 공유',
  description:
    '회식·여행 정산을 가장 적은 송금 횟수로. 음주자만 술값 분담, 메뉴별 개인 정산, 최소 송금 횟수 알고리즘(15명 이하 최소 보장) + 카카오톡 메시지 자동 생성.',
  keywords: [
    '더치페이 계산기', 'N빵 계산기', '회식비 계산기', '1인당 금액 계산',
    '술값 분리', '회식 정산', '모임비 정산', '선결제자 정산',
    '최소 송금 횟수', '카카오톡 정산', '여행 경비 정산', '팀 회식비',
    '잔돈 처리', '음주자 분담', '공동 메뉴 정산',
  ],
})

const FAQ_LD = [
              {
                q: '술을 안 마신 사람도 술값을 내야 하나요?',
                a: '<strong>모임 문화에 따라 다릅니다.</strong> 본 도구의 <strong>[술값 분리]</strong> 탭을 사용하면 음식값은 전원이 나누고 술값은 음주자들끼리만 나누는 방식으로 정산할 수 있어 형평성 논란을 줄일 수 있습니다. 한국 회식에서는 술값 분리가 표준에 가깝고, 가족·친구 모임에서는 균등 N빵이 더 일반적입니다. 모임 시작 전에 합의해두는 것이 가장 좋습니다.',
              },
              {
                q: '잔돈은 어떻게 처리하는 게 좋을까요?',
                a: '본 도구는 <strong>5가지 잔여 처리</strong>를 지원합니다 — ① <strong>공금으로</strong>(가장 일반적, 다음 회식 사용), ② <strong>결제자가 받기</strong>(결제 수고비 명분), ③ <strong>첫 사람 부담</strong>(부족분 처리), ④ <strong>무작위 1명</strong>(게임처럼), ⑤ <strong>1원 단위 균등</strong>(여행 정산 최적). 회식에서는 <strong>1,000원 올림 + 잔돈 공금</strong>이 가장 깔끔하고, 여행에서는 <strong>정확히 1원 단위 + 균등 분배</strong>가 공정합니다.',
              },
              {
                q: '여러 명이 나눠 결제했을 때 송금 횟수를 줄일 수 있나요?',
                a: '<strong>네, [선결제자 정산] 탭을 사용하세요.</strong> 잔액의 합이 0이 되는 부분 그룹을 찾아 나눈 뒤, 그룹 안에서 받을 사람과 낼 사람을 매칭해 송금 횟수를 줄입니다(15명 이하는 최소 횟수 보장). 송금은 보통 (정산할 인원 − 1)건이 필요하고, 같은 금액을 주고받는 두 사람처럼 합이 0이 되는 부분 그룹이 있을 때만 그보다 줄어듭니다. 예를 들어 5명 중 1명이 전액 결제했다면 4건이 최소입니다. 토스·카카오페이로 한 번에 보낼 수 있어 편리합니다.',
              },
              {
                q: '찬조자(부담 0원)는 어떻게 처리되나요?',
                a: '선결제자 정산 탭에서 각 참가자별 <strong>💝 찬조자</strong> 체크박스를 켜면 그 사람은 결제만 하고 부담은 0원으로 처리됩니다. 상사가 회식비 일부를 협찬하거나 생일 주인공의 부모님이 미리 결제한 경우 등에 사용합니다. 찬조자가 결제한 금액은 다른 참가자들의 부담에서 자동 차감되어 균등 분배됩니다.',
              },
              {
                q: '여행 경비 정산도 가능한가요?',
                a: '<strong>네, 본 도구가 가장 강력한 영역입니다.</strong> ① [간단 N빵]에서 <strong>1원 단위 + 균등 분배</strong>를 선택하면 잔돈까지 정확히 나뉩니다. ② 일정별로 결제자가 다르다면 [선결제자 정산] 탭에서 각자 결제액·부담액을 입력해 최소 송금으로 정리할 수 있습니다. ③ 메뉴별 가격이 크게 다르면 [개인별 정산] 탭에서 본인 메뉴 + 공동 메뉴 균등 분담으로 정산할 수 있습니다.',
              },
              {
                q: "'1원 단위'를 골랐는데 왜 몇 원이 남거나 모자라나요?",
                a: '총액이 인원수로 나누어떨어지지 않으면 1원 단위로 반올림해도 나머지가 생기기 때문입니다. 예를 들어 187,000원을 7명이 나누면 정확한 몫은 26,714.28…원이라 1인 26,714원씩 걷으면 합계가 186,998원으로 <strong>2원이 모자랍니다</strong>. 이 2원까지 맞추려면 잔여 처리에서 <strong>균등 분배(1원 단위)</strong>를 고르세요 — 앞의 2명이 26,715원, 나머지 5명이 26,714원을 내서 정확히 187,000원이 됩니다. 이 옵션은 위에서 고른 단위와 관계없이 항상 1원까지 나눕니다.',
              },
            ]

/* ── 가이드 예시 — 도구와 같은 함수(dutchUtils)로 빌드 시 계산해 화면 결과와 항상 일치 ── */
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`
const signedWon = (n: number) => (n > 0 ? `+${won(n)}` : n < 0 ? `−${won(-n)}` : '0원')

const EX_TOTAL = 187_000
const EX_PEOPLE = 7
const ROUNDING_ROWS = ROUNDING_OPTIONS.map(o => {
  const r = calcSimpleSplit({ totalAmount: EX_TOTAL, peopleCount: EX_PEOPLE, rounding: o.id, remainder: 'common-fund' })
  return { id: o.id, name: o.name, per: r.perPerson, collected: r.totalCollected, diff: r.remainder }
})
const EX_FIRST = calcSimpleSplit({ totalAmount: EX_TOTAL, peopleCount: EX_PEOPLE, rounding: 'floor-1000', remainder: 'first-person' })
const EX_1WON = calcSimpleSplit({ totalAmount: EX_TOTAL, peopleCount: EX_PEOPLE, rounding: 'exact', remainder: 'split-1won' })
const EX_1WON_HI = Math.max(...EX_1WON.individualAmounts)
const EX_1WON_LO = Math.min(...EX_1WON.individualAmounts)
const EX_1WON_HI_N = EX_1WON.individualAmounts.filter(a => a === EX_1WON_HI).length
/* 소액 예외 — 올림하면 지정자 몫이 0원 이하 / 1,000원 단위로는 나머지 몫이 0원 */
const EX_SMALL = calcSimpleSplit({ totalAmount: 10_000, peopleCount: 7, rounding: 'ceil-1000', remainder: 'first-person' })
const EX_TINY = calcSimpleSplit({ totalAmount: 5_000, peopleCount: 7, rounding: 'ceil-1000', remainder: 'first-person' })
const EX_SMALL_FUND = calcSimpleSplit({ totalAmount: 10_000, peopleCount: 7, rounding: 'ceil-1000', remainder: 'common-fund' })
/* 술값 분리 + 1,000원 올림 */
const EX_DRINK = calcDrinkSplit({ totalAmount: EX_TOTAL, drinkAmount: 62_000, totalPeople: EX_PEOPLE, drinkers: 4, rounding: 'ceil-1000' })

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontSize: 13, whiteSpace: 'nowrap' }

export default function DutchPage() {
  return (
    <ToolPage width={760} slug="/tools/life/dutch">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />더치페이 계산기
      </h1>
      <p className="tp-lead">
        회식·여행 정산을 <strong style={{ color: 'var(--text)' }}>가장 적은 송금 횟수</strong>로. 술값 분리·개인 메뉴·카톡 공유.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="단위 처리·잔여 처리·술값 분리는 도구 계산식 그대로 · 최소 송금 = 잔액이 있는 인원 − 합이 0인 그룹 수 (Verhoeff 2004)"
        sources={[
          { label: 'Verhoeff (2004) Settling Multiple Debts Efficiently — Informatics in Education', href: 'https://infedu.vu.lt/journal/INFEDU/article/612/info' },
          { label: 'The debts’ clearing problem: a new approach (arXiv:1111.3663)', href: 'https://arxiv.org/abs/1111.3663' },
        ]}
      />

      <DutchClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 5가지 정산 모드 */}
        <section>
          <h2 className="g-h2">5가지 정산 모드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '🍻', name: '간단 N빵', desc: '총액 ÷ 인원 = 1인당. 7가지 1원 단위 처리(1원/100원/1,000원 × 반올림/올림/내림) + 5가지 잔여 금액 처리.' },
              { icon: '🍺', name: '술값 분리', desc: '비음주자는 음식값만, 음주자는 음식값+술값. 회식에서 가장 많이 쓰이는 공정한 방식.' },
              { icon: '🍱', name: '개인별 정산', desc: '각자 본인 메뉴는 직접 부담, 공동 메뉴는 전원 균등 분담, 공동 술값은 음주자만 분배. 최대 20명.' },
              { icon: '💸', name: '선결제자 정산', desc: '여러 명이 나눠 결제했을 때 누가 누구에게 얼마를 보낼지 — 최소 송금 횟수(15명 이하 최소 보장).' },
              { icon: '💬', name: '카톡 공유', desc: '4가지 정산 결과를 카카오톡 형식 메시지로 자동 생성. 받을 사람·계좌번호도 한 번에 안내.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.icon} {m.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 7가지 1원 단위 처리 */}
        <section>
          <h2 className="g-h2">7가지 1원 단위 처리</h2>
          <p className="g-p">
            18,750원 같은 어정쩡한 금액을 자릿수에 맞춰 깔끔하게 정리합니다. 모임 성격에 따라 적합한 옵션이 다릅니다.
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· <strong style={{ color: 'var(--text)' }}>1원 단위</strong> — 여행 정산 등 정밀 계산</li>
            <li>· <strong style={{ color: 'var(--text)' }}>100원 반올림 / 올림 / 내림</strong> — 일반 회식·카페</li>
            <li>· <strong style={{ color: 'var(--text)' }}>1,000원 반올림</strong> — 깔끔한 송금</li>
            <li>· <strong style={{ color: 'var(--text)' }}>1,000원 올림</strong> — 술자리·팀 회식 (잔돈을 다음 모임 공금으로)</li>
            <li>· <strong style={{ color: 'var(--text)' }}>1,000원 내림</strong> — 결제자가 차액 부담 시</li>
          </ul>
        </section>

        {/* 2-1. 같은 금액에 7가지 단위를 적용한 비교표 (빌드 시 계산) */}
        <section>
          <h2 className="g-h2">같은 영수증, 단위만 바꾸면 얼마나 달라질까</h2>
          <p className="g-p">
            {won(EX_TOTAL)}을 {EX_PEOPLE}명이 나누는 경우를 도구의 계산식 그대로 돌린 결과입니다. 정확한 몫은 {(EX_TOTAL / EX_PEOPLE).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원이라 어떤 단위를 골라도 나누어떨어지지 않고,
            <strong> 걷히는 합계와 실제 결제액의 차이(차액)</strong>가 생깁니다. 차액이 플러스면 잔돈이 남고, 마이너스면 누군가 더 내야 합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
              <caption className="srOnly">{won(EX_TOTAL)}을 {EX_PEOPLE}명이 나눌 때 단위 처리별 1인당 금액과 차액</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ ...th, textAlign: 'left' }}>단위 처리</th>
                  <th scope="col" style={th}>1인당</th>
                  <th scope="col" style={th}>걷히는 합계</th>
                  <th scope="col" style={th}>차액</th>
                </tr>
              </thead>
              <tbody>
                {ROUNDING_ROWS.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{r.name}</th>
                    <td style={{ ...td, fontWeight: 700 }}>{won(r.per)}</td>
                    <td style={td}>{won(r.collected)}</td>
                    <td style={{ ...td, color: r.diff < 0 ? 'var(--danger)' : r.diff > 0 ? 'var(--success)' : 'var(--muted)', fontWeight: 600 }}>{signedWon(r.diff)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 14 }}>
            눈여겨볼 점은 세 가지입니다. 첫째, <strong>1원 단위도 차액이 0이 아닙니다</strong> — 몫을 원 단위로 반올림하면 합계가 {won(Math.abs(ROUNDING_ROWS[0].diff))} 모자라는데,
            잔여 처리에서 &lsquo;균등 분배(1원 단위)&rsquo;를 고르면 {EX_1WON_HI_N}명은 {won(EX_1WON_HI)}, 나머지는 {won(EX_1WON_LO)}을 내서 정확히 맞춥니다.
            둘째, <strong>100원 반올림과 100원 내림은 이 금액에서 결과가 같습니다</strong> — 끝자리 14원이 50원 미만이라 반올림도 아래로 내려가기 때문입니다.
            셋째, <strong>1,000원 내림은 부족분이 가장 큽니다</strong>. 이때 &lsquo;첫 번째 사람이 부담&rsquo;을 고르면 나머지는 {won(EX_FIRST.perPerson)}씩,
            첫 번째 사람만 {won(EX_FIRST.individualAmounts[0])}을 내 부족분을 한 사람이 메웁니다. 보통 결제한 사람을 첫 줄에 두면 &lsquo;결제자가 조금 더 낸다&rsquo;는 구조가 됩니다.
          </p>
        </section>

        {/* 3. 5가지 잔여 처리 */}
        <section>
          <h2 className="g-h2">5가지 잔여 금액 처리</h2>
          <p className="g-p">
            절삭으로 생긴 차액(잔돈 또는 부족분)을 어떻게 처리할지 선택할 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { name: '공금으로', desc: '잔돈을 모아 다음 회식·모임 공금으로 — 가장 일반적' },
              { name: '결제자가 받기', desc: '대표 결제자가 잔돈을 가짐 — 결제 수고비' },
              { name: '첫 번째 사람이 부담', desc: '첫 번째 사람이 나머지와의 차액을 조정 — 내림이면 더 내고, 올림이면 덜 냄' },
              { name: '무작위 1명이 부담', desc: '무작위로 뽑은 한 명(몇 번째 사람인지 표시)이 차액을 조정 — 게임처럼' },
              { name: '균등 분배 (1원 단위)', desc: '잔돈도 정확히 1원 단위로 — 여행 정산에 최적' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 13px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '3px' }}>{r.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 14 }}>
            잔여 처리를 &lsquo;첫 번째 사람이 부담&rsquo; 또는 &lsquo;무작위 1명이 부담&rsquo;으로 고른 경우, 소액이면 예외 처리가 들어갑니다{won(10_000)}을 7명이 1,000원 올림으로 나누면 1인 몫이 2,000원으로 올라가
            나머지 6명만으로 12,000원이 걷히고, 차액을 맡은 사람의 몫은 −2,000원이 됩니다. 이럴 때 도구는 같은 단위의 <strong>내림</strong>으로 다시 계산해
            첫 번째 사람 {won(EX_SMALL.individualAmounts[0])}, 나머지 {won(EX_SMALL.perPerson)}으로 안내합니다.
            {' '}{won(5_000)}처럼 1,000원 단위로 내리면 1인 몫이 0원이 되는 금액은 한 단계 작은 {won(EX_TINY.steppedDownUnit ?? 100)} 단위로 낮춰
            첫 번째 사람 {won(EX_TINY.individualAmounts[0])}, 나머지 {won(EX_TINY.perPerson)}으로 나눕니다 — 한 사람이 전액을 떠안지 않도록 하기 위한 규칙입니다.
            &lsquo;공금으로&rsquo;·&lsquo;결제자가 받기&rsquo;에는 이 예외가 없어 올림 금액을 모두에게 그대로 적용하므로, 같은 {won(10_000)}·7명·1,000원 올림이면
            {won(EX_SMALL_FUND.perPerson)}씩 {won(EX_SMALL_FUND.totalCollected)}을 걷고 {won(EX_SMALL_FUND.remainder)}이 남습니다. &lsquo;균등 분배(1원 단위)&rsquo;는 절삭 단위와 관계없이 1원 단위로 나눕니다.
          </p>
        </section>

        {/* 4. 술값 분리 공식 */}
        <section>
          <h2 className="g-h2">술값 분리 — 공정한 회식 정산</h2>
          <p className="g-p">
            회식에서 가장 자주 발생하는 형평성 문제. 본 도구는 다음 공식으로 자동 계산합니다 —
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', fontSize: 13, color: 'var(--text)', lineHeight: 1.85, fontFamily: 'var(--font-sans)' }}>
            <strong>음식값</strong> = 총액 − 술값<br />
            <strong>비음주자 1인</strong> = 음식값 ÷ 전체 인원<br />
            <strong>음주자 1인</strong> = (음식값 ÷ 전체) + (술값 ÷ 음주자)
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            예: 총 200,000원 / 술값 80,000원 / 6명 (음주 4명, 비음주 2명) → 비음주 20,000원, 음주 40,000원.
            음주자가 1인당 <strong style={{ color: 'var(--orange-600)' }}>20,000원 더 부담</strong>합니다.
          </p>
          <p className="g-p" style={{ marginTop: 12 }}>
            단위 처리는 비음주자·음주자 금액에 <strong>각각</strong> 적용됩니다. 그래서 올림을 고르면 두 금액이 모두 올라가 잔돈이 더 커질 수 있습니다.
            예를 들어 총 {won(EX_TOTAL)}(술값 {won(62_000)}), 7명 중 4명이 마셨고 1,000원 올림이면 비음주 {won(EX_DRINK.nonDrinkerAmount)}, 음주 {won(EX_DRINK.drinkerAmount)}이 되어
            합계 {won(EX_DRINK.totalCollected)} — 잔돈 {signedWon(EX_DRINK.remainder)}이 남습니다. 술값은 영수증의 주류 항목만 합산해 넣고, 총액에는 술값을 <strong>포함한</strong> 결제 금액을 넣어야 합니다
            (도구가 총액에서 술값을 빼서 음식값을 구하기 때문입니다).
          </p>
        </section>

        {/* 5. 선결제자 최소 송금 알고리즘 */}
        <section>
          <h2 className="g-h2">선결제자 — 최소 송금 횟수 알고리즘</h2>
          <p className="g-p">
            여러 명이 나눠서 결제했을 때 누가 누구에게 얼마를 보낼지 결정하는 문제. 본 도구는
            <strong style={{ color: 'var(--text)' }}> 잔액의 합이 0이 되는 그룹</strong>으로 최대한 잘게 나눈 뒤 각 그룹을 정리해 송금 횟수를 줄입니다
            (정산 인원 <strong style={{ color: 'var(--text)' }}>15명 이하</strong>는 수학적 최소 횟수를 보장, 그 이상은 최소에 가까운 근사) —
          </p>
          <ol style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, paddingLeft: '20px', margin: 0 }}>
            <li>각자의 잔액 = 결제액 − 부담액 (+ 받을, − 낼)</li>
            <li>잔액의 합이 0이 되는 부분 그룹을 최대한 많이 분리</li>
            <li>각 그룹 안에서 가장 많이 받을·낼 사람을 매칭해 송금</li>
            <li>최소 송금 = (정산할 인원) − (합이 0인 그룹 수)</li>
          </ol>
          <div style={{ marginTop: 12 }}>
            <Callout tone="tip" title="예시">
              5명의 잔액이 −60,000 / −50,000 / +20,000 / +40,000 / +50,000원일 때
              <br />· 낼 사람이 받을 사람에게 제각각 보내면 최대 6건
              <br />· 알고리즘: (−50,000 ↔ +50,000) 1건 + (−60,000 ↔ +20,000·+40,000) 2건 = <strong>총 3건</strong>
              <br />단순 그리디만 쓰면 4건이 되는데, 합이 0인 그룹을 찾아 3건까지 줄입니다.
            </Callout>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            송금 횟수를 최소로 만드는 문제는 수학적으로 어려운 문제(NP-난해)로 알려져 있습니다 — 합이 0인 그룹을 최대한 많이 찾는 일이
            부분집합 조합을 모두 따져 봐야 하는 문제와 같기 때문입니다. 그래서 도구는 잔액이 있는 사람이 15명 이하일 때만 모든 조합을 확인하고,
            그보다 많으면 큰 금액끼리 짝짓는 방식으로 빠르게 근사합니다(화면에 &lsquo;근사&rsquo;로 표시). 결제액 합계와 부담액 합계가 1원 이상 어긋나면
            &lsquo;결제 합계 ≠ 부담 합계&rsquo; 경고가 뜨니, 누락된 영수증이나 찬조 금액을 먼저 확인하세요.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
            <strong style={{ color: 'var(--text)' }}>찬조자(Contributor)</strong> — 결제는 했지만 부담은 없는 사람(상사 협찬·생일 주인공 협찬 등). 체크박스로 표시하면 그 사람의 부담은 0원이 되고, <strong style={{ color: 'var(--text)' }}>찬조한 금액만큼 나머지 사람들이 나눠 낼 금액이 줄어듭니다</strong> (찬조자는 환급받지 않습니다).
          </p>
        </section>

        {/* 6. 개인별 정산 */}
        <section>
          <h2 className="g-h2">개인별 정산 — 메뉴별 가격 차이가 클 때</h2>
          <p className="g-p">
            메뉴별 가격 차이가 큰 모임에 적합 (한 명은 스테이크, 한 명은 샐러드). 각자의 부담은 —
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', fontSize: 13, color: 'var(--text)', lineHeight: 1.85, fontFamily: 'var(--font-sans)' }}>
            본인 부담 = 본인 메뉴 합계
            <br />+ 공동 메뉴 합계 ÷ 전체 인원
            <br />+ 공동 술값 ÷ 음주자 수 (음주자만)
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>예</strong> — 3명이 각자 스테이크(35,000) / 파스타(22,000) / 샐러드(18,000)를 시키고 공동 와인(30,000원)을 마셨다면, 각자 본인 메뉴 + 와인 10,000원씩 부담. 메뉴별로 정확히 본인이 먹은 만큼만 내므로 가장 공정합니다.
          </p>
        </section>

        {/* 6-1. 정산 전 확인 */}
        <section>
          <h2 className="g-h2">정산이 어긋나는 흔한 원인</h2>
          <ul className="g-list">
            <li><strong>할인·쿠폰을 반영하지 않은 금액</strong>을 총액으로 넣는 경우 — 카드 청구 금액이 아니라 영수증 합계를 넣으면 할인분만큼 더 걷힙니다. 실제 결제된 금액을 기준으로 하세요.</li>
            <li><strong>음주자 수가 전체 인원보다 많게</strong> 입력되는 경우 — 도구는 음주자 수를 전체 인원 이하로 자동 제한하지만, 중간에 합류·이탈한 사람이 있다면 인원부터 다시 세는 것이 정확합니다.</li>
            <li><strong>음주자를 0명으로 두고 술값을 입력</strong>하면 술값이 정산에서 빠집니다. 술값까지 전원이 나눌 생각이라면 [간단 N빵]을 쓰는 편이 맞습니다.</li>
            <li><strong>여러 차수를 한 번에 합치기</strong> — 1차와 2차 참석자가 다르면 차수별로 따로 계산한 뒤 [선결제자 정산]에서 결제액·부담액으로 합치면 송금 건수도 줄일 수 있습니다.</li>
          </ul>
        </section>

        {/* 7. 1인당 적정 예산 가이드 */}
        <section>
          <h2 className="g-h2">모임별 1인당 적정 예산</h2>
          <p className="g-p">
            모임 성격별 1인당 예산 — 지역·시기·메뉴에 따라 크게 달라지는 대략적인 참고용 범위입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🍱', name: '점심 회식', amount: '12,000~18,000원', desc: '구내식당·일반 식당 정찬' },
              { icon: '☕', name: '카페 모임',  amount: '6,000~10,000원',  desc: '음료 + 디저트 1' },
              { icon: '🍻', name: '저녁 회식', amount: '30,000~50,000원', desc: '고기·삼겹·치킨 + 술 1차' },
              { icon: '🍺', name: '2차 술자리', amount: '15,000~30,000원', desc: '맥주집·호프·이자카야' },
              { icon: '🥂', name: '팀 회식',   amount: '50,000~80,000원', desc: '소고기·횟집·코스 요리' },
              { icon: '🎂', name: '생일 모임', amount: '30,000~60,000원', desc: '레스토랑 + 케이크·선물' },
              { icon: '👨‍👩‍👧', name: '가족 외식', amount: '20,000~40,000원', desc: '한식·중식·패밀리 레스토랑' },
              { icon: '✈️', name: '여행 1일',  amount: '50,000~100,000원', desc: '식비·교통·입장료 (숙박 제외)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '3px' }}>{s.icon} {s.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)', margin: '0 0 3px' }}>{s.amount}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. 카톡 공유 */}
        <section>
          <h2 className="g-h2">카카오톡 공유 메시지</h2>
          <p className="g-p">
            4가지 정산 결과를 카톡 형식 메시지로 자동 생성합니다. 모임 제목·받을 사람·계좌번호를 입력하면 그대로 복사해 채팅방에 붙여넣을 수 있습니다.
          </p>
          <div style={{ background: '#FFE400', border: '2px solid #FFD600', borderRadius: 'var(--radius-m)', padding: '14px 18px', fontSize: 13, color: '#3C1E1E', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>
            🍻 1월 팀 회식{'\n'}
            ━━━━━━━━━━━━━━{'\n'}
            총 금액: 240,000원{'\n'}
            인원: 6명{'\n'}
            💰 1인당: 40,000원{'\n'}{'\n'}
            💸 입금 안내{'\n'}
            받을 사람: 김OO{'\n'}
            카뱅 3333-XX-XXXXXX
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="note">
              카카오톡 자동 전송은 카카오 정책상 제한됩니다. 본 도구는 <strong>메시지 자동 생성 + 클립보드 복사</strong>까지 지원하며, 복사한 메시지를 카카오톡 채팅방에 직접 붙여넣으면 됩니다.
              계좌번호는 메시지에만 들어가고 어디에도 전송·저장되지 않습니다.
            </Callout>
          </div>
        </section>

        {/* 9. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/life/random',     icon: '🎲', name: '랜덤 추첨기', desc: '가중치 추첨·룰렛·팀 나누기' },
              { href: '/tools/life/ladder',     icon: '🪜', name: '사다리타기',              desc: '회식 분담·점심 메뉴 정하기' },
              { href: '/tools/life/lotto',      icon: '🎰', name: '로또 번호 생성기',         desc: '8가지 모드·확률 시뮬' },
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
