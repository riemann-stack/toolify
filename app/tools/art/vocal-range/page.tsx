import Link from 'next/link'
import VocalRangeClient from './VocalRangeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/art/vocal-range',
  title: '음역대 측정기 — 실시간 음정 감지·최저음·최고음 자동 측정',
  description:
    '마이크로 실시간 음정 감지로 내 최저·최고음 자동 측정 + 한국 노래 30+곡 키 매칭으로 노래방 선곡까지.',
  keywords: [
    '음역대 측정', '보컬 음역', '음정 테스트', '최고음 측정',
    '베이스 바리톤 테너', '소프라노 알토', '보컬 트레이닝',
    '노래방 키 추천', '내 음역대', '음정 감지', 'pitch detection',
  ],
})

export default function VocalRangePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>음악</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎤 음역대 측정기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        마이크로 실시간 음정 감지로 내 <strong style={{ color: 'var(--text)' }}>최저·최고음 측정</strong> + 한국 노래 30+곡 키 매칭.
      </p>

      <VocalRangeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 보컬 음역대란 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>보컬 음역대란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>안정적으로 낼 수 있는 가장 낮은 음 ~ 가장 높은 음의 범위</strong>를 의미합니다. 보통 <strong>진성(흉성) 음역</strong>과 <strong>가성(두성) 음역</strong>으로 나뉘며, 본 도구는 둘을 분리해 측정할 수 있습니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85 }}>
            성인 평균 진성 음역은 약 1.5~2 옥타브(18~24반음)이며, 보컬 트레이닝을 통해 2.5~3 옥타브 이상으로 확장할 수 있습니다. 가성을 포함하면 3~4 옥타브까지 늘어나는 경우도 있습니다.
          </p>
        </section>

        {/* 2. 음역대 분류 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>음역대 8단계 분류</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>분류</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#C485E0', fontWeight: 700 }}>음역</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>예시 (한국 가수)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['♂ 베이스 (Bass)',           'E2~E4',  '이정·김광진'],
                  ['♂ 바리톤 (Baritone)',       'G2~G4',  '성시경·박효신'],
                  ['♂ 테너 (Tenor)',            'C3~C5',  '이수·휘성'],
                  ['♂ 카운터테너 (Countertenor)', 'E3~E5', '폴 포츠'],
                  ['♀ 콘트랄토 (Contralto)',     'F3~F5', '이은미'],
                  ['♀ 알토 (Alto)',              'G3~G5', '아이유 (저음 위주)'],
                  ['♀ 메조소프라노 (Mezzo)',     'A3~A5', '백지영·태연'],
                  ['♀ 소프라노 (Soprano)',       'C4~C6', '아이유·박정현'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#C485E0', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⓘ 위 분류는 클래식 성악 기준이며, 대중음악(K-POP)에서는 더 유연하게 사용됩니다. 같은 가수도 곡에 따라 다른 음역을 사용하므로 단정적 분류는 어렵습니다.
          </p>
        </section>

        {/* 3. 작동 원리 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>본 도구의 작동 원리</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· <strong style={{ color: 'var(--text)' }}>마이크 입력</strong> — Web Audio API로 PCM 데이터 수집 (sampleRate 보통 44.1kHz)</li>
            <li>· <strong style={{ color: 'var(--text)' }}>피치 감지</strong> — pitchy 라이브러리 (YIN 알고리즘 기반) — 약 30KB 경량 의존성</li>
            <li>· <strong style={{ color: 'var(--text)' }}>MIDI 변환</strong> — MIDI = 69 + 12 × log₂(주파수 / 440)</li>
            <li>· <strong style={{ color: 'var(--text)' }}>품질 필터</strong> — 신뢰도 85%+ / 볼륨 임계값 통과 / 사람 목소리 범위(70~2200Hz)</li>
            <li>· <strong style={{ color: 'var(--text)' }}>안정 음 감지</strong> — 0.5초 이상 0.7반음 이내로 유지된 음만 기록</li>
            <li>· <strong style={{ color: 'var(--text)' }}>음역 분류</strong> — 측정값 중간점과 가장 가까운 표준 음역대 자동 매칭</li>
          </ul>
        </section>

        {/* 4. 정확도 한계 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>측정 정확도 한계 (중요)</h2>
          <div style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#FF6B6B', marginBottom: '8px' }}>⚠️ 본 도구의 정확도 한계</p>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
              <li>· <strong style={{ color: 'var(--text)' }}>마이크 품질</strong> 영향 큼 — PC 외장 마이크 &gt; 노트북 내장 &gt; 모바일 내장</li>
              <li>· <strong style={{ color: 'var(--text)' }}>주변 소음</strong> — 반주·말소리·에어컨 소리는 측정값을 흔듭니다</li>
              <li>· <strong style={{ color: 'var(--text)' }}>비브라토·떨림</strong> — 안정 음 감지가 어려워 음역이 좁게 측정될 수 있음</li>
              <li>· <strong style={{ color: 'var(--text)' }}>진성/가성 자동 구분 X</strong> — 사용자가 직접 단계 분리</li>
              <li>· <strong style={{ color: 'var(--text)' }}>±2~3반음 오차 가능</strong> — 정확한 평가는 보컬 트레이너 권장</li>
            </ul>
          </div>
        </section>

        {/* 5. 한국 노래 키 매칭 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>한국 노래 키 매칭</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            본 도구는 한국 인기곡 <strong style={{ color: 'var(--text)' }}>30곡 이상</strong>의 음역 데이터를 보유합니다. 사용자 음역에 맞는 노래를 자동 추천하며, 노래방 키 변경(±6) 시뮬레이션을 통해 다음을 알려드립니다 —
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· <strong style={{ color: '#3EFF9B' }}>원키</strong> — 키 변경 없이 부를 수 있는 곡</li>
            <li>· <strong style={{ color: '#FFD700' }}>±1~2 키</strong> — 살짝 조정으로 안정적</li>
            <li>· <strong style={{ color: '#FF8C3E' }}>±3~6 키</strong> — 큰 폭 조정 필요 (편곡 영향 있음)</li>
          </ul>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⓘ 음역만 비교한 결과이며, 실제 노래 난이도는 멜로디 도약·리듬·발성 기교에 따라 더 어려울 수 있습니다. 본 정보는 일반 참고용입니다.
          </p>
        </section>

        {/* 6. 보컬 트레이닝 효과 추적 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>보컬 트레이닝 효과 추적</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>측정 기록 탭에서 localStorage에 최대 30회</strong> 저장됩니다 (서버 전송 X). 주간·월간 변화를 추적하면 트레이닝 효과를 시각적으로 확인할 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { name: '🔻 최저음 확장', desc: '복부 호흡·후두 위치 안정으로 1~3반음 확장 가능' },
              { name: '🔺 최고음 확장', desc: '두성·믹스 보이스 훈련으로 2~5반음 확장 가능' },
              { name: '📏 안정 음역', desc: '워밍업·발성 안정성 향상으로 흔들림 감소' },
              { name: '🌬️ 가성 최고음', desc: '두성 발성 훈련으로 큰 폭 확장 가능' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{m.name}</p>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 음역대 늘리기 일반 정보 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>음역대 늘리기 — 일반 정보</h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              <li><strong style={{ color: 'var(--text)' }}>워밍업 5~10분</strong> — 립트릴·립버즈로 성대 풀기</li>
              <li><strong style={{ color: 'var(--text)' }}>가장자리 음역 천천히 도전</strong> — 매일 조금씩, 무리 X</li>
              <li><strong style={{ color: 'var(--text)' }}>복부 호흡(횡격막 호흡)</strong> — 안정적 발성 기초</li>
              <li><strong style={{ color: 'var(--text)' }}>믹스 보이스 훈련</strong> — 진성·가성 연결 (유튜브·전문가 강의 권장)</li>
              <li style={{ color: '#FF6B6B' }}><strong>금기 — 무리한 고음·소리 지르기</strong>: 성대 결절·출혈 위험</li>
            </ul>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⚠️ 본 도구는 일반 정보만 제공합니다. 통증·쉰 목소리·이상 시 즉시 중단하고 이비인후과·보컬 트레이너 상담을 권장합니다.
          </p>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '본 도구의 정확도는 어느 정도인가요?',
                a: '<strong>참고용·재미용 도구</strong>입니다. ±2~3반음 정도의 오차가 있을 수 있으며, 마이크 품질·주변 소음·발성 안정성에 크게 영향을 받습니다. 정확한 음역대 평가는 보컬 트레이너의 청각 평가와 전문 장비(예: VoceVista) 측정을 권장합니다. 본 도구는 트레이닝 효과를 <strong>상대적으로 추적</strong>(같은 환경에서 반복 측정)하는 데 더 유용합니다.',
              },
              {
                q: '마이크 권한이 안 잡혀요.',
                a: '브라우저별 확인 — <strong>Chrome/Edge</strong>: 주소창 자물쇠 아이콘 → 마이크 [허용] / <strong>Safari (iOS/Mac)</strong>: 시스템 환경설정 → 보안 및 개인정보보호 → 마이크 / <strong>Firefox</strong>: 주소창 마이크 아이콘 클릭. 권한 거부 후 다시 허용 시에는 페이지를 새로고침해야 합니다. <strong>HTTPS 환경</strong>이 아니면 (예: localhost는 OK) 마이크 권한이 거부됩니다.',
              },
              {
                q: '진성과 가성의 차이는?',
                a: '<strong>진성(흉성)</strong>은 성대 전체가 진동하는 발성으로 가슴에서 울림이 느껴지며 굵고 안정적인 소리가 납니다. <strong>가성(두성)</strong>은 성대 가장자리만 진동하는 발성으로 머리에서 울림이 느껴지며 가볍고 부드러운 소리가 납니다. 본 도구는 두 발성의 자동 구분이 어려우므로 <strong>측정 단계를 분리</strong>해 사용자가 직접 진성·가성 최고음을 따로 기록합니다.',
              },
              {
                q: '측정 결과가 매번 다른 이유?',
                a: '여러 요인이 있습니다 — ① <strong>워밍업 상태</strong>(아침 vs 저녁), ② <strong>발성 안정성</strong>(긴장·피로), ③ <strong>마이크 위치·환경 소음</strong>, ④ <strong>측정 알고리즘 한계</strong>(±2~3반음). 같은 환경·같은 시간대(예: 매일 저녁 워밍업 후)에 반복 측정하면 변화 추적이 더 정확합니다.',
              },
              {
                q: '음역대를 정말 늘릴 수 있나요?',
                a: '<strong>네, 가능합니다.</strong> 보컬 트레이닝 연구에 따르면 꾸준한 훈련으로 6개월~1년에 2~5반음 확장이 일반적입니다. 다만 — ① 유전·신체적 한계 존재, ② 무리한 훈련은 성대 손상 위험, ③ 전문 트레이너 지도가 가장 효과적. 본 도구의 [측정 기록]으로 변화를 추적하면 동기부여에 도움이 됩니다.',
              },
              {
                q: '내 음성 데이터가 서버로 전송되나요?',
                a: '<strong>아니요, 절대 전송되지 않습니다.</strong> 모든 마이크 입력은 브라우저 내 Web Audio API + pitchy 라이브러리로 처리되며, 주파수·MIDI 값만 추출됩니다. 측정 기록도 사용자 브라우저 localStorage에만 저장되며 서버에 전송되지 않습니다. 마이크 권한은 [정지] 버튼으로 즉시 해제할 수 있습니다.',
              },
              {
                q: '노래방에서 키 +1, -1은 무엇을 의미하나요?',
                a: '노래방 키 ±1은 <strong>1반음(semitone)</strong>을 의미합니다. +1 = 한 음 올림(C → C#), -1 = 한 음 내림(C → B). 본 도구의 [노래 매칭]은 ±6 키 범위에서 사용자 음역에 맞는 키를 자동 계산합니다. 일반적으로 ±1~2 키 조정은 자연스럽지만 ±5 이상은 곡 분위기가 크게 달라질 수 있습니다.',
              },
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
        </section>

        {/* 면책 강화 */}
        <section>
          <div style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.30)', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#FF6B6B', marginBottom: '8px' }}>⚠️ 면책 조항</p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '6px' }}>
              본 도구는 <strong style={{ color: 'var(--text)' }}>마이크 입력 기반 추정 도구</strong>이며 정확한 음역대 측정·평가 도구가 아닙니다. 보컬 트레이너의 청각 평가·전문 장비를 권장합니다.
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85 }}>
              <strong style={{ color: 'var(--text)' }}>안전 주의</strong> — 무리한 고음·소리 지르기는 성대 결절·출혈 위험이 있습니다. 통증·쉰 목소리·발성 이상이 지속되면 즉시 중단하고 이비인후과 진료를 받으세요.
            </p>
          </div>
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/art/frequency', icon: '🎵', name: '주파수↔음정 변환기',  desc: 'Hz ↔ 음정·MIDI 번호' },
              { href: '/tools/art/capo',      icon: '🎸', name: '기타 카포 계산기',     desc: '카포 위치·키 변경' },
              { href: '/tools/art/chord',     icon: '🎼', name: '코드 구성음',         desc: '코드별 음정 표시' },
              { href: '/tools/art/bpm',       icon: '🎛️', name: 'BPM 딜레이 계산기',   desc: '딜레이·리버브 ms' },
              { href: '/tools/art/tap-tempo', icon: '🥁', name: '탭 템포',             desc: 'BPM 즉시 측정' },
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
        </section>

      </div>
    </div>
  )
}
