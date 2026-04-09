import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Toolify 소개 — 무료 온라인 도구 모음',
  description: 'Toolify는 연봉 계산기, BMI, 로또 번호 생성기 등 일상에서 자주 쓰는 도구를 무료로 제공하는 서비스입니다.',
}

const categories = [
  { icon: '💰', name: '금융·재테크', tools: ['연봉 실수령액 계산기', '대출이자 계산기'] },
  { icon: '🏃', name: '건강·피트니스', tools: ['BMI 계산기', '기초대사량 계산기', '러닝 페이스 계산기'] },
  { icon: '🎲', name: '생활·재미', tools: ['로또 번호 생성기', '랜덤 추첨기'] },
  { icon: '📐', name: '단위·변환', tools: ['평수 ↔ ㎡ 변환기', '길이 변환기', '무게 변환기'] },
  { icon: '📅', name: '날짜·시간', tools: ['만 나이 계산기', 'D-day 계산기', '날짜 차이 계산기'] },
  { icon: '🖥️', name: '개발자·텍스트', tools: ['글자수 세기', 'Base64 변환기', 'JSON 포맷터'] },
]

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>

      {/* 헤더 */}
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '16px' }}>
        Toolify 소개
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '48px', maxWidth: '560px' }}>
        Toolify는 일상에서 자주 필요한 계산기와 유틸리티 도구를 한 곳에 모아둔 무료 서비스입니다.
        로그인 없이 누구나 즉시 사용할 수 있습니다.
      </p>

      {/* 핵심 가치 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '48px' }}>
        {[
          { icon: '⚡', title: '즉시 사용', desc: '회원가입·로그인 없이 바로' },
          { icon: '🆓', title: '완전 무료', desc: '모든 도구 영구 무료 제공' },
          { icon: '📱', title: '모바일 최적화', desc: '어떤 기기에서도 편리하게' },
        ].map(v => (
          <div key={v.title} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '20px 18px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{v.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{v.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{v.desc}</div>
          </div>
        ))}
      </div>

      {/* 제공 도구 목록 */}
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
        제공 도구 ({categories.reduce((s, c) => s + c.tools.length, 0)}개)
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '48px' }}>
        {categories.map(cat => (
          <div key={cat.name} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '18px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>{cat.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{cat.name}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {cat.tools.map(tool => (
                <span key={tool} style={{
                  fontSize: '12px', color: 'var(--muted)',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: '99px', padding: '3px 10px',
                }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 문의 */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '24px 24px',
      }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
          문의 및 피드백
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
          새로운 도구 제안이나 오류 제보는 언제든지 환영합니다.
          사용하고 싶은 도구가 있다면 알려주세요!
        </p>
        <a href="mailto:contact@toolify.kr" style={{
          display: 'inline-block',
          background: 'var(--accent)', color: '#0D0D0D',
          borderRadius: '10px', padding: '10px 20px',
          fontSize: '13px', fontWeight: 700,
          textDecoration: 'none',
        }}>
          contact@toolify.kr 이메일 보내기
        </a>
      </div>

      {/* 하단 링크 */}
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px', fontSize: '13px' }}>
        <Link href="/privacy" style={{ color: 'var(--muted)' }}>개인정보처리방침</Link>
        <Link href="/terms" style={{ color: 'var(--muted)' }}>이용약관</Link>
      </div>

    </div>
  )
}