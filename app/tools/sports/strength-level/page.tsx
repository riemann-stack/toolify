import Link from 'next/link'
import StrengthLevelClient from './StrengthLevelClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { AGE_BAND_LABEL, AGE_FACTOR, FEMALE_FACTOR, BIG3_BASE_LEVELS, adjustLevels, type AgeBand } from '../one-rm/oneRMUtils'
import { wilks, dots, ipfGL } from './strengthUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/strength-level',
  title: '파워리프팅·스트렝스 레벨 계산기 — 3대 합·Wilks·DOTS·IPF GL + 시도 전략·대회 원판',
  description:
    '스쿼트·벤치·데드 3대 합과 Wilks·DOTS·IPF GL 점수, 입문~엘리트 레벨에 더해 대회 1·2·3차 시도 전략, IPF 색상 원판 세팅, 합계·점수 추이 저장까지. 체급·성별 무관 비교.',
  keywords: ['파워리프팅계산기', '스트렝스레벨', '3대측정', '3대중량', '윌크스계산기', 'DOTS점수', 'IPFGL', 'IPF점수', '파워리프팅토탈', '대회시도', '오프너', '3대500', '체중대비근력', '벤치스쿼트데드'],
})

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
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}

/* ── 기준표 — 계산기와 같은 단일 소스(oneRMUtils)에서 빌드 시 생성 ── */
const LIFT_ROWS = [
  { key: 'squat' as const, label: '스쿼트' },
  { key: 'bench' as const, label: '벤치프레스' },
  { key: 'deadlift' as const, label: '데드리프트' },
]
const TIERS = ['초보', '중급', '상급', '엘리트'] as const
const TOTAL_BASE = TIERS.map((t) => LIFT_ROWS.reduce((a, l) => a + BIG3_BASE_LEVELS[l.key][t], 0))
const AGE_BANDS = Object.keys(AGE_FACTOR) as AgeBand[]
/* 배수 표기 — 소수 셋째 자리까지, 정수·한 자리 값도 최소 소수 1자리(1.0×·2.0×) */
const x = (n: number) => {
  const r = Math.round(n * 1000) / 1000
  return `${Number.isInteger(r) ? r.toFixed(1) : String(r)}×`
}
/* 경계 예시 — 체중 75kg 남성 20대 */
const EX_BW = 75
const MID_TOTAL = TOTAL_BASE[1] * EX_BW // 중급 문턱(kg)

/* 3대 500kg의 체중별 점수(남성) — 계산기와 같은 strengthUtils 함수로 빌드 시 계산 */
const SCORE_500 = [60, 70, 80, 90, 100, 110].map((bw) => ({
  bw,
  wilks: wilks(500, bw, 'male'),
  dots: dots(500, bw, 'male'),
  gl: ipfGL(500, bw, 'male'),
}))
const DOTS_DROP_PCT = Math.round((1 - SCORE_500[5].dots / SCORE_500[0].dots) * 100)
/* 연령·성별 보정 예시 — 40대 여성 벤치 중급 문턱(도구 판정과 같은 adjustLevels 반올림값) */
const F40_BENCH = adjustLevels(BIG3_BASE_LEVELS.bench, 'female', '40-50')

const FAQ_LD = [
  { q: '3대 운동이 뭔가요? 왜 이 세 가지인가요?', a: '3대 운동은 <strong>스쿼트·벤치프레스·데드리프트</strong>를 말합니다. 하체·상체 밀기·전신 당기기를 대표하는 복합 다관절 운동으로, 세 종목의 1RM 합(3대 합)이 전신 근력의 표준 지표로 널리 쓰입니다. 파워리프팅 경기 종목도 이 세 가지입니다.' },
  { q: 'Wilks 점수와 DOTS 점수는 무슨 차이인가요?', a: '둘 다 <strong>체중이 다른 사람의 근력을 공정하게 비교</strong>하기 위한 보정 점수이고, 계산 구조(합계 × 500 ÷ 체중 다항식)도 같습니다. Wilks는 1990년대부터 IPF가 2018년까지 공식 순위에 써서 인지도가 높고, DOTS는 2019년 전후 최신 기록 데이터로 다시 맞춘 공식으로 IPF 밖의 여러 연맹과 OpenPowerlifting 같은 기록 집계에서 널리 쓰입니다. IPF 자체는 현재 GL 점수를 씁니다. 본 도구는 세 점수를 모두 보여줍니다.' },
  { q: '레벨(입문~엘리트)은 어떤 기준으로 나뉘나요?', a: '체중 대비 1RM 비율을 기준으로 합니다. 예를 들어 20대 남성 벤치프레스는 체중의 0.5배=초보, 1.0배=중급, 1.25배=상급, 1.5배 이상=엘리트입니다. 본 도구는 <strong>1RM 계산기와 동일한 기준</strong>을 사용하며, 성별·연령에 따라 자동 보정합니다. 이 배수표는 공식 연맹 기준이 아니라 헬스·코칭 현장에서 통용되는 값을 정리한 추정 기준입니다.' },
  { q: '여성인데 점수가 낮게 나와요. 정상인가요?', a: '레벨 기준은 성별 보정이 적용되므로 <strong>같은 레벨이라도 여성의 절대 무게 기준은 더 낮습니다</strong>(체중 대비 약 0.7배). Wilks·DOTS·IPF GL은 성별마다 다른 계수를 써서 남녀 점수를 한 줄로 비교할 수 있게 설계돼 있습니다. 예를 들어 체중 60kg 여성의 3대 300kg은 DOTS 약 333점으로, 체중 80kg 남성의 3대 500kg(약 345점)과 비슷한 수준입니다.' },
  { q: "'3대 500'이면 어느 정도 수준인가요?", a: "체중에 따라 다릅니다. 체중 70~80kg 남성 기준 3대 합 500kg은 체중의 6.25~7.1배로, 본 기준표(엘리트 = 6.0배 이상)로는 <strong>엘리트</strong> 구간입니다. 헬스 커뮤니티에서 흔히 '상급의 상징'처럼 불리지만, 체중 대비로 보면 그보다 높은 수준입니다. 반면 체중 100kg이라면 같은 500kg도 5.0배(상급 구간)이고 DOTS도 80kg일 때 약 345점에서 약 308점으로 내려갑니다 — 그래서 보정 점수를 함께 보는 것이 정확합니다." },
  { q: '1RM을 직접 측정하지 않았는데 어떻게 입력하나요?', a: "실제 1RM 시도는 부상 위험이 크므로, 5회 정도 들 수 있는 무게로 <a href='/tools/sports/one-rm'>1RM 계산기</a>를 이용해 추정한 값을 넣으면 됩니다. 반복 횟수가 적을수록(10회 이하) 추정이 실제에 가깝고, 레벨 판정 정도에는 충분합니다. 대회 시도 무게를 정할 때는 추정치보다 최근 실제로 든 무게를 기준으로 하세요." },
  { q: '이 점수가 대회 공식 기록과 같나요?', a: 'Wilks·DOTS·IPF GL 계산식 자체는 공개된 계수와 동일하지만, 본 도구는 <strong>참고용 시뮬레이션</strong>입니다. 공식 기록은 심판 판정(스쿼트 깊이·벤치 정지·락아웃 등)을 통과한 시도만 인정되며, 계체 체중을 쓰고, 클래식(논장비)·장비 부문이 따로 집계됩니다.' },
  { q: 'IPF GL 점수는 Wilks·DOTS와 뭐가 다른가요?', a: 'IPF GL(Goodlift) Points는 IPF가 2020년 5월 1일부터 모든 공인 대회 순위에 쓰는 점수로, 다항식인 Wilks·DOTS와 달리 <strong>지수식</strong>을 씁니다(약 100이 세계 정상권). 본 도구는 <strong>클래식(논장비) 풀파워</strong> 계수를 사용하며, 장비 부문이나 벤치 단일 종목은 계수가 달라 값이 다릅니다. 셋 다 체급·성별이 다른 선수를 한 줄로 세우는 같은 목적입니다.' },
  { q: '대회 1·2·3차 시도는 어떻게 잡아야 하나요?', a: '흔히 쓰는 배분은 <strong>1차 ≈ 1RM의 90%(내림)</strong>, 2차 ≈ 95%, 3차 = 현재 1RM 또는 PR(+2.5~5kg)입니다. 1차(오프너)는 컨디션이 나빠도 거의 확실히 드는 무게여야 합니다 — 3번 다 실패하면 그 종목 기록이 없어 합계 자체가 성립하지 않기 때문입니다. [시도 전략] 탭이 2.5kg 단위로 제안하지만, 당일 컨디션·코치 판단이 우선입니다.' },
  { q: '체급을 맞추려고 단기 감량을 해도 되나요?', a: '급격한 수분·체중 감량은 근력 저하·탈진·건강 위험이 크고, 본 도구는 감량 계획을 제공하지 않습니다. 계체 후 회복 시간이 짧은 대회도 많으니 <strong>무리한 단기 감량은 권장하지 않습니다</strong>. 점수는 어차피 체중 보정이 되므로, 체급에 집착하기보다 안전한 범위에서 준비하세요.' },
  { q: '보충제·약물로 기록을 올려도 되나요?', a: '<strong>절대 안 됩니다.</strong> 파워리프팅은 도핑 검사가 엄격하며, 금지약물 적발 시 자격 정지·기록 말소됩니다. 한국도핑방지위원회(KADA) 홈페이지의 금지약물 검색으로 복용 중인 의약품·보충제 성분을 확인하세요. 금지목록은 세계도핑방지기구(WADA)가 매년 갱신합니다.' },
]

export default function StrengthLevelPage() {
  return (
    <ToolPage width={880} slug="/tools/sports/strength-level">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />파워리프팅 계산기
      </h1>
      <p className="tp-lead">
        3대(스쿼트·벤치·데드) 합과 <strong style={{ color: 'var(--text)' }}>Wilks·DOTS·IPF GL 점수</strong>·레벨에 더해, 대회 <strong style={{ color: 'var(--text)' }}>1·2·3차 시도 전략</strong>·IPF 색상 원판·기록 추이까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="IPF GL 2020 계수(클래식 풀파워) · Wilks(원판)·DOTS 공개 계수 · IPF 기술규정(원판·칼라) · 레벨 배수표는 Youtil 추정 기준"
        sources={[
          { label: 'IPF — IPF GL Formula', href: 'https://www.powerlifting.sport/rules/codes/info/ipf-formula' },
          { label: 'IPF GL Coefficients 2020 (PDF)', href: 'https://www.powerlifting.sport/fileadmin/ipf/data/ipf-formula/IPF_GL_Coefficients-2020.pdf' },
          { label: '한국도핑방지위원회(KADA)', href: 'https://www.kada-ad.or.kr/' },
        ]}
      />

      <StrengthLevelClient />

      <GuideDivider />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      {/* 1. 스트렝스 레벨이란 */}
      <h2 className="g-h2">스트렝스 레벨이란?</h2>
      <p className="g-p">
        스트렝스 레벨은 <strong>절대 무게가 아니라 체중 대비 상대 근력</strong>으로 내 위치를 가늠하는 지표입니다.
        같은 100kg 벤치라도 체중 60kg과 100kg은 의미가 전혀 다르기 때문에, 체중·성별·연령을 함께 봐야 공정합니다.
        본 도구는 <strong>입문 → 초보 → 중급 → 상급 → 엘리트</strong> 5단계로 평가합니다.
      </p>

      {/* 2. 3대 운동 레벨 기준표 */}
      <h2 className="g-h2">3대 운동 체중 대비 레벨 기준표</h2>
      <p className="g-p">
        20대 남성 기준 (체중 대비 1RM 배수)입니다. 도구에서 성별·연령을 선택하면 자동 보정된 값으로 평가되며,
        <Link href="/tools/sports/one-rm"> 1RM 계산기</Link>와 동일한 기준을 사용합니다. 각 배수 이상이면 그 레벨이고, 초보 배수에 못 미치면 입문입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>종목</th>
              {TIERS.map((t) => <th scope="col" key={t} style={headCell}>{t}</th>)}
            </tr>
          </thead>
          <tbody>
            {LIFT_ROWS.map((l) => (
              <tr key={l.key}>
                <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 500 }}>{l.label}</th>
                {TIERS.map((t, i) => <td key={t} style={cell}>{x(BIG3_BASE_LEVELS[l.key][t])}{i === 3 ? '+' : ''}</td>)}
              </tr>
            ))}
            <tr>
              <th scope="row" style={{ ...cell, textAlign: 'left' }}><strong>3대 합</strong></th>
              {TOTAL_BASE.map((v, i) => <td key={i} style={{ ...cell, fontWeight: 700 }}>{x(v)}{i === 3 ? '+' : ''}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        예) 체중 {EX_BW}kg 남성은 3대 합 <strong>281kg이면 3.74배 → 초보</strong>, <strong>282kg(3.76배)부터 중급</strong>입니다(중급 문턱은 체중의 {x(TOTAL_BASE[1])} = 약 {MID_TOTAL.toFixed(1)}kg). {TOTAL_BASE[3] * EX_BW}kg이면 {TOTAL_BASE[3].toFixed(1)}배 → 엘리트입니다.
        화면의 배수는 판정과 어긋나지 않도록 소수 둘째 자리에서 내림해 표시합니다.
      </p>

      {/* 3. 계산 방식과 예시 */}
      <h2 className="g-h2">점수 계산식과 예시</h2>
      <p className="g-p">
        세 보정 점수는 모두 <strong>3대 합(kg)을 체중으로 정해지는 분모로 나누는</strong> 구조입니다. 체중이 가벼울수록 분모가 작아져 같은 합계에서 점수가 높게 나옵니다.
      </p>
      <ul className="g-list">
        <li><strong>Wilks·DOTS</strong> — 점수 = 합계 × 500 ÷ (체중의 다항식). Wilks는 5차, DOTS는 4차 다항식이며 남녀 계수가 따로 있습니다.</li>
        <li><strong>IPF GL</strong> — 점수 = 100 × 합계 ÷ (A − B·e<sup>−C×체중</sup>). 클래식 풀파워 남성 계수는 A 1199.72839 · B 1025.18162 · C 0.00921, 여성은 A 610.32796 · B 1045.59282 · C 0.03048입니다.</li>
        <li><strong>레벨</strong> — 종목별 1RM ÷ 체중을 위 배수표(성별·연령 계수를 곱한 값)와 비교합니다. 3대 합 레벨은 세 종목 배수를 더한 문턱을 씁니다.</li>
      </ul>
      <p className="g-p">
        계산기 기본값인 <strong>체중 75kg 20대 남성, 스쿼트 100 · 벤치 70 · 데드 130kg</strong>을 넣으면 3대 합 300kg(체중의 4.00배)으로 종합 <strong>중급</strong>이고,
        DOTS 215.2 · Wilks 213.8 · IPF GL 43.7이 나옵니다. 종목별로는 스쿼트 1.33배(중급)·데드 1.73배(중급)인데 벤치는 0.93배라 초보이며,
        벤치를 75kg(+5kg)으로 올리면 중급 문턱(1.0배)을 넘습니다.
      </p>
      <p className="g-p">같은 3대 합 500kg이라도 체중에 따라 보정 점수가 얼마나 달라지는지 계산기 공식으로 뽑아 보면 다음과 같습니다(남성).</p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>체중</th>
              <th scope="col" style={headCell}>체중 대비</th>
              <th scope="col" style={headCell}>Wilks</th>
              <th scope="col" style={headCell}>DOTS</th>
              <th scope="col" style={headCell}>IPF GL</th>
            </tr>
          </thead>
          <tbody>
            {SCORE_500.map((r) => (
              <tr key={r.bw}>
                <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 500 }}>{r.bw}kg</th>
                <td style={cell}>{(500 / r.bw).toFixed(2)}배</td>
                <td style={cell}>{r.wilks.toFixed(1)}</td>
                <td style={cell}>{r.dots.toFixed(1)}</td>
                <td style={cell}>{r.gl.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        체중 60kg에서 110kg으로 갈 때 DOTS는 약 {DOTS_DROP_PCT}% 낮아집니다. 같은 합계라면 가벼운 쪽 점수가 높은 것은, 체중이 무거울수록 더 많이 들 수 있다는 점을 보정한 결과입니다.
      </p>

      {/* 4. Wilks vs DOTS vs IPF GL */}
      <h2 className="g-h2">Wilks · DOTS · IPF GL — 세 보정 점수</h2>
      <p className="g-p">
        모두 체중이 다른 사람의 근력을 한 줄로 세우기 위한 <strong>계수 보정 점수</strong>입니다.
        만들어진 시기와 쓰이는 곳이 달라, 같은 기록이라도 어떤 점수로 비교하는지 확인해야 합니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>구분</th>
              <th scope="col" style={headCell}>Wilks</th>
              <th scope="col" style={headCell}>DOTS</th>
              <th scope="col" style={headCell}>IPF GL</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>도입</td><td style={cell}>1990년대 (Robert Wilks)</td><td style={cell}>2019 전후</td><td style={cell}>2020년 5월 (IPF 공식)</td></tr>
            <tr><td style={cell}>특징</td><td style={cell}>오랜 표준, 높은 인지도</td><td style={cell}>최신 기록 데이터로 재보정</td><td style={cell}>엘리트 기록 회귀분석 기반</td></tr>
            <tr><td style={cell}>형태</td><td style={cell}>5차 다항식</td><td style={cell}>4차 다항식</td><td style={cell}>지수식 (100=세계 정상권)</td></tr>
            <tr><td style={cell}>활용</td><td style={cell}>IPF 공식 순위(2018년까지)·예전 기록</td><td style={cell}>IPF 밖 여러 연맹·기록 집계</td><td style={cell}>IPF 공인 대회 순위</td></tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        IPF는 2018년 말 Wilks를 내려놓고 2019년 자체 IPF 포뮬러를 썼다가, 2020년 5월 1일부터 GL 점수로 바꿨습니다. 본 도구의 IPF GL은 <strong>클래식(논장비) 풀파워</strong> 2020 계수를 사용하며, 장비(기어드)·벤치 단일 종목은 계수가 달라 값이 다릅니다. Wilks는 2020년에 개정판(Wilks2)도 나왔지만, 본 도구는 커뮤니티에서 가장 많이 쓰는 원판 계수를 씁니다.
      </p>

      {/* 5. 대회 시도·원판 */}
      <h2 className="g-h2">대회 시도 전략과 원판 세팅</h2>
      <p className="g-p">
        파워리프팅 대회는 종목별 <strong>3번의 시도</strong>가 주어지고, 성공한 가장 무거운 무게가 합계에 들어갑니다. [시도 전략] 탭에서 1RM을 넣으면 흔히 쓰는 배분을 제안합니다.
      </p>
      <div style={{ ...card }}>
        <ul className="g-list" style={{ margin: 0 }}>
          <li><strong>1차(오프너)</strong> — 1RM의 약 90%를 <strong>내림</strong>. 거의 100% 성공해야 하는 무게로, 한 종목을 세 번 다 실패하면 합계가 성립하지 않는 사태를 막는 보험입니다.</li>
          <li><strong>2차</strong> — 약 95%. 컨디션이 좋으면 PR 발판, 나쁘면 합계 확보.</li>
          <li><strong>3차</strong> — 현재 1RM(≈100%) 또는 PR 도전 시 +2.5~5kg. 욕심내 실패하면 2차 무게가 기록됩니다.</li>
          <li><strong>원판</strong> — IPF 규정상 대회 봉은 20kg, 칼라는 한쪽 2.5kg이라 빈 봉만으로 25kg입니다. 일반 시도 무게는 2.5kg 단위로 세팅되고, 기록 경신 시도에서만 더 작은 원판으로 0.5kg 단위 등이 허용됩니다.</li>
        </ul>
      </div>
      <p className="g-note">
        원판 색은 IPF 규정이 25kg 빨강·20kg 파랑·15kg 노랑만 정하고 10kg 이하는 색을 제한하지 않습니다. [대회 원판] 탭의 10kg 초록·5kg 흰색은 역도(IWF) 규격과 대다수 제조사가 따르는 관례 색입니다.
      </p>

      {/* 6. 점수 해석 가이드 */}
      <h2 className="g-h2">DOTS · Wilks 점수 해석 가이드</h2>
      <p className="g-p">
        대략적인 해석 기준입니다 (남녀 공통, 점수 자체가 성별 보정을 포함). 절대선이 아니라 <strong>참고 구간</strong>으로 보세요. IPF GL은 척도가 달라(약 100 = 세계 정상권) 이 표에 넣지 않았습니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>점수</th>
              <th scope="col" style={headCell}>해석</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong style={{ color: 'var(--muted)' }}>~200</strong></td><td style={cell}>입문~초급 — 기본기 다지는 단계</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--sky-500)' }}>200~300</strong></td><td style={cell}>중급 — 꾸준히 훈련한 일반 헬스인</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--orange-600)' }}>300~400</strong></td><td style={cell}>상급 — 상위권 동호인</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--red-600)' }}>400~500</strong></td><td style={cell}>매우 우수 — 지역 대회 입상권</td></tr>
            <tr><td style={cell}><strong style={{ color: 'var(--purple-600)' }}>500+</strong></td><td style={cell}>엘리트급 — 전국·국제 수준</td></tr>
          </tbody>
        </table>
      </div>

      {/* 7. 성별·연령 보정 */}
      <h2 className="g-h2">성별·연령 보정 — 같은 무게라도 평가가 달라집니다</h2>
      <p className="g-p">
        레벨 기준은 20대 남성을 기준으로, 여성·고연령일수록 같은 레벨에 더 낮은 절대 무게로 도달하도록 보정합니다
        (<Link href="/tools/sports/one-rm">1RM 계산기</Link>와 동일). 여성 계수 {FEMALE_FACTOR}에 연령 계수를 곱한 값입니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>구분</th>
              {AGE_BANDS.map((a) => <th scope="col" key={a} style={headCell}>{AGE_BAND_LABEL[a]}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" style={{ ...cell, textAlign: 'left' }}><strong>남성</strong></th>
              {AGE_BANDS.map((a) => <td key={a} style={cell}>{x(AGE_FACTOR[a])}</td>)}
            </tr>
            <tr>
              <th scope="row" style={{ ...cell, textAlign: 'left' }}><strong>여성</strong></th>
              {AGE_BANDS.map((a) => <td key={a} style={cell}>{x(AGE_FACTOR[a] * FEMALE_FACTOR)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        이 계수는 레벨 <strong>기준 무게</strong>에 곱해집니다. 예를 들어 40대 여성의 벤치 중급 문턱은 {BIG3_BASE_LEVELS.bench.중급.toFixed(1)} × {Math.round(AGE_FACTOR['40-50'] * FEMALE_FACTOR * 1000) / 1000} = {Math.round(BIG3_BASE_LEVELS.bench.중급 * AGE_FACTOR['40-50'] * FEMALE_FACTOR * 1000) / 1000}배이고, 도구는 문턱을 소수 둘째 자리로 반올림해 <strong>체중의 {F40_BENCH.중급.toFixed(2)}배</strong>부터 중급으로 판정합니다(1RM 계산기와 같은 기준). Wilks·DOTS·IPF GL 점수는 별도의 공식으로 계산되어 연령 보정과 무관합니다.
      </p>

      {/* 8. 안전·면책 */}
      <h2 className="g-h2">안전 주의사항</h2>
      <Callout tone="warn" title="레벨보다 부상 없는 훈련이 먼저">
        <ul className="g-list" style={{ margin: 0 }}>
          <li><strong>실제 1RM 시도는 신중히</strong> — 워밍업 후, 스포터·세이프티를 확보하고 시도하세요. 초보자는 추정값 사용을 권장합니다.</li>
          <li><strong>통증은 즉시 중단</strong> — 관절·허리 통증은 부상 신호입니다. 지속되면 정형외과·재활의학과 전문의와 상담하세요.</li>
          <li><strong>95%+·대회 시도는 스포터·세이프티 필수</strong> — 오프너부터 무리하지 말고, 폼이 무너지면 중량을 내리세요.</li>
          <li><strong>도핑·무리한 체급 감량 금지</strong> — 금지약물은 KADA에서 확인하고, 급격한 단기 감량은 건강·기록 모두에 해롭습니다.</li>
        </ul>
        <p style={{ margin: '10px 0 0' }}>
          본 도구는 <strong>참고용 시뮬레이션</strong>이며 의학적·코칭 조언이 아닙니다. 레벨 배수표는 통용 기준을 근사한 추정값이고, 체급·골격·종목 특성에 따라 개인차가 큽니다.
        </p>
      </Callout>

      {/* 9. FAQ */}
      <Faq items={FAQ_LD} />

      {/* 10. 관련 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/sports/one-rm" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏋️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>1RM 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>최대 중량 추정 + 훈련 중량표</div>
        </Link>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체질량지수·체지방률 추정</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>증량·감량 칼로리 기준</div>
        </Link>
        <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃‍♂️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>유산소·컨디셔닝 병행</div>
        </Link>
      </div>
    </ToolPage>
  )
}
