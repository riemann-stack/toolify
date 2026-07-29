import Link from 'next/link'
import { totalTools, categories } from '@/lib/tools'
import AdSlot from '@/components/AdSlot'
import CatIcon from '@/components/CatIcon'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolsBrowser from './ToolsBrowser'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools',
  title: `전체 도구 목록 — 무료 계산기·유틸리티 ${totalTools}가지`,
  description: `연봉 계산기, BMI, 로또 번호 생성기, 부가세, 임신 주수 등 ${totalTools}가지 무료 온라인 도구를 11개 카테고리로. 로그인 없이 브라우저에서 바로 사용하세요.`,
})

/** 인덱스용 짧은 카테고리 한 줄 소개 (카테고리 본문과 중복되지 않게 별도 문구) */
const CATEGORY_TAGLINES: Record<string, string> = {
  finance: '월급·대출·세금·투자를 한국 세제와 2026년 기준으로 계산합니다.',
  health: 'BMI·기초대사량·임신 주수·수면 부채를 검증된 공식으로 추정합니다.',
  cooking: '레시피 비율·해동·발효·보관 기한을 자동으로 계산합니다.',
  life: '로또·더치페이·여행 예산처럼 일상의 소소한 계산을 돕습니다.',
  sports: '골프 스코어·러닝 페이스·근력 1RM 등 운동 기록을 관리합니다.',
  interior: '평수·도배·페인트 양처럼 집을 꾸밀 때 필요한 계산을 미리 합니다.',
  unit: '길이·무게·면적은 물론 평·돈·근 같은 전통 단위까지 변환합니다.',
  date: 'D-day·만 나이·근무일수·셰겐 체류 한도를 정확히 계산합니다.',
  art: '색상 변환·모스부호·비율 등 창작과 디자인용 도구입니다.',
  edu: '과학 단위·유효숫자·천문 등 배우고 가르칠 때 쓰는 도구입니다.',
  dev: '진법·인코딩·정규식 등 개발용 변환을 브라우저 안에서 처리합니다.',
}

const FAQS = [
  {
    q: 'youtil의 도구는 무료인가요?',
    a: `네. ${totalTools}가지 도구 모두 회원가입·로그인 없이 무료로 사용할 수 있습니다. 서비스 유지를 위한 최소한의 광고만 게재합니다.`,
  },
  {
    q: '계산 결과는 얼마나 정확한가요?',
    a: '각 도구는 공개된 공식·세율·기준을 근거로 계산하며 본문에 출처와 기준 연도를 표기합니다. 다만 세금·건강·금융 등은 개인 상황에 따라 달라지는 추정값이므로, 중요한 결정 전에는 해당 기관·전문가의 확인을 권장합니다.',
  },
  {
    q: '입력한 정보가 저장되거나 전송되나요?',
    a: '계산 입력값(연봉·건강 수치 등)은 여러분의 브라우저 안에서만 처리되고 저희가 수집하지 않습니다. 다만 서버 시간 확인·시세 조회처럼 외부 조회가 필요한 일부 도구는 이용자가 입력한 공개 정보(웹사이트 주소·조회 품목)를 서버로 보내 결과를 받아오며, 자세한 내용은 개인정보처리방침에 안내되어 있습니다.',
  },
  {
    q: '모바일에서도 사용할 수 있나요?',
    a: '네. 모든 도구가 휴대폰 화면에 맞춰 반응형으로 동작하며, 앱 설치 없이 모바일 브라우저에서 바로 쓸 수 있습니다.',
  },
]

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  marginBottom: '14px',
  color: 'var(--paper-ink)',
}

export default function ToolsPage() {
  return (
    <div style={{ background: 'var(--paper)' }}>
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px', overflowX: 'hidden' }}>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px', color: 'var(--paper-ink)' }}>
        전체 도구 목록
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--paper-ink-soft)', lineHeight: 1.7, marginBottom: '24px' }}>
        연봉·대출·세금부터 BMI·레시피·여행까지, 일상에서 자주 쓰는 <strong style={{ color: 'var(--paper-ink)' }}>{totalTools}가지</strong> 무료 도구를
        11개 카테고리로 모았습니다. 로그인 없이 브라우저에서 즉시 사용하고, 입력값은 기기 밖으로 나가지 않습니다.
      </p>

      <ToolsBrowser />

      {/* 카테고리 안내 — 둘러보기용 설명형 내비게이션 */}
      <section style={{ marginTop: '56px' }}>
        <h2 style={sectionTitle}>카테고리별로 둘러보기</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools/${cat.id}`}
              style={{
                display: 'block',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid var(--paper-line)',
                background: 'var(--paper-card)',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', color: cat.color }} aria-hidden="true"><CatIcon id={cat.id} size={18} /></span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: cat.color }}>{cat.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--paper-ink-faint)', marginLeft: 'auto' }}>{cat.tools.length}개</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--paper-ink-soft)', lineHeight: 1.6, margin: 0 }}>
                {CATEGORY_TAGLINES[cat.id] ?? `${cat.name} 관련 무료 도구 모음입니다.`}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 사이트 FAQ */}
      <section style={{ marginTop: '48px' }}>
        <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
        <FaqJsonLd items={FAQS} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, i) => (
            <details key={i} style={{ background: 'var(--paper-card)', border: '1px solid var(--paper-line)', borderRadius: '12px', padding: '12px 14px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--paper-ink)' }}>{faq.q}</summary>
              <p style={{ fontSize: '14px', color: 'var(--paper-ink-soft)', lineHeight: 1.8, margin: '8px 0 0' }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 푸터 광고 슬롯 — /tools는 AD_FREE_EXACT라 현재 항상 null 렌더.
          표시하려면 lib/ads.ts에서 이 경로를 제외 목록에서 빼야 함. */}
      <div style={{ marginTop: '48px' }}>
        <AdSlot position="footer" minHeight={250} />
      </div>
    </div>
    </div>
  )
}
