import Link from 'next/link'
import ScrewClient from './ScrewClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/interior/screw',
  title: '나사 규격 계산기 — M·UNC·UNF·PT 탭드릴·관통홀·인치↔mm + 볼트 스패너·알렌렌치',
  description: '나사 가공·드릴 구멍 중심 — M·UNC·UNF·PT·목재·석고 7종의 탭드릴·관통홀·파일럿홀 치수와 인치↔mm 변환표. 볼트·스패너 탭에서 M3~M24 스패너·알렌렌치 사이즈(ISO·구 DIN·JIS 소형), 와셔·너트, 강도등급별 토크, 역검색까지.',
  keywords: ['탭드릴 계산기', '나사 규격표', 'M6 탭드릴', 'M8 탭드릴', '미터 나사', '유니파이 나사', 'UNC UNF', 'PT 나사', '파이프 나사', '인치 mm 변환', '관통홀 직경', '목재피스 파일럿홀', '볼트 스패너 사이즈', 'M8 스패너', '알렌렌치 사이즈', '볼트 체결 토크'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px 22px',
  marginBottom: '14px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-m)',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { "q":"M6 나사 탭드릴은 몇 mm인가요?","a":"5.0mm (표준 75% 결합률, 표준 피치 1.0mm 기준). 공식: 외경 − 피치 = 6 − 1 = 5.0mm. 결합률·소재 보정 시 ±0.1~0.2mm 변동. 본 도구의 탭드릴 계산 탭에서 자동 산출." },
  { "q":"미터 나사와 인치 나사 차이는?","a":"크기 단위와 피치 표기 방식이 다릅니다. 미터 (M): 외경 mm + 피치 mm (예: M6 × 1.0). 한국·유럽·일본 표준. 인치 (UNC/UNF): 외경 인치 + TPI(인치당 산수) (예: 1/4-20). 미국 표준. 서로 호환 X — M6(외경 6.0mm, 피치 1.0mm)와 1/4-20(외경 6.35mm, 20TPI≈1.27mm)은 외경과 피치가 모두 다릅니다." },
  { "q":"UNC와 UNF 차이는?","a":"모두 미국 인치 나사. 피치(TPI)만 다름: UNC (Coarse): 보통 피치. 일반 기계·산업. 예: 1/4-20 UNF (Fine): 정밀 피치 (산수 ↑). 정밀 기계·자동차·항공. 예: 1/4-28 UNF가 산이 더 촘촘 → 진동 강함·미세 조정 좋음. UNC가 가공·체결 빠름." },
  { "q":"PT와 NPT 차이는?","a":"모두 파이프 나사 (테이퍼 형태로 누수 방지). PT: 일본·한국 표준 (JIS·KS). 산둘레가 약간 다름. NPT: 미국 표준. 한국에서는 수입 장비에 자주 등장. 서로 호환 안 됨 (외경·피치 미세 차이). 한국 배관은 PT가 표준이지만 미국식 장비·공압 부품은 NPT 가능 — 항상 확인." },
  { "q":"결합률이 뭔가요? 75%가 표준인가요?","a":"결합률(Thread Engagement) = 나사산이 모재 구멍과 얼마나 깊게 맞물리는지(%). 75%가 ISO·KS 표준이며 강도와 가공성의 최적 균형. 그 이상(85~100%)은 결합력은 강하지만 탭이 부러질 위험 ↑ + 가공 시간 ↑. 50% 정도는 임시·자주 분해 용도." },
  { "q":"스테인리스에 탭 가공할 때 주의할 점은?","a":"스테인리스는 가공이 까다롭습니다 — 마찰열이 크고 가공 경화(한 번 변형되면 더 단단해짐)가 일어납니다. 주의할 점: ① 저속 회전(RPM 낮게) ② 강한 절삭유 필수(스테인리스 전용 권장) ③ 드릴/탭은 코발트 함유 HSS-Co 또는 초경합금 권장 ④ 탭드릴 직경 +0.05mm(본 도구 자동 보정) ⑤ 한 번에 끝까지 가공하지 말 것 — 1~2바퀴 진행 후 1바퀴 역회전(칩 배출)." },
  { "q":"관통홀 직경은 어떻게 정하나요?","a":"용도에 따라 정밀/일반/헐거움 3등급 — ISO 273 표준값입니다(고정 더하기 공식이 아니라 사이즈별 표값). 정밀 (Tight·close): 끼워맞춤·정렬 중요. 일반 (Normal·medium): 대부분 케이스 — 표준. 헐거움 (Loose·coarse): 조립 여유·열팽창 고려. 예: M6 → 6.4 / 6.6 / 7.0mm (여유값은 사이즈가 커질수록 함께 커짐). 정확한 값은 본 도구의 결과 카드·사이즈 표 탭 참고." },
  { "q":"목재피스 파일럿홀은 꼭 뚫어야 하나요?","a":"경질목·두께 얇은 합판은 필수, 연질목은 권장. ① 경질목(오크·메이플·티크) = 파일럿 없이 박으면 균열·피스 부러짐 위험 ② 연질목(소나무·삼나무) = 파일럿 권장(정확한 위치·균열 방지) ③ 얇은 합판·MDF = 파일럿 필수(두께 변형 방지) ④ 가장자리 근처 = 파일럿 + 카운터싱크 필수. 파일럿 직경은 피스 직경의 약 55~75%(경질목은 크게·연질목은 작게 — 본 도구의 가이드 활용)." },
  { "q":"본 도구의 토크 안내는 정확한가요?","a":"일반 참고값이며 정확치는 아닙니다. 탭드릴 계산 탭은 8.8 등급 강 볼트 기준 일반 범위를, 볼트·스패너 탭은 강도등급별(4.8 / 8.8 / 10.9 / 12.9) ISO 16047 일반 참고치(마찰계수 0.14)를 표시합니다. 정확한 토크는 ① 제조사 사양서·기계 매뉴얼 확인 ② 토크 렌치 사용(특히 자동차·항공) — 토크렌치는 조일 때만 사용하고 풀 때는 일반 핸들을 쓰세요 ③ 나사 등급(4.6 / 8.8 / 10.9 / 12.9 등)별로 다름 ④ 스테인리스·티타늄·황동은 강 볼트와 다른 값 — 스테인리스(SUS304·SUS316, 강도등급 A2-70·A4-80)는 보통 일반 강 8.8 등급의 60~70% 정도가 안전 토크이고 긁어붙임(galling)이 잘 일어나 고착방지제(anti-seize)나 윤활제를 바르고 천천히 균등하게 조이세요 ⑤ 윤활·녹·이물질로 ±20~30% 변동." },
  { "q":"카운터싱크 깊이는 어떻게 정하나요?","a":"접시머리 나사용 카운터싱크(원뿔형 가공) 일반 가이드: ① 직경 = 나사 외경의 약 1.8~2배(예: M6 → 12mm) ② 깊이 = 머리 두께 + 0~0.5mm(살짝 깊게 가공해 표면과 평면) ③ 각도 = 표준 90°(목재) / 82°(인치 표준). 카운터싱크 비트는 별도 구매 — 드릴 + 비트 세트가 일반적입니다. 본 도구는 권장 직경·깊이만 안내합니다." },
  { "q":"M8 스패너는 13mm인가요 12mm인가요?","a":"현행 ISO·KS 규격과 구 DIN 규격 모두 13mm입니다. 다만 일본차나 옛 일본산 기계·자전거에는 JIS 소형 규격의 12mm 머리가 쓰인 경우가 있습니다. 내 스패너가 헐겁게 들어가면 JIS 소형 사이즈를 의심해 보세요. 13mm 스패너를 12mm 볼트에 쓰면 머리가 둥글게 마모(rounded)될 수 있으니 주의." },
  { "q":"녹슨 볼트가 풀리지 않을 때는?","a":"순서대로: ① 침투제(WD-40·PB Blaster)를 충분히 뿌리고 10~30분 대기 → ② 머리를 망치로 가볍게 두드려 충격 전달 → ③ 역방향으로 살짝 조였다가 풀기(녹 균열) → ④ 그래도 안 되면 토치로 가열(주변 가연물 제거·소화 수단 준비, 도장·플라스틱 변형 주의 — 침투제 분사 직후 가열 금지) → ⑤ 마지막 수단은 볼트 익스트랙터·드릴링. 한 사이즈 큰 스패너는 둥글림이 더 심해지므로 금물입니다." }
]

export default function ScrewPage() {
  return (
    <ToolPage width={880} slug="/tools/interior/screw">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />나사 규격 계산기
      </h1>
      <p className="tp-lead">
        M·UNC·UNF·PT·목재·석고 <strong style={{ color: 'var(--text)' }}>7종 + 탭드릴·관통홀·렌치 사이즈</strong>.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        이 도구는 <strong style={{ color: 'var(--text)' }}>나사 가공·드릴 구멍</strong>(탭드릴·관통홀·파일럿홀) 중심입니다.
        볼트 머리에 맞는 스패너·알렌렌치 선택과 체결 토크는 아래 <strong style={{ color: 'var(--text)' }}>볼트·스패너</strong> 탭에서 확인하세요.
      </p>

      <ScrewClient />

      <GuideDivider />

      {/* 1. 나사 종류 가이드 */}
      <h2 style={sectionTitle}>🔩 7가지 나사 종류 가이드</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
        <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>종류</th>
              <th scope="col" style={headCell}>표준</th>
              <th scope="col" style={headCell}>주 사용처</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>🔩 미터 나사 (M)</strong></td><td style={cell}>한국·유럽·일본 (KS·DIN·JIS·ISO)</td><td style={cell}>한국 표준 — DIY·가구·기계 전반</td></tr>
            <tr><td style={cell}><strong>🔧 UNC</strong></td><td style={cell}>미국 (Unified Coarse)</td><td style={cell}>일반 기계·산업·공구 (보통 피치)</td></tr>
            <tr><td style={cell}><strong>🔨 UNF</strong></td><td style={cell}>미국 (Unified Fine)</td><td style={cell}>정밀 기계·자동차·항공 (정밀 피치)</td></tr>
            <tr><td style={cell}><strong>🚿 PT</strong></td><td style={cell}>일본·한국 (Pipe Taper)</td><td style={cell}>배관·유압·공압 (한국 표준)</td></tr>
            <tr><td style={cell}><strong>💧 NPT</strong></td><td style={cell}>미국 (National Pipe Taper)</td><td style={cell}>미국식 배관·일부 산업 장비</td></tr>
            <tr><td style={cell}><strong>🪵 목재피스</strong></td><td style={cell}>JIS·KS</td><td style={cell}>목공·DIY 가구·셀프 인테리어</td></tr>
            <tr><td style={cell}><strong>🧱 석고피스</strong></td><td style={cell}>전용</td><td style={cell}>석고보드 시공 (벽체·천장)</td></tr>
          </tbody>
        </table>
        </div>
      </div>

      {/* 2. 탭드릴 vs 관통홀 vs 파일럿홀 */}
      <h2 style={sectionTitle}>📐 탭드릴 vs 관통홀 vs 파일럿홀 차이</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { name: '🔩 탭드릴 (Tap Drill)', color: '#059669', desc: '탭(나사산 절삭) 가공 전 미리 뚫는 홀. 외경보다 작음 (피치만큼).', use: '예: M6 → 5.0mm로 뚫고 → M6 탭으로 나사산 가공' },
          { name: '🟦 관통홀 (Clearance)', color: '#0891B2', desc: '볼트가 통과하는 홀. 외경보다 약간 큼 (정밀/일반/헐거움).', use: '예: M6 → 6.4mm(정밀) / 6.6mm(일반) / 7.0mm(헐거움)' },
          { name: '🟧 파일럿홀 (Pilot)', color: '#D97706', desc: '목재피스 박기 전 미리 뚫는 안내홀. 직경의 약 55~75% (경질목 ↑·연질목 ↓).', use: '예: 3.5mm 피스 → 2.5mm(경질목) / 2.0mm(연질목)' },
        ].map((p, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${p.color}44`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: p.color, fontWeight: 700, marginBottom: '8px' }}>{p.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '8px' }}>{p.desc}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{p.use}</p>
          </div>
        ))}
      </div>

      {/* 3. 결합률 비교 */}
      <h2 style={sectionTitle}>📊 결합률 50/75/85% 비교</h2>
      <p className="g-p">
        결합률(Thread Engagement) = 나사산이 모재와 얼마나 깊게 맞물리는지. 높을수록 강한 결합·낮을수록 분리 쉬움.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
        <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>결합률</th>
              <th scope="col" style={headCell}>탭드릴 직경</th>
              <th scope="col" style={headCell}>특징</th>
              <th scope="col" style={headCell}>적합</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...cell, color: '#0891B2', fontWeight: 700 }}>50%</td>
              <td style={cell}>약 D − 0.65×P</td>
              <td style={cell}>얕은 탭·가공 쉬움·분리 쉬움</td>
              <td style={cell}>임시·자주 분해</td>
            </tr>
            <tr>
              <td style={{ ...cell, color: '#059669', fontWeight: 700 }}>75% ⭐</td>
              <td style={cell}>약 D − P (표준)</td>
              <td style={cell}>표준·강도·가공성 균형</td>
              <td style={cell}>대부분 — 권장</td>
            </tr>
            <tr>
              <td style={{ ...cell, color: '#EA580C', fontWeight: 700 }}>85%</td>
              <td style={cell}>약 D − 1.10×P</td>
              <td style={cell}>깊은 탭·강한 결합·가공 어려움</td>
              <td style={cell}>높은 하중·진동 환경</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        💡 100%에 가까울수록 탭이 부러질 위험 ↑ — 표준 75%가 강도와 가공성의 최적 균형. 본 도구의 결합률 옵션 활용.
      </p>

      {/* 4. 소재별 가이드 */}
      <h2 style={sectionTitle}>🧱 소재별 탭 가공 주의사항</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { name: '🔩 철 (Steel)', color: '#0D9488', tips: '표준 탭드릴. 절삭유 사용 권장. 일반 고속강(HSS) 탭 OK.' },
          { name: '🟦 알루미늄', color: '#0891B2', tips: '연성 ↑ → 살짝 큰 드릴 (+0.05mm). 절삭유 필수. 칩이 잘 끼어 자주 빼주기.' },
          { name: '⚪ 스테인리스', color: '#0EA5E9', tips: '마찰열 ↑ + 가공 경화. 저속 회전·강한 절삭유 필수. 코발트 함유 탭 권장.' },
          { name: '🟫 황동', color: '#D97706', tips: '절삭성 우수. 표준 드릴. 절삭유 X도 가능 (단, 발열 주의).' },
          { name: '🟩 플라스틱', color: '#B885DA', tips: '셀프태핑 가능 — 탭 가공 X, 파일럿홀만 뚫고 직접 박기. 균열 주의.' },
        ].map((m, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${m.color}44`, borderLeft: `3px solid ${m.color}`, borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '13px', color: m.color, fontWeight: 700, marginBottom: '4px' }}>{m.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{m.tips}</p>
          </div>
        ))}
      </div>

      {/* 4-1. 한국 DIY 시나리오별 권장 나사 — 신규 */}
      <h2 style={sectionTitle}>🏠 한국 DIY 시나리오별 권장 나사</h2>
      <p className="g-p">
        한국 가정에서 자주 쓰이는 셀프 설치 시나리오와 추천 규격입니다. 벽재(석고/콘크리트/목재)에 따라 칼블록·앵커 필요 여부가 다릅니다.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div className="tableScroll">
        <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>시나리오</th>
              <th scope="col" style={headCell}>벽재</th>
              <th scope="col" style={headCell}>권장 나사</th>
              <th scope="col" style={headCell}>추가 필요</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>📺 TV 벽걸이 (50인치~)</td><td style={cell}>콘크리트</td><td style={cell}>M8 × 60~80mm 콘크리트 앵커</td><td style={cell}>칼블록 8~10mm + 함마드릴</td></tr>
            <tr><td style={cell}>🖼️ 액자 / 거울</td><td style={cell}>석고보드</td><td style={cell}>3.5 × 25~30mm 석고피스 또는 토글 앵커</td><td style={cell}>5kg 이상이면 토글 앵커 필수</td></tr>
            <tr><td style={cell}>📚 벽선반 / 책장 고정</td><td style={cell}>석고+스터드</td><td style={cell}>4.0 × 50mm 목재피스 (스터드 위치)</td><td style={cell}>스터드 디텍터로 위치 확인</td></tr>
            <tr><td style={cell}>🪑 IKEA 가구 조립</td><td style={cell}>—</td><td style={cell}>대부분 M4~M6 동봉. 분실 시 표준 규격</td><td style={cell}>육각키 동봉, 별도 구매 X</td></tr>
            <tr><td style={cell}>🚪 도어록 / 손잡이 교체</td><td style={cell}>목재 문</td><td style={cell}>3.5 × 25mm 목재피스 (제품 동봉)</td><td style={cell}>파일럿홀 2.5mm 권장</td></tr>
            <tr><td style={cell}>🪟 커튼봉 / 블라인드</td><td style={cell}>콘크리트/석고</td><td style={cell}>콘크리트 6mm 앵커 또는 석고 토글</td><td style={cell}>커튼 무게 +10% 안전 계수</td></tr>
            <tr><td style={cell}>🔧 일반 기계·DIY</td><td style={cell}>금속</td><td style={cell}>M5~M8 표준 미터 (KS 8.8 등급)</td><td style={cell}>M6 가장 흔함 (탭드릴 5.0mm)</td></tr>
          </tbody>
        </table>
        </div>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        💡 한국 아파트 벽은 대부분 <strong style={{ color: 'var(--text)' }}>콘크리트(외벽) + 석고보드(내벽 마감)</strong> 조합. 무거운 물건은 반드시 스터드 또는 콘크리트에 고정. 석고만으로는 5kg 이내가 안전선입니다.
      </p>

      {/* 5. 볼트·스패너 탭 사용법 (구 bolt-wrench 「어떻게 사용하나요?」) */}
      <h2 style={sectionTitle}>🛠️ 볼트·스패너 탭은 어떻게 쓰나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>볼트 종류 선택</strong> — 외부 6각(육각볼트)인지 내부 6각(소켓캡·버튼·플랫·세트)인지</li>
          <li><strong>사이즈 선택</strong> — M3 ~ M24 (가장 흔한 M6 / M8 / M10)</li>
          <li><strong>규격 토글</strong> — 외부 6각의 경우 ISO(현행) · 구 DIN·KS 부속서 · JIS 소형 중 선택</li>
          <li><strong>결과 확인</strong> — 스패너/알렌 사이즈 + 와셔·너트·토크 한 번에</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 모르는 볼트 사이즈는 볼트·스패너 탭의 <strong style={{ color: 'var(--accent-ink)' }}>역검색</strong>에서
          가지고 있는 스패너·알렌 사이즈를 입력하면 가능한 볼트 후보가 나와요.
        </p>
      </div>

      {/* 6. ISO·구 DIN·JIS 소형 차이 (구 bolt-wrench) — 수치는 아래 표 한 곳에만 */}
      <h2 style={sectionTitle}>⚠️ ISO·구 DIN·JIS 소형, 머리 크기가 왜 다른가요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          한국 정비·DIY 현장에서 가장 헷갈리는 지점입니다.
          같은 <strong>M10 볼트</strong>라도 따르는 규격에 따라 머리 크기가 16·17·14mm로 다릅니다.
        </p>
        <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.95, paddingLeft: 18, margin: '8px 0 12px' }}>
          <li><strong style={{ color: 'var(--text)' }}>현행 ISO</strong>: ISO 4014/4017(= KS B 1002·JIS B 1180 본체)</li>
          <li><strong style={{ color: 'var(--text)' }}>구 DIN 933 · KS·JIS 부속서</strong>: ISO 전환 전 치수 — 지금도 유통품에 많이 남아 있어요</li>
          <li><strong style={{ color: 'var(--text)' }}>JIS 소형</strong>: 머리를 한 치수 작게 만든 일본식 규격 — 일본차·옛 설비에서 자주 보여요</li>
        </ul>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px' }}>주요 차이 사이즈</p>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '4px 0' }}>M8</td><td style={{ color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)' }}>ISO 13 / 구 DIN 13 / JIS 소형 12 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>M10</td><td style={{ color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)' }}>ISO 16 / 구 DIN 17 / JIS 소형 14 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>M12</td><td style={{ color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)' }}>ISO 18 / 구 DIN 19 / JIS 소형 17 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>M14</td><td style={{ color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)' }}>ISO 21 / 구 DIN 22 / JIS 소형 19 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>M22</td><td style={{ color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)' }}>ISO 34 / 구 DIN 32 / JIS 소형 30 mm</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--text)' }}>사이즈 표</strong> 탭의 스패너 열은 구 DIN·KS 부속서 치수이고, 현행 ISO가 다른 사이즈는 괄호로 함께 적었습니다.
        </p>
      </div>

      {/* 7. 알렌렌치 (구 bolt-wrench) */}
      <h2 style={sectionTitle}>🔑 알렌렌치 사이즈는 왜 외부 스패너랑 다른가요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          같은 M8 볼트인데 외부 6각이면 13mm 스패너,
          소켓캡(알렌볼트)이면 6mm 알렌으로 다른 이유는 <strong>측정 위치</strong>가 다르기 때문입니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, color: 'var(--accent-ink)', fontWeight: 700, margin: '0 0 6px' }}>외부 6각 (스패너)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              머리 바깥쪽 6각 평면 사이 거리(across-flat).
              볼트 직경보다 항상 큼.
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, color: 'var(--accent-ink)', fontWeight: 700, margin: '0 0 6px' }}>내부 6각 (알렌)</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              머리 안쪽 6각 홈 평면 사이 거리.
              볼트 직경보다 작음 (대략 0.75~0.9배).
            </p>
          </div>
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          또한 같은 M8이라도 머리 모양(소켓캡·버튼·플랫·세트)에 따라 알렌 사이즈가 다릅니다.
          버튼/플랫은 머리가 얕아서 한 단계 작은 알렌을 씁니다.
        </p>
      </div>

      {/* 8. 공구 세트 가이드 (구 bolt-wrench) */}
      <h2 style={sectionTitle}>🧰 자주 쓰는 공구 세트 가이드</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {[
          { t: '🚲 자전거', c: 'var(--accent-ink)', d: '알렌이 핵심. 2~8mm 알렌세트 + 8/10/13/15mm 콤비스패너 + 토크렌치(카본).' },
          { t: '🪑 가구·DIY', c: 'var(--orange-600)', d: '이케아·한샘 표준 알렌 3/4/5/6mm + 10/13/14mm 스패너 + 드라이버.' },
          { t: '🚗 자동차', c: 'var(--cyan-600)', d: '3/8" 라쳇 + 8~22mm 소켓 풀세트 + 토크렌치 20~110Nm + 잭/잭스탠드.' },
          { t: '🏭 산업', c: 'var(--pink-600)', d: '1/2" 라쳇 + 6~32mm 임팩트 소켓 + 100~500Nm 토크렌치 + 슬러그 스패너.' },
        ].map((g, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.d}</p>
          </div>
        ))}
      </div>

      {/* 9. 토크·강도등급 + 안전 — 기존 「일반 토크 안내」와 구 bolt-wrench 「토크 등급」을 한 섹션으로 */}
      <h2 style={sectionTitle}>⚠️ 체결 토크·강도등급(8.8 / 10.9 / 12.9) + 안전 강조</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          체결 토크는 나사 등급·소재·결합부 상태에 따라 크게 다릅니다. 본 도구의 토크 안내는 두 가지입니다 —
          <strong> 탭드릴 계산</strong> 탭은 <strong style={{ color: 'var(--accent-ink)' }}>8.8 등급 강 볼트 일반 참고 범위</strong>,
          <strong> 볼트·스패너</strong> 탭은 강도등급별(4.8 / 8.8 / 10.9 / 12.9) <strong style={{ color: 'var(--accent-ink)' }}>ISO 16047 일반 참고치(마찰계수 0.14)</strong>입니다.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, margin: '14px 0 0' }}>
          볼트 머리에 새겨진 숫자는 <strong>강도등급(Property Class)</strong>입니다.
          앞 숫자×100 = 인장강도(MPa), 앞×뒤×10 = 항복강도(MPa).
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.9 }}>
            예시 <strong style={{ color: 'var(--accent-ink)' }}>8.8 등급</strong>:<br />
            • 인장강도 = 8 × 100 = <strong style={{ color: 'var(--accent-ink)' }}>800 MPa</strong><br />
            • 항복강도 = 8 × 8 × 10 = <strong style={{ color: 'var(--accent-ink)' }}>640 MPa</strong><br />
            • 즉 항복비 0.8 = 인장의 80% 지점에서 영구 변형 시작
          </p>
        </div>
        <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.95, paddingLeft: 18, marginTop: 12 }}>
          <li><strong style={{ color: 'var(--text)' }}>4.8</strong> — 일반 강·가구·전기 (가장 흔함)</li>
          <li><strong style={{ color: 'var(--text)' }}>8.8</strong> — 범용 기계·자동차 일반부 (한국 산업 표준)</li>
          <li><strong style={{ color: 'var(--text)' }}>10.9</strong> — 엔진·서스펜션·구조물 (고강도)</li>
          <li><strong style={{ color: 'var(--text)' }}>12.9</strong> — 항공·정밀 공구 (최고 강도, 취성 주의)</li>
        </ul>
        <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '14px 0 0' }}>토크를 적용할 때</p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '6px', paddingLeft: '18px', marginBottom: 0 }}>
          <li>정확한 토크는 <strong style={{ color: 'var(--text)' }}>제조사 사양·기계 매뉴얼</strong>에서 확인</li>
          <li>자동차·항공·정밀 기계는 토크 렌치 사용 필수</li>
          <li>스테인리스 볼트는 강 볼트와 다른 토크 적용</li>
          <li>녹·이물질·윤활 유무에 따라 토크 ±20~30% 변동</li>
        </ul>
      </div>
      <div style={{ ...card, marginTop: 14, background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
        <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700, marginBottom: '8px' }}>🚨 드릴·탭 작업 안전</p>
        <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
          <li>보호 안경·장갑 착용 (장갑은 회전체 끼임 주의)</li>
          <li>절삭유 사용 (특히 스테인리스·알루미늄)</li>
          <li>탭 부러짐 주의 — 무리한 힘 X, 1~2바퀴마다 1바퀴 역회전 (칩 배출)</li>
          <li>드릴 척에 단단히 고정, 작업물 클램핑</li>
          <li>응급: <strong style={{ color: '#D97706' }}>119</strong></li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. M6 나사 탭드릴은 몇 mm인가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>5.0mm</strong> (표준 75% 결합률, 표준 피치 1.0mm 기준).
          <br />공식: 외경 − 피치 = 6 − 1 = 5.0mm.
          <br />결합률·소재 보정 시 ±0.1~0.2mm 변동. 본 도구의 탭드릴 계산 탭에서 자동 산출.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 미터 나사와 인치 나사 차이는?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>크기 단위와 피치 표기 방식</strong>이 다릅니다.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>미터 (M)</strong>: 외경 mm + 피치 mm (예: M6 × 1.0). 한국·유럽·일본 표준.</li>
            <li><strong>인치 (UNC/UNF)</strong>: 외경 인치 + TPI(인치당 산수) (예: 1/4-20). 미국 표준.</li>
          </ul>
          서로 호환 X — M6(외경 6.0mm, 피치 1.0mm)와 1/4-20(외경 6.35mm, 20TPI≈1.27mm)은 외경과 피치가 모두 다릅니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. UNC와 UNF 차이는?</summary>
        <div style={faqAnswer}>
          모두 미국 인치 나사. <strong style={{ color: 'var(--text)' }}>피치(TPI)만 다름</strong>:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>UNC (Coarse)</strong>: 보통 피치. 일반 기계·산업. 예: 1/4-20</li>
            <li><strong>UNF (Fine)</strong>: 정밀 피치 (산수 ↑). 정밀 기계·자동차·항공. 예: 1/4-28</li>
          </ul>
          UNF가 산이 더 촘촘 → 진동 강함·미세 조정 좋음. UNC가 가공·체결 빠름.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. PT와 NPT 차이는?</summary>
        <div style={faqAnswer}>
          모두 파이프 나사 (테이퍼 형태로 누수 방지).
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>PT</strong>: 일본·한국 표준 (JIS·KS). 산둘레가 약간 다름.</li>
            <li><strong>NPT</strong>: 미국 표준. 한국에서는 수입 장비에 자주 등장.</li>
          </ul>
          서로 호환 안 됨 (외경·피치 미세 차이). 한국 배관은 PT가 표준이지만 미국식 장비·공압 부품은 NPT 가능 — 항상 확인.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 결합률이 뭔가요? 75%가 표준인가요?</summary>
        <div style={faqAnswer}>
          결합률(Thread Engagement) = 나사산이 모재 구멍과 얼마나 깊게 맞물리는지(%).
          <br /><br />
          <strong style={{ color: 'var(--text)' }}>75%가 ISO·KS 표준</strong>이며 강도와 가공성의 최적 균형. 그 이상(85~100%)은 결합력은 강하지만 탭이 부러질 위험 ↑ + 가공 시간 ↑. 50% 정도는 임시·자주 분해 용도.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 스테인리스에 탭 가공할 때 주의할 점은?</summary>
        <div style={faqAnswer}>
          스테인리스는 가공이 까다롭습니다 — <strong style={{ color: 'var(--text)' }}>마찰열 ↑ + 가공 경화</strong> (한 번 변형되면 더 단단해짐). 주의:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>저속 회전 (RPM ↓)</li>
            <li>강한 절삭유 필수 (전용 스테인리스용 권장)</li>
            <li>드릴/탭은 <strong>코발트 함유 HSS-Co</strong> 또는 <strong>초경합금</strong> 권장</li>
            <li>탭드릴 직경 +0.05mm (본 도구 자동 보정)</li>
            <li>한 번에 끝까지 X — 1~2바퀴 진행 후 1바퀴 역회전 (칩 배출)</li>
          </ul>
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 관통홀 직경은 어떻게 정하나요?</summary>
        <div style={faqAnswer}>
          용도에 따라 정밀/일반/헐거움 3등급 — <strong style={{ color: 'var(--text)' }}>ISO 273 표준값</strong>입니다(고정 더하기 공식이 아니라 사이즈별 표값):
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>정밀 (Tight·close)</strong>: 끼워맞춤·정렬 중요</li>
            <li><strong>일반 (Normal·medium)</strong>: 대부분 케이스 — 표준</li>
            <li><strong>헐거움 (Loose·coarse)</strong>: 조립 여유·열팽창 고려</li>
          </ul>
          예: M6 → 6.4 / 6.6 / 7.0mm (여유값은 사이즈가 커질수록 함께 커집니다). 정확한 값은 결과 카드·<strong>사이즈 표</strong> 탭 참고.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 목재피스 파일럿홀은 꼭 뚫어야 하나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>경질목·두께 얇은 합판은 필수</strong>, 연질목은 권장.
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>경질목(오크·메이플·티크): 파일럿 X → 균열·피스 부러짐 위험 ↑</li>
            <li>연질목(소나무·삼나무): 파일럿 권장 — 정확한 위치 + 균열 방지</li>
            <li>얇은 합판·MDF: 파일럿 필수 — 두께 변형 방지</li>
            <li>가장자리 가까이(엣지 근처): 파일럿 + 카운터싱크 필수</li>
          </ul>
          파일럿 직경 = 피스 직경의 약 55~75% (경질목 ↑·연질목 ↓ — 본 도구의 가이드 활용).
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 본 도구의 토크 안내는 정확한가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#DC2626' }}>일반 참고값</strong>입니다 — 정확치 X.
          <strong style={{ color: 'var(--text)' }}> 탭드릴 계산</strong> 탭은 8.8 등급 강 볼트 기준 일반 범위를,
          <strong style={{ color: 'var(--text)' }}> 볼트·스패너</strong> 탭은 강도등급별(4.8 / 8.8 / 10.9 / 12.9) ISO 16047 일반 참고치(마찰계수 0.14)를 표시합니다.
          <br /><br />
          정확한 토크는:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>제조사 사양서·기계 매뉴얼</li>
            <li>토크 렌치 사용 (특히 자동차·항공) — 토크렌치는 <strong>조일 때만</strong> 사용하고 풀 때는 일반 핸들</li>
            <li>나사 등급(4.6 / 8.8 / 10.9 / 12.9 등)별 다름</li>
            <li>스테인리스·티타늄·황동은 강 볼트와 다른 값 — 스테인리스(SUS304·SUS316, 강도등급 A2-70·A4-80)는 보통 <strong>일반 강 8.8 등급의 60~70% 정도</strong>가 안전 토크이고, <strong>긁어붙임(galling)</strong>이 잘 일어나 고착방지제(anti-seize)나 윤활제를 바르고 천천히 균등하게 조이세요</li>
            <li>윤활·녹·이물질로 ±20~30% 변동</li>
          </ul>
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 카운터싱크 깊이는 어떻게 정하나요?</summary>
        <div style={faqAnswer}>
          접시머리 나사용 카운터싱크(원뿔형 가공) 일반 가이드:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>직경</strong>: 나사 외경의 약 1.8~2배 (예: M6 → 12mm)</li>
            <li><strong>깊이</strong>: 머리 두께 + 0~0.5mm (살짝 깊게 → 표면과 평면)</li>
            <li><strong>각도</strong>: 표준 90° (목재) / 82° (인치 표준)</li>
          </ul>
          카운터싱크 비트 별도 구매 — 드릴 + 비트 세트가 일반적. 본 도구는 권장 직경·깊이만 안내.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q11. M8 스패너는 13mm인가요 12mm인가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>현행 ISO·KS 규격과 구 DIN 규격 모두 13mm</strong>입니다. 다만 일본차나 옛 일본산
          기계·자전거에는 <strong style={{ color: 'var(--text)' }}>JIS 소형 규격의 12mm</strong> 머리가 쓰인 경우가 있습니다.
          내 스패너가 헐겁게 들어가면 JIS 소형 사이즈를 의심해 보세요. 13mm 스패너를 12mm 볼트에 쓰면
          머리가 둥글게 마모(rounded)될 수 있으니 주의.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q12. 녹슨 볼트가 풀리지 않을 때는?</summary>
        <div style={faqAnswer}>
          순서대로: ① <strong style={{ color: 'var(--text)' }}>침투제(WD-40·PB Blaster)</strong>를 충분히 뿌리고 10~30분 대기 →
          ② 머리를 망치로 가볍게 두드려 충격 전달 →
          ③ <strong style={{ color: 'var(--text)' }}>역방향으로 살짝 조였다가 풀기</strong>(녹 균열) →
          ④ 그래도 안 되면 토치로 가열(주변 가연물 제거·소화 수단 준비, 도장·플라스틱 변형 주의 — <strong style={{ color: 'var(--text)' }}>침투제 분사 직후 가열 금지</strong>) →
          ⑤ 마지막 수단은 볼트 익스트랙터·드릴링. 한 사이즈 큰 스패너는 둥글림이 더 심해지므로 금물입니다.
        </div>
      </details>

      {/* 면책 */}
      <Disclaimer variant="default" open>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>본 도구는 <strong>일반 가이드</strong>입니다. 표준 사이즈 기준 (KS·DIN·ISO·JIS).</li>
          <li>실제 호환성은 ±0.1~0.5mm 차이 가능. 정밀 가공은 실측 권장.</li>
          <li>볼트·스패너 탭의 사이즈·토크는 KS·ISO·DIN <strong>표준 일반치 참고용</strong>입니다. 고강도·안전부품·고급 차량은 반드시 <strong>제조사 매뉴얼·도면</strong>을 따르세요.</li>
          <li>본 도구는 <strong>특정 브랜드·공구 추천 X · 정확한 토크값 보장 X · 인장/전단강도 보장 X · 항공/자동차 정밀 산업 적용 X · DIY 안전 가이드 X</strong>.</li>
          <li>⚠️ 드릴·탭 작업: 보호 안경·장갑 필수. 절삭유 사용. 응급 <strong>119</strong>.</li>
          <li>도움: 한국공구공업협동조합 · 한국표준과학연구원 · 가까운 공구상·시공 전문가.</li>
        </ul>
      </Disclaimer>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/unit/converter" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📐</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>단위 변환기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일반 길이·무게 변환</div>
        </Link>
        <Link href="/tools/interior/room-area" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏠</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>공간 면적 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>벽·바닥·천장</div>
        </Link>
        <Link href="/tools/interior/roof" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏠</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>지붕 면적 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>5형태 + 자재 단가</div>
        </Link>
        <Link href="/tools/interior/wallpaper" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🧱</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>도배 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>벽지 롤 수</div>
        </Link>
        <Link href="/tools/interior/molding" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📏</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>몰딩 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>천장·바닥</div>
        </Link>
        <Link href="/tools/life/unit-price" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏷️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>단가 비교 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>공구·자재 가격</div>
        </Link>
      </div>
    </ToolPage>
  )
}
