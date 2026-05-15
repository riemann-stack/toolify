import Link from 'next/link'
import ThawingClient from './ThawingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/cooking/thawing',
  title: '해동 시간 계산기 — 식품별·두께별·전자레인지 W별 해동 가이드 | Youtil',
  description: '소고기·돼지·닭·생선·채소·빵·조리음식 6종 해동 시간. 4가지 방법 (냉장·찬물·실온·전자레인지) 비교, 위험도 카드, 전자레인지 출력별 보정, 식품별 조리 팁, 해동 시각 역산까지. 식약처 기준 식품 안전 가이드.',
  keywords: [
    '해동시간계산기', '고기해동시간', '냉동해동계산기', '냉장해동시간',
    '생선해동시간', '식품해동방법', '냉동보관기간', '전자레인지 해동',
    '닭 해동 시간', '갈치 해동', '안전 해동', '식품 위험 온도대',
    '재냉동 금지', '식중독 예방', '명절 갈비 해동', '삼겹살 해동',
  ],
})

export default function ThawingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧊 해동 시간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        식품·두께·무게·전자레인지 W별 4가지 해동 방법 비교, <strong style={{ color: 'var(--text)' }}>위험도 카드·식품별 조리 팁·해동 시작·완료 시각 자동·역산</strong>까지.
        식약처 기준 식품 안전 가이드.
      </p>

      {/* 상단 면책 */}
      <div style={{ background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.35)', borderRadius: '14px', padding: '16px 20px', marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#FF6B6B', marginBottom: '8px' }}>⚠️ 식품 안전 안내</p>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
          본 계산기는 <strong style={{ color: 'var(--text)' }}>일반적인 참고용 수치</strong>를 제공합니다.
          실제 해동 시간은 냉동고 온도, 식품 포장 상태, 냉장고 성능에 따라 다를 수 있습니다.
          식품 안전을 위해 항상 내부 온도를 확인하고 <strong style={{ color: '#FF6B6B' }}>의심스러운 식품은 폐기</strong>하세요.
          (참고: 식품의약품안전처 식품 안전 가이드라인)
        </p>
      </div>

      <ThawingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 해동 방법 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            해동 방법별 비교
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['방법', '속도', '안전도', '권장 식품', '주의사항'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🧊 냉장 해동',   '느림 (8~24h)',  '★★★★★', '모든 식품',    '1~2일 내 조리',   '#3EC8FF'],
                  ['💧 흐르는 물',   '빠름 (1~3h)',   '★★★★',  '생선·해산물',  '2시간 이내 · 밀봉', '#3EC8FF'],
                  ['🌡️ 실온 해동',   '보통 (2~6h)',   '★★',    '비권장',       '2시간 초과 금지', '#FF8C3E'],
                  ['⚡ 전자레인지',  '매우빠름 (5~30분)', '★★★', '얇은 육류',   '즉시 조리 필수',  '#C8FF3E'],
                ].map(([m, sp, saf, food, note, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: color as string, fontWeight: 700 }}>{m}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{sp}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{saf}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{food}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 냉동 보관 기간 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            식품별 냉동 보관 기간
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식품', '최적 기간', '최대 기간', '냉동 팁'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : i === 3 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🥩 소고기',       '3~4개월', '6~12개월', '공기 최대한 제거·진공포장 시 더 오래'],
                  ['🐷 돼지고기',     '2~3개월', '6개월',    '1회분씩 소분 냉동'],
                  ['🍗 닭고기',       '2~3개월', '4개월',    '뼈 제거 후 냉동 시 공간 절약'],
                  ['🐟 생선 (흰살)',  '2~3개월', '4개월',    '물기 제거 필수·호일 포장'],
                  ['🦐 새우·오징어',  '2~3개월', '6개월',    '손질 후 냉동·얼음막 코팅'],
                  ['🥦 채소',         '8~12개월', '12개월',   '블랜칭(데치기) 후 냉동'],
                  ['🍞 빵',           '1~2개월', '3개월',    '슬라이스 후 냉동·토스터 해동'],
                  ['🍱 조리된 음식',  '1~2개월', '3개월',    '완전히 식힌 후 소분'],
                ].map(([food, best, max, tip], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{food}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{best}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{max}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 위험 온도대 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ⚠️ 위험 온도대와 2시간 규칙
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            <strong style={{ color: '#FF6B6B' }}>4°C ~ 60°C는 세균이 가장 빠르게 증식하는 위험 온도대</strong>입니다.
            식품이 이 구간에 <strong style={{ color: 'var(--text)' }}>2시간 이상 노출</strong>되면 살모넬라·대장균·리스테리아 등 식중독균이 급증해 폐기하는 것이 안전합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {[
              { range: '−24°C 이하', label: '급속 냉동', color: '#5AA9E8', desc: '조직 손상 최소' },
              { range: '−18°C 이하', label: '냉동 안전', color: '#7DC4FF', desc: '장기 보관 가능' },
              { range: '0~4°C',     label: '냉장 안전', color: '#3EC8FF', desc: '세균 증식 억제' },
              { range: '4~60°C',    label: '⚠ 위험 온도대', color: '#FF6B6B', desc: '세균 급증' },
              { range: '60~74°C',   label: '조리 구간', color: '#FF8C3E', desc: '가열 살균' },
              { range: '74°C 이상', label: '조리 완료', color: '#FFD700', desc: '중심부 가열 완료' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}30`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 800, color: item.color, marginBottom: '4px' }}>{item.range}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 시나리오 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🍽️ 올바른 해동 시나리오
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: '시나리오 1 — 오늘 저녁 삼겹살 파티 (3인분, 600g)',
                color: '#3EC8FF',
                body: '아침 8시에 냉장고로 옮기면 저녁 7시쯤 완전 해동. 급하면 밀봉 후 찬물 흐르는 물 해동으로 1~2시간 소요. 해동 후 키친타올로 물기 제거해 구우세요.',
              },
              {
                title: '시나리오 2 — 급하게 닭볶음탕 (닭 1마리, 1kg)',
                color: '#C8FF3E',
                body: '지퍼백에 밀봉 후 찬물 흐르는 물에 담가 2~3시간 해동. 급하면 전자레인지 해동 모드 후 즉시 조리. 도마·칼은 사용 후 뜨거운 물과 세제로 즉시 세척.',
              },
              {
                title: '시나리오 3 — 명절 제수용 생선 (갈치 2마리, 두께 3cm)',
                color: '#FF8C3E',
                body: '전날 밤 냉장실로 이동하면 아침까지 8~12시간에 걸쳐 완전 해동. 해동 후 키친타올로 물기 제거하고 바로 조리. 다시 냉동하지 마세요.',
              },
            ].map((sc, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${sc.color}35`, borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: sc.color, marginBottom: '6px' }}>{sc.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{sc.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 재냉동 안내 ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,140,62,0.3)', borderRadius: '14px', padding: '20px 22px' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#FF8C3E', marginBottom: '10px' }}>
            🔄 해동 후 재냉동 안내
          </p>
          <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong style={{ color: 'var(--text)' }}>원칙</strong>: 해동한 생 식품은 <strong style={{ color: '#FF6B6B' }}>재냉동 금지</strong></li>
            <li><strong style={{ color: 'var(--text)' }}>예외</strong>: 완전히 조리한 후에는 재냉동 가능 (단, 24시간 이내)</li>
            <li><strong style={{ color: 'var(--text)' }}>이유</strong>: 해동 과정에서 증식한 세균이 재냉동 시 그대로 보존됨</li>
            <li><strong style={{ color: 'var(--text)' }}>권장</strong>: &ldquo;해동 = 조리 예정&rdquo;으로 생각하고 <strong style={{ color: 'var(--accent)' }}>소분 냉동</strong> 습관화</li>
          </ul>
        </div>

        {/* ── 6. 전자레인지 W별 해동 시간 보정 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ⚡ 전자레인지 W별 해동 시간 보정
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            본 도구의 「해동 시간」 탭에서 전자레인지 출력 (700·900·1100·1500W) 선택 시 자동 보정.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>출력</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#3EC8FF', fontWeight: 700 }}>1kg 고기 해동</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>700W (소형·구식)</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>약 27분</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>표준 1.5배</td></tr>
                <tr style={{ background: 'rgba(62,200,255,0.06)' }}>
                  <td style={{ padding: '10px 12px', color: '#3EC8FF', fontWeight: 700 }}>900W (한국 표준) ⭐</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EC8FF', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>약 18분</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>일반 가정용 평균</td>
                </tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>1,100W (대형)</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>약 15분</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>표준 0.85배</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>1,500W (인버터)</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>약 13분</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>표준 0.75배</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ⚠️ 전자레인지 해동 주의: 일부 익을 가능성·해동 후 즉시 조리·재냉동 X·5cm+ 두꺼운 식품 비추천·중간에 뒤집기 (균등 해동).
          </p>
        </div>

        {/* ── 7. 식품별 해동 후 조리 팁 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🍳 식품별 해동 후 조리 팁
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 14 }}>
            6종 식품별 정확한 조리·교차오염 방지 팁. 본 도구의 「📖 식품별 가이드」 탭에서 자세히.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {[
              { emoji: '🥩', name: '소·돼지고기', tip: '키친타올 수분 제거 · 굽기 전 10~20분 실온 적응 · 24시간 내 조리' },
              { emoji: '🍗', name: '닭·가금류 ⚠️', tip: '살모넬라 위험 · 도마/칼 별도 즉시 세척 · 75°C+ 가열 · 12시간 내 조리' },
              { emoji: '🐟', name: '생선·해산물 ⚠️', tip: '냉장 해동 권장 · 전자레인지 X (식감 손상) · 비린내 줄이기 우유·청주 5분' },
              { emoji: '🥦', name: '채소·과일', tip: '대부분 냉동 상태로 바로 조리 · 실온 해동 X · 끓는 물·기름 직접' },
              { emoji: '🍞', name: '빵·반죽', tip: '식빵: 실온 30분~1시간 또는 토스터 직접 · 크루아상: 200°C 오븐 5분' },
              { emoji: '🍱', name: '조리된 음식', tip: '재가열 시 중심부 74°C+ · 2시간 이상 실온 방치 시 폐기 · 재냉동 X' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{f.emoji} {f.name}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>{f.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 위험도 평가 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 식품 안전 위험도 — 5요인 평가
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            본 도구의 「해동 시간」 탭에서 자동 평가. 4단계 위험도(🟢 안전 / 🟡 주의 / 🟠 위험 / 🔴 매우 위험)로 표시.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>요인</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>평가 기준</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>해동 방법</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🟢 냉장 / 🟡 찬물·전자레인지 / 🔴 실온</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>식품 종류</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🟢 일반 / 🟡 닭·생선·해산물·조리음식 (고위험)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>두께</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🟢 ~5cm / 🟡 5~7cm / 🟠 7cm+ (덩어리)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>위험 온도대 노출</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🔴 실온 + 2시간 초과 / 🟡 찬물 + 2시간 초과 / 🟢 안전</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>치명적 조합</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>🔴 닭/생선 + 실온 / 🔴 5cm+ + 실온 / 🔴 조리음식 + 4시간+</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 9. 한국 인기 냉동 식품 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🇰🇷 한국 인기 냉동 식품 해동 가이드
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>식품</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>무게·두께</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#3EC8FF', fontWeight: 700 }}>권장 방법</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🥓 삼겹살 600g</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>600g · 2cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 6~8시간</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🍗 닭볶음탕 1마리</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>1kg · 4cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 12~16시간</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🍖 갈비 2kg</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>2kg · 5cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 18~24시간</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🐟 갈치 2마리</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>500g · 3cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 6~8시간</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🦐 새우 500g</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>500g · 1cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>찬물 30분 (밀봉)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🥟 만두 1봉지</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>600g · 2cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>해동 X (찜·튀김 직접)</td></tr>
                <tr><td style={{ padding: '10px 12px', color: 'var(--text)' }}>🎁 명절 갈비 5kg</td><td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>5kg · 5cm</td><td style={{ padding: '10px 12px', color: 'var(--muted)' }}>냉장 24~36시간 (2~3일 전 미리)</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 본 도구의 「해동 시간」 탭 상단에 빠른 입력 프리셋 제공.
          </p>
        </div>

        {/* ── 10. FAQ (accordion) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '냉장 해동이 왜 가장 안전한가요?', a: '냉장 온도(0~4°C)는 세균이 증식하기 어려운 환경입니다. 식품이 위험 온도대(4~60°C)에 노출되지 않아 식중독 위험이 최소화됩니다. 해동 후 1~2일 내 조리하면 가장 안전하며, 해동 중에도 위생적 품질이 유지됩니다.' },
              { q: '실온 해동은 왜 위험한가요?', a: '실온(20~25°C)은 세균이 가장 빠르게 증식하는 온도입니다. 식품 표면이 먼저 해동되면서 위험 온도대에 수 시간 노출됩니다. 식약처는 실온 해동 2시간 이내를 권장하며, 이를 초과하면 살모넬라·대장균 등 식중독균이 급증할 수 있습니다.' },
              { q: '전자레인지 해동 후 왜 즉시 조리해야 하나요?', a: '전자레인지 해동은 식품 일부가 부분적으로 조리될 수 있습니다. 이미 가열된 부분은 위험 온도대에 진입하여 세균이 빠르게 증식할 수 있으므로 해동 직후 바로 조리해야 합니다. 다시 냉장 보관하거나 재냉동하면 안 됩니다.' },
              { q: '해동한 고기를 다시 냉동해도 되나요?', a: '원칙적으로 생으로 해동한 식품의 재냉동은 권장하지 않습니다. 해동 과정에서 증식한 세균이 재냉동 시 그대로 보존되며, 해동-재냉동 반복은 품질(맛·식감) 저하와 세균 오염 위험을 동반합니다. 단, 완전히 조리한 후에는 재냉동이 가능합니다(24시간 이내). 실용 팁: 1회분씩 소분 후 냉동 (해동 = 조리 예정).' },
              { q: '냉동 식품에 서리(성에)가 끼면 버려야 하나요?', a: '식품 표면의 서리는 수분이 승화된 것으로 안전에는 문제없습니다. 단, 식품 변색, 이취, 냉동 화상(freezer burn — 건조한 회색빛 부위)이 있다면 품질이 저하된 것입니다. 먹을 수는 있지만 맛·식감이 떨어집니다. 포장이 손상됐거나 해동 후 이상한 냄새가 나면 폐기하세요.' },
              { q: '닭고기·생선 같은 위험 식품은 어떻게 해동해야 가장 안전한가요?', a: '냉장 해동(4°C) 강력 권장. 닭·생선·해산물·다진 고기는 살모넬라·캠필로박터 등 위험 ↑. 냉장 해동: 24시간 전 냉동고 → 냉장 이동. 닭 1kg ≈ 12~16시간, 갈치 2마리 ≈ 6~8시간. 주의: 닭·생선용 도마·칼 별도 사용, 도마 즉시 세척, 손 30초 이상 세척, 75°C 이상 가열.' },
              { q: '전자레인지 출력에 따라 해동 시간이 얼마나 다른가요?', a: '1,000g 고기 기준: 700W(구식) ≈ 27분, 900W(한국 표준) ≈ 18분, 1,100W(대형) ≈ 15분, 1,500W(인버터) ≈ 13분. 본인 전자레인지 출력 확인: 본체 라벨 또는 매뉴얼의 「정격 출력 / Output Power」. 한국 가정용은 보통 700~900W. ⚠️ 전자레인지 해동 주의: 일부 익을 가능성, 해동 후 즉시 조리, 5cm+ 두꺼운 식품 비추천, 중간에 뒤집기.' },
              { q: '명절에 큰 고기 (갈비 5kg) 해동은 얼마나 걸리나요?', a: '5kg 갈비 (두께 5cm) 기준: 냉장 해동 24~36시간, 찬물 해동(밀봉) 4~6시간(1시간마다 물 갈기), 실온 해동 비추천(위험), 전자레인지 비추천(균등 해동 X). 추천: 명절 2~3일 전 냉장으로 이동, 또는 명절 당일 새벽에 찬물 해동 시작, 큰 덩어리는 작게 잘라서(가능 시) 해동 빠름.' },
              { q: '해동된 식품이 안전한지 어떻게 확인하나요?', a: '다음 신호 시 폐기 권장: 이상한 냄새(시큼함·암모니아), 변색(회색·녹색·검은빛), 끈적한 표면, 부풀은 포장, 위험 온도대(4~60°C) 2시간 초과 노출. 안전 확인: 정상 색상·냄새, 키친타올 표면 수분 정상, 손가락 누르면 부드럽게 들어감. ⚠️ 의심스러우면 폐기. 식중독은 회복 비용이 음식값보다 훨씬 큼.' },
              { q: '본 도구는 식품 안전 진단을 해주나요?', a: '아닙니다. 본 도구는 일반 정보 제공용 참고 도구이며, 식품 안전 진단·판정 도구가 아닙니다. 실제 해동 시간은 냉동고 온도·식품 포장·냉장고 성능에 따라 다르며, 면역력 약한 분(임산부·고령자·환자·영유아)은 더 엄격한 기준 적용 권장. 식약처 식품안전정보 1399 / foodsafetykorea.go.kr 참고.' },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* ── 11. 면책 강화 + 참고 출처 ── */}
        <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '18px 20px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#FF6B6B', marginBottom: 10 }}>⚖️ 면책 강화</p>
          <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85, marginBottom: 8 }}>
            본 해동 시간 계산기는 <strong style={{ color: 'var(--text)' }}>일반 정보 제공 도구</strong>입니다. 식품 안전 진단·판정 도구가 아닙니다.
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 10 }}>
            <li>실제 해동 시간은 냉동고 온도·식품 포장·냉장고 성능에 따라 다름</li>
            <li>위험 온도대 (4~60°C) 2시간 초과 시 폐기 권장</li>
            <li>의심스러운 냄새·색·식감 시 즉시 폐기</li>
            <li>면역력 약한 분 (임산부·고령자·환자·영유아) 더 엄격한 기준 적용</li>
            <li>본 도구 결과 따라 식중독 발생 시 책임 X</li>
          </ul>
          <p style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>식품 안전 도움:</p>
          <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
            <li>식약처 식품안전정보: <strong style={{ color: '#FF6B6B' }}>1399</strong></li>
            <li>식품안전나라: <strong style={{ color: '#FF6B6B' }}>foodsafetykorea.go.kr</strong></li>
            <li>식중독 의심 시 응급: <strong style={{ color: '#FF6B6B' }}>119</strong></li>
            <li>USDA FSIS (영문): fsis.usda.gov</li>
          </ul>
        </div>

        {/* ── 8. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '인분 수에 맞게 재료 자동 계산' },
              { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기', desc: '쌀·고기·파스타 분량' },
              { href: '/tools/cooking/ramen', icon: '🍜', name: '라면 물양 계산기', desc: '한국 15종 라면 권장 물양' },
              { href: '/tools/cooking/nuts', icon: '🌰', name: '견과류 섭취량 계산기', desc: '견과류별 하루 권장량' },
              { href: '/tools/date/dday', icon: '📅', name: 'D-day 계산기', desc: '해동 알림·유통기한 관리' },
              { href: '/tools/cooking/unit', icon: '🥄', name: '요리 단위 변환기', desc: '컵·큰술·oz 즉시 변환' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
