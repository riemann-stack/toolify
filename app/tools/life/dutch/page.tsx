import DutchClient from './DutchClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/life/dutch',
  title: '더치페이 계산기 — N빵·술값 분리·개인별 메뉴·선결제자 최소 송금·카톡 공유',
  description:
    '회식·여행 정산을 가장 적은 송금 횟수로. 음주자만 술값 분담, 메뉴별 개인 정산, Greedy 최소 송금 알고리즘 + 카카오톡 메시지 자동 생성.',
  keywords: [
    '더치페이 계산기', 'N빵 계산기', '회식비 계산기', '1인당 금액 계산',
    '술값 분리', '회식 정산', '모임비 정산', '선결제자 정산',
    '최소 송금 횟수', '카카오톡 정산', '여행 경비 정산', '팀 회식비',
    '잔돈 처리', '음주자 분담', '공동 메뉴 정산',
  ],
})

export default function DutchPage() {
  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍻 더치페이 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        회식·여행 정산을 <strong style={{ color: 'var(--text)' }}>가장 적은 송금 횟수</strong>로. 술값 분리·개인 메뉴·카톡 공유.
      </p>

      <DutchClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 5가지 정산 모드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>5가지 정산 모드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '🍻', name: '간단 N빵', desc: '총액 ÷ 인원 = 1인당. 7가지 1원 단위 처리(1원/100원/1,000원 × 반올림/올림/내림) + 5가지 잔여 금액 처리.' },
              { icon: '🍺', name: '술값 분리', desc: '비음주자는 음식값만, 음주자는 음식값+술값. 회식에서 가장 많이 쓰이는 공정한 방식.' },
              { icon: '🍱', name: '개인별 정산', desc: '각자 본인 메뉴는 직접 부담, 공동 메뉴는 전원 균등 분담, 공동 술값은 음주자만 분배. 최대 20명.' },
              { icon: '💸', name: '선결제자 정산', desc: '여러 명이 나눠 결제했을 때 누가 누구에게 얼마를 보낼지 — Greedy 알고리즘으로 최소 송금 횟수.' },
              { icon: '💬', name: '카톡 공유', desc: '4가지 정산 결과를 카카오톡 형식 메시지로 자동 생성. 받을 사람·계좌번호도 한 번에 안내.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '4px' }}>{m.icon} {m.name}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 7가지 1원 단위 처리 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>7가지 1원 단위 처리</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            18,750원 같은 어정쩡한 금액을 자릿수에 맞춰 깔끔하게 정리합니다. 모임 성격에 따라 적합한 옵션이 다릅니다.
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>· <strong style={{ color: 'var(--text)' }}>1원 단위</strong> — 여행 정산 등 정밀 계산</li>
            <li>· <strong style={{ color: 'var(--text)' }}>100원 반올림 / 올림 / 내림</strong> — 일반 회식·카페</li>
            <li>· <strong style={{ color: 'var(--text)' }}>1,000원 반올림</strong> — 깔끔한 송금</li>
            <li>· <strong style={{ color: 'var(--text)' }}>1,000원 올림</strong> — 술자리·팀 회식 (잔돈을 다음 모임 공금으로)</li>
            <li>· <strong style={{ color: 'var(--text)' }}>1,000원 내림</strong> — 결제자가 차액 부담 시</li>
          </ul>
        </section>

        {/* 3. 5가지 잔여 처리 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>5가지 잔여 금액 처리</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            절삭으로 생긴 차액(잔돈 또는 부족분)을 어떻게 처리할지 선택할 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { name: '공금으로', desc: '잔돈을 모아 다음 회식·모임 공금으로 — 가장 일반적' },
              { name: '결제자가 받기', desc: '대표 결제자가 잔돈을 가짐 — 결제 수고비' },
              { name: '첫 번째 사람이 부담', desc: '리스트 첫 사람이 차액 부담 — 부족분 처리에 유용' },
              { name: '무작위 1명이 부담', desc: '난수로 한 명 뽑아 차액 부담 — 게임처럼' },
              { name: '균등 분배 (1원 단위)', desc: '잔돈도 정확히 1원 단위로 — 여행 정산에 최적' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 13px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '3px' }}>{r.name}</p>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 술값 분리 공식 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>술값 분리 — 공정한 회식 정산</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            회식에서 가장 자주 발생하는 형평성 문제. 본 도구는 다음 공식으로 자동 계산합니다 —
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: 'var(--text)', lineHeight: 1.85, fontFamily: 'Inter, system-ui, sans-serif' }}>
            <strong>음식값</strong> = 총액 − 술값<br />
            <strong>비음주자 1인</strong> = 음식값 ÷ 전체 인원<br />
            <strong>음주자 1인</strong> = (음식값 ÷ 전체) + (술값 ÷ 음주자)
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            예: 총 200,000원 / 술값 80,000원 / 6명 (음주 4명, 비음주 2명) → 비음주 20,000원, 음주 40,000원.
            음주자가 1인당 <strong style={{ color: '#EA580C' }}>20,000원 더 부담</strong>합니다.
          </p>
        </section>

        {/* 5. 선결제자 최소 송금 알고리즘 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>선결제자 — 최소 송금 횟수 알고리즘</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            여러 명이 나눠서 결제했을 때 누가 누구에게 얼마를 보낼지 결정하는 문제. 본 도구는
            <strong style={{ color: 'var(--text)' }}> Greedy(탐욕) 알고리즘</strong>으로 송금 횟수를 최소화합니다 —
          </p>
          <ol style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, paddingLeft: '20px', margin: 0 }}>
            <li>각자의 잔액 = 결제액 − 부담액 (+ 받을, − 낼)</li>
            <li>가장 많이 받을 사람과 가장 많이 낼 사람 매칭</li>
            <li>두 금액 중 작은 쪽만큼 송금 처리</li>
            <li>잔액 0인 사람 제외, 1~3 반복</li>
          </ol>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px', background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.30)', borderRadius: 10, padding: '11px 14px' }}>
            💡 <strong style={{ color: '#CA8A04' }}>예시</strong> — A 30,000 / B 0 / C 60,000 결제, 각자 30,000 부담 →
            <br />· B → A: 0원 (둘 다 잔액 0)
            <br />· B → C: 30,000원 (1건)
            <br />단순 계산이면 B가 A·C에게 각각 송금(2건)이지만 알고리즘이 1건으로 압축합니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
            <strong style={{ color: 'var(--text)' }}>찬조자(Contributor)</strong> — 결제는 했지만 부담은 없는 사람(상사 협찬·생일 주인공 협찬 등). 체크박스로 표시하면 부담 0원으로 처리되어 다른 사람들에게 100% 환급됩니다.
          </p>
        </section>

        {/* 6. 개인별 정산 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>개인별 정산 — 메뉴별 가격 차이가 클 때</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            메뉴별 가격 차이가 큰 모임에 적합 (한 명은 스테이크, 한 명은 샐러드). 각자의 부담은 —
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: 'var(--text)', lineHeight: 1.85, fontFamily: 'Inter, system-ui, sans-serif' }}>
            본인 부담 = 본인 메뉴 합계
            <br />+ 공동 메뉴 합계 ÷ 전체 인원
            <br />+ 공동 술값 ÷ 음주자 수 (음주자만)
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>예</strong> — 3명이 각자 스테이크(35,000) / 파스타(22,000) / 샐러드(18,000)를 시키고 공동 와인(30,000원)을 마셨다면, 각자 본인 메뉴 + 와인 10,000원씩 부담. 메뉴별로 정확히 본인이 먹은 만큼만 내므로 가장 공정합니다.
          </p>
        </section>

        {/* 7. 1인당 적정 예산 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>모임별 1인당 적정 예산</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            모임 성격별 평균 1인당 예산 — 2025년 서울·수도권 평균치 참고용입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🍱', name: '점심 회식', amount: '12,000~18,000원', desc: '구내식당·일반 식당 정찬' },
              { icon: '☕', name: '카페 모임',  amount: '6,000~10,000원',  desc: '음료 + 디저트 1' },
              { icon: '🍻', name: '저녁 회식', amount: '30,000~50,000원', desc: '고기·삼겹·치킨 + 술 1차' },
              { icon: '🍺', name: '2차 술자리', amount: '15,000~30,000원', desc: '맥주집·호프·이자카야' },
              { icon: '🥂', name: '팀 회식',   amount: '50,000~80,000원', desc: '소고기·횟집·코스 요리' },
              { icon: '🎂', name: '생일 모임', amount: '30,000~60,000원', desc: '레스토랑 + 케이크·선물' },
              { icon: '👨‍👩‍👧', name: '가족 외식', amount: '20,000~40,000원', desc: '한식·중식·패밀리 레스토랑' },
              { icon: '✈️', name: '여행 1일',  amount: '50,000~100,000원', desc: '식비·교통·입장료 평균' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text)', fontWeight: 700, marginBottom: '3px' }}>{s.icon} {s.name}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', margin: '0 0 3px' }}>{s.amount}</p>
                <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. 카톡 공유 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>카카오톡 공유 메시지</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            4가지 정산 결과를 카톡 형식 메시지로 자동 생성합니다. 모임 제목·받을 사람·계좌번호를 입력하면 그대로 복사해 채팅방에 붙여넣을 수 있습니다.
          </p>
          <div style={{ background: '#FFE400', border: '2px solid #FFD600', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#3C1E1E', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'Noto Sans KR, sans-serif' }}>
            🍻 1월 팀 회식{'\n'}
            ━━━━━━━━━━━━━━{'\n'}
            총 금액: 240,000원{'\n'}
            인원: 6명{'\n'}
            💰 1인당: 40,000원{'\n'}{'\n'}
            💸 입금 안내{'\n'}
            받을 사람: 김OO{'\n'}
            카뱅 3333-XX-XXXXXX
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ⓘ 카카오톡 자동 전송은 카카오 정책상 제한됩니다. 본 도구는 <strong style={{ color: 'var(--text)' }}>메시지 자동 생성 + 클립보드 복사 + 카톡 열기</strong>까지 지원합니다.
          </p>
        </section>

        {/* 9. FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '술을 안 마신 사람도 술값을 내야 하나요?',
                a: '<strong>모임 문화에 따라 다릅니다.</strong> 본 도구의 <strong>[술값 분리]</strong> 탭을 사용하면 음식값은 전원이 나누고 술값은 음주자들끼리만 나누는 방식으로 정산할 수 있어 형평성 논란을 줄일 수 있습니다. 한국 회식에서는 술값 분리가 표준에 가깝고, 가족·친구 모임에서는 균등 N빵이 더 일반적입니다. 모임 시작 전에 합의해두는 것이 가장 좋습니다.',
              },
              {
                q: '잔돈은 어떻게 처리하는 게 좋을까요?',
                a: '본 도구는 <strong>5가지 잔여 처리</strong>를 지원합니다 — ① <strong>공금으로</strong>(가장 일반적, 다음 회식 사용), ② <strong>결제자가 받기</strong>(결제 수고비 명분), ③ <strong>첫 사람 부담</strong>(부족분 처리), ④ <strong>무작위 1명</strong>(게임처럼), ⑤ <strong>1원 단위 균등</strong>(여행 정산 최적). 회식에서는 <strong>1,000원 올림 + 잔돈 공금</strong>이 가장 깔끔하고, 여행에서는 <strong>정확히 1원 단위 + 균등 분배</strong>가 공정합니다.',
              },
              {
                q: '여러 명이 나눠 결제했을 때 송금 횟수를 줄일 수 있나요?',
                a: '<strong>네, [선결제자 정산] 탭을 사용하세요.</strong> Greedy 알고리즘으로 가장 많이 받을 사람과 가장 많이 낼 사람을 매칭해 송금 횟수를 최소화합니다. 예를 들어 5명이 나눠 결제하고 균등 부담일 때 단순 계산이면 최대 4건의 송금이 필요하지만 알고리즘은 평균 2~3건으로 압축합니다. 토스·카카오페이로 한 번에 보낼 수 있어 편리합니다.',
              },
              {
                q: '찬조자(부담 0원)는 어떻게 처리되나요?',
                a: '선결제자 정산 탭에서 각 참가자별 <strong>💝 찬조자</strong> 체크박스를 켜면 그 사람은 결제만 하고 부담은 0원으로 처리됩니다. 상사가 회식비 일부를 협찬하거나 생일 주인공의 부모님이 미리 결제한 경우 등에 사용합니다. 찬조자가 결제한 금액은 다른 참가자들의 부담에서 자동 차감되어 균등 분배됩니다.',
              },
              {
                q: '여행 경비 정산도 가능한가요?',
                a: '<strong>네, 본 도구가 가장 강력한 영역입니다.</strong> ① [간단 N빵]에서 <strong>1원 단위 + 균등 분배</strong>를 선택하면 잔돈까지 정확히 나뉩니다. ② 일정별로 결제자가 다르다면 [선결제자 정산] 탭에서 각자 결제액·부담액을 입력해 최소 송금으로 정리할 수 있습니다. ③ 메뉴별 가격이 크게 다르면 [개인별 정산] 탭에서 본인 메뉴 + 공동 메뉴 균등 분담으로 정산할 수 있습니다.',
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
              { href: '/tools/life/ladder',     icon: '🪜', name: '사다리타기',              desc: '회식 분담·점심 메뉴 정하기' },
              { href: '/tools/life/lotto',      icon: '🎰', name: '로또 번호 생성기',         desc: '8가지 모드·확률 시뮬' },
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
