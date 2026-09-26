import Link from 'next/link'
import WallpaperClient from './WallpaperClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import { calcWallpaper, stripsPerRollOf, TRIM_M, type CalcInput } from './wallpaperUtils'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/interior/wallpaper',
  title: '도배 계산기 — 벽지 롤 수·면적·셀프 시공 비용',
  description: '벽 면적으로 필요한 벽지 롤 수와 셀프 시공 비용 견적. 풀·도구·인건비까지 포함한 총 예산에 평수별 롤 수 참조표, 천장 포함 소요량, 실크·합지 규격 비교까지 지원합니다.',
  keywords: ['도배계산기', '벽지소요량계산', '벽지롤수계산', '셀프도배', '실크벽지', '합지벽지', '도배비용계산', '벽지견적'],
})

const FAQ_LD = [
              {
                q: '24평 아파트 도배에 벽지 몇 롤이 필요한가요?',
                a: '24평(약 79㎡) 아파트 <strong>전체</strong> 도배(방 3개 + 거실 + 주방, 천장 제외, 10% 로스율)에는 실크벽지 약 <strong>18~24롤</strong>(평균 20롤)이 필요합니다. 단, 이는 칸막이 벽이 많은 <strong>집 전체</strong> 기준입니다 — 계산기 [간편 계산]에 24평을 넣으면 <strong>한 공간(정사각형) 기준 약 6롤</strong>만 나오므로, 아파트 전체 소요량은 <strong>[상세 계산]</strong> 탭에서 방·거실·주방을 각각 추가해 합산하세요. 방 1개(7~10평) 부분 도배라면 3~5롤입니다.',
              },
              {
                q: '벽지 1롤로 몇 ㎡를 시공할 수 있나요?',
                a: '한국 표준 실크벽지 1롤은 <strong>폭 106cm × 길이 15.6m로 약 16.5㎡</strong>입니다. 합지벽지(광폭)는 폭 93cm × 길이 17.75m로 역시 약 16.5㎡입니다. 다만 무늬 맞춤·절단 손실 등으로 실제 시공 가능 면적은 90% 정도(약 14~15㎡)로 보는 것이 안전합니다.',
              },
              {
                q: '로스율 10%는 무엇을 의미하나요?',
                a: '시공 중 발생하는 손실(절단·무늬 맞춤·실수)을 위한 여유분입니다. 시공 면적의 10%만큼 추가로 벽지를 준비한다는 의미로 <strong>30㎡ 시공이라면 33㎡의 벽지를 구매</strong>해야 합니다. 무늬가 클수록 로스율을 높여야 하며, 일반 가정용은 10%가 표준입니다.',
              },
              {
                q: '셀프 도배가 가능한가요?',
                a: '가능합니다. 다음을 추천합니다:<br/>① <strong>합지벽지로 시작</strong> (실수 복구 쉬움)<br/>② <strong>방 1개부터 도전</strong> (전체는 부담)<br/>③ <strong>큰 무늬 벽지 피하기</strong> (패턴 맞춤 어려움)<br/>④ 유튜브 시공 영상 학습 후 도전<br/>한 방(7~10평) 셀프 도배는 1일 정도 걸리고, 재료비는 이 계산기 기본 단가로 7평 합지(3롤) 약 11만원, 10평 실크(4롤) 약 19만원입니다(벽지·풀·도구 포함).',
              },
              {
                q: '도배 비용은 평당 얼마인가요?',
                a: '업체 견적은 보통 <strong>아파트 전체·공급면적 평</strong> 기준이며, 흔히 안내되는 대략적인 범위는 다음과 같습니다.<br/>• 합지 전문 시공: <strong>평당 약 3~5만원</strong> (벽지·인건비 포함)<br/>• 실크 전문 시공: <strong>평당 약 5~8만원</strong> (벽지·인건비 포함) — 24평 전체 약 120~200만원<br/>• 셀프 도배: 재료비(벽지·풀·도구)만 들어 실크 기준 평당 약 1.5~3.5만원<br/>※ 기존 벽지 철거, 천장 포함 여부, 지역·시기·자재 등급에 따라 차이가 크므로 현장 실측 견적으로 확인하세요.',
              },
              {
                q: '합지벽지와 실크벽지는 무엇이 다른가요?',
                a: '벽지 제조사 LX하우시스(LX Z:IN) 공식 가이드의 구분입니다. <strong>실크벽지</strong>는 이름과 달리 실크 섬유가 아니라 <strong>종이 위에 PVC(염화비닐수지)를 코팅한 비닐 벽지</strong>로, 표면 오염을 물걸레로 닦아낼 수 있습니다. <strong>합지벽지</strong>는 종이 위에 종이를 붙여 만든 <strong>순수 종이 벽지</strong>(속지+겉지)로, 물걸레질하면 종이가 벗겨질 수 있어 주의해야 하는 대신 속지·겉지가 분리되는 구조라 재시공이 쉽고 가격이 저렴합니다. 규격도 달라서 본 계산기 기준 실크는 폭 106cm × 15.6m, 합지(광폭)는 폭 93cm × 17.75m입니다.',
              },
              {
                q: '기존 벽지 위에 그대로 덧방 시공해도 되나요?',
                a: '기존 벽지를 뜯지 않고 위에 겹쳐 바르는 <strong>덧방</strong>은 업계 통용 관행상 조건부로만 가능합니다. 일반적으로 ① 기존 벽지가 <strong>들뜸·찢김 없이 벽에 밀착</strong>되어 있고 ② 표면이 매끈한 <strong>합지벽지일 때</strong> 시도하며, 표면이 PVC 코팅된 실크벽지 위나 들뜸·곰팡이가 있는 면 위 덧방은 접착 불량·요철 비침 우려로 피하는 것이 관행입니다. 기존 벽지 상태가 나쁘면 제거 후 시공하는 편이 안전하며, 덧방 가능 여부는 견적 시 현장에서 확인받는 것이 좋습니다.',
              },
              {
                q: '도배 후 창문을 닫아두라는 말이 사실인가요? 며칠이나 닫아야 하나요?',
                a: '원칙 자체는 제조사 공식 안내가 맞습니다. LX하우시스(LX Z:IN) 가이드는 도배 후 <strong>창문을 닫아 외부 바람을 차단하고, 직사광선을 피해 자연 건조</strong>하라고 안내합니다(2026년 7월 확인 기준). 다만 <strong>구체적인 기간은 공식 안내에 없으며</strong>, 현장에서 흔히 말하는 &lsquo;48시간(2~3일)&rsquo;은 공식 기준이 아니라 <strong>업계 통용 관행</strong>입니다. 계절·습도에 따라 마르는 속도가 다르므로, 벽지가 완전히 마르기 전 급격한 환기·난방은 피한다는 원칙으로 이해하는 것이 안전합니다.',
              },
              {
                q: '곰팡이가 핀 벽에도 바로 도배할 수 있나요?',
                a: '곰팡이 위에 새 벽지를 바로 덮는 것은 피해야 한다는 것이 업계 통용 원칙입니다. 곰팡이의 원인은 대부분 <strong>결로나 누수</strong>이므로, 통상적인 시공 순서는 ① 원인(누수·결로) 확인·보수 → ② 기존 벽지 제거 → ③ 곰팡이 제거 후 <strong>벽면 완전 건조</strong> → ④ 필요 시 곰팡이 방지용 프라이머 등 밑작업 → ⑤ 도배 순입니다. 원인을 잡지 않고 도배만 새로 하면 같은 자리에 재발하기 쉽고, 특히 곰팡이 벽 위 덧방은 금물입니다. 결로가 반복되는 외벽 쪽 벽면이라면 도배 전에 단열 보수를 함께 검토하세요.',
              },
            ]

/* ── 빌드 시 계산하는 가이드 수치 — 계산기와 같은 calcWallpaper 사용 ──
   [간편 계산] 기본값: 천장 2.4m · 창 1개(1.5×1.5) · 문 1개(0.9×2.1) · 로스 10% · 실크(1.06m × 15.6m) */
const PY = 3.3058
const SILK = { wpWidth: 1.06, rollLength: 15.6 }
const HAPJI = { wpWidth: 0.93, rollLength: 17.75 }
const base = (side: number): CalcInput => ({
  width: side, length: side, height: 2.4,
  windowCount: 1, windowW: 1.5, windowH: 1.5, doorCount: 1, doorW: 0.9, doorH: 2.1,
  ...SILK, lossPct: 10, includeCeiling: false,
})
const PY_ROWS = [5, 7, 10, 15, 20, 25, 30].map(p => {
  const side = Math.sqrt(p * PY)
  const wall = calcWallpaper(base(side))
  const ceil = calcWallpaper({ ...base(side), includeCeiling: true })
  return { p, area: p * PY, net: wall.netWallArea, rolls: wall.finalRolls, ceilRolls: ceil.finalRolls }
})
/* 4 × 4m 방 예시 — 공식 섹션 */
const EX44 = calcWallpaper({ ...base(4), width: 4, length: 4 })
/* 7평 — 장 수 기준이 면적 기준보다 커지는 예 */
const EX7 = calcWallpaper(base(Math.sqrt(7 * PY)))
/* 15평 천장 포함 */
const EX15 = calcWallpaper(base(Math.sqrt(15 * PY)))
const EX15C = calcWallpaper({ ...base(Math.sqrt(15 * PY)), includeCeiling: true })
const EX25 = calcWallpaper(base(Math.sqrt(25 * PY)))
const EX25C = calcWallpaper({ ...base(Math.sqrt(25 * PY)), includeCeiling: true })
/* 천장 높이별 1롤당 장 수 + 4 × 4m 방 필요 롤(실크) */
const HEIGHT_ROWS = [2.3, 2.4, 2.5, 2.6, 2.7, 2.8].map(h => {
  const r = calcWallpaper({ ...base(4), width: 4, length: 4, height: h })
  return { h, silk: stripsPerRollOf(SILK.rollLength, h), hapji: stripsPerRollOf(HAPJI.rollLength, h), areaRolls: r.recommendedRolls, stripRolls: r.stripsRollsNeeded, final: r.finalRolls }
})
const f1 = (n: number) => n.toFixed(1)
/* 포인트 벽 예시 — 천장 2.4m, 실크 1롤에서 뽑는 장 수(민무늬 vs 리피트 64cm를 장마다 더한 보수적 커트) */
const PT_H = 2.4
const PT_REPEAT = 0.64
const PT_PLAIN = stripsPerRollOf(SILK.rollLength, PT_H)
const PT_PATTERN = stripsPerRollOf(SILK.rollLength, PT_H + PT_REPEAT)

export default function WallpaperPage() {
  return (
    <ToolPage width={760} slug="/tools/interior/wallpaper">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />도배 계산기
      </h1>
      <p className="tp-lead">
        벽 면적으로 필요한 <strong style={{ color: 'var(--text)' }}>벽지 롤 수</strong>와 셀프 시공 비용 견적.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="국내 유통 표준 규격(실크 폭 106cm×15.6m · 광폭 합지 93cm×17.75m) 기준 — 벽지·시공 단가는 흔히 안내되는 대략적 범위(견적 시 재확인)"
        sources={[
          { label: '국가법령정보센터 — 실내공기질 관리법 시행규칙(벽지 등 건축자재 방출 기준)', href: 'https://www.law.go.kr/법령/실내공기질관리법시행규칙' },
        ]}
      />

      <WallpaperClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 className="g-h2">
            도배 소요량 핵심 공식
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>시공 면적</span> = (둘레 × 천장 높이) − 창문 면적 − 문 면적</div>
            <div><span style={{ color: 'var(--muted)' }}>필요 벽지 면적</span> = 시공 면적 × (1 + 로스율 / 100)</div>
            <div><span style={{ color: 'var(--muted)' }}>면적 기준 롤 수</span> = 필요 벽지 면적 ÷ (벽지 폭 × 1롤 길이) → 올림</div>
            <div><span style={{ color: 'var(--muted)' }}>장 수 기준 롤 수</span> = (둘레 ÷ 벽지 폭 → 올림) ÷ 1롤당 장 수 → 올림</div>
            <div><span style={{ color: 'var(--muted)' }}>최종 롤 수</span> = 두 값 중 큰 값</div>
          </div>
          <Callout tone="note" title="예시 — 방 4m × 4m, 천장 2.4m, 창 1.5×1.5, 문 0.9×2.1">
            둘레 16m × 2.4 = <strong>{f1(EX44.totalWallArea)}㎡</strong>에서 창·문을 빼면 시공 면적 {EX44.netWallArea.toFixed(2)}㎡, 로스 10%를 더하면 {EX44.requiredArea.toFixed(2)}㎡라 면적 기준 {EX44.recommendedRolls}롤입니다. 장 수로 따져도 16m ÷ 1.06m = {f1(EX44.perimeter / SILK.wpWidth)} → {EX44.totalStripsNeeded}장, 1롤에서 {EX44.stripsPerRoll}장이 나오므로 {EX44.stripsRollsNeeded}롤 — 최종 <strong>{EX44.finalRolls}롤</strong>입니다.
          </Callout>
          <p className="g-p" style={{ marginTop: 16 }}>
            면적만으로 나누면 롤이 모자랄 수 있어 계산기는 <strong>장(스트립) 수 기준</strong>을 함께 봅니다. 벽지는 천장에서 바닥까지 한 장씩 세로로 붙이고 위아래를 몰딩·걸레받이에 맞춰 약 5cm씩 잘라 내므로, 한 장에 천장고 + {Math.round(TRIM_M * 100)}cm가 듭니다. 롤 끝에 남는 짧은 토막은 다음 장으로 쓸 수 없으니, 1롤에서 뽑을 수 있는 장 수를 내림한 뒤 필요한 장 수를 나눠 올립니다. 창·문 위아래의 짧은 조각은 이 토막으로 메운다고 보고 장 수에서는 빼지 않습니다.
          </p>
          <p className="g-p">
            예를 들어 7평 한 공간은 면적으로는 {EX7.recommendedRolls}롤이면 될 것 같지만, 둘레 {f1(EX7.perimeter)}m를 덮으려면 {EX7.totalStripsNeeded}장이 필요하고 1롤에서 {EX7.stripsPerRoll}장씩 나오므로 <strong>{EX7.finalRolls}롤</strong>을 사야 합니다. 천장이 높아지면 이 차이가 더 커집니다. 아래 표처럼 천장고가 2.6m가 되면 실크 1롤에서 나오는 장 수가 6장에서 5장으로 줄어, 같은 방이라도 롤이 하나 더 필요해질 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['천장고', '실크 1롤당 장 수', '합지 1롤당 장 수', '4×4m 방 면적 기준', '4×4m 방 장 수 기준', '최종(실크)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEIGHT_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.h.toFixed(1)}m</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.silk}장</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{r.hapji}장</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.areaRolls}롤</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.stripRolls}롤</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontWeight: 700 }}>{r.final}롤</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 장당 천장고 + 10cm 재단 여유, 실크 15.6m·합지 17.75m 롤 기준. 4×4m 방은 창 1개(1.5×1.5m)·문 1개(0.9×2.1m)·로스 10%·실크 기준으로 계산기와 같은 공식입니다.
          </p>
        </div>

        {/* ── 2. 벽지 종류별 표준 사이즈 ── */}
        <div>
          <h2 className="g-h2">
            한국 벽지 종류별 표준 사이즈
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { i: '🧵', name: '실크벽지', spec: '폭 106cm × 길이 15.6m', area: '1롤 약 16.5㎡', price: '2~5만원', tip: '주거용 일반', color: 'var(--accent)' },
              { i: '📄', name: '합지벽지', spec: '폭 93cm × 길이 17.75m', area: '1롤 약 16.5㎡', price: '1~2만원', tip: '저렴, 셀프 입문 추천', color: 'var(--emerald-600)' },
              { i: '🛡️', name: 'PVC벽지', spec: '폭 106cm × 길이 15.6m', area: '방수·내구성',     price: '3~6만원', tip: '욕실·주방 추천',    color: 'var(--cyan-600)' },
            ].map((w, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${w.color}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{w.i}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: w.color, marginBottom: 6 }}>{w.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{w.spec}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{w.area}</p>
                <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700, marginTop: 6 }}>{w.price}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{w.tip}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            실크 광폭(1.06m × 15.6m)과 합지 광폭(0.93m × 17.75m)은 폭과 길이가 달라도 1롤 면적이 약 16.5㎡, 즉 <strong>1롤 ≈ 5평</strong>으로 거의 같습니다. 그래서 면적 기준 롤 수는 두 종류가 비슷하게 나오지만, 폭이 좁은 합지는 같은 벽에 더 많은 장이 필요한 대신 롤이 길어 1롤에서 나오는 장 수도 많습니다. 계산기에서 벽지 종류를 바꾸면 두 기준이 모두 다시 계산됩니다.
          </p>
          <p className="g-p">
            벽지와 접착제는 「실내공기질 관리법 시행규칙」에서 폼알데하이드·톨루엔·총휘발성유기화합물 방출 기준을 정해 둔 건축자재입니다. 다중이용시설이나 새로 짓는 공동주택 등에는 기준을 넘는 자재를 쓸 수 없고, 가정 도배에 의무로 적용되지는 않지만 아이 방이나 침실용 벽지를 고를 때 기준 적합 여부와 친환경 인증 표시를 확인하는 근거가 됩니다. 도배 직후 언제부터 환기할지는 아래 FAQ를 참고하세요.
          </p>
        </div>

        {/* ── 3. 평수별 빠른 참조표 ── */}
        <div>
          <h2 className="g-h2">
            평수별 벽지 롤 수 빠른 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            천장 2.4m, 창문·문 1개씩, 10% 로스율, 실크벽지, <strong style={{ color: 'var(--text)' }}>한 공간(정사각형) 기준</strong> — 계산기 [간편 계산]과 동일 기준입니다. [천장 포함] 열은 같은 조건에 천장 면적(≈바닥 면적)을 더해 계산한 값입니다. 칸막이 벽이 많은 아파트 전체는 [상세 계산] 탭에서 방별로 합산하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '면적', '시공 면적', '실크 롤', '천장 포함'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PY_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r.p}평</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{f1(r.area)}㎡</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{Math.round(r.net)}㎡</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.rolls}롤</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.ceilRolls}롤</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3-1. 천장 포함 소요량 ── */}
        <div>
          <h2 className="g-h2">
            천장 도배 포함 시 소요량 계산
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.8 }}>
            직사각형 방에서 천장 면적은 가로 × 세로, 즉 <strong style={{ color: 'var(--text)' }}>바닥 면적과 같습니다</strong>. 천장까지 도배한다면 벽 시공 면적에 바닥 면적을 그대로 더하면 됩니다. 계산기 [간편 계산]의 [천장도 도배] 체크박스와 [상세 계산]의 방별 천장 옵션이 이 방식으로 계산합니다.
          </p>
          <p className="g-p">
            예를 들어 15평 한 공간은 벽 시공 면적 {f1(EX15C.netWallArea)}㎡에 천장 {f1(EX15C.ceilingArea)}㎡를 더해 {f1(EX15C.totalArea)}㎡, 로스 10%를 더하면 {f1(EX15C.requiredArea)}㎡로 실크 <strong>{EX15C.finalRolls}롤</strong>입니다. 벽만 도배할 때({EX15.finalRolls}롤)보다 {EX15C.finalRolls - EX15.finalRolls}롤이 늘어납니다. 벽 면적은 둘레를 따라 완만하게 늘지만 천장 면적은 평수에 정비례하므로 <strong>평수가 클수록 천장 몫이 커집니다</strong>. 25평이면 벽만 {EX25.finalRolls}롤, 천장 포함 {EX25C.finalRolls}롤로 두 배가 됩니다.
          </p>
          <Callout tone="warn" title="천장은 난이도가 다릅니다">
            풀 먹인 벽지를 머리 위에서 지탱하며 붙여야 해 벽보다 시공이 훨씬 어렵고, 셀프라면 사다리(우마)와 2인 작업이 사실상 필수입니다. 전문 시공도 천장 포함 여부에 따라 견적이 달라지므로 견적 요청 시 천장 포함 여부를 반드시 명시하세요.
          </Callout>
        </div>

        {/* ── 3-2. 포인트 벽 폭 수 계산 ── */}
        <div>
          <h2 className="g-h2">
            포인트 벽(부분 도배) 폭 수 계산
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.8 }}>
            벽 1면만 바꾸는 포인트 도배는 면적보다 <strong style={{ color: 'var(--text)' }}>폭(장) 수</strong>로 세는 편이 정확합니다. 필요한 폭 수 = 벽 너비 ÷ 벽지 폭(실크 1.06m) 올림. 계산기 [상세 계산] 탭의 [포인트 도배 (1면만)] 옵션이 같은 방식으로 계산합니다.
          </p>
          <p className="g-p">
            예를 들어 너비 3.6m·천장 2.4m 벽은 3.6 ÷ 1.06 = 3.4 → <strong>4폭</strong>입니다. 민무늬라면 한 장에 천장고 + 재단 여유 {Math.round(TRIM_M * 100)}cm = {f1(PT_H + TRIM_M)}m가 들어 1롤(15.6m)에서 {PT_PLAIN}장이 나오므로 4폭은 <strong>1롤</strong>로 충분합니다. 무늬 벽지는 옆 장과 무늬를 맞추느라 장마다 리피트(무늬 반복 길이)만큼 더 잘려 나간다고 보수적으로 잡는데, 리피트 64cm 패턴이면 커트가 약 {f1(PT_H + TRIM_M + PT_REPEAT)}m({f1(PT_H + TRIM_M)} + 0.64)로 늘어 1롤에서 {PT_PATTERN}장밖에 나오지 않습니다. 이 4폭 벽은 1롤에서 남는 장 없이 딱 맞고, 5폭 이상(너비 {(PT_PATTERN * SILK.wpWidth).toFixed(2)}m 초과)이면 2롤이 필요하니 로스율을 한 단계 높여 잡으세요.
          </p>
          <Callout tone="tip" title="로트(lot) 번호는 반드시 통일">
            같은 제품이라도 생산 차수(로트)마다 잉크 배합·인쇄 조건이 미세하게 달라 색상이 조금씩 다를 수 있습니다. 다른 로트를 나란히 붙이면 이음매에서 색 차이가 드러나므로, 여유분까지 포함한 전체 수량을 <strong style={{ color: 'var(--text)' }}>한 번에 같은 로트로</strong> 구매하고, 추가 구매 시엔 라벨의 로트 번호가 같은지 확인하세요.
          </Callout>
        </div>

        {/* ── 4. 로스율 가이드 ── */}
        <div>
          <h2 className="g-h2">
            로스율(여유분) 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { p: '5%',  c: 'var(--emerald-600)',       t: '단색·작은 패턴',  d: '숙련 시공자, 솔리드 컬러' },
              { p: '10%', c: 'var(--accent)', t: '한국 표준 권장',  d: '일반 가정용 기본값' },
              { p: '15%', c: 'var(--orange-600)',       t: '큰 패턴',          d: '무늬 맞춤 필요' },
              { p: '20%', c: 'var(--red-600)',       t: '셀프 + 큰 패턴',  d: '안전 마진' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${s.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.p}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            로스율은 면적 기준 롤 수에만 곱해집니다. 장 수 기준은 이미 장마다 재단 여유와 롤 끝 토막 손실을 반영하고 있어서, 방이 작거나 천장이 높을 때는 로스율을 5%로 낮춰도 롤 수가 줄지 않는 경우가 많습니다. 결과 화면에서 두 기준 중 어느 쪽이 최종 롤 수를 정했는지 확인하면 로스율 조정이 의미가 있는지 알 수 있습니다.
          </p>
          <Callout tone="warn" title="무늬벽지 주의">
            패턴 리피트가 클수록 무늬 맞춤 손실이 커지므로 로스율을 한 단계 높여 계산하세요. 계산기의 장 수 기준은 민무늬(리피트 없음)를 가정합니다.
          </Callout>
        </div>

        {/* ── 5. 셀프 vs 전문 ── */}
        <div>
          <h2 className="g-h2">
            셀프 도배 vs 전문 시공
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>셀프 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>재료비만 — 실크 기준 평당 약 1.5~3.5만원</li>
                <li>시간 오래 걸림 (한 방 1일)</li>
                <li>만족도·성취감 높음</li>
                <li>실수 복구 가능 (합지 추천)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cyan-600)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--cyan-600)', fontWeight: 700, marginBottom: 8 }}>전문 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>실크 평당 약 5~8만원 (벽지·인건비 포함)</li>
                <li>빠르고 깔끔 (24평 1~2일)</li>
                <li>패턴 맞춤 정확</li>
                <li>24평 실크 전체 약 120~200만원</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 6. 부자재 체크리스트 ── */}
        <div>
          <h2 className="g-h2">
            도배 부자재 체크리스트
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '16px 20px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.95,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>필수</p>
            <ul style={{ paddingLeft: 22, margin: 0, marginBottom: 12 }}>
              <li>도배풀 (3kg/롤, 5,000원/kg 평균)</li>
              <li>풀솔·롤러</li>
              <li>벽지칼·자</li>
              <li>헤라 (매끄럽게 펴는 도구)</li>
              <li>마른 걸레 (기포 제거)</li>
            </ul>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-600)', marginBottom: 8 }}>천장 높이 따라</p>
            <ul style={{ paddingLeft: 22, margin: 0, marginBottom: 12 }}>
              <li>사다리 2~5만원 (천장 도배 시 필수)</li>
            </ul>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan-600)', marginBottom: 8 }}>선택</p>
            <ul style={{ paddingLeft: 22, margin: 0 }}>
              <li>프라이머·바인더 (벽 상태 안 좋을 때)</li>
              <li>마스킹 테이프 (보호용)</li>
            </ul>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6 }}>
              * 1롤당 약 3kg는 일반 가루풀 기준 평균 추정값이며, 벽 상태·접착 농도·시공 방식에 따라 약 ±20% 차이가 날 수 있습니다.
            </p>
          </div>
        </div>

        {/* ── 7. 도배 시기 ── */}
        <div>
          <h2 className="g-h2">
            도배 시기 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🌸', t: '이사철',         d: '2~3월, 8~9월 — 시공사 예약 어려움' },
              { i: '💍', t: '결혼 시즌',      d: '봄·가을 — 전세·신혼집 도배 수요 ↑' },
              { i: '⏱️', t: '시공 시간 (전문)', d: '24평 기준 1~2일' },
              { i: '🛠️', t: '시공 시간 (셀프)', d: '24평 기준 3~5일' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{s.i}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/area',       icon: '🏠', name: '평수 변환기',  desc: '아파트 면적 단위 변환' },
              { href: '/tools/unit/converter',  icon: '📐', name: '단위 변환기',         desc: '길이·면적·무게 등 14종 통합 변환' },
              { href: '/tools/life/unit-price', icon: '🏷️', name: '단가 비교 계산기',    desc: '벽지 가성비 단가 비교' },
              { href: '/tools/interior/room-area', icon: '📐', name: '공간 면적 계산기', desc: '벽 면적 산출 — 도배 계산의 기본' },
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
