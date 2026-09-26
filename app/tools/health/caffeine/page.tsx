import Link from 'next/link'
import CaffeineClient from './CaffeineClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/health/caffeine',
  title: '카페인 잔존량 트래커 — 반감기 5시간 + 수면 영향·일일 권장량 (mg)',
  description:
    '지금 체내 카페인 mg과 취침 시 잔존량을 반감기 5h 모델로 실시간 추적. 24+ 한국 음료 + FDA 400mg 권장량과 흡연·임신 보정.',
  keywords: [
    '카페인 계산기', '카페인 잔존량', '카페인 반감기', '카페인 수면 영향',
    '아메리카노 카페인', '콜드브루 카페인', '에너지드링크 카페인', '레드불 카페인',
    '몬스터 카페인', '핫식스 카페인', '녹차 카페인', '콜라 카페인',
    'FDA 카페인 400mg', '임산부 카페인 200mg', '카페인 권장량',
    '카페인 트래커', '카페인 일일 섭취량', 'CYP1A2', '카페인 대사',
  ],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const numCell: React.CSSProperties = { ...cell, textAlign: 'right', whiteSpace: 'nowrap' }
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const note: React.CSSProperties = { fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }

/* ── 본문 표·예시 수치: CaffeineClient의 remainAtTime(지수 감쇠)과 같은 모델로 빌드 시점에 계산 ──
   잔존(mg) = 섭취량 × 0.5^(경과 시간 ÷ 반감기). 반감기 값은 CaffeineClient HALF_LIFE_PRESETS와 동일 */
const remain = (dose: number, hours: number, half: number) => dose * Math.pow(0.5, hours / half)
const HALF_LIFE_ROWS = [
  { label: '흡연자', half: 3 },
  { label: '빠른 대사·청소년', half: 4 },
  { label: '보통 (기본값)', half: 5 },
  { label: '느린 대사', half: 6.5 },
  { label: '경구 피임약 복용', half: 9 },
  { label: '임신 후기', half: 12 },
]
const EX_DOSE = 150 // 아메리카노 Tall
const hhmm = (hoursAfter14: number) => {
  const total = Math.round((14 + hoursAfter14) * 60)
  const d = Math.floor(total / 1440)
  const m = total % 1440
  return `${d > 0 ? '다음날 ' : ''}${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}
const HALF_LIFE_TABLE = HALF_LIFE_ROWS.map(r => ({
  ...r,
  at18: Math.round(remain(EX_DOSE, 4, r.half)),
  at23: Math.round(remain(EX_DOSE, 9, r.half)),
  at07: Math.round(remain(EX_DOSE, 17, r.half)),
  below30: hhmm(r.half * Math.log2(EX_DOSE / 30)),
}))
const AT23_NORMAL = HALF_LIFE_TABLE.find(r => r.half === 5)!.at23
const AT23_PREG = HALF_LIFE_TABLE.find(r => r.half === 12)!.at23
const AT07_PREG = HALF_LIFE_TABLE.find(r => r.half === 12)!.at07

/* '지금 더 마셔도 되는 양' 역산 예시 — CaffeineClient maxAddableForSafe와 같은 식
   추가 가능량 = min(오늘 남은 한도, (기준치 − 취침 시 잔존) ÷ 0.5^(지금→취침 시간 ÷ 반감기)) */
const HOURS_TO_BED = 8.5 // 15:00 → 23:30
const DECAY_TO_BED = Math.pow(0.5, HOURS_TO_BED / 5)
const addable = (threshold: number, bedBody: number, headroom: number) =>
  Math.round(Math.min(headroom, Math.max(0, (threshold - bedBody) / DECAY_TO_BED)))
const EX_A = [30, 50, 100].map(t => addable(t, 0, 400))
const EX_B_BED = remain(225, 14.5, 5) // 09:00 Grande 225mg → 23:30 잔존
const EX_B = [30, 50, 100].map(t => addable(t, EX_B_BED, 400 - 225))

const FAQ_LD = [
  { q: '디카페인 커피는 정말 카페인이 없나요?', a: '아니요, 한 잔에 보통 수 mg~15mg 정도 남습니다(본 도구 프리셋은 Tall 10mg). EU는 원두 기준 잔류 카페인 0.1% 이하처럼 <strong>잔류량</strong>으로 디카페인을 정의하지만, 한국은 그동안 원두의 카페인을 <strong>90% 이상 제거</strong>하면 디카페인 표시가 가능해 원두에 따라 잔류량 차이가 컸습니다. 식약처는 2026년 5월 표시기준을 개정해 <strong>2028년 1월 1일부터</strong> 원두 기준 잔류 카페인 0.1% 이하 제품만 디카페인으로 표시하도록 했습니다. 임신 중이거나 카페인에 매우 민감하다면 디카페인도 늦은 오후 이후에는 양을 확인하세요.' },
  { q: '콜드브루가 아메리카노보다 카페인이 많나요?', a: '브랜드마다 다릅니다. 한국소비자원이 2018년 커피전문점·편의점 테이크아웃 커피를 조사했을 때 1잔 평균이 <strong>아메리카노 125mg(75~202mg), 콜드브루 212mg(116~404mg)</strong>으로 콜드브루 쪽이 높았지만, 스타벅스처럼 같은 크기에서 콜드브루 표시값이 아메리카노보다 낮은 곳도 있습니다. 콜드브루는 찬물로 오래 우린 원액을 얼마나 희석하느냐에 따라 편차가 가장 큰 음료라, 본 도구 프리셋(Tall 195mg)은 평균적인 추정치로 보고 매장 영양정보가 있으면 「직접 입력」으로 바꿔 넣는 것이 정확합니다.' },
  { q: '카페인 마지노선 = “취침 6시간 전”이 진짜?', a: `2013년 Journal of Clinical Sleep Medicine에 실린 연구(Drake 외)에서 <strong>취침 6시간 전에 마신 400mg 카페인도 수면을 1시간 넘게 줄였다</strong>고 보고했습니다. 본 도구의 모델로는 14:00에 아메리카노 150mg → 23:00 취침 시 잔존 약 ${AT23_NORMAL}mg(가벼운 영향 가능 수준)입니다. 반감기가 긴 경우(피임약·임신) 같은 시각에도 ${AT23_PREG}mg까지 남으므로, 이런 경우엔 8~12시간 전부터 끊는 편이 안전합니다.` },
  { q: '카페인 내성·금단이 진짜 있나요?', a: '둘 다 있습니다. 매일 비슷한 양을 마시면 각성 효과에 내성이 생겨 「마셔도 안 깬다」고 느끼기 쉽습니다. 갑자기 끊으면 보통 <strong>12~24시간 뒤</strong> 두통·피로·집중력 저하·짜증 같은 금단 증상이 시작해 1~2일째 가장 심하고, 사람에 따라 2~9일까지 이어질 수 있습니다. 줄이고 싶다면 며칠 간격으로 하루 섭취량을 조금씩 줄이는 방식이 금단 증상을 덜 겪습니다.' },
  { q: '“커피 낮잠(Coffee Nap)”이 효과 있다는 게 진짜?', a: '소규모 연구에서 효과가 보고된 방법입니다. 커피를 빠르게 마시고 곧바로 15~20분 짧게 자면, 카페인이 흡수돼 효과가 나기 시작할 무렵 깨어나 졸음이 덜하다는 원리입니다. 졸음운전 시뮬레이션 연구에서 카페인 단독·낮잠 단독보다 나았다는 결과가 있지만 표본이 작습니다. 30분 넘게 자면 깊은 수면에 들어가 오히려 더 멍해질 수 있습니다.' },
  { q: '임산부 200mg은 어느 정도인가요?', a: '아메리카노 Tall(150mg) 1잔에 녹차 1잔을 더한 정도이며, <strong>Grande(225mg) 1잔이면 이미 넘습니다</strong>. 임신 중에는 반감기가 10~15시간으로 길어져 같은 양도 오래 남습니다(수유 중에는 출산 후 보통 수준으로 회복). 본 도구에서 반감기 「임신 중」과 일일 기준 「임산부·수유부」를 고르면 반영됩니다. 차·콜라·초콜릿, 일부 복합 진통제·감기약에도 카페인이 들어 있어 합산에 주의하세요. 식약처 기준(300mg)은 ACOG(200mg 미만)보다 높으니 담당 의사의 안내를 우선하세요.' },
  { q: '먹는 약 때문에 카페인이 더 오래 남을 수 있나요?', a: '네. 카페인을 분해하는 간 효소 CYP1A2를 억제하는 약을 먹으면 반감기가 크게 늘 수 있습니다. 대표적으로 항우울제 <strong>플루복사민</strong>, 항생제 <strong>시프로플록사신</strong> 등이 알려져 있고, 경구 피임약도 반감기를 늘립니다. 본 도구의 반감기 선택지는 이런 약물 효과를 정확히 반영하지 못하므로, 해당 약을 복용 중이면 「느린 대사」 이상을 고르고 약사에게 카페인 섭취량을 확인하세요.' },
  { q: '마시자마자 그래프가 최대로 올라가는데, 실제로도 바로 최고치인가요?', a: '아닙니다. 카페인은 마신 뒤 약 45분 안에 대부분 흡수되고 혈중 농도는 보통 15분~2시간 사이에 최고치에 이릅니다. 본 도구는 계산을 단순하게 하려고 <strong>마신 순간 전량이 흡수된다</strong>고 가정하므로, 마신 직후 1시간 정도는 현재 잔존량이 실제보다 약간 높게 표시됩니다. 몇 시간 뒤인 취침 시각 추정에는 이 차이가 거의 영향을 주지 않습니다.' },
]

export default function CaffeinePage() {
  return (
    <ToolPage width={880} slug="/tools/health/caffeine">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />카페인 잔존량 트래커
      </h1>
      <p className="tp-lead">
        지금 체내 카페인 mg과 <strong style={{ color: 'var(--text)' }}>취침 시 잔존량</strong>을 반감기 5h로 실시간 추적. 24+ 한국 음료 프리셋.
      </p>

      <UpdatedMeta date="2026년 9월" basis="반감기 지수감쇠 모델(기본 5시간, 3~12시간 선택) · 1일 한도 성인 400mg(FDA·식약처)·임산부 200mg(ACOG)·어린이·청소년 체중 1kg당 2.5mg(식약처)" sources={[{ label: 'FDA — 카페인 섭취 안내', href: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much' }, { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' }, { label: 'ACOG — 임신 중 카페인', href: 'https://www.acog.org/womens-health/experts-and-stories/ask-acog/how-much-coffee-can-i-drink-while-pregnant' }, { label: 'EFSA — 카페인 안전성', href: 'https://www.efsa.europa.eu/en/topics/topic/caffeine' }, { label: 'Drake 외 2013 (J Clin Sleep Med)', href: 'https://jcsm.aasm.org/doi/10.5664/jcsm.3170' }, { label: '한국소비자원', href: 'https://www.kca.go.kr' }]} />

      <CaffeineClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 카페인 반감기란? */}
        <section>
          <h2 className="g-h2">카페인 반감기란?</h2>
          <p className="g-p">
            <strong>반감기(half-life)</strong>는 체내 카페인이 절반으로 줄어드는 데 걸리는 시간입니다.
            건강한 성인도 약 2.5~10시간으로 폭이 넓고, 흔히 <strong>평균 약 5시간</strong>으로 봅니다. 오후 2시에 아메리카노 150mg을 마시면
            오후 7시(5시간) ≈ 75mg, 자정(약 10시간) ≈ 38mg이 남는 식입니다.
          </p>
          <p className="g-p">
            카페인은 간의 <strong>CYP1A2 효소</strong>가 분해합니다. 이 효소의 활성은 유전·흡연·약물·임신에 따라 크게 달라져서,
            같은 커피를 마셔도 사람마다 효과가 가는 시간이 다릅니다. 본 도구는 이 차이를 반감기 선택지(3~12시간)로 반영하고,
            여러 잔을 마셨다면 잔마다 따로 줄어드는 양을 더해 현재 잔존량과 취침 시 잔존량을 계산합니다.
          </p>
        </section>

        {/* 2. 반감기별 잔존량 표 (빌드 시 계산) */}
        <section>
          <h2 className="g-h2">반감기별 잔존량 — 오후 2시 아메리카노 한 잔의 경우</h2>
          <p className="g-p">
            계산식은 <strong>잔존량 = 섭취량 × 0.5<sup>(경과 시간 ÷ 반감기)</sup></strong>입니다. 아래 표는 14:00에 아메리카노 Tall(150mg) 한 잔만
            마셨을 때 도구와 같은 식으로 계산한 값입니다. 같은 한 잔이라도 반감기가 5시간이면 23:00에 {AT23_NORMAL}mg,
            임신 후기(12시간)면 {AT23_PREG}mg이 남아 두 배 넘게 차이 납니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>반감기 설정</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>18:00</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>23:00</th>
                    <th scope="col" style={{ ...headCell, textAlign: 'right' }}>다음날 07:00</th>
                    <th scope="col" style={headCell}>30mg 아래로</th>
                  </tr>
                </thead>
                <tbody>
                  {HALF_LIFE_TABLE.map(r => (
                    <tr key={r.half}>
                      <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 600 }}>{r.label} ({r.half}시간)</th>
                      <td style={numCell}>{r.at18}mg</td>
                      <td style={{ ...numCell, fontWeight: 700 }}>{r.at23}mg</td>
                      <td style={numCell}>{r.at07}mg</td>
                      <td style={cell}>{r.below30}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={note}>
            ※ 한 잔만 마신 경우의 값입니다. 오전에 마신 커피가 남아 있으면 그만큼 더해지므로, 실제 기록은 위 트래커에 입력해 확인하세요.
            반감기가 12시간이면 다음날 아침 7시에도 전날 오후 커피의 3분의 1 이상(약 {AT07_PREG}mg)이 남아 있다는 점이 핵심입니다.
          </p>
        </section>

        {/* 3. 음료별 카페인 함량 표 */}
        <section>
          <h2 className="g-h2">음료별 카페인 함량 (한국 시장 기준)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>음료</th>
                    <th scope="col" style={headCell}>용량</th>
                    <th scope="col" style={headCell}>카페인</th>
                    <th scope="col" style={headCell}>아메리카노 Tall 대비</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}>아메리카노 (Tall)</td><td style={cell}>355ml</td><td style={cell}><strong>150mg</strong></td><td style={cell}>기준</td></tr>
                  <tr><td style={cell}>아메리카노 (Grande)</td><td style={cell}>473ml</td><td style={cell}><strong>225mg</strong></td><td style={cell}>1.5배</td></tr>
                  <tr><td style={cell}>콜드브루 (Tall·평균 추정)</td><td style={cell}>355ml</td><td style={cell}><strong>195mg</strong></td><td style={cell}>1.3배 (브랜드 편차 큼)</td></tr>
                  <tr><td style={cell}>에스프레소 1샷</td><td style={cell}>30ml</td><td style={cell}>75mg</td><td style={cell}>0.5배</td></tr>
                  <tr><td style={cell}>카페라떼 (Tall)</td><td style={cell}>355ml</td><td style={cell}>75mg</td><td style={cell}>0.5배</td></tr>
                  <tr><td style={cell}>믹스커피 1포</td><td style={cell}>150ml</td><td style={cell}>50mg</td><td style={cell}>0.3배</td></tr>
                  <tr><td style={cell}>디카페인</td><td style={cell}>355ml</td><td style={cell}>10mg</td><td style={cell}>0.07배</td></tr>
                  <tr><td style={cell}>녹차 (1티백)</td><td style={cell}>200ml</td><td style={cell}>30mg</td><td style={cell}>0.2배</td></tr>
                  <tr><td style={cell}>홍차 (1티백)</td><td style={cell}>200ml</td><td style={cell}>47mg</td><td style={cell}>0.3배</td></tr>
                  <tr><td style={cell}>말차 1잔</td><td style={cell}>200ml</td><td style={cell}>70mg</td><td style={cell}>0.5배</td></tr>
                  <tr><td style={cell}>콜라 캔</td><td style={cell}>355ml</td><td style={cell}>35mg</td><td style={cell}>0.2배</td></tr>
                  <tr><td style={cell}>다이어트콜라</td><td style={cell}>355ml</td><td style={cell}>47mg</td><td style={cell}>0.3배</td></tr>
                  <tr><td style={cell}>레드불 (국내)</td><td style={cell}>250ml</td><td style={cell}>62.5mg</td><td style={cell}>0.4배</td></tr>
                  <tr><td style={cell}>몬스터 (국내)</td><td style={cell}>355ml</td><td style={cell}>100mg</td><td style={cell}>0.7배</td></tr>
                  <tr><td style={cell}>핫식스</td><td style={cell}>250ml</td><td style={cell}>60mg</td><td style={cell}>0.4배</td></tr>
                  <tr><td style={cell}>박카스</td><td style={cell}>100ml</td><td style={cell}>30mg</td><td style={cell}>0.2배</td></tr>
                  <tr><td style={cell}>다크초콜릿 28g</td><td style={cell}>—</td><td style={cell}>24mg</td><td style={cell}>0.16배</td></tr>
                  <tr><td style={cell}>밀크초콜릿 28g</td><td style={cell}>—</td><td style={cell}>9mg</td><td style={cell}>0.06배</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={note}>
            ※ 평균값이며 브랜드·원두·추출법에 따라 ±20% 이상 차이 날 수 있습니다(참고: 스타벅스 영양 정보, USDA, 식약처). 에너지음료는 국내 유통 제품 표기 기준이며(레드불코리아 250ml 62.5mg, 국내 몬스터 355ml 100mg) 해외 제품은 용량·함량이 다릅니다.
            콜드브루는 편차가 가장 커서 한국소비자원 2018년 조사에서 1잔 116~404mg까지 벌어졌습니다.
          </p>
          <p className="g-p" style={{ marginTop: '12px' }}>
            라벨을 확인할 수 있는 음료라면 그 값을 쓰는 것이 가장 정확합니다. 국내에서는 1ml당 카페인 0.15mg 이상이 든 액체 제품에
            <strong> 「고카페인 함유」와 총 카페인 함량(mg)</strong>을 표시해야 하므로, 캔·병 음료는 라벨의 mg을 도구의 「직접 입력」에 넣으면 됩니다.
          </p>
        </section>

        {/* 4. 대사 속도 보정 */}
        <section>
          <h2 className="g-h2">왜 사람마다 카페인 효과가 다른가? (CYP1A2)</h2>
          <p className="g-p">
            카페인 분해 속도를 좌우하는 요인과, 본 도구에서 고를 수 있는 반감기 값을 정리했습니다. 수치는 연구마다 폭이 있는 대략적인 범위입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { name: '흡연', desc: '담배 연기 성분이 CYP1A2를 활성화해 반감기가 짧아집니다(도구 3시간). 금연하면 1~2주 안에 반감기가 원래대로 길어져, 같은 양의 커피가 갑자기 세게 느껴질 수 있습니다.' },
              { name: '경구 피임약', desc: '에스트로겐 성분이 분해를 늦춰 반감기가 대략 두 배 가까이 늘어납니다(도구 9시간). 저녁 커피가 잠을 방해한다고 느끼는 경우가 많습니다.' },
              { name: '임신 (특히 후기)', desc: '호르몬 변화로 분해가 느려져 반감기가 10~15시간까지 늘어납니다(도구 12시간). 출산 후 보통 수준으로 회복됩니다.' },
              { name: '유전형', desc: 'CYP1A2 유전자 변이에 따라 빠른 대사자와 느린 대사자가 있습니다(도구 4시간·6.5시간). 본인이 어느 쪽인지는 커피를 마신 뒤 효과가 얼마나 오래가는지로 짐작해 볼 수 있습니다.' },
              { name: '일부 약물', desc: '항우울제 플루복사민, 항생제 시프로플록사신 등 CYP1A2를 억제하는 약은 반감기를 크게 늘립니다. 복용 중이면 약사에게 확인하세요.' },
              { name: '간 질환·고령', desc: '간 기능이 떨어지면 분해가 느려집니다. 나이가 들면 같은 잔존량이라도 깊은 수면이 더 쉽게 방해받는 편입니다.' },
            ].map((b) => (
              <div key={b.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>{b.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 일일 권장량 */}
        <section>
          <h2 className="g-h2">일일 카페인 섭취 기준 (FDA·식약처)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>대상</th>
                    <th scope="col" style={headCell}>1일 최대 기준</th>
                    <th scope="col" style={headCell}>아메리카노 환산</th>
                    <th scope="col" style={headCell}>근거</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}>건강한 성인</td>
                    <td style={cell}><strong>400mg</strong></td>
                    <td style={cell}>Tall 약 2.7잔 / Grande 약 1.8잔</td>
                    <td style={cell}>FDA·식약처</td>
                  </tr>
                  <tr>
                    <td style={cell}>임산부</td>
                    <td style={cell}><strong>200mg 미만</strong> (식약처 300mg)</td>
                    <td style={cell}>Tall 약 1.3잔</td>
                    <td style={cell}>ACOG — 본 도구 기본값</td>
                  </tr>
                  <tr>
                    <td style={cell}>청소년 (만 11~18)</td>
                    <td style={cell}><strong>체중 1kg당 2.5mg</strong> (50kg ≈ 125mg)</td>
                    <td style={cell}>Tall 약 0.8잔</td>
                    <td style={cell}>식약처 (EFSA는 3mg/kg)</td>
                  </tr>
                  <tr>
                    <td style={cell}>어린이 (~만 10)</td>
                    <td style={cell}><strong>체중 1kg당 2.5mg</strong> (18kg ≈ 45mg)</td>
                    <td style={cell}>콜라 캔 1.3개 이하</td>
                    <td style={cell}>식약처 (EFSA는 3mg/kg)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={note}>
            ※ 성인 400mg은 FDA가 &ldquo;권장량&rdquo;이 아니라 <strong style={{ color: 'var(--text)' }}>&ldquo;대부분 건강한 성인에게 위험한 부정적 영향과 일반적으로 연관되지 않는 양&rdquo;</strong>으로 안내하는 수치입니다.
            임산부 기준은 기관마다 달라 ACOG는 200mg 미만, 식약처는 300mg 이하를 제시하고, 수유부는 CDC가 약 300mg 미만을 대체로 무난한 수준으로 봅니다. 본 도구의 「임산부·수유부」 한도는 보수적으로 200mg입니다.
            청소년·어린이 한도는 체중에 비례하므로, 도구의 125mg·45mg은 각각 50kg·18kg을 가정한 값입니다.
          </p>
          <Callout tone="warn" title="기준을 넘기면">
            불면·두근거림·불안·속쓰림이 흔하고, 임신 중 고용량 섭취는 저체중아 위험과 연관된다는 보고가 있습니다.
            FDA는 약 1,200mg을 짧은 시간에 섭취하면 발작 같은 독성 반응이 나타날 수 있다고 경고합니다 — 카페인 알약·고농축 분말은 계량 실수만으로 이 양을 넘길 수 있어 특히 위험합니다.
          </Callout>
        </section>

        {/* 6. 수면과 카페인 */}
        <section>
          <h2 className="g-h2">카페인과 수면 — 잠은 드는데 왜 피곤한가?</h2>
          <p className="g-p">
            카페인은 뇌의 <strong>아데노신 수용체</strong>를 막아 졸음을 느끼지 못하게 합니다.
            잠드는 데 큰 문제가 없어도 깊은 수면(N3·서파수면)이 줄어 다음날 피로가 쌓일 수 있습니다.
            본 도구는 목표 취침 시각의 잔존량을 아래 구간으로 나눠 보여 줍니다. 이 경계값은 임상 기준이 아니라 결과를 읽기 쉽게 나눈 <strong>도구 내부 참고치</strong>입니다.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '420px' }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>취침 시 잔존량</th>
                    <th scope="col" style={headCell}>도구 표시</th>
                    <th scope="col" style={headCell}>대략의 의미</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}>30mg 미만</td><td style={cell}>영향 거의 없음</td><td style={cell}>녹차 한 잔 이하 수준</td></tr>
                  <tr><td style={cell}>30~50mg</td><td style={cell}>가벼운 영향 가능</td><td style={cell}>민감한 사람은 입면이 늦어질 수 있음</td></tr>
                  <tr><td style={cell}>50~100mg</td><td style={cell}>입면 지연 가능</td><td style={cell}>깊은 수면이 줄기 시작하는 구간으로 봄</td></tr>
                  <tr><td style={cell}>100~200mg</td><td style={cell}>수면 질 큰 영향</td><td style={cell}>잠들어도 자주 깨고 다음날 피로</td></tr>
                  <tr><td style={cell}>200mg 이상</td><td style={cell}>깊은 수면 차단 수준</td><td style={cell}>커피 한 잔 이상을 마신 직후와 비슷</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: '16px' }}>
            「수면 영향 예측」 카드는 거꾸로 <strong>지금 더 마셔도 되는 양</strong>도 계산합니다. 추가 가능량 = (기준치 − 취침 시 잔존량) ÷ 0.5<sup>(지금부터 취침까지 시간 ÷ 반감기)</sup>이고,
            오늘 이미 마신 양을 뺀 일일 한도 안으로 다시 제한합니다. 예를 들어 반감기 5시간, 15:00, 취침 23:30이고 오늘 마신 카페인이 없다면
            30·50·100mg 기준의 추가 가능량은 각각 <strong>{EX_A[0]}·{EX_A[1]}·{EX_A[2]}mg</strong>입니다.
            같은 조건에서 아침 9시에 Grande(225mg)를 마셨다면 취침 시 이미 약 {Math.round(EX_B_BED)}mg이 남아 있어 30mg 기준은 {EX_B[0]}mg,
            50mg 기준은 {EX_B[1]}mg이 되고, 100mg 기준은 일일 한도 잔여분({400 - 225}mg)에 막혀 {EX_B[2]}mg으로 표시됩니다.
          </p>
          <Callout tone="tip">
            오후 커피를 줄이기 어렵다면 음료나 샷 수를 바꾸는 것만으로도 효과가 큽니다. 반감기 5시간 기준으로 15:00에 마신 아메리카노가 23:30에 남기는 양은
            Grande(225mg)면 약 {Math.round(remain(225, HOURS_TO_BED, 5))}mg, Tall(150mg)이면 약 {Math.round(remain(150, HOURS_TO_BED, 5))}mg이고,
            샷이 하나인 카페라떼 Tall(75mg)을 고르면 약 {Math.round(remain(75, HOURS_TO_BED, 5))}mg으로 Tall 아메리카노의 절반이 됩니다.
            디카페인으로 바꾸면 거의 0에 가까워집니다. 목표 취침 시각을 입력해 두고 마시기 전에 추가 가능량을 확인해 보세요.
          </Callout>
        </section>

        {/* 7. 추정의 한계 */}
        <section>
          <h2 className="g-h2">이 추정의 한계와 상담이 필요한 경우</h2>
          <ul className="g-list">
            <li><strong>반감기는 평균값입니다.</strong> 같은 조건이라도 개인차가 30~50% 이상 날 수 있어, 표시 mg은 경향을 보는 용도로 쓰세요.</li>
            <li><strong>흡수 시간을 생략했습니다.</strong> 마신 순간 전량이 흡수된다고 가정하므로 마신 직후 1시간 정도는 잔존량이 실제보다 약간 높게 나옵니다.</li>
            <li><strong>음료 함량은 평균값입니다.</strong> 원두·추출법·매장마다 차이가 크니 라벨이나 매장 영양정보가 있으면 직접 입력하세요.</li>
            <li><strong>기록은 이 기기에만 남습니다.</strong> 입력한 기록과 설정은 이 브라우저(localStorage)에만 저장되고 서버로 전송되지 않으며, 72시간이 지난 기록은 자동으로 정리됩니다. 다른 기기·브라우저와는 동기화되지 않고, 브라우저 데이터를 지우면 함께 사라집니다.</li>
            <li><strong>의료진과 먼저 상의할 경우</strong> — 부정맥·고혈압·불안장애·위식도역류가 있거나, 임신·수유 중이거나, 카페인 분해에 영향을 주는 약을 먹고 있다면 도구의 기준보다 담당 의사·약사의 안내를 따르세요.</li>
          </ul>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 9. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/cooking/brew" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>☕</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>커피 브루잉 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>핸드드립·콜드브루 6 추출법</div>
            </Link>
            <Link href="/tools/cooking/tea" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍵</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>차 우리기 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>9종 차·카페인 비교</div>
            </Link>
            <Link href="/tools/health/blood-alcohol" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍺</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>혈중알코올 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>알코올 분해 시간</div>
            </Link>
            <Link href="/tools/life/pomodoro" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍅</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>뽀모도로 타이머</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>집중 관리 + 휴식</div>
            </Link>
            <Link href="/tools/health/supplement" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>💊</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>영양제 성분 체크</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>약물·카페인 상호작용</div>
            </Link>
            <Link href="/tools/date/server-time" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>실시간 서버 시간</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>티켓팅·수강신청 카운트다운</div>
            </Link>
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
