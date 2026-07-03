import Link from 'next/link'
import WealthRankClient from './WealthRankClient'
import AdSlot from '@/components/AdSlot'
import UpdatedMeta from '@/components/UpdatedMeta'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/finance/wealth-rank',
  title: '자산 순위 계산기 — 내 순자산 상위 몇 %? (전국·시도·연령대·세계)',
  description:
    '순자산을 입력하면 전국·시도·연령대·세계 기준 상위 몇 %인지 바로 확인. 2025 가계금융복지조사 분포·상위 구간 보도치 + UBS 세계 부 보고서 기반. 상위 10%·1% 진입선과 또래 비교까지.',
  keywords: ['자산순위계산기', '순자산상위', '상위몇퍼센트', '자산백분위', '순자산순위', '상위10퍼센트', '상위1퍼센트', '가구순자산', '연령대별자산', '세계자산순위'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 20px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswer: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }

const th: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
  color: 'var(--muted)', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const td: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text)',
  fontSize: '13px',
}
const tdNum: React.CSSProperties = {
  ...td, textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontWeight: 700, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
}

const NATION_ROWS = [
  { k: '상위 0.1%', v: '약 86.7억', real: true },
  { k: '상위 1%', v: '약 33.0억', real: true },
  { k: '상위 5%', v: '약 15.2억', real: true },
  { k: '상위 10%', v: '약 11.0억', real: true },
  { k: '상위 20%', v: '약 6.6억', real: false },
  { k: '중앙값 (상위 50%)', v: '2억 3,860만', real: true },
  { k: '평균', v: '4.71억', real: true },
]

// 순자산 5분위별 자산 구성 — 「2025년 가계금융복지조사」 표 2-7·표 3-8 (만원 단위 원자료)
// 평균 순자산 = 분위별 평균 자산(표 2-7) − 평균 부채(표 3-8). 반올림 차이 있음.
const QUINTILE_ROWS = [
  { k: '1분위 (하위 20%)', net: '약 1,132만', asset: '3,890만', ratio: '37.7%' },
  { k: '2분위 (20~40%)', net: '약 1억 462만', asset: '1억 5,159만', ratio: '53.4%' },
  { k: '3분위 (40~60%)', net: '약 2억 4,106만', asset: '3억 1,642만', ratio: '68.8%' },
  { k: '4분위 (60~80%)', net: '약 4억 7,853만', asset: '5억 8,017만', ratio: '75.0%' },
  { k: '5분위 (상위 20%)', net: '약 15억 2,085만', asset: '17억 4,590만', ratio: '80.2%' },
  { k: '전체 평균', net: '4억 7,144만', asset: '5억 6,678만', ratio: '75.8%' },
]

const REGION_ROWS = [
  { k: '서울', v: '7억 1,288만' },
  { k: '세종', v: '6억 648만' },
  { k: '경기', v: '5억 6,006만' },
  { k: '제주', v: '4억 8,103만' },
  { k: '전국 평균', v: '4억 7,144만' },
]

const AGE_ROWS = [
  { k: '39세 이하', v: '약 2.3억', real: false },
  { k: '40대', v: '약 4.5억', real: false },
  { k: '50대', v: '5억 5,161만', real: true },
  { k: '60세 이상', v: '약 4.6억', real: false },
]

const WORLD_ROWS = [
  { k: '$1,000,000 이상', v: '상위 1.6%', desc: '백만장자 약 6,000만 명' },
  { k: '$100,000 ~ $1,000,000', v: '16.4%', desc: '세계 부의 약 39%' },
  { k: '$10,000 ~ $100,000', v: '41.3%', desc: '약 15.7억 명' },
  { k: '$10,000 미만', v: '40.7%', desc: '가장 넓은 층' },
]

const FAQ_LD = [
  { q: '순자산이 정확히 뭔가요? 무엇을 더하고 빼나요?', a: '<strong>순자산 = 총자산 − 부채</strong>입니다. 총자산에는 <strong>거주·투자용 부동산, 전월세 보증금(내가 맡긴 것), 예적금, 주식·펀드·코인, 자동차, 전세금</strong> 등 가진 모든 자산을 넣고, 부채에는 <strong>주택담보대출, 신용대출, 전세보증금(세입자에게 받은 것), 카드 미결제액</strong> 등 갚아야 할 돈을 넣습니다. 이 계산기의 “총자산 − 부채로 계산” 버튼을 누르면 둘을 입력해 자동으로 순자산을 구해줍니다.' },
  { q: '상위 10%·상위 1%에 들려면 순자산이 얼마여야 하나요?', a: '가구 순자산이 <strong>약 11억이면 상위 10%</strong>, <strong>약 33억이면 상위 1%</strong>입니다(분포는 2025 가계금융복지조사, 상위 1%·5% 컷은 상위 구간 보도치 기준). 참고로 <strong>10억 이상은 상위 11.8%</strong>, <strong>15.2억이면 상위 5%</strong>입니다. 순자산 3억 미만 가구가 전체의 57%로, 중앙값은 <strong>2억 3,860만원</strong>입니다.' },
  { q: '데이터 출처와 기준 시점은 어떻게 되나요?', a: '한국 기준은 통계청·한국은행·금융감독원이 함께 발표한 <strong>「2025년 가계금융복지조사」(기준일 2025년 3월 31일, 2025년 12월 공표)</strong>와 상위 구간 보도치를 사용했습니다. 세계 기준은 <strong>UBS Global Wealth Report 2025</strong>(2024년 말, 성인 1인당)를 사용했습니다. 모두 가장 최근 공개 통계입니다.' },
  { q: '시도·연령대 순위는 얼마나 정확한가요?', a: '시·도와 연령대 비교는 <strong>전국 순자산 분포를 해당 그룹의 평균 순자산으로 보정한 추정치</strong>입니다. <strong>서울·세종·경기·제주(2025 실측 평균)와 50대(실측 평균)</strong>는 실제 통계값을 쓰지만, 그 외 시·도와 연령대는 평균 수준을 반영한 추정이라 실제 분포와 차이가 있을 수 있습니다. 그룹 안에서의 대략적 위치를 보는 용도로 참고하세요.' },
  { q: '세계 순위는 어떻게 계산되나요?', a: 'UBS 보고서의 <strong>성인 1인당 순자산 분포</strong>에 입력값을 1달러 = 1,380원으로 환산해 대입합니다. 세계 기준 상위 10%는 약 <strong>$307,000(약 4.2억)</strong>, 상위 1%는 약 <strong>$1.45M(약 20억)</strong> 수준입니다. 다만 우리 조사는 <strong>가구 단위</strong>, UBS는 <strong>1인 단위</strong>라 그대로 비교하면 순위가 다소 높게 나오므로 <strong>참고용</strong>으로 봐 주세요.' },
  { q: '왜 가구 기준인가요? 개인 기준은 없나요?', a: '한국의 자산 통계인 가계금융복지조사가 <strong>가구(세대) 단위</strong>로 조사되기 때문에, 국내 순위는 가구 기준이 가장 정확합니다. 혼자 사는 1인 가구라면 입력한 순자산이 곧 개인 자산이 됩니다. 부부·가족이라면 <strong>가구 전체 합산 순자산</strong>을 넣어야 통계와 같은 기준으로 비교됩니다.' },
  { q: '통계의 부채에는 무엇이 포함되나요? 순자산이 마이너스인 가구도 있나요?', a: '가계금융복지조사의 부채는 <strong>금융부채(담보대출·신용대출·카드 관련 대출 등)와 임대보증금(내가 세입자에게 받아 둔 보증금)</strong>을 합한 값입니다. 2025년 조사의 가구 평균 부채 9,534만원은 금융부채 6,795만원 + 임대보증금 2,739만원으로 구성됩니다. 부채가 자산보다 많아 <strong>순자산이 마이너스인 가구도 전체의 3.0%</strong>(2025년 3월 말 기준)이며, 이 계산기에도 음수 순자산을 입력할 수 있습니다.' },
  { q: '전세·월세 보증금은 자산인가요, 부채인가요?', a: '방향에 따라 다릅니다. <strong>내가 집주인에게 맡긴 전·월세보증금은 내 금융자산</strong>입니다(2025년 가구 평균 3,730만원, 금융자산의 약 27%). 반대로 <strong>내가 세입자에게서 받아 둔 임대보증금은 갚아야 할 부채</strong>입니다(평균 2,739만원, 부채의 28.7%). 통계도 같은 기준을 쓰며, 순자산 1분위(하위 20%) 가구는 자산의 36.6%가 전·월세보증금일 정도로 비중이 큽니다.' },
  { q: '상위 10%·중앙값 같은 기준선은 해마다 얼마나 변하나요?', a: '매년 12월 새 조사가 공표될 때마다 조금씩 움직입니다. 2025년 조사에서는 전년 대비 <strong>평균 순자산 4억 4,894만 → 4억 7,144만원(+5.0%)</strong>, <strong>순자산 10억 이상 가구 비중 10.9% → 11.8%</strong>, 상위 10%(10분위) 순자산 점유율 <strong>44.4% → 46.1%</strong>로 상위 구간이 커진 반면, <strong>중앙값은 2억 4,000만 → 2억 3,860만원(−0.6%)</strong>으로 오히려 줄었습니다. 같은 순자산이라도 해마다 순위가 달라질 수 있으니 기준 연도를 함께 확인하세요.' },
]

export default function WealthRankPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="finance" />자산 순위 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        내 <strong style={{ color: 'var(--text)' }}>순자산</strong>이 상위 몇 %인지 — <strong style={{ color: 'var(--text)' }}>전국·시도·연령대·세계</strong> 기준으로 한 번에. 2025 가계금융복지조사 분포와 상위 구간 보도치, UBS 세계 부 보고서를 바탕으로 계산합니다.
      </p>

      <UpdatedMeta
        date="2026년 6월"
        basis="2025 가계금융복지조사 분포·상위 구간 보도치 + UBS GWR 2025"
        sources={[
          { label: '국가데이터처 가계금융복지조사', href: 'https://kostat.go.kr' },
          { label: '한국은행 보도자료', href: 'https://www.bok.or.kr' },
          { label: 'UBS Global Wealth Report', href: 'https://www.ubs.com' },
        ]}
      />

      <WealthRankClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 전국 분포 */}
        <div>
          <h2 style={sectionTitle}>한국 가구 순자산 분포 (2025년)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>구간</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>순자산 기준선</th>
                </tr>
              </thead>
              <tbody>
                {NATION_ROWS.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700 }}>
                      {r.k}
                      {!r.real && <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500, marginLeft: 6 }}>추정</span>}
                    </td>
                    <td style={tdNum}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            가구 기준. 상위 0.1~10%·1%·5%·평균·중앙값(2억 3,860만)은 통계청(현 국가데이터처) 등 「2025년 가계금융복지조사」와 상위 구간 보도치(2024년 컷)를 따른 값이며, 상위 20%는 분포 보간 추정입니다.
          </p>
        </div>

        {/* 연령대·지역 평균 */}
        <div>
          <h2 style={sectionTitle}>연령대·지역별 평균 순자산</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th scope="col" style={th}>가구주 연령대</th>
                    <th scope="col" style={{ ...th, textAlign: 'right' }}>평균 순자산</th>
                  </tr>
                </thead>
                <tbody>
                  {AGE_ROWS.map((r, i) => (
                    <tr key={i}>
                      <td style={{ ...td, fontWeight: 700 }}>
                        {r.k}
                        {!r.real && <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500, marginLeft: 6 }}>추정</span>}
                      </td>
                      <td style={tdNum}>{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th scope="col" style={th}>지역 (상위)</th>
                    <th scope="col" style={{ ...th, textAlign: 'right' }}>평균 순자산</th>
                  </tr>
                </thead>
                <tbody>
                  {REGION_ROWS.map((r, i) => (
                    <tr key={i}>
                      <td style={{ ...td, fontWeight: 700 }}>{r.k}</td>
                      <td style={tdNum}>{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            50대와 서울·세종·경기·제주는 2025 실측 평균입니다. 그 외 연령대·시도는 평균 수준 추정치로, 계산기에서 17개 시·도를 모두 선택할 수 있습니다.
          </p>
        </div>

        {/* 순자산 분위별 자산 구성 */}
        <div>
          <h2 style={sectionTitle}>순자산 분위별 자산 구성 — 위로 갈수록 부동산</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>순자산 분위</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>평균 순자산</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>평균 자산</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>실물자산 비중</th>
                </tr>
              </thead>
              <tbody>
                {QUINTILE_ROWS.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700 }}>{r.k}</td>
                    <td style={tdNum}>{r.net}</td>
                    <td style={tdNum}>{r.asset}</td>
                    <td style={tdNum}>{r.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            국가데이터처(통계청)·한국은행·금융감독원 「2025년 가계금융복지조사」 표 2-7·표 3-8 (2025년 3월 말 기준, 2025년 12월 발표). 평균 순자산은 분위별 평균 자산에서 평균 부채를 뺀 값(반올림 차이 있음)이며, 실물자산 비중의 나머지가 전·월세보증금을 포함한 금융자산 비중입니다.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '8px 2px 0', lineHeight: 1.7 }}>
            분위가 올라갈수록 자산에서 실물자산(대부분 부동산)이 차지하는 비중이 커집니다 — 1분위 37.7% → 5분위 80.2%, 5분위의 평균 부동산만 13억 3,828만원. 반대로 1분위는 자산의 36.6%가 전·월세보증금입니다. 같은 조사에서 상위 10%(10분위)의 순자산 점유율은 46.1%(전년 대비 +1.6%p), 순자산 지니계수는 0.625(+0.014)로 집계됐습니다.
          </p>
        </div>

        {/* 세계 분포 */}
        <div>
          <h2 style={sectionTitle}>세계 순자산 분포 (UBS 2025)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th scope="col" style={th}>성인 1인 순자산</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>비중</th>
                </tr>
              </thead>
              <tbody>
                {WORLD_ROWS.map((r, i) => (
                  <tr key={i}>
                    <td style={td}>
                      <strong style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.k}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>{r.desc}</span>
                    </td>
                    <td style={tdNum}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '12px 2px 0', lineHeight: 1.7 }}>
            UBS Global Wealth Report 2025(2024년 말 기준). 세계 상위 10% 진입선은 약 $307,000(약 4.2억), 상위 1%는 약 $1.45M(약 20억) 수준입니다.
          </p>
        </div>

        {/* 순자산을 늘리는 일반 원칙 */}
        <div>
          <h2 style={sectionTitle}>순자산을 늘리는 일반 원칙</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>① 저축률부터 점검하기</div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                순자산은 결국 <strong style={{ color: 'var(--text)' }}>번 돈에서 쓰고 남은 돈</strong>이 쌓인 결과라, 자산 형성의 출발점으로는 수익률보다 저축률을 먼저 점검하는 것이 일반적인 원칙으로 알려져 있습니다.{' '}
                <Link href="/tools/finance/savings" style={{ color: 'var(--accent)', fontWeight: 600 }}>저축액 계산기</Link>로 내 저축률을 한국 평균과 비교해 보세요.
              </p>
            </div>
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>② 고금리 부채 먼저 줄이기</div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                대출 금리가 예·적금 금리보다 높다면, 고금리 부채를 갚는 것은 <strong style={{ color: 'var(--text)' }}>그 금리만큼 확실하게 순자산 감소를 막는 효과</strong>가 있다는 것이 일반적인 재무 원칙입니다. 2025년 조사 기준 가구 평균 부채는 9,534만원입니다.{' '}
                <Link href="/tools/finance/loan" style={{ color: 'var(--accent)', fontWeight: 600 }}>대출이자 계산기</Link>로 상환 방식별 이자 부담을 비교해 보세요.
              </p>
            </div>
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>③ 한 자산에 몰지 않기</div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                위 표처럼 한국 가구 자산은 평균 75.8%가 실물자산(대부분 부동산)에 집중되어 있습니다. 특정 자산 가격 변동에 순자산 전체가 흔들리지 않도록 <strong style={{ color: 'var(--text)' }}>자산을 분산해 두는 것</strong>이 일반 원칙으로 알려져 있습니다. 다만 적정 구성은 개인 상황마다 달라, 특정 상품 권유가 아니며 중요한 결정은 전문가와 상의하세요.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <Disclaimer variant="finance" open>
          본 계산기는 공개 통계를 바탕으로 한 <strong>추정 순위</strong>로, 투자 권유나 재무 자문이 아닙니다. 실제 분포는 조사 방법·시점·표본에 따라 달라지며, 특히 시·도·연령대·세계 비교는 보정·환산이 들어간 참고치입니다. 중요한 의사결정은 원자료와 전문가 상담을 통해 확인하세요.
        </Disclaimer>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/savings', icon: '💰', name: '저축액 계산기', desc: '저축률·한국 평균 비교' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기', desc: '자산 불리기 시뮬' },
              { href: '/tools/finance/salary', icon: '💰', name: '연봉 실수령액 계산기', desc: '월 실수령 계산' },
              { href: '/tools/finance/real-estate', icon: '🏘️', name: '부동산 수익률 계산기', desc: '자기자본 수익률' },
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
    </div>
  )
}
