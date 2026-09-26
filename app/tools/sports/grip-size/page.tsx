import Link from 'next/link'
import GripSizeClient from './GripSizeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  TENNIS_GRIPS, GOLF_GRIPS, BADMINTON_GRIPS, SQUASH_GRIPS,
  recommendTennis, recommendBadminton, recommendSquash,
  palmToFullHand, gloveByHandLength, golfGripByGlove,
} from './gripData'

export const metadata = buildMetadata({
  path: '/tools/sports/grip-size',
  title: '그립 사이즈 계산기 — 테니스·골프·배드민턴·스쿼시 한 번에',
  description:
    '손 측정 한 번으로 테니스(L1~L5)·골프(언더/표준/미드/점보)·배드민턴(G2~G6)·스쿼시까지 4종목 그립 사이즈 동시 추천. 자/펜슬 테스트 + 오버그립 보정 + 글러브 호수 매핑 + 그립 굵기와 부상 연구 정리.',
  keywords: [
    '그립 사이즈', '그립 굵기', '테니스 그립 사이즈', '골프 그립 사이즈',
    '배드민턴 그립', '스쿼시 그립', '테니스 L1 L2 L3', '골프 글러브 호수',
    '그립 측정 방법', '펜슬 테스트', '오버그립', '테니스 엘보 예방',
    '라켓 그립', '손 크기 측정',
  ],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const hi: React.CSSProperties = { color: 'var(--accent-ink)' }

/* ── 손 치수별 추천표 — 계산기와 같은 함수(gripData)로 빌드 시 계산 ── */
const PALM_ROWS = [9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5].map((palm) => {
  const full = palmToFullHand(palm)
  const glove = gloveByHandLength(full)
  return {
    palm,
    tennis0: recommendTennis(palm, 0).grip,
    tennis1: recommendTennis(palm, 1).grip,
    badminton: recommendBadminton(palm, 1),
    squash: recommendSquash(palm),
    full, glove,
    golf: golfGripByGlove(glove),
  }
})
/* 예시 — 계산기 기본값(손바닥+약지 11.0cm) */
const EX_PALM = 11.0
const EX_T0 = recommendTennis(EX_PALM, 0)
const EX_T1 = recommendTennis(EX_PALM, 1)
const EX_FULL = palmToFullHand(EX_PALM)
const EX_GLOVE = gloveByHandLength(EX_FULL)
const EX_GOLF = golfGripByGlove(EX_GLOVE)
const EX_BAD = recommendBadminton(EX_PALM, 1)
const EX_SQ = recommendSquash(EX_PALM)

const FAQ_LD = [
  { q: '그립 사이즈를 잘 모르겠으면 큰 걸로 가야 하나요, 작은 걸로 가야 하나요?', a: '<strong>의심스러우면 작은 쪽</strong>으로 가세요. 오버그립 1~2겹으로 굵기를 키우는 건 쉽지만, 너무 큰 그립은 손잡이를 깎아내는 것 말고는 줄일 방법이 사실상 없습니다. 테니스라면 L2~L3, 골프라면 표준, 배드민턴이라면 G5에서 출발해 오버그립으로 맞춰 가는 것이 안전합니다.' },
  { q: '테니스에서 L1과 L2 중 고민될 때 어떻게 선택하나요?', a: '플레이 스타일과 쥐는 느낌으로 결정합니다. 손목을 많이 써서 스핀을 거는 스타일은 손 안에서 라켓을 돌리기 쉬운 가는 쪽(L1)을, 발리·서브 비중이 크거나 플랫 위주이거나 손이 큰 편이면 굵은 쪽(L2)을 편하게 느끼는 경우가 많습니다. 모르겠으면 <strong>L1 + 오버그립 1겹</strong>(≈ L1과 L2 사이)으로 쳐 보고 결정하세요. 권장 치수에서 ±1/4인치(두 단계) 벗어나도 전완 근활성 차이가 없었다는 연구(Hatch 외, AJSM 2006)가 있어, 한 단계 사이의 고민은 부상보다 느낌을 우선해도 됩니다.' },
  { q: '골프 그립을 미드사이즈로 바꾸면 훅이나 슬라이스가 달라지나요?', a: '달라질 수 있습니다. 굵은 그립은 임팩트 때 손목이 돌아가는(릴리스) 동작을 줄이는 경향이 있어, <strong>페이스가 과하게 닫혀 훅이 나는 골퍼</strong>에게는 훅을 누그러뜨리는 효과가 있을 수 있습니다. 반대로 손목 회전이 부족해 슬라이스가 나는 골퍼는 굵은 그립에서 슬라이스가 더 심해질 수 있습니다. 구질 교정이 목적이라면 티칭프로에게 스윙 진단을 받은 뒤 결정하는 게 안전합니다.' },
  { q: '골프 그립에 적힌 .580·.600은 그립 굵기인가요?', a: '아닙니다. <strong>.580·.600은 그립 안쪽 구멍(코어)의 지름</strong>으로, 샤프트 끝(버트) 지름에 맞추는 규격입니다. 손에 닿는 굵기는 언더사이즈·표준·미드사이즈·점보 등급으로 따로 표기합니다. 코어와 샤프트가 맞으면 표기된 굵기 그대로 나오고, .580 코어를 .600 샤프트에 끼우면 고무가 늘어나 약 1/64인치 굵어집니다. 그립을 교체할 때는 샤프트 버트 지름부터 확인하세요.' },
  { q: '배드민턴에서 G4 + 오버그립 2겹과 G3 단독은 같은 굵기인가요?', a: '둘레는 비슷해지지만 느낌이 다릅니다. 오버그립은 표면이 부드럽고 마찰이 커 땀이 나도 덜 미끄러지는 대신, 겹이 늘수록 손잡이의 팔각 모서리가 뭉개져 그립 위치를 손으로 읽기 어려워집니다. G3 맨 그립은 모서리 감이 살아 있어 포핸드·백핸드 전환이 또렷합니다. 또 오버그립은 닳으면 갈아야 하므로 굵기가 조금씩 변합니다. 국내에서는 <strong>G4 + 오버그립</strong> 조합이 흔한 편입니다.' },
  { q: '평생 같은 그립 사이즈를 써도 되나요?', a: '성인이 되면 손 크기는 거의 변하지 않지만, 다음 경우엔 다시 재 보세요. <strong>10대</strong>는 손이 자라는 중이라 해마다 측정 · 관절염이나 손목 통증이 생기면 쥐는 힘을 덜 쓰도록 한 단계 굵게 시도 · 나이가 들어 손가락이 잘 굽혀지지 않으면 약간 굵은 쪽이 편한 경우가 많습니다. 새 라켓을 살 때는 버트캡의 사이즈 표기와 지금 감긴 오버그립 겹수를 함께 확인하세요.' },
]

export default function GripSizePage() {
  return (
    <ToolPage width={880} slug="/tools/sports/grip-size">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />그립 사이즈 계산기
      </h1>
      <p className="tp-lead">
        손 측정 한 번으로 <strong style={{ color: 'var(--text)' }}>테니스·골프·배드민턴·스쿼시 4종목</strong> 그립 사이즈 동시 추천. 자·펜슬 테스트 두 방식과 오버그립·글러브 호수 보정까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="Nirschl 손 측정법 · 제조사 공칭 사이즈 표기 · R&A/USGA 장비 규칙 (종목별 추천 구간은 Youtil 추정)"
        sources={[
          { label: 'Hatch 외, Am J Sports Med 2006 (PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/16861576/' },
          { label: 'R&A Rules of Equipment Part 2', href: 'https://www.randa.org/en/roe/the-rules-of-equipment/part-2-conformance-of-clubs' },
          { label: 'Golf Pride 그립 사이즈 가이드', href: 'https://www.golfpride.com/us/en-us/grip-academy/swing-grip-size-guide.html' },
        ]}
      />

      <GripSizeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 왜 그립 사이즈가 중요한가 */}
        <section>
          <h2 className="g-h2">그립 사이즈가 왜 중요한가?</h2>
          <p className="g-p">
            라켓·골프 클럽의 그립이 손 크기와 맞지 않으면 <strong>쥐는 힘의 크기와 분포가 달라져</strong>
            컨트롤과 편안함이 떨어집니다. 잘못된 그립 사이즈는 테니스 엘보(외측 상과염)의 원인으로 흔히 지목되지만,
            이를 뒷받침하는 연구 근거는 생각보다 제한적입니다 — 아래 &lsquo;그립 굵기와 부상&rsquo; 섹션에서 자세히 다룹니다.
          </p>
          <p className="g-p">
            반대로 너무 큰 그립은 손목 회전을 방해해 컨트롤·스핀이 떨어지고, 골프에서는 슬라이스(우측 빠짐)의 원인이 됩니다.
            본 도구는 일반적으로 알려진 손 크기 분포·라켓 표준을 Youtil이 정리한 추정 기준(공식 통계 아님)으로 출발점을 제시하니, 매장 시타와 함께 결정하세요.
          </p>
        </section>

        {/* 2. 계산 방식 */}
        <section>
          <h2 className="g-h2">계산기가 사이즈를 고르는 방식</h2>
          <p className="g-p">
            입력은 두 가지 길이입니다. 라켓 종목은 <strong>손바닥 안쪽 큰 주름(근위 손바닥 주름)에서 약지 끝까지</strong>, 골프는
            <strong> 손목 주름에서 중지 끝까지</strong>(손 전체 길이)를 씁니다. 손 전체 길이를 따로 재지 않으면 손바닥 값 ÷ 0.58로 추정해 채웁니다.
          </p>
          <ul className="g-list">
            <li><strong>테니스</strong> — 측정값(cm)에서 오버그립 1겹당 0.16cm를 뺀 뒤, 둘레(cm)가 가장 가까운 L 사이즈를 고릅니다. 테니스 그립 표기는 둘레 4인치(L0)에서 1/8인치(약 0.32cm)씩 커지므로, 오버그립 한 겹은 반 단계에 해당합니다.</li>
            <li><strong>배드민턴</strong> — 오버그립 1겹(겹당 0.20cm)을 기본으로 빼고 10.0 / 10.7 / 11.4 / 12.1cm를 경계로 G6 → G5 → G4 → G3 → G2를 정합니다. G 숫자는 클수록 가늡니다.</li>
            <li><strong>스쿼시</strong> — 10.5cm 미만 Small, 11.5cm 미만 Medium, 그 이상 Large.</li>
            <li><strong>골프</strong> — 손 전체 길이 + 4를 반올림해 글러브 호수를 추정하고(20~30호로 제한), 22호 이하 언더사이즈 · 23~25호 표준 · 26~27호 미드사이즈 · 28호 이상 점보로 매핑합니다. 글러브 호수를 알면 직접 입력하는 편이 더 정확합니다.</li>
          </ul>
          <p className="g-p">
            예를 들어 기본값인 손바닥+약지 {EX_PALM.toFixed(1)}cm라면 테니스는 둘레 {EX_T0.grip.cm.toFixed(2)}cm인
            <strong> {EX_T0.grip.eu}({EX_T0.grip.size})</strong>가 가장 가깝습니다. 같은 손이라도 오버그립 1겹을 감을 생각이면
            {' '}{(EX_PALM - 0.16).toFixed(2)}cm로 보고 <strong>{EX_T1.grip.eu}</strong>를 권합니다. 배드민턴은 오버그립 1겹 기준
            {' '}<strong>{EX_BAD.id}</strong>, 스쿼시는 <strong>{EX_SQ.size.split(' (')[0]}</strong>이고, 손 전체 길이는 약 {EX_FULL.toFixed(1)}cm로 추정되어
            글러브 {EX_GLOVE}호 → 골프 <strong>{EX_GOLF.name}</strong> 그립이 나옵니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>손바닥+약지</th>
                  <th scope="col" style={headCell}>테니스 (오버그립 0 / 1겹)</th>
                  <th scope="col" style={headCell}>배드민턴 (1겹)</th>
                  <th scope="col" style={headCell}>스쿼시</th>
                  <th scope="col" style={headCell}>손 전체 (추정)</th>
                  <th scope="col" style={headCell}>골프 (글러브 호수)</th>
                </tr>
              </thead>
              <tbody>
                {PALM_ROWS.map((r) => (
                  <tr key={r.palm}>
                    <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>{r.palm.toFixed(1)}cm</th>
                    <td style={cell}>{r.tennis0.eu} / {r.tennis1.eu}</td>
                    <td style={cell}>{r.badminton.id}</td>
                    <td style={cell}>{r.squash.size.split(' (')[0]}</td>
                    <td style={cell}>{r.full.toFixed(1)}cm</td>
                    <td style={cell}>{r.golf.name} ({r.glove}호)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            계산기와 같은 함수로 계산한 값입니다. 손 전체 길이는 손바닥 값에서 추정한 것이라, 손가락이 긴 편이면 골프 칸은 실측값으로 다시 확인하세요.
          </p>
        </section>

        {/* 3. 측정 방법 비교 */}
        <section>
          <h2 className="g-h2">측정 방법 2가지 — 자 vs 펜슬 테스트</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>방법</th>
                  <th scope="col" style={headCell}>방식</th>
                  <th scope="col" style={headCell}>장점</th>
                  <th scope="col" style={headCell}>단점</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}><strong>자로 측정</strong></td>
                  <td style={cell}>손바닥 안쪽 큰 주름 ~ 약지 끝까지 cm 측정</td>
                  <td style={cell}>정확도 ↑ · 라켓 없어도 OK</td>
                  <td style={cell}>약지·중지 헷갈리기 쉬움</td>
                </tr>
                <tr>
                  <td style={cell}><strong>펜슬 테스트</strong></td>
                  <td style={cell}>이스턴 포핸드 그립으로 잡고, 손끝과 손바닥 사이 빈 공간에 반대손 검지 넣기</td>
                  <td style={cell}>즉각 확인 · 직관적</td>
                  <td style={cell}>라켓 필요 · 사이즈 가늠 모호</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            펜슬 테스트는 지금 쓰는 라켓을 기준으로 한 단계를 오르내리는 방식입니다. 검지가 들어가지 않을 만큼 꽉 차면 그립이 작은 것이라 한 단계 위,
            검지를 넣고도 여유가 남으면 큰 것이라 한 단계 아래, 검지가 딱 맞게 들어가면 지금 사이즈를 유지합니다. 계산기의 펜슬 모드도 이 규칙 그대로
            현재 L 번호에서 ±1단계를 계산합니다.
          </p>
          <p className="g-p">자주 하는 측정 실수는 다음과 같습니다.</p>
          <ul className="g-list">
            <li><strong>중지 끝까지 재기</strong> — 라켓용 측정은 약지 끝입니다. 중지로 재면 대개 한두 단계 크게 나옵니다.</li>
            <li><strong>손바닥 주름을 잘못 잡기</strong> — 기준은 손가락 뿌리의 가는 주름이 아니라 손바닥 가운데를 가로지르는 두 번째(큰) 주름입니다.</li>
            <li><strong>오버그립 감긴 라켓을 맨 그립 사이즈로 착각</strong> — 버트캡 표기는 맨 그립 기준입니다. 이미 1~2겹 감겨 있다면 실제 굵기는 반~한 단계 큽니다.</li>
            <li><strong>배드민턴 G 번호 방향 혼동</strong> — 테니스 L은 숫자가 클수록 굵지만, 배드민턴 G는 숫자가 클수록 가늡니다.</li>
          </ul>
          <Callout tone="tip" title="매장 시타와 비교하기">
            가장 확실한 방법은 <strong>매장 시타 + 본 도구 결과 비교</strong>입니다. 자로 재 둔 본인 사이즈와 매장 라켓 버트캡의 표기가 일치하는지, 실제로 쥐었을 때
            스트로크 중 그립이 돌지 않는지 함께 확인하세요.
          </Callout>
        </section>

        {/* 4. 종목별 표기 가이드 */}
        <section>
          <h2 className="g-h2">종목별 그립 사이즈 표기</h2>

          <h3 className="g-h3">테니스 — L 번호 = 미국식 숫자</h3>
          <p className="g-p">
            유럽식 L 번호와 미국식 숫자는 같은 값을 가리킵니다(L2 = 4 1/4인치 = 미국 #2). 모두 손잡이 <strong>둘레</strong>이며, 한 단계 차이는 1/8인치(약 3.2mm)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>인치</th>
                  <th scope="col" style={headCell}>유럽 (EU)</th>
                  <th scope="col" style={headCell}>미국 (US)</th>
                  <th scope="col" style={headCell}>둘레 (cm)</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                {TENNIS_GRIPS.map((g) => (
                  <tr key={g.eu}>
                    <td style={cell}>{g.size}</td>
                    <td style={cell}><strong style={g.eu === 'L3' ? hi : undefined}>{g.eu}</strong></td>
                    <td style={cell}>{g.us}</td>
                    <td style={cell}>{g.cm.toFixed(2)}</td>
                    <td style={cell}>{g.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">골프 — 표준 대비 굵기로 표기</h3>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>등급</th>
                  <th scope="col" style={headCell}>표준 대비 외경</th>
                  <th scope="col" style={headCell}>글러브 호수 (도구 기준)</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                {GOLF_GRIPS.map((g) => (
                  <tr key={g.id}>
                    <td style={cell}><strong style={g.id === 'standard' ? hi : undefined}>{g.name}</strong></td>
                    <td style={cell}>{g.deltaMm ? `${g.delta} (${g.deltaMm})` : '기준'}</td>
                    <td style={cell}>{g.recommendedGlove.replace('글러브 ', '')}</td>
                    <td style={cell}>{g.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            골프 그립 포장에 적힌 <strong>.580·.600 같은 숫자는 굵기가 아니라 안쪽 구멍(코어) 지름</strong>입니다. 샤프트 끝 지름과 같은 코어를
            골라야 표기된 굵기가 나오고, 작은 코어를 굵은 샤프트에 끼우면 고무가 늘어나 조금 굵어집니다. 표준과 미드사이즈 사이처럼 중간 굵기가 필요하면
            그립 아래에 양면 테이프를 한 겹씩 더 감는데, 클럽 피팅에서는 한 겹을 대략 1/64인치로 봅니다.
          </p>
          <p className="g-p">
            굵게 만드는 데도 한도가 있습니다. R&amp;A·USGA 장비 규칙은 그립 단면의 지름이 어느 방향으로든 <strong>1.75인치(44.45mm)</strong>를 넘지
            못하게 하고, 퍼터가 아닌 클럽은 단면이 원형이어야 합니다(곧은 리브 하나 정도만 허용). 테이퍼는 되지만 중간이 불룩하거나 잘록해서는 안 됩니다.
            한국 골프장갑은 보통 18~26호(여성 18~21호·남성 22~26호) 범위라, 도구의 27호 이상 구간은
            &lsquo;아주 큰 손&rsquo;을 뜻하는 추정 구간으로 보세요. 반대로 도구의 장갑 호수 입력은 20호부터라, 18~19호 장갑을 쓴다면
            가장 작은 20호를 고르면 됩니다 — 22호 이하는 모두 언더사이즈로 판정되므로 결과는 같습니다.
          </p>

          <h3 className="g-h3">배드민턴 — G 숫자가 클수록 가늘다</h3>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>등급</th>
                  <th scope="col" style={headCell}>그립 둘레 (맨 그립)</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                {BADMINTON_GRIPS.map((g) => (
                  <tr key={g.id}>
                    <td style={cell}><strong style={g.id === 'G4' ? hi : undefined}>{g.id}</strong></td>
                    <td style={cell}>{g.circumference}</td>
                    <td style={cell}>{g.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            둘레는 오버그립 없는 맨 그립 기준이며, 제조사·판매처마다 인용 수치가 1~2mm씩 다릅니다. 라켓 스티커의 &lsquo;3U G5&rsquo;는 무게 등급(U)과 그립 등급(G)을
            함께 적은 것입니다. 동호인 상당수가 오버그립을 1~2겹 더 감기 때문에 계산기는 기본 1겹을 가정합니다.
          </p>

          <h3 className="g-h3">스쿼시 — 사이즈보다 오버그립으로 조절</h3>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '360px' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>등급</th>
                  <th scope="col" style={headCell}>둘레 (인치)</th>
                  <th scope="col" style={headCell}>대상</th>
                </tr>
              </thead>
              <tbody>
                {SQUASH_GRIPS.map((g) => {
                  const [name, inch] = g.size.split(' (')
                  return (
                    <tr key={g.size}>
                      <td style={cell}><strong style={name === 'Medium' ? hi : undefined}>{name}</strong></td>
                      <td style={cell}>{inch?.replace(')', '')}</td>
                      <td style={cell}>{g.desc}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="스쿼시 라켓은 대부분 한 가지 굵기">
            스쿼시 라켓은 테니스와 달리 <strong>대부분 단일(표준) 사이즈로 출고</strong>되어, 실제 조절은 <strong>오버그립 겹수</strong>로 합니다.
            작은 손은 기본 그대로(0겹), 표준은 0~1겹, 큰 손은 1~2겹을 감아 위 둘레에 맞추세요.
          </Callout>
        </section>

        {/* 5. 오버그립 가이드 */}
        <section>
          <h2 className="g-h2">오버그립 — 사이즈 미세 조정의 정석</h2>
          <p className="g-p">
            오버그립 1겹은 두께가 <strong>0.5mm 안팎</strong>이지만 당겨 감으면서 얇아지고 겹치는 부분도 달라, 흔히 그립이 약 1/16인치(반 사이즈) 굵어진다고 봅니다.
            테니스 그립 한 단계(1/8인치)의 절반이므로 <strong>오버그립 2겹이면 대략 한 사이즈</strong>가 커집니다. 계산기도 테니스는 겹당 0.16cm, 배드민턴은 겹당 0.20cm를
            측정값에서 빼는 방식으로 이를 반영합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '440px' }}>
              <thead>
                <tr>
                  <th scope="col" style={headCell}>감는 것</th>
                  <th scope="col" style={headCell}>굵기 변화 (테니스 기준)</th>
                  <th scope="col" style={headCell}>쓰임</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}><strong>얇은 오버그립 1겹</strong></td><td style={cell}>약 반 단계 (+1/16인치)</td><td style={cell}>가장 흔한 미세 조정 · 땀 흡수·교체용</td></tr>
                <tr><td style={cell}><strong>오버그립 2겹</strong></td><td style={cell}>약 한 단계 (+1/8인치)</td><td style={cell}>한 사이즈 작은 라켓을 키울 때</td></tr>
                <tr><td style={cell}><strong>쿠션형·타월 그립</strong></td><td style={cell}>제품마다 다름 (얇은 오버그립보다 굵음)</td><td style={cell}>땀이 많은 손·충격 완화 — 감은 뒤 다시 재 보기</td></tr>
              </tbody>
            </table>
          </div>
          <p className="g-note">
            두께는 제품·장력에 따라 달라지므로, 두꺼운 제품을 감은 뒤에는 펜슬 테스트로 한 번 더 확인하는 편이 정확합니다.
          </p>
        </section>

        {/* 6. 부상 가이드 */}
        <section>
          <h2 className="g-h2">그립 굵기와 부상 — 통념과 연구가 말하는 것</h2>
          <p className="g-p">
            &ldquo;그립이 가늘면 라켓을 더 세게 쥐게 되어 테니스 엘보가 온다&rdquo;는 이야기는 동호인 사이에서 정설처럼 통합니다.
            그런데 이 통념을 직접 검증한 연구진조차 논문 서두에서, 부적절한 그립 굵기가 전완·팔꿈치 과사용 부상의 위험 요인으로
            자주 지목되는 곳으로 <strong>대중 매체</strong>를 들며 시작합니다(Hatch 외, AJSM 2006).
          </p>
          <div style={{ ...card, marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>근전도(EMG) 검증 실험 — Hatch 외, Am J Sports Med 2006</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
              무증상 대학(NCAA) 테니스 선수 16명에게 권장 치수 그립, 1/4인치(6.35mm) 가는 그립, 1/4인치 굵은 그립 3종으로
              한손 백핸드를 치게 하고 전완 근육 5곳의 활동을 근전도로 측정한 결과,
              <strong style={{ color: 'var(--text)' }}>세 굵기 사이에 어느 근육에서도 유의한 차이가 없었습니다</strong>.
              1/4인치면 위 테니스 표 기준 두 단계에 해당하는 큰 차이입니다. 저자들은 학회(AOSSM 미국정형외과스포츠의학회)
              보도자료에서 &ldquo;그런 (부상 예방 목적의 그립 사이즈) 권고에는 과학적 근거가 없다&rdquo;고 논평하며,
              측정법은 출발점으로 쓰되 실제 선택은 가장 편하게 느껴지는 굵기로 하라고 권했습니다.
            </p>
          </div>
          <p className="g-p">
            물론 한계도 분명합니다. 통증이 없는 선수들의 순간적인 근육 활동만 본 실험실 연구라서, 그립 굵기가 실제 부상
            발생률을 바꾸는지에 대한 근거는 여전히 제한적입니다. &lsquo;가늘어도 무해하다&rsquo;는 단정도 &lsquo;가늘면 위험하다&rsquo;는
            단정도 어렵다는 뜻입니다. 다만 분명한 것은, <strong>권장 치수 근처의 한두 단계 차이에
            과민할 이유가 연구로는 확인되지 않는다</strong>는 점입니다.
          </p>
          <p className="g-p">
            참고로 본 도구의 자 측정 방식 — <strong>근위 손바닥 주름(손바닥 안쪽 큰 주름)에서 약지
            끝까지의 거리</strong> — 는 Nirschl이 제안한 측정법으로, 라켓 제조사들이 권장 그립 사이즈를 정할 때 널리 쓰는
            업계 표준 관행이라는 사실이 같은 논문(Hatch 2006) 본문에 명시돼 있습니다. 측정법 자체는 출처가 분명한 셈이고,
            연구가 유보하는 것은 &lsquo;거기서 벗어나면 다친다&rsquo;는 주장 쪽입니다.
          </p>
          <p className="g-p">
            실전 기준은 이렇게 정리됩니다. ① 측정값(본 도구 추천)으로 출발 ② 시타에서 쥐었을 때 편하고 스트로크 중 그립이
            돌지 않는 굵기를 선택 ③ 애매하면 작은 쪽 + 오버그립 미세 조정(위 섹션). 그리고 팔꿈치·손목 통증이 몇 주째
            계속된다면 그립 교체로 해결을 기대하기보다 <strong>플레이 시간·빈도를 줄이고 의료 상담을
            받는 것이 순서</strong>입니다.
          </p>
          <Callout tone="tip" title="지금 쓰는 라켓 사이즈 확인법">
            테니스 라켓은 <strong>손잡이 끝 버트캡</strong>에 유럽식 번호(2 = L2)나 인치 표기가 각인·인쇄돼 있고, 배드민턴 라켓은 버트캡·콘 부근
            스티커의 무게·그립 표기(3U G5 식)로 확인합니다. 오버그립을 이미 감아 둔 라켓은 표기 사이즈보다 실제 둘레가
            반 단계~한 단계 굵어져 있으니, 매장 시타 때는 감긴 상태 그대로 비교하세요.
          </Callout>
          <p className="g-note">
            출처: Hatch GF 외, Am J Sports Med 2006;34(12):1977-1983 (PMID 16861576) · 저자 논평: AOSSM 보도자료(2006)
          </p>
        </section>

        {/* 7. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/sports/golf-distance" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>골프 비거리 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>클럽별 비거리·환경 보정</div>
            </Link>
            <Link href="/tools/sports/golf-handicap" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⛳</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>골프 핸디캡</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>WHS 핸디캡 자동 관리</div>
            </Link>
            <Link href="/tools/sports/golf-cost" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏌️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>골프 비용 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>그린피·정산</div>
            </Link>
            <Link href="/tools/sports/one-rm" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏋️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1RM 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>최대 무게 추정</div>
            </Link>
            <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>훈련 페이스</div>
            </Link>
            <Link href="/tools/unit/size" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛍️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>사이즈 변환기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>의류·신발 한국 사이즈</div>
            </Link>
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
