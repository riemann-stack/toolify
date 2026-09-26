import Link from 'next/link'
import IntervalTrainingClient from './IntervalTrainingClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/sports/interval-training',
  title: '인터벌 훈련 계산기 — VDOT 페이스·야소 800·LSD·이지런 페이스·존2 심박',
  description: 'VDOT 공식 기반 인터벌 페이스 + 거리별 1바퀴 랩타임·워밍업~쿨다운 세션 자동 정리 + 4~16주 트레이닝 스케줄 + 이지·LSD 탭(이지 페이스·존2 심박·롱런 보급). E·M·T·I·R 5가지 강도 설명.',
  keywords: ['인터벌훈련계산기', '인터벌페이스', '야소800계산기', '400m페이스', '800m페이스', '마라톤풀코스예측', '러닝인터벌', '인터벌스케줄', 'VDOT 계산기', 'I 페이스', 'R 페이스', 'Jack Daniels VDOT', '한국 마라톤 훈련', '풀코스 예측', 'LSD 페이스', '이지런 페이스', '존2 심박', '정크 마일'],
})

// ── 이지·LSD 가이드(구 /tools/sports/lsd) 표·카드 스타일 ──
const easyCard: React.CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '16px 18px',
}
const easyCell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const easyHead: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const EASY_ACCENT = 'var(--emerald-600)'

const FAQ_LD = [
              {
                q: '인터벌 훈련은 얼마나 자주 해야 하나요?',
                a: '일반 러너는 <strong>주 1~2회가 적정</strong>입니다. 주 3회 이상 인터벌은 회복이 부족해 부상·과훈련 위험이 큽니다. 대회 준비 시기 8~12주 전부터 주 1회로 시작해 대회 4주 전 주 2회로 늘리는 것이 일반적입니다. 장거리주(주말)와 인터벌(주중)은 <strong>적어도 2일 이상 간격</strong>을 두세요.',
              },
              {
                q: '야소 800만으로 풀코스 기록을 정확히 알 수 있나요?',
                a: '<strong>야소 800은 스피드 능력 지표이지 정확한 풀코스 예측 공식은 아닙니다.</strong> 실제 풀코스 기록은 주간 누적 거리, 장거리주(30km 이상) 경험, 마라톤 페이스 지속주, 후반 페이스 유지력 등 종합 지구력에 좌우됩니다. 야소 800에서 3시간 30분이 나와도 장거리주가 부족하면 풀코스는 4시간을 넘길 수 있습니다. 참고용으로 활용하되 다른 훈련과 병행하세요.',
              },
              {
                q: '400m 인터벌과 800m 인터벌 중 어느 게 좋은가요?',
                a: '훈련 목적에 따라 다릅니다. <strong>400m</strong>는 스피드·V̇O2 향상(5km 기록 향상에 유리), <strong>800m</strong>는 5km~10km 페이스·야소 800(마라톤 준비), <strong>1km</strong>는 10km 기록 향상·역치 훈련, <strong>1.6km</strong>는 역치 훈련·하프 준비에 적합합니다. 한 가지만 고집하지 말고 주기별로 다양하게 섞는 것이 좋습니다.',
              },
              {
                q: '인터벌 훈련 후 회복은 얼마나 해야 하나요?',
                a: '인터벌 강도가 높을수록 회복 시간을 더 길게 잡아야 합니다. <strong>R 페이스</strong>(스피드)는 운동 시간의 1.5~2배, <strong>I 페이스</strong>(5km)는 운동 시간과 동일, <strong>T 페이스</strong>(역치)는 운동 시간의 25~50%가 적정입니다. 예를 들어 800m를 3분 30초에 뛰었다면 R 페이스라면 회복 5~7분, I 페이스라면 회복 3분 30초~5분이 적정합니다. <strong>회복 중에는 완전 정지보다 가벼운 조깅이 효과적</strong>입니다.',
              },
              {
                q: '트랙이 없으면 인터벌 훈련이 불가능한가요?',
                a: '<strong>가능합니다.</strong> ① GPS 시계로 거리 기반 인터벌(400m·800m·1km 자동 측정), ② 시간 기반 인터벌(&ldquo;3분 빠르게 + 2분 느리게 × 8회&rdquo;), ③ 한적한 도로·공원 직선 구간 활용, ④ 운동장·공원 둘레 활용(둘레 길이 측정 후 반복) 등 다양한 방법이 있습니다. 트랙이 없어도 충분히 효과적이며, 도로·언덕에서의 변화가 실제 대회 코스 적응에 도움이 됩니다.',
              },
              {
                q: '16주 훈련 스케줄에서 매주 페이스가 다른 이유는?',
                a: '점진적 강도 증가 + 회복주 + 피크 + 테이퍼 구조입니다. 16주 기준으로는 다음과 같습니다.<br/>• <strong>1~2주</strong>: 적응 (낮은 강도로 폼 익히기)<br/>• <strong>3~11주</strong>: 발전 (메뉴·거리를 단계적으로 늘림)<br/>• <strong>13~14주</strong>: 피크 (최고 강도)<br/>• <strong>15~16주</strong>: 테이퍼 (강도를 낮추고 대회 준비)<br/>그 사이 4·8·12주차는 강도를 낮춘 회복주입니다. 기간을 줄여도 적응 2주와 마지막 2주 테이퍼는 유지되고, 발전·피크 구간이 짧아집니다. 본 도구의 [훈련 스케줄] 표는 각 주의 페이스·회복·총 거리를 표시합니다. 매주 같은 강도는 정체·부상 위험.',
              },
              {
                q: '1바퀴(400m) 페이스가 왜 중요한가요?',
                a: '인터벌 효과는 <strong>페이스 일정성</strong>에 좌우됩니다. 첫 바퀴 너무 빠르면 후반 무너지고, 마지막 바퀴 빨라지면 초반 너무 느렸다는 의미. 일정 페이스 = V̇O2 max 자극 정확. 본 도구는 800m·1km·1.6km 인터벌의 1바퀴(400m) 환산을 자동 표시합니다 (예: 800m 3:29 = 1바퀴 1:44.5). GPS 시계 또는 트랙 통과 기록 활용 권장.',
              },
              {
                q: 'VDOT 43.4가 무슨 의미인가요?',
                a: 'Jack Daniels의 V̇O2 max 추정 지표입니다.<br/>• VDOT 30: 5km 약 31분 수준<br/>• VDOT 40: 5km 약 24분<br/>• VDOT 50: 5km 약 20분<br/>• VDOT 60: 5km 약 17분<br/>• VDOT 70: 5km 약 15분(엘리트)<br/>본인 5km·10km·하프 기록으로 VDOT 자동 계산 (숫자 ↑ = 능력 ↑). 본 도구는 VDOT 기반으로 5가지 강도(E·M·T·I·R) 페이스를 산출합니다.',
              },
              {
                q: '인터벌 훈련 중 부상이 의심되면 어떻게 해야 하나요?',
                a: '<strong>즉시 중단</strong> + 다음 단계 진행:<br/>1. 운동 즉시 중단<br/>2. RICE (Rest·Ice·Compression·Elevation)<br/>3. 24시간 관찰<br/>4. 통증 지속 → 정형외과·재활의학과<br/><strong>응급 신호 (즉시 119)</strong>: 가슴 통증·심한 호흡곤란 / 어지러움·실신 / 다리 마비.<br/>⚠️ &ldquo;통증을 무시하고 계속 훈련&rdquo; 절대 X. 부상 회복 후 점진적 복귀. 본 도구의 [부상 이력] 체크 시 강도가 자동으로 -10% 보정됩니다.',
              },
              {
                q: '한국 인기 대회 시즌에 맞춰 훈련하려면?',
                a: '본 도구의 [훈련 스케줄] 탭 상단에 <strong>한국 인기 대회 빠른 선택</strong>이 있습니다. 대회 클릭 시 D-day와 종목이 자동 입력됩니다.<br/>• <strong>봄 대회</strong> (2~4월): 대구마라톤(2월) / 서울마라톤(동아마라톤, 3월) / 서울하프(4월) → 대회에 따라 11월~1월 사이에 16주 시작<br/>• <strong>가을 대회</strong> (10~11월): 춘천(10월) / JTBC(11월) → 7월 초부터 16주 시작<br/>본 도구의 16주 스케줄은 마지막 2주(15~16주차)를 테이퍼로 잡습니다. 개최일은 해마다 달라지니 공식 공지를 확인하세요.',
              },
              // ── 이지·LSD 탭 (구 /tools/sports/lsd FAQ에서 겹치지 않는 2개 — '이지런만 하면 빨라지나요?'는 E-1 본문 80/20 문단에 흡수, 총 12개 상한) ──
              {
                q: 'LSD는 얼마나 자주, 얼마나 길게 해야 하나요?',
                a: '주간 거리의 상당 부분을 이지 강도로 채우되, 가장 긴 롱런은 주 1회가 일반적입니다. 거리는 무리하지 말고 주당 10% 이내로 늘리세요. 초보자는 시간(예: 60~90분)으로 잡는 편이 안전합니다.',
              },
              {
                q: '오르막에서는 페이스를 맞춰야 하나요?',
                a: '아니요. LSD는 페이스보다 ‘강도(편안함·심박)’가 기준입니다. 오르막에서는 페이스가 느려지고 심박이 올라가는 게 정상이니, 심박/호흡을 기준으로 강도를 일정하게 유지하세요.',
              },
            ]

export default function IntervalTrainingPage() {
  return (
    <ToolPage width={760} slug="/tools/sports/interval-training">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />인터벌 훈련 계산기
      </h1>
      <p className="tp-lead">
        VDOT 공식 기반 인터벌 페이스 + <strong style={{ color: 'var(--text)' }}>4~16주 풀 트레이닝 스케줄</strong>.
      </p>

      <IntervalTrainingClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. Jack Daniels 5가지 강도 (E·M·T·I·R) 자세히 ── */}
        <div>
          <h2 className="g-h2">
            러닝 훈련의 5가지 강도 — E · M · T · I · R 완벽 정리
          </h2>
          <p className="g-p">
            미국 러닝 코치 <strong style={{ color: 'var(--text)' }}>잭 다니엘스(Jack Daniels)</strong>는 모든 러닝 훈련을 <strong style={{ color: 'var(--text)' }}>딱 5가지 강도</strong>로 나눴습니다.
            느린 것부터 빠른 순서로 <strong style={{ color: 'var(--text)' }}>E → M → T → I → R</strong>이며, 강도마다 키워지는 능력이 다릅니다.
            아래 카드는 강도마다 키우는 능력과 체감을 정리한 것이고, 본인 기록을 입력하면 위 계산기가 VDOT 공식으로 <strong style={{ color: 'var(--text)' }}>강도별 페이스</strong>를 계산해 줍니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                i: 'E', n: 'Easy · 편하게', c: 'var(--emerald-600)',
                what: '심폐 기초·모세혈관·미토콘드리아 발달 (러닝의 토대)',
                feel: '옆 사람과 대화가 편하게 되는 속도. 코로 숨쉬기 가능',
                pace: '대회 마라톤 페이스보다 1~1.5분/km 느리게',
                use: '회복주, 워밍업·쿨다운, 장거리주(LSD)의 기본 페이스',
              },
              {
                i: 'M', n: 'Marathon · 마라톤', c: 'var(--purple-600)',
                what: '목표 풀코스 페이스에 몸을 적응시키기 (페이스 감각·연료 효율)',
                feel: '대화는 짧게 가능. "조금 힘들지만 오래 갈 수 있는" 정도',
                pace: '본인 풀코스 목표 페이스 그대로',
                use: '풀코스 준비기의 페이스 지속주(10~20km), 대회 리허설',
              },
              {
                i: 'T', n: 'Threshold · 역치(템포)', c: 'var(--cyan-600)',
                what: '젖산 역치 끌어올리기 → 더 빠른 속도를 더 오래 유지',
                feel: '"편하게 힘든(comfortably hard)" 강도. 한두 단어만 겨우 말함',
                pace: '약 1시간 전력으로 달릴 수 있는 속도(하프 페이스 부근)',
                use: '20~40분 템포런, 1~2km 반복(크루즈 인터벌)',
              },
              {
                i: 'I', n: 'Interval · 인터벌', c: 'var(--sky-500)',
                what: '최대산소섭취량(V̇O₂max) 자극 → 심폐 능력의 천장을 올림',
                feel: '말하기 거의 불가능. 3~5분 이상 버티기 힘든 강도',
                pace: '약 5km 레이스 페이스',
                use: '400m~1.2km 반복 + 동일 시간 회복 (이 도구의 핵심 메뉴)',
              },
              {
                i: 'R', n: 'Repetition · 반복주', c: 'var(--red-600)',
                what: '스피드·러닝 이코노미(달리기 효율)·무산소 파워',
                feel: '거의 전력 질주. 폼이 무너지지 않는 선까지만',
                pace: '약 1마일(1.6km) 레이스 페이스 — 가장 빠름',
                use: '200~400m 짧은 반복 + 충분한 완전 회복(2~3배)',
              },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `4px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: g.c, fontWeight: 800, fontFamily: 'var(--font-sans)' }}>{g.i}</span>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, marginLeft: 8 }}>{g.n}</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', gap: '4px 10px', fontSize: 13, lineHeight: 1.65 }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>키우는 것</span><span style={{ color: 'var(--text)' }}>{g.what}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>체감</span><span style={{ color: 'var(--text)' }}>{g.feel}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>페이스</span><span style={{ color: 'var(--text)' }}>{g.pace}</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 600 }}>대표 훈련</span><span style={{ color: 'var(--text)' }}>{g.use}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'color-mix(in srgb, var(--accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '13px 16px', fontSize: 13, color: 'var(--text)', marginTop: 14, lineHeight: 1.85 }}>
            💡 <strong style={{ color: 'var(--accent)' }}>한 줄 요약:</strong> 느릴수록(E·M) 오래 달리는 <strong>지구력</strong>을, 빠를수록(I·R) 짧고 강하게 <strong>심폐·스피드</strong>를 키웁니다.
            인터벌 훈련에서 가장 많이 쓰는 강도는 <strong style={{ color: 'var(--sky-500)' }}>I(인터벌)</strong>와 <strong style={{ color: 'var(--red-600)' }}>R(반복주)</strong>이며, 둘 다 반드시 충분한 회복 조깅과 함께 해야 효과가 납니다.
          </div>
          <p className="g-note">
            E(이지) 강도는 위 계산기의 <strong>[이지·LSD]</strong> 탭에서 본인 이지 페이스 범위·존2 심박·롱런 보급량을 따로 계산할 수 있고, 아래 <a href="#easy-deep-dive" style={{ color: 'var(--accent-ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>E 강도 깊이 보기</a>에서 자세히 다룹니다.
          </p>
        </div>

        {/* ── 2. 거리별 추천 메뉴 ── */}
        <div>
          <h2 className="g-h2">
            거리별 인터벌 추천 메뉴
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['거리', '용도', '권장 횟수', '회복'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '400m',         u: '스피드·V̇O2',      r: '6~10회', c: '200m 조깅' },
                  { d: '800m',         u: '5km·야소 800',    r: '5~10회', c: '400m 조깅' },
                  { d: '1km',          u: '5km·10km 페이스', r: '4~6회',  c: '400m 조깅' },
                  { d: '1.6km (1마일)',u: '역치·V̇O2',         r: '3~5회',  c: '600m 조깅' },
                  { d: '2km',          u: '역치·하프',       r: '3~4회',  c: '600m 조깅' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--yellow-700)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>💡 좁은 화면에서는 표를 좌우로 스크롤할 수 있습니다.</p>
        </div>

        {/* ── 3. 야소 800 가이드 ── */}
        <div>
          <h2 className="g-h2">
            야소 800 완전 가이드 (한국 러너에게 인기)
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>800m × 10회 평균</span> = <strong style={{ color: 'var(--yellow-700)' }}>X분 Y초</strong></div>
            <div><span style={{ color: 'var(--muted)' }}>예상 풀코스</span>     = <strong style={{ color: 'var(--yellow-700)' }}>X시간 Y분</strong></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 미국 러닝 코치 Bart Yasso가 제시한 풀코스 예측 훈련법</div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { i: '3:00/800m', m: '3:00:00 풀코스', c: 'var(--emerald-600)' },
              { i: '3:30/800m', m: '3:30:00 풀코스', c: 'var(--yellow-700)' },
              { i: '4:00/800m', m: '4:00:00 풀코스', c: 'var(--orange-600)' },
              { i: '4:30/800m', m: '4:30:00 풀코스', c: 'var(--red-600)' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${r.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: r.c, fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r.i}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>→ {r.m}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(234,88,12,0.06)',
            border: '2px solid rgba(234,88,12,0.3)',
            borderRadius: 'var(--radius-m)',
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            ⚠️ <strong style={{ color: 'var(--orange-600)' }}>주의:</strong> 정확한 공식이 아닌 참고 지표입니다.
            야소 800은 <strong>스피드만 측정</strong>하므로 지구력 평가는 별도 필요합니다.
            실제 풀코스는 장거리주·페이스 유지력에 따라 상당한 차이가 발생합니다.
          </div>
        </div>

        {/* ── 4. VDOT 표 ── */}
        <div>
          <h2 className="g-h2">
            VDOT 표 — 5km 기록별 인터벌 페이스
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['5km 기록', 'VDOT', 'I 페이스 (1km)', 'R 페이스 (400m)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '25:00', v: 38.3, i: '4:53', r: '1:49' },
                  { t: '22:00', v: 44.5, i: '4:19', r: '1:36' },
                  { t: '20:00', v: 49.8, i: '3:57', r: '1:28' },
                  { t: '18:00', v: 56.3, i: '3:34', r: '1:20' },
                  { t: '17:00', v: 60.2, i: '3:23', r: '1:16' },
                  { t: '16:00', v: 64.6, i: '3:12', r: '1:11' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--yellow-700)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.v}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.i}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 좁은 화면에서는 표를 좌우로 스크롤할 수 있습니다. ※ 페이스는 잭 다니엘스(Jack Daniels)의 VDOT 공식(I = VO₂max의 97%, R = 106%)으로 계산했고 위 계산기와 같은 값입니다. 계산기는 VDOT 20~85 범위에서 페이스를 보여 주며, 러너 컨디션에 따라 실제 최적 페이스는 다소 차이날 수 있습니다.
          </p>
        </div>

        {/* ── 5. 회복 가이드 ── */}
        <div>
          <h2 className="g-h2">
            회복 시간·거리 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: 'R 페이스 (스피드)', c: 'var(--red-600)', time: '운동 시간의 1.5~2배', dist: '운동 거리의 1배' },
              { t: 'I 페이스 (5km)',    c: 'var(--accent)', time: '운동 시간과 동일', dist: '운동 거리의 50%' },
              { t: 'T 페이스 (역치)',   c: 'var(--cyan-600)', time: '운동 시간의 25~50%', dist: '운동 거리의 25%' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>회복 시간: <strong style={{ color: 'var(--text)' }}>{g.time}</strong></p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>회복 거리: <strong style={{ color: 'var(--text)' }}>{g.dist}</strong></p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(255,217,62,0.05)',
            border: '1px solid rgba(255,217,62,0.3)',
            borderRadius: 'var(--radius-m)',
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            💡 회복 중에는 <strong style={{ color: 'var(--yellow-700)' }}>완전 정지보다 가벼운 조깅이 효과적</strong>입니다 (젖산 제거 가속화).
          </div>
        </div>

        {/* ── 6. 트랙 환산 ── */}
        <div>
          <h2 className="g-h2">
            트랙 거리 환산 (표준 트랙 1바퀴 = 400m)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
            {[
              { d: '200m',  l: '0.5바퀴' },
              { d: '400m',  l: '1바퀴' },
              { d: '800m',  l: '2바퀴' },
              { d: '1000m', l: '2.5바퀴' },
              { d: '1200m', l: '3바퀴' },
              { d: '1600m', l: '4바퀴 (1마일)' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, color: 'var(--yellow-700)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{r.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 주의사항 ── */}
        <div>
          <h2 className="g-h2">
            인터벌 훈련 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '📅 훈련 빈도', c: 'var(--yellow-700)', items: ['초보: 주 1회', '중급: 주 1~2회', '고급: 주 2~3회'] },
              { t: '🚫 금기 사항',  c: 'var(--red-600)', items: ['주간 거리 15% 이상 고강도 X', '전날 장거리주·고강도 후 X', '통증·이상 시 즉시 중단', '부상 회복 직후 점진적 ↑'] },
              { t: '✅ 준비 운동',  c: 'var(--emerald-600)', items: ['워밍업 1.5~3km 가벼운 조깅', '동적 스트레칭 5~10분', '인터벌 후 쿨다운 1.5~3km'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {g.items.map((it, j) => (<li key={j}>{it}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 16주 풀 스케줄 가이드 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            📅 16주 풀 인터벌 스케줄 구조
          </h2>
          <p className="g-p">
            본 도구의 [훈련 스케줄] 탭은 4~16주 자동 생성. 점진적 강도 증가 + 회복주 + 피크 + 테이퍼 4단계 구조 — 매주 같은 강도는 정체·부상 위험.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { p: '1~2주', n: '🟢 적응', d: '인터벌 폼 익히기. 짧은 거리·적은 횟수로 시작.' },
              { p: '3~11주', n: '🟡 발전', d: '페이스 ↑ + 거리 ↑. 야소 800 등 메뉴 다양화.' },
              { p: '13~14주', n: '🔴 피크', d: '최고 강도 + 대회 시뮬. 주 2회 가능.' },
              { p: '15~16주', n: '🟠 테이퍼', d: '강도 ↓ + 회복. 대회 직전 2주 집중 회복.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>{m.p}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>{m.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 4주마다(4·8·12주차) 회복주 자동 삽입 (강도 ↓·회복). 기간을 줄이면 적응 2주·테이퍼 2주는 그대로 두고 발전·피크 구간이 짧아집니다. 매 주차 페이스·회복·총 거리는 [훈련 스케줄] 탭의 6컬럼 표 자동 생성.
          </p>
        </div>

        {/* ── 9. 1바퀴(400m) 페이스 가이드 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            🏟️ 1바퀴(400m) 페이스 일정성 — 인터벌 효과의 핵심
          </h2>
          <p className="g-p">
            본 도구의 거리별 랩타임 표에 <strong style={{ color: 'var(--text)' }}>1바퀴(400m) 환산 컬럼</strong>이 추가되었습니다. 인터벌 효과는 페이스 일정성에 좌우됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>총 랩타임</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1바퀴(400m)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>트랙</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '400m',   t: '1:45', l: '1:45',    track: '1바퀴' },
                  { d: '800m',   t: '3:29', l: '1:44.5',  track: '2바퀴' },
                  { d: '1km',    t: '4:21', l: '1:44.4',  track: '2.5바퀴' },
                  { d: '1.2km',  t: '5:13', l: '1:44.3',  track: '3바퀴' },
                  { d: '1.6km',  t: '6:57', l: '1:44.3',  track: '4바퀴 (1마일)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--yellow-700)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--cyan-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r.track}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 첫 바퀴 너무 빠르면 후반 무너짐 / 마지막 바퀴 빨라지면 초반 너무 느렸음. 일정 페이스 = V̇O2 max 자극 정확. GPS 시계 또는 트랙 통과 기록 활용.
          </p>
        </div>

        {/* ── 10. 목적별 거리 선택 가이드 ── */}
        <div>
          <h2 className="g-h2">
            🎯 목적별 인터벌 거리 선택
          </h2>
          <p className="g-p">
            위 [추천 인터벌 세션]에서 거리와 횟수를 고르면 워밍업~쿨다운까지 한 세션이 정리됩니다. 어떤 거리를 고를지는 <strong style={{ color: 'var(--text)' }}>훈련 목적</strong>에 따라 달라지며, 한 가지 거리만 고집하지 말고 주기별로 다양화하는 것이 좋습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>거리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>주된 효과</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>적합 시기</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '200~400m', e: '🔴 R 스피드 (최대 속도·러닝 이코노미)', t: '시즌 초반·스피드 강화 주기' },
                  { d: '600~800m', e: '🟡 I·R 혼합 (5km·야소 800)',           t: '5km 대회·풀코스 야소 800' },
                  { d: '1km',      e: '🟡 I 페이스 (V̇O2 max)',                 t: '5km·10km 기록 향상' },
                  { d: '1.2~1.6km', e: '🟡 I·T 혼합 (V̇O2 + 역치)',            t: '10km·하프 준비' },
                  { d: '2~3km',    e: '🔵 T 페이스 (역치)',                    t: '하프·풀코스 지구력' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--yellow-700)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 11. 한국 인기 대회 시즌 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            🏃 한국 인기 마라톤 대회 시즌
          </h2>
          <p className="g-p">
            본 도구의 [훈련 스케줄] 탭에서 <strong style={{ color: 'var(--text)' }}>대회 빠른 선택</strong>으로 D-day 자동 입력. 봄(2~4월)과 가을(10~11월)에 큰 대회가 몰립니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { s: '🌸 봄 시즌 (2~4월)', races: '대구마라톤(2월)·서울마라톤(동아마라톤, 3월)·서울하프(4월)', plan: '대회에 따라 11월~1월 사이 16주 시작' },
              { s: '🍁 가을 시즌 (10~11월)', races: '춘천(10월)·JTBC(11월)', plan: '7월 초부터 16주 시작' },
              { s: '🏃 단기 (10km·하프)', races: '연중 자주 개최', plan: '8~12주 단축 스케줄 가능' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{m.s}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '6px', lineHeight: 1.6 }}>{m.races}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>📅 준비: {m.plan}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 본 도구의 16주 스케줄은 마지막 2주(15~16주차)를 테이퍼로 잡습니다. 봄 대회는 11월~1월, 가을 대회는 7월 초에 시작하면 16주를 채울 수 있습니다. 개최일은 해마다 달라지니 공식 공지를 확인하세요.
          </p>
        </div>

        {/* ══════════ E 강도 깊이 보기 — [이지·LSD] 탭 가이드 (구 /tools/sports/lsd) ══════════ */}

        {/* ── E-1. LSD란 + 회색지대 ── */}
        <div>
          <h2 className="g-h2" id="easy-deep-dive">
            E 강도 깊이 보기 — LSD(롱슬로디스턴스)와 회색지대
          </h2>
          <p className="g-p">
            앞의 5가지 강도 중 <strong>E(이지)</strong>로 긴 거리를 달리는 훈련이 LSD입니다. LSD는 <strong>긴 거리를 천천히, 편안하게</strong> 달리는 저강도 유산소 훈련입니다. 인터벌·템포 같은 고강도 훈련이 &lsquo;엔진 출력&rsquo;을 키운다면, LSD는 그 출력을 오래 유지하게 하는 <strong>유산소 엔진의 크기 자체</strong>를 키웁니다.
          </p>
          <p className="g-p">
            천천히 오래 달리면 미토콘드리아 수·모세혈관 밀도가 늘고 지방을 연료로 쓰는 능력이 좋아집니다. 그래서 엘리트 러너일수록 전체 훈련의 <strong>약 80%를 쉬운 강도</strong>로 채웁니다(80/20 법칙).
            다만 이지런만으로는 토대는 커져도 속도 자극이 없어 정체될 수 있으니, 나머지 20%는 인터벌·템포로 채우세요.
          </p>
          <div style={{ ...easyCard, borderLeft: '3px solid var(--yellow-700)', marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>🚦 이지런을 너무 빨리 뛰면 안 되는 이유 — 회색지대(Gray Zone) = 정크 마일</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              마라톤 페이스보다 살짝 느린 &ldquo;힘들진 않은데 회복도 안 되는&rdquo; 애매한 속도입니다. 대부분의 아마추어가 매일 여기서 달립니다 — 충분히 느리지 않아 유산소 적응은 약하고, 충분히 빠르지도 않아 자극도 부족하며, 피로만 누적돼 부상·정체로 이어집니다.
            </p>
          </div>
          <p className="g-p">
            쉬운 날은 <strong>의식적으로 더 느리게</strong> 달려야 합니다. &ldquo;이렇게 천천히 뛰어도 되나?&rdquo; 싶을 만큼이 정답인 경우가 많습니다. 빠른 자극은 주 1~2회 인터벌·템포에서만 주세요.
          </p>
        </div>

        {/* ── E-2. 적정 이지 페이스 3가지 기준 ── */}
        <div>
          <h2 className="g-h2">
            적정 이지 페이스 잡는 3가지 기준
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {[
              { t: '① 대화 테스트', d: '옆 사람과 문장을 끊김 없이 말할 수 있는 속도. 말이 끊기면 너무 빠른 것. 장비 없이 가장 확실한 기준.' },
              { t: '② 존2 심박', d: '최대심박의 약 60~70%. 코로만 호흡해도 버틸 정도. 심박계가 있다면 위 계산기의 [이지·LSD] 탭으로 BPM 구간 확인.' },
              { t: '③ 페이스 기준', d: '10K 페이스보다 약 20~30% 느리게(대개 마라톤 페이스보다 30~75초/km 느림). [이지·LSD] 탭이 자동 산출.' },
            ].map((x, i) => (
              <div key={i} style={{ ...easyCard }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: EASY_ACCENT, marginBottom: 6 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>{x.d}</p>
              </div>
            ))}
          </div>
          <p className="g-note">
            ※ [인터벌 페이스] 탭 강도별 페이스 표의 E 페이스는 Daniels 공식(VO₂max의 59~74%)이라 폭이 넓습니다. [이지·LSD] 탭의 범위(10K 환산 페이스의 1.2~1.3배)는 대부분의 기록에서 그 E 범위 안쪽에 들어가는 좁은 구간이라, 두 숫자가 조금 달라도 같은 강도를 가리킵니다. 앞 E 카드의 &lsquo;마라톤 페이스보다 1~1.5분/km 느리게&rsquo;는 E 범위의 느린 쪽에 가까운 어림값입니다.
          </p>
          <p className="g-note">
            ※ 이지 페이스에서도 케이던스(분당 보수)는 유지하고 보폭만 줄이면 폼은 무너지지 않습니다. 오히려 느린 러닝에서 효율적인 착지·자세를 익히기 좋습니다.
          </p>
        </div>

        {/* ── E-3. 존2 판정 기준 3종 비교 ── */}
        <div>
          <h2 className="g-h2">
            존2 판정 기준 3종 비교 — 같은 &lsquo;존2&rsquo;라도 숫자가 다르다
          </h2>
          <p className="g-p">
            존2를 정하는 방식은 크게 셋 — <strong>최대심박 백분율(%HRmax)</strong>, <strong>카보넨(심박예비, HRR)</strong>, <strong>젖산역치 심박(LTHR)</strong> 기준입니다. 같은 사람이라도 어느 방식을 쓰느냐에 따라 BPM 경계가 크게 달라집니다. 40세·안정시 심박 60인 러너(Tanaka 최대심박 180)를 예로 들면:
          </p>
          <div style={{ ...easyCard, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr>
                    <th scope="col" style={easyHead}>기준</th>
                    <th scope="col" style={easyHead}>존2 정의</th>
                    <th scope="col" style={easyHead}>예시 BPM</th>
                    <th scope="col" style={easyHead}>특징</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={easyCell}><strong>%HRmax</strong></td>
                    <td style={easyCell}>최대심박 × 60~70%</td>
                    <td style={easyCell}>108~126</td>
                    <td style={easyCell}>가장 단순하지만 안정시 심박을 무시 — 훈련된 러너에겐 지나치게 낮게 나오는 경향</td>
                  </tr>
                  <tr>
                    <td style={easyCell}><strong>카보넨(HRR)</strong></td>
                    <td style={easyCell}>안정시 + (최대 − 안정시) × 60~70%</td>
                    <td style={easyCell}>132~144</td>
                    <td style={easyCell}>안정시 심박을 반영해 개인화. [이지·LSD] 탭이 안정시 심박 입력 시 쓰는 방식</td>
                  </tr>
                  <tr>
                    <td style={easyCell}><strong>LTHR</strong></td>
                    <td style={easyCell}>젖산역치 심박 × 85~89%<br />(Friel 러닝 기준)</td>
                    <td style={easyCell}>140~147<br />(LTHR 165 가정)</td>
                    <td style={easyCell}>30분 단독 타임트라이얼의 마지막 20분 평균 심박으로 실측 — 나이 공식 오차가 없음</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            하한만 봐도 <strong>108 vs 132 vs 140 — 30bpm 이상</strong> 벌어집니다. 108bpm은 훈련된 러너에겐 빠르게 걷기 수준이라, %HRmax 단독 기준은 강도를 저평가하기 쉽습니다. 안정시 심박을 알고 있다면 반드시 입력해 카보넨 값을 쓰고, 스포츠워치의 &lsquo;존2&rsquo; 알림이 셋 중 어느 방식으로 계산된 것인지도 확인하세요. 세 방식의 숫자가 달라도 목표 강도는 같습니다 — 헷갈리면 대화 테스트로 검증하면 됩니다.
          </p>
        </div>

        {/* ── E-4. 롱런 영양·수분 ── */}
        <div>
          <h2 className="g-h2">
            롱런 영양·수분 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: '수분', d: '15~20분마다 한두 모금. 한 번에 많이 마시기보다 자주 나눠 마십니다. 더운 날엔 전해질(나트륨)도 함께.' },
              { t: '탄수 보급', d: '60~75분 미만이면 물만으로 충분. 그 이상이면 30~45분마다 젤 1개(약 25g) 안팎으로 나눠 시간당 탄수 30~60g을 채우세요 — 배고픔을 느끼기 전에.' },
              { t: 'time on feet', d: '마라톤 준비는 거리보다 ‘발 위에서 보낸 시간’이 핵심. 같은 1시간이라도 천천히 오래가 적응에 더 유리합니다.' },
              { t: '페이싱', d: '처음 5~10분은 더 천천히 워밍업. 컨디션이 좋으면 마지막 구간만 살짝 올리는 네거티브 스플릿을 연습하세요.' },
            ].map((x, i) => (
              <div key={i} style={{ ...easyCard, display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: EASY_ACCENT, minWidth: 78, flexShrink: 0 }}>{x.t}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{x.d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── E-5. 풀코스 16주 롱런 진행 예시 ── */}
        <div>
          <h2 className="g-h2">
            풀코스 16주 롱런 진행 예시
          </h2>
          <p className="g-p">
            마라톤 준비의 뼈대는 <strong>주 1회 롱런의 점진적 확장</strong>입니다. 아래는 최장 12~14km를 이미 소화할 수 있는 러너가 16주에 걸쳐 롱런을 32km까지 끌어올리는 예시입니다. &lsquo;3주 늘리고 1주 줄이는&rsquo; 감량주 리듬과 대회 전 3주 테이퍼가 골격입니다. 시간은 LSD 페이스 6:30/km 가정 — 본인 시간은 [이지·LSD] 탭이 산출한 페이스로 잡으세요.
          </p>
          <div style={{ ...easyCard, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr>
                    <th scope="col" style={easyHead}>주차</th>
                    <th scope="col" style={easyHead}>단계</th>
                    <th scope="col" style={easyHead}>롱런 거리</th>
                    <th scope="col" style={easyHead}>6:30/km 기준 시간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={easyCell}>1~3주</td><td style={easyCell}>기초 쌓기</td><td style={easyCell}>14 → 16 → 18km</td><td style={easyCell}>91 → 117분</td></tr>
                  <tr><td style={easyCell}>4주</td><td style={easyCell}>감량주</td><td style={easyCell}>14km</td><td style={easyCell}>91분</td></tr>
                  <tr><td style={easyCell}>5~6주</td><td style={easyCell}>축적</td><td style={easyCell}>20 → 22km</td><td style={easyCell}>130 → 143분</td></tr>
                  <tr><td style={easyCell}>7주</td><td style={easyCell}>감량주</td><td style={easyCell}>16km</td><td style={easyCell}>104분</td></tr>
                  <tr><td style={easyCell}>8~9주</td><td style={easyCell}>축적</td><td style={easyCell}>24 → 26km</td><td style={easyCell}>156 → 169분</td></tr>
                  <tr><td style={easyCell}>10주</td><td style={easyCell}>감량주</td><td style={easyCell}>18km</td><td style={easyCell}>117분</td></tr>
                  <tr><td style={easyCell}>11~13주</td><td style={easyCell}><strong>피크</strong></td><td style={easyCell}>28 → 30 → 32km</td><td style={easyCell}>182 → 208분</td></tr>
                  <tr><td style={easyCell}>14~15주</td><td style={easyCell}>테이퍼</td><td style={easyCell}>22 → 16km</td><td style={easyCell}>143 → 104분</td></tr>
                  <tr><td style={easyCell}>16주</td><td style={easyCell}>대회 주</td><td style={easyCell}>8~10km + 풀코스</td><td style={easyCell}>—</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            주당 10% 규칙은 롱런 단독이 아니라 <strong>주간 총 거리</strong> 기준입니다. 롱런 자체는 회당 2km 이내로 늘리고, 3~4주마다 감량주로 피로를 털어내세요. 18km(약 2시간)부터는 매번 보급이 필요한 거리이므로, [이지·LSD] 탭의 <strong>롱런 보급 플래너</strong>에 그 주의 거리를 넣어 수분·탄수 시점을 미리 계획하고, 피크 롱런에서는 대회 당일 먹을 젤·음료를 그대로 리허설하세요. 예시보다 컨디션이 처지면 거리를 유지하거나 감량주를 앞당기는 쪽이 안전합니다.
          </p>
          <p className="g-note">
            ※ 이 표는 주말 롱런의 진행 예시이고, 위 [훈련 스케줄] 탭이 만드는 주중 인터벌 스케줄과는 별개입니다. 같은 주에 인터벌과 롱런을 함께 한다면 둘 사이를 적어도 2일 이상 띄우세요.
          </p>
        </div>

        {/* ── E-6. 이지·LSD 탭 계산 기준 ── */}
        <div>
          <h2 className="g-h2">
            [이지·LSD] 탭 계산 기준·공식·한계
          </h2>
          <div style={{ ...easyCard }}>
            <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>페이스 환산</strong>: 입력 기록을 Riegel 공식(T2 = T1 × (D2/D1)<sup>1.06</sup>)으로 10K·마라톤 페이스로 환산. 이지·LSD = 10K 환산 페이스의 약 1.2~1.3배(20~30% 느리게), 임계(템포) = 약 1.05배.</li>
              <li><strong style={{ color: 'var(--text)' }}>최대심박·존2</strong>: Tanaka 공식(208 − 0.7 × 나이). 안정시 심박을 입력하면 Karvonen(심박예비)으로 존2를 60~70%로, 미입력 시 최대심박의 60~70%로 산출.</li>
              <li><strong style={{ color: 'var(--text)' }}>롱런 보급</strong>: 수분은 20분마다 약 150ml. 탄수는 75분 이상부터 젤(약 25g)을 45분에 시작해 약 40분 간격으로 먹되, 총량이 시간당 30g(ACSM·AND·DC 2016 경기 중 권장 30~60g/h의 하한)에 못 미치면 젤 개수를 올림해 채웁니다.</li>
              <li><strong style={{ color: 'var(--text)' }}>훈련 배분</strong>: 저강도 80% : 고강도 20%(80/20 법칙)에 기반한 일반 가이드.</li>
              <li><strong style={{ color: 'var(--text)' }}>한계</strong>: Riegel은 짧은 기록에서 마라톤을 다소 빠르게 예측하는 경향이 있고, 공식 심박은 개인차(±10bpm 이상)가 큽니다. 모든 값은 참고용 추정 범위이며, 실제 강도는 &lsquo;대화 가능 여부·체감&rsquo;을 우선하세요.</li>
            </ul>
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 12. FAQ ── */}
        <div>
          <h2 className="g-h2">
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/pace',           icon: '🏃', name: '러닝 페이스 계산기',     desc: '마라톤 목표 기록별 페이스' },
              { href: '/tools/sports/race-predictor', icon: '🏅', name: '마라톤 기록 계산기', desc: 'Riegel·VDOT 공식 기록 예측' },
              { href: '/tools/sports/one-rm',         icon: '🏋️', name: '1RM 계산기',             desc: '근력 훈련 최대 중량 추정' },
              { href: '/tools/sports/fight-weight',   icon: '🥊', name: '격투기 체급 계산기',     desc: '복싱·UFC·MMA 감량 계획' },
              { href: '/tools/date/dday',             icon: '📅', name: 'D-day 계산기',           desc: '대회까지 남은 일수' },
              { href: '/tools/health/bmr',            icon: '🔥', name: '기초대사량(BMR) 계산기', desc: '하루 권장 칼로리·BMR' },
              { href: '/tools/sports/buildup',        icon: '📈', name: '러닝 빌드업 계산기',     desc: '구간별 점증 페이스' },
              { href: '/tools/sports/vo2max',         icon: '🫁', name: 'VO₂max 계산기',          desc: '심폐 체력·강도별 페이스' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
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
    </ToolPage>
  )
}
