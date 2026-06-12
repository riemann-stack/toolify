import PomodoroClient from './PomodoroClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/life/pomodoro',
  title: '뽀모도로 타이머 — 25분 집중·통계·프리셋·키보드 단축키',
  description:
    '25/5분 클래식부터 딥워크·수능·DeskTime까지 7가지 프리셋 + 일일·주간 통계·연속일수·알림음·브라우저 알림·단축키.',
  keywords: [
    '뽀모도로타이머', '포모도로타이머', '공부타이머', '집중타이머', '뽀모도로기법',
    '50분 타이머', '90분 타이머', '딥워크', '집중력향상',
    '학습 타이머', '수능 공부 타이머', '코딩 타이머',
  ],
})

const FAQ_LD = [
              {
                q: '뽀모도로 기법의 효과는 과학적으로 검증되었나요?',
                a: '여러 인지심리 연구에서 짧은 집중 + 규칙적 휴식이 인지 피로를 줄이고 작업 정확도를 높인다고 보고합니다. 우리 뇌의 주의력은 약 90분 주기로 변동하는데(인지 리듬), 이를 반영한 25/5·52/17·90/20 패턴이 효과적입니다. 다만 모든 사람에게 동일하지는 않으니 본인의 [통계] 탭에서 실제 효과를 확인하세요.',
              },
              {
                q: '25분이 너무 짧거나 길게 느껴질 때는?',
                a: '뽀모도로는 고정된 규칙이 아닙니다. 시작이 어려우면 <strong>리버스(5/25)</strong>, 깊은 작업이면 <strong>프로(50/10)</strong> 또는 <strong>울트라 딥워크(90/20)</strong>를 시도하세요. [설정·기법] 탭에서 7가지 프리셋을 한 번에 적용하거나 직접 분 단위로 조절할 수 있습니다.',
              },
              {
                q: '집중 중에 급한 일이 생기면 어떻게 하나요?',
                a: '뽀모도로 원칙은 &ldquo;떠오른 다른 일은 즉시 종이에 적고, 다음 휴식에 처리&rdquo;입니다. 정말 긴급한 일이 아니면 현재 뽀모도로를 완료하세요. 25분도 끊어야 하는 정도라면 [건너뛰기 (S)] 단축키로 다음 단계로 넘어갑니다.',
              },
              {
                q: '브라우저 탭을 닫거나 다른 탭으로 가면 타이머가 멈추나요?',
                a: '본 타이머는 <strong>실제 시간(timestamp) 기반</strong>이라, 다른 탭을 보다가 돌아오면 그동안 흐른 시간이 정확히 반영됩니다. 다만 <strong>서비스워커 기반 백그라운드 타이머가 아니므로</strong>, 모바일 화면 잠금이나 브라우저가 탭을 절전(정지)시키면 <strong>완료 처리·알림음·브라우저 알림이 실제 종료 시각보다 지연</strong>될 수 있습니다(탭으로 돌아오면 즉시 보정·발생). 정확한 알림이 중요하면 탭을 활성 상태로 두거나 PC 환경을 권장합니다. 브라우저를 완전히 종료하면 진행 중이던 세션은 사라집니다.',
              },
              {
                q: '내 기록은 어디에 저장되나요? 다른 기기와 동기화되나요?',
                a: '모든 기록은 <strong>본인의 브라우저 안(localStorage)</strong>에만 저장됩니다. 서버로 전송되지 않으므로 사생활이 안전한 대신, 다른 기기·브라우저와는 자동 동기화되지 않습니다. 기록은 90일까지 보관되며 그 이후는 자동 삭제됩니다.',
              },
              {
                q: '브라우저 알림이 뜨지 않아요.',
                a: '① [설정·기법] 탭에서 [브라우저 알림]을 켤 때 권한 허용 필요 ② Chrome 설정 > 개인정보 > 사이트 설정 > 알림에서 youtil.kr이 차단되어 있지 않은지 확인 ③ macOS는 시스템 알림 설정에서도 Chrome/브라우저 허용 필요. iOS Safari는 알림이 제한적이므로 PC 환경을 권장합니다.',
              },
              {
                q: '키보드 단축키가 동작하지 않아요.',
                a: '작업 입력란이나 버튼 등에 포커스가 있으면 전역 단축키가 비활성화됩니다(타이핑·버튼 클릭과의 중복 발동 방지). 빈 공간을 한 번 클릭한 뒤 단축키(Space·R·S·1·2·3·F)를 누르세요. 포커스된 버튼은 Space/Enter로 그 버튼만 직접 눌립니다.',
              },
              {
                q: '한 작업을 여러 뽀모도로에 걸쳐 진행하면 어떻게 기록되나요?',
                a: '작업명 입력란을 그대로 두고 시작·휴식을 반복하면 각 집중 세션이 동일 작업명으로 누적 기록됩니다. 통계 탭의 &ldquo;오늘 완료한 세션&rdquo;에서 시간순으로 확인할 수 있습니다.',
              },
              {
                q: '학생인데 25/5와 학생용(30/10) 중 어떤 게 좋을까요?',
                a: '초·중학생이면 25/5(클래식), 고등학생·수험생이면 30/10 또는 수능형(80/20)을 권합니다. 단원 1개 학습 → 정리 시간이 필요하면 30/10이, 모의고사 시간 적응이 필요하면 80/20이 적합합니다. 처음에는 25/5로 시작해 본인 패턴을 [통계] 탭에서 확인하며 조절하세요.',
              },
              {
                q: '하루 몇 회 정도가 적당한가요?',
                a: '일반적으로 <strong>하루 8~12회 (총 집중 200~300분)</strong> 정도가 지속 가능한 범위입니다. 16회 이상은 단기적으로 가능하지만 누적 피로로 다음날 효율이 떨어질 수 있습니다. [설정·기법] 탭의 일일 목표를 본인 컨디션에 맞춰 조절하세요. 무리한 연속 사용보다 매일 꾸준히가 중요합니다.',
              },
            ]

export default function PomodoroPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍅 뽀모도로 타이머
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        25/5분부터 딥워크·수능까지 <strong style={{ color: 'var(--text)' }}>7가지 프리셋</strong>. 일일·주간 통계와 연속일수 추적.
      </p>

      <PomodoroClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 뽀모도로 기법이란? (기존 유지·SEO 보호) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>뽀모도로 기법이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            뽀모도로(Pomodoro) 기법은 1980년대 프란체스코 시릴로가 개발한 시간 관리 방법론입니다. 토마토 모양 주방 타이머(이탈리아어로 &lsquo;뽀모도로&rsquo;)에서 이름을 따왔으며, 짧은 집중과 규칙적인 휴식의 반복으로 인지 피로를 최소화합니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { step: '1', title: '25분 집중', desc: '한 가지 작업에만 집중합니다. 방해 요소를 모두 차단하세요.', color: '#0EA5E9' },
              { step: '2', title: '5분 휴식',  desc: '짧게 스트레칭하거나 물을 마십니다. 스마트폰은 내려놓으세요.', color: '#0891B2' },
              { step: '3', title: '4번 반복',  desc: '25분 집중 + 5분 휴식을 4번 반복합니다.', color: '#EA580C' },
              { step: '4', title: '15~30분 긴 휴식', desc: '4번의 뽀모도로를 완료하면 긴 휴식을 취합니다.', color: '#FF6BD9' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '20px', color: s.color, flexShrink: 0 }}>{s.step}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{s.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. 7가지 검증된 뽀모도로 프리셋 (NEW) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            상황별 뽀모도로 프리셋 7가지
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            25/5 클래식 외에도 작업 성격·집중 패턴에 따라 자주 쓰이는 시간 조합이 있습니다(일부는 연구 기반, 일부는 경험적 패턴). 본 도구의 <strong style={{ color: 'var(--text)' }}>[설정·기법] 탭</strong>에서 한 번의 클릭으로 적용됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>프리셋</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>집중</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>휴식</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>긴 휴식</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>추천 대상</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '🍅 클래식',     f: 25, s: 5,  l: 15, t: '입문자, 일반 사무·과제' },
                  { n: '📚 학생용',     f: 30, s: 10, l: 30, t: '중·고등학생 자율학습' },
                  { n: '💼 프로',       f: 50, s: 10, l: 30, t: '프로그래밍·디자인·논문' },
                  { n: '🧠 울트라 딥워크', f: 90, s: 20, l: 30, t: '인지 리듬 활용 고집중' },
                  { n: '📊 DeskTime',   f: 52, s: 17, l: 30, t: '생산성 분석 기반 직장인' },
                  { n: '🎓 수능형',     f: 80, s: 20, l: 30, t: '수능 모의 시간 적응' },
                  { n: '🔄 리버스',     f: 5,  s: 25, l: 30, t: '시작이 어려운 날 부담 ↓' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0EA5E9', fontFamily: 'Inter' }}>{r.f}분</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontFamily: 'Inter' }}>{r.s}분</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#EA580C', fontFamily: 'Inter' }}>{r.l}분</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 90분(울트라 딥워크)은 인간의 인지 리듬(ultradian rhythm) 주기에 기반한 패턴입니다. DeskTime 52/17은 DeskTime의 사용자 생산성 분석에서 &lsquo;가장 생산성 높은 그룹&rsquo;의 평균 패턴으로 보고된 비율입니다. 리버스·수능형 등은 검증된 연구라기보다 상황별 경험적 패턴입니다.
          </p>
        </section>

        {/* ── 3. 키보드 단축키 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            키보드 단축키 — 마우스 없이 빠르게 조작
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            작업 입력란에 포커스되어 있지 않을 때 동작합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {[
              { k: 'Space', a: '시작 / 일시정지' },
              { k: 'R',     a: '현재 단계 리셋' },
              { k: 'S',     a: '다음 단계로 건너뛰기' },
              { k: '1',     a: '집중 단계 전환' },
              { k: '2',     a: '짧은 휴식 전환' },
              { k: '3',     a: '긴 휴식 전환' },
              { k: 'F',     a: '전체화면 모드' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                <span style={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 700, background: 'var(--bg3)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text)', minWidth: '50px', textAlign: 'center' }}>{s.k}</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{s.a}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. 통계 활용법 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            통계로 집중 패턴 발견하기
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 완료한 모든 세션을 자동 기록(브라우저 로컬, 90일 보관)합니다. <strong style={{ color: 'var(--text)' }}>[통계] 탭</strong>에서 다음을 확인할 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { e: '🌅', t: '가장 집중 잘 되는 시간대', d: '사람마다 다르지만 흔히 기상 후 2~4시간 무렵에 인지 능력이 높다고 알려져 있습니다. 정답은 사람마다 다르니 본인의 골든 타임을 통계로 직접 확인하고 가장 어려운 작업을 그 시간에 배치하세요.' },
              { e: '📅', t: '가장 생산적인 요일', d: '흔히 주 중반(화·수)이 집중도가 높다고 이야기되지만 개인차가 큽니다. 본인 패턴을 확인해 어려운 작업을 적절히 배치하세요.' },
              { e: '🔥', t: '연속 일수 (Streak)', d: '매일 1회 이상 집중한 일수를 카운트합니다. 흔히 \'21일이면 습관\'이라고 하지만, 연구상 행동이 자동화되기까지는 평균 약 66일(개인·행동별 편차 큼)이 걸립니다 — 꾸준함이 핵심입니다.' },
              { e: '📊', t: '주간 막대 그래프', d: '최근 7일 집중 횟수를 한눈에 비교. 컨디션 변화·외부 일정 영향을 시각적으로 확인할 수 있습니다.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{s.e}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{s.t}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. 백색소음 가이드 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            집중을 돕는 백색소음·앰비언트 8가지
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            한 연구(Mehta 등)에선 적당한(약 70dB) 주변 소음이 <strong style={{ color: 'var(--text)' }}>집중 그 자체보다 창의적·발산적 사고 과제</strong>에서 도움이 된다고 보고합니다(지나치게 크면 오히려 방해). 효과는 사람·과제마다 다르니 참고용으로 활용하세요. 본 도구는 직접 재생을 제공하지 않으며, YouTube·노이즐리(noisli.com) 등에서 검색해 활용할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>유형</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>특성</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>적합한 작업</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '🌧️ 빗소리',    p: '핑크 노이즈 계열, 일정한 리듬',     s: '독서·집필·수면' },
                  { n: '☕ 카페 소음', p: '낮은 대화 + 식기 소리, ~70dB',     s: '창의적 작업·아이디어' },
                  { n: '🌲 숲·새소리', p: '자연음, 코르티솔 감소',            s: '명상·낮은 강도 작업' },
                  { n: '🌊 파도소리', p: '저주파 리듬, 진정 효과',           s: '스트레스 ↑ 시 휴식' },
                  { n: '🔥 장작 소리', p: 'ASMR 효과, 따뜻한 분위기',          s: '겨울철 야간 작업' },
                  { n: '💨 선풍기',    p: '순수 백색소음, 외부 차단력 강함',    s: '시끄러운 환경 차단' },
                  { n: '🎧 Lo-Fi',     p: '가사 없는 부드러운 비트',          s: '코딩·반복 작업' },
                  { n: '🤫 정적',      p: '완전한 무음',                     s: '고난도 인지·암기' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 6. FAQ (accordion) ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 면책 ── */}
        <section>
          <Disclaimer variant="default" open>
            본 도구는 집중 보조용 타이머이며, 학습·업무 효과는 개인의 컨디션·환경·작업 성격에 따라 달라집니다. 충분한 수면(7시간 이상)·휴식·운동·영양은 어떤 시간 관리 기법보다 우선합니다. 무리한 연속 사용(하루 16회 이상)은 권장하지 않으며, 만성 피로·집중력 저하가 지속되면 휴식과 함께 전문가 상담을 고려하세요.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',     desc: '시험·마감까지 남은 날' },
              { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량',    desc: '건강 목표 관리' },
              { href: '/tools/life/ladder',       icon: '🪜', name: '사다리타기',        desc: '쉬는 시간 미니 게임' },
              { href: '/tools/life/zodiac',       icon: '✨', name: '띠·별자리 계산기',  desc: '가족·친구와 함께' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
