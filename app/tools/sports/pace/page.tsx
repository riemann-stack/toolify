import Link from 'next/link'
import PaceClient from './PaceClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/sports/pace',
  title: '러닝 페이스 계산기 — 마라톤 완주 시간·트레드밀·구간 스플릿·레이스 플랜',
  description: '페이스 ↔ 완주 시간 양방향 변환 + 트레드밀 시속 환산과 400m 트랙 랩타임, 5km·10km·하프·풀 구간 스플릿 자동 계산. 레이스 플랜 탭에서 구간별 페이스 분배·코스 고도 보정·지점별 통과 예상 시각까지.',
  keywords: ['러닝페이스계산기', '마라톤페이스계산기', '트레드밀시속변환', '달리기페이스', '마라톤완주시간', '400m트랙페이스', '러닝스플릿', '서브3 페이스', '서브4 페이스', '구간 스플릿', '네거티브 스플릿',
    '레이스 페이스 플래너', '마라톤 페이스 분배', '구간별 페이스', '코스 고도 페이스', '오르막 페이스', '통과 예상 시각', 'GAP 페이스', '페이스 밴드'],
})

const FAQ_LD = [
              { q: '페이스(Pace)란 무엇인가요?',
                a: '페이스는 1km를 달리는 데 걸리는 시간입니다. &ldquo;5분 30초 페이스&rdquo;는 1km를 5분 30초에 달린다는 의미입니다. GPS 스마트워치나 러닝 앱에서 &ldquo;min/km&rdquo; 또는 &ldquo;/km&rdquo;로 표시됩니다. 미국에서는 1마일 기준 페이스(min/mi)를 주로 사용합니다.' },
              { q: '트레드밀과 야외 달리기는 페이스가 같나요?',
                a: '같은 시속으로 설정해도 일반적으로 트레드밀이 야외보다 더 쉽게 느껴집니다. 바람 저항이 없고 벨트가 발을 밀어주기 때문입니다. 야외 레이스를 목표로 한다면 트레드밀 경사도를 1~1.5%로 설정하면 야외와 비슷한 강도가 됩니다.' },
              { q: '400m 트랙 페이스는 왜 알아야 하나요?',
                a: '400m 트랙은 인터벌 훈련의 기본 단위입니다. &ldquo;400m 인터벌 6회&rdquo;처럼 트랙 훈련 프로그램은 바퀴당 목표 시간으로 구성됩니다. 예를 들어 킬로미터 페이스 5:00(km/h 12)이라면 400m 1바퀴에 2:00이 목표 시간이 됩니다. 자세한 인터벌 훈련은 인터벌 훈련 계산기(관련 도구에서 이동)를 참고하세요.' },
              { q: '마라톤 서브4(4시간 이내 완주)를 위한 페이스는?',
                a: '마라톤 서브4를 달성하려면 평균 페이스 5분 41초/km(시속 약 10.5km/h)를 유지해야 합니다. 실제 레이스에서는 초반 흥분으로 오버페이스하지 않도록 전반부를 조금 여유 있게, 후반부에 페이스를 유지하는 네거티브 스플릿 전략을 권장합니다.' },
              { q: '5km·10km·하프·풀 거리는 정확히 몇 km이고, 풀코스는 왜 42.195km인가요?',
                a: '국제 표준 거리:<br/>• <strong>5km</strong>: 5.000km<br/>• <strong>10km</strong>: 10.000km<br/>• <strong>하프 마라톤</strong>: 21.0975km (정확히 풀 마라톤의 절반)<br/>• <strong>풀 마라톤</strong>: 42.195km<br/>풀코스 거리는 1908년 런던 올림픽에서 왕실 관람을 위해 코스를 늘린 거리가 표준이 되었습니다.<br/>본 도구는 정확한 거리로 계산합니다 — 하프·풀의 끝부분(97.5m·195m)도 반영. [레이스 플랜] 탭도 마지막 0.195km(하프는 0.0975km)를 별도 구간으로 계산합니다.' },
              { q: '네거티브 스플릿이 무엇이고, 왜 권장하나요?',
                a: '<strong>후반을 전반보다 약간 빠르게</strong> 달리는 전략. 본 도구의 하프·풀 결과 카드에 자동 표시됩니다.<br/>예: 마라톤 5:30/km 목표 → 전반 5:33/km(1.5초 느슨) + 후반 5:27/km(1.5초 빠르게) = 총 시간 동일.<br/>대부분의 개인 최고기록이 후반을 더 빠르게 뛴 네거티브 스플릿에서 나옵니다. 초반 과속은 글리코겐 조기 고갈·후반 급감속(벽)의 가장 흔한 원인입니다. [레이스 플랜] 탭의 네거티브 전략은 기준 페이스보다 앞을 살짝 느리게(약 +3%), 뒤를 빠르게(약 −3%) 구간마다 점진적으로 나누고, 완주 시간은 기준 페이스로 고르게 달렸을 때와 같아지도록 맞춥니다.<br/>장점: 초반 오버페이스 ↓, 후반 무너짐 ↓, 심리적 자신감 ↑. ⚠️ 단, 충분히 훈련된 러너만 가능. 초보는 일정 페이스부터 익히기.' },
              { q: '페이스 ↔ 시속 변환 공식은?',
                a: '<strong>시속 = 60 ÷ 페이스(분/km)</strong><br/>• 5:00/km → 12.0 km/h<br/>• 5:30/km → 10.9 km/h<br/>• 6:00/km → 10.0 km/h<br/><strong>400m 트랙 1바퀴 = 페이스 × 0.4</strong><br/>• 5:00/km → 2:00 (400m)<br/>• 5:30/km → 2:12<br/>• 6:00/km → 2:24<br/>본 도구의 자동 변환을 활용하세요.' },
              { q: '본 도구와 인터벌 훈련 계산기·기록 예측 계산기 차이는?',
                a: '각 도구는 다른 영역을 다룹니다.<br/>📊 <strong>본 도구 (러닝 페이스 계산기)</strong> — 단순 페이스↔시간 변환 / 트레드밀 시속 / 구간 스플릿(페이스 분배) / [레이스 플랜] 탭(구간별 전략·코스 고도·통과 예상 시각)<br/>🏃 <strong>인터벌 훈련 계산기</strong> — VDOT 기반 인터벌 페이스 / 야소 800 / 4~16주 훈련 스케줄 / I·R·T 페이스<br/>🎯 <strong>마라톤 기록 계산기</strong> — VDOT·Riegel 공식 / 5km → 풀코스 기록 예측<br/>본 도구는 <strong>페이스 변환 기본 도구</strong>. 훈련은 인터벌 도구, 예측은 기록 예측 도구를 함께 활용.' },
              { q: '본인 페이스가 매번 다른데 어떻게 사용하나요?',
                a: '<strong>평균 페이스</strong> 또는 <strong>목표 페이스</strong> 입력 권장. 일반 가이드:<br/>• 평소 조깅: 6:00~6:30/km<br/>• 약간 빠르게: 5:30~6:00/km<br/>• 5km 페이스: 5:00~5:30/km<br/>• 10km 페이스: 5:15~5:45/km<br/>• 하프 페이스: 5:30~6:00/km<br/>• 풀코스 목표: 본 도구의 빠른 페이스 칩 활용.<br/>본 도구는 마지막 입력을 자동 저장 — 재방문 시 빠른 사용 가능.' },
              { q: '[레이스 플랜] 탭에서 구간 페이스만 넣으면 완주 시간이 정확한가요?',
                a: '입력한 페이스를 그대로 유지한다는 가정의 계산값입니다(페이스 × 거리 합산). 실제로는 누적 피로·기온·습도·노면·보급에 따라 후반이 느려지는 경향(positive drift)이 있어 참고용으로 보세요. 코스 고도를 입력하면 언덕에 의한 차이를 어느 정도 반영할 수 있습니다.' },
              { q: '코스 고도는 어떻게 입력하고, 언덕 보정은 얼마나 정확한가요?',
                a: '[레이스 플랜] 탭에서 [코스 고도 입력]을 켜고 각 km 지점의 고도(해발 m)를 넣으면, 직전 지점과의 차이로 구간 경사(%)·총 상승/하강이 자동 계산됩니다. 대회 코스맵의 고도 프로파일에서 km 단위 고도를 읽어 입력하면 됩니다. [고도로 페이스 자동 보정]을 켜고 전략 버튼을 누르면 언덕이 페이스에 반영됩니다.<br/>보정값은 추정치입니다. 흔한 코칭 경험칙과 Strava GAP·Minetti의 경사 에너지 곡선을 단순화해 <strong>오르막 1%당 약 +12초/km, 내리막 1%당 약 −6초/km</strong>로 가감합니다. 실제 손실/이득은 경사 길이·노면·개인 능력·피로도에 따라 크게 다르므로, 자동 보정으로 채운 뒤 구간을 직접 조정하는 것을 권장합니다.' },
              { q: '통과 예상 시각은 어디에 쓰나요?',
                a: '[레이스 플랜] 탭에서 [출발 시각]을 넣으면 5K·10K·하프·완주 지점을 몇 시 몇 분에 통과하는지 시계 시각으로 보여줍니다(구간 목록에도 km마다 통과 시각이 함께 표시). 가족·페이서가 응원 지점에서 기다리거나 미팅을 잡을 때 유용합니다.' },
            ]

export default function PacePage() {
  return (
    <ToolPage width={760} slug="/tools/sports/pace">
      <h1 className="tp-h1">
        <ToolIconBadge catId="sports" />러닝 페이스 계산기
      </h1>
      <p className="tp-lead">
        페이스 ↔ 완주 시간 1줄 입력 + 트레드밀 시속과 <strong style={{ color: 'var(--text)' }}>5km·10km·하프·풀 스플릿</strong>.
      </p>

      <PaceClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 페이스 기준표 ── */}
        <div>
          <h2 className="g-h2">
            페이스별 완주 예상 시간 기준표
          </h2>
          <p className="g-p">
            아래 표는 일정 페이스를 끝까지 유지했을 때의 이론적 완주 시간입니다. 초반 오버페이스는 후반 급저하의 가장 큰 원인이므로, 특히 초·중급 러너는 <strong style={{ color: 'var(--text)' }}>일정 페이스</strong> 또는 <strong style={{ color: 'var(--text)' }}>네거티브 스플릿(후반을 약간 빠르게)</strong>을 권장합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',   color: 'var(--muted)', fontWeight: 500 }}>페이스(/km)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>5km</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>10km</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>하프(21km)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>풀(42km)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['3:00', '15:00', '30:00', '1:03:18', '2:06:35'],
                  ['3:30', '17:30', '35:00', '1:13:50', '2:27:41'],
                  ['4:00', '20:00', '40:00', '1:24:23', '2:48:47'],
                  ['4:30', '22:30', '45:00', '1:34:56', '3:09:53'],
                  ['5:00', '25:00', '50:00', '1:45:29', '3:30:59'],
                  ['5:30', '27:30', '55:00', '1:56:02', '3:52:04'],
                  ['6:00', '30:00', '60:00', '2:06:35', '4:13:10'],
                  ['6:30', '32:30', '65:00', '2:17:08', '4:34:16'],
                  ['7:00', '35:00', '70:00', '2:27:41', '4:55:22'],
                  ['7:30', '37:30', '75:00', '2:38:14', '5:16:28'],
                ].map(([pace, k5, k10, half, full], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{k5}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{k10}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{half}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{full}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 트레드밀 시속 ↔ 페이스 변환표 ── */}
        <div>
          <h2 className="g-h2">
            트레드밀 시속 ↔ 페이스 변환표
          </h2>
          <p className="g-p">
            런닝머신에는 페이스 대신 <strong style={{ color: 'var(--text)' }}>시속(km/h)</strong>이 표시됩니다. 야외 러닝 페이스와 동일하게 설정하려면 아래 표를 참고하세요. 400m 트랙 1바퀴 기준 소요 시간도 함께 확인할 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>시속 (km/h)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>페이스 (/km)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>400m 트랙 1바퀴</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>수준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['7.0',  '8:34', '3:26', '초보 조깅'],
                  ['8.0',  '7:30', '3:00', '가벼운 조깅'],
                  ['9.0',  '6:40', '2:40', '초중급'],
                  ['10.0', '6:00', '2:24', '중급'],
                  ['11.0', '5:27', '2:11', '중상급'],
                  ['12.0', '5:00', '2:00', '상급 입문'],
                  ['13.0', '4:37', '1:51', '상급'],
                  ['14.0', '4:17', '1:43', '준엘리트'],
                  ['15.0', '4:00', '1:36', '엘리트 수준'],
                ].map(([kph, pace, track, level], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{kph}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 500 }}>{pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{track}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 거리별 레이스 페이스 전략 (전면 개편) ── */}
        <div>
          <h2 className="g-h2">
            📐 거리별 레이스 페이스 전략
          </h2>
          <p className="g-p">
            거리마다 페이스 분배가 다릅니다. 본 도구의 자동 스플릿과 함께 아래 전략을 참고하세요.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                d: '5km',
                color: 'var(--red-600)',
                strategy: '초반 빠르게 + 끝까지 유지',
                points: [
                  '0~1km : 목표 페이스보다 5~10초 빠르게 (출발 흥분)',
                  '1~4km : 목표 페이스 정확히 유지',
                  '4~5km : 라스트 스퍼트 — 페이스 5~15초 단축',
                  '💡 5km는 짧아서 페이스 안정보다 강도 유지가 중요',
                ],
              },
              {
                d: '10km',
                color: 'var(--yellow-700)',
                strategy: '일정 페이스 + 후반 스퍼트',
                points: [
                  '0~2km : 목표 페이스 +3~5초 (워밍업 가속)',
                  '2~7km : 목표 페이스 정확히 유지',
                  '7~9km : 목표 페이스 -2~5초 (가속)',
                  '9~10km : 라스트 스퍼트',
                  '💡 한국 인기 코스 — 한강·여의도 10km, 동마 코스',
                ],
              },
              {
                d: '하프(21.0975km)',
                color: 'var(--cyan-600)',
                strategy: '네거티브 스플릿 — 후반에 페이스 ↑',
                points: [
                  '0~10km (전반) : 목표 페이스 +2~3초 (여유)',
                  '10~16km : 목표 페이스 정확히',
                  '16~21km (후반) : 목표 페이스 -2~3초 (가속)',
                  '⚠️ 초반 오버페이스는 후반 무너짐의 주범 — 손목시계 알림 활용',
                  '💡 강변 코스의 맞바람·기온 변동을 고려해 1km마다 페이스 점검',
                ],
              },
              {
                d: '풀 마라톤(42.195km)',
                color: 'var(--emerald-600)',
                strategy: '3구간 분할 — 절제→유지→집중',
                points: [
                  '🟢 0~15km : 목표 페이스 +3~5초 (절제 구간) — 신체 에너지 절약',
                  '🟡 15~30km : 목표 페이스 정확히 — 마라톤 본 경기',
                  '🔴 30~42km : 마의 30km 통과 — 페이스 유지가 곧 우승',
                  '⚡ 35~42km : 글리코겐 고갈 — 에너지젤 보충 + 정신력 게임',
                  '💡 30km까지 너무 빨리 가면 35km부터 페이스가 1분/km 이상 저하',
                  '💡 에너지젤 권장 — 5km·15km·25km·35km 4회 + 물 매 급수대',
                ],
              },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${r.color}`, borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 15, color: r.color, fontWeight: 800, fontFamily: 'var(--font-sans)' }}>{r.d}</span>
                  <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{r.strategy}</span>
                </div>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                  {r.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            💡 본 도구의 [📋 결과 + 스플릿 복사] 버튼으로 각 km별 누적 시간을 메모장에 저장 가능. 손목시계에 미리 입력해두면 레이스 중 실시간 페이스 점검이 편합니다. 위 전략처럼 구간마다 페이스를 다르게 짜거나 코스 고도를 반영하려면 계산기의 <strong style={{ color: 'var(--text)' }}>[레이스 플랜]</strong> 탭에서 1km 구간 페이스를 직접 조정하세요.
          </p>
        </div>

        {/* ── 4. 네거티브 스플릿 전략 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            💡 네거티브 스플릿 전략
          </h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>후반을 전반보다 약간 빠르게</strong> 달리는 전략. 본 도구의 하프·풀 결과 카드에 자동 표시됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '🟢 장점', items: ['초반 흥분 오버페이스 ↓', '후반 무너짐(속도 ↓) 방지', '심리적 자신감 ↑', '같은 평균 페이스로 더 안정적 완주'] },
              { t: '⚠️ 주의', items: ['충분히 훈련된 러너만 가능', '초보는 일정 페이스 익히기 우선', '날씨·코스에 따라 조정 필요', '전반 너무 느슨하면 후반 만회 어려움'] },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: i === 0 ? 'var(--emerald-600)' : 'var(--orange-600)', marginBottom: '8px' }}>{m.t}</p>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
                  {m.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            예: 마라톤 5:30/km 목표 → 전반 5:33/km(1.5초 느슨) + 후반 5:27/km(1.5초 빠르게) → 총 시간 동일.
          </p>

          <h3 className="g-h3">균등·네거티브·포지티브 — 레이스 플랜 탭의 페이스 분배</h3>
          <p className="g-p">
            계산기의 [레이스 플랜] 탭에서 전략 버튼을 누르면 기준 페이스가 1km 구간마다 자동으로 채워집니다. 네거티브·포지티브는 앞뒤 끝을 기준 페이스 대비 약 ±3%로 점진적으로 나누되, 완주 시간은 기준 페이스로 고르게 달렸을 때와 같도록 맞춥니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '균등 (Even)', c: 'var(--data-4)', d: '처음부터 끝까지 같은 페이스. 가장 단순하고 에너지 분배가 안정적. 평지 코스·입문자에게 무난.' },
              { t: '네거티브 (권장)', c: 'var(--success)', d: '후반을 앞보다 빠르게. 초반을 아껴 후반 가속 — 대부분의 PB가 이 방식. 기록 도전에 가장 유리.' },
              { t: '포지티브', c: 'var(--warning)', d: '초반을 빠르게. 컨디션이 좋거나 내리막 시작 코스에 한정. 후반 급감속(벽) 위험이 커 일반적으로 비권장.' },
            ].map((x, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${x.c} 33%, transparent)`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: x.c, marginBottom: '6px' }}>{x.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4-1. 레이스 플랜 탭 사용법 (구 race-plan 흡수) ── */}
        <div>
          <h2 className="g-h2">
            🏁 레이스 플랜 탭 3단계 사용법
          </h2>
          <p className="g-p">
            [레이스 플랜] 탭은 1km 구간마다 목표 페이스를 따로 정해 예상 완주 시간과 5K·10K·하프·완주 지점 통과 시간을 계산합니다. 직접 거리는 최대 100km까지 입력할 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '거리·기준 페이스 선택', d: '5K·10K·하프·풀 또는 직접 거리를 고르고, 목표 평균 페이스(분:초/km)를 입력합니다.' },
              { n: '②', t: '전략으로 자동 분배', d: '균등·네거티브·포지티브 중 하나를 누르면 구간별 페이스가 자동으로 채워집니다. 이후 특정 구간만 직접 조정 가능.' },
              { n: '③', t: '(선택) 코스 고도 입력', d: '언덕이 있는 코스라면 각 km 고도를 넣어 경사·상승/하강을 반영하고, 자동 보정으로 언덕 페이스를 추정합니다.' },
            ].map((x, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{x.n}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{x.t}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4-2. 코스 고도와 페이스 (구 race-plan 흡수) ── */}
        <div>
          <h2 className="g-h2">
            ⛰️ 코스 고도와 페이스
          </h2>
          <p className="g-p">
            언덕은 페이스에 직접적인 영향을 줍니다. [레이스 플랜] 탭은 각 구간의 경사를 추정해 페이스를 가감합니다 — <strong style={{ color: 'var(--text)' }}>오르막 1%당 약 +12초/km, 내리막 1%당 약 −6초/km</strong>(흔한 코칭 경험칙 + Strava GAP·Minetti 경사 비용 곡선을 단순화한 추정치).
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
              ⚠️ <strong>추정의 한계</strong> — 실제 언덕 손실/이득은 경사가 이어지는 길이, 노면(트레일·아스팔트), 개인 능력, 누적 피로에 따라 크게 달라집니다. 가파른 내리막은 오히려 근육 손상으로 이득이 줄거나 손해가 되기도 합니다. <strong>자동 보정은 출발점일 뿐</strong>, 코스를 잘 안다면 구간을 직접 조정하세요.
            </p>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', marginTop: '10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>실전 예 — 춘천마라톤 코스 고도 읽기</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              춘천마라톤 공식 홈페이지에 게시된 코스도·고저도를 판독하면 출발·골인 지점이 약 78~80m, 최고점이 약 29km 지점(춘천댐 인근) 약 115m로 전체 고도 변동 폭은 약 40m 이내이며, 약 34km부터는 약 80m대 평탄 구간입니다(2026년 7월 확인 · 수치 라벨이 없는 공식 코스도 판독 기준 근사치 — 참가 연도의 공식 코스 안내로 확인 필요). 이런 코스의 km별 고도를 [코스 고도 입력]에 넣으면 최고점으로 이어지는 오르막 구간의 페이스는 자동으로 늦춰지고 후반 평탄 구간에서 기준 페이스로 회복하는 계획이 만들어집니다 — 예컨대 1km 동안 고도가 10m 오르면 경사 +1%로 인식되어 그 구간에 약 +12초/km가 더해지는 식입니다.
            </p>
          </div>
        </div>

        {/* ── 4-3. GAP (구 race-plan 흡수) ── */}
        <div>
          <h2 className="g-h2">
            GAP(경사 보정 페이스)란?
          </h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>GAP(Grade Adjusted Pace)</strong>은 달린 지형의 경사를 반영해 &lsquo;평지였다면 이에 상응했을 페이스&rsquo;를 추정한 지표입니다(Strava 서포트 공식 문서). 오르막에서는 같은 페이스라도 더 많은 일이 필요하므로 GAP이 실제 페이스보다 <strong style={{ color: 'var(--text)' }}>빠르게</strong>, 내리막에서는 반대로 실제보다 <strong style={{ color: 'var(--text)' }}>느리게</strong> 표기됩니다. 같은 문서에 따르면 내리막 보정은 약 −10% 경사에서 최대가 되고 그보다 가파르면 소폭 완화되며, 지형의 기술적 난도나 노면 상태는 반영하지 않는 한계가 있습니다.
          </p>
          <p className="g-p">
            GAP이 이미 달린 기록을 평지 기준으로 <strong style={{ color: 'var(--text)' }}>사후 환산</strong>하는 지표라면, [레이스 플랜] 탭의 고도 보정은 그 반대 방향입니다 — 평지 기준 목표 페이스를 경사 구간에서 실제로 뛸 페이스로 <strong style={{ color: 'var(--text)' }}>미리 환산</strong>해 레이스 계획에 반영합니다.
          </p>
        </div>

        {/* ── 4-4. 페이스 밴드 (구 race-plan 흡수) ── */}
        <div>
          <h2 className="g-h2">
            페이스 밴드 만드는 법
          </h2>
          <p className="g-p">
            페이스 밴드는 구간 통과 목표 시간을 적어 손목에 두르는 종이 띠입니다. 해외 전문 서비스 FindMyMarathon은 GPS 시계도 레이스 당일 항상 완벽하지는 않다는 점을 들어 밴드를 단순하고 믿을 수 있는 페이싱 기준물로 소개하며, 코스 고저까지 반영한 밴드를 서비스할 정도로 러너들 사이에 정착된 방법입니다. [레이스 플랜] 탭의 결과로 직접 만들 수 있습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '①', t: '스플릿 확정 후 [플랜 복사]', d: '전략·고도 보정까지 반영한 구간표를 확정하고 결과의 [플랜 복사]를 누르면 예상 완주·평균 페이스와 5K·10K·하프·완주 통과 타임(출발 시각을 넣었다면 시계 시각 포함)이 텍스트로 복사됩니다.' },
              { n: '②', t: '종이 띠에 옮겨 적고 손목에 고정', d: '복사한 통과 타임을 손목 둘레 길이의 종이 띠에 크게 옮겨 적고 테이프로 감아 고정합니다. 비 예보가 있으면 투명 테이프로 전체를 덮어 번짐을 막으세요.' },
              { n: '③', t: 'GPS 시계 랩 알림과 병행', d: '시계에 1km 자동 랩과 목표 페이스 범위 알림을 함께 설정하고, 구간마다 페이스가 다른 전략이라면 밴드의 누적 통과 타임과 시계 랩을 교차 확인하는 방식이 안전합니다.' },
            ].map((x, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{x.n}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{x.t}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 한국 인기 페이스 가이드 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            🇰🇷 한국 마라톤 인기 목표 페이스
          </h2>
          <p className="g-p">
            한국 러너들의 흔한 마라톤 목표 시간과 필요 페이스. &lsquo;서브&rsquo; 목표는 끝까지 유지하면 목표 시간 안에 들어오는 페이스(초 단위 내림)입니다. 서브3~서브5는 위 계산기의 「빠른 입력」 칩에서 한 탭으로 적용됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>목표</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>필요 페이스</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>시속</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>수준</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { goal: '서브3 (3시간)',     pace: '4:15/km', kph: '14.12', lv: '엘리트' },
                  { goal: '서브3:30',         pace: '4:58/km', kph: '12.08', lv: '상급' },
                  { goal: '서브4 (4시간)',     pace: '5:41/km', kph: '10.56', lv: '준상급' },
                  { goal: '서브4:30',         pace: '6:23/km', kph: '9.40',  lv: '중급' },
                  { goal: '서브5 (5시간)',     pace: '7:06/km', kph: '8.45',  lv: '입문 완주' },
                  { goal: '하프 서브2',       pace: '5:41/km', kph: '10.56', lv: '하프 중급' },
                  { goal: '10km 50분',        pace: '5:00/km', kph: '12.00', lv: '10km 입문' },
                  { goal: '5km 25분',         pace: '5:00/km', kph: '12.00', lv: '5km 입문' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.goal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.pace}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.kph}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.lv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 하프는 풀의 정확히 절반 거리라, 균등 페이스 기준 하프 1:30 = 풀 3:00, 1:45 = 3:30, 2:00 = 4:00, 2:15 = 4:30, 2:30 = 5:00과 같은 페이스입니다(예: 3:00·1:30 모두 약 4:16/km — &lsquo;서브&rsquo; 기준 내림 4:15). 하지만 실제로는 거리가 길수록 페이스가 느려지는 게 정상입니다. 과거 기록으로 거리별 예상 시간을 보려면 <Link href="/tools/sports/race-predictor" style={{ color: 'var(--accent-ink)' }}>마라톤 기록 계산기</Link>를 함께 쓰세요.
          </p>
        </div>

        {/* ── 6. 트레드밀 vs 야외 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            🏃 트레드밀 vs 야외
          </h2>
          <p className="g-p">
            같은 시속이라도 트레드밀이 야외보다 약간 쉽게 느껴집니다. 야외 시뮬을 위해 경사 1~1.5% 권장.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '트레드밀이 쉬운 이유', items: ['바람 저항 없음', '벨트가 발을 밀어줌', '온도·습도 일정', '코스 변화 없음 (평지)'] },
              { t: '야외 시뮬 방법', items: ['경사 1~1.5% 설정', '같은 시속도 약 5% 강도 ↑', '본인 페이스 5~10초 더 느리게', '프로그램 인터벌 활용'] },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{m.t}</p>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
                  {m.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 4. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/interval-training', icon: '🏃‍♂️', name: '인터벌 훈련 계산기',     desc: 'VDOT·인터벌 페이스·훈련 스케줄' },
              { href: '/tools/sports/race-predictor',    icon: '🎯', name: '마라톤 기록 계산기',  desc: 'VDOT·Riegel 기록 예측' },
              { href: '/tools/sports/one-rm',            icon: '🏋️', name: '1RM 계산기',               desc: '근력 보강 최대 중량' },
              { href: '/tools/date/dday',                icon: '📅', name: 'D-day 계산기',              desc: '다음 마라톤 대회까지 남은 날' },
              { href: '/tools/health/bmr',               icon: '🔥', name: '기초대사량(BMR) 계산기',     desc: '러너 하루 칼로리 소비' },
              { href: '/tools/health/bmi',               icon: '⚖️', name: 'BMI 계산기',               desc: '러너 체중 범위 확인' },
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