import Link from 'next/link'
import FovClient from './FovClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/art/fov',
  title: '카메라 화각 (35mm 환산) 계산기 — 크롭 팩터·AOV·시야 너비·렌즈 가이드',
  description: '풀프레임·APS-C·M4/3·1인치·스마트폰 7종 센서 × 4-800mm 초점거리 × 거리 기반 35mm 환산 + 수평·수직·대각 화각(AOV) 계산. 등가 조리개·500룰·인기 렌즈 8개 비교 SVG·10 용도별(풍경/인물/스트리트/스포츠/야생/매크로/이벤트/별/제품/브이로그) 추천 렌즈 가이드 4탭.',
  keywords: [
    '카메라 화각 계산기', '35mm 환산', '크롭 팩터', '풀프레임 환산',
    'APS-C 환산', 'M4/3 환산', '시야각', 'AOV', 'angle of view',
    '등가 조리개', '심도 환산', '500룰 별 사진', '안전 셔터 룰',
    '렌즈 추천', '인물 렌즈', '풍경 렌즈', '망원 렌즈', '광각 렌즈',
    '시야 너비', '프레임 크기', '피사체 거리', '카메라 센서 크기',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Syne, sans-serif',
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

export default function FovPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        예술·창작 · 사진
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📷 카메라 화각 (35mm 환산) 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        풀프레임·APS-C(×1.5/×1.6)·M4/3·1인치·스마트폰 <strong style={{ color: 'var(--text)' }}>7종 센서</strong> × 4-800mm 초점거리.{' '}
        <strong style={{ color: 'var(--text)' }}>35mm 환산 + 수평·수직·대각 화각(AOV)</strong> + 시야 너비/높이 +{' '}
        <strong style={{ color: 'var(--text)' }}>등가 조리개·500룰</strong> + 10 용도별 추천 렌즈 가이드 4탭.
      </p>

      <FovClient />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>센서 선택</strong> — 풀프레임 / APS-C / M4/3 / 1인치 / 스마트폰</li>
          <li><strong>초점거리 슬라이더</strong> — 실제 렌즈 표기 mm (4-800mm)</li>
          <li><strong>35mm 환산 + 화각 자동 계산</strong> — 수평·수직·대각 도(°)</li>
          <li><strong>시야 너비 탭</strong>에서 거리에 따른 프레임 크기 확인</li>
          <li><strong>화각 비교 탭</strong>에서 인기 8개 초점거리 SVG 시각화</li>
          <li><strong>용도별 가이드 탭</strong>에서 풍경·인물·스포츠 등 추천 렌즈 + 자동 적용</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 입력값(센서·초점거리·조리개·거리)은 자동 저장되어 새로고침해도 유지됩니다.
        </p>
      </div>

      {/* 2. 35mm 환산 — 핵심 개념 */}
      <h2 style={sectionTitle}>📐 35mm 환산 — 왜 필요한가?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          같은 50mm 렌즈여도 카메라 센서 크기에 따라 화각이 다릅니다. <strong>35mm 환산</strong>은 모든 센서를 풀프레임(36×24mm)을 기준으로 통일해 표현하는 사진 업계 표준입니다.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85 }}>
          공식: <strong>35mm 환산 mm = 실제 mm × 크롭 팩터</strong>. 크롭 팩터는 풀프레임 대각선(43.27mm) ÷ 센서 대각선.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>센서</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>크기 (mm)</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>크롭 팩터</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>50mm → 환산</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['풀프레임 (Full Frame)',  '36 × 24',     '×1.0',  '50mm'],
                ['APS-C (Sony·Nikon·Fuji)', '23.6 × 15.6', '×1.5',  '75mm'],
                ['APS-C (Canon)',          '22.3 × 14.9', '×1.6',  '80mm'],
                ['M4/3',                   '17.3 × 13.0', '×2.0',  '100mm'],
                ['1인치',                  '13.2 × 8.8',  '×2.7',  '135mm'],
                ['2/3"',                   '8.8 × 6.6',   '×3.9',  '195mm'],
                ['스마트폰 1/1.7"',         '7.5 × 5.6',   '×4.6',  '230mm'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 10px', color: 'var(--text)', fontSize: 12.5 }}>{row[0]}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{row[1]}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          → 같은 50mm 렌즈를 풀프레임에 끼우면 표준 화각, APS-C(×1.5)에 끼우면 75mm 인물 단렌즈 같은 화각, M4/3(×2.0)에 끼우면 100mm 단망원 같은 화각이 됩니다.
        </p>
      </div>

      {/* 3. 화각(AOV) 공식 */}
      <h2 style={sectionTitle}>🔭 화각(AOV) 공식 — 왜 도(°) 단위?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          화각은 카메라가 한 번에 담을 수 있는 시야의 각도입니다. <strong>수평·수직·대각</strong> 세 종류가 있어요.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85 }}>
          공식: <strong>AOV = 2 × atan(센서변 / 2 × 초점거리)</strong>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 14 }}>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #FF3E8C', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#FF3E8C', fontWeight: 700, margin: '0 0 4px' }}>🌌 14mm 풀프레임</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              수평 <strong>104°</strong> · 대각 <strong>114°</strong> · 광활한 풍경, 실내 인테리어, 별 사진
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #FFB83E', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#FFB83E', fontWeight: 700, margin: '0 0 4px' }}>🚶 35mm 풀프레임</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              수평 <strong>54°</strong> · 대각 <strong>63°</strong> · 자연스러운 시야, 스트리트, 환경 인물
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #3EFFD0', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#3EFFD0', fontWeight: 700, margin: '0 0 4px' }}>👤 50mm 풀프레임</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              수평 <strong>40°</strong> · 대각 <strong>47°</strong> · 사람 눈에 가장 가까운 자연스러운 화각
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #3EC8FF', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, margin: '0 0 4px' }}>🎤 85mm 풀프레임</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              수평 <strong>23.9°</strong> · 대각 <strong>28.6°</strong> · 인물 단렌즈 표준, 압축감
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #C485E0', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#C485E0', fontWeight: 700, margin: '0 0 4px' }}>⚽ 200mm 풀프레임</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              수평 <strong>10.3°</strong> · 대각 <strong>12.3°</strong> · 인물 압축, 스포츠, 이벤트
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', borderTop: '3px solid #FF8C3E', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 13, color: '#FF8C3E', fontWeight: 700, margin: '0 0 4px' }}>🦒 600mm 풀프레임</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              수평 <strong>3.4°</strong> · 대각 <strong>4.1°</strong> · 야생 동물, 달, 스포츠 사이드라인
            </p>
          </div>
        </div>
      </div>

      {/* 4. 등가 조리개 */}
      <h2 style={sectionTitle}>🌀 등가 조리개 (심도 환산)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          작은 센서는 같은 35mm 환산 화각·거리에서 <strong>심도가 더 깊습니다</strong>(보케가 적음). 풀프레임과 같은 보케를 만들려면 <strong>등가 조리개</strong>를 알아야 해요.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85 }}>
          공식: <strong>등가 조리개 = 실제 조리개 × 크롭 팩터</strong>
        </p>
        <ul style={{ paddingLeft: 18, margin: '12px 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>APS-C f/2.8</strong> ≈ 풀프레임 f/4.2 심도</li>
          <li><strong style={{ color: 'var(--text)' }}>M4/3 f/1.7</strong> ≈ 풀프레임 f/3.4 심도</li>
          <li><strong style={{ color: 'var(--text)' }}>1인치 f/1.8</strong> ≈ 풀프레임 f/4.9 심도</li>
          <li><strong style={{ color: 'var(--text)' }}>스마트폰 f/1.8</strong> ≈ 풀프레임 f/8.3 심도(보케 거의 없음)</li>
        </ul>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⚠️ 등가 조리개는 <strong>심도</strong>(보케)에만 적용되며, <strong>노출(빛 양)</strong>은 변하지 않습니다. M4/3 f/1.7 = 풀프레임 f/1.7과 동일한 셔터·ISO에서 같은 밝기.
        </p>
      </div>

      {/* 5. 안전 셔터 룰 */}
      <h2 style={sectionTitle}>📏 시야 너비 공식 — 거리에 따른 프레임 크기</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          공식: <strong>프레임 너비 = 거리 × 센서변 / 초점거리</strong> (모두 같은 단위, 큰 거리에 비례)
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>풀프레임 + 50mm</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>가로 시야</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>세로 시야</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>활용</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1m',  '0.72m', '0.48m', '제품·꽃·소품 클로즈업'],
                ['2m',  '1.44m', '0.96m', '인물 상반신·반신'],
                ['3m',  '2.16m', '1.44m', '인물 전신'],
                ['5m',  '3.60m', '2.40m', '단체 사진 (4-6명)'],
                ['10m', '7.20m', '4.80m', '실내 이벤트'],
                ['50m', '36.0m', '24.0m', '풍경·중경'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[0]}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{row[1]}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{row[2]}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--muted)', fontSize: 12.5 }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 셀카봉 셀프촬영(50cm) 시 풀프레임 24mm는 가로 75cm 시야 → 얼굴 + 배경이 들어옴. 망원 50mm는 가로 36cm 시야 → 얼굴만 빽빽이.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 35mm 환산이 정확히 무엇인가요?</summary>
        <p style={faqAnswer}>
          모든 카메라 화각을 <strong>35mm 필름(=풀프레임 36×24mm)</strong> 기준으로 통일해 표현한 값입니다. 디지털 시대 다양한 센서 크기 때문에 같은 50mm 렌즈도 화각이 달라 비교가 어려웠어요. 35mm 환산을 쓰면 어떤 카메라든 &quot;환산 50mm = 표준 화각&quot;처럼 직관적 비교 가능. 공식: <strong>환산 mm = 실제 mm × 크롭 팩터</strong>.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 크롭 팩터(Crop Factor)는 어떻게 정해지나요?</summary>
        <p style={faqAnswer}>
          <strong>풀프레임 대각선(43.27mm) ÷ 센서 대각선</strong>으로 계산합니다.<br />
          • APS-C(소니/니콘/후지): 28.4mm 대각선 → 43.27/28.4 ≈ <strong>1.5</strong><br />
          • APS-C(캐논): 26.8mm → ≈ <strong>1.6</strong><br />
          • M4/3: 21.6mm → ≈ <strong>2.0</strong><br />
          • 1인치: 15.9mm → ≈ <strong>2.7</strong><br />
          제조사 표기는 정확한 값이 약간씩 다를 수 있습니다(예: 후지 ×1.52).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. APS-C에서 50mm와 풀프레임 50mm 차이는?</summary>
        <p style={faqAnswer}>
          <strong>화각(시야)이 다릅니다</strong>. APS-C(×1.5)에 50mm를 끼우면 풀프레임 75mm와 같은 화각(가운데가 잘려서 좁게 보임). 즉 풀프레임 50mm가 표준 단렌즈라면, APS-C 50mm는 인물 단렌즈처럼 작용해요. 같은 표준 화각을 원하면 APS-C에서는 약 33mm 렌즈가 필요합니다(50 / 1.5 ≈ 33). 단, 심도(보케)와 노출은 별개입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 등가 조리개는 왜 필요한가요?</summary>
        <p style={faqAnswer}>
          <strong>심도(보케) 비교</strong>를 위해서입니다. M4/3 f/1.7로 인물을 찍으면 풀프레임 f/3.4와 같은 심도(보케 양). 풀프레임 같은 강한 보케를 원하면 작은 센서에서는 더 밝은 조리개가 필요해요. 다만 <strong>노출(빛의 양)</strong>은 등가 조리개와 무관 — M4/3 f/1.7 = 풀프레임 f/1.7과 동일한 셔터·ISO에서 같은 밝기. 혼동하지 마세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 스마트폰 카메라의 &quot;24mm 환산&quot;이 의미하는 것?</summary>
        <p style={faqAnswer}>
          스마트폰 메인 카메라 센서는 풀프레임의 1/4~1/5 크기(크롭 팩터 ×4~×7)이지만, 사양표에는 35mm 환산 mm가 표기됩니다. 예: 아이폰 15 Pro 메인 카메라는 24mm 환산(실제 약 5.7mm). 풀프레임 24mm 광각 렌즈와 같은 화각을 의미해요. 망원 카메라는 보통 70mm 환산(실제 약 9mm), 초광각은 13mm 환산(실제 약 1.5mm).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 인물 사진에 왜 85mm가 표준인가요?</summary>
        <p style={faqAnswer}>
          85mm 환산이 인물 표준이 된 이유:<br />
          1. <strong>자연스러운 원근감</strong> — 50mm는 코가 살짝 도드라지고, 85mm는 얼굴 비율이 가장 자연스러움<br />
          2. <strong>적당한 압축감</strong> — 배경이 살짝 압축되어 인물이 부각<br />
          3. <strong>적당한 작업 거리</strong> — 모델과 2-3m 거리에서 상반신 가능<br />
          4. <strong>강력한 보케</strong> — 망원 효과로 배경 흐림 ↑<br />
          전신은 50mm 또는 35mm 환경 인물, 클로즈업은 105mm·135mm가 더 좋은 경우도 있습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 안전 셔터 룰(Safe Shutter)은?</summary>
        <p style={faqAnswer}>
          삼각대 없이 손으로 들고 찍을 때 흔들림 방지 셔터: <strong>1 / (35mm 환산 mm)</strong> 이상.<br />
          • 풀프레임 50mm → 1/50 이상<br />
          • APS-C 50mm(=환산 75mm) → 1/75 이상<br />
          • M4/3 50mm(=환산 100mm) → 1/100 이상<br />
          현대 카메라의 손떨림 보정(IBIS)으로 5~7 stop까지 도움 받지만, 본인 손떨림·호흡을 고려해 1~2 stop 여유를 두는 게 좋습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 별 사진 500룰은 어떻게 적용?</summary>
        <p style={faqAnswer}>
          <strong>최대 셔터(초) = 500 / 35mm 환산 mm</strong>입니다. 이 시간을 넘으면 별이 점이 아닌 선으로 흐려져요(별궤적).<br />
          • 풀프레임 24mm → 500/24 ≈ 21초<br />
          • APS-C 16mm(=환산 24mm) → 약 21초<br />
          • M4/3 12mm(=환산 24mm) → 약 21초<br />
          고해상도 카메라(45MP+)는 더 엄격한 <strong>300룰</strong>(300/환산mm) 권장. 자세한 노출 계산은 <a href="/tools/art/exposure" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>사진 노출 계산기</a>의 [상황 가이드] 탭을 활용하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 줌렌즈 70-200mm는 어떻게 표기?</summary>
        <p style={faqAnswer}>
          줌렌즈 표기는 <strong>풀프레임 기준</strong>이 일반적입니다. 70-200mm 렌즈를 APS-C(×1.5) 카메라에 끼우면 환산 105-300mm가 되어 더 망원으로 작동해요. 캐논의 EF-S, 니콘의 DX, 후지 X, 소니 E 등 <strong>크롭 전용 렌즈</strong>는 표기가 다를 수 있습니다 — 후지 XF 50-140mm = 풀프레임 환산 76-213mm. 사양표에서 &quot;35mm 환산&quot; 또는 &quot;Equivalent focal length&quot; 항목을 확인하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 화각이 같으면 사진이 똑같나요?</summary>
        <p style={faqAnswer}>
          아닙니다. 화각이 같아도 다음이 달라요:<br />
          • <strong>심도(보케)</strong> — 작은 센서는 심도 깊음(보케 적음)<br />
          • <strong>저조도 화질</strong> — 큰 센서가 노이즈 적음(픽셀 면적 ↑)<br />
          • <strong>왜곡</strong> — 같은 화각이라도 광각 렌즈 설계에 따라 왜곡 정도 다름<br />
          • <strong>색감·해상력</strong> — 렌즈 품질 의존<br />
          35mm 환산은 <strong>화각만</strong> 통일하는 개념이며, 이미지 품질의 다른 요소들은 별도 평가가 필요합니다.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 사진·예술 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/art/exposure" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📸</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>사진 노출 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            조리개·셔터·ISO 등가 노출
          </p>
        </Link>
        <Link href="/tools/art/golden-ratio" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>황금비율 계산기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            구도·디자인 비율
          </p>
        </Link>
        <Link href="/tools/art/color" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🎨</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>색상 변환·디자인</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            HEX·RGB·WCAG·팔레트
          </p>
        </Link>
      </div>
    </div>
  )
}
