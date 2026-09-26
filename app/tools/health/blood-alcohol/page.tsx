import Link from 'next/link'
import BloodAlcoholClient from './BloodAlcoholClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import {
  alcoholGrams, calcPeakBAC, calcCumulativeBAC, fmtTimeMin, STANDARD_DRINK_G,
  DRUNK_DRIVING_PENALTIES, DRUNK_DRIVING_PENALTY_BY_ID, DRUNK_DRIVING_MAX_PENALTY, DRUNK_DRIVING_LAW_SINCE,
  DRUNK_DRIVING_REPEAT_PENALTIES, DRUNK_DRIVING_REPEAT_WINDOW_YEARS, LICENSE_DISQUALIFICATION_YEARS, BICYCLE_PM_FINES,
  fmtPenaltyLong, fmtPenaltyShort, fmtManwonWon, fmtLawDate, BAC_THRESHOLDS,
} from './bacUtils'

export const metadata = buildMetadata({
  path: '/tools/health/blood-alcohol',
  title: '혈중알코올 잔존량 추정기 — 알코올 분해 시간 참고용',
  description: '마신 술의 양과 체중·성별로 혈중알코올농도(BAC)가 언제쯤 낮아지는지 Widmark 공식으로 대략 추정합니다. 개인차가 커서 운전해도 되는지 판단하는 도구가 아니며, 음주 후에는 계산값과 관계없이 운전하지 마세요.',
  keywords: [
    '혈중알코올계산기', '혈중알코올농도', 'BAC추정', '알코올잔존량',
    '음주운전기준', '알코올분해시간', '음주측정',
    '다음날아침음주측정', '숙취운전위험', '여러자리음주',
    'ALDH2알코올분해', '윤창호법', '자전거음주운전',
  ],
})

/* ── 본문 예시 수치: 도구와 같은 bacUtils로 빌드 시점에 계산 (70kg 남성·보통 식사·분해 0.015/h) ── */
const EX_WEIGHT = 70
const EX_DECAY = 0.015
/* 법정 BAC 기준 (lib/krDrunkDriving.ts) */
const BAC_SUSPEND = BAC_THRESHOLDS.GENERAL_SUSPEND   // 0.03
const BAC_REVOKE = BAC_THRESHOLDS.REVOKE             // 0.08
const BAC_AGGRAVATED = BAC_THRESHOLDS.AGGRAVATED     // 0.2
const exPeak = (grams: number) => calcPeakBAC({ weightKg: EX_WEIGHT, sex: 'male', alcoholGrams: grams, foodMultiplier: 1 })
const bacColor = (bac: number) =>
  bac < BAC_SUSPEND ? 'var(--emerald-600)' : bac < 0.05 ? 'var(--yellow-700)' : bac < BAC_REVOKE ? 'var(--orange-600)' : bac < 0.15 ? 'var(--red-600)' : '#B91C1C'
const BAC_EXAMPLES = [
  { label: '소주 1잔 (50ml)', ml: 50, abv: 16 },
  { label: '소주 반병 (180ml)', ml: 180, abv: 16 },
  { label: '맥주 500cc 2잔', ml: 1000, abv: 4.5 },
  { label: '소주 1병 (360ml)', ml: 360, abv: 16 },
  { label: '소주 2병 (720ml)', ml: 720, abv: 16 },
].map(e => {
  const g = alcoholGrams(e.ml, e.abv)
  const peak = exPeak(g)
  const hrs = peak > BAC_SUSPEND ? (peak - BAC_SUSPEND) / EX_DECAY : 0
  return [e.label, `약 ${g.toFixed(1)}g`, `약 ${peak.toFixed(3)}%`, hrs > 0 ? `약 ${hrs.toFixed(1)}시간` : '즉시 이하', bacColor(peak)]
})

// 누적 예시 — 누적 탭 기본값(1·2차)과 같은 입력 + 3차 양주 2샷
const CUMUL_ROWS = [
  { label: '1차 (19~20:30)', drinks: '소주 1병 + 맥주 500cc', startMin: 19 * 60, endMin: 20 * 60 + 30, grams: alcoholGrams(360, 16) + alcoholGrams(500, 4.5) },
  { label: '2차 (22~23:30)', drinks: '맥주 500cc 2잔', startMin: 22 * 60, endMin: 23 * 60 + 30, grams: alcoholGrams(1000, 4.5) },
  { label: '3차 (0~1:00)', drinks: '양주 2샷 (90ml)', startMin: 24 * 60, endMin: 25 * 60, grams: alcoholGrams(90, 40) },
]
const CUMUL = calcCumulativeBAC({
  sessions: CUMUL_ROWS.map((r, i) => ({ id: String(i), startMin: r.startMin, endMin: r.endMin, alcoholGrams: r.grams })),
  weightKg: EX_WEIGHT, sex: 'male', foodMultiplier: 1, decayRate: EX_DECAY,
})
const CUMUL_TOTAL_G = Math.round(CUMUL.totalAlcoholGrams)
const CUMUL_STD = (CUMUL.totalAlcoholGrams / STANDARD_DRINK_G).toFixed(1)
const CUMUL_WHO_RATIO = (CUMUL.totalAlcoholGrams / 60).toFixed(1)
const CUMUL_PEAK_LEVEL = CUMUL.peakBAC >= BAC_AGGRAVATED ? '0.2% 이상 가중처벌 구간'
  : CUMUL.peakBAC >= 0.18 ? '면허취소 구간, 0.2% 가중처벌 기준에 근접'
  : CUMUL.peakBAC >= BAC_REVOKE ? '면허취소·형사처벌 구간' : '면허정지·형사처벌 구간'

// 다음날 아침 예시 — 소주 1병·2병, 음주 종료 자정(00:00)
const EX1_GRAMS = alcoholGrams(360, 16)
const EX1 = exPeak(EX1_GRAMS)
const EX2_GRAMS = alcoholGrams(720, 16)
const EX2 = exPeak(EX2_GRAMS)
const EX2_AT8 = Math.max(0, EX2 - 8 * EX_DECAY)

// 법정 수치 문구 — 모두 lib/krDrunkDriving.ts 상수(bacUtils 재수출)에서 생성 (단일 소스)
const PEN = DRUNK_DRIVING_PENALTY_BY_ID
const DQ = LICENSE_DISQUALIFICATION_YEARS
const BIKE = BICYCLE_PM_FINES.bicycle
const PM = BICYCLE_PM_FINES.pm
const REPEAT_TEXT = DRUNK_DRIVING_REPEAT_PENALTIES.map(r => `${r.label} ${fmtPenaltyShort(r, ' 징역 또는 ')}`).join(', ')
const DQ_TEXT = `1회 취소 ${DQ.firstRevoke}년, 2회 이상 ${DQ.repeat}년, 음주 사고 ${DQ.accident}~${DQ.repeatAccident}년, 사망사고 ${DQ.fatal}년`
const MAX_PENALTY_TEXT = `최대 징역 ${DRUNK_DRIVING_MAX_PENALTY.prisonYears}년·벌금 ${fmtManwonWon(DRUNK_DRIVING_MAX_PENALTY.fineWon)}`

const FAQ_LD = [
              { q: 'Widmark 공식은 얼마나 정확한가요?', a: 'Widmark 공식은 1930년대 스웨덴의 Erik Widmark가 개발한 표준 법의학 공식으로, 수사기관과 법원에서도 사용됩니다. 다만 개인의 신진대사율, 음식 섭취, 간 기능 등에 따라 ±20~30%의 오차가 발생할 수 있어 참고용으로만 활용해야 합니다. 실제 음주 측정기 결과와는 다를 수 있습니다.' },
              { q: '커피나 물을 마시면 술이 빨리 깨나요?', a: '아니요. 커피(카페인)는 각성 효과로 술에 덜 취한 것처럼 느껴지게 할 수 있지만 BAC 자체는 변하지 않습니다. 물도 BAC를 직접적으로 낮추지 않으나 탈수 예방에 도움됩니다. 알코올 분해는 간에서 이루어지며, 시간이 유일한 해결책입니다.' },
              { q: '음주 후 잠을 자면 더 빨리 깨나요?', a: '수면 자체가 알코올 분해를 빠르게 하지는 않습니다. 시간당 0.015 g/dL 감소율은 수면 중에도 동일하게 적용됩니다. 다만 수면 후에도 BAC가 여전히 높을 수 있으며, 아침에 운전하기 전 반드시 충분한 시간이 경과했는지 확인해야 합니다. 전날 과음한 경우 숙취 운전으로 단속되는 사례가 매우 많습니다.' },
              { q: "'숙취'가 없으면 술이 다 깬 건가요?", a: '아닙니다. 숙취 증상(두통, 구역질, 피로감)과 BAC는 별개입니다. 숙취가 없어도 혈중알코올이 단속 기준치 이상 남아있을 수 있습니다. 특히 대량 음주 후 다음 날 아침에는 여전히 단속 기준(0.03%)을 초과하는 경우가 많으므로, 반드시 시간 경과를 확인하고 불확실하면 대중교통을 이용하세요.' },
              { q: '음주 측정 거부 시 처벌은?', a: `음주 측정 거부는 그 자체로 형사처벌 대상입니다(도로교통법 제148조의2). 면허가 취소되고(결격기간 ${DQ.firstRevoke}년, 재위반·사고 시 더 길어짐) ${fmtPenaltyLong(PEN.refusal)}이 부과될 수 있습니다. 처벌 수위가 가장 무거운 0.2% 이상 음주(${fmtPenaltyShort(PEN.aggravated)})와 형량 범위가 상당 부분 겹칠 만큼 무겁지만 완전히 동일한 기준은 아닙니다. "측정하지 않으면 불리하지 않다"는 생각은 잘못된 통념입니다.` },
              { q: '어제 12시까지 술 마셨는데 오늘 아침 운전 위험이 남아있나요?', a: `음주량과 신체 조건에 따라 다릅니다. 70kg 남성 + 소주 1병(약 ${Math.round(EX1_GRAMS)}g), 음주 종료 자정 가정: 최고 BAC 약 ${EX1.toFixed(3)} → 면허정지 기준(0.03) 미만 추정 ${fmtTimeMin((EX1 - BAC_SUSPEND) / EX_DECAY * 60)}, 완전 분해 추정 ${fmtTimeMin(EX1 / EX_DECAY * 60)}로 8시엔 거의 0입니다. 그러나 소주 2병(약 ${Math.round(EX2_GRAMS)}g)이면 8시에도 약 ${EX2_AT8.toFixed(2)}(면허취소 0.08에 근접), ALDH2 결손·공복 음주면 더 오래 남습니다. <strong>BAC가 낮게 추정되더라도, 그리고 계산값과 관계없이 음주 후 운전은 금지</strong>입니다 — 불확실하면 택시·지하철·대리운전. 본 도구의 「🌅 다음날 아침」 탭은 위험을 참고용으로 추정할 뿐입니다.` },
              { q: '1차·2차·3차 여러 자리 마셨는데 BAC 어떻게 계산하나요?', a: `본 도구의 「🔢 여러 자리 누적」 탭에서 자리별 시작·종료 시각과 음주 종류를 입력하면 시간 흐름에 따라 누적 BAC를 추정하고 곡선으로 보여줍니다. 예를 들어 1차 소주 1병과 맥주 500cc, 2차 맥주 500cc 2잔, 3차 양주 2샷을 마시면 알코올 약 ${CUMUL_TOTAL_G}g(표준잔 약 ${CUMUL_STD}잔)으로, WHO 과음 기준(한 번에 60g)의 약 ${CUMUL_WHO_RATIO}배입니다. 본인뿐 아니라 다른 사람에게도 위험합니다.` },
              { q: '자전거나 전동킥보드는 음주운전 단속 안 되나요?', a: `처벌 대상입니다. 자전거는 ${fmtLawDate(BIKE.since)}부터 음주운전(현재 BAC 0.03% 이상) 시 범칙금 ${fmtManwonWon(BIKE.fine)}(측정 불응 ${fmtManwonWon(BIKE.refusal)})이 부과됩니다. 전동킥보드 같은 개인형 이동장치는 ${fmtLawDate(PM.since)}부터 범칙금 ${fmtManwonWon(PM.fine)}(측정 불응 ${fmtManwonWon(PM.refusal)})이 부과되고, 운전면허 정지·취소 처분도 함께 받을 수 있습니다. 사고가 나면 별도로 처벌되며, 도심에서는 보행자 사고 위험도 큽니다.` },
              { q: '술이 빨리 깨는 방법이 있나요?', a: '의학적으로 「빨리 깨는 방법」 존재 X. 알코올 분해는 간이 시간당 약 0.015 g/dL로 일정. 다음은 효과 X 또는 미미: 커피·카페인 (각성만 ↑, BAC 그대로) / 차가운 물·샤워 (정신 차림만) / 운동 (효과 미미·심혈관 부담) / 콩나물국·해장국 (위장 보호만). 유일한 방법은 시간입니다. 본 도구의 시간별 BAC 곡선은 대략적인 추정치일 뿐입니다.' },
              { q: 'ALDH2 결손이면 술을 끊어야 하나요?', a: '본인 결정 영역이지만 다음 의학적 사실 인지: ALDH2 결손 (한국인 30~40%) 시 아세트알데히드(1급 발암물질) 분해가 느려 체내에 오래 남고, 식도암 위험 5~50배 ↑, 간암·구강암 위험 ↑. 특징: 술 마시면 얼굴 빨개짐, 심박 ↑, 두통·구역질 빨리. 전문가들은 ALDH2 결손이라면 음주를 피하거나 아주 적게 마시도록 권합니다. 음주 문제 상담은 지역 중독관리통합지원센터나 정신건강위기상담 1577-0199에서 받을 수 있습니다.' },
            ]

export default function BloodAlcoholPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="health" />혈중알코올 잔존량 추정기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        마신 술의 양과 체중으로 체내 알코올이 얼마나 남아 있고 언제쯤 분해될지 Widmark 공식으로 <strong style={{ color: 'var(--text)' }}>대략 추정</strong>합니다. 개인차가 커서 <strong style={{ color: 'var(--text)' }}>운전해도 되는지 판단하는 데는 쓸 수 없습니다</strong>.
      </p>

      <UpdatedMeta date="2026년 9월" basis="위드마크(Widmark) 공식 — 체내분포계수 남 0.68·여 0.55, 시간당 분해율 0.010~0.020g/dL(기본 0.015) · 처벌 기준 도로교통법 제148조의2(0.03% 면허정지·0.08% 면허취소)·제82조(결격기간)" sources={[{ label: '국가법령정보센터 — 도로교통법', href: 'https://www.law.go.kr/법령/도로교통법' }, { label: '도로교통공단 — 음주운전 처벌 기준', href: 'https://www.koroad.or.kr/kp_web/drunkDriveInfo4.do' }]} />

      <BloodAlcoholClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. Widmark 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Widmark 공식
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', borderRadius: 'var(--radius-card)', padding: '20px 22px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Blood Alcohol Concentration</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, marginBottom: '12px' }}>
              BAC(g/dL) = 알코올(g) ÷ (체중(kg) × r × 10)
            </p>
            <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
              <li>남성 체수분비율 <strong style={{ color: 'var(--cyan-600)' }}>r = 0.68</strong></li>
              <li>여성 체수분비율 <strong style={{ color: 'var(--pink-600)' }}>r = 0.55</strong></li>
              <li>알코올(g) = 용량(ml) × 도수(%) ÷ 100 × 0.7894 (에탄올 밀도)</li>
              <li>감소율: 시간당 <strong style={{ color: 'var(--text)' }}>약 0.015 g/dL</strong> (표준, 개인차 있음)</li>
            </ul>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', marginTop: '14px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
              <span style={{ color: 'var(--muted)' }}>예시</span> 70kg 남성이 소주 1병(360ml × 16%) 음주 시<br/>
              알코올 = 360 × 0.16 × 0.7894 ≈ <strong>45.5g</strong><br/>
              최고 BAC = 45.5 ÷ (70 × 0.68 × 10) ≈ <strong style={{ color: 'var(--accent)' }}>0.096 g/dL</strong>
            </div>
          </div>
        </div>

        {/* ── 2. 음주운전 처벌 기준표 ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            음주운전 처벌 기준 (현행 · {fmtLawDate(DRUNK_DRIVING_LAW_SINCE, 'ym')}~)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>BAC</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>처벌 수준</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>내용</th>
                </tr>
              </thead>
              <tbody>
                {DRUNK_DRIVING_PENALTIES.map((p, i) => [p.bac, p.license, p.penalty, ['var(--orange-600)', 'var(--red-600)', '#B91C1C', '#B91C1C'][i]]).map(([bac, level, desc, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{bac}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontWeight: 600 }}>{level}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            ※ 도로교통법 제148조의2 기준({fmtLawDate(DRUNK_DRIVING_LAW_SINCE, 'ym')} BAC 기준 0.05→0.03 강화). {DRUNK_DRIVING_REPEAT_WINDOW_YEARS}년 안에 다시 위반하면 가중처벌됩니다({REPEAT_TEXT}). 면허 결격기간은 BAC가 아니라 위반 횟수와 사고 여부로 정해집니다(제82조: {DQ_TEXT}). 음주운전으로 사람을 숨지게 하면 <strong style={{ color: 'var(--red-600)' }}>무기징역까지 가능</strong>합니다. 세부 처분은 사안에 따라 달라질 수 있어 공식 기준을 확인하세요.
          </p>
        </div>

        {/* ── 3. 음주량별 BAC 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            음주량별 BAC 예시
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.6 }}>
            70kg 남성, 식사 후 기준. 개인차 있음 — 참고용
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>음주량</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>알코올(g)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>최고 BAC</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>0.03 미만</th>
                </tr>
              </thead>
              <tbody>
                {BAC_EXAMPLES.map(([drink, alc, bac, clear, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{drink}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{alc}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{bac}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{clear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 알코올 분해 영향 요인 ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🧬 알코올 분해에 영향을 주는 요인
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { icon: '⚖️', title: '체중',       desc: '체중이 클수록 체내 수분량이 많아 BAC가 희석됩니다.' },
              { icon: '🚻', title: '성별',       desc: '여성은 체수분 비율이 남성보다 낮아 동일 음주량에도 BAC가 높게 나옵니다.' },
              { icon: '🍽️', title: '공복 여부',  desc: '공복 시 알코올 흡수가 최대 20% 빨라져 BAC가 더 높고 빠르게 상승합니다.' },
              { icon: '😴', title: '피로·수면 부족', desc: '간 기능이 저하되어 알코올 분해 속도가 느려집니다.' },
              { icon: '👵', title: '연령',       desc: '노화에 따라 알코올 분해 효소(ALDH·ADH) 활성이 감소합니다.' },
              { icon: '💊', title: '약물 복용',  desc: '일부 약물이 알코올 분해 효소를 방해하거나 부작용을 증폭시킵니다.' },
              { icon: '🫧', title: '탄산 음료 혼합', desc: '탄산이 위 배출을 촉진해 알코올 흡수 속도가 증가할 수 있습니다.' },
              { icon: '🧬', title: '유전적 체질', desc: 'ALDH2 유전자 변이(아시아인 약 40%)는 알코올 분해를 저하시킵니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '18px', marginBottom: '6px' }}>{item.icon}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 다음날 아침 운전 — 한국 단속 최다 케이스 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🌅 다음날 아침에도 알코올이 남는 이유
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            전날 과음한 뒤 <strong style={{ color: 'var(--text)' }}>다음날 아침 출근길</strong>에 단속되는 사례가 적지 않습니다.
            「잠 자고 일어났으니 깼겠지」는 잘못된 통념입니다. 잠을 자도 알코올 분해 속도는 그대로이기 때문입니다.
            본 도구의 「🌅 다음날 아침」 탭에서 원하는 시각의 잔존량을 추정해 볼 수 있습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
            <p style={{ fontSize: 13, color: 'var(--orange-600)', fontWeight: 700, marginBottom: 10 }}>📌 예시: 70kg 남성, 식후, 소주 2병 (약 {Math.round(EX2_GRAMS)}g), 음주 종료 자정(00:00)</p>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              <li>최고 BAC: <strong style={{ color: 'var(--red-600)' }}>{EX2.toFixed(3)}</strong> (면허취소 수준)</li>
              <li>면허취소 기준(0.08) 미만 추정: 익일 <strong>{fmtTimeMin((EX2 - BAC_REVOKE) / EX_DECAY * 60)}</strong></li>
              <li>면허정지 기준(0.03) 미만 추정: 익일 <strong>{fmtTimeMin((EX2 - BAC_SUSPEND) / EX_DECAY * 60)}</strong></li>
              <li>알코올 잔존 추정 종료: 익일 <strong>{fmtTimeMin(EX2 / EX_DECAY * 60)}</strong></li>
              <li>익일 08:00 BAC: <strong style={{ color: 'var(--red-600)' }}>약 {EX2_AT8.toFixed(3)}</strong> (면허정지 기준 0.03의 2배 이상 — 출근길 단속 시 면허정지·형사처벌 수준)</li>
            </ul>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ⚠️ 0.03 미만이라도 측정 시 양성 → 단속 가능. <strong style={{ color: 'var(--red-600)' }}>계산값과 관계없이 음주 후 운전은 금지</strong>입니다.
          </p>
        </div>

        {/* ── 6. 여러 자리 음주 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🔢 1차·2차·3차 누적 음주 위험
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            여러 자리 음주는 BAC 누적이 매우 빠릅니다. 본 도구의 「🔢 여러 자리 누적」 탭에서 곡선 시각화.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>자리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>음주</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--red-600)', fontWeight: 700 }}>알코올</th>
                </tr>
              </thead>
              <tbody>
                {CUMUL_ROWS.map(r => (
                  <tr key={r.label}><td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.label}</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.drinks}</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>약 {Math.round(r.grams)}g</td></tr>
                ))}
                <tr style={{ background: 'rgba(220,38,38,0.06)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--red-600)', fontWeight: 700 }}>합계</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>표준잔 약 {CUMUL_STD}잔 (WHO 과음 기준 60g의 약 {CUMUL_WHO_RATIO}배)</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--red-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>약 {CUMUL_TOTAL_G}g</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            최고 BAC 약 {CUMUL.peakBAC.toFixed(2)}({CUMUL_PEAK_LEVEL}). 0.03 미만 추정 시각은 {fmtTimeMin(CUMUL.suspendClearMin)}, 완전 분해 추정은 {fmtTimeMin(CUMUL.zeroMin)}입니다. 70kg 남성·보통 식사 기준 (시간 흐름 누적 추정).
          </p>
        </div>

        {/* ── 7. ALDH2 결손 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🧬 ALDH2 결손 — 한국인 30~40%
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(155,89,182,0.30)', borderRadius: 'var(--radius-m)', padding: '16px 18px' }}>
            <p style={{ fontSize: 14, color: 'var(--purple-600)', fontWeight: 700, marginBottom: 8 }}>알코올 분해 효소 변이 (Asian flush)</p>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              <li>아세트알데히드(1급 발암물질) 분해가 느려 체내 축적 ↑</li>
              <li>에탄올 분해도 다소 느릴 수 있음 (개인차 큼)</li>
              <li>식도암 위험 5~50배 ↑ (음주량 따라)</li>
              <li>간암·구강암 위험 ↑</li>
            </ul>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.85, marginTop: 12 }}>
              <strong style={{ color: 'var(--purple-600)' }}>특징:</strong> 술 마시면 얼굴 빨개짐 / 심박수 빠르게 ↑ / 두통·구역질 빨리.
              본인이 술에 약한 편이라면 본 도구의 「분해 속도」를 「느림」 또는 「매우 느림」으로 설정 권장.
            </p>
          </div>
        </div>

        {/* ── 8. 자전거·전동킥보드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🚲 자전거·전동킥보드 음주운전
          </h2>
          <div style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.30)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
            <p style={{ fontSize: 13, color: 'var(--red-600)', fontWeight: 700, marginBottom: 8 }}>⚠️ 「자전거니까 괜찮아」 잘못된 통념</p>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              <li>자전거 음주운전 (BAC 0.03+): 범칙금 {fmtManwonWon(BIKE.fine)}, 측정 불응 {fmtManwonWon(BIKE.refusal)} ({fmtLawDate(BIKE.since)} 시행)</li>
              <li>전동킥보드 등 개인형 이동장치: 범칙금 {fmtManwonWon(PM.fine)}, 측정 불응 {fmtManwonWon(PM.refusal)} ({fmtLawDate(PM.since)} 시행) + 운전면허 정지(0.03+)·취소(0.08+)</li>
              <li>사고 발생 시 추가 처벌 (보행자·자동차 모두)</li>
              <li>특히 도심 자전거·킥보드는 보행자 사고 위험 큼</li>
            </ul>
          </div>
        </div>

        {/* ── 9. 약물 + 알코올 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            💊 약물 + 알코올 위험
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>약물</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--red-600)', fontWeight: 700 }}>위험</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>수면제 + 알코올</td><td style={{ padding: '10px 12px', color: 'var(--red-600)' }}>호흡 억제 → <strong>사망 가능성</strong></td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>진통제 (타이레놀)</td><td style={{ padding: '10px 12px', color: 'var(--red-600)' }}>간 손상 (아세트아미노펜)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>항우울제</td><td style={{ padding: '10px 12px', color: 'var(--red-600)' }}>부작용 증폭·과다 진정</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>혈압약</td><td style={{ padding: '10px 12px', color: 'var(--red-600)' }}>저혈압 쇼크 위험</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>당뇨약</td><td style={{ padding: '10px 12px', color: 'var(--red-600)' }}>저혈당 쇼크 위험</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>항알레르기·항생제</td><td style={{ padding: '10px 12px', color: 'var(--orange-600)' }}>졸음·진정 효과 증폭 / 일부 항생제 디설피람 반응</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 복용 중인 약과 알코올의 상호작용은 약사·의사에게 확인하세요. 식품의약품안전처 종합상담센터: 1577-1255
          </p>
        </div>

        {/* ── 10. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 11. 안전 귀가 (강화) ── */}
        <div style={{ background: 'color-mix(in srgb, var(--cyan-600) 7%, transparent)', border: '1px solid color-mix(in srgb, var(--cyan-600) 30%, transparent)', borderRadius: 'var(--radius-card)', padding: '20px 22px' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cyan-600)', marginBottom: '12px' }}>
            🚕 음주 후 운전은 절대 안 됩니다
          </p>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '10px' }}>
            <li><strong style={{ color: 'var(--text)' }}>대리운전</strong>: 대리운전 앱으로 호출</li>
            <li><strong style={{ color: 'var(--text)' }}>음주운전 신고</strong>: 112</li>
            <li><strong style={{ color: 'var(--text)' }}>응급</strong>: 119</li>
            <li><strong style={{ color: 'var(--text)' }}>정신건강 위기상담 (음주 문제 포함)</strong>: 1577-0199</li>
          </ul>
          <p style={{ fontSize: '13px', color: 'var(--cyan-600)', lineHeight: 1.7, fontWeight: 600 }}>
            💡 가장 안전한 방법은 <strong>술자리 시작 전에 미리 대리운전을 예약</strong>하거나 아예 차를 두고 가는 것입니다.
            자가용·자전거·전동킥보드 모두 음주 후 운전 절대 X.
          </p>
        </div>

        {/* 음주운전 처벌·위험 정리 (참고 정보) */}
        <div style={{
          background: 'rgba(220, 38, 38, 0.06)',
          border: '2px solid rgba(220, 38, 38, 0.40)',
          borderRadius: 'var(--radius-m)',
          padding: '18px 20px',
          fontSize: '13px',
          color: 'var(--muted)',
          lineHeight: 1.85,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--red-600)', marginBottom: 10 }}>⚖️ 음주운전 처벌·위험 정리</p>
          <p style={{ marginBottom: 8 }}>
            본 도구는 체내 알코올 잔존량을 <strong style={{ color: 'var(--text)' }}>참고용으로 추정</strong>할 뿐이며, 법적 판단 근거가 되지 않습니다. 다음을 꼭 기억하세요.
          </p>
          <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
            <li>±20~30% 오차 가능 (Widmark 공식 한계)</li>
            <li>음주 측정기 결과와 다를 수 있음</li>
            <li>「0.03 미만 = 안 마신 것」 X</li>
            <li><strong style={{ color: 'var(--red-600)' }}>BAC가 낮게 추정되더라도 음주 후 운전은 금지</strong></li>
            <li>음주 후 운전 절대 X (자가용·자전거·전동킥보드 모두)</li>
            <li>다음날 아침에도 BAC 남아 있을 수 있음</li>
          </ul>
          <p style={{ marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>음주운전 처벌 (도로교통법 제148조의2):</p>
          <ul style={{ paddingLeft: 18, marginBottom: 10 }}>
            <li>BAC 0.03% 이상이면 면허정지·취소</li>
            <li>형사처벌: BAC 구간에 따라 {MAX_PENALTY_TEXT}</li>
            <li>{DRUNK_DRIVING_REPEAT_WINDOW_YEARS}년 안에 다시 위반하면 가중처벌</li>
            <li>사망사고 시 무기징역까지</li>
          </ul>
          <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: 13.5 }}>
            본인과 타인의 생명을 지키는 가장 안전한 방법: <strong style={{ color: 'var(--red-600)' }}>음주 후에는 절대 운전하지 마세요.</strong>
          </p>
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>주요 근거</strong> — 음주운전 처벌 기준: 도로교통공단·경찰청·찾기쉬운 생활법령정보 / 표준잔·위험 음주: NIAAA·WHO / 아세트알데히드·ALDH2·음주 암 위험: 국가암정보센터·WHO IARC. 법령·의학 기준은 개정될 수 있으니 공식 출처를 확인하세요.
          </p>
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/alcohol',  icon: '🍺', name: '알코올 도수 계산기', desc: '혼합 음료 도수·표준 음주량' },
              { href: '/tools/life/dutch',    icon: '🍻', name: '더치페이 계산기',   desc: '술자리 N빵 정산' },
              { href: '/tools/date/dday',     icon: '📅', name: 'D-day 계산기',     desc: '금주 시작일 관리' },
              { href: '/tools/health/bmi',    icon: '⚖️', name: 'BMI 계산기',       desc: '체질량지수·비만도 확인' },
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
    </div>
  )
}
