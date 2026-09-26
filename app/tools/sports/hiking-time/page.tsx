import Link from 'next/link'
import HikingTimeClient from './HikingTimeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import ToolPage from '@/components/ToolPage'
import { MOUNTAINS, FITNESS, SUN_AVERAGES, calculate, fmtDuration, fmtHHMM, type CalcInputs } from './hikingUtils'

export const metadata = buildMetadata({
  path: '/tools/sports/hiking-time',
  title: '등산 시간 계산기 — 100대 명산 프리셋·3공식·일몰 하산 진단',
  description:
    'Naismith·Tobler·한국 코스타임 3공식 + 북한산·설악산·지리산·한라산 등 한국 100대 명산 35+ 프리셋. 일몰 전 하산 진단.',
  keywords: [
    '등산 시간 계산', '등산 소요시간', '산행 시간 계산',
    '북한산 시간', '북한산 백운대 시간', '설악산 시간', '설악산 대청봉 시간',
    '지리산 시간', '지리산 천왕봉', '한라산 시간', '한라산 백록담',
    'Naismith 공식', 'Tobler 공식', '등산 페이스',
    '100대 명산', '한국 명산', '등산 코스', '등산 난이도',
    '턴어라운드 시간', '회귀 시간', '일몰 하산',
    '등산 체력', '산행 페이스', '오르막 속도',
    '백운대 시간', '대청봉 시간', '천왕봉 시간', '백록담 시간',
    '도봉산 시간', '관악산 시간', '청계산 시간', '무등산 시간',
    '소백산 시간', '월악산 시간', '계룡산 시간',
    '등산 안전', '산악구조대', '국립공원 입산',
    '등산 준비물', '등산 체크리스트', '등산 비상',
  ],
})

/* ── 표 공통 ── */
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBg = (i: number) => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

/* ── 가이드 수치 — 도구와 같은 hikingUtils.calculate()로 빌드 시 계산 ── */
const BASE: CalcInputs = {
  distanceKm: 7.0, elevGainM: 720, elevLossM: 720,
  fitness: 'normal', terrain: 'normal', pack: 'day', group: 'solo', weather: 'normal',
  startTime: '09:00', sunsetTime: '18:30', restMode: 'auto', manualRestMin: 0,
}
const calcFor = (over: Partial<CalcInputs>) => calculate({ ...BASE, ...over })

// 인기 명산 — 프리셋 거리·표고차를 세 공식에 넣은 결과 (일반 체력·봄가을·당일 배낭·1인)
const POPULAR_IDS = ['bukhansan-baekun', 'dobongsan', 'gwanaksan', 'seorak-ohsaek', 'jirisan-jungsanri', 'hallasan-seongpan', 'sobaeksan', 'songnisan', 'mudeungsan', 'wolchulsan']
const POPULAR = POPULAR_IDS.map((id) => MOUNTAINS.find((m) => m.id === id)!).filter(Boolean).map((m) => {
  const r = calcFor({ distanceKm: m.distanceKm, elevGainM: m.elevGainM, elevLossM: m.elevLossM })
  return { m, naismith: r.formulas[0].totalMin, tobler: r.formulas[1].totalMin, korean: r.totalMin }
})
// 한국 코스타임 + 휴식이 프리셋 표준 소요시간과 얼마나 맞는지 (전체 프리셋 평균 절대 오차)
const PRESET_ERR = MOUNTAINS.map((m) => {
  const r = calcFor({ distanceKm: m.distanceKm, elevGainM: m.elevGainM, elevLossM: m.elevLossM })
  return Math.abs(r.totalMin / 60 - m.baseHours) / m.baseHours
})
const PRESET_MAE = Math.round((PRESET_ERR.reduce((a, b) => a + b, 0) / PRESET_ERR.length) * 100)

// 계산 예시 — 도구 기본값(7.0km · +720/−720m · 09:00 출발)과 12월 초보·겨울 조건
const EX = calcFor({})
const EX_K = EX.formulas[2]
const DEC_SUNSET = SUN_AVERAGES[11].seoul.set
const EX_WINTER = calcFor({ fitness: 'beginner', weather: 'winter', sunsetTime: DEC_SUNSET })
const EXPERT_SPEEDUP = 1 / FITNESS.find((f) => f.id === 'expert')!.factor

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  padding: '16px 20px',
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Naismith vs Tobler 공식 차이는?',
    a: '<strong style="color:var(--text)">Naismith (1892)</strong>: 가장 오래된 등산 시간 공식. 평지 5km/h + 오르막 600m당 1시간. 단순하지만 내리막 보정이 없어 부정확.<br/><br/><strong style="color:var(--text)">Tobler Function (1993)</strong>: 경사도 함수 기반. 가파른 내리막에서는 오히려 속도가 느려진다는 사실 반영. 최대속도 6km/h가 약간 내리막(기울기 -5%, 약 -2.86°)에서 발생.<br/><br/>두 공식 모두 휴식을 뺀 순수 이동 시간이고, 돌길·계단이 많은 한국 등산로에서는 실제보다 짧게 나오는 경향이 있습니다. 그래서 본 도구는 명산 프리셋의 표준 소요시간에 맞춘 <strong style="color:var(--text)">한국 코스타임</strong> 계수를 기본값으로 쓰고, 두 공식은 비교용으로 함께 보여 줍니다.',
  },
  {
    q: '한국 산에서 평균 페이스는?',
    a: `한국 산은 가파르고 등산로가 좁아 국제 표준(평지 5km/h)보다 느립니다. 본 도구의 계수는 <strong style="color:var(--text)">도구에 넣어 둔 명산 프리셋 ${MOUNTAINS.length}곳의 표준 소요시간</strong>에 맞춘 자체 계수입니다(공식 기준 아님).<ul style="padding-left:20px;margin:8px 0"><li><strong>오르막</strong>: 표고 100m당 약 16분 (≈ 시속 고도 375m)</li><li><strong>내리막</strong>: 표고 100m당 약 7분</li><li><strong>거리</strong>: 1km당 약 10분</li><li><strong>휴식</strong>: 50분 보행마다 10분 (별도 합산)</li></ul>종합하면 휴식을 포함한 평균 속도는 가파른 코스(설악산 오색) 시속 약 1.2km부터 완만한 코스 2km 남짓까지입니다. 체력 등급 &lsquo;전문&rsquo;(×0.70)은 약 ${EXPERT_SPEEDUP.toFixed(1)}배 빠르고, &lsquo;초보&rsquo;(×1.25)는 25% 더 걸립니다.`,
  },
  {
    q: '체력 등급은 어떻게 정하나요?',
    a: '월 산행 빈도와 운동 습관 기준:<ul style="padding-left:20px;margin:8px 0"><li><strong>초보</strong>: 월 1회 이하 / 일상 운동 거의 없음</li><li><strong>일반</strong>: 월 2~4회 / 주 2~3회 가벼운 운동</li><li><strong>상급</strong>: 월 5회+ / 주 4~5회 운동·훈련</li><li><strong>전문</strong>: 트레일러닝·산악인 / 거의 매일 훈련</li></ul>자가 진단이 어려우면 일단 “일반” 선택 후 첫 산행 시간 비교해 조정.',
  },
  {
    q: '오르막 100m가 평지 1km보다 오래 걸리는 이유?',
    a: '<strong style="color:var(--text)">물리적 일량(에너지)이 다르기 때문</strong>입니다. 오르막은 몸무게와 배낭을 중력에 거슬러 들어 올려야 해서, 경사가 가파를수록 같은 거리라도 평지의 몇 배 에너지가 들고 속도도 떨어집니다.<br/><br/>Naismith 공식: 600m 오르막 = 1시간 = 평지 5km. 즉 <strong>오르막 100m ≈ 평지 833m</strong>의 시간 가치. 한국 코스타임 기준은 더 보수적이어서 오르막 100m(약 16분) ≈ 평지 1.6km(약 16분) 수준.<br/><br/>한국에서 거리는 짧아도 표고차가 큰 코스(설악산 오색 9km/1300m 등)는 거리만 보면 안 되고 표고차가 핵심.',
  },
  {
    q: '야간 산행은 얼마나 더 걸리나?',
    a: '일반적으로 <strong style="color:var(--text)">+30%</strong>. 헤드랜턴으로도 시야가 제한되어 길 찾기·균형 잡기·돌멩이 회피가 모두 느려집니다.<br/><br/>또한 <strong style="color:var(--red-600)">위험도가 압도적으로 높음</strong>:<ul style="padding-left:20px;margin:8px 0"><li>길 잃을 확률 ↑↑</li><li>저체온증 위험 (산은 해 진 뒤 급격히 냉각)</li><li>구조 요청 시 발견 어려움</li></ul>야간 산행은 <strong style="color:var(--text)">경험자만</strong>. 초보는 일몰 1시간 전 하산 필수.',
  },
  {
    q: '어린이·노약자 동반 시 보정은?',
    a: '<ul style="padding-left:20px;margin:8px 0"><li><strong>어린이 (초등 이하)</strong>: ×1.30 (30% 추가). 페이스도 느리고 휴식·간식·화장실 자주 필요</li><li><strong>노약자 (60세+ 또는 회복기)</strong>: ×1.20 (20% 추가). 무릎·심장 부담</li></ul>추가 권장:<ul style="padding-left:20px;margin:8px 0"><li>코스: 초급 (북한산 사모바위·관악산 등) 권장</li><li>거리·표고차 절반으로 시작</li><li>중간 휴식 50분 → 30분으로 단축</li><li>물·간식 평소보다 1.5배</li></ul>',
  },
  {
    q: '겨울 산행 추가 시간은?',
    a: '<strong style="color:var(--text)">+20~30%</strong>. 변수가 많아 가장 보수적으로 잡아야 함.<ul style="padding-left:20px;margin:8px 0"><li>아이젠·스패츠 착용 필요 → 페이스 ↓</li><li>눈길 미끄럼 → 균형 잡기 시간 ↑</li><li>적설 시 발 빠짐 (러셀 필요)</li><li>방한복 + 보온병 → 배낭 무게 ↑</li><li>해 짧음 → 12월 서울 일몰 약 17:15 (산속은 더 일찍 어두워짐)</li></ul>본 도구는 겨울 조건에 ×1.20을 적용합니다. 적설이 많거나 러셀이 필요하면 여유를 더 두고, 일몰 시각 1시간 앞당김 + 동계 장비 필수. <strong style="color:var(--red-600)">경험 없는 초보는 동계 산행 자제 권장.</strong>',
  },
  {
    q: '회귀 시간(턴어라운드)이란?',
    a: '<strong style="color:var(--text)">“정상 도달 못 하면 하산해야 하는 시점”</strong>. 산악 등반의 핵심 안전 개념.<br/><br/>예: 일몰 18:30 → 하산 완료 목표 17:30 → 하산에 2시간 걸리는 코스(왕복 약 4시간)라면 정상 도달 마감은 15:30. 15:30까지 정상에 도달 못 하면 그 자리에서 회귀해야 일몰 전 하산 가능.<br/><br/>본 도구는 입력값 기준 자동 계산:<ul style="padding-left:20px;margin:8px 0"><li><strong style="color:var(--emerald-600)">안전</strong>: 일몰 1시간 전 도착</li><li><strong style="color:var(--amber-600)">주의</strong>: 일몰 1시간 전 ~ 일몰 사이 → 헤드랜턴 필수</li><li><strong style="color:var(--red-600)">위험</strong>: 일몰 이후 → 야간 산행으로 전환됨</li></ul>',
  },
]

export default function HikingTimePage() {
  return (
    <ToolPage width={880} slug="/tools/sports/hiking-time">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />등산 시간 계산기
      </h1>
      <p className="tp-lead">
        한국 100대 명산 35+ 프리셋 + 체력·날씨 보정. <strong style={{ color: 'var(--text)' }}>일몰 전 하산</strong> 자동 진단.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="국립공원 입산시간지정제(공원·탐방로별 상이)·자연공원법 제86조제2항 과태료 기준"
        sources={[
          { label: '국립공원공단 — 입산시간지정제', href: 'https://www.knps.or.kr/portal/main/contents.do?menuNo=8000198' },
          { label: '국민재난안전포털 — 산행안전사고 행동요령', href: 'https://www.safekorea.go.kr/safekorea-kor/acts/nacts/action-guide.do?category=mtSafetyAccident&actsHeaderTitle=%EC%82%B0%ED%96%89%EC%95%88%EC%A0%84%EC%82%AC%EA%B3%A0&menuSn=4' },
          { label: '한국천문연구원 — 일출·일몰 시각 계산', href: 'https://astro.kasi.re.kr/life/pageView/9' },
          { label: '산림청', href: 'https://www.forest.go.kr' },
        ]}
      />

      <HikingTimeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 3공식 가이드 */}
        <section>
          <h2 className="g-h2">3개 등산 시간 공식 비교</h2>
          <p className="g-p">
            등산 시간 공식은 &lsquo;거리&rsquo;와 &lsquo;표고차&rsquo;를 어떻게 시간으로 바꾸느냐의 차이입니다. 계산기는 세 공식을 모두 계산해 비교표로 보여 주고,
            결과·일정표·일몰 진단에는 한국 코스타임을 씁니다. 세 공식 모두 같은 보정 계수(체력·지형·배낭·인원·날씨)가 곱해집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['공식', '발표', '계산 방식', '휴식', '특징'].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Naismith Rule',   '1892', '평지 5km/h + 오르막 600m당 1시간', '미포함', '가장 오래된 기준. 내리막 보정이 없어 한국 산에서는 짧게 나옴'],
                  ['Tobler 보행 함수', '1993', '속도 = 6·e^(−3.5·|경사+0.05|) km/h', '미포함', '약한 내리막(−5%)에서 최고 속도. 도구는 거리 절반씩을 오르막·내리막으로 단순화'],
                  ['한국 코스타임',   '자체 보정', '1km당 10분 + 오르막 100m당 16분 + 내리막 100m당 7분', '50분마다 10분', `도구 기본값. 명산 프리셋 ${MOUNTAINS.length}곳 표준 시간과 평균 오차 약 ${PRESET_MAE}%`],
                ].map(([name, year, assumption, rest, note], i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{name}</td>
                    <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{year}</td>
                    <td style={td}>{assumption}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{rest}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 한국 코스타임 계수는 공식 기관이 정한 기준이 아니라, 도구에 넣어 둔 명산 프리셋의 표준 소요시간(일반 페이스·휴식 포함)에 맞춘 경험 계수입니다.
          </p>
        </section>

        {/* 1-1. 계산 예시 */}
        <section>
          <h2 className="g-h2">계산 예시 — 기본값을 한 줄씩 풀어 보면</h2>
          <p className="g-p">
            계산기를 처음 열면 들어 있는 값은 왕복 {BASE.distanceKm.toFixed(1)}km · 오르막 {BASE.elevGainM}m · 내리막 {BASE.elevLossM}m · {BASE.startTime} 출발 · 일몰 {BASE.sunsetTime}입니다(북한산 백운대 프리셋과 같은 조건).
            한국 코스타임으로 거리 {Math.round(EX_K.flatMin)}분 + 오르막 {Math.round(EX_K.ascendMin)}분 + 내리막 {Math.round(EX_K.descendMin)}분 = 이동 {fmtDuration(EX.movingMin)}이고,
            50분 걸을 때마다 10분씩 쉰다고 보면 휴식 {EX.restMin}분이 붙어 총 <strong>{fmtDuration(EX.totalMin)}</strong>, 하산 완료는 <strong>{fmtHHMM(EX.arrivalMinutes)}</strong>입니다.
            일몰 1시간 전({fmtHHMM(EX.turnaroundMinutes)})보다 이르므로 &lsquo;안전&rsquo;으로 판정됩니다.
          </p>
          <p className="g-p">
            같은 코스를 12월(서울 평균 일몰 {DEC_SUNSET})에 &lsquo;초보(×1.25)&rsquo;·&lsquo;겨울(×1.20)&rsquo; 조건으로 가면 보정 계수가 {EX_WINTER.appliedFactor.toFixed(2)}배가 되어
            이동 {fmtDuration(EX_WINTER.movingMin)} + 휴식 {EX_WINTER.restMin}분 = <strong>{fmtDuration(EX_WINTER.totalMin)}</strong>, 하산 완료 {fmtHHMM(EX_WINTER.arrivalMinutes)}입니다.
            기준선({fmtHHMM(EX_WINTER.turnaroundMinutes)})까지 {Math.round(EX_WINTER.turnaroundMinutes - EX_WINTER.arrivalMinutes)}분밖에 남지 않아, 정체나 미끄러운 구간이 한 번만 있어도
            주의 구간으로 넘어갑니다. 겨울에는 출발을 1시간 앞당기는 것이 가장 확실한 대책입니다.
          </p>
          <Callout tone="tip" title="보정은 곱해진다">
            체력·지형·배낭·인원·날씨 계수는 더하지 않고 곱합니다. 초보(×1.25)가 어린이 동반(×1.30)으로 겨울(×1.20) 산행을 하면 {(1.25 * 1.3 * 1.2).toFixed(2)}배로,
            평소 4시간 코스가 8시간 가까이 걸린다는 뜻입니다. 이 경우 코스 자체를 짧게 바꾸는 편이 안전합니다.
          </Callout>
        </section>

        {/* 2. 보정 가이드 */}
        <section>
          <h2 className="g-h2">보정 계수 가이드</h2>
          <p className="g-p">
            기본 공식 외에 본인 상황에 맞는 5가지 보정을 적용해 정확도를 높입니다. 각 보정은 곱 연산되므로 여러 개가 겹치면 누적 효과가 큽니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['카테고리', '항목', '보정값', '설명'].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['체력', '초보 / 일반 / 상급 / 전문',     '×1.25 / 1.0 / 0.85 / 0.70', '월 산행 빈도 기준'],
                  ['지형', '포장·일반·계단·암릉·너덜',    '×0.85 ~ 1.40',              '한국 산은 계단·암릉 많음'],
                  ['배낭', '당일 5kg / 1박 15kg / 장기 30kg', '×1.0 / 1.10 / 1.30',     '무거울수록 오르막에서 크게 느려짐'],
                  ['인원', '1인·2~3인·4~6인·어린이·노약자', '×1.0 ~ 1.30',              '가장 느린 사람 기준'],
                  ['날씨', '봄가을·여름·겨울·우천·야간',  '×1.0 ~ 1.30',              '한 가지만 선택 — 겹치면 여유를 더 둘 것'],
                ].map(([cat, item, factor, desc], i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700 }}>{cat}</td>
                    <td style={td}>{item}</td>
                    <td style={{ ...td, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{factor}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 인기 명산 시간표 — 프리셋을 세 공식에 넣은 결과 */}
        <section>
          <h2 className="g-h2">한국 인기 명산 — 공식별 예상 시간</h2>
          <p className="g-p">
            아래는 계산기 프리셋의 왕복 거리·표고차를 세 공식에 그대로 넣은 결과입니다(일반 체력·봄가을·당일 배낭·1인). Naismith·Tobler는 휴식을 뺀 이동 시간이라
            한국 코스타임(휴식 포함)보다 한두 시간 이상 짧게 나옵니다. 표고차가 큰 설악산·지리산일수록 그 차이가 커지는데, 가파른 돌길 내리막을 빠르게 걷는다고
            가정하는 해외 공식의 한계가 드러나는 부분입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 620 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['산 · 코스', '왕복', '오르막', '난이도', 'Naismith', 'Tobler', '한국 코스타임', '프리셋 표준'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...th, textAlign: i === 0 || i === 3 ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POPULAR.map(({ m, naismith, tobler, korean }, i) => (
                  <tr key={m.id} style={rowBg(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700 }}>{m.name}</td>
                    <td style={tdNum}>{m.distanceKm}km</td>
                    <td style={tdNum}>{m.elevGainM.toLocaleString()}m</td>
                    <td style={td}>{m.difficulty}</td>
                    <td style={{ ...tdNum, color: 'var(--muted)' }}>{fmtDuration(naismith)}</td>
                    <td style={{ ...tdNum, color: 'var(--muted)' }}>{fmtDuration(tobler)}</td>
                    <td style={{ ...tdNum, fontWeight: 700 }}>{fmtDuration(korean)}</td>
                    <td style={tdNum}>{m.baseHours}시간</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 프리셋 거리·표고차는 대표 들머리 기준 근삿값이라 실제 탐방로 안내판의 거리와 조금 다를 수 있습니다. 산행 전 국립공원공단·지자체 안내의 코스 거리를 확인하세요.
          </p>
        </section>

        {/* 4. 일몰 전 하산 안전 체크리스트 */}
        <section>
          <h2 className="g-h2">일몰 전 하산 안전 체크리스트</h2>
          <p className="g-p">
            안내판이나 지도에 적힌 코스타임이 내 실제 산행 시간과 어긋나는 것은 자연스러운 일입니다. 코스타임은 산출 기준이 통일되어 있지 않아
            휴식·식사가 빠진 순 보행 시간인 경우가 많고, 어떤 체력의 보행자를 가정했는지도 자료마다 다릅니다. 같은 코스라도 당일 컨디션과 배낭 무게,
            비 온 뒤 진창이나 겨울 빙판 같은 노면 상태, 성수기 좁은 구간의 정체, 사진 촬영·간식 같은 비보행 시간에 따라 결과가 크게 달라집니다.
          </p>
          <p className="g-p">
            그래서 안전 계획은 &ldquo;몇 시에 출발할까&rdquo;가 아니라 <strong style={{ color: 'var(--text)' }}>일몰 시각에서 거꾸로 계산</strong>하는
            것이 원칙입니다. 예상 시간에 여유를 더해 하산 완료 시각을 먼저 정하고, 아래 FAQ의 회귀 시간(턴어라운드) 개념으로 정상 포기 시점까지 미리
            정해 두면 시간이 어긋나도 판단이 흔들리지 않습니다.
          </p>
          <p className="g-p">
            <strong>국립공원은 입산 가능 시간이 정해져 있습니다.</strong> 국립공원공단은 산행 목적지·거리·산행시간을
            고려해 탐방로별로 입산·통제 시간을 지정하는 <strong>입산시간지정제</strong>를 운영합니다. 2013년 3월
            지리산에서 처음 시행됐고, 2015년 5월 16일부터 태안해안을 제외한 전국 국립공원으로 확대됐습니다. 일부 탐방로는 &ldquo;일몰 후부터 다음 날
            일출 2시간 전까지&rdquo; 탐방이 제한되며, 시간대는 공원·탐방로마다 다릅니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['탐방로 예시', '하절기', '동절기'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['북한산',              '04:00~17:00 (3~11월)',  '04:00~16:00 (12~2월)'],
                  ['속리산 법주사~문장대', '04:00~15:00 (4~10월)',  '05:00~14:00 (11~3월)'],
                ].map(([trail, summer, winter], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{trail}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{summer}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{winter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            위 표처럼 같은 &lsquo;동절기&rsquo;라도 공원마다 기간·시간이 다르므로(국립공원공단, 2026년 7월 확인) 산행 전 반드시 공단 홈페이지의
            입산시간지정제·탐방로 통제정보에서 해당 코스를 확인하세요. 야간 산행 제한은 자연공원법 제28조제1항(출입 금지·제한)에 근거한 공원별
            공고로 시행되며, 제한·금지된 구역에 출입하면 같은 법 제86조제2항에 따라 <strong style={{ color: 'var(--text)' }}>50만원 이하의
            과태료</strong>(시행령 별표 3: 1차 20만·2차 30만·3차 50만원)가 부과될 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '체크 항목'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['산행 전',        '기상 상태 확인 · 등산지도, 통신장비, 랜턴, 우의, 상비약품, 비상식량, 휴대전화 예비 배터리 준비 · 방수·통기성 좋은 등산화 착용'],
                  ['시간 계획',      '아침 일찍 출발해 해지기 한두 시간 전에 산행 종료 · 하루 산행은 8시간 이내로'],
                  ['페이스',         '체력의 30%는 비축 · 일행 중 약한 사람 기준으로 산행'],
                  ['하지 말 것',     '지정 등산로 밖 산행 · 음주 산행 · 단독 산행'],
                  ['길을 잃었을 때', '계곡을 피해 능선으로 이동'],
                  ['조난 신고',      '등산로의 산악위치표지판·국가지점번호를 확인해 즉시 119 신고 · 표지판이 안 보이면 지도 앱이나 카카오톡 위치전송으로 위치 전달'],
                ].map(([phase, items], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{phase}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 체크 항목: 국민재난안전포털(소방청) 산행안전사고 행동요령 · 조난 신고 요령: 소방청 보도자료(2022-10). 산림청도 산행 안전수칙
            &lsquo;NEED&rsquo;에서 날씨·입산통제 확인(Notice), 장비 준비(Equip), 낙석 위험 구간 회피(Escape)와 함께 체력에 맞는 코스 선택과
            1시간 정도 이른 하산(Descent)을 권고합니다(2026년 3월).
          </p>
        </section>

        {/* 5. FAQ */}
        <section>
          <Faq items={FAQ} />
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/sports/race-predictor', icon: '🏃', name: '마라톤 기록 계산기', desc: 'Riegel·VDOT 3공식' },
              { href: '/tools/sports/pace', icon: '⏱️', name: '러닝 페이스 계산기', desc: '페이스↔시간 변환' },
              { href: '/tools/sports/interval-training', icon: '🔁', name: '인터벌 훈련 계산기', desc: 'VDOT 기반 훈련' },
              { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '등산 칼로리 추정' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
