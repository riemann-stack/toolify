import Link from 'next/link'
import PetClient from './PetClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import Callout from '@/components/Callout'
import { dogHumanAge, catHumanAge, getCatStage, calculateAll, calcLifeProgress, rer, SENIOR_FACTOR_RATIO } from './petUtils'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/health/pet',
  title: '반려동물 계산기 — 강아지·고양이 사람 나이·사료량·체중 평가',
  description:
    '강아지·고양이 사람 나이 + RER/DER 칼로리, 사료량(건식·습식), 체중 평가, 수명 진행률을 반려동물 한 카드로.',
  keywords: [
    '강아지나이계산기', '고양이나이계산기', '반려동물나이환산',
    '강아지사료량계산기', '고양이칼로리계산', '개나이사람나이', '강아지하루사료량',
    'RER 계산', 'DER 계산', '강아지 적정 체중', '평균 수명',
  ],
})

/* ── 본문 표 = 계산기 엔진(petUtils)에서 직접 도출 — 표와 계산기 값 영구 일치 ── */
const DOG_YEARS = [1, 2, 3, 5, 7, 10, 12, 15]
const CAT_YEARS = [1, 2, 7, 11, 15, 20]
/* AAHA/AAFP 2021 고양이 생애 단계(키튼 ~1세 · 청년 1~6세 · 성숙 7~10세 · 시니어 10세 초과)와 도구 단계의 대응 */
const AAHA_CAT_STAGE = (y: number) => (y < 1 ? '키튼' : y <= 6 ? '청년 성묘' : y <= 10 ? '성숙 성묘' : '시니어')
const LIFESPAN_ROWS = [
  { label: '초소형견 (~5kg)', l: calcLifeProgress('dog', 0, 0, 'tiny') },
  { label: '소형견 (5~10kg)', l: calcLifeProgress('dog', 0, 0, 'small') },
  { label: '중형견 (10~25kg)', l: calcLifeProgress('dog', 0, 0, 'medium') },
  { label: '대형견 (25kg~)', l: calcLifeProgress('dog', 0, 0, 'large') },
  { label: '실내 고양이', l: calcLifeProgress('cat', 0, 0, 'small', false) },
  { label: '실외 생활 고양이', l: calcLifeProgress('cat', 0, 0, 'small', true) },
]
/* RER: 지수식(도구) vs 선형 근사식(30×kg+70, 2~45kg에서만 사용) */
const RER_ROWS = [2, 5, 10, 20, 30, 40].map(w => ({ w, exp: Math.round(rer(w)), lin: 30 * w + 70 }))
/* 고양이 예시 — 건식+습식 혼합 모드(칼로리 기준 70:30)와 같은 계산 */
const CAT_EX = calculateAll({ species: 'cat', yrs: 4, mos: 0, weight: 4.5, size: 'small', isNeutered: true, activity: 'low', foodKcalPer100g: 380 })
const CAT_DRY = 380, CAT_WET = 90
const CAT_EX_DRY_ONLY = Math.round(CAT_EX.der / CAT_DRY * 100)
const CAT_EX_MIX_DRY = Math.round(CAT_EX.der * 0.7 / CAT_DRY * 100)
const CAT_EX_MIX_WET = Math.round(CAT_EX.der * 0.3 / CAT_WET * 100)

const FAQ_LD = [
              {
                q: '강아지 나이를 사람 나이로 곱하기 7을 하면 안 되나요?',
                a: '단순 7배 공식은 부정확합니다. 강아지는 첫 2년간 매우 빠르게 성장(1세≈15세, 2세≈24세)하며, 이후 품종 크기에 따라 노화 속도가 달라집니다. 소형견은 대형견보다 훨씬 오래 살므로 같은 나이라도 체감 노화 정도가 크게 다릅니다.',
              },
              {
                q: '하루 사료량이 포장지와 다른 이유는?',
                a: '포장지의 급여량은 평균적인 미중성화 성견 기준입니다. 중성화 여부, 활동량, 개체 대사율에 따라 실제 필요량은 10~30% 차이날 수 있습니다. 본 도구는 RER(기초대사량)과 생활계수(중성화 × 활동량 6조합 명시 매핑)를 기반으로 개인화된 값을 제공합니다.',
              },
              {
                q: '간식은 하루에 얼마나 줘도 되나요?',
                a: '수의영양학에서는 하루 총 칼로리의 10% 이내를 권장합니다. 예를 들어 일일 권장 칼로리가 300kcal라면 간식은 30kcal 이내로 제한하고, 간식만큼 사료를 줄여야 비만을 예방할 수 있습니다.',
              },
              {
                q: '고양이는 왜 습식 사료를 먹여야 하나요?',
                a: '고양이는 본능적으로 물을 잘 마시지 않아 만성 탈수와 신장병 위험이 높습니다. 습식 사료는 수분 함량이 70~80%로 자연스러운 수분 보충에 도움이 됩니다. 특히 비뇨기 질환 병력이 있거나 시니어 고양이에게 습식 사료가 더 권장됩니다.',
              },
              {
                q: '노령견·노령묘는 사료를 얼마나 줄여야 하나요?',
                a: '노령 반려동물은 기초대사량이 줄어들어 성견 대비 약 10~20% 칼로리를 감량하는 것이 일반적입니다(본 도구는 중성화·활동량에 따른 성견 계수에서 15%를 줄여 계산합니다). 다만 근감소증 예방을 위해 단백질 함량은 유지해야 합니다. 고단백·저지방의 시니어 전용 사료를 선택하고, 정확한 관리는 수의사와 상담하시기 바랍니다.',
              },
              {
                q: '우리 강아지 체중이 정상인지 어떻게 알 수 있나요?',
                a: '본 도구는 품종 크기 기준 정상 범위를 자동 표시합니다 (예: 소형견 5~10kg, 중형 10~25kg). 다만 같은 체중이라도 골격·근육량에 따라 다르므로 집에서 간단히 확인하는 방법:<br>· <strong>갈비뼈</strong>: 손바닥으로 살짝 만질 때 느껴짐 (보이면 저체중, 안 만져지면 과체중)<br>· <strong>허리</strong>: 위에서 봤을 때 모래시계 모양 (사라지면 과체중)<br>· <strong>복부</strong>: 옆에서 봤을 때 약간 들어감 (처지면 과체중)<br>정확한 BCS(Body Condition Score)는 연 1회 건강검진 시 수의사가 1~9 또는 1~5 척도로 평가합니다.',
              },
              {
                q: '강아지·고양이 평균 수명을 넘겼는데 괜찮을까요?',
                a: '평균 수명은 통계 평균일 뿐입니다. 유전·식이·운동·검진·환경 관리가 좋다면 평균보다 훨씬 오래 사는 사례가 많습니다. 다만 평균 수명을 지난 고령 반려동물은:<br>· 검진 빈도 ↑ (반기 1회 → 분기 1회)<br>· 신장·간·심장 기능 정기 모니터링<br>· 관절·치아 통증 신호 관찰<br>· 식욕·활동·배변 변화 즉시 수의사 상담<br>본 도구의 진행률 게이지는 보호자의 건강 관리 인식 도구이며, <strong>&quot;수명 예측&quot;이 아닙니다.</strong>',
              },
            ]

export default function PetPage() {
  return (
    <ToolPage width={760} slug="/tools/health/pet">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />반려동물 계산기
      </h1>
      <p className="tp-lead">
        강아지·고양이 사람 나이와 사료량·체중 평가·<strong style={{ color: 'var(--text)' }}>수명 진행률</strong>을 한눈에.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="RER = 70 × 체중(kg)^0.75(Merck), DER = RER × 생활계수(도구 단순화: 중성화×활동 6조합 1.2~1.8·퍼피/키튼 2.0~3.0·노령 = 성견 계수 × 0.85 — 문헌 대표 계수는 본문 표) · 사람 나이 = AVMA 규칙(1세 15·2세 24) 기반, 이후 크기별 연 4~6세 도구 단순화 · 고양이 생애 단계 AAHA/AAFP 2021"
        sources={[
          { label: 'Merck Veterinary Manual — 소동물 영양요구량', href: 'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-of-small-animals' },
          { label: 'WSAVA — Global Nutrition Guidelines', href: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/' },
          { label: 'Pet Nutrition Alliance — RER·MER 계수표', href: 'https://petnutritionalliance.org/wp-content/uploads/2023/03/MER.RER_.PNA_.pdf' },
          { label: 'AKC — 개 나이를 사람 나이로 환산하기', href: 'https://www.akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years/' },
          { label: 'AAHA/AAFP — 고양이 생애 단계(2021)', href: 'https://www.aaha.org/resources/2021-aaha-aafp-feline-life-stage-guidelines/feline-life-stage-definitions/' },
        ]}
      />

      <PetClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 나이 환산표 (기존 유지) ── */}
        <section>
          <h2 className="g-h2">강아지 나이 환산표</h2>
          <p className="g-p">
            계산기는 미국수의사회(AVMA)가 소개하는 「첫 1년 15세·2년째 24세·이후 1년에 약 4~5세」 규칙을 바탕으로, 2세 이후는 크기별로
            초소형·소형견 4세, 중형견 5세, 대형견 6세씩 더하도록 단순화했습니다. 그래서 2세까지는 크기와 관계없이 같고 그 뒤로 크기별로 벌어지며,
            미국켄넬클럽(AKC)의 크기별 표와는 일부 나이에서 값이 다를 수 있습니다(대형견이 더 빨리 늙는 경향만 반영한 근사치).
          </p>
          <div className="tableScroll" style={{ marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['실제 나이', '초소형·소형견 (~10kg)', '중형견 (10~25kg)', '대형견 (25kg~)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 본문 표 = 계산기 엔진(dogHumanAge)에서 직접 도출 — 표와 계산기 값 영구 일치 */}
                {DOG_YEARS.map((yr, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{yr}세</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--orange-600)' }}>{dogHumanAge(yr, 0, 'small')}세</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>{dogHumanAge(yr, 0, 'medium')}세</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>{dogHumanAge(yr, 0, 'large')}세</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="g-h2">고양이 나이 환산표</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['실제 나이', '사람 나이', '도구 단계', 'AAHA/AAFP 단계'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 계산기 엔진(catHumanAge·getCatStage)에서 직접 도출 */}
                {CAT_YEARS.map((yr, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{yr}세</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--amethyst)' }}>{catHumanAge(yr, 0)}세</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--text)' }}>{getCatStage(yr, 0)}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)' }}>{AAHA_CAT_STAGE(yr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            고양이는 크기 차이가 작아 한 가지 환산만 씁니다(1세 15세 · 2세 24세 · 이후 1년에 4세). 도구의 &lsquo;시니어(7~10세)&rsquo;는 AAHA/AAFP 2021 지침의 성숙 성묘, &lsquo;슈퍼시니어(11세~)&rsquo;는 시니어 단계에 해당하며, 노령 칼로리 보정은 11세부터 적용됩니다.
          </p>
        </section>

        {/* ── 2. ×7 공식이 틀린 이유 (기존 유지) ── */}
        <section>
          <h2 className="g-h2">강아지 나이 = ×7이 틀린 이유</h2>
          <p className="g-p">
            &quot;개 나이 × 7 = 사람 나이&quot;는 오랫동안 통용된 속설이지만 수의학적으로 부정확합니다. 강아지는 첫 1~2년 동안 <strong style={{ color: 'var(--text)' }}>사람의 청소년기까지 극도로 빠르게</strong> 성장하며, 이후 품종 크기에 따라 노화 속도가 크게 달라집니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {[
              { title: '문제 1 — 초기 성장 속도 무시', color: 'var(--orange-600)', desc: '강아지 1세는 사람 나이로 약 15세(사춘기), 2세는 24세에 해당합니다. ×7 공식으로 계산하면 각각 7세, 14세가 되어 실제보다 훨씬 어린 나이가 됩니다.' },
              { title: '문제 2 — 품종 크기 차이 무시', color: 'var(--amethyst)', desc: '소형견은 대체로 대형견보다 오래 살고, 그레이트 데인 같은 초대형견은 10년을 넘기기 어려운 경우가 많습니다. 같은 ×7을 적용하면 노령 판단 시점이 크기와 관계없이 같아져, 대형견의 노령 관리가 늦어집니다.' },
              { title: '2020년 UC샌디에이고 연구 (Cell Systems)', color: 'var(--success)', desc: '래브라도 리트리버를 중심으로 개 104마리의 DNA 메틸화 패턴을 사람과 비교해 「사람 나이 ≈ 16 × ln(개 나이) + 31」이라는 로그 환산식을 제시했습니다. 초기 성장기에 개의 노화가 훨씬 빠르다는 점은 같지만, 이 식으로는 1세가 약 31세로 나와 계산기(15세)와 다릅니다. 한 품종 위주의 연구라 계산기는 AVMA 규칙에 크기별 차이를 단순 반영한 방식을 씁니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${item.color} 15%, transparent)`, borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.color, marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. RER/DER 공식 (기존 유지 + 표 정확화) ── */}
        <section>
          <h2 className="g-h2">칼로리 계산 공식 (RER / DER)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--orange-600)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>RER — 기초 에너지 요구량 (Resting Energy Requirement)</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>RER = 70 × 체중(kg)⁰·⁷⁵</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>적정 온도에서 쉬고 있을 때 필요한 열량입니다. 체중을 그대로 쓰지 않고 0.75 거듭제곱(대사체중)을 쓰는 것은 몸집이 클수록 kg당 필요한 열량이 줄어드는 관계(클라이버 법칙)를 반영하기 위해서입니다. 같은 이유로 10kg 개의 RER은 5kg 개의 2배가 아니라 약 1.7배입니다.</p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px' }}>DER — 일일 에너지 요구량 (Daily Energy Requirement)</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '10px' }}>DER = RER × 생활계수</p>
              <div className="tableScroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th scope="col" style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>상황</th>
                      <th scope="col" style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 600 }}>이 도구 계수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['강아지 퍼피 (4개월 미만)',                '× 3.0'],
                      ['강아지 퍼피 (4개월~성장기)',              '× 2.0'],
                      ['고양이 키튼 (4개월 미만)',                '× 2.5'],
                      ['고양이 키튼 (4개월~성장기)',              '× 2.0'],
                      ['중성화 + 활동 낮음 (실내)',              '× 1.2'],
                      ['중성화 + 활동 보통',                      '× 1.4'],
                      ['중성화 + 활동 높음',                      '× 1.6'],
                      ['미중성화 + 활동 낮음',                    '× 1.4'],
                      ['미중성화 + 활동 보통',                    '× 1.6'],
                      ['미중성화 + 활동 높음 (실외 고양이 포함)', '× 1.8'],
                      ['노령견·슈퍼시니어 고양이 (성견 계수 기준)', '× 0.85 (약 15% 감량)'],
                    ].map(([sit, fac], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                        <td style={{ padding: '7px 8px', color: 'var(--muted)' }}>{sit}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{fac}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
                본 도구는 <strong style={{ color: 'var(--text)' }}>중성화 × 활동량 6가지 조합</strong>을 개·고양이에 같은 표로 적용하고, 퍼피·키튼은 <strong style={{ color: 'var(--text)' }}>생후 4개월</strong>을 기준으로 급성장기·성장기를 구분합니다.
                노령(개는 대형 7세·중형 8세·소형 9세, 고양이는 11세부터)에는 같은 조합의 성견 계수에 {SENIOR_FACTOR_RATIO}를 곱합니다.
              </p>
            </div>
          </div>

          <h3 className="g-h3">수의영양 문헌의 대표 계수와 비교</h3>
          <p className="g-p">
            Merck 수의학 매뉴얼과 Pet Nutrition Alliance 계수표는 개와 고양이의 계수를 따로 둡니다. 도구의 6조합 표는 활동량까지 나누기 위한 단순화라서,
            개의 &lsquo;중성화·보통&rsquo;(1.4)은 문헌의 중성화 성견(1.6)보다 낮고, 고양이의 &lsquo;중성화·보통&rsquo;(1.4)은 문헌의 중성화 성묘(1.2)보다 높습니다.
            어느 계수든 개체 차이가 커서 출발점일 뿐이므로, 2~4주마다 체중과 체형(BCS)을 보고 급여량을 5~10%씩 조정하는 것이 공통 권고입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>상황</th>
                  <th scope="col" style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>개</th>
                  <th scope="col" style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>고양이</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['중성화 성체', '× 1.6', '× 1.2'],
                  ['미중성화 성체', '× 1.8', '× 1.4'],
                  ['활동 적음·비만 경향', '× 1.2~1.4', '× 1.0'],
                  ['성장기 (생후 4개월 미만)', '× 3.0', '× 2.5'],
                  ['성장기 (4개월~성체)', '× 2.0', '× 2.5'],
                ].map(([sit, dog, cat], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{sit}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{dog}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{cat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            출처: Merck Veterinary Manual「Nutritional Requirements of Small Animals」, Pet Nutrition Alliance「Calculating Calories Based on Pet Needs」. 계수는 RER에 곱하는 값입니다.
          </p>

          <h3 className="g-h3">체중별 RER — 지수식과 선형 근사식</h3>
          <p className="g-p">
            현장에서는 계산기 없이 쓰려고 <strong>RER ≈ 30 × 체중(kg) + 70</strong>이라는 선형식을 쓰기도 하지만, Merck 매뉴얼은 이 식을 2kg 초과·45kg 미만에서만 쓰도록 합니다.
            아래 표처럼 아주 작거나 큰 체중에서는 두 식이 벌어지므로 이 도구는 체중 전 구간에 쓸 수 있는 지수식을 씁니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 360 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>체중</th>
                  <th scope="col" style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>70 × kg⁰·⁷⁵ (도구)</th>
                  <th scope="col" style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>30 × kg + 70</th>
                </tr>
              </thead>
              <tbody>
                {RER_ROWS.map((r, i) => (
                  <tr key={r.w} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{r.w}kg</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text)' }}>{r.exp.toLocaleString('en-US')}kcal</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontFamily: 'var(--font-sans)', color: 'var(--muted)' }}>{r.lin.toLocaleString('en-US')}kcal</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 4. 시나리오 예시 (기존 유지) ── */}
        <section>
          <h2 className="g-h2">계산 예시</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '12px' }}>
            {/* 예시 수치 = 계산기 엔진(calculateAll)에서 직접 도출 — 예시와 계산기 값 영구 일치 */}
            {([
              { label: '예시 1', name: '말티즈',       breedId: 'maltese', size: 'tiny'  as const, weight: 4,  yrs: 5, neutered: true,  activity: 'low'  as const, envLabel: '실내(낮은 활동)', kcal: 350, color: 'var(--orange-600)' },
              { label: '예시 2', name: '골든리트리버', breedId: 'golden',  size: 'large' as const, weight: 30, yrs: 3, neutered: false, activity: 'high' as const, envLabel: '활동 높음',       kcal: 350, color: 'var(--amethyst)' },
            ]).map((ex, i) => {
              const r = calculateAll({ species: 'dog', yrs: ex.yrs, mos: 0, weight: ex.weight, size: ex.size, breedId: ex.breedId, isNeutered: ex.neutered, activity: ex.activity, foodKcalPer100g: ex.kcal })
              const foodG = Math.round(r.der / ex.kcal * 100)
              const desc = `${ex.name} ${ex.weight}kg · ${ex.yrs}세 · ${ex.neutered ? '중성화' : '미중성화'} · ${ex.envLabel}`
              const items = [
                `사람 나이: 약 ${r.humanAge}세 (${r.stage})`,
                `RER: 70 × ${ex.weight}⁰·⁷⁵ ≈ ${r.rerVal.toLocaleString('en-US')}kcal`,
                `DER: ${r.rerVal.toLocaleString('en-US')} × ${r.derFactor} ≈ ${r.der.toLocaleString('en-US')}kcal`,
                `사료 권장량: 약 ${foodG}g / 일 (${ex.kcal}kcal/100g)`,
              ]
              return (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${ex.color} 19%, transparent)`, borderRadius: 'var(--radius-card)', padding: '18px 20px' }}>
                <p style={{ fontSize: '11px', color: ex.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{ex.label}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>{desc}</p>
                {items.map((item, j) => (
                  <p key={j} style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: ex.color, flexShrink: 0 }}>›</span>{item}
                  </p>
                ))}
              </div>
              )
            })}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            고양이 예시: 4세·4.5kg·중성화 실내묘(활동 낮음)는 RER {CAT_EX.rerVal}kcal × {CAT_EX.derFactor} = 하루 약 <strong>{CAT_EX.der}kcal</strong>입니다.
            {CAT_DRY}kcal/100g 건식만 먹이면 약 {CAT_EX_DRY_ONLY}g, 건식+습식 모드(칼로리 70:30)에서 습식이 {CAT_WET}kcal/100g이면 건식 약 {CAT_EX_MIX_DRY}g + 습식 약 {CAT_EX_MIX_WET}g입니다.
            간식은 하루 칼로리의 10%인 {CAT_EX.treatKcal}kcal 이내로 잡고, 간식을 준 만큼 사료를 줄입니다(계산기의 사료량은 하루 칼로리 전체 기준이라 간식 몫이 차감되어 있지 않습니다).
          </p>
        </section>

        {/* ── 5. 적정 체중 평가 ── */}
        <section>
          <h2 className="g-h2">적정 체중 평가</h2>
          <p className="g-p">
            본 도구는 입력한 체중을 품종별 표준 체중(기타·믹스는 아래 크기 구간)과 비교해 <strong style={{ color: 'var(--text)' }}>저체중·적정·과체중·비만 4단계</strong>로 평가합니다. 성장기(1세 미만, 대형견은 18개월 미만)에는 성견·성묘 기준을 적용하지 않습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange-600)', marginBottom: '8px' }}>강아지 정상 체중 (기타·믹스)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 초소형: <strong style={{ color: 'var(--text)' }}>1.5~5kg</strong></li>
                <li>· 소형: <strong style={{ color: 'var(--text)' }}>5~10kg</strong></li>
                <li>· 중형: <strong style={{ color: 'var(--text)' }}>10~25kg</strong></li>
                <li>· 대형: <strong style={{ color: 'var(--text)' }}>25~45kg</strong></li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--amethyst)', marginBottom: '8px' }}>고양이 정상 체중</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 적정: <strong style={{ color: 'var(--text)' }}>3.0~5.5kg</strong></li>
                <li>· 과체중: 5.5~7.0kg</li>
                <li>· 비만: 7.0kg+</li>
                <li>· 일부 대형 품종(메인쿤·노르웨이숲)은 6~9kg 정상</li>
              </ul>
            </div>
          </div>
          <p className="g-p">
            품종을 고르면 그 품종의 표준 체중 범위(견종 표준을 반올림한 참고값)를, 기타·믹스를 고르면 위 크기 구간을 씁니다. 범위 상한의 125%까지는 &lsquo;과체중&rsquo;, 그 이상은 &lsquo;비만&rsquo;으로 표시합니다.
            예를 들어 말티즈(2~4kg)가 4.8kg이면 과체중, 5.2kg이면 비만 구간입니다. 체중만으로는 골격 차이를 알 수 없으므로 아래 체형 점수를 함께 보세요.
          </p>
          <Callout tone="note" title="체형 점수(BCS) 9점 척도 읽는 법">
            WSAVA 등이 쓰는 9점 척도에서 <strong>4~5점이 이상적</strong>, 6~7점은 과체중, 8~9점은 비만, 1~3점은 저체중입니다. 이상적인 체형은 손바닥으로 옆구리를 가볍게 쓸었을 때 갈비뼈가 얇은 지방층 아래로 만져지고,
            위에서 보면 갈비뼈 뒤로 허리가 들어가며, 옆에서 보면 배가 위로 올라붙어 있습니다. 정확한 평가는 연 1회 건강검진 때 수의사에게 받는 것이 좋습니다.
          </Callout>
        </section>

        {/* ── 6. 평균 수명 가이드 ── */}
        <section>
          <h2 className="g-h2">평균 수명 가이드</h2>
          <p className="g-p">
            본 도구는 아래 기준값으로 &lsquo;현재 나이 ÷ 평균 수명&rsquo;의 진행률을 계산하고, 33%·66%·100%를 넘을 때마다 초기·성숙기·노령기·평균 초과로 단계를 나눠 검진 주기를 안내합니다.
            예를 들어 7세 중형견은 {calcLifeProgress('dog', 7, 0, 'medium').progressPercent}%로 &lsquo;{calcLifeProgress('dog', 7, 0, 'medium').stageLabel}&rsquo;, 7세 대형견은 {calcLifeProgress('dog', 7, 0, 'large').progressPercent}%로 &lsquo;{calcLifeProgress('dog', 7, 0, 'large').stageLabel}&rsquo;입니다.
            고양이는 활동량과 별개로 &lsquo;실내/실외 생활&rsquo; 선택으로 기준을 바꿉니다.
          </p>
          <div className="tableScroll" style={{ marginBottom: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent-ink)', fontWeight: 700 }}>도구 기준 평균</th>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>참고 상한</th>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                </tr>
              </thead>
              <tbody>
                {/* 계산기 엔진(calcLifeProgress)의 기준값 그대로 */}
                {LIFESPAN_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 600 }}>{row.label}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{row.l.avg}년</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{row.l.max}년</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '12px' }}>{row.l.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note">
            표의 값은 크기·생활 환경별 경향을 보여 주는 이 도구의 기준값이지 국내 공식 통계가 아니며, 품종·유전·관리에 따라 개체차가 매우 큽니다. 진행률은 검진 주기를 챙기기 위한 보호자용 지표이며 <strong>수명 예측이 아닙니다</strong>.
          </Callout>
        </section>

        {/* ── 7. 건식 vs 습식 vs 혼합 ── */}
        <section>
          <h2 className="g-h2">건식 vs 습식 사료 — 칼로리 밀도 차이</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>같은 일일 칼로리도 사료 종류에 따라 그램 수가 크게 다릅니다.</strong> 건식은 100g당 약 350~400kcal, 습식은 약 70~120kcal로 3~5배 차이가 나므로, 반드시 포장지의 칼로리(kcal/100g) 표시를 계산기에 넣으세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange-600)', marginBottom: '6px' }}>건식 (Dry · Kibble)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 칼로리 밀도: <strong style={{ color: 'var(--text)' }}>350~400kcal/100g</strong></li>
                <li>· 장점: 보관 편함·가성비</li>
                <li>· 단점: 수분 부족 (약 10%)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan-600)', marginBottom: '6px' }}>습식 (Wet · Pâté)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 칼로리 밀도: <strong style={{ color: 'var(--text)' }}>70~120kcal/100g</strong></li>
                <li>· 장점: 수분 70~80%·기호성 ↑</li>
                <li>· 단점: 보관 어려움·가격 ↑</li>
              </ul>
            </div>
          </div>
          <p className="g-p">
            <strong>혼합 (건식 + 습식)</strong> — 보관·가성비는 건식, 수분·기호성은 습식으로 보완하는 방식입니다. 정해진 표준 비율은 없으며, 본 도구의 <strong>고양이 [건식+습식] 모드</strong>는 편의상 하루 칼로리를
            <strong> 건식 70% : 습식 30%</strong>로 나눈 뒤 각 사료의 칼로리 밀도로 그램 수를 계산합니다. 무게 비율이 아니라 칼로리 비율이라, 습식의 그램 수가 더 크게 나오는 것이 정상입니다.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
            ※ 건식 사료의 치석 감소 효과는 일반 건식 전체가 아니라 <strong style={{ color: 'var(--text)' }}>치과 전용·섬유질 설계(VOHC 인증 등)</strong> 사료에 한정됩니다. 일반 건식만으로 치석을 충분히 막기는 어려우며, 칫솔질·스케일링 병행을 권장합니다.
          </p>
        </section>

        {/* ── 8. 연령대별 건강 가이드 (기존 유지) ── */}
        <section>
          <h2 className="g-h2">연령대별 건강 관리 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '10px' }}>
            {[
              { pet: '강아지', stage: '퍼피 (~1세)', color: 'var(--cyan-600)', items: ['종합백신(DHPPL — 디스템퍼·전염성간염·파보 등) 접종', '심장사상충 예방약 투여 시작', '중성화 수술 시기 상담 (6~12개월)'] },
              { pet: '강아지', stage: '성견 (1~7세)', color: 'var(--success)', items: ['연 1회 건강검진 및 혈액검사', '치석 스케일링 (1~2년마다)', '심장사상충·외부기생충 예방 지속'] },
              { pet: '강아지', stage: '노령견 (대형 7세·중형 8세·소형 9세~)', color: 'var(--orange-600)', items: ['반기 1회 건강검진으로 빈도 증가', '관절 건강 및 관절염 모니터링', '신장·간 기능 혈액검사 주기 점검'] },
              { pet: '고양이', stage: '키튼 (~1세)', color: 'var(--cyan-600)', items: ['종합백신 (FVRCP) 접종 시리즈', '중성화 수술 시기 상담 (5~7개월)', '내·외부 기생충 예방'] },
              { pet: '고양이', stage: '성묘 (1~7세)', color: 'var(--success)', items: ['연 1회 건강검진 및 혈액검사', '구강 건강·치석 관리', '체중 모니터링 및 비만 예방'] },
              { pet: '고양이', stage: '시니어·슈퍼시니어 (7세~)', color: 'var(--orange-600)', items: ['갑상선 기능 항진증 검사', '신장 기능 (BUN·크레아티닌) 정기 확인', '혈압 측정 및 인지 기능 저하 관찰'] },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{item.pet}</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: item.color, marginBottom: '10px' }}>{item.stage}</p>
                {item.items.map((it, j) => (
                  <p key={j} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: item.color, flexShrink: 0 }}>•</span>{it}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. FAQ (accordion) — 기존 5개 + 신규 2개 ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 조항 (기존 유지·강화) ── */}
        <section>
          <Disclaimer variant="medical" open>
            본 계산기는 수의영양학 기반 <strong>참고용 도구</strong>입니다.
            <strong> 의료 진단·치료 도구 X / 약물 용량 계산 X / 영양제 추천 X.</strong>
            개별 반려동물의 건강 상태, 질병 유무, 특수 식이 요건에 따라 실제 필요량은 다를 수 있습니다.
            체중 증감·식욕 변화·활동량 변화가 있다면 반드시 수의사와 상담하시기 바랍니다.
            <br />
            <strong>주요 근거</strong> — RER/DER·생활계수·BCS·생애단계 기준은 Merck Veterinary Manual, AAHA(미국동물병원협회), WSAVA(세계소동물수의사회) 등 수의영양 가이드라인을 참고했습니다.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 (기존 유지) ── */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',          desc: '보호자 건강도 챙기세요' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기', desc: '칼로리 적자로 달성일 예측' },
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량 계산기',     desc: '보호자 일일 칼로리 계산' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',         desc: '예방접종·검진 일정 관리' },
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
        </section>

      </div>
    </ToolPage>
  )
}
