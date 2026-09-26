import Link from 'next/link'
import VO2MaxClient from './VO2MaxClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  calcCooper, calcMile15, calcRockport, calcQueens, calcNorway, calcHRR,
  getNormBand, predictRaces, trainingPaces, fmtTime, fmtPace, RACE_PREDICT_MIN_VO2,
} from './vo2maxData'

export const metadata = buildMetadata({
  path: '/tools/sports/vo2max',
  title: 'VO₂ Max 계산기 — 쿠퍼·1.5마일·락포트·노르웨이 6가지 방법',
  description:
    '쿠퍼 12분·1.5마일 달리기·락포트 1마일 걷기·퀸즈칼리지 스텝·노르웨이 비운동·안정시 심박 6가지 VO₂max 추정 + 동년배 5단계 등급 + 마라톤·5K·10K·하프 예상 시간 + 강도별 트레이닝 페이스.',
  keywords: [
    'VO2max 계산기', 'VO₂ Max', '심폐지구력 측정', '쿠퍼 12분 테스트',
    '1.5마일 테스트', '락포트 워킹', '퀸즈칼리지 스텝',
    '노르웨이 VO2max', 'NTNU VO2', '안정시 심박수 VO2',
    '러닝 체력 측정', '심폐 체력', 'VDOT', 'Daniels VDOT',
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
const cellNum: React.CSSProperties = { ...cell, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}

/* ── 계산 예시 — 도구와 같은 추정식(vo2maxData)으로 빌드 시 계산 ── */
const r1 = (n: number) => n.toFixed(1)
const EXAMPLES = [
  { name: '쿠퍼 12분', formula: '(12분 달린 거리 m − 504.9) ÷ 44.73', input: '12분 동안 2,400m', v: calcCooper(2400) },
  { name: '1.5마일(2.4km)', formula: '88.02 + 3.716×(남 1·여 0) − 0.0753×체중(lb) − 2.767×기록(분)', input: '남성 70kg, 12분 00초', v: calcMile15(12, 70, 'male') },
  { name: '락포트 1마일 걷기', formula: '132.853 − 0.0769×체중(lb) − 0.3877×나이 + 6.315×(남 1·여 0) − 3.2649×기록(분) − 0.1565×도착 직후 심박', input: '남성 45세 70kg, 15분 00초, 심박 130', v: calcRockport(15, 130, 70, 45, 'male') },
  { name: '퀸즈칼리지 스텝', formula: '남 111.33 − 0.42×회복 심박 / 여 65.81 − 0.1847×회복 심박', input: '남성, 회복 심박 150', v: calcQueens(150, 'male') },
  { name: '노르웨이 비운동', formula: '남 100.27 − 0.296×나이 − 0.369×허리(cm) − 0.155×안정 심박 + 0.226×활동 지수 (여성은 별도 계수)', input: '남성 40세, 허리 85cm, 안정 심박 60, 활동 지수 6', v: calcNorway({ age: 40, sex: 'male', waistCm: 85, hrRest: 60, paIndex: 6 }) },
  { name: '안정시 심박 비율', formula: '15.3 × (220 − 나이) ÷ 안정시 심박', input: '40세, 안정시 심박 60', v: calcHRR(60, 40) },
]

/* ── 연령·성별 5단계 기준 — 도구의 판정 함수(getNormBand)에서 그대로 생성 ── */
const AGE_ROWS = [
  { label: '20대', age: 25 }, { label: '30대', age: 35 }, { label: '40대', age: 45 },
  { label: '50대', age: 55 }, { label: '60대+', age: 65 },
]
const bandCells = (age: number, sex: 'male' | 'female') => {
  const b = getNormBand(age, sex)
  // 계산기 결과 화면과 같은 표기 — 각 구간은 앞 값 이상·뒤 값 미만 (소수 결과도 빈틈없이 한 구간에 들어감)
  return [`< ${b.below}`, `${b.below}~${b.average}`, `${b.average}~${b.good}`, `${b.good}~${b.excellent}`, `${b.excellent}+`]
}
const M20 = getNormBand(25, 'male'), M60 = getNormBand(65, 'male')

/* ── VO₂max(=VDOT)별 예상 기록·훈련 페이스 — predictRaces·trainingPaces(lib/running) ── */
const VDOT_ROWS = [35, 40, 45, 50, 55, 60].map((v) => ({ v, race: predictRaces(v), pace: trainingPaces(v) }))
const V50 = predictRaces(50)

const FAQ_LD = [
  {
    q: '6가지 방법 중 무엇으로 재야 하나요?',
    a: '실험실에서 호흡가스를 분석하며 트레드밀·자전거 부하를 올리는 <strong>최대 운동부하검사(CPET)</strong>가 기준이고, 이 도구의 6가지는 모두 그 값을 짐작하는 추정식입니다. 상황별로 고르면: <strong>달리기가 가능한 사람</strong>은 쿠퍼 12분 또는 1.5마일, <strong>초보·고령·관절 부담이 있는 사람</strong>은 락포트 1마일 걷기, <strong>실내에서</strong>는 퀸즈칼리지 스텝테스트, <strong>운동 검사가 어려우면</strong> 노르웨이 비운동 추정이 알맞습니다. 안정시 심박 비율법은 가장 간단하지만 오차가 커서 추세 확인용으로만 쓰세요.',
  },
  {
    q: '같은 날 두 방법으로 쟀는데 결과가 다르게 나와요.',
    a: '정상입니다. 추정식마다 만든 연구의 대상자(나이·성별·체력 수준)와 넣는 변수가 달라서, 같은 사람이라도 방법에 따라 수 mL/kg/min씩 차이가 납니다. 예를 들어 안정시 심박 비율법은 최대심박을 220 − 나이로 가정하므로 실제 최대심박이 이 값과 다르면 결과가 크게 흔들립니다. <strong>한 가지 방법을 정해 같은 조건에서 반복 측정</strong>하고 그 변화를 보는 것이 가장 쓸모 있습니다.',
  },
  {
    q: 'VO₂max는 얼마까지 올릴 수 있나요?',
    a: '출발점과 유전적 소질에 따라 다릅니다. 미국·캐나다 가족 단위 훈련 연구(HERITAGE)에서는 운동하지 않던 상태의 VO₂max 차이 중 약 절반(유전율 약 50%)이, 20주 훈련 후 늘어난 폭의 차이도 절반 가까이(약 47%)가 가족(유전) 요인으로 설명됐습니다(Bouchard 1998·1999). 같은 프로그램을 해도 많이 오르는 사람과 거의 안 오르는 사람이 있다는 뜻입니다. 운동하지 않던 사람이 몇 달 꾸준히 유산소 훈련을 하면 두 자릿수 퍼센트 향상도 흔하지만, 이미 잘 훈련된 사람은 향상 폭이 작아집니다.',
  },
  {
    q: '나이가 들면 VO₂max는 얼마나 떨어지나요?',
    a: `일반적으로 성인기 이후 10년에 약 10% 안팎씩 줄어든다고 알려져 있습니다. 이 도구의 등급 기준에서도 남성 「평균」 구간의 하한이 20대 ${M20.average}에서 60대 이상 ${M60.average}로 낮아집니다. 꾸준히 지구력 운동을 하는 사람은 같은 나이의 비활동인보다 훨씬 높은 수준을 유지하는 경우가 많으므로, 나이 자체보다 <strong>동년배 등급과 본인 추세</strong>를 보는 것이 좋습니다.`,
  },
  {
    q: 'VO₂max가 낮으면 무엇이 문제인가요?',
    a: '심폐체력은 사망 위험과 강하게 연관된 지표입니다. 트레드밀 검사를 받은 약 12만 명을 추적한 연구(Mandsager 2018, JAMA Network Open)에서 심폐체력 하위 25% 집단은 최상위(상위 약 2%) 집단보다 사망 위험이 약 5배(HR 5.04) 높았고, 그 차이는 흡연·당뇨·고혈압 같은 전통적 위험 요인과 비슷하거나 더 컸습니다. 메타분석(Kodama 2009, JAMA)에서는 심폐체력이 1 MET(3.5 mL/kg/min) 높을 때마다 전체 사망 위험이 약 13% 낮았습니다. 「매우 미흡」 단계라면 의사와 상담한 뒤 가벼운 유산소 운동부터 점진적으로 시작하세요.',
  },
  {
    q: '스마트워치의 VO₂max와 이 계산기 값이 다른데 어느 쪽을 믿어야 하나요?',
    a: '워치는 야외 걷기·달리기 중 <strong>속도(GPS)와 심박의 관계</strong>로 VO₂max를 추정하고, 이 도구는 한 번의 테스트 결과를 연구 추정식에 넣습니다. 둘 다 실측이 아닌 추정이라 수 mL/kg/min 차이는 흔합니다. 워치 값은 오르막·강풍·더위·광학 심박 센서의 일시적 오류에 영향을 받고, 테스트 값은 그날 컨디션과 페이스 배분에 영향을 받습니다. 어느 한 값의 절대치보다 <strong>같은 도구로 3~6개월 추세</strong>를 비교하는 편이 믿을 만합니다.',
  },
  {
    q: '마라톤 예상 시간은 어떻게 계산되나요?',
    a: `추정한 VO₂max를 Daniels의 VDOT와 같은 값으로 보고, 그 VDOT로 뛸 수 있는 거리별 기록을 역산합니다(예: VO₂max 50 → 5km ${fmtTime(V50.fiveK)} · 풀코스 ${fmtTime(V50.fullM)}). 걷기 테스트(락포트)이거나 VO₂max가 ${RACE_PREDICT_MIN_VO2} 미만이면 오차가 커서 예측을 표시하지 않습니다. VDOT는 실제 레이스 기록에서 구하는 「달리기 성능 지수」라 실험실 VO₂max와 같지 않고, 실제 기록은 젖산 역치·러닝 이코노미·훈련량·당일 날씨에 따라 크게 달라집니다. 레이스 기록이 있다면 <a href="/tools/sports/race-predictor">마라톤 기록 계산기</a>가 더 정확합니다.`,
  },
]

export default function VO2MaxPage() {
  return (
    <ToolPage width={880} slug="/tools/sports/vo2max">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />VO₂ Max 계산기
      </h1>
      <p className="tp-lead">
        쿠퍼·1.5마일·락포트·노르웨이 등 <strong style={{ color: 'var(--text)' }}>6가지 방법</strong>으로 심폐 체력(VO₂max) 추정 + 동년배 5단계 등급 + 마라톤 예상 시간 + 강도별 트레이닝 페이스.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="추정식 — Cooper(1968)·George(1993)·Kline(1987)·McArdle(1972)·Nes(2011)·Uth(2004), 예상 기록 — Daniels·Gilbert VDOT"
        sources={[
          { label: 'Mandsager 외(2018) 심폐체력과 장기 사망률 — JAMA Network Open', href: 'https://doi.org/10.1001/jamanetworkopen.2018.3605' },
          { label: 'Kodama 외(2009) 심폐체력과 사망 위험 메타분석 — JAMA', href: 'https://doi.org/10.1001/jama.2009.681' },
          { label: '국민체력100 — 국민체육진흥공단 체력 측정', href: 'https://nfa.kspo.or.kr' },
        ]}
      />

      <VO2MaxClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. VO2max란? */}
        <section>
          <h2 className="g-h2">VO₂ Max란?</h2>
          <p className="g-p">
            VO₂ Max(최대 산소 섭취량)는 <strong>운동 중 1분에 체중 1kg당 흡수할 수 있는 산소량(mL/kg/min)</strong>입니다.
            심폐 체력을 나타내는 대표 지표로, 러닝·사이클·수영 등 지구력 종목의 잠재력을 가늠하는 데 쓰입니다.
          </p>
          <p className="g-p">
            높은 심폐체력은 운동 능력뿐 아니라 <strong>심혈관 질환·전체 사망 위험이 낮은 것과 강하게 연관</strong>되어 있다는 대규모 연구가 여럿 있습니다(Mandsager 2018, Kodama 2009).
            체중 1kg당 값이므로 같은 심폐 능력이라도 체중이 줄면 수치가 올라간다는 점도 기억해 두세요.
          </p>
        </section>

        {/* 2. 6가지 측정법 비교 */}
        <section>
          <h2 className="g-h2">6가지 측정 방법 비교</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>방법</th>
                    <th scope="col" style={headCell}>소요</th>
                    <th scope="col" style={headCell}>난이도</th>
                    <th scope="col" style={headCell}>정확도</th>
                    <th scope="col" style={headCell}>특징</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>쿠퍼 12분</strong></td>
                    <td style={cell}>12분</td>
                    <td style={cell}>어려움</td>
                    <td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>높음</strong></td>
                    <td style={cell}>러너 표준. 400m 트랙처럼 거리를 정확히 잴 수 있는 곳에서 12분 전력 달리기</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>1.5마일</strong></td>
                    <td style={cell}>10~16분</td>
                    <td style={cell}>어려움</td>
                    <td style={cell}><strong style={{ color: 'var(--emerald-600)' }}>높음</strong></td>
                    <td style={cell}>2.4km를 최대한 빨리. 군·소방 체력검정에 쓰여 온 종목. 기록·체중·성별로 계산</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>락포트 1마일 걷기</strong></td>
                    <td style={cell}>12~20분</td>
                    <td style={cell}>쉬움</td>
                    <td style={cell}><strong style={{ color: 'var(--amber-600)' }}>보통</strong></td>
                    <td style={cell}>달리지 않아 관절 부담이 적음. 초보·고령자 적합. 도착 직후 심박 측정 필요</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>퀸즈칼리지 스텝</strong></td>
                    <td style={cell}>3분</td>
                    <td style={cell}>보통</td>
                    <td style={cell}><strong style={{ color: 'var(--amber-600)' }}>보통</strong></td>
                    <td style={cell}>실내 가능. 약 41cm 높이 + 메트로놈(남 분당 24회·여 22회 오르내림). 박자를 놓치면 오차 증가</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>노르웨이 비운동</strong></td>
                    <td style={cell}>1분</td>
                    <td style={cell}>쉬움</td>
                    <td style={cell}><strong style={{ color: 'var(--amber-600)' }}>보통</strong></td>
                    <td style={cell}>운동 없이 나이·허리둘레·안정 심박·운동 습관으로 추정 (NTNU 연구)</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>안정시 심박</strong></td>
                    <td style={cell}>30초</td>
                    <td style={cell}>쉬움</td>
                    <td style={cell}><strong style={{ color: 'var(--orange-600)' }}>낮음</strong></td>
                    <td style={cell}>가장 간단. 신뢰도는 가장 낮음 — 참고용 추세 추적</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <Callout tone="note" title="실측이 필요하다면">
            VO₂max를 직접 재는 방법은 호흡가스 분석기를 쓰는 최대 운동부하검사(CPET, 트레드밀 Bruce 프로토콜 등)입니다. 대학 운동생리학 실험실이나 병원 스포츠의학·심장 재활 클리닉에서 받을 수 있고,
            비용·예약 조건은 기관마다 다릅니다. 이 도구의 6가지 방법은 모두 <strong>추정치</strong>이며 실측과 ±10% 이상 차이 날 수 있습니다.
          </Callout>
        </section>

        {/* 3. 추정식과 계산 예시 */}
        <section>
          <h2 className="g-h2">추정식과 계산 예시</h2>
          <p className="g-p">
            아래 식은 계산기가 실제로 쓰는 식이고, 결과 열은 예시 입력을 계산기와 같은 식에 넣어 구한 값입니다. 체중이 들어가는 1.5마일·락포트 식은 원 연구가 파운드(lb)를 써서 kg × 2.20462로 바꿔 넣습니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>방법</th>
                    <th scope="col" style={headCell}>계산식 (mL/kg/min)</th>
                    <th scope="col" style={headCell}>예시 입력</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>결과</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map((e) => (
                    <tr key={e.name}>
                      <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>{e.name}</th>
                      <td style={{ ...cell, color: 'var(--muted)' }}>{e.formula}</td>
                      <td style={cell}>{e.input}</td>
                      <td style={{ ...cellNum, textAlign: 'right', fontWeight: 700, color: 'var(--accent-ink)' }}>{r1(e.v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ul className="g-list" style={{ marginTop: 16 }}>
            <li><strong>안정시 심박 비율법</strong>은 최대심박을 220 − 나이로 가정합니다. 실제 최대심박이 이보다 10bpm만 높거나 낮아도 결과가 약 5% 달라지므로, 최대심박을 아는 사람에게는 다른 방법이 낫습니다.</li>
            <li><strong>노르웨이 비운동 추정</strong>의 활동 지수는 이 도구가 운동 빈도·강도·시간 점수(각 0~3)를 더해 0~9로 만든 단순화 버전입니다. 원 연구(Nes 2011, 노르웨이 HUNT 연구)의 설문 점수 체계와 똑같지 않으므로, 활동 지수 1점이 결과를 남성 0.226·여성 0.198만큼 움직인다는 정도로 이해하세요.</li>
            <li><strong>퀸즈칼리지 스텝</strong>의 회복 심박은 3분 스텝이 끝나고 선 채로 5초 뒤부터 15초간 센 맥박 × 4입니다. 심박을 늦게 재면 값이 낮아져 VO₂max가 과대 추정됩니다.</li>
          </ul>
        </section>

        {/* 4. 등급표 */}
        <section>
          <h2 className="g-h2">연령·성별 5단계 등급 기준 (mL/kg/min)</h2>
          <p className="g-p">
            계산기가 결과 등급을 매길 때 쓰는 구간입니다. 각 구간은 <strong>앞 숫자 이상·뒤 숫자 미만</strong>이라, 20대 남성의 「미흡」 {M20.below}~{M20.average}는 {M20.below} 이상 {M20.average} 미만이고, 정확히 {M20.average}이면 「평균」입니다.
            같은 값이라도 나이와 성별에 따라 등급이 달라지므로, 절대 수치보다 동년배 안에서의 위치로 읽으세요.
          </p>

          {(['male', 'female'] as const).map((sex) => (
            <div key={sex} style={{ marginTop: sex === 'female' ? 20 : 0 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{sex === 'male' ? '남성' : '여성'}</p>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <div className="tableScroll">
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px', fontSize: '13px' }}>
                    <thead>
                      <tr>
                        {['연령', '매우 미흡', '미흡', '평균', '우수', '매우 우수'].map((h) => (
                          <th scope="col" key={h} style={headCell}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AGE_ROWS.map((row) => (
                        <tr key={row.label}>
                          <th scope="row" style={{ ...cell, textAlign: 'left' }}>{row.label}</th>
                          {bandCells(row.age, sex).map((c, i) => (
                            <td key={i} style={i === 4 ? { ...cellNum, fontWeight: 700, color: 'var(--emerald-600)' } : cellNum}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          <p className="g-note">
            ACSM 「Guidelines for Exercise Testing and Prescription」과 Cooper Institute의 연령별 심폐체력 규준을 참고해 5단계로 단순화한 구간입니다. 원 규준의 백분위 값과 1:1로 같지 않으니 대략적인 위치를 보는 용도로 쓰세요.
          </p>
        </section>

        {/* 5. VDOT 환산표 */}
        <section>
          <h2 className="g-h2">VO₂max별 예상 기록과 훈련 페이스</h2>
          <p className="g-p">
            결과 화면의 예상 기록·훈련 페이스는 추정 VO₂max를 Daniels VDOT로 보고 계산합니다. 아래 표는 계산기와 같은 식으로 구한 기준값입니다. 페이스는 분:초/km이며, E(이지)는 범위의 느린 쪽, T는 역치(약 1시간 레이스 강도), I는 인터벌 강도입니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px', fontSize: '13px' }}>
                <thead>
                  <tr>
                    {['VO₂max', '5km', '10km', '하프', '풀코스', 'E 페이스', 'T 페이스', 'I 페이스'].map((h) => (
                      <th scope="col" key={h} style={headCell}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VDOT_ROWS.map((r) => (
                    <tr key={r.v}>
                      <th scope="row" style={{ ...cellNum, textAlign: 'left', fontWeight: 700 }}>{r.v}</th>
                      <td style={cellNum}>{fmtTime(r.race.fiveK)}</td>
                      <td style={cellNum}>{fmtTime(r.race.tenK)}</td>
                      <td style={cellNum}>{fmtTime(r.race.halfM)}</td>
                      <td style={{ ...cellNum, fontWeight: 700, color: 'var(--accent-ink)' }}>{fmtTime(r.race.fullM)}</td>
                      <td style={cellNum}>{fmtPace(r.pace.E)}</td>
                      <td style={cellNum}>{fmtPace(r.pace.T)}</td>
                      <td style={cellNum}>{fmtPace(r.pace.I)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-note">
            VDOT는 원래 레이스 기록에서 거꾸로 구하는 값이라, 실험실에서 잰 VO₂max를 그대로 넣으면 러닝 이코노미가 좋은 사람은 실제 기록이 예측보다 빠르고, 달리기 경험이 적은 사람은 예측보다 느린 경우가 많습니다.
            일반적으로 실험실 VO₂max는 레이스로 구한 VDOT보다 높게 나와 예측이 낙관적으로 흐르기 쉽습니다. 풀코스는 훈련량과 페이스 배분의 영향이 특히 큽니다.
          </p>
        </section>

        {/* 6. 측정 팁 */}
        <section>
          <h2 className="g-h2">정확한 측정을 위한 팁</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { title: '같은 조건', desc: '재측정은 같은 장소·시간대·방법으로. 덥거나 바람이 강한 날은 달리기 테스트 결과가 낮게 나옵니다.' },
              { title: '거리·시간은 정확하게', desc: '쿠퍼·1.5마일은 거리 오차가 그대로 결과 오차가 됩니다. GPS보다 400m 트랙 바퀴 수가 정확합니다.' },
              { title: '컨디션', desc: '전날 고강도 운동·음주를 피하고 충분히 잔 뒤에. 식사는 2시간 전쯤 가볍게.' },
              { title: '워밍업', desc: '10~15분 가볍게 몸을 데운 뒤 시작. 첫 1~2분에 너무 빨리 나가면 후반에 크게 무너집니다.' },
              { title: '재측정 주기', desc: '훈련 효과를 보려면 6~12주 간격이 적당합니다. 매주 재면 컨디션 변동만 보게 됩니다.' },
              { title: '중단 기준', desc: '가슴 통증·심한 어지럼·비정상적인 숨가쁨이 느껴지면 즉시 멈추고 진료를 받으세요.' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{b.title}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <Callout tone="warn">
            쿠퍼 12분·1.5마일·스텝 테스트는 최대에 가까운 노력이 필요합니다. 심장질환·고혈압·당뇨가 있거나 평소 운동을 거의 하지 않았다면 먼저 의사와 상담하고, 걷기 테스트나 비운동 추정부터 시작하세요.
          </Callout>
        </section>

        {/* 7. 향상 트레이닝 */}
        <section>
          <h2 className="g-h2">VO₂ Max를 올리는 훈련</h2>
          <div style={{ ...card }}>
            <ul className="g-list" style={{ margin: 0 }}>
              <li><strong>4×4 인터벌 (NTNU, Helgerud 2007)</strong>: 최대심박 90~95%로 4분 + 약 70%로 3분 회복을 4세트, 주 3회. 8주 뒤 VO₂max가 약 7% 올라 같은 운동량의 중강도 지속주보다 효과가 컸습니다.</li>
              <li><strong>짧은 인터벌 (15초/15초, 30초/30초)</strong>: 강하게 짧게 여러 번 반복. 같은 연구에서 15초/15초 방식도 약 5.5% 올랐습니다.</li>
              <li><strong>역치(T) 달리기</strong>: 20~40분을 약 1시간 레이스 강도로. VO₂max보다 「그 수준을 얼마나 오래 유지하느냐」를 키웁니다.</li>
              <li><strong>이지·장거리 달리기</strong>: 주당 운동량의 대부분을 대화 가능한 강도로. 고강도 훈련을 버티는 기반이 됩니다.</li>
              <li><strong>크로스 트레이닝</strong>: 자전거·수영·로잉으로 관절 부담 없이 유산소 시간을 늘릴 수 있습니다.</li>
            </ul>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              호흡근 훈련 기구는 호흡근의 힘·피로 저항을 높일 수 있지만, VO₂max 자체를 끌어올린다는 근거는 약합니다. 고강도 인터벌은 주 2~3회를 넘기지 말고 사이에 쉬운 날을 두세요.
            </p>
          </div>
        </section>

        {/* 8. 국민체력100 */}
        <section>
          <h2 className="g-h2">국내에서 무료로 심폐체력 측정받기</h2>
          <p className="g-p">
            직접 테스트하기 부담스럽다면 국민체육진흥공단이 운영하는 <strong>국민체력100</strong> 체력인증센터를 이용할 수 있습니다. 전국 센터에서 심폐지구력·근력·유연성 등을 측정하고, 결과에 맞춘 운동 처방과 체력 인증 등급을 받을 수 있습니다.
            심폐지구력은 연령대에 따라 왕복 오래달리기·스텝검사·걷기 검사 등으로 측정하며, 측정 항목과 예약 방법은 국민체력100 누리집에서 확인하세요.
          </p>
          <p className="g-p">
            센터에서 받은 결과와 이 계산기 값을 나란히 기록해 두면, 이후 혼자 측정할 때 본인에게 어느 방법이 잘 맞는지 가늠하는 기준점이 됩니다.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/sports/race-predictor" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏅</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>마라톤 기록 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>5K·10K·하프 → 풀 예측</div>
            </Link>
            <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>페이스 ↔ 완주 시간</div>
            </Link>
            <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>VDOT 기반 페이스</div>
            </Link>
            <Link href="/tools/sports/buildup" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 빌드업</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>점진 페이스 설계</div>
            </Link>
            <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일일 소비 칼로리</div>
            </Link>
            <Link href="/tools/health/sleep-debt" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>😴</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>수면 부채 트래커</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>회복·컨디션 관리</div>
            </Link>
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
