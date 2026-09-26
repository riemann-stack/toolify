import Link from 'next/link'
import UvProtectionClient from './UvProtectionClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { SKIN_TYPES, baseBurnMinutes, effectiveSpf, fmtMinutes, type SkinTypeId } from './uvProtectionUtils'

export const metadata = buildMetadata({
  path: '/tools/health/uv-protection',
  title: '자외선 지수 계산기 — UV 지수·피부 타입·SPF 일광화상 시간',
  description: '오늘 UV 지수와 피부 타입(Fitzpatrick) 기준 일광화상 위험 시간 계산 + SPF 30·50 실제 차단율 차이, 해변·눈·고지대 환경 보정, 재도포 주기까지 자외선 차단 가이드.',
  keywords: ['자외선계산기', 'UV지수', '일광화상시간', 'SPF계산', '선크림SPF', '피부타입', 'Fitzpatrick', '자외선차단', '러닝선크림', '해변선크림'],
})

/* ── 본문 표 = 계산기와 같은 uvProtectionUtils(SKIN_TYPES·baseBurnMinutes·effectiveSpf)로 빌드 시 생성
   무보호 중앙값 = min(200 × 피부 계수 ÷ (3 × UVI), MED ÷ (UVI × 0.025 W/㎡ × 60초)) — 환경·고도·구름 보정 없음 ── */
const SKIN_TEXT: Record<SkinTypeId, { d: string; b: string }> = {
  I:   { d: '매우 흰 피부 · 주근깨가 많음', b: '항상 화상, 거의 그을리지 않음' },
  II:  { d: '흰 피부',                      b: '자주 화상, 조금 그을림' },
  III: { d: '밝은 갈색 피부',               b: '가끔 화상, 서서히 그을림' },
  IV:  { d: '중간 갈색 피부',               b: '드물게 화상, 잘 그을림' },
  V:   { d: '짙은 갈색 피부',               b: '매우 드물게 화상' },
  VI:  { d: '매우 짙은 피부',               b: '거의 화상 없음' },
}
const SKIN_ROWS = SKIN_TYPES.map(t => ({ t: t.id, skin: t, isCommon: t.isKoreanCommon, ...SKIN_TEXT[t.id] }))
const UVI_COLS = [3, 5, 7, 9, 11]
/* 예시: UV 6 · 타입 III · 무보호 → 중앙값과 계산기 표시 범위(±30%) */
const SKIN_III = SKIN_TYPES.find(t => t.id === 'III')!
const EX_MID = baseBurnMinutes(6, SKIN_III)
const EX_SPF50 = EX_MID * effectiveSpf(50)   // SPF 절반 효과 가정(도포량 부족) — 계산기와 같은 식

const FAQ_LD = [
              {
                q: 'UV 지수 5는 얼마나 위험한가요?',
                a: 'UV 지수 5는 한국 기상청 기준 <strong>"보통" 등급</strong>으로 일반적인 봄·가을 수준입니다. 한국인에게 흔한 타입 III 피부라면 <strong>무보호 상태에서 약 40분 정도부터 일광화상 위험</strong>이 있습니다. 차단제(SPF 30 이상)와 모자를 권장하며, 오전 10시~오후 4시 사이는 더 주의가 필요합니다. 구름이 적고 반사면(물·모래·눈)이 있다면 실제 노출량은 더 높을 수 있습니다.',
              },
              {
                q: 'SPF 50과 SPF 30의 실제 차이는 얼마나 되나요?',
                a: 'UVB 차단율은 SPF 30이 96.7%, SPF 50이 98.0%로 <strong>1.3%p 차이</strong>입니다. "SPF 50이 SPF 30보다 1.7배 더 안전하다"는 표현은 정확하지 않습니다. 다만 야외 장시간 활동, 한국 여름철 강한 자외선, 해변·고지대 환경에서는 SPF 50 이상이 권장됩니다. 가장 중요한 것은 SPF 등급보다 <strong>충분한 도포량과 2시간마다의 재도포</strong>입니다.',
              },
              {
                q: '흐린 날에도 자외선 차단제를 발라야 하나요?',
                a: '<strong>네, 옅은 구름은 자외선의 최대 80%까지 통과시킵니다(WHO).</strong> 얇은 구름은 자외선을 거의 막지 못하고, 두꺼운 먹구름은 상당 부분을 줄이지만 0이 되지는 않습니다. 본 도구의 구름 보정은 보수적으로 최대 30%만 줄여 계산합니다. 특히 봄·가을의 흐린 날에 자외선 차단을 소홀히 해 화상을 입는 경우가 많으므로, 외출 시에는 일년 내내 차단제 사용을 권장합니다.',
              },
              {
                q: '러닝할 때 SPF 30이면 충분할까요?',
                a: '일상 짧은 러닝(30분 이내)이라면 SPF 30 광범위 차단제로 충분할 수 있습니다. 그러나 1시간 이상 러닝, 한낮 자외선 강한 시간, 여름철에는 <strong>SPF 50 이상을 권장</strong>합니다. 특히 땀으로 차단제 효과가 빠르게 감소하므로 ① 방수(Water Resistant) 표시 제품 선택, ② 1시간마다 재도포, ③ 챙 있는 모자·UV 차단 토시·선글라스 병행이 좋습니다. 러닝 코스에 그늘이 있다면 자외선이 강한 시간대(11~15시)는 피하는 것이 좋습니다.',
              },
              {
                q: '피부 타입은 어떻게 알 수 있나요?',
                a: 'Fitzpatrick 피부 타입은 햇빛에 대한 피부 반응으로 자가 진단할 수 있습니다: 항상 화상·거의 안 그을림 → 타입 I, 보통 화상·약간 그을림 → 타입 II, 가끔 화상·점진적 그을림 → 타입 III, 드물게 화상·잘 그을림 → 타입 IV, 매우 드물게 화상 → 타입 V, 거의 화상 X → 타입 VI. 한국인은 III·IV에 해당하는 경우가 많다고 알려져 있지만 공인된 분포 통계는 없으며, 정확한 진단은 피부과에서 광생물학적 검사로 가능합니다. 자가 진단이 애매하다면 <strong>보수적으로 한 단계 낮은(더 민감한) 타입을 선택</strong>하는 것이 안전합니다.',
              },
              {
                q: '어린이·영유아도 자외선 차단제를 발라도 되나요?',
                a: '식품의약품안전처는 피부가 얇은 <strong>생후 6개월 미만 영아</strong>에게는 홍반·알레르기 등 이상반응 우려로 <strong>자외선차단제를 사용하지 않도록</strong> 안내합니다. 이 시기에는 그늘·챙 넓은 모자·얇은 긴 옷으로 햇빛을 피하는 것이 기본이고, 불가피하면 소아청소년과 의사와 상담하세요. 어린이에게 처음 사용할 때는 <strong>손목 안쪽에 소량만 발라</strong> 피부가 민감하게 반응하는지 확인한 뒤 사용하는 것이 좋습니다. 제품의 SPF(자외선B 차단지수, 50 이상은 50+로 표시)와 PA(자외선A 차단등급, PA+~PA++++) 표시를 확인하고, 바른 후 약 15분 건조, 장시간 노출 시 2시간 간격 재도포가 권장됩니다.',
              },
              {
                q: '자외선 차단제를 쓰면 비타민D가 부족해지나요?',
                a: '자외선 차단제가 피부의 비타민D 합성을 줄일 수 있다는 우려가 있지만, 미국피부과학회(AAD)는 자외선이 피부암 위험 요인이기 때문에 <strong>햇빛이나 태닝 기기 노출로 비타민D를 얻는 것을 권장하지 않으며</strong>, 비타민D가 풍부한 식품·강화식품·보충제로 섭취할 것을 권고합니다. AAD에 따르면 피부암 위험을 높이지 않으면서 비타민D 합성을 극대화할 수 있는 <strong>"안전한 자외선 노출량"은 없는 것</strong>으로 알려져 있습니다. 비타민D 결핍이 걱정된다면 자가 판단으로 차단제를 줄이기보다 의료진과 상담하세요.',
              },
              {
                q: '실내나 차 안에서도 자외선 차단이 필요한가요?',
                a: '미국 피부암재단(Skin Cancer Foundation)에 따르면 <strong>일반 유리창은 일광화상의 주원인인 UVB는 대부분 걸러내지만, 파장이 긴 UVA는 통과</strong>시키는 것으로 알려져 있습니다. 자동차의 경우 접합유리인 전면 유리는 UVA를 일부 막아주지만, <strong>측면·후면·선루프의 강화유리는 UVA 차단 효과가 낮습니다</strong>. 장시간 운전하거나 창가에서 오래 머문다면 자외선 차단제 사용이나 UV 차단 필름 등의 보호를 고려하는 것이 좋습니다.',
              },
              {
                q: '선글라스의 "UV400"은 무슨 뜻인가요?',
                a: 'UV400은 <strong>파장 400nm(나노미터) 이하의 자외선을 차단</strong>한다는 표시로, UVA·UVB 영역을 모두 포함합니다. 미국안과학회(AAO)는 <strong>"100% UV 또는 UV400 차단" 표시가 있거나 UVA·UVB를 모두 차단하는 선글라스</strong>를 선택하고, 구매 전 UV 차단 표시를 확인할 것을 권장합니다. 자외선은 각막염·백내장 등 안구 손상과도 관련이 있는 것으로 알려져 있으므로, UV 지수가 높은 날 야외 활동 시에는 차단제와 함께 선글라스 착용을 권장합니다.',
              },
              {
                q: '기미·색소침착에는 UVA가 더 문제인가요?',
                a: '미국피부과학회(AAD)에 따르면 <strong>햇빛이 피부에 닿으면 멜라닌 생성이 자극</strong>되며, 기미는 얼굴·목·팔처럼 <strong>햇빛을 많이 받는 부위에 주로 나타나는</strong> 것으로 알려져 있습니다. 특히 파장이 긴 UVA는 일반 유리창도 통과하므로(피부암재단) 실내·운전 중에도 노출이 누적될 수 있습니다. 색소침착이 걱정된다면 광범위(Broad-spectrum, UVA·UVB 차단) 제품과 PA 등급(자외선A 차단등급)을 확인하는 것이 좋고, 기미가 지속·악화되면 피부과 전문의와 상담하세요.',
              },
            ]

export default function UvProtectionPage() {
  return (
    <ToolPage width={760} slug="/tools/health/uv-protection">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />자외선 지수 계산기
      </h1>
      <p className="tp-lead">
        오늘 UV 지수와 내 피부 타입 기준 <strong style={{ color: 'var(--text)' }}>일광화상 위험 시간</strong> + SPF 차단제 권장.
      </p>

      <UpdatedMeta date="2026년 9월" basis="WHO 자외선지수 정의(1 UVI = 홍반가중 자외선 0.025W/㎡) · Fitzpatrick 피부 타입별 MED 기반 추정 · 반사·고도 보정 근거 WHO(눈 최대 80%·물거품 25%·모래 15%·고도 1,000m당 약 10%) · 차단제 외출 15분 전·2시간 재도포(식약처·미국 FDA) · UV 단계 기상청 5단계" sources={[{ label: 'WHO 자외선지수 실용 가이드', href: 'https://www.who.int/publications/i/item/9241590076' }, { label: 'WHO — 자외선 Q&A', href: 'https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)' }, { label: '기상청 생활기상지수(자외선지수)', href: 'https://www.weather.go.kr/w/forecast/life/life-weather-index.do' }, { label: '정책브리핑(식약처) — 자외선차단제 올바른 사용법', href: 'https://www.korea.kr/news/policyNewsView.do?newsId=148965990' }, { label: 'FDA 자외선 차단제 안내', href: 'https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun' }]} />

      <UvProtectionClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 className="g-h2">
            UV 지수와 화상 위험 시간 계산 원리
          </h2>
          <p className="g-p">
            자외선지수(UVI)는 피부를 붉게 만드는 파장에 가중치를 둔 자외선 세기를 0.025W/㎡ 단위로 나눈 값입니다(WHO). 즉 UV 6이면 피부에 초당 0.15J/㎡의 &lsquo;홍반 유효&rsquo; 자외선이 닿습니다.
            피부마다 첫 발적이 생기는 최소 자외선 양(MED)이 다르므로, MED를 1분당 들어오는 양으로 나누면 무보호 상태에서 화상까지 걸리는 시간을 어림할 수 있습니다.
          </p>
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
            <div><span style={{ color: 'var(--muted)' }}>단순 추정</span> = (200 × 피부 타입 계수) ÷ (3 × UV 지수)</div>
            <div><span style={{ color: 'var(--muted)' }}>MED 기반</span> = MED(J/m²) ÷ (UV 지수 × 0.025 × 60)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 두 값 중 짧은(보수적인) 쪽을 쓰고, MED는 첫 발적을 일으키는 최소 자외선 양</div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            예시: UV 지수 6, 피부 타입 III(MED {SKIN_III.medJm2}J/㎡)이면 {SKIN_III.medJm2} ÷ (6 × 0.025 × 60) ≈ <strong>{fmtMinutes(EX_MID)}</strong>이 중앙값입니다.
            사람마다 차이가 커서 계산기는 이 값의 ±30%인 <strong>약 {Math.round(EX_MID * 0.7)}~{Math.round(EX_MID * 1.3)}분</strong>을 범위로 보여 줍니다.
            SPF 50을 고르면 실제 도포량이 시험 기준(피부 1㎠당 2mg)보다 적은 경우가 많다는 점을 감안해 SPF 효과를 절반 정도로 보수적으로 잡아도 이론상 {fmtMinutes(EX_SPF50)}이 나오지만,
            차단제는 땀·마찰로 지워지므로 계산기는 재도포 주기인 2시간(물·땀 노출 시 1시간)을 넘는 보호 시간을 표시하지 않습니다.
          </p>
        </div>

        {/* ── 2. 피부 타입 × UV 지수 표 ── */}
        <div>
          <h2 className="g-h2">
            피부 타입·UV 지수별 무보호 화상 추정 시간
          </h2>
          <p className="g-p">
            계산기와 같은 식으로 구한 중앙값입니다(환경·고도·구름 보정 없음, 차단제 없음). 같은 UV 지수라도 피부 타입에 따라 3~5배 차이가 나고, UV 지수가 두 배가 되면 시간은 절반이 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>피부 타입</th>
                  {UVI_COLS.map(u => (
                    <th scope="col" key={u} style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>UV {u}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SKIN_ROWS.map((r, i) => {
                  const isCommon = r.isCommon
                  return (
                    <tr key={r.t} style={{ borderBottom: '1px solid var(--border)', background: isCommon ? 'color-mix(in srgb, var(--data-4) 6%, transparent)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                      <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: isCommon ? 'var(--data-4)' : 'var(--text)', fontWeight: 700 }}>타입 {r.t}</th>
                      {UVI_COLS.map(u => (
                        <td key={u} style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{fmtMinutes(baseBurnMinutes(u, r.skin))}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            해변·수상 활동은 여기에 1.5배, 눈 위는 1.8배 강한 자외선을 가정하므로 시간이 각각 약 2/3, 약 0.56배로 줄어듭니다. 약(일부 항생제·이뇨제 등)이나 피부 시술로 빛에 예민해진 상태라면 표보다 훨씬 빨리 화상을 입을 수 있습니다.
          </p>
        </div>

        {/* ── 3. Fitzpatrick 피부 타입 ── */}
        <div>
          <h2 className="g-h2">
            Fitzpatrick 피부 타입
          </h2>
          <p className="g-p">
            1975년 피부과 의사 토머스 피츠패트릭이 광선 치료 용량을 정하려고 만든 분류로, 처음에는 네 단계였다가 짙은 피부를 위한 V·VI가 더해져 여섯 단계가 됐습니다.
            피부색이 아니라 <strong>햇볕에 탔을 때의 반응</strong>(붉어지는지, 그을리는지)으로 판정합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['타입', '특징', '햇볕 반응', 'MED (도구 적용값)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 3 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SKIN_ROWS.map((r, i) => {
                  const isCommon = r.isCommon
                  return (
                    <tr key={r.t} style={{ borderBottom: '1px solid var(--border)', background: isCommon ? 'color-mix(in srgb, var(--data-4) 6%, transparent)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                      <td style={{ padding: '10px 12px', color: isCommon ? 'var(--data-4)' : 'var(--accent-ink)', fontWeight: 700 }}>타입 {r.t}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.d}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.b}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.skin.medJm2}J/㎡</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            한국인은 대체로 III·IV에 해당하는 경우가 많다고 알려져 있지만 개인차가 크고, 공인된 분포 통계는 없습니다. MED는 같은 타입 안에서도 폭이 있는 값이라 이 도구는 대체로 범위의 낮은 쪽(더 민감한 쪽)에 가까운 값을 씁니다.
            자가 판정이 애매하면 한 단계 더 민감한 타입을 고르세요.
          </p>
        </div>

        {/* ── 4. UV 5단계 ── */}
        <div>
          <h2 className="g-h2">
            UV 지수 5단계 (한국 기상청 기준)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { r: '0~2',  l: '낮음',     c: 'var(--emerald-600)', w: 16,  d: '특별한 보호 불필요' },
              { r: '3~5',  l: '보통',     c: 'var(--yellow-700)', w: 40,  d: '오전 10~오후 4시 차단제 권장' },
              { r: '6~7',  l: '높음',     c: 'var(--orange-600)', w: 56,  d: '차단제·모자·긴 옷 필수' },
              { r: '8~10', l: '매우 높음', c: 'var(--red-600)', w: 80,  d: '오전 10~오후 4시 야외 자제' },
              { r: '11+',  l: '위험',     c: 'var(--amethyst)', w: 100, d: '가능한 외출 자제' },
            ].map((g, i) => (
              <div key={i}>
                <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 10, alignItems: 'center' }}>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: g.c, whiteSpace: 'nowrap' }}>{g.l}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>UV {g.r}</div>
                  </div>
                  <div style={{ height: 16, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${g.w}%`, background: g.c, borderRadius: 99 }} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '5px 0 0', paddingLeft: 86, lineHeight: 1.55 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            환경 보정을 거친 값은 소수가 되므로 계산기는 반올림한 정수로 단계를 정합니다(예: 7.4 → 높음, 7.5 → 매우 높음).
            자외선은 태양 고도가 가장 높은 한낮에 가장 강해, 같은 날이라도 오전 9시와 정오의 UV 지수는 크게 다릅니다. 그림자가 키보다 짧아지는 시간대라면 자외선이 강한 때라고 보면 됩니다.
          </p>
          <Callout tone="note" title="오늘 자외선지수 확인 방법">
            기상청 날씨누리의 <a href="https://www.weather.go.kr/w/forecast/life/life-weather-index.do" target="_blank" rel="noopener noreferrer">생활기상지수(자외선지수)</a> 페이지에서 읍면동(도로명) 단위로 조회할 수 있습니다.
            자외선지수는 3시간 단위 예측값(해당 시간대 최대값)으로 오늘~글피까지 제공되며, 낮음~위험 5단계와 단계별 대응요령을 함께 안내합니다(2026년 6월 확인). 그 값을 계산기의 UV 지수에 넣으세요.
          </Callout>
        </div>

        {/* ── 5. SPF 차단율 ── */}
        <div>
          <h2 className="g-h2">
            SPF별 UVB 차단율 — 숫자가 두 배여도 보호는 두 배가 아니다
          </h2>
          <p className="g-p">
            SPF는 차단제를 바른 피부가 첫 발적까지 견디는 자외선 양이 맨 피부의 몇 배인지를 나타내며, 통과율은 대략 1/SPF입니다. 그래서 차단율은 SPF가 커질수록 거의 늘지 않습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed', minWidth: 300 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['SPF', 'UVB 차단율', '통과율'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 8px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '없음',    b: '0%',    p: '100%', c: 'var(--red-600)' },
                  { s: 'SPF 15',  b: '93.3%', p: '6.7%', c: 'var(--yellow-700)' },
                  { s: 'SPF 30',  b: '96.7%', p: '3.3%', c: 'var(--accent-ink)' },
                  { s: 'SPF 50',  b: '98.0%', p: '2.0%', c: 'var(--emerald-600)' },
                  { s: 'SPF 70+', b: '98.6%', p: '1.4%', c: 'var(--amethyst)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: r.s === 'SPF 50' ? 'color-mix(in srgb, var(--emerald-600) 6%, transparent)' : (i % 2 === 0 ? 'transparent' : 'var(--bg2)') }}>
                    <td style={{ padding: '10px 8px', color: r.c, fontWeight: 700 }}>{r.s}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.b}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn" title="SPF가 2배라고 보호 시간이 2배 늘어나는 것이 아닙니다">
            SPF 30과 50의 차단율 차이는 <strong>1.3%p</strong>에 불과합니다. 표시 SPF는 피부 1㎠당 2mg을 발랐을 때의 값인데 실제로는 이보다 적게 바르는 경우가 많아,
            이 도구도 SPF 효과를 절반 정도로 잡아 계산합니다(SPF 50 → 약 25). 등급을 올리는 것보다 <strong>충분한 도포량과 2시간마다의 재도포</strong>가 훨씬 중요합니다.
            또 SPF는 UVB 기준이므로 기미·광노화와 관련 깊은 UVA 차단은 PA 등급으로 따로 확인하세요.
          </Callout>
        </div>

        {/* ── 6. 환경별 자외선 보정 ── */}
        <div>
          <h2 className="g-h2">
            환경별 자외선 보정
          </h2>
          <p className="g-p">
            계산기는 입력한 UV 지수에 환경 계수를 곱해 실제로 받는 자외선을 어림합니다. 반사율 같은 근거 수치는 WHO 자료를 따랐고, 계수는 노출 시간까지 감안해 보수적으로 잡은 도구의 가정입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['환경', '도구 계수', '근거·설명'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 1 ? 'center' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '일상 외출·러닝', m: '× 1.0', d: '입력한 UV 지수 그대로 · 러닝은 땀으로 차단제가 빨리 지워짐' },
                  { t: '해변·수영장', m: '× 1.5', d: '마른 모래 약 15%·물거품 약 25% 반사(WHO) + 그늘 없는 긴 노출' },
                  { t: '수상 스포츠', m: '× 1.5', d: '물 반사 + 그늘 없는 긴 노출' },
                  { t: '눈·스키', m: '× 1.8', d: '신선한 눈은 자외선을 최대 80%까지 반사(WHO) — 가장 강력' },
                  { t: '등산·고지대', m: '+12%/km (최소 +20%)', d: 'WHO는 고도 1,000m마다 약 10% 증가로 안내 · 도구는 1km당 12%로 조금 보수적으로, 고도 미입력·1,700m 미만은 +20% 가정' },
                  { t: '운전·실내', m: '× 0.5', d: '유리는 UVB를 대부분 막지만 UVA는 일부 통과 · 측면 유리는 차단이 약함' },
                  { t: '구름', m: '최대 −30%', d: '옅은 구름은 자외선의 최대 80%를 통과시킴(WHO) · 두꺼운 먹구름은 더 줄지만 보수적으로 제한' },
                ].map((g, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{g.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>{g.m}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{g.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            예: 기상청 UV 지수 6인 날 해변에서는 6 × 1.5 = 9(매우 높음)로 계산되고, 해발 2,000m 산에서는 6 × 1.24 ≈ 7.4(높음)로 계산됩니다.
          </p>
        </div>

        {/* ── 7. 차단제 사용 가이드 ── */}
        <div>
          <h2 className="g-h2">
            자외선 차단제 사용 가이드 (식약처·FDA 안내)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '선택', items: ['SPF 30 이상 · UVA·UVB 광범위 차단', '국내 표시는 SPF 50 이상이면 모두 「SPF50+」, UVA는 PA+~PA++++', '물놀이·땀: 「내수성」·「지속내수성」 표시 제품'] },
              { t: '도포', items: ['외출 15분 전 충분한 양을 고르게 (식약처)', 'SPF 시험 기준량은 피부 1㎠당 2mg — 실제로는 적게 바르기 쉬움', '성인 전신은 약 30mL(소주잔 한 잔 정도) · 입술·귀·목 뒤·발등도'] },
              { t: '재도포', items: ['장시간 햇빛 노출 시 2시간마다 (식약처·FDA)', '수영·땀·수건으로 닦은 뒤에는 바로 덧바르기', '이 도구는 물·땀 노출 시 1시간 주기로 계산'] },
              { t: '보관', items: ['용기의 사용기한·개봉 후 사용기간 확인', '변색·분리·이상한 냄새가 나면 폐기', '차 안처럼 뜨거운 곳 보관 피하기'] },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--data-4)', fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-sans)' }}>{c.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {c.items.map((it, j) => (<li key={j}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            식약처는 피부가 얇은 생후 6개월 미만 영아에게는 홍반·알레르기 등 이상반응 우려로 자외선차단제를 사용하지 않도록 안내합니다. 이 시기에는 그늘·챙 넓은 모자·얇은 긴 옷으로 햇빛을 피하는 것이 기본이고, 불가피하면 소아청소년과 의사와 상담하세요.
          </p>
        </div>

        {/* ── 8. 자외선과 피부 건강 ── */}
        <div>
          <h2 className="g-h2">
            자외선과 피부·눈 건강
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--yellow-700)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--yellow-700)', fontWeight: 700, marginBottom: 8 }}>급성 영향 (노출 후 몇 시간~며칠)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>일광화상 (홍반·통증·물집)</li>
                <li>광각막염·결막염 (설원·해변의 &lsquo;눈 화상&rsquo;)</li>
                <li>약물·화장품 성분에 의한 광과민 반응</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--red-600)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--red-600)', fontWeight: 700, marginBottom: 8 }}>만성 영향 (수년간 누적)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>광노화 (주름·기미·탄력 저하)</li>
                <li>피부암 (기저세포암·편평세포암·흑색종)</li>
                <li>백내장·익상편 등 눈 질환</li>
              </ul>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            WHO는 자외선을 피부암의 주요 환경 요인으로 보고, 자외선 노출은 누적된다고 설명합니다. 일광화상은 피부가 이미 손상됐다는 신호이므로 &lsquo;그을리기만 하고 타지 않으면 괜찮다&rsquo;는 생각도 맞지 않습니다.
            새로 생기거나 모양·색·크기가 변하는 점, 낫지 않는 상처가 있으면 피부과 진료를 받으세요.
          </p>
          <Callout tone="tip" title="예방 4가지 핵심">
            ① UV 지수가 높은 한낮에는 그늘 활용 ② 챙 넓은 모자·긴 옷·UV 차단 선글라스 ③ SPF 30 이상·PA 표시 차단제를 충분히, 2시간마다 ④ 점·반점의 변화를 스스로 살피고 이상하면 피부과 상담
          </Callout>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 9. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmi',         icon: '⚖️', name: 'BMI 계산기',             desc: '체질량지수로 비만도 확인' },
              { href: '/tools/health/bmr',         icon: '🔥', name: '기초대사량(BMR) 계산기', desc: '하루 권장 칼로리' },
              { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 계산기', desc: 'BAC·운전 가능 시각' },
              { href: '/tools/sports/pace',        icon: '🏃', name: '러닝 페이스 계산기',     desc: '마라톤 목표 기록별 페이스' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',           desc: '휴가·여행 카운트다운' },
              { href: '/tools/life/laundry-dry',   icon: '🧺', name: '빨래 건조 시간 계산기',   desc: '온도·습도·소재별 건조 시간' },
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

        {/* ── 11. 공식 자료 ── */}
        <div>
          <h2 className="g-h2">
            공식 자료 출처
          </h2>
          <ul className="g-list">
            <li>미국 EPA UV Index Scale: <a href="https://www.epa.gov/sunsafety/uv-index-scale-0" target="_blank" rel="noopener noreferrer">epa.gov/sunsafety</a></li>
            <li>WHO Ultraviolet (UV) radiation: <a href="https://www.who.int/health-topics/ultraviolet-radiation" target="_blank" rel="noopener noreferrer">who.int</a></li>
            <li>FDA Sunscreen·SPF 안내: <a href="https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun" target="_blank" rel="noopener noreferrer">fda.gov</a></li>
            <li>한국 기상청 생활기상지수(자외선): <a href="https://www.weather.go.kr/w/forecast/life/life-weather-index.do" target="_blank" rel="noopener noreferrer">weather.go.kr</a></li>
            <li>식약처 자외선차단제 사용법(대한민국 정책브리핑): <a href="https://www.korea.kr/news/policyNewsView.do?newsId=148965990" target="_blank" rel="noopener noreferrer">korea.kr</a></li>
            <li>대한피부과학회: <a href="https://www.derma.or.kr" target="_blank" rel="noopener noreferrer">derma.or.kr</a></li>
          </ul>
          <p className="g-note">
            본 도구는 <strong>의학적 진단·치료 목적이 아닙니다.</strong>
            일광화상 또는 피부 이상 증상이 있다면 피부과 전문의 상담을 받으세요.
            표시된 시간은 <strong>참고 추정치</strong>이며 실제 안전을 보장하지 않습니다.
          </p>
        </div>

      </div>
    </ToolPage>
  )
}
