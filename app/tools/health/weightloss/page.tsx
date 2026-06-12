import Link from 'next/link'
import WeightLossClient from './WeightLossClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/health/weightloss',
  title: '체중 감량 기간 계산기 — 안전 감량 속도·BMI·목표일·정체기·탄단지',
  description:
    '목표 체중까지 며칠 — 안전 감량 속도(주당 0.5~1%)로 기간 추정. BMI 자동 체크, 식단·운동 칼로리 분리(METs), 탄단지 자동 계산, 정체기·요요 방지 가이드.',
  keywords: [
    '체중감량계산기', '다이어트기간계산기', '칼로리적자계산기', '감량기간계산',
    '목표체중달성일', '요요방지다이어트', '안전 감량 속도', '체중 변화 그래프',
    '정체기', '유지기', '탄단지', '단백질 목표', '운동 칼로리',
  ],
})

const FAQ_LD = [
              {
                q: '지방 1kg 감량에 7,700kcal가 필요한 이유는?',
                a: '지방 조직은 약 80%가 지방으로 구성되어 있으며 지방 1g은 약 9kcal의 에너지를 저장합니다. 1kg의 지방 조직에는 약 800g의 순수 지방이 포함되어 있어 800g × 9kcal = 7,200~7,700kcal가 됩니다 (Wishnofsky, 1958).',
              },
              {
                q: '하루 최소 칼로리 섭취량은 얼마인가요?',
                a: '일반적으로 <strong>여성은 하루 1,200kcal, 남성은 1,500kcal</strong> 이하로 섭취하면 근손실, 영양 결핍 등의 부작용이 발생할 수 있습니다. 의사 또는 영양사의 지도 아래 진행하는 것이 안전합니다. 본 도구는 이 한도 미만 시 자동으로 강한 경고를 표시합니다.',
              },
              {
                q: '실제 감량 속도가 계산기와 다를 수 있나요?',
                a: '네, 이 계산기는 이론적인 수치를 제공합니다. 실제 감량 속도는 신진대사율, 근육량, 수면, 스트레스, 호르몬 등 다양한 요인에 영향을 받습니다. 처음 1~2주는 수분 변동(±1~2kg), 후반은 대사 적응으로 속도 둔화. 본 도구의 <strong>그래프</strong>는 초반 수분 변동·후반 둔화를 반영한 현실적 곡선으로 보여줍니다(소요 기간·종료일은 평균 속도 기준 추정치).',
              },
              {
                q: '칼로리 적자를 어떻게 만들어야 하나요?',
                a: '칼로리 적자는 두 가지 방법으로 만들 수 있습니다. ① <strong>식이 조절</strong>: 하루 섭취 칼로리를 줄이는 방법. ② <strong>운동</strong>: 활동량을 늘려 소비 칼로리를 높이는 방법. 두 방법을 함께 사용하면 더 효과적입니다. 식단 60% + 운동 40% 분배가 권장 — 근손실 방지·심혈관 건강·지속 가능. 본 도구의 <strong>[식단·운동] 탭</strong>에서 자동 분배 + 운동 시간(METs 기반)을 계산할 수 있습니다.',
              },
              {
                q: '다이어트 정체기는 왜 오나요?',
                a: '처음 1~2주 감량 후 체중이 더 이상 줄지 않는 정체기가 오는 경우가 많습니다. 원인 — ① 대사 적응(BMR 감소) ② 활동량 감소(무의식) ③ 운동 효율 향상 ④ 호르몬 변화(렙틴↓·그렐린↑). 극복 — <strong>유지기 1~2주 삽입</strong>이 가장 효과적, 운동 강도·종류 변경, 단백질↑, 수면 충분, 스트레스 관리. 정체기는 4~6주 지속될 수 있습니다.',
              },
              {
                q: '한 달에 5kg 빼는 게 가능한가요?',
                a: '단기적으로 가능하지만 <strong>권장하지 않습니다.</strong><br><br>한 달 5kg = 주당 1.25kg. 체중 60kg 기준 주당 2.1% 감량(권장 한도 1% 초과). 필요 하루 적자 약 1,375kcal(권장 한도 1,000 초과).<br><br><strong>장기 위험</strong> — 근손실 큼(1kg 중 ~30%가 근육) / 대사 적응(BMR 감소 → 요요) / 영양 부족 / 호르몬 이상(특히 여성) / 정신 건강 영향(강박·폭식).<br><br><strong>대안</strong> — 8주에 5kg(주당 0.6kg, 안전) / 12주에 5kg(주당 0.4kg, 안정). 한 달 5kg은 단기 수치만 좋고 장기적으로 거의 모두 요요됩니다.',
              },
              {
                q: '빠른 감량(주당 1kg+)이 위험한 이유는?',
                a: '주당 체중 1% 이상 감량 시 다음 위험:<br><br><strong>1. 근손실 비율 ↑</strong><br>· 안전 감량 (0.5%/주): 90% 지방 + 10% 근육<br>· 빠른 감량 (1.5%/주): 70% 지방 + 30% 근육<br>· 근육 손실 = BMR↓ = 요요 위험<br><br><strong>2. 대사 적응</strong> — 6~8주 빠른 감량 후 BMR 약 10~15%↓. 같은 칼로리 섭취해도 체중↑.<br><br><strong>3. 영양 부족</strong> — 하루 1,000kcal+ 적자 = 비타민·미네랄 부족 = 면역력↓·피로·집중력↓.<br><br><strong>4. 정신 건강</strong> — 강박·폭식·요요 사이클 / 거식증·폭식증 위험↑.<br><br>안전한 감량은 0.5~0.7%/주, 단기 빠른 감량은 1주만.',
              },
              {
                q: '저체중인데 더 빼고 싶어요.',
                a: '<strong>권장하지 않습니다.</strong><br><br>저체중(BMI 18.5 미만) 위험 — 면역력 저하 / 골밀도 감소 → 골절 위험 / 호르몬 이상(생리 불순·생식 능력↓) / 근손실 → 만성 피로 / 영양 부족 → 빈혈·탈모.<br><br>체중에 대한 강박 가능성 — 거식증(Anorexia Nervosa) / 신체 이형 장애 / 폭식증과 동반 가능.<br><br><strong>도움 받기</strong><br>· 한국 정신건강 위기상담: <strong>1577-0199</strong> (24시간)<br>· 보건복지부 자살예방상담: <strong>1393</strong> (24시간)<br>· 한국섭식장애협회<br>· 가까운 정신건강복지센터·정신과 의원<br><br>&lsquo;마름&rsquo;이 건강과 매력의 절대값이 아닙니다. 건강한 체형 + 근육 + 정신 건강이 진짜 매력입니다.',
              },
              {
                q: '다이어트 중 무엇을 매일 측정해야 하나요?',
                a: '<strong>매일</strong> — 체중(같은 시간·조건, 변동 ±1~2kg 정상) / 식사 기록(칼로리·매크로) / 운동(시간·종류·강도) / 컨디션(1~10점).<br><br><strong>주간 평균 사용</strong> — 일일 변동 무시 / 월·수·금 평균 또는 7일 평균 권장 / 그래프로 추세 확인.<br><br><strong>월 1회</strong> — 허리둘레(복부지방) / 사진(시각적 변화) / 체성분 검사(InBody, 가능 시) / 컨디션·수면·생리주기 종합 점검.<br><br><strong>주의</strong> — 체중만 보지 말기(근육·수분·생리주기 변동) / 수치 강박 X / 체중 ≠ 건강 ≠ 행복.',
              },
            ]

export default function WeightLossPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎯 체중 감량 기간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        목표 체중까지 며칠 — <strong style={{ color: 'var(--text)' }}>안전 감량 속도</strong>로 계산하고, 정체기·요요 방지 가이드까지. 식단·운동 칼로리 자동 분리.
      </p>

      <WeightLossClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 감량 공식 (기존 유지·보완) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            감량 소요 기간 계산 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            체중 감량의 핵심은 <strong style={{ color: 'var(--text)' }}>칼로리 적자</strong>입니다.
            섭취 칼로리가 소비 칼로리보다 적으면 신체는 저장된 지방을 에너지원으로 사용합니다.
            지방 1kg을 소모하려면 약 <strong style={{ color: 'var(--text)' }}>7,700kcal</strong>의 누적 적자가 필요합니다 (Wishnofsky, 1958).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '18px 22px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>감량 소요 기간 공식</p>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2.2, background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px' }}>
                <p>총 필요 칼로리 적자 = 목표 감량(kg) × <span style={{ color: 'var(--accent)' }}>7,700</span>kcal</p>
                <p>소요 기간(일) = 총 필요 칼로리 적자 ÷ <span style={{ color: 'var(--accent)' }}>하루 칼로리 적자</span></p>
              </div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 5kg 감량 목표, 하루 500kcal 적자<br />
                → 총 필요 적자 = 5 × 7,700 = <strong style={{ color: 'var(--accent)' }}>38,500kcal</strong><br />
                → 소요 기간 = 38,500 ÷ 500 = <strong style={{ color: 'var(--accent)' }}>77일 (약 11주)</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. 안전한 감량 속도 (✨ 핵심) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            안전한 감량 속도 — 주당 체중 0.5~1% 
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            국제 영양학(ACSM·미국 스포츠의학회) 표준은 <strong style={{ color: 'var(--text)' }}>주당 체중의 0.5~1% 감량</strong>입니다.
            70kg 기준 주당 0.35~0.7kg, 하루 적자 385~770kcal에 해당합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.30)', borderRadius: 12, padding: '14px 18px', marginBottom: '12px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>
              주당 체중의 0.5~1% 감량이 요요 방지에 효과적
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              현재 체중 70kg이라면 주당 0.35~0.7kg 감량이 안전한 범위입니다.
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>왜 % 기준인가?</strong> — 같은 1kg 감량도 100kg → 1%, 50kg → 2%. 100kg은 수분·내장지방 빠르게, 50kg은 어려움. % 기준이 모든 체중에 공정·안전합니다.
          </p>
        </section>

        {/* ── 3. 목표 BMI 자동 체크  ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            목표 BMI 자동 체크 
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            본 도구는 입력한 키와 목표 체중으로 <strong style={{ color: 'var(--text)' }}>목표 BMI를 자동 검증</strong>합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { range: 'BMI 18.5 미만', name: '저체중 ⚠️', color: '#0891B2', desc: '권장하지 않음 — 골밀도·면역력·호르몬 위험' },
              { range: 'BMI 18.5~22.9', name: '정상 (한국 권장)', color: '#059669', desc: '건강한 목표 범위' },
              { range: 'BMI 23.0~24.9', name: '과체중 (한국)', color: '#A16207', desc: '한국 기준 건강 위험 시작' },
              { range: 'BMI 25.0+', name: '비만', color: '#EA580C', desc: '대사질환 위험 ↑' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}40`, borderRadius: 10, padding: '10px 13px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: b.color, marginBottom: 3 }}>{b.range}</p>
                <p style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 2 }}>{b.name}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>권장</strong> — 비만 → 정상 진입(BMI 22.9 이하) / 과체중 → 정상(BMI 22) / 정상 → 더 빼지 말기(이상 BMI 21~22) / 정상인데 무리한 감량은 권장하지 않음.
          </p>
        </section>

        {/* ── 4. 칼로리 적자별 감량 속도 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>칼로리 적자별 감량 속도</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            지방 1kg을 태우려면 약 7,700kcal의 칼로리 적자가 필요합니다. 하루 칼로리 적자에 따른 주당 감량 속도는 다음과 같습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>하루 칼로리 적자</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>주당 감량</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>월당 감량</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>평가</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['300kcal',   '약 0.27kg', '약 1.2kg', '매우 안전', '#059669'],
                  ['500kcal',   '약 0.45kg', '약 2.0kg', '안전 권장', '#059669'],
                  ['700kcal',   '약 0.64kg', '약 2.7kg', '적극 감량', '#A16207'],
                  ['1,000kcal', '약 0.91kg', '약 3.9kg', '주의 필요', '#EA580C'],
                  ['1,500kcal', '약 1.36kg', '약 5.9kg', '위험',      '#DC2626'],
                ].map(([deficit, weekly, monthly, level, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{deficit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{weekly}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{monthly}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontWeight: 500 }}>{level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 5. 요요 없이 감량 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            요요 현상 없이 감량하는 법
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            빠른 감량보다 <strong style={{ color: 'var(--text)' }}>지속 가능한 속도</strong>로 줄이는 것이 장기적으로 훨씬 효과적입니다.
            급격한 체중 감량은 근육량 손실과 기초대사량 저하를 유발해 요요 현상의 주요 원인이 됩니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '🥗', title: '급격한 식단 제한 금지', content: '하루 1,200kcal(여성) / 1,500kcal(남성) 이하로 섭취하면 신체가 절약 모드로 전환되어 기초대사량이 급락합니다. 이 상태에서 식사를 정상화하면 체중이 급격히 늘어나는 요요가 발생합니다.' },
              { icon: '💪', title: '근력 운동 병행', content: '칼로리 제한만으로 감량하면 지방뿐 아니라 근육도 함께 줄어듭니다. 근육량이 감소하면 기초대사량이 낮아져 같은 양을 먹어도 더 쉽게 살이 찌는 체질이 됩니다. 주 2~3회 근력 운동을 병행하세요.' },
              { icon: '📅', title: '목표를 장기적으로 설정', content: '6개월~1년에 걸쳐 천천히 감량한 체중이 훨씬 오래 유지됩니다. 급하게 뺀 체중은 근육 손실이 크고 요요 가능성이 높습니다. 목표 달성 후에도 3~6개월간 유지 기간을 가지는 것이 중요합니다.' },
            ].map((tip, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{tip.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{tip.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. 정체기·유지기  ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            정체기와 유지기 — 다이어트 흔한 함정 
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#EA580C', marginBottom: '6px' }}>📊 정체기 (Plateau) — 왜?</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 대사 적응 (BMR 감소)</li>
                <li>· 활동량 감소 (무의식적)</li>
                <li>· 운동 효율 향상 (적응)</li>
                <li>· 호르몬 변화 (렙틴↓·그렐린↑)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0891B2', marginBottom: '6px' }}>💛 유지기 — 단순 휴식이 아닌 전략</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· BMR 회복 (정상 칼로리)</li>
                <li>· 호르몬 정상화 (렙틴·코르티솔)</li>
                <li>· 정신적 휴식 (다이어트 피로)</li>
                <li>· 폭식 위험↓·장기 지속↑</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>권장</strong> — 6~8주 감량 → 1~2주 유지 / 유지기에는 TDEE 동일 섭취, 운동은 유지. 본 도구의 <strong style={{ color: 'var(--text)' }}>그래프</strong>는 초반·후반 속도 변화를 반영한 현실적 곡선을 보여줍니다(유지기는 위 권장에 따라 직접 일정에 넣으세요).
          </p>
        </section>

        {/* ── 7. 식단 vs 운동 적자  ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            식단 vs 운동 적자 비율 
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            추천 분배: <strong style={{ color: 'var(--text)' }}>식단 60% + 운동 40%</strong> — 근육 유지 + 심혈관 건강 + 지속 가능.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: '식단만 (100%)', icon: '🥗', color: '#A16207', desc: '빠르지만 근손실 ↑·정체기 빠름' },
              { name: '운동만 (100%)', icon: '🏃', color: '#EA580C', desc: '너무 많은 운동 시간 필요·부상 위험 ↑' },
              { name: '균형 (식단 60% + 운동 40%) ★', icon: '⚖️', color: '#059669', desc: '근육 유지 + 심혈관 건강 + 지속 가능' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${m.color}40`, borderRadius: 10, padding: '11px 14px', display: 'grid', gridTemplateColumns: '32px 1fr', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div>
                  <p style={{ fontSize: 13, color: m.color, fontWeight: 700, marginBottom: 3 }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 8. 단백질  ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            단백질 — 감량의 핵심 
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            감량 시 단백질 <strong style={{ color: 'var(--text)' }}>1.6g/kg 권장</strong> (일반 1.2g/kg보다 ↑) — 근육 손실 방지·포만감 유지·음식의 열효과(TEF) 30% 칼로리·식단 만족감.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>체중</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>1.2g/kg (일반)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>1.6g/kg (감량) ★</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>2.0g/kg (강한 감량)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['50kg', '60g', '80g', '100g'],
                  ['60kg', '72g', '96g', '120g'],
                  ['70kg', '84g', '112g', '140g'],
                  ['80kg', '96g', '128g', '160g'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 단백질 식품 — 닭가슴살(100g·23g) / 계란(1개·6g) / 두부(100g·8g) / 우유(200ml·6g) / 요거트(150g·8g) / 생선(100g·20g)
          </p>
        </section>

        {/* ── 9. FAQ (accordion) ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 매우 강조 ── */}
        <section>
          <Disclaimer variant="medical" open>
            체중 감량은 단순 칼로리 적자를 넘어 <strong>근육량 유지(단백질 + 근력 운동), 대사 적응(정체기·유지기), 호르몬 변화(특히 여성), 정신 건강(강박 예방), 영양 균형</strong>을 함께 고려해야 합니다.
            <br />
            <strong>다음 경우 사용 X 또는 의료 상담</strong> — 18세 미만 / 임산부·수유부 / 만성질환(당뇨·갑상선·심혈관 등) / 거식증·폭식증 등 식이 장애 / BMI 18.5 미만(저체중).
            <br />
            <strong>체중 강박·다이어트 강박·식이 장애 우려 시</strong>
            <br />· 한국 정신건강 위기상담: <strong>1577-0199</strong> (24시간)
            <br />· 보건복지부 자살예방상담: <strong>1393</strong> (24시간)
            <br />· 한국섭식장애협회 / 가까운 정신건강복지센터
            <br />건강한 다이어트의 핵심: <strong>&lsquo;빠르게&rsquo;가 아닌 &lsquo;꾸준히&rsquo;. &lsquo;마름&rsquo;이 아닌 &lsquo;건강함&rsquo;.</strong>
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr',     icon: '🔥', name: '기초대사량 계산기',     desc: 'BMR·TDEE 4공식 비교, 정밀 활동' },
              { href: '/tools/health/bmi',     icon: '⚖️', name: 'BMI 계산기',             desc: '체질량지수·키별 정상 체중·허리둘레' },
              { href: '/tools/sports/pace',    icon: '🏃', name: '러닝 페이스 계산기',    desc: '달리기로 칼로리 소모' },
              { href: '/tools/health/supplement', icon: '💊', name: '영양제 성분 체크',  desc: '영양제 중복·상한량 체크' },
              { href: '/tools/date/age',       icon: '🎂', name: '만 나이 계산기',         desc: '나이별 건강 관리 계획' },
              { href: '/tools/date/dday',      icon: '📅', name: 'D-day 계산기',           desc: '목표 달성일 카운트다운' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
