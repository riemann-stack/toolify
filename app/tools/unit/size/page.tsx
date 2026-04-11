import type { Metadata } from 'next'
import SizeClient from './SizeClient'

export const metadata: Metadata = {
  title: '해외 직구 사이즈 변환기 — 신발 옷 사이즈 한국 변환 | Youtil',
  description: '미국(US), 유럽(EU), 영국(UK) 신발·옷·하의 사이즈를 한국 사이즈로 변환합니다. 해외 직구·직구 사이즈 변환표 제공.',
  keywords: ['사이즈변환기', '해외직구사이즈', '미국신발사이즈변환', 'US사이즈변환', '옷사이즈변환기', '직구사이즈'],
}

export default function SizePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        👟 해외 직구 사이즈 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        미국(US), 유럽(EU), 영국(UK) 사이즈를 한국 사이즈로 변환합니다. 신발·상의·하의·속옷 모두 지원합니다.
      </p>

      <SizeClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>해외 직구 사이즈 선택 팁</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '신발 — 발 길이로 확인하세요', content: '신발은 브랜드마다 실제 사이즈가 다를 수 있습니다. 정확한 구매를 위해 발 길이(mm)를 직접 측정한 후 사이즈를 선택하세요. 해외 브랜드는 보통 0.5사이즈 크게 주문하는 것이 안전합니다.' },
              { title: '의류 — 브랜드별 치수표를 확인하세요', content: '의류 사이즈는 브랜드마다 차이가 크므로 단순 사이즈 변환보다 브랜드의 공식 치수표(measurements chart)를 확인하는 것이 정확합니다. 가슴둘레, 허리둘레, 엉덩이둘레를 cm로 측정해두세요.' },
              { title: '반품·환불 정책 확인은 필수', content: '해외 직구는 반품이 어렵고 비용이 많이 발생합니다. 구매 전 해당 쇼핑몰의 사이즈 교환/환불 정책을 반드시 확인하세요. 아마존, 자라 등 일부 브랜드는 무료 반품을 제공합니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '미국 신발 사이즈 9.5는 한국으로 몇 mm인가요?', a: '미국 남성 기준 US 9.5는 한국 275mm에 해당합니다. 여성 기준은 US 9.5가 한국 260mm 정도입니다. 남성과 여성 기준이 다르므로 구매 시 성별 구분을 확인하세요.' },
              { q: '유럽 사이즈 EU 42는 한국 몇 mm인가요?', a: 'EU 42는 한국 265mm(남성 기준 US 8.5)에 해당합니다. 유럽 사이즈는 브랜드에 따라 0.5~1 사이즈 정도 차이가 있을 수 있으므로 해당 브랜드의 공식 사이즈 가이드를 함께 확인하세요.' },
              { q: '아마존에서 US M 사이즈를 주문하면 한국 M이랑 같나요?', a: '미국 의류 M 사이즈는 한국 L 사이즈와 비슷하게 큰 경우가 많습니다. 미국 의류는 한국보다 전반적으로 여유롭게 제작되므로, 한 사이즈 작게 주문하거나 해당 상품의 실제 측정값(measurements)을 확인하는 것이 좋습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}