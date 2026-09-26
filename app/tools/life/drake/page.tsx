import Link from 'next/link'
import DrakeEquationClient from './DrakeEquationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import { RADIO_START_YEAR, radioRangeLy, calcDistance, GALAXY_VOLUME_LY3, PRESETS } from './drakeUtils'
import ToolPage from '@/components/ToolPage'

// 인류 전파권은 해마다 1광년씩 넓어진다 — 빌드(배포) 시점 연도로 계산해 한 곳에서 관리.
// 정적 페이지라 새해 첫 배포 때 갱신된다.
const RADIO_ASOF_YEAR = new Date().getFullYear()
const RADIO_LY = radioRangeLy(RADIO_ASOF_YEAR)

/* 거리 표 — 계산기와 같은 calcDistance로 빌드 시 계산 (손으로 옮겨 적지 않는다) */
const ly = (n: number) => `약 ${Math.round(n).toLocaleString('ko-KR')} 광년`
const yr = (n: number) => `약 ${Math.round(n).toLocaleString('ko-KR')}년`
const DIST_ROWS = [
  { n: 100,       note: '' },
  { n: 1_000,     note: '그린뱅크 회의(1961) 추정 범위의 하한' },
  { n: 10_000,    note: '드레이크가 생전에 자주 제시한 값' },
  { n: 100_000,   note: '' },
  { n: 1_000_000, note: '칼 세이건 추정 수준' },
].map(r => {
  const d = calcDistance(r.n, RADIO_LY)!
  const inRange = d.nearestDistance <= RADIO_LY
  return { ...r, d, note: [r.note, inRange ? `인류 전파권(${RADIO_LY}ly) 안` : `인류 전파(${RADIO_LY}ly) 미도달`].filter(Boolean).join(' · ') }
})

/* 계산 예시 — 계산기 첫 화면의 '현실론' 예시값(drakeUtils PRESETS.realistic을 그대로 사용 → 계산기와 자동 동기화) */
const EX = PRESETS.realistic
const EX_N = EX.rStar * EX.fp * EX.ne * EX.fl * EX.fi * EX.fc * EX.L
const EX_D = calcDistance(EX_N, RADIO_LY)!
const EX_PER_YEAR = EX_N / EX.L   // 해마다 새로 교신 능력을 갖추는 문명 수
const GALAXY_VOL_TRILLION = GALAXY_VOLUME_LY3 / 1e12

export const metadata = buildMetadata({
  path: '/tools/life/drake',
  title: '드레이크 방정식 계산기 — 외계 문명 수·거리·페르미 역설',
  description: `외계 문명은 몇 개나 존재할까. 드레이크 방정식 7개 변수 시뮬과 가장 가까운 문명 거리·왕복 통신 시간·인류 전파권 ${RADIO_LY}광년·페르미 역설 가설까지.`,
  keywords: ['드레이크방정식계산기', '외계인존재확률', '드레이크방정식', '우주문명계산기', '외계생명체확률', '페르미역설', '지적생명체계산기', '대필터', '레어 어스 가설', '인류 전파권', '가장 가까운 외계'],
})

const FAQ_LD = [
              { q: '드레이크 방정식은 얼마나 신뢰할 수 있나요?',
                a: '드레이크 방정식은 정확한 예측 도구라기보다 우리가 무엇을 모르는지를 구조화하는 프레임워크입니다. 특히 fl(생명 발생 확률)과 L(문명 존속 기간)은 현재 과학으로 추정하기 거의 불가능한 변수입니다. 결과값은 수십 자릿수까지 달라질 수 있습니다.' },
              { q: '케플러 망원경이 드레이크 방정식에 어떤 영향을 미쳤나요?',
                a: '케플러 망원경(2009~2018)은 fp(행성 보유 비율)를 크게 높였습니다. 관측 결과 대부분의 별이 행성을 가지고 있음이 확인되어 fp는 0.5 이상으로 상향됐습니다. 거주 가능 구역 행성도 수십~수백억 개로 추정됩니다.' },
              { q: '페르미 역설이란 무엇인가요?',
                a: '엔리코 페르미가 1950년 제기한 역설로, &ldquo;우주가 이렇게 넓고 오래됐다면 외계 문명이 있을 텐데, 왜 아무런 증거가 없는가?&rdquo;라는 질문입니다. 드레이크 방정식이 많은 문명을 예측할수록 이 역설은 더 강해집니다.' },
              { q: '대필터(Great Filter)란 무엇인가요?',
                a: '로빈 핸슨이 1998년 제안한 개념으로, 생명체가 우주를 정복할 수준으로 발전하는 경로에 거의 모든 문명을 멸종시키는 단계가 있다는 가설입니다. 대필터가 인류 앞에 있다면(핵전쟁·기후변화·AI 위험 등) 인류 문명의 미래가 어둡다는 의미가 됩니다.' },
              { q: '실제로 외계 신호를 받은 적 있나요?',
                a: '1977년 &ldquo;와우! 신호(Wow! Signal)&rdquo;가 가장 유명한 사례입니다. 72초간 강력한 협대역 전파 신호가 감지됐지만 이후 재현되지 않았습니다. 2016년 러시아 RATAN-600이 HD 164595(태양과 비슷한 별, 약 95광년) 방향에서 포착한 신호도 화제였으나 단발성이었고 후속 관측에서 재현되지 않았습니다. 현재까지 외계 기원으로 공식 확인된 신호는 없습니다.' },
              { q: '가장 가까운 외계 문명까지 거리는 어떻게 계산하나요?',
                a: `우리 은하를 디스크(반경 50,000광년 × 두께 1,000광년)로 가정하고 N개 문명이 균등 분포한다고 보면, <strong>평균 간격 ≈ (은하 부피 / N)<sup>1/3</sup></strong>, 가장 가까운 거리 ≈ 평균 × 0.55(Poisson 통계 근사). 예: N = 1만 → 가장 가까운 약 507광년, N = 100만 → 약 109광년(인류 전파권 ${RADIO_LY}ly 안). 본 도구가 N값에 따라 자동 계산합니다. 단, 균등 분포를 가정한 값이라 실제로는 별이 몰린 나선팔에 문명이 집중돼 있을 수 있습니다.` },
              { q: '인류 전파는 어디까지 도달했나요?',
                a: `약 <strong>${RADIO_LY}광년</strong> (${RADIO_START_YEAR}년 첫 라디오부터 ${RADIO_ASOF_YEAR}년 기준). 100광년 내 별 약 14,000개를 통과했습니다. 알파 센타우리(4.37광년) 1904년, 시리우스(8.6광년) 1909년, 베가(25광년) 1925년경 도달. 다만 인류 전파는 약하고 분산되어 실제 외계 문명이 감지하려면 매우 큰 안테나가 필요합니다.` },
              { q: 'N값에 따라 어떤 페르미 역설 가설이 유력한가요?',
                a: '본 도구가 N값에 따라 자동으로 가장 유력한 가설 2개를 추천합니다. 대략적 경향: <br/>• N &lt; 10: 레어 어스 (지구가 특별)<br/>• N 10~10,000: 대필터·시끄러움<br/>• N 1,000~100만: 동물원·시끄러움<br/>• N 100만+: 디지털 문명·관찰 회피<br/>슬라이더로 변수를 조정하면 추천도 즉시 갱신됩니다.' },
              { q: '거리 계산이 실제 우주와 일치하나요?',
                a: '본 도구의 거리 계산은 <strong>단순화된 모델</strong>입니다. 실제 우주는 ① 별이 나선팔에 집중(균등 분포 X) ② 은하 중심 vs 외곽 별 밀도 차이 ③ 거주 가능 영역(Galactic Habitable Zone) 제한이 있습니다. 태양 근처 별 평균 간격은 약 4광년. 본 도구는 평균 거리 직관용이며 실제 위치 예측이 아닙니다.' },
            ]

// 공유 링크 파라미터(?r=&fp=…)는 Client가 마운트 후 window.location.search로 읽는다 (페이지 SSG 유지)
export default function DrakePage() {
  return (
    <ToolPage width={760} slug="/tools/life/drake">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />드레이크 방정식 계산기
      </h1>
      <p className="tp-lead">
        외계 문명은 몇 개나 존재할까. 7개 변수를 직접 조정하며 <strong style={{ color: 'var(--text)' }}>페르미 역설</strong>까지.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="드레이크 방정식(1961) 원형 · 탐사 현황은 NASA·Breakthrough Initiatives 발표 기준 · 거리는 은하 원반 균등 분포를 가정한 단순 모델"
        sources={[
          { label: 'SETI Institute — Drake Equation', href: 'https://www.seti.org/research/seti-101/drake-equation/' },
          { label: 'NASA Exoplanet Archive', href: 'https://exoplanetarchive.ipac.caltech.edu/' },
          { label: 'NASA Science — Europa Clipper', href: 'https://science.nasa.gov/mission/europa-clipper/' },
          { label: 'Breakthrough Listen', href: 'https://breakthroughinitiatives.org/initiative/1' },
        ]}
      />

      <DrakeEquationClient radioRangeLy={RADIO_LY} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 ── */}
        <div>
          <h2 className="g-h2">
            드레이크 방정식 공식
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 'var(--radius-card)', padding: '24px 22px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', margin: 0 }}>
              <span style={{ color: 'var(--accent)' }}>N</span> = R<sub>*</sub> × f<sub>p</sub> × n<sub>e</sub> × f<sub>l</sub> × f<sub>i</sub> × f<sub>c</sub> × L
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '10px 0 0', letterSpacing: '0.04em' }}>
              7개 변수의 곱으로 은하 내 교신 가능 문명 수(N)를 추정
            </p>
          </div>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기호', '의미', '단위', '현재 추정 범위'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { sym: 'N',   mean: '교신 가능한 문명 수',  unit: '개',    range: '계산 결과' },
                  { sym: 'R*',  mean: '별 생성률',            unit: '개/년',  range: '1 ~ 3' },
                  { sym: 'fp',  mean: '행성 보유 별 비율',     unit: '-',      range: '0.5 ~ 1.0' },
                  { sym: 'ne',  mean: '거주 가능 행성 수',     unit: '개',    range: '0.1 ~ 2' },
                  { sym: 'fl',  mean: '생명 발생 확률',        unit: '-',      range: '0.001 ~ 1.0' },
                  { sym: 'fi',  mean: '지적 생명체 확률',      unit: '-',      range: '0.01 ~ 1.0' },
                  { sym: 'fc',  mean: '교신 기술 개발 확률',   unit: '-',      range: '0.01 ~ 0.5' },
                  { sym: 'L',   mean: '문명 존속 기간',        unit: '년',     range: '100 ~ 10억' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.sym}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{row.mean}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.unit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 1-1. 계산 예시·해석 ── */}
        <div>
          <h2 className="g-h2">
            계산 예시와 결과 읽는 법
          </h2>
          <p className="g-p">
            계산기 첫 화면의 &lsquo;현실론&rsquo; 예시값은 R<sub>*</sub> = {EX.rStar}, f<sub>p</sub> = {EX.fp}, n<sub>e</sub> = {EX.ne}, f<sub>l</sub> = {EX.fl}, f<sub>i</sub> = {EX.fi}, f<sub>c</sub> = {EX.fc}, L = {EX.L.toLocaleString('ko-KR')}년입니다.
            앞의 여섯 항을 곱하면 {EX_PER_YEAR.toLocaleString('ko-KR', { maximumFractionDigits: 4 })} — 우리 은하에서 <strong>해마다 새로 교신 능력을 갖추는 문명 수</strong>이고,
            여기에 문명이 그 능력을 유지하는 기간 L을 곱하면 지금 이 순간 동시에 존재하는 문명 수 N = <strong>{Math.round(EX_N).toLocaleString('ko-KR')}</strong>가 나옵니다.
          </p>
          <p className="g-p">
            이 N을 은하 원반 부피(반경 5만 광년 × 두께 1천 광년 ≈ {GALAXY_VOL_TRILLION.toFixed(2)}조 세제곱광년)에 고르게 흩어 놓으면 문명 사이 평균 간격은 {ly(EX_D.averageDistance)},
            가장 가까운 문명까지는 {ly(EX_D.nearestDistance)}이고, 신호를 보내고 답을 받기까지 {yr(EX_D.roundTripCommYears)}이 걸립니다.
            결과를 읽을 때 기억할 점은 세 가지입니다. 첫째, <strong>N은 모든 변수에 정비례</strong>합니다 — 어느 한 값을 10배 바꾸면 N도 정확히 10배가 되므로,
            불확실성이 가장 큰 f<sub>l</sub>·f<sub>i</sub>·L이 결과를 좌우합니다. 둘째, <strong>N이 1보다 작다면</strong> 지금 우리 은하에서 교신 가능한 문명이 평균적으로 한 곳도 되지 않는다는 뜻으로,
            인류가 예외적인 존재라는 해석(레어 어스)과 맞닿아 있습니다. 셋째, 거리 계산은 N에 세제곱근으로 반응하므로 <strong>N이 1,000배 늘어도 거리는 10분의 1로만 줄어듭니다</strong>.
          </p>
        </div>

        {/* ── 2. 역사 ── */}
        <div>
          <h2 className="g-h2">
            드레이크 방정식의 역사
          </h2>
          <p className="g-p">
            드레이크 방정식은 1961년 미국 천문학자 <strong style={{ color: 'var(--text)' }}>프랭크 드레이크(Frank Drake)</strong>가
            웨스트버지니아 그린뱅크 천문대에서 열린 외계지적생명체 탐사(SETI) 관련 회의를 위해 만들었습니다.
            특정 답을 얻기 위한 계산식이 아니라, <strong style={{ color: 'var(--text)' }}>&ldquo;외계 문명을 만나려면 어떤 것들을 알아야 하는가&rdquo;</strong>를
            구조화한 프레임워크로 제안된 것입니다.
          </p>
          <p className="g-p">
            이후 천문학자이자 작가인 <strong style={{ color: 'var(--text)' }}>칼 세이건(Carl Sagan)</strong>이 저서와 TV 시리즈 &ldquo;코스모스&rdquo;를 통해 대중화했고,
            현재도 천문학·우주생물학의 핵심 사고 도구로 쓰이며 SETI 프로그램의 이론적 기반을 이루고 있습니다.
          </p>
        </div>

        {/* ── 3. 대표 추정 결과 비교 ── */}
        <div>
          <h2 className="g-h2">
            대표적 추정 결과 비교
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['추정자 / 관점', 'N 값', '주요 가정'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { who: '그린뱅크 회의 (1961)',    n: '1,000 ~ 1억 개', color: 'var(--accent-ink)', note: 'N ≈ L(문명 존속 연수)로 정리 — 불확실성이 커 범위로 제시' },
                  { who: '칼 세이건 (낙관, 1960~80년대)', n: '~100만 개',  color: 'var(--success)', note: '생명 발생·진화 확률 높게 가정' },
                  { who: '프랭크 드레이크 (후년)',    n: '~10,000 개',    color: 'var(--accent-ink)', note: 'L ≈ 1만 년 가정 — 강연·인터뷰에서 자주 제시' },
                  { who: `본 도구 "현실론" 예시`,    n: `${Math.round(EX_N).toLocaleString('ko-KR')} 개`,   color: 'var(--accent-ink)', note: '중간 가정 (공식 합의값 아님)' },
                  { who: '비관론 (레어 어스)',     n: '< 1 개',        color: 'var(--warning)', note: '지구 조건이 매우 특별함' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row.who}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.color, fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="warn" title="합의된 정답은 없습니다">
              위 값은 가정에 따른 <strong>예시</strong>입니다. fl(생명 발생)·fi(지능 진화)·L(문명 수명)은 아직 알려진 바가 없어 <strong>공식적으로 합의된 추정치나 &lsquo;중앙값&rsquo;은 존재하지 않습니다</strong> (SETI Institute). 결과는 입력값에 따라 수십 자릿수까지 달라집니다.
            </Callout>
          </div>
        </div>

        {/* ── 4. 페르미 역설 ── */}
        <div>
          <h2 className="g-h2">
            페르미 역설 — 그들은 어디에 있는가?
          </h2>
          <p className="g-p">
            드레이크 방정식이 많은 문명을 예측한다면, 왜 우리는 아직 단 하나의 외계 신호도 받지 못했을까요?
            이탈리아 물리학자 <strong style={{ color: 'var(--text)' }}>엔리코 페르미</strong>가 1950년 점심 식사 중 던진 이 질문이 &ldquo;페르미 역설&rdquo;이 되었고,
            이를 해명하기 위한 수많은 가설이 제시됐습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '대필터 가설',         desc: '문명이 특정 단계(지능 출현, 행성 이탈, 초장기 존속 등)에서 거의 모두 멸종한다는 가설. 우리 앞에 필터가 있다면 인류 미래는 어둡다.', color: '#EA580C' },
              { n: '②', title: '동물원 가설',         desc: '외계 문명이 우리를 일부러 관찰만 하고 접촉하지 않는다는 가설. 성숙한 문명 전에는 간섭하지 않기로 합의했을 수 있음.',            color: '#0891B2' },
              { n: '③', title: '우리가 너무 시끄러움', desc: '인류의 전파는 100년에 불과해 수천~수만 광년 거리의 문명에 아직 도달하지 못함. 반대로 그들 신호도 아직 도착 안 함.',         color: 'var(--accent)' },
              { n: '④', title: '이미 지나쳐 감',      desc: '초문명은 생물학적 형태를 벗어난 디지털·기계 존재로, 이미 전파 통신을 벗어나 우리가 알아채지 못함.',                      color: '#9333EA' },
              { n: '⑤', title: '우리가 유일함',       desc: '레어 어스 가설 — 지구와 같은 안정된 항성, 거대 위성(달), 자기장, 판 구조 등의 조합은 극도로 드물다.',                  color: '#DB2777' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}44`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: item.color, fontWeight: 700, marginBottom: '6px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 현재 탐사 현황 ── */}
        <div>
          <h2 className="g-h2">
            현재 외계 생명체 탐사 현황
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '케플러 · TESS 망원경', desc: 'NASA가 집계한 확인된 외계행성은 2025년 9월 6,000개를 넘었고, 이후에도 계속 늘고 있습니다(NASA Exoplanet Archive에서 실시간 확인). 거주 가능 구역(골디락스 존) 후보 행성도 다수 확인되어 fp 추정값을 크게 끌어올림.' },
              { title: 'Breakthrough Listen',  desc: '2015년 7월 출범한 10년·1억 달러 규모의 SETI 프로젝트(관측은 2016년부터). 가까운 별 100만 개와 100개 은하의 전파·광학 신호를 스캔.' },
              { title: '제임스 웹 우주망원경(JWST)', desc: '외계행성 대기 성분 분석 가능. 산소·메탄 등 생명 활동 지표(바이오시그니처)를 찾는 중.' },
              { title: '엔셀라두스 · 유로파',   desc: '태양계 내 얼음 밑 바다를 가진 위성들. NASA Europa Clipper는 2024년 10월 발사돼 항해 중 — 2030년 4월 목성 궤도에 진입하고, 2031년부터 유로파 근접 비행 탐사 예정.' },
              { title: '중국 톈옌(FAST) 전파망원경', desc: '세계 최대 단일 전파망원경. 2022년 보고된 후보 신호는 이후 전파 간섭(RFI)으로 외계 기원 가능성이 거의 배제됨.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.6 }}>
            출처: NASA Exoplanet Archive · NASA Science(Europa Clipper) · Breakthrough Initiatives · SETI Institute (2026년 9월 확인). 거리·문명 수는 본문 모델 가정에 따른 추정입니다.
          </p>
        </div>

        {/* ── 6. 가장 가까운 외계 문명까지 거리 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            가장 가까운 외계 문명까지 거리
          </h2>
          <p className="g-p">
            우리 은하를 디스크(반경 50,000광년 × 두께 1,000광년)로 가정하고 N개 문명이 균등 분포한다고 보면, 평균 문명 간 거리 ≈ (은하 부피 / N)<sup>1/3</sup>, 가장 가까운 문명 ≈ 평균 × 0.55 (Poisson 통계 근사). 본 도구의 결과 카드에 자동 표시됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>N (문명 수)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>평균 거리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>가장 가까운</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>왕복 통신</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {DIST_ROWS.map((r, i) => (
                  <tr key={r.n} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>N = {r.n.toLocaleString('ko-KR')}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{ly(r.d.averageDistance)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--danger)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>{ly(r.d.nearestDistance)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>{yr(r.d.roundTripCommYears)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 본 추정은 균등 분포 가정. 실제 외계 문명이 존재한다면 은하 나선팔에 집중되어 있을 가능성이 큽니다.
          </p>
        </div>

        {/* ── 7. 인류 전파권 시간선 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            인류 전파권 시간선
          </h2>
          <p className="g-p">
            인류는 {RADIO_START_YEAR}년경 첫 라디오 송신을 시작했습니다. {RADIO_ASOF_YEAR}년 기준 전파 도달 거리는 약 <strong style={{ color: 'var(--text)' }}>{RADIO_LY}광년</strong>, 100광년 내 별 약 <strong style={{ color: 'var(--text)' }}>14,000개</strong>를 통과했습니다. 가까운 별 도달 시점은 다음과 같습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>대상 별</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>전파 도달 연도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['알파 센타우리 (가장 가까운 항성)', '4.37 광년',   '약 1904년'],
                  ['시리우스 (밤하늘 가장 밝은 별)',   '8.6 광년',    '약 1909년'],
                  ['바너드 별',                        '5.96 광년',   '약 1906년'],
                  ['베가 (직녀성)',                    '25.0 광년',   '약 1925년'],
                  ['알타이르 (견우성)',                '16.7 광년',   '약 1917년'],
                  ['100광년 거리 별',                  '100 광년',    '약 2000년'],
                  ['현재 전파 최외곽',                 `${RADIO_LY} 광년`, `${RADIO_ASOF_YEAR}년 (현재)`],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Callout tone="note" title="도달했다고 들리는 것은 아닙니다">
              인류 전파는 약하고 분산되어 실제 외계 문명이 감지하려면 매우 큰 안테나가 필요합니다. 또한 그들이 응답을 보내고 우리에게 도달하기까지 같은 시간이 추가로 걸립니다(왕복 통신).
            </Callout>
          </div>
        </div>

        {/* ── 8. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/lotto',        icon: '🎰', name: '로또 번호 생성기',   desc: '확률의 재미 · 당첨 확률 1/814만' },
              { href: '/tools/art/golden-ratio', icon: '🌀', name: '황금 비율 계산기',   desc: '우주와 자연을 관통하는 수학' },
              { href: '/tools/art/frequency',   icon: '🎵', name: '주파수↔음정 변환기', desc: '우주 전파·SETI 주파수 대역 이해' },
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',      desc: '제1회 외계인 접촉까지 D-day?' },
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
