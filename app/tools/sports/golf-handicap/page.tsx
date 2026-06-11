import Link from 'next/link'
import GolfHandicapClient from './GolfHandicapClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'

export const metadata = buildMetadata({
  path: '/tools/sports/golf-handicap',
  title: '골프 핸디캡 계산기 — WHS·코스 핸디캡·발전 추이·자동 저장',
  description: 'WHS 핸디캡 지수·코스 핸디캡·네트·스태블포드 + 라운드 자동 저장·발전 추이·자주 가는 골프장 관리.',
  keywords: ['골프핸디캡계산기', '핸디캡지수계산', 'WHS핸디캡', '코스핸디캡계산기', '스코어디퍼런셜', '네트스코어계산기', '스태블포드계산기', '골프핸디캡', '슬로프 레이팅', '코스 레이팅', '한국 골프 핸디캡', '핸디캡 추이', 'KGA 핸디캡'],
})

const FAQ_LD = [
              {
                q: 'WHS 핸디캡은 EGA 핸디캡과 어떻게 다른가요?',
                a: '2020년 세계골프협회가 기존 6개 핸디캡 시스템(EGA·USGA·CONGU 등)을 WHS(World Handicap System)로 통합했습니다. 기존 EGA 방식은 유럽 중심이었고 버퍼존 개념을 사용했지만, WHS는 스코어 디퍼런셜과 0.96 조정 계수를 적용해 더 공정하고 전 세계에서 통용됩니다.',
              },
              {
                q: '코스 레이팅과 슬로프 레이팅은 어디서 확인하나요?',
                a: '골프장 스코어카드, 클럽하우스 안내판, 또는 해당 골프장 공식 홈페이지에서 확인할 수 있습니다. 한국골프장경영협회(KGBA) 홈페이지에서도 조회 가능하며, 티잉 그라운드(블랙·화이트·옐로 등)별로 값이 다르게 표기됩니다.',
              },
              {
                q: '9홀 라운드도 핸디캡 계산에 사용할 수 있나요?',
                a: '네. 9홀 스코어는 두 배로 환산하거나 동일 코스를 두 번 플레이한 것으로 간주해 18홀 디퍼런셜로 변환합니다. 단 9홀 레이팅값이 별도로 필요하며, 본 계산기는 단순 2배 환산 방식을 사용합니다 (정확도 ±5% 차이).',
              },
              {
                q: '0.96을 곱하는 이유는?',
                a: 'WHS에서는 선수가 최고 컨디션일 때의 성적을 반영하면서 동시에 &ldquo;최고 성적이 그 선수의 일반적 실력은 아니다&rdquo;라는 점을 보정하기 위해 평균에 0.96(약 4% 할인)을 적용합니다. 이를 &ldquo;봉 팩터(Bonus for Excellence)&rdquo;라고 부릅니다.',
              },
              {
                q: '핸디캡 지수 최대값은?',
                a: 'WHS 기준 남성 최대 54.0, 여성 최대 54.0입니다. 이전 EGA 방식의 남성 36, 여성 54보다 상향되어 더 많은 초보 골퍼가 공식 핸디캡을 가질 수 있게 됐습니다. 54를 초과하는 디퍼런셜은 자동으로 54로 캡(cap) 처리됩니다.',
              },
              {
                q: '스태블포드와 스트로크 플레이의 차이는?',
                a: '스트로크 플레이는 18홀 총 타수가 기준이며, 스태블포드는 각 홀에서 파 기준 타수에 따라 포인트를 획득합니다(파 2점, 버디 3점 등). 스태블포드는 한 홀에서 크게 망쳐도 0점으로 처리되어 나쁜 홀이 전체 스코어에 미치는 영향이 적어, 아마추어 대회에 널리 쓰입니다.',
              },
              {
                q: '본 도구의 핸디캡이 공식 핸디캡인가요?',
                a: '<strong>아닙니다.</strong> 본 도구는 WHS 표준 공식 정확 적용 + 본인 실력 추정·발전 참고용 — <strong>비공식 산출</strong>입니다. 공식 핸디캡 (한국)은 대한골프협회(KGA) 발급, 회원 골프 클럽 통해 신청, 공식 인증 = 대회 참가 자격, 연 회비 발생. 본 도구는 일상 라운드·동호회 친선용. 공식 인증이 필요하면 KGA(kgagolf.or.kr) 또는 소속 클럽 문의.',
              },
              {
                q: '라운드 데이터는 어디에 저장되나요?',
                a: '본인 브라우저 (localStorage)에만:<br/>• 서버 전송 X (개인정보 보호)<br/>• 다른 사이트 접근 X<br/>• 다른 기기 동기화 X<br/>주의: 시크릿/방문자 모드 사용 시 저장 X / 브라우저 데이터 삭제 시 사라짐 / 다른 기기로 옮기려면 CSV 내보내기. 정기 백업 권장 (월 1회 CSV 다운로드 → Notion·Google Drive).',
              },
              {
                q: '핸디캡 지수가 자주 바뀌는데 정상인가요?',
                a: '네, 정상. WHS 핸디캡:<br/>• 라운드 추가 시마다 재계산<br/>• 최근 20라운드 중 최저 8개 평균 × 0.96<br/>• 좋은 라운드 추가 = 지수 ↓<br/>• 나쁜 라운드 추가 = 큰 변화 X (최저 8개에 안 들어가면)<br/>안정화: 20라운드 채우면 안정. 4~5라운드는 변동 큼. 한 번 좋은 라운드로 -3~-5 변화 가능. 본 도구의 [📅 내 기록] 탭에서 발전 추이 그래프로 변화 시각화.',
              },
              {
                q: '본 도구의 라운드 데이터를 어떻게 백업하나요?',
                a: 'CSV 다운로드 활용:<br/>1. [📅 내 기록] 탭<br/>2. [📊 CSV] 버튼 클릭<br/>3. Notion·Google Drive·이메일 저장<br/>UTF-8 BOM 포함이라 Excel에서 한글 깨짐 X. ⚠️ 주의: 브라우저 데이터 삭제 = 데이터 사라짐 / 다른 기기 = 별도 저장 / 정기 백업 권장 (월 1회).',
              },
            ]

export default function GolfHandicapPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>스포츠</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⛳ 골프 핸디캡 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        WHS 핸디캡·코스 핸디캡·스태블포드 + 라운드 자동 저장으로 <strong style={{ color: 'var(--text)' }}>발전 추이</strong>까지.
      </p>

      <GolfHandicapClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 시각화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            WHS 핵심 공식
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '14px', padding: '20px 22px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Score Differential</p>
              <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6 }}>
                스코어 디퍼런셜 = (그로스 스코어 − 코스 레이팅) × 113 ÷ 슬로프 레이팅
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
                각 라운드의 실력을 &ldquo;표준 코스(슬로프 113)&rdquo; 기준으로 환산한 값. 낮을수록 좋은 성적입니다.
              </p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', padding: '20px 22px' }}>
              <p style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Handicap Index</p>
              <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(15px, 3vw, 18px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6 }}>
                핸디캡 지수 = 최근 20라운드 중 최저 N개 평균 × 0.96
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.6 }}>
                라운드 수에 따라 사용하는 디퍼런셜 개수(N)가 달라집니다. 0.96은 &ldquo;최고 성적이 일반 실력은 아니다&rdquo;를 보정하는 계수.
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. 계산 예시 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            계산 예시
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>예시 1 — 입문자 (5라운드)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                코스레이팅 72.0 / 슬로프 113 동일 코스에서 108, 103, 99, 105, 101타 기록
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '10px' }}>
                디퍼런셜 = (그로스 − 72.0) × 113 ÷ 113 = 그로스 − 72<br/>
                108 → 36.0 · 103 → 31.0 · 99 → 27.0 · 105 → 33.0 · 101 → 29.0<br/>
                <span style={{ color: '#059669' }}>5라운드 → 최저 1개 사용: 27.0</span><br/>
                핸디캡 지수 = 27.0 × 0.96 = <strong style={{ color: 'var(--accent)' }}>25.9</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 하이 핸디캐퍼 등급. 꾸준히 라운드를 쌓으면 최저 N개가 늘어나 지수가 안정화됩니다.</p>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>예시 2 — 중급자 (20라운드)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.7 }}>
                20라운드 디퍼런셜 중 최저 8개 평균이 10.5라고 가정
              </p>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '10px' }}>
                핸디캡 지수 = 10.5 × 0.96 = <strong style={{ color: 'var(--accent)' }}>10.1</strong><br/>
                <br/>
                <span style={{ color: '#0EA5E9' }}>오늘 코스</span> 슬로프 128 / CR 72.5 / 파 72<br/>
                코스 핸디캡 = 10.1 × (128 ÷ 113) + (72.5 − 72) = 11.4 + 0.5 ≈ <strong style={{ color: 'var(--accent)' }}>12</strong><br/>
                <br/>
                <span style={{ color: '#0891B2' }}>그로스 85타 쳤다면</span><br/>
                네트 스코어 = 85 − 12 = <strong style={{ color: 'var(--accent)' }}>73 (+1)</strong>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>→ 미드 핸디캐퍼 등급. 플레잉 핸디캡은 코스 핸디캡 × 0.95 = 11.</p>
            </div>
          </div>
        </div>

        {/* ── 3. 라운드 수별 사용 디퍼런셜 표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            라운드 수별 사용 디퍼런셜 개수
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>제출 라운드 수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>계산에 사용하는 개수</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['3',      '최저 1개', '지수 산출 최소 기준'],
                  ['4~5',    '최저 1개', '초기 단계'],
                  ['6~8',    '최저 2개', ''],
                  ['9~11',   '최저 3개', ''],
                  ['12~14',  '최저 4개', ''],
                  ['15~16',  '최저 5개', ''],
                  ['17',     '최저 6개', ''],
                  ['18',     '최저 7개', ''],
                  ['19~20',  '최저 8개', '표준 기준 (안정화)'],
                ].map(([rounds, used, note], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{rounds}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{used}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * WHS는 &ldquo;최고 성적 8개 평균&rdquo;을 기준으로 하되, 라운드가 부족할 때는 단계적으로 개수를 줄여 운영합니다.
          </p>
        </div>

        {/* ── 4. 슬로프 레이팅 기준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 슬로프 레이팅 기준 안내
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            슬로프 레이팅은 &ldquo;평균 보기 플레이어 난이도&rdquo;를 나타내는 수치입니다.
            <strong style={{ color: 'var(--text)' }}>113이 표준 기준값</strong>이며, 숫자가 클수록 일반 아마추어에게 어려운 코스입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' }}>
            {[
              { range: '55~95',   level: '매우 쉬움',  color: '#059669', sub: '짧은 파3 위주 숏코스' },
              { range: '95~110',  level: '쉬운 코스',  color: '#0EA5E9', sub: '넓은 페어웨이, 적은 벙커' },
              { range: '110~125', level: '보통 코스',  color: '#0891B2', sub: '한국 주요 골프장 평균 구간' },
              { range: '125~140', level: '어려운 코스', color: '#EA580C', sub: '좁은 페어웨이, 많은 해저드' },
              { range: '140~155', level: '최상급 난이도', color: '#DC2626', sub: '대회 세팅·프로 토너먼트 코스' },
              { range: '113',     level: '표준 기준값', color: '#A16207', sub: '공식 기준점, 평균 난이도' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}25`, borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 700, color: item.color, marginBottom: '4px' }}>{item.range}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{item.level}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>{item.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
              <strong style={{ color: '#0891B2' }}>한국 주요 골프장 평균</strong>: 약 118~128 수준.
              스코어카드, 클럽하우스 안내판, 또는 한국골프장경영협회(KGBA) 홈페이지에서 정확한 값을 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* ── 5. 핸디캡 등급 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🏆 핸디캡 등급
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            {[
              { range: '≤ 0',    name: '스크래치',     color: '#A16207', sub: '프로 수준' },
              { range: '0~9',    name: '로우 핸디캐퍼',  color: '#059669', sub: '상급자' },
              { range: '10~18',  name: '미드 핸디캐퍼',  color: '#0EA5E9', sub: '중급자' },
              { range: '19~28',  name: '하이 핸디캐퍼',  color: '#EA580C', sub: '입문~초급' },
              { range: '29~54',  name: '맥스 핸디캐퍼',  color: '#DC2626', sub: '초보자' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.color}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 800, color: g.color, marginBottom: '6px' }}>{g.range}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{g.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{g.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 라운드 자동 저장 활용 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📅 라운드 자동 저장 활용
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [📅 내 기록] 탭에서 라운드를 추가하면 브라우저(localStorage)에 자동 저장. WHS 핸디캡은 20라운드 누적 시 안정화됩니다 (최대 50라운드 보관).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { e: '💾', t: '자동 저장', d: '라운드 추가 시 즉시 저장. 페이지 진입 시 자동 복원.' },
              { e: '📈', t: '발전 추이', d: '라운드별 핸디캡 변화 SVG 차트 자동 생성.' },
              { e: '🏌️', t: '골프장 저장', d: 'CR·슬로프·파 자주 가는 골프장 저장 → 한 번의 선택으로 자동 입력.' },
              { e: '📊', t: 'CSV 내보내기', d: 'Excel·Notion·Google Drive에 백업. UTF-8 BOM 포함.' },
              { e: '🔒', t: '프라이버시', d: '브라우저 로컬에만 저장. 서버 X. 다른 기기 동기화 X.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '20px', marginBottom: '4px' }}>{m.e}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{m.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.d}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⚠️ 시크릿/방문자 모드 사용 시 저장 X / 브라우저 데이터 삭제 시 사라짐 / 다른 기기로 옮기려면 CSV 내보내기 → 새 기기 가져오기. 월 1회 백업 권장.
          </p>
        </div>

        {/* ── 7. 발전 추이 분석 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📈 핸디캡 발전 추이 분석
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            [📅 내 기록] 탭의 SVG 라인 차트 — 라운드별 핸디캡 변화를 시각화. 좋은 라운드 추가 시 핸디캡 ↓ 곡선이 보입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>지표</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>의미</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['시작 핸디캡', '저장된 라운드 중 가장 오래된 시점의 핸디캡 지수'],
                  ['현재 핸디캡', '최신 라운드까지 반영한 현재 핸디캡 지수'],
                  ['변화', '시작 → 현재 (음수면 발전)'],
                  ['월 평균 라운드', '저장 기간 동안의 평균 라운드 빈도'],
                  ['🏆 최고 라운드', '디퍼런셜 가장 낮은 라운드 (날짜 표시)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💪 본 도구는 <strong style={{ color: 'var(--text)' }}>압박 톤 X</strong>. 핸디캡은 결과, 즐거움이 본질. 0인 달도 OK·쉬어가는 달도 OK.
          </p>
        </div>

        {/* ── 8. 티별 차이 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🏌️ 티별 차이 — 본인 실력에 맞는 티 선택
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            같은 골프장도 티에 따라 CR·슬로프가 달라집니다. 본 도구의 [코스 핸디캡] 탭에서 본인 핸디캡 + 티별 코스 핸디캡 자동 계산.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>티</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>일반 CR</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>일반 슬로프</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>적합 실력</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '⚫ 블랙 (백 티)',  cr: '73~74', sl: '128~135', lv: '핸디캡 0~5 (프로·상급)' },
                  { t: '⚪ 화이트 (정규)', cr: '71~72', sl: '120~128', lv: '핸디캡 6~18 (중급) ⭐' },
                  { t: '🟡 옐로 (시니어)', cr: '70~71', sl: '115~122', lv: '핸디캡 19+ / 시니어' },
                  { t: '🔴 레드 (여성·입문)', cr: '68~70', sl: '108~118', lv: '입문·여성·주니어' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.cr}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.sl}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.lv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            💡 본인 핸디캡 12.3 → 화이트 티 권장. 블랙 티는 너무 어려워 점수 무너질 수 있음. 실력 ↑ 후 단계적 도전.
          </p>
        </div>

        {/* ── 9. 9홀 라운드 환산 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🏌️ 9홀 라운드 환산
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            한국은 9홀 라운딩 비중이 높습니다. 본 도구는 9홀 → 18홀 단순 2배 환산 (편의 우선). 각 라운드에 [9홀 토글]로 적용.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text)' }}>본 도구 방식 (단순 2배)</strong>:<br/>
              디퍼런셜 = (9홀 그로스 × 2 − 9홀 CR × 2) × 113 ÷ 슬로프
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>정확도</strong>: ±5% 차이 — 9홀에 좋은 컨디션이라도 18홀 후반 무너짐 변수 미반영. 정확한 핸디캡은 18홀 라운드 권장.<br/>
              <strong style={{ color: 'var(--text)' }}>대안</strong>: 한국 일부 골프장이 9홀 별도 레이팅 제공 — 그 경우 9홀 레이팅 직접 입력.
            </p>
          </div>
        </div>

        {/* ── 10. 한국 공식 핸디캡 인증 안내 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📌 한국 공식 핸디캡 인증
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구는 WHS 표준 공식을 정확히 적용하지만 <strong style={{ color: '#EA580C' }}>비공식 산출 (참고용)</strong>입니다. 공식 핸디캡 인증은 별도 절차가 필요합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#059669', marginBottom: '8px' }}>🟢 본 도구 (비공식)</p>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>WHS 표준 공식 정확 적용</li>
                <li>본인 실력 추정·발전 참고</li>
                <li>일상 라운드·동호회 친선용</li>
                <li>무료, 즉시 사용</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.3)', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#EA580C', marginBottom: '8px' }}>🟠 공식 인증 (KGA)</p>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>대한골프협회(KGA) 발급</li>
                <li>회원 골프 클럽 통해 신청</li>
                <li>대회 참가 자격</li>
                <li>연 회비 발생</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            📞 공식 핸디캡 문의: <strong style={{ color: 'var(--text)' }}>대한골프협회(KGA) kgagolf.or.kr</strong> · 한국골프장경영협회(KGBA) kgba.co.kr · 소속 골프 클럽.
          </p>
        </div>

        {/* ── 11. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/sports/golf-distance', icon: '🎯', name: '골프 비거리 계산기', desc: '클럽별 비거리·환경 보정' },
              { href: '/tools/sports/golf-cost',     icon: '🏌️', name: '골프 비용 계산기',  desc: '그린피·캐디·1인당 정산' },
              { href: '/tools/date/dday',          icon: '📅', name: 'D-day 계산기',           desc: '다음 라운드까지' },
              { href: '/tools/finance/car-cost',   icon: '🚗', name: '자동차 유지비 계산기',    desc: '골프장 왕복 유류비' },
              { href: '/tools/life/dutch',         icon: '🍻', name: '더치페이 계산기',         desc: '내기 골프 정산·N빵' },
              { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',         desc: '스윙 연습 루틴' },
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
        </div>

      </div>
    </div>
  )
}
