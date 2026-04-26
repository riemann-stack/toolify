import Link from 'next/link'
import FartRiskClient from './FartRiskClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/fart-risk',
  title: '방귀 유발 가능성 계산기 — 오늘 내 가스 점수는?',
  description: '오늘 먹은 음식으로 방귀·가스 유발 가능성을 계산합니다. 콩류·유제품·탄산의 조합 점수, 원인 TOP3, 완화 팁 제공. 재미로 확인하는 장 건강 체크!',
  keywords: ['방귀유발음식', '가스유발음식', '방귀계산기', '고구마방귀', '콩방귀', '탄산방귀', '방귀원인음식', 'FODMAP'],
})

export default function FartRiskPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💨 방귀 유발 가능성 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        오늘 먹은 음식과 조건을 체크하면 가스 유발 가능성 점수와 원인 TOP 3, 완화 팁을 보여드려요.
      </p>

      <FartRiskClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 과학 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>가스를 만드는 음식의 과학</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            방귀는 음식을 먹을 때 함께 삼킨 공기와 장내 세균이 특정 성분을 <strong style={{ color: 'var(--text)' }}>발효</strong>할 때 생기는 가스가 섞여 만들어집니다.
            작은창자에서 미처 흡수되지 못한 탄수화물이 대장까지 내려오면 세균이 이를 분해하면서 수소·메탄·이산화탄소가 만들어지고, 황 성분이 있으면 고약한 냄새가 납니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            가스 생성의 주범은 크게 4가지입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { title: '올리고당', desc: '콩류에 많은 라피노스·스타키오스. 인간은 분해 효소가 없어 그대로 대장으로 전달됨.' },
              { title: '유당', desc: '우유·치즈·아이스크림 속 당. 락타아제가 부족하면 소화되지 않고 발효됨.' },
              { title: '과당', desc: '과일(사과/배/수박)과 꿀에 많음. 흡수 용량을 넘으면 대장에서 발효됨.' },
              { title: '폴리올', desc: '인공감미료 소르비톨·자일리톨. 거의 흡수되지 않고 대장에서 발효됨.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '12px' }}>
            이 네 가지를 묶어 <strong style={{ color: 'var(--text)' }}>FODMAP</strong>(Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols)이라 부릅니다. 쉽게 말해 "작은창자에서 흡수되지 않고 대장에서 발효되기 쉬운 탄수화물"입니다.
          </p>
        </div>

        {/* 2. TOP 7 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>가스 유발 음식 TOP 7</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { rank: '1', emoji: '🫘', name: '콩류',            desc: '올리고당 함량이 가장 높은 슈퍼 발효 재료.' },
              { rank: '2', emoji: '🍬', name: '인공감미료',       desc: '소르비톨·자일리톨 등 소화되지 않는 당알코올.' },
              { rank: '3', emoji: '🥛', name: '우유',             desc: '유당분해효소가 부족하면 그대로 발효됨.' },
              { rank: '4', emoji: '🧅', name: '양파·마늘',        desc: '프럭탄 함유. 소량이라도 장이 예민하면 바로 반응.' },
              { rank: '5', emoji: '🥤', name: '탄산음료',         desc: '가스를 직접 삼켜 트림·방귀로 배출됨.' },
              { rank: '6', emoji: '💪', name: '단백질 보충제',    desc: '유청 단백질(유당) + 인공감미료 조합이 문제.' },
              { rank: '7', emoji: '🥦', name: '양배추·브로콜리', desc: '황 함유 → 냄새가 특히 고약함.' },
            ].map((item) => (
              <div key={item.rank} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--accent)', minWidth: '26px' }}>{item.rank}</span>
                <span style={{ fontSize: '22px' }}>{item.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 조합 비교 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>나쁜 조합 vs 괜찮은 조합</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255,70,70,0.06)', border: '1px solid rgba(255,70,70,0.3)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#FF6B6B', marginBottom: '10px' }}>🚨 최악 조합</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  '콩밥 + 양파볶음 + 탄산',
                  '단백질 쉐이크 + 우유 + 브로콜리',
                  '맥주 + 치즈 + 감자칩',
                ].map((t, i) => (
                  <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>• {t}</li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'rgba(62,255,155,0.06)', border: '1px solid rgba(62,255,155,0.3)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#3EFF9B', marginBottom: '10px' }}>✅ 괜찮은 조합</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  '현미밥 + 두부(소량) + 채소(브로콜리 제외)',
                  '닭가슴살 + 쌀밥 + 오이',
                  '고기구이 + 쌈채소 (양파·마늘 소량)',
                ].map((t, i) => (
                  <li key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4. 실용 팁 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>가스 줄이는 실용 팁</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>즉각 효과</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '식사 후 가벼운 산책 10~15분',
                  '따뜻한 물 또는 생강차 마시기',
                  '무릎 당기기 스트레칭 (가스 배출 촉진)',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>평소 습관</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '천천히 먹기 (공기 삼킴 감소)',
                  '탄산 대신 물 마시기',
                  '콩류는 충분히 불리고 삶기',
                  '유제품 민감하면 락토프리 제품으로',
                ].map((t, i) => <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>• {t}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 5. FAQ */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '방귀는 하루에 몇 번이 정상인가요?', a: '의학적으로 하루 평균 13~21회 방귀는 정상입니다. 소리 없이 나오는 것까지 포함하면 생각보다 많습니다. 횟수보다 냄새와 복부 불편감이 지속될 때 주의가 필요합니다.' },
              { q: '고구마와 우유를 같이 먹으면 왜 배가 더 아프나요?', a: '고구마의 식이섬유·전분과 우유의 유당이 합쳐지면 대장에서 발효가 가속화됩니다. 두 재료 모두 가스 생성력이 있어 함께 먹으면 시너지 효과가 발생합니다.' },
              { q: '계란 방귀가 냄새가 심한 이유는?', a: '계란에는 황(S) 함유 아미노산(메티오닌, 시스테인)이 풍부합니다. 대장에서 발효될 때 황화수소(H₂S) 가스가 생성되어 특유의 고약한 냄새를 만듭니다. 양배추·브로콜리도 같은 이유입니다.' },
              { q: '단백질 보충제를 먹으면 가스가 차는 이유는?', a: '대부분의 단백질 보충제에는 유청단백질(유당 포함)과 인공감미료(소르비톨·자일리톨)가 들어있습니다. 두 성분 모두 장에서 발효되기 쉬운 고위험 재료입니다. 분리유청단백(WPI)이나 식물성 단백질 제품이 더 소화가 잘 됩니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent)', marginBottom: '8px' }}>Q. {item.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 면책 */}
        <div style={{ background: 'var(--bg2)', border: '1px dashed var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, textAlign: 'center' }}>
            본 계산기는 유머와 재미를 위한 참고용 도구입니다. 실제 소화기 증상, 과민성대장증후군(IBS), 유당불내증 등 의학적 상태에 대해서는 반드시 전문 의료인과 상담하시기 바랍니다.
          </p>
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr',       emoji: '🔥', name: '기초대사량 계산기', desc: '하루 칼로리 관리' },
              { href: '/tools/health/bmi',       emoji: '⚖️', name: 'BMI 계산기',        desc: '체중 관리' },
              { href: '/tools/life/pomodoro',    emoji: '🍅', name: '뽀모도로 타이머',   desc: '식사 후 휴식 관리' },
              { href: '/tools/life/dutch',       emoji: '🤝', name: '더치페이 계산기',   desc: '외식 비용 나누기' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
