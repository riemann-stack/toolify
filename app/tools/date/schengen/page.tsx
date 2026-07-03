import Link from 'next/link'
import SchengenClient from './SchengenClient'
import AdSlot from '@/components/AdSlot'
import UpdatedMeta from '@/components/UpdatedMeta'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/date/schengen',
  title: '쉥겐 체류일 계산기 — 90/180일 무비자 체류 + 다음 입국 가능일',
  description:
    '쉥겐 90/180 규칙(최근 180일 내 최대 90일)을 출입국 기록으로 정확히 계산. 남은 체류일·연속 체류 가능일·다음 입국 가능일을 자동으로. 유럽 무비자 여행 필수.',
  keywords: ['쉥겐체류일계산기', '쉥겐90일계산', '쉥겐180일', '유럽무비자90일', '쉥겐조약', '솅겐계산기', '유럽장기여행', '쉥겐재입국'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 20px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text)',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '13px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { q: '쉥겐 90/180 규칙이 정확히 무엇인가요?', a: '쉥겐 지역에서 무비자(또는 단기비자)로 머물 수 있는 한도입니다. <strong>임의의 날을 기준으로 직전 180일 동안 합산 체류일이 최대 90일</strong>을 넘으면 안 됩니다. 90일을 연속으로 쓸 수도, 여러 번 나눠 쓸 수도 있지만 어떤 180일 구간에서도 90일을 초과하면 안 됩니다.' },
  { q: '180일은 언제부터 세나요?', a: '고정된 분기·반기가 아니라 <strong>‘롤링(rolling) 180일’</strong>입니다. 오늘을 포함한 직전 180일을 매일 뒤로 한 칸씩 밀면서 봅니다. 그래서 과거 체류일이 180일 창 밖으로 빠져나가면 그만큼 체류 가능일이 다시 회복됩니다.' },
  { q: '입국일과 출국일도 체류일에 포함되나요?', a: '네. <strong>입국한 날과 출국하는 날 모두 각각 ‘체류 1일’로 계산</strong>합니다. 예를 들어 6월 1일 입국, 6월 10일 출국이면 10일이 아니라 <strong>10일(1일~10일)</strong>로 셉니다. 가장 흔한 계산 실수이므로 주의하세요.' },
  { q: '90일을 다 쓰면 언제 다시 입국할 수 있나요?', a: '가장 오래된 체류일이 180일 창에서 빠져나가야 그만큼 다시 채울 수 있습니다. 본 계산기의 <strong>‘다음 입국 가능일’</strong>이 1일 이상 체류 가능한 가장 이른 날짜를 자동으로 알려줍니다. 단, 완전히 90일을 회복하려면 마지막 출국일로부터 180일이 지나야 합니다.' },
  { q: '영국·아일랜드도 쉥겐인가요?', a: '아닙니다. <strong>영국(브렉시트 후)·아일랜드는 쉥겐 지역이 아니며 각자 별도의 입국 규정</strong>을 적용합니다(영국은 보통 6개월). 쉥겐 90일과 별개로 카운트되므로 영국 체류는 이 계산기에 넣지 마세요. 키프로스도 아직 쉥겐 미가입입니다.' },
  { q: '여러 나라를 옮겨 다녀도 합산되나요?', a: '네. 쉥겐은 <strong>29개 회원국 전체를 하나의 지역</strong>으로 봅니다. 프랑스 → 독일 → 이탈리아를 이동해도 국경 심사 없이 다닐 수 있지만 체류일은 모두 <strong>하나로 합산</strong>됩니다. 나라별 90일이 아니라 쉥겐 전체 90일입니다.' },
  { q: '90일을 초과하면 어떻게 되나요?', a: '초과 체류(오버스테이)는 <strong>벌금, 출국 명령, 향후 쉥겐 입국 금지(수개월~수년)</strong> 등의 불이익을 받을 수 있습니다. 2026년 4월부터 전면 시행된 <strong>EES(입·출국 시스템)가 입·출국을 전산 기록</strong>하므로 초과 체류가 자동으로 확인됩니다. 단 하루라도 넘기지 않도록 보수적으로 일정을 잡으세요.' },
  { q: 'EES 시행 후에도 여권 도장을 받나요?', a: 'EES(EU 입·출국 시스템)는 2025년 10월 12일 단계 도입을 거쳐 <strong>2026년 4월 10일부터 모든 쉥겐 국가에서 전면 시행</strong>됐습니다(EU 집행위 발표). 여권 스탬프는 <strong>디지털 입·출국 기록으로 대체</strong>되고, 최초 입국 시 얼굴 사진과 지문을 등록합니다. 체류일이 전산으로 자동 계산되므로 90/180일 한도를 넘기면 바로 드러납니다. (2026년 6월 기준)' },
  { q: '독일 같은 양자협정 국가에서는 90일과 별도로 더 머물 수 있나요?', a: '외교부 해외안전여행 안내 기준, <strong>독일·네덜란드·벨기에 등 13개국은 한국과의 양자 사증면제협정이 쉥겐 90/180 규칙보다 우선 적용</strong>됩니다. 예컨대 독일은 주한독일대사관 안내상 다른 쉥겐국 체류 직후에도 독일에서 90일까지 체류할 수 있습니다. 다만 허용 기간·조건이 국가별로 다르고 입국 심사는 각국 재량이므로, 이용 전 반드시 외교부 해외안전여행(0404.go.kr)과 해당국 대사관에서 확인하세요. 본 계산기는 표준 90/180 규칙 기준입니다. (2026년 6월 기준)' },
]

const COUNTRY_GROUPS: { region: string; items: string[] }[] = [
  { region: '서유럽', items: ['프랑스', '독일', '네덜란드', '벨기에', '룩셈부르크', '스위스', '오스트리아', '리히텐슈타인'] },
  { region: '남유럽', items: ['이탈리아', '스페인', '포르투갈', '그리스', '몰타', '슬로베니아', '크로아티아'] },
  { region: '북유럽', items: ['스웨덴', '덴마크', '핀란드', '노르웨이', '아이슬란드', '에스토니아', '라트비아', '리투아니아'] },
  { region: '중·동유럽', items: ['체코', '폴란드', '헝가리', '슬로바키아', '루마니아', '불가리아'] },
]

export default function SchengenPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="date" />쉥겐 체류일 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        출입국 기록만 입력하면 <strong style={{ color: 'var(--text)' }}>최근 180일 내 90일 규칙</strong>으로 남은 체류일·다음 입국 가능일을 자동 계산.
      </p>

      <UpdatedMeta
        date="2026년 6월"
        basis="쉥겐 29개 회원국 · EES 전면 시행(2026-04-10) 반영"
        sources={[
          { label: 'EU 공식 쉥겐 계산기', href: 'https://ec.europa.eu/assets/home/visa-calculator/calculator.htm' },
          { label: 'EU EES·ETIAS 안내', href: 'https://travel-europe.europa.eu/ees_en' },
          { label: '외교부 해외안전여행', href: 'https://0404.go.kr/bbs/contsPst/MST0000000000117/17/detail' },
        ]}
      />

      <SchengenClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 규칙 */}
        <div>
          <h2 style={sectionTitle}>📋 쉥겐 90/180 규칙 한눈에</h2>
          <div style={{ ...card, lineHeight: 1.85, fontSize: '14px', color: 'var(--text)' }}>
            <p style={{ margin: '0 0 10px' }}>
              한국 여권 소지자는 쉥겐 지역에서 <strong>무비자로 단기 체류</strong>가 가능하지만, <strong style={{ color: 'var(--accent)' }}>임의의 180일 동안 최대 90일</strong>이라는 한도가 있습니다.
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', lineHeight: 1.9 }}>
              <li><strong style={{ color: 'var(--text)' }}>롤링 180일</strong> — 고정 구간이 아니라 ‘오늘 기준 직전 180일’을 매일 슬라이딩하며 검사</li>
              <li><strong style={{ color: 'var(--text)' }}>입국일·출국일 모두 1일</strong>로 계산 (몇 시간만 머물러도 하루)</li>
              <li><strong style={{ color: 'var(--text)' }}>29개국 전체 합산</strong> — 나라별 90일이 아니라 쉥겐 전체 90일</li>
              <li>과거 체류일이 180일 창 밖으로 빠지면 그만큼 체류 가능일 <strong style={{ color: 'var(--text)' }}>회복</strong></li>
            </ul>
          </div>
        </div>

        {/* 가입국 */}
        <div>
          <h2 style={sectionTitle}>🗺️ 쉥겐 가입국 (29개국)</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            불가리아·루마니아는 2025년 1월 육로까지 전면 가입해 현재 29개국입니다. <strong style={{ color: 'var(--text)' }}>아일랜드·키프로스는 쉥겐이 아니며</strong>, 영국은 브렉시트 후 별도 규정(보통 6개월)을 적용합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {COUNTRY_GROUPS.map((g) => (
              <div key={g.region} style={{ ...card, padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>{g.region}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, margin: 0 }}>{g.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 계산 예시 */}
        <div>
          <h2 style={sectionTitle}>🧮 계산 예시</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text)', fontWeight: 600 }}>예) 1월 1일~1월 30일(30일) 체류 후, 3월 1일에 다시 입국한다면?</p>
            <p style={{ margin: 0 }}>
              3월 1일 기준 직전 180일 안에 1월 체류 30일이 포함되므로 <strong style={{ color: 'var(--text)' }}>남은 한도는 90 − 30 = 60일</strong>. 단, 머무는 동안에도 매일 180일 창을 다시 확인해야 하며, 시간이 지나 1월 체류가 창 밖으로 빠지면 그만큼 한도가 회복됩니다. 위 계산기는 이 과정을 <strong style={{ color: 'var(--text)' }}>하루 단위로 시뮬레이션</strong>해 ‘연속 체류 가능일’과 ‘다음 입국 가능일’을 정확히 알려줍니다.
            </p>
          </div>
        </div>

        {/* EES·ETIAS */}
        <div>
          <h2 style={sectionTitle}>🛂 EES·ETIAS — 2026년 쉥겐 입국 변화</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text)' }}>
              <strong style={{ color: 'var(--accent)' }}>EES(입·출국 시스템)</strong> — 2025년 10월 12일 단계 도입을 시작해 <strong>2026년 4월 10일부터 모든 쉥겐 국가에서 전면 시행</strong>됐습니다(EU 집행위 발표).
            </p>
            <ul style={{ margin: '0 0 16px', paddingLeft: '20px', lineHeight: 1.9 }}>
              <li><strong style={{ color: 'var(--text)' }}>여권 스탬프 → 디지털 기록</strong> — 입·출국 날짜와 장소가 전산에 자동 기록됩니다</li>
              <li><strong style={{ color: 'var(--text)' }}>생체정보 등록</strong> — 최초 입국 시 얼굴 사진과 지문을 등록합니다</li>
              <li><strong style={{ color: 'var(--text)' }}>체류일 자동 산출</strong> — 90/180일 초과(오버스테이)가 시스템에서 바로 확인되므로 체류일 관리가 더 중요해졌습니다</li>
            </ul>
            <p style={{ margin: '0 0 8px', color: 'var(--text)' }}>
              <strong style={{ color: 'var(--accent)' }}>ETIAS(전자여행허가)</strong> — <strong>2026년 4분기 개시 예정</strong>입니다(2026년 6월 기준, 정확한 개시일은 미발표).
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.9 }}>
              <li>한국 등 무비자 여행자는 출발 전 <strong style={{ color: 'var(--text)' }}>온라인 사전 신청</strong>이 필요합니다 (수수료 20유로)</li>
              <li>유효기간은 <strong style={{ color: 'var(--text)' }}>3년 또는 여권 만료일 중 빠른 쪽</strong>까지입니다</li>
              <li>개시 후 <strong style={{ color: 'var(--text)' }}>최소 6개월의 과도기</strong>가 예정되어, 이 기간에는 ETIAS가 없어도 나머지 입국 요건을 충족하면 입국이 거부되지 않습니다</li>
            </ul>
            <p style={{ margin: '12px 0 0', fontSize: '12px' }}>
              기준: 2026년 6월 · 출처: EU 집행위(home-affairs.ec.europa.eu) · EU 공식 여행정보(travel-europe.europa.eu)
            </p>
          </div>
        </div>

        {/* 양자 사증면제협정 */}
        <div>
          <h2 style={sectionTitle}>🤝 한국과의 양자 사증면제협정 — 90/180일과 별도?</h2>
          <div style={{ ...card, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }}>
            <p style={{ margin: '0 0 10px' }}>
              외교부 해외안전여행 안내(2026년 6월 확인) 기준, 아래 <strong style={{ color: 'var(--text)' }}>13개국은 한국과의 양자 사증면제협정이 쉥겐 90/180 규칙보다 우선 적용</strong>됩니다. 나머지 16개국(프랑스·스페인·스위스·폴란드 등)은 쉥겐 규칙이 우선입니다.
            </p>
            <p style={{ margin: '0 0 10px', color: 'var(--text)', fontWeight: 600 }}>
              독일 · 네덜란드 · 벨기에 · 오스트리아 · 이탈리아 · 체코 · 몰타 · 덴마크 · 노르웨이 · 스웨덴 · 아이슬란드 · 루마니아 · 리투아니아
            </p>
            <p style={{ margin: '0 0 10px' }}>
              예를 들어 독일은 주한독일대사관 안내상 <strong style={{ color: 'var(--text)' }}>다른 쉥겐국 체류 직후에도 독일에서 90일까지 체류</strong>할 수 있습니다.
            </p>
            <p style={{ margin: 0 }}>
              ⚠️ 허용 체류기간과 적용 방식은 <strong style={{ color: 'var(--text)' }}>국가별로 다르고 입국 심사는 각국 재량</strong>이므로, 이용 전 반드시 외교부 해외안전여행(0404.go.kr)과 해당국 대사관에서 최신 기준을 확인하세요. 본 계산기는 표준 90/180 규칙만 반영합니다.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((f, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
              <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
            </details>
          ))}
        </div>

        {/* 면책 */}
        <Disclaimer variant="default" open>
          본 계산기는 일반적인 90/180 규칙에 따른 <strong>참고용 추정</strong>입니다. 쉥겐 회원국·규정은 변경될 수 있고, 장기비자·거주허가·일부 국가와의 양자협정 등 예외가 있습니다. <strong>최종 입·출국 허가는 현지 입국심사관의 재량</strong>이며, 정확한 판단은 해당국 대사관 또는 EU 공식 쉥겐 계산기로 재확인하세요.
        </Disclaimer>

        {/* 관련 도구 */}
        <div>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/timezone', icon: '🕐', name: '시간대 변환기', desc: '현지 시각·시차 확인' },
              { href: '/tools/date/jet-lag', icon: '✈️', name: '시차 적응 계산기', desc: '도착 후 수면 조정' },
              { href: '/tools/life/customs', icon: '🛃', name: '면세 한도 계산기', desc: '귀국 시 세관 신고' },
              { href: '/tools/date/dday', icon: '📅', name: 'D-Day 계산기', desc: '출국·귀국일 카운트' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
