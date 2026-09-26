import Link from 'next/link'
import RebarClient from './RebarClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { REBAR_DATA, REBAR_SIZES, TRUCKS, totalWeight, withLoss, tyingWire, calcPrice, weightToCount, perPiece } from './rebarUtils'

export const metadata = buildMetadata({
  path: '/tools/interior/rebar',
  title: '철근 중량 계산기 — KS D 3504 D10~D51 + 트럭 적재 + 배근 가이드',
  description: 'KS D 3504 12규격(D10~D51) + 표준 길이별 본수·중량·톤·단가 + 트럭 적재 매칭과 옹벽·기초·계단 배근 가이드.',
  keywords: ['철근 중량', 'D10 무게', 'D13 1m', 'D16 6m', '철근 1톤', 'KS D 3504', 'SD400 SD500', '철근 단가', '트럭 적재', '옹벽 배근'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const th: React.CSSProperties = { padding: '10px 12px', color: 'var(--muted)', fontWeight: 500, fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', color: 'var(--text)', whiteSpace: 'nowrap' }
const rowBg = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const nf = (v: number, d = 0) => v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d })

/* ── 가이드 표·예시 — 빌드 시 rebarUtils의 KS D 3504 데이터와 계산 함수로 생성 ── */
/* 도구 기본값: D13 · 6m · 100본 · 로스 5% · 결속선 포함 · SD400 · 톤당 100만원 */
const EX_BASE = totalWeight('D13', 6, 100)
const EX_LOSS = withLoss(EX_BASE, 5)
const EX_TIE = tyingWire(EX_LOSS)
const EX_PRICE = calcPrice(EX_LOSS, 100, 'SD400')
/* 적재 한도 안에서 실을 수 있는 최대 본수 — 무게를 넘지 않도록 내림 */
const maxBars = (capKg: number, size: keyof typeof REBAR_DATA, len: number) => Math.floor(capKg / perPiece(size, len))

const FAQ_LD = [
  { q: 'D10 1m는 몇 kg인가요?', a: 'KS D 3504 표준 단위중량은 <strong>0.560 kg/m</strong>입니다. 6m 1본은 약 3.36kg, 12m 1본은 약 6.72kg입니다. 표준 단위중량은 공칭 치수로 계산한 값이라 실제 제품은 허용 오차 범위 안에서 조금씩 다르고, 표면 부식·녹 정도에 따라서도 실측 무게가 다소 변합니다.' },
  { q: '철근 1톤이면 D13 몇 본?', a: 'D13의 단위중량은 <strong>0.995 kg/m</strong>이므로<br />• 6m 1본 = 5.97kg → 1톤 = 약 <strong>168본</strong><br />• 12m 1본 = 11.94kg → 1톤 = 약 <strong>84본</strong><br />중량→본수 탭에서 다른 규격도 매트릭스로 바로 확인할 수 있습니다.' },
  { q: '철근 절단 로스율은 보통 얼마?', a: '현장 일반 <strong>5~10%</strong>입니다. 도면대로 정확히 가공하면 5%, 임의 절단이 잦거나 복잡한 형상이면 7~10%로 잡습니다. 후크·갈고리·이음 길이가 많으면 더 높을 수 있고, 소량·DIY는 안전하게 10% 정도로 잡고 발주하세요. 단, 이음·정착 길이 자체는 로스가 아니라 도면 물량이므로 길이·본수에 먼저 반영해야 합니다.' },
  { q: 'SD400과 SD500 차이는?', a: 'SD 뒤 숫자는 <strong>항복강도(MPa)</strong>입니다. SD400은 400 MPa, SD500은 500 MPa로 25% 더 강합니다. 같은 강도가 필요한 부재라면 SD500은 더 가는 철근으로 대체할 수 있어 무게·운반·시공이 줄어듭니다. 이 계산기는 가격 보정으로 SD500을 SD400보다 약 10% 비싸게 잡습니다. 한국 일반 건축물(공동주택·상가)은 <strong>SD400</strong>이 표준이며, 교량·고층·대형은 SD500/SD600을 씁니다. 어느 쪽이든 구조도면에 적힌 등급으로 발주해야 합니다.' },
  { q: '6m 철근과 12m 철근 어느 게 유리?', a: '현장 규모에 따라 다릅니다.<br />• <strong>6m</strong> — 소형 현장·셀프 시공·자투리 활용에 좋음 (1톤 트럭은 법정 적재길이가 약 5.6m라 허가 또는 절단 필요)<br />• <strong>12m</strong> — 이음(겹침) 횟수가 줄어 <strong>강도·시공성 우수</strong>, 자투리 적음. 단 5톤 카고 이상 차량이 필요해 운반비가 오릅니다.<br />대형 현장이라면 12m가 종합적으로 유리한 경우가 많습니다.' },
  { q: '결속선·스페이서는 얼마나 필요한가요?', a: '• <strong>결속선(#18~#21)</strong>: 건설공사 표준품셈상 <strong>철근 1톤당 약 5~8kg</strong>(간단 5·보통 6.5·복잡 8kg). 교차점마다 묶습니다.<br />• <strong>콘크리트 스페이서</strong>: 1m²당 5~8개 (피복두께 유지용).<br />이 도구는 결속선을 <strong>철근 1톤당 약 6.5kg(≈0.65%)</strong>으로 자동 포함하는 옵션을 제공하며, 스페이서는 별도 발주가 일반적입니다.' },
  { q: '옹벽·기초·계단 셀프 배근 가능한가요?', a: '<strong>소형·비구조물에 한정해 가능</strong>합니다.<br />• 가능: 담장·울타리, 옹벽 1m 미만, 카포트 기초, 짧은 계단(5단 이하)<br />• 불가: 주택 슬래브·지하실·옹벽 1.5m 이상·차고 천장 — <strong>구조기술사 도면 + 건설업 등록업체</strong> 권장 (높이 2m를 넘는 옹벽은 건축법 시행령 제118조에 따른 공작물 축조신고 대상)<br />신고 없이 축조하면 시정명령과 벌금 대상이 될 수 있고, 사고가 나면 형사 책임까지 질 수 있습니다. 배근 가이드 탭은 <strong>참고용</strong>이며 대형·구조 부재는 반드시 전문가에게 의뢰하세요.' },
  { q: '철근 가격 변동은 어떻게 확인?', a: '철근 가격은 <strong>국제 원자재 시세·환율·계절·정부 정책</strong>에 따라 수시로 변동합니다. 참고처는<br />• <strong>한국철강협회</strong> 시황·통계 자료<br />• <strong>제강사(현대제철·동국제강 등)</strong> 공식 발표가<br />• <strong>철근 도매상·건설자재상</strong> 견적 — 실제 발주가에 가장 가까움<br />일반 SD400 톤당 80~120만원 범위가 최근 평균치입니다 (2026년 상반기 기준 — 발주 시 재확인).' },
  { q: '1톤 트럭에 D10 6m 몇 본 실릴까?', a: 'D10 6m 1본 = 3.36kg이므로 1톤(1,000kg)이면 최대 <strong>297본</strong>(298본이면 1,001kg으로 초과)입니다. 단, 화물 적재 길이는 자동차 길이에 그 10분의 1을 더한 길이까지라(도로교통법 시행령 제22조) 1톤 트럭(전장 약 5.1m)에 6m 철근을 실으려면 출발지 관할 경찰서장 허가를 받거나 잘라서 실어야 합니다. 더 굵은 D25는 6m 1본이 23.88kg이라 1톤이면 41본까지만 실립니다.' },
  { q: '고철 매도 시 중량 산정은?', a: '고철 매입은 <strong>실측 중량(저울)</strong>이 우선입니다. 이 도구로 추정한 중량은 본수·길이가 정확할 때만 일치하며, 부식·녹·절단 변형이 있으면 ±10% 오차가 있을 수 있습니다. 철근 고철 시세가 <strong>kg당 200~400원</strong>(2026년 상반기 기준, 변동 큼)이면 1톤은 <strong>약 20~40만원</strong>입니다. 매입 업체별로 가격 차이가 크므로 2~3곳 견적을 받으세요.' },
]

export default function RebarPage() {
  return (
    <ToolPage width={880} slug="/tools/interior/rebar">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />철근 중량 계산기
      </h1>
      <p className="tp-lead">
        KS D 3504 12규격 + 길이별 본수·중량·톤·단가 + <strong style={{ color: 'var(--text)' }}>트럭 적재 매칭</strong>.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="단위중량 KS D 3504 · 결속선 건설공사 표준품셈 기준 — 가격·고철 시세는 변동치(발주 시 재확인)"
        sources={[
          { label: '한국철강협회', href: 'https://www.kosa.or.kr' },
          { label: 'KS D 3504 철근 콘크리트용 봉강 (e-나라 표준인증)', href: 'https://standard.go.kr/KSCI/standardIntro/getStandardSearchView.do?ksNo=KSD3504' },
          { label: '도로교통법 시행령 (적재 길이)', href: 'https://www.law.go.kr/법령/도로교통법시행령' },
          { label: '건축법 시행령 (공작물 축조신고)', href: 'https://www.law.go.kr/법령/건축법시행령' },
        ]}
      />

      <RebarClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>철근 규격 선택</strong> — D10~D51 (1m당 중량 자동 표시)</li>
          <li><strong>길이·본수 입력</strong> — 표준 6/8/10/12/13.7m 또는 직접</li>
          <li><strong>절단 로스율</strong> + <strong>결속선 자동 포함</strong> 설정</li>
          <li><strong>결과 확인</strong> — 총 중량·발주 권장·예상 단가·1본 무게</li>
        </ol>
      </div>
      <Callout tone="tip">
        <strong>중량→본수 탭</strong>에서 1톤·5톤 같은 목표 중량을 넣으면 규격별 본수 매트릭스가 나와 견적·발주에 바로 활용할 수 있습니다.
      </Callout>

      {/* 2. KS D 3504 */}
      <h2 className="g-h2">KS D 3504 이형 철근 규격·중량표</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          한국산업표준 KS D 3504는 콘크리트 보강용 이형 철근의 형상·치수·기계적 성질을 규정합니다.
          호칭의 D 뒤 숫자는 공칭 직경을 반올림한 값이며, 단위중량은 다음 공식으로 계산됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-s)', padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-sans)', lineHeight: 1.9 }}>
            단위중량 (kg/m) = 단면적(mm²) × <strong style={{ color: 'var(--accent-ink)' }}>7.85</strong> ÷ 1000<br />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted)' }}>
              (강의 밀도 7.85 g/cm³ 기준)
            </span>
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong>이형(異形)</strong>이라 부르는 이유는 표면에 마디(rib)가 있어 콘크리트와의 부착력을 높이기 때문</li>
          <li>표면이 매끈한 원형 철근(보통철근)은 별도 용도로만 사용</li>
        </ul>
      </div>
      <p className="g-p">
        아래 표는 계산기에 들어 있는 KS D 3504 공칭 치수 12규격을 그대로 옮긴 것입니다. &lsquo;검산&rsquo; 열은 단면적 × 0.00785로 다시 계산한 값입니다. KS 표준 단위중량은 유효숫자 3자리로 반올림한 값이라 검산값과 최대 0.2% 안팎(D41: 10.519 vs 10.50) 차이가 납니다. 1톤당 본수는 1,000kg을 채우는 데 필요한 본수(올림)입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={{ ...th, textAlign: 'left' }}>호칭</th>
              <th scope="col" style={th}>공칭 직경</th>
              <th scope="col" style={th}>단면적</th>
              <th scope="col" style={th}>단위중량</th>
              <th scope="col" style={th}>검산</th>
              <th scope="col" style={th}>6m 1본</th>
              <th scope="col" style={th}>12m 1본</th>
              <th scope="col" style={th}>1톤당 본수 (6m / 12m)</th>
            </tr>
          </thead>
          <tbody>
            {REBAR_SIZES.map((sz, i) => {
              const d = REBAR_DATA[sz]
              return (
                <tr key={sz} style={rowBg(i)}>
                  <th scope="row" style={{ ...td, textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>{sz}</th>
                  <td style={td}>{d.diameter}mm</td>
                  <td style={td}>{d.area.toLocaleString('ko-KR')}mm²</td>
                  <td style={{ ...td, fontWeight: 700 }}>{nf(d.weightPerM, 3)} kg/m</td>
                  <td style={{ ...td, color: 'var(--muted)' }}>{nf(d.area * 7.85 / 1000, 3)}</td>
                  <td style={td}>{nf(perPiece(sz, 6), 2)}kg</td>
                  <td style={td}>{nf(perPiece(sz, 12), 2)}kg</td>
                  <td style={td}>{weightToCount(1000, sz, 6)}본 / {weightToCount(1000, sz, 12)}본</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 3. 계산 예시 */}
      <h2 className="g-h2">계산 예시 — 도구 기본값으로 따라 하기</h2>
      <p className="g-p">
        계산기를 처음 열면 D13 · 6m · 100본 · 로스율 5% · 결속선 포함 · SD400 · 톤당 100만원이 들어 있습니다. 결과가 어떻게 나오는지 단계별로 풀면 다음과 같습니다.
      </p>
      <ol className="g-list">
        <li><strong>순중량</strong> — 0.995 kg/m × 6m × 100본 = <strong>{nf(EX_BASE, 1)}kg</strong></li>
        <li><strong>절단 로스 5%</strong> — {nf(EX_BASE, 1)} × 1.05 = <strong>{nf(EX_LOSS, 1)}kg</strong> (철근 발주 권장량)</li>
        <li><strong>결속선</strong> — 로스 포함 중량의 0.65% = {nf(EX_TIE, 1)}kg → 합계 <strong>{nf(EX_LOSS + EX_TIE, 1)}kg</strong></li>
        <li><strong>예상 금액</strong> — {nf(EX_LOSS / 1000, 3)}톤 × 100만원 × 1.00(SD400) = <strong>약 {nf(EX_PRICE, 1)}만원</strong> (결속선은 별도 품목이라 제외)</li>
      </ol>
      <p className="g-p">
        여기서 가장 흔한 실수는 도면의 부재 길이만 더하고 <strong>겹침이음·정착·후크 길이</strong>를 빼먹는 것입니다. 이 길이는 철근 지름과 콘크리트 강도에 따라 설계기준(KDS 14 20 52 정착·이음)으로 정해지고 구조도면에 표기되므로, 로스율로 퉁치지 말고 먼저 1본 길이나 본수에 반영해야 합니다. 로스율은 정척(6·8·12m)을 필요한 길이로 자르고 남는 자투리와 가공 실수를 흡수하는 여유분입니다. 또 가격 결과는 철근 자재비만의 추정이라 가공·운반·하역·결속 인건비는 따로 견적을 받아야 합니다.
      </p>

      {/* 4. 강도 등급 */}
      <h2 className="g-h2">SD300·SD400·SD500·SD600 강도 등급 차이</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          SD = Steel Deformed bar의 약자, 뒤 숫자는 <strong>항복강도(MPa)</strong>입니다.
          숫자가 클수록 더 강하고 비싸지만, 같은 부재라면 더 가는 굵기로도 충분합니다.
          등급이 달라도 단면적이 같으면 단위중량은 같으므로, 중량 계산에는 영향이 없고 가격에만 보정이 들어갑니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: 'SD300', d: '항복 300 MPa · 저층·소형', c: 'var(--muted)', p: '×0.95' },
            { t: 'SD400', d: '항복 400 MPa · 한국 일반 표준', c: 'var(--teal-600)', p: '×1.00' },
            { t: 'SD500', d: '항복 500 MPa · 대형·고층·교량', c: 'var(--amber-600)', p: '×1.10' },
            { t: 'SD600', d: '항복 600 MPa · 초고층·내진·플랜트', c: 'var(--pink-600)', p: '×1.20' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-s)', padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 6px', lineHeight: 1.6 }}>{g.d}</p>
              <p style={{ fontSize: 11, color: 'var(--accent-ink)', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>가격 보정 {g.p}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 일반 주택·공동주택은 <strong>SD400</strong>이 표준이며, 도면에 명시된 등급으로 발주해야 합니다. 가격 보정 배수는 이 계산기의 추정용 가정값입니다.
        </p>
      </div>

      {/* 5. 표준 길이 */}
      <h2 className="g-h2">철근 표준 길이 — 왜 6m·12m인가?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          한국 이형철근의 정척(표준 길이)은 <strong>6·7·8·9·10·11·12m</strong>(대표 정척 8m)이며,
          현장에서는 6·8·10·12m가 흔히 쓰입니다. <strong>13.7m</strong>는 수출·특수 주문용 장척입니다.
          길이가 결정되는 핵심 요인은 <strong>운반 차량</strong>과 <strong>현장 작업성</strong>입니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-s)', padding: '14px 16px', marginTop: 12 }}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
            <li><strong style={{ color: 'var(--text)' }}>6m</strong> — 소형 현장·셀프 시공 표준 (1톤 트럭은 법정 적재길이 약 5.6m라 허가 또는 절단 필요)</li>
            <li><strong style={{ color: 'var(--text)' }}>8m·10m</strong> — 2.5톤 이상, 중간 현장</li>
            <li><strong style={{ color: 'var(--text)' }}>12m</strong> — 5톤 카고 이상, 대형 현장 (자투리 적음·이음 줄음)</li>
            <li><strong style={{ color: 'var(--text)' }}>13.7m</strong> — 11톤 카고, 초대형·플랜트 (수출·특수 주문 장척)</li>
          </ul>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          긴 철근일수록 <strong>이음(겹침) 횟수가 줄어 강도가 좋아지고</strong>,
          현장 가공·결속 시간도 줄어들어 인건비를 절약할 수 있습니다. 다만 운반 비용이 올라갑니다.
        </p>
      </div>

      {/* 6. 운반 안전 */}
      <h2 className="g-h2">운반·하역 안전 가이드</h2>
      <p className="g-p">
        화물 적재 길이는 도로교통법 시행령 제22조에 따라 <strong>자동차 길이에 그 10분의 1을 더한 길이</strong>까지이고, 넘으면 출발지 관할 경찰서장의 허가가 필요합니다. 아래 표의 &lsquo;철근 길이&rsquo;는 이 계산기가 차종 매칭에 쓰는 현장 관행값이며, 최대 본수는 적재중량을 넘지 않도록 내림한 값입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={{ ...th, textAlign: 'left' }}>차종</th>
              <th scope="col" style={th}>적재중량</th>
              <th scope="col" style={th}>철근 길이 (관행)</th>
              <th scope="col" style={th}>D13 6m 최대</th>
              <th scope="col" style={th}>D25 6m 최대</th>
              <th scope="col" style={{ ...th, textAlign: 'left' }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {TRUCKS.map((t, i) => (
              <tr key={t.id} style={rowBg(i)}>
                <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{t.label}</th>
                <td style={td}>{nf(t.capacityKg)}kg</td>
                <td style={td}>~{t.maxLengthM}m</td>
                <td style={td}>{nf(maxBars(t.capacityKg, 'D13', 6))}본</td>
                <td style={td}>{nf(maxBars(t.capacityKg, 'D25', 6))}본</td>
                <td style={{ ...td, textAlign: 'left', whiteSpace: 'normal', color: 'var(--muted)', fontSize: 12, minWidth: 200 }}>{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="warn" title="굵은 철근은 인력 하역 금지">
        D29 이상은 1m당 5kg이 넘어 6m 1본만 30kg 이상입니다. 여러 본을 묶은 다발은 크레인·지게차로 내리고, 적재 시 앞뒤로 튀어나온 부분에는 표지를 달고 결박을 두 곳 이상 하세요.
      </Callout>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 인테리어 도구 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/interior/wire" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>⚡</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>전선 굵기·허용전류</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            KEC 2021 + 가전 12프리셋
          </p>
        </Link>
        <Link href="/tools/interior/pipe" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔧</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>배관 규격 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            A호칭·인치·DN + 6재질
          </p>
        </Link>
        <Link href="/tools/interior/screw" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔩</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>나사 규격 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            M·UNC·PT 규격 + 탭드릴·렌치 사이즈
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
