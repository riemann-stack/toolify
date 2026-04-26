import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '문의 | Youtil',
  description: 'Youtil 운영팀에 버그 제보, 도구 추천, 광고·제휴 문의를 보내실 수 있습니다.',
}

const EMAIL = 'contact@youtil.kr'

const CATEGORIES = [
  {
    icon: '🐛',
    title: '버그 제보',
    desc: '계산 결과 오류, 화면 깨짐, 동작 이상 등을 알려주세요.',
    hint: '재현 단계와 사용 중인 기기·브라우저를 함께 적어주시면 더 빠르게 해결됩니다.',
    color: '#FF6B6B',
  },
  {
    icon: '💡',
    title: '도구 추천',
    desc: '새로 만들어지면 좋을 도구나 기능을 제안해주세요.',
    hint: '어떤 상황에서 어떻게 쓰고 싶은지 한두 줄 시나리오를 함께 적어주시면 큰 도움이 됩니다.',
    color: '#3EC8FF',
  },
  {
    icon: '✏️',
    title: '데이터·내용 정정',
    desc: '잘못된 수치, 오래된 법령, 부정확한 표현이 있다면 알려주세요.',
    hint: '근거 출처(법령·논문·공식 자료)를 함께 보내주시면 검토가 빠릅니다.',
    color: '#3EFF9B',
  },
  {
    icon: '📣',
    title: '광고·제휴 문의',
    desc: '협업, 광고, 콘텐츠 제휴 등 비즈니스 문의는 이 카테고리로 보내주세요.',
    hint: '회사명·담당자·제안 내용을 메일 본문에 정리해주시면 빠르게 답변드립니다.',
    color: '#FFB83E',
  },
]

export default function ContactPage() {
  const subject = encodeURIComponent('[Youtil 문의] ')
  const mailto = `mailto:${EMAIL}?subject=${subject}`

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>

      {/* 헤더 */}
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Contact
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '14px' }}>
        문의하기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '36px' }}>
        Youtil은 사용자의 의견으로 더 정확하고 편리해집니다. 버그 제보, 새 도구 추천, 광고·제휴 문의 등 어떤 의견이든 환영합니다.
        가장 빠른 연락 수단은 이메일입니다.
      </p>

      {/* 메일 CTA */}
      <div style={{
        background: 'rgba(200,255,62,0.05)',
        border: '1px solid rgba(200,255,62,0.3)',
        borderRadius: '14px',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.04em', fontWeight: 700 }}>
          📧 EMAIL
        </p>
        <a
          href={mailto}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(20px, 4vw, 28px)',
            color: 'var(--text)',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            textDecoration: 'none',
            wordBreak: 'break-all',
          }}
        >
          {EMAIL}
        </a>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
          평일 기준 1~3일 내 답변드립니다. 메일 제목 앞에 카테고리(예: <strong style={{ color: 'var(--text)' }}>[버그]</strong>, <strong style={{ color: 'var(--text)' }}>[추천]</strong>)를 적어주시면 분류가 빨라집니다.
        </p>
        <a
          href={mailto}
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent)',
            color: '#0D0D0D',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            fontFamily: "'Noto Sans KR', sans-serif",
            marginTop: '4px',
          }}
        >
          ✉️ 이메일 보내기
        </a>
      </div>

      {/* 카테고리 안내 */}
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '14px' }}>
        문의 카테고리 안내
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        어떤 종류의 문의든 위 이메일 주소로 보내시면 됩니다. 아래 카테고리를 참고하시면 더 빠르고 정확한 답변을 받으실 수 있습니다.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
        {CATEGORIES.map(c => (
          <div
            key={c.title}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px 18px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>{c.icon}</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: c.color, marginBottom: '4px' }}>{c.title}</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '6px' }}>{c.desc}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>{c.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 운영자 정보 */}
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '14px' }}>
        운영자 정보
      </h2>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', marginBottom: '40px' }}>
        <dl style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: '10px', columnGap: '14px', fontSize: '13px' }}>
          <dt style={{ color: 'var(--muted)' }}>사이트</dt>
          <dd style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>youtil.kr</dd>

          <dt style={{ color: 'var(--muted)' }}>운영 형태</dt>
          <dd style={{ color: 'var(--text)' }}>개인 운영 (비영리 무료 서비스)</dd>

          <dt style={{ color: 'var(--muted)' }}>운영 시작</dt>
          <dd style={{ color: 'var(--text)' }}>2026년</dd>

          <dt style={{ color: 'var(--muted)' }}>응답 시간</dt>
          <dd style={{ color: 'var(--text)' }}>평일 기준 1~3일 이내</dd>

          <dt style={{ color: 'var(--muted)' }}>연락 수단</dt>
          <dd style={{ color: 'var(--text)' }}>
            <a href={mailto} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{EMAIL}</a>
          </dd>
        </dl>
      </div>

      {/* 안내 박스 */}
      <div style={{
        background: 'rgba(62,200,255,0.06)',
        border: '1px solid rgba(62,200,255,0.25)',
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '12px',
        color: 'var(--muted)',
        lineHeight: 1.8,
        marginBottom: '40px',
      }}>
        <strong style={{ color: '#3EC8FF' }}>ℹ️ 안내</strong> · Youtil의 모든 도구는 일반적인 정보 제공을 목적으로 합니다.
        의료·법률·세무·금융 등 전문적 판단이 필요한 분야는 반드시 해당 전문가의 상담을 받아주세요.
        도구 결과로 인한 직접·간접적 손실에 대해 운영자는 법적 책임을 지지 않습니다.
        자세한 내용은 <Link href="/terms" style={{ color: 'var(--accent)' }}>이용약관</Link>을 참고하세요.
      </div>

      {/* 하단 링크 */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px' }}>
        <Link href="/about"   style={{ color: 'var(--muted)' }}>소개</Link>
        <Link href="/tools"   style={{ color: 'var(--muted)' }}>전체 도구</Link>
        <Link href="/privacy" style={{ color: 'var(--muted)' }}>개인정보처리방침</Link>
        <Link href="/terms"   style={{ color: 'var(--muted)' }}>이용약관</Link>
      </div>

    </div>
  )
}
