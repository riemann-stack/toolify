import Link from 'next/link'
import ScrewClient from './ScrewClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/interior/screw',
  title: '나사 규격 계산기 — M·UNC·UNF·PT 7종 + 탭드릴/관통홀/파일럿홀 + 인치↔mm',
  description: '나사 가공·드릴 구멍 중심 — M·UNC·UNF·PT·목재·석고 7종의 탭드릴·관통홀·파일럿홀 치수와 인치↔mm 변환표.',
  keywords: ['탭드릴 계산기', '나사 규격표', 'M6 탭드릴', 'M8 탭드릴', '미터 나사', '유니파이 나사', 'UNC UNF', 'PT 나사', '파이프 나사', '인치 mm 변환', '관통홀 직경', '목재피스 파일럿홀'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
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
  borderRadius: '12px',
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
  { "q":"미터 나사와 인치 나사 차이는?","a":"크기 단위와 피치 표기 방식이 다릅니다. 미터 (M): 외경 mm + 피치 mm (예: M6 × 1.0). 한국·유럽·일본 표준. 인치 (UNC/UNF): 외경 인치 + TPI(인치당 산수) (예: 1/4-20). 미국 표준. 서로 호환 X — M6 ≠ 1/4\" (둘 다 외경 ~6.35mm지만 피치가 다름)." },
  { "q":"UNC와 UNF 차이는?","a":"모두 미국 인치 나사. 피치(TPI)만 다름: UNC (Coarse): 보통 피치. 일반 기계·산업. 예: 1/4-20 UNF (Fine): 정밀 피치 (산수 ↑). 정밀 기계·자동차·항공. 예: 1/4-28 UNF가 산이 더 촘촘 → 진동 강함·미세 조정 좋음. UNC가 가공·체결 빠름." },
  { "q":"PT와 NPT 차이는?","a":"모두 파이프 나사 (테이퍼 형태로 누수 방지). PT: 일본·한국 표준 (JIS·KS). 산둘레가 약간 다름. NPT: 미국 표준. 한국에서는 수입 장비에 자주 등장. 서로 호환 안 됨 (외경·피치 미세 차이). 한국 배관은 PT가 표준이지만 미국식 장비·공압 부품은 NPT 가능 — 항상 확인." },
  { "q":"결합률이 뭔가요? 75%가 표준인가요?","a":"결합률(Thread Engagement) = 나사산이 모재 구멍과 얼마나 깊게 맞물리는지(%). 75%가 ISO·KS 표준이며 강도와 가공성의 최적 균형. 그 이상(85~100%)은 결합력은 강하지만 탭이 부러질 위험 ↑ + 가공 시간 ↑. 50% 정도는 임시·자주 분해 용도." },
  { "q":"스테인리스에 탭 가공할 때 주의할 점은?","a":"스테인리스는 가공이 까다롭습니다 — 마찰열 ↑ + 가공 경화 (한 번 변형되면 더 단단해짐). 주의: 저속 회전 (RPM ↓) 강한 절삭유 필수 (전용 스테인리스용 권장) 드릴/탭은 코발트 함유 HSS-Co 또는 초경합금 권장 탭드릴 직경 +0.05mm (본 도구 자동 보정) 한 번에 끝까지 X — 1~2바퀴 진행 후 1바퀴 역회전 (칩 배출)" },
  { "q":"관통홀 직경은 어떻게 정하나요?","a":"용도에 따라 정밀/일반/헐거움 3등급 — ISO 273 표준값입니다(고정 더하기 공식이 아니라 사이즈별 표값). 정밀 (Tight·close): 끼워맞춤·정렬 중요. 일반 (Normal·medium): 대부분 케이스 — 표준. 헐거움 (Loose·coarse): 조립 여유·열팽창 고려. 예: M6 → 6.4 / 6.6 / 7.0mm (여유값은 사이즈가 커질수록 함께 커짐). 정확한 값은 본 도구의 결과 카드·사이즈 표 탭 참고." },
  { "q":"목재피스 파일럿홀은 꼭 뚫어야 하나요?","a":"경질목·두께 얇은 합판은 필수, 연질목은 권장. 경질목(오크·메이플·티크): 파일럿 X → 균열·피스 부러짐 위험 ↑ 연질목(소나무·삼나무): 파일럿 권장 — 정확한 위치 + 균열 방지 얇은 합판·MDF: 파일럿 필수 — 두께 변형 방지 가장자리 가까이(엣지 근처): 파일럿 + 카운터싱크 필수 파일럿 직경 = 피스 직경의 약 55~75% (경질목은 ↑·연질목은 ↓ — 본 도구의 가이드 활용)." },
  { "q":"본 도구의 토크 안내는 정확한가요?","a":"일반 참고값입니다 — 정확치 X. 본 도구는 8.8 등급 강 볼트 기준 일반 범위만 표시. 정확한 토크는: 제조사 사양서·기계 매뉴얼 토크 렌치 사용 (특히 자동차·항공) 나사 등급(4.6 / 8.8 / 10.9 / 12.9 등)별 다름 스테인리스·티타늄·황동은 강 볼트와 다른 값 윤활·녹·이물질로 ±20~30% 변동" },
  { "q":"카운터싱크 깊이는 어떻게 정하나요?","a":"접시머리 나사용 카운터싱크(원뿔형 가공) 일반 가이드: 직경: 나사 외경의 약 1.8~2배 (예: M6 → 12mm) 깊이: 머리 두께 + 0~0.5mm (살짝 깊게 → 표면과 평면) 각도: 표준 90° (목재) / 82° (인치 표준) 카운터싱크 비트 별도 구매 — 드릴 + 비트 세트가 일반적. 본 도구는 권장 직경·깊이만 안내." }
]

export default function ScrewPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>주거·인테리어</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔩 나사 규격 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '10px' }}>
        M·UNC·UNF·PT·목재·석고 <strong style={{ color: 'var(--text)' }}>7종 + 탭드릴·관통홀·렌치 사이즈</strong>.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        이 도구는 <strong style={{ color: 'var(--text)' }}>나사 가공·드릴 구멍</strong>(탭드릴·관통홀·파일럿홀) 중심입니다.
        볼트 머리에 맞는 스패너·알렌렌치 선택과 체결 토크는{' '}
        <Link href="/tools/interior/bolt-wrench" style={{ color: 'var(--accent)', fontWeight: 600 }}>볼트 스패너 계산기</Link>를 참고하세요.
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
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${p.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: p.color, fontWeight: 700, marginBottom: '8px' }}>{p.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '8px' }}>{p.desc}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{p.use}</p>
          </div>
        ))}
      </div>

      {/* 3. 결합률 비교 */}
      <h2 style={sectionTitle}>📊 결합률 50/75/85% 비교</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
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
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
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

      {/* 5. 안전 + 일반 토크 */}
      <h2 style={sectionTitle}>⚠️ 일반 토크 안내 + 안전 강조</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          체결 토크는 나사 등급·소재·결합부 상태에 따라 크게 다릅니다. 본 도구의 토크 안내는 <strong style={{ color: 'var(--accent)' }}>8.8 등급 강 볼트 일반 참고값</strong>입니다.
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '10px', paddingLeft: '18px', marginBottom: 0 }}>
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
          서로 호환 X — M6 ≠ 1/4&quot; (둘 다 외경 ~6.35mm지만 피치가 다름).
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
          <strong style={{ color: '#DC2626' }}>일반 참고값</strong>입니다 — 정확치 X. 본 도구는 8.8 등급 강 볼트 기준 일반 범위만 표시.
          <br /><br />
          정확한 토크는:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>제조사 사양서·기계 매뉴얼</li>
            <li>토크 렌치 사용 (특히 자동차·항공)</li>
            <li>나사 등급(4.6 / 8.8 / 10.9 / 12.9 등)별 다름</li>
            <li>스테인리스·티타늄·황동은 강 볼트와 다른 값</li>
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

      {/* 면책 */}
      <Disclaimer variant="default" open>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>본 도구는 <strong>일반 가이드</strong>입니다. 표준 사이즈 기준 (KS·DIN·ISO·JIS).</li>
          <li>실제 호환성은 ±0.1~0.5mm 차이 가능. 정밀 가공은 실측 권장.</li>
          <li>본 도구는 <strong>특정 브랜드·공구 추천 X · 정확한 토크값 보장 X · 인장/전단강도 보장 X · 항공/자동차 정밀 산업 적용 X · DIY 안전 가이드 X</strong>.</li>
          <li>⚠️ 드릴·탭 작업: 보호 안경·장갑 필수. 절삭유 사용. 응급 <strong>119</strong>.</li>
          <li>도움: 한국공구협회 · 한국표준과학연구원 · 가까운 공구상·시공 전문가.</li>
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
    </div>
  )
}
