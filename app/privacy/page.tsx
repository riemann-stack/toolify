import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침 | Youtil',
  description: 'Youtil 개인정보처리방침입니다.',
}

const LAST_UPDATED = '2026년 4월 9일'
const SITE_NAME = 'Youtil'
const SITE_URL = 'https://youtil-delta.vercel.app'
const CONTACT_EMAIL = 'contact@youtil.kr'

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        개인정보처리방침
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '48px' }}>
        최종 업데이트: {LAST_UPDATED}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontSize: '14px', lineHeight: '1.9', color: 'var(--muted)' }}>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            1. 총칙
          </h2>
          <p>
            {SITE_NAME}(이하 서비스)은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 및 관련 법령을 준수합니다.
            본 방침은 {SITE_URL} 에서 제공하는 모든 서비스에 적용됩니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            2. 수집하는 개인정보
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 회원가입 없이 이용 가능하며, 별도의 개인정보를 수집하지 않습니다.
            다만 서비스 운영을 위해 아래 정보가 자동으로 수집될 수 있습니다.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>접속 IP 주소</li>
            <li>접속 일시 및 서비스 이용 기록</li>
            <li>브라우저 종류 및 OS 정보</li>
            <li>쿠키 및 방문 기록 (Google Analytics)</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            3. 개인정보 수집 목적
          </h2>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>서비스 이용 통계 분석 및 개선</li>
            <li>부정 이용 방지 및 보안</li>
            <li>광고 서비스 제공 (Google AdSense)</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            4. 쿠키(Cookie) 정책
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 Google Analytics 및 Google AdSense를 통해 쿠키를 사용합니다.
            쿠키는 이용자의 브라우저에 저장되는 소량의 데이터로, 서비스 이용 패턴 분석 및 맞춤 광고 제공에 활용됩니다.
          </p>
          <p>
            브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
            Google의 개인정보 처리에 대한 자세한 내용은{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}>Google 개인정보처리방침</a>을 참고하세요.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            5. 제3자 제공
          </h2>
          <p>
            {SITE_NAME}은 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            단, Google Analytics 및 Google AdSense 운영을 위해 Google LLC에 서비스 이용 데이터가 전달될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            6. 보유 및 이용 기간
          </h2>
          <p>
            자동 수집된 접속 로그는 최대 6개월간 보관 후 파기됩니다.
            관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            7. 이용자의 권리
          </h2>
          <p>
            이용자는 언제든지 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.
            요청은 아래 이메일로 연락해 주시면 신속히 처리하겠습니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            8. 개인정보 보호책임자
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p>서비스명: {SITE_NAME}</p>
            <p style={{ marginTop: '6px' }}>이메일: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a></p>
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            9. 방침 변경 안내
          </h2>
          <p>
            본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며,
            변경 시 본 페이지를 통해 공지합니다.
          </p>
        </section>

      </div>
    </div>
  )
}