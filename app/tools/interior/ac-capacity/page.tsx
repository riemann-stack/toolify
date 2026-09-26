import Link from 'next/link'
import AcCapacityClient from './AcCapacityClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import { LOAD_W_PER_SQM, W_PER_PYEONG, BTU_PER_PYEONG, STANDARD_PYEONG, PYUNG_TO_M2 } from './acCapacityUtils'

export const metadata = buildMetadata({
  path: '/tools/interior/ac-capacity',
  title: '에어컨 평형 계산기 — 거실·방 평수·BTU·W 환산',
  description: '거실·방 면적에 향·층수·단열·인원 보정을 더해 추천 에어컨 평형을 계산합니다. BTU·W·kW 환산(1평형≈407W, KS C 9306)과 인버터 vs 정속형 전기료 비교, 권장 설정 온도 가이드까지.',
  keywords: ['에어컨평형계산기', '거실에어컨몇평형', '에어컨용량계산', '13평형에어컨', '에어컨BTU환산', 'BTU평형변환', '에어컨W환산', '인버터에어컨'],
})

/* ── 가이드 표·예시 — 빌드 시 도구와 같은 상수·공식으로 계산 (손으로 옮겨 적지 않는다) ──
   계수는 AcCapacityClient의 SPACE_TYPES·DIRECTIONS·FLOORS·INSULATIONS·APPLIANCES 값과 같다. 천장 2.4m(보정 ×1.0) 가정. */
const nf = (v: number, d = 0) => v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d })

function acLoad(areaM2: number, factor: number, occupants: number, applianceW: number) {
  const base = areaM2 * LOAD_W_PER_SQM
  const adjusted = base * factor
  const total = adjusted + occupants * 100 + applianceW
  const exact = total / W_PER_PYEONG
  const matched = STANDARD_PYEONG.find(p => p >= exact) ?? STANDARD_PYEONG[STANDARD_PYEONG.length - 1]
  return { base, adjusted, total, exact, matched }
}

/* 공식 예시: 거실 16.5㎡ · 남향 · 8층(중층) · 일반 단열 · 4명 · TV·PC */
const EX_FACTOR = 1.05 * 1.15 * 1.05 * 1.0
const EX = acLoad(16.5, EX_FACTOR, 4, 200)

/* 조건별 조견표 — 같은 면적이라도 조건에 따라 평형이 얼마나 달라지는지 */
const SCENARIOS = [
  { key: 'mild', label: '침실 · 북향 · 저층 · 신축 · 2명', factor: 1.0 * 0.95 * 1.0 * 0.95, occ: 2, app: 0 },
  { key: 'std',  label: '거실 · 남향 · 중층 · 일반 · 4명 · TV·PC (도구 기본값)', factor: 1.05 * 1.15 * 1.05 * 1.0, occ: 4, app: 200 },
  { key: 'hot',  label: '거실 · 동·서향 · 최상층 · 노후 · 4명 · TV·PC', factor: 1.05 * 1.10 * 1.20 * 1.15, occ: 4, app: 200 },
] as const
const GRID_PYEONG = [3, 5, 7, 10, 12, 15, 20]
const GRID = GRID_PYEONG.map(py => ({ py, cells: SCENARIOS.map(sc => acLoad(py * PYUNG_TO_M2, sc.factor, sc.occ, sc.app)) }))

const STD_USE: Record<number, string> = {
  6: '작은방 (3~4평)', 9: '일반 침실 (5~7평)', 11: '중간 방·작은 거실', 13: '일반 거실', 15: '큰 거실',
  18: '큰 거실·매장', 22: '넓은 거실·매장', 25: '매장·사무실', 30: '상가·사무실', 36: '상가·사무실',
}
/* 1 USRT(미국 냉동톤) = 12,000 BTU/h */
const USRT_PYEONG = 12000 / BTU_PER_PYEONG

const th: React.CSSProperties = { padding: '10px 12px', color: 'var(--muted)', fontWeight: 500, fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', color: 'var(--text)', whiteSpace: 'nowrap' }
const rowBg = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

const FAQ_LD = [
              {
                q: '거실은 몇 평형 에어컨이 적당한가요?',
                a: '거실 면적과 단열·향에 따라 다릅니다. 일반적으로 <strong>5평 거실은 9~11평형</strong>, 7평 거실은 11~13평형, 10평 거실은 13~15평형이 권장됩니다. 남향·통유리·최상층은 한 단계 큰 평형이 안전합니다. 반대로 평형이 너무 크면 자주 꺼져서 습도 조절이 잘 안 됩니다.',
              },
              {
                q: '에어컨 BTU와 평형은 어떻게 환산하나요?',
                a: '한국 <strong>1평형 ≈ 1,389 BTU/h ≈ 0.41 kW</strong>입니다(KS C 9306 부속서 D, 정격 냉방능력 약 123 W/㎡ 기준). 해외 직구나 비즈니스용 에어컨은 BTU로 표시되므로 변환이 필요합니다. 예를 들어 12,000 BTU ≈ 9평형, 18,000 BTU ≈ 13평형, 24,000 BTU ≈ 17평형 정도입니다. 여기서 평형은 <strong>냉방면적(공간 크기)</strong>을 뜻하며, 한국·일본은 평형, 미국·동남아는 BTU, 유럽은 kW를 주로 사용합니다.',
              },
              {
                q: '평형이 너무 크면 더 시원할까요?',
                a: '<strong>아니요. 오히려 안 좋을 수 있습니다.</strong> 평형이 너무 크면 빠르게 시원해진 후 자동으로 꺼지고, 다시 더워지면 켜지는 사이클이 짧아집니다. 이 과정에서 습도가 제대로 조절되지 않아 끈끈한 느낌이 들 수 있습니다. 또한 초기 가동 시 전기 사용량이 크고 압축기 부하도 커서 전기료가 오히려 더 나올 수 있습니다. <strong>적정 평형 또는 한 단계 위 정도가 가장 효율적</strong>입니다.',
              },
              {
                q: '인버터 에어컨이 정말 전기료가 적게 나오나요?',
                a: '네, 일반적으로 <strong>30~40% 절감 효과</strong>가 있습니다. 인버터는 설정 온도 도달 후 압축기를 약하게 유지하면서 미세 조정합니다. 반면 정속형은 ON/OFF만 가능해 매번 풀가동으로 시작하므로 전력 소모가 큽니다. 장시간 사용(하루 8시간 이상, 여름 내내) 가구라면 인버터가 유리하며, <strong>보통 1~2시즌 내 전기료 절감으로 초기 가격 차이가 상쇄</strong>되는 경우가 많습니다.',
              },
              {
                q: '신축 아파트와 노후 아파트는 평형 차이가 큰가요?',
                a: '네, <strong>약 20% 차이</strong>가 날 수 있습니다. 신축 아파트는 단열재·창호가 우수해 냉방 부하가 적습니다. 반면 20년 이상 된 노후 아파트는 단열재 노후·창호 틈으로 냉기 손실이 커 같은 평수라도 한 단계 큰 평형이 필요할 수 있습니다. 베란다 확장으로 외기 면적이 늘어난 거실도 +10% 정도 큰 평형이 권장됩니다.',
              },
            ]

export default function AcCapacityPage() {
  return (
    <ToolPage width={760} slug="/tools/interior/ac-capacity">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />에어컨 평형 계산기
      </h1>
      <p className="tp-lead">
        면적·향·층수·단열을 반영한 <strong style={{ color: 'var(--text)' }}>추천 평형</strong> + BTU·W 환산.
      </p>

      <UpdatedMeta
        date="2026년 6월"
        basis="냉방부하 약 123 W/㎡·1평형 ≈ 407W(KS C 9306 부속서 D) 기준 — 향·층·단열·인원 보정은 관행 가정값"
        sources={[
          { label: 'KS C 9306 에어컨디셔너 (e-나라 표준인증)', href: 'https://standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?ksNo=KSC9306' },
          { label: '한국에너지공단 (에너지소비효율등급)', href: 'https://www.energy.or.kr' },
        ]}
      />

      <AcCapacityClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 계산 공식 ── */}
        <section>
          <h2 className="g-h2">에어컨 평형 계산 공식</h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>냉방 부하 (W)</span> = 면적(㎡) × 123 × 보정 계수 + 인원 × 100W + 가전 부하</div>
            <div><span style={{ color: 'var(--muted)' }}>추천 평형</span> = 냉방 부하 ÷ 407W (1평형 정격 냉방능력)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 한국 1평형(냉방면적) ≈ 407W ≈ 1,389 BTU/h ≈ 0.41 kW — KS C 9306 부속서 D(123 W/㎡)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>예시:</strong> 거실 16.5㎡, 남향 8층, 일반 단열, 4명 + TV·PC<br />
            • 기본: 16.5 × 123 = <strong>{nf(EX.base)}W</strong><br />
            • 보정: 거실(1.05) × 남향(1.15) × 중층(1.05) = <strong>{nf(EX_FACTOR, 2)}배</strong> → {nf(EX.adjusted)}W<br />
            • 최종: {nf(EX.adjusted)}W + 인원 400W + 가전 200W = <strong style={{ color: 'var(--accent-ink)' }}>{nf(EX.total)}W</strong><br />
            • 평형: {nf(EX.total)} ÷ 407 ≈ {nf(EX.exact, 1)} → 한국 시판 매칭 <strong style={{ color: 'var(--accent-ink)' }}>{EX.matched}평형</strong>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            123 W/㎡는 거주 공간 1㎡를 식히는 데 필요한 기준 냉방 부하이고, 여기에 3.3058㎡(1평)를 곱한 약 407W가 &lsquo;1평형&rsquo;입니다. 그래서 에어컨의 평형은 &lsquo;그 평수의 공간을 기준 조건에서 냉방할 수 있는 능력&rsquo;을 뜻합니다. 계산기는 여기에 공간 용도·향·층·단열을 곱하고, 천장이 2.4m보다 높으면 1m당 25%씩 부하를 늘린 뒤, 사람 1명당 100W와 발열 가전 부하를 더합니다. 마지막으로 필요 평형 이상인 가장 작은 시판 평형(6·9·11·13·15·18·22·25·30·36)을 추천하므로, 위 예처럼 필요량이 7.8평형이면 한 단계 올린 9평형이 나옵니다.
          </p>
        </section>

        {/* ── 2. 한국 평형 표준 ── */}
        <section>
          <h2 className="g-h2">한국 에어컨 평형 표준 (시판 모델)</h2>
          <p className="g-p">
            아래 값은 평형 × 407W(1,389 BTU/h)로 계산한 정격 냉방능력과, 평형 × 3.3058㎡로 환산한 기준 냉방면적입니다. 제품 이름의 평형은 반올림한 마케팅 표기라 사양표의 정격 냉방능력(W)과 조금씩 다를 수 있으니, 두 제품을 비교할 때는 평형보다 정격 냉방능력(W)을 보는 편이 정확합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ ...th, textAlign: 'left' }}>평형</th>
                  <th scope="col" style={th}>정격 냉방능력</th>
                  <th scope="col" style={th}>BTU/h</th>
                  <th scope="col" style={th}>기준 냉방면적</th>
                  <th scope="col" style={{ ...th, textAlign: 'left' }}>추천 공간</th>
                </tr>
              </thead>
              <tbody>
                {STANDARD_PYEONG.map((p, i) => (
                  <tr key={p} style={rowBg(i)}>
                    <th scope="row" style={{ ...td, textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>{p}평형</th>
                    <td style={{ ...td, fontWeight: 700 }}>{nf(p * W_PER_PYEONG)}W ({nf(p * W_PER_PYEONG / 1000, 2)}kW)</td>
                    <td style={td}>{nf(p * BTU_PER_PYEONG)}</td>
                    <td style={td}>{nf(p * PYUNG_TO_M2, 1)}㎡</td>
                    <td style={{ ...td, textAlign: 'left', color: 'var(--muted)' }}>{STD_USE[p]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 모델별 정격 냉방능력·소비전력은 제품 사양표와 한국에너지공단 에너지소비효율등급 정보에서 확인할 수 있습니다. 정격 8,100W를 넘는 대형 제품은 단위 부하를 110 W/㎡로 잡아 표기 면적이 더 넓게 나옵니다.
          </p>
        </section>

        {/* ── 3. 조건별 조견표 ── */}
        <section>
          <h2 className="g-h2">방 크기·조건별 추천 평형 조견표</h2>
          <p className="g-p">
            같은 면적이라도 햇빛·층·단열 조건에 따라 추천 평형이 크게 달라집니다. 아래 표는 이 계산기와 같은 공식(천장 2.4m)으로 세 가지 대표 조건을 계산한 결과이며, 괄호 안은 반올림 전 필요 평형입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ ...th, textAlign: 'left' }}>방 면적</th>
                  {SCENARIOS.map(sc => (
                    <th scope="col" key={sc.key} style={{ ...th, whiteSpace: 'normal', minWidth: 140 }}>{sc.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID.map((r, i) => (
                  <tr key={r.py} style={rowBg(i)}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{r.py}평 ({nf(r.py * PYUNG_TO_M2, 1)}㎡)</th>
                    {r.cells.map((c, j) => (
                      <td key={j} style={td}>
                        <strong style={{ color: 'var(--accent-ink)' }}>{c.matched}평형</strong>
                        <span style={{ color: 'var(--muted)' }}> ({nf(c.exact, 1)})</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            10평 공간을 예로 들면 북향 신축 침실은 {GRID[3].cells[0].matched}평형이면 되지만, 남향 중층 거실은 {GRID[3].cells[1].matched}평형, 햇빛이 옆으로 깊게 드는 최상층 노후 거실은 {GRID[3].cells[2].matched}평형까지 올라갑니다. 면적만 보고 &lsquo;10평이니 10평형&rsquo;으로 고르면 조건이 나쁜 집에서는 한여름 오후에 설정 온도까지 내려가지 못할 수 있습니다. 반대로 조건이 좋은 방에 큰 평형을 달면 금방 꺼졌다 켜지기를 반복해 제습이 덜 됩니다.
          </p>
        </section>

        {/* ── 4. 평형 보정 계수 가이드 ── */}
        <section>
          <h2 className="g-h2">평형 보정 계수 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '향', c: 'var(--accent-ink)', items: [
                ['남향 (햇빛 강함)', '+15%'],
                ['동·서향', '+10%'],
                ['북향 (햇빛 약함)', '-5%'],
              ]},
              { t: '층수', c: 'var(--cyan-600)', items: [
                ['저층 (1~3층)', '표준'],
                ['중층 (4~10층)', '+5%'],
                ['고층 (11층+)', '+10%'],
                ['최상층 (옥상 직접)', '+20%'],
                ['반지하', '-10%'],
              ]},
              { t: '단열', c: 'var(--amethyst)', items: [
                ['신축 (5년 이내)', '-5%'],
                ['일반 (10년+)', '표준'],
                ['노후 (20년+)', '+15%'],
                ['베란다 확장', '+10%'],
                ['통유리', '+20%'],
              ]},
              { t: '천장 높이', c: 'var(--orange-600)', items: [
                ['2.4m 표준', '×1.0'],
                ['2.9m (+0.5m)', '+12.5%'],
                ['3.4m (+1m)', '+25%'],
              ]},
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.items.map(([k, v], j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                      <span>{k}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            보정 계수는 서로 곱해집니다. 남향(×1.15)·최상층(×1.20)·노후(×1.15)가 겹치면 1.15 × 1.20 × 1.15 ≈ 1.59배로, 기본 부하보다 60% 가까이 커집니다. 이 계수들은 표준이 정한 값이 아니라 현장에서 통용되는 가정값이므로, 한여름 오후에 실제로 얼마나 더운 집인지 알고 있다면 그 경험에 맞춰 한 단계씩 조정해 보세요.
          </p>
        </section>

        {/* ── 5. BTU·W·평형 환산 ── */}
        <section>
          <h2 className="g-h2">BTU·W·평형 환산 가이드</h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 10 }}>1평형 ≈ 407W ≈ 1,389 BTU/h ≈ 0.41 kW</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>해외 직구 시 BTU 표기 → 한국 평형 변환:</p>
            <ul style={{ paddingLeft: 22, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.9 }}>
              {[12000, 18000, 24000, 36000].map(b => (
                <li key={b}>{nf(b)} BTU/h = 약 <strong style={{ color: 'var(--accent-ink)' }}>{nf(b / BTU_PER_PYEONG, 1)}평형</strong> ({nf(b * 0.29307 / 1000, 2)}kW)</li>
              ))}
            </ul>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              ※ <strong style={{ color: 'var(--text)' }}>BTU(British Thermal Unit)</strong>는 미국·동남아 표기, 한국·일본은 평형, 유럽은 kW 표기
            </p>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            단위 관계는 1 BTU/h ≈ 0.293W, 1kW ≈ 3,412 BTU/h ≈ 860 kcal/h입니다. 오래된 국내 제품이나 업소용 사양표에는 kcal/h가 남아 있는 경우가 있는데, kcal/h ÷ 860으로 kW를 구한 뒤 1,000을 곱하고 407로 나누면 평형이 됩니다. 업소용·시스템 냉방에서 쓰는 미국 냉동톤(USRT)은 12,000 BTU/h로 약 {nf(USRT_PYEONG, 1)}평형에 해당합니다. 환산값이 표준 평형 사이에 걸리면 위쪽 평형을 고르는 것이 원칙입니다.
          </p>
        </section>

        {/* ── 6. 평형이 너무 크거나 작으면 ── */}
        <section>
          <h2 className="g-h2">평형이 너무 크거나 작으면 안 좋은 이유</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--orange-600)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--orange-600)', fontWeight: 700, marginBottom: 8 }}>너무 작은 평형</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>충분히 시원해지지 않음</li>
                <li>풀가동으로 전기료 ↑</li>
                <li>압축기 과부하로 수명 ↓</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--red-600)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--red-600)', fontWeight: 700, marginBottom: 8 }}>너무 큰 평형</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>단가 비쌈</li>
                <li>빠르게 시원해지지만 자주 꺼짐</li>
                <li>습도 조절이 덜 됨 (끈끈한 느낌)</li>
                <li>전기료 오히려 더 나올 수 있음</li>
              </ul>
            </div>
          </div>
          <Callout tone="tip">
            <strong>적정 평형 또는 한 단계 위</strong>까지가 가장 효율적입니다. 계산기가 보여 주는 &lsquo;한 단계 아래·위&rsquo; 옵션은 이 범위를 비교하라는 뜻입니다.
          </Callout>
        </section>

        {/* ── 7. 흔한 실수 ── */}
        <section>
          <h2 className="g-h2">계산 결과를 제품 선택에 적용할 때 흔한 실수</h2>
          <ul className="g-list">
            <li><strong>분양 평수를 그대로 입력</strong> — 아파트 광고의 &lsquo;34평형&rsquo;은 계단·복도 같은 공용면적까지 더한 공급면적입니다. 에어컨 계산에는 냉방할 공간(거실이면 거실)의 실제 가로 × 세로를 넣어야 합니다.</li>
            <li><strong>거실과 주방이 트여 있는데 거실만 입력</strong> — 문으로 나뉘지 않은 공간은 찬 공기가 함께 퍼지므로 두 면적을 합쳐 넣고, 조리 열이 많은 집은 공간 유형을 &lsquo;주방·다이닝(×1.2)&rsquo;으로 잡아 보세요.</li>
            <li><strong>스탠드 한 대로 집 전체를 식힐 수 있다고 기대</strong> — 문이 닫힌 방에는 냉기가 거의 가지 않습니다. 방마다 따로 계산해 벽걸이를 두거나 멀티형(2in1)을 고려하세요.</li>
            <li><strong>냉방능력(W)과 소비전력(W)을 혼동</strong> — 사양표에서 냉방능력이 소비전력보다 몇 배 큰 것이 정상입니다(냉방능력 ÷ 소비전력 = 효율). 이 계산기의 전기료 비교도 소비전력을 냉방능력 ÷ 3.5로 가정해 추정합니다.</li>
            <li><strong>실외기 설치 환경 무시</strong> — 실외기가 한낮 직사광선을 받거나 통풍이 막힌 좁은 공간에 있으면 같은 평형이라도 냉방 성능이 떨어집니다.</li>
          </ul>
        </section>

        {/* ── 8. 인버터 vs 정속형 ── */}
        <section>
          <h2 className="g-h2">인버터 vs 정속형 — 어떤 걸 골라야 할까?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>인버터 에어컨</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>압축기 회전수 조절 → 부드러운 운전</li>
                <li>설정 온도 도달 후 약하게 유지</li>
                <li><strong>전기료 30~40% 절감</strong></li>
                <li>초기 가격은 제품군에 따라 수만~수십만원 비쌈</li>
                <li><strong>거실·장시간 사용·여름 내내 가동</strong> 추천</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--red-600)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--red-600)', fontWeight: 700, marginBottom: 8 }}>정속형 에어컨</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>압축기 ON/OFF만 가능</li>
                <li>설정 온도 도달 시 꺼졌다 켜졌다</li>
                <li>전기료 더 나옴</li>
                <li>가격 저렴</li>
                <li><strong>잠깐 사용·임시 거주·예산 제한</strong> 추천</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 9. 언제, 몇 도로 틀까 (사용 가이드) ── */}
        <section>
          <h2 className="g-h2">에어컨 언제, 몇 도로 틀까? — 사용 가이드</h2>

          {/* 권장 설정 온도 — 강조 */}
          <div style={{
            background: 'color-mix(in srgb, var(--accent) 7%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            borderRadius: 'var(--radius-card)', padding: '18px 20px', marginBottom: 12, textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 4px' }}>권장 실내 설정 온도</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(28px,7vw,40px)', fontWeight: 800, color: 'var(--accent-ink)', margin: 0, letterSpacing: '-0.02em' }}>
              26 ~ 28°C
            </p>
            <p style={{ fontSize: 13, color: 'var(--text)', margin: '6px 0 0', lineHeight: 1.6 }}>
              실내외 온도차는 <strong>5~8°C 이내</strong>로. 바깥이 33°C면 26~28°C가 적정 — 더 낮추면 냉방병·전기요금만 늘어요.
            </p>
          </div>

          {/* 언제 켤까 / 몇 도로 / 습도 / 절전 — 2열 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              {
                t: '언제 켜야 할까',
                items: [
                  '실내 온도 28°C 이상으로 올라갈 때',
                  '습도 60% 이상이라 같은 온도도 더 덥게 느껴질 때',
                  '열대야(밤 최저 25°C↑) — 취침 30분~1시간 전 미리 가동',
                  '바깥 30°C↑ + 실내 28°C↑가 일반적인 가동 시점',
                ],
              },
              {
                t: '상황별 온도',
                items: [
                  '주간 활동: 26~28°C + 약~중풍',
                  '취침: 27~28°C + 무풍/약풍 + 2~3시간 타이머',
                  '아기·노약자: 27~28°C, 찬바람 직접 X',
                  '설정 1°C 낮추면 전력 약 7% 증가',
                ],
              },
              {
                t: '습도가 더 중요할 때',
                items: [
                  '쾌적 습도 50~60% — 온도보다 체감을 좌우',
                  '장마·눅눅할 땐 냉방보다 제습 모드가 효과적',
                  '제습 시 설정온도를 1~2°C 높여도 시원하게 느껴짐',
                  '한여름 무더위는 냉방, 눅눅한 장마는 제습',
                ],
              },
              {
                t: '전기요금 아끼는 운전',
                items: [
                  '인버터는 껐다 켜기보다 26~27°C로 계속 켜두기가 절약',
                  '서큘레이터·선풍기 병행 → 설정 2°C 높여도 같은 체감',
                  '바람은 위로(찬 공기는 가라앉음)',
                  '필터 2주마다 청소 · 실외기 직사광·통풍 확보',
                ],
              },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{b.t}</p>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                  {b.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <Callout tone="warn" title="냉방병 주의">
            실내외 온도차가 8°C 넘게 큰 곳을 자주 드나들면 자율신경이 피로해져 두통·피로·소화불량이 생깁니다. 온도차를 5~8°C로 유지하고 2시간마다 환기하세요. 폭염(외기 35°C↑)에는 평형도 한 단계 크게 잡는 것이 좋습니다.
          </Callout>
        </section>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/interior/lighting',      icon: '💡', name: '조명 밝기 계산기',           desc: '공간별 권장 루멘·조명 개수' },
              { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 계산기',         desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 계산기',       desc: '벽·천장 페인트 양' },
              { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈',       desc: '창문 사이즈로 추천 사이즈' },
              { href: '/tools/unit/area',              icon: '🏠', name: '평수 변환기',          desc: '아파트 면적 단위 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
