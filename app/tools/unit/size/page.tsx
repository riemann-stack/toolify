import Link from 'next/link'
import SizeClient from './SizeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import { SHOE_M, SHOE_F } from './sizeData'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'

export const metadata = buildMetadata({
  path: '/tools/unit/size',
  title: '사이즈 변환기 — 신발·옷·반지·모자 한국 사이즈 변환',
  description: 'US·EU·UK 신발·의류·속옷·반지·모자 사이즈를 한국 mm·호수로 변환. 나이키·자라 등 브랜드별 사이즈 성향과 아마존·ASOS 직구 실패 줄이는 측정 가이드 포함.',
  keywords: ['해외직구사이즈변환기', '신발사이즈변환', '의류사이즈US', '반지사이즈변환', '모자사이즈', '장갑사이즈', '벨트사이즈', '브라사이즈US', '아마존사이즈'],
})

/* ── 가이드 계산 예시 — 변환기와 같은 sizeData(신발)·같은 규칙(가장 가까운 행)으로 빌드 시 생성 ── */
const INCH_MM = 25.4
const BARLEYCORN_MM = INCH_MM / 3            // US·UK 신발 1치수 = 1/3인치
const PARIS_POINT_MM = 20 / 3                // EU 신발 1치수 = 2/3cm
const US_RING_0_MM = 11.63                   // US 반지 0호 안지름
const US_RING_STEP_MM = 0.032 * INCH_MM      // US 반지 1호당 안지름 증가 (0.032인치)
const HAT_EIGHTH_CM = (Math.PI * INCH_MM) / 8 / 10 // US 모자 1/8 사이즈 = 둘레 약 1cm
const usRingDia = (size: number) => US_RING_0_MM + US_RING_STEP_MM * size
const nearestShoe = (rows: typeof SHOE_M, mm: number) =>
  rows.reduce((best, r) => (Math.abs(r.kr - mm) < Math.abs(best.kr - mm) ? r : best), rows[0])
const EX_FOOT = 263
const EX_SHOE_M = nearestShoe(SHOE_M, EX_FOOT)
const EX_SHOE_F = nearestShoe(SHOE_F, EX_FOOT)
const EX_HEAD = 57
const EX_HAT_US = EX_HEAD / 2.54 / Math.PI
const EX_RING_US = 7
const EX_RING_DIA = usRingDia(EX_RING_US)
const EX_RING_CIRC = Math.PI * EX_RING_DIA

const SYSTEM_ROWS: { item: string; sys: string; basis: string; step: string }[] = [
  { item: '신발', sys: '한국 mm·일본 cm', basis: '발 길이를 그대로 — 몬도포인트(ISO 9407)와 같은 원리', step: '5mm' },
  { item: '신발', sys: 'US·UK', basis: '구두 골(라스트) 길이 기준, 바리콘(1/3인치) 단위', step: `${BARLEYCORN_MM.toFixed(2)}mm (반 치수 ${(BARLEYCORN_MM / 2).toFixed(2)}mm)` },
  { item: '신발', sys: 'EU', basis: '라스트 길이 기준, 파리 포인트(2/3cm) 단위', step: `${PARIS_POINT_MM.toFixed(2)}mm` },
  { item: '반지', sys: 'ISO 8653·유럽', basis: '반지 안쪽 둘레(mm)가 곧 호수', step: '둘레 1mm' },
  { item: '반지', sys: 'US', basis: `0호 안지름 ${US_RING_0_MM}mm에서 호수마다 안지름 0.032인치 증가`, step: `안지름 ${US_RING_STEP_MM.toFixed(2)}mm · 둘레 ${(Math.PI * US_RING_STEP_MM).toFixed(2)}mm` },
  { item: '모자', sys: 'US', basis: '머리 둘레(인치) ÷ π — 즉 머리를 원으로 본 지름', step: `1/8 = 둘레 ${HAT_EIGHTH_CM.toFixed(2)}cm` },
  { item: '브라', sys: '한국(KS)·일본(JIS)', basis: '밑가슴 둘레(cm) + 컵(가슴둘레 − 밑가슴둘레)', step: '밴드 5cm · 컵 2.5cm' },
  { item: '청바지', sys: 'US·한국 인치', basis: '허리 둘레 인치 (× 2.54 = cm)', step: '1인치 = 2.54cm' },
]

const FAQ_LD = [
              { q: '미국 신발 사이즈 9.5는 한국으로 몇 mm인가요?',
                a: '나이키 코리아 사이즈표 기준으로 남성 US 9.5는 한국 275mm, 여성 US 9.5는 265mm입니다. 같은 숫자라도 남성과 여성 기준이 달라 약 10mm 차이가 나므로 구매 시 성별 구분을 꼭 확인하세요.' },
              { q: '유럽 사이즈 EU 42는 한국 몇 mm인가요?',
                a: '나이키 남성 기준 EU 42는 한국 265mm(US 8.5)에 해당합니다. 유럽 사이즈는 브랜드에 따라 0.5~1 사이즈 정도 차이가 있을 수 있으므로 해당 브랜드의 공식 사이즈 가이드를 함께 확인하세요.' },
              { q: '아마존에서 US M 사이즈를 주문하면 한국 M이랑 같나요?',
                a: '미국 의류 M 사이즈는 한국 L(100) 사이즈와 비슷한 경우가 많습니다. 미국 브랜드는 한국보다 여유롭게 나오는 경향이라 한 사이즈 작게, 반대로 H&M·자라 같은 유럽 패스트패션은 작게 나오는 경향이라 한 사이즈 크게 주문하는 경우가 많습니다. 방향이 브랜드 성향에 따라 반대이므로, 본문의 브랜드별 사이즈 특징 표와 해당 상품의 실제 측정값(measurements)을 함께 확인하는 것이 가장 안전합니다.' },
              { q: '반지 사이즈를 모를 때 어떻게 측정하나요?',
                a: '종이를 손가락에 감아 표시 후 자로 길이(둘레)를 측정합니다. 둘레가 50mm면 한국 11호, US 약 5.5 정도입니다. 국제 표준 ISO 8653은 안쪽 둘레(mm)를 그대로 호수로 쓰고(유럽 표기와 같음), US 호수는 안지름을 기준으로 한 별도 체계입니다. 기존 반지의 안쪽 지름을 자로 재는 방법도 정확합니다 — 안지름 16mm = 한국 11호. 손가락이 부어 있을 수 있어 저녁 시간대 측정을 권장합니다.' },
              { q: '미국 모자 사이즈 7과 7 1/4는 한국으로?',
                a: '미국 모자 7은 머리 둘레 약 56cm(한국 M), 7 1/8은 약 57cm(M/L), 7 1/4는 약 58cm(L)입니다. 미국 모자 사이즈는 머리 둘레를 π(≈3.14)로 나눈 인치 값이라, 7인치 = 약 17.8cm × π ≈ 56cm로 환산됩니다.' },
              { q: '미국 브라 사이즈 34B는 한국 몇인가요?',
                a: '미국 34B = 한국 75B입니다. 미국 밴드 숫자는 밑가슴 인치를 그대로 쓴 값이 아니라 관행상 4~5 큰 호칭(밑가슴 약 73~77cm ≈ 29~30인치 → 34)이고, 한국은 밑가슴 cm 구간(72.5~77.5cm → 75)에 컵을 붙여 표기합니다. 75B = 밑가슴 75cm + B컵을 의미합니다. 컵 사이즈는 미국 DD = 한국 E처럼 일부 다르니 변환표를 확인하세요.' },
              { q: '청바지 인치 사이즈는 어떻게 변환하나요?',
                a: '청바지 인치는 허리 둘레를 인치로 표기한 것으로, 30인치 = 약 76cm = 한국 30 사이즈입니다. 인심(다리 길이)도 함께 표기되는 경우가 많아 "30/32"는 허리 30인치, 인심 32인치를 의미합니다. 인치 = cm × 0.394 또는 cm = 인치 × 2.54로 환산하세요.' },
              { q: '발볼이 넓으면 신발 사이즈를 어떻게 골라야 하나요?',
                a: '발 길이만 키우기보다 와이드(발볼 넓음) 옵션을 먼저 확인하세요. 미국 신발은 발볼 폭을 알파벳으로 표기합니다 — 남성 기준 D가 표준이고 2E(EE)·4E로 갈수록 넓어집니다. 뉴발란스·아식스 등은 같은 길이에 2E·4E 와이드 모델을 따로 판매합니다. 발볼 때문에 길이를 0.5~1 사이즈 키우면 뒤꿈치가 헐거워질 수 있어, 길이는 실측대로 두고 와이드 옵션을 고르는 편이 실패가 적습니다.' },
            ]

export default function SizePage() {
  return (
    <ToolPage width={760} slug="/tools/unit/size">
      <h1 className="tp-h1">
        <ToolIconBadge catId="unit" />사이즈 변환기
      </h1>
      <p className="tp-lead">
        US·EU·UK 의류·신발·속옷·반지를 <strong style={{ color: 'var(--text)' }}>한국 사이즈로</strong> + 브랜드별 차이 가이드.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="신발은 나이키 코리아 사이즈표, 반지는 ISO 8653(안쪽 둘레)·US 호수 규칙, 직구 면세는 관세청 안내 기준"
        sources={[
          { label: '나이키 코리아 남성 신발 사이즈표', href: 'https://www.nike.com/kr/size-fit/mens-footwear' },
          { label: '나이키 코리아 여성 신발 사이즈표', href: 'https://www.nike.com/kr/size-fit/womens-footwear' },
          { label: '사이즈코리아(국가기술표준원 인체치수조사)', href: 'https://sizekorea.kr/' },
          { label: '관세청 — 자가사용물품 면세 안내', href: 'https://www.customs.go.kr/call/ad/crmcc/selectFaqViewPage.do?mi=6822&cnslKnwlSrno=512' },
        ]}
      />

      {/* ── 국가별 사이즈 표기 차이 (상단 박스) ── */}
      <Callout tone="note" title="국가별 사이즈 표기 차이">
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li><strong>미국(US)</strong>: 신발은 작은 숫자(남성 6~12), 옷은 알파벳(XS·S·M·L·XL)</li>
          <li><strong>유럽(EU)</strong>: 신발은 큰 숫자(36~46), 옷은 짝수 숫자(36·38·40)</li>
          <li><strong>영국(UK)</strong>: 신발은 남성 US보다 0.5~1, 여성 US보다 2~2.5 작은 숫자 · 여성복은 짝수(4·6·8·10)</li>
          <li><strong>한국·일본</strong>: 신발은 발 길이 mm, 옷은 가슴·허리 둘레 cm 기반 — 가장 직관적</li>
        </ul>
      </Callout>

      <SizeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 카테고리별 측정 가이드 ── */}
        <div>
          <h2 className="g-h2">
            카테고리별 측정 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { icon: '👟', name: '신발',  tip: '종이 위에 발을 올리고 가장 긴 발가락 끝과 뒤꿈치 사이를 측정. 양쪽 발 중 더 긴 쪽 기준.' },
              { icon: '👕', name: '상의',  tip: '양팔을 자연스럽게 내리고 가슴의 가장 두꺼운 부분을 수평으로 측정.' },
              { icon: '👖', name: '하의',  tip: '배꼽 위 1~2cm, 허리의 가장 가는 부분을 수평으로 측정. 청바지 인치 = 허리 둘레의 인치.' },
              { icon: '👙', name: '브라',  tip: '밴드: 가슴 바로 아래 갈비뼈 둘레 / 컵: 가슴 가장 두꺼운 부분 둘레 - 밑가슴 둘레.' },
              { icon: '💍', name: '반지',  tip: '종이로 손가락을 감아 표시 후 펜으로 표시한 길이를 자로 측정. 관절을 통과해야 함.' },
              { icon: '🧢', name: '모자',  tip: '이마(눈썹 위 약 2cm)와 뒤통수의 가장 두꺼운 부분을 수평으로 측정.' },
              { icon: '🧤', name: '장갑',  tip: '엄지를 제외한 손등의 가장 두꺼운 부분(중지 시작점 부근)을 측정.' },
              { icon: '🪢', name: '벨트',  tip: '잘 맞는 바지의 허리 사이즈 + 5cm. 벨트 총 길이 = 허리 + 12~15cm.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{g.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700 }}>{g.name}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 1b. 사이즈 번호 체계 — 변환이 공식 하나로 안 되는 이유 ── */}
        <div>
          <h2 className="g-h2">
            사이즈 숫자는 어떻게 정해지나 — 체계별 원리
          </h2>
          <p className="g-p">
            나라마다 사이즈 숫자가 다른 건 <strong>재는 대상과 눈금 간격이 다르기 때문</strong>입니다. 한국 신발 mm는 발 길이를 그대로 적지만, US·UK·EU 신발 번호는 구두 골(라스트) 길이를 서로 다른 눈금으로 센 값입니다. 눈금 간격이 맞아떨어지지 않으니 한 줄짜리 공식으로는 정확히 환산되지 않고, 이 변환기도 공식 대신 <strong>브랜드 사이즈표를 그대로 옮긴 기준표</strong>에서 가장 가까운 행을 찾아 보여 줍니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['품목', '체계', '숫자의 뜻', '한 단계 간격'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SYSTEM_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.item}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.sys}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r.basis}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12 }}>{r.step}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="g-h3">계산 예시 — 변환기와 같은 규칙</h3>
          <ul className="g-list">
            <li>
              <strong>신발</strong>: 발 길이 {EX_FOOT}mm를 넣으면 변환기는 기준표에서 가장 가까운 {EX_SHOE_M.kr}mm 행을 고릅니다 — 남성 US {EX_SHOE_M.us}·UK {EX_SHOE_M.uk}·EU {EX_SHOE_M.eu}, 여성은 같은 {EX_SHOE_F.kr}mm가 US {EX_SHOE_F.us}입니다. 한국 5mm 한 칸은 US 반 치수({(BARLEYCORN_MM / 2).toFixed(2)}mm)보다 조금 크고 EU 한 치수({PARIS_POINT_MM.toFixed(2)}mm)의 약 3/4이라, 표를 따라 내려가면 EU 숫자가 0.5씩 오르다 가끔 1씩 뜁니다.
            </li>
            <li>
              <strong>모자</strong>: 머리 둘레 {EX_HEAD}cm ÷ 2.54 ÷ π = {EX_HAT_US.toFixed(2)} → 가장 가까운 1/8 단위인 US 7 ⅛. 영국 모자 번호는 같은 머리에 1/8 작은 숫자(7)를 씁니다.
            </li>
            <li>
              <strong>반지</strong>: US {EX_RING_US}호는 안지름 {US_RING_0_MM} + {US_RING_STEP_MM.toFixed(4)} × {EX_RING_US} = {EX_RING_DIA.toFixed(2)}mm, 둘레는 π × 안지름 = {EX_RING_CIRC.toFixed(1)}mm라 ISO·유럽 호수로 약 {EX_RING_CIRC.toFixed(1)}(변환기 표의 EU 54.5)입니다. 변환기의 한국 14호(안지름 17.3mm·둘레 54.4mm)와 맞아떨어집니다.
            </li>
            <li>
              <strong>브라</strong>: 밑가슴 73cm·가슴 85.5cm면 밴드는 72.5~77.5cm 구간이라 75, 차이 12.5cm는 B컵 → 한국 75B = US 34B. US 밴드 숫자(34)는 밑가슴을 인치로 바꾼 값(73cm ≈ 28.7인치)이 아니라 관행상 4~5 큰 숫자라, cm를 인치로 직접 환산하면 두 치수 이상 틀립니다. 컵 간격 2.5cm(AA 7.5cm부터)는 한국 KS·일본 JIS 방식이고, 유럽 규격(EN 13402-3)은 컵을 2cm 간격으로 나눠 같은 알파벳이라도 기준 차이가 다를 수 있으니 유럽 브랜드는 그 브랜드의 cm 표로 확인하세요.
            </li>
          </ul>
          <p className="g-note">
            한국 의류 치수 규격(KS)은 국가기술표준원이 주기적으로 실시하는 한국인 인체치수조사(사이즈코리아) 결과를 반영해 개정됩니다. 여성복의 44·55·66은 1980년대 초 국가 규격의 옛 호칭이 관행으로 남은 것이라, 같은 55라도 브랜드마다 실측이 다를 수 있습니다 — 호칭보다 가슴·허리 둘레 cm를 비교하는 편이 정확합니다.
          </p>
        </div>

        {/* ── 2. 직구 사이트별 사이즈 가이드 위치 ── */}
        <div>
          <h2 className="g-h2">
            주요 직구 사이트별 사이즈 가이드 위치
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['사이트', '사이즈 가이드 위치', '치수 단위'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '아마존',    p: '상품 페이지 "Size Chart"',    u: '인치/US' },
                  { n: 'ASOS',     p: '상품 페이지 "Size Guide"',    u: 'cm·인치' },
                  { n: '자라',      p: '"사이즈 가이드" 버튼',         u: 'cm 직접 표시' },
                  { n: 'H&M',      p: '제품 옆 "Size guide"',         u: 'cm 직접 표시' },
                  { n: '나이키',    p: '제품 페이지 "Size Guide"',     u: 'US·EU·CM' },
                  { n: '아디다스',   p: '"Size Guide" 링크',           u: 'US·UK·EU' },
                  { n: '쇼피파이몰', p: '상품 설명 또는 별도 페이지',   u: '브랜드별 다름' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12 }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 위치·단위는 작성 시점(2026년) 참고값이며 사이트 개편에 따라 바뀔 수 있습니다. 반품 조건(무료 여부·기간·반품 배송비 부담)은 국내 법인몰 주문인지 해외 배송 주문인지, 회원 등급·상품군에 따라 크게 달라지므로 이 표에 싣지 않았습니다 — 주문 전 각 사이트의 반품 정책 페이지를 직접 확인하세요.
          </p>
        </div>

        {/* ── 3. 브랜드별 사이즈 특징 ── */}
        <div>
          <h2 className="g-h2">
            브랜드별 사이즈 특징 (참고)
          </h2>
          <p className="g-note" style={{ marginBottom: 12 }}>
            ※ 브랜드 사이즈 성향은 <strong style={{ color: 'var(--text)' }}>일반적 경향</strong>일 뿐 제품·시즌·라인별로 다릅니다. 항상 <strong style={{ color: 'var(--text)' }}>해당 상품의 공식 실측표(measurements)</strong>를 우선 확인하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '브랜드', '사이즈 성향·표기'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '신발', n: '나이키',   d: '위 변환표의 기준 브랜드 — 모델마다 발볼 차이가 있어 후기 확인 권장' },
                  { k: '신발', n: '아디다스', d: 'mm·US는 나이키와 같고 UK 표기만 0.5 큰 편 (250mm = UK 6.5)' },
                  { k: '신발', n: '컨버스',   d: '약 0.5 크게 나오는 편 — 평소보다 0.5 작게 고르는 경우가 많음' },
                  { k: '신발', n: '닥터마틴', d: 'UK 사이즈 표기 — 남성 US보다 숫자가 1 작음 (US 9 = UK 8)' },
                  { k: '신발', n: '뉴발란스', d: 'US 표준, 같은 길이에 와이드(2E·4E) 모델 별도' },
                  { k: '신발', n: '버켄스탁', d: 'EU 사이즈 표기 — 레귤러·내로우 폭을 따로 고름' },
                  { k: '의류', n: '유니클로', d: '한국 사이즈와 거의 같음 (정사이즈)' },
                  { k: '의류', n: '아디다스', d: '한국과 비슷' },
                  { k: '의류', n: 'H&M·자라', d: '작게 나오는 편 — 한 사이즈 크게 고르는 경우가 많음' },
                  { k: '의류', n: 'GAP',      d: '약간 큰 편 — 정사이즈 또는 한 사이즈 작게' },
                  { k: '의류', n: 'ASOS',     d: '입점 브랜드별 편차 큼 — 상품별 실측값 확인 필수' },
                ].map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: 12 }}>{b.k}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700 }}>{b.n}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{b.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 국가별 옷 사이즈 비교표 (남/여 분리) ── */}
        <div>
          <h2 className="g-h2">
            국가별 옷 사이즈 비교표
          </h2>

          <h3 className="g-h3">남성 상의</h3>
          <div className="tableScroll" style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국', 'US', 'EU', 'UK', '가슴(cm)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: '90 (S)',   u: 'XS',  e: '44', uk: '34', c: '88-92' },
                  { kr: '95 (M)',   u: 'S',   e: '46', uk: '36', c: '92-96' },
                  { kr: '100 (L)',  u: 'M',   e: '48', uk: '38', c: '96-100' },
                  { kr: '105 (XL)', u: 'L',   e: '50', uk: '40', c: '100-104' },
                  { kr: '110 (XXL)',u: 'XL',  e: '52', uk: '42', c: '104-108' },
                  { kr: '115 (XXXL)',u: 'XXL', e: '54', uk: '44', c: '108-112' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.e}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">여성 상의</h3>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국', 'US', 'EU', 'UK', '가슴(cm)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: '44', u: '0',  e: '32', uk: '4',  c: '78-82' },
                  { kr: '55', u: '2',  e: '34', uk: '6',  c: '82-86' },
                  { kr: '66', u: '4',  e: '36', uk: '8',  c: '86-90' },
                  { kr: '77', u: '6',  e: '38', uk: '10', c: '90-94' },
                  { kr: '88', u: '8',  e: '40', uk: '12', c: '94-98' },
                  { kr: '99', u: '10', e: '42', uk: '14', c: '98-104' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.e}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 신발 사이즈 핵심 변환표 ── */}
        <div>
          <h2 className="g-h2">
            신발 사이즈 핵심 변환표
          </h2>
          <p className="g-p">
            위 변환기와 동일한 기준값(나이키 코리아 사이즈표)입니다. 같은 mm라도 남성·여성 US 표기가 다르다는 점에 주의하세요 — 예: 240mm는 남성 US 6, 여성 US 7입니다.
          </p>

          <h3 className="g-h3">남성 신발 (240~290mm)</h3>
          <div className="tableScroll" style={{ marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국 (mm)', 'US', 'UK', 'EU'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHOE_M.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.us}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.eu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">여성 신발 (220~265mm)</h3>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국 (mm)', 'US', 'UK', 'EU'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHOE_F.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.us}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.eu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 위 표는 본 변환기의 기준값이며, 브랜드에 따라 0.5~1 사이즈 차이가 날 수 있습니다. 본문의 브랜드별 사이즈 특징을 함께 확인하세요.
          </p>
        </div>

        {/* ── 6. 반지 호수 요약 ── */}
        <div>
          <h2 className="g-h2">
            반지 호수 요약표
          </h2>
          <p className="g-p">
            한국 호수는 반지 안쪽 둘레·안지름에 번호를 붙인 관행 체계이고, US 호수는 안지름 기준의 미국식 체계, 국제 표준 ISO 8653은 안쪽 둘레(mm)를 그대로 호수로 씁니다(유럽 표기와 같음). 대표 호수만 추린 요약표로, 짝수 호수와 UK·EU·일본 표기는 위 변환기에서 확인할 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국 호수', '내경 (mm)', '둘레 (mm)', 'US'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: '7호',  inner: '14.5', circ: '45.5', us: '3.5'   },
                  { kr: '9호',  inner: '15.3', circ: '48.0', us: '4.5'   },
                  { kr: '11호', inner: '16.0', circ: '50.3', us: '5.5'   },
                  { kr: '13호', inner: '17.0', circ: '53.4', us: '6.5'   },
                  { kr: '15호', inner: '17.5', circ: '55.0', us: '7.25'  },
                  { kr: '17호', inner: '18.0', circ: '56.5', us: '7.75'  },
                  { kr: '19호', inner: '18.5', circ: '58.1', us: '8.5'   },
                  { kr: '21호', inner: '19.0', circ: '59.6', us: '9'     },
                  { kr: '23호', inner: '19.8', circ: '62.0', us: '10'    },
                  { kr: '25호', inner: '20.2', circ: '63.4', us: '10.5'  },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.inner}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.circ}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 손가락 둘레는 하루 중에도 변합니다. 저녁 시간대에, 관절을 통과하는 굵기까지 감안해 측정하세요.
          </p>
        </div>

        {/* ── 7. 직구 실패 줄이기 팁 ── */}
        <div>
          <h2 className="g-h2">
            해외 직구 사이즈 실패 줄이는 5가지 방법
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '브랜드 공식 측정값(measurements) 확인', d: '단순 사이즈 라벨(M/L)이 아닌 실제 cm 측정값을 비교하세요.' },
              { n: '②', t: '반품 조건을 주문 전에 확인',          d: '같은 브랜드라도 국내 법인몰 주문과 해외 배송 주문은 반품 방법이 다릅니다. 해외 배송분은 반품 배송비를 구매자가 내는 경우가 많습니다.' },
              { n: '③', t: '사이즈 후기 검색',                    d: '"이 사이즈는 작게/크게 나온다"는 한국 후기를 먼저 확인.' },
              { n: '④', t: '애매하면 실측표의 여유분으로 판단',   d: '가슴둘레가 두 사이즈 경계에 걸리면 변환기처럼 큰 쪽을 고르는 편이 안전합니다. H&M·자라처럼 작게 나오는 브랜드는 한 사이즈 크게 고르는 사람이 많습니다.' },
              { n: '⑤', t: '본인 사이즈를 cm로 정확히 측정',       d: '발 길이·가슴·허리·머리 둘레 등 핵심 측정값을 메모해 두면 실패 확률 급감.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--accent)', fontWeight: 800 }}>{s.n}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{s.t}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0, marginLeft: 28 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 직구 반품·면세 실전 ── */}
        <div>
          <h2 className="g-h2">
            직구 반품·면세 실전
          </h2>
          <p className="g-p">
            사이즈가 애매할 때 두 사이즈를 함께 주문해 하나를 반품하는 경우가 많은데, 이때 면세 한도와 반품 정책을 미리 알아두면 낭패를 줄일 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '면세 한도 — 150달러 (미국발 200달러)', d: '물품가격 기준 미화 150달러 이하(미국발 물품은 200달러 이하)의 자가사용물품은 관세·부가세 없이 통관됩니다 (관세법 제94조 소액물품 면세, 관세청 안내).' },
              { n: '②', t: '한도를 넘으면 전체가 과세', d: '150달러를 초과하면 초과분만이 아니라 물품가격 전체 기준으로 세금이 부과됩니다 (관세청 안내). 예상 세액은 아래 관부가세 계산기로 미리 계산해 보세요.' },
              { n: '③', t: '목록통관 배제 품목 혼재 주의', d: '기준 금액 이하 자가사용물품은 특송업체의 통관목록 제출만으로 수입신고가 생략되지만, 건강기능식품 등 목록통관 배제 품목이 하나라도 섞이면 그 화물 전체가 목록통관에서 배제됩니다. 이때 물품가격에는 발송 국가에서 부과된 세금·현지 운임·보험료가 포함됩니다 (「특송물품 수입통관 사무처리에 관한 고시」 제8조).' },
              { n: '④', t: '반품 정책은 주문 전에 확인', d: '사이즈 실패로 반품·재주문할 계획이라면 해당 사이트의 반품 정책(무료 여부·기간·반품 배송비)을 주문 전에 확인하세요. 해외 반품 배송비가 물품가보다 커지는 경우도 있고, 이미 관부가세를 낸 물품을 반품했다면 요건을 갖춰 관세청에 환급을 신청해야 돌려받을 수 있습니다.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--accent)', fontWeight: 800 }}>{s.n}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{s.t}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0, marginLeft: 28 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            관세·부가세가 얼마나 나올지는{' '}
            <Link href="/tools/life/customs" style={{ color: 'var(--accent-ink)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}>관부가세 계산기</Link>
            에서 품목별로 계산할 수 있습니다.
          </p>
          <p className="g-note">
            ※ 2026년 7월 관세청 고객지원 FAQ 기준. 미국발 200달러 기준이 배송 경로(특송·우편)별로 어떻게 적용되는지 등 세부 조건은{' '}
            <a href="https://www.customs.go.kr/call/ad/crmcc/selectFaqViewPage.do?mi=6822&cnslKnwlSrno=512" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>관세청 안내 ↗</a>
            에서 직접 확인하세요.
          </p>
        </div>

        {/* ── 9. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/converter',  icon: '📐', name: '단위 변환기',     desc: '길이·무게·온도 통합 변환' },
              { href: '/tools/life/packing',    icon: '🧳', name: '여행 짐 체크리스트', desc: '해외여행 준비물·옷 관리' },
              { href: '/tools/health/bmi',      icon: '💪', name: 'BMI 계산기',     desc: '체형 파악으로 사이즈 가늠' },
              { href: '/tools/life/unit-price', icon: '💰', name: '단가 비교 계산기', desc: '직구 가격·국내 가격 비교' },
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
