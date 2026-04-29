import BakingScheduleClient from './BakingScheduleClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/cooking/baking-schedule',
  title: '제빵 타임라인 계산기 — 사워도우·바게트·식빵 발효·굽기 일정 자동 생성',
  description:
    '빵 종류·시작 시간·발효 방식·실내 온도로 오토리즈, 폴딩, 발효, 성형, 굽기 전체 일정을 자동 생성합니다. 완성 시간 역산, 냉장 발효, 8가지 빵 프리셋 지원.',
  keywords: [
    '제빵 타임라인', '빵 굽기 스케줄', '사워도우 일정', '바게트 발효 시간',
    '냉장 발효 계산', '홈베이킹', '제빵 시간 계산', '발효 시간', '오토리즈', '폴딩 간격',
    '치아바타 일정', '식빵 발효', '포카치아', '베이글', '피자 도우', '크루아상',
    '비가', '푸어리쉬', '르방', '제빵 스케줄러',
  ],
})

export default function BakingSchedulePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍞 제빵 타임라인 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        빵 종류·시작 시간·발효 방식에 맞춰 오토리즈, 폴딩, 발효, 성형, 굽기 일정을 자동 생성합니다. 완성 시간 역산도 가능. <strong style={{ color: 'var(--text)' }}>발효는 시간보다 반죽 상태가 우선</strong>이라는 원칙 아래 가이드를 함께 제공합니다.
      </p>

      <BakingScheduleClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 제빵 단계 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>제빵 단계 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            대부분의 빵은 다음 8단계로 구성됩니다 (빵 종류에 따라 가감):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '① 오토리즈 (Autolyse, 30분~1시간)', desc: '밀가루 + 물만 미리 섞어 휴지. 글루텐이 자동 형성되어 본반죽 시간 단축, 수분 흡수 향상, 풍미 발달.' },
              { step: '② 본반죽 (Mixing)', desc: '소금·이스트(또는 르방) 투입. 5~15분 치대기 또는 폴딩 시작.' },
              { step: '③ 폴딩 (Stretch & Fold, 30분 간격 4~6회)', desc: '손이나 주걱으로 반죽을 접어 글루텐 강화. 사워도우·치아바타·포카치아 등 고수분 빵 핵심.' },
              { step: '④ 1차 발효 (Bulk Fermentation, 1~6시간)', desc: '⭐ 부피 50~70% 증가 + 큰 기포 형성이 기준. 가장 큰 시간 변수 (온도 의존).' },
              { step: '⑤ 분할·예비 성형·벤치 타임', desc: '분할 후 둥글리기 → 휴지 (15~30분). 글루텐 이완.' },
              { step: '⑥ 본 성형 (Final Shape)', desc: '빵 모양 만들기. 표면 텐션 유지가 핵심.' },
              { step: '⑦ 2차 발효 (Final Proof, 30분~24시간)', desc: '⭐ 손가락 자국이 천천히 회복되면 완료. 실온 30~60분 또는 냉장 8~24시간.' },
              { step: '⑧ 굽기 (Baking)', desc: '오븐 예열 30~45분(250℃ 추천). 굽기 20~40분. 첫 5~10분 스팀.' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px', fontFamily: 'Noto Sans KR, sans-serif' }}>{s.step}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 발효 방식 비교 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>발효 방식 비교</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['방식', '시간', '풍미', '추천 빵'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['당일 발효 (실온)', '4~6시간',  '가벼움',     '식빵·포카치아'],
                  ['냉장 1차 발효',  '8~12시간', '깊음',        '사워도우·바게트'],
                  ['냉장 2차 발효 ⭐','8~24시간', '깊음·일정 유연', '사워도우·피자 도우'],
                  ['비가/푸어리쉬', '12~16시간 (전날)', '매우 깊음', '바게트·치아바타'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 온도와 발효 시간 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>온도와 발효 시간</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>22℃를 표준</strong>으로 1차·2차 발효 시간이 다음과 같이 변동됩니다:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['실내 온도', '시간 배율', '안내'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['18℃', '×1.5', '발효 느림. 시간 충분히 확보'],
                  ['22℃', '×1.0', '표준 발효 환경 ⭐'],
                  ['26℃', '×0.75', '빠름, 자주 확인'],
                  ['28℃', '×0.6', '⚠️ 과발효 주의'],
                  ['30℃', '×0.5', '⚠️ 냉장 발효 권장'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>한국 계절별 실내 온도</strong>: 겨울 난방 X 16~20℃ · 봄/가을 20~24℃ · 여름 26~30℃ · 여름 에어컨 24~26℃.
          </p>
        </section>

        {/* 4. 빵별 표준 일정 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>8가지 빵별 표준 일정</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🌾', name: '사워도우 (24시간)',  desc: '오토리즈 30분 → 폴딩 4회 → 1차 발효 3시간 → 성형 → 냉장 12~16시간 → 굽기' },
              { icon: '🥖', name: '바게트 (5시간)',     desc: '오토리즈 → 폴딩 2회 → 1차 발효 1.5시간 → 성형 → 2차 발효 1시간 → 굽기' },
              { icon: '🥪', name: '치아바타 (18시간)',  desc: '비가 전날 → 본반죽 → 폴딩 3회 → 1차 발효 2시간 → 분할 → 2차 발효 → 굽기' },
              { icon: '🍞', name: '식빵 (4시간) — 입문', desc: '반죽·치대기 → 1차 발효 1시간 → 분할·성형 → 2차 발효 50분 → 굽기' },
              { icon: '🫓', name: '포카치아 (5시간)',   desc: '반죽 → 폴딩 2회 → 1차 발효 2시간 → 팬 → 2차 발효 45분 → 토핑 → 굽기' },
              { icon: '🥯', name: '베이글 (4시간)',     desc: '반죽·치대기 → 1차 발효 1시간 → 성형 → 2차 발효 30분 → 끓이기 → 굽기' },
              { icon: '🍕', name: '피자 도우 (24~48시간)', desc: '반죽 → 1차 실온 1시간 → 냉장 24~48시간 → 실온 1시간 → 토핑·굽기' },
              { icon: '🥐', name: '크루아상 (16시간)',  desc: '반죽 → 휴지 → 버터 봉입·접기 3회 → 12시간 휴지 → 재단 → 2차 발효 → 굽기' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{b.icon} {b.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 완성 시간 역산 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>완성 시간 역산 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>&quot;내일 아침 9시에 빵 먹고 싶다&quot;</strong>면 [완성 시간 역산] 탭에서 거꾸로 계산합니다:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { case: '사워도우 (냉장 발효)', detail: '전날 14:00 시작 → 다음날 09:00 완성 ⭐ 가장 인기 일정' },
              { case: '식빵 (당일 발효)',   detail: '당일 04:30 시작 → 09:00 완성 (이르므로 비추천) — 또는 전날 18:00 1차 발효 → 다음날' },
              { case: '바게트 (당일 발효)',  detail: '당일 03:30 시작 → 09:00 완성' },
              { case: '피자 도우',          detail: '먹기 2일 전 반죽 → 24~48시간 냉장 → 당일 굽기' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>{c.case}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 반죽 상태 판단 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>반죽 상태 판단 — 시간보다 중요</h2>
          <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.30)', borderRadius: 12, padding: '14px 18px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85 }}>
              ⭐ <strong style={{ color: '#FFD700' }}>본 도구의 시간은 22℃ 표준 기준 가이드</strong>입니다. 실제 발효는 실내 온도, 밀가루, 이스트·르방 활성도, 수분율에 따라 크게 달라지므로 <strong style={{ color: '#FFD700' }}>반죽 상태를 함께 확인</strong>하세요.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { title: '1차 발효 완료 신호', items: ['부피 50~70% 증가', '큰 기포 형성 (표면·내부)', '부드럽고 가벼운 느낌', '손가락 자국 천천히 회복'] },
              { title: '2차 발효 완료 신호', items: ['부피 1.5배 증가', '손가락 자국 살짝 남기', '표면 매끄럽고 윤기'] },
              { title: '글루텐 충분 (윈도우 페인)', items: ['반죽 작은 조각 양손으로 늘리기', '찢어지지 않고 얇은 막 → OK', '찢어짐 → 더 치대기'] },
              { title: '⚠️ 과발효 신호', items: ['부피 2배 이상', '큰 기포 터짐', '시큼한 냄새', '반죽 무너짐 → 즉시 굽거나 폐기'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>{g.title}</p>
                <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                  {g.items.map(it => <li key={it}>· {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 흔한 실수 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>흔한 실수와 해결법</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { problem: '1차 발효 부족', signal: '빵 부피 작음, 무거움',         fix: '시간 더 주거나 따뜻한 곳' },
              { problem: '1차 발효 과다', signal: '빵 무너짐, 시큼한 맛',          fix: '다음에 시간 단축, 온도 낮춤' },
              { problem: '2차 발효 부족', signal: '빵 갈라짐, 모양 안 잡힘',       fix: '시간 더 주기' },
              { problem: '2차 발효 과다', signal: '빵 표면 주저앉음',              fix: '즉시 굽기' },
              { problem: '오븐 예열 부족', signal: '굽기 색·구조 안 좋음',         fix: '250℃ 30분 이상 예열, 온도계로 확인' },
            ].map((it, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', fontSize: '12.5px' }}>
                <span style={{ color: '#FF6B6B', fontWeight: 700 }}>{it.problem}</span>
                <span style={{ color: 'var(--text)' }}>{it.signal}</span>
                <span style={{ color: 'var(--muted)' }}>→ {it.fix}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '발효 시간을 정확히 지키면 빵이 잘 나올까요?',
                a: '시간은 가이드일 뿐, 가장 중요한 건 <strong>반죽 상태</strong>입니다. 같은 시간이라도 실내 온도, 밀가루, 이스트·르방 활성도에 따라 결과가 다릅니다. 본 도구의 일정은 대략적인 시간 기준이며, 최종 판단은 <strong>부피 50~70% 증가, 큰 기포 형성, 손가락 테스트</strong>로 하세요. 시간 의존이 아닌 관찰·경험 기반으로 갈수록 빵 품질이 좋아집니다.',
              },
              {
                q: '사워도우 냉장 발효는 몇 시간이 가장 좋나요?',
                a: '일반적으로 <strong>8~16시간</strong>이 가장 인기 있는 범위입니다 — 8시간(가벼운 풍미·적당한 산미), <strong>12시간(표준, 균형 ⭐)</strong>, 16시간(깊은 풍미·강한 산미), 24시간+(매우 깊지만 산미 호불호). 르방 활성도와 1차 발효 정도에 따라 조정하세요. 처음에는 12시간으로 시작해 다음에 가감하는 것을 권장합니다.',
              },
              {
                q: '실내 온도 28℃ 여름에 빵을 만들려면?',
                a: '여름 한국 실내(26~30℃)는 발효가 매우 빠릅니다. ① <strong>냉장 발효 적극 활용</strong>(1차 또는 2차) ② 시간 단축(표준의 60~70%) ③ 차가운 물 사용(얼음물 가능) ④ 실내 시원한 위치(욕실·북향 방) ⑤ 자주 부피 확인(1시간 간격) ⑥ 이스트·르방 양 줄이기(1.5%로 단축). 또는 여름엔 무발효 빵(스콘·머핀)으로 전환하는 것도 방법입니다.',
              },
              {
                q: '오토리즈는 꼭 해야 하나요?',
                a: '필수는 아니지만 <strong>권장</strong>되는 단계입니다. 효과: 글루텐 자동 형성(치대기 시간 단축), 수분 흡수 향상(부드러운 빵), 풍미 발달, 작업 시간 절약. 30분~1시간이면 충분하며, <strong>사워도우·바게트·치아바타</strong> 등 고수분 빵에 특히 효과적입니다. 식빵·베이글 등 저수분 빵은 오토리즈 없이도 큰 차이 없습니다.',
              },
              {
                q: '빵 완성 시간을 정확히 맞추려면?',
                a: '본 도구의 [완성 시간 역산] 탭을 활용하세요. 다만 정확히 맞추기는 어려울 수 있습니다 — 발효 시간은 ±20% 변동 가능합니다. 팁: <strong>완성 시간보다 30분~1시간 여유 있게 시작</strong>, 발효 종료 직전 자주 확인, 발효는 끝났는데 굽기 못하면 냉장고에 임시 보관, 굽기 30분 전 오븐 예열 시작. 여러 번 만들어 자기 환경에 맞는 시간을 알아가는 것이 가장 정확합니다.',
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
              { href: '/tools/cooking/baker-percent',    icon: '🥖', name: '베이커 퍼센트 계산기',    desc: '제빵 배합비·수분율·르방 자동' },
              { href: '/tools/cooking/sourdough',        icon: '🍞', name: '사워도우 스타터 계산기',  desc: '르방 안정화·피크 시간 예측' },
              { href: '/tools/cooking/recipe',           icon: '📐', name: '레시피 비율 계산기',       desc: '인분 수에 맞춰 재료 환산' },
              { href: '/tools/cooking/unit',             icon: '🥄', name: '요리 단위 변환기',         desc: '컵·큰술·g 정확 환산' },
              { href: '/tools/cooking/thawing',          icon: '🧊', name: '냉동·해동 시간 계산기',    desc: '식품 두께·무게 기반 해동' },
              { href: '/tools/cooking/serving',          icon: '🍽️', name: '1인분 분량 계산기',         desc: '재료별 인분 분량' },
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
            <li><strong style={{ color: 'var(--text)' }}>Tartine Bread</strong> by Chad Robertson — 사워도우 클래식</li>
            <li><strong style={{ color: 'var(--text)' }}>Flour Water Salt Yeast</strong> by Ken Forkish — 홈베이킹 기본서</li>
            <li><strong style={{ color: 'var(--text)' }}>The Bread Baker&apos;s Apprentice</strong> by Peter Reinhart — 제빵 기술 종합</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
