import Link from 'next/link'
import HeightRankClient from './HeightRankClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/life/height-rank',
  title: '키 백분위 계산기 — 내 키 상위 몇 %?',
  description: '내 키가 한국에서 상위 몇 %인지 사이즈코리아 8차 실측 통계(성별·연령대별 평균·표준편차)로 계산. 100명 중 몇 번째인지, 분포 곡선 위 내 위치까지.',
  keywords: [
    '키 백분위', '키 상위 몇 프로', '한국 남자 평균키', '한국 여자 평균키',
    '키 순위 계산기', '연령별 평균 신장', '사이즈코리아 키', '키 통계',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: '한국 남자·여자 평균 키는 몇인가요?',
    a: '사이즈코리아 8차 한국인 인체치수조사(직접측정 2020~2021, 20~69세 6,839명) 기준 <strong>남성 172.5cm, 여성 159.6cm</strong>입니다. 연령대별로는 남성 20~39세가 174.7~175.4cm로 가장 크고 60대는 168.2cm, 여성은 20~39세 161.8~162.4cm·60대 155.5cm로 세대 차이가 뚜렷해요. 참고로 병무청 병역판정검사 평균 신장은 2024년 174.5cm입니다(수검자의 약 95%가 19세).',
  },
  {
    q: '백분위는 어떻게 계산하나요?',
    a: '같은 성별·연령대의 <strong>실측 평균과 표준편차</strong>에 정규분포 모델을 적용합니다(z = (내 키 − 평균) ÷ 표준편차 → 누적확률). 성인 신장은 통계학에서 정규분포로 잘 근사되는 대표 사례이고, 실제로 8차 조사의 실측 백분위와 비교하면 <strong>p5~p95 구간에서 오차가 최대 1cm 미만</strong>임을 확인했습니다. 다만 상·하위 0.1% 밖의 극단 구간은 오차가 커져 &lsquo;이내&rsquo;로만 표시해요.',
  },
  {
    q: '남자 180cm면 상위 몇 %인가요?',
    a: '20대 초반(평균 174.99cm, 표준편차 5.61cm) 기준 z ≈ 0.89로 <strong>약 상위 19%</strong> — 100명 중 앞에서 19번째 정도입니다. 흔히 &lsquo;180이면 장신&rsquo;이라는 인식과 달리 20대에서는 다섯 명 중 한 명꼴이에요. 반면 60대(평균 168.22cm)에서는 상위 1.7%로 확실한 장신입니다. 같은 키라도 연령대에 따라 체감이 크게 다른 이유죠.',
  },
  {
    q: '왜 연령대별로 평균이 다른가요?',
    a: '영양·생활환경 개선으로 세대가 젊을수록 평균 키가 커졌기 때문입니다(코호트 효과). 8차 조사에서 남성은 30대 후반 175.4cm vs 60대 168.2cm로 <strong>7cm 이상 차이</strong>가 나요. 1979년 1차 조사 대비로는 남성 +6.4cm, 여성 +5.3cm 커졌습니다. 나이가 들며 실제로 키가 조금 줄어드는 효과(척추 압축)도 일부 섞여 있어요. 그래서 이 계산기는 반드시 연령대를 선택하도록 설계했습니다.',
  },
  {
    q: '아침저녁으로 키가 다른데 어떤 키를 넣어야 하나요?',
    a: '기상 직후에는 척추 디스크가 이완돼 있어 저녁보다 <strong>1~2cm가량 크게</strong> 측정됩니다. 공식 신체검사는 보통 주간에 이뤄지므로 낮 시간대 측정값이 통계와 가장 비교하기 좋아요. 중앙값 근처에서는 1cm가 백분위 약 7%p를 움직일 만큼 민감하니, 순위가 애매하게 나왔다면 측정 시각 차이일 수 있습니다.',
  },
  {
    q: '데이터 출처는 어디인가요?',
    a: '국가기술표준원 <strong>사이즈코리아 8차 한국인 인체치수조사</strong>(직접측정, 20~69세 6,839명)의 성별×연령대별 키 평균·표준편차·백분위 통계입니다. 산업 설계용 국가 표준 인체 데이터라 신뢰도가 높아요. 70세 이상은 별도 고령자 조사로 진행되어 이 계산기에는 포함하지 않았습니다. 표본조사이므로 전수 통계(병무청 병역판정검사 등)와는 수치가 약간 다를 수 있습니다.',
  },
]

const RELATED = [
  { href: '/tools/health/child-height', icon: '📏', name: '자녀 키 예측 계산기', desc: '부모 키로 예상 키' },
  { href: '/tools/finance/wealth-rank', icon: '🏆', name: '자산 순위 계산기', desc: '순자산 상위 몇 %' },
  { href: '/tools/health/bmi', icon: '⚖️', name: 'BMI 계산기', desc: '키·몸무게 체질량' },
  { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '하루 소모 칼로리' },
  { href: '/tools/unit/size', icon: '👕', name: '사이즈 변환기', desc: '옷·신발 국가별 사이즈' },
  { href: '/tools/life/zodiac', icon: '🐯', name: '띠·별자리 계산기', desc: '띠·궁합·60갑자' },
]

export default function HeightRankPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        생활·재미
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="life" />키 백분위 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        내 키, 한국에서 <strong style={{ color: 'var(--text)' }}>상위 몇 %</strong>일까? 사이즈코리아 8차 실측 통계로 100명 중 몇 번째인지 확인.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="사이즈코리아 8차 한국인 인체치수조사 (직접측정 2020~2021, 20~69세 6,839명) 성별·연령대별 실측 통계"
        sources={[
          { label: '사이즈코리아', href: 'https://sizekorea.kr' },
          { label: '국가기술표준원', href: 'https://www.kats.go.kr' },
        ]}
      />

      <HeightRankClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 방식 */}
        <section>
          <h2 style={sectionTitle}>백분위 계산 방식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>z 점수</span> = (내 키 − 연령대 평균) ÷ 표준편차</div>
            <div><span style={{ color: 'var(--muted)' }}>백분위</span> = 표준정규 누적확률(z) × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>상위 %</span> = 100 − 백분위</div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginTop: 12 }}>
            성인 신장은 성별·연령 집단 안에서 정규분포를 잘 따르는 대표적인 신체 지표입니다. 이 계산기의 정규 모델은
            8차 조사의 <strong style={{ color: 'var(--text)' }}>실측 백분위(p5~p95)와 최대 1cm 미만 오차</strong>로 일치함을 검증했어요.
          </p>
        </section>

        {/* 2. 연령대별 평균표 */}
        <section>
          <h2 style={sectionTitle}>연령대별 평균 키 (8차 실측)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연령대', '남성 평균', '여성 평균', '차이(남−여)'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['20~24세', 174.99, 161.78],
                  ['25~29세', 174.74, 162.07],
                  ['30~34세', 175.18, 162.32],
                  ['35~39세', 175.42, 162.37],
                  ['40~44세', 174.08, 161.34],
                  ['45~49세', 172.66, 159.92],
                  ['50~59세', 170.49, 157.75],
                  ['60~69세', 168.22, 155.46],
                ].map(([label, m, f], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{(m as number).toFixed(1)}cm</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{(f as number).toFixed(1)}cm</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>{((m as number) - (f as number)).toFixed(1)}cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 사이즈코리아 8차 인체치수조사 인체데이터 통계(mm 원값을 cm로 환산). 남성은 35~39세, 여성은 35~39세 구간이 최고 평균 — 20대 초반보다 30대가 큰 것은 표본 변동 범위 내입니다.
          </p>
        </section>

        {/* 3. 국제 비교 */}
        <section>
          <h2 style={sectionTitle}>국제 비교 — 세계에서 한국인의 키는</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14 }}>
            나라별 키를 견줄 때는 성장이 거의 끝나는 <strong style={{ color: 'var(--text)' }}>19세</strong> 값을 씁니다.
            아래는 200개국 인구 기반 연구를 종합한 NCD-RisC(Lancet 2020)의 2019년 19세 평균 키예요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['국가', '남성 19세', '여성 19세', '200개국 순위(남·여)'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['네덜란드', '183.78cm', '170.36cm', '1위 · 1위'],
                  ['중국', '175.66cm', '163.46cm', '65위 · 54위'],
                  ['한국', '175.52cm', '163.23cm', '68위 · 60위'],
                  ['일본', '172.06cm', '158.50cm', '114위 · 146위'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ NCD-RisC, Lancet 2020;396:1511-1524 국가별 공개 원자료(2019년·19세). 순위는 논문이 공표한 순위표가 아니라 공개 CSV를 정렬해 자체 산출한 값입니다.
            한국은 남성 95% 신용구간 174.92~176.14cm·여성 162.58~163.84cm로, 여성은 중국과 0.2cm 차이여서 우열을 가릴 수 없어요.
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginTop: 14 }}>
            같은 19세끼리 견주면 한국은 일본보다 남성 3.5cm, 여성 4.7cm 큽니다(위 표의 차). 더 극적인 기록도 있어요 —
            1896~1996년 출생 코호트를 200개국·1,860만 명 이상의 자료로 분석한 NCD-RisC의 다른 논문(eLife 2016)은
            <strong style={{ color: 'var(--text)' }}> 지난 100년간 성인 키가 세계에서 가장 많이 자란 집단으로 한국 여성(+20.2cm, 95% 신용구간 17.5~22.7)</strong>을 꼽았습니다.
            같은 자료에서 한국 남성도 159.75cm에서 174.92cm로 약 15.2cm 커졌고요.
            다만 NCD-RisC의 175.52cm는 여러 연구를 합쳐 모형으로 추정한 값이라, 직접측정 표본인 사이즈코리아 20~24세 174.99cm와 소수점까지 맞아떨어지지는 않습니다.
            국제 비교에는 NCD-RisC를, 국내 백분위 계산에는 사이즈코리아를 쓰는 이유예요.
          </p>
        </section>

        {/* 4. 세속추세 */}
        <section>
          <h2 style={sectionTitle}>한국인 키는 계속 크고 있을까</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14 }}>
            &lsquo;아직 크는 중&rsquo;과 &lsquo;이제 안 큰다&rsquo;가 동시에 돌아다닙니다. 1차 출처를 열어보면 어느 쪽도 단정할 수 없어요 —
            어떤 지표를 어떤 기간으로 보느냐에 따라 답이 갈리기 때문입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>더 이상 안 큰다는 근거</p>
              <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Moon 2011(Korean J Pediatr): 20세 최종 신장이 1965년 남 168.9cm → 1997년 173.4cm → 2005년 174.3cm로 커졌지만, 2005년과 2010년 사이에는 차이가 없었다고 보고.</li>
                <li>Ryoo 2015(Korean J Pediatr): 국민건강영양조사 II(2001)와 V(2010~2012)의 20~22세 차이는 남 0.3±0.8cm(P=0.721)·여 0.5±0.6cm(P=0.386)으로 통계적 유의성 없음.</li>
                <li>병무청 병역판정검사 평균 신장은 2023년 174.4cm·2024년 174.5cm·2025년 174.4cm로 최근 3년 평탄. 수검자의 약 95%가 19세(2025년 211,476/222,425명)라 19세 남성 전수급 지표입니다.</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>아직 큰다는 근거</p>
              <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>국가기술표준원 8차 조사 보도자료(2022. 3.)는 &lsquo;2000년대 이후로도 평균 키가 지속적으로 증가&rsquo;라고 공식 서술(1차 대비 남 +6.4cm·여 +5.3cm).</li>
                <li>NCD-RisC 19세 한국 남성은 2010년 173.98cm → 2019년 175.52cm, 여성은 161.60cm → 163.23cm로 2010년대에도 계속 상승.</li>
                <li>Cole &amp; Mori 2018(Am J Hum Biol)은 1990~2010년 세속추세가 멈춘 쪽은 일본이고, 한국은 1997~2005년에 소폭 증가했다고 명시.</li>
              </ul>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginTop: 18, marginBottom: 8 }}>출생 코호트 10년당 성인(18세) 키 증가폭</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['출생 코호트', '남성', '여성'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1956년생 → 1966년생', '+2.07cm', '+1.75cm'],
                  ['1966년생 → 1976년생', '+1.80cm', '+1.39cm'],
                  ['1976년생 → 1986년생', '+1.10cm', '+1.00cm'],
                  ['1986년생 → 1996년생', '+0.52cm', '+0.85cm'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ NCD-RisC eLife 2016 성인(18세) 국가별 원자료의 한국 값(남 1956년생 169.43 → 1996년생 174.92cm, 여 157.35 → 162.34cm)에서 구간 차를 직접 계산했습니다.
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginTop: 12 }}>
            방향은 여전히 플러스인데 속도는 30년 사이 절반 아래로 떨어졌습니다. 결국
            <strong style={{ color: 'var(--text)' }}> 어떤 지표를 보느냐에 따라 결론이 갈립니다</strong> — 전 인구 평균으로 보면 아직 증가 중이고,
            청년의 최종 신장으로 좁히면 최근 구간은 평탄에 가깝습니다. 두 서술은 모순이 아니라 서로 다른 것을 재고 있는 셈이에요.
          </p>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>20대 174.99cm vs 전체 172.5cm — 왜 다를까</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>
              같은 8차 조사인데 숫자가 다른 건 모집단이 다르기 때문입니다. 남성 172.5cm(여성 159.6cm)는 20~69세를 모두 담은 값이라
              평균 168.2cm인 60대까지 함께 들어가 있고, 174.99cm는 20~24세만 떼어낸 값이에요. 두 값은 공표 단위가 달라 단순 산술로 서로 환산되지 않으니
              인용할 때 연령 범위를 함께 밝히는 편이 안전합니다(자료마다 집계 범위가 달라 표본 수 표기도 다릅니다).
            </p>
          </div>
        </section>

        {/* 5. 흥미 포인트 */}
        <section>
          <h2 style={sectionTitle}>키 통계, 이런 점이 흥미로워요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '📈 45년간 +6.4cm', d: '1979년 1차 조사 대비 8차에서 남성 +6.4cm, 여성 +5.3cm. 다만 병역판정검사 평균은 2023~2025년 174.4~174.5cm로 평탄합니다.' },
              { t: '📊 1cm의 무게', d: '중앙값 근처에서는 1cm가 백분위 약 7%p를 좌우해요. 아침(이완)과 저녁(압축)의 1~2cm 차이만으로도 순위가 꽤 달라집니다.' },
              { t: '🔭 극단은 조심', d: '정규 모델은 상·하위 0.1% 밖 극단 구간에서 오차가 커져요. 그래서 이 계산기는 극단값을 "0.1% 이내"로만 표시합니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
