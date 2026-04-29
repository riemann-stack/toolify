import LottoClient from './LottoClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/lotto',
  title: '로또 번호 생성기·확률 시뮬레이터 — 8가지 생성 모드·번호 분석·1등 체감',
  description:
    '로또 6/45 번호 8가지 모드(랜덤·균형·생일제외·연속포함·끝수분산 등) 생성, 번호 분석, 가상 추첨 시뮬레이션, 1등 체감, 당첨금 세후 계산까지. 무료·로그인 없음.',
  keywords: [
    '로또 번호 생성기', '로또 6/45', '로또 번호 분석', '로또 확률 시뮬레이션',
    '1등 당첨 확률', '로또 당첨금 세금', '균형형 번호', '생일 번호 제외', '로또 통계',
    '로또 번호 추첨', '디지털 로또', '로또 시뮬레이터', '로또 1등 확률', '로또 당첨금 세후', '로또 번호 추천',
  ],
})

export default function LottoPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎰 로또 번호 생성기·확률 시뮬레이터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        8가지 생성 모드, 번호 분석, 가상 추첨 시뮬레이션, 1등 체감, 당첨금 세후 계산까지. <strong style={{ color: 'var(--text)' }}>모든 6개 번호 조합의 1등 확률은 1/8,145,060로 동일</strong>하며, 본 도구는 재미·교육용 시뮬레이터입니다.
      </p>

      <LottoClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 로또 6/45 당첨 확률 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>로또 6/45 당첨 확률</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            한국 로또는 1~45 중 6개 번호를 맞추는 게임입니다. 가능한 조합 수 = <code style={{ color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>C(45,6) = 8,145,060</code>가지.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['등수', '조건', '확률', '평균 당첨금'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1등', '6개 일치',         '1 / 8,145,060', '약 20~30억'],
                  ['2등', '5개 + 보너스',     '1 / 1,357,510', '약 5~7천만'],
                  ['3등', '5개 일치',         '1 / 35,724',    '약 150~200만'],
                  ['4등', '4개 일치',         '1 / 733',       '50,000원 (고정)'],
                  ['5등', '3개 일치',         '1 / 45',        '5,000원 (고정)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{row[2]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ⚠️ 1·2·3등 당첨금은 회차별 판매액과 당첨자 수에 따라 변동되며, 4·5등은 고정 금액입니다.
          </p>
        </section>

        {/* 2. 8가지 모드 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>8가지 번호 생성 모드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            각 모드는 번호 조합의 패턴만 다를 뿐, <strong style={{ color: 'var(--text)' }}>1등 당첨 확률은 모두 1/8,145,060로 동일</strong>합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🎲', name: '완전 랜덤',    desc: '아무 제약 없이 1~45 무작위 6개 — 가장 단순' },
              { icon: '⚖️', name: '균형형',       desc: '5구간(1~10/11~20/.../41~45)에 골고루 분포' },
              { icon: '🚫', name: '생일 제외형',  desc: '1~31 비중 줄이고 32~45 강조 — 흔한 조합 회피' },
              { icon: '🔗', name: '연속 포함형',  desc: '12·13 같은 연속 쌍 1개 포함 (3연속은 방지)' },
              { icon: '✂️', name: '연속 제외형',  desc: '인접 번호가 없도록 — 거리 있는 조합' },
              { icon: '🎯', name: '끝수 분산형',  desc: '같은 끝자리 숫자 겹침 최소화 (각 끝자리 ≤2개)' },
              { icon: '📊', name: '고른 분포',    desc: '번호 간 간격을 7~9로 균등하게 분산' },
              { icon: '⚡', name: '빠른픽',       desc: '설정 없이 5게임 즉시 무작위 생성' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.icon} {m.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 번호 분석 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>번호 분석 — 통계적 패턴 학습</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구의 [번호 분석] 탭에서 6개 번호의 통계 패턴을 확인할 수 있습니다:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· <strong style={{ color: 'var(--text)' }}>홀짝 비율</strong> — 균형(3:3) vs 편향</li>
            <li>· <strong style={{ color: 'var(--text)' }}>저고 비율</strong> — 1~22 vs 23~45 분포</li>
            <li>· <strong style={{ color: 'var(--text)' }}>번호 총합</strong> — 한국 로또 역대 평균 약 138</li>
            <li>· <strong style={{ color: 'var(--text)' }}>구간 분포</strong> — 5구간(1~10/11~20/.../41~45)별 개수</li>
            <li>· <strong style={{ color: 'var(--text)' }}>소수·3의 배수</strong> 개수</li>
            <li>· <strong style={{ color: 'var(--text)' }}>연속 번호</strong> 쌍·끝자리 겹침</li>
            <li>· <strong style={{ color: 'var(--text)' }}>번호 간 간격</strong> — 평균 7.5가 이론값</li>
          </ul>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px', background: 'rgba(255,107,107,0.06)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 10, padding: '11px 14px' }}>
            ⚠️ 통계 패턴은 <strong style={{ color: '#FF6B6B' }}>학습 목적</strong>입니다. 어떤 패턴도 다음 회차의 당첨 확률에 영향을 주지 않습니다.
          </p>
        </section>

        {/* 4. 균형형 선호 이유 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>왜 사람들은 균형형을 선호할까?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            행동경제학적으로 사람들은 <code style={{ color: 'var(--text)' }}>1, 2, 3, 4, 5, 6</code>보다 <code style={{ color: 'var(--text)' }}>7, 12, 19, 24, 33, 41</code>이 더 &quot;무작위 같다&quot;고 느낍니다 — 인간 직관은 &quot;균등 분포 = 자연스러움&quot;으로 인식하기 때문.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            실제 두 조합 모두 <strong style={{ color: 'var(--text)' }}>같은 1/8,145,060 확률</strong>입니다. 다만 균형형 선택의 실용적 이유:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { title: '단독 1등 가능성 ↑', desc: '일반인이 잘 안 고르는 조합 → 동시 당첨자 적음' },
              { title: '당첨금 분배 적음 ↑', desc: '1등이 5명일 때보다 1명일 때 수령액 5배' },
              { title: '심리적 만족', desc: '"제대로 무작위인 것 같다"는 자기만족' },
              { title: '단순 패턴 회피', desc: '1,2,3,4,5,6은 절대 안 나오지만 같은 확률' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{c.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 생일 번호 함정 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>생일 번호의 함정</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            많은 사람이 가족·연인 생일로 번호를 고르면 다음과 같은 편중이 생깁니다:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0, marginBottom: '12px' }}>
            <li>· <strong style={{ color: 'var(--text)' }}>1~12 (월)</strong>: 너무 자주 선택됨</li>
            <li>· <strong style={{ color: 'var(--text)' }}>1~31 (일)</strong>: 32~45는 거의 무시됨</li>
            <li>· <strong style={{ color: 'var(--text)' }}>19XX·20XX 끝 두자리</strong>: 일부 번호 편중</li>
          </ul>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            결과: 1등 당첨 시 <strong style={{ color: 'var(--text)' }}>동시 당첨자가 많아져 분배액이 줄어듭니다</strong>. 본 도구의 [생일 제외형] 모드는 32~45 비중을 60%로 강제해 흔한 조합을 회피합니다.
          </p>
        </section>

        {/* 6. 한국 로또 세금 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>한국 로또 세금 (2026년 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['당첨금 구간', '세율', '구성'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['200만원 이하',           '0% (비과세)',  '4·5등 자동 면세'],
                  ['200만원 ~ 3억원',         '22%',          '소득세 20% + 지방세 2%'],
                  ['3억원 초과 부분',         '33%',          '소득세 30% + 지방세 3%'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>1등 (25억) 시 실수령</strong>:
            {' '}3억까지 22% 세금 + 22억은 33% 세금 → 약 7.3억 세금 → <strong style={{ color: '#3EFF9B' }}>약 17.7억 실수령</strong>.
            정확한 세금은 다른 소득 합산·신고 방식에 따라 달라지므로 <strong style={{ color: 'var(--text)' }}>1등 당첨 시 세무사 상담 필수</strong>.
          </p>
        </section>

        {/* 7. 도박 의존 예방 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>도박 의존 예방 — 건강하게 즐기기</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            로또는 합법 사행성 게임이지만, 의존 우려가 발생할 수 있습니다. <strong style={{ color: 'var(--text)' }}>다음 신호가 있다면 주의가 필요</strong>합니다:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            {[
              '정해진 예산을 자주 초과 구매',
              '손실 만회 위해 더 많이 구매',
              '가족·일·일상에 지장',
              '끊으려 해도 다시 구매',
              '구매 사실을 가족에게 숨김',
              '돈 빌려서 구매',
            ].map((sign, i) => (
              <div key={i} style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.6 }}>
                ⚠️ {sign}
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(62,255,155,0.06)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#3EFF9B', marginBottom: '8px' }}>📞 도움이 필요하시면</p>
            <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, listStyle: 'none', padding: 0, margin: 0, fontFamily: 'Noto Sans KR, sans-serif' }}>
              <li>· <strong style={{ color: 'var(--text)' }}>한국도박문제예방치유원</strong>: <a href="tel:1336" style={{ color: '#3EFF9B', fontWeight: 700 }}>1336</a> (24시간 무료, 익명)</li>
              <li>· 인터넷 상담: kcgp.or.kr</li>
              <li>· 단도박 모임 (GA): dandobakkorea.org</li>
            </ul>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
              <strong style={{ color: 'var(--text)' }}>건강한 로또 즐기기</strong>: 가처분 소득의 1% 이내(예: 월 200만원 → 월 2만원), &quot;오락비&quot; 분류, 손실 인정, 일확천금 기대 X.
            </p>
          </div>
        </section>

        {/* 8. FAQ — accordion */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '자동과 수동 중 당첨 확률이 높은 것은?',
                a: '<strong>수학적으로 자동과 수동의 당첨 확률은 정확히 동일</strong>합니다. 각 번호 조합은 독립적이며, 어떤 번호도 다른 번호보다 당첨 확률이 높지 않습니다. 과거 당첨 번호가 미래 결과에 영향을 주지 않습니다(독립 시행). 본 도구의 8가지 생성 모드는 모두 1/8,145,060 확률이며, 차이는 조합의 패턴과 동시 당첨자 수에만 영향이 있을 수 있습니다.',
              },
              {
                q: '균형형이나 생일 제외형이 당첨에 유리한가요?',
                a: '<strong>당첨 확률 자체는 변화 없습니다</strong> (모두 1/8,145,060). 그러나 부수적 효과는 있습니다 — 균형형은 1,2,3,4,5,6 같은 단순 패턴 회피, 생일 제외형은 32~45 포함으로 흔한 조합 회피 → <strong>1등 동시 당첨자 수가 줄어들어 당첨금 분배액 ↑</strong>. 이는 1등 당첨 시 효과이며, 당첨 자체 확률은 동일합니다.',
              },
              {
                q: '확률 시뮬레이터의 결과는 정확한가요?',
                a: '본 도구의 시뮬레이터는 무작위 추첨을 반복한 통계적 결과입니다. 10,000회 시뮬레이션 시 <strong>5등 약 222회·4등 약 14회·3등 0~1회</strong> 예상이며, 1·2등은 거의 모든 경우 0회입니다. 이는 평균이며, 실제 구매 시 동일한 결과를 보장하지 않습니다. 시뮬레이션은 <strong>학습·재미용으로만 활용</strong>하세요.',
              },
              {
                q: '로또 번호 통계가 미래 당첨 번호 예측에 도움이 되나요?',
                a: '<strong>도움이 되지 않습니다.</strong> 로또는 매 회차 독립 시행이며, "자주 나온 번호" "안 나온 번호"는 다음 회차와 무관합니다. 이를 <strong>"도박사의 오류(Gambler&apos;s Fallacy)"</strong>라고 합니다. 예: "지난 10회 7번이 안 나왔으니 이번엔 나올 것" → 잘못된 추론. 각 회차의 7번 출현 확률은 항상 6/45입니다. 본 도구의 통계는 학습 목적이며 예측 X.',
              },
              {
                q: '로또에 얼마까지 쓰는 것이 적절한가요?',
                a: '한국도박문제예방치유원의 권장 — <strong>가처분 소득의 1% 이내</strong> (예: 월 200만원 → 월 2만원), "오락비"로 명확히 분류, 손실을 만회하려는 추가 구매 X, 가족·일·일상에 영향 없는 범위. 신호 점검: 정해진 예산을 자주 초과 / 손실 만회 위해 더 사기 / 끊기 어렵다고 느낌 → 즉시 <a href="tel:1336" style="color: var(--accent); font-weight: 600;">1336</a> 상담. 로또는 일확천금이 아닌 <strong>"재미"</strong>로 즐기시기 바랍니다.',
              },
              {
                q: '저장된 번호는 어디에 보관되나요?',
                a: '사용자 브라우저의 <strong>localStorage</strong>에 저장됩니다. 회원가입·로그인 불필요, 빠른 접근, 사생활 보호. 단, 같은 브라우저·기기에서만 접근 가능하며 캐시 삭제·시크릿 모드 시 사라집니다. 중요한 번호는 별도로 메모해 두세요.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
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
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { href: '/tools/life/random',         icon: '🎲', name: '랜덤 추첨기',           desc: '범용 무작위 뽑기' },
              { href: '/tools/life/dutch',          icon: '💸', name: '더치페이 계산기',       desc: '여러 명 비용 분배' },
              { href: '/tools/life/unit-price',     icon: '💵', name: '단가 비교 계산기',      desc: '쇼핑 가성비 비교' },
              { href: '/tools/finance/salary',      icon: '💰', name: '연봉 실수령액 계산기',  desc: '월급 세후 계산' },
              { href: '/tools/finance/compound',    icon: '📈', name: '복리 계산기',           desc: '저축·투자 누적' },
              { href: '/tools/finance/inheritance', icon: '🏛️', name: '상속세 계산기',          desc: '대규모 자산 세금' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>동행복권 공식</strong> — dhlottery.co.kr</li>
            <li><strong style={{ color: 'var(--text)' }}>한국도박문제예방치유원</strong> — 1336 (24시간), kcgp.or.kr</li>
            <li><strong style={{ color: 'var(--text)' }}>단도박 모임 (GA Korea)</strong> — dandobakkorea.org</li>
            <li><strong style={{ color: 'var(--text)' }}>국세청</strong> — 기타소득세·지방소득세 (당첨금 세금)</li>
          </ul>
        </section>

        {/* 강조된 면책 — 페이지 하단 */}
        <section style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 14, padding: '20px 22px' }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#FF6B6B', marginBottom: '10px', fontFamily: 'Noto Sans KR, sans-serif' }}>
            ⚠️ 본 도구의 책임 사용 고지
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85, marginBottom: '10px', fontFamily: 'Noto Sans KR, sans-serif' }}>
            본 도구는 <strong>로또 번호 생성·분석·시뮬레이션을 위한 재미·교육용 시뮬레이터</strong>입니다. 수학적으로 어떤 번호 조합도 1등 확률은 1/8,145,060로 동일하며, 어떤 생성 모드·분석·필터도 당첨 확률에 영향을 주지 않습니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, fontFamily: 'Noto Sans KR, sans-serif' }}>
            로또는 사행성 게임이므로 <strong style={{ color: 'var(--text)' }}>본인의 경제 능력 안에서만 구매</strong>하시고, &apos;재미·즐거움&apos; 목적으로 접근하시기를 권장합니다. 일확천금 기대는 자제하세요. 도박 의존 우려가 있다면 <strong style={{ color: '#FF6B6B' }}>한국도박문제예방치유원 1336</strong>(24시간 무료) 또는 kcgp.or.kr에서 도움받으실 수 있습니다.
          </p>
        </section>

      </div>
    </div>
  )
}
