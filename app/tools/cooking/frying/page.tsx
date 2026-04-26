import Link from 'next/link'
import FryingClient from './FryingClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/frying',
  title: '튀김 시간·온도 계산기 — 재료별 기름 온도·에어프라이어 변환',
  description: '감자튀김·돈까스·치킨·새우튀김 등 재료 상태·두께·튀김옷 조건별 최적 기름 온도와 튀김 시간을 계산합니다. 2차 튀김 여부, 에어프라이어 변환 가이드 제공.',
  keywords: ['튀김시간계산기', '감자튀김온도', '돈까스튀기는시간', '치킨튀김온도', '튀김기름온도', '에어프라이어변환', '새우튀김시간', '냉동만두튀기기'],
})

export default function FryingPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍳 튀김 시간·온도 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        재료·상태·두께·튀김옷·양에 맞춰 최적 기름 온도와 튀김 시간을 계산합니다. 2차 튀김 여부, 속 익힘 주의사항, 에어프라이어 변환, 카운트다운 타이머까지.
      </p>

      <FryingClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 기름 온도별 용도 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            기름 온도별 용도 완전 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {[
              { range: '150~160°C', label: '저온',     color: '#3EC8FF', desc: '채소·고구마·두꺼운 재료 속 익히기' },
              { range: '160~170°C', label: '중저온',   color: '#5CC8FF', desc: '두꺼운 고기류 1차 튀김, 냉동 재료' },
              { range: '170~180°C', label: '중온(표준)', color: '#C8FF3E', desc: '대부분 재료의 적정 온도' },
              { range: '180~190°C', label: '고온',     color: '#FFB83E', desc: '얇은 재료, 2차 튀김 바삭함 완성' },
              { range: '190°C 이상', label: '초고온',  color: '#FF6B6B', desc: '오징어·새우 등 빠른 완성, 타기 쉬우니 주의' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${r.color}44`, borderLeft: `4px solid ${r.color}`, borderRadius: '10px', padding: '12px 16px', display: 'grid', gridTemplateColumns: '110px 80px 1fr', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: r.color }}>{r.range}</span>
                <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>{r.label}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>🥢 나무젓가락으로 온도 확인하는 법</p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
              <li>기포 없음 → 150°C 이하</li>
              <li>천천히 기포 → 160°C 전후</li>
              <li>활발한 기포 → 170~180°C ✅</li>
              <li>격렬한 기포 → 190°C 이상</li>
            </ul>
          </div>
        </div>

        {/* ── 2. 재료별 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            재료별 튀김 시간 빠른 참조표
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
            * 기준: 생재료, 보통 크기, 보통 튀김옷, 180°C
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '권장 온도', '1차', '2차', '포인트'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '🍟 감자튀김', t: '160→180°C', a: '3~4분',   b: '1~1.5분', p: '2차 필수' },
                  { n: '🍤 새우튀김', t: '170~180°C', a: '1.5~2.5분', b: '없음',   p: '빨리 꺼내기' },
                  { n: '🥩 돈까스',   t: '160~175°C', a: '4~6분',   b: '선택',   p: '내부 확인 필수' },
                  { n: '🍗 치킨',     t: '160~175°C', a: '12~15분', b: '2~3분',  p: '75°C 확인' },
                  { n: '🦑 오징어',   t: '175~185°C', a: '1~2분',   b: '없음',   p: '오래 튀기면 질김' },
                  { n: '🥟 만두',     t: '165~180°C', a: '4~6분',   b: '없음',   p: '과밀 금지' },
                  { n: '🍠 고구마',   t: '160~175°C', a: '3~5분',   b: '선택',   p: '당분 주의(탐)' },
                  { n: '🐟 생선',     t: '170~185°C', a: '3~5분',   b: '선택',   p: '뒤집기 한 번만' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.a}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 2차 튀김의 과학 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            2차 튀김의 과학
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            두 번 튀기면 왜 바삭해질까? 핵심은 <strong style={{ color: 'var(--text)' }}>수분 제거 과정</strong>입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {[
              { n: '1차', c: '#3EC8FF', t: '속 익히기', d: '내부 수분을 증발시키면서 속까지 익힘. 중저온(160~170°C)으로 천천히.' },
              { n: '휴지', c: '#FFB83E', t: '온도 균일화', d: '2~3분 쉬어 내부 온도가 전체로 퍼짐. 증기가 빠지며 튀김옷이 마르기 시작.' },
              { n: '2차', c: '#C8FF3E', t: '크리스피 완성', d: '고온(180~190°C) 짧게. 표면 남은 수분 완전 제거 → 바삭함 극대화.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: s.c, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px' }}>{s.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: '#3EFF9B' }}>✅ 추천:</strong> 감자튀김·치킨·돈까스<br />
              <strong style={{ color: 'var(--accent)' }}>🔁 선택:</strong> 고구마·생선<br />
              <strong style={{ color: 'var(--muted)' }}>⬜ 불필요:</strong> 새우·오징어·김말이·가지
            </p>
          </div>
        </div>

        {/* ── 4. 냉동 재료 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            냉동 재료 튀김 완전 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            냉동 재료는 기름 온도를 <strong style={{ color: '#FF6B6B' }}>20~30°C 급락</strong>시킵니다. 한 번에 많이 넣으면 회복이 안 돼 기름 흡수가 폭증하고 눅눅해집니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {[
              { n: '🍗 냉동 치킨',    c: '#FF6B6B', d: '해동 필수. 두꺼운 고기는 냉동 상태에서 속까지 익지 않습니다(생식 위험).' },
              { n: '🥟 냉동 만두',    c: '#FFB83E', d: '반해동 후 튀김 권장. 완전 냉동 상태는 터짐과 온도 급락 원인.' },
              { n: '🍤 냉동 새우',    c: '#3EC8FF', d: '찬물에 5~10분 해동 → 물기 완전 제거 → 튀김옷 → 고온 단시간.' },
              { n: '🍟 냉동 감자',    c: '#3EFF9B', d: '해동 없이 바로 튀김 OK. 오히려 해동하면 물러져서 바삭함이 떨어집니다.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${f.c}44`, borderLeft: `3px solid ${f.c}`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', color: f.c, fontWeight: 700, marginBottom: '4px' }}>{f.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(200,255,62,0.05)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--accent)' }}>💡 온도 급락 방지 팁:</strong> 재료를 <strong>3~5개씩 나눠</strong> 넣고, 사이에 30초 이상 간격을 두세요. 용량 대비 30% 이하가 이상적.
            </p>
          </div>
        </div>

        {/* ── 5. 에어프라이어 변환 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            에어프라이어 완전 변환 가이드
          </h2>
          <div style={{ background: 'rgba(62,200,255,0.05)', border: '1px solid rgba(62,200,255,0.25)', borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: '#3EC8FF', fontWeight: 700, marginBottom: '10px' }}>일반 변환 규칙</p>
            <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
              <li>온도: 기름 튀김 온도 <strong>− 10~20°C</strong></li>
              <li>시간: 기름 튀김 <strong>× 1.3~1.5배</strong></li>
              <li>예열: 반드시 <strong>3~5분</strong></li>
              <li>중간 뒤집기: <strong>필수</strong> (한 번)</li>
            </ul>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '온도', '시간', '뒤집기'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '🍟 감자튀김', t: '200°C', m: '15~20분', f: '✓' },
                  { n: '🥩 돈까스',   t: '180°C', m: '12~15분', f: '✓' },
                  { n: '🍗 치킨',     t: '180°C', m: '20~25분', f: '✓' },
                  { n: '🍤 새우',     t: '190°C', m: '8~10분',  f: '✓' },
                  { n: '🥟 냉동만두', t: '180°C', m: '10~12분', f: '✓' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{r.n}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.m}</td>
                    <td style={{ padding: '9px 12px', color: '#3EFF9B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 겉바속촉 팁 10가지 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            겉바속촉을 위한 팁 10가지
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
            {[
              '재료 표면 물기 완전 제거 (키친타올)',
              '튀김가루와 물 비율 1:1 (묽은 반죽)',
              '반죽에 탄산수 사용 (바삭함 향상)',
              '기름 충분히 예열 후 재료 투입',
              '재료 과밀 금지 (온도 유지 핵심)',
              '중간에 젓가락으로 저어주기 (균일 가열)',
              '건져낸 후 기름 망 위에 세워 놓기',
              '소금은 완성 직후 뿌리기',
              '2차 튀김 전 5분 휴지',
              '먹기 직전 고온 30초 재가열',
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0, minWidth: 24 }}>{i + 1}</span>
                <span style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.6 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 식품 안전 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            식품 안전 주의사항
          </h2>
          <div style={{ background: 'rgba(255,140,62,0.05)', border: '1px solid rgba(255,140,62,0.25)', borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, margin: 0 }}>
              본 가이드는 일반적인 참고용입니다. 조리 환경, 재료 크기, 냉동/냉장 보관 상태에 따라 실제 시간이 다를 수 있습니다. 육류와 냉동 재료는 반드시 내부 익힘 상태를 확인하세요.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { n: '🐔 닭고기', t: '75°C', c: '#FF6B6B' },
              { n: '🐖 돼지고기', t: '63°C', c: '#FFB83E' },
              { n: '🐟 생선', t: '63°C', c: '#3EC8FF' },
              { n: '🥩 갈은 고기', t: '71°C', c: '#FF8C3E' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{s.n} 안전 내부온도</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: s.c, margin: 0 }}>{s.t} 이상</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '기름 온도를 모르는데 어떻게 확인하나요?',
                a: '가장 간단한 방법은 나무젓가락을 기름에 담그는 것입니다. 젓가락 끝에서 기포가 활발하게 올라오면 170~180°C입니다. 기포가 없거나 아주 느리면 아직 온도가 낮은 상태이고, 격렬하게 끓어오르면 190°C 이상의 고온입니다.' },
              { q: '냉동 재료는 해동하고 튀겨야 하나요?',
                a: '재료에 따라 다릅니다. 치킨처럼 두꺼운 육류는 반드시 해동 후 튀겨야 내부까지 익혀집니다. 냉동 만두는 반해동 상태로 튀겨도 되지만, 새우튀김은 찬물 해동 후 물기 제거 후 튀기는 것을 권장합니다. 냉동 감자튀김은 해동 없이 바로 튀겨도 됩니다.' },
              { q: '2차 튀김은 왜 하나요?',
                a: '1차 튀김에서 재료 표면의 수분이 100% 제거되지 않습니다. 2차 튀김은 남은 수분을 완전히 날려 바삭함을 극대화합니다. 특히 감자튀김은 1차(저온 속 익히기) → 2차(고온 바삭하게) 2단계가 전문점 맛의 비결입니다.' },
              { q: '에어프라이어로 하면 맛이 다른가요?',
                a: '에어프라이어는 기름을 거의 사용하지 않아 칼로리가 낮지만, 고온 공기 순환 방식이라 기름에 직접 튀기는 것보다 겉면의 바삭함이 약간 다를 수 있습니다. 기름 분사(에어프라이어 내부에 식용유 약간 뿌리기)를 하면 튀김에 더 가까운 식감을 낼 수 있습니다.' },
              { q: '튀기다 색이 너무 진해졌는데 꺼내야 하나요?',
                a: '육류(치킨, 돈까스)는 겉색이 진해도 속이 안 익을 수 있습니다. 반드시 가장 두꺼운 부분을 찔러 육즙이 투명하게 나오는지 확인하세요. 채소·해산물은 색이 황금갈색이 되면 완성 신호입니다. 진갈색에 가까워지면 쓴맛이 날 수 있으니 주의하세요.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기', desc: '튀김 반죽 비율 자동 계산' },
              { href: '/tools/cooking/unit',    icon: '🥄', name: '요리 단위 변환기',   desc: '기름량·재료량 변환' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',   desc: '튀김 시간 관리' },
              { href: '/tools/life/dutch',      icon: '🍻', name: '더치페이 계산기',   desc: '홈파티 비용 정산' },
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
