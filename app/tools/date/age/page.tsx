import AgeClient from './AgeClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/date/age',
  title: '만 나이·생일·인생 통계 계산기 — D-day, 1만일, 띠, 별자리, 환갑',
  description:
    '만 나이 통일법 기준 만 나이 계산부터 다음 생일 D-day, 태어난 지 며칠, 1만일·환갑·칠순 마일스톤, 띠·별자리·탄생석, 인생 시간 통계까지 한 번에.',
  keywords: [
    '만나이계산기', '만나이', '연나이', '세는나이', '생일D-day', '태어난지며칠',
    '1만일', '띠계산', '별자리계산', '환갑', '칠순', '인생타임라인',
    '만나이통일법', '나이계산기', '탄생석', '한국세대', '인생통계',
  ],
})

export default function AgePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🎂 만 나이·생일·인생 통계 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        만 나이부터 D-day, 1만일 기념, 인생 시간 통계, 띠·별자리·탄생석, 생일 카운트다운까지 한 번에. 만 나이 통일법(2023.6.28) 기준으로 정확하게 계산합니다.
      </p>

      <AgeClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 만 나이 통일법 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>만 나이 통일법 — 무엇이 달라졌나?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>2023년 6월 28일</strong>부터 민법(제158조) 및 행정기본법(제7조의2) 개정으로 법령·계약·공문서에서 나이 표기는 모두 만 나이로 통일되었습니다. 한국 사회에서 오랫동안 혼용되어 온 세는 나이·연 나이의 혼란을 줄이는 것이 목적입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '시행일', content: '2023년 6월 28일 — 행정기본법 제7조의2, 민법 제158조 개정 시행.' },
              { title: '달라지는 것', content: '의료기관 나이 기준, 보험 계약, 법적 서류 등에서 만 나이 사용. 예) 65세 의료 혜택은 만 65세 생일이 지난 날부터 적용.' },
              { title: '달라지지 않는 것', content: '학교 입학(3월 1일 기준 연도), 병역 의무(연 나이), 청소년 보호법(주류·담배 — 연 나이) 등 일부 특별법은 기존 방식 유지.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 3종 나이 비교 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>만 나이·세는 나이·연 나이 비교</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>만 나이</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>세는 나이</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>연 나이</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['계산 방법', '생일 기준 — 생일 전 1살 적음', '태어나자마자 1세, 1월 1일 +1살', '현재 연도 - 출생 연도'],
                  ['적용 범위', '법령·행정·계약 (2023.6~)',     '일상 대화',                        '병역법·청소년 보호법 일부'],
                  ['예시',       '2000-05생 → 2026.04 = 25세',     '2000년생 → 2026 = 27세',         '2026 - 2000 = 26세'],
                  ['특징',       '국제 표준, 정확함',                '한국 전통 방식',                   '간단하지만 오차 있음'],
                ].map(([label, man, se, yeon], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{man}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{se}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{yeon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 인생 시간 통계 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>인생 시간 통계 — 태어난 지 며칠?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            하루를 살면 약 <strong style={{ color: 'var(--text)' }}>24시간 = 1,440분 = 86,400초</strong>가 흐릅니다. 평균 70 BPM 기준 심장은 100,800회 뛰고, 호흡은 23,040회(16/분), 잠은 약 8시간(인생의 33%)을 차지합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>일수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>해당 만 나이 (대략)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['100일',     '— ', '한국 전통 백일 잔치'],
                  ['365일',     '만 1세', '첫 돌'],
                  ['1,000일',   '약 만 2.7세', '연인·부부 1,000일 기념'],
                  ['10,000일',  '약 만 27.4세', '한 번뿐인 큰 마일스톤'],
                  ['12,345일',  '약 만 33.8세', '재미있는 숫자 기념'],
                  ['20,000일',  '약 만 54.8세', '두 번째 큰 마일스톤'],
                  ['25,567일',  '약 만 70세', '약 70년 = 25,567일'],
                  ['30,000일',  '약 만 82세', '한국 평균 기대수명 근처'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 띠 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>띠 (12간지) 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            12간지는 <strong style={{ color: 'var(--text)' }}>자축인묘진사오미신유술해(子丑寅卯辰巳午未申酉戌亥)</strong> 순으로 12년마다 순환합니다. 2024 = 용, 2025 = 뱀, 2026 = 말띠 순입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
            {[
              ['🐭', '쥐'], ['🐂', '소'], ['🐅', '범'], ['🐇', '토끼'], ['🐲', '용'], ['🐍', '뱀'],
              ['🐎', '말'], ['🐑', '양'], ['🐒', '원숭이'], ['🐓', '닭'], ['🐕', '개'], ['🐖', '돼지'],
            ].map(([e, n]) => (
              <div key={n} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px' }}>{e}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)', marginTop: '4px' }}>{n}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ⚠️ 정확한 띠는 <strong style={{ color: 'var(--text)' }}>음력 1월 1일(설날) 기준</strong>으로 바뀝니다. 양력 1월~2월 초 출생자는 음력으로 아직 전년도일 수 있어 띠가 다를 수 있으므로, 본 도구의 결과(양력 연도 기준)를 그대로 신뢰하기보다 음양력 변환기로 별도 확인을 권장합니다.
          </p>
        </section>

        {/* 5. 별자리 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>별자리 가이드 (서양 12궁)</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            서양 12별자리는 <strong style={{ color: 'var(--text)' }}>4원소(불·흙·공기·물)</strong>로 분류됩니다. 양력 생일 기준이며, 별자리 경계일 출생자는 ±1일 차이를 인정하기도 합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { e: '♈', n: '양자리',     r: '3/21~4/19',   x: '불' },
              { e: '♉', n: '황소자리',   r: '4/20~5/20',   x: '흙' },
              { e: '♊', n: '쌍둥이자리', r: '5/21~6/21',   x: '공기' },
              { e: '♋', n: '게자리',     r: '6/22~7/22',   x: '물' },
              { e: '♌', n: '사자자리',   r: '7/23~8/22',   x: '불' },
              { e: '♍', n: '처녀자리',   r: '8/23~9/22',   x: '흙' },
              { e: '♎', n: '천칭자리',   r: '9/23~10/22',  x: '공기' },
              { e: '♏', n: '전갈자리',   r: '10/23~11/22', x: '물' },
              { e: '♐', n: '사수자리',   r: '11/23~12/21', x: '불' },
              { e: '♑', n: '염소자리',   r: '12/22~1/19',  x: '흙' },
              { e: '♒', n: '물병자리',   r: '1/20~2/18',   x: '공기' },
              { e: '♓', n: '물고기자리', r: '2/19~3/20',   x: '물' },
            ].map(z => (
              <div key={z.n} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: '8px', alignItems: 'center', fontSize: '12.5px' }}>
                <span style={{ fontSize: '22px' }}>{z.e}</span>
                <span><strong style={{ color: 'var(--text)' }}>{z.n}</strong> · <span style={{ color: 'var(--muted)' }}>{z.r}</span></span>
                <span style={{ color: '#3EC8FF', fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 600 }}>{z.x}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 탄생석·탄생화 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>월별 탄생석·탄생화</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              ['1월', '가넷', '카네이션', '진실'],
              ['2월', '자수정', '아이리스', '평화'],
              ['3월', '아쿠아마린', '수선화', '용기'],
              ['4월', '다이아몬드', '데이지', '순수'],
              ['5월', '에메랄드', '은방울꽃', '행복'],
              ['6월', '진주', '장미', '사랑'],
              ['7월', '루비', '델피니움', '열정'],
              ['8월', '페리도트', '글라디올러스', '강인함'],
              ['9월', '사파이어', '아스터', '진실함'],
              ['10월', '오팔', '메리골드', '희망'],
              ['11월', '토파즈', '국화', '진심'],
              ['12월', '터키석', '포인세티아', '축복'],
            ].map(([m, stone, flower, mean], i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px' }}>
                <p style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginBottom: '3px' }}>{m}</p>
                <p style={{ color: 'var(--text)', fontWeight: 600 }}>💎 {stone}</p>
                <p style={{ color: 'var(--muted)', marginTop: '2px' }}>🌹 {flower} · {mean}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 한국 전통 호칭 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>한국 전통 나이 호칭</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            한국에는 60세 이후의 만 나이마다 한자에서 유래한 고유 호칭이 있습니다. 환갑·고희·희수 등은 한자의 형태를 풀어내거나 옛 시에서 유래한 멋진 작명법으로, 어른의 생신 때 많이 쓰입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { age: 60,  name: '환갑(還甲)·회갑(回甲)', meaning: '60갑자가 한 바퀴 돌아 태어난 해의 간지로 돌아옴' },
              { age: 61,  name: '진갑(進甲)',            meaning: '환갑 다음해, 새로운 갑자의 시작' },
              { age: 70,  name: '고희(古稀)·칠순',       meaning: '두보의 시 "人生七十古來稀(인생칠십고래희)"에서 유래' },
              { age: 77,  name: '희수(喜壽)',            meaning: '"喜"자를 초서로 쓰면 七十七로 보임' },
              { age: 80,  name: '산수(傘壽)·팔순',       meaning: '"傘"자에 八十이 들어있음' },
              { age: 88,  name: '미수(米壽)',            meaning: '"米"자를 분해하면 八十八' },
              { age: 90,  name: '졸수(卒壽)·구순',       meaning: '"卒"의 약자에 九十' },
              { age: 99,  name: '백수(白壽)',            meaning: '百에서 一을 빼면 99, 흰 머리에서 유래' },
              { age: 100, name: '상수(上壽)',            meaning: '오랫동안 산다는 의미' },
            ].map((n, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr', gap: '12px', alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>만 {n.age}세</span>
                <span style={{ color: 'var(--text)', fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 600 }}>{n.name}</span>
                <span style={{ color: 'var(--muted)', fontSize: '12.5px' }}>{n.meaning}</span>
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
                q: '만 나이는 생일이 지나야 한 살이 되나요?',
                a: '맞습니다. <strong>만 나이는 태어난 날을 0세로 시작</strong>해 생일이 지날 때마다 1살씩 증가합니다. 생일 전날까지는 이전 나이이고, 생일 당일부터 한 살 더 많아집니다.',
              },
              {
                q: '2000년 1월 1일생의 2026년 만 나이는 몇 살인가요?',
                a: '2026년 4월 기준으로 이미 생일(1월 1일)이 지났으므로 <strong>만 26세</strong>입니다. 만약 생일이 아직 안 지났다면 만 25세가 됩니다.',
              },
              {
                q: '병역 의무는 만 나이 기준인가요?',
                a: '병역법은 만 나이 통일법 적용 예외로, 여전히 <strong>연 나이(출생 연도 기준)</strong>를 사용합니다. 예를 들어 2026년에 만 19세가 되는 사람이 아니라 <code>2026 - 2007 = 19세</code>인 사람(2007년생)이 병역 검사 대상입니다.',
              },
              {
                q: '외국인의 나이는 어떻게 계산하나요?',
                a: '대부분의 국가는 만 나이를 사용합니다. 한국도 2023년 6월부터 만 나이로 통일되어 외국인과 동일한 기준을 사용하므로, <strong>국제적으로 나이를 표기할 때 혼란이 줄었습니다</strong>.',
              },
              {
                q: '띠는 양력과 음력 중 어느 기준인가요?',
                a: '정확한 띠는 <strong>음력 1월 1일(설날) 기준</strong>으로 바뀝니다. 예를 들어 2024년 양력 1월 1일~2월 9일에 태어난 사람은 양력으로 2024년이지만 음력으로는 아직 2023년이므로 토끼띠(2023년)에 해당합니다. 본 도구는 단순화를 위해 양력 연도 기준으로 표시하므로, 음력 1~2월 초 출생자는 별도 확인이 필요합니다. 음양력 변환기를 함께 활용하세요.',
              },
              {
                q: '인생 시간 통계의 심장 박동·호흡 수는 정확한가요?',
                a: '본 도구의 통계는 일반적인 평균값을 적용한 추정치입니다 — <strong>심박수 70 BPM(안정 시 평균), 호흡 16회/분(성인 평균), 잠 33%(8시간/24시간), 걸음 7,000보/일</strong>. 개인차가 있으며, 운동·수면·건강 상태에 따라 실제와 차이가 있습니다. 재미있는 인생 시간 체감 용도로 활용하세요.',
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
              { href: '/tools/edu/cosmic-calendar',    icon: '🌌', name: '코스믹 캘린더',     desc: '우주 138억 년을 1년으로 압축' },
              { href: '/tools/edu/planet-comparison',  icon: '🪐', name: '행성 비교 시각화',  desc: '8행성 크기·중력·하루 비교' },
              { href: '/tools/date/dday',              icon: '📅', name: 'D-day 계산기·일정 관리', desc: '여러 D-day·페이스·두 날짜 사이' },
              { href: '/tools/date/lunar',             icon: '🌙', name: '음양력 변환기',     desc: '띠·세시풍속 정확히 확인' },
              { href: '/tools/date/military',          icon: '🎖️', name: '군 전역일 계산기',  desc: '입대일·전역일·복무율' },
              { href: '/tools/date/life-time',         icon: '⏳', name: '인생 시간 계산기',  desc: '남은 인생을 구체적으로' },
              { href: '/tools/date/jet-lag',           icon: '✈️', name: '시차 계산기',        desc: '도시 간 시차·도착 시간' },
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
            <li><strong style={{ color: 'var(--text)' }}>만 나이 통일법</strong> — law.go.kr (행정기본법 제7조의2, 민법 제158조)</li>
            <li><strong style={{ color: 'var(--text)' }}>통계청 인구 통계</strong> — kostat.go.kr</li>
            <li><strong style={{ color: 'var(--text)' }}>한국민족문화대백과</strong> — encykorea.aks.ac.kr (전통 나이 호칭)</li>
            <li><strong style={{ color: 'var(--text)' }}>병역법</strong> — law.go.kr (연 나이 적용)</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
