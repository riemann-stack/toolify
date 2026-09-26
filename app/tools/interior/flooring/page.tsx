import Link from 'next/link'
import FlooringClient from './FlooringClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { rollMetersToBuy, ROLL_TRIM_M } from './flooringUtils'

export const metadata = buildMetadata({
  path: '/tools/interior/flooring',
  title: '바닥재 계산기 — 마루·장판·데코타일 박스 수·비용',
  description: '장판·강화마루·강마루·원목마루·데코타일의 필요 박스 수와 자재비·시공비 견적 계산. 종류별 단가·내구성 비교표, 박스당 면적 가이드, 헤링본 등 시공 방식별 로스율과 셀프 시공 가능 여부까지 안내합니다.',
  keywords: ['바닥재계산기', '마루박스수', '강화마루소요량', '강마루계산', '장판소요량', '데코타일계산', '헤링본바닥재', '바닥재비용'],
})

const FAQ_LD = [
              {
                q: '강화마루와 강마루 차이가 뭐예요?',
                a: '<strong>강화마루</strong>는 HDF(고밀도 섬유판)에 멜라민 필름을 압착한 합성 마루로 가격이 저렴하고 스크래치에 강합니다. <strong>강마루</strong>는 합판 기재 위에 고압 멜라민(HPM) 표면재(주로 인쇄 무늬지)를 압착한 제품으로, 합판이라 치수 변화가 적어 바닥 난방에 잘 맞고 찍힘에도 강합니다. 합판 위에 천연 무늬목을 붙인 제품은 합판마루·원목마루로 따로 구분합니다. 가격은 강마루가 1.5~2배 비싸지만 거주감과 내구성에서 우수해 아파트 거실·아이방에서 가장 많이 선택됩니다.',
              },
              {
                q: '바닥재 1박스는 몇 평인가요?',
                a: '한국 시판 기준으로 <strong>강화마루 1박스 ≈ 2.4㎡ ≈ 0.73평</strong>, 강마루 1박스 ≈ 2.6㎡ ≈ 0.79평, 원목마루 1박스 ≈ 2.0㎡ ≈ 0.61평, 데코타일 1박스 ≈ 3.3㎡ ≈ 1평 정도입니다. 브랜드·시리즈마다 ±10% 차이가 있으므로 실제 구매 전 박스 표기 면적을 반드시 확인하세요.',
              },
              {
                q: '헤링본 시공은 왜 자재가 더 많이 필요한가요?',
                a: '헤링본은 <strong>V자 패턴으로 반복</strong>되어 짧은 자재가 많이 발생하고, 가장자리 절단 시 자투리가 평행 시공보다 2~3배 많이 나옵니다. 그래서 평행 대비 <strong>+10% 추가 자재</strong>(쉐브론은 +15%)를 권장합니다. 또한 시공 난이도가 높아 인건비도 평행 대비 <strong>+50% 정도 더 나옵니다</strong>. 디자인 효과는 좋지만 비용·자재 모두 여유 있게 잡으세요.',
              },
              {
                q: '장판은 셀프 시공이 가능한가요?',
                a: '네, <strong>장판은 셀프 시공 난이도가 가장 낮습니다</strong>. 폭 1.8m 또는 2.0m 롤 형태로 절단 후 본드 또는 양면테이프로 고정하면 됩니다. 단, 정확한 실측·재단·이음매 처리가 중요하며, 5평 이상은 두 사람이 작업하는 것이 안전합니다. 강마루·원목마루는 단차·접착 정밀도가 필요해 전문 시공을 권장합니다.',
              },
              {
                q: '바닥재 위에 다른 바닥재를 덧시공할 수 있나요?',
                a: '<strong>조건부로 가능합니다.</strong> 기존 바닥이 평탄하고(단차 3mm 이내) 들뜸·곰팡이가 없으면 데코타일·장판은 덧시공 가능합니다. 강화·강마루는 두께(8~12mm) 때문에 문턱·문 하단·콘센트 위치에 영향이 갈 수 있어 주의가 필요합니다. 가장 깨끗한 결과는 <strong>기존 바닥 철거 후 시공</strong>이지만, 비용 절감을 위해 덧시공도 많이 선택합니다.',
              },
            ]

/* ── 빌드 시 계산하는 가이드 수치 — FlooringClient와 같은 공식·기본값 (값을 바꾸면 양쪽을 함께 맞출 것) ── */
const PY = 3.3058                        // 1평(㎡) — 계산기와 동일
const BASE_LOSS = 0.10                   // 기본 로스율 10%
const ROLL_W = 1.8                       // 장판 롤 폭(m) — 계산기 기준
/** 박스·장 올림 — 계산기 ceilUnits와 동일(부동소수 오차 보정) */
const ceilUnits = (x: number) => Math.max(0, Math.ceil(x - 1e-9))
const won = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`

/* 평수별 박스 수 — 평행 시공·로스 10% · 박스 면적 강화 2.4 / 강마루 2.6 / 원목 2.0 / 데코타일 3.3㎡ */
const BOX_REF = [5, 7, 10, 15, 20, 25, 30, 35].map(p => {
  const a = p * PY
  const need = a * (1 + BASE_LOSS)
  return { p, a, s: ceilUnits(need / 2.4), k: ceilUnits(need / 2.6), o: ceilUnits(need / 2.0), d: ceilUnits(need / 3.3) }
})

/* 15평 강화마루 예시 — 간편 계산 기본값 그대로 */
const EX_AREA = 15 * PY
const EX_NEED = EX_AREA * (1 + BASE_LOSS)
const EX_BOX = ceilUnits(EX_NEED / 2.4)
const EX_HB_BOX = ceilUnits(EX_AREA * (1 + BASE_LOSS + 0.10) / 2.4)   // 헤링본 +10%p
const EX_CV_BOX = ceilUnits(EX_AREA * (1 + BASE_LOSS + 0.15) / 2.4)   // 쉐브론 +15%p

/* [비용 견적] 탭 기본값 — 강화마루 28,000원/㎡ · 본드·부자재 5,000원/㎡ · 몰딩 20m × 2,000원 · 보양 30,000원 · 전문 시공비 60,000원/평 */
const Q = (() => {
  const material = EX_BOX * 2.4 * 28000
  const adhesive = EX_AREA * 5000
  const molding = 20 * 2000
  const protect = 30000
  const labor = 15 * 60000
  return {
    material, adhesive, molding, protect, labor,
    self: material + adhesive + molding + protect,
    pro: material + adhesive + molding + labor,
    proHb: material + adhesive + molding + labor * 1.5,
  }
})()

/* 장판 폭 배치 예시 — 계산기와 같은 rollMetersToBuy(폭 1.8m, 로스 10%) vs 면적÷폭 단순 계산 */
const ROLL_ROWS = ([[3, 3], [3.7, 3], [4, 3.5], [5, 4], [6, 4]] as const).map(([w, l]) => {
  const r = rollMetersToBuy(w, l, ROLL_W, BASE_LOSS * 100)
  const naive = ceilUnits((w * l) / ROLL_W * (1 + BASE_LOSS))
  return { w, l, area: w * l, naive, strips: r.layout.strips, stripLen: r.layout.stripLenM, buy: r.buyM }
})
const ROLL_EX = ROLL_ROWS[1]   // 3.7 × 3m

export default function FlooringPage() {
  return (
    <ToolPage width={760} slug="/tools/interior/flooring">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />바닥재 계산기
      </h1>
      <p className="tp-lead">
        장판·강화마루·강마루·원목·데코타일 <strong style={{ color: 'var(--text)' }}>박스 수와 비용</strong> 견적.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="박스 면적은 국내 시판 대표값(강화 2.4㎡·강마루 2.6㎡·원목 2.0㎡·데코타일 3.3㎡ — 구매 전 박스 표기 확인) · 장판은 폭 1.8m 롤을 폭(줄) 단위로 배치 · 단가·시공비는 흔히 안내되는 대략적 범위(견적 시 재확인)"
        sources={[
          { label: '국가법령정보센터 — 실내공기질 관리법 시행규칙(바닥재·접착제 방출 기준)', href: 'https://www.law.go.kr/법령/실내공기질관리법시행규칙' },
        ]}
      />

      <FlooringClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 바닥재 종류별 비교 ── */}
        <div>
          <h2 className="g-h2">
            바닥재 종류별 비교
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '단가(㎡)', '내구', '방수', '추천 공간'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i <= 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '장판 (PVC)',       p: '8,000~15,000원',  d: '★★☆☆☆', w: '★★★★★', u: '전세·임대·예산형' },
                  { t: '강화마루',         p: '25,000~45,000원', d: '★★★★☆', w: '★★☆☆☆', u: '아파트 표준 (가성비)' },
                  { t: '강마루',           p: '40,000~70,000원', d: '★★★★☆', w: '★★★☆☆', u: '거실·아이방 (난방 OK)' },
                  { t: '원목마루',         p: '80,000~150,000원',d: '★★★★★', w: '★★☆☆☆', u: '프리미엄·자연 질감' },
                  { t: '데코타일 (LVT)',  p: '20,000~40,000원', d: '★★★★☆', w: '★★★★★', u: '주방·욕실·상가' },
                  { t: '도기/자기 타일',   p: '30,000~80,000원', d: '★★★★★', w: '★★★★★', u: '욕실·현관·발코니' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.w}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 단가는 2026년 기준, 온라인 자재몰·시공 플랫폼에서 통용되는 범위이며 지역·브랜드·등급에 따라 달라집니다.
          </p>
        </div>

        {/* ── 2. 한국 시판 박스 면적 ── */}
        <div>
          <h2 className="g-h2">
            한국 시판 박스 면적 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '강화마루', c: 'var(--accent)', items: [
                ['일반 박스', '약 2.4 ㎡'],
                ['두께', '8~12mm'],
                ['1박스 ≈', '0.73평'],
              ]},
              { t: '강마루', c: 'var(--yellow-700)', items: [
                ['일반 박스', '약 2.6 ㎡'],
                ['두께', '7~9mm'],
                ['1박스 ≈', '0.79평'],
              ]},
              { t: '원목마루', c: 'var(--amethyst)', items: [
                ['일반 박스', '약 2.0 ㎡'],
                ['두께', '14~21mm'],
                ['1박스 ≈', '0.61평'],
              ]},
              { t: '데코타일', c: 'var(--cyan-600)', items: [
                ['일반 박스', '약 3.3 ㎡'],
                ['두께', '3~5mm'],
                ['1박스 ≈', '1평'],
              ]},
              { t: '장판 (롤)', c: 'var(--emerald-600)', items: [
                ['폭', '1.8m / 2.0m'],
                ['길이', '미터 단위 절단'],
                ['두께', '1.8~4.5mm'],
              ]},
              { t: '도기 타일', c: 'var(--red-600)', items: [
                ['주력 사이즈', '60×60cm'],
                ['1장 면적', '0.36 ㎡'],
                ['1평 ≈', '약 9.2장'],
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
        </div>

        {/* ── 3. 시공 방식별 로스율 ── */}
        <div>
          <h2 className="g-h2">
            시공 방식별 로스율 (여유분)
          </h2>
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
            <div><span style={{ color: 'var(--muted)' }}>구매량</span> = 면적 × (1 + 기본 로스율 + 시공 추가율)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 기본 로스율(자투리·실측 오차) 5~15% + 시공 패턴별 추가 0~15%</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: 12 }}>
            {[
              { t: '평행 시공',   c: 'var(--emerald-600)',     v: '+0%', d: '벽과 평행하게 일자' },
              { t: '대각선 시공', c: 'var(--accent)', v: '+5%', d: '45° 기울여 시공' },
              { t: '헤링본',     c: 'var(--orange-600)',     v: '+10%', d: 'V자 반복 패턴' },
              { t: '쉐브론',     c: 'var(--red-600)',     v: '+15%', d: '대칭 V자 패턴' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${m.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: m.c, fontWeight: 700, marginBottom: 4 }}>{m.t}</p>
                <p style={{ fontSize: 22, fontFamily: 'var(--font-sans)', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{m.v}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            계산기는 박스형 자재(마루·데코타일)를 <strong>시공 면적 × (1 + 로스율 + 시공 추가율) ÷ 1박스 면적</strong>으로 나눈 뒤 소수점을 무조건 올립니다. 예를 들어 15평(약 {EX_AREA.toFixed(1)}㎡) 거실에 강화마루를 평행으로 깔면 {EX_AREA.toFixed(1)} × 1.10 = {EX_NEED.toFixed(1)}㎡ ÷ 2.4㎡ = {(EX_NEED / 2.4).toFixed(1)} → <strong>{EX_BOX}박스</strong>이고, 실제로 사게 되는 면적은 {EX_BOX} × 2.4 = {(EX_BOX * 2.4).toFixed(1)}㎡입니다. 같은 방을 헤링본으로 바꾸면 로스율이 20%가 되어 {EX_HB_BOX}박스, 쉐브론이면 25%로 {EX_CV_BOX}박스가 됩니다.
          </p>
          <p className="g-p">
            기본 로스율 10%는 벽 끝 자투리, 문틀·기둥 주변 따내기, 불량 판재 교체분을 감안한 값입니다. 방이 반듯한 직사각형이고 시공자가 숙련됐다면 5%로도 충분하지만, 방이 여러 개로 꺾이거나 붙박이장·기둥이 많으면 15%로 올리는 편이 안전합니다. 박스는 낱장으로 팔지 않는 경우가 많아 로스율을 1~2%p 낮춰도 박스 수가 그대로인 경우가 흔하니, 결과의 &lsquo;남는 면적&rsquo;을 함께 보세요.
          </p>
        </div>

        {/* ── 3-1. 장판(롤) 폭 배치 ── */}
        <div>
          <h2 className="g-h2">
            장판은 면적이 아니라 폭(줄) 단위로 계산
          </h2>
          <p className="g-p">
            롤 장판은 폭이 정해진 긴 두루마리라서 &lsquo;방 면적 ÷ 롤 폭&rsquo;으로 길이를 구하면 모자랄 때가 많습니다. 폭보다 조금이라도 넓은 부분은 한 줄을 통째로 더 깔아야 하기 때문입니다. 계산기는 방의 한 변에 롤을 몇 줄 놓아야 하는지(변 길이 + 재단 여유 {Math.round(ROLL_TRIM_M * 100)}cm를 1.8m로 나눠 올림)와 한 줄의 길이(다른 변 + {Math.round(ROLL_TRIM_M * 100)}cm)를 구하고, 가로·세로 두 방향 중 총길이가 짧은 쪽을 고른 뒤 로스율을 더해 미터 단위로 올립니다.
          </p>
          <p className="g-p">
            예컨대 {ROLL_EX.w}m × {ROLL_EX.l}m 방은 면적({ROLL_EX.area.toFixed(1)}㎡) 기준으로는 {ROLL_EX.naive}m면 될 것 같지만, 3.7m 변을 롤 폭으로 덮으려면 1.8m 폭이 3줄 필요해 낭비가 큽니다. 3m 변을 폭으로 덮으면 {ROLL_EX.strips}줄 × {ROLL_EX.stripLen.toFixed(1)}m로 끝나고, 로스 10%를 더하면 <strong>{ROLL_EX.buy}m</strong>를 사야 합니다. 이음매 위치(창에서 들어오는 빛 방향과 나란하게, 동선이 적은 쪽)를 미리 정해 두면 재단이 쉬워지고 이음매도 덜 보입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['방 크기', '면적', '면적÷폭 단순 계산', '폭 배치', '구매 권장'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLL_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.w}m × {r.l}m</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.area.toFixed(1)}㎡</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.naive}m</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.strips}줄 × {r.stripLen.toFixed(1)}m</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 700 }}>{r.buy}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 폭 1.8m 롤, 재단 여유 방향마다 10cm, 로스율 10% 기준(계산기 [간편 계산]의 장판과 같은 공식). &lsquo;면적÷폭 단순 계산&rsquo;은 같은 로스율을 적용해 올린 비교용 값입니다.
          </p>
        </div>

        {/* ── 4. 평수별 박스 수 빠른 참조 ── */}
        <div>
          <h2 className="g-h2">
            평수별 박스 수 빠른 참조 (평행 시공 +10% 기준)
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '면적(㎡)', '강화마루', '강마루', '원목마루', '데코타일'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOX_REF.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.p}평</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.a.toFixed(1)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.s}박스</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.k}박스</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.o}박스</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.d}박스</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 표준 박스 면적 기준(강화 2.4㎡ / 강마루 2.6㎡ / 원목 2.0㎡ / 데코타일 3.3㎡), 헤링본은 +10%, 쉐브론은 +15% 자재를 더 잡으세요(15평 강화마루면 헤링본 {EX_HB_BOX - EX_BOX}박스, 쉐브론 {EX_CV_BOX - EX_BOX}박스 추가)
          </p>
        </div>

        {/* ── 4-1. 접착식·비접착식과 바닥 난방 ── */}
        <div>
          <h2 className="g-h2">
            접착식·비접착식 시공과 바닥 난방
          </h2>
          <p className="g-p">
            같은 &lsquo;마루&rsquo;라도 까는 방식이 다릅니다. <strong>강화마루</strong>는 판재끼리 홈을 맞물려 끼우고 바닥에 완충재(폼)를 깐 뒤 그 위에 띄워 놓는 비접착식(플로팅) 시공이 일반적입니다. 본드가 거의 들지 않고 철거가 쉬운 대신, 바닥과 판재 사이에 공기층이 생겨 온돌 열이 늦게 올라오고 걸을 때 울림이 느껴질 수 있습니다. <strong>강마루·원목(합판)마루</strong>는 전용 본드로 바닥에 직접 붙이는 접착식이라 난방 열이 잘 전달되고 밀착감이 좋지만, 철거할 때 본드층까지 긁어내야 해 비용과 폐기물이 늘어납니다. 데코타일은 접착제로 붙이고, 롤 장판은 바닥에 얹어 깔고 이음매·가장자리만 고정하는 경우가 많습니다.
          </p>
          <p className="g-p">
            이 차이는 견적에도 그대로 반영됩니다. 계산기 [비용 견적] 탭의 &lsquo;본드·접착제 (1㎡당)&rsquo;은 접착식 기준 기본값이므로, 강화마루처럼 본드를 쓰지 않는 자재라면 그 칸에 완충재 가격을 넣거나 0으로 바꿔야 실제에 가깝습니다. 반대로 기존 바닥이 접착식 마루였다면 철거·바닥 평탄화 비용이 따로 붙는 경우가 많으니 견적서에 포함 여부를 확인하세요.
          </p>
          <p className="g-p">
            시공 직후 냄새는 판재보다 본드에서 나는 경우가 많습니다. 「실내공기질 관리법 시행규칙」은 바닥재와 접착제를 각각 따로 방출 기준 대상 품목으로 두고 있으므로(누구에게 의무인지는 <Link href="/tools/interior/wallpaper">도배 계산기</Link> 설명 참고), 접착식이라면 마루 판재의 등급만 보지 말고 본드의 친환경 표시·방출 등급도 따로 확인하세요. 시공 뒤에는 제품 설명서의 경화 시간 동안 본드가 굳을 때까지 창을 열어 환기합니다.
          </p>
        </div>

        {/* ── 5. 셀프 vs 전문 시공 비용 ── */}
        <div>
          <h2 className="g-h2">
            셀프 vs 전문 시공 비용 비교 (15평 강화마루 기준)
          </h2>
          <p className="g-p">
            아래 표는 계산기 [비용 견적] 탭을 기본값 그대로 두었을 때의 결과입니다. 자재비는 시공 면적이 아니라 <strong>실제로 사는 박스 수</strong>({EX_BOX}박스 = {(EX_BOX * 2.4).toFixed(1)}㎡) 기준이고, 본드·부자재는 시공 면적({EX_AREA.toFixed(1)}㎡) 기준입니다. 셀프 시공에는 보양재를, 전문 시공에는 평당 시공비를 더합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '계산 (기본값)', '셀프', '전문 시공'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i <= 1 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '자재비', f: `${EX_BOX}박스 × 2.4㎡ × 28,000원`, a: Q.material, b: Q.material },
                  { k: '본드·부자재', f: `${EX_AREA.toFixed(1)}㎡ × 5,000원`, a: Q.adhesive, b: Q.adhesive },
                  { k: '몰딩·걸레받이', f: '20m × 2,000원', a: Q.molding, b: Q.molding },
                  { k: '보양재', f: '일괄 30,000원', a: Q.protect, b: null },
                  { k: '전문 시공비', f: '15평 × 60,000원', a: null, b: Q.labor },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>{r.k}</th>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.f}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.a === null ? '—' : won(r.a)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.b === null ? '—' : won(r.b)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--border)' }}>
                  <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>합계</th>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>평당 {won(Q.self / 15)} / {won(Q.pro / 15)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>{won(Q.self)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>{won(Q.pro)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            헤링본 체크를 켜면 시공비만 1.5배가 되어 전문 시공 합계가 {won(Q.proHb)}로 오르고, [간편 계산]에서 시공 방식을 헤링본으로 바꾸면 자재도 {EX_HB_BOX}박스로 늘어납니다. 기존 바닥 철거·폐기물 처리, 문 하부 절단, 걸레받이 교체 인건비는 계산기에 들어 있지 않으니 업체 견적과 비교할 때 이 항목이 포함됐는지부터 맞춰 보세요. 셀프 시공은 시공비가 빠지는 대신 공구 구입·대여비와 2~3일의 작업 시간이 들고, 실수로 버리는 판재가 생기면 로스율을 넘기기 쉽습니다.
          </p>
          <Callout tone="tip" title="셀프 난이도">
            장판·데코타일은 셀프 도전이 가능한 편이지만, 강마루·원목마루는 바닥 단차 보정과 접착 정밀도가 결과를 좌우해 전문 시공을 권합니다.
          </Callout>
        </div>

        {/* ── 6. 바닥재 선택 가이드 ── */}
        <div>
          <h2 className="g-h2">
            바닥재 선택 가이드 (예산·내구성·디자인)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '예산형 (~평당 5만원)', c: 'var(--emerald-600)', items: ['장판 (PVC)', '저가 데코타일', '전세·임대·1~2년 거주'] },
              { t: '표준 (평당 8~15만원)', c: 'var(--accent)', items: ['강화마루', '강마루', '아파트 표준 선택'] },
              { t: '프리미엄 (평당 20만원~)', c: 'var(--amethyst)', items: ['원목마루', '대형 포세린 타일', '신축·자가·장기 거주'] },
              { t: '방수 필수 공간', c: 'var(--cyan-600)', items: ['도기/자기 타일', '데코타일 (LVT)', '욕실·주방·발코니'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                  {g.items.map((v, j) => (<li key={j}>{v}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 시공 시 주의사항 ── */}
        <div>
          <h2 className="g-h2">
            시공 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { t: '자재 적응 기간', d: '시공 전 자재 박스를 시공할 방에 24~48시간 두어 온·습도에 적응시켜야 변형이 적습니다.' },
              { t: '바닥 평탄도', d: '구조용 합판이나 셀프 레벨링 시공이 필요한 경우 비용·시간이 추가됩니다. 단차 3mm 이상은 보정 필수.' },
              { t: '몰딩·걸레받이', d: '바닥재 교체 시 몰딩 재시공이 필요할 수 있어 추가 비용을 미리 잡아두세요.' },
              { t: '난방 호환', d: '온수 난방은 강마루·강화마루 OK, 원목마루는 두께·재질 확인 필수. 장판은 모두 OK.' },
              { t: '환기', d: '본드·실리콘 시공 후 24시간 환기 필수. 새집증후군 예방.' },
              { t: '여유분 보관', d: '동일 로트(LOT) 자재 1박스는 보수용으로 남겨두세요. 추후 부분 교체 시 색·결 차이 방지.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            계산 단계에서 가장 흔한 실수는 <strong>분양 평수를 그대로 넣는 것</strong>입니다. 아파트의 &lsquo;32평형&rsquo; 같은 분양 평수는 계단·복도 같은 공용 면적이 포함된 공급면적이라 전용면적보다 20~30% 넓게 잡힙니다. 계산기에는 전용면적이나 방별 실측 가로×세로를 넣고, 발코니 확장부처럼 전용면적에 빠진 곳을 깔 계획이라면 [상세 계산]에서 따로 추가하세요. 평수 입력은 정사각형 한 공간으로 가정하므로 장판처럼 폭 배치가 중요한 자재는 실측 치수로 계산하는 편이 정확합니다.
          </p>
          <p className="g-p">
            붙박이장·주방 하부장 아래를 깔지 여부, 현관·욕실 문턱과의 높이 차이도 미리 확인하세요. 두께 8mm 안팎의 마루를 기존 바닥 위에 덧깔면 방문 하부가 걸려 문을 잘라야 할 수 있고, 장판에서 마루로 바꾸면 문턱과의 단차가 달라집니다. 마지막으로 박스 옆면의 로트(LOT) 번호가 모두 같은지 받는 즉시 확인해야 색·결 차이로 인한 재시공을 막을 수 있습니다.
          </p>
        </div>

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
              { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 계산기',         desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 계산기',       desc: '벽·천장 페인트 양' },
              { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈',       desc: '창문 사이즈로 추천 사이즈' },
              { href: '/tools/interior/lighting',      icon: '💡', name: '조명 밝기 계산기',           desc: '공간별 권장 루멘·조명 개수' },
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
