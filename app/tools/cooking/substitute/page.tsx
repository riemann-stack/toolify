import Link from 'next/link'
import SubstituteClient from './SubstituteClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/cooking/substitute',
  title: '식재료 대체 계산기 — 버터·설탕·계란·생크림·한국 식재료 50종+ | Youtil',
  description: '베이킹·요리 식재료 대체 비율 자동 계산. 버터·설탕·계란·생크림·한국 식재료(참기름·고추장·된장·간장·고춧가루·청양고추 등 14종+) 50종+, 비건·글루텐프리 옵션, 맛·질감 차이까지.',
  keywords: [
    '식재료대체', '버터대신오일', '설탕대신꿀', '생크림대체',
    '베이킹소다베이킹파우더', '계란대체', '비건베이킹', '레몬즙대체',
    '참기름 대체', '고추장 대체', '된장 대체', '간장 대체',
    '고춧가루 대체', '청양고추 대체', '막걸리 대체', '글루텐프리',
  ],
})

export default function SubstitutePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔄 식재료 대체 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        버터·설탕·계란·생크림·<strong style={{ color: 'var(--text)' }}>한국 식재료(참기름·고추장·된장·간장·고춧가루 등 14종+) 50종+ 대체 비율</strong>을 즉시 계산.
        맛·질감 차이, 주의사항, 비건·글루텐프리 옵션까지.
      </p>

      <SubstituteClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 대체 가이드 빠른 참조표
          </h2>

          {/* 버터 대체 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🧈 버터 대체</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '식물성 오일', r: '0.75배', u: '일반 요리', w: '쿠키 부적합' },
                  { n: '코코넛 오일', r: '1.0배',  u: '베이킹',     w: '코코넛 향' },
                  { n: '그릭요거트',  r: '0.5배',  u: '머핀·케이크', w: '약간 신맛' },
                  { n: '아보카도',    r: '1.0배',  u: '브라우니',   w: '단맛 베이킹만' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 설탕 대체 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🍯 설탕 대체</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '꿀',         r: '0.75배',    u: '머핀·드레싱',   w: '160°C 이하' },
                  { n: '메이플시럽', r: '0.75배',    u: '팬케이크',       w: '액체 줄이기' },
                  { n: '알룰로스',   r: '1.3배',     u: '저당 디저트',    w: '단맛 약함' },
                  { n: '스테비아',   r: '매우 적게', u: '음료',           w: '부피 손실' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 생크림 대체 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🥛 생크림 대체</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대체재', '비율', '용도', '주의'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '우유 + 버터',  r: '1.0배', u: '소스·수프',  w: '휘핑 X' },
                  { n: '코코넛 크림',  r: '1.0배', u: '카레·비건',  w: '코코넛 향' },
                  { n: '에바포레이티드 밀크', r: '1.0배', u: '파스타 소스', w: '단맛 약간' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 베이킹소다 vs 베이킹파우더 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            베이킹소다 vs 베이킹파우더 차이
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #FF8C3E', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: '#FF8C3E', fontWeight: 700, marginBottom: '8px' }}>🥄 베이킹소다 (NaHCO₃)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>단독으로는 작용 X</li>
                <li>산성 재료(식초·레몬즙·요거트·코코아)와 만나야 부풂</li>
                <li>베이킹파우더보다 약 <strong style={{ color: 'var(--text)' }}>3배 강함</strong></li>
                <li>너무 많이 쓰면 쓴맛</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>🧁 베이킹파우더</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
                <li>베이킹소다 + 산성분(주석산) + 전분</li>
                <li><strong style={{ color: 'var(--text)' }}>단독 사용 가능</strong></li>
                <li>일반 케이크·머핀에 사용</li>
                <li>이중 작용 — 반죽 시·구울 때 두 번 부풂</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'rgba(200,255,62,0.06)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>🔁 대체 공식</p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>베이킹파우더 1작은술 = <strong style={{ color: 'var(--text)' }}>베이킹소다 1/4작은술 + 산성재료 1/2작은술</strong></li>
              <li>베이킹소다 1작은술 = <strong style={{ color: 'var(--text)' }}>베이킹파우더 3작은술</strong> (산성 재료가 많은 레시피만)</li>
            </ul>
          </div>
        </div>

        {/* ── 3. 비건 대체 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            비건 대체 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #B885DA', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: '#B885DA', fontWeight: 700, marginBottom: '8px' }}>🥚 계란 1개 대체</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>플랙스에그</strong>: 아마씨 1큰술 + 물 3큰술 (5분 불림)</li>
                <li><strong style={{ color: 'var(--text)' }}>치아씨드</strong>: 1큰술 + 물 3큰술 (10분 불림)</li>
                <li><strong style={{ color: 'var(--text)' }}>으깬 바나나 1/2개</strong>: 단맛·바나나향 추가</li>
                <li><strong style={{ color: 'var(--text)' }}>두부 60g</strong>: 무미, 키슈·스크램블 적합</li>
                <li><strong style={{ color: 'var(--text)' }}>아쿠아파바 3큰술</strong>: 흰자 대체, 머랭 가능</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid #3EC8FF', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '14px', color: '#3EC8FF', fontWeight: 700, marginBottom: '8px' }}>🥛 유제품 대체</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
                <li><strong style={{ color: 'var(--text)' }}>우유 → 두유·아몬드밀크·귀리밀크</strong> (1:1 비율)</li>
                <li><strong style={{ color: 'var(--text)' }}>버터 → 코코넛 오일</strong> (1:1, 고체 상태)</li>
                <li><strong style={{ color: 'var(--text)' }}>생크림 → 코코넛 크림</strong> (1:1, 차갑게 하면 휘핑 가능)</li>
                <li><strong style={{ color: 'var(--text)' }}>요거트 → 두유 + 레몬즙</strong> (1컵당 1큰술)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 4. 글루텐프리 대체 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            글루텐프리 대체 (밀가루 1컵 대체)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '쌀가루 + 잔탄검',     r: '쌀가루 1컵 + 잔탄검 1/4작은술', c: '#3EFF9B', d: '글루텐 효과를 잔탄검으로 보완. 가장 무난한 선택.' },
              { n: '아몬드 가루',         r: '동량 (액체 약간 줄이기)',         c: '#FFB83E', d: '쿠키·케이크에 적합. 너트향, 진한 색.' },
              { n: '오트밀 가루 + 잔탄검', r: '동량 + 잔탄검 1/4작은술',         c: '#C8FF3E', d: '머핀·쿠키. 진한 식감.' },
              { n: '시판 글루텐프리 믹스', r: '동량',                            c: '#3EC8FF', d: '가장 안전. 이미 잔탄검·여러 가루 블렌딩됨.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.c}33`, borderLeft: `3px solid ${g.c}`, borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '13px', color: g.c, fontWeight: 700 }}>{g.n}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{g.r}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 한국 식재료 대체 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🇰🇷 한국 식재료 대체 가이드 (14종+)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            본 도구의 「카테고리 둘러보기」 → <strong style={{ color: 'var(--text)' }}>🇰🇷 한국 식재료</strong>에서 자세히. 해외 거주·재료 부족 시 응급 대체용.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>원재료</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>대체</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>비율</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🌰 참기름',     '들기름 (오메가3 ↑)',           '1.0×'],
                  ['🌶️ 고추장',     '미소 + 고춧가루 + 설탕',       '1.0×'],
                  ['🍲 된장',       '일본 미소된장 (적·백)',         '1.0×'],
                  ['🥢 간장 (양조)', '진간장 / 코코넛 아미노',        '0.7~1.0×'],
                  ['🐟 멸치액젓',   '까나리액젓 / 베트남 느억맘',     '1.0×'],
                  ['🧂 다시다',     '멸치 다시팩 (10~15분 우림)',    '1.0×'],
                  ['🍶 막걸리 (요리용)', '청주 + 물 + 설탕',           '1.0×'],
                  ['🍷 청주 (요리용)', '미림 / 맛술',                  '0.7~1.0×'],
                  ['🌶️ 고춧가루',   '카이엔 + 파프리카 (1:1)',       '1.0×'],
                  ['🌶️ 청양고추',   '할라피뇨 / 세라노',              '1.0×'],
                  ['🌿 부추',       '쪽파 / 실파',                    '1.0×'],
                  ['🍡 떡볶이 떡',  '가래떡 (썰어서)',                '1.0×'],
                  ['🥬 김치',       '사우어크라우트 + 고춧가루 + 마늘', '1.0×'],
                  ['🍯 물엿',       '꿀 / 옥수수시럽 / 쌀엿',         '0.7~1.0×'],
                  ['🧄 다진 마늘',  '마늘가루 (1tsp = 1/8tsp)',       '0.125×'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 양 변환 정확 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ⚖️ 양 변환 정확 가이드 — 같은 1컵이라도 다름
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            식재료마다 밀도가 달라 1컵 무게가 다릅니다. 베이킹은 ±10g 차이로도 결과가 달라지므로 <strong style={{ color: 'var(--text)' }}>저울 사용 강력 권장</strong>.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>식재료</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>1컵 (240ml)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1큰술</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🌾 박력분 (밀가루)', '약 120g',  '약 8g'],
                  ['🌾 강력분 (식빵)',   '약 130g',  '약 8g'],
                  ['🌾 쌀가루',          '약 158g',  '약 10g'],
                  ['🍯 설탕 (백)',       '약 200g',  '약 12.5g'],
                  ['🍬 황설탕',          '약 220g',  '약 14g'],
                  ['🧈 버터',            '약 227g',  '약 14g'],
                  ['🍯 꿀',              '약 340g',  '약 21g'],
                  ['🫒 올리브유',        '약 220g',  '약 14g'],
                  ['🥛 우유',            '약 247g',  '약 15g'],
                  ['🌶️ 고추장',          '약 320g',  '약 20g'],
                  ['🍲 된장',            '약 280g',  '약 17g'],
                  ['🌶️ 고춧가루',        '약 90g',   '약 5.5g'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 7. 알레르기·식이 제한 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🚨 알레르기·식이 제한 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#FF6B6B', fontWeight: 700, marginBottom: 8 }}>⚠️ 알레르기 환자 주의</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>견과류 알레르기 → 아몬드·헤이즐넛·코코넛 대체재 X</li>
                <li>글루텐 알레르기 (셀리악) → 시판 글루텐프리 믹스도 교차오염 가능</li>
                <li>유제품 알레르기 → 락토스 X 표시 확인</li>
                <li>계란 알레르기 → 시판 베이킹 믹스 라벨 확인</li>
                <li>콩 알레르기 → 두유·미소·간장 X</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(62,200,255,0.04)', border: '1px solid rgba(62,200,255,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#3EC8FF', fontWeight: 700, marginBottom: 8 }}>✅ 식이 제한 대체 가이드</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>견과류 X: 해바라기씨·호박씨로 대체</li>
                <li>글루텐프리: 쌀가루·아몬드 가루·시판 GF 믹스</li>
                <li>락토스 X: 두유·아몬드밀크·귀리밀크</li>
                <li>계란 X: 플랙스에그 (1큰술 + 물 3큰술 5분) / 치아씨드</li>
                <li>비건: 동물성 모두 X (꿀·계란·유제품·생선소스 포함)</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ⚠️ 본 도구는 일반 가이드입니다. 알레르기 환자는 라벨 확인 + 의사 상담 필수.
            식약처 식품안전정보 1399 / 알레르기 응급 시 119.
          </p>
        </div>

        {/* ── 8. FAQ (accordion - salary style) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '버터 대신 오일을 쓸 때 양은 어떻게 조절하나요?', a: '일반적으로 버터 100g을 오일 75ml(약 75%)로 대체합니다. 버터에는 수분(약 15%)이 포함되어 있어 같은 양을 쓰면 너무 기름지기 때문입니다. 쿠키나 페이스트리는 버터의 고체 성질이 중요해 오일 대체가 부적합하지만, 머핀·브라우니·팬케이크는 오일로 대체해도 잘 됩니다.' },
              { q: '베이킹소다 대신 베이킹파우더를 써도 되나요?', a: '가능하지만 양을 3배로 늘려야 합니다. 베이킹소다 1작은술 = 베이킹파우더 3작은술입니다. 다만 레시피에 산성 재료(식초·레몬즙·요거트·코코아)가 많이 들어간다면 베이킹파우더로는 충분한 반응이 일어나지 않아 부적합합니다.' },
              { q: '설탕 대신 꿀을 쓸 때 주의할 점은?', a: '꿀은 설탕보다 단맛이 강하고 수분이 있어 양을 75%로 줄이고 다른 액체 재료를 1/4컵 정도 줄여야 합니다. 또한 꿀은 빨리 타기 때문에 베이킹 온도를 약 15°C 낮추는 것이 좋습니다(180°C → 160°C). 쿠키 색깔이 더 진해지고 풍미가 깊어집니다.' },
              { q: '비건 베이킹에서 계란을 어떻게 대체하나요?', a: '가장 인기 있는 대체는 플랙스에그입니다. 아마씨 가루 1큰술과 물 3큰술을 섞어 5분 두면 끈끈해지는데 이것이 계란 1개 역할을 합니다. 무미·무취에 가까워 대부분 베이킹에 적합합니다. 달콤한 베이킹에는 으깬 바나나(계란 1개당 1/2개)나 사과소스도 좋습니다.' },
              { q: '생크림이 없을 때 어떻게 만들 수 있나요?', a: '생크림 1컵 = 우유 3/4컵 + 버터 1/4컵(녹여서 식힌 것)으로 대체 가능합니다. 단, 이 조합은 휘핑(거품 내기)이 안 되므로 휘핑크림 용도로는 사용할 수 없습니다. 소스, 수프, 카레 등 가열 요리에는 거의 동일하게 쓸 수 있습니다. 휘핑이 필요하다면 코코넛 크림(차갑게 식힌 것)을 사용하는 것이 좋습니다.' },
              { q: '한국 요리에서 참기름 대신 무엇을 쓸 수 있나요?', a: '가장 권장: 들기름 (1:1). 비슷한 풍미 + 들깨 향 + 오메가3 ↑. 다른 옵션: 올리브유(엑스트라버진) 1:1(한식 끝맛 X), 아보카도 오일(거의 무향, 튀김·고온 OK), 땅콩기름(비슷한 고소함, 알레르기 주의). 비빔·나물·미역국에는 들기름이 가장 좋고, 고추장 비빔밥·삼겹살에는 들기름·참기름 차이 미미.' },
              { q: '고추장이 떨어졌는데 대체 방법은?', a: '가장 권장: 미소된장 + 고춧가루 + 설탕 (미소 1큰술 + 고춧가루 1큰술 + 설탕 0.5작은술 → 비빔·찌개·볶음에 1:1 대체). 다른 옵션: 스리라차 + 미소(동남아 풍), 칠리 페이스트 + 설탕. ⚠️ 한국 요리 깊은 발효감은 X — 본격 한식보다는 가정식 응급 대체용. 본 도구의 「🇰🇷 한국 식재료」 카테고리 참고.' },
              { q: '청양고추가 없는데 매운맛 어떻게 내요?', a: '매운맛 강도 비교 (SHU): 청양고추 4,000~12,000 / 할라피뇨 2,500~8,000 (가장 비슷) / 세라노 10,000~23,000 (약간 매움) / 태국 버드아이 50,000~100,000 (훨씬 매움) / 카이엔 가루 30,000~50,000. 대체: 할라피뇨 1:1(가장 추천), 세라노 1:1(약간 매움), 태국 칠리 1/2(훨씬 매우니 적게), 풋고추 + 카이엔(단계 조절).' },
              { q: '1컵 = 200g이라고 외워도 되나요?', a: '식재료마다 다릅니다. 같은 1컵이라도: 밀가루 약 120g / 설탕 약 200g / 황설탕 약 220g / 버터 약 227g / 꿀 약 340g / 올리브유 약 220g / 우유 약 247g / 고추장 약 320g. 본 도구의 「양 변환 가이드」 표 참고. 특히 베이킹은 ±10g 차이로도 결과 달라짐 → 저울 사용 강력 권장.' },
              { q: '알레르기가 있는 사람도 본 도구 결과 그대로 사용해도 되나요?', a: '사용 전 라벨 확인 필수입니다. 본 도구는 일반 가이드이며, 견과류 알레르기는 아몬드·헤이즐넛·코코넛 대체재 주의, 글루텐 알레르기(셀리악)는 시판 글루텐프리 믹스도 교차오염 가능, 유제품·계란·콩 알레르기는 라벨 확인. 의심 증상 시: 식약처 식품안전정보 1399, 본인 주치의 또는 알레르기 전문의 상담, 응급 시 119. ⚠️ 본 도구 결과로 발생한 알레르기 반응에 대한 책임은 사용자 본인에게 있습니다.' },
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

        {/* ── 9. 면책 (NEW) ── */}
        <div style={{ background: 'rgba(255,140,62,0.04)', border: '1px solid rgba(255,140,62,0.30)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 13, color: '#FF8C3E', fontWeight: 700, marginBottom: 10 }}>⚖️ 면책 조항</p>
          <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85, marginBottom: 8 }}>
            본 식재료 대체 계산기는 <strong style={{ color: 'var(--text)' }}>일반 요리 가이드</strong>입니다. 영양 자문 도구가 아닙니다.
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 10 }}>
            <li>정확한 영양 성분은 식약처 식품안전나라 권장</li>
            <li>알레르기 환자는 라벨 확인 + 의사 상담 필수</li>
            <li>식이 제한 (당뇨·신장 등)은 영양사 상담</li>
            <li>발효 식재료는 브랜드별 차이 큼</li>
          </ul>
          <p style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>도움 받기:</p>
          <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
            <li>식약처 식품안전정보: <strong style={{ color: '#FF8C3E' }}>1399</strong></li>
            <li>식품안전나라: foodsafetykorea.go.kr</li>
            <li>알레르기 응급: <strong style={{ color: '#FF8C3E' }}>119</strong></li>
          </ul>
        </div>

        {/* ── 6. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',     desc: '인분 변경 시 재료 비율 조정' },
              { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기',       desc: '쌀·고기·파스타 분량' },
              { href: '/tools/cooking/unit',    icon: '🥄', name: '요리 단위 변환기',       desc: 'g·ml·컵·큰술 즉시 변환' },
              { href: '/tools/cooking/thawing', icon: '🧊', name: '해동 시간 계산기',   desc: '식품 안전 가이드' },
              { href: '/tools/cooking/ramen',   icon: '🍜', name: '라면 물양 계산기',        desc: '한국 15종 라면 물양' },
              { href: '/tools/cooking/baker-percent', icon: '🥖', name: '베이커 퍼센트',     desc: '제빵 배합비' },
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
