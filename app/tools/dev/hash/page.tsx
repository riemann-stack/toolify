import Link from 'next/link'
import HashClient from './HashClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/hash',
  title: '해시 생성기 — MD5·SHA-1·SHA-256·SHA-512·HMAC + 파일 무결성',
  description: '텍스트·파일 해시 즉시 생성. MD5·SHA-1·SHA-256·SHA-512 동시 출력 + HMAC 서명(GitHub/Slack/AWS/JWT) + 파일 무결성 검증 + SRI 해시. 안전성 등급 표시 + 보안 경고 4탭. 모든 계산 브라우저 측.',
  keywords: [
    '해시 생성기', 'MD5 변환', 'SHA256 생성', 'SHA-256', 'SHA-512',
    'HMAC', 'HMAC-SHA256', 'HMAC 서명',
    '파일 해시', '체크섬', 'checksum',
    'SRI 해시', 'integrity 해시', 'subresource integrity',
    '무결성 확인', '파일 무결성', 'GitHub 웹훅 서명', 'Slack 서명',
    'AWS Signature V4', 'JWT 서명', 'JWT HS256',
    'hex base64 해시', '해시 충돌', '해시 알고리즘',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
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
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

export default function HashPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔒 해시 생성기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        텍스트·파일 해시 즉시 생성. <strong style={{ color: 'var(--text)' }}>MD5 · SHA-1 · SHA-256 · SHA-512</strong> 동시 출력 +{' '}
        <strong style={{ color: 'var(--text)' }}>HMAC 서명</strong>(GitHub/Slack/AWS/JWT) + 파일 무결성 검증 + SRI 해시.
        모든 계산이 브라우저에서 수행되어 데이터가 외부로 전송되지 않습니다.
      </p>

      {/* 강한 면책 */}
      <div style={{
        background: 'rgba(255, 62, 140, 0.06)',
        border: '2px solid #FF3E8C',
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          🚨 <strong style={{ color: '#FF3E8C' }}>중요</strong> — <strong>MD5와 SHA-1은 충돌 공격이 발견</strong>되어 비밀번호 해싱·디지털 서명·SSL 인증서에 사용 금지입니다.
          <strong> 파일 무결성 확인(체크섬) 용도로만</strong> 사용하세요.
          비밀번호는 반드시 <strong>bcrypt·scrypt·Argon2</strong>(서버 측)를 사용하세요.
          본 도구는 모든 계산이 브라우저에서 수행되며, 입력 데이터는 외부로 전송되지 않습니다.
          분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <HashClient />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 텍스트</strong> — 텍스트 입력 → MD5/SHA-1/SHA-256/SHA-512 4개 알고리즘 동시 출력 (디바운스 200ms 자동 재계산) + 안전성 배지</li>
          <li><strong>탭 2 파일</strong> — 드래그앤드롭 또는 파일 선택 → 4 알고리즘 자동 계산 + 진행률 + 예상 해시와 자동 비교(무결성 검증)</li>
          <li><strong>탭 3 HMAC</strong> — Secret Key + Message → HMAC-SHA1/256/384/512 서명 생성 + GitHub/Slack/AWS/JWT 시나리오 프리셋</li>
          <li><strong>탭 4 가이드</strong> — 알고리즘 비교·안전성 등급·SRI 사용법·CLI 명령 대조</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 옵션값(인코딩·출력 형식·HMAC 알고리즘 등)은 자동 저장되지만, <strong>입력 텍스트·Secret Key는 보안을 위해 저장하지 않습니다</strong>.
        </p>
      </div>

      {/* 2. 알고리즘 비교 표 */}
      <h2 style={sectionTitle}>🧮 해시 알고리즘 비교</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          본 도구가 지원하는 5개 해시 알고리즘 비교. <strong>SHA-256이 현재 가장 권장</strong>되는 표준입니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 540 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>알고리즘</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>출력</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>안전성</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>용도</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['MD5',     '128bit / 32자',  '🟡 무결성 전용 (2004 충돌)',     '체크섬, 캐시 키'],
                ['SHA-1',   '160bit / 40자',  '🟡 무결성 전용 (2017 충돌)',     'Git, 레거시 호환'],
                ['SHA-256', '256bit / 64자',  '🟢 안전 (권장 표준)',           'HTTPS, JWT, SRI, 블록체인'],
                ['SHA-384', '384bit / 96자',  '🟢 안전',                       'SRI, 고보안'],
                ['SHA-512', '512bit / 128자', '🟢 안전 (64bit 시스템 빠름)',    '금융, 정부, 고보안 서명'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: '#C8FF3E', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontSize: 12.5 }}>{row[2]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)', fontSize: 12.5 }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⓘ 본 도구는 RFC 1321 (MD5)·NIST FIPS 180-4 (SHA-2) 표준을 준수합니다. 모든 결과는 같은 입력에 대해 <code style={{ background: 'var(--bg3)', padding: '2px 4px', borderRadius: 3 }}>md5sum</code>·<code style={{ background: 'var(--bg3)', padding: '2px 4px', borderRadius: 3 }}>shasum</code> CLI 명령과 100% 일치합니다.
        </p>
      </div>

      {/* 3. 안전성 등급 — 빨간 박스 */}
      <h2 style={sectionTitle}>🚨 안전성 등급 — 무엇에 써야 / 쓰지 말아야</h2>
      <div style={{
        background: 'rgba(255, 62, 140, 0.06)',
        border: '2px solid #FF3E8C',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '14px',
      }}>
        <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 12px' }}>
          ❌ <strong style={{ color: '#FF3E8C' }}>MD5 · SHA-1을 절대 사용하면 안 되는 곳</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: 22, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.95 }}>
          <li><strong>비밀번호 해싱</strong> — 무지개 표(rainbow table)로 즉시 깨짐. 반드시 <strong>bcrypt·scrypt·Argon2</strong>(KDF, 서버 측)</li>
          <li><strong>디지털 서명</strong> — 충돌 공격으로 위변조 가능. SHA-256 + RSA/ECDSA</li>
          <li><strong>SSL/TLS 인증서</strong> — CA Browser Forum 표준 SHA-256 이상 (모든 브라우저 SHA-1 인증서 차단)</li>
          <li><strong>JWT 서명</strong> — 최소 HMAC-SHA256 (HS256). HS1은 부적합</li>
          <li><strong>코드 사이닝·소프트웨어 배포</strong> — Microsoft·Apple 모두 SHA-256 이상 의무화</li>
        </ul>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '12px 0 0', lineHeight: 1.7, fontStyle: 'italic' }}>
          📅 <strong>알려진 충돌 공격</strong>: MD5 (2004, Wang et al.), SHA-1 SHAttered (2017.02 Google·CWI), SHA-1 chosen-prefix (2020.01)
        </p>
      </div>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 12px' }}>
          ✅ <strong style={{ color: '#3EFFD0' }}>MD5 · SHA-1을 사용해도 되는 곳 (무결성 전용)</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: 22, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.95 }}>
          <li><strong>파일 체크섬</strong> — Linux ISO·소프트웨어 다운로드 무결성 (충돌 위험 ↔ 손상 검출은 OK)</li>
          <li><strong>중복 파일 검출</strong> — 같은 콘텐츠 빠르게 식별 (deduplication)</li>
          <li><strong>캐시 키·CDN 무효화</strong> — 콘텐츠 변경 감지용 식별자</li>
          <li><strong>Git 커밋 ID</strong> — Git이 SHA-1 사용 (점진적 SHA-256 전환 중)</li>
          <li><strong>레거시 시스템 호환성</strong> — 외부 시스템이 MD5/SHA-1만 지원할 때</li>
        </ul>
      </div>

      {/* 4. HMAC 사용 시나리오 */}
      <h2 style={sectionTitle}>🔑 HMAC 사용 시나리오 — 웹훅·API·JWT</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          HMAC은 <strong>비밀키 + 메시지</strong>를 합쳐 만드는 메시지 인증 코드(MAC)입니다.
          단순 해시와 달리 <strong>키를 모르면 위조 불가능</strong>해 API 인증·웹훅 검증에 표준으로 쓰입니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>서비스</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>알고리즘 · 형식</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>전송 위치</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['🐙 GitHub Webhook', 'HMAC-SHA256, hex',     'X-Hub-Signature-256 헤더'],
                ['💬 Slack Signing',  'HMAC-SHA256, hex',     'X-Slack-Signature 헤더'],
                ['☁️ AWS Sig V4',      'HMAC-SHA256, hex',     'Authorization 헤더 (4단계 KDF)'],
                ['🎫 JWT HS256',      'HMAC-SHA256, Base64URL', 'JWT 토큰 마지막 부분'],
                ['🎫 JWT HS512',      'HMAC-SHA512, Base64URL', 'JWT 토큰 마지막 부분'],
                ['💸 결제 PG (PayPal·Stripe)', 'HMAC-SHA256, hex', 'PAYPAL-TRANSMISSION-SIG 등'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: '#C8FF3E', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: 12.5 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--muted)', fontSize: 12.5 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ⓘ <strong>HMAC-SHA256이 사실상 현대 표준</strong>입니다. 본 도구의 [🔑 HMAC] 탭에서 시나리오 카드를 클릭하면 알고리즘·형식이 자동 설정됩니다.
        </p>
      </div>

      {/* 5. 파일 무결성 검증 가이드 */}
      <h2 style={sectionTitle}>📥 파일 무결성 검증 가이드 (CLI 비교)</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          ISO·설치 파일을 다운로드 후 무결성을 확인하는 표준 절차입니다. 본 도구의 결과는 아래 CLI 명령과 정확히 동일합니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>알고리즘</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>macOS / Linux</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>Windows</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['MD5',     'md5sum file (Linux) / md5 file (macOS)', 'certutil -hashfile FILE MD5'],
                ['SHA-1',   'shasum -a 1 file',                        'certutil -hashfile FILE SHA1'],
                ['SHA-256', 'shasum -a 256 file',                      'certutil -hashfile FILE SHA256'],
                ['SHA-512', 'shasum -a 512 file',                      'certutil -hashfile FILE SHA512'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: '#C8FF3E', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong>본 도구의 [📁 파일] 탭</strong>에 파일을 드래그하고 공식 사이트가 제공한 SHA256SUMS 값을 &quot;예상 해시&quot;에 붙여넣으면 자동으로 ✅/❌ 비교됩니다.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. MD5는 안전한가요?</summary>
        <p style={faqAnswer}>
          <strong>아니요. 보안 용도로는 절대 안 됩니다.</strong> 2004년 Wang 등이 MD5 충돌 공격을 발표한 이후 비밀번호 해싱·디지털 서명·SSL 인증서 등 보안 용도로 사용이 금지됐습니다.
          단, <strong>파일 무결성(체크섬)·중복 검출·캐시 키 등 비보안 용도</strong>로는 여전히 사용 가능합니다.
          비밀번호는 반드시 bcrypt·scrypt·Argon2 같은 KDF를 서버 측에서 사용해야 합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. SHA-1은 사용해도 되나요?</summary>
        <p style={faqAnswer}>
          <strong>보안 목적으로는 사용 금지</strong>입니다. 2017년 Google이 SHAttered 공격으로 SHA-1 충돌을 시연했고, 2020년에는 더 강력한 chosen-prefix 충돌까지 가능해졌습니다.
          모든 주요 브라우저(Chrome·Firefox·Safari·Edge)가 SHA-1 SSL 인증서를 차단합니다.<br />
          <strong>예외</strong>: Git 커밋 ID(점진적 SHA-256 전환 중), 레거시 호환, HMAC-SHA1(키가 비밀이면 충돌 공격 무관) 정도만 허용.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 비밀번호를 SHA-256으로 해싱하면 안 되나요?</summary>
        <p style={faqAnswer}>
          <strong>안 됩니다. SHA 계열 단순 해싱은 비밀번호에 부적합합니다.</strong><br />
          이유: ① <strong>너무 빠름</strong> → GPU로 초당 수십억 시도 가능 → 무지개 표·brute force에 취약. ② <strong>솔트 자동 처리 X</strong> → 같은 비밀번호는 같은 해시 → 사용자 간 공유 비밀번호 노출.<br />
          <strong>올바른 비밀번호 해싱</strong>:<br />
          • <strong>bcrypt</strong> — 가장 널리 쓰임 (BCrypt.NET, password_hash() in PHP)<br />
          • <strong>scrypt</strong> — 메모리도 많이 씀 (ASIC 저항)<br />
          • <strong>Argon2</strong> — 2015 PHC 우승, 현 권장 표준 (Argon2id)<br />
          모두 <strong>서버 측에서</strong> 처리해야 하며, 클라이언트(브라우저)에서 비밀번호 해싱은 의미 없습니다 (서버는 해시도 비밀로 받아야 함).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. HMAC과 일반 해시의 차이는?</summary>
        <p style={faqAnswer}>
          <strong>HMAC(Hash-based MAC)</strong>은 비밀키 + 메시지를 함께 해싱해 생성하는 메시지 인증 코드입니다.<br />
          • <strong>일반 해시 (SHA-256 등)</strong>: 누구나 메시지만 알면 같은 해시 생성 가능 → 위조 가능<br />
          • <strong>HMAC-SHA256</strong>: 키를 모르면 같은 해시 생성 불가능 → <strong>메시지 위변조 검출</strong> 가능<br />
          공식: <code style={{ background: 'var(--bg3)', padding: '2px 4px', borderRadius: 3 }}>HMAC(key, msg) = H((key⊕opad) ‖ H((key⊕ipad) ‖ msg))</code> (RFC 2104)<br />
          GitHub 웹훅, Slack, AWS Signature V4, JWT HS256 모두 HMAC-SHA256 사용. 본 도구의 [🔑 HMAC] 탭에서 4개 시나리오 프리셋 제공.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 파일 해시가 다른 사이트와 다른 값이 나와요</summary>
        <p style={faqAnswer}>
          가장 흔한 원인은 <strong>줄바꿈(newline) 차이</strong>입니다. Windows(CRLF)와 macOS/Linux(LF)는 같은 텍스트 파일이라도 바이트가 달라 해시가 달라집니다.<br />
          그 외 원인: ① 파일이 다운로드 중 손상, ② 메타데이터·BOM 포함 여부, ③ ZIP 압축 해제 시 시간 정보 변경, ④ 다른 알고리즘으로 계산<br />
          확인 방법: <strong>같은 OS에서 같은 알고리즘으로 다시 계산</strong>해 보세요. 본 도구의 결과는 macOS/Linux의 <code>shasum</code>·<code>md5sum</code>과 100% 일치합니다 (UTF-8 기준).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 큰 파일도 해시 가능한가요?</summary>
        <p style={faqAnswer}>
          가능합니다. 본 도구는 <strong>최대 1~2GB</strong>까지 브라우저 메모리 한도 내에서 처리 가능 (기기 RAM 의존).<br />
          • <strong>SHA-1/256/512</strong>: Web Crypto API로 한 번에 계산 — 빠름<br />
          • <strong>MD5</strong>: 8MB 청크 단위 스트리밍 처리 (RFC 1321 inline 구현) — 느리지만 매우 큰 파일도 가능<br />
          100MB 초과 시 <strong>메모리 사용량·시간 경고</strong>가 표시됩니다. 수 GB 파일은 CLI(`shasum -a 256 file.iso`) 사용을 권장합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. SRI 해시(integrity)는 어떻게 만드나요?</summary>
        <p style={faqAnswer}>
          SRI(Subresource Integrity)는 CDN에서 로드되는 외부 스크립트가 변조되지 않았는지 검증하는 W3C 표준입니다.<br />
          <strong>생성 방법</strong>: 본 도구의 [📝 텍스트] 또는 [📁 파일] 탭에서 <strong>SHA-384</strong> + <strong>Base64</strong> 출력을 사용 (또는 SHA-256/512).<br />
          <strong>HTML 사용</strong>:
          <br /><code style={{ background: 'var(--bg3)', padding: '4px 6px', borderRadius: 3, display: 'block', marginTop: 6, fontSize: 11.5 }}>
            &lt;script src=&quot;...&quot; integrity=&quot;sha384-Base64결과&quot; crossorigin=&quot;anonymous&quot;&gt;&lt;/script&gt;
          </code>
          jsDelivr·cdnjs는 자동 생성 SRI를 제공합니다. 자체 호스팅 시 본 도구로 생성 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. Base64와 hex 형식 어떻게 선택?</summary>
        <p style={faqAnswer}>
          <strong>hex</strong> (16진): 일반적·가독성 ↑·길이 2배. 대부분 CLI·로그·검증용 표준.<br />
          <strong>Base64</strong>: 짧음(약 33% 압축)·HTTP 헤더·이메일 친화. SRI <code style={{ background: 'var(--bg3)', padding: '2px 4px' }}>integrity=</code> 속성, JWT 등에 사용.<br />
          <strong>Base64URL</strong>: <code>+</code>→<code>-</code>, <code>/</code>→<code>_</code>, 패딩(<code>=</code>) 제거. URL·파일명·JWT(헤더·페이로드·서명)에 안전.<br />
          용도별 권장:<br />
          • 파일 체크섬·CLI 비교 → <strong>hex</strong><br />
          • SRI integrity 속성 → <strong>Base64</strong> (또는 Base64URL)<br />
          • JWT 서명 → <strong>Base64URL</strong> (RFC 7515)<br />
          • API 헤더 (대부분 GitHub/Slack 등) → <strong>hex</strong>
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 본 도구는 입력 데이터를 서버에 보내나요?</summary>
        <p style={faqAnswer}>
          <strong>아니요. 모든 계산이 브라우저(클라이언트)에서 수행됩니다.</strong><br />
          • MD5: 순수 JavaScript로 inline 구현 (외부 라이브러리·서버 호출 없음)<br />
          • SHA-1/256/512: 브라우저 Web Crypto API (네이티브)<br />
          • HMAC: Web Crypto API<br />
          • 파일: <code style={{ background: 'var(--bg3)', padding: '2px 4px' }}>FileReader</code>로 메모리 내 처리, 업로드 없음<br />
          또한 <strong>입력 텍스트·Secret Key·파일은 localStorage에도 저장하지 않습니다</strong> (옵션값만 저장).
          공용 PC 사용 후 브라우저 탭을 닫으면 모든 데이터가 즉시 사라집니다. 추가 안전을 원하면 시크릿 모드·DevTools로 메모리 정리 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 해시 충돌(collision)이란 무엇인가요?</summary>
        <p style={faqAnswer}>
          서로 다른 두 입력이 <strong>같은 해시값</strong>을 만드는 현상입니다. 해시 함수는 입력은 무한·출력은 유한이라 이론적으로 충돌은 항상 존재해요.<br />
          <strong>안전한 해시</strong>는 <strong>찾기가 사실상 불가능</strong>해야 합니다(비둘기 집 원리 + 출력 공간이 매우 큼).<br />
          • <strong>MD5 충돌</strong> (2004): 약 2^18 시도로 충돌 가능 → 디지털 서명 위조 가능<br />
          • <strong>SHA-1 SHAttered</strong> (2017): Google이 100시간 GPU 작업으로 같은 SHA-1 두 PDF 시연<br />
          • <strong>SHA-256</strong>: 2^128 시도 필요 → 우주 수명보다 긺 → 안전<br />
          충돌 위험이 있어도 <strong>무결성 확인(체크섬)</strong>은 OK — 우연한 손상은 충돌과 무관, 의도적 변조 위험만 문제.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>🔗 함께 보면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/base64" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔐</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>Base64 인코더/디코더</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            텍스트·파일 ↔ Base64
          </p>
        </Link>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📋</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성 검사
          </p>
        </Link>
        <Link href="/tools/dev/number-base" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔢</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>진법 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            2·8·10·16진 + 비트 연산
          </p>
        </Link>
      </div>
    </div>
  )
}
