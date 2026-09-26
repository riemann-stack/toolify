import AgeClient from './AgeClient'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/date/age',
  title: '나이 계산기 — 만 나이·생일 D-day·띠·별자리·인생 통계·기대수명',
  description:
    '만 나이·연 나이·세는 나이 비교와 생일 D-day·1만일 기념일 카운트다운 + 인생 시간 통계·기대수명(2024 생명표) 기준 남은 시간·하루 습관 가치 환산·띠·별자리·탄생석·전통 나이 호칭까지 한 화면에.',
  keywords: [
    '나이계산기', '만나이계산기', '만나이', '연나이', '세는나이', '생일D-day', '태어난지며칠',
    '1만일', '띠계산', '별자리계산', '환갑', '칠순', '인생타임라인',
    '만나이통일법', '탄생석', '한국세대', '인생통계',
    '생애시간계산기', '기대수명계산', '메멘토모리', '인생진행률', '시간가치환산',
  ],
})

const FAQ_LD = [
              {
                q: '만 나이는 생일이 지나야 한 살이 되나요?',
                a: '맞습니다. <strong>만 나이는 태어난 날을 0세로 시작</strong>해 생일이 지날 때마다 1살씩 증가합니다. 생일 전날까지는 이전 나이이고, 생일 당일부터 한 살 더 많아집니다.',
              },
              {
                q: '2000년 1월 1일생의 2026년 만 나이는 몇 살인가요?',
                a: '2026년에 생일(1월 1일)이 지난 시점 기준으로 <strong>만 26세</strong>입니다(2026 − 2000 = 26). 생일 전날까지는 만 25세이며, 위 계산기에 생년월일을 넣으면 오늘 기준 만 나이가 바로 나옵니다.',
              },
              {
                q: '병역 의무는 만 나이 기준인가요?',
                a: '병역법은 만 나이 통일법 적용 예외로, 여전히 <strong>연 나이(출생 연도 기준)</strong>를 사용합니다. 예를 들어 2026년에 만 19세가 되는 사람이 아니라 <code>2026 - 2007 = 19세</code>인 사람(2007년생)이 병역 검사 대상입니다.',
              },
              {
                q: '1~2월생(빠른 년생)은 나이·학년 계산이 다른가요?',
                a: '지금 취학하는 아이들은 다르지 않습니다. 예전에는 취학 기준일이 3월 1일이라 1~2월생이 한 해 먼저 입학하는 「빠른 년생」이 있었지만, 초·중등교육법 제13조 개정으로 <strong>2009학년도부터 취학 기준일이 1월 1일로 바뀌어</strong> 같은 해에 태어난 아이들이 같은 학년에 입학합니다(조기·연기 입학은 보호자 선택). 다만 그 이전에 취학한 1~2월생은 동급생보다 출생 연도가 한 해 늦어, 세는 나이·연 나이 호칭이 지금도 갈리는 경우가 있습니다 — 이럴 때 위 계산기의 만 나이·연 나이 비교가 유용합니다.',
              },
              {
                q: '띠는 양력과 음력 중 어느 기준인가요?',
                a: '띠가 바뀌는 시점은 <strong>두 관행이 병존</strong>합니다. 민간에서는 흔히 <strong>음력 1월 1일(설날)</strong>을, 전통 사주명리학에서는 <strong>입춘(대개 양력 2월 3~4일)</strong>을 기준으로 삼습니다. 예를 들어 2026년 양력 1월 1일~2월 16일(설날 2월 17일 전)에 태어난 사람은 양력으로 2026년이지만 설날 기준으로는 아직 을사년이므로 뱀띠(2025년)에 해당합니다. 본 도구는 단순화를 위해 양력 연도 기준으로 표시하므로, 1~2월 초 출생자는 음양력 변환기로 별도 확인을 권장합니다.',
              },
              {
                q: '인생 시간 통계의 심장 박동·호흡 수는 정확한가요?',
                a: '본 도구의 통계는 일반적인 평균값을 적용한 추정치입니다 — <strong>심박수 70 BPM(안정 시 평균), 호흡 16회/분(성인 평균), 잠 33%(8시간/24시간), 걸음 7,000보/일</strong>. 개인차가 있으며, 운동·수면·건강 상태에 따라 실제와 차이가 있습니다. 재미있는 인생 시간 체감 용도로 활용하세요.',
              },
              {
                q: '기대수명 기준 남은 시간 계산이 실제 수명을 예측하나요?',
                a: '<strong>아니요.</strong> 인생 통계 탭의 「기대수명·남은 시간」 보기는 한국인 평균 기대수명을 기준으로 시간을 환산해 보여주는 참고용 도구입니다. 실제 수명은 유전·생활습관·환경에 따라 크게 달라집니다. 시간 인식과 동기부여를 위한 가이드일 뿐 의학적 예측이 아닙니다.',
              },
              {
                q: '메멘토 모리가 무엇인가요?',
                a: '라틴어로 <strong>"죽음을 기억하라"</strong>는 뜻이며 고대 로마 시대부터 시간의 유한성을 인식하고 현재를 더 충실히 살기 위한 철학적 개념으로 사용되어 왔습니다. 본 도구는 이 전통을 따르되, 무거움보다 동기부여에 초점을 맞춥니다.',
              },
              {
                q: '매일 30분이 정말 큰 차이를 만드나요?',
                a: '네. 매일 30분을 5년간 지속하면 약 <strong>912시간</strong>이 누적됩니다. 어떤 분야든 기초를 훌쩍 넘어서기에 충분한 시간이며, 매일 1시간씩 10년이면 약 3,650시간이 쌓입니다. <strong>"복리의 힘"</strong>은 시간에도 적용됩니다.',
              },
              {
                q: '기대수명을 직접 입력할 수 있나요?',
                a: '네. 한국 남성·여성 평균 외에도 본인이 원하는 값을 직접 입력할 수 있습니다. 예를 들어 100세를 입력하면 100세 시대를 가정한 시간 환산 결과를 볼 수 있습니다. 다만 이 값은 모두 가정일 뿐이며 실제 예측은 아닙니다.',
              },
              {
                q: '기대수명 보기가 무겁게 느껴진다면 어떻게 해야 하나요?',
                a: '<strong>"성장 모드"</strong>를 선택하시면 살아온 시간의 성취와 앞으로 가능한 시간에 초점을 맞춘 부드러운 톤으로 결과를 볼 수 있습니다. 도구 사용이 부담스럽다면 언제든 닫으셔도 좋습니다. 심리적 어려움이 지속되면 <strong>자살예방 상담전화 109</strong>에서 24시간 무료 상담을 받으실 수 있습니다(2024년 1월부터 기존 1393에서 109로 통합).',
              },
            ]

export default function AgePage() {
  return (
    <ToolPage width={880} slug="/tools/date/age">
      <h1 className="tp-h1">
        <ToolIconBadge catId="date" />나이 계산기
      </h1>
      <p className="tp-lead">
        만 나이·D-day·1만일 기념·생일 카운트다운 + <strong style={{ color: 'var(--text)' }}>인생 시간 통계</strong>까지 한 화면에.
      </p>

      <AgeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 만 나이 통일법 */}
        <section>
          <h2 className="g-h2">만 나이 통일법 — 무엇이 달라졌나?</h2>
          <p className="g-p">
            <strong style={{ color: 'var(--text)' }}>2023년 6월 28일</strong>부터 민법(제158조) 및 행정기본법(제7조의2) 개정으로 법령·계약·공문서에서 나이 표기는 모두 만 나이로 통일되었습니다. 한국 사회에서 오랫동안 혼용되어 온 세는 나이·연 나이의 혼란을 줄이는 것이 목적입니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '시행일', content: '2023년 6월 28일 — 행정기본법 제7조의2, 민법 제158조 개정 시행.' },
              { title: '달라지는 것', content: '의료기관 나이 기준, 보험 계약, 법적 서류 등에서 만 나이 사용. 예) 65세 의료 혜택은 만 65세 생일이 지난 날부터 적용.' },
              { title: '달라지지 않는 것', content: '초등학교 입학(만 6세가 된 해의 다음 해 3월), 병역 의무(연 나이), 청소년 보호법(주류·담배 — 연 나이) 등 일부 특별법은 기존 방식 유지.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 3가지 나이 비교 — 카드 레이아웃 (모바일 가독성) */}
        <section>
          <h2 className="g-h2">만 나이·세는 나이·연 나이 비교</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }} className="age-compare-grid">
            {[
              {
                title: '만 나이',
                tag: '법령·행정 표준',
                color: '#0EA5E9',
                rows: [
                  { k: '계산 방법', v: '생일 기준 — 생일 전 1살 적음' },
                  { k: '적용 범위', v: '법령·행정·계약 (2023.6~)' },
                  { k: '예시',       v: '2000-05생 → 2026.04 = 25세' },
                  { k: '특징',       v: '국제 표준, 정확함' },
                ],
                accent: true,
              },
              {
                title: '세는 나이',
                tag: '한국 전통',
                color: '#A16207',
                rows: [
                  { k: '계산 방법', v: '태어나자마자 1세, 1월 1일 +1살' },
                  { k: '적용 범위', v: '일상 대화' },
                  { k: '예시',       v: '2000년생 → 2026 = 27세' },
                  { k: '특징',       v: '한국 전통 방식' },
                ],
              },
              {
                title: '연 나이',
                tag: '병역·청보법 일부',
                color: '#0891B2',
                rows: [
                  { k: '계산 방법', v: '현재 연도 − 출생 연도' },
                  { k: '적용 범위', v: '병역법·청소년 보호법 일부' },
                  { k: '예시',       v: '2026 − 2000 = 26세' },
                  { k: '특징',       v: '간단하지만 오차 있음' },
                ],
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: card.accent ? 'rgba(14,165,233,0.05)' : 'var(--bg2)',
                border: `1px solid ${card.accent ? card.color + '60' : 'var(--border)'}`,
                borderTop: `3px solid ${card.color}`,
                borderRadius: 'var(--radius-m)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: card.color, fontFamily: 'var(--font-sans)' }}>{card.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{card.tag}</span>
                </div>
                {card.rows.map((r, j) => (
                  <div key={j} style={{ borderTop: j === 0 ? 'none' : '1px solid var(--border)', paddingTop: j === 0 ? 0 : 6, paddingBottom: 6 }}>
                    <p style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2, fontWeight: 600 }}>{r.k}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{r.v}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 720px) {
              .age-compare-grid { grid-template-columns: 1fr !important; }
            }
          ` }} />
        </section>

        {/* 3. 인생 시간 통계 */}
        <section>
          <h2 className="g-h2">인생 시간 통계 — 태어난 지 며칠?</h2>
          <p className="g-p">
            하루를 살면 약 <strong style={{ color: 'var(--text)' }}>24시간 = 1,440분 = 86,400초</strong>가 흐릅니다. 평균 70 BPM 기준 심장은 100,800회 뛰고, 호흡은 23,040회(16/분), 잠은 약 8시간(인생의 33%)을 차지합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>일수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>해당 만 나이 (대략)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['100일',     '— ', '백일 잔치 — 태어난 날을 1일째로 세어 100일째'],
                  ['첫돌',      '만 1세', '첫 생일 (365일째가 아니라 1년 뒤 같은 날)'],
                  ['1,000일',   '약 만 2.7세', '연인·부부 1,000일 기념'],
                  ['10,000일',  '약 만 27.4세', '한 번뿐인 큰 마일스톤'],
                  ['12,345일',  '약 만 33.8세', '재미있는 숫자 기념'],
                  ['20,000일',  '약 만 54.8세', '두 번째 큰 마일스톤'],
                  ['25,567일',  '약 만 70세', '약 70년 = 25,567일'],
                  ['30,000일',  '약 만 82세', '한국 평균 기대수명 근처'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3-1. 기대수명·남은 시간 보기 (구 /tools/date/life-time 가이드 이전) — 운영자 메모 원문 유지(주어만 탭 명칭으로 교체) */}
        <section>
          <h2 className="g-h2">기대수명·남은 시간 보기를 만든 이유</h2>
          <div style={{
            background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 'var(--radius-m)',
            padding: '16px 20px',
            fontSize: '14px',
            color: 'var(--text)',
            lineHeight: 1.85,
          }}>
            <p>
              인생 통계 탭의 「기대수명·남은 시간」 보기는 시간의 유한성을 직시하기 위한 도구가 아니라,
              <strong style={{ color: 'var(--accent)' }}> 매일의 작은 선택이 어떻게 누적되어 큰 시간이 되는지</strong> 보여주는 도구입니다.
            </p>
            <p style={{ marginTop: 10 }}>
              하루 30분의 독서가 1년이면 약 <strong>182시간</strong>, 10년이면 약 <strong>1,820시간</strong>이 됩니다.
              한 분야에서 탄탄한 실력을 쌓기에 충분한 시간입니다.
              &ldquo;시간이 없다&rdquo;는 말은 종종 &ldquo;30분이 무력하다&rdquo;고 느끼기 때문에 생깁니다 — 이 도구는 그 30분의 무게를 다시 보여줍니다.
            </p>
          </div>
        </section>

        {/* 3-2. 한국인 기대수명 통계 */}
        <section>
          <h2 className="g-h2">한국인 기대수명 통계 (2024년 생명표)</h2>
          <UpdatedMeta
            date="2026년 7월"
            basis="국가데이터처(구 통계청) 2024년 생명표 (2025년 12월 발표)"
            sources={[{ label: '국가데이터처 2024년 생명표 보도자료', href: 'https://mods.go.kr/board.es?mid=a10301010000&bid=208&act=view&list_no=439533' }]}
          />
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '기대수명', '유병기간 제외 기대수명'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c: '남성', l: '80.8세', h: '64.6세' },
                  { c: '여성', l: '86.6세', h: '66.4세' },
                  { c: '남녀 전체', l: '83.7세', h: '65.5세' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--cat-health)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 유병기간 제외 기대수명: 질병·부상으로 활동에 제약이 없는 기간(2024년 생명표 공표값). WHO의 건강수명(HALE)과는 산출 방법이 달라
            수치 차이가 큽니다. 세계 평균 기대수명은 UN 세계인구전망(WPP 2024) 기준 약 73.3세이며, WHO 공식 최신치는 코로나 영향이 반영된
            2021년 71.4세입니다. 실제 수명은 유전·생활습관·환경에 따라 크게 달라집니다.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.7 }}>
            ※ 인생 통계 탭 › 「기대수명·남은 시간」의 남성·여성 평균 프리셋은 같은 생명표의 <strong style={{ color: 'var(--text)' }}>성·연령별 기대여명</strong>(구간 선형보간 근사)으로 종점을 계산합니다 — 나이가 많을수록 종점이 80.8세·86.6세보다 늦어집니다(예: 60세 남성 종점 약 83.7세, 80세 남성 약 88.5세).
          </p>
        </section>

        {/* 3-3. 1만 시간 법칙 */}
        <section>
          <h2 className="g-h2">🎯 1만 시간 법칙과 시간 환산</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
            말콤 글래드웰의 1만 시간 법칙 — “어떤 분야에서 세계적 수준에 도달하려면 약 1만 시간의 의도적 연습이 필요” 라는 가설.
            매일 시간을 어떻게 쓰느냐에 따라 1만 시간 도달 시점이 크게 달라집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {[
              { p: '하루 1시간', t: '27.4년' },
              { p: '하루 2시간', t: '13.7년' },
              { p: '하루 3시간', t: '9.1년' },
              { p: '하루 4시간', t: '6.8년' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{r.p}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{r.t}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            30대에 시작해도 50~60대에 새 분야 전문가가 될 수 있다는 의미입니다. 늦었다고 느낄 때가 가장 빠른 때.
          </p>
        </section>

        {/* 3-4. 작은 습관 누적 효과 */}
        <section>
          <h2 className="g-h2">🌱 하루 작은 습관의 누적 효과 (실제 연구)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { i: '🏃', t: '주 150분 걷기 수준 운동', e: '기대수명 +3.4년',                    src: 'Moore 외, PLOS Medicine, 2012' },
              { i: '📖', t: '꾸준한 책 읽기',          e: '12년 추적 사망위험 20% 감소',         src: 'Bavishi 외(예일대), Social Science & Medicine, 2016' },
              { i: '✍️', t: '표현적 글쓰기 15~20분',   e: '정신·신체 건강 지표 개선',            src: 'Pennebaker(텍사스대 오스틴) 연구 계열' },
              { i: '🧘', t: '8주 명상 프로그램',       e: '불안·우울·통증 완만한 개선',          src: 'Goyal 외, JAMA Internal Medicine, 2014 (메타분석)' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 22, marginBottom: 6 }}>{r.i}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{r.t}</p>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700, marginBottom: 4 }}>{r.e}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>출처: {r.src}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 운동·독서 항목은 관찰(코호트) 연구로 상관관계를 보여줄 뿐 인과를 확정하지 않으며, 효과 크기는 대상·활동량에 따라 달라집니다.
          </p>
        </section>

        {/* 3-5. 메멘토 모리 철학 가이드 */}
        <section>
          <h2 className="g-h2">📿 메멘토 모리 — 철학적 배경</h2>
          <div style={{
            background: 'rgba(155,89,182,0.05)',
            border: '1px solid rgba(155,89,182,0.25)',
            borderRadius: 'var(--radius-m)',
            padding: '16px 20px',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 1.9,
          }}>
            <p>
              라틴어 <strong style={{ color: '#8E44AD' }}>&lsquo;Memento Mori&rsquo;</strong>(메멘토 모리)는 <em>&ldquo;죽음을 기억하라&rdquo;</em>는 뜻으로,
              고대 로마 시대부터 사용된 철학 개념입니다.
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 10, color: 'var(--muted)' }}>
              <li><strong style={{ color: 'var(--text)' }}>스토아 철학자들</strong>은 시간의 유한성을 자각하면 현재를 더 충실히 살 수 있다고 봤습니다.</li>
              <li>로마 개선장군 행렬 뒤에서 노예가 속삭였다는 <em>“Memento mori”</em> — 영광 속에서도 인간임을 잊지 말라는 의미.</li>
              <li>현대적으로는 <strong style={{ color: 'var(--text)' }}>&ldquo;시간은 가장 비싼 자원이다&rdquo;</strong>라는 인식과 연결됩니다.</li>
              <li>본 도구는 무거운 죽음의 카운트다운이 아닌, 시간의 가치를 인식하는 도구입니다.</li>
            </ul>
          </div>
        </section>

        {/* 3-6. 시간 활용 명언 */}
        <section>
          <h2 className="g-h2">시간 활용에 관한 통찰</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: '삶이 짧은 게 아니라, 우리가 시간을 낭비할 뿐이다.', a: '세네카, 「인생의 짧음에 관하여」 1장' },
              { q: '원하는 것은 거의 무엇이든 살 수 있지만, 시간은 살 수 없다.', a: '워런 버핏 (2017년 대담)' },
              { q: '지금 당장이라도 삶을 떠날 수 있다. 그 사실이 네가 행하고 말하고 생각하는 것을 결정하게 하라.', a: '마르쿠스 아우렐리우스, 「명상록」 2.11' },
              { q: '만 년을 살 것처럼 행동하지 마라. 살 수 있는 동안, 할 수 있는 동안, 선한 사람이 되라.', a: '마르쿠스 아우렐리우스, 「명상록」 4.17' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, fontStyle: 'italic', marginBottom: 6 }}>“{m.q}”</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>— {m.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 띠 가이드 */}
        <section>
          <h2 className="g-h2">띠 (12간지) 가이드</h2>
          <p className="g-p">
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
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ⚠️ 띠가 언제 바뀌는지는 <strong style={{ color: 'var(--text)' }}>두 관행이 병존</strong>합니다. 민간 통념은 <strong style={{ color: 'var(--text)' }}>음력 설날(음력 1월 1일)</strong>을, 전통 사주명리학은 <strong style={{ color: 'var(--text)' }}>입춘(대개 양력 2월 3~4일)</strong>을 해의 경계로 삼습니다. 어느 기준이든 양력 1월~2월 초 출생자는 양력 연도 기준 띠와 다를 수 있으므로, 본 도구의 결과(양력 연도 기준)를 그대로 신뢰하기보다 음양력 변환기로 별도 확인을 권장합니다.
          </p>
        </section>

        {/* 5. 별자리 가이드 */}
        <section>
          <h2 className="g-h2">별자리 가이드 (서양 12궁)</h2>
          <p className="g-p">
            서양 12별자리는 <strong style={{ color: 'var(--text)' }}>4원소(불·흙·공기·물)</strong>로 분류됩니다. 양력 생일 기준이며, 별자리 경계일 출생자는 ±1일 차이를 인정하기도 합니다.
          </p>
          <div className="age-zodiac-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
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
              <div key={z.n} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: '8px', alignItems: 'center', fontSize: '13px', minWidth: 0 }}>
                <span style={{ fontSize: '22px' }}>{z.e}</span>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong style={{ color: 'var(--text)' }}>{z.n}</strong> · <span style={{ color: 'var(--muted)' }}>{z.r}</span></span>
                <span style={{ color: '#0891B2', fontFamily: 'var(--font-sans)', fontWeight: 600, flexShrink: 0 }}>{z.x}</span>
              </div>
            ))}
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 400px) {
              .age-zodiac-grid { grid-template-columns: 1fr !important; }
            }
          ` }} />
        </section>

        {/* 6. 탄생석·탄생화 */}
        <section>
          <h2 className="g-h2">월별 탄생석·탄생화</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', overflowWrap: 'anywhere' }}>
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
          <h2 className="g-h2">한국 전통 나이 호칭</h2>
          <p className="g-p">
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
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>만 {n.age}세</span>
                <span style={{ color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{n.name}</span>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{n.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/edu/cosmic-calendar',    icon: '🌌', name: '코스믹 캘린더',     desc: '우주 138억 년을 1년으로 압축' },
              { href: '/tools/edu/planet-comparison',  icon: '🪐', name: '행성 비교 계산기',  desc: '8행성 크기·중력·하루 비교' },
              { href: '/tools/date/dday',              icon: '📅', name: 'D-Day 계산기', desc: '여러 D-day·페이스·두 날짜 사이' },
              { href: '/tools/date/lunar',             icon: '🌙', name: '음양력 변환기',     desc: '띠·세시풍속 정확히 확인' },
              { href: '/tools/date/military',          icon: '🎖️', name: '군 전역일 계산기',  desc: '입대일·전역일·복무율' },
              { href: '/tools/date/jet-lag',           icon: '✈️', name: '시차 계산기',        desc: '도시 간 시차·도착 시간' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 참고 자료 */}
        <section>
          <h2 className="g-h2">참고 자료</h2>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong style={{ color: 'var(--text)' }}>만 나이 통일법</strong> — law.go.kr (행정기본법 제7조의2, 민법 제158조)</li>
            <li><strong style={{ color: 'var(--text)' }}>국가데이터처(구 통계청) 인구 통계</strong> — mods.go.kr</li>
            <li><strong style={{ color: 'var(--text)' }}>국가데이터처 2024년 생명표 (2025년 12월 발표)</strong> — mods.go.kr (기대수명·성·연령별 기대여명)</li>
            <li><strong style={{ color: 'var(--text)' }}>UN 세계인구전망(WPP 2024)</strong> — population.un.org (세계 평균 기대수명)</li>
            <li><strong style={{ color: 'var(--text)' }}>한국민족문화대백과</strong> — encykorea.aks.ac.kr (전통 나이 호칭)</li>
            <li><strong style={{ color: 'var(--text)' }}>병역법</strong> — law.go.kr (연 나이 적용)</li>
          </ul>
        </section>

      </div>
    </ToolPage>
  )
}
