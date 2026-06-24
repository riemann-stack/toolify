import Link from 'next/link'
import GolfCostClient from './GolfCostClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'

export const metadata = buildMetadata({
  path: '/tools/sports/golf-cost',
  title: '골프 비용 계산기 — 그린피·캐디피·1인당·회원권 손익',
  description: '그린피·카트·캐디·식사·교통 1인당 정산 + 회원권 손익 분기점과 자주 가는 골프장 저장.',
  keywords: ['골프라운딩비용계산기', '그린피계산기', '캐디피정산', '골프비용계산기', '라운딩비용1인당', '골프장비용', '골프카트비', '캐디피N빵', '골프 회원권 손익', '회원권 시뮬레이션', '주말 그린피', '퍼블릭 골프장 비용'],
})

const FAQ_LD = [
              {
                q: '그린피에 카트비·캐디피가 포함되어 있나요?',
                a: '일반적으로 포함되지 않습니다. 그린피는 코스 사용료만 의미하며, 카트비(팀당 4~12만)와 캐디피(팀당 12~16만)는 별도로 지불합니다. 일부 골프장은 &ldquo;그린피 + 카트 패키지&rdquo; 형태로 묶어 판매하기도 하므로, 예약 시 명세를 반드시 확인하세요.',
              },
              {
                q: '카트비는 왜 팀 부담과 1인 부담이 다른가요?',
                a: '한국 대부분의 골프장은 4인 1카트(팀당 부과)이지만, 2인 라운드나 일부 회원제는 1인당 카트비를 받기도 합니다. 또한 골프장에 따라 &ldquo;1인 1카트&rdquo; 옵션을 제공하는 곳도 있어, 예약 시 카트 정책을 미리 확인하는 것이 좋습니다.',
              },
              {
                q: '캐디 없이 라운드해도 되나요?',
                a: '퍼블릭과 일부 세미퍼블릭은 노캐디 라운드를 허용하지만, 회원제 골프장은 대부분 캐디 동반이 의무입니다. 노캐디는 캐디피·팁 16~20만원을 절약할 수 있지만, 진행 속도와 룰 적용에 책임을 본인이 져야 합니다.',
              },
              {
                q: '내기 골프 정산은 어떻게 하나요?',
                a: '한 라운드 후 승자·패자별 금액을 정산할 때는 &ldquo;받은 사람 + / 낸 사람 −&rdquo; 합산이 0이 되어야 합니다. 본 계산기의 내기 정산 옵션을 활성화하면 합산이 0인지 자동 검증해드립니다. 4인 라운드에서 흔한 방식은 스킨스(홀별 승자), 라스베가스(짝꿍 합산), 나소(전반·후반·총 3승부) 등입니다.',
              },
              {
                q: '월·연간 골프 비용은 어떻게 잡으면 적당한가요?',
                a: '월 1~2회 라운드 시 한국 평균 기준 월 30~60만원, 연 400~700만원 수준이 일반적입니다. 회원권을 보유하면 그린피가 절감되지만 회원권 자체 가격(수천만~수억)과 연회비를 별도 고려해야 합니다. 본 계산기의 월·연간 슬라이더로 자신의 예상 라운드 횟수에 맞춰 시뮬레이션해보세요.',
              },
              {
                q: '회원권을 사는 게 이득인지 어떻게 판단하나요?',
                a: '본 도구의 [🏆 회원권 손익] 탭 활용. 일반 가이드:<br/>• <strong>연 24회+ 꾸준히</strong> 라운딩 → 회원 권장<br/>• <strong>연 12회 이하</strong> → 비회원 권장<br/>• 연 12~24회 → 회원권 시세·재무 안정성에 따라<br/>⚠️ 리스크: 골프장 부도(회원권 보호 X) / 시세 하락(-30~50%) / 매각 어려움(유동성 ↓) / 본인 라운딩 빈도 변화. 투자 결정 전 회원권 시세(한국증권업협회·증권사) + 골프장 재무 + 변호사·회계사 상담 권장.',
              },
              {
                q: '시즌·요일별 그린피 차이는 얼마나 되나요?',
                a: '한국 평균 변동 (퍼블릭 기준):<br/>• 평일: 8~12만 / 주말: 12~16만 (+50%) / 공휴일: 14~18만 (+70%)<br/>• 봄·가을 (성수기): +10% / 여름: -10% / 겨울: -20~30%<br/>• 추석·설: 큰 폭 ↑ (예약 어려움)<br/>• 평일 새벽(6~7시) 또는 늦은 오후(이브닝): -20~40%<br/>가성비 ★★★ — 평일 새벽·늦은 오후 + 비수기(여름·겨울) + 퍼블릭·세미퍼블릭.',
              },
              {
                q: '캐디피 정산은 카드로 가능한가요?',
                a: '거의 불가능. 한국 골프장 캐디피는 <strong>현금 직접 지급이 표준</strong>이며 카드 결제 X·현금 영수증 X (대부분). 정산 방법:<br/>1. 한 명이 캐디에게 현금 지급<br/>2. 다른 사람들이 카카오페이·이체로 정산<br/>3. 본 도구 결과 → [🍻 더치페이 도구 자동 연결] 활용<br/>⚠️ 일부 골프장 변화 — 카드 결제 가능(소수) / 캐디피 그린피 통합(포함) / 사전 결제(예약 시).',
              },
              {
                q: '라운딩 후 1인당 정산을 카톡방에 어떻게 공유하나요?',
                a: '본 도구의 결과 → [📋 결과 복사하기]로 마크다운 형식 정산 내역 복사 → 카톡방 붙여넣기. 또는 [🍻 카톡방에서 N빵 정산]을 통해 더치페이 도구로 자동 입력 (총액·인원·맥락 자동 전달). 차 안에서 핸드폰으로 5분 안에 정산 완료.',
              },
              {
                q: '동남아 골프 패키지가 정말 한국보다 저렴한가요?',
                a: '단순 비교 — 한국 1인당 ~22만 / 베트남 4박 5일 (4라운딩 + 항공 + 숙박) ~200만 = 1라운딩 환산 ~50만. 단, 항공·숙박·식사·관광 포함이라 단순 비교 X. <strong>가성비</strong>: 베트남(라운딩 7~10만) / 태국(8~12만) / 필리핀(6~10만) / 일본(15~20만, 한국 비슷). <strong>단점</strong>: 항공·시간 비용 / 캐디 관행 다름 / 비자·코로나 변동 / 시즌별 가격 큰 변동. ⚠️ 정확한 패키지 가격은 여행사·예약 사이트 직접 확인.',
              },
            ]

export default function GolfCostPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⛳ 골프 비용 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        그린피·카트·캐디·식사·교통 <strong style={{ color: 'var(--text)' }}>1인당 정산</strong> + 회원권 손익 분기점.
      </p>

      <GolfCostClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 골프장 타입별 평균 비용표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            골프장 타입별 평균 비용 (참고)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            한국 주요 골프장의 공개 요금·운영자 경험을 바탕으로 한 <strong style={{ color: 'var(--text)' }}>일반 평균 추정(2026년 기준)</strong>이며 공식 고시가가 아닙니다. 실제 비용은 시즌·요일·지역·평일/주말에 따라 ±20~30% 변동하니 예약 시 명세를 확인하세요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>골프장 타입</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>그린피</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>카트비(팀)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>캐디피(팀)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: '퍼블릭 주중',  color: '#059669', green: '8~12만',   cart: '8~10만',  caddie: '12~14만' },
                  { type: '퍼블릭 주말',  color: '#0EA5E9', green: '12~16만',  cart: '8~10만',  caddie: '12~14만' },
                  { type: '세미퍼블릭',   color: '#0891B2', green: '14~20만',  cart: '10~12만', caddie: '13~15만' },
                  { type: '회원제(비회원)', color: '#A16207', green: '20~30만',  cart: '10~12만', caddie: '14~16만' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: row.color }}>{row.type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{row.green}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{row.cart}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)' }}>{row.caddie}</td>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            1인당 라운딩 비용 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0EA5E9', marginBottom: '8px' }}>예시 1 — 퍼블릭 주말 4인 (캐디 동반)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 13만(인당) · 카트비 10만(팀) · 캐디피 12만(팀) · 식사 1.5만(인당) · 자차 카풀
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 13만 × 4 = 52만<br/>
                카트비 10만 (팀 부담)<br/>
                캐디피 12만 + 팁 4만 = 16만 (팀 부담)<br/>
                식사 1.5만 × 4 = 6만<br/>
                교통비 8만 (자차 카풀, 팀 분담)<br/>
                <span style={{ color: '#0EA5E9' }}>팀 합계 = 92만</span> → <strong style={{ color: 'var(--accent)' }}>1인당 약 23만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 한국 평균 주말 라운딩의 표준 가격대입니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0891B2', marginBottom: '8px' }}>예시 2 — 세미퍼블릭 주중 4인 (노캐디)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 16만(인당) · 카트비 10만(팀) · 캐디 미사용 · 식사 1.5만(인당) · KTX 이동
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 16만 × 4 = 64만<br/>
                카트비 10만 (팀)<br/>
                캐디피 0 (노캐디)<br/>
                식사 1.5만 × 4 = 6만<br/>
                교통비 4만 × 4 = 16만 (KTX 왕복 인당)<br/>
                <span style={{ color: '#0891B2' }}>팀 합계 = 96만</span> → <strong style={{ color: 'var(--accent)' }}>1인당 약 24만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 노캐디로 캐디피 16만을 아꼈지만, 그린피 차이로 비용이 비슷해질 수 있습니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(161,98,7,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#A16207', marginBottom: '8px' }}>예시 3 — 회원제 비회원 동반 (4인)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 25만(인당) · 카트비 10만(팀) · 캐디피 14만(팀) + 팁 6만 · 식사 2만 · 자차
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 25만 × 4 = 100만<br/>
                카트비 10만<br/>
                캐디피 14만 + 팁 6만 = 20만<br/>
                식사 2만 × 4 = 8만<br/>
                교통비 8만 (자차 카풀)<br/>
                <span style={{ color: '#A16207' }}>팀 합계 = 146만</span> → <strong style={{ color: 'var(--accent)' }}>1인당 약 36.5만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 회원 동반(그린피 할인) 여부에 따라 1인당 10~15만원이 줄어들 수 있습니다.</p>
            </div>

          </div>
        </div>

        {/* ── 3. 캐디피 정산 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🧾 캐디피 정산 완전 가이드
          </h2>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', marginBottom: '10px' }}>1. 캐디피는 보통 &ldquo;팀 부담&rdquo;</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              한국 골프장의 캐디피는 1팀(보통 4인) 기준 12~16만원이 표준입니다. 골프장에 직접 지불하는 것이 아니라 라운드 종료 후
              <strong style={{ color: 'var(--text)' }}> 캐디에게 현금으로 직접 전달</strong>합니다. 카드 결제 불가, 현금 영수증·세금계산서 발행 안 됨이 일반적입니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#059669', marginBottom: '10px' }}>2. N빵 vs 한 명이 선결제</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              4인 1팀이면 캐디피 12만 ÷ 4 = <strong style={{ color: 'var(--text)' }}>1인당 3만원</strong>씩 N빵하는 것이 일반적입니다.
              한 명이 먼저 캐디에게 지불하고 나머지는 그 사람에게 카카오페이·이체로 정산합니다. 더치페이 계산기를 활용하면 식사·카트비까지 한 번에 정리할 수 있습니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.2)', borderRadius: '12px', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#EA580C', marginBottom: '10px' }}>3. 팁(촌지) 관행</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              만족스러운 라운드였다면 캐디피의 <strong style={{ color: 'var(--text)' }}>10~30%(2~5만원)</strong> 정도를 팁으로 추가 지급합니다.
              팁은 의무는 아니지만, 첫 라운드·접대 자리·회원 동반 시에는 관행적으로 챙기는 경우가 많습니다. 노캐디(캐디 미동반) 라운드는 캐디피와 팁 모두 발생하지 않습니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0891B2', marginBottom: '10px' }}>4. 노캐디·드라이빙 캐디·마샬 캐디</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>노캐디</strong>: 캐디 없이 직접 진행. 캐디피 0원, 시간 단축.<br/>
              <strong style={{ color: 'var(--text)' }}>드라이빙 캐디</strong>: 카트만 운전, 클럽 추천 없음. 보통 6~8만원.<br/>
              <strong style={{ color: 'var(--text)' }}>마샬 캐디</strong>: 1명이 2팀 담당. 팀당 캐디피 6~8만원으로 절반 수준.
            </p>
          </div>
        </div>

        {/* ── 4. 회원권 손익분기 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🏆 회원권 손익분기 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            아래는 <strong style={{ color: 'var(--text)' }}>[🏆 회원권 손익] 탭 기본값과 동일한 가정</strong> — 5억 회원권·연회비 200만·매각 잔존 3억·10년 보유, 비회원 1라운드 24만·회원 8만. 탭에서 본인 값으로 바로 시뮬레이션할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>연 라운딩</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>10년 회원 총비용</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>10년 비회원 총비용</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>판단</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '월 1회 (12회)', m: '약 2.30억', n: '약 2,880만', v: '🔴 비회원' },
                  { r: '월 2회 (24회)', m: '약 2.39억', n: '약 5,760만', v: '🔴 비회원' },
                  { r: '월 3회 (36회)', m: '약 2.49억', n: '약 8,640만', v: '🔴 비회원' },
                  { r: '주 1회 (48회)', m: '약 2.58억', n: '약 1.15억', v: '🔴 비회원' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.m}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 600 }}>{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 <strong style={{ color: 'var(--text)' }}>5억급 고가 회원권은 라운드 비용 절감만으로는 회수가 어렵습니다</strong> — 위 가정에선 어떤 빈도에서도 비회원이 더 쌉니다. 고가 회원권은 예약 우선권·코스 접근성·동반자 혜택 등 비(非)금전 가치로 판단하세요. 비용 회수가 목적이면 저가(수천만원)·고빈도 시나리오를 [🏆 회원권 손익] 탭에서 직접 확인하세요. ⚠️ 골프장 부도(보호 X)·시세 하락(-30~50%)·매각 어려움(유동성 ↓)·빈도 변화 리스크 — 변호사·회계사 상담 권장.
          </p>
        </div>

        {/* ── 5. 시즌·요일별 가격 변동 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📅 시즌·요일별 그린피 변동
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국 골프장 그린피는 시즌·요일에 따라 ±50% 변동. 가성비 라운딩 시점 가이드.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { p: '🌸 봄 (3~5월)',   r: '표준 + 10%', d: '성수기 — 예약 어려움' },
              { p: '☀️ 여름 (6~8월)', r: '-10%',       d: '더위·장마 비수기' },
              { p: '🍁 가을 (9~11월)', r: '표준 + 10%', d: '최성수기 — 예약 매우 어려움' },
              { p: '❄️ 겨울 (12~2월)', r: '-20~30%',    d: '비수기 (-5°C 이하 ↑)' },
              { p: '평일',           r: '-30~40%',    d: '가성비 ★★★' },
              { p: '주말',           r: '표준',        d: '가족 라운딩 多' },
              { p: '공휴일',         r: '+10~20%',    d: '예약 가장 어려움' },
              { p: '평일 새벽 (6~7시)', r: '-20~30%', d: '가성비 ★★★' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{m.p}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>{m.r}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 한국 인기 골프장 타입 비교 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🏌️ 한국 인기 골프장 타입 한눈에
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>타입</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>특징</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1인당 (4인 기준)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '🟢 퍼블릭',           f: '저렴·접근성 ↑·예약 쉬움',                     c: '평일 13만 / 주말 18만' },
                  { t: '🔵 세미퍼블릭',       f: '균형·코스 품질 ↑·평일 가성비',                  c: '평일 18만 / 주말 24만' },
                  { t: '🟡 회원제 (회원 동반)', f: '회원 그린피 할인·최고 코스·동반자 1~3명',     c: '평일 12만 / 주말 18만' },
                  { t: '🔴 회원제 (비회원 동반)', f: '가장 비쌈·접근 어려움·예약 회원만',        c: '평일 25만 / 주말 35만' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.f}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 7. 동남아 골프 가이드 (NEW, 참고만) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            ✈️ 동남아 골프 패키지 평균 (참고)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국 라운딩 1인당 ~22만 vs 동남아 패키지 (항공·숙박 포함). 정확한 가격은 여행사·예약 사이트 직접 확인 필수.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { c: '🇻🇳 베트남',    p: '4박 5일 / 4라운드',  cost: '약 150~250만원/인',  green: '라운딩 7~10만원' },
              { c: '🇹🇭 태국',      p: '3박 4일 / 3라운드',  cost: '약 100~180만원/인',  green: '라운딩 8~12만원' },
              { c: '🇵🇭 필리핀',    p: '4박 5일 / 4라운드',  cost: '약 130~220만원/인',  green: '라운딩 6~10만원' },
              { c: '🇯🇵 일본',      p: '2박 3일 / 2라운드',  cost: '약 100~180만원/인',  green: '라운딩 15~20만원' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{m.c}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{m.p}</p>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>{m.cost}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{m.green}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⚠️ 위 수치는 <strong style={{ color: 'var(--text)' }}>2026년 기준 일반 패키지 평균 추정</strong>(공식 시세 아님)이며 시즌·환율·항공편에 따라 ±50% 변동. 캐디 관행·비자·정책도 다름. 본 도구는 평균 안내만 — 특정 여행사·예약 사이트 추천 X. 정확한 패키지는 직접 확인 권장.
          </p>
        </div>

        {/* ── 8. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/dutch',          icon: '🍻', name: '더치페이 계산기',       desc: '식사·카트비 N빵 정산' },
              { href: '/tools/sports/golf-distance',  icon: '🎯', name: '골프 비거리 계산기', desc: '클럽별 비거리·환경 보정' },
              { href: '/tools/sports/golf-handicap',  icon: '⛳', name: '골프 핸디캡 계산기',    desc: 'WHS 핸디캡 지수·코스 핸디캡' },
              { href: '/tools/finance/car-cost',    icon: '🚗', name: '자동차 유지비 계산기',  desc: '골프장 왕복 유류비 시뮬' },
              { href: '/tools/life/unit-price',     icon: '🏷️', name: '단가 비교 계산기',      desc: '연습장 비용 비교' },
              { href: '/tools/date/dday',           icon: '📅', name: 'D-day 계산기',           desc: '다음 라운딩까지' },
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
