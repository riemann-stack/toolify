import Link from 'next/link'
import ResidualValueClient from './ResidualValueClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { PRODUCT_ITEMS, LAUNDRY_ITEMS, LAUNDRY_RATES, LAUNDRY_BOUNDS, calcProduct, calcLaundry } from './residualData'

export const metadata = buildMetadata({
  path: '/tools/life/residual-value',
  title: '잔존가치·보상액 계산기 — 소비자분쟁해결기준',
  description: '고장·분실·세탁사고 배상액을 소비자분쟁해결기준(공정위 고시)으로 계산 — 가전 정액감가 잔존가치 + 10% 가산, 세탁물 배상비율표(95~10%)·품목별 내용연수.',
  keywords: [
    '소비자분쟁해결기준 계산', '감가상각 잔존가치', '세탁소 옷 배상', '세탁물 배상비율표',
    '가전 수리불가 환불', '휴대폰 내용연수', '수리 분실 보상', '소비자원 배상 기준',
  ],
})

/* ── 가이드 예시·표 — 계산기와 같은 residualData 함수로 빌드 시 계산 (화면 결과와 항상 일치) ── */
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`
const yearsOf = (id: string, list: { id: string; years: number }[]) => list.find(i => i.id === id)!.years
const LAPTOP_Y = yearsOf('laptop', PRODUCT_ITEMS)
const WASHER_Y = yearsOf('washer', PRODUCT_ITEMS)
const EX_LAPTOP = calcProduct(1_500_000, LAPTOP_Y, 27, 'noParts')!
const EX_WASHER = calcProduct(900_000, WASHER_Y, 90, 'noParts')!
const SNEAKER_Y = yearsOf('sneakers', LAUNDRY_ITEMS)
const SHIRT_Y = yearsOf('shirt', LAUNDRY_ITEMS)
const EX_SNEAKER = calcLaundry(150_000, SNEAKER_Y, 100)!
const EX_SHIRT = calcLaundry(80_000, SHIRT_Y, 400)!
const LAUNDRY_YEARS = [1, 2, 3, 4, 5, 6] as const
/** 배상비율표 셀 — i번째 비율이 적용되는 사용일수 구간 */
const laundryRange = (y: number, i: number) => {
  const b = LAUNDRY_BOUNDS[y]
  if (i >= b.length) return `${(b[b.length - 1] + 1).toLocaleString('ko-KR')}일~`
  const lo = i === 0 ? 0 : b[i - 1] + 1
  return `${lo.toLocaleString('ko-KR')}~${b[i].toLocaleString('ko-KR')}일`
}
const thS: React.CSSProperties = { padding: '9px 10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const tdS: React.CSSProperties = { padding: '8px 10px', textAlign: 'right', color: 'var(--text)', fontSize: 12, whiteSpace: 'nowrap' }

const FAQ_LD = [
  {
    q: '소비자분쟁해결기준은 법적 강제력이 있나요?',
    a: '아니요. 소비자기본법 제16조 제3항에 따라 <strong>당사자 사이에 별도 의사표시가 없는 경우에 한한 합의·권고의 기준</strong>입니다. 사업자가 반드시 따라야 하는 법은 아니지만, 1372 소비자상담센터·한국소비자원 피해구제·소비자분쟁조정위원회가 이 기준으로 조정하기 때문에 실무에서는 사실상의 표준으로 작동해요. 특약이 있으면 특약이, 다른 법령에 소비자에게 더 유리한 기준이 있으면 그 기준이 우선합니다.',
  },
  {
    q: '잔존가치는 어떻게 계산하나요?',
    a: '고시 원문 그대로 <strong>정액법 + 월할 계산</strong>입니다: 감가상각비 = (사용연수 ÷ 내용연수) × 구입가, 잔존가치(잔여금) = 구입가 − 감가상각비. 예를 들어 100만원짜리 스마트폰(내용연수 4년)을 2년 쓰면 잔여금은 50만원이에요. 내용연수가 다 지나면 잔여금은 0원이 되지만, 아래 10% 가산 조항이 적용되는 유형이라면 최소 구입가의 10%는 받을 수 있습니다.',
  },
  {
    q: '"구입가의 10% 가산"은 언제 받나요?',
    a: '<strong>품질보증기간은 지났지만 부품보유기간 이내</strong>에 ① 수리용 부품이 없어 수리가 불가능하거나 ② 사업자가 수리 의뢰품을 분실한 경우, &lsquo;정액감가 잔여금 + 구입가의 10%&rsquo;를 환급받습니다(한도: 구입가). 수리 의뢰 후 1개월 넘게 인도하지 못한 경우도 같은 방식이에요. 언제나 최소 10%를 보장하는 일반 조항은 아니고, 이 유형들에 한정된 가산입니다. 보증기간 이내라면 감가 없이 교환 또는 구입가 전액 환급이 원칙입니다.',
  },
  {
    q: '내용연수는 어디서 정해지나요? TV가 7년 아니었나요?',
    a: '현행 고시의 내용연수는 <strong>부품보유기간과 통일</strong>되어 있습니다(2016년 개정) — 사업자가 품질보증서에 표시한 부품보유기간을 쓰되, 그보다 짧거나 미기재면 별표Ⅲ의 부품보유기간을 적용해요. 그래서 <strong>TV·냉장고 9년, 에어컨·보일러 8년, 세탁기 7년, 노트북·스마트폰 4년</strong>이 현행 기준입니다. 웹에 떠도는 &lsquo;TV 7년·스마트폰 3년&rsquo; 표는 폐지된 옛 별표Ⅳ 수치이니 주의하세요. 별표에 없는 품목(가구·안경 등)은 유사품목을 준용하고, 그것도 어려우면 5년이 기본값입니다.',
  },
  {
    q: '세탁소에서 옷을 망가뜨렸어요 — 얼마나 배상받나요?',
    a: '<strong>배상액 = 구입가격 × 배상비율</strong>입니다. 배상비율은 품목의 내용연수(정장 동복 4년, 와이셔츠 2년, 운동화 1년 등)와 사용일수(구입일~세탁 의뢰일, 착용 여부 무관)로 표에서 정해지며 <strong>95%에서 10%까지 11단계</strong>예요. 예: 60만원짜리 동복 정장(내용연수 4년)을 1년 쓰고 맡겼다가 손상되면 사용 365일 → 배상비율 60% → 36만원. 고객 책임이 섞여 있으면 그만큼 공제될 수 있고, 손상된 옷을 돌려받길 원하면 배상액이 일부 감액될 수 있습니다.',
  },
  {
    q: '영수증이 없으면 배상을 못 받나요?',
    a: '세탁물은 <strong>구입가격·구입일을 입증하지 못하면 배상액을 세탁요금의 20배</strong>로 정하는 규정이 있어요(예: 세탁비 8,000원이면 16만원). 그래서 고가 의류일수록 영수증·카드내역을 보관하는 게 유리합니다. 일반 물품의 환급액은 영수증 등에 적힌 가격이 기준이고, 영수증이 없으면 그 지역 통상 가격을 기준으로 합니다. 세탁물 인수증을 안 써줬다면 분실 책임은 세탁업소가 집니다.',
  },
  {
    q: '실제 분쟁은 어디에 신청하나요?',
    a: '① 국번 없이 <strong>1372 소비자상담센터</strong>(공정위 운영)에서 상담 → ② 해결되지 않으면 <strong>한국소비자원 피해구제</strong> 신청 → ③ 합의가 안 되면 <strong>소비자분쟁조정위원회 조정</strong>으로 이어집니다. 조정까지 무료이고, 이 계산기의 기준이 그대로 조정 기준으로 쓰여요. 다만 조정도 강제력은 제한적이라 최종적으로는 민사 절차가 남습니다 — 소액이라면 소액사건심판도 선택지예요.',
  },
]

const RELATED = [
  { href: '/tools/life/customs', icon: '📦', name: '관부가세 계산기', desc: '직구 세금·면세 한도' },
  { href: '/tools/life/unit-price', icon: '🏷️', name: '단가 비교 계산기', desc: '실질 단가 비교' },
  { href: '/tools/life/laundry-dry', icon: '🧺', name: '빨래 건조 시간', desc: '소재별 건조 조합' },
  { href: '/tools/interior/dehumidifier', icon: '💧', name: '제습기 용량 계산기', desc: '평수별 제습 용량' },
  { href: '/tools/finance/severance', icon: '💼', name: '퇴직금 계산기', desc: '근속·평균임금 산정' },
  { href: '/tools/life/gift-money', icon: '🧧', name: '축의금 계산기', desc: '관계별 적정 금액' },
]

export default function ResidualValuePage() {
  return (
    <ToolPage width={760} slug="/tools/life/residual-value">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />잔존가치·보상액 계산기
      </h1>
      <p className="tp-lead">
        수리불가·분실·세탁사고, 얼마 받을 수 있을까? — <strong style={{ color: 'var(--text)' }}>소비자분쟁해결기준(공정위 고시) 원문 그대로</strong> 계산.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="소비자분쟁해결기준 — 공정거래위원회고시 제2025-14호 (2025.12.18. 시행) 별표Ⅱ·Ⅲ·Ⅳ 원문"
        sources={[
          { label: '국가법령정보센터', href: 'https://www.law.go.kr/행정규칙/소비자분쟁해결기준' },
          { label: '한국소비자원', href: 'https://www.kca.go.kr' },
          { label: '소비자기본법 (제16조·제58조·제67조)', href: 'https://www.law.go.kr/법령/소비자기본법' },
        ]}
      />

      <ResidualValueClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산식 */}
        <section>
          <h2 className="g-h2">고시 원문의 계산식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
            padding: '18px 20px', fontFamily: 'var(--font-mono)',
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1, overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}>감가상각비</span> = (사용연수 ÷ 내용연수) × 구입가 <span style={{ color: 'var(--muted)' }}>— 정액법·월할</span></div>
            <div><span style={{ color: 'var(--muted)' }}>잔여금</span> = 구입가 − 감가상각비</div>
            <div><span style={{ color: 'var(--muted)' }}>수리불가·분실 환급</span> = 잔여금 + 구입가×10% <span style={{ color: 'var(--muted)' }}>(한도: 구입가)</span></div>
            <div><span style={{ color: 'var(--muted)' }}>세탁물 배상</span> = 구입가 × 배상비율(95~10%, 일할)</div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginTop: 12 }}>
            같은 고시 안에서도 <strong style={{ color: 'var(--text)' }}>가전·공산품은 월 단위 정액감가</strong>,
            <strong style={{ color: 'var(--text)' }}> 의류·신발·가방·세탁물은 일 단위 배상비율표</strong>로 방식이 완전히 다릅니다 —
            의복류의 보증기간 경과 후 환급 감가도 배상비율표를 준용해요. 이 계산기가 두 트랙을 나눈 이유입니다.
          </p>
        </section>

        {/* 2. 내용연수 표 */}
        <section>
          <h2 className="g-h2">품목별 내용연수 (별표Ⅲ 부품보유기간)</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['내용연수', '품목'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['9년', 'TV · 냉장고'],
                  ['8년', '에어컨 · 보일러 · 자동차'],
                  ['7년', '세탁기 · 의류건조기 · 의류관리기 · 전자레인지 · 정수기 · 가습기·제습기 · 청소기'],
                  ['6년', '전기압력밥솥 · 비데 · 오븐 · 믹서기 · 냉온수기 · 안마의자 · 캠코더'],
                  ['5년', '선풍기 · 난로 · 전기장판 · 카메라 · 내비게이션 · 헬스기구 · 골프채 · 기간 미정 품목 기본값'],
                  ['4년', '데스크탑 · 노트북 · 태블릿 · 스마트폰'],
                  ['3년', '전기면도기 · 전기조리기기 · 헤어드라이어'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', lineHeight: 1.6 }}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 현행 별표Ⅳ는 내용연수를 부품보유기간과 통일했습니다(2016년 개정). 사업자가 보증서에 더 긴 기간을 표시했다면 그 기간이 우선하고,
            표에 없는 품목(가구·안경 등)은 유사품목 준용 → 불가 시 5년입니다. 옛 고정 연수표(TV 7년 등) 인용 자료와 혼동하지 마세요.
          </p>
        </section>

        {/* 2-1. 계산 예시 */}
        <section>
          <h2 className="g-h2">계산 예시 — 같은 식, 다른 결과</h2>
          <p className="g-p">
            <strong>노트북 {won(1_500_000)}, {27}개월 사용, 보증기간이 끝난 뒤 수리 부품이 없다는 답을 받은 경우</strong> — 내용연수 {LAPTOP_Y}년({LAPTOP_Y * 12}개월) 중 27개월을 썼으므로
            감가상각비는 27/{LAPTOP_Y * 12} × {won(1_500_000)} = {won(EX_LAPTOP.depreciation)}, 잔여금은 {won(EX_LAPTOP.residual)}입니다.
            여기에 구입가의 10%({won(EX_LAPTOP.bonus)})를 더한 <strong>{won(EX_LAPTOP.payout)}</strong>이 기준상 환급액입니다.
            같은 제품이라도 보증기간 안에 수리가 불가능했다면 감가 없이 교환 또는 {won(1_500_000)} 전액 환급이 원칙이라, 고장 시점이 보증기간 안인지부터 확인해야 합니다.
          </p>
          <p className="g-p">
            <strong>세탁기 {won(900_000)}, 7년 6개월 사용 후 수리 의뢰품을 업체가 분실한 경우</strong> — 사용 기간이 내용연수 {WASHER_Y}년을 넘어 잔여금은 {won(EX_WASHER.residual)}이지만,
            부품보유기간 안이라면 10% 가산분 <strong>{won(EX_WASHER.payout)}</strong>은 받을 수 있습니다. 감가에 쓰는 사용 기간은 구입일부터 세지만
            부품보유기간은 사업자가 <strong>그 모델의 생산을 중단한 시점</strong>부터 세기 때문에, 오래 쓴 제품이라도 늦게까지 생산된 모델이면 아직 부품보유기간 안일 수 있습니다.
          </p>
          <p className="g-p">
            <strong>세탁물</strong>은 날짜로 셉니다. {won(150_000)}짜리 운동화(내용연수 {SNEAKER_Y}년)를 산 지 100일 만에 맡겼다가 손상되면 배상비율 {EX_SNEAKER.rate}% → <strong>{won(EX_SNEAKER.payout)}</strong>,
            {' '}{won(80_000)}짜리 셔츠(내용연수 {SHIRT_Y}년)를 400일 만에 맡겼다면 {EX_SHIRT.rate}% → <strong>{won(EX_SHIRT.payout)}</strong>입니다.
            실제로 몇 번 입었는지는 따지지 않고 구입일부터 세탁 의뢰일까지의 날수만 봅니다.
          </p>
        </section>

        {/* 2-2. 배상비율표 전체 */}
        <section>
          <h2 className="g-h2">세탁물 배상비율표 (내용연수 1~6년)</h2>
          <p className="g-p">
            계산기는 고른 품목의 표 한 줄만 보여 주므로, 여기에 고시의 배상비율표 전체를 옮겨 둡니다. 품목의 내용연수 열에서 사용일수가 들어가는 칸을 찾고, 그 줄 왼쪽의 배상비율을 구입가에 곱하면 됩니다.
            마지막 구간을 넘으면 아무리 오래 썼어도 10%가 하한입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <caption className="srOnly">세탁업 배상비율표 — 품목 내용연수별 사용일수 구간과 배상비율</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ ...thS, textAlign: 'left' }}>배상비율</th>
                  {LAUNDRY_YEARS.map(y => <th scope="col" key={y} style={thS}>내용연수 {y}년</th>)}
                </tr>
              </thead>
              <tbody>
                {LAUNDRY_RATES.map((rate, i) => (
                  <tr key={rate} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ ...tdS, textAlign: 'left', color: 'var(--accent-ink)', fontWeight: 700 }}>{rate}%</th>
                    {LAUNDRY_YEARS.map(y => <td key={y} style={tdS}>{laundryRange(y, i)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 사용일수 = 구입일 ~ 세탁 의뢰일. 세트 의류는 전체 가격 기준으로 계산한 뒤 상·하의는 상의 65%·하의 35%, 상·중·하의는 상의 55%·하의 35%·중의(조끼) 10%로 나누고, 구입가격을 입증하지 못하면 세탁요금의 20배를 배상액으로 합니다.
          </p>
        </section>

        {/* 2-3. 헷갈리는 부분 */}
        <section>
          <h2 className="g-h2">요구하기 전에 확인할 것</h2>
          <ul className="g-list">
            <li><strong>보증기간 안인가, 밖인가</strong> — 보증기간 안의 수리불가는 감가 없는 교환·환급, 밖이면 정액감가 잔여금(+조건부 10%)입니다. 보증서·영수증에 적힌 구입일(또는 인도일)이 기준이 됩니다.</li>
            <li><strong>&lsquo;부품이 없다&rsquo;는 말의 의미</strong> — 부품보유기간 안인데 부품이 없어 수리를 못 한다면 사업자가 부품을 갖추지 못한 것이라 10% 가산 대상입니다. 부품보유기간이 지난 뒤라면 이 가산 규정은 적용되지 않습니다.</li>
            <li><strong>개월 수가 곧 금액</strong> — 감가는 월할이라 한 달 차이도 금액에 반영됩니다. 예를 들어 {won(1_000_000)}짜리 스마트폰(내용연수 4년)은 한 달에 약 {won(Math.round(1_000_000 / 48))}씩 잔여금이 줄어듭니다. 구입일부터 고장·수리 의뢰 시점까지를 연·개월로 정확히 넣으세요.</li>
            <li><strong>과실 비율</strong> — 세탁물 손상에 소비자 책임이 섞여 있으면 그 비율만큼 배상액이 줄어들 수 있습니다. 반대로 세탁소가 인수증을 써 주지 않았다면 분실 책임은 세탁업소가 집니다.</li>
            <li><strong>기준은 권고일 뿐</strong> — 사업자와 별도로 합의한 약관·특약이 있으면 그것이 먼저 적용되니, 계약서나 보증서의 보상 조항부터 읽어 보세요. 다만 소비자에게 부당하게 불리한 약관 조항은 약관규제법에 따라 무효가 될 수 있습니다.</li>
          </ul>
        </section>

        {/* 3. 분쟁 절차 */}
        <section>
          <h2 className="g-h2">계산 다음은? — 분쟁 해결 3단계</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '① 1372 상담', d: '국번 없이 1372 소비자상담센터. 기준 적용 여부·필요 서류를 안내받고 사업자와 1차 협의를 진행해요.' },
              { t: '② 소비자원 피해구제', d: '합의가 안 되면 한국소비자원에 피해구제 신청. 이 고시 기준으로 합의를 권고합니다 (무료).' },
              { t: '③ 분쟁조정위원회', d: '30일 내 합의 불성립 시 소비자분쟁조정위원회 조정으로 회부 — 조정 성립 시 재판상 화해 효력이 있어요.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
