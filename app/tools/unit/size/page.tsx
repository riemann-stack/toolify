import Link from 'next/link'
import SizeClient from './SizeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/unit/size',
  title: '사이즈 변환기 — 신발·옷·반지·모자 한국 사이즈 변환',
  description: 'US·EU·UK 신발·의류·속옷·반지·모자 사이즈를 한국 mm·호수로 변환. 나이키·자라 등 브랜드별 사이즈 성향과 아마존·ASOS 직구 실패 줄이는 측정 가이드 포함.',
  keywords: ['해외직구사이즈변환기', '신발사이즈변환', '의류사이즈US', '반지사이즈변환', '모자사이즈', '장갑사이즈', '벨트사이즈', '브라사이즈US', '아마존사이즈'],
})

const FAQ_LD = [
              { q: '미국 신발 사이즈 9.5는 한국으로 몇 mm인가요?',
                a: '미국 남성 기준 US 9.5는 한국 270mm에 해당합니다. 여성 기준은 US 9.5가 한국 265mm 정도입니다. 남성과 여성 기준이 다르므로 구매 시 성별 구분을 확인하세요.' },
              { q: '유럽 사이즈 EU 42는 한국 몇 mm인가요?',
                a: '남성 기준 EU 42는 한국 260mm(US 8.5)에 해당합니다. 유럽 사이즈는 브랜드에 따라 0.5~1 사이즈 정도 차이가 있을 수 있으므로 해당 브랜드의 공식 사이즈 가이드를 함께 확인하세요.' },
              { q: '아마존에서 US M 사이즈를 주문하면 한국 M이랑 같나요?',
                a: '미국 의류 M 사이즈는 한국 L(100) 사이즈와 비슷한 경우가 많습니다. 미국 브랜드는 한국보다 여유롭게 나오는 경향이라 한 사이즈 작게, 반대로 H&M·자라 같은 유럽 패스트패션은 작게 나오는 경향이라 한 사이즈 크게 주문하는 경우가 많습니다. 방향이 브랜드 성향에 따라 반대이므로, 본문의 브랜드별 사이즈 특징 표와 해당 상품의 실제 측정값(measurements)을 함께 확인하는 것이 가장 안전합니다.' },
              { q: '반지 사이즈를 모를 때 어떻게 측정하나요?',
                a: '종이를 손가락에 감아 표시 후 자로 길이(둘레)를 측정합니다. 둘레가 50mm면 한국 11호, US 약 5.5 정도입니다(US는 내경 기준 ISO 표준). 기존 반지의 안쪽 지름을 자로 재는 방법도 정확합니다 — 안지름 16mm = 한국 11호. 손가락이 부어 있을 수 있어 저녁 시간대 측정을 권장합니다.' },
              { q: '미국 모자 사이즈 7과 7 1/4는 한국으로?',
                a: '미국 모자 7 = 한국 56cm = 한국 M 사이즈, 7 1/4 = 한국 57cm = 한국 M/L 사이즈입니다. 미국은 인치 단위(머리 둘레 ÷ π ≈ 3.14)를 사용하기 때문에 7인치 = 약 17.8cm × π = 56cm로 환산됩니다.' },
              { q: '미국 브라 사이즈 34B는 한국 몇인가요?',
                a: '미국 34B = 한국 75B입니다. 미국은 밑가슴 인치 + 컵, 한국은 밑가슴 cm + 컵으로 표기합니다. 75B = 밑가슴 75cm + B컵을 의미합니다. 컵 사이즈는 미국 DD = 한국 E처럼 일부 다르니 변환표를 확인하세요.' },
              { q: '청바지 인치 사이즈는 어떻게 변환하나요?',
                a: '청바지 인치는 허리 둘레를 인치로 표기한 것으로, 30인치 = 약 76cm = 한국 30 사이즈입니다. 인심(다리 길이)도 함께 표기되는 경우가 많아 "30/32"는 허리 30인치, 인심 32인치를 의미합니다. 인치 = cm × 0.394 또는 cm = 인치 × 2.54로 환산하세요.' },
              { q: '발볼이 넓으면 신발 사이즈를 어떻게 골라야 하나요?',
                a: '발 길이만 키우기보다 와이드(발볼 넓음) 옵션을 먼저 확인하세요. 미국 신발은 발볼 폭을 알파벳으로 표기합니다 — 남성 기준 D가 표준이고 2E(EE)·4E로 갈수록 넓어집니다. 뉴발란스·아식스 등은 같은 길이에 2E·4E 와이드 모델을 따로 판매합니다. 발볼 때문에 길이를 0.5~1 사이즈 키우면 뒤꿈치가 헐거워질 수 있어, 길이는 실측대로 두고 와이드 옵션을 고르는 편이 실패가 적습니다.' },
            ]

export default function SizePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="unit" />사이즈 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        US·EU·UK 의류·신발·속옷·반지를 <strong style={{ color: 'var(--text)' }}>한국 사이즈로</strong> + 브랜드별 차이 가이드.
      </p>

      {/* ── 국가별 사이즈 표기 차이 (상단 박스) ── */}
      <div style={{
        background: 'rgba(8,145,178,0.05)',
        border: '1px solid rgba(8,145,178,0.2)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '40px',
      }}>
        <p style={{ fontSize: '13px', color: '#0891B2', fontWeight: 700, marginBottom: '8px' }}>🌍 국가별 사이즈 표기 차이</p>
        <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>미국 (US)</strong>: 신발 숫자 작음(6~12), 옷 알파벳(XS·S·M·L·XL)</li>
          <li><strong style={{ color: 'var(--text)' }}>유럽 (EU)</strong>: 신발 숫자 큼(36~46), 옷 숫자(36·38·40)</li>
          <li><strong style={{ color: 'var(--text)' }}>영국 (UK)</strong>: 미국보다 0.5~1 작음, 옷은 짝수(4·6·8·10)</li>
          <li><strong style={{ color: 'var(--text)' }}>한국·일본</strong>: mm·cm 단위 (가장 직관적)</li>
        </ul>
      </div>

      <SizeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 카테고리별 측정 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            주요 직구 사이트별 사이즈 가이드 위치
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['사이트', '사이즈 가이드 위치', '치수 단위', '무료 반품'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 11 }}>{h}</th>
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
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, fontSize: 12 }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '8px' }}>
            ※ 반품 정책·치수 단위는 <strong style={{ color: 'var(--text)' }}>한국 기준·작성 시점(2026년)</strong> 참고값이며 국가·상품군·시기별로 달라질 수 있습니다. 주문 전 각 사이트의 최신 정책을 확인하세요.
          </p>
        </div>

        {/* ── 3. 브랜드별 사이즈 특징 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            브랜드별 사이즈 특징 (참고)
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
            ※ 브랜드 사이즈 성향은 <strong style={{ color: 'var(--text)' }}>일반적 경향</strong>일 뿐 제품·시즌·라인별로 다릅니다. 항상 <strong style={{ color: 'var(--text)' }}>해당 상품의 공식 실측표(measurements)</strong>를 우선 확인하세요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>👟 신발 브랜드</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                {[
                  { n: '나이키',    c: '#D97706', d: 'US 표준보다 살짝 큰 편 — 0.5 작게 권장' },
                  { n: '아디다스',  c: '#0891B2', d: 'US 표준 (정사이즈)' },
                  { n: '컨버스',    c: '#EA580C', d: '약 0.5 큰 편 — 0.5 작게 권장' },
                  { n: '닥터마틴',  c: '#DC2626', d: '영국 사이즈 — 한국보다 1 작게' },
                  { n: '뉴발란스',  c: '#059669', d: 'US 표준, 와이드(EE) 모델 별도' },
                  { n: '버켄스탁', c: '#B885DA', d: 'EU 사이즈 — 한국보다 1~2 작게 권장' },
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
                  { n: '유니클로',  c: '#0891B2', d: '한국 사이즈와 동일 (정사이즈)' },
                  { n: '아디다스',  c: '#0891B2', d: '한국과 비슷' },
                  { n: 'H&M',      c: '#EA580C', d: '작게 나옴 — 한 사이즈 크게' },
                  { n: '자라',      c: '#EA580C', d: '작게 나옴 — 한 사이즈 크게' },
                  { n: 'GAP',      c: '#D97706', d: '약간 큰 편 — 정사이즈 또는 0.5 작게' },
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            국가별 옷 사이즈 비교표
          </h2>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>👨 남성 상의</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국', 'US', 'EU', 'UK', '가슴(cm)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
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
                  { kr: '115 (XXXL)',u: 'XXL', e: '54', uk: '44', c: '108-112' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.e}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.uk}</td>
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
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
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
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.u}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.e}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 신발 사이즈 핵심 변환표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            신발 사이즈 핵심 변환표
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            위 변환기와 동일한 기준값입니다. 같은 mm라도 남성·여성 US 표기가 다르다는 점에 주의하세요 — 예: 240mm는 남성 US 6.5, 여성 US 7입니다.
          </p>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>👨 남성 신발 (240~290mm)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국 (mm)', 'US', 'UK', 'EU'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: 240, us: '6.5',  uk: '6',    eu: '39'   },
                  { kr: 245, us: '7',    uk: '6.5',  eu: '39.5' },
                  { kr: 250, us: '7.5',  uk: '7',    eu: '40'   },
                  { kr: 255, us: '8',    uk: '7.5',  eu: '41'   },
                  { kr: 260, us: '8.5',  uk: '8',    eu: '42'   },
                  { kr: 265, us: '9',    uk: '8.5',  eu: '42.5' },
                  { kr: 270, us: '9.5',  uk: '9',    eu: '43'   },
                  { kr: 275, us: '10',   uk: '9.5',  eu: '44'   },
                  { kr: 280, us: '10.5', uk: '10',   eu: '44.5' },
                  { kr: 285, us: '11',   uk: '10.5', eu: '45'   },
                  { kr: 290, us: '11.5', uk: '11',   eu: '46'   },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.us}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.eu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>👩 여성 신발 (220~255mm)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국 (mm)', 'US', 'UK', 'EU'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: 220, us: '5',   uk: '2.5', eu: '35'   },
                  { kr: 225, us: '5.5', uk: '3',   eu: '35.5' },
                  { kr: 230, us: '6',   uk: '3.5', eu: '36'   },
                  { kr: 235, us: '6.5', uk: '4',   eu: '37'   },
                  { kr: 240, us: '7',   uk: '4.5', eu: '37.5' },
                  { kr: 245, us: '7.5', uk: '5',   eu: '38'   },
                  { kr: 250, us: '8',   uk: '5.5', eu: '38.5' },
                  { kr: 255, us: '8.5', uk: '6',   eu: '39'   },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.us}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.uk}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.eu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '8px' }}>
            ※ 위 표는 본 변환기의 기준값이며, 브랜드에 따라 0.5~1 사이즈 차이가 날 수 있습니다. 본문의 브랜드별 사이즈 특징을 함께 확인하세요.
          </p>
        </div>

        {/* ── 6. 반지 호수 요약 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            반지 호수 요약표
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            한국 호수는 손가락 둘레·내경 기준이며, US 사이즈는 내경 기준(ISO 표준)입니다. 대표 호수만 추린 요약표로, 짝수 호수와 UK·EU·일본 표기는 위 변환기에서 확인할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['한국 호수', '내경 (mm)', '둘레 (mm)', 'US'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { kr: '7호',  inner: '14.5', circ: '45.5', us: '3.5'   },
                  { kr: '9호',  inner: '15.3', circ: '48.0', us: '4.5'   },
                  { kr: '11호', inner: '16.0', circ: '50.3', us: '5.5'   },
                  { kr: '13호', inner: '17.0', circ: '53.4', us: '6.5'   },
                  { kr: '15호', inner: '17.5', circ: '55.0', us: '7.25'  },
                  { kr: '17호', inner: '18.0', circ: '56.5', us: '7.75'  },
                  { kr: '19호', inner: '18.5', circ: '58.1', us: '8.5'   },
                  { kr: '21호', inner: '19.0', circ: '59.6', us: '9'     },
                  { kr: '23호', inner: '19.8', circ: '62.0', us: '10'    },
                  { kr: '25호', inner: '20.2', circ: '63.4', us: '10.5'  },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.kr}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.inner}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.circ}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '8px' }}>
            ※ 손가락 둘레는 하루 중에도 변합니다. 저녁 시간대에, 관절을 통과하는 굵기까지 감안해 측정하세요.
          </p>
        </div>

        {/* ── 7. 직구 실패 줄이기 팁 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                  <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 18, color: 'var(--accent)', fontWeight: 800 }}>{s.n}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{s.t}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0, marginLeft: 28 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 직구 반품·면세 실전 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            직구 반품·면세 실전
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            사이즈가 애매할 때 두 사이즈를 함께 주문해 하나를 반품하는 경우가 많은데, 이때 면세 한도와 반품 정책을 미리 알아두면 낭패를 줄일 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '면세 한도 — 150달러 (미국발 200달러)', d: '물품가격 기준 미화 150달러 이하(미국발 물품은 200달러 이하)의 자가사용물품은 관세·부가세 없이 통관됩니다 (관세법 제94조 소액물품 면세, 관세청 안내).' },
              { n: '②', t: '한도를 넘으면 전체가 과세', d: '150달러를 초과하면 초과분만이 아니라 물품가격 전체 기준으로 세금이 부과됩니다 (관세청 안내). 예상 세액은 아래 관부가세 계산기로 미리 계산해 보세요.' },
              { n: '③', t: '목록통관 배제 품목 혼재 주의', d: '기준 금액 이하 자가사용물품은 특송업체의 통관목록 제출만으로 수입신고가 생략되지만, 건강기능식품 등 목록통관 배제 품목이 하나라도 섞이면 그 화물 전체가 목록통관에서 배제됩니다. 이때 물품가격에는 발송 국가에서 부과된 세금·현지 운임·보험료가 포함됩니다 (「특송물품 수입통관 사무처리에 관한 고시」 제8조).' },
              { n: '④', t: '반품 정책은 주문 전에 확인', d: '사이즈 실패로 반품·재주문할 계획이라면 위 직구 사이트별 표의 무료 반품 여부를 주문 전에 확인하세요. 반품 배송비가 물품가보다 커지는 경우도 있습니다.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 18, color: 'var(--accent)', fontWeight: 800 }}>{s.n}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{s.t}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0, marginLeft: 28 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginTop: '12px' }}>
            관세·부가세가 얼마나 나올지는{' '}
            <Link href="/tools/life/customs" style={{ color: 'var(--accent-ink)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '2px' }}>관부가세 계산기</Link>
            에서 품목별로 계산할 수 있습니다.
          </p>
          <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '8px' }}>
            ※ 2026년 7월 관세청 고객지원 FAQ 기준. 미국발 200달러 기준이 배송 경로(특송·우편)별로 어떻게 적용되는지 등 세부 조건은{' '}
            <a href="https://www.customs.go.kr/call/ad/crmcc/selectFaqViewPage.do?mi=6822&cnslKnwlSrno=512" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>관세청 안내 ↗</a>
            에서 직접 확인하세요.
          </p>
        </div>

        {/* ── 9. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ_LD.map((faq, i) => (
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

        {/* ── 10. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/converter',  icon: '📐', name: '단위 변환기',     desc: '길이·무게·온도 통합 변환' },
              { href: '/tools/life/packing',    icon: '🧳', name: '여행 짐 체크리스트', desc: '해외여행 준비물·옷 관리' },
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
