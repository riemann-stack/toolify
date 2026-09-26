import Link from 'next/link'
import PackingClient from './PackingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import {
  calcPacking, CLIMATES, LAUNDRIES, ACTIVITIES, PHOTOS, getClimate,
  HEAT_MULT, MARGIN, MIN_COUNT, SPORTS_ACTIVE_CAP, EXTRAS_KG, CARRIER_KG_STEPS, CARRIER_SIZES,
  type PackingInputs, type PackingResult, type Laundry, type Climate,
} from './packingUtils'

export const metadata = buildMetadata({
  path: '/tools/life/packing',
  title: '여행 짐 계산기 — 일수·기온·세탁 → 카테고리별 개수 + 체크리스트',
  description: '일수·기온·세탁 가능·활동량·사진 중요도로 카테고리별 옷 개수 + 최소·넉넉 2버전 체크리스트와 캐리어 추천. 5박 옷 몇 벌·한 달 살기·아기 동반까지 시나리오 자동 입력.',
  keywords: ['여행 옷 개수', '여행 짐 싸기', '패킹 리스트', '캐리어 사이즈', '5박 옷 몇 벌', '한 달 살기', '여행 체크리스트', '항공사 수하물', '신혼여행 패킹', '아기 동반 여행'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontSize: 12, fontWeight: 500 }
const thL: React.CSSProperties = { ...th, textAlign: 'left' }
const td: React.CSSProperties = { padding: '9px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 600, fontSize: 13 }
const tdL: React.CSSProperties = { ...td, textAlign: 'left', color: 'var(--text)', fontWeight: 700 }
const tdNote: React.CSSProperties = { ...td, textAlign: 'left', color: 'var(--muted)', fontWeight: 400 }
const tableNote: React.CSSProperties = { padding: '12px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, background: 'var(--bg3)' }

// ── 본문 표·예시·규칙 설명은 계산기와 같은 calcPacking과 packingUtils 상수로 빌드 시 계산 (계산식을 고치면 본문도 따라 바뀐다) ──
/** 기준 조건: 1인 · 봄·가을(10~20°C) · 도시 관광 · 사진 보통 · 운동복/격식 없음 */
const base = (days: number, laundry: Laundry, climate: Climate = 'spring'): PackingInputs => ({
  days, climate, laundry, activity: 'city', photo: 'normal', needSports: false, needFormal: false, people: 1,
})
const both = (inp: PackingInputs) => ({ min: calcPacking(inp, 'min'), max: calcPacking(inp, 'comfort') })
const cnt = (r: PackingResult, id: string) => r.items.find(i => i.id === id)?.count ?? 0
const range = (p: { min: PackingResult; max: PackingResult }, id: string) => {
  const a = cnt(p.min, id), b = cnt(p.max, id)
  return a === b ? `${a}` : `${a}~${b}`
}
const kg1 = (x: number) => x.toFixed(1)
const nights = (days: number) => `${days - 1}박 ${days}일`
const laundryLabel = (id: Laundry) => LAUNDRIES.find(l => l.id === id)!.label

/** 일수별 표 — 3~10박은 세탁 불가, 2주는 코인·호텔 세탁, 한 달(슬라이더 최대 30일)은 숙소 매일 세탁 */
const DAY_ROWS = ([[4, 'none'], [6, 'none'], [8, 'none'], [11, 'none'], [15, 'weekly'], [30, 'daily']] as [number, Laundry][])
  .map(([days, laundry]) => {
    const p = both(base(days, laundry))
    return {
      days, laundry, p,
      contents: p.max.clothingWeight + p.max.extrasWeight,
      total: p.max.totalWeight,
      carrier: p.max.carrier.label,
    }
  })

/** 세탁 방식별 상의 개수 (최소~넉넉) */
const LAUNDRY_DAYS = [6, 15, 30]
const LAUNDRY_ROWS = LAUNDRIES.map(l => ({
  id: l.id, label: l.label, mult: l.multiplier,
  cells: LAUNDRY_DAYS.map(d => range(both(base(d, l.id)), 'top')),
}))

/** 기온대별 — 5박 6일 세탁 불가 기준 상의·속옷·아우터 개수 */
const CLIMATE_ROWS = CLIMATES.map(c => {
  const p = both(base(6, 'none', c.id))
  return { ...c, heat: HEAT_MULT[c.id], topCnt: range(p, 'top'), outerCnt: range(p, 'outer') }
})
/** 더위 보정이 붙는 기온대 설명 — "25~30°C ×1.3 · 30°C 이상 ×1.5" */
const HEAT_TEXT = CLIMATES.filter(c => HEAT_MULT[c.id] !== 1).map(c => `${c.range} ×${HEAT_MULT[c.id]}`).join(' · ')
const HEAT_FAQ = CLIMATES.filter(c => HEAT_MULT[c.id] !== 1).map(c => `${c.range}에서 ${HEAT_MULT[c.id]}배`).join(', ')
/** 아우터 기본 개수 — 연속한 기온대 중 개수가 같은 것끼리 묶어 기온 범위로 표시 ("혹한 3 · 0~20°C 2 · 20°C 이상 1") */
const lowOf = (r: string) => r.match(/^(-?\d+)~/)?.[1] ?? r.match(/^(-?\d+)°C 이상/)?.[1] ?? null
const highOf = (r: string) => r.match(/~(-?\d+)°C/)?.[1] ?? r.match(/^(-?\d+)°C 이하/)?.[1] ?? null
const OUTER_RULE = CLIMATES.reduce<{ count: number; items: typeof CLIMATES }[]>((g, c) => {
  const last = g[g.length - 1]
  if (last && last.count === c.outerCount) last.items.push(c)
  else g.push({ count: c.outerCount, items: [c] })
  return g
}, []).map(({ count, items }) => {
  if (items.length === 1) return `${items[0].label} ${count}`
  const lo = lowOf(items[0].range), hi = highOf(items[items.length - 1].range)
  const span = lo !== null && hi !== null ? `${lo}~${hi}°C` : lo !== null ? `${lo}°C 이상` : hi !== null ? `${hi}°C 이하` : items.map(i => i.label).join('/')
  return `${span} ${count}`
}).join(' · ')
const CARRIER_KG_TEXT = CARRIER_KG_STEPS.map(st =>
  `${Number.isFinite(st.maxContentsKg) ? `${st.maxContentsKg}kg 이하` : '그 이상'} ${st.kg}kg`).join(' · ')
const PHOTO_TEXT = PHOTOS.filter(p => p.bonus > 0).map(p => `${p.label.replace(/\s*\(.*\)/, '')} +${p.bonus}`).join('·')
const CLIMATE_HOT = CLIMATES.find(c => c.id === 'hot')!
/** 캐리어 표의 높이·적합 일정(참고 설명) — 무게 구간은 CARRIER_SIZES에서 */
const CARRIER_NOTE: Record<string, { height: string; fit: string }> = {
  cabin: { height: '~ 55cm', fit: '1~5박 / 출장·짐 적은 여행' },
  '24': { height: '~ 65cm', fit: '5~14박 / 일반 자유여행' },
  '28': { height: '~ 75cm', fit: '2주~ / 가족·장기 여행' },
  large: { height: '75cm+', fit: '한 달~ / 이주·유학 (추가 요금·분할)' },
}
const CARRIER_FAQ = CARRIER_SIZES.filter(c => Number.isFinite(c.maxTotalKg)).map((c, i) =>
  i === 0 ? `<strong>${c.maxTotalKg}kg 이하면 ${c.label.replace(/\s*\((.*)\)/, ' $1')}</strong>` : `${c.maxTotalKg}kg 이하면 ${c.label.replace(/\s*\(.*\)/, '')}`).join(', ')

/** 품목 1개 무게 — 모든 품목이 나오도록 운동복·격식·비치 조건으로 한 번 계산 */
const ALL_ITEMS = calcPacking({ days: 3, climate: 'hot', laundry: 'none', activity: 'beach', photo: 'normal', needSports: true, needFormal: true, people: 1 }, 'comfort').items
const W = (id: string) => ALL_ITEMS.find(i => i.id === id)!.weight
/** 운동복(액티비티 외)·수영복 개수 범위 — 계산기로 직접 계산 */
const SPORTS_OTHER = range(both({ ...base(6, 'none'), needSports: true }), 'sports')
const SWIM_RANGE = range(both({ ...base(6, 'none'), activity: 'beach' }), 'swim')

/** 풀이 예시: 5박 6일 · 봄·가을 · 도시 · 세탁 불가 */
const EX = both(base(6, 'none'))
const EX_SUMMER = both(base(6, 'none', 'summer'))
const EX_MONTH = both(base(30, 'daily'))
const EX_MONTH_NONE = both(base(30, 'none'))
const EX_TWO_WEEKS_NONE = both(base(15, 'none'))
const EX_TWO_WEEKS_WEEKLY = both(base(15, 'weekly'))
const actMult = (id: string) => ACTIVITIES.find(a => a.id === id)!.multiplier
/** 세탁 없이(봄·가을 도시) 넉넉 버전이 기내용(1인 총 10kg 이하)을 처음 넘는 일수 */
const CABIN_LIMIT_DAYS = Array.from({ length: 30 }, (_, i) => i + 1).find(d => calcPacking(base(d, 'none'), 'comfort').carrier.id !== 'cabin') ?? 30

const FAQ_LD = [
  {
    q: '5박 6일 여행에 옷 몇 벌이 적당한가요?',
    a: `도시 관광·봄가을 날씨, 세탁 없이 1인 기준 계산기 결과(최소~넉넉)는 <strong>상의 ${range(EX, 'top')}벌 · 하의 ${range(EX, 'bottom')}벌 · 속옷·양말 ${range(EX, 'underwear')}세트 · 아우터 ${range(EX, 'outer')}벌 · 신발 ${range(EX, 'shoe')}켤레</strong>입니다. 같은 일정이 여름(25~30°C)이면 땀 때문에 상의가 ${range(EX_SUMMER, 'top')}벌, 속옷·양말이 ${range(EX_SUMMER, 'underwear')}세트로 늘어납니다. 코인·호텔 세탁을 한 번 끼우면 상의는 ${range(both(base(6, 'weekly')), 'top')}벌로 줄어듭니다. 격식 일정·운동이 있으면 옵션을 켜서 따로 더하세요.`,
  },
  {
    q: '한 달 살기는 옷을 몇 벌 가져가야 하나요?',
    a: `한 달 일정은 <strong>세탁 방식이 옷 수를 좌우</strong>합니다. 계산기 최대 일수(30일)에 숙소 매일 세탁을 넣으면 상의 ${range(EX_MONTH, 'top')}벌 · 하의 ${range(EX_MONTH, 'bottom')}벌 · 속옷·양말 ${range(EX_MONTH, 'underwear')}세트로, 짐 내용물 약 ${kg1(EX_MONTH.max.clothingWeight + EX_MONTH.max.extrasWeight)}kg입니다. 세탁이 3~4일에 한 번이면 상의가 ${range(both(base(30, 'weekly')), 'top')}벌로 늘어납니다. 현지에서 옷을 사거나 빨래 주기를 더 짧게 잡으면 더 줄일 수 있고, 한 달 살기는 옷보다 <strong>상비약·처방약·전자기기·서류</strong>를 빠뜨리지 않는 것이 더 중요합니다.`,
  },
  {
    q: '세탁이 가능하면 옷을 얼마나 줄일 수 있나요?',
    a: `계산기는 세탁 불가를 1, 코인·호텔 세탁(3~4일에 1회)을 0.5, 숙소 매일 세탁을 0.35로 곱해 상의·하의·속옷 수를 줄입니다. 다만 개수를 올림하고 여유분을 더하기 때문에 <strong>짧은 여행일수록 차이가 작습니다</strong> — 5박 6일은 코인 세탁과 매일 세탁이 모두 상의 ${range(both(base(6, 'weekly')), 'top')}벌로 같고, 14박 15일이 되어야 세탁 불가 ${range(EX_TWO_WEEKS_NONE, 'top')}벌 · 코인 세탁 ${range(EX_TWO_WEEKS_WEEKLY, 'top')}벌 · 매일 세탁 ${range(both(base(15, 'daily')), 'top')}벌로 벌어집니다. 숙소를 예약할 때 세탁기 유무를 확인하는 것이 긴 여행의 짐 무게를 가장 크게 바꿉니다.`,
  },
  {
    q: '여름과 겨울 패킹은 무엇이 다른가요?',
    a: `여름은 옷 한 벌이 가볍지만 <strong>자주 갈아입어 개수가 늘어납니다</strong> — 계산기는 상의·속옷을 ${HEAT_FAQ}로 잡고, ${CLIMATE_HOT.range}이면 수영복도 넣습니다. 겨울은 개수보다 <strong>부피</strong>가 문제입니다. 아우터 기본 개수가 ${getClimate('winter').label}(${getClimate('winter').range})는 ${getClimate('winter').outerCount}벌, ${getClimate('frigid').label}(${getClimate('frigid').range})은 ${getClimate('frigid').outerCount}벌로 늘고, 패딩·니트는 무게에 비해 부피가 커서 추천보다 한 단계 큰 캐리어가 필요할 수 있습니다. 가장 두꺼운 외투와 신발은 입고 타면 캐리어 무게·부피를 동시에 줄일 수 있습니다(계산기도 아우터 1벌·신발 1켤레는 입고 탄다고 보고 무게에서 뺍니다).`,
  },
  {
    q: '캐리어는 기내 휴대와 위탁 중 어떻게 정하나요?',
    a: `계산기는 1인 총 무게(옷 + 세면·전자 등 ${EXTRAS_KG}kg + 캐리어 자체)가 ${CARRIER_FAQ}을 추천합니다. 기내 한도는 국적 항공사·국내 LCC가 대체로 10kg 안팎이지만 <strong>7kg인 해외 LCC</strong>도 많으니 예약한 항공사 규정을 먼저 확인하세요.<br/>• 기내 휴대: 수하물 찾는 대기와 분실·지연 걱정이 적지만, 액체류는 용기당 100ml 이하만 가능<br/>• 위탁: 큰 용량 화장품을 넣을 수 있고 무게 한도가 크지만(LCC 15~20kg, 대형 항공사 23kg), 분실·지연 대비가 필요<br/><strong>보조배터리·여분 리튬배터리·전자담배·라이터는 위탁이 금지</strong>되고 몸에 지녀야 합니다. 보조배터리는 국토교통부 기내 안전관리 표준안(2025년 3월 1일 시행)에 따라 국적 항공사 항공편에서 기내 선반 보관이 금지되고 단자 절연이 요구되며, 2026년 4월 20일부터는 ICAO 기준에 따라 1인당 2개까지만 반입하고 기내에서 충전·사용할 수 없습니다(100Wh 초과~160Wh는 항공사 승인 필요, 160Wh 초과는 반입 불가).`,
  },
  {
    q: '압축팩을 쓰면 얼마나 줄어드나요?',
    a: '압축팩은 <strong>부피만 줄이고 무게는 그대로</strong>입니다. 공기를 많이 품은 패딩·플리스·두꺼운 니트에서 효과가 크고, 얇은 면 티셔츠·속옷은 원래 부피가 작아 줄어드는 폭도 작습니다. 흔한 실수는 압축으로 공간이 남자 더 넣었다가 <strong>무게 한도를 먼저 넘기는 것</strong> — 캐리어를 한 단계 작게 고를 때는 계산기의 무게를 함께 확인하세요. 진공 압축팩은 돌아올 때 펌프나 청소기가 없으면 다시 줄이기 어려워, 손으로 말아 공기를 빼는 롤업형이 여행 중 다루기 편합니다. 셔츠·정장처럼 구김이 문제인 옷은 압축하지 않는 편이 낫습니다.',
  },
  {
    q: '신발은 몇 켤레 가져가야 하나요?',
    a: '계산기는 기본 1켤레에 <strong>운동복 옵션이면 +1, 격식 옵션이면 +1</strong>(최대 3켤레, 최소 버전은 2켤레까지)로 셉니다. 신발은 한 켤레가 약 0.7kg으로 아우터 다음으로 무거운 품목이라, 가장 무거운 한 켤레는 신고 타고 나머지만 넣는 것이 가장 효과적입니다.<br/>• 도시 관광: 오래 걸어도 편한 운동화 1켤레<br/>• 휴양·비치: 운동화 + 슬리퍼·아쿠아슈즈<br/>• 등산: 트레킹화 + 운동화<br/>• 격식 디너·골프: 구두 또는 골프화 추가<br/>새 신발은 여행 전에 며칠 신어 길들여 두세요.',
  },
  {
    q: '가족 여행 짐은 어떻게 나눠 담나요?',
    a: '계산기는 1인 기준 무게와 일행 합계를 함께 보여 주므로, 합계를 캐리어 개수와 항공사 한도로 나눠 보면 몇 개가 필요한지 가늠할 수 있습니다. 4인 가족 7박 예시:<br/>• 부부: 28인치 1개(위탁) — 부모 옷·공동 짐<br/>• 큰아이: 24인치 — 본인 옷<br/>• 작은아이: 기내용 — 본인 옷·장난감<br/>• 공동 백팩 — 여권·비상약·전자기기<br/>핵심은 <strong>각자 1~2일치 옷·필수품을 서로 다른 가방에 나눠 담는 것</strong>입니다. 위탁 캐리어 하나가 분실·지연돼도 온 가족이 버틸 수 있습니다. 귀중품·약·서류·전자기기는 기내 휴대로 두세요.',
  },
  {
    q: '골프·등산 여행은 무엇이 다른가요?',
    a: `활동량을 &lsquo;액티비티·등산&rsquo;(옷 수 ×${actMult('active')})으로 두고 운동복 옵션을 켜면, 계산기는 <strong>운동복을 일수만큼</strong>(최소 버전 4세트·넉넉 버전 5세트까지) 잡습니다 — 라운드·산행마다 갈아입는다고 보기 때문입니다.<br/>• 골프: 골프복 라운드 수만큼, 장갑 2~3개(땀에 젖음), 골프화 + 일반화, 비옷. 골프백은 항공사마다 무료 수하물에 포함되기도 하고 별도 요금을 받기도 하니 예약 전에 확인하세요.<br/>• 등산·캠핑: 트레킹화, 방수·방풍 자켓, 헤드랜턴, 벌레 기피제, 응급 키트. 산 위는 평지보다 기온이 낮으니 기온대를 한 단계 낮춰 계산해 보세요.<br/>시나리오 탭의 골프투어·캠핑 프리셋으로 바로 채울 수 있습니다.`,
  },
  {
    q: '아기와 함께 여행할 때 무엇을 더 챙기나요?',
    a: '아기 짐은 따로 가방 하나가 필요할 만큼 많습니다.<br/>• 기저귀·물티슈: 평소 하루 사용량 × 일수 + 1~2일분 여유 (현지에서 같은 제품을 구하기 어려울 수 있음)<br/>• 분유·이유식·젖병: 아기가 먹는 액체 음식과 의약품은 여정에 필요한 양이면 기내 액체 100ml 제한의 예외로 반입할 수 있으니 보안검색 때 따로 꺼내 보여 주세요<br/>• 아기 옷: 하루 2~3벌 (흘림·기저귀 새는 경우 대비)<br/>• 아기 상비약·체온계·해열제<br/>• 유모차: 대부분 항공사가 무료로 위탁하거나 탑승구 앞에서 맡아 주며, 기내 반입 가능 여부는 접었을 때 크기에 따라 항공사마다 다릅니다<br/>• 렌터카를 탄다면 카시트 대여 가능 여부 확인<br/>옷 계산 탭 옵션에서 &lsquo;아기 동반&rsquo;을 켜거나 시나리오 탭의 &lsquo;아기 동반 가족여행&rsquo;을 고르면 체크리스트 탭에 아기 용품 카테고리가 추가돼 한 번에 체크할 수 있습니다.',
  },
]

export default function PackingPage() {
  return (
    <ToolPage width={880} slug="/tools/life/packing">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />여행 짐 계산기
      </h1>
      <p className="tp-lead">
        일수·기온·세탁 가능·활동량으로 카테고리별 옷 개수 + <strong style={{ color: 'var(--text)' }}>최소·넉넉 2버전</strong>.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="옷 개수·무게는 계산기 계산식(본문 표는 빌드 시 같은 식으로 계산) · 보조배터리 기내 규정은 ICAO·국토교통부 기준(2026-04-20 시행)"
        sources={[
          { label: '국토교통부 — 보조배터리 기내 반입 기준', href: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156753374' },
          { label: 'IATA — 승객 배터리 안내', href: 'https://www.iata.org/en/youandiata/travelers/batteries/' },
          { label: 'FAA PackSafe — 배터리', href: 'https://www.faa.gov/hazmat/packsafe/airline-passengers-and-batteries' },
        ]}
      />

      <PackingClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 className="g-h2">어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>여행 일수·인원 입력</strong> — 슬라이더로 1~30일</li>
          <li><strong>기온대 선택</strong> — 6 단계 (-10°C ~ 30°C+)</li>
          <li><strong>세탁·활동량·사진·옵션</strong> 선택 → 자동 보정</li>
          <li><strong>최소/넉넉 2 버전 비교</strong> + 짐 무게 + 캐리어 추천</li>
          <li><strong>체크리스트 탭</strong>에서 옷 + 세면·약·서류 등 8 카테고리 통합 체크</li>
        </ol>
      </div>
      <Callout tone="tip" title="시나리오로 빠르게 시작하기">
        시나리오 탭에서 신혼·동남아·유럽·골프·캠핑·아기 동반 6가지 조건을 한 번에 채울 수 있습니다.
        체크리스트는 클립보드 복사로 가족·친구와 공유하세요.
      </Callout>

      {/* 2. 계산 방식 */}
      <h2 className="g-h2">계산 방식 — 옷 개수와 무게를 정하는 규칙</h2>
      <p className="g-p">
        계산기는 여행 일수에 <strong>활동량·세탁·더위 보정</strong>을 곱해 기본 개수를 구하고, 소수점은 올림하고,
        상의·하의는 &lsquo;넉넉&rsquo; 버전에만 +{MARGIN.tops.comfort}, 속옷·양말은 최소 +{MARGIN.underwear.min}·넉넉 +{MARGIN.underwear.comfort} 여유분을 더합니다.
        보정값은 활동량 휴양 ×{actMult('rest')} · 도시 ×{actMult('city')} · 액티비티 ×{actMult('active')} · 비치 ×{actMult('beach')},
        세탁 {LAUNDRIES.map(l => `${l.label} ×${l.multiplier}`).join(' · ')}, 더위 {HEAT_TEXT}입니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll" style={{ '--ts-bg': 'var(--bg2)' } as React.CSSProperties}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={thL}>품목</th>
                <th scope="col" style={thL}>개수 규칙 (최소 → 넉넉)</th>
                <th scope="col" style={th}>1개 무게</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['상의', `⌈일수 × 활동 × 세탁 × 더위⌉, 넉넉 +${MARGIN.tops.comfort}, 사진 ${PHOTO_TEXT} (최소 ${MIN_COUNT.tops}벌)`, W('top')],
                ['하의', `⌈일수 ÷ 3 × 세탁⌉, 넉넉 +${MARGIN.bottoms.comfort} (최소 ${MIN_COUNT.bottoms}벌)`, W('bottom')],
                ['속옷 / 양말', `⌈일수 × 세탁 × 더위⌉ + ${MARGIN.underwear.min}(최소) / + ${MARGIN.underwear.comfort}(넉넉), 최소 ${MIN_COUNT.underwear}세트`, `${W('underwear')}g / ${W('sock')}`],
                ['아우터', `기온대 기본 개수(${OUTER_RULE}), 최소 버전 −1`, W('outer')],
                ['신발', '1 + 운동복 옵션 1 + 격식 옵션 1 (최대 3, 최소 버전 2)', W('shoe')],
                ['운동복 (상하)', `운동복 옵션을 켜면: 액티비티는 일수만큼(최소 버전 ${SPORTS_ACTIVE_CAP.min}·넉넉 버전 ${SPORTS_ACTIVE_CAP.comfort}세트까지), 그 외 ${SPORTS_OTHER}세트`, W('sports')],
                ['격식 옷', '옵션을 켜면 1세트', W('formal')],
                ['수영복', `비치 활동 또는 ${CLIMATE_HOT.range}이면 ${SWIM_RANGE}벌`, W('swim')],
              ].map(([name, rule, w]) => (
                <tr key={name as string} style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="row" style={tdL}>{name}</th>
                  <td style={tdNote}>{rule}</td>
                  <td style={{ ...td, color: 'var(--text)' }}>{w}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={tableNote}>
          ※ 무게는 입고 타는 <strong style={{ color: 'var(--text)' }}>아우터 1벌·신발 1켤레를 뺀</strong> 옷 무게에 세면도구·전자기기·약 등 비의류 {EXTRAS_KG}kg을 더하고,
          캐리어 자체 무게(내용물 {CARRIER_KG_TEXT})를 합친 1인 총 무게입니다.
        </div>
      </div>
      <p className="g-p">
        <strong>풀이 예시 — 5박 6일, 봄·가을, 도시 관광, 세탁 불가.</strong>{' '}
        상의는 ⌈6 × {actMult('city')} × {LAUNDRIES.find(l => l.id === 'none')!.multiplier} × {HEAT_MULT.spring}⌉ = {cnt(EX.min, 'top')}벌(넉넉 {cnt(EX.max, 'top')}벌),
        하의는 ⌈6 ÷ 3⌉ = {cnt(EX.min, 'bottom')}벌(넉넉 {cnt(EX.max, 'bottom')}벌),
        속옷·양말은 {Math.ceil(6 * HEAT_MULT.spring)} + {MARGIN.underwear.min} = {cnt(EX.min, 'underwear')}세트(넉넉 {cnt(EX.max, 'underwear')}세트),
        아우터는 기본 {getClimate('spring').outerCount}벌에서 최소 버전 {cnt(EX.min, 'outer')}벌입니다.
        넉넉 버전의 옷을 모두 더하면 {kg1(EX.max.items.reduce((s, i) => s + i.totalWeight, 0) / 1000)}kg, 입고 탈 아우터·신발 {kg1(EX.max.wornWeight)}kg을 빼고
        비의류 {kg1(EX.max.extrasWeight)}kg을 더한 내용물이 {kg1(EX.max.clothingWeight + EX.max.extrasWeight)}kg, 캐리어 {kg1(EX.max.carrierWeight)}kg을 합쳐
        <strong> 1인 총 {kg1(EX.max.totalWeight)}kg → {EX.max.carrier.label}</strong> 추천입니다. 최소 버전은 {kg1(EX.min.totalWeight)}kg입니다.
      </p>

      {/* 3. 일수별 옷 개수 */}
      <h2 className="g-h2">여행 일수별 옷 개수 가이드</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll" style={{ '--ts-bg': 'var(--bg2)' } as React.CSSProperties}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={thL}>일정</th>
                <th scope="col" style={thL}>세탁</th>
                <th scope="col" style={th}>상의</th>
                <th scope="col" style={th}>하의</th>
                <th scope="col" style={th}>속옷·양말</th>
                <th scope="col" style={th}>내용물</th>
                <th scope="col" style={th}>캐리어 포함</th>
                <th scope="col" style={thL}>추천 캐리어</th>
              </tr>
            </thead>
            <tbody>
              {DAY_ROWS.map(r => (
                <tr key={`${r.days}-${r.laundry}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="row" style={tdL}>{nights(r.days)}</th>
                  <td style={tdNote}>{laundryLabel(r.laundry)}</td>
                  <td style={td}>{range(r.p, 'top')}벌</td>
                  <td style={td}>{range(r.p, 'bottom')}벌</td>
                  <td style={td}>{range(r.p, 'underwear')}세트</td>
                  <td style={td}>~{kg1(r.contents)}kg</td>
                  <td style={td}>~{kg1(r.total)}kg</td>
                  <td style={tdNote}>{r.carrier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={tableNote}>
          ※ <strong style={{ color: 'var(--text)' }}>봄·가을(10~20°C) 도시 관광 1인, 위 계산기의 최소~넉넉 버전</strong> 결과입니다. 무게는 넉넉 버전 기준이며,
          &lsquo;내용물&rsquo;은 옷(입고 타는 아우터 1벌·신발 1켤레 제외)과 비의류 {EXTRAS_KG}kg, &lsquo;캐리어 포함&rsquo;은 계산기의 &lsquo;1인 총 무게&rsquo;와 같은 값입니다.
          한여름·운동·격식 일정은 더 늘어납니다.
        </div>
      </div>
      <p className="g-p">
        세탁 없이 가면 넉넉 버전 기준 {nights(CABIN_LIMIT_DAYS - 1)}까지는 기내용(1인 총 10kg 이하)에 들어가고, {nights(CABIN_LIMIT_DAYS)}부터 24인치로 넘어갑니다. 2주 이상이면 세탁 계획이 짐 무게를 가장 크게 줄입니다 —
        14박 15일을 세탁 없이 가면 상의만 {range(EX_TWO_WEEKS_NONE, 'top')}벌, 총 {kg1(EX_TWO_WEEKS_NONE.max.totalWeight)}kg이지만 코인·호텔 세탁을 넣으면 {range(EX_TWO_WEEKS_WEEKLY, 'top')}벌, {kg1(EX_TWO_WEEKS_WEEKLY.max.totalWeight)}kg이고,
        29박 30일은 세탁 없이 약 {kg1(EX_MONTH_NONE.max.totalWeight)}kg으로 {EX_MONTH_NONE.max.carrier.label} 캐리어가 필요하지만, 숙소 매일 세탁이면 약 {kg1(EX_MONTH.max.totalWeight)}kg으로 {EX_MONTH.max.carrier.label} 캐리어면 충분합니다.
      </p>

      {/* 4. 기온대별 가이드 */}
      <h2 className="g-h2">기온대별 옷 가이드</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll" style={{ '--ts-bg': 'var(--bg2)' } as React.CSSProperties}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={thL}>기온대</th>
                <th scope="col" style={thL}>상의·아우터 예</th>
                <th scope="col" style={thL}>챙길 소품</th>
                <th scope="col" style={th}>옷 수 보정</th>
                <th scope="col" style={th}>5박 상의</th>
                <th scope="col" style={th}>5박 아우터</th>
              </tr>
            </thead>
            <tbody>
              {CLIMATE_ROWS.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="row" style={{ ...tdL, color: c.color }}>{c.label}<br /><span style={{ fontWeight: 400, fontSize: 12, color: 'var(--muted)' }}>{c.range}</span></th>
                  <td style={tdNote}>{c.tops} / {c.outers}</td>
                  <td style={tdNote}>{c.accessories}</td>
                  <td style={td}>×{c.heat}</td>
                  <td style={td}>{c.topCnt}벌</td>
                  <td style={td}>{c.outerCnt}벌</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={tableNote}>
          ※ 5박 6일·도시 관광·세탁 불가 기준 최소~넉넉 개수. 30°C 이상은 수영복도 기본으로 넣습니다. 산악 지역이나 고지대 도시는 같은 계절이라도 한 단계 낮은 기온대로 계산해 보세요.
        </div>
      </div>
      <p className="g-p">
        기온대 구분은 여행지의 <strong>낮 최고기온이 아니라 하루 평균</strong>으로 고르는 편이 안전합니다. 봄·가을은 일교차가 커서 두꺼운 옷 한 벌보다 얇은 옷을 겹쳐 입는 쪽이 가볍고,
        한여름 휴양지도 실내 냉방·비행기 안을 대비해 얇은 겉옷 한 벌은 계산기가 기본으로 넣습니다.
      </p>

      {/* 5. 세탁 전략 */}
      <h2 className="g-h2">세탁 가능 여부에 따른 패킹 전략</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll" style={{ '--ts-bg': 'var(--bg2)' } as React.CSSProperties}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={thL}>세탁 방식</th>
                <th scope="col" style={th}>보정</th>
                {LAUNDRY_DAYS.map(d => <th key={d} scope="col" style={th}>{nights(d)} 상의</th>)}
              </tr>
            </thead>
            <tbody>
              {LAUNDRY_ROWS.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="row" style={tdL}>{r.label}</th>
                  <td style={{ ...td, color: 'var(--muted)' }}>×{r.mult}</td>
                  {r.cells.map((c, i) => <td key={i} style={td}>{c}벌</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={tableNote}>※ 봄·가을·도시 관광 1인, 최소~넉넉 버전. 하의·속옷도 같은 보정이 적용됩니다.</div>
      </div>
      <ul className="g-list">
        <li><strong>짧은 여행은 세탁 효과가 작습니다</strong> — 올림과 여유분 때문에 5박 6일은 코인 세탁과 매일 세탁의 결과가 같습니다. 세탁 계획은 1주 이상 일정에서 짐을 크게 줄입니다.</li>
        <li><strong>빨리 마르는 소재</strong>(폴리에스터·기능성 티셔츠·메리노 울)를 고르면 숙소에서 손빨래 후 하룻밤 안에 말라 &lsquo;매일 세탁&rsquo;에 가깝게 운용할 수 있습니다.</li>
        <li>숙소 세탁기 유무는 예약 전에 확인하세요. 호텔 세탁 서비스는 지역·호텔마다 요금 차이가 커서, 장기 여행이라면 숙소 근처 코인세탁소 위치를 미리 봐 두는 편이 경제적입니다.</li>
        <li>작은 빨래비누·세탁망·빨랫줄(또는 옷걸이 2~3개)만 챙겨도 속옷·양말은 대부분 해결됩니다.</li>
      </ul>

      {/* 6. 캐리어 사이즈 */}
      <h2 className="g-h2">캐리어 사이즈·항공사 수하물</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll" style={{ '--ts-bg': 'var(--bg2)' } as React.CSSProperties}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                <th scope="col" style={thL}>캐리어</th>
                <th scope="col" style={th}>높이(바퀴 포함)</th>
                <th scope="col" style={th}>계산기 기준 무게</th>
                <th scope="col" style={thL}>적합한 일정</th>
              </tr>
            </thead>
            <tbody>
              {CARRIER_SIZES.map(c => [
                c.label,
                CARRIER_NOTE[c.id]?.height ?? '',
                Number.isFinite(c.maxTotalKg) ? `~ ${c.maxTotalKg}kg` : `${CARRIER_SIZES[CARRIER_SIZES.length - 2].maxTotalKg}kg 초과`,
                CARRIER_NOTE[c.id]?.fit ?? '',
              ]).map(row => (
                <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="row" style={tdL}>{row[0]}</th>
                  <td style={td}>{row[1]}</td>
                  <td style={td}>{row[2]}</td>
                  <td style={tdNote}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={tableNote}>
          ※ 항공사·노선·좌석 등급별 한도가 다릅니다. 대체로 LCC는 기내 7~10kg·위탁 15~20kg(운임에 따라 추가 요금), 대형 항공사 일반석은 위탁 23kg 1개가 흔하고,
          비즈니스 이상은 개수·무게 한도가 더 큽니다. 기내 수하물은 무게뿐 아니라 세 변의 크기 한도도 함께 보니 예약한 항공사 규정을 확인하세요.
        </div>
      </div>
      <Callout tone="warn" title="위탁하면 안 되는 물건">
        보조배터리·여분 리튬배터리·전자담배·라이터는 위탁 수하물에 넣을 수 없고 몸에 지녀야 합니다. 보조배터리는 2026년 4월 20일부터 ICAO 기준에 따라
        1인당 2개까지만 반입할 수 있고 기내에서 충전·사용이 금지되며, 국토교통부 기내 안전관리 표준안(2025년 3월 1일 시행)에 따라 국적 항공사 항공편에서는
        기내 선반 보관이 금지되고 단자를 절연테이프·파우치로 보호해야 합니다.
        용량(Wh) 확인은 <Link href="/tools/unit/battery">배터리 용량 변환기</Link>에서 할 수 있습니다.
      </Callout>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 크로스링크 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/life/travel-budget" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 예산 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            18 도시 × 3 스타일
          </p>
        </Link>
        <Link href="/tools/life/travel-tip" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>💵</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해외여행 팁 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            19국 × 9 서비스
          </p>
        </Link>
        <Link href="/tools/date/jet-lag" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>✈️</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>시차 적응 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            여행 전·중·후 수면 타이밍
          </p>
        </Link>
      </div>
    </ToolPage>
  )
}
