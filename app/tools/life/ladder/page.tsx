import LadderClient from './LadderClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/life/ladder',
  title: '사다리타기 — 무료 온라인 사다리 게임 (캐릭터·실시간 미리보기)',
  description:
    '참가자와 결과를 매칭하는 공정한 사다리타기. 16종 캐릭터, 한 명씩·전체 공개, 클릭으로 개별 경로 공개, 순서 셔플, 빠른 시작 템플릿(점심·당번·벌칙·선물 교환·발표·회식).',
  keywords: [
    '사다리타기', '온라인 사다리', '사다리 게임', '청소 당번', '벌칙 뽑기',
    '선물 교환', '점심 메뉴', '발표 순서', '사다리 무료', '회식 분담', '제비뽑기',
  ],
})

export default function LadderPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪜 사다리타기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        참가자와 결과를 매칭하는 공정한 사다리 게임. <strong style={{ color: 'var(--text)' }}>입력하면 즉시 사다리에 반영, 한 명씩·한 번에 공개, 이름·결과 클릭으로 개별 경로 공개, 16종 캐릭터, 순서 셔플, 6개 빠른 템플릿</strong> — 점심 메뉴부터 선물 교환·청소 당번까지.
      </p>

      <LadderClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 사다리타기 원리 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>사다리타기 원리</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            참가자 N명이 위에서 출발해 사다리를 따라 내려가며 가로줄을 만나면 옆으로 이동, 결국 N개 결과 중 하나에 도착하는 게임입니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구의 알고리즘:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· 참가자 수 × <strong style={{ color: 'var(--text)' }}>1.2~3배</strong> 행의 사다리 (난이도별)</li>
            <li>· 각 행에 무작위 위치에 가로줄 (인접 가로줄 방지)</li>
            <li>· 매번 새 가로줄 분포로 <strong style={{ color: 'var(--text)' }}>같은 명단도 다른 결과</strong> 가능</li>
            <li>· Math.random() 의사난수 + 인접 검증 알고리즘</li>
          </ul>
        </section>

        {/* 2. 결과 공개 방식 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>결과 공개 — 3가지 방법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '👤', name: '한 명씩 공개', desc: '왼쪽부터 한 명씩 자동으로 경로가 그려지며 공개됩니다 (느림·빠름 속도 선택)' },
              { icon: '👥', name: '한 번에 공개', desc: '모든 참가자 경로가 동시에 표시됩니다' },
              { icon: '🖱️', name: '클릭으로 개별 공개', desc: '이름이나 결과를 클릭하면 그 사람의 경로만 공개·숨김 — 원하는 사람부터 자유롭게 확인' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.icon} {m.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 실시간 미리보기 + 셔플 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>실시간 사다리 미리보기 + 순서 셔플</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            참가자·결과를 입력하는 즉시 사다리에 반영됩니다. 결과 공개 전에도 사다리 모양·가로줄을 미리 확인할 수 있고, <strong style={{ color: 'var(--text)' }}>[🔀 순서 섞기]</strong> 버튼으로 참가자·결과 입력 순서를 무작위로 섞고 새 가로줄을 생성할 수 있습니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, background: 'rgba(155,89,182,0.06)', border: '1px solid rgba(155,89,182,0.30)', borderRadius: 10, padding: '11px 14px' }}>
            💡 <strong style={{ color: '#C485E0' }}>왜 셔플이 중요한가?</strong> — 입력 순서대로 배치되면 첫 번째 참가자는 첫 번째 결과 근처에 도착할 가능성이 살짝 더 큽니다(가로줄이 적게 만나서). 셔플하면 입력 순서의 영향이 사라져 더 공정합니다.
          </p>
        </section>

        {/* 4. 6가지 활용 템플릿 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>6가지 빠른 시작 템플릿</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🍱', name: '점심 메뉴',           desc: '못 정할 때 무작위 선택 — 김치찌개·비빔밥·돈가스·국밥' },
              { icon: '🧹', name: '청소 당번',           desc: '공정한 역할 분담 — 거실·주방·화장실·쓰레기' },
              { icon: '😅', name: '벌칙 뽑기',           desc: '게임·내기 벌칙 — 커피·꽝·재밌는 표정' },
              { icon: '🎁', name: '선물 교환 (시크릿 산타)', desc: '익명 모드 함께 — 누가 누구에게 줄지 비밀 유지' },
              { icon: '🎤', name: '발표 순서',           desc: '학교·회사 발표 순서 정하기' },
              { icon: '🍻', name: '회식 분담',           desc: '비용·역할 무작위 — 많이/보통/조금/꽝(공짜)' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{t.icon} {t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 캐릭터 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>캐릭터 자동 배정</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            본 도구는 참가자별로 16가지 동물 캐릭터 이모지를 자동 배정해 시각적 재미를 더합니다:
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textAlign: 'center', fontSize: 28, lineHeight: 1.6, letterSpacing: 4 }}>
            🐶 🐱 🐰 🦊 🐻 🐼 🐯 🦁<br />
            🐸 🐵 🐔 🐧 🦄 🐲 🦖 🐢
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ⓘ 17명 이상이면 캐릭터가 순환됩니다 (1번 = 17번 동일 이모지). 본 도구는 최대 16명을 권장합니다.
          </p>
        </section>

        {/* 6. 옵션 (속도·난이도) */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>옵션 — 애니메이션 속도·가로줄 난이도</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>⏱️ 애니메이션 속도</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· <strong style={{ color: 'var(--text)' }}>느림</strong> — 경로 그리기 2초 (긴장감 ↑)</li>
                <li>· <strong style={{ color: 'var(--text)' }}>빠름</strong> — 0.7초 (빠른 확인)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>🪜 가로줄 난이도</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· <strong style={{ color: 'var(--text)' }}>보통</strong> — 참가자 × 2배 행 (권장)</li>
                <li>· <strong style={{ color: 'var(--text)' }}>많이</strong> — 참가자 × 3배 행 (결과 많이 섞임)</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            본 도구는 참가자별 <strong style={{ color: 'var(--accent)' }}>HSL 균등 색상 경로</strong>(다채로운 모드)를 기본 적용해 누가 어디로 갔는지 한눈에 구별됩니다.
          </p>
        </section>

        {/* 7. 사다리타기 vs 다른 추첨 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>사다리타기 vs 다른 추첨</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>🪜 사다리타기</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 참가자 ↔ 결과 매칭 (N:N)</li>
                <li>· 시각적 재미 강함</li>
                <li>· 모든 참가자에게 결과 분배</li>
                <li>· 선물 교환·역할 분담 적합</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFD700', marginBottom: '6px' }}>🎲 랜덤 추첨기 (별도 도구)</p>
              <ul style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 1명 또는 N명 선택</li>
                <li>· 가중치·룰렛 가능</li>
                <li>· 팀 나누기 전용</li>
                <li>· 한 항목 선택 적합</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>언제 사다리타기?</strong> — 모든 참가자에게 다른 결과 배정해야 할 때, 시각적 재미 우선, 선물 교환·발표 순서.
            {' '}
            <strong style={{ color: 'var(--text)' }}>언제 랜덤 추첨기?</strong> — 단순 1명 뽑기, 가중치, 팀 나누기.
          </p>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '사다리타기는 정말 공정한가요?',
                a: '본 도구는 다음 단계로 공정성을 보장합니다 — ① 매번 새로운 가로줄 위치를 <code>Math.random()</code>으로 무작위 생성, ② 인접 가로줄 방지(사다리 규칙), ③ 모든 참가자가 서로 다른 결과로 도착 보장, ④ 의사난수지만 1,000회 시뮬레이션 시 균등 분포. 같은 명단으로 계속 같은 결과가 나온다고 느껴지면 [🔀 순서 섞기] 또는 [🔄 새 사다리]를 누르면 새 가로줄로 다른 결과가 나옵니다.',
              },
              {
                q: '사다리타기에서 유리한 시작 위치가 있나요?',
                a: '<strong>수학적으로는 없습니다.</strong> 1,000회 이상 시뮬레이션하면 모든 시작 위치가 모든 결과에 거의 균등한 빈도로 도착합니다. 다만 <strong>한 판</strong>만 본다면 다음과 같은 미세한 경향은 있습니다 — ① <strong>양 끝(첫 번째·마지막) 위치는 가로줄을 만날 확률이 1번 적음</strong>(왼쪽 끝은 오른쪽 가로줄만, 오른쪽 끝은 왼쪽 가로줄만 영향). 그래서 <strong>같은 위치의 결과로 도착할 가능성이 중간보다 살짝 높음</strong>. ② 입력 순서대로 배치하면 첫 사람이 첫 결과로 갈 확률이 약간 더 높을 수 있어, 본 도구의 <strong>[🔀 순서 섞기]</strong> 버튼으로 입력 순서의 영향을 제거하는 것을 권장합니다. ③ 가로줄 난이도를 [많이]로 설정하면 양 끝 효과도 거의 사라집니다.',
              },
              {
                q: '익명 모드는 어떻게 작동하나요?',
                a: '<strong>선물 교환(시크릿 산타)</strong>에 적합한 모드입니다 — ① 참가자 이름·결과 행은 그대로 보이지만 매칭은 숨김, ② 각 참가자가 본인 캐릭터 카드 클릭, ③ 본인 결과만 비밀로 표시(다른 사람은 안 보임), ④ 모두 확인 후 게임 종료. 이 방식으로 누가 누구에게 선물할지 비밀이 유지되어 시크릿 산타 게임이 가능합니다.',
              },
              {
                q: '참가자와 결과 개수가 다르면 어떻게 되나요?',
                a: '자동 채우기 옵션 3가지 중 선택할 수 있습니다 — <strong>꽝 추가</strong>(부족분 "꽝" 자동, 예: 8명 + 당첨 2 → 꽝 6 자동), <strong>균등 분배</strong>(각 결과를 균등 인원에, 예: 6명 + 3결과 → 각 2명씩), <strong>결과 반복</strong>(결과 순환 배정, 예: 5명 + 3결과 → 1,2,3,1,2). 직접 [+ 늘리기] [− 줄이기]로 수동 조정도 가능합니다.',
              },
              {
                q: '결과를 미리 정해놓을 수 있나요?',
                a: '<strong>아닙니다.</strong> 본 사다리타기는 가로줄 무작위 생성이 핵심이며 누가 어떤 결과를 받을지 미리 정할 수 없습니다. 만약 특정 사람에게 특정 결과를 주고 싶다면 사다리타기보다 직접 배정 또는 다른 방법을 권장합니다. 사다리타기의 본질은 <strong>"공정한 무작위 분배"</strong>입니다.',
              },
              {
                q: '모바일에서도 잘 작동하나요?',
                a: '네, 본 도구는 모바일·데스크탑 모두 최적화되어 있습니다 — 참가자 16명까지 가로 스크롤, 캐릭터 이모지(60fps 애니메이션), 터치 친화적 큰 버튼, 결과 텍스트 복사로 카카오톡 공유 가능. 모바일에서 가로줄이 많은 사다리는 옆으로 스크롤해 확인할 수 있습니다.',
              },
              {
                q: '저장된 게임은 어디에 보관되나요?',
                a: '사용자 브라우저의 <strong>localStorage</strong>에 저장됩니다 (최대 30개). 회원가입·로그인 불필요, 빠른 접근, 사생활 보호. 단, 같은 브라우저·기기에서만 접근 가능하며 캐시 삭제·시크릿 모드 시 사라집니다. 다른 기기에서 사용하거나 영구 보관하려면 <strong>[백업 다운로드]</strong> 기능으로 JSON 파일을 저장하시기 바랍니다.',
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/life/random',     icon: '🎲', name: '랜덤 추첨기', desc: '가중치 추첨·룰렛·팀 나누기' },
              { href: '/tools/life/lotto',      icon: '🎰', name: '로또 번호 생성기',         desc: '8가지 모드·확률 시뮬' },
              { href: '/tools/life/dutch',      icon: '🍻', name: '더치페이 계산기',          desc: '회식·모임 비용 분배' },
              { href: '/tools/life/unit-price', icon: '💵', name: '단가 비교 계산기',         desc: '쇼핑 가성비 비교' },
              { href: '/tools/life/zodiac',     icon: '🐲', name: '띠·별자리 계산기',         desc: '재미용 운세' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',          desc: '집중·휴식 사이클' },
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

      </div>
    </div>
  )
}
