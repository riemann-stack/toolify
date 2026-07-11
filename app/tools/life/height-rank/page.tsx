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
    a: '사이즈코리아 8차 한국인 인체치수조사(직접측정 2020~2021, 20~69세 6,839명) 기준 <strong>남성 172.5cm, 여성 159.6cm</strong>입니다. 연령대별로는 남성 20~39세가 174.7~175.4cm로 가장 크고 60대는 168.2cm, 여성은 20~39세 161.8~162.4cm·60대 155.5cm로 세대 차이가 뚜렷해요. 참고로 2024년 병역판정검사(2005년생 남성 약 21만 명) 평균은 174.54cm였습니다.',
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

        {/* 3. 흥미 포인트 */}
        <section>
          <h2 style={sectionTitle}>키 통계, 이런 점이 흥미로워요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '📈 45년간 +6.4cm', d: '1979년 1차 조사 대비 8차에서 남성 +6.4cm, 여성 +5.3cm. 다만 최근 병역판정검사 평균은 174.5cm 부근에서 정체 추세예요.' },
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

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
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
