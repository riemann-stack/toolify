import type { Metadata } from 'next'
import Link from 'next/link'
import ThawingClient from './ThawingClient'

export const metadata: Metadata = {
  title: '냉동·해동 시간 계산기 — 고기·생선 해동 시간 예측 | Youtil',
  description: '식품 종류·두께·무게를 입력해 냉장/흐르는물/실온/전자레인지 해동 시간을 계산합니다. 식품별 냉동 보관 기간, 식중독 예방 안전 가이드 제공.',
  keywords: ['해동시간계산기', '고기해동시간', '냉동해동계산기', '냉장해동시간', '생선해동시간', '식품해동방법', '냉동보관기간'],
}

export default function ThawingPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧊 냉동·해동 시간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        식품 종류·두께·무게를 입력하면 4가지 해동 방법별 시간과 냉동 보관 기간을 계산합니다.
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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 해동 방법 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{sp}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{saf}</td>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{best}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#FF8C3E', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{max}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 위험 온도대 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
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
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: item.color, marginBottom: '4px' }}>{item.range}</p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 시나리오 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
            <li><strong style={{ color: 'var(--text)' }}>권장</strong>: "해동 = 조리 예정"으로 생각하고 <strong style={{ color: 'var(--accent)' }}>소분 냉동</strong> 습관화</li>
          </ul>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '냉장 해동이 왜 가장 안전한가요?',
                a: '냉장 온도(0~4°C)는 세균이 증식하기 어려운 환경입니다. 식품이 위험 온도대(4~60°C)에 노출되지 않아 식중독 위험이 최소화됩니다. 해동 후 1~2일 내 조리하면 가장 안전하며, 해동 중에도 위생적 품질이 유지됩니다.',
              },
              {
                q: '실온 해동은 왜 위험한가요?',
                a: '실온(20~25°C)은 세균이 가장 빠르게 증식하는 온도입니다. 식품 표면이 먼저 해동되면서 위험 온도대에 수 시간 노출됩니다. 식약처는 실온 해동 2시간 이내를 권장하며, 이를 초과하면 살모넬라·대장균 등 식중독균이 급증할 수 있습니다.',
              },
              {
                q: '전자레인지 해동 후 왜 즉시 조리해야 하나요?',
                a: '전자레인지 해동은 식품 일부가 부분적으로 조리될 수 있습니다. 이미 가열된 부분은 위험 온도대에 진입하여 세균이 빠르게 증식할 수 있으므로 해동 직후 바로 조리해야 합니다. 다시 냉장 보관하거나 재냉동하면 안 됩니다.',
              },
              {
                q: '해동한 고기를 다시 냉동해도 되나요?',
                a: '원칙적으로 생으로 해동한 식품의 재냉동은 권장하지 않습니다. 해동 과정에서 증식한 세균이 재냉동 시 그대로 보존되며, 해동-재냉동 반복은 품질(맛·식감) 저하와 세균 오염 위험을 동반합니다. 단, 완전히 조리한 후에는 재냉동이 가능합니다.',
              },
              {
                q: '냉동 식품에 서리(성에)가 끼면 버려야 하나요?',
                a: '식품 표면의 서리는 수분이 승화된 것으로 안전에는 문제없습니다. 단, 식품 변색, 이취, 냉동 화상(freezer burn — 건조한 회색빛 부위)이 있다면 품질이 저하된 것입니다. 먹을 수는 있지만 맛·식감이 떨어집니다. 포장이 손상됐거나 해동 후 이상한 냄새가 나면 폐기하세요.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 참고 출처 ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>📚 참고 출처</p>
          <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
            <li>식품의약품안전처 식품 안전 정보 (mfds.go.kr)</li>
            <li>미국 USDA 식품 안전 및 검사 서비스 (FSIS — fsis.usda.gov)</li>
            <li>세계보건기구(WHO) 식품 안전 5대 원칙 (Five Keys to Safer Food)</li>
          </ul>
        </div>

        {/* ── 8. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '인분 수에 맞게 재료 자동 계산' },
              { href: '/tools/cooking/unit',   icon: '🥄', name: '요리 단위 변환기',   desc: '컵·큰술·oz 등 즉시 변환' },
              { href: '/tools/date/dday',     icon: '📅', name: 'D-day 계산기',      desc: '유통기한·보관일 관리' },
              { href: '/tools/life/dutch',    icon: '🍻', name: '더치페이 계산기',   desc: '장보기·식비 N빵 정산' },
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
