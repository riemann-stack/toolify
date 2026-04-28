import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/privacy',
  title: '개인정보처리방침',
  description: 'Youtil 개인정보처리방침입니다.',
})

const LAST_UPDATED  = '2026년 4월 12일'
const SITE_NAME     = 'Youtil'
const SITE_URL      = 'https://youtil.kr'
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

        {/* 1 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            1. 총칙
          </h2>
          <p>
            {SITE_NAME}(이하 「서비스」)은 이용자의 개인정보를 중요하게 생각하며,
            「개인정보 보호법」 및 관련 법령을 준수합니다.
            본 방침은 {SITE_URL} 에서 제공하는 모든 서비스에 적용됩니다.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            2. 수집하는 개인정보
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 회원가입 없이 이용 가능하며, 별도의 개인정보를 직접 수집하지 않습니다.
            다만 서비스 운영을 위해 아래 정보가 자동으로 수집될 수 있습니다.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>접속 IP 주소</li>
            <li>접속 일시 및 서비스 이용 기록</li>
            <li>브라우저 종류 및 OS 정보</li>
            <li>쿠키 및 방문 기록 (Google Analytics, Google AdSense)</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            3. 개인정보 수집 목적
          </h2>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>서비스 이용 통계 분석 및 품질 개선</li>
            <li>부정 이용 방지 및 보안 유지</li>
            <li>맞춤형 광고 서비스 제공 (Google AdSense)</li>
          </ul>
        </section>

        {/* 4 — 보강된 쿠키 정책 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            4. 쿠키(Cookie) 정책
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 Google Analytics 및 Google AdSense를 통해 쿠키를 사용합니다.
            쿠키는 이용자의 브라우저에 저장되는 소량의 데이터로, 서비스 이용 패턴 분석 및
            맞춤형 광고 제공에 활용됩니다.
          </p>
          <p style={{ marginBottom: '12px' }}>
            Google AdSense는 <strong style={{ color: 'var(--text)' }}>DART 쿠키</strong>를 사용하여
            이용자가 본 사이트 및 인터넷의 다른 사이트를 방문할 때 광고를 게재합니다.
            이용자는 아래 방법으로 맞춤형 광고를 거부할 수 있습니다.
          </p>

          {/* 맞춤형 광고 거부 안내 박스 */}
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid rgba(200,255,62,0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
              맞춤형 광고 거부 방법
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '2px' }}>① Google 광고 설정 페이지</p>
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: 'var(--accent)', wordBreak: 'break-all' }}>
                  https://www.google.com/settings/ads
                </a>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  구글 계정의 광고 설정을 방문하여 맞춤형 광고를 게재하지 않도록 설정할 수 있습니다.
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '2px' }}>② 디지털 광고 연합(DAA) 옵트아웃</p>
                <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: 'var(--accent)' }}>
                  www.aboutads.info
                </a>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                  타사 공급업체의 맞춤형 광고용 쿠키 사용을 차단할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <p>
            브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.
            Google의 개인정보 처리에 대한 자세한 내용은{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}>Google 개인정보처리방침</a>을 참고하세요.
          </p>
        </section>

        {/* 5 — 구체화된 제3자 제공 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            5. 제3자 광고 서비스 이용
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 사이트 방문 시 광고를 게재하기 위해 제3자 광고 회사(Google)를 이용합니다.
            이들 회사는 귀하가 본 서비스 및 다른 웹사이트를 방문한 기록
            (성명, 주소, 이메일 주소, 전화번호 제외)을 사용하여
            귀하에게 적합한 상품 및 서비스에 대한 광고를 제공할 수 있습니다.
          </p>
          <p>
            {SITE_NAME}은 이용자의 개인정보를 광고 목적 외의 이유로 제3자에게 판매하거나
            제공하지 않습니다. 광고 관련 데이터 처리는 전적으로 Google의 개인정보처리방침을 따릅니다.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            6. 보유 및 이용 기간
          </h2>
          <p>
            자동 수집된 접속 로그는 최대 6개월간 보관 후 파기됩니다.
            관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            7. 이용자의 권리
          </h2>
          <p>
            이용자는 언제든지 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.
            요청은 아래 이메일로 연락해 주시면 신속히 처리하겠습니다.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            8. 개인정보 보호책임자
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p>서비스명: {SITE_NAME}</p>
            <p style={{ marginTop: '6px' }}>
              이메일:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </section>

        {/* 9 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            9. 방침 변경 안내
          </h2>
          <p>
            본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며,
            변경 시 본 페이지를 통해 공지합니다.
            중요한 변경이 있을 경우 상단의 「최종 업데이트」 일자를 통해 확인할 수 있습니다.
          </p>
        </section>

        {/* 10 — 신규: SSL 보안 조치 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            10. 개인정보 보호를 위한 노력
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 이용자의 보안을 위해 전체 사이트에{' '}
            <strong style={{ color: 'var(--text)' }}>SSL(Secure Sockets Layer) 암호화</strong>를 적용하여
            데이터 전송 시 안전을 기하고 있습니다.
            브라우저 주소창의 자물쇠(🔒) 아이콘을 통해 암호화된 연결을 확인하실 수 있습니다.
          </p>
          <p>
            {SITE_NAME}은 별도의 서버에 개인정보를 저장하지 않으며, 계산 과정에서 입력된 모든 데이터는
            이용자의 브라우저 내에서만 처리되고 외부로 전송되지 않습니다.
          </p>

          {/* 보안 포인트 3개 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
            {[
              { icon: '🔒', title: 'HTTPS 적용',   desc: '전체 사이트 SSL 암호화' },
              { icon: '🚫', title: '서버 미저장',   desc: '계산 데이터 외부 미전송' },
              { icon: '👤', title: '비회원 서비스', desc: '개인정보 수집 없음' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}