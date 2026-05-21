import Link from 'next/link'
import MontyHallClient from './MontyHallClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/life/monty-hall',
  title: '몬티홀 시뮬레이터 — 3·100문 N문 확장 + 변형 규칙 + 베이즈',
  description: '바꿔야 유리한 진짜 이유. 3·10·100·1000문 N문 확장 시뮬, 4가지 변형 규칙, 수렴 그래프와 베이즈 추론으로 직관을 깨다.',
  keywords: ['몬티홀문제', '몬티홀시뮬레이터', '바꾸기유지하기', '조건부확률', '베이즈정리', '확률퍼즐', '확률실험', 'N문 확장', '몬티홀 변형', '대수의 법칙', '직관 배반 확률'],
})

export default function MontyHallPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🚪 몬티홀 시뮬레이터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        바꿔야 유리한 진짜 이유. 3·10·100·1000문 시뮬과 <strong style={{ color: 'var(--text)' }}>베이즈 추론</strong>으로 직관을 깨다.
      </p>

      <MontyHallClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 몬티홀 문제란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            몬티홀 문제란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            미국 TV 쇼 <strong style={{ color: 'var(--text)' }}>&ldquo;Let&rsquo;s Make a Deal&rdquo;</strong>의 진행자 <strong style={{ color: 'var(--text)' }}>몬티 홀(Monty Hall)</strong>의 이름을 딴 확률 퍼즐입니다. 1990년 매릴린 보스 사반트(Marilyn vos Savant)가 &ldquo;Ask Marilyn&rdquo; 칼럼에서 &ldquo;바꾸는 게 이득&rdquo;이라고 답하자, 전국의 수학자 1,000여 명이 반박 편지를 보낸 것으로 유명합니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            결과적으로 <strong style={{ color: 'var(--accent)' }}>사반트가 옳았습니다</strong>. 문을 바꾸면 당첨 확률이 2/3(약 66.7%)로, 유지했을 때의 1/3(약 33.3%)보다 두 배 높습니다. 이 문제는 직관과 확률이 충돌하는 대표 사례로 통계학·의사결정 교재에 자주 등장합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '10px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--accent)' }}>핵심:</strong> 진행자가 &ldquo;염소 문을 알고&rdquo; 일부러 연다는 점이 비밀입니다. 이 정보가 문의 확률 배분을 바꿉니다.
            </p>
          </div>
        </div>

        {/* ── 2. 정확한 규칙 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            정확한 규칙
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '세 개의 문 뒤에 자동차 1대와 염소 2마리가 무작위로 배치됩니다.' },
              { n: '②', t: '참가자가 문 하나를 고릅니다.' },
              { n: '③', t: '진행자는 <strong>자동차 위치를 알고 있으며</strong>, 참가자가 고르지 않은 문 중 <strong>반드시 염소가 있는 문</strong>을 엽니다.' },
              { n: '④', t: '진행자가 열 수 있는 문이 두 개라면 <strong>무작위로</strong> 하나를 엽니다.' },
              { n: '⑤', t: '참가자는 처음 선택을 <strong>유지</strong>하거나 남은 다른 문으로 <strong>바꿀</strong> 수 있습니다.' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{r.n}</span>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }} dangerouslySetInnerHTML={{ __html: r.t }} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            * 이 규칙이 지켜지지 않으면(예: 진행자가 무작위로 연다면) 결과가 달라집니다. &ldquo;진행자가 의도적으로 염소를 연다&rdquo;는 조건이 2/3 확률의 핵심입니다.
          </p>
        </div>

        {/* ── 3. 3가지 증명 방법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            3가지 증명 방법
          </h2>

          {/* 증명 1: 경우의 수 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>증명 1 · 경우의 수로 풀기</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '8px' }}>
              처음 선택이 <strong style={{ color: 'var(--text)' }}>자동차일 확률은 1/3</strong>, <strong style={{ color: 'var(--text)' }}>염소일 확률은 2/3</strong>입니다. 진행자는 이 확률을 바꾸지 못합니다(이미 선택된 문을 열지 않으므로).
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '20px', margin: 0 }}>
              <li>처음에 자동차를 골랐다면 (1/3) → 바꾸면 진다.</li>
              <li>처음에 염소를 골랐다면 (2/3) → 진행자가 다른 염소를 열어주므로 <strong style={{ color: 'var(--text)' }}>바꾸면 반드시 자동차</strong>.</li>
            </ul>
          </div>

          {/* 증명 2: 표 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px' }}>증명 2 · 모든 경우 표로 확인</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>참가자가 항상 1번 문을 고른다고 가정(대칭이므로 일반성 유지).</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['자동차 위치', '진행자가 여는 문', '유지하면', '바꾸면'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { car: '1번', open: '2 또는 3',  stay: '🚗 자동차',     sw: '🐐 염소' },
                    { car: '2번', open: '3번',      stay: '🐐 염소',       sw: '🚗 자동차' },
                    { car: '3번', open: '2번',      stay: '🐐 염소',       sw: '🚗 자동차' },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.car}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{r.open}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{r.stay}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{r.sw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', margin: 0 }}>
              → 유지: 1/3 승, 바꾸기: 2/3 승
            </p>
          </div>

          {/* 증명 3: 베이즈 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px' }}>증명 3 · 베이즈 정리</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '10px' }}>
              참가자가 1번 선택 · 진행자가 3번 염소 공개 상황에서 자동차가 2번 문에 있을 조건부 확률:
            </p>
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '14px', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, textAlign: 'center' }}>
              P(car=2 | open=3) = <br />
              <span style={{ color: 'var(--accent)' }}>[P(open=3|car=2) × P(car=2)] / P(open=3)</span><br />
              = (1 × 1/3) / (1/2) = <strong>2/3</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px', margin: 0 }}>
              분자에서 자동차가 2번일 때 진행자는 3번을 열 수밖에 없으므로 확률 1. 반면 자동차가 1번이면 진행자는 2·3 중 아무거나 열 수 있어 1/2. 이 비대칭이 2/3를 만듭니다.
            </p>
          </div>
        </div>

        {/* ── 4. 왜 틀리는가 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            사람들이 틀리는 이유
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { t: '🧩 대칭성 오류', d: '문이 두 개 남았으니 50:50이라 생각하지만, 두 문의 &ldquo;역사&rdquo;가 다릅니다. 내가 고른 문은 무작위로 골라진 것이고, 남은 문은 진행자가 염소를 치워준 뒤의 &ldquo;선별된&rdquo; 문입니다.' },
              { t: '🎲 정보 무시', d: '진행자의 선택은 무작위가 아닌 &ldquo;자동차를 아는 사람의 의도적 선택&rdquo;입니다. 이 정보가 남은 문으로 확률을 몰아넣습니다.' },
              { t: '🔄 고착 편향', d: '사람은 자기가 이미 내린 선택을 바꾸기 싫어합니다(현상유지 편향). 바꿔서 지면 더 후회할 것 같다는 심리가 합리적 선택을 막습니다.' },
              { t: '🔢 작은 표본', d: '3개 문은 직관적으로 확률 차이가 잘 보이지 않습니다. 100문으로 확장하면(아래 참조) &ldquo;99문 중 남은 하나&rdquo;로 자동차 확률이 몰리는 게 명백해집니다.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>{m.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }} dangerouslySetInnerHTML={{ __html: m.d }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 현실 응용 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            현실에서의 응용
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { icon: '🏥', title: '의학 진단', desc: '양성 결과가 나왔을 때 추가 정보(유병률·재검 결과)로 확률이 어떻게 갱신되는지 이해하는 데 활용됩니다.' },
              { icon: '💼', title: '의사결정', desc: '새 정보가 등장했을 때 기존 선택을 유지할지 바꿀지 판단하는 기준을 제시합니다. 매몰비용 오류 교정에도 유용.' },
              { icon: '🤖', title: 'AI·ML', desc: '베이지안 추론의 기초. 사전확률(Prior)에 증거(Evidence)를 곱해 사후확률(Posterior)을 갱신하는 직관을 제공합니다.' },
              { icon: '🔍', title: '수사·감사', desc: '용의자를 좁히는 과정, 회계 표본 추출 후 재조사 시 남은 표본의 위험도 재평가에 같은 논리가 쓰입니다.' },
            ].map((z, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '18px', marginBottom: '4px' }}>{z.icon}</p>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>{z.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{z.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. N문 확장 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🚪 N문 확장 — 문이 많을수록 직관 명확
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [⚡ 자동 시뮬레이션] 탭에서 문 갯수를 3·5·10·100·1000개로 변경 가능합니다. 표준 몬티홀(진행자가 N-2개 염소 공개)에서 바꾸기 승률은 (N-1)/N로 수렴합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>문 갯수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>유지 승률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>바꾸기 승률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>차이</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '3개',     stay: '33.3%',  sw: '66.7%',  diff: '2배' },
                  { n: '5개',     stay: '20%',    sw: '80%',    diff: '4배' },
                  { n: '10개',    stay: '10%',    sw: '90%',    diff: '9배' },
                  { n: '100개',   stay: '1%',     sw: '99%',    diff: '99배' },
                  { n: '1,000개', stay: '0.1%',   sw: '99.9%',  diff: '999배' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#0891B2', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.stay}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.sw}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{r.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            💡 핵심 직관 — &ldquo;내가 고른 문 = 무작위 1개 (1/N)&rdquo; vs &ldquo;진행자가 N-2개 염소를 치워준 마지막 1문 = (N-1)/N에 정보 농축&rdquo;.
          </p>
        </div>

        {/* ── 7. 변형 규칙 4가지 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🎭 변형 규칙 4가지 — 진행자의 의도가 결과를 결정
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            같은 &ldquo;두 문 중 하나&rdquo; 상황이라도 그 상황이 어떻게 만들어졌는가에 따라 확률이 완전히 달라집니다. 본 도구의 [자동 시뮬레이션] 탭에서 4가지 모두 직접 비교 가능.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { color: '#059669', emoji: '🟢', name: '표준 몬티홀',
                rule: '진행자가 자동차 위치를 알고 의도적으로 염소 문 공개',
                result: '바꾸기 67% / 유지 33%', insight: '진행자 정보 → 남은 문에 확률 농축.' },
              { color: '#FFD93E', emoji: '🟡', name: '무작위 진행자',
                rule: '진행자가 아무 문이나 무작위로 염 (자동차 노출 시 게임 무효)',
                result: '바꾸기 50% / 유지 50%', insight: '진행자 정보 X → 베이지안 갱신 없음.' },
              { color: '#EA580C', emoji: '🟠', name: '몬티 폴',
                rule: '진행자가 무작위 1개 열었는데 우연히 염소였을 때만',
                result: '바꾸기 50% / 유지 50%', insight: '의도 X → 정보 가치 없음.' },
              { color: '#DC2626', emoji: '🔴', name: '악마 몬티',
                rule: '진행자가 참가자가 자동차 골랐을 때만 염소 공개 (함정)',
                result: '바꾸기 0% / 유지 100%', insight: '진행자 의도 = 참가자 패배 유도.' },
            ].map((v, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${v.color}44`, borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', color: v.color, fontWeight: 700, marginBottom: '6px' }}>{v.emoji} {v.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '4px' }}>규칙: {v.rule}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>→ {v.result}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{v.insight}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.6 }}>
            ⚠️ 베이즈 추론의 본질 — &ldquo;정보의 질&rdquo;이 확률을 바꾼다. 같은 결과 화면이라도 그 정보가 어떻게 생성되었는지(생성 메커니즘)에 따라 사후확률이 달라집니다.
          </p>
        </div>

        {/* ── 8. FAQ (accordion) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: '두 문이 남았는데 왜 50:50이 아닌가요?',
                a: '두 문의 확률이 동등하려면 처음부터 동일한 조건이었어야 합니다. 내가 고른 문은 아무 정보 없이 무작위로 1/3 확률로 고른 것이고, 남은 문은 진행자가 염소 하나를 제거해준 &ldquo;선별된&rdquo; 문입니다. 두 문의 이력이 다르므로 확률도 다릅니다.' },
              { q: '진행자가 아무 문이나 무작위로 열면 어떻게 되나요?',
                a: '그 경우 바꾸나 유지나 50:50이 됩니다. 몬티홀 문제의 핵심은 &ldquo;진행자가 자동차 위치를 알고 의도적으로 염소 문을 연다&rdquo;는 조건입니다. 진행자가 실수로 자동차를 열어버릴 수 있다면 확률 구조가 완전히 달라집니다. 본 도구의 [자동 시뮬레이션] 탭에서 [🟡 무작위 진행자] 변형으로 직접 확인 가능.' },
              { q: '처음 선택한 문이 열린 문 바로 옆에 있다면?',
                a: '문의 물리적 위치는 확률과 무관합니다. 중요한 건 &ldquo;고른 문 / 고르지 않은 문&rdquo; 그룹 구분뿐입니다. 내가 고른 문은 1/3, 나머지 그룹(염소 제거 전 2/3)의 자동차 확률이 마지막 남은 문 하나에 몰립니다.' },
              { q: '실제로 해보면 정말 2/3이 나오나요?',
                a: '네. 위 시뮬레이터에서 1,000번 이상 돌리면 바꾸기 전략의 승률이 66.7% 부근으로 수렴하는 것을 확인할 수 있습니다. 시행 횟수가 적으면 편차가 크니 최소 1,000회 이상 권장합니다(대수의 법칙).' },
              { q: '100문으로 확장하면 더 명확하다고 하던데?',
                a: '맞습니다. 문이 100개고 내가 하나 고르면 자동차 확률은 1/100. 진행자가 나머지 99개 중 염소 문 98개를 열어주면, 남은 한 문의 확률은 99/100이 됩니다. 바꾸는 게 99배 유리하다는 게 직관적으로 보입니다. 본 도구의 [자동 시뮬레이션] 탭에서 문 갯수를 100개로 설정하면 1,000회 시뮬에서 약 99% 수렴 확인 가능.' },
              { q: '문이 100개면 진짜 바꾸는 게 99% 확률인가요?',
                a: '네, 표준 몬티홀(진행자가 N-2개 염소 공개)에서:<br/>• 100개 문 중 1개 선택 → 자동차 확률 1%<br/>• 진행자가 98개 염소 공개 → 남은 1개에 99% 농축<br/>• 1,000회 시뮬: 바꾸기 약 990회 승<br/>문 갯수별 바꾸기 승률 — 3개 67% / 10개 90% / 100개 99% / 1,000개 99.9%. 많을수록 직관이 명확해집니다.' },
              { q: 'N문 확장 시뮬에서 진행자가 N-2개를 다 여나요?',
                a: '본 도구의 표준 모드는 모든 N에서 진행자가 N-2개 염소를 공개하고 1개만 남기는 풀 몬티홀(Full Monty)을 가정합니다. 따라서 바꾸기 승률은 항상 (N-1)/N로 수렴합니다. 다른 변형(진행자가 1개만 여는 경우 등)은 본 [💡 왜 바꿔야 할까?] 탭의 N개 일반화 표 참고.' },
              { q: '시험 답 바꾸기와 몬티홀이 같은 원리인가요?',
                a: '<strong>다릅니다.</strong> 자주 혼동되는 부분.<br/><strong>몬티홀</strong> — 외부 정보(진행자가 염소 공개) 추가 → 확률 재배분 → 바꾸기 객관적 유리.<br/><strong>시험 답 바꾸기</strong> — 단순 자신감 흔들림(외부 정보 X) → 통계적으로 처음 답이 약간 유리(1~2%).<br/>핵심 차이: <strong>새 정보가 객관적인가</strong>. 시험에서 다시 풀어 명백한 오류 발견 시만 변경 권장.' },
              { q: '실제 카지노 도박에 응용 가능한가요?',
                a: '<strong>응용 불가.</strong> 카지노 게임은 몬티홀과 다릅니다. 진행자가 정보를 가지지 않은 단순 무작위(룰렛·블랙잭) + 항상 카지노 유리하게 설계(House Edge). 몬티홀 같은 베이즈 추론은 의학·과학 추론, 베이지안 머신러닝, 검찰 수사·법정 판단 등에 응용됩니다. 도박 의존이 우려되면 사행산업통합감독위원회 <strong>1336</strong> 또는 정신건강 위기상담 <strong>1577-0199</strong>로 도움 요청.' },
              { q: '일상에서 몬티홀 같은 상황이 있나요?',
                a: '베이즈 추론이 필요한 상황 다수:<br/>• <strong>의학 검사 양성</strong> — 사전 확률(질병 유병률 1%) × 검사 정확도 99% → 양성 시 실제 질병 확률은 약 50% (직관 99%와 다름)<br/>• <strong>의사결정</strong> — 새 정보 등장 시 기존 선택 재평가, 매몰비용 오류 교정<br/>• <strong>AI·머신러닝</strong> — 베이지안 추론 핵심 (사전확률 × 증거 = 사후확률)<br/>• <strong>수사·감사</strong> — 용의자 좁히기, 회계 표본 재조사' },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 7. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/lotto',        icon: '🎰', name: '로또 번호 생성기',       desc: '1/8,145,060의 확률 세계' },
              { href: '/tools/life/drake',        icon: '👽', name: '드레이크 방정식 계산기', desc: '확률 곱의 또 다른 예시' },
              { href: '/tools/art/golden-ratio', icon: '🌀', name: '황금 비율 계산기',       desc: '수학 속 신기한 상수' },
              { href: '/tools/life/ladder',       icon: '🪜', name: '사다리타기',             desc: '공정한 무작위 선택' },
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
