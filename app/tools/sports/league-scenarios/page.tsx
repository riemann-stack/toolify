import Link from 'next/link'
import LeagueScenariosClient from './LeagueScenariosClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/league-scenarios',
  title: '축구 순위 경우의 수 계산기 — 16강 진출 조건·자력/타력',
  description: '월드컵·K리그·챔피언스리그 조별리그 잔여 경기 순위 경우의 수. 진출 확정·자력/타력 조건, 대회별 타이브레이커(골득실·승자승) 정확 반영. 베팅 아닌 순수 경우의 수 도구.',
  keywords: ['축구 경우의 수', '월드컵 16강 경우의 수', '조별리그 순위', '진출 경우의 수', '자력 진출', '골득실 계산', 'K리그 순위 경우의 수', '챔피언스리그 진출', '승자승', '리그 순위 시나리오'],
})

const FAQ_LD = [
  {
    q: '자력 진출과 타력 진출은 어떻게 다른가요?',
    a: '<strong>자력 진출</strong>은 우리 팀의 남은 경기 결과만으로 진출이 확정되는 경우입니다. 예를 들어 ‘마지막 경기를 이기면 다른 경기 결과와 상관없이 16강’이라면 자력입니다. <strong>타력 진출</strong>은 우리 결과만으로는 부족해 다른 팀들의 경기 결과까지 특정 조건으로 나와야 올라가는 경우입니다. 본 도구는 관심 팀의 자기 경기 결과별로 ‘이기면/비기면/지면’을 나눠, 그 결과가 곧 진출 확정(자력)인지 다른 경기에 달렸는지(타력)를 구분해 보여줍니다.',
  },
  {
    q: '승점이 같으면 순위는 무엇으로 정하나요?',
    a: '승점이 같을 때 적용하는 기준(타이브레이커)은 대회마다 다릅니다. 흔한 순서는 <strong>승점 → 골득실차 → 다득점 → 승자승</strong>이지만, 대회에 따라 승자승(맞대결)이 골득실보다 먼저 오기도 합니다. 본 도구는 선택한 대회 프리셋의 실제 순서를 그대로 적용하고, 동점이 골득실·다득점처럼 스코어로 갈리는 경계는 ‘확정’ 대신 <strong>‘골득실차에 따라 갈림’</strong>처럼 사유를 표시합니다.',
  },
  {
    q: '월드컵과 챔피언스리그, K리그는 동점 규칙이 어떻게 다른가요?',
    a: '<strong>2026 FIFA 월드컵</strong>은 승점 다음에 <strong>승자승(맞대결)을 전체 골득실보다 먼저</strong> 봅니다(2022년까지와 반대). <strong>UEFA 챔피언스리그 구 조별리그</strong>도 승자승 우선이었고, 2024/25부터의 리그페이즈는 전체 골득실 우선입니다. <strong>K리그1</strong>은 승점 다음에 <strong>다득점(많이 넣은 팀)을 골득실보다 먼저</strong> 봅니다. 같은 동점이라도 어느 규칙이냐에 따라 순위가 정반대로 갈릴 수 있어, 프리셋을 정확히 골라야 합니다.',
  },
  {
    q: '승자승(상대전적)은 어떻게 계산하나요?',
    a: '승자승은 동점인 팀들끼리 <strong>자기들끼리 맞붙은 경기만 따로 모아 미니리그</strong>를 만들어 그 안에서 승점·골득실·다득점을 비교하는 방식입니다. 그래서 세 팀 이상이 동점이면 그 팀들 사이 경기 결과가 모두 필요합니다. 본 도구에서 승자승 우선 대회를 고르면 ‘이미 치른 맞대결 결과’ 입력란이 권장됩니다. 입력하면 승자승이 정확히 반영되고, 비워두면 승자승으로 갈리는 동점은 ‘승자승(맞대결 결과 필요)’으로 솔직하게 표시됩니다.',
  },
  {
    q: '이 도구로 진출 확률이나 베팅 확률을 알 수 있나요?',
    a: '아니요. 본 도구가 보여주는 ‘진출 확률(참고)’은 <strong>남은 경기의 모든 결과(승·무·패)가 똑같이 나온다고 가정</strong>한 단순 경우의 수 비율일 뿐입니다. 팀 전력·최근 경기력·홈/원정·선수 상태를 전혀 반영하지 않으므로 실제 가능성과 다릅니다. 베팅·도박 목적의 수치가 아니며, 어디까지나 ‘몇 가지 경우에 진출하는가’를 세는 참고용입니다.',
  },
  {
    q: 'K리그나 일반 리그 순위 경쟁도 계산할 수 있나요?',
    a: '네. 대회 프리셋에서 ‘K리그1(다득점 우선)’이나 ‘프리미어리그·일반 리그(골득실 우선)’를 고르면 그 규칙으로 계산합니다. 팀 수와 진출(또는 우승·잔류) 자리 수를 조정하고, 순위 경쟁 중인 팀들과 그들의 잔여 경기만 넣으면 됩니다. 잔여 경기가 많으면(12경기 이상) 전수 계산이 어려우니, 관심 팀과 직접 관련된 핵심 경기 위주로 줄여서 보는 편이 좋습니다.',
  },
  {
    q: '실시간 경기 결과가 자동으로 반영되나요?',
    a: '아니요. 본 도구는 실시간 중계나 외부 API와 연동하지 않습니다. 현재 순위표(승·무·패·득실)와 잔여 경기를 <strong>직접 입력</strong>하면 그 값을 기준으로 경우의 수를 계산합니다. 경기가 끝날 때마다 순위표 숫자를 갱신하면서 사용하세요. 입력값은 브라우저에만 저장되어 다음 방문 때 그대로 불러옵니다.',
  },
]

const sec = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' } as const
const lead = { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' } as const
const strong = { color: 'var(--text)' } as const

export default function LeagueScenariosPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />축구 순위 경우의 수 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        조별리그·정규 리그의 <strong style={strong}>잔여 경기 결과 조합</strong>을 모두 따져 진출 확정 경우의 수와 <strong style={strong}>자력·타력 진출 조건</strong>을 정리합니다. 월드컵·K리그·챔피언스리그 등 대회별 동점 규칙(골득실·승자승)을 프리셋으로 반영합니다.
      </p>

      <Disclaimer variant="default">
        본 축구 순위 경우의 수 계산기는 경우의 수 참고 도구입니다. 모든 잔여 경기 결과(승/무/패) 조합을 기준으로 계산하며, 확률은 “모든 결과가 동일하게 나온다”는 단순 가정의 수치로 팀 전력을 반영하지 않습니다. 타이브레이커(동점 시 순위)는 대회별 규정 기준이며 시즌·대회별로 바뀔 수 있으니 정확한 규정은 해당 대회 공식 발표를 확인하세요. ⚠️ 본 도구는 베팅·도박 목적이 아니며, 실시간 경기 연동·전력 기반 승률 예측·선수/전술 분석을 제공하지 않습니다.
      </Disclaimer>

      <LeagueScenariosClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 순위 결정 방식 */}
        <div>
          <h2 style={sec}>조별리그 순위는 무엇으로 정해지나요</h2>
          <p style={lead}>
            먼저 <strong style={strong}>승점</strong>으로 줄을 세웁니다. 이기면 3점, 비기면 1점, 지면 0점입니다. 승점이 같은 팀이 둘 이상이면 <strong style={strong}>타이브레이커(동점 시 순위 기준)</strong>를 순서대로 적용합니다. 자주 쓰이는 기준은 다음과 같습니다.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong style={strong}>골득실차</strong> — 총 득점에서 총 실점을 뺀 값. +5가 +2보다 위.</li>
            <li><strong style={strong}>다득점</strong> — 더 많이 넣은 팀이 위. 공격 축구를 장려하는 기준.</li>
            <li><strong style={strong}>승자승(맞대결)</strong> — 동점 팀들끼리 맞붙은 경기 결과만 따로 비교.</li>
            <li><strong style={strong}>다승·페어플레이·추첨</strong> — 그래도 같으면 차례로 적용.</li>
          </ul>
        </div>

        {/* 2. 대회별 타이브레이커 차이 */}
        <div>
          <h2 style={sec}>대회별 동점 규칙 차이 (★ 핵심)</h2>
          <p style={lead}>
            가장 중요한 차이는 <strong style={strong}>승자승(맞대결)이 전체 골득실보다 앞이냐 뒤냐</strong>입니다. 이게 대회마다 정반대라 같은 동점이라도 순위가 뒤집힙니다. K리그는 한술 더 떠 <strong style={strong}>다득점을 골득실보다 먼저</strong> 봅니다.
          </p>
          <div className="tableScroll" style={{ borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>대회</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--accent)', fontWeight: 700 }}>승점 다음 순서</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2026 월드컵', '승자승 → … → 골득실 (승자승 우선)'],
                  ['2022 월드컵 방식', '골득실 → 다득점 → 승자승 (골득실 우선)'],
                  ['아시안컵', '승자승 → … → 골득실 (승자승 우선)'],
                  ['챔스 구 조별리그', '승자승 → … → 골득실 (승자승 우선)'],
                  ['챔스 리그페이즈(신)', '골득실 → 다득점 (승자승 없음)'],
                  ['K리그1', '다득점 → 골득실 → 다승 → 승자승'],
                  ['프리미어리그·일반', '골득실 → 다득점 → 승자승'],
                  ['라리가', '승자승 → 골득실 (승자승 우선)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'var(--bg2)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...lead, marginTop: 16, marginBottom: 0 }}>
            <strong style={strong}>승자승 우선</strong> 대회(2026 월드컵·아시안컵·라리가·챔스 구 조별)에서는 맞대결 결과가 결정적이라, 도구의 ‘이미 치른 맞대결’ 입력을 채우는 것이 좋습니다. <strong style={strong}>골득실 우선</strong> 대회(2022 월드컵·EPL·챔스 리그페이즈)와 <strong style={strong}>다득점 우선</strong>인 K리그는 골/득점 숫자가 더 중요합니다.
          </p>
        </div>

        {/* 3. 자력 vs 타력 */}
        <div>
          <h2 style={sec}>자력 진출과 타력 진출</h2>
          <p style={lead}>
            <strong style={strong}>자력 진출</strong>은 남은 우리 경기 결과만으로 진출이 결정되는 상황입니다. 예: 3차전을 이기기만 하면 다른 조 경기와 상관없이 16강. 반대로 <strong style={strong}>타력 진출</strong>은 우리가 이겨도 다른 경기까지 특정 결과가 나와야 올라가는 상황입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '자력 예시', d: '2승(승점 6) 한 팀이 마지막 경기를 이기면 9점으로 조 1위 확정 — 다른 경기 무관.' },
              { t: '타력 예시', d: '우리가 이겨도 같은 승점 팀이 생겨, 그 팀이 다른 경기서 지거나 비겨야 올라가는 경우.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', margin: '0 0 6px' }}>{m.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p style={{ ...lead, marginTop: 16, marginBottom: 0 }}>
            도구의 시나리오 카드는 관심 팀의 자기 경기 결과별로 ‘이기면/비기면/지면’을 나눠, 그게 바로 진출 확정(자력)인지 다른 경기 결과에 달렸는지(타력)를 표시합니다.
          </p>
        </div>

        {/* 4. 경우의 수 원리 */}
        <div>
          <h2 style={sec}>경우의 수는 어떻게 세나요</h2>
          <p style={lead}>
            한 경기에는 홈 승·무·원정 승 세 가지 결과가 있습니다. 잔여 경기가 <strong style={strong}>n경기</strong>면 가능한 결과 조합은 <strong style={strong}>3<sup>n</sup>가지</strong>입니다. 2경기면 9가지, 3경기면 27가지, 5경기면 243가지로 빠르게 늘어납니다. 도구는 이 모든 조합을 하나씩 만들어 각 경우에서 관심 팀의 순위와 진출 여부를 판정합니다.
          </p>
          <p style={{ ...lead, marginBottom: 0 }}>
            여기서 보여주는 ‘진출 확률(참고)’은 <strong style={strong}>이 모든 조합이 똑같이 일어난다고 가정</strong>한 비율일 뿐입니다. 실제로는 팀 전력에 따라 어떤 결과는 더 자주, 어떤 결과는 드물게 나오므로 이 수치는 실제 가능성과 다릅니다. 베팅·승부예측이 아니라 ‘몇 가지 경우에 진출하는가’를 세는 용도로만 보세요.
          </p>
        </div>

        {/* 5. 16강 진출 일반 시나리오 */}
        <div>
          <h2 style={sec}>월드컵 16강 진출 일반 시나리오</h2>
          <p style={lead}>
            4팀이 풀리그로 3경기씩 치르고 상위 2팀이 16강에 갑니다. 마지막 3차전 전, 흔히 나오는 상황을 정리하면 다음과 같습니다.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong style={strong}>2승(승점 6)</strong> — 보통 마지막 경기 결과와 무관하게 16강 확정에 가깝습니다(자력).</li>
            <li><strong style={strong}>1승 1무(승점 4)</strong> — 마지막 경기를 이기면 대개 자력 진출, 비기거나 지면 타 경기 결과가 필요합니다.</li>
            <li><strong style={strong}>1승 1패(승점 3)</strong> — 마지막 경기를 이겨야 가능성이 크게 열리며, 골득실·승자승 싸움이 됩니다.</li>
            <li><strong style={strong}>1무 1패(승점 1)</strong> — 마지막 경기를 이겨도 다른 경기 결과까지 맞물려야 하는 타력 상황이 많습니다.</li>
          </ul>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            실제 진출 여부는 같은 조 다른 팀들의 승점·골득실에 따라 달라지므로, 현재 순위표를 정확히 넣고 도구로 확인하세요.
          </p>
        </div>

        {/* 6. 승자승 미니리그 */}
        <div>
          <h2 style={sec}>승자승(상대전적)과 미니리그 재계산</h2>
          <p style={lead}>
            승자승 우선 대회에서 동점이 생기면, 그 동점 팀들끼리 맞붙은 경기만 <strong style={strong}>따로 떼어 작은 리그</strong>를 만듭니다. 이 미니리그 안에서 다시 승점 → 골득실 → 다득점 순으로 비교해 순위를 가립니다. 두 팀 동점이면 두 팀의 맞대결 결과 하나로 끝나지만, 세 팀 이상이 동점이면 그 팀들 사이 경기 결과가 모두 있어야 합니다.
          </p>
          <p style={{ ...lead, marginBottom: 0 }}>
            그래서 승자승 우선 대회를 고르면 도구가 ‘이미 치른 맞대결 결과’ 입력을 권장합니다. 이 값을 넣으면 동점이 승자승으로 어떻게 갈리는지 정확히 계산되고, 비워두면 도구는 단정하지 않고 <strong style={strong}>‘승자승(맞대결 결과 필요)으로 갈림’</strong>이라고 솔직하게 표시합니다.
          </p>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 함께 쓰면 좋은 도구 */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/football-points', icon: '⚽', name: '축구 승점 계산기', desc: '목표 승점 달성 가능성·라이벌 추격' },
              { href: '/tools/date/dday', icon: '📅', name: 'D-day 계산기', desc: '대회·경기 일정까지 남은 날짜' },
              { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔완주 시간·구간 스플릿' },
              { href: '/tools/sports/swim-pace', icon: '🏊', name: '수영 페이스·SWOLF', desc: '100m 페이스·풀 환산·인터벌' },
            ].map((t) => (
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
