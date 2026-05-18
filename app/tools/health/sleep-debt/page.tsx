import Link from 'next/link'
import SleepDebtClient from './SleepDebtClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/health/sleep-debt',
  title: '수면 부채 트래커 — 7·14·30일 누적 부족 시간·회복 계획·규칙성',
  description:
    '지난 7·14·30일 누적 수면 부족 시간 + 회복까지 며칠 더 자야 0이 되는지 자동. 막대 차트·수면 규칙성·권장 취침 시각 역산.',
  keywords: [
    '수면 부채', '수면 부족 계산기', '수면 시간 계산기', '수면 트래커',
    '권장 수면 시간', '수면 부채 회복', '주말 몰아 자기', 'sleep debt',
    '취침 시각 계산', '기상 시각 계산', '수면 규칙성', '수면 일관성',
    '수면 다이어리', '낮잠 효과', '수면 부족 증상', '청소년 수면',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

export default function SleepDebtPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>건강·웰빙</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        😴 수면 부채 트래커
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        지난 7·14·30일 누적 수면 부족 시간 + <strong style={{ color: 'var(--text)' }}>회복까지 며칠 더 자야 0</strong>이 되는지 자동.
      </p>

      <SleepDebtClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 수면 부채란? */}
        <section>
          <h2 style={sectionTitle}>수면 부채(Sleep Debt)란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            수면 부채는 <strong style={{ color: 'var(--text)' }}>본인의 권장 수면량 대비 부족한 시간이 누적된 양</strong>입니다.
            예: 매일 8시간 필요한데 7시간만 자면 1시간씩 부채가 쌓여, 일주일이면 7시간 부채.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            단기 부채(1~2주)는 회복 가능하지만, <strong style={{ color: 'var(--text)' }}>1개월 이상 누적된 만성 부채는
            인지 기능·면역·대사·정서에 일부 영구적 손상</strong>을 남길 수 있습니다(Walker 2017, Walker &amp; Stickgold).
          </p>
        </section>

        {/* 2. 본 도구의 계산 모델 */}
        <section>
          <h2 style={sectionTitle}>본 도구의 계산 모델</h2>
          <div style={card}>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 12px' }}>
              <strong>일별 부채</strong> = 목표 수면 - 실제 수면
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: '18px', margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>부족한 날</strong>: 부족분 그대로 부채에 누적</li>
              <li><strong style={{ color: 'var(--text)' }}>초과한 날</strong>: 초과분 × <strong>0.5</strong>만큼 부채 상쇄 (회복 효율)</li>
              <li><strong style={{ color: 'var(--text)' }}>누적 부채</strong>: 지난 N일 합산, 최소 0 (음수 부채 X)</li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', marginBottom: 0, lineHeight: 1.7 }}>
              💡 <strong>왜 회복 효율 0.5?</strong> 연구상 「몰아 자기」로는 누적 부채의 30~50%만 회복됩니다.
              본 도구는 보수적으로 50%를 적용 — 매일 +1시간 일주일이 가장 효과적인 회복 방법입니다.
            </p>
          </div>
        </section>

        {/* 3. 연령별 권장 수면 */}
        <section>
          <h2 style={sectionTitle}>연령별 권장 수면 시간 (NSF·CDC)</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>연령</th>
                  <th style={headCell}>권장 시간</th>
                  <th style={headCell}>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>신생아 (0~3개월)</td><td style={cell}><strong>14~17h</strong></td><td style={cell}>자주 깸 정상</td></tr>
                <tr><td style={cell}>영아 (4~11개월)</td><td style={cell}><strong>12~15h</strong></td><td style={cell}>낮잠 포함</td></tr>
                <tr><td style={cell}>유아 (1~2세)</td><td style={cell}><strong>11~14h</strong></td><td style={cell}>낮잠 1~2회</td></tr>
                <tr><td style={cell}>학령전 (3~5세)</td><td style={cell}><strong>10~13h</strong></td><td style={cell}>낮잠 점차 ↓</td></tr>
                <tr><td style={cell}>학령기 (6~13세)</td><td style={cell}><strong>9~11h</strong></td><td style={cell}>학습·성장 영향</td></tr>
                <tr><td style={cell}>청소년 (14~17세)</td><td style={cell}><strong style={{ color: '#FFB83E' }}>8~10h</strong></td><td style={cell}>한국 평균 6.3h — 심각 부족</td></tr>
                <tr><td style={cell}>젊은 성인 (18~25세)</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>7~9h</strong></td><td style={cell}>대학생 평균 6.5h</td></tr>
                <tr><td style={cell}>성인 (26~64세)</td><td style={cell}><strong style={{ color: 'var(--accent)' }}>7~9h</strong></td><td style={cell}>대부분 사람이 「7시간 미만」으로 부족</td></tr>
                <tr><td style={cell}>고령자 (65세+)</td><td style={cell}><strong>7~8h</strong></td><td style={cell}>분절 수면 흔함</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px' }}>
            💡 본 도구는 <strong style={{ color: 'var(--text)' }}>본인 목표를 5~10시간 자유 설정</strong> 가능. 본인이 7시간으로도 개운하면 7시간이 목표.
          </p>
        </section>

        {/* 4. 수면 부족 영향 */}
        <section>
          <h2 style={sectionTitle}>수면 부족 누적 영향 — 시간별</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { hrs: '1시간 부족 / 1일', color: '#3EFF9B', desc: '집중력 ~10% ↓, 짜증 ↑, 다음날 회복 가능' },
              { hrs: '7시간 부채 / 7일', color: '#FFB83E', desc: '주의력 BAC 0.05 수준 (음주운전급), 면역 ↓' },
              { hrs: '14시간 부채 / 2주', color: '#FF8C3E', desc: '인슐린 저항성 ↑, 식욕 호르몬 망가짐, 체중 ↑' },
              { hrs: '30시간 부채 / 1개월', color: '#FF6B6B', desc: '명확한 인지 손상, 우울·불안 ↑, 심혈관 위험 ↑' },
              { hrs: '24시간 깨어있음', color: '#FF6B6B', desc: 'BAC 0.10 = 면허취소 수준의 판단력 손상' },
              { hrs: '4h × 6일', color: '#FF3E3E', desc: '치매 위험 단백질(베타-아밀로이드) 축적 가속' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${b.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '6px', fontFamily: 'Inter, system-ui, sans-serif' }}>{b.hrs}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 회복 전략 */}
        <section>
          <h2 style={sectionTitle}>수면 부채 회복 전략 — 무엇이 진짜 효과 있나?</h2>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>전략</th>
                  <th style={headCell}>효과</th>
                  <th style={headCell}>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cell}>매일 +1h × 7~10일</td>
                  <td style={cell}><strong style={{ color: '#3EFF9B' }}>⭐⭐⭐⭐⭐</strong></td>
                  <td style={cell}>최고. 생체리듬 유지 + 점진적 회복</td>
                </tr>
                <tr>
                  <td style={cell}>20~30분 낮잠 (오후 1~3시)</td>
                  <td style={cell}><strong style={{ color: '#3EFF9B' }}>⭐⭐⭐⭐</strong></td>
                  <td style={cell}>부채 일부 상쇄 + 인지 ↑. 30분 초과 시 야간 수면 방해</td>
                </tr>
                <tr>
                  <td style={cell}>수면 환경 개선 (18~20℃·어둠·조용)</td>
                  <td style={cell}><strong style={{ color: '#3EFF9B' }}>⭐⭐⭐⭐</strong></td>
                  <td style={cell}>수면 효율 ↑ — 같은 시간이라도 깊이 ↑</td>
                </tr>
                <tr>
                  <td style={cell}>주말 +2~3h 늦잠</td>
                  <td style={cell}><strong style={{ color: '#FFB83E' }}>⭐⭐</strong></td>
                  <td style={cell}>일부 효과, 다만 다음 주 생체리듬 깨짐 (사회적 시차)</td>
                </tr>
                <tr>
                  <td style={cell}>한 번에 12h+ 몰아 자기</td>
                  <td style={cell}><strong style={{ color: '#FF6B6B' }}>⭐</strong></td>
                  <td style={cell}>회복 효율 30%, 두통·멍한 느낌 (잠 관성)</td>
                </tr>
                <tr>
                  <td style={cell}>카페인으로 버티기</td>
                  <td style={cell}><strong style={{ color: '#FF6B6B' }}>❌</strong></td>
                  <td style={cell}>부채는 그대로. 다음날 더 큰 부채로 돌아옴</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. FAQ */}
        <section>
          <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 수면 부채는 정말 회복되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>단기(1~2주)는 회복 가능</strong>합니다.
              매일 +1시간씩 일주일이면 7시간 부채 회복 가능.
              <br /><br />
              그러나 <strong style={{ color: '#FF8C3E' }}>1개월 이상 만성 부채</strong>는 일부 영구 손상이 보고됩니다(Sleep Walker 2017, Belenky et al. 2003).
              인지 기능은 회복돼도 본인이 느끼지 못하는 「만성 적응」 상태가 되며, 노화·치매 위험이 누적됩니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 주말에 몰아 자면 부채 0이 되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#FF6B6B' }}>아닙니다.</strong>
              연구상 회복 효율은 30~50% — 7시간 부채를 14시간 몰아 자도 약 3~5시간만 회복.
              <br /><br />
              게다가 주말 늦잠은 <strong style={{ color: 'var(--text)' }}>사회적 시차(social jet lag)</strong>를 만들어
              월요일 아침 더 피곤하고 다음 주 부채를 가속합니다. 본 도구는 매일 +1시간 점진 회복을 권장.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 수면 시간은 충분한데 피곤한 이유는?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>수면 「질」</strong>이 낮을 수 있습니다. 시간만큼 중요한 요인들:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>수면 규칙성 (취침·기상 시각 일관성) — 본 도구 표시</li>
                <li>방해 요소 (소음·빛·온도·반려동물·아이)</li>
                <li>수면 무호흡·코골이 — 본인 인지 어려움, 가족 관찰 필요</li>
                <li>알코올·카페인·과식 — 깊은 수면 차단</li>
                <li>스트레스·우울 — 표면적 수면만 가능</li>
              </ul>
              지속되면 수면 클리닉 진단 (수면 다원 검사 / PSG) 권장.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 낮잠은 부채 회복에 도움이 되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#3EFF9B' }}>20~30분 낮잠은 효과적</strong>입니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>10~20분: 가벼운 회복 + 인지·기분 ↑</li>
                <li>20~30분: 부채 일부 상쇄 (특히 오후 1~3시)</li>
                <li>30~60분: 깊은 수면 단계 진입 → 깰 때 멍함 (잠 관성)</li>
                <li>60분+: 야간 수면 방해 가능 (지속 X)</li>
              </ul>
              본 도구는 낮잠을 별도 기록하지 않지만, 야간 수면이 부족한 날은 직접 입력 모드로 「6h + 낮잠 0.5h = 6.5h」로 합산 가능.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 본 도구의 데이터는 어디 저장되나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: '#3EFF9B' }}>본인 브라우저(localStorage)에만 저장</strong>됩니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>✅ youtil 서버 전송 X</li>
                <li>✅ 익명 사용 (이름·이메일 X)</li>
                <li>⚠️ 시크릿 모드·다른 기기는 자동 동기화 X</li>
                <li>⚠️ 브라우저 데이터 삭제 시 사라짐</li>
              </ul>
              민감한 생활 기록인 만큼 본인 책임으로 관리됩니다.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 한국 평균 수면 시간은?</summary>
            <div style={faqAnswer}>
              OECD 수면 통계상 <strong style={{ color: '#FF6B6B' }}>한국이 OECD 최하위권</strong>입니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>한국 성인 평균: <strong style={{ color: 'var(--text)' }}>약 7시간 41분</strong> (OECD 평균 8시간 22분 대비 41분 부족)</li>
                <li>한국 청소년: <strong style={{ color: 'var(--text)' }}>약 6.3시간</strong> (권장 8~10h 대비 2~4h 부족)</li>
                <li>주당 부채: 성인 ≈ 5h, 청소년 ≈ 17h 누적</li>
              </ul>
              본 도구는 한국인의 만성 수면 부족을 객관적으로 파악하기 위한 첫걸음.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q7. 수면 클리닉은 언제 가야 하나요?</summary>
            <div style={faqAnswer}>
              다음 신호가 있으면 수면 클리닉 진단 권장:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>3주 이상 잠들기 어려움 또는 자주 깸 (만성 불면)</li>
                <li>심한 코골이 + 가족이 「숨이 멎는 듯」 관찰 (수면 무호흡)</li>
                <li>7~8시간 자도 낮에 졸림 + 집중력 ↓</li>
                <li>다리 불편함·움찔거림으로 잠 못 듦 (하지불안증후군)</li>
                <li>악몽·잠꼬대·몽유 빈번</li>
                <li>본 도구 누적 부채 30h+ 만성 상태</li>
              </ul>
              한국 수면학회 등록 클리닉에서 <strong style={{ color: 'var(--text)' }}>수면 다원 검사(PSG)</strong> 가능.
            </div>
          </details>
        </section>

        {/* 7. 면책 */}
        <section>
          <h2 style={sectionTitle}>⚠️ 의료 면책</h2>
          <div style={{
            background: 'rgba(255, 184, 62, 0.06)',
            border: '1px solid rgba(255, 184, 62, 0.25)',
            borderRadius: '12px',
            padding: '18px 22px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.8,
          }}>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>본 도구는 <strong>일반 트래킹·교육</strong>이며 수면 장애 진단·치료 X.</li>
              <li>회복 효율 0.5는 평균 모델 — 개인차 큼.</li>
              <li>만성 불면·과수면·수면무호흡 의심 시 수면 클리닉.</li>
              <li>정신건강 위기상담: <strong>1577-0199</strong> · 자살예방 <strong>109</strong>.</li>
              <li>본 도구 데이터는 본인 브라우저에만 저장.</li>
            </ul>
          </div>
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>🔗 함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Link href="/tools/health/caffeine" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>☕</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>카페인 잔존량 트래커</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>취침 시 잔존량 영향</div>
            </Link>
            <Link href="/tools/health/blood-alcohol" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍺</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>혈중알코올 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>알코올과 수면 질</div>
            </Link>
            <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>대사·식욕과 수면</div>
            </Link>
            <Link href="/tools/life/pomodoro" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🍅</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>뽀모도로 타이머</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>집중·휴식 관리</div>
            </Link>
            <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량 계산기</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>수면·체중 상관</div>
            </Link>
            <Link href="/tools/date/server-time" style={{ ...card, display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>실시간 서버 시간</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>정확한 KST</div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
