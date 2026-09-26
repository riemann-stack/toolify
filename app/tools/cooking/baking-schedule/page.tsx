import BakingScheduleClient from './BakingScheduleClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import s from './baking-schedule.module.css'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { generateForwardSchedule, generateBackwardSchedule, calcWaterTemp, fmtDuration, fmtTime, dayDiffLabel } from './bakingUtils'
import { BREAD_PRESETS, TEMP_MULTIPLIERS, MIXING_METHODS, type FermentationMode, type MixingMethod } from './breadPresets'

export const metadata = buildMetadata({
  path: '/tools/cooking/baking-schedule',
  title: '제빵 타임라인 계산기 — 사워도우·바게트·식빵 발효·굽기 일정 자동 생성',
  description:
    '완성 시각만 입력하면 오토리즈·폴딩·발효·굽기 일정을 시간 단위로 역산하는 제빵 스케줄러. 사워도우·바게트·식빵 등 8종 빵별 표준 일정과 실내 온도별 발효 시간 배율까지.',
  keywords: [
    '제빵 타임라인', '빵 굽기 스케줄', '사워도우 일정', '바게트 발효 시간',
    '냉장 발효 계산', '홈베이킹', '제빵 시간 계산', '발효 시간', '오토리즈', '폴딩 간격',
    '치아바타 일정', '식빵 발효', '포카치아', '베이글', '피자 도우', '크루아상',
    '비가', '푸어리쉬', '르방', '제빵 스케줄러',
  ],
})

const FAQ_LD = [
              {
                q: '발효 시간을 정확히 지키면 빵이 잘 나올까요?',
                a: '시간은 가이드일 뿐, 가장 중요한 건 <strong>반죽 상태</strong>입니다. 같은 시간이라도 실내 온도, 밀가루, 이스트·르방 활성도에 따라 결과가 다릅니다. 본 도구의 일정은 대략적인 시간 기준이며, 최종 판단은 <strong>부피 50~70% 증가, 큰 기포 형성, 손가락 테스트</strong>로 하세요. 시간 의존이 아닌 관찰·경험 기반으로 갈수록 빵 품질이 좋아집니다.',
              },
              {
                q: '사워도우 냉장 발효는 몇 시간이 가장 좋나요?',
                a: '일반적으로 <strong>8~16시간</strong>이 가장 인기 있는 범위입니다 — 8시간(가벼운 풍미·적당한 산미), <strong>12시간(표준, 균형)</strong>, 16시간(깊은 풍미·강한 산미), 24시간+(매우 깊지만 산미 호불호). 르방 활성도와 1차 발효 정도에 따라 조정하세요. 본 도구의 사워도우 일정도 냉장 발효를 12시간(허용 범위 8~24시간)으로 잡습니다. 처음에는 12시간으로 시작해 다음에 가감하는 것을 권장합니다.',
              },
              {
                q: '실내 온도 28℃ 여름에 빵을 만들려면?',
                a: '여름 한국 실내(26~30℃)는 발효가 매우 빠릅니다. ① <strong>냉장 발효 적극 활용</strong>(1차 또는 2차) ② 시간 단축(표준의 60~70%) ③ 차가운 물 사용(얼음물 가능) ④ 실내 시원한 위치(욕실·북향 방) ⑤ 자주 부피 확인(1시간 간격) ⑥ 이스트 양 30~50% 줄이기(예: 1% → 0.5%, 르방은 비율 20% → 10% 식으로 감량). 또는 여름엔 무발효 빵(스콘·머핀)으로 전환하는 것도 방법입니다.',
              },
              {
                q: '오토리즈는 꼭 해야 하나요?',
                a: '필수는 아니지만 <strong>권장</strong>되는 단계입니다. 효과: 글루텐 자동 형성(치대기 시간 단축), 수분 흡수 향상(부드러운 빵), 풍미 발달, 작업 시간 절약. 30분~1시간이면 충분하며, <strong>사워도우·바게트·치아바타</strong> 등 고수분 빵에 특히 효과적입니다. 식빵·베이글 등 저수분 빵은 오토리즈 없이도 큰 차이 없습니다.',
              },
              {
                q: '빵 완성 시간을 정확히 맞추려면?',
                a: '본 도구의 [완성 시간 역산] 탭을 활용하세요. 다만 분 단위로 맞추기는 어렵습니다 — 같은 온도라도 르방·이스트 활성도와 밀가루에 따라 발효가 앞당겨지거나 늦어지기 때문입니다. 팁: <strong>완성 시간보다 30분~1시간 여유 있게 시작</strong>, 발효 종료 직전 자주 확인, 발효는 끝났는데 굽기 못하면 냉장고에 임시 보관, 굽기 30분 전 오븐 예열 시작. 여러 번 만들어 자기 환경에 맞는 시간을 알아가는 것이 가장 정확합니다.',
              },
              {
                q: '권장 물 온도가 50℃ 이상이거나 영하로 나오면 어떻게 하나요?',
                a: '공식(목표 반죽 온도×3 또는 ×4에서 실내·밀가루·르방 온도와 마찰열을 빼는 계산)이 현실적인 범위를 벗어났다는 뜻입니다. 본 도구는 <strong>50℃ 이상이면 효모 사멸 위험</strong>, <strong>−5℃ 미만이면 불가능</strong>으로 경고합니다. 겨울에 물이 너무 뜨겁게 나오면 밀가루를 미리 실내에 꺼내 두거나 반죽을 따뜻한 곳(오븐 전구·발효기)에서 하고, 목표 반죽 온도를 1~2℃ 낮춰 발효 시간을 늘리는 편이 안전합니다. 여름에 영하가 나오면 밀가루를 냉장 보관했다가 쓰고, 얼음물을 무게로 계량해 넣거나 고속 믹서 대신 손반죽·저속 믹싱으로 마찰열을 줄이세요.',
              },
              {
                q: '자는 시간에 성형·굽기가 걸리면 어떻게 조정하나요?',
                a: '본 도구는 수면 시간(기본 22:00~07:00)에 폴딩·성형·굽기처럼 손이 가는 단계가 겹치면 경고합니다. 1차·2차 발효, 벤치 타임, 식히기처럼 기다리기만 하는 단계는 경고 대상이 아닙니다. 해결책은 두 가지입니다 — ① 완성 시각을 옮겨 능동 단계를 깨어 있는 시간으로 밀어내기, ② 발효 방식을 <strong>냉장 2차 발효</strong>나 <strong>냉장 1차 + 다음날 성형</strong>으로 바꿔 긴 냉장 단계가 밤을 덮게 하기. 냉장 발효는 온도 배율을 받지 않으므로 실내 온도가 달라져도 밤 사이 길이가 크게 변하지 않습니다.',
              },
            ]

/* ── 가이드 표·예시 — 도구의 실제 계산 함수(bakingUtils)로 빌드 시 생성 ── */
const presetOf = (id: string) => BREAD_PRESETS.find(p => p.id === id)!
const stepMin = (id: string, stepId: string) => presetOf(id).steps.find(st => st.id === stepId)?.minutes ?? 0
const SD_BULK = stepMin('sourdough', 'bulk')
const WB_BULK = stepMin('whitebread', 'bulk')
const WB_PROOF = stepMin('whitebread', 'final-proof')

// 기준일은 표시용 — 총 소요 시간은 날짜와 무관
const BASE = new Date(2026, 0, 10, 8, 0)
const totalOf = (id: string, mode: FermentationMode, temp: number): string => {
  const r = generateForwardSchedule(id, BASE, mode, temp)
  return r && r.fermentationMode === mode ? fmtDuration(r.totalMinutes) : '미지원'
}
const TOTAL_ROWS = BREAD_PRESETS.map(p => ({
  id: p.id, name: p.name, difficulty: p.difficulty,
  sameday: totalOf(p.id, 'sameday', 22),
  coldFinal: totalOf(p.id, 'cold-final', 22),
  coldFinal26: totalOf(p.id, 'cold-final', 26),
}))

// 역산 예시 — 사워도우 · 냉장 2차 발효 · 22℃ · 다음날 10:00 완성
const EX_END = new Date(2026, 0, 11, 10, 0)
const EX = generateBackwardSchedule('sourdough', EX_END, 'cold-final', 22)!
const EX26 = generateBackwardSchedule('sourdough', EX_END, 'cold-final', 26)!
const EX_KEY_STEPS = new Set(['autolyse', 'mix', 'bulk', 'shape', 'cold-proof', 'preheat', 'bake', 'cool'])
const EX_ROWS = EX.steps.filter(st => EX_KEY_STEPS.has(st.id))
const dayLabel = (d: Date) => dayDiffLabel(EX.startTime, d) ?? '당일'

// 물 온도(DDT) 예시 — calcWaterTemp와 각 빵의 권장 반죽 온도(ddtTargetC)
const frictionOf = (m: MixingMethod) => MIXING_METHODS.find(x => x.id === m)!
const DDT_CASES: { label: string; presetId: string; room: number; mixing: MixingMethod }[] = [
  { label: '사워도우 · 봄가을', presetId: 'sourdough', room: 22, mixing: 'hand' },
  { label: '사워도우 · 한여름', presetId: 'sourdough', room: 28, mixing: 'hand' },
  { label: '바게트 · 난방 약한 겨울', presetId: 'baguette', room: 18, mixing: 'hand' },
  { label: '식빵 · 한여름', presetId: 'whitebread', room: 28, mixing: 'mixer' },
]
const DDT_ROWS = DDT_CASES.map(c => {
  const p = presetOf(c.presetId)
  const target = p.ddtTargetC ?? 25
  const levain = !!p.hasLevain
  const r = calcWaterTemp({ targetDoughC: target, flourTempC: c.room, roomTempC: c.room, levainTempC: c.room, hasLevain: levain, mixingMethod: c.mixing })
  return { ...c, target, levain, water: r.waterTempC, friction: r.friction, advice: r.advice }
})

export default function BakingSchedulePage() {
  return (
    <ToolPage width={880} slug="/tools/cooking/baking-schedule">
      <h1 className="tp-h1">
        <ToolIconBadge catId="cooking" />제빵 타임라인 계산기
      </h1>
      <p className="tp-lead">
        완성 시각만 알려주세요. <strong style={{ color: 'var(--text)' }}>오토리즈·폴딩·발효·굽기 일정을 시간 단위로 역산</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="22℃ 표준 일정 × 실내 온도 배율(발효 단계만) · 물 온도는 DDT 공식(목표 반죽 온도×3 또는 ×4 − 실내·밀가루·발효종 온도 − 마찰열)"
        sources={[
          { label: 'King Arthur Baking — Dough Temperature', href: 'https://www.kingarthurbaking.com/pro/reference/dough-temperature' },
          { label: 'King Arthur Baking — Friction factor', href: 'https://www.kingarthurbaking.com/blog/2018/08/27/determining-the-friction-factor-in-baking' },
        ]}
      />

      <BakingScheduleClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 제빵 단계 가이드 */}
        <section>
          <h2 className="g-h2">제빵 단계 가이드</h2>
          <p className="g-p">
            대부분의 빵은 다음 8단계로 구성됩니다 (빵 종류에 따라 가감):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '① 오토리즈 (Autolyse, 30분~1시간)', desc: '밀가루 + 물만 미리 섞어 휴지. 글루텐이 자동 형성되어 본반죽 시간 단축, 수분 흡수 향상, 풍미 발달.' },
              { step: '② 본반죽 (Mixing)', desc: '소금·이스트(또는 르방) 투입. 5~15분 치대기 또는 폴딩 시작.' },
              { step: '③ 폴딩 (Stretch & Fold, 30분 간격 4~6회)', desc: '손이나 주걱으로 반죽을 접어 글루텐 강화. 사워도우·치아바타·포카치아 등 고수분 빵 핵심.' },
              { step: '④ 1차 발효 (Bulk Fermentation, 1~6시간)', desc: '⭐ 부피 50~70% 증가 + 큰 기포 형성이 기준. 가장 큰 시간 변수 (온도 의존).' },
              { step: '⑤ 분할·예비 성형·벤치 타임', desc: '분할 후 둥글리기 → 휴지 (15~30분). 글루텐 이완.' },
              { step: '⑥ 본 성형 (Final Shape)', desc: '빵 모양 만들기. 표면 텐션 유지가 핵심.' },
              { step: '⑦ 2차 발효 (Final Proof, 30분~24시간)', desc: '⭐ 손가락 자국이 천천히 회복되면 완료. 실온 30~60분 또는 냉장 8~24시간.' },
              { step: '⑧ 굽기 (Baking)', desc: '오븐 예열 30~45분(250℃ 추천). 굽기 20~40분. 첫 5~10분 스팀.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px', fontFamily: 'var(--font-sans)' }}>{s.step}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 발효 방식 비교 */}
        <section>
          <h2 className="g-h2">발효 방식 비교</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['방식', '시간', '풍미', '추천 빵'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['당일 발효 (실온)', '4~6시간',  '가벼움',     '식빵·포카치아'],
                  ['냉장 1차 발효',  '8~12시간', '깊음',        '사워도우·바게트'],
                  ['냉장 2차 발효 ⭐','8~24시간', '깊음·일정 유연', '사워도우·피자 도우'],
                  ['비가/푸어리쉬', '12~16시간 (전날)', '매우 깊음', '바게트·치아바타'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            계산기에서 발효 방식을 바꾸면 빵별 표준 일정의 단계가 실제로 이렇게 바뀝니다. <strong>당일 발효</strong>는 냉장 단계를 빼고, 성형 뒤 냉장 발효가 있던 빵(사워도우)은 그 자리를 실온 2차 발효 2시간 30분으로 채웁니다.
            <strong> 냉장 1차 발효</strong>는 실온 1차 발효를 냉장 10시간(허용 8~12시간)으로, <strong>냉장 2차 발효</strong>는 성형 뒤 실온 2차 발효를 냉장 12시간(허용 8~24시간)으로 바꿉니다. 단, 표준 일정에 이미 냉장·장시간 발효 단계가 있는 사워도우·피자·치아바타·크루아상은 이 방식을 골라도 표준 일정 그대로 계산됩니다.
            <strong> 냉장 1차 + 다음날 성형</strong>은 1차 발효를 냉장 8시간으로 옮겨 전날 저녁 반죽, 다음날 아침 성형·굽기 흐름을 만듭니다.
            치아바타는 전날 만드는 비가가, 크루아상은 버터 층을 지키는 냉장 휴지가 필수라 당일 발효 일정은 만들 수 없습니다.
          </p>
        </section>

        {/* 3. 온도와 발효 시간 — TEMP_MULTIPLIERS에서 생성 */}
        <section>
          <h2 className="g-h2">온도와 발효 시간</h2>
          <p className="g-p">
            모든 빵의 표준 일정은 <strong>실내 22℃</strong> 기준입니다. 계산기는 실내 온도를 받아 <strong>1차·2차 발효처럼 온도에 민감한 단계에만</strong> 아래 배율을 곱하고, 오토리즈·폴딩·성형·예열·굽기·식히기와 냉장 발효 시간은 그대로 둡니다.
            입력한 온도와 가장 가까운 2℃ 단위 기준값을 쓰며, 19·21·23℃처럼 딱 가운데 값은 낮은 쪽 기준(더 긴 시간)을 적용합니다. 아래 표의 발효 시간은 실제 표준 일정의 사워도우 1차 발효({SD_BULK}분)와 식빵 1차({WB_BULK}분)·2차({WB_PROOF}분)에 배율을 곱해 반올림한 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['실내 온도', '시간 배율', '사워도우 1차', '식빵 1차 · 2차', '안내'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEMP_MULTIPLIERS.map((t, i) => (
                  <tr key={t.temp} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.temp}℃</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>×{t.multiplier}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{fmtDuration(Math.round(SD_BULK * t.multiplier))}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{fmtDuration(Math.round(WB_BULK * t.multiplier))} · {fmtDuration(Math.round(WB_PROOF * t.multiplier))}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{t.warning.replace(/^⚠️\s*/, '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            한국 계절별 실내 온도 참고: 겨울(난방 약함) 16~20℃ · 봄/가을 20~24℃ · 여름 26~30℃ · 여름 에어컨 24~26℃. 배율은 실내 공기 온도 기준이라, 반죽 자체 온도가 목표보다 1~2℃만 달라도 실제 발효 속도는 표보다 더 벌어질 수 있습니다 — 아래 물 온도 계산으로 반죽 온도부터 맞추는 이유입니다.
          </p>
        </section>

        {/* 3-1. 계산 예시 — 역산 (generateBackwardSchedule) */}
        <section>
          <h2 className="g-h2">완성 시각 역산은 이렇게 계산됩니다</h2>
          <p className="g-p">
            [완성 시간 역산] 탭은 선택한 빵의 단계 시간을 모두 더한 뒤(발효 단계는 온도 배율 적용) 완성 시각에서 그만큼 거슬러 올라가 시작 시각을 정합니다. [시작 시간 기준] 탭은 같은 합계를 시작 시각에 더할 뿐이라 두 탭의 단계 순서와 길이는 항상 같습니다.
            예를 들어 <strong>사워도우 · 냉장 2차 발효 · 실내 22℃ · 다음날 오전 10시 완성</strong>(식히기 포함)으로 넣으면 총 {fmtDuration(EX.totalMinutes)}이 걸려 <strong>전날 {fmtTime(EX.startTime)}</strong>에 오토리즈를 시작하라는 일정이 나옵니다. 아래 표는 그 결과의 주요 단계입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단계', '시작', '끝', '소요'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EX_ROWS.map((st, i) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{st.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{dayLabel(st.startTime)} {fmtTime(st.startTime)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{dayLabel(st.endTime)} {fmtTime(st.endTime)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmtDuration(st.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            1차 발효가 저녁에 끝나고 냉장 발효 12시간이 밤을 통째로 덮기 때문에, 자는 동안 손댈 일이 없는 일정입니다. 같은 조건에서 실내가 26℃라면 1차 발효만 짧아져 총 {fmtDuration(EX26.totalMinutes)}, 시작은 {fmtTime(EX26.startTime)}로 늦춰집니다.
            냉장 발효 시간은 온도 배율을 받지 않으므로 여름·겨울 차이는 거의 1차 발효 길이에서만 생긴다는 점을 기억하세요.
            굽는 날 아침 일정이 빠듯하면 냉장 발효를 8~24시간 범위 안에서 늘리거나 줄여 완성 시각을 조정하는 것이 가장 손쉬운 방법입니다.
          </p>
        </section>

        {/* 4. 빵별 표준 일정 */}
        <section>
          <h2 className="g-h2">8가지 빵별 표준 일정</h2>
          <p className="g-p">
            아래 흐름은 계산기에 들어 있는 빵별 표준 일정의 요약입니다. 총 소요 시간은 오븐 예열과 식히기까지 포함해 계산기가 실제로 내놓는 값을 표로 정리했습니다(오토리즈 등 선택 단계 포함).
            당일 발효가 짧아 보여도 반죽 온도·실내 온도를 못 맞추면 1차 발효에서 한두 시간이 쉽게 늘어나니, 처음 굽는 빵은 표보다 1시간 정도 여유를 두세요.
          </p>
          <div className="tableScroll" style={{ marginBottom: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['빵', '난이도', '당일 발효 22℃', '냉장 발효 일정 22℃', '냉장 발효 일정 26℃'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOTAL_ROWS.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.difficulty}</td>
                    <td style={{ padding: '10px 12px', color: r.sameday === '미지원' ? 'var(--muted)' : 'var(--text)', whiteSpace: 'nowrap' }}>{r.sameday}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.coldFinal}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.coldFinal26}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            &lsquo;냉장 발효 일정&rsquo;은 계산기에서 <strong>냉장 2차 발효</strong>를 골랐을 때의 총 소요 시간입니다. 바게트·식빵·포카치아·베이글은 실온 2차 발효가 냉장 12시간으로 바뀐 값이고, 사워도우(성형 후 냉장)·피자(1차 냉장 숙성)·치아바타(전날 비가)·크루아상(냉장 휴지)은 원래 들어 있는 냉장·장시간 단계를 그대로 쓴 표준 일정입니다.
          </p>
          <div className={s.guideGrid2} style={{ gap: '8px' }}>
            {[
              { icon: '🌾', name: '사워도우',  desc: '오토리즈 30분 → 폴딩 4회 → 1차 발효 3시간 → 성형 → 냉장 12시간(8~24시간) → 굽기' },
              { icon: '🥖', name: '바게트',     desc: '오토리즈 → 폴딩 2회 → 1차 발효 1.5시간 → 성형 → 2차 발효 1시간 → 굽기' },
              { icon: '🥪', name: '치아바타',  desc: '비가 전날 → 본반죽 → 폴딩 3회 → 1차 발효 2시간 → 분할 → 2차 발효 → 굽기' },
              { icon: '🍞', name: '식빵 — 입문', desc: '반죽·치대기 → 1차 발효 1시간 → 분할·성형 → 2차 발효 50분 → 굽기' },
              { icon: '🫓', name: '포카치아',   desc: '반죽 → 폴딩 2회 → 1차 발효 2시간 → 팬 → 2차 발효 45분 → 토핑 → 굽기' },
              { icon: '🥯', name: '베이글',     desc: '반죽·치대기 → 1차 발효 1시간 → 성형 → 2차 발효 30분 → 끓이기 → 굽기' },
              { icon: '🍕', name: '피자 도우', desc: '반죽·치대기 → 1차 실온 1시간 → 냉장 24시간(12~48시간) → 실온 1시간 → 분할·펴기 → 토핑·굽기' },
              { icon: '🥐', name: '크루아상',  desc: '반죽 → 냉장 휴지 → 버터 봉입·3절 접기 3회 → 냉장 12시간(8~16시간) → 재단 → 2차 발효 2시간 → 굽기' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{b.icon} {b.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 물 온도(DDT) — calcWaterTemp로 생성 */}
        <section>
          <h2 className="g-h2">반죽 물 온도 계산 (DDT 공식)</h2>
          <p className="g-p">
            발효 시간표가 맞으려면 반죽을 다 섞었을 때의 온도(목표 반죽 온도, DDT)가 빵별 권장값에 들어와야 합니다. 밀가루·실내·발효종 온도는 바꾸기 어려우니 <strong>물 온도로 맞추는 것</strong>이 기본 원리입니다.
            계산기는 이스트 반죽이면 <strong>물 온도 = 목표 반죽 온도 × 3 − 밀가루 온도 − 실내 온도 − 마찰열</strong>, 르방·비가처럼 발효종을 넣는 반죽이면 × 4로 곱하고 발효종 온도까지 뺍니다.
            마찰열(마찰 계수)은 반죽하면서 생기는 열을 공식에 반영하는 보정값으로, 계산기는 손반죽 {frictionOf('hand').friction}℃ · 스탠드믹서 {frictionOf('mixer').friction}℃ · 고속 스파이럴 {frictionOf('highspeed').friction}℃를 도구 자체의 평균 가정값으로 씁니다. 이 값은 참고 자료마다 다르고, 손반죽은 이보다 작은 3~4℃ 안팎으로 잡는 자료도 있으므로 아래처럼 내 반죽으로 한 번 역산해 보는 것이 가장 정확합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상황', '목표 반죽 온도', '실내·밀가루', '반죽 방식', '권장 물 온도'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DDT_ROWS.map((r, i) => (
                  <tr key={r.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.label}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.target}℃ (×{r.levain ? 4 : 3})</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r.room}℃{r.levain ? ' · 르방 같은 온도' : ''}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{frictionOf(r.mixing).name} (+{r.friction}℃)</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.water}℃</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            첫 줄을 풀어 쓰면 25 × 4 − 22(밀가루) − 22(실내) − 22(르방) − 6(손반죽) = 28℃입니다. 같은 사워도우라도 한여름 28℃ 부엌에서는 물을 10℃ 안팎으로 차게 써야 하고, 난방이 약한 겨울 바게트는 30℃ 정도의 미지근한 물이 필요합니다.
            마찰열은 믹서 기종·속도·반죽 양에 따라 크게 달라지므로, 한 번 반죽한 뒤 온도계로 실제 반죽 온도를 재서 <strong>실제 반죽 온도 × 3 − 밀가루 − 실내 − 사용한 물 온도</strong>로 내 도구의 마찰열을 역산해 두면 다음부터 오차가 줄어듭니다.
            물 온도가 45℃를 넘게 나오면 이스트가 약해질 수 있으니 이스트나 르방을 따로 미지근한 물에 풀어 넣는 편이 안전합니다.
          </p>
        </section>

        {/* 6. 반죽 상태 판단 */}
        <section>
          <h2 className="g-h2">반죽 상태 판단 — 시간보다 중요</h2>
          <Callout tone="tip" title="시간표는 22℃ 표준 기준 가이드입니다">
            실제 발효는 실내 온도, 밀가루, 이스트·르방 활성도, 수분율에 따라 크게 달라지므로 <strong>반죽 상태를 함께 확인</strong>하세요. 아래 신호가 시간표보다 우선합니다.
          </Callout>
          <div className={s.guideGrid2} style={{ gap: '10px' }}>
            {[
              { title: '1차 발효 완료 신호', items: ['부피 50~70% 증가', '큰 기포 형성 (표면·내부)', '부드럽고 가벼운 느낌', '손가락 자국 천천히 회복'] },
              { title: '2차 발효 완료 신호', items: ['부피 1.5배 증가', '손가락 자국 살짝 남기', '표면 매끄럽고 윤기'] },
              { title: '글루텐 충분 (윈도우 페인)', items: ['반죽 작은 조각 양손으로 늘리기', '찢어지지 않고 얇은 막 → OK', '찢어짐 → 더 치대기'] },
              { title: '⚠️ 과발효 신호', items: ['부피 2배 이상', '큰 기포 터짐', '시큼한 냄새', '반죽 무너짐 → 즉시 굽거나 폐기'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>{g.title}</p>
                <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                  {g.items.map(it => <li key={it}>· {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 흔한 실수 */}
        <section>
          <h2 className="g-h2">흔한 실수와 해결법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { problem: '1차 발효 부족', signal: '빵 부피 작음, 무거움',         fix: '시간 더 주거나 따뜻한 곳' },
              { problem: '1차 발효 과다', signal: '빵 무너짐, 시큼한 맛',          fix: '다음에 시간 단축, 온도 낮춤' },
              { problem: '2차 발효 부족', signal: '빵 갈라짐, 모양 안 잡힘',       fix: '시간 더 주기' },
              { problem: '2차 발효 과다', signal: '빵 표면 주저앉음',              fix: '즉시 굽기' },
              { problem: '오븐 예열 부족', signal: '굽기 색·구조 안 좋음',         fix: '250℃ 30분 이상 예열, 온도계로 확인' },
            ].map((it, i) => (
              <div key={i} className={s.guideGrid3} style={{ gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
                <span style={{ color: 'var(--red-600)', fontWeight: 700 }}>{it.problem}</span>
                <span style={{ color: 'var(--text)' }}>{it.signal}</span>
                <span style={{ color: 'var(--muted)' }}>→ {it.fix}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div className={s.guideGrid2} style={{ gap: '8px' }}>
            {[
              { href: '/tools/cooking/baker-percent',    icon: '🥖', name: '베이커 퍼센트 계산기',    desc: '제빵 배합비·수분율·르방 자동' },
              { href: '/tools/cooking/sourdough',        icon: '🍞', name: '사워도우 스타터 계산기',  desc: '르방 안정화·피크 시간 예측' },
              { href: '/tools/cooking/recipe',           icon: '📐', name: '레시피 비율 계산기',       desc: '인분 수에 맞춰 재료 환산' },
              { href: '/tools/cooking/thawing',          icon: '🧊', name: '해동 시간 계산기',    desc: '식품 두께·무게 기반 해동' },
              { href: '/tools/cooking/serving',          icon: '🍽️', name: '1인분 분량 계산기',         desc: '재료별 인분 분량' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 className="g-h2">참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>Tartine Bread</strong> by Chad Robertson — 사워도우 클래식</li>
            <li><strong style={{ color: 'var(--text)' }}>Flour Water Salt Yeast</strong> by Ken Forkish — 홈베이킹 기본서</li>
            <li><strong style={{ color: 'var(--text)' }}>The Bread Baker&apos;s Apprentice</strong> by Peter Reinhart — 제빵 기술 종합</li>
          </ul>
        </section>

      </div>
    </ToolPage>
  )
}
