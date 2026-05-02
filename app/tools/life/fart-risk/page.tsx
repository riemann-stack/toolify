import Link from 'next/link'
import FartRiskClient from './FartRiskClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/fart-risk',
  title: '방귀 유발 가능성 계산기 — 3축 점수·원인 분류·저FODMAP 대체',
  description: '오늘 먹은 음식 → 가스량·냄새·복부팽만 3축 점수, 원인 유형 분류(발효·유당·탄산·소화지연·냄새강화), 저FODMAP 대체 음식, 8가지 증상별 대처 가이드. 재미·교육용.',
  keywords: ['방귀유발음식', '가스유발음식', '방귀계산기', '고구마방귀', '콩방귀', '탄산방귀', '방귀원인음식', 'FODMAP', '저FODMAP 대체', '복부팽만 음식', '유당불내증', '단백질 보충제 가스', '계란 방귀 냄새', '양파 가스', 'WPC WPI 차이'],
})

export default function FartRiskPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💨 방귀 유발 가능성 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        음식·조건 체크 → <strong style={{ color: 'var(--text)' }}>가스량·냄새·복부팽만 3축 점수 + 원인 유형 분류 + 저FODMAP 대체 + 증상별 대처 가이드</strong>까지.
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
            이 네 가지를 묶어 <strong style={{ color: 'var(--text)' }}>FODMAP</strong>(Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols)이라 부릅니다. 쉽게 말해 &ldquo;작은창자에서 흡수되지 않고 대장에서 발효되기 쉬운 탄수화물&rdquo;입니다.
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

        {/* 5. 원인 유형 5가지 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            가스 원인 유형 5가지
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [오늘 점수] 탭은 음식·조건에서 가장 유력한 원인 유형 TOP 2를 자동 분류해 보여줍니다. 본인 패턴 파악에 활용하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { e: '🫧', t: '발효형',     c: '#C8FF3E', d: '콩·양파·마늘·밀·과일·인공감미료 (FODMAP 발효)' },
              { e: '🥛', t: '유당형',     c: '#3EC8FF', d: '우유·치즈·아이스크림·WPC (락타아제 부족)' },
              { e: '🥤', t: '탄산·공기형', c: '#FFD93E', d: '탄산음료·맥주·빠른 식사·빨대 (삼킨 가스)' },
              { e: '🍔', t: '소화지연형', c: '#FF8C3E', d: '과식·튀김·고지방·가공식품 (느린 소화)' },
              { e: '🦨', t: '냄새강화형', c: '#FF6B9D', d: '계란·고기·양배추·브로콜리 (황 성분 → H₂S)' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${m.c}55`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: m.c, marginBottom: '6px' }}>{m.e} {m.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 고FODMAP vs 저FODMAP 종합 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            고FODMAP vs 저FODMAP 음식 한눈에
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            카테고리별로 정리한 고/저 FODMAP 식품 분류표. 본 도구의 [🔄 대체 음식] 탭에서 한 번의 클릭으로 대체 추천을 확인할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>카테고리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#FF6B6B',     fontWeight: 600 }}>🔴 고FODMAP (피하기)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#3EFF9B',     fontWeight: 600 }}>🟢 저FODMAP (대체)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: '🍎 과일',          high: '사과·배·수박·체리·자두·복숭아', low: '바나나(덜 익은)·딸기·블루베리·키위·멜론·오렌지·포도' },
                  { cat: '🥬 채소',          high: '양배추·브로콜리·아스파라거스·양파·마늘',      low: '시금치·상추·당근·호박·토마토·오이·피망' },
                  { cat: '🌾 곡물',          high: '밀가루·보리·잡곡(호밀·통밀)',                 low: '쌀밥·감자·고구마·쌀국수·메밀국수·글루텐프리' },
                  { cat: '🥛 유제품',        high: '우유·치즈·아이스크림',                        low: '락토프리 우유·두유·아몬드/귀리 음료·요거트(소량)' },
                  { cat: '🫘 콩·단백질',     high: '콩류·렌틸콩·병아리콩·WPC 단백질',              low: '두부(75g)·완두콩(1/4컵)·계란·닭가슴살·생선·WPI' },
                  { cat: '🍬 감미료·기타',   high: '인공감미료(소르비톨·자일리톨)·꿀',             low: '소량 설탕·메이플시럽·스테비아' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.cat}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.high}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.low}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ <strong style={{ color: 'var(--text)' }}>완두콩(green peas)</strong>은 1/4컵(약 30g) 이하면 저FODMAP, 그 이상은 GOS 함량으로 중간 위험. <strong style={{ color: 'var(--text)' }}>덜 익은 바나나</strong>는 저FODMAP, 잘 익을수록 과당이 ↑되어 중간으로 변합니다. 같은 음식도 <strong style={{ color: 'var(--text)' }}>양</strong>이 중요합니다 (Monash 대학 기준).
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
            ⚠️ 저FODMAP은 평생 식단이 아닌 <strong style={{ color: 'var(--text)' }}>진단·재도입 도구</strong>입니다. 평생 제한은 영양 결핍·장내 미생물 다양성 ↓ 위험. 영양사 지도 하 진행 권장.
          </p>
        </div>

        {/* 7. 단백질 보충제 종류별 (NEW) */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            💪 단백질 보충제 종류별 가스 위험
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            가스 자주 차는 사람은 WPC → WPI 또는 식물성 단백질로 변경, 인공감미료(소르비톨·자일리톨) 라벨 확인 권장.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>종류</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>단백질</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>유당</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>가스 위험</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '💪 WPC (농축유청)',          p: '70~80%', l: '4~8% (많음)', r: '★★★ (특히 유당불내증)', c: '#FF6B6B' },
                  { n: '💪 WPI (분리유청)',          p: '90%+',   l: '<1% (거의 X)', r: '★★ (낮음)',              c: '#FFD93E' },
                  { n: '🌱 식물성 (완두·쌀·콩)',     p: '80~90%', l: '0%',          r: '★★ (콩 발효 가능)',       c: '#3EC8FF' },
                  { n: '🥛 카제인 (천천히 흡수)',    p: '80%+',   l: '소량',         r: '★★ (소화 지연)',          c: '#FFD93E' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: r.c, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. FAQ (accordion) */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '방귀는 하루에 몇 번이 정상인가요?',
                a: '의학적으로 하루 평균 13~21회 방귀는 정상입니다. 소리 없이 나오는 것까지 포함하면 생각보다 많습니다. 횟수보다 냄새와 복부 불편감이 지속될 때 주의가 필요합니다.' },
              { q: '고구마와 우유를 같이 먹으면 왜 배가 더 아프나요?',
                a: '고구마의 식이섬유·전분과 우유의 유당이 합쳐지면 대장에서 발효가 가속화됩니다. 두 재료 모두 가스 생성력이 있어 함께 먹으면 시너지 효과가 발생합니다.' },
              { q: '계란 방귀가 냄새가 심한 이유는?',
                a: '계란에는 황(S) 함유 아미노산(메티오닌, 시스테인)이 풍부합니다. 대장에서 발효될 때 황화수소(H₂S) 가스가 생성되어 특유의 고약한 냄새를 만듭니다. 양배추·브로콜리도 같은 이유입니다.' },
              { q: '단백질 보충제를 먹으면 가스가 차는 이유는?',
                a: '대부분의 단백질 보충제에는 유청단백질(유당 포함)과 인공감미료(소르비톨·자일리톨)가 들어있습니다. 두 성분 모두 장에서 발효되기 쉬운 고위험 재료입니다. 분리유청단백(WPI)이나 식물성 단백질 제품이 더 소화가 잘 됩니다.' },
              { q: 'WPC와 WPI 단백질 보충제 차이가 뭔가요?',
                a: '단백질 농축도와 유당 함량 차이입니다.<br/>• <strong>WPC (농축유청)</strong> — 단백질 70~80%, 유당 4~8%(많음), 가격 ↓, 가스 위험 ↑↑ (특히 유당불내증)<br/>• <strong>WPI (분리유청)</strong> — 단백질 90%+, 유당 거의 X(1% 이하), 가격 ↑, 가스 위험 낮음<br/>• <strong>식물성</strong> — 유당 X, 콩·완두 발효 가능, 환경 친화<br/>가스 자주 차는 사람: WPC → WPI 또는 식물성 + 인공감미료(소르비톨·자일리톨) 라벨 확인.' },
              { q: '같은 음식인데 어떤 날만 가스가 더 차요?',
                a: '다음 변수가 영향을 줍니다 — 식사 속도(빠르면 공기 삼킴 ↑) / 식사량(과식 → 소화 지연) / 함께 먹은 음식(시너지) / 스트레스·수면(장 운동) / 생리 주기(호르몬) / 운동 후(소화 빠름) / 약물(항생제·진통제). 본인 패턴 파악은 1주일 일기(음식·증상)가 가장 효과적이며, 동일 조건 반복 시 영양사 상담 권장.' },
              { q: 'FODMAP 식단을 평생 해야 하나요?',
                a: '아닙니다. 저FODMAP은 <strong>진단·재도입 도구</strong>입니다.<br/>• 1단계 (제거, 2~6주): 모든 고FODMAP 제거<br/>• 2단계 (재도입, 6~10주): 한 종류씩 다시 시도<br/>• 3단계 (개인화): 본인 민감 음식만 평생 제한<br/>평생 저FODMAP은 영양 결핍 위험(식이섬유·미네랄), 장내 미생물 다양성 ↓, 사회적 식사 어려움 등 부작용. 반드시 영양사 지도 하 진행. 한국 소화기학회: kgsa.or.kr.' },
              { q: '방귀가 너무 많이 나오면 병원 가야 하나요?',
                a: '다음 경우 의료 상담 권장 — 하루 30회+ (정상 13~21회) / 심한 악취 + 혈변 / 갑작스러운 체중 감소 / 심한 복통(한밤중에 깨움) / 발열 동반 / 1주+ 지속 변비·설사 / 임산부.<br/>가능한 의학적 원인: IBS · SIBO(소장세균과증식) · 셀리악(글루텐 알레르기) · 유당불내증 · 췌장 효소 부족 · 담즙 문제. 상담: 소화기내과 / 한국 의료진 상담 1339 / 응급 119.' },
              { q: '단순 일기로 본 도구를 활용할 수 있나요?',
                a: '네. ① 매 식사 후 본 도구 입력 ② 점수·증상 기록(메모장·일기 앱) ③ 1~2주 후 패턴 확인 ④ 자주 등장하는 음식 = 의심.<br/>⚠️ 주의: 본 도구는 일기 기능이 없으며(단순 점수만), 정확한 분석은 영양사·의사 영역. 본 결과로 자가 진단 X. 진단이 필요하면 한국 영양사 상담 또는 소화기내과(병원), FODMAP 전문 영양사(Monash 인증) 권장.' },
            ].map((item, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {item.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: item.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* 9. 면책 강화 */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '14px', padding: '20px 22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#FF6B6B', marginBottom: '12px' }}>⚠️ 책임 있는 사용 안내</p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 계산기는 <strong style={{ color: 'var(--text)' }}>재미·교육용 참고 도구</strong>입니다. 의학적 진단·처방·치료 도구가 아니며, 모든 점수는 추정으로 개인 체질에 따라 다릅니다. 본 결과로 질병 진단은 불가합니다.
          </p>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>지속되거나 심한 증상은 자가 처방 X — 영양사·의사 상담 필수</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>IBS·유당불내증·셀리악·SIBO 의심 시 소화기내과 전문의</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>임산부·소아·만성 질환자는 어떤 식이 변경도 의사와 상담</li>
            <li style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>FODMAP 식단은 영양사 지도 하 단계적 진행 권장</li>
          </ul>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>⚠️ 다음 증상 시 즉시 의료 상담</p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0, marginBottom: '12px' }}>
              {[
                '혈변·검은 변',
                '갑작스러운 체중 감소',
                '심한 복통 (한밤중에 깨움)',
                '발열·구토 반복',
                '1주+ 지속되는 변비·설사',
                '임산부 (어떤 증상이든 신중)',
              ].map((t, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{t}</li>
              ))}
            </ul>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px' }}>
              {[
                { l: '한국 의료진 상담 (보건복지부)', t: '1339' },
                { l: '응급', t: '119' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{c.l}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FF8C3E' }}>{c.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7. 관련 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/health/supplement',  emoji: '💊', name: '영양제 성분 체크',   desc: '단백질 보충제 안전' },
              { href: '/tools/cooking/substitute', emoji: '🔁', name: '식재료 대체 비율',   desc: '대체 음식·양 변환' },
              { href: '/tools/health/bmr',         emoji: '🔥', name: '기초대사량 계산기', desc: '하루 칼로리 관리' },
              { href: '/tools/life/dutch',         emoji: '🤝', name: '더치페이 계산기',   desc: '외식 비용 나누기' },
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
