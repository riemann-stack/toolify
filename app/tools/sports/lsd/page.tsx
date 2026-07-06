import Link from 'next/link'
import LsdClient from './LsdClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/lsd',
  title: 'LSD·이지런 페이스 계산기 — 적정 이지 페이스·존2 심박·롱런 보급',
  description:
    '최근 기록으로 LSD(롱슬로디스턴스)·이지런 적정 페이스 범위 + 존2 심박 + 회색지대(정크 마일) 경고 + 롱런 수분·탄수 보급 플래너. 유산소 토대를 제대로 쌓는 법.',
  keywords: [
    'LSD 러닝', 'LSD 페이스', '이지런 페이스', '롱슬로디스턴스', '존2 러닝', 'Zone2',
    '이지런 너무 빠름', '정크 마일', '회색지대 러닝', '유산소 러닝', '롱런 페이스',
    '80 20 러닝', '마라톤 LSD', '대화 가능 페이스', '존2 심박',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px',
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
const ACCENT = '#059669'

const FAQ_LD = [
              { q: 'LSD는 얼마나 자주, 얼마나 길게 해야 하나요?', a: '주간 거리의 상당 부분을 이지 강도로 채우되, 가장 긴 롱런은 주 1회가 일반적입니다. 거리는 무리하지 말고 주당 10% 이내로 늘리세요. 초보자는 시간(예: 60~90분)으로 잡는 편이 안전합니다.' },
              { q: '너무 느리게 뛰면 폼이 망가지지 않나요?', a: '이지 페이스에서도 케이던스(분당 보수)는 유지하고 보폭만 줄이면 폼은 무너지지 않습니다. 오히려 느린 러닝에서 효율적인 착지·자세를 익히기 좋습니다.' },
              { q: '오르막에서는 페이스를 맞춰야 하나요?', a: '아니요. LSD는 페이스보다 ‘강도(편안함·심박)’가 기준입니다. 오르막에서는 페이스가 느려지고 심박이 올라가는 게 정상이니, 심박/호흡을 기준으로 강도를 일정하게 유지하세요.' },
              { q: '심박계가 없으면 어떻게 하나요?', a: '대화 테스트가 가장 확실합니다. 옆 사람과 또는 혼잣말로 한 문장을 끊김 없이 말할 수 있으면 이지 강도입니다. 위 계산기의 페이스 범위를 보조 기준으로 쓰세요.' },
              { q: '이지런만 하면 빨라지나요?', a: '토대는 커지지만 속도 자극이 없으면 정체될 수 있습니다. 80%는 이지(LSD), 20%는 인터벌·템포로 채우는 ‘80/20’ 조합이 가장 효과적입니다.' },
            ]

export default function LsdPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />LSD·이지런 페이스 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        최근 기록으로 <strong style={{ color: 'var(--text)' }}>적정 이지 페이스 범위·존2 심박</strong>을 구하고, &lsquo;너무 빠른 이지런(정크 마일)&rsquo;을 피하세요. 롱런 보급 플래너 포함.
      </p>

      <LsdClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. LSD란 */}
        <section>
          <h2 style={sectionTitle}>LSD(롱슬로디스턴스)란?</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            LSD는 <strong style={{ color: 'var(--text)' }}>긴 거리를 천천히, 편안하게</strong> 달리는 저강도 유산소 훈련입니다. 인터벌·템포 같은 고강도 훈련이 &lsquo;엔진 출력&rsquo;을 키운다면, LSD는 그 출력을 오래 유지하게 하는 <strong style={{ color: 'var(--text)' }}>유산소 엔진의 크기 자체</strong>를 키웁니다.
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            천천히 오래 달리면 미토콘드리아 수·모세혈관 밀도가 늘고 지방을 연료로 쓰는 능력이 좋아집니다. 그래서 엘리트 러너일수록 전체 훈련의 <strong style={{ color: 'var(--text)' }}>약 80%를 쉬운 강도</strong>로 채웁니다(80/20 법칙).
          </p>
        </section>

        {/* 2. 너무 빨리 뛰면 안 되는 이유 */}
        <section>
          <h2 style={sectionTitle}>이지런을 너무 빨리 뛰면 안 되는 이유</h2>
          <div style={{ ...card, borderLeft: `3px solid #A16207`, marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>🚦 회색지대(Gray Zone) = 정크 마일</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              마라톤 페이스보다 살짝 느린 &ldquo;힘들진 않은데 회복도 안 되는&rdquo; 애매한 속도입니다. 대부분의 아마추어가 매일 여기서 달립니다 — 충분히 느리지 않아 유산소 적응은 약하고, 충분히 빠르지도 않아 자극도 부족하며, 피로만 누적돼 부상·정체로 이어집니다.
            </p>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            쉬운 날은 <strong style={{ color: 'var(--text)' }}>의식적으로 더 느리게</strong> 달려야 합니다. &ldquo;이렇게 천천히 뛰어도 되나?&rdquo; 싶을 만큼이 정답인 경우가 많습니다. 빠른 자극은 주 1~2회 인터벌·템포에서만 주세요.
          </p>
        </section>

        {/* 3. 적정 페이스 잡는 3가지 기준 */}
        <section>
          <h2 style={sectionTitle}>적정 이지 페이스 잡는 3가지 기준</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
            {[
              { t: '① 대화 테스트', d: '옆 사람과 문장을 끊김 없이 말할 수 있는 속도. 말이 끊기면 너무 빠른 것. 장비 없이 가장 확실한 기준.' },
              { t: '② 존2 심박', d: '최대심박의 약 60~70%. 코로만 호흡해도 버틸 정도. 심박계가 있다면 위 계산기로 BPM 구간 확인.' },
              { t: '③ 페이스 기준', d: '10K 페이스보다 약 20~30% 느리게(대개 마라톤 페이스보다 30~75초/km 느림). 위 계산기가 자동 산출.' },
            ].map((x, i) => (
              <div key={i} style={{ ...card }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>{x.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3-2. 존2 판정 기준 3종 비교 */}
        <section>
          <h2 style={sectionTitle}>존2 판정 기준 3종 비교 — 같은 &lsquo;존2&rsquo;라도 숫자가 다르다</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            존2를 정하는 방식은 크게 셋 — <strong style={{ color: 'var(--text)' }}>최대심박 백분율(%HRmax)</strong>, <strong style={{ color: 'var(--text)' }}>카보넨(심박예비, HRR)</strong>, <strong style={{ color: 'var(--text)' }}>젖산역치 심박(LTHR)</strong> 기준입니다. 같은 사람이라도 어느 방식을 쓰느냐에 따라 BPM 경계가 크게 달라집니다. 40세·안정시 심박 60인 러너(Tanaka 최대심박 180)를 예로 들면:
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>기준</th>
                    <th scope="col" style={headCell}>존2 정의</th>
                    <th scope="col" style={headCell}>예시 BPM</th>
                    <th scope="col" style={headCell}>특징</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={cell}><strong>%HRmax</strong></td>
                    <td style={cell}>최대심박 × 60~70%</td>
                    <td style={cell}>108~126</td>
                    <td style={cell}>가장 단순하지만 안정시 심박을 무시 — 훈련된 러너에겐 지나치게 낮게 나오는 경향</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>카보넨(HRR)</strong></td>
                    <td style={cell}>안정시 + (최대 − 안정시) × 60~70%</td>
                    <td style={cell}>132~144</td>
                    <td style={cell}>안정시 심박을 반영해 개인화. 이 계산기가 안정시 심박 입력 시 쓰는 방식</td>
                  </tr>
                  <tr>
                    <td style={cell}><strong>LTHR</strong></td>
                    <td style={cell}>젖산역치 심박 × 85~89%<br />(Friel 러닝 기준)</td>
                    <td style={cell}>140~147<br />(LTHR 165 가정)</td>
                    <td style={cell}>30분 단독 타임트라이얼의 마지막 20분 평균 심박으로 실측 — 나이 공식 오차가 없음</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginTop: 12 }}>
            하한만 봐도 <strong style={{ color: 'var(--text)' }}>108 vs 132 vs 140 — 30bpm 이상</strong> 벌어집니다. 108bpm은 훈련된 러너에겐 빠르게 걷기 수준이라, %HRmax 단독 기준은 강도를 저평가하기 쉽습니다. 안정시 심박을 알고 있다면 반드시 입력해 카보넨 값을 쓰고, 스포츠워치의 &lsquo;존2&rsquo; 알림이 셋 중 어느 방식으로 계산된 것인지도 확인하세요. 세 방식의 숫자가 달라도 목표 강도는 같습니다 — 헷갈리면 대화 테스트로 검증하면 됩니다.
          </p>
        </section>

        {/* 4. 롱런 영양·수분 */}
        <section>
          <h2 style={sectionTitle}>롱런 영양·수분 가이드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: '수분', d: '15~20분마다 한두 모금. 한 번에 많이 마시기보다 자주 나눠 마십니다. 더운 날엔 전해질(나트륨)도 함께.' },
              { t: '탄수 보급', d: '60~75분 미만이면 물만으로 충분. 그 이상이면 30~45분마다 탄수 30~60g(젤 1개 ≈ 25g)을 미리미리 — 배고픔을 느끼기 전에.' },
              { t: 'time on feet', d: '마라톤 준비는 거리보다 ‘발 위에서 보낸 시간’이 핵심. 같은 1시간이라도 천천히 오래가 적응에 더 유리합니다.' },
              { t: '페이싱', d: '처음 5~10분은 더 천천히 워밍업. 컨디션이 좋으면 마지막 구간만 살짝 올리는 네거티브 스플릿을 연습하세요.' },
            ].map((x, i) => (
              <div key={i} style={{ ...card, display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT, minWidth: 78, flexShrink: 0 }}>{x.t}</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{x.d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4-2. 풀코스 16주 롱런 진행 예시 */}
        <section>
          <h2 style={sectionTitle}>풀코스 16주 롱런 진행 예시</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 12 }}>
            마라톤 준비의 뼈대는 <strong style={{ color: 'var(--text)' }}>주 1회 롱런의 점진적 확장</strong>입니다. 아래는 최장 12~14km를 이미 소화할 수 있는 러너가 16주에 걸쳐 롱런을 32km까지 끌어올리는 예시입니다. &lsquo;3주 늘리고 1주 줄이는&rsquo; 감량주 리듬과 대회 전 3주 테이퍼가 골격입니다. 시간은 LSD 페이스 6:30/km 가정 — 본인 시간은 위 계산기가 산출한 페이스로 잡으세요.
          </p>
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>주차</th>
                    <th scope="col" style={headCell}>단계</th>
                    <th scope="col" style={headCell}>롱런 거리</th>
                    <th scope="col" style={headCell}>6:30/km 기준 시간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={cell}>1~3주</td><td style={cell}>기초 쌓기</td><td style={cell}>14 → 16 → 18km</td><td style={cell}>91 → 117분</td></tr>
                  <tr><td style={cell}>4주</td><td style={cell}>감량주</td><td style={cell}>14km</td><td style={cell}>91분</td></tr>
                  <tr><td style={cell}>5~6주</td><td style={cell}>축적</td><td style={cell}>20 → 22km</td><td style={cell}>130 → 143분</td></tr>
                  <tr><td style={cell}>7주</td><td style={cell}>감량주</td><td style={cell}>16km</td><td style={cell}>104분</td></tr>
                  <tr><td style={cell}>8~9주</td><td style={cell}>축적</td><td style={cell}>24 → 26km</td><td style={cell}>156 → 169분</td></tr>
                  <tr><td style={cell}>10주</td><td style={cell}>감량주</td><td style={cell}>18km</td><td style={cell}>117분</td></tr>
                  <tr><td style={cell}>11~13주</td><td style={cell}><strong>피크</strong></td><td style={cell}>28 → 30 → 32km</td><td style={cell}>182 → 208분</td></tr>
                  <tr><td style={cell}>14~15주</td><td style={cell}>테이퍼</td><td style={cell}>22 → 16km</td><td style={cell}>143 → 104분</td></tr>
                  <tr><td style={cell}>16주</td><td style={cell}>대회 주</td><td style={cell}>8~10km + 풀코스</td><td style={cell}>—</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.9, marginTop: 12 }}>
            주당 10% 규칙은 롱런 단독이 아니라 <strong style={{ color: 'var(--text)' }}>주간 총 거리</strong> 기준입니다. 롱런 자체는 회당 2km 이내로 늘리고, 3~4주마다 감량주로 피로를 털어내세요. 18km(약 2시간)부터는 매번 보급이 필요한 거리이므로, 위 계산기의 <strong style={{ color: 'var(--text)' }}>롱런 보급 플래너</strong>에 그 주의 거리를 넣어 수분·탄수 시점을 미리 계획하고, 피크 롱런에서는 대회 당일 먹을 젤·음료를 그대로 리허설하세요. 예시보다 컨디션이 처지면 거리를 유지하거나 감량주를 앞당기는 쪽이 안전합니다.
          </p>
        </section>

        {/* 5. 계산 기준·공식·한계 */}
        <section>
          <h2 style={sectionTitle}>계산 기준·공식·한계</h2>
          <div style={{ ...card }}>
            <ul style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>페이스 환산</strong>: 입력 기록을 Riegel 공식(T2 = T1 × (D2/D1)<sup>1.06</sup>)으로 10K·마라톤 페이스로 환산. 이지·LSD = 10K 환산 페이스의 약 1.2~1.3배(20~30% 느리게), 임계(템포) = 약 1.05배.</li>
              <li><strong style={{ color: 'var(--text)' }}>최대심박·존2</strong>: Tanaka 공식(208 − 0.7 × 나이). 안정시 심박을 입력하면 Karvonen(심박예비)으로 존2를 60~70%로, 미입력 시 최대심박의 60~70%로 산출.</li>
              <li><strong style={{ color: 'var(--text)' }}>훈련 배분</strong>: 저강도 80% : 고강도 20%(80/20 법칙)에 기반한 일반 가이드.</li>
              <li><strong style={{ color: 'var(--text)' }}>한계</strong>: Riegel은 짧은 기록에서 마라톤을 다소 빠르게 예측하는 경향이 있고, 공식 심박은 개인차(±10bpm 이상)가 큽니다. 모든 값은 참고용 추정 범위이며, 실제 강도는 &lsquo;대화 가능 여부·체감&rsquo;을 우선하세요.</li>
            </ul>
          </div>
        </section>

        {/* 6. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ ...card, padding: '12px 16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Q{i + 1}. {f.q}</summary>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 10 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { href: '/tools/sports/interval-training', icon: '🏃‍♂️', name: '인터벌 훈련 계산기', desc: '훈련의 20% — 고강도 페이스·스케줄' },
              { href: '/tools/sports/buildup', icon: '📈', name: '러닝 빌드업 계산기', desc: '구간별 점증 페이스' },
              { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스 ↔ 완주 시간 변환' },
              { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂max 계산기', desc: '심폐 체력·강도별 페이스' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
