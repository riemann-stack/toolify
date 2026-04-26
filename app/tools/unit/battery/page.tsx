import type { Metadata } from 'next'
import Link from 'next/link'
import BatteryClient from './BatteryClient'
import AdSlot from '@/components/AdSlot'

export const metadata: Metadata = {
  title: '배터리 용량 변환기 mAh ↔ Wh — 비행기 반입 가능 체크 | Youtil',
  description: '보조배터리 mAh를 Wh로 변환합니다. 비행기 휴대 반입 가능 여부(100Wh 기준) 자동 체크. 5V·3.7V 등 전압별 변환 지원.',
  keywords: ['mAh Wh 변환', '보조배터리 비행기', 'mAh 계산기', '배터리용량변환', '100Wh 보조배터리', '비행기 보조배터리 반입'],
}

export default function BatteryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔋 배터리 용량 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        보조배터리 <strong style={{ color: 'var(--text)' }}>mAh를 Wh로 변환</strong>하고, 비행기 휴대 반입 가능 여부(100Wh 기준)를 자동으로 체크합니다. 3.7V·5V 등 전압별 환산을 지원합니다.
      </p>

      <BatteryClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. mAh와 Wh의 차이 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            mAh와 Wh의 차이 — 왜 Wh로 환산해야 하나?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            보조배터리에 보통 적혀 있는 <strong style={{ color: 'var(--text)' }}>mAh(밀리암페어시)</strong>는 <strong style={{ color: 'var(--text)' }}>전류 × 시간</strong>을 나타내는 단위로, 같은 전압에서만 비교가 됩니다. 반면 <strong style={{ color: 'var(--accent)' }}>Wh(와트시)</strong>는 <strong style={{ color: 'var(--text)' }}>전압 × 전류 × 시간</strong>으로, 전압이 달라도 동일한 “에너지의 양”을 비교할 수 있는 절대적 단위입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>mAh (밀리암페어시)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
                전류량 × 시간. <strong>전압이 다르면 직접 비교 불가</strong>. 예) 3.7V 10,000mAh와 5V 10,000mAh는 다른 에너지.
              </p>
            </div>
            <div style={{ background: 'rgba(200,255,62,0.05)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '12px 14px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '4px', fontWeight: 700 }}>Wh (와트시)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
                전압 × 전류 × 시간 = <strong>실제 에너지량</strong>. 항공 규정·노트북·전기차 모두 Wh 기준.
              </p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ✈️ <strong style={{ color: 'var(--text)' }}>국제 항공 규정(IATA)</strong>이 100Wh를 기준으로 정한 이유도 “전압과 무관한 절대 에너지량”으로 위험성을 판정하기 위해서입니다.
          </p>
        </div>

        {/* ── 2. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            핵심 공식
          </h2>
          <div style={{ background: 'rgba(200,255,62,0.05)', border: '1px solid rgba(200,255,62,0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Wh = (<span style={{ color: 'var(--accent)' }}>mAh</span> × <span style={{ color: 'var(--accent)' }}>V</span>) ÷ 1000
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
              역산: mAh = (Wh ÷ V) × 1000
            </p>
          </div>
          <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {[
              { ex: '10,000mAh × 3.7V',  res: '37 Wh' },
              { ex: '20,000mAh × 3.7V',  res: '74 Wh' },
              { ex: '27,000mAh × 3.7V',  res: '99.9 Wh' },
              { ex: '5,000mAh × 5V',     res: '25 Wh' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{c.ex}</p>
                <p style={{ fontSize: '15px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginTop: '2px' }}>= {c.res}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 인기 보조배터리 모델별 Wh 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            인기 보조배터리 모델별 Wh 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            대표 브랜드의 보조배터리를 3.7V 기준으로 환산한 표입니다. 실제 제품 표기 Wh가 우선이며, 일부 모델은 다중 셀 구조로 표기 Wh가 다를 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['브랜드 / 모델', 'mAh', 'Wh (3.7V)', '반입'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: 'Anker PowerCore 10000',   m: '10,000', w: '37',    s: '✅', c: '#3EFF9B' },
                  { n: 'Anker PowerCore 20100',   m: '20,100', w: '74.4',  s: '✅', c: '#3EFF9B' },
                  { n: 'Anker PowerCore 26800',   m: '26,800', w: '99.2',  s: '✅', c: '#3EFF9B' },
                  { n: '샤오미 Mi 10000mAh',      m: '10,000', w: '37',    s: '✅', c: '#3EFF9B' },
                  { n: '샤오미 Mi 20000mAh',      m: '20,000', w: '74',    s: '✅', c: '#3EFF9B' },
                  { n: 'RAVPower 26800',          m: '26,800', w: '99.2',  s: '✅', c: '#3EFF9B' },
                  { n: 'Anker 737 (PowerCore 24K)',m: '24,000', w: '88.8',  s: '✅', c: '#3EFF9B' },
                  { n: 'Zendure SuperTank',       m: '27,000', w: '99.9',  s: '✅ 한계', c: '#3EFF9B' },
                  { n: 'EcoFlow RIVER 2 mini',    m: '~70,000',w: '256',   s: '❌', c: '#FF6B6B' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.m}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{r.w}</td>
                    <td style={{ padding: '9px 10px', color: r.c, fontWeight: 700 }}>{r.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 항공사별 보조배터리 정책 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            항공사별 보조배터리 정책
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            대부분 IATA 기준을 따르지만, 100~160Wh 구간의 “사전 승인” 요건은 항공사마다 차이가 있습니다. 정확한 규정은 출발 전 항공사 공식 홈페이지 확인이 필수입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {[
              { air: '🇰🇷 대한항공 (KE)',     limit: '100Wh 이하 자유 / 100~160Wh 2개', note: '160Wh 초과 반입 불가. 의료용은 별도 신청.' },
              { air: '🇰🇷 아시아나 (OZ)',     limit: '100Wh 이하 5개 / 100~160Wh 2개',  note: '예비 배터리는 모두 기내 휴대만 가능.' },
              { air: '🇺🇸 델타 (DL)',         limit: '100Wh 이하 자유 / 100~160Wh 2개', note: 'Hoverboard·전동 킥보드 배터리는 전면 금지.' },
              { air: '🇺🇸 유나이티드 (UA)',   limit: '100Wh 이하 자유 / 100~160Wh 2개', note: 'FAA 규정에 따라 위탁 수하물 절대 금지.' },
              { air: '🇯🇵 일본항공 (JL)',     limit: '160Wh 이하 (160Wh 초과 불가)',    note: '훼손·부풀어 오른 배터리는 반입 거부.' },
              { air: '🇸🇬 싱가포르항공 (SQ)', limit: '100Wh 이하 자유 / 100~160Wh 2개', note: '온라인 사전 신고 권장.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>{c.air}</p>
                <p style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '4px' }}>{c.limit}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.note}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px', opacity: 0.8 }}>
            ⚠️ 본 정보는 일반 가이드이며, 정책은 수시로 변경됩니다. 출국 전 항공사 공식 홈페이지에서 최신 규정을 반드시 재확인하세요.
          </p>
        </div>

        {/* ── 5. 자주 검색되는 사례 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 검색되는 사례
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {[
              { q: '10,000mAh는 몇 Wh?',           a: '37 Wh',           sub: '10,000 × 3.7 ÷ 1000 = 37Wh — 휴대 반입 OK ✅' },
              { q: '20,000mAh 비행기 반입 가능?',   a: '74 Wh — 가능 ✅', sub: '100Wh 미만, 일반 휴대 반입 가능 (위탁은 불가)' },
              { q: '100Wh 한도는 몇 mAh?',          a: '~27,027 mAh',     sub: '3.7V 기준: 100Wh × 1000 ÷ 3.7 = 약 27,027mAh' },
              { q: '5,000mAh × 5V는?',              a: '25 Wh',           sub: '5V USB 출력 기준 환산. 휴대폰 본체 배터리 표기에 자주 등장' },
              { q: '50,000mAh 비행기 반입?',        a: '185 Wh — 불가 ❌', sub: '160Wh 초과로 일반 항공기 반입 불가' },
              { q: '27,000mAh가 한계인 이유?',      a: '99.9 Wh',         sub: '3.7V 기준 27,000mAh = 99.9Wh로 100Wh 직전. 더 큰 용량은 사전 승인 필요' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Q. {c.q}</p>
                <p style={{ fontSize: '17px', color: 'var(--accent)', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '4px', letterSpacing: '-0.3px' }}>{c.a}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '보조배터리를 위탁 수하물(체크인)에 넣어도 되나요?',
                a: '<strong>절대 안 됩니다.</strong> 화재 위험 때문에 모든 항공사·국가에서 보조배터리는 <strong>오직 기내 휴대</strong>만 허용됩니다. 위탁 수하물에서 적발되면 배터리는 폐기되고, 출발이 지연되거나 과태료가 부과될 수 있습니다.',
              },
              {
                q: '100Wh 한도가 표기되지 않은 보조배터리는 어떻게 하나요?',
                a: '제품에 mAh와 정격 전압(보통 3.7V)이 적혀 있다면 <strong>Wh = (mAh × V) ÷ 1000</strong>으로 직접 환산할 수 있습니다. 표기가 전혀 없거나 불분명한 제품은 <strong>안전상의 이유로 반입이 거부될 수 있으니</strong> 명확히 표기된 제품 사용을 권장합니다.',
              },
              {
                q: '노트북 배터리도 같은 규정이 적용되나요?',
                a: '예. 일반 노트북은 보통 50~100Wh 범위라 휴대 반입에 문제가 없습니다. 다만 <strong>예비 노트북 배터리(분리형)</strong>는 보조배터리와 동일하게 100Wh 이하만 자유롭게 휴대할 수 있고, 100~160Wh는 사전 승인이 필요합니다.',
              },
              {
                q: '보조배터리 2개 이상 가지고 탈 수 있나요?',
                a: '<strong>100Wh 이하</strong>는 대부분 항공사에서 개수 제한이 거의 없거나 5개 이내로 허용합니다(아시아나는 5개 명시). <strong>100~160Wh</strong>는 1인당 <strong>최대 2개</strong>까지가 일반적입니다. 여러 개를 가져갈 때는 단자 보호를 위해 절연 테이프나 전용 파우치 사용을 권장합니다.',
              },
              {
                q: '충전 케이블·어댑터도 함께 반입할 수 있나요?',
                a: '<strong>네, 자유롭게 반입 가능</strong>합니다. USB 케이블, 충전 어댑터, 멀티탭 등은 보조배터리와 함께 휴대 또는 위탁 모두 가능합니다. 다만 <strong>보조배터리 본체</strong>만은 반드시 기내 휴대해야 합니다.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/date/jet-lag',   icon: '✈️', name: '시차 적응 계산기',   desc: '여행 전·중·후 시차 적응 일정' },
              { href: '/tools/life/unit-price',icon: '🏷️', name: '단가 비교 계산기',   desc: '보조배터리 mAh당 가격 비교' },
              { href: '/tools/unit/length',    icon: '📏', name: '길이 변환기',         desc: 'cm·inch·ft 단위 변환' },
              { href: '/tools/unit/time',      icon: '⏱️', name: '시간 단위 변환기',   desc: '초·분·시간·일·주·월·년 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
