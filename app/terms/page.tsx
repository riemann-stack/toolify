import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관 | Youtil',
  description: 'Youtil 이용약관입니다.',
}

const LAST_UPDATED  = '2026년 4월 12일'
const SITE_NAME     = 'Youtil'
const CONTACT_EMAIL = 'contact@youtil.kr'

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        이용약관
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '48px' }}>
        최종 업데이트: {LAST_UPDATED}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontSize: '14px', lineHeight: '1.9', color: 'var(--muted)' }}>

        {/* 1 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제1조 (목적)
          </h2>
          <p>
            본 약관은 {SITE_NAME}(이하 「서비스」)이 제공하는 온라인 계산 도구 서비스의 이용과 관련하여
            서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제2조 (정의)
          </h2>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>「서비스」란 {SITE_NAME}이 제공하는 모든 온라인 계산 도구 및 관련 기능을 의미합니다.</li>
            <li>「이용자」란 본 약관에 동의하고 서비스를 이용하는 모든 사람을 의미합니다.</li>
            <li>「콘텐츠」란 서비스 내에 게시된 텍스트, 계산 결과, 디자인, 로고 등 일체의 자료를 의미합니다.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제3조 (약관의 효력 및 변경)
          </h2>
          <p style={{ marginBottom: '10px' }}>
            본 약관은 서비스를 이용하는 모든 이용자에게 적용됩니다.
            {SITE_NAME}은 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지 후 효력이 발생합니다.
          </p>
          <p>
            이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.
            변경 후에도 서비스를 계속 이용하면 약관에 동의한 것으로 간주합니다.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제4조 (서비스 이용)
          </h2>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>서비스는 별도의 회원가입 없이 무료로 이용할 수 있습니다.</li>
            <li>서비스는 인터넷 접속이 가능한 환경이라면 PC, 스마트폰 등 다양한 기기에서 이용할 수 있습니다.</li>
            <li>{SITE_NAME}은 서비스 개선을 위해 사전 고지 없이 기능을 변경하거나 중단할 수 있습니다.</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제5조 (이용자의 의무)
          </h2>
          <p style={{ marginBottom: '10px' }}>이용자는 서비스를 이용함에 있어 다음 행위를 하여서는 안 됩니다.</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>타인의 개인정보를 무단으로 수집하거나 이용하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위 (크롤링, DDoS 공격 등)</li>
            <li>서비스의 소스코드, 계산 로직 등을 무단으로 역분석하거나 복제하는 행위</li>
            <li>법령 또는 공공질서에 반하는 행위</li>
            <li>기타 {SITE_NAME}이 부적절하다고 판단하는 행위</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제6조 (서비스 중단)
          </h2>
          <p>
            {SITE_NAME}은 시스템 점검, 서버 장애, 천재지변 등의 사유로 서비스가 일시 중단될 수 있습니다.
            이로 인한 손해에 대해서는 별도의 보상을 하지 않으며, 가능한 경우 사전에 공지하겠습니다.
          </p>
        </section>

        {/* 7 — As-Is 보강 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제7조 (면책조항)
          </h2>
          <p style={{ marginBottom: '10px' }}>
            본 서비스는 <strong style={{ color: 'var(--text)' }}>「있는 그대로(As-Is)」</strong> 제공되며,
            특정 목적에 대한 적합성이나 무오류성을 보장하지 않습니다.
          </p>
          <p style={{ marginBottom: '10px' }}>
            {SITE_NAME}이 제공하는 계산 결과는 참고용이며, 실제 금융·법률·의료 결정에
            활용하기 전 반드시 전문가의 확인을 거치시기 바랍니다.
            계산 결과의 오류나 부정확성으로 인한 직접적·간접적 손해에 대해 {SITE_NAME}은 책임을 지지 않습니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid rgba(255,140,62,0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              ⚠️ 연봉 실수령액, 대출 이자, 4대보험 등 금융 계산 결과는 2026년 기준 공식 요율을 적용하였으나,
              개인별 상황(비과세 항목, 부양가족 수 등)에 따라 실제 수치와 차이가 있을 수 있습니다.
              중요한 재무 결정 시 반드시 해당 기관에 확인하시기 바랍니다.
            </p>
          </div>
        </section>

        {/* 8 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제8조 (광고)
          </h2>
          <p>
            {SITE_NAME}은 무료 서비스 운영을 위해 Google AdSense 등의 광고를 게재할 수 있습니다.
            광고 콘텐츠는 제3자가 제공하며, {SITE_NAME}은 광고 내용의 정확성이나 적법성에 대해 책임을 지지 않습니다.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제9조 (개인정보 보호)
          </h2>
          <p>
            이용자의 개인정보 보호에 관한 사항은{' '}
            <a href="/privacy" style={{ color: 'var(--accent)' }}>개인정보처리방침</a>에 따릅니다.
            개인정보처리방침은 본 약관의 일부를 구성합니다.
          </p>
        </section>

        {/* 10 — 신규: 저작권 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제10조 (저작권의 귀속)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid rgba(200,255,62,0.2)',
              borderRadius: '12px',
              padding: '16px 20px',
            }}>
              <p style={{ marginBottom: '10px' }}>
                <strong style={{ color: 'var(--text)' }}>1.</strong>{' '}
                {SITE_NAME}이 작성한 저작물에 대한 저작권 및 기타 지식재산권은 {SITE_NAME}에 귀속됩니다.
                여기에는 사이트의 디자인, 로고, UI 구성, 계산 로직, 작성된 텍스트 등 일체의 자산이 포함됩니다.
              </p>
              <p>
                <strong style={{ color: 'var(--text)' }}>2.</strong>{' '}
                이용자는 서비스를 이용함으로써 얻은 정보를 {SITE_NAME}의 사전 승낙 없이
                복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나
                제3자에게 이용하게 하여서는 안 됩니다.
              </p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              단, 개인적이고 비영리적인 목적으로 서비스 결과를 활용하는 것은 허용됩니다.
              상업적 이용 또는 대규모 스크래핑이 필요한 경우 아래 이메일로 사전에 문의해 주세요.
            </p>
          </div>
        </section>

        {/* 11 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제11조 (준거법 및 관할법원)
          </h2>
          <p>
            본 약관은 대한민국 법률에 따라 해석 및 적용되며,
            서비스 이용과 관련한 분쟁이 발생할 경우 대한민국 법원을 관할 법원으로 합니다.
          </p>
        </section>

        {/* 문의 */}
        <section>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px 20px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              약관에 대한 문의는{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>
                {CONTACT_EMAIL}
              </a>
              로 연락해 주세요.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}