import Link from 'next/link'
import ScrewClient from './ScrewClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/screw',
  title: '나사 규격 계산기 — M·UNC·UNF·PT 7종 + 탭드릴/관통홀/파일럿홀 + 인치↔mm',
  description: '미터 나사·유니파이 나사·파이프 나사·목재/석고피스 7종 → 탭드릴 직경·관통홀·파일럿홀·육각렌치·스패너 사이즈 자동. 소재별 보정·결합률 옵션·인치 ↔ mm 양방향 변환·자주 쓰는 사이즈 표.',
  keywords: ['탭드릴 계산기', '나사 규격표', 'M6 탭드릴', 'M8 탭드릴', '미터 나사', '유니파이 나사', 'UNC UNF', 'PT 나사', '파이프 나사', '인치 mm 변환', '관통홀 직경', '목재피스 파일럿홀'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
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

export default function ScrewPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>주거·인테리어</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔩 나사 규격 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        M·UNC·UNF·PT·NPT·목재·석고 7종 나사 → 탭드릴·관통홀·파일럿홀 직경 자동 + 소재 보정 + 육각/스패너 사이즈 + 인치↔mm.
      </p>

      <ScrewClient />

      {/* 1. 나사 종류 가이드 */}
      <h2 style={sectionTitle}>🔩 7가지 나사 종류 가이드</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>종류</th>
              <th style={headCell}>표준</th>
              <th style={headCell}>주 사용처</th>
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

      {/* 2. 탭드릴 vs 관통홀 vs 파일럿홀 */}
      <h2 style={sectionTitle}>📐 탭드릴 vs 관통홀 vs 파일럿홀 차이</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { name: '🔩 탭드릴 (Tap Drill)', color: '#3EFF9B', desc: '탭(나사산 절삭) 가공 전 미리 뚫는 홀. 외경보다 작음 (피치만큼).', use: '예: M6 → 5.0mm로 뚫고 → M6 탭으로 나사산 가공' },
          { name: '🟦 관통홀 (Clearance)', color: '#3EC8FF', desc: '볼트가 통과하는 홀. 외경보다 약간 큼 (정밀/일반/헐거움).', use: '예: M6 → 6.4mm(정밀) / 6.6mm(일반) / 7.0mm(헐거움)' },
          { name: '🟧 파일럿홀 (Pilot)', color: '#FFB83E', desc: '목재피스 박기 전 미리 뚫는 안내홀. 직경의 65~70%.', use: '예: 3.5mm 피스 → 2.5mm(경질목) / 2.0mm(연질목)' },
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headCell}>결합률</th>
              <th style={headCell}>탭드릴 직경</th>
              <th style={headCell}>특징</th>
              <th style={headCell}>적합</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...cell, color: '#3EC8FF', fontWeight: 700 }}>50%</td>
              <td style={cell}>약 D − 0.65×P</td>
              <td style={cell}>얕은 탭·가공 쉬움·분리 쉬움</td>
              <td style={cell}>임시·자주 분해</td>
            </tr>
            <tr>
              <td style={{ ...cell, color: '#3EFF9B', fontWeight: 700 }}>75% ⭐</td>
              <td style={cell}>약 D − P (표준)</td>
              <td style={cell}>표준·강도·가공성 균형</td>
              <td style={cell}>대부분 — 권장</td>
            </tr>
            <tr>
              <td style={{ ...cell, color: '#FF8C3E', fontWeight: 700 }}>85%</td>
              <td style={cell}>약 D − 1.10×P</td>
              <td style={cell}>깊은 탭·강한 결합·가공 어려움</td>
              <td style={cell}>높은 하중·진동 환경</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        💡 100%에 가까울수록 탭이 부러질 위험 ↑ — 표준 75%가 강도와 가공성의 최적 균형. 본 도구의 결합률 옵션 활용.
      </p>

      {/* 4. 소재별 가이드 */}
      <h2 style={sectionTitle}>🧱 소재별 탭 가공 주의사항</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { name: '🔩 철 (Steel)', color: '#3EFFD0', tips: '표준 탭드릴. 절삭유 사용 권장. 일반 고속강(HSS) 탭 OK.' },
          { name: '🟦 알루미늄', color: '#3EC8FF', tips: '연성 ↑ → 살짝 큰 드릴 (+0.05mm). 절삭유 필수. 칩이 잘 끼어 자주 빼주기.' },
          { name: '⚪ 스테인리스', color: '#C8FF3E', tips: '마찰열 ↑ + 가공 경화. 저속 회전·강한 절삭유 필수. 코발트 함유 탭 권장.' },
          { name: '🟫 황동', color: '#FFB83E', tips: '절삭성 우수. 표준 드릴. 절삭유 X도 가능 (단, 발열 주의).' },
          { name: '🟩 플라스틱', color: '#B885DA', tips: '셀프태핑 가능 — 탭 가공 X, 파일럿홀만 뚫고 직접 박기. 균열 주의.' },
        ].map((m, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${m.color}44`, borderLeft: `3px solid ${m.color}`, borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '13px', color: m.color, fontWeight: 700, marginBottom: '4px' }}>{m.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{m.tips}</p>
          </div>
        ))}
      </div>

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
      <div style={{ ...card, marginTop: 14, background: 'rgba(255, 107, 107, 0.06)', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
        <p style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: 700, marginBottom: '8px' }}>🚨 드릴·탭 작업 안전</p>
        <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
          <li>보호 안경·장갑 착용 (장갑은 회전체 끼임 주의)</li>
          <li>절삭유 사용 (특히 스테인리스·알루미늄)</li>
          <li>탭 부러짐 주의 — 무리한 힘 X, 1~2바퀴마다 1바퀴 역회전 (칩 배출)</li>
          <li>드릴 척에 단단히 고정, 작업물 클램핑</li>
          <li>응급: <strong style={{ color: '#FFB83E' }}>119</strong></li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

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
          용도에 따라 정밀/일반/헐거움 3종류:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>정밀 (Tight)</strong>: 외경 + 0.4mm. 정밀 끼워맞춤·정렬 중요</li>
            <li><strong>일반 (Normal)</strong>: 외경 + 1.0mm. 대부분 케이스 — 표준</li>
            <li><strong>헐거움 (Loose)</strong>: 외경 + 2.0mm. 조립 시 여유 필요·열팽창 고려</li>
          </ul>
          예: M6 → 6.4 / 6.6 / 7.0mm. 본 도구의 결과 카드에 모두 표시.
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
          파일럿 직경 = 피스 직경의 65~70% (본 도구의 가이드 활용).
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 본 도구의 토크 안내는 정확한가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#FF6B6B' }}>일반 참고값</strong>입니다 — 정확치 X. 본 도구는 8.8 등급 강 볼트 기준 일반 범위만 표시.
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
      <h2 style={sectionTitle}>⚠️ 면책 조항</h2>
      <div style={{
        background: 'rgba(255, 184, 62, 0.06)',
        border: '1px solid rgba(255, 184, 62, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>본 도구는 <strong>일반 가이드</strong>입니다. 표준 사이즈 기준 (KS·DIN·ISO·JIS).</li>
          <li>실제 호환성은 ±0.1~0.5mm 차이 가능. 정밀 가공은 실측 권장.</li>
          <li>본 도구는 <strong>특정 브랜드·공구 추천 X · 정확한 토크값 보장 X · 인장/전단강도 보장 X · 항공/자동차 정밀 산업 적용 X · DIY 안전 가이드 X</strong>.</li>
          <li>⚠️ 드릴·탭 작업: 보호 안경·장갑 필수. 절삭유 사용. 응급 <strong>119</strong>.</li>
          <li>도움: 한국공구협회 · 한국표준과학연구원 · 가까운 공구상·시공 전문가.</li>
        </ul>
      </div>

      {/* 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
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
