import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/privacy',
  title: '개인정보처리방침',
  description: 'Youtil 개인정보처리방침입니다.',
})

const LAST_UPDATED  = '2026년 5월 24일'
const SITE_NAME     = 'Youtil'
const SITE_URL      = 'https://youtil.kr'
const CONTACT_EMAIL = 'contact@youtil.kr'

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        개인정보처리방침
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '48px' }}>
        최종 업데이트: {LAST_UPDATED}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontSize: '14px', lineHeight: '1.9', color: 'var(--muted)' }}>

        {/* 1 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
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
            <li>쿠키(Cookie) 및 방문 기록 (Google Analytics, Google AdSense)</li>
            <li>웹 비콘(Web Beacon)·픽셀 태그 등 추적 기술</li>
            <li>광고 식별자 및 기타 기기 식별자</li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            위 정보는 Google Analytics·Google AdSense 등 제3자 서비스가 쿠키, 웹 비콘, IP 주소,
            기타 식별자를 통해 자동으로 수집·처리할 수 있습니다. {SITE_NAME}은 이러한 정보를
            이용자 개인을 직접 식별하는 용도로 수집하지 않습니다.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            4. 쿠키(Cookie) 정책
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 Google Analytics 및 Google AdSense를 통해 쿠키와 더불어
            <strong style={{ color: 'var(--text)' }}> 웹 비콘(Web Beacon)·픽셀 태그·IP 주소·광고 식별자 등 기타 식별자</strong>를
            사용할 수 있습니다. 쿠키는 이용자의 브라우저에 저장되는 소량의 데이터이며, 웹 비콘은
            페이지·광고의 열람 여부를 측정하는 기술입니다. 이들은 서비스 이용 패턴 분석 및
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
            border: '1px solid rgba(14,165,233,0.2)',
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            6. 보유 및 이용 기간
          </h2>
          <p>
            자동 수집된 접속 로그는 최대 6개월간 보관 후 파기됩니다.
            관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            7. 이용자의 권리
          </h2>
          <p>
            이용자는 언제든지 개인정보 열람, 정정, 삭제를 요청할 수 있습니다.
            요청은 아래 이메일로 연락해 주시면 신속히 처리하겠습니다.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
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
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
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

        {/* 11 — 신규: 입력값(건강·재무 등 민감정보) 처리 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            11. 계산기 입력값(건강·재무 등 민감정보) 처리
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}의 계산기·도구에 입력하시는 값(예: 체중·키·생리주기 등 건강 정보,
            소득·대출·자산 등 재무 정보)은 <strong style={{ color: 'var(--text)' }}>민감한 정보로 취급</strong>되며,
            아래 원칙에 따라 처리됩니다.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong style={{ color: 'var(--text)' }}>서버로 전송되지 않습니다.</strong>{' '}
              모든 계산은 이용자의 브라우저 내부(클라이언트)에서만 이루어지며, 입력값이 {SITE_NAME}의
              서버나 외부로 전송·저장되지 않습니다.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>Google Analytics 등 분석 이벤트에 입력값이 포함되지 않습니다.</strong>{' '}
              방문·이용 통계만 수집하며, 이용자가 입력한 구체적 수치는 분석 이벤트에 담기지 않습니다.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>URL 주소(파라미터)에 입력값을 저장하지 않습니다.</strong>{' '}
              입력값이 주소창에 노출되거나 링크 공유를 통해 외부로 새어 나가지 않습니다.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>광고 타기팅에 입력값을 사용하지 않습니다.</strong>{' '}
              건강·재무 입력값은 Google AdSense를 포함한 어떤 광고의 타기팅·맞춤화에도 활용되지 않습니다.
            </li>
            <li>
              <strong style={{ color: 'var(--text)' }}>일부 도구는 편의를 위해 입력값을 본인 브라우저에만 저장</strong>합니다.{' '}
              (예: 생리주기 기록 등은 브라우저의 로컬 저장소(localStorage)에 저장되며, 다른 기기와
              동기화되지 않고 서버로 전송되지 않습니다.)
            </li>
          </ul>

          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginTop: '16px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '8px' }}>
              브라우저에 저장된 데이터 삭제 방법
            </p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <li>각 도구 내 「전체 삭제」·「초기화」 버튼이 있는 경우 클릭하면 즉시 삭제됩니다.</li>
              <li>
                브라우저 설정에서 직접 삭제할 수도 있습니다 —{' '}
                <span style={{ color: 'var(--text)' }}>설정 → 개인정보 및 보안 → 인터넷 사용 기록(쿠키·사이트 데이터) 삭제</span>.
              </li>
              <li>해당 사이트 데이터만 지우려면 주소창의 자물쇠(🔒) 아이콘 → 사이트 설정 → 데이터 삭제를 이용하세요.</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  )
}