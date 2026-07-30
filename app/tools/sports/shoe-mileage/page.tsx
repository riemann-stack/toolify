import Link from 'next/link'
import ShoeMileageClient from './ShoeMileageClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/sports/shoe-mileage',
  title: '러닝화 수명·교체주기 계산기 — 몇 km에 바꿀까',
  description: '주간 거리·체중·미드솔 소재(EVA·TPU·PEBA)로 러닝화 예상 수명(km)과 교체 예상일을 계산. 2족 로테이션 연장 효과와 교체 신호까지.',
  keywords: [
    '러닝화 교체주기', '러닝화 수명', '러닝화 몇 km', '러닝화 로테이션',
    '카본화 수명', '미드솔 수명', '러닝화 교체 시기',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
  {
    q: '러닝화는 몇 km에 바꿔야 하나요?',
    a: '일반적으로 <strong>500~800km</strong>가 교체 기준으로 통용됩니다. 다만 이는 미드솔 소재·체중·주법에 따라 크게 달라집니다 — 일반 EVA 폼은 400~600km, 내구성 좋은 TPU·슈퍼폼(PEBA)은 500~700km 수준입니다. 위 계산기에 소재·체중·주간 거리를 넣으면 예상 수명과 교체 예상일이 나옵니다. 무엇보다 <strong>km는 참고치</strong>이며, 쿠션이 꺼진 느낌이나 통증이 있으면 수치와 상관없이 바꾸는 게 맞습니다.',
  },
  {
    q: '왜 미드솔이 닳으면 바꿔야 하나요?',
    a: '러닝화의 <strong>충격 흡수는 대부분 미드솔(중창) 폼</strong>이 담당합니다. 오래 쓰면 폼이 반복 압축돼 복원력을 잃고, 겉은 멀쩡해 보여도 <strong>충격이 그대로 무릎·발목·발바닥에 전달</strong>됩니다. 아웃솔(바닥 고무)이 닳지 않았어도 미드솔이 죽었으면 부상 위험이 커지므로 교체가 필요합니다. 그래서 겉모습보다 누적 거리와 착화감으로 판단합니다.',
  },
  {
    q: '2족을 번갈아 신으면 정말 오래 쓰나요?',
    a: '네, 도움이 됩니다. 미드솔 폼은 한 번 눌린 뒤 <strong>완전히 복원되는 데 하루 이상</strong>이 걸립니다. 매일 같은 신발만 신으면 폼이 회복할 시간 없이 계속 압축되지만, <strong>2족 이상을 번갈아 신으면</strong> 쉬는 동안 폼이 회복해 전체 수명이 늘어납니다(연구·브랜드 가이드에서 부상 감소·수명 연장 효과 보고). 소재·용도가 다른 신발을 섞으면 근육 자극도 다양해집니다.',
  },
  {
    q: '카본화(슈퍼슈즈)는 왜 수명이 짧다고 하나요?',
    a: 'PEBA 같은 <strong>슈퍼폼은 반발력이 뛰어난 대신, 레이싱용은 얇고 가볍게 만들어 반발 성능이 빨리 떨어진다</strong>는 인식이 있습니다. 실제 미드솔 내구 거리는 일반화 400~600km 수준으로 데일리화와 비슷하거나 조금 짧게 보기도 합니다. 다만 <strong>"레이스 반발감"이 필요한 대회용</strong>이라면, 내구 한계와 별개로 최고 성능이 유지되는 초반 구간에서 아껴 쓰는 사람이 많습니다. 데일리 슈퍼슈즈는 더 길게 쓸 수 있습니다.',
  },
  {
    q: '체중이 무거우면 더 빨리 닳나요?',
    a: '네. 착지할 때 <strong>미드솔이 받는 충격은 체중에 비례</strong>하므로, 무거울수록 폼이 빨리 압축되어 수명이 짧아지는 경향이 있습니다. 이 계산기도 체중이 클수록 예상 수명을 낮게 잡습니다. 반대로 가벼운 러너는 같은 신발을 더 오래 쓸 수 있습니다. 정확한 수명은 개인차가 크니 참고로만 보세요.',
  },
  {
    q: '누적 거리를 어떻게 기록하나요?',
    a: '스트라바·가민 커넥트·런키퍼 같은 앱에서 <strong>신발(기어)을 등록</strong>하면 러닝마다 자동으로 거리가 누적됩니다(나이키 런 클럽도 신발별 누적 거리 추적 기능을 제공합니다). 앱별 설정 경로와 알림 기본값은 위 <strong>앱으로 신발 거리 자동 누적하기</strong> 표에 정리했습니다. 앱을 안 쓴다면 구매일과 대략의 주간 거리로 추정할 수 있고, 여러 켤레를 로테이션한다면 각 신발의 거리를 따로 관리해야 정확합니다.',
  },
]

const RELATED = [
  { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '페이스↔기록 환산' },
  { href: '/tools/sports/carb-loading', icon: '🍚', name: '카보로딩 계산기', desc: '대회 전 탄수화물' },
  { href: '/tools/sports/race-predictor', icon: '⏱️', name: '마라톤 기록 계산기', desc: '완주 예상 시간' },
  { href: '/tools/sports/vo2max', icon: '🫁', name: 'VO₂ Max 계산기', desc: '심폐 체력 추정' },
  { href: '/tools/health/heat-hydration', icon: '💧', name: '폭염 수분·전해질', desc: '여름 러닝 수분' },
  { href: '/tools/sports/ftp-zones', icon: '🚴', name: 'FTP·파워존 계산기', desc: '사이클 훈련존' },
]

export default function ShoeMileagePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        스포츠
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="sports" />러닝화 수명 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        주간 거리·체중·소재로 <strong style={{ color: 'var(--text)' }}>러닝화 예상 수명(km)과 교체 예상일</strong> + 로테이션 연장 효과.
      </p>

      <ShoeMileageClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 방식 */}
        <section>
          <h2 style={sectionTitle}>수명 계산 방식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>수명(km)</span> = 소재 기본 × 체중보정 × 로테이션</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>소재: EVA 500 · TPU 600 · PEBA 600 (중앙값)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>체중: ~60kg ×1.1 · ~75 ×1.0 · ~90 ×0.9 · 90+ ×0.8</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>2족 로테이션 ×1.15</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 소재별 기본 수명은 브랜드 가이드·러닝 문헌의 통용 범위이며, 체중·로테이션 보정은 관행 배수입니다. 실제 수명은 노면·주법·보관에 따라 달라집니다.
          </p>
        </section>

        {/* 2. 소재별 표 */}
        <section>
          <h2 style={sectionTitle}>미드솔 소재별 수명 가이드</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['소재', '수명', '특징'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['EVA', '400~600km', '가장 흔한 데일리 트레이너 폼'],
                  ['TPU (부스트 등)', '500~700km', '내구성·반발 좋은 발포폼'],
                  ['PEBA (슈퍼폼)', '500~700km', '카본화·레이싱 슈퍼폼 (레이싱용은 짧게 보기도)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. 교체 주기 근거 + 관리법 */}
        <section>
          <h2 style={sectionTitle}>교체 주기 근거와 수명 늘리는 관리법</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14 }}>
            제조사 공식 안내는 하나로 모이지 않습니다. 같은 브랜드 안에서도 지역판·문서마다 권장치가 달라 출처를 나눠 봐야 정확합니다(2026년 7월 확인).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['출처 (기준 시점)', '권장 교체', '함께 제시한 기준'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['나이키 코리아 (2025년 7월 갱신)', '500~800km', '주 16km 미만 8~12개월 · 16~32km 5~8개월 · 32~64km 4~6개월 · 64km 이상 약 2~3개월'],
                  ['나이키 품질 엔지니어팀', '200~300마일 (약 322~483km)', '"일반적인 권장 수명"으로 제시'],
                  ['브룩스 고객지원', '300~500마일 (약 483~805km)', '정기적으로 신으면 4~6개월'],
                  ['아식스 미국판 (2021)', '300~500마일 (약 483~805km)', '주 15마일(약 24km) 러너는 5~8개월'],
                  ['아식스 영국판 (2021)', '400~500마일 (약 644~805km)', '심한 마모 신호가 없으면 더 신어도 된다고 안내'],
                  ['아식스 뉴질랜드판 (2024)', '800~1,000km', '최소 2켤레 로테이션 권장'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', lineHeight: 1.5 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.8 }}>
            ※ 마일 표기는 1마일 = 1.609km로 환산한 값입니다(원문은 마일 단위). 어느 수치가 정본인지 밝힌 공식 문서가 없어 하나로 합치지 않았습니다. 위 계산기의 소재별 기본값(EVA 400~600 · TPU/PEBA 500~700km)은 이 표에서 낮은 쪽 구간에 해당합니다. 실험 근거로는 EVA 미드솔이 500km 주행 시점에 최대 족저압이 평균 100% 늘고 750km에서는 폼에 주름·구멍 같은 구조 손상이 관찰됐다는 보고가 있습니다(Verdejo &amp; Mills, Journal of Biomechanics 2004). 출처:{' '}
            <a href="https://www.nike.com/kr/a/how-often-to-replace-running-shoes" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>나이키 코리아 러닝화 교체 주기 ↗</a>
            , 브룩스·아식스 공식 고객지원·어드바이스 페이지.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 16 }}>
            {[
              { t: '세탁기·건조기에 넣지 않기', d: '아식스 영국판 케어 가이드는 세탁기 세탁, 표백제·가정용 세제, 건조기·라디에이터·직사광선 건조를 모두 금지합니다. 나이키도 세탁기 세탁을 권장하지 않으며, 고온이 접착제·본딩제를 상하게 한다는 것이 품질 엔지니어팀 설명입니다.' },
              { t: '손세척 후 실온 자연건조', d: '끈·인솔을 빼고 중성세제 15~30ml 푼 물로 아웃솔부터 솔질하고, 갑피는 젖은 스펀지로 닦습니다. 인솔은 담그면 폼과 모양이 상합니다. 종이타월을 채워 실온에 두며, 나이키 기준 러닝화는 완전히 마르는 데 최대 8시간이 걸립니다.' },
              { t: '달린 뒤 24~48시간 쉬게 하기', d: '나이키 엔지니어는 폼 미드솔이 다시 펴지는 데 최소 24~48시간이 필요하다고 봅니다. 레크리에이션 러너 264명을 22주 추적한 연구에서도 여러 켤레를 병행한 쪽의 러닝 관련 부상 위험이 낮았습니다(HR 0.614, 95% CI 0.389~0.969).' },
              { t: '서늘·건조·통풍되는 곳에 보관', d: '브룩스는 신지 않은 신발도 시간이 지나면 특히 접착제가 열화한다며 서늘하고 건조한 통풍 장소를 권합니다. 나이키 코리아도 직사광선과 습기가 닿지 않는 곳에 두라고 안내합니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 교체 신호 */}
        <section>
          <h2 style={sectionTitle}>이런 신호면 바로 교체하세요</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '쿠션이 꺼진 느낌', d: '착지가 딱딱해지고 반발이 사라짐' },
              { t: '달린 뒤 관절 통증', d: '무릎·발목·정강이·발바닥이 예전보다 아픔' },
              { t: '아웃솔 마모', d: '바닥 고무가 닳아 미끄럽거나 평평해짐' },
              { t: '미드솔 주름·갈라짐', d: '옆면 폼에 깊은 주름·크랙이 보임' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>⚠️ {c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 앱으로 거리 자동 누적 */}
        <section>
          <h2 style={sectionTitle}>앱으로 신발 거리 자동 누적하기</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14 }}>
            누적 거리를 수첩에 적는 대신 앱에 신발(기어)을 등록해두면 러닝마다 자동으로 쌓입니다. 각 앱 공식 도움말에 안내된 경로입니다(2026년 7월 확인).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['앱', '등록 경로', '자동 누적·알림'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['스트라바 (웹)', '프로필 사진 → Settings → My Gear → Add Shoes', '브랜드·모델과 알림 거리를 등록 시 함께 입력'],
                  ['스트라바 (앱)', 'You 탭 → Profile → Gear → 우상단 + → 첫 드롭다운에서 신발 선택', '신발은 Run·Trail Run·Walk·Virtual Run·Hike의 기본 기어로 지정 가능'],
                  ['가민 커넥트 (앱)', '메뉴 → 자세히(More) → 장비 → 추가', '기본 액티비티(Default Activities)를 지정하면 해당 종목 거리가 자동 추적'],
                  ['가민 커넥트 (웹)', '왼쪽 메뉴 → 장비 → +장비 추가', 'Add to Existing Activities를 켜면 최초 사용일 이후 활동에 소급 적용'],
                  ['런키퍼 (아식스)', 'Me 탭 → Shoes → +Add shoes (모바일 전용)', '거리 목표를 정해두면 도달 시 알림, 은퇴(Retire) 처리 가능'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', lineHeight: 1.6 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', lineHeight: 1.6 }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>스트라바 알림</strong> — 기본값은 250마일이고 800마일까지 올릴 수 있으며, 설정은 웹에서만 됩니다(공식 문서는 마일 단위로만 표기). 임계값을 넘기면 그 신발을 지정한 러닝마다 알림이 계속 오므로, 신발을 은퇴시키거나 알림을 꺼야 멈춥니다. 스트라바가 특정 교체 거리를 권장하는 것은 아닙니다.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>수동 입력은 안 됩니다</strong> — 스트라바는 스트라바에 기록된 활동만 기어에 누적하며 누적 거리를 직접 입력할 수 없습니다. 등록 전 거리는 그 신발을 지정한 수동 활동(manual activity)으로 채워야 하고, 이미 올린 활동의 기어를 나중에 바꿔 소급 반영하는 것은 됩니다.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>가민은 시계에서도 선택</strong> — 호환 기기(포러너 570·970, 페닉스 8 등)에서 활동 프로필의 Gear Tracking을 켜두면 활동 저장 직전에 어떤 신발을 신었는지 고를 수 있습니다. 한국어 공식 안내:{' '}
              <a href="https://support.garmin.com/ko-KR/?faq=9EtB5L0OA26gp56Yv9tyH9" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>가민 Connect 장비 추적 기능 ↗</a>
            </p>
          </div>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
