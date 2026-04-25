import type { Metadata } from 'next'
import Link from 'next/link'
import SizeClient from './SizeClient'

export const metadata: Metadata = {
  title: '해외 직구 사이즈 변환기 — 신발·옷·반지·모자 한국 사이즈 변환 | Youtil',
  description: '미국·유럽·영국·일본 사이즈를 한국 사이즈로 즉시 변환합니다. 신발·상의·하의·속옷·반지·모자·장갑·벨트 8가지 카테고리 지원. 측정법·브랜드별 차이·반품 정책 안내.',
  keywords: ['해외직구사이즈변환기', '신발사이즈변환', '의류사이즈US', '반지사이즈변환', '모자사이즈', '장갑사이즈', '벨트사이즈', '브라사이즈US', '아마존사이즈'],
}

export default function SizePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        👟 해외 직구 사이즈 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        미국·유럽·영국·일본 사이즈를 한국 사이즈로 즉시 변환합니다. <strong style={{ color: 'var(--text)' }}>신발·상의·하의·속옷·반지·모자·장갑·벨트</strong> 8가지 카테고리, 측정값 기반 자동 사이즈 추천.
      </p>

      {/* ── 국가별 사이즈 표기 차이 (상단 박스) ── */}
      <div style={{
        background: 'rgba(62,200,255,0.05)',
        border: '1px solid rgba(62,200,255,0.2)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '40px',
      }}>
        <p style={{ fontSize: '13px', color: '#3EC8FF', fontWeight: 700, marginBottom: '8px' }}>🌍 국가별 사이즈 표기 차이</p>
        <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>미국 (US)</strong>: 신발 숫자 작음(6~12), 옷 알파벳(XS·S·M·L·XL)</li>
          <li><strong style={{ color: 'var(--text)' }}>유럽 (EU)</strong>: 신발 숫자 큼(36~46), 옷 숫자(36·38·40)</li>
          <li><strong style={{ color: 'var(--text)' }}>영국 (UK)</strong>: 미국보다 0.5~1 작음, 옷은 짝수(4·6·8·10)</li>
          <li><strong style={{ color: 'var(--text)' }}>한국·일본</strong>: mm·cm 단위 (가장 직관적)</li>
        </ul>
      </div>

      <SizeClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 카테고리별 측정 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            카테고리별 측정 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { icon: '👟', name: '신발',  tip: '종이 위에 발을 올리고 가장 긴 발가락 끝과 뒤꿈치 사이를 측정. 양쪽 발 중 더 긴 쪽 기준.' },
              { icon: '👕', name: '상의',  tip: '양팔을 자연스럽게 내리고 가슴의 가장 두꺼운 부분을 수평으로 측정.' },
              { icon: '👖', name: '하의',  tip: '배꼽 위 1~2cm, 허리의 가장 가는 부분을 수평으로 측정. 청바지 인치 = 허리 둘레의 인치.' },
              { icon: '👙', name: '브라',  tip: '밴드: 가슴 바로 아래 갈비뼈 둘레 / 컵: 가슴 가장 두꺼운 부분 둘레 - 밑가슴 둘레.' },
              { icon: '💍', name: '반지',  tip: '종이로 손가락을 감아 표시 후 펜으로 표시한 길이를 자로 측정. 관절을 통과해야 함.' },
              { icon: '🧢', name: '모자',  tip: '이마(눈썹 위 약 2cm)와 뒤통수의 가장 두꺼운 부분을 수평으로 측정.' },
              { icon: '🧤', name: '장갑',  tip: '엄지를 제외한 손등의 가장 두꺼운 부분(중지 시작점 부근)을 측정.' },
              { icon: '🪢', name: '벨트',  tip: '잘 맞는 바지의 허리 사이즈 + 5cm. 벨트 총 길이 = 허리 + 12~15cm.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{g.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700 }}>{g.name}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>📏 {g.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 직구 사이트별 사이즈 가이드 위치 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            주요 직구 사이트별 사이즈 가이드 위치
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['사이트', '사이즈 가이드 위치', '치수 단위', '무료 반품'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '아마존',    p: '상품 페이지 "Size Chart"',    u: '인치/US',     r: '✅ (Prime)' },
                  { n: 'ASOS',     p: '상품 페이지 "Size Guide"',    u: 'cm·인치',     r: '✅' },
                  { n: '자라',      p: '"사이즈 가이드" 버튼',         u: 'cm 직접 표시', r: '✅' },
                  { n: 'H&M',      p: '제품 옆 "Size guide"',         u: 'cm 직접 표시', r: '⚠️ 매장만' },
                  { n: '나이키',    p: '제품 페이지 "Size Guide"',     u: 'US·EU·CM',    r: '✅ 30일' },
                  { n: '아디다스',   p: '"Size Guide" 링크',           u: 'US·UK·EU',    r: '✅ 30일' },
                  { n: '쇼피파이몰', p: '상품 설명 또는 별도 페이지',   u: '브랜드별 다름', r: '⚠️ 케이스별' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12 }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 브랜드별 사이즈 특징 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            브랜드별 사이즈 특징 (참고)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>👟 신발 브랜드</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                {[
                  { n: '나이키',    c: '#FFB83E', d: 'US 표준보다 살짝 큰 편 — 0.5 작게 권장' },
                  { n: '아디다스',  c: '#3EC8FF', d: 'US 표준 (정사이즈)' },
                  { n: '컨버스',    c: '#FF8C3E', d: '약 0.5 큰 편 — 0.5 작게 권장' },
                  { n: '닥터마틴',  c: '#FF6B6B', d: '영국 사이즈 — 한국보다 1 작게' },
                  { n: '뉴발란스',  c: '#3EFF9B', d: 'US 표준, 와이드(EE) 모델 별도' },
                  { n: '비르케슈톡', c: '#B885DA', d: 'EU 사이즈 — 한국보다 1~2 작게 권장' },
                ].map((b, i) => (
                  <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.c}33`, borderLeft: `3px solid ${b.c}`, borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: b.c, fontWeight: 700, marginBottom: 4 }}>{b.n}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>👕 의류 브랜드</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                {[
                  { n: '유니클로',  c: '#3EC8FF', d: '한국 사이즈와 동일 (정사이즈)' },
                  { n: '아디다스',  c: '#3EC8FF', d: '한국과 비슷' },
                  { n: 'H&M',      c: '#FF8C3E', d: '작게 나옴 — 한 사이즈 크게' },
                  { n: '자라',      c: '#FF8C3E', d: '작게 나옴 — 한 사이즈 크게' },
                  { n: 'GAP',      c: '#FFB83E', d: '약간 큰 편 — 정사이즈 또는 0.5 작게' },
                  { n: 'ASOS',     c: '#B885DA', d: '브랜드별 편차 큼 — 측정값 확인 필수' },
                ].map((b, i) => (
                  <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.c}33`, borderLeft: `3px solid ${b.c}`, borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 12, color: b.c, fontWeight: 700, marginBottom: 4 }}>{b.n}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. 국가별 옷 사이즈 비교표 (남/여 분리) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            국가별 옷 사이즈 비교표
          </h2>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>👨 남성 상의</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국', 'US', 'EU', 'UK', '가슴(cm)'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: '90 (S)',   u: 'XS',  e: '44', uk: '34', c: '88-92' },
                  { kr: '95 (M)',   u: 'S',   e: '46', uk: '36', c: '92-96' },
                  { kr: '100 (L)',  u: 'M',   e: '48', uk: '38', c: '96-100' },
                  { kr: '105 (XL)', u: 'L',   e: '50', uk: '40', c: '100-104' },
                  { kr: '110 (XXL)',u: 'XL',  e: '52', uk: '42', c: '104-108' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.e}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>👩 여성 상의</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국', 'US', 'EU', 'UK', '가슴(cm)'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: '44', u: '0',  e: '32', uk: '4',  c: '78-82' },
                  { kr: '55', u: '2',  e: '34', uk: '6',  c: '82-86' },
                  { kr: '66', u: '4',  e: '36', uk: '8',  c: '86-90' },
                  { kr: '77', u: '6',  e: '38', uk: '10', c: '90-94' },
                  { kr: '88', u: '8',  e: '40', uk: '12', c: '94-98' },
                  { kr: '99', u: '10', e: '42', uk: '14', c: '98-104' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.e}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 직구 실패 줄이기 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            해외 직구 사이즈 실패 줄이는 5가지 방법
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '브랜드 공식 측정값(measurements) 확인', d: '단순 사이즈 라벨(M/L)이 아닌 실제 cm 측정값을 비교하세요.' },
              { n: '②', t: '무료 반품 사이트 우선 이용',          d: '아마존 Prime, 자라, ASOS, 나이키는 30일 무료 반품 가능.' },
              { n: '③', t: '사이즈 후기 검색',                    d: '"이 사이즈는 작게/크게 나온다"는 한국 후기를 먼저 확인.' },
              { n: '④', t: '의심스러우면 한 사이즈 크게',          d: '특히 H&M·자라는 거의 항상 한 사이즈 크게 주문.' },
              { n: '⑤', t: '본인 사이즈를 cm로 정확히 측정',       d: '발 길이·가슴·허리·머리 둘레 등 핵심 측정값을 메모해 두면 실패 확률 급감.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, color: 'var(--accent)', fontWeight: 800 }}>{s.n}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{s.t}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginLeft: 28, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '미국 신발 사이즈 9.5는 한국으로 몇 mm인가요?',
                a: '미국 남성 기준 US 9.5는 한국 270mm에 해당합니다. 여성 기준은 US 9.5가 한국 265mm 정도입니다. 남성과 여성 기준이 다르므로 구매 시 성별 구분을 확인하세요.' },
              { q: '유럽 사이즈 EU 42는 한국 몇 mm인가요?',
                a: '남성 기준 EU 42는 한국 260mm(US 8.5)에 해당합니다. 유럽 사이즈는 브랜드에 따라 0.5~1 사이즈 정도 차이가 있을 수 있으므로 해당 브랜드의 공식 사이즈 가이드를 함께 확인하세요.' },
              { q: '아마존에서 US M 사이즈를 주문하면 한국 M이랑 같나요?',
                a: '미국 의류 M 사이즈는 한국 L(100) 사이즈와 비슷한 경우가 많습니다. 미국 의류는 한국보다 전반적으로 여유롭게 제작되므로, 한 사이즈 작게 주문하거나 해당 상품의 실제 측정값(measurements)을 확인하는 것이 좋습니다.' },
              { q: '반지 사이즈를 모를 때 어떻게 측정하나요?',
                a: '종이를 손가락에 감아 표시 후 자로 길이(둘레)를 측정합니다. 둘레가 50mm면 한국 11호, US 6호 정도입니다. 기존 반지의 안쪽 지름을 자로 재는 방법도 정확합니다 — 안지름 16mm = 한국 11호. 손가락이 부어 있을 수 있어 저녁 시간대 측정을 권장합니다.' },
              { q: '미국 모자 사이즈 7과 7 1/4는 한국으로?',
                a: '미국 모자 7 = 한국 56cm = 한국 M 사이즈, 7 1/4 = 한국 57cm = 한국 M/L 사이즈입니다. 미국은 인치 단위(머리 둘레 ÷ π ≈ 3.14)를 사용하기 때문에 7인치 = 약 17.8cm × π = 56cm로 환산됩니다.' },
              { q: '미국 브라 사이즈 34B는 한국 몇인가요?',
                a: '미국 34B = 한국 75B입니다. 미국은 밑가슴 인치 + 컵, 한국은 밑가슴 cm + 컵으로 표기합니다. 75B = 밑가슴 75cm + B컵을 의미합니다. 컵 사이즈는 미국 DD = 한국 E처럼 일부 다르니 변환표를 확인하세요.' },
              { q: '청바지 인치 사이즈는 어떻게 변환하나요?',
                a: '청바지 인치는 허리 둘레를 인치로 표기한 것으로, 30인치 = 약 76cm = 한국 30 사이즈입니다. 인심(다리 길이)도 함께 표기되는 경우가 많아 "30/32"는 허리 30인치, 인심 32인치를 의미합니다. 인치 = cm × 0.394 또는 cm = 인치 × 2.54로 환산하세요.' },
              { q: '해외 직구 시 사이즈 실패를 줄이려면?',
                a: '① 브랜드 공식 측정값(measurements) 확인 ② 무료 반품 가능 사이트 우선 이용 (아마존·자라) ③ 사이즈 후기 검색 ("이 사이즈는 작게/크게 나옴") ④ 의심스러우면 한 사이즈 크게 주문 ⑤ 본인 사이즈를 cm로 정확히 측정해 두기 — 이 5가지를 지키면 실패 확률이 크게 줄어듭니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/length',     icon: '📏', name: '길이 변환기',     desc: 'cm·인치·m·피트 즉시 변환' },
              { href: '/tools/unit/weight',     icon: '⚖️', name: '무게 변환기',     desc: 'kg·lb·oz·근 즉시 변환' },
              { href: '/tools/health/bmi',      icon: '💪', name: 'BMI 계산기',     desc: '체형 파악으로 사이즈 가늠' },
              { href: '/tools/life/unit-price', icon: '💰', name: '단가 비교 계산기', desc: '직구 가격·국내 가격 비교' },
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
