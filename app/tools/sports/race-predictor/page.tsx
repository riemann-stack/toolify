import Link from 'next/link'
import RacePredictorClient from './RacePredictorClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import Disclaimer from '@/components/Disclaimer'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  predictTime, vdotFromRace, timeFromVdot, envCorrection, fmtHMS, AGE_GENDER_FACTORS, AGE_BAND_LABEL, type AgeBand,
} from './racePredictorUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/race-predictor',
  title: '마라톤 기록 계산기 — VDOT·Riegel·Cameron·환경/연령 보정·목표 역산',
  description: '5km·10km·하프 기록으로 풀코스 예상 시간을 Riegel·VDOT·Cameron 3공식 평균으로 계산. 기온·습도·고도·연령 자동 보정과 목표 역산, VDOT 추이 저장까지.',
  keywords: ['마라톤 기록 예측', 'VDOT 계산기', 'Riegel 공식', 'Cameron 공식', '서브3 페이스', '서브4 페이스', '5km 풀 환산', '하프 풀 예측', '마라톤 환경 보정', '한국 마라톤 시즌', 'Jack Daniels 페이스'],
})

/* ── 본문 표 수치는 도구와 같은 함수(racePredictorUtils → lib/running)로 빌드 시 계산 ── */
const FULL = 42.195
const HALF = 21.0975
/** 00:22:00 → 22:00 · 03:08:06 → 3:08:06 */
const hms = (sec: number) => { const t = fmtHMS(sec); return t.startsWith('00:') ? t.slice(3) : t.replace(/^0/, '') }

// 기준 기록 → 풀코스 예측 (3공식 개별값 + 평균)
const PRED_ROWS = [
  { label: '5km 25:00', km: 5, sec: 25 * 60 },
  { label: '10km 50:00', km: 10, sec: 50 * 60 },
  { label: '하프 1:50:00', km: HALF, sec: 110 * 60 },
].map((b) => {
  const p = predictTime(b.km, b.sec, FULL)
  const vals = [p.riegel, p.vdot, p.cameron]
  return { ...b, score: vdotFromRace(b.km, b.sec), ...p, spread: Math.max(...vals) - Math.min(...vals) }
})

// 풀 목표 → 필요한 짧은 거리 기록 (목표 역산 탭과 같은 계산)
const REVERSE_ROWS = [
  { label: '서브5 (5:00:00)', sec: 5 * 3600 },
  { label: '서브4:30', sec: 4.5 * 3600 },
  { label: '서브4 (4:00:00)', sec: 4 * 3600 },
  { label: '서브3:30', sec: 3.5 * 3600 },
  { label: '서브3 (3:00:00)', sec: 3 * 3600 },
].map((g) => {
  const v = vdotFromRace(FULL, g.sec)
  return { ...g, v, five: timeFromVdot(5, v), ten: timeFromVdot(10, v), half: timeFromVdot(HALF, v) }
})
const SUB330 = REVERSE_ROWS[3]

// 기상청 기후평년값(1991~2020) 전국 월평균기온 — 기상청 월간 기후동향 발표의 '평년' 값
const SEASON_ROWS = [
  { m: '3월', t: 6.1, note: '서울마라톤(동아마라톤) 시즌' },
  { m: '4월', t: 12.1, note: '봄 시즌' },
  { m: '6월', t: 21.4, note: '초여름 — 대회 드묾' },
  { m: '7월', t: 24.6, note: '한여름 — 야간 대회 위주' },
  { m: '8월', t: 25.1, note: '한여름 — 야간 대회 위주' },
  { m: '9월', t: 20.5, note: '가을 시즌 시작 — 아직 더움' },
  { m: '10월', t: 14.3, note: '춘천마라톤 시즌' },
  { m: '11월', t: 7.6, note: 'JTBC 서울마라톤 시즌' },
  { m: '12월', t: 1.1, note: '겨울 — 대회 드묾' },
  { m: '1월', t: -0.9, note: '겨울 — 대회 드묾' },
  { m: '2월', t: 1.2, note: '겨울 끝 — 남부 지방 일부 대회' },
].map((r) => ({ ...r, pct: envCorrection({ baseTime: 1, temp: r.t, humidity: 60, elevation: 0 }).totalPercent }))

const ENV_EX = envCorrection({ baseTime: 3 * 3600, temp: 25, humidity: 80, elevation: 0 })
const ENV_EX_HOT = envCorrection({ baseTime: 3 * 3600, temp: 30, humidity: 80, elevation: 0 })
const AGE_BANDS: AgeBand[] = ['20-30', '30-40', '40-50', '50-60', '60+']

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const TDN: React.CSSProperties = { ...TD, fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }
const ROW = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const TABLE: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}

const FAQ_LD = [
  {
    q: '5km 기록으로 풀 마라톤을 예측해도 정확한가요?',
    a: '거리 차이가 클수록 오차가 커집니다. 5km는 짧고 강한 달리기라 스피드의 비중이 크지만, 풀코스는 장거리 지구력·연료(글리코겐) 관리·근피로 내성이 결정합니다. 그래서 <strong>10km 이상, 가능하면 하프 기록</strong>을 기준으로 넣는 편이 낫고, 이 도구는 세 공식의 평균을 써서 한 공식의 치우침을 줄입니다. 그래도 장거리 훈련이 부족하면 실제 풀 기록은 예측보다 느리게 나오는 경향이 있습니다.',
  },
  {
    q: 'VDOT과 VO2max는 같은 개념인가요?',
    a: '다릅니다. VO2max는 실험실에서 측정하는 최대산소섭취량(ml/kg/min)이고, VDOT은 실제 레이스 기록에서 역산한 &ldquo;그 기록을 내는 데 필요한 유산소 능력&rdquo; 지표입니다. 숫자 크기는 비슷하지만 VDOT에는 러닝 경제성(같은 속도에서 산소를 덜 쓰는 능력)까지 녹아 있어, VO2max가 같아도 경제성이 좋은 사람의 VDOT이 더 높게 나옵니다.',
  },
  {
    q: '대회 당일 기온·습도가 다르면 기록이 얼마나 차이 나나요?',
    a: `이 도구의 환경 보정은 15°C 이하·습도 60% 이하를 기준(0%)으로 두고 기온·습도·고도별 가산율을 더합니다. 예를 들어 평시 3:00:00 예측이면 25°C·습도 80%에서 +${ENV_EX.totalPercent}%로 약 ${hms(ENV_EX.correctedTime)}, 30°C·습도 80%에서 +${ENV_EX_HOT.totalPercent}%로 약 ${hms(ENV_EX_HOT.correctedTime)}가 됩니다. 25°C 이상이면 열 질환 위험이 커지므로 평소보다 느리게 출발하고, 수분·전해질을 챙기며, 어지럼·구토가 있으면 즉시 멈추고 도움을 요청하세요(응급 119).`,
  },
  {
    q: '서브3:30을 하려면 5km·10km 기록이 얼마여야 하나요?',
    a: `목표 역산 탭과 같은 계산으로 풀 3:30:00은 VDOT 약 ${SUB330.v.toFixed(1)}이고, 같은 능력의 기록은 5km ${hms(SUB330.five)} · 10km ${hms(SUB330.ten)} · 하프 ${hms(SUB330.half)}입니다. 다만 짧은 거리 기록이 이 수준이어도 풀코스는 장거리 훈련(30km 이상 장거리 달리기 포함)이 받쳐 줘야 나옵니다. 현재 기록을 함께 넣으면 VDOT 격차와 대략의 준비 기간(VDOT 1당 약 8주로 가정)을 보여 줍니다.`,
  },
  {
    q: '50대에 마라톤을 시작해도 늦지 않았나요?',
    a: '늦지 않습니다. 나이에 따른 기록 저하는 생각보다 완만해서, 세계마스터스육상(WMA) 연령 계수도 30대 중반 이후 완만하게 내려가는 곡선입니다. 이 도구의 <strong>연령·성별 보정</strong>을 켜면 내 기록을 20대 남성 기준의 &lsquo;동급 능력&rsquo; 시간으로 바꿔 비교할 수 있습니다. 오래 운동을 쉬었거나 심장·대사 질환, 운동 중 가슴 통증·호흡곤란 같은 증상이 있다면 시작 전 의사와 상담하고, 걷기 → 걷기·달리기 혼합 → 연속 달리기 순서로 거리를 천천히 늘리세요.',
  },
  {
    q: '훈련 페이스 E·M·T·I·R는 무엇인가요?',
    a: 'Jack Daniels의 5단계 훈련 강도입니다. <strong>E</strong>(Easy·회복과 기초 지구력), <strong>M</strong>(Marathon·대회 페이스), <strong>T</strong>(Threshold·역치 템포), <strong>I</strong>(Interval·V̇O₂max 자극), <strong>R</strong>(Repetition·스피드와 주법). 주간 거리의 대부분은 E로 채우고, Daniels는 한 세션의 양을 T는 주간 거리의 10%, I는 8%(최대 10km), R은 5%(최대 8km) 이내로 두라고 권합니다. 이 도구는 예측 기록에서 나온 VDOT으로 이 페이스들을 함께 보여 주며, 인터벌 세션 설계는 <a href="/tools/sports/interval-training">인터벌 훈련 계산기</a>가 맡습니다.',
  },
  {
    q: '페이스 전략 탭의 네거티브 스플릿은 어떻게 계산되나요?',
    a: '목표 시간의 평균 페이스를 5km 구간마다 조정합니다. 네거티브는 구간 중간 지점의 위치에 따라 평균보다 1.5% 느린 페이스에서 1.5% 빠른 페이스까지 선형으로 바꾼 뒤, 합계가 목표 시간과 정확히 같도록 다시 맞춥니다. 풀 3:30:00(평균 4:59/km)이면 첫 5km 약 5:03/km에서 마지막 2.2km 약 4:54/km가 됩니다. 전반에 아껴 둔 여력이 후반의 글리코겐 고갈·근피로를 버티는 데 쓰이므로, 처음 풀을 뛰는 사람일수록 이븐 또는 네거티브가 안전합니다.',
  },
  {
    q: '하프 기록으로 예측했는데 실제 풀은 훨씬 늦었어요. 왜 그런가요?',
    a: '흔한 일입니다. 아마추어 러너 2,303명을 조사한 연구(Vickers &amp; Vertosick 2016)에서 Riegel 공식은 하프까지는 잘 맞았지만 <strong>풀코스는 크게 과소 추정</strong>해, 응답자 절반은 실제 기록이 예측보다 최소 10분 느렸습니다. 주간 거리와 장거리 달리기가 적을수록 후반 30km 이후에 페이스가 무너지기 쉽기 때문입니다. 날씨·코스 고저도 몇 분 단위로 차이를 만듭니다. 예측값은 &lsquo;훈련이 충분하고 조건이 좋을 때의 가능치&rsquo;로 보고, 첫 풀이라면 몇 분의 여유를 두고 목표를 잡으세요.',
  },
]

export default function RacePredictorPage() {
  return (
    <ToolPage width={880} slug="/tools/sports/race-predictor">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />마라톤 기록 계산기
      </h1>
      <p className="tp-lead">
        5km·10km·하프 기록으로 <strong style={{ color: 'var(--text)' }}>풀코스 예상 시간</strong> + 기온·고도·연령 자동 보정.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="Riegel(1981) 지수 1.06 · Daniels·Gilbert VDOT · Cameron 식 3공식 평균 — 환경·연령 보정은 도구 자체 근사 계수, 월평균기온은 기상청 1991~2020 전국 평년값"
        sources={[
          { label: 'Riegel (1981) Athletic Records and Human Endurance — American Scientist', href: 'https://pubmed.ncbi.nlm.nih.gov/7235349/' },
          { label: 'VDOT O2 러닝 계산기 (Jack Daniels 공식)', href: 'https://vdoto2.com/calculator/' },
          { label: 'Ely 외 (2007) 날씨와 마라톤 기록 — MSSE', href: 'https://pubmed.ncbi.nlm.nih.gov/17473775/' },
          { label: 'Vickers & Vertosick (2016) 아마추어 러너 기록 예측 — BMC', href: 'https://bmcsportsscimedrehabil.biomedcentral.com/articles/10.1186/s13102-016-0052-y' },
          { label: '기상청 기후평년값 (1991~2020)', href: 'https://data.kma.go.kr/normals/index.do' },
          { label: 'WMA·USATF 연령 계수표 (Age-Grade Tables)', href: 'https://github.com/AlanLyttonJones/Age-Grade-Tables' },
        ]}
      />

      <RacePredictorClient />

      <GuideDivider />

      {/* 1. 3공식 */}
      <h2 className="g-h2">세 가지 예측 공식과 계산 방식</h2>
      <p className="g-p">
        이 도구는 기준 기록 하나로 세 공식을 각각 계산한 뒤 <strong>단순 평균</strong>을 대표값으로 보여 줍니다. 세 공식은 &lsquo;거리가 늘면 페이스가 얼마나 떨어지는가&rsquo;를 서로 다른 방식으로 모델링하므로, 평균을 쓰면 한 공식의 치우침이 줄어듭니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['공식', '계산식', '성격'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['Riegel (1981)', 't₂ = t₁ × (d₂ ÷ d₁)^1.06', '세계기록의 거리-시간 관계를 거듭제곱 곡선으로 맞춘 식. 지수 1.06이 거리 증가에 따른 페이스 저하를 나타냅니다.'],
              ['VDOT (Daniels·Gilbert)', 'VDOT = VO₂(v) ÷ %VO₂max(t)', '속도 v(m/분)의 산소 비용 VO₂ = −4.60 + 0.182258v + 0.000104v²를, 경기 시간 t(분) 동안 유지 가능한 비율 %VO₂max = 0.8 + 0.1894393e^(−0.012778t) + 0.2989558e^(−0.1932605t)로 나눈 값. 목표 거리 기록은 같은 VDOT이 나오는 시간을 이분 탐색으로 찾습니다.'],
              ['Cameron', 't₂ = t₁ × (d₂ ÷ d₁) × a(d₁) ÷ a(d₂)', '거리(마일)에 따른 속도 계수 a(d) = 13.49681 − 0.048865d + 2.438936 ÷ d^0.7905를 기록 자료로 회귀한 식. 장거리 쪽을 가장 보수적으로(느리게) 예측하는 편입니다.'],
            ].map((r, i) => (
              <tr key={i} style={ROW(i)}>
                <td style={{ ...TD, fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                <td style={{ ...TD, fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>{r[1]}</td>
                <td style={{ ...TD, color: 'var(--muted)' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. 예측 비교 — 빌드 시 계산 */}
      <h2 className="g-h2">같은 기록, 세 공식의 답 — 풀코스 예측 비교</h2>
      <p className="g-p">
        세 공식이 실제로 얼마나 다른 답을 내는지 도구의 계산 함수로 뽑은 값입니다. 공식 간 차이가 몇 분 단위로 벌어진다는 점 자체가 &lsquo;예측의 불확실성&rsquo;을 보여 줍니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['기준 기록', 'VDOT', 'Riegel', 'VDOT 식', 'Cameron', '평균(표시값)', '최대 차이'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {PRED_ROWS.map((r, i) => (
              <tr key={r.label} style={ROW(i)}>
                <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.label}</th>
                <td style={TDN}>{r.score.toFixed(1)}</td>
                <td style={TDN}>{hms(r.riegel)}</td>
                <td style={TDN}>{hms(r.vdot)}</td>
                <td style={TDN}>{hms(r.cameron)}</td>
                <td style={{ ...TDN, fontWeight: 700, color: 'var(--accent-ink)' }}>{hms(r.avg)}</td>
                <td style={TDN}>{Math.round(r.spread / 60)}분</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        세 예시 모두 Cameron이 가장 느리고, Riegel과 VDOT 식은 1~2분 안에서 비슷합니다. 문제는 세 공식이 모두 &lsquo;그 거리를 제대로 준비했다&rsquo;는 가정 위에 있다는 점입니다. 특히 짧은 거리 기록을 풀코스로 늘릴 때 이 가정이 가장 크게 빗나갑니다(연구 결과는 아래 FAQ &lsquo;하프 기록으로 예측했는데 실제 풀은 훨씬 늦었어요&rsquo; 참고). 주간 거리가 적거나 30km 이상 장거리 경험이 없다면 표시값을 &lsquo;상한&rsquo;으로 보고 목표를 잡으세요.
      </p>

      {/* 3. 환경 보정 */}
      <h2 className="g-h2">환경 보정 — 대회 당일은 평시와 다릅니다</h2>
      <p className="g-p">
        환경 보정 체크박스를 켜면 기온·습도·고도 슬라이더로 보정된 기록을 바로 볼 수 있습니다. 가산율은 아래 표의 구간 값을 <strong>더한 뒤</strong> 평시 예측에 곱합니다(예: 23°C +3.5%와 습도 75% +1%면 총 +4.5%).
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 440 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['요인', '구간', '가산', '비고'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ['기온', '15°C 이하', '0%', '최적'],
              ['', '15~20°C', '+1.5%', '적정'],
              ['', '20~25°C', '+3.5%', '주의'],
              ['', '25~30°C', '+6%', '위험 — 열 질환 주의'],
              ['', '30°C 초과', '+8% + 1°C당 0.7%', '매우 위험'],
              ['습도', '60% 이하', '0%', '건조'],
              ['', '60~80%', '+1%', '보통'],
              ['', '80% 초과', '+2.5%', '다습'],
              ['고도', '200m 이하', '0%', '해수면'],
              ['', '200~500m', '+1.5%', '저고도'],
              ['', '500~1000m', '+3%', '중고도'],
              ['', '1000~2000m', '+5%', '고고도'],
              ['', '2000m 초과', '+7%', '고지대'],
            ].map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...TD, fontWeight: 700 }}>{r[0]}</td>
                <td style={TDN}>{r[1]}</td>
                <td style={TDN}>{r[2]}</td>
                <td style={{ ...TD, color: 'var(--muted)' }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        예) 평시 3:30:00 + 23°C(+3.5%) + 습도 75%(+1%) = 3:30:00 × 1.045 ≈ 3:39:27.
      </p>
      <p className="g-p" style={{ marginTop: 16 }}>
        이 가산율은 연구값을 그대로 옮긴 것이 아니라 경향을 반영한 <strong>도구 자체 근사치</strong>입니다. 보스턴·뉴욕 등 북미 7개 마라톤의 최대 36년치 결과를 분석한 연구(Ely 외 2007)에서는 습구흑구온도(WBGT)가 5~10°C에서 20~25°C로 오르는 동안 남자 상위권 기록이 코스 기록 대비 평균 1.7%에서 4.5% 느린 수준으로 점점 늘었고, <strong>느린 주자일수록 더 크게 느려졌습니다</strong>. WBGT는 기온에 습도·일사·바람을 합친 체감 열 지수라 같은 기온이라도 햇볕이 강하고 습하면 더 높게 나옵니다. 그래서 도구는 기온과 습도를 따로 더하며, 완주 시간이 긴 러너라면 표시값보다 조금 더 여유를 두는 편이 현실적입니다.
      </p>

      {/* 4. 목표 역산 — 빌드 시 계산 */}
      <h2 className="g-h2">목표 역산 — 풀코스 목표에 필요한 기록</h2>
      <p className="g-p">
        목표 역산 탭은 풀코스 목표 시간에서 VDOT을 구한 뒤, 같은 VDOT으로 5km·10km·하프 기록을 계산합니다. 내 최근 기록이 이 표의 어느 줄에 가까운지 보면 목표가 현실적인지 가늠할 수 있습니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['풀 목표', 'VDOT', '5km', '10km', '하프'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {REVERSE_ROWS.map((r, i) => (
              <tr key={r.label} style={ROW(i)}>
                <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{r.label}</th>
                <td style={{ ...TDN, color: 'var(--accent-ink)', fontWeight: 700 }}>{r.v.toFixed(1)}</td>
                <td style={TDN}>{hms(r.five)}</td>
                <td style={TDN}>{hms(r.ten)}</td>
                <td style={TDN}>{hms(r.half)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="warn">
        짧은 거리 기록이 표의 수준에 도달해도 풀코스 기록이 보장되지는 않습니다. 30km 이상 장거리 달리기를 포함한 16주 안팎의 준비가 받쳐 줘야 하며, 주간 스케줄은 <Link href="/tools/sports/interval-training" style={{ color: 'var(--accent-ink)' }}>인터벌 훈련 계산기</Link>에서 짤 수 있습니다.
      </Callout>

      {/* 5. 연령·성별 보정 */}
      <h2 className="g-h2">연령·성별 보정 — 같은 능력도 평가는 다릅니다</h2>
      <p className="g-p">
        연령·성별 보정을 켜면 내 예측 기록에 아래 계수를 곱해 <strong>20대 남성 기준의 동급 능력 시간</strong>으로 바꿔 보여 줍니다. 계수는 세계마스터스육상(WMA)의 연령 계수(각 나이의 최고 기록 곡선에서 도출하는 age-grading)의 경향을 10년 단위 구간으로 단순화하고, 여성 행에는 남녀 기록 격차를 반영한 도구 자체 근사값입니다. 정밀한 연령별 비교가 필요하면 WMA·USATF 연령 계수표를 직접 쓰세요.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 440 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th scope="col" style={TH}>구분</th>
              {AGE_BANDS.map((b) => <th scope="col" key={b} style={TH}>{AGE_BAND_LABEL[b]}</th>)}
            </tr>
          </thead>
          <tbody>
            {(['male', 'female'] as const).map((g, i) => (
              <tr key={g} style={ROW(i)}>
                <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left' }}>{g === 'male' ? '남성' : '여성'}</th>
                {AGE_BANDS.map((b) => <td key={b} style={TDN}>{AGE_GENDER_FACTORS[g][b].toFixed(2)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-note">
        예) 50대 남성 풀 4:30:00 × 0.84 = 3:46:48 — 20대 남성이 3시간 46분대를 뛴 것과 같은 수준으로 봅니다. 통계적 경향일 뿐 개인차가 크며, 꾸준히 훈련한 마스터스 러너는 이 계수보다 훨씬 좋은 기록을 냅니다.
      </p>

      {/* 6. 한국 시즌 — 기상청 평년값 + 도구 보정률 */}
      <h2 className="g-h2">한국 마라톤 시즌 — 월평균 기온과 보정률</h2>
      <p className="g-p">
        대회 달의 기온을 환경 보정에 넣을 때 참고할 수 있도록 기상청 기후평년값(1991~2020)의 전국 월평균기온과, 그 기온을 도구에 넣었을 때의 기온 가산율(습도 60%·고도 0m 가정)을 정리했습니다.
      </p>
      <div className="tableScroll">
        <table style={{ ...TABLE, minWidth: 440 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['월', '전국 월평균기온(평년)', '도구 기온 가산', '시즌'].map((h) => <th scope="col" key={h} style={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {SEASON_ROWS.map((r, i) => (
              <tr key={r.m} style={ROW(i)}>
                <th scope="row" style={{ ...TD, fontWeight: 700, textAlign: 'left' }}>{r.m}</th>
                <td style={TDN}>{r.t.toFixed(1)}°C</td>
                <td style={TDN}>{r.pct === 0 ? '0%' : `+${r.pct}%`}</td>
                <td style={{ ...TD, color: 'var(--muted)' }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 16 }}>
        월평균은 하루 평균이라 오전 출발 무렵은 이보다 낮고, 레이스 후반(늦은 오전)으로 갈수록 기온이 오릅니다. 3~4월과 10~11월이 기록을 노리기 좋은 시즌인 이유이며, 9월은 평년에도 20°C를 넘어 보정이 붙습니다. 최근에는 평년보다 더운 가을이 잦아(기상청 발표 2025년 9월 전국 평균 23.0°C, 평년보다 2.5°C 높음) 가을 초입 대회는 당일 예보 기온으로 보정하는 편이 안전합니다. 대회 일정·참가 신청은 각 대회 공식 홈페이지를 확인하세요.
      </p>

      {/* 7. 기록 추이 */}
      <h2 className="g-h2">기록 추이 — VDOT 변화로 발전 보기</h2>
      <p className="g-p">
        내 기록 탭에 5km·10km·하프·풀 기록을 쌓으면 거리가 달라도 VDOT이라는 같은 잣대로 추이 그래프와 풀코스 환산 변화를 볼 수 있습니다. 5km 기록이 좋아졌는데 하프 VDOT이 제자리라면 스피드보다 지구력 쪽 훈련이 부족하다는 신호로 읽을 수 있습니다.
      </p>
      <ul className="g-list">
        <li>기록은 이 브라우저(localStorage)에만 저장되고 서버로 전송되지 않습니다. 다른 기기로 옮기려면 CSV 다운로드를 쓰세요.</li>
        <li>목표 역산 탭의 &lsquo;예상 향상 기간&rsquo;은 VDOT 1을 올리는 데 약 8주(흔히 말하는 6~12주 범위에서 고른 값)가 걸린다고 가정한 대략치입니다. 입문자는 더 빨리, 상급자는 더 느리게 오릅니다.</li>
        <li>같은 사람도 날씨·코스에 따라 VDOT이 오르내리므로, 추이는 비슷한 조건의 대회끼리 비교할 때 가장 의미가 있습니다.</li>
      </ul>

      {/* 운영자 노트 — 날씨·코스 실전 변수 */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-card)', padding: '18px 20px', marginBottom: '8px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '8px' }}>🏃 직접 뛰어보니 — 같은 몸도 날씨로 갈린다</p>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8 }}>
          2026년 2월 밀양 하프(기온 20도 안팎·업힐 많은 코스)에서 1:51대를 뛰었는데, 2주 뒤 3월 고양 하프(기온 0~3도·평지)에서는 1:44대가 나왔습니다. 2주 사이 훈련이 크게 늘었을 리 없으니, 7분 차이는 거의 날씨와 코스 몫입니다. 예측기 숫자는 &lsquo;선선한 날씨·평탄한 코스&rsquo; 기준에 가깝다고 보고, 더운 날이나 업힐 코스면 그만큼 여유를 두세요.
        </p>
      </div>

      <Faq items={FAQ_LD} />

      {/* 안전·면책 */}
      <Disclaimer variant="safety" open>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>본 도구는 <strong>일반 가이드</strong>입니다. 3공식 평균으로 오차를 줄이지만 실제 기록과 ±5~10% 차이가 날 수 있습니다.</li>
          <li>5km → 풀 예측은 거리 차이가 커서 오차가 큽니다. <strong>10km 이상 기록 권장</strong>.</li>
          <li>환경·연령 보정은 도구 자체 근사 계수 — 개인차가 큽니다.</li>
          <li><strong>25°C 이상은 열 질환 위험</strong> — 충분한 수분·전해질, 어지럼·구토 시 즉시 중단·119.</li>
          <li>본 도구는 <strong>부상 진단·영양/식단 자문·신발/기어 추천·약물/도핑 정보</strong>를 제공하지 않습니다.</li>
          <li>도움 받기: 한국스포츠의학회(KASEM), 정형외과·재활의학과, 응급 119, 한국도핑방지위원회(kada-ad.or.kr).</li>
        </ul>
      </Disclaimer>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/sports/interval-training" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃‍♂️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>인터벌 훈련 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>VDOT 인터벌 페이스·4~16주 스케줄</div>
        </Link>
        <Link href="/tools/sports/pace" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏃</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 페이스 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>페이스↔시간 변환·구간 스플릿</div>
        </Link>
        <Link href="/tools/sports/buildup" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>러닝 빌드업 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>VDOT 기반 빌드업 설계</div>
        </Link>
        <Link href="/tools/sports/carb-loading" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍚</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>카보로딩 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>대회 전 탄수화물 플랜</div>
        </Link>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>훈련일 칼로리 산정</div>
        </Link>
        <Link href="/tools/date/dday" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📅</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>D-day 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>다음 마라톤까지</div>
        </Link>
      </div>
    </ToolPage>
  )
}
