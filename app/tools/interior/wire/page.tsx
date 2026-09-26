import Link from 'next/link'
import WireClient from './WireClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import {
  WIRE_KINDS, BREAKER_SIZES, baseAmpacity, maxBreakerForAmpacity, calcPower, calcCurrent,
  recommendWireSizeWithDrop, calcVoltageDrop, calcDropPercent, correctedAmpacity, fmt,
  type WireSize, type Application,
} from './wireUtils'

export const metadata = buildMetadata({
  path: '/tools/interior/wire',
  title: '전선 굵기 계산기 — KEC 2021 + 차단기·전압강하 + EV 충전기',
  description: '사용 가전 W에 맞는 전선 굵기와 차단기 + 전압강하 자동. KEC 2021 기준 + 에어컨·EV충전기·인덕션 등 한국 가전 12프리셋.',
  keywords: ['전선 굵기 계산기', '허용전류 sq', '차단기 용량', 'KEC 2021', '전압강하 계산', '에어컨 전선', 'EV 충전기 전선', '인덕션 차단기', 'HIV IV VCT', '단상 삼상'],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', fontSize: 13 }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

/* 가이드 표·예시 수치는 손으로 적지 않고 계산기와 같은 wireUtils 함수로 빌드 시 계산한다 */

/* ① 굵기별 허용전류 → 보호 가능한 최대 차단기 → '전력→전선' 탭이 그 굵기를 내주는 최대 부하
   (탭 로직: 차단기 = I×1.25 이상 최소 표준값, 전선 허용전류 ≥ 차단기 → 최대 부하 I = 최대 차단기 ÷ 1.25) */
const TABLE_SIZES: WireSize[] = [1.5, 2.5, 4, 6, 10, 16, 25, 35]
const AMP_ROWS = TABLE_SIZES.map((sq) => {
  const iz1 = baseAmpacity(sq, 'single')
  const iz3 = baseAmpacity(sq, 'three')
  const b1 = maxBreakerForAmpacity(iz1)
  const b3 = maxBreakerForAmpacity(iz3)
  return {
    sq, iz1, iz3, b1, b3,
    kw1: b1 ? calcPower(b1 / 1.25, 220, 'single', 1) / 1000 : 0,
    kw3: b3 ? calcPower(b3 / 1.25, 380, 'three', 1) / 1000 : 0,
  }
})

/* ② 계산 예시 — 4kW 전열 부하(역률 1) · 220V 단상 · HIV · 노출 · 30°C (계산기 기본 조건) */
const EX_KW = 4
const EX_L = 30
const EX_I = calcCurrent(EX_KW * 1000, 220, 'single', 1)
const exReco = (L: number, app: Application) => recommendWireSizeWithDrop(EX_I, 220, 'single', L, 'hiv', 'expose', 30, app)
const exDropPct = (L: number, sq: number) => calcDropPercent(calcVoltageDrop(EX_I, L, sq, 'single'), 220)
const EX_HOME = exReco(EX_L, 'home')
const EX_INDOOR = exReco(EX_L, 'indoor')
const DIST_ROWS = [10, 20, 30, 50].map((L) => ({
  L,
  home: exReco(L, 'home').finalSize,
  indoor: exReco(L, 'indoor').finalSize,
  outdoor: exReco(L, 'outdoor').finalSize,
}))

/* ③ 10kW 단상 vs 삼상 */
const TEN_1 = calcCurrent(10000, 220, 'single', 1)
const TEN_3 = calcCurrent(10000, 380, 'three', 1)
const TEN_1R = recommendWireSizeWithDrop(TEN_1, 220, 'single', 15, 'hiv', 'expose', 30, 'home')
const TEN_3R = recommendWireSizeWithDrop(TEN_3, 380, 'three', 15, 'hiv', 'expose', 30, 'home')

const FAQ_LD = [
  { q: '1.5sq 전선은 몇 A까지 가능한가요?',
    a: '<strong>HIV 동선·30°C·기중 직접고정(참조 부설방법 C) 기준 약 19A</strong>입니다(단상 2선 부하 기준, 삼상 3선 부하는 약 17.5A). 허용전류는 부설방법(관내·매설·기중)에 따라 달라지며, 이 값은 KEC가 채택한 IEC 60364-5-52 표의 방법 C를 기준선으로 씁니다. 여기에 보정계수(주위온도·다회로 묶음·매설)를 곱하면 70~85% 수준으로 떨어집니다. 예: 40°C에서 1.5sq → 19 × 0.87 = 약 16.5A. 또 계산기의 국내 표준 차단기 목록에서 19A 전선을 보호할 수 있는 것은 15A까지라서, 콘센트 회로(20A 차단기)에는 <strong>2.5sq 이상</strong>을 씁니다.' },
  { q: '에어컨 2kW(1.5RT)면 전선 몇 sq?',
    a: '단상 220V·역률 0.8 기준: I = 2000 / (220 × 0.8) ≈ <strong>11.4 A</strong>. 계산기 기준(15m, 가정 2%)으로는 1.5sq + 15A 차단기로도 조건을 만족하지만, <strong>실무에서는 2.5sq로 한 단계 여유</strong>를 두는 경우가 많습니다. 기동 전류·여름철 고온·장시간 운전, 나중에 더 큰 기기로 바꿀 가능성을 고려한 마진이에요. 시스템에어컨·대형 스탠드형은 제조사 설치 설명서의 전원 사양(전선 굵기·차단기 용량)을 우선하고 단독 분기로 받습니다.' },
  { q: 'EV 완속 충전기 7kW는 전선 굵기와 차단기?',
    a: '단상 220V 7kW = <strong>약 32A</strong>(역률 1.0). 연속부하 125% 설계 여유로 <strong>40A 차단기 + 6sq</strong>가 흔한 조합이며, 계산기도 같은 값을 냅니다. 매설 구간은 시스(외피)가 있는 케이블(F-CV 등)을 관로에 넣고, 충전 회로는 단독 분기와 누전차단기로 보호합니다. 한전 전기사용 신청과 사용 전 검사가 별도로 필요합니다. 22kW 삼상은 380V로 상(相)마다 전류가 나뉘어(상당 약 33A) 출력이 3배인데도 전선은 한 단계만 굵으면 됩니다 — 이 계산기의 125% 여유 기준으로는 <strong>10sq + 50A</strong>입니다. 급속(DC 50kW 이상)은 전혀 다른 설비입니다.' },
  { q: '같은 sq인데 HIV와 IV 허용전류가 왜 달라요?',
    a: '<strong>절연체가 견디는 최고 온도</strong>가 다르기 때문입니다. 전선에 전류가 흐르면 도체 저항으로 열이 나고, 허용전류는 &quot;그 열로 절연체가 한계 온도에 닿지 않는 전류&quot;입니다. 이 계산기는 IV 60°C, HIV 70°C로 보고 IV에 0.85배를 곱합니다. 가교폴리에틸렌(XLPE) 계열처럼 90°C까지 견디는 절연체는 같은 굵기에서 약 20% 더 흘릴 수 있어 계산기에서 1.2배로 둡니다.' },
  { q: '전선이 길어지면 왜 더 굵어야 하나요?',
    a: '<strong>전압강하(Voltage Drop)</strong> 때문입니다. 전선 자체의 저항으로 도착 지점 전압이 220V보다 낮아집니다. 계산기 공식은 단상 <strong>e = 35.6 × L × I ÷ (1000 × A)</strong>, 삼상 e = 30.8 × L × I ÷ (1000 × A)이며 L은 편도 거리(m)입니다(왕복분은 계수에 들어 있음). KEC는 수용가 설비의 전압강하를 저압 수전 기준 <strong>조명 3%·기타 5%</strong> 이내로 정하고, 계산기는 여기에 더 엄격한 설계 목표 2%(가정 분기)를 기본값으로 둡니다. 허용전류는 충분해도 이 한도를 넘으면 한 단계 굵은 전선을 씁니다.' },
  { q: '단상 220V와 삼상 380V 어느 게 유리한가요?',
    a: '<strong>같은 W면 삼상의 선전류가 훨씬 작습니다</strong>. 전류 = P ÷ (√3 × V) 공식에서 √3 × 380 ≈ 658 — 단상 220 대비 약 3배입니다. 예: 10kW를 단상 220V로 흘리면 45.5A지만, 삼상 380V로는 15.2A입니다. 그래서 전선·차단기가 작아지고 전압강하도 줄어듭니다. 다만 삼상은 한전과 삼상 계약(인입)이 있어야 쓸 수 있어, 일반 아파트 세대는 대부분 단상 220V만 들어옵니다.' },
  { q: '차단기 용량은 어떻게 정하나요?',
    a: '계산기는 <strong>부하전류 × 1.25 이상의 가장 작은 표준값</strong>을 고릅니다(연속부하 125% 설계 여유). 예: 부하 32A → 40A. 동시에 과전류 보호 원칙(KEC 212, IB ≤ In ≤ Iz)상 <strong>차단기 정격은 전선 허용전류 이하</strong>여야 합니다. 차단기가 전선보다 크면 전선이 먼저 과열돼도 차단기가 떨어지지 않습니다. 모터 부하는 기동전류가 정격의 수 배라 순시 트립 특성(C·D 커브)을 따로 고르기도 합니다.' },
  { q: '누전차단기와 배선용차단기 차이는?',
    a: '<strong>배선용차단기(MCCB)</strong>는 과부하·단락(쇼트) 전류를 끊어 전선·기기를 화재로부터 보호합니다. <strong>누전차단기(ELCB·RCD)</strong>는 전류가 사람 몸이나 대지로 새는 것(누설전류)을 감지해 감전을 막습니다. 주택용 분기 회로는 정격감도전류 30mA·동작시간 0.03초 이하의 인체감전보호용 누전차단기가 기본이고, 욕조·샤워 시설이 있는 욕실 콘센트는 15mA 이하 제품으로 보호합니다. 과전류와 누전을 한 기기로 처리하는 <strong>RCBO</strong>도 많이 씁니다.' },
  { q: '옥외·매설 구간 전선은 무엇을 쓰나요?',
    a: '절연체만 있는 전선(HIV·HFIX 등)은 전선관 안에 넣어 쓰는 옥내용이고, 땅에 묻거나 옥외에 노출되는 구간은 <strong>시스(외피)가 있는 케이블</strong>을 관로에 넣어 시설합니다. 국내에서는 가교폴리에틸렌 절연 비닐시스 케이블(F-CV 등, 도체 90°C)이 많이 쓰입니다. 소방설비 전원처럼 화재 중에도 회로가 살아 있어야 하는 곳은 난연을 넘어 <strong>내화 성능</strong>이 요구되므로 설계도서의 케이블 사양을 따르세요.' },
  { q: '전기 배선 자가시공이 가능한가요?',
    a: '전기공사는 <strong>전기공사업법에 따라 등록한 전기공사업자</strong>가 시공하는 것이 원칙이며, 무등록 시공은 처벌 대상입니다. 법령이 정한 경미한 공사(콘센트·스위치·소켓 같은 접속기와 전구·퓨즈의 보수·교환 등)만 예외입니다. 분전반 증설·새 회로 인입·EV 충전기 설치는 등록 업체에 맡기고 사용 전 검사를 받으세요. 이 도구는 <strong>견적 검토·학습·기술자와의 의사소통용</strong>으로 사용해 주세요.' },
]

export default function WirePage() {
  return (
    <ToolPage width={880} slug="/tools/interior/wire">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />전선 굵기 계산기
      </h1>
      <p className="tp-lead">
        사용 가전 W에 맞는 <strong style={{ color: 'var(--text)' }}>전선 굵기와 차단기</strong> + 전압강하 자동. KEC 2021 기준.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="한국전기설비규정(KEC) 과전류 보호 IB ≤ In ≤ Iz · 허용전류 IEC 60364-5-52 참조 부설방법 C(PVC 절연·동선·30°C) · 전압강하 KEC 수용가 설비 한도(조명 3%·기타 5%)와 계산기 설계 목표 2% · 차단기 국내 표준 정격 · 연속부하 125% 여유"
        sources={[
          { label: '국가법령정보센터 — 한국전기설비규정(KEC)', href: 'https://www.law.go.kr/행정규칙/한국전기설비규정' },
          { label: '국가법령정보센터 — 전기설비기술기준', href: 'https://www.law.go.kr/행정규칙/전기설비기술기준' },
          { label: '국가법령정보센터 — 전기공사업법', href: 'https://www.law.go.kr/법령/전기공사업법' },
        ]}
      />

      <WireClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <ol className="g-list">
        <li><strong>전압·부하 종류·전선·환경 선택</strong> — 회로 조건(단상/삼상, 역률, 절연 종류, 부설 환경, 주위 온도)</li>
        <li><strong>소비전력(kW)과 배선 거리(편도) 입력</strong> — 분전반에서 기기까지 한쪽 길이만 넣습니다</li>
        <li><strong>결과 확인</strong> — 예상 전류 / 권장 전선 / 차단기 / 전압강하와, 어떤 조건이 굵기를 정했는지 상세표</li>
        <li><strong>전선 용량 조회</strong> 탭에서 sq → 허용 전류·전력, 차단기 → 최소 전선을 거꾸로 확인</li>
      </ol>
      <p className="g-note">
        가전 프리셋 탭에는 에어컨·EV 충전기·인덕션 등 12개 기기의 흔한 시공 조합이 있습니다. 프리셋은 실제 시공 사례 기준이라 125% 여유를 붙이는 메인 계산보다 한 단계 작게 나올 수 있습니다.
      </p>

      {/* 2. 계산 순서 */}
      <h2 className="g-h2">굵기를 정하는 네 가지 조건</h2>
      <p className="g-p">
        계산기는 아래 네 조건을 모두 만족하는 가장 가는 전선을 고릅니다. 결과 상세표의 &lsquo;전선 굵기 후보&rsquo;가 각 조건이 요구한 굵기이고, 그중 <strong>가장 굵은 값</strong>이 최종 권장입니다.
      </p>
      <ol className="g-list">
        <li><strong>부하 전류</strong> — I = P ÷ (V × cosφ), 삼상은 분모에 √3을 곱합니다. 역률은 전열·인덕션·EV 1.0, 일반 콘센트 0.85, 모터·인버터 0.8로 둡니다.</li>
        <li><strong>허용전류</strong> — 보정 후 허용전류 = 기준표 값 × 전선 종류 계수 × 부설 환경 계수 × 주위 온도 계수가 부하 전류 × 1.25 이상이어야 합니다. 기준표는 단상(도체 2개 부하)과 삼상(도체 3개 부하)이 따로이고, 삼상 쪽이 약간 낮습니다.</li>
        <li><strong>차단기 보호</strong> — 차단기는 I × 1.25 이상의 가장 작은 표준값({BREAKER_SIZES.slice(0, 8).join('·')}A …)이고, 그 차단기 정격 이상을 견디는 전선이어야 합니다(IB ≤ In ≤ Iz).</li>
        <li><strong>전압강하</strong> — 편도 거리와 전류로 계산한 강하율이 고른 한도(2·3·5%) 안에 들어와야 합니다.</li>
      </ol>

      <h2 className="g-h2">굵기별 허용전류와 쓸 수 있는 차단기</h2>
      <p className="g-p">
        아래 표는 계산기의 기준표(HIV·기중 노출·30°C, 보정계수 1.0)에서 바로 계산한 값입니다. &lsquo;최대 차단기&rsquo;는 허용전류를 넘지 않는 가장 큰 표준 정격이고, &lsquo;최대 부하&rsquo;는 그 차단기에 125% 여유를 적용했을 때 이 굵기로 보호할 수 있는 부하 상한입니다(역률 1, 전압강하는 따로 확인).
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>굵기</th>
              <th scope="col" style={thR}>단상 허용전류</th>
              <th scope="col" style={thR}>최대 차단기</th>
              <th scope="col" style={thR}>220V 최대 부하</th>
              <th scope="col" style={thR}>삼상 허용전류</th>
              <th scope="col" style={thR}>최대 차단기</th>
              <th scope="col" style={thR}>380V 최대 부하</th>
            </tr>
          </thead>
          <tbody>
            {AMP_ROWS.map((r) => (
              <tr key={r.sq} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700 }}>{r.sq} sq</td>
                <td style={tdNum}>{r.iz1} A</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.b1 ?? '—'} A</td>
                <td style={tdNum}>{fmt(r.kw1, 1)} kW</td>
                <td style={tdNum}>{r.iz3} A</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.b3 ?? '—'} A</td>
                <td style={tdNum}>{fmt(r.kw3, 1)} kW</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        허용전류는 IEC 60364-5-52 참조 부설방법 C(PVC 절연 동선, 벽면 직접 고정) 표를 바탕으로 한 계산기 기준값으로, 표 원값과 몇 % 이내로 차이가 납니다. 전선관 매입·다회로 묶음·고온 환경에서는 보정계수만큼 줄어듭니다.
      </p>
      <p className="g-p">
        표에서 눈여겨볼 점은 <strong>차단기 표준 정격이 띄엄띄엄</strong>이라는 것입니다. 2.5sq(26A)는 30A 차단기를 보호할 수 없어 20A까지만 쓸 수 있고, 그래서 콘센트 회로의 &lsquo;2.5sq + 20A&rsquo;라는 흔한 조합이 나옵니다. 부하 전류는 가는 전선으로 충분한데 차단기 계단 때문에 전선이 한 단계 올라가는 경우가 자주 생깁니다. 삼상 25sq({AMP_ROWS.find((r) => r.sq === 25)!.iz3}A)도 100A 차단기를 보호하지 못해 16sq와 같은 75A가 상한이라 굵기 이득이 없고, 그래서 기준 조건의 전력→전선 탭은 삼상 부하에 100A 차단기가 필요해지면 25sq를 건너뛰고 35sq를 권합니다.
      </p>

      {/* 3. 계산 예시 + 전압강하 */}
      <h2 className="g-h2">계산 예시 — {EX_KW}kW 전기온수기, {EX_L}m</h2>
      <p className="g-p">
        분전반에서 편도 {EX_L}m 떨어진 곳에 {EX_KW}kW 전열 부하(역률 1)를 단상 220V로 연결하는 경우입니다. 계산기에 같은 값을 넣으면 아래 순서로 결과가 나옵니다.
      </p>
      <ol className="g-list">
        <li>전류 I = {EX_KW * 1000} ÷ 220 = <strong>{fmt(EX_I, 1)}A</strong>, 125% 여유를 붙이면 {fmt(EX_I * 1.25, 1)}A</li>
        <li>허용전류 조건만 보면 <strong>{EX_HOME.ampacitySize}sq</strong>로 충분합니다</li>
        <li>차단기는 {fmt(EX_I * 1.25, 1)}A 이상의 표준값 <strong>{EX_HOME.breaker}A</strong> — 이 차단기를 보호하려면 허용전류 {EX_HOME.breaker}A 이상인 <strong>{EX_HOME.protectSize}sq</strong>가 필요합니다</li>
        <li>{EX_HOME.protectSize}sq로 {EX_L}m를 보내면 전압강하 {fmt(calcVoltageDrop(EX_I, EX_L, EX_HOME.protectSize ?? 4, 'single'), 2)}V(<strong>{fmt(exDropPct(EX_L, EX_HOME.protectSize ?? 4), 2)}%</strong>) — 3% 한도(옥내 일반)는 통과해 최종 {EX_INDOOR.finalSize}sq, 2% 목표(가정 분기)는 넘어서 <strong>{EX_HOME.finalSize}sq</strong>({fmt(exDropPct(EX_L, EX_HOME.finalSize ?? 6), 2)}%)로 올라갑니다</li>
      </ol>
      <p className="g-p">같은 부하를 거리만 바꿔 보면 전압강하 한도가 굵기를 얼마나 좌우하는지 보입니다.</p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>편도 거리</th>
              <th scope="col" style={thR}>2% (가정 분기)</th>
              <th scope="col" style={thR}>3% (옥내 일반)</th>
              <th scope="col" style={thR}>5% (옥외·장거리)</th>
            </tr>
          </thead>
          <tbody>
            {DIST_ROWS.map((r) => (
              <tr key={r.L} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700 }}>{r.L} m</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.home ?? '—'} sq</td>
                <td style={tdNum}>{r.indoor ?? '—'} sq</td>
                <td style={tdNum}>{r.outdoor ?? '—'} sq</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">{EX_KW}kW·220V 단상·HIV·노출·30°C, 차단기 {EX_HOME.breaker}A 기준 계산기 결과.</p>

      <h2 className="g-h2">전압강하 한도 — KEC 기준과 계산기의 2%</h2>
      <p className="g-p">
        한국전기설비규정(KEC)은 수용가 설비의 인입구에서 기기 단자까지의 전압강하를 아래 값 이하로 두도록 합니다. IEC 60364-5-52 부속서의 권고를 그대로 옮긴 표로, 가능하면 최종 회로의 강하가 A 유형 값을 넘지 않게 하라는 단서가 붙어 있습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>설비 유형</th>
              <th scope="col" style={thR}>조명</th>
              <th scope="col" style={thR}>기타</th>
            </tr>
          </thead>
          <tbody>
            <tr style={rowBorder}>
              <td style={td}>A — 저압으로 수전하는 경우 (일반 주택·상가)</td>
              <td style={{ ...tdNum, fontWeight: 700 }}>3%</td>
              <td style={{ ...tdNum, fontWeight: 700 }}>5%</td>
            </tr>
            <tr style={rowBorder}>
              <td style={td}>B — 고압 이상으로 수전하는 경우 (자체 변전설비)</td>
              <td style={{ ...tdNum, fontWeight: 700 }}>6%</td>
              <td style={{ ...tdNum, fontWeight: 700 }}>8%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">배선이 100m를 넘으면 넘는 길이 1m당 0.005%를 더할 수 있으나 가산분은 0.5% 이하.</p>
      <p className="g-p">
        계산기의 &lsquo;가정용 분기 2%&rsquo;는 법정 한도가 아니라 <strong>분기회로에 몫을 나눠 주는 설계 목표</strong>입니다. 인입구에서 분전반까지의 간선에서도 전압이 떨어지므로, 분기회로를 2% 안쪽으로 잡아 두면 전체가 3~5% 한도 안에 들어갈 여유가 생깁니다. 전등만 있는 짧은 회로라면 3% 기준으로 봐도 되고, 옥외 장거리 간선은 5%를 씁니다.
      </p>

      {/* 4. 전선 종류 */}
      <h2 className="g-h2">전선 종류별 계산 계수</h2>
      <p className="g-p">
        허용전류는 절연체가 견디는 온도에 따라 달라집니다. 계산기는 HIV 기준표에 아래 계수를 곱하며, 2.5sq 열은 노출·30°C·단상 조건의 보정 후 허용전류입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={rowBorder}>
              <th scope="col" style={th}>종류</th>
              <th scope="col" style={thR}>허용 온도</th>
              <th scope="col" style={thR}>계수</th>
              <th scope="col" style={thR}>2.5sq</th>
              <th scope="col" style={th}>주 용도 (계산기 분류)</th>
            </tr>
          </thead>
          <tbody>
            {WIRE_KINDS.map((k) => (
              <tr key={k.id} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{k.label.split(' ')[0]}</td>
                <td style={tdNum}>{k.tempC}°C</td>
                <td style={tdNum}>×{k.factor.toFixed(2)}</td>
                <td style={{ ...tdNum, color: 'var(--accent-ink)', fontWeight: 700 }}>{fmt(correctedAmpacity(2.5, k.id, 'expose', 30), 1)} A</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{k.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="note" title="요즘 신축 배선은 HFIX가 많습니다">
        <p>
          최근 옥내 배선에는 HIV보다 <strong>HFIX(저독성 난연 가교폴리올레핀 절연전선, 도체 90°C)</strong>가 많이 쓰입니다. 계산기에는 HFIX 항목이 없어 HIV 기준으로 계산하므로, HFIX로 시공하는 회로라면 결과가 안전 쪽(굵게) 나온다고 보면 됩니다. 단, 차단기·단자·콘센트가 견디는 온도도 함께 봐야 하므로 표 값을 임의로 올려 쓰지는 마세요.
        </p>
      </Callout>

      {/* 5. KEC 핵심 */}
      <h2 className="g-h2">KEC 2021에서 달라진 것</h2>
      <p className="g-p">
        한국전기설비규정(KEC)은 2021년 1월 1일부터 전면 시행되어 종전 「전기설비기술기준의 판단기준」을 대체했습니다. 국제 표준(IEC 60364 계열)에 맞춘 것이 핵심이라, 전선 굵기 계산의 틀도 IEC 방식(부설방법별 허용전류, IB ≤ In ≤ Iz)으로 바뀌었습니다.
      </p>
      <ul className="g-list">
        <li><strong>전압 구분</strong> — 저압이 교류 600V 이하에서 <strong>교류 1kV·직류 1.5kV 이하</strong>로 넓어졌습니다.</li>
        <li><strong>전선 식별 색</strong> — L1 갈색 · L2 흑색 · L3 회색 · N 청색 · 보호도체 녹색-노란색. 리모델링 때 옛 색 체계로 된 배선과 섞이면 색만 믿지 말고 상(相)을 확인하세요.</li>
        <li><strong>접지</strong> — 1종·2종·3종·특별3종으로 나누던 종별 접지가 없어지고 TN·TT·IT 계통접지와 보호도체 개념으로 바뀌었습니다.</li>
        <li><strong>과부하 보호 협조</strong> — 부하전류(IB) ≤ 차단기 정격(In) ≤ 전선 허용전류(Iz), 그리고 차단기가 확실히 동작하는 전류가 1.45 × Iz 이하일 것.</li>
      </ul>

      {/* 6. 단상 vs 삼상 */}
      <h2 className="g-h2">단상 220V vs 삼상 380V</h2>
      <p className="g-p">
        단상은 전압선 하나와 중성선(+보호도체)으로 가정·소형 상가에 들어오는 방식이고, 삼상은 전압선 셋(L1·L2·L3)으로 공장·대형 냉난방·삼상 충전기에 씁니다. 같은 전력이면 삼상의 선전류가 약 1/3이라 전선이 가늘어집니다.
      </p>
      <ul className="g-list">
        <li>10kW 단상 220V: I = 10,000 ÷ 220 = <strong>{fmt(TEN_1, 1)}A</strong> → 계산기 권장 {TEN_1R.finalSize}sq + {TEN_1R.breaker}A</li>
        <li>10kW 삼상 380V: I = 10,000 ÷ (√3 × 380) = <strong>{fmt(TEN_3, 1)}A</strong> → 계산기 권장 {TEN_3R.finalSize}sq + {TEN_3R.breaker}A</li>
      </ul>
      <p className="g-note">역률 1, 편도 15m, HIV·노출·30°C, 가정 분기 2% 기준.</p>

      {/* 7. 누전·배선용 */}
      <h2 className="g-h2">누전차단기 vs 배선용차단기</h2>
      <p className="g-p">
        <strong>배선용차단기(MCCB)</strong>는 과부하·단락 전류를 끊어 전선을 화재로부터 지키고, 이 계산기가 고르는 &lsquo;차단기 A&rsquo;가 바로 이 정격입니다. <strong>누전차단기(ELCB·RCD)</strong>는 새는 전류를 감지해 사람을 감전으로부터 지키는 장치로, 정격감도전류(mA)와 동작시간으로 고릅니다. 주택 분기 회로는 30mA·0.03초 이하가 기본이며, 욕조·샤워 시설이 있는 욕실 콘센트는 15mA 이하 제품을 씁니다. 두 기능을 합친 RCBO는 회로마다 누전 보호를 따로 둘 수 있어 한 회로의 누전으로 집 전체가 꺼지는 일을 줄여 줍니다.
      </p>

      {/* 8. 흔한 실수 */}
      <h2 className="g-h2">자주 하는 실수와 전문가에게 맡길 일</h2>
      <ul className="g-list">
        <li><strong>차단기만 키우기</strong> — 차단기가 자꾸 떨어진다고 20A를 30A로 바꾸면 2.5sq 전선은 보호받지 못합니다. 원인은 부하 과다이므로 회로를 나누거나 전선부터 교체해야 합니다.</li>
        <li><strong>거리를 왕복으로 넣기</strong> — 공식 계수(35.6·30.8)에 왕복분이 이미 들어 있어 편도 거리만 넣습니다. 왕복으로 넣으면 전선이 한두 단계 과하게 나옵니다.</li>
        <li><strong>멀티탭·연장선에 고정 부하</strong> — 에어컨·온수기처럼 오래 켜 두는 큰 부하를 멀티탭에 꽂으면 코드와 플러그가 먼저 과열됩니다. 멀티탭은 표기된 정격 전류 안에서만 쓰고, 큰 부하는 전용 콘센트를 둡니다.</li>
        <li><strong>알루미늄 전선에 이 표 적용</strong> — 계산기는 동선 기준입니다. 알루미늄 도체는 같은 굵기에서 허용전류가 동선의 약 0.78배라 그대로 쓰면 과소 설계가 됩니다.</li>
      </ul>
      <Callout tone="warn" title="시공은 등록 전기공사업자에게">
        <p>
          새 회로 증설, 분전반 교체, EV 충전기·인덕션 전용 회로는 전기공사업법에 따라 등록한 업체가 시공하고 사용 전 검사를 받아야 합니다. 이 계산기는 견적서의 전선·차단기 사양이 부하에 맞는지 검토하는 용도로 쓰세요.
        </p>
      </Callout>

      <Faq items={FAQ_LD} />

      {/* 인테리어 도구 크로스링크 — 표준 2열 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { href: '/tools/interior/lighting', icon: '💡', name: '조명 밝기 계산기', desc: '공간별 권장 루멘·조명 개수' },
          { href: '/tools/interior/ac-capacity', icon: '❄️', name: '에어컨 평형 계산기', desc: '평형 추천·BTU·W 환산' },
          { href: '/tools/interior/pipe', icon: '🔧', name: '배관 규격 변환기', desc: 'A호칭·인치·DN + 6재질' },
          { href: '/tools/interior/room-area', icon: '📐', name: '방 면적 계산기', desc: '평↔㎡·바닥/벽 면적' },
        ].map((t) => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
