import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관 | Youtil',
  description: 'Youtil 이용약관입니다.',
}

const LAST_UPDATED = '2026년 4월 9일'
const SITE_NAME = 'Youtil'
const SITE_URL = 'https://youtil-delta.vercel.app'
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

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제1조 (목적)
          </h2>
          <p>
            본 약관은 {SITE_NAME}(이하 서비스)이 {SITE_URL}에서 제공하는 온라인 도구 서비스의
            이용 조건 및 절차, 이용자와 서비스 간의 권리·의무를 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제2조 (서비스 제공)
          </h2>
          <p style={{ marginBottom: '12px' }}>
            {SITE_NAME}은 다음과 같은 서비스를 무료로 제공합니다.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>각종 계산기 (연봉, 대출, BMI, 기초대사량 등)</li>
            <li>단위 변환 도구 (길이, 무게, 넓이 등)</li>
            <li>날짜·시간 계산 도구</li>
            <li>텍스트 유틸리티 도구</li>
            <li>생활 편의 도구 (로또 번호 생성기 등)</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제3조 (계산 결과의 정확성)
          </h2>
          <p>
            {SITE_NAME}의 계산 도구는 참고용으로만 사용하시기 바랍니다.
            세금, 보험료 등 중요한 사안은 반드시 관련 기관 또는 전문가에게 확인하시기 바랍니다.
            계산 결과로 인한 손해에 대해 {SITE_NAME}은 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제4조 (이용자 의무)
          </h2>
          <p style={{ marginBottom: '12px' }}>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>자동화된 방법으로 서비스를 과도하게 이용하는 행위</li>
            <li>타인의 권리를 침해하는 행위</li>
            <li>관련 법령을 위반하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제5조 (광고)
          </h2>
          <p>
            {SITE_NAME}은 Google AdSense를 통한 광고를 게재할 수 있습니다.
            광고 내용에 대한 책임은 광고주에게 있으며, {SITE_NAME}은 광고 내용에 대해 보증하지 않습니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제6조 (서비스 변경 및 중단)
          </h2>
          <p>
            {SITE_NAME}은 서비스 내용을 변경하거나 중단할 수 있으며, 이에 대해 이용자에게
            별도의 보상을 제공하지 않습니다. 중요한 변경 사항은 사이트를 통해 공지합니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제7조 (면책조항)
          </h2>
          <p>
            {SITE_NAME}은 천재지변, 서버 장애, 기타 불가항력으로 인한 서비스 중단에 대해
            책임을 지지 않습니다. 또한 이용자가 서비스를 통해 얻은 정보를 활용하여
            발생한 손해에 대해 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제8조 (준거법 및 관할)
          </h2>
          <p>
            본 약관은 대한민국 법령에 따라 해석되며, 분쟁 발생 시 대한민국 법원을 관할로 합니다.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            제9조 (문의)
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p>서비스명: {SITE_NAME}</p>
            <p style={{ marginTop: '6px' }}>이메일: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a></p>
          </div>
        </section>

      </div>
    </div>
  )
}