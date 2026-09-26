import Link from 'next/link'
import GolfCostClient from './GolfCostClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import {
  calcMembership, fmtKrw, COURSE_PRESETS, TODAY_DEFAULTS, MEMBERSHIP_DEFAULTS,
  type MembershipInput, type PresetCourseType,
} from './golfCostUtils'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/sports/golf-cost',
  title: '골프 비용 계산기 — 그린피·캐디피·1인당·회원권 손익',
  description: '그린피·카트비·캐디피·식사·교통까지 라운딩 총비용을 1인당으로 정산합니다. 골프장 타입별 평균 비용표, 회원권 손익분기 시뮬레이션, 자주 가는 골프장 저장 기능까지.',
  keywords: ['골프라운딩비용계산기', '그린피계산기', '캐디피정산', '골프비용계산기', '라운딩비용1인당', '골프장비용', '골프카트비', '캐디피N빵', '골프 회원권 손익', '회원권 시뮬레이션', '주말 그린피', '퍼블릭 골프장 비용'],
})

/* ── 빌드 시 계산 — 계산기와 같은 식·기본값(golfCostUtils의 COURSE_PRESETS·TODAY_DEFAULTS·MEMBERSHIP_DEFAULTS) ──
   오늘 정산 기본값 기준 1인당 = 그린피 + (카트(팀) + 캐디 + 팁 + 그늘집 + 카풀) ÷ 인원 + 식사(1인당) */
const GREEN = {
  pubWd: COURSE_PRESETS.publicWeekday.green, pubWe: COURSE_PRESETS.publicWeekend.green,
  privWd: COURSE_PRESETS.privateWeekday.green, privWe: COURSE_PRESETS.privateWeekend.green,
}
const P = TODAY_DEFAULTS.players
const teamExtra = (t: PresetCourseType) => {
  const c = COURSE_PRESETS[t]
  return (c.cartMode === 'team' ? c.cart : c.cart * P) + c.caddie + TODAY_DEFAULTS.tipAmount + TODAY_DEFAULTS.shadeAmount + TODAY_DEFAULTS.carpoolTotal
}
const TEAM_EXTRA = teamExtra('publicWeekend') // 모든 프리셋이 카트·캐디가 같아 타입과 무관
const MEAL_EACH = TODAY_DEFAULTS.mealAmount
const perPersonOf = (t: PresetCourseType) => COURSE_PRESETS[t].green + teamExtra(t) / P + MEAL_EACH
const man = (won: number) => `${(Math.round(won / 1_000) / 10).toLocaleString('ko-KR')}만`
const pctCheaper = (a: number, b: number) => Math.round((1 - a / b) * 100)
const PP = {
  pubWd: perPersonOf('publicWeekday'), pubWe: perPersonOf('publicWeekend'),
  privWd: perPersonOf('privateWeekday'), privWe: perPersonOf('privateWeekend'),
}
const PRESET_CART = COURSE_PRESETS.publicWeekend.cart
const PRESET_CADDIE = COURSE_PRESETS.publicWeekend.caddie

// 회원권 손익 — [회원권 손익] 탭 기본값 + 비회원 1회 = 오늘 정산 기본값(퍼블릭 주말)의 1인당 총비용
const MD = MEMBERSHIP_DEFAULTS
const MEM_BASE: Omit<MembershipInput, 'annualRounds'> = {
  membershipPrice: MD.membershipPrice, annualFee: MD.annualFee, holdingYears: MD.holdingYears,
  nonMemberCost: PP.pubWe, memberRoundCost: MD.memberRoundCost, resaleValue: MD.resaleValue,
}
// 계산기(calcMembership) 판정 문구와 같은 표현
const RECO_TEXT = { member: '회원 권장', neutral: '중립', nonmember: '비회원 권장' } as const
const MEM_ROWS = [
  { label: '월 1회 (12회)', n: 12 }, { label: '월 2회 (24회)', n: 24 },
  { label: '월 3회 (36회)', n: 36 }, { label: '주 1회 (48회)', n: 48 },
].map((r) => ({ ...r, res: calcMembership({ ...MEM_BASE, annualRounds: r.n }) }))
// 저가 회원권 예시 — 1억·잔존 8천만·연회비 100만, 회원 1회 16만(회원 그린피 5만 + 부대비용 11만 가정)
const CHEAP = { ...MEM_BASE, membershipPrice: 100_000_000, resaleValue: 80_000_000, annualFee: 1_000_000, memberRoundCost: 160_000 }
const CHEAP_ROWS = [12, 24, 36, 48].map((n) => ({ n, res: calcMembership({ ...CHEAP, annualRounds: n }) }))

const FAQ_LD = [
              {
                q: '그린피에 카트비·캐디피가 포함되어 있나요?',
                a: '일반적으로 포함되지 않습니다. 그린피는 코스 사용료만 의미하며, 카트비(팀당 10만원 안팎)와 캐디피(팀당 14~15만원)는 별도로 지불합니다. 일부 골프장은 &ldquo;그린피 + 카트 패키지&rdquo; 형태로 묶어 판매하기도 하므로, 예약 시 명세를 반드시 확인하세요.',
              },
              {
                q: '카트비는 왜 팀 부담과 1인 부담이 다른가요?',
                a: '한국 대부분의 골프장은 4인 1카트(팀당 부과)이지만, 2인 라운드나 일부 회원제는 1인당 카트비를 받기도 합니다. 또한 골프장에 따라 &ldquo;1인 1카트&rdquo; 옵션을 제공하는 곳도 있어, 예약 시 카트 정책을 미리 확인하는 것이 좋습니다.',
              },
              {
                q: '캐디 없이 라운드해도 되나요?',
                a: '퍼블릭과 일부 세미퍼블릭은 노캐디 라운드를 허용하지만, 회원제 골프장은 대부분 캐디 동반이 의무입니다. 노캐디는 팀당 캐디피 15만원 안팎(팁 별도)을 아낄 수 있지만, 진행 속도와 룰 적용에 책임을 본인이 져야 합니다.',
              },
              {
                q: '내기 골프 정산은 어떻게 하나요?',
                a: '한 라운드 후 승자·패자별 금액을 정산할 때는 &ldquo;받은 사람 + / 낸 사람 −&rdquo; 합산이 0이 되어야 합니다. 본 계산기의 내기 정산 옵션을 활성화하면 합산이 0인지 자동 검증해드립니다. 4인 라운드에서 흔한 방식은 스킨스(홀별 승자), 라스베가스(짝꿍 합산), 나소(전반·후반·총 3승부) 등입니다.',
              },
              {
                q: '월·연간 골프 비용은 어떻게 잡으면 적당한가요?',
                a: `본 계산기 기본값(2025년 대중형 평균 그린피·카트·캐디·식사·카풀)으로 계산하면 1회 1인당 ${man(PP.pubWd)}~${man(PP.pubWe)}원(퍼블릭 주중~주말)이라, 월 1~2회면 월 ${man(PP.pubWd)}~${man(PP.pubWe * 2)}원 정도가 됩니다. 회원권을 보유하면 그린피가 절감되지만 회원권 자체 가격과 연회비, 매각 시 손실을 별도로 고려해야 합니다. 본 계산기의 월·연간 슬라이더로 자신의 예상 라운드 횟수에 맞춰 시뮬레이션해보세요.`,
              },
              {
                q: '회원권을 사는 게 이득인지 어떻게 판단하나요?',
                a: '횟수만으로는 정할 수 없고 <strong>회원권 가격·매각 예상가·연회비·라운드당 절감액</strong>이 함께 들어가야 합니다. [회원권 손익] 탭은 손익분기 연수 = (회원권 가격 − 매각 예상가) ÷ {(비회원 1회 비용 − 회원 1회 비용) × 연 라운딩 횟수 − 연회비}로 계산해, 보유 기간의 절반 안에 회수되면 「회원 권장」, 보유 기간의 1.2배를 넘기거나 회수가 안 되면 「비회원 권장」, 그 사이면 「중립」으로 표시합니다. 같은 주 1회라도 5억 회원권은 회수가 어렵고 1억 안팎 회원권은 회수가 가능할 수 있습니다(아래 회원권 손익분기 가이드 참고).<br/>리스크도 함께 보세요: 골프장 경영 악화·회생 절차 시 입회금 반환 지연·감액 / 시세 하락 / 매각 어려움(유동성) / 본인 라운딩 빈도 변화. 매수 전 회원권 거래소 시세와 골프장 재무 상태를 확인하고, 금액이 크다면 전문가 상담을 권합니다.',
              },
              {
                q: '시즌·요일별 그린피 차이는 얼마나 되나요?',
                a: '한국레저산업연구소 그린피 조사(2025년 5월·10월)에서 18홀 이상 <strong>대중형(퍼블릭) 평균 그린피는 주중 약 17만원, 주말 약 21만원</strong>으로 주말이 25% 안팎 비쌌습니다. 회원제 비회원 평균은 『레저백서 2026』 기준 주중 약 22만원, 주말 약 27만원입니다(2026년 5월).<br/>봄·가을 성수기와 명절 연휴는 더 비싸고 예약도 어려운 반면, 한여름·겨울 비수기나 평일 새벽·늦은 오후(이브닝) 티타임은 할인하는 골프장이 많습니다. 할인 폭은 골프장마다 달라 예약 앱에서 직접 비교하는 편이 정확합니다.',
              },
              {
                q: '캐디피 정산은 카드로 가능한가요?',
                a: '골프장마다 다릅니다. 캐디피는 골프장 요금과 별도로 <strong>라운드가 끝난 뒤 캐디에게 현금으로 주는 방식이 여전히 흔하지만</strong>, 계좌이체·카드 결제나 예약 시 선결제를 받는 골프장도 있습니다. 예약 확인 문자나 골프장 안내에서 결제 방식을 미리 확인하고, 현금이라면 팀 금액을 준비해 가는 것이 편합니다.<br/>현금으로 낼 때 흔한 정산 순서: 1. 한 명이 캐디에게 팀 금액 지급 2. 나머지는 카카오페이·계좌이체로 그 사람에게 송금 3. 계산기 결과의 팀 총액을 더치페이 계산기에 넣어 정산 문구 만들기.',
              },
              {
                q: '라운딩 후 1인당 정산을 카톡방에 어떻게 공유하나요?',
                a: '[오늘 정산] 결과 아래의 [결과 복사하기]를 누르면 1인당 총비용·항목별 1인 부담·팀 총액이 줄 단위 텍스트로 복사되어 카톡방에 그대로 붙여 넣을 수 있습니다. 참여자별 조정이나 내기 정산까지 반영한 개인별 금액이 필요하면 [더치페이 도구 열기]로 이동해 팀 총액과 인원을 직접 넣어 정산 문구를 만드세요.',
              },
              {
                q: '동남아 골프 패키지가 정말 한국보다 저렴한가요?',
                a: '패키지 가격을 라운드 수로 그냥 나누면 항공·숙박·식사가 섞여 비교가 왜곡됩니다. <strong>(패키지 가격 − 골프 없이 같은 여행을 할 때 드는 비용) ÷ 라운드 수</strong>로 「골프 몫」만 떼어 국내 1회 비용과 비교하세요. 예를 들어 4라운드 패키지 180만원에서 같은 일정의 항공·숙박이 100만원이라면 골프 몫은 라운드당 20만원입니다. 현지 캐디피·캐디팁·카트비가 패키지에 포함됐는지, 환율·성수기 요금·이동 시간도 함께 확인하세요. 실제 가격은 여행사·예약 사이트에서 직접 비교해야 합니다.',
              },
            ]

export default function GolfCostPage() {
  return (
    <ToolPage width={760} slug="/tools/sports/golf-cost">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />골프 비용 계산기
      </h1>
      <p className="tp-lead">
        그린피·카트·캐디·식사·교통 <strong style={{ color: 'var(--text)' }}>1인당 정산</strong> + 회원권 손익 분기점.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="한국레저산업연구소 그린피 조사 — 대중형 2025년 5월·10월, 회원제(비회원) 2026년 5월(레저백서 2026) 평균"
        sources={[
          { label: '한국레저산업연구소 — 레저백서', href: 'https://www.kole.kr/book' },
          { label: '체육시설의 설치·이용에 관한 법률(골프장 회원제·비회원제 구분) — 국가법령정보센터', href: 'https://www.law.go.kr/법령/체육시설의설치ㆍ이용에관한법률' },
        ]}
      />

      <GolfCostClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 골프장 타입별 평균 비용표 ── */}
        <div>
          <h2 className="g-h2">
            골프장 타입별 평균 비용 (참고)
          </h2>
          <p className="g-p">
            그린피는 한국레저산업연구소 그린피 조사의 <strong style={{ color: 'var(--text)' }}>18홀 이상 골프장 평균</strong>을 반올림한 값입니다. 대중형은 2025년 5월·10월 조사, 회원제 비회원은 『레저백서 2026』에 실린 2026년 5월 조사 기준입니다. 카트비·캐디피는 같은 연구소가 발표한 팀당 평균(2025년 대중형 카트비 약 9.75만원, 대중형 캐디피는 15만원대가 다수)을 바탕으로 한 근사치입니다. 평균일 뿐이라 지역·시즌·티타임에 따라 차이가 크니 예약 시 명세를 확인하세요.
          </p>
          <div className="tableScroll">
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
                  { type: '퍼블릭(대중형) 주중',  color: 'var(--emerald-600)', green: '약 17만',  cart: '약 10만', caddie: '14~15만' },
                  { type: '퍼블릭(대중형) 주말',  color: 'var(--sky-500)', green: '약 21만',  cart: '약 10만', caddie: '14~15만' },
                  { type: '회원제(비회원) 주중', color: 'var(--cyan-600)', green: '약 22만',  cart: '약 10만', caddie: '14~15만' },
                  { type: '회원제(비회원) 주말', color: 'var(--yellow-700)', green: '약 27만',  cart: '약 10만', caddie: '14~15만' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: row.color }}>{row.type}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>{row.green}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>{row.cart}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>{row.caddie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            카트비·캐디피는 보통 4인 1팀 기준 합산 금액으로, 1인당으로는 ÷4 해서 부담합니다. 회원제 골프장은 회원 동반 여부에 따라 그린피가 크게 달라집니다.
            참고로 체육시설법은 골프장을 회원을 모집하는 <strong>회원제</strong>와 회원 없이 운영하는 <strong>비회원제</strong>로 나누고, 비회원제 중 요금 등 요건을 갖춰 지정받은 곳을 <strong>대중형</strong> 골프장이라 부릅니다. 위 표의 퍼블릭(대중형)은 이 대중형 골프장 조사 평균입니다.
          </p>
        </div>

        {/* ── 2. 1인당 라운딩 비용 예시 시나리오 ── */}
        <div>
          <h2 className="g-h2">
            1인당 라운딩 비용 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sky-500)', marginBottom: '8px' }}>예시 1 — 퍼블릭 주말 4인 (캐디 동반)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 21만(인당) · 카트비 10만(팀) · 캐디피 15만(팀) · 식사 1.5만(인당) · 자차 카풀
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 21만 × 4 = 84만<br/>
                카트비 10만 (팀 부담)<br/>
                캐디피 15만 + 팁 4만 = 19만 (팀 부담)<br/>
                식사 1.5만 × 4 = 6만<br/>
                교통비 8만 (자차 카풀, 팀 분담)<br/>
                <span style={{ color: 'var(--sky-500)' }}>팀 합계 = 127만</span> → <strong style={{ color: 'var(--accent-ink)' }}>1인당 약 32만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 2025년 대중형 평균 주말 그린피를 넣은 경우입니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--cyan-600) 25%, transparent)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cyan-600)', marginBottom: '8px' }}>예시 2 — 퍼블릭 주중 4인 (노캐디)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 17만(인당) · 카트비 10만(팀) · 캐디 미사용 · 식사 1.5만(인당) · KTX 이동
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 17만 × 4 = 68만<br/>
                카트비 10만 (팀)<br/>
                캐디피 0 (노캐디)<br/>
                식사 1.5만 × 4 = 6만<br/>
                교통비 4만 × 4 = 16만 (KTX 왕복 인당)<br/>
                <span style={{ color: 'var(--cyan-600)' }}>팀 합계 = 100만</span> → <strong style={{ color: 'var(--accent-ink)' }}>1인당 약 25만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 노캐디로 팀당 캐디피 15만원(1인 약 3.8만원)을 아꼈지만, KTX 이동비가 붙어 절약분이 상당 부분 상쇄됩니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--yellow-700) 25%, transparent)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--yellow-700)', marginBottom: '8px' }}>예시 3 — 회원제 비회원 동반 (4인)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                그린피 25만(인당) · 카트비 10만(팀) · 캐디피 14만(팀) + 팁 6만 · 식사 2만 · 자차
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-s)', padding: '12px 14px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '8px' }}>
                그린피 25만 × 4 = 100만<br/>
                카트비 10만<br/>
                캐디피 14만 + 팁 6만 = 20만<br/>
                식사 2만 × 4 = 8만<br/>
                교통비 8만 (자차 카풀)<br/>
                <span style={{ color: 'var(--yellow-700)' }}>팀 합계 = 146만</span> → <strong style={{ color: 'var(--accent-ink)' }}>1인당 약 36.5만원</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 회원이 동반해 회원·동반자 그린피 할인을 받으면 그린피 차액만큼 1인 비용이 줄어듭니다.</p>
            </div>

          </div>
        </div>

        {/* ── 3. 캐디피 정산 가이드 ── */}
        <div>
          <h2 className="g-h2">
            캐디피 정산 가이드
          </h2>

          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 'var(--radius-m)', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-ink)', marginBottom: '10px' }}>1. 캐디피는 보통 &ldquo;팀 부담&rdquo;</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              한국 골프장의 캐디피는 1팀(보통 4인) 기준 14~15만원이 일반적입니다(대중형은 15만원대가 다수, 한국레저산업연구소). 그린피처럼 골프장에 내는 요금이 아니라 캐디에게 주는 봉사료 성격이라,
              <strong style={{ color: 'var(--text)' }}> 라운드 종료 후 캐디에게 현금으로 직접 전달</strong>하는 곳이 많습니다. 계좌이체·카드·선결제를 받는 골프장도 있으니 예약 때 결제 방식을 확인하세요.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--emerald-600) 20%, transparent)', borderRadius: 'var(--radius-m)', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--emerald-600)', marginBottom: '10px' }}>2. N빵 vs 한 명이 선결제</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              4인 1팀이면 캐디피 15만 ÷ 4 = <strong style={{ color: 'var(--text)' }}>1인당 3만 7,500원</strong>씩 N빵하는 것이 일반적입니다.
              한 명이 먼저 캐디에게 지불하고 나머지는 그 사람에게 카카오페이·이체로 정산합니다. 3인 라운드라면 같은 15만원을 3명이 나눠 1인 5만원이 되므로, 인원이 줄면 1인 부담이 커진다는 점도 계산기에 인원을 바꿔 확인해 보세요.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--orange-600) 20%, transparent)', borderRadius: 'var(--radius-m)', padding: '18px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--orange-600)', marginBottom: '10px' }}>3. 팁 관행</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              팁은 의무가 아니고 금액 기준도 없습니다. 주는 경우에는 팀이 함께 모아 캐디피와 같이 건네는 방식이 흔합니다. 팁을 줄 계획이라면 계산기의 봉사료(팁) 칸에 팀 금액을 넣어 두면 1인 부담에 자동으로 나눠 반영됩니다.
              노캐디(캐디 미동반) 라운드는 캐디피와 팁 모두 발생하지 않습니다.
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--cyan-600) 20%, transparent)', borderRadius: 'var(--radius-m)', padding: '18px 20px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cyan-600)', marginBottom: '10px' }}>4. 노캐디·드라이빙 캐디·마샬 캐디</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>노캐디</strong>: 캐디 없이 직접 카트를 운전하고 진행. 캐디피 0원.<br/>
              <strong style={{ color: 'var(--text)' }}>드라이빙·마샬 캐디</strong>: 카트 운전과 진행 위주로 돕고 거리 안내·클럽 전달·그린 라인 읽기 같은 서비스는 줄인 형태. 일반 캐디보다 캐디피를 낮게 받는 경우가 많지만 명칭과 요금은 골프장마다 다릅니다.
              계산기에서는 캐디피 칸에 실제 금액을 넣으면 됩니다.
            </p>
          </div>
        </div>

        {/* ── 4. 회원권 손익분기 가이드 ── */}
        <div>
          <h2 className="g-h2">
            회원권 손익분기 가이드
          </h2>
          <p className="g-p">
            [회원권 손익] 탭은 <strong>회원 총비용 = 회원권 가격 + 연회비 × 보유 연수 + 회원 1회 비용 × 연 횟수 × 보유 연수 − 매각 예상가</strong>를 비회원 총비용(비회원 1회 비용 × 연 횟수 × 보유 연수)과 비교합니다.
            아래 표는 탭 기본값 — {fmtKrw(MD.membershipPrice)} 회원권·연회비 {fmtKrw(MD.annualFee)}·매각 잔존 {fmtKrw(MD.resaleValue)}·{MD.holdingYears}년 보유, 비회원 1회 {man(MEM_BASE.nonMemberCost)}(오늘 정산 기본값)·회원 1회 {man(MD.memberRoundCost)} — 을 계산기와 같은 식으로 계산한 결과입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>연 라운딩</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>10년 회원 총비용</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>10년 비회원 총비용</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>손익분기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>판단</th>
                </tr>
              </thead>
              <tbody>
                {MEM_ROWS.map((r, i) => (
                  <tr key={r.n} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>{r.label}</th>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{fmtKrw(r.res.totalMemberCost)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{fmtKrw(r.res.totalNonMemberCost)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{Number.isFinite(r.res.breakevenYears) ? `${r.res.breakevenYears.toFixed(1)}년` : '회수 불가'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 600 }}>{RECO_TEXT[r.res.recommendation]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            5억급 회원권은 주 1회를 쳐도 손익분기가 보유 기간(10년)을 한참 넘깁니다. 같은 식에 1억 회원권(매각 예상 8천만·연회비 100만)과 좀 더 현실적인 회원 1회 비용 16만원(회원 그린피 5만 + 카트·캐디·식사·교통 11만 가정)을 넣으면
            결과가 달라집니다 — {CHEAP_ROWS.map((r, i) => (
              <span key={r.n}>연 {r.n}회는 손익분기 {Number.isFinite(r.res.breakevenYears) ? `${r.res.breakevenYears.toFixed(1)}년` : '없음'}({RECO_TEXT[r.res.recommendation]}){i < CHEAP_ROWS.length - 1 ? ', ' : ''}</span>
            ))}. 회원권 판단의 핵심은 <strong>가격과 매각가의 차이(실제로 잃는 돈)</strong>와 <strong>라운드당 절감액</strong>의 비율입니다.
          </p>
          <Callout tone="warn" title="숫자로 잡히지 않는 위험">
            탭 기본값의 회원 1회 {man(MD.memberRoundCost)}원은 회원 그린피에 가까운 낮은 가정이라 회원권에 유리하게 나옵니다. 카트·캐디·식사를 넣어 본인 조건으로 바꿔 보세요.
            또 골프장 경영이 나빠지거나 회생 절차에 들어가면 입회금 반환이 늦어지거나 줄 수 있고, 시세 하락·매각 지연·본인 라운딩 빈도 변화도 결과를 바꿉니다. 고가 회원권은 예약 우선권·동반자 혜택 같은 비금전 가치까지 따져 판단하고, 금액이 크다면 전문가와 상담하세요.
          </Callout>
        </div>

        {/* ── 5. 시즌·요일별 가격 변동 ── */}
        <div>
          <h2 className="g-h2">
            시즌·요일·시간대별 그린피 차이
          </h2>
          <p className="g-p">
            공개 조사로 확인되는 차이는 주중·주말입니다. 계산기 프리셋 기준으로 대중형은 주중이 주말보다 약 {pctCheaper(GREEN.pubWd, GREEN.pubWe)}%, 회원제 비회원은 약 {pctCheaper(GREEN.privWd, GREEN.privWe)}% 쌉니다.
            계절·시간대 할인은 골프장마다 폭이 달라 평균을 내기 어렵고, 아래처럼 경향만 참고하세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>경향</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>계산기에서</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: '주중 vs 주말', t: `대중형 평균 주중 ${man(GREEN.pubWd)} · 주말 ${man(GREEN.pubWe)}, 회원제 비회원 주중 ${man(GREEN.privWd)} · 주말 ${man(GREEN.privWe)}`, c: '주중·주말 프리셋 선택' },
                  { k: '공휴일·연휴', t: '대부분 주말 요금을 적용하고 예약 경쟁이 가장 심함', c: '주말 프리셋 사용' },
                  { k: '봄·가을 성수기', t: '정상가 유지가 일반적, 특가가 드묾', c: '프리셋 그대로' },
                  { k: '한여름·한겨울', t: '비수기 할인·특가 티타임이 늘어남. 겨울엔 임시 그린·휴장 여부 확인', c: '그린피 직접 입력' },
                  { k: '새벽·오후 늦은 티타임', t: '같은 날에도 시간대별로 차등 요금을 받는 곳이 많음', c: '그린피 직접 입력' },
                ].map((r, i) => (
                  <tr key={r.k} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.k}</th>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 골프장 타입별 1인당 총비용 ── */}
        <div>
          <h2 className="g-h2">
            골프장 타입별 1인당 총비용 한눈에
          </h2>
          <p className="g-p">
            그린피만 보면 차이가 커 보이지만, 1인당 총비용에는 팀 부대비용이 고르게 더해집니다. 계산기 기본값(카트 {man(PRESET_CART)}·캐디 {man(PRESET_CADDIE)}·그늘집 {man(TODAY_DEFAULTS.shadeAmount)}·카풀 {man(TODAY_DEFAULTS.carpoolTotal)}은 팀당, 식사 {man(MEAL_EACH)}은 1인당)으로 {P}인 라운드를 계산하면 1인당 = 그린피 + {man(TEAM_EXTRA / P)} + {man(MEAL_EACH)}입니다.
          </p>
          <div className="tableScroll">
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
                  { t: '퍼블릭(대중형)',       f: '가장 저렴·접근성 좋음·예약 쉬움',                     c: `주중 ${man(PP.pubWd)} / 주말 ${man(PP.pubWe)}` },
                  { t: '회원제 (회원 동반)', f: '회원·동반자 그린피 할인',     c: '회원 그린피에 따라 다름' },
                  { t: '회원제 (비회원)', f: '가장 비쌈·예약 제한이 있는 곳 많음',        c: `주중 ${man(PP.privWd)} / 주말 ${man(PP.privWe)}` },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>{r.t}</th>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.f}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            그린피 차이(주중 퍼블릭 vs 주말 비회원 약 {man(GREEN.privWe - GREEN.pubWd)})는 그대로 남지만 부대비용 {man(TEAM_EXTRA / P + MEAL_EACH)}이 모든 타입에 똑같이 붙어, 1인당 총비용 기준 차이는 비율로 보면 그린피 차이보다 작아집니다.
          </p>
        </div>

        {/* ── 7. 해외 골프 패키지 비교법 ── */}
        <div>
          <h2 className="g-h2">
            해외 골프 패키지와 비교하는 법
          </h2>
          <p className="g-p">
            해외 패키지는 항공·숙박·식사·이동이 한데 묶여 있어 「패키지 가격 ÷ 라운드 수」로는 국내 비용과 비교할 수 없습니다. 골프에 들어간 몫만 떼어 내 비교하세요.
          </p>
          <ul className="g-list">
            <li><strong>라운드당 골프 몫</strong> = (패키지 가격 − 골프 없이 같은 일정으로 여행할 때의 항공·숙박비) ÷ 라운드 수</li>
            <li>예: 4라운드 패키지 180만원, 같은 일정 항공·숙박 100만원 → (180 − 100) ÷ 4 = <strong>라운드당 20만원</strong>. 국내 대중형 주말 1인 {man(PP.pubWe)}(계산기 기본값)과 비교합니다.</li>
            <li>포함 항목 확인: 현지 캐디피·캐디팁·카트비·식사가 패키지에 들어 있는지, 1인 1카트인지</li>
            <li>변동 요인: 환율, 성수기 요금, 항공 스케줄, 현지 이동 시간, 연휴 할증</li>
          </ul>
          <p className="g-note">
            예시의 금액은 계산 방법을 보여 주기 위한 가정입니다. 실제 패키지 가격은 여행사·예약 사이트에서 같은 조건으로 직접 비교하세요.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
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
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
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
    </ToolPage>
  )
}
