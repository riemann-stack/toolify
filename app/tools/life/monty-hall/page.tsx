import type { Metadata } from 'next'
import Link from 'next/link'
import MontyHallClient from './MontyHallClient'

export const metadata: Metadata = {
  title: '몬티홀 문제 시뮬레이터 — 바꾸기 vs 유지하기 확률 직접 체험 | Youtil',
  description: '몬티홀 문제를 직접 플레이하고 1,000번 자동 시뮬레이션해 "바꾸면 2/3, 유지하면 1/3"을 눈으로 확인하세요. 베이즈 증명·100문 확장 해설 포함.',
  keywords: ['몬티홀문제', '몬티홀시뮬레이터', '바꾸기유지하기', '조건부확률', '베이즈정리', '확률퍼즐', '확률실험'],
}

export default function MontyHallPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🚪 몬티홀 문제 시뮬레이터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        직관을 배반하는 확률 퍼즐. 직접 플레이하고 1,000번 자동 시뮬레이션으로 &ldquo;바꾸면 2/3, 유지하면 1/3&rdquo;의 진실을 눈으로 확인하세요.
      </p>

      <MontyHallClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 몬티홀 문제란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{r.n}</span>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
                      <td style={{ padding: '8px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.car}</td>
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
            <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '14px', fontFamily: 'Syne, sans-serif', fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, textAlign: 'center' }}>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
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

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '두 문이 남았는데 왜 50:50이 아닌가요?',
                a: '두 문의 확률이 동등하려면 처음부터 동일한 조건이었어야 합니다. 내가 고른 문은 아무 정보 없이 무작위로 1/3 확률로 고른 것이고, 남은 문은 진행자가 염소 하나를 제거해준 &ldquo;선별된&rdquo; 문입니다. 두 문의 이력이 다르므로 확률도 다릅니다.' },
              { q: '진행자가 아무 문이나 무작위로 열면 어떻게 되나요?',
                a: '그 경우 바꾸나 유지나 50:50이 됩니다. 몬티홀 문제의 핵심은 &ldquo;진행자가 자동차 위치를 알고 의도적으로 염소 문을 연다&rdquo;는 조건입니다. 진행자가 실수로 자동차를 열어버릴 수 있다면 확률 구조가 완전히 달라집니다.' },
              { q: '처음 선택한 문이 열린 문 바로 옆에 있다면?',
                a: '문의 물리적 위치는 확률과 무관합니다. 중요한 건 &ldquo;고른 문 / 고르지 않은 문&rdquo; 그룹 구분뿐입니다. 내가 고른 문은 1/3, 나머지 그룹(염소 제거 전 2/3)의 자동차 확률이 마지막 남은 문 하나에 몰립니다.' },
              { q: '실제로 해보면 정말 2/3이 나오나요?',
                a: '네. 위 시뮬레이터에서 1,000번 이상 돌리면 바꾸기 전략의 승률이 66.7% 부근으로 수렴하는 것을 확인할 수 있습니다. 시행 횟수가 적으면 편차가 크니 최소 1,000회 이상 권장합니다(대수의 법칙).' },
              { q: '100문으로 확장하면 더 명확하다고 하던데?',
                a: '맞습니다. 문이 100개고 내가 하나 고르면 자동차 확률은 1/100. 진행자가 나머지 99개 중 염소 문 98개를 열어주면, 남은 한 문의 확률은 99/100이 됩니다. 바꾸는 게 99배 유리하다는 게 직관적으로 보입니다.' },
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
              { href: '/tools/life/lotto',        icon: '🎰', name: '로또 번호 생성기',       desc: '1/8,145,060의 확률 세계' },
              { href: '/tools/life/drake',        icon: '👽', name: '드레이크 방정식 계산기', desc: '확률 곱의 또 다른 예시' },
              { href: '/tools/life/golden-ratio', icon: '🌀', name: '황금 비율 계산기',       desc: '수학 속 신기한 상수' },
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
