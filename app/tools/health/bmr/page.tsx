import Link from 'next/link'
import BmrClient from './BmrClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/health/bmr',
  title: '기초대사량 계산기 2026 — BMR·TDEE·4공식 비교·운동일/휴식일',
  description:
    '기초대사량과 하루 총 소비 칼로리(TDEE) + 4공식 비교·운동일/휴식일·목표별 권장 칼로리·매크로 분배까지.',
  keywords: [
    '기초대사량 계산기', 'BMR 계산기', 'TDEE 계산기', '하루 칼로리',
    'Mifflin-St Jeor', 'Katch-McArdle', '운동일 칼로리', '활동량 계산',
    '다이어트 칼로리', '칼로리 계산기', '마라톤 칼로리',
  ],
})

const FAQ_LD = [
              {
                q: 'Harris-Benedict 공식이란?',
                a: '1919년 처음 발표되고 1984년 개정된(Roza-Shizgal) 기초대사량 계산 공식으로, 임상에서 오래 사용돼 왔습니다. 본 도구가 쓰는 개정판 계수는 — 남성: 88.362 + (13.397×체중kg) + (4.799×키cm) − (5.677×나이), 여성: 447.593 + (9.247×체중kg) + (3.098×키cm) − (4.330×나이) 입니다(원전 1919년 계수와는 다릅니다). 이후 Mifflin-St Jeor 공식도 개발되었으며 두 공식 모두 ±10% 수준의 오차가 있을 수 있습니다. 본 도구는 4공식을 모두 비교 표시합니다.',
              },
              {
                q: '기초대사량은 왜 사람마다 다른가요?',
                a: '기초대사량은 근육량, 나이, 성별, 유전적 요인에 따라 달라집니다. 근육은 지방보다 에너지를 많이 소비하므로 근육량이 많을수록 기초대사량이 높습니다. 나이가 들수록 근육량이 감소해 기초대사량도 낮아집니다.',
              },
              {
                q: '다이어트 중 기초대사량이 낮아지나요?',
                a: '장기간 칼로리를 심하게 제한하면 신체가 적응해 기초대사량이 낮아질 수 있습니다 (대사 적응). 이를 방지하려면 급격한 칼로리 제한보다 <strong>TDEE의 10~20% 수준</strong>에서 조절하고 규칙적인 근력 운동을 병행하는 것이 좋습니다.',
              },
              {
                q: 'TDEE는 매일 같은가요?',
                a: '아닙니다. TDEE는 그날의 활동량에 따라 달라집니다. 장거리 달리기를 한 날은 TDEE가 평소보다 수백~1,000kcal 높을 수 있고, 완전 휴식일은 BMR에 가까워집니다. 본 도구의 [BMR·TDEE] 탭에서 활동 수준 입력 방식을 <strong>「정밀」</strong>로 전환하면 휴식일·운동일 TDEE가 자동 분리됩니다.',
              },
              {
                q: '어떤 공식을 사용해야 하나요?',
                a: '일반인은 <strong>Mifflin-St Jeor</strong> 공식을 권장합니다 (현재 가장 널리 사용·권장). 상황별 추천 — 일반 성인 다이어트: Mifflin-St Jeor / 의료·연구 기록 일관성: Harris-Benedict / 체지방률 정확 측정(InBody): Katch-McArdle / 운동선수·근육량 많음: Cunningham. 모든 공식은 추정치(±10% 내외 오차 가능)이므로, 본 도구는 4공식을 모두 비교 표시합니다.',
              },
              {
                q: '운동일과 휴식일의 칼로리를 따로 계산해야 하나요?',
                a: '권장됩니다. 단순 주간 평균 TDEE만 사용하면 — 운동일: 영양·탄수화물 부족 → 회복↓·근손실↑ / 휴식일: 잉여 칼로리 → 체지방 증가. 따라서 <strong>운동일에 더 먹고, 휴식일에 적게 먹는 칼로리 사이클링</strong>이 장기적으로 효과적입니다. 본 도구는 [BMR·TDEE] 탭의 활동 수준 입력 방식을 「정밀」로 전환하면 휴식일/운동일 TDEE를 자동 분리해 보여줍니다.',
              },
              {
                q: '스마트워치 측정값이 공식보다 높게 나옵니다. 어느 걸 따라야 하나요?',
                a: '두 값의 평균을 사용하는 것이 가장 안전합니다. 예: 공식 TDEE 2,558 / 워치 TDEE 2,870 → 권장 기준 약 2,714kcal. 이유 — 둘 다 ±10~20% 오차 가능 / 공식은 일반화(개인 차이 X) / 스마트워치는 운동 강도 추정 오차. <strong>가장 정확한 검증은 2~4주 동안 동일 칼로리로 식사한 후 체중 변화를 측정</strong>하는 것입니다 (체중 안정 = 그 칼로리가 본인 TDEE).',
              },
              {
                q: '권장 최소 칼로리(여성 1,200·남성 1,500) 미만으로 먹으면 안 되나요?',
                a: '단기적으로 가능하지만 <strong>장기(2주 이상) 지속은 권장하지 않습니다.</strong><br><br>장기 위험 — 영양 부족(비타민·미네랄) / 대사 적응(BMR 감소 → 요요) / 근손실 증가 / 호르몬 이상(특히 여성: 생리 불순) / 거식증·폭식증 위험 / 골밀도 감소.<br><br>대안 — 1,200/1,500kcal 이상으로 천천히 감량 / 운동량↑(근육 유지) / 충분한 단백질(체중 1kg당 1.6~2.2g) / 의료 전문가 상담(영양사·내과). 극단적 다이어트는 단기 결과 + 장기 손실입니다.',
              },
              {
                q: '청소년·임산부도 본 계산기를 사용할 수 있나요?',
                a: '<strong>권장하지 않습니다.</strong><br><br>· <strong>청소년(18세 미만)</strong> — 성장기 영양 필요량이 성인 공식과 다름. BMR이 성인보다 높음(성장 에너지). 본 도구 부적합 → 소아청소년과 전문의 상담.<br>· <strong>임산부</strong> — 임신 시기별 칼로리 필요량 다름(1·2·3분기). 일반 BMR 공식 부적합. 산부인과·영양사 상담 필수.<br>· <strong>65세 이상</strong> — 근감소증 고려 필요. 본 도구 결과는 참고만, 노인병학 의료 상담 권장.<br>· <strong>만성질환자(당뇨·심혈관·갑상선)</strong> — 의료 전문가 상담 필수. 본 도구 결과만으로 식단 결정 X.',
              },
              {
                q: 'BMR을 높이려면 어떻게 해야 하나요?',
                a: '단기간 BMR을 크게 높이는 것은 어렵지만, 장기적 방법은 있습니다.<br><br><strong>효과적</strong> — 근력 운동 (근육 1kg = BMR ~13kcal/일) / 단백질 충분(소화 시 칼로리↑) / 충분한 수면(7~8시간) / 카페인(단기 ~5%).<br><br><strong>비효과적·잘못된 정보</strong> — &lsquo;5분마다 식사&rsquo;(효과 미미) / &lsquo;특정 음식(마늘·생강 등)&rsquo;(큰 효과 X) / &lsquo;찬물 마시기&rsquo;(1회 4~5kcal, 무시 가능).<br><br><strong>현실적</strong> — 근육 1kg 증가 → BMR 약 13kcal/일↑ / 체중 5kg 증가 → BMR 약 50kcal/일↑ / 단기간보다 장기간(수개월) 시각으로.',
              },
            ]

export default function BmrPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="health" />기초대사량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        기초대사량과 하루 총 소비 칼로리 + <strong style={{ color: 'var(--text)' }}>운동일/휴식일별 목표 칼로리</strong> 자동.
      </p>

      <BmrClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. BMR과 TDEE란? (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            기초대사량(BMR)과 TDEE란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            기초대사량(BMR, Basal Metabolic Rate)은 생명 유지를 위해 최소한으로 필요한 에너지량입니다.
            아무것도 하지 않고 누워있어도 심장 박동, 호흡, 체온 유지 등에 소모되는 칼로리로,
            전체 에너지 소비의 약 <strong style={{ color: 'var(--text)' }}>60~70%</strong>를 차지합니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>BMR</p>
              <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>기초대사량</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                완전한 안정 상태에서 생명 유지에 필요한 최소 칼로리. 아무것도 안 해도 소모됩니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#0891B2', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>TDEE</p>
              <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>총 일일 에너지 소비량</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                BMR에 활동량을 반영한 <strong style={{ color: 'var(--text)' }}>하루 실제 소비 칼로리</strong>. 다이어트·식단 설계의 기준이 됩니다.
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              💡 <strong style={{ color: 'var(--text)' }}>쉽게 이해하기:</strong> BMR은 자동차가 주차 중에도 소모하는 연료(엔진 공회전)이고,
              TDEE는 실제 주행거리에 따른 총 연료 소비량입니다.
              체중을 관리하려면 BMR이 아닌 <strong style={{ color: 'var(--accent)' }}>TDEE를 기준으로 식단을 설계</strong>해야 합니다.
            </p>
          </div>
        </section>

        {/* ── 2. BMR 4공식 비교 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            BMR 4공식 비교
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 4가지 BMR 공식을 모두 비교 표시합니다. 각 공식은 입력값과 정확도가 다릅니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: '① Mifflin-St Jeor (1990)', tag: '널리 권장', tagColor: '#059669', desc: '1990년 건강한 성인 498명 데이터 기반. 일반 성인에 비교적 정확 (±5~10%). 입력: 키·체중·나이·성별.' },
              { name: '② Harris-Benedict (1919·1984 개정)', tag: '임상 다용', tagColor: '#A16207', desc: '원전 1919년·개정판 1984년(Roza-Shizgal). 본 도구는 개정판 계수 사용. 정확도 ±10%. Mifflin보다 약간 높게 추정. 의료/연구 기록 일관성 ↑.' },
              { name: '③ Katch-McArdle', tag: '체지방률 정확 시', tagColor: '#0891B2', desc: '체지방률 정확 입력 시 ±3~5%. 운동선수·체성분 검사 받은 사람에게 정확. 입력: 체중·체지방률.' },
              { name: '④ Cunningham', tag: 'LBM 정확 시', tagColor: '#EA580C', desc: '제지방량(LBM) 정확 입력 시 ±3~5%. 근육량 많은 사람에게 정확. 입력: LBM.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{f.name}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: f.tagColor, border: `1px solid ${f.tagColor}50`, borderRadius: 4, padding: '2px 6px' }}>
                    {f.tag}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
            ⓘ 실용적 권장 — 일반인: <strong style={{ color: 'var(--text)' }}>Mifflin-St Jeor</strong>, 운동선수: <strong style={{ color: 'var(--text)' }}>Katch-McArdle</strong>, 의료/연구 기록 일관성: <strong style={{ color: 'var(--text)' }}>Harris-Benedict</strong>.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 12, lineHeight: 1.75, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <strong style={{ color: 'var(--text)' }}>출처·정확도</strong> — Mifflin-St Jeor(1990)는 건강한 성인 498명 데이터 기반, Harris-Benedict(1919 원전·1984 개정)는 재평가 연구에서 정상 영양 상태 기준 약 <strong style={{ color: 'var(--text)' }}>±14%</strong> 정밀도로 보고됩니다. 모든 공식은 추정치이며 근육량·호르몬·질환에 따라 달라집니다. 건강한 체중 감량은 일반적으로 <strong style={{ color: 'var(--text)' }}>점진적 접근(주당 약 0.5kg 안팎)</strong>이 권장되고, 초저열량 식이(VLCD)는 <strong style={{ color: 'var(--text)' }}>의료 감독하에서만</strong> 고려합니다.
            <br />참고: Mifflin MD <em>Am J Clin Nutr</em> 1990 · Roza &amp; Shizgal <em>Am J Clin Nutr</em> 1984 · 미국 CDC 건강 체중 가이드 · NIH/PubMed VLCD.
          </p>
        </section>

        {/* ── 3. Harris-Benedict 공식 시각화 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            Harris-Benedict 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            1919년 발표 후 1984년 개정된(Roza-Shizgal) 기초대사량 공식으로, 아래는 본 도구가 사용하는 <strong style={{ color: 'var(--text)' }}>개정판 계수</strong>입니다.
            체중, 키, 나이, 성별을 반영해 비교적 정확한 BMR 추정이 가능합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.3)', borderRadius: '12px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '18px' }}>👨</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0891B2', letterSpacing: '0.04em' }}>남성 BMR 공식</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                BMR = 88.362<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (13.397 × 체중<span style={{ color: '#0891B2' }}>kg</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (4.799 × 키<span style={{ color: '#0891B2' }}>cm</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− (5.677 × 나이<span style={{ color: '#0891B2' }}>세</span>)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                예시: 30세 남성, 70kg, 175cm → BMR = 88.362 + 938 + 840 − 170 =
                <strong style={{ color: '#0891B2' }}> 약 1,696kcal</strong>
              </p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,107,213,0.3)', borderRadius: '12px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '18px' }}>👩</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF6BD9', letterSpacing: '0.04em' }}>여성 BMR 공식</span>
              </div>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, background: 'var(--bg3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                BMR = 447.593<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (9.247 × 체중<span style={{ color: '#FF6BD9' }}>kg</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (3.098 × 키<span style={{ color: '#FF6BD9' }}>cm</span>)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− (4.330 × 나이<span style={{ color: '#FF6BD9' }}>세</span>)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                예시: 30세 여성, 55kg, 163cm → BMR = 447.593 + 509 + 505 − 130 =
                <strong style={{ color: '#FF6BD9' }}> 약 1,332kcal</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. 활동 수준별 TDEE 표 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            활동 수준별 TDEE 계산
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            BMR에 아래 활동 계수를 곱하면 하루 총 소비 칼로리(TDEE)가 됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>활동 수준</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>TDEE 계산법</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['거의 안 움직임 (사무직, 운동 없음)', '1.2'],
                  ['가벼운 활동 (주 1~3회 운동)',        '1.375'],
                  ['보통 활동 (주 3~5회 운동)',          '1.55'],
                  ['활동적 (주 6~7회 강도 운동)',        '1.725'],
                  ['매우 활동적 (하루 2회 운동·육체노동)', '1.9'],
                ].map(([level, factor], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{level}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>
                      BMR × <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>{factor}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '12px', background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '14px 18px', display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🏃</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>마라톤 러너를 위한 팁</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
                마라톤 훈련기에는 평소보다 TDEE가 <strong style={{ color: 'var(--text)' }}>500~1,000kcal</strong>까지 치솟을 수 있습니다.
                충분한 탄수화물 섭취가 부상을 방지하고 회복 속도를 높입니다.
                장거리 훈련 당일에는 탄수화물 비율을 평소보다 10~15%p 높여 글리코겐 저장량을 충분히 확보하세요.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. 정밀 활동 수준 분석 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            정밀 활동 수준 분석 — 5단계의 한계
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            5단계 활동 계수는 빠른 추정에는 좋지만 다음 한계가 있습니다 —
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0, marginBottom: 14 }}>
            <li>· &lsquo;보통 활동&rsquo; = 주 3~5회 운동 (너무 광범위)</li>
            <li>· 30분 산책과 90분 러닝을 동일 분류</li>
            <li>· 직업 활동량(사무·서비스·육체노동) 무시</li>
            <li>· 일일 걸음 수 반영 X</li>
          </ul>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(161,98,7,0.30)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#A16207', marginBottom: '8px' }}>본 도구의 정밀 분석</p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
              <li>① <strong style={{ color: 'var(--text)' }}>직업 활동 (4단계)</strong> — 사무·서비스·도보·육체노동</li>
              <li>② <strong style={{ color: 'var(--text)' }}>일일 걸음 (5,000보 기준)</strong> — 1,000보당 +50kcal</li>
              <li>③ <strong style={{ color: 'var(--text)' }}>운동 횟수 + 시간 + 강도 + 체중 (MET 기반)</strong> — 운동 칼로리가 체중에 비례</li>
              <li>④ <strong style={{ color: 'var(--text)' }}>휴식일·운동일 TDEE 자동 분리</strong></li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: 10 }}>
              결과: 직업·걸음·운동·체중을 분리 반영해 <strong style={{ color: 'var(--text)' }}>5단계 계수보다 더 현실적으로 추정</strong>합니다(여전히 추정치이며 개인차가 있습니다).
            </p>
          </div>
        </section>

        {/* ── 6. 운동일/휴식일 칼로리 사이클링 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            운동일/휴식일 칼로리 사이클링
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            한국에서 잘 알려지지 않은 개념이지만, 해외 다이어트 커뮤니티에서는 표준 전략입니다.
            <strong style={{ color: 'var(--text)' }}> 운동일에 더 먹고, 휴식일에 적게 먹는 방식</strong>은 회복·근성장·식단 만족감 모두에 유리합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>✅ 장점</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 운동일 충분한 영양 → 회복·근성장</li>
                <li>· 휴식일 적정 칼로리 → 체지방 감소</li>
                <li>· 식단 만족감 (운동일 보상)</li>
                <li>· 호르몬 안정 (장기 지속)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#EA580C', marginBottom: '6px' }}>⚠️ 주의</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 단순 평균 TDEE 사용 시 운동일 영양 부족</li>
                <li>· 휴식일 잉여 칼로리 → 체지방 증가</li>
                <li>· 한국 다이어트 실패의 흔한 원인</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 8 }}>
              <strong style={{ color: 'var(--text)' }}>본 도구에서 활용하는 법</strong> — [BMR·TDEE] 탭에서 활동 수준 입력 방식을 <strong style={{ color: 'var(--accent)' }}>「정밀」</strong>로 전환하면 직업·걸음·주간 운동량을 기반으로 <strong style={{ color: 'var(--text)' }}>휴식일 TDEE</strong>와 <strong style={{ color: 'var(--text)' }}>운동일 TDEE</strong>가 자동 분리 계산됩니다.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              💡 권장 실전 적용 — 운동일은 분리된 운동일 TDEE에서 −10~15%, 휴식일은 휴식일 TDEE에서 −10~15%를 식단 칼로리로 설정합니다. 주간 평균으로만 잡으면 운동일 영양 부족이 흔히 발생합니다.
            </p>
          </div>
        </section>

        {/* ── 7. 안전 하한선 — 거식증 예방 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            안전 하한선 — 거식증·식이장애 예방
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구는 아래 <strong style={{ color: 'var(--text)' }}>🔴 조건</strong>에서 강한 경고를 자동 표시합니다. <strong style={{ color: 'var(--text)' }}>🟡 상황</strong>은 도구가 일일이 잡지 못하므로 스스로 점검하세요 —
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(220,38,38,0.06)', border: '2px solid #DC2626', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', marginBottom: '6px' }}>🔴 매우 위험 (자동 경고)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 여성 1,200kcal 미만</li>
                <li>· 남성 1,500kcal 미만</li>
                <li>· BMR(기초대사량) 미만 섭취</li>
                <li>· 18세 미만 사용</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid #EA580C', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#EA580C', marginBottom: '6px' }}>🟡 주의 (직접 점검)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· TDEE 대비 −20% 이상 장기 지속</li>
                <li>· 운동량 매우 높은데 섭취 부족</li>
                <li>· 빠른 체중 변화·지속적 피로</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 10 }}>
            <strong style={{ color: 'var(--text)' }}>왜 안전한가?</strong> — 1,200kcal 미만은 비타민·미네랄 부족 거의 확실, BMR 미만은 대사 적응 시작(장기 BMR↓), −20% 이상 적자는 근손실 비율↑.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>건강한 감량</strong> — 천천히(−10%)·보통(−15%)·빠른(−20% 이상) 순으로 적자가 커집니다. 주당 감량 폭(kg)은 TDEE에 비례하므로 계산기 목표표의 <strong style={{ color: 'var(--text)' }}>&lsquo;kg/주&rsquo;</strong> 표시로 확인하세요. 빠른 감량은 단기만 권장합니다.
          </p>
        </section>

        {/* ── 8. 목표별 칼로리 가이드 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            목표별 칼로리 설정 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                title: '체중 감량 (다이어트)',
                color: '#0891B2',
                content: 'TDEE보다 적게 섭취해 칼로리 적자를 만드는 것이 감량의 기본 원리입니다. 일반적으로 TDEE의 10~20%(약 300~500kcal) 적자가 무난하며, 1,200kcal(여성) / 1,500kcal(남성) 이하로는 내리지 않는 것을 권장합니다.',
              },
              {
                title: '체중 유지',
                color: '#059669',
                content: 'TDEE와 동일한 칼로리를 섭취하면 체중이 유지됩니다. 탄수화물 45~65%, 단백질 15~25%, 지방 20~35%의 균형 잡힌 식단을 권장합니다.',
              },
              {
                title: '근육 증가 (벌크업)',
                color: '#EA580C',
                content: 'TDEE보다 200~500kcal를 추가 섭취하고 충분한 단백질(체중 1kg당 1.6~2.2g)을 섭취하면 근육 성장에 도움이 됩니다. 너무 많은 칼로리 잉여는 체지방 증가로 이어집니다.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}40`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: item.color, marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⓘ 하루 적자별 주당 감량 페이스, 목표 체중까지의 구체적 기간 설계와 정체기·요요 방지 전략은 <Link href="/tools/health/weightloss" style={{ color: 'var(--accent)' }}>체중 감량 기간 계산기</Link>에서 확인하세요.
          </p>
        </section>

        {/* ── 9. 스마트워치 vs 공식 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            스마트워치 vs 공식 — 어느 게 정확?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>📐 공식 BMR/TDEE</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 장점: 빠른 추정</li>
                <li>· 단점: 개인 차이 반영 X</li>
                <li>· 정확도: ±10%</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(155,89,182,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#9333EA', marginBottom: '6px' }}>⌚ Apple/Garmin/Fitbit</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 장점: 실시간·개인화</li>
                <li>· 단점: 운동 강도 추정 오차</li>
                <li>· 정확도: ±10~20%</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            💡 <strong style={{ color: 'var(--text)' }}>실용적 결론</strong> — 둘 다 추정치(절대값 X). 본 도구는 평균값을 권장하며, 7일 이상 데이터가 일일 측정보다 정확합니다. 가장 정확한 검증은 <strong style={{ color: 'var(--text)' }}>2~4주 동일 칼로리 식사 후 체중 변화 측정</strong>(체중 안정 = 그 칼로리가 본인 TDEE).
          </p>
        </section>

        {/* ── 10. FAQ (accordion 방식) ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 강화 ── */}
        <section>
          <Disclaimer variant="medical" open>
            실제 에너지 소비량은 다음에 따라 달라집니다 —
            근육량·체지방률 / 호르몬 상태(갑상선·인슐린·코르티솔) / 수면 질·시간 / 만성질환·약물 복용 / 운동 강도·기술 / 측정기 정확도.
            <br />
            <strong>다음의 경우 사용 X 또는 의료 상담 필수</strong> — 18세 미만(성장기 별도 기준) / 임산부·수유부 / 당뇨·심혈관·갑상선 등 만성질환 / 거식증·폭식증 등 식이 장애 / 약물 복용 중.
            <br />
            <strong>극단적 칼로리 제한·지속적 피로·체중 강박 시</strong> — 의료 전문가(영양사·내과·정신과) 상담 / 정신건강 위기상담 <strong>1577-0199</strong> · 자살예방 <strong>1393</strong> (24시간).
            <br />
            건강한 체중 관리는 단순 칼로리 계산을 넘어 <strong>영양 균형·운동·수면·정신 건강</strong>을 함께 고려해야 합니다.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',         icon: '⚖️', name: 'BMI 계산기',                 desc: '체질량지수·키별 정상 체중·허리둘레' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기',       desc: '칼로리 적자로 목표 달성일 예측' },
              { href: '/tools/sports/pace',        icon: '🏃', name: '러닝 페이스 계산기',         desc: '마라톤 훈련 시 목표 페이스' },
              { href: '/tools/health/supplement',  icon: '💊', name: '영양제 성분 체크',          desc: '영양제 중복·상한량 체크' },
              { href: '/tools/date/age',           icon: '🎂', name: '만 나이 계산기',             desc: '나이별 건강 관리 계획' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',            desc: '식사·운동 루틴 집중 관리' },
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
