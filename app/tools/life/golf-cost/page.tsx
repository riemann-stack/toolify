import Link from 'next/link'
import GolfCostClient from './GolfCostClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/golf-cost',
  title: '골프 라운딩 비용 계산기 — 그린피·캐디피·1인당 비용 정산',
  description: '그린피, 카트비, 캐디피, 식사비, 교통비를 합산해 1인당 라운딩 비용을 계산합니다. 캐디피 N빵, 카풀 교통비 정산, 월·연간 골프 비용 예측까지 한 번에.',
  keywords: ['골프라운딩비용계산기', '그린피계산기', '캐디피정산', '골프비용계산기', '라운딩비용1인당', '골프장비용', '골프카트비', '캐디피N빵'],
})

export default function GolfCostPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⛳ 골프 라운딩 비용 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        그린피·카트비·캐디피·식사비·교통비를 한 번에 합산해 1인당 비용을 정산합니다. 월·연간 골프 비용까지 예측해보세요.
      </p>

      <GolfCostClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 골프장 타입별 평균 비용표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            골프장 타입별 평균 비용 (참고)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            한국 주요 골프장 평균값 기준이며, 실제 비용은 시즌·요일·지역·평일/주말에 따라 ±20~30% 변동합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>골프장 타입</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>그린피</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>카트비(팀)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>캐디피(팀)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: '퍼블릭 주중',  color: '#3EFF9B', green: '8~12만',   cart: '8~10만',  caddie: '12~14만' },
                  { type: '퍼블릭 주말',  color: '#C8FF3E', green: '12~16만',  cart: '8~10만',  caddie: '12~14만' },
                  { type: '세미퍼블릭',   color: '#3EC8FF', green: '14~20만',  cart: '10~12만', caddie: '13~15만' },
                  { type: '회원제(비회원)', color: '#FFD700', green: '20~30만',  cart: '10~12만', caddie: '14~16만' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: row.color }}>{row.type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{row.green}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{row.cart}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{row.caddie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 카트비·캐디피는 보통 4인 1팀 기준 합산 금액으로, 1인당으로는 ÷4 해서 부담합니다. 회원제 골프장은 회원 동반 여부에 따라 그린피가 크게 달라집니다.
          </p>
        </div>

        {/* ── 2. 1인당 라운딩 비용 예시 시나리오 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            1인당 라운딩 비용 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#C8FF3E', marginBottom: '8px' }}>예시 1 — 퍼블릭 주말 4인 (캐디 동반)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 13만(인당) · 카트비 4만(팀) · 캐디피 12만(팀) · 식사 1.5만(인당) · 자차 카풀
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 13만 × 4 = 52만<br/>
                카트비 4만 (팀 부담)<br/>
                캐디피 12만 + 팁 4만 = 16만 (팀 부담)<br/>
                식사 1.5만 × 4 = 6만<br/>
                교통비 8만 (자차 카풀, 팀 분담)<br/>
                <span style={{ color: '#C8FF3E' }}>팀 합계 = 86만</span> → <strong style={{ color: 'var(--accent)' }}>1인당 약 21.5만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 한국 평균 주말 라운딩의 표준 가격대입니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#3EC8FF', marginBottom: '8px' }}>예시 2 — 세미퍼블릭 주중 4인 (노캐디)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 16만(인당) · 카트비 5만(팀) · 캐디 미사용 · 식사 1.5만(인당) · KTX 이동
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 16만 × 4 = 64만<br/>
                카트비 5만 (팀)<br/>
                캐디피 0 (노캐디)<br/>
                식사 1.5만 × 4 = 6만<br/>
                교통비 4만 × 4 = 16만 (KTX 왕복 인당)<br/>
                <span style={{ color: '#3EC8FF' }}>팀 합계 = 91만</span> → <strong style={{ color: 'var(--accent)' }}>1인당 약 22.8만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 노캐디로 캐디피 16만을 아꼈지만, 그린피 차이로 비용이 비슷해질 수 있습니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#FFD700', marginBottom: '8px' }}>예시 3 — 회원제 비회원 동반 (4인)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 25만(인당) · 카트비 4만(팀) · 캐디피 14만(팀) + 팁 6만 · 식사 2만 · 자차
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Syne, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 25만 × 4 = 100만<br/>
                카트비 4만<br/>
                캐디피 14만 + 팁 6만 = 20만<br/>
                식사 2만 × 4 = 8만<br/>
                교통비 8만 (자차 카풀)<br/>
                <span style={{ color: '#FFD700' }}>팀 합계 = 140만</span> → <strong style={{ color: 'var(--accent)' }}>1인당 약 35만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 회원 동반(그린피 할인) 여부에 따라 1인당 10~15만원이 줄어들 수 있습니다.</p>
            </div>

          </div>
        </div>

        {/* ── 3. 캐디피 정산 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🧾 캐디피 정산 완전 가이드
          </h2>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', marginBottom: '10px' }}>1. 캐디피는 보통 "팀 부담"</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              한국 골프장의 캐디피는 1팀(보통 4인) 기준 12~16만원이 표준입니다. 골프장에 직접 지불하는 것이 아니라 라운드 종료 후
              <strong style={{ color: 'var(--text)' }}> 캐디에게 현금으로 직접 전달</strong>합니다. 카드 결제 불가, 현금 영수증·세금계산서 발행 안 됨이 일반적입니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,255,155,0.2)', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#3EFF9B', marginBottom: '10px' }}>2. N빵 vs 한 명이 선결제</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              4인 1팀이면 캐디피 12만 ÷ 4 = <strong style={{ color: 'var(--text)' }}>1인당 3만원</strong>씩 N빵하는 것이 일반적입니다.
              한 명이 먼저 캐디에게 지불하고 나머지는 그 사람에게 카카오페이·이체로 정산합니다. 더치페이 계산기를 활용하면 식사·카트비까지 한 번에 정리할 수 있습니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,140,62,0.2)', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#FF8C3E', marginBottom: '10px' }}>3. 팁(촌지) 관행</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              만족스러운 라운드였다면 캐디피의 <strong style={{ color: 'var(--text)' }}>10~30%(2~5만원)</strong> 정도를 팁으로 추가 지급합니다.
              팁은 의무는 아니지만, 첫 라운드·접대 자리·회원 동반 시에는 관행적으로 챙기는 경우가 많습니다. 노캐디(캐디 미동반) 라운드는 캐디피와 팁 모두 발생하지 않습니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#3EC8FF', marginBottom: '10px' }}>4. 노캐디·드라이빙 캐디·마샬 캐디</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>노캐디</strong>: 캐디 없이 직접 진행. 캐디피 0원, 시간 단축.<br/>
              <strong style={{ color: 'var(--text)' }}>드라이빙 캐디</strong>: 카트만 운전, 클럽 추천 없음. 보통 6~8만원.<br/>
              <strong style={{ color: 'var(--text)' }}>마샬 캐디</strong>: 1명이 2팀 담당. 팀당 캐디피 6~8만원으로 절반 수준.
            </p>
          </div>
        </div>

        {/* ── 4. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '그린피에 카트비·캐디피가 포함되어 있나요?',
                a: '일반적으로 포함되지 않습니다. 그린피는 코스 사용료만 의미하며, 카트비(팀당 4~12만)와 캐디피(팀당 12~16만)는 별도로 지불합니다. 일부 골프장은 "그린피 + 카트 패키지" 형태로 묶어 판매하기도 하므로, 예약 시 명세를 반드시 확인하세요.',
              },
              {
                q: '카트비는 왜 팀 부담과 1인 부담이 다른가요?',
                a: '한국 대부분의 골프장은 4인 1카트(팀당 부과)이지만, 2인 라운드나 일부 회원제는 1인당 카트비를 받기도 합니다. 또한 골프장에 따라 "1인 1카트" 옵션을 제공하는 곳도 있어, 예약 시 카트 정책을 미리 확인하는 것이 좋습니다.',
              },
              {
                q: '캐디 없이 라운드해도 되나요?',
                a: '퍼블릭과 일부 세미퍼블릭은 노캐디 라운드를 허용하지만, 회원제 골프장은 대부분 캐디 동반이 의무입니다. 노캐디는 캐디피·팁 16~20만원을 절약할 수 있지만, 진행 속도와 룰 적용에 책임을 본인이 져야 합니다.',
              },
              {
                q: '내기 골프 정산은 어떻게 하나요?',
                a: '한 라운드 후 승자·패자별 금액을 정산할 때는 "받은 사람 + / 낸 사람 −" 합산이 0이 되어야 합니다. 본 계산기의 내기 정산 옵션을 활성화하면 합산이 0인지 자동 검증해드립니다. 4인 라운드에서 흔한 방식은 스킨스(홀별 승자), 라스베가스(짝꿍 합산), 나소(전반·후반·총 3승부) 등입니다.',
              },
              {
                q: '월·연간 골프 비용은 어떻게 잡으면 적당한가요?',
                a: '월 1~2회 라운드 시 한국 평균 기준 월 30~60만원, 연 400~700만원 수준이 일반적입니다. 회원권을 보유하면 그린피가 절감되지만 회원권 자체 가격(수천만~수억)과 연회비를 별도 고려해야 합니다. 본 계산기의 월·연간 슬라이더로 자신의 예상 라운드 횟수에 맞춰 시뮬레이션해보세요.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch',         icon: '🍻', name: '더치페이 계산기',       desc: '식사·카트비 N빵 정산' },
              { href: '/tools/life/golf-handicap', icon: '⛳', name: '골프 핸디캡 계산기',    desc: 'WHS 핸디캡 지수·코스 핸디캡' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',  desc: '골프장 왕복 유류비 시뮬레이션' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',       desc: '연습장 루틴 관리' },
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
