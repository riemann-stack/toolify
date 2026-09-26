import Link from 'next/link'
import GiftMoneyClient from './GiftMoneyClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import { RELATIONSHIPS, REL_MAP, MEAL_COST, calcGift, type Mode } from './giftMoneyData'

export const metadata = buildMetadata({
  path: '/tools/life/gift-money',
  title: '축의금·부의금 계산기 — 관계별 적정 경조사비 + 봉투·매너 가이드',
  description:
    '결혼식 축의금, 장례식 부의금을 관계·참석 여부·동반 인원으로 추천. 요즘 시세(5만·10만원)와 홀수 관례, 봉투 쓰는 법, 신권 매너까지 한 번에. 경조사비 적정 금액 가이드.',
  keywords: ['축의금계산기', '부의금계산기', '축의금얼마', '부의금얼마', '경조사비', '결혼식축의금', '조의금액수', '축의금봉투', '부의금봉투', '경조사비계산기'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '18px 20px',
}

const th: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
  color: 'var(--muted)', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)', whiteSpace: 'nowrap',
}
const td: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)',
  fontSize: '13px', whiteSpace: 'nowrap',
}
const strong: React.CSSProperties = { color: 'var(--text)' }

// 관계별 기준표 — 계산기 데이터(giftMoneyData.RELATIONSHIPS)를 그대로 표로 (손으로 옮겨 적지 않는다)
const man = (v: number) => `${v}만원`

// 계산 예시 — 빌드 시 calcGift로 계산 (화면 계산기와 같은 함수)
const EXAMPLES: { label: string; rel: string; mode: Mode; attend: boolean; extra: number; note: string }[] = [
  { label: '친구 결혼식, 혼자 참석',            rel: 'friend',      mode: 'wedding', attend: true,  extra: 0, note: '관계 기준액 그대로' },
  { label: '친구 결혼식, 못 가고 송금',          rel: 'friend',      mode: 'wedding', attend: false, extra: 0, note: '불참이라 한 단계 낮춤' },
  { label: '친한 친구 결혼식, 배우자와 참석',     rel: 'closeFriend', mode: 'wedding', attend: true,  extra: 1, note: '동반 1명 식대 가산' },
  { label: '사촌 결혼식, 가족 3인 참석',         rel: 'relative',    mode: 'wedding', attend: true,  extra: 2, note: '동반 2명 식대 가산' },
  { label: '가까운 친척 결혼식, 가족 3인 참석',   rel: 'closeRel',    mode: 'wedding', attend: true,  extra: 2, note: '합계 40만원은 4로 시작해 50만원으로 올림' },
  { label: '형제자매 결혼식, 배우자와 참석',      rel: 'family',      mode: 'wedding', attend: true,  extra: 1, note: '기준액이 식대보다 훨씬 커 가산 없음' },
  { label: '직장 동료 부친상, 직접 조문',        rel: 'coworker',    mode: 'funeral', attend: true,  extra: 0, note: '부의금은 동반 가산 없음' },
]
const EXAMPLE_ROWS = EXAMPLES.map((e) => {
  const r = calcGift(REL_MAP[e.rel], e.mode, e.attend, e.extra)
  return { ...e, base: r.base, mealAdd: r.mealAdd, recommend: r.recommend }
})

const FAQ_LD = [
  { q: '결혼식 축의금, 5만원과 10만원 중 얼마가 적당한가요?', a: '요즘은 <strong>예식장 식대가 올라</strong>(한국소비자원 조사 기준 1인 전국 중간값 5만원대 후반) 기준이 바뀌었습니다. 대략 <strong>예식에 참석해 식사하면 10만원, 못 가고 마음만 전하면 5만원</strong>이 무난한 선입니다. 거래처·지인은 5만원, 직장 동료·친구는 참석 10만원·불참 5만원, 친한 친구나 가까운 사이일수록 10~20만원 이상으로 올라갑니다. 부부가 함께 참석하면 식대를 고려해 조금 더 얹는 경우가 많습니다.' },
  { q: '부의금(조의금)은 얼마가 적당한가요?', a: '부의금은 조문 자체가 예의라 식대 비중이 작아 축의금과 비슷하거나 약간 낮습니다. <strong>직장 동료·지인은 5만원, 친구는 5~10만원, 가까운 친구·친척은 10만원 이상</strong>이 일반적입니다. 사촌·친척은 10~20만원, 가까운 친척은 20~30만원, 형제자매·직계가족은 30~50만원 이상으로 관계가 가까울수록 커집니다.' },
  { q: '경조사비에 4만원·9만원은 왜 피하나요?', a: '전통적으로 금액은 <strong>홀수가 길하다(음양에서 양)</strong>고 보아 3·5·7만원을 선호합니다. <strong>4만원은 한자 ‘죽을 사(死)’를 연상</strong>시켜 피하고, <strong>9만원은 ‘아홉수’</strong>라 하여 꺼립니다. 다만 <strong>10만원은 꽉 찬 수</strong>로 길하게 보며, 그 이상은 10·5만원 단위(15·20·30·50)면 짝수여도 무방합니다.' },
  { q: '축의금은 새 돈, 부의금은 헌 돈이 맞나요?', a: '관례상 그렇습니다. <strong>축의금은 신권(새 지폐)</strong>으로 준비하면 “미리 축하를 준비했다”는 정성의 의미가 있어 은행·ATM에서 교환해 넣습니다. 반대로 <strong>부의금은 신권을 피하는</strong> 편인데, 빳빳한 새 돈은 마치 부고를 미리 준비한 듯한 인상을 줄 수 있기 때문입니다. 헌 지폐를 쓰거나 지폐를 반으로 접어 넣기도 합니다. 요즘은 크게 따지지 않는 분위기도 있습니다.' },
  { q: '봉투 앞·뒷면에는 뭐라고 쓰나요?', a: '<strong>축의금 봉투 앞면</strong>에는 “축 결혼(祝結婚)·축 화혼(祝華婚)·하의(賀儀)” 등을, <strong>부의금 봉투 앞면</strong>에는 “부의(賻儀)·근조(謹弔)·조의(弔意)”를 씁니다. 가장 무난한 건 축의는 “축 결혼”, 부의는 “부의”입니다. <strong>뒷면 왼쪽 아래</strong>에 본인 이름을 세로로 적고, 회사·모임 등 소속이 있으면 이름 오른쪽에 작게 덧붙입니다.' },
  { q: '결혼식에 못 가는데 축의금만 보내도 되나요?', a: '네, 괜찮습니다. 가까운 사람 편에 봉투를 전하거나 <strong>계좌로 송금</strong>하는 것도 요즘은 흔합니다. 다만 직접 참석해 식사하면 식대가 들기 때문에, 같은 관계라도 <strong>참석 시에는 한 단계 더, 부부·가족이 함께 가면 인원수만큼 더</strong> 얹는 것이 일반적입니다. 이 계산기에서 참석 여부와 동반 인원을 바꾸면 추천 금액이 자동으로 조정됩니다.' },
]

export default function GiftMoneyPage() {
  return (
    <ToolPage width={760} slug="/tools/life/gift-money">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />축의금·부의금 계산기
      </h1>
      <p className="tp-lead">
        결혼식 <strong style={{ color: 'var(--text)' }}>축의금</strong>, 장례식 <strong style={{ color: 'var(--text)' }}>부의금</strong>을 관계·참석 여부로 추천. 요즘 시세와 봉투·신권 매너까지 한 번에.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="관계별 금액은 법정 기준이 아닌 사회 통념 참고치 · 결혼식 동반 1인당 식대 5만원 가산(기준액 30만원 이하일 때) · 4·9로 시작하는 합계는 다음 관례 금액으로 올림 · 식대 시세 = 한국소비자원 참가격 결혼서비스 조사(1인 식대 전국 중간값 5만원대 후반) · 공직자 등 경조사비 상한 = 청탁금지법 시행령 별표1(축의금·조의금 5만원, 화환·조화 10만원)"
        sources={[
          { label: '국가법령정보센터 — 청탁금지법 시행령(별표1 경조사비 가액 범위)', href: 'https://www.law.go.kr/법령/부정청탁및금품등수수의금지에관한법률시행령' },
          { label: '한국소비자원 참가격 — 결혼서비스 가격 정보', href: 'https://www.price.go.kr' },
        ]}
      />

      <GiftMoneyClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 기준표 — 계산기 데이터 그대로 */}
        <div>
          <h2 className="g-h2">관계별 경조사비 기준표</h2>
          <p className="g-p">
            계산기가 쓰는 관계별 기준액 전체입니다. <strong>참석</strong>은 예식에 가서 식사하거나 빈소에 직접 조문하는 경우,
            <strong> 불참</strong>은 봉투만 보내거나 계좌로 송금하는 경우입니다. 결혼식 참석은 여기에 동반 인원 식대가 더해질 수 있습니다.
          </p>
          <div className="tableScroll" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>관계</th>
                  <th scope="col" style={th}>축의금 · 참석</th>
                  <th scope="col" style={th}>축의금 · 불참</th>
                  <th scope="col" style={th}>부의금 · 조문</th>
                  <th scope="col" style={th}>부의금 · 못 감</th>
                </tr>
              </thead>
              <tbody>
                {RELATIONSHIPS.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" style={{ ...td, fontWeight: 700, textAlign: 'left' }}>{r.label}</th>
                    <td style={td}>{man(r.wedding.attend)}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{man(r.wedding.absent)}</td>
                    <td style={td}>{man(r.funeral.attend)}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{man(r.funeral.absent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            식대가 오르면서 “안 가면 5만원, 가면 10만원”이 친구·동료 사이의 일반적인 기준선이 되었습니다. 친한 친구·친척부터는 참석 여부에 따라 금액 차이가 두 배까지 벌어집니다.
          </p>
        </div>

        {/* 추천 기준 (산식 공개) */}
        <div>
          <h2 className="g-h2">이 계산기는 어떻게 추천하나요?</h2>
          <p className="g-p">경조사비는 정해진 공식이 없지만, 본 계산기는 다음 <strong>4단계</strong>로 일반적 관례를 좁혀 추천합니다.</p>
          <ol className="g-list">
            <li><strong>관계 기준액</strong> — 위 표의 값입니다. 거래처·지인 5만원, 친구 10만원, 친한 사이·친척 20~30만원, 형제자매·직계가족 50~100만원으로 가까울수록 올라갑니다.</li>
            <li><strong>참석·조문 여부</strong> — 직접 가서 식사하면 참석 기준액을, 마음만 전하면 불참 기준액(보통 한 단계 아래)을 씁니다.</li>
            <li><strong>동반 식대 가산</strong> — 결혼식에 배우자·자녀와 함께 가면 <strong>동반 1인당 {MEAL_COST}만원</strong>을 그대로 더합니다(예: 친한 친구 20만 → 부부 25만). 기준액이 30만원을 넘는 직계가족은 금액이 이미 식대를 크게 웃돌아 더하지 않습니다. 부의금에는 동반 가산을 하지 않습니다.</li>
            <li><strong>금기 숫자 보정</strong> — 기준액은 3·5·7·10만원처럼 관례적으로 무난한 금액이고, 동반 식대를 더한 합계가 40만원처럼 4로 시작하면 피하는 금액이라 다음 관례 금액(50만원)으로 올려 추천합니다. 25·35만원은 “관례액 + 데려간 사람 식대”를 반영한 값이니, 부담되면 가까운 관례 금액(20·30만원)으로 맞춰도 됩니다.</li>
          </ol>
          <p className="g-p">
            동반 가산을 1인 {MEAL_COST}만원으로 잡은 것은 실제 식대의 대략적인 하한입니다. 한국소비자원 참가격의 결혼서비스 조사에서 예식장 1인 식대는
            <strong>전국 중간값이 5만원대 후반</strong>이고 서울 강남처럼 식대가 높은 지역은 이를 크게 웃돌아, 지역·예식장에 따라 실제 식대는 이보다 높을 수 있습니다.
            다만 경조사비는 “식대를 갚는 돈”이 아니라 축하·위로의 표시이므로, 계산기는 금액이 관례 단위(5만원 간격)에서 벗어나지 않도록 {MEAL_COST}만원 단위를 씁니다.
          </p>
          <p className="g-note">
            ※ 관계별 금액은 결혼정보·취업포털 등의 축의금 설문과 사회 통념을 종합한 참고치이며 공식 고시가 아닙니다. 지역·집안·세대에 따라 달라집니다.
          </p>
        </div>

        {/* 계산 예시 */}
        <div>
          <h2 className="g-h2">상황별 계산 예시</h2>
          <p className="g-p">
            아래 금액은 위 계산기와 같은 함수로 계산한 결과입니다. 같은 관계라도 참석 여부와 동반 인원에 따라 추천액이 어떻게 달라지는지 비교해 보세요.
          </p>
          <div className="tableScroll" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-m)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>상황</th>
                  <th scope="col" style={th}>기준액</th>
                  <th scope="col" style={th}>동반 식대</th>
                  <th scope="col" style={th}>추천액</th>
                  <th scope="col" style={th}>비고</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLE_ROWS.map((e) => (
                  <tr key={e.label}>
                    <th scope="row" style={{ ...td, fontWeight: 600, textAlign: 'left' }}>{e.label}</th>
                    <td style={td}>{man(e.base)}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{e.mealAdd > 0 ? `+${man(e.mealAdd)}` : '—'}</td>
                    <td style={{ ...td, fontWeight: 700, color: 'var(--accent-ink)' }}>{man(e.recommend)}</td>
                    <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'normal', minWidth: 180 }}>{e.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            추천액은 한 봉투 기준입니다. 부부가 함께 가면서 봉투를 둘로 나눌 필요는 없고, 한 봉투에 두 사람 이름을 나란히 적거나 대표자 이름만 적으면 됩니다.
            반대로 회사 동료 여럿이 돈을 모아 한 봉투로 낼 때는 1인 금액을 정한 뒤 합치고, 뒷면에 “○○팀 일동”처럼 적는 방식이 흔합니다.
          </p>
        </div>

        {/* 청탁금지법 */}
        <div>
          <h2 className="g-h2">업무상 경조사비 — 청탁금지법 상한 확인</h2>
          <p className="g-p">
            받는 사람이 <strong>공무원, 공직유관단체·공공기관 임직원, 각급 학교 교직원, 언론사 임직원</strong>처럼 청탁금지법 적용 대상이고
            나와 <strong>직무상 관련</strong>이 있다면, 관례보다 법이 먼저입니다. 청탁금지법 제8조제3항제2호는 원활한 직무수행·사교·의례·부조 목적의 경조사비를 예외로 두고, 시행령 별표1은 그 가액을
            <strong> 축의금·조의금 5만원</strong>, 이를 대신하는 <strong>화환·조화 10만원</strong>으로 정하며, 둘을 함께 보내면 합계 10만원(현금은 5만원 이하)까지입니다.
          </p>
          <Callout tone="warn" title="거래처 결혼식에 배우자와 가는 경우">
            계산기의 ‘거래처·업무상’ 기준액은 5만원이지만, 결혼식에 배우자와 함께 참석으로 고르면 식대 가산으로 10만원이 추천됩니다.
            상대가 청탁금지법 적용 대상이고 직무 관련이 있다면 축의금은 <strong>5만원을 넘길 수 없으니</strong> 동반 여부와 관계없이 5만원 이하로 하고, 직접 이해관계가 있으면 생략하세요.
            인허가·입찰·계약·감사·평가처럼 상대의 직무와 직접 이해관계가 있는 사이(예: 진행 중인 계약의 발주기관 담당자)라면 5만원 이하라도 사교·의례 목적으로 인정되지 않아 허용되지 않을 수 있습니다(국민권익위원회 해석).
          </Callout>
          <p className="g-p">
            직무 관련이 없는 사적인 관계라도 같은 사람에게서 1회 100만원(연간 300만원)을 넘는 금품을 받는 것은 금지됩니다. 기관마다 행동강령으로
            경조사 알림·수수 범위를 더 좁게 정하기도 하므로, 애매하면 상대 기관의 청탁방지담당관이나 국민권익위원회 청탁금지법 질의응답을 확인하는 것이 안전합니다.
          </p>
        </div>

        {/* 홀수·금액 관례 */}
        <div>
          <h2 className="g-h2">금액 관례 — 홀수와 금기 숫자</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, borderTop: '3px solid var(--success)' }}>
              <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700, marginBottom: '8px' }}>무난한 금액</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li><strong>3·5·7만원</strong> — 홀수(양)라 길하게 봄</li>
                <li><strong>10만원</strong> — 꽉 찬 수, 가장 흔한 기준</li>
                <li><strong>15·20·30·50·100만원</strong> — 큰 단위는 무방</li>
              </ul>
            </div>
            <div style={{ ...card, borderTop: '3px solid var(--danger)' }}>
              <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 700, marginBottom: '8px' }}>피하는 금액</p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                <li><strong>4만원</strong> — 한자 ‘죽을 사(死)’ 연상</li>
                <li><strong>9만원</strong> — ‘아홉수’라 꺼림</li>
                <li>그 외 어정쩡한 짝수(6·8만원)도 잘 안 씀</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 봉투·신권 */}
        <div>
          <h2 className="g-h2">봉투 쓰는 법 · 지폐 매너</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={strong}>앞면</strong> — 축의는 “축 결혼(祝結婚)”, 부의는 “부의(賻儀)”가 가장 무난합니다.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              <strong style={strong}>뒷면</strong> — 왼쪽 아래에 이름을 세로로 적고, 소속이 있으면 이름 오른쪽에 작게 덧붙입니다.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={strong}>지폐</strong> — 축의금은 <strong style={strong}>새 지폐(신권)</strong>로 정성을, 부의금은 반대로 <strong style={strong}>신권을 피하는</strong> 것이 전통적인 매너입니다.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 면책 */}
        <Disclaimer variant="default" open>
          경조사비는 정해진 규칙이 아니라 <strong>지역·집안·시대·개인 관계</strong>에 따라 달라지는 관습입니다. 본 추천은 최근의 일반적 시세를 반영한 참고치이니, 마지막엔 본인과 상대의 관계와 형편을 기준으로 마음 가는 선에서 정하시면 됩니다.
        </Disclaimer>

        {/* 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch', icon: '🍻', name: '더치페이 계산기', desc: '모임 비용 정산' },
              { href: '/tools/life/unit-price', icon: '🏷️', name: '단가 비교 계산기', desc: '가격 실속 비교' },
              { href: '/tools/life/zodiac', icon: '🐯', name: '띠·별자리 계산기', desc: '나이·관계 확인' },
              { href: '/tools/life/travel-tip', icon: '💵', name: '해외여행 팁 계산기', desc: '국가별 팁 매너' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
