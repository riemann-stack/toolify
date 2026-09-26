import Link from 'next/link'
import FightWeightClient from './FightWeightClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/sports/fight-weight',
  title: '격투기 체급 계산기 — 복싱·UFC·MMA 감량 계획 D-day',
  description:
    '복싱·UFC·MMA 체급별 감량 계획과 D-day 일정 + 위험도 자동 경고. 안전 감량 페이스와 수분·근육량 손실 시뮬.',
  keywords: ['격투기체급계산기', 'UFC체급', '복싱체급', 'MMA감량', '계체감량', '격투기감량계획', '체급별감량', 'UFC라이트급', '복싱웰터급'],
})

/* ── 표 공통 스타일 ── */
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top' }
const tdNum: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBg = (i: number) => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const f1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1)
const f2 = (v: number) => (Math.round(v * 100) / 100).toFixed(2)

/* ── 계산기와 같은 규칙으로 빌드 시 계산 (FightWeightClient의 evalRisk·단계 분리와 동일) ──
   위험도: 주당 감량 ÷ 현재 체중 ≤1% 안전 · ≤1.5% 주의 · ≤2% 위험 · 초과 매우 위험
   단계 분리: 수분 감량 허용 단체는 체지방 70% + 수분 30%, ONE은 100% 체지방
   체급 상향 권고: '매우 위험'이거나 필요 감량이 체중의 7% 초과 */
const RISK_BANDS: { max: number; label: string }[] = [
  { max: 1.0, label: '안전' },
  { max: 1.5, label: '주의' },
  { max: 2.0, label: '위험' },
  { max: Infinity, label: '매우 위험' },
]
const riskLabel = (weeklyPct: number) => RISK_BANDS.find((b) => weeklyPct <= b.max)!.label

const PLAN_W = 80
const PLAN_DAYS = 30
const PLAN_ROWS = [
  { org: 'UFC', cls: '웰터급', limit: 77.1, water: true },
  { org: 'ONE', cls: '라이트급', limit: 77.1, water: false },
  { org: '복싱', cls: '슈퍼미들급', limit: 76.2, water: true },
  { org: '복싱', cls: '미들급', limit: 72.57, water: true },
  { org: 'UFC', cls: '라이트급', limit: 70.3, water: true },
].map((r) => {
  const need = PLAN_W - r.limit
  const weekly = (need / PLAN_DAYS) * 7
  const pct = (weekly / PLAN_W) * 100
  const waterKg = r.water ? need * 0.3 : 0
  return {
    ...r, need, weekly, pct,
    risk: riskLabel(pct),
    waterKg,
    waterPct: (waterKg / PLAN_W) * 100,
    moveUp: riskLabel(pct) === '매우 위험' || need / PLAN_W > 0.07,
  }
})

// 감량 필요량별 기간 — 체중 80kg에서 주당 체중의 1% · 1.5% · 2%씩 뺄 때
const PACE_PCTS = [1, 1.5, 2]
const PACE_ROWS = [2, 4, 6, 8, 10].map((kg) => ({ kg, weeks: PACE_PCTS.map((p) => kg / (PLAN_W * p / 100)) }))

const FAQ_LD = [
              {
                q: '복싱과 UFC의 체급은 같은가요?',
                a: '다릅니다. 프로 복싱은 <strong>17체급</strong>(미니멈웨이트~헤비급)으로 세분화되어 있고(WBC는 2020년 크루저급과 헤비급 사이에 브리저급을 신설), UFC는 <strong>9개 한도</strong>(스트로급~헤비급)로 단순합니다. 같은 69kg이라도 복싱은 슈퍼웰터급(69.85kg), UFC는 라이트급(70.3kg)에 해당합니다. 이름이 같은 체급도 단체마다 한도가 크게 달라, 플라이급은 복싱 50.8kg · UFC 56.7kg · ONE 61.2kg입니다.',
              },
              {
                q: '격투기 선수들은 왜 그렇게 많이 감량하나요?',
                a: '자기보다 가벼운 선수와 싸워 <strong>체격 우위</strong>를 얻기 위해서입니다. 계체가 경기 전날인 단체에서는 계체 직전 수분을 빼 한도를 맞춘 뒤, 경기까지 30시간 남짓 동안 체중을 상당 부분 되찾고 링에 오르는 방식이 흔합니다. 결과적으로 실제 경기 체중은 계체 한도보다 무겁습니다. 다만 이 관행은 탈수 사고의 주원인이라, ONE처럼 수분 상태를 검사해 원천적으로 막는 단체도 있습니다.',
              },
              {
                q: '안전한 감량 속도는 어느 정도인가요?',
                a: '근육 손실을 줄이려면 <strong>주당 체중의 0.5~1%</strong> 속도가 흔히 권장되고, 본 도구도 1%까지를 &lsquo;안전&rsquo;으로 봅니다. 체중 80kg이면 주당 0.8kg, 한 달 약 3.4kg입니다. 1.5%를 넘으면 근손실·피로 누적이 커지고, 2%를 넘는 속도는 대개 체지방이 아니라 수분이 빠지고 있다는 뜻이어서 &lsquo;매우 위험&rsquo;으로 표시합니다.',
              },
              {
                q: '수분 감량은 어떻게 하나요?',
                a: '일반적으로 시합 1주일 전부터 단계적으로 진행됩니다.<br/>• <strong>D-7~D-3</strong>: 나트륨 제한 → 체수분 자연 배출<br/>• <strong>D-3~D-1</strong>: 탄수화물 제한 → 글리코겐 저장 수분 배출<br/>• <strong>D-1</strong>: 수분 제한 + 사우나·뜨거운 욕조 → 발한<br/>이 과정은 설명을 위한 것이고 따라 할 방법이 아닙니다. 체중의 2% 정도만 탈수돼도 경기력이 떨어지고, 그 이상이면 열사병·급성 신장 손상·부정맥 위험이 커집니다. 사우나·땀복·이뇨제로 급격히 뺀 선수의 사망 사례도 있어 반드시 전문가 감독이 필요하며, 청소년·아마추어는 수분 감량 없이 계체를 통과할 수 있는 체급을 고르는 것이 안전합니다.',
              },
              {
                q: 'ONE Championship의 체중 정책은 무엇인가요?',
                a: 'ONE은 2015년 12월 소속 선수 양젠빙이 감량 중 숨진 뒤 <strong>탈수를 통한 체중 감량을 사실상 금지</strong>했습니다. 계체 때 체중과 함께 소변 비중(USG) 검사로 수분 상태를 확인해, 탈수 상태면 체중이 맞아도 통과시키지 않습니다. 그래서 ONE의 체급 한도는 같은 이름의 UFC 체급보다 한 단계 무겁게 잡혀 있습니다(예: ONE 라이트급 77.1kg = UFC 웰터급 한도). 본 도구도 ONE을 고르면 수분 단계 없이 전량 체지방 감량으로 계획합니다.',
              },
              {
                q: '체지방률이 낮은데도 무리한 감량이 가능할까요?',
                a: '<strong>매우 위험합니다.</strong> 생명 유지에 필요한 필수 지방은 남성 약 2~5%, 여성 약 10~13%로, 이미 체지방이 낮은 상태에서 더 빼면 대부분 <strong>근육과 수분</strong>에서 빠집니다. 그 결과 근력·지구력이 떨어지고 호르몬·면역 기능에도 부담이 갑니다. 이 경우 체급을 한 단계 위로 올리거나 평소 체중 자체를 천천히 늘리는(벌크업) 장기 전략이 맞습니다.',
              },
              {
                q: '재수화는 어떻게 해야 하나요?',
                a: '계체 직후 한 번에 물 1L 이상을 들이키면 구토·위장 불편이 생기기 쉽고, 전해질 없이 물만 많이 마시면 저나트륨혈증 위험도 있습니다. 권장 순서 —<br/>① <strong>0~30분</strong>: 전해질 음료(나트륨·칼륨 포함) 500~750ml를 천천히<br/>② <strong>30분~3시간</strong>: 탄수화물 + 수분을 나눠서<br/>③ <strong>3~24시간</strong>: 일반식 점진 복귀, 단백질·지방 추가<br/>정맥 수액은 WADA 금지목록(M2.2)상 12시간당 100mL를 넘으면 치료 목적 외에는 금지되고, UFC도 반도핑 정책으로 계체 후 IV 수액을 제한해 왔습니다. 단체마다 규정이 다르고 바뀔 수 있으니 출전 전 최신 규정을 확인하고, 경구 재수화를 기본으로 계획하세요.',
              },
              {
                q: '체중을 매일 어떻게 측정해야 정확한가요?',
                a: '아침 기상 직후, 화장실 다녀온 후, <strong>옷을 벗고 빈 위장</strong> 상태에서 측정합니다. 같은 체중계로 같은 시각에 매일 측정해야 추세를 정확히 볼 수 있습니다. 하루 사이 체중은 수분·음식·소화 상태로 1~2kg 출렁이므로 <strong>3~5일 평균</strong>을 추세로 봐야 합니다. 시합 직전에는 대회장 공식 체중계와 평소 체중계의 차이를 미리 점검하는 것이 중요합니다.',
              },
              {
                q: '아마추어·체육관 시합에서도 본 도구를 써도 되나요?',
                a: '체급 한계 자체는 단체별 규정을 따라야 합니다(아마추어 복싱은 World Boxing 등 소속 단체 규정, MMA는 단체별 차이). 본 도구의 <strong>감량 일정·위험도 평가</strong>는 체중 대비 감량 속도라는 일반 원칙에 기반하므로 아마추어에도 적용할 수 있습니다. 다만 아마추어 시합은 당일 계체가 많아 재수화 시간이 거의 없으므로 <strong>수분 감량보다 체지방 감량 위주</strong>로 평소 체중을 체급 한도 +3kg 이내로 유지하는 것이 안전합니다.',
              },
              {
                q: '여성 선수의 감량 시 유의점은?',
                a: '여성은 월경주기에 따라 체수분이 늘었다 줄며 체중이 1kg 안팎 오르내리는 경우가 흔합니다. 계체일이 생리 직전과 겹치면 같은 체지방이라도 계체 체중이 무겁게 나올 수 있으니 주기를 계획에 반영하세요. 또 섭취 에너지가 훈련량을 오래 따라가지 못하면 월경 불순·골밀도 저하로 이어질 수 있습니다(상대적 에너지 결핍, RED-S). 체중계 숫자보다 월경 규칙성·컨디션·근력 유지를 우선 지표로 삼는 것이 안전합니다.',
              },
              {
                q: '체중 감량 중 운동은 어떻게 해야 하나요?',
                a: '단계별로 다릅니다.<br/>• <strong>체지방 감량기</strong> — 근력 운동 주 3~4회 + 유산소 주 4~5회. 근력 유지가 핵심이므로 평소 쓰던 중량을 최대한 유지.<br/>• <strong>수분 감량기</strong> — 강도 ↓, 기술·스파링 위주. 무리한 유산소는 탈수·실신 위험.<br/>• <strong>시합 3일 전~D-1</strong> — 가벼운 쉐도우·줄넘기·스트레칭만. 부상·컨디션 망가뜨릴 강한 운동 금지.',
              },
            ]

export default function FightWeightPage() {
  return (
    <ToolPage width={760} slug="/tools/sports/fight-weight">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />격투기 체급 계산기
      </h1>
      <p className="tp-lead">
        복싱·UFC·MMA 체급별 <strong style={{ color: 'var(--text)' }}>감량 계획과 D-day 일정</strong> + 위험도 자동 경고.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="체급 한도는 각 단체 규정(UFC·프로 복싱·ONE·K-1·IJF·UWW·WT) · 계체 시각·재수화 절차는 대표적인 운영 방식이라 출전 전 단체 최신 규정 확인 필요 · 위험도는 주당 감량 ÷ 체중(1%·1.5%·2% 구간) · 탈수 기준은 ACSM 수분 보충 입장문(체중 2% 초과 수분 손실 시 수행 능력 저하) · 정맥 수액은 WADA 금지목록 M2.2"
        sources={[
          { label: 'ACSM 입장문 — Exercise and Fluid Replacement (2007, PubMed)', href: 'https://pubmed.ncbi.nlm.nih.gov/17277604/' },
          { label: 'WADA 금지목록 (M2.2 정맥 주입)', href: 'https://www.wada-ama.org/en/prohibited-list' },
          { label: '국제유도연맹(IJF)', href: 'https://www.ijf.org' },
        ]}
      />

      <FightWeightClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 면책 강조 ── */}
        <Callout tone="warn" title="시작 전 반드시 읽어주세요">
          본 계산기는 격투기 체급과 감량 일정을 계획하기 위한 참고용 도구입니다.
          급격한 체중 감량은 <strong>심혈관·신장·신경계에 심각한 손상</strong>을 일으킬 수 있으며,
          실제 격투기 선수 사망 사례가 여러 건 보고되어 있습니다.
          실제 감량은 반드시 자격을 갖춘 <strong>트레이너·영양사·의사 감독</strong> 하에 체계적으로 진행하시기 바랍니다.
        </Callout>

        {/* ── 2. 계산 방식 ── */}
        <div>
          <h2 className="g-h2">이 계산기가 감량 계획을 세우는 방식</h2>
          <p className="g-p">
            먼저 현재 체중과 목표 체급 한도의 차이로 <strong>필요 감량</strong>을 구합니다. 목표 체급을 고르지 않으면 지금 체중보다 한 단계 가벼운 체급을
            기본 목표로 잡습니다. 이 양을 계체일까지 남은 날수로 나눠 7을 곱하면 주당 감량이 되고, 이를 현재 체중으로 나눈 비율로 위험도를 매깁니다
            (1% 이하 안전 · 1.5% 이하 주의 · 2% 이하 위험 · 그 이상 매우 위험).
          </p>
          <p className="g-p">
            일정표는 필요 감량의 70%를 체지방 단계에, 30%를 마지막 수분 단계에 배정합니다. 계체까지 14일 이상 남으면 수분 단계는 마지막 7일이고,
            그보다 짧으면 남은 기간을 반씩 나눕니다. ONE Championship은 탈수 계체가 불가능하므로 전량을 체지방 단계로 계획합니다. 수분 단계 몫이 체중의
            2% 이상이거나, 7일 이내에 체중의 1%보다 많이 빼야 하면 급속 감량 경고를 띄우고, &lsquo;매우 위험&rsquo;이거나 필요 감량이 체중의 7%를 넘으면
            한 단계 위 체급을 권합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <caption style={{ captionSide: 'top', textAlign: 'left', fontSize: 13, color: 'var(--muted)', padding: '0 0 8px' }}>
                체중 {PLAN_W}kg 남성, 계체까지 {PLAN_DAYS}일 남았을 때 (계산기와 같은 규칙으로 계산)
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>목표 체급</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>필요 감량</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>주당 (체중 대비)</th>
                  <th scope="col" style={th}>위험도</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>수분 단계 몫</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_ROWS.map((r, i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 600 }}>{r.org} {r.cls} ({r.limit}kg)</td>
                    <td style={tdNum}>{f2(r.need)}kg</td>
                    <td style={tdNum}>{f2(r.weekly)}kg ({f1(r.pct)}%)</td>
                    <td style={{ ...td, fontWeight: 600, color: r.risk === '안전' ? 'var(--success)' : r.risk === '주의' ? 'var(--warning)' : 'var(--danger)' }}>
                      {r.risk}{r.moveUp ? ' · 체급 상향 권고' : ''}
                    </td>
                    <td style={tdNum}>{r.water ? `${f2(r.waterKg)}kg (${f1(r.waterPct)}%)` : '없음 (ONE)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            같은 77.1kg 한도라도 UFC 웰터급은 마지막 주에 수분으로 일부를 빼는 계획이, ONE 라이트급은 한 달 내내 체지방으로만 빼는 계획이 나옵니다.
            UFC 라이트급처럼 한 달에 10kg 가까이 빼야 하는 목표는 주당 체중의 2%를 크게 넘어, 일정을 늘리거나 체급을 올려야 합니다.
          </p>
        </div>

        {/* ── 3. 종목별 체급 비교 ── */}
        <div>
          <h2 className="g-h2">종목별 체급 비교 — 체중 69kg 기준</h2>
          <p className="g-p">
            같은 체중이라도 종목·단체마다 들어가는 체급이 다릅니다. 69kg 남성이 감량 없이 출전할 수 있는 가장 가벼운 체급은 다음과 같습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>종목·단체</th>
                  <th scope="col" style={th}>체급</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>한도</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { sport: '프로 복싱', cls: '슈퍼웰터급', limit: '69.85kg (154lb)' },
                  { sport: 'UFC', cls: '라이트급', limit: '70.3kg (155lb)' },
                  { sport: 'ONE', cls: '페더급', limit: '70.3kg (수분 검사 계체)' },
                  { sport: '킥복싱 (K-1)', cls: '슈퍼웰터급', limit: '70.0kg' },
                  { sport: '유도 (IJF)', cls: '-73kg급', limit: '73.0kg' },
                  { sport: '태권도 (WT)', cls: '-74kg급', limit: '74.0kg' },
                ].map((c, i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 600 }}>{c.sport}</td>
                    <td style={td}>{c.cls}</td>
                    <td style={tdNum}>{c.limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">이름이 같아도 한도는 다르다</h3>
          <p className="g-p">
            &lsquo;라이트급&rsquo;이라는 이름만 보고 체급을 짐작하면 크게 틀립니다. 복싱·킥복싱은 체급이 촘촘하고 가볍게 시작하며, ONE은 평소 체중으로 계체하는
            대신 같은 이름 체급의 한도를 UFC보다 한 단계 무겁게 잡았습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['체급 이름', '프로 복싱', 'K-1', 'UFC', 'ONE'].map((h, i) => (
                    <th scope="col" key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['플라이급', '50.80', '— (여 52.0)', '56.7', '61.2'],
                  ['밴텀급', '53.52', '53.0', '61.2', '65.8'],
                  ['페더급', '57.15', '57.5', '65.8', '70.3'],
                  ['라이트급', '61.23', '62.5', '70.3', '77.1'],
                  ['웰터급', '66.68', '67.5', '77.1', '83.9'],
                ].map((r, i) => (
                  <tr key={r[0]} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 600 }}>{r[0]}</td>
                    {r.slice(1).map((v, j) => <td key={j} style={tdNum}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">단위 kg. 복싱·UFC는 lb가 공식 단위(예: 복싱 라이트급 135lb, UFC 라이트급 155lb)이고 kg은 환산값입니다.</p>
        </div>

        {/* ── 4. 격투기 감량 3단계 가이드 ── */}
        <div>
          <h2 className="g-h2">격투기 감량의 3단계 완전 가이드</h2>
          <div style={{ marginBottom: 12 }}>
            <Callout tone="warn">
              아래는 <strong>실행 매뉴얼이 아니라 위험을 이해하기 위한 설명</strong>입니다. 특히 2단계 수분 감량(나트륨·수분 제한·사우나)은 탈수·신장 손상·심정지로 이어질 수 있어, <strong>반드시 전문 코치·영양사·스포츠의학 전문의 감독</strong> 하에서만 진행해야 합니다. 청소년·아마추어는 수분 감량보다 평소 체중을 체급 한도 가까이 유지하는 방식을 권장합니다.
            </Callout>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--orange-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--orange-600)', fontWeight: 700, marginBottom: 6 }}>1단계 · 체지방 감량 (D-30 ~ D-7)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>하루 칼로리 적자 500kcal 안팎</li>
                <li>유산소 + 근력 운동 병행</li>
                <li>단백질 섭취 유지 (체중 1kg당 약 2g)</li>
                <li>주당 체중의 1% 이내 감량</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cyan-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--cyan-600)', fontWeight: 700, marginBottom: 6 }}>2단계 · 수분 감량 (D-7 ~ D-1)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>나트륨 제한 (D-5 전후)</li>
                <li>탄수화물 제한 (D-3 전후)</li>
                <li>수분 제한·발한 (D-1)</li>
                <li>짧은 기간에 수 kg이 빠지지만 탈수 위험이 가장 큰 단계</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--emerald-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--emerald-600)', fontWeight: 700, marginBottom: 6 }}>3단계 · 재수화 (계체 후 ~ 시합)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>경구 재수화가 기본 — 전해질 음료를 천천히 (정맥 수액은 WADA M2.2가 12시간당 100mL 초과를 금지, UFC도 제한해 옴)</li>
                <li>탄수화물을 나눠서 보충</li>
                <li>계체와 경기 사이가 길수록 되찾는 체중이 큼 (당일 계체 종목은 거의 회복 불가)</li>
                <li>ONE은 계체 때 수분 상태를 검사하므로 이 단계가 사실상 없음</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. 단체별 정책 비교표 ── */}
        <div>
          <h2 className="g-h2">종목·단체별 감량·계체 정책 비교</h2>
          <p className="g-p">
            감량 전략은 &lsquo;계체 뒤 경기까지 몇 시간이 있느냐&rsquo;로 거의 결정됩니다. 재수화 시간이 짧은 종목일수록 수분으로 뺀 체중을 되찾을 수 없어,
            탈수 상태 그대로 경기를 치르게 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단체', '계체 시각', '재수화 시간', '특이사항'].map((h, i) => (
                    <th scope="col" key={i} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { o: 'UFC',            t: '경기 전날 오전',              r: '약 30~36시간', x: '비타이틀전은 한도 +1lb까지 허용(타이틀전은 정확히) · 계체 후 IV 수액은 반도핑 정책으로 제한해 옴(최신 규정 확인)' },
                  { o: 'ONE Championship', t: '공식 계체 시 체중·소변 비중 동시 검사', r: '필요 없음', x: '탈수 상태로는 계체 통과 불가 — 2015년 12월 이후 탈수 감량을 금지하고, 소변 비중 검사에서 수분 상태가 미달이면 체중이 맞아도 불통과' },
                  { o: '프로 복싱',       t: '대개 경기 전날',              r: '24~36시간',    x: 'IBF는 경기 당일 아침 재계체(한도 +10lb 이내)' },
                  { o: '주짓수 (IBJJF)',  t: '첫 경기 직전, 도복 착용',      r: '사실상 없음',  x: '평소 체중 그대로 출전' },
                  { o: '유도 (IJF)',      t: '전날 저녁 공식 + 당일 아침 무작위', r: '제한적', x: '무작위 계체에서 한도의 5%를 넘으면 실격' },
                  { o: '레슬링 (UWW)',    t: '경기 당일 아침',              r: '수 시간',      x: '이틀째 경기자는 둘째 날 아침 재계체(2kg 허용)' },
                ].map((r, i) => (
                  <tr key={i} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.o}</td>
                    <td style={td}>{r.t}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.r}</td>
                    <td style={{ ...td, color: 'var(--muted)', fontSize: 12 }}>{r.x}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 체급 한계는 각 단체 공식 규정 기준(UFC·복싱 WBC/WBA/IBF/WBO·유도 IJF·레슬링 UWW·태권도 WT·ONE Championship), 계체·재수화 시간은 대표적인 국제 대회 운영 방식 기준입니다(기준 2026 · 출전 전 단체 최신 규정 확인). 단체·대회·아마추어/프로에 따라 달라지니 출전 규정을 반드시 확인하세요.
          </p>
        </div>

        {/* ── 6. 감량 필요량별 권장 기간 ── */}
        <div>
          <h2 className="g-h2">감량 필요량별 권장 기간 — 한눈에 보기</h2>
          <p className="g-p">
            체중 {PLAN_W}kg 선수가 주당 체중의 1%·1.5%·2%씩 뺄 때 필요한 주 수입니다(필요 감량 ÷ 주당 감량). 계산기의 위험도 구간 경계와 같은 비율이라,
            계체일이 표의 &lsquo;안전&rsquo; 열보다 가까우면 계산기는 주의 이상으로 표시합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={th}>감량 필요</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>안전 (1%/주 · {f1(PLAN_W * 0.01)}kg)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>주의 (1.5%/주 · {f1(PLAN_W * 0.015)}kg)</th>
                  <th scope="col" style={{ ...th, textAlign: 'right' }}>위험 (2%/주 · {f1(PLAN_W * 0.02)}kg)</th>
                </tr>
              </thead>
              <tbody>
                {PACE_ROWS.map((r, i) => (
                  <tr key={r.kg} style={rowBg(i)}>
                    <td style={{ ...td, fontWeight: 700 }}>{r.kg}kg</td>
                    {r.weeks.map((w, j) => <td key={j} style={tdNum}>{f1(w)}주</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 체지방 감량만 고려한 값입니다. 체중이 줄수록 같은 1%의 kg 값도 작아지므로 실제로는 표보다 조금 더 걸립니다.
          </p>
        </div>

        {/* ── 7. 감량 단계별 영양 가이드 ── */}
        <div>
          <h2 className="g-h2">감량 단계별 영양·식단 가이드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                stage: '체지방 감량기 (D-30 ~ D-7)',
                color: 'var(--orange-600)',
                items: [
                  '단백질 — 체중 1kg당 약 2g (근손실 방지 핵심)',
                  '탄수화물 — 훈련량에 맞춰 유지, 고강도 훈련일 앞뒤로 배치',
                  '지방 — 총 칼로리의 20~25%',
                  '수분 — 훈련 전후 체중 변화와 소변 색으로 부족분 확인 (훈련 중 체중 2% 이상 줄지 않게)',
                  '식사 빈도 — 하루 4~5회 소량 분산',
                ],
              },
              {
                stage: '수분 감량기 (D-7 ~ D-1)',
                color: 'var(--cyan-600)',
                items: [
                  '아래는 관행 설명이며 실행 매뉴얼이 아닙니다 — 반드시 전문 코치·의사 감독 하에서만',
                  'D-7~D-3 — 나트륨을 크게 줄이는 방식이 쓰임',
                  'D-5~D-3 — 섬유질 감소 (장 잔여물 줄임)',
                  'D-3~D-1 — 탄수화물 제한으로 글리코겐 저장 수분을 줄이는 단계',
                  'D-1 — 수분 제한·발한(사우나 등)으로 마무리하는 방식이 쓰이나, 탈수·신장 손상 위험이 가장 큰 단계',
                  '카페인·이뇨제로 수분을 빼는 것은 신장 부담이 크고, 이뇨제는 WADA 금지 약물',
                ],
              },
              {
                stage: '재수화·시합기 (계체 후 ~ 시합)',
                color: 'var(--emerald-600)',
                items: [
                  '계체 직후 30분 — 전해질 음료 500~750ml를 천천히',
                  '계체 후 24시간 — 탄수화물을 체중 1kg당 5~10g 범위에서 여러 끼로 나눠 재충전',
                  '~24시간 — 단백질·지방 추가, 일반식 점진 복귀',
                  '시합 2~4시간 전 — 소화가 쉬운 탄수화물 위주 가벼운 식사',
                  '시합 1시간 전 — 액상 탄수화물 소량, 평소 먹던 것만',
                ],
              },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.color}`, borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, marginBottom: 8 }}>{s.stage}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                  {s.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 체급 선택 전략 ── */}
        <div>
          <h2 className="g-h2">체급 선택 전략 — 어떤 체급이 유리할까?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              {
                head: '한 단계 아래 체급으로 내리는 게 유리한 경우',
                color: 'var(--emerald-600)',
                items: [
                  '체지방에 줄일 여지가 충분함',
                  '키·리치(팔 길이) 우위가 명확',
                  '필요 감량이 체중의 7% 이내 (계산기의 상향 권고선)',
                  '시합까지 8주 이상 — 안전한 페이스 가능',
                  '계체와 경기 사이 재수화 시간이 충분 (UFC·프로 복싱)',
                ],
              },
              {
                head: '한 단계 위 체급으로 올리는 게 나은 경우',
                color: 'var(--orange-600)',
                items: [
                  '체지방률이 이미 낮음',
                  '필요 감량이 체중의 7% 초과',
                  '시합까지 4주 미만',
                  '당일 계체 종목 (레슬링·주짓수)이나 무작위 계체가 있는 대회',
                  'ONE Championship — 탈수 계체 불가',
                  '이전 감량에서 부상·컨디션 난조 경험',
                ],
              },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${c.color}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: c.color, fontWeight: 700, marginBottom: 6 }}>{c.head}</p>
                <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                  {c.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 9. 위험 사례 ── */}
        <div>
          <h2 className="g-h2">위험한 감량 사례 — 경각심 환기</h2>
          <p className="g-p">
            다음은 감량 과정에서 숨진 실제 격투기 선수들의 사례입니다. 공통점은 짧은 기간에 수분을 급격히 뺐다는 것입니다.
          </p>
          <ul className="g-list">
            <li><strong>양젠빙(Yang Jian Bing)</strong> (2015, ONE Championship) — 21세, 시합 전 감량 중 탈수로 사망</li>
            <li><strong>레안드루 소자(Leandro Souza)</strong> (2013, 브라질 MMA) — 계체를 앞두고 감량 중 사망</li>
            <li><strong>제시카 린지(Jessica Lindsay)</strong> (2017, 호주 아마추어 무에타이) — 18세, 계체 직전 땀복·사우나 등으로 급격히 감량하다 쓰러져 숨짐. 검시 결과 사인은 고체온과 탈수로 인한 다발성 장기부전</li>
          </ul>
          <p className="g-note">
            ※ 양젠빙의 사망은 ONE Championship이 탈수 계체를 금지하는 계기가 되었습니다. 아마추어 경기에서도 같은 사고가 일어난다는 점을 기억하세요.
          </p>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 10. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 11. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',         icon: '⚖️', name: '비만도(BMI) 계산기',       desc: '체질량지수로 비만도 빠르게 확인' },
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량(BMR) 계산기',  desc: '하루 권장 칼로리·BMR 계산' },
              { href: '/tools/health/weightloss',  icon: '🎯', name: '체중 감량 기간 계산기',    desc: '목표 체중까지 칼로리 적자' },
              { href: '/tools/sports/one-rm',      icon: '🏋️', name: '1RM 계산기',               desc: '근력 훈련 최대 중량 추정' },
              { href: '/tools/health/supplement',  icon: '💊', name: '영양제 중복 체크 계산기',  desc: '영양제 성분 중복·상한량 체크' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
