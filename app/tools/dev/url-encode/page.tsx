import Link from 'next/link'
import UrlEncodeClient from './UrlEncodeClient'
import { buildMetadata } from '@/lib/seo'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/dev/url-encode',
  title: 'URL 인코더/디코더 — encodeURIComponent + 쿼리 편집기 + UTM·네이버·카카오 추적 정리',
  description: 'URL 인코드/디코드(encodeURIComponent·encodeURI) + URL 분해와 쿼리 파라미터 표 편집. UTM·fbclid·네이버·카카오·쿠팡 추적 정리.',
  keywords: [
    'URL 인코드', 'URL 디코드', 'URL encoder', 'URL decoder',
    'encodeURIComponent', 'encodeURI', 'decodeURIComponent',
    '쿼리스트링', '쿼리 파라미터', 'query string',
    'utm 제거', 'utm 파라미터', '추적 파라미터 제거', 'tracking 제거',
    '네이버 검색 URL', 'n_media', 'n_query', '네이버 추적',
    '카카오 추적', '쿠팡 추적', 'fbclid', 'gclid',
    '한글 URL 인코딩', 'percent encoding', 'percent encode',
    'URL 분해', 'URL 파싱', 'OAuth state',
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
const codeStyle: React.CSSProperties = {
  background: 'var(--bg3)',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12.5px',
  color: '#0EA5E9',
}

const FAQ_LD = [
  { "q":"encodeURIComponent와 encodeURI 차이?","a":"encodeURIComponent는 거의 모든 특수문자를 인코드합니다 (:·/·?·#·@·&·= 포함). encodeURI는 URL 구조 문자(스킴·구분자)를 보존합니다. 실용 룰: • 쿼리 값·경로 세그먼트 → encodeURIComponent (안전) • 전체 URL 한 번에 → encodeURI 예: encodeURIComponent(\"a&b\") = a%26b (쿼리 값으로 안전), encodeURI(\"a&b\") = a&b (그대로 — 쿼리 키와 충돌 위험). 의심스러우면 항상 encodeURIComponent." },
  { "q":"escape()는 왜 쓰면 안 되나요?","a":"1990년대 옛 함수로 deprecated 됐습니다 (ECMAScript 표준에서 Annex B로 분류 — 호환성용만). 문제점: • Unicode 부정확: BMP 외 문자(이모지) 처리 못함 • %uXXXX 형식: 표준 URL %XX 인코딩이 아닌 자바스크립트 전용 형식 → 서버에서 디코드 실패 • 한글 깨짐: ISO-8859-1 가정 → UTF-8 한글 처리 불가 반드시 encodeURIComponent 또는 encodeURI 사용. 본 도구는 escape()를 지원하지 않습니다." },
  { "q":"한글 1글자가 왜 %XX %XX %XX (3개)인가요?","a":"UTF-8 인코딩 때문입니다. URL은 ASCII 문자만 직접 사용 가능하므로, 비-ASCII 문자는 UTF-8 바이트로 변환됩니다. • 한글 (BMP, U+AC00 ~ U+D7A3): UTF-8에서 3 bytes → URL %XX %XX %XX • 이모지 (Supplementary Plane, U+1F000+): UTF-8에서 4 bytes → URL %XX %XX %XX %XX • 한자: BMP 내 한자는 3 bytes 예: 한(U+D55C) → UTF-8 0xED 0x95 0x9C → URL %ED%95%9C. 본 도구의 한글 분석 박스에서 글자별 변환 과정을 시각화합니다." },
  { "q":"+ 기호는 공백인가요? %20인가요?","a":"둘 다 공백이지만 사용 컨텍스트가 다릅니다. • RFC 3986 (표준 URL): 공백 = %20. +는 그냥 + 문자 • application/x-www-form-urlencoded (HTML 폼): 공백 = +. %20도 공백으로 디코드 실제 동작: • encodeURIComponent(\" \") = %20 (RFC 3986) • new URLSearchParams({``}).toString() = a=+ (form 변형) • 디코드 시 양쪽 모두 공백으로 인식 혼용 주의: 같은 URL에 %20과 + 섞이면 문제. 한 가지로 통일 권장. 본 도구는 %20 (encodeURIComponent) 출력." },
  { "q":"이중 인코딩(%2520)이 발생하는 이유?","a":"이미 인코딩된 값을 또 인코딩했기 때문입니다. 1단계: 공백 → %20 (정상) 2단계: %20의 % → %25 → 결과 %2520! 발생 시나리오: • 백엔드에서 디코드된 값을 받아 다시 인코드하면서 변환 • 프론트엔드에서 이미 인코딩된 URL을 또 encodeURIComponent 호출 • OAuth redirect_uri 등에서 중첩 escape 해결: 본 도구의 탭 1 디코드 + 반복 디코드 옵션으로 한 번에 풀기 (최대 5회). 코드에서는 인코드/디코드 횟수를 명확히 추적해야 합니다." },
  { "q":"UTM 파라미터 제거해도 되나요?","a":"네, 일반적으로 안전합니다. UTM은 Google Analytics 추적용이며 페이지 콘텐츠에 영향을 주지 않습니다. • utm_source, utm_medium, utm_campaign 등은 분석 데이터일 뿐 • 제거해도 페이지는 정상 작동 • 깔끔한 URL 공유에 유리 (블로그·SNS·문서) 예외 주의: • 일부 사이트가 UTM으로 다국어·캠페인 페이지 분기 (드물지만 가능) • 광고주 입장에서는 추적 데이터가 사라지므로 본인 광고 클릭은 유지 권장 • OAuth state·CSRF 토큰처럼 보안 토큰은 절대 제거 X (본 도구는 추적이 아닌 키는 손대지 않음)" },
  { "q":"네이버 n_media 같은 파라미터는?","a":"네이버 검색·쇼핑·검색광고 추적 파라미터입니다. • n_media: 광고 매체 (예: cpc=검색광고) • n_query: 검색어 • n_keyword: 키워드 ID • n_rank: 검색 결과 순위 • n_ad_group·n_ad: 광고 그룹·광고 ID • n_campaign_type: 캠페인 유형 UTM과 동일하게 제거해도 페이지 작동에 영향 없음. 깔끔한 공유 URL을 만들 때 유용합니다. 본 도구의 네이버 그룹에서 일괄 제거 가능." },
  { "q":"URL 길이 제한은 얼마인가요?","a":"공식 표준에는 길이 제한이 없지만, 실용적 제한이 존재합니다: • 브라우저: Chrome/Firefox/Safari 대부분 ~32,000자 처리, 일부 구형 IE는 2,083자 • 웹 서버: Nginx 기본 8,192자, Apache 8,190자, IIS 16,384자 • 안전권장: 2,000자 이하 (모든 환경 호환) • SEO: 짧을수록 좋음 (~75자 권장) 한글 주의: 한글 1글자가 URL에서 9자(%ED%95%9C)를 차지하므로, 짧은 한국어 텍스트도 URL에서는 빨리 길어집니다. 긴 데이터는 POST body나 JSON 토큰으로 전달 권장." },
  { "q":"OAuth state·redirect_uri 디코드?","a":"OAuth 콜백 URL 디버깅에 본 도구가 매우 유용합니다. • state: CSRF 방지 토큰 (랜덤 문자열, 디코드해서 검증) • redirect_uri: 콜백 URL (이중 인코딩 자주 발생) • code: 인증 코드 (단발성, 1회 사용) • access_token: 액세스 토큰 (보안 민감!) ⚠️ 보안 주의: 1. access_token·refresh_token·session_id 디코드는 OK, 공유·수정은 절대 X (계정 탈취 위험) 2. state 토큰을 임의로 수정하면 CSRF 검증 실패 → 인증 오류 3. 공용 PC에서 사용 후 브라우저 캐시·localStorage 정리 (본 도구의 입력은 localStorage에 저장됨) 본 도구는 모든 처리가 클라이언트 측이라 외부 전송 없음." },
  { "q":"본 도구는 입력 데이터를 서버에 보내나요?","a":"아니요. 모든 처리가 브라우저(클라이언트)에서 수행됩니다. • 인코드/디코드: Native Web API (encodeURIComponent·decodeURIComponent·URL·URLSearchParams) • 한글 분석: TextEncoder 브라우저 내장 • 외부 라이브러리·서버 호출 0개 • Network 탭 확인: 변환 시 어떤 fetch/XHR도 발생하지 않음 • 다운로드: Blob URL로 브라우저 내 처리 • 입력은 localStorage에 저장(편의), 외부 전송 없음 다만: 공용 PC·공유 기기에서 OAuth 토큰·세션 ID·access_token 등을 다룬 경우 사용 후 정리하세요. DevTools → Application → Local Storage에서 youtil_url_encode_v1 키 삭제 가능." }
]

export default function UrlEncodePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔗 URL 인코더/디코더
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        URL 인코드/디코드 + URL 분해와 쿼리 파라미터 표 편집. <strong style={{ color: 'var(--text)' }}>UTM·추적 파라미터 일괄 정리</strong>.
      </p>

      {/* 면책 박스 */}
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '1px solid rgba(255, 138, 62, 0.40)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '12.5px', color: 'var(--text)', lineHeight: 1.75, margin: 0 }}>
          ⚠️ 본 도구의 인코드·디코드·파싱은 모두 <strong>브라우저에서 실행</strong>되며 입력 URL·데이터는 외부로 전송되지 않습니다.
          추적 파라미터 정리 결과는 일반적인 광고 추적 제거이며, <strong>일부 합법적 기능</strong>(다국어 분기·캠페인 식별)도 함께 제거될 수 있으니 검토 후 사용하세요.
          OAuth state·CSRF 토큰 등 <strong>보안 관련 파라미터를 무단 수정·공유하지 마세요</strong>. 입력 100KB 제한.
          분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <UrlEncodeClient />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 인코드/디코드</strong> — 자동 감지(%XX 있으면 디코드) + encodeURIComponent/encodeURI 선택 + 반복 디코드 + 한글 UTF-8 bytes 분해 표</li>
          <li><strong>탭 2 URL 분해·편집</strong> — URL 자동 분해 (scheme/host/path/query/fragment 7개) + 쿼리 파라미터 표 편집기 + URL 즉시 재구성</li>
          <li><strong>탭 3 추적 정리</strong> — 7 그룹 50+ 파라미터 자동 감지 (UTM·fbclid·네이버·카카오·쿠팡·Bing·기타) + 그룹별 또는 개별 체크박스 제거</li>
          <li><strong>탭 4 가이드</strong> — encodeURIComponent vs encodeURI 비교 + RFC 3986 + UTF-8 인코딩 + 흔한 실수 + 추적 사전</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 입력·옵션은 모두 자동 저장됩니다. 200ms 디바운스로 입력 변화 시 즉시 재계산.
        </p>
      </div>

      {/* 2. encodeURIComponent vs encodeURI 비교 */}
      <h2 style={sectionTitle}>🔧 encodeURIComponent vs encodeURI 비교</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          가장 흔한 혼동입니다. <strong>쿼리 값엔 encodeURIComponent, 전체 URL엔 encodeURI</strong>가 원칙입니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>함수</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>인코드 안 하는 문자</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>사용처</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 10px' }}><code style={codeStyle}>encodeURIComponent</code></td>
                <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>A-Z a-z 0-9 - _ . ! ~ * &apos; ( )</td>
                <td style={{ padding: '8px 10px', color: 'var(--text)' }}>쿼리 값·경로 세그먼트 (권장)</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px' }}><code style={codeStyle}>encodeURI</code></td>
                <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>+ : / ? # [ ] @ ! $ &amp; &apos; ( ) * + , ; =</td>
                <td style={{ padding: '8px 10px', color: 'var(--text)' }}>전체 URL 인코딩</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 10px' }}><code style={codeStyle}>escape</code></td>
                <td style={{ padding: '8px 10px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>영숫자 + @*+-./_</td>
                <td style={{ padding: '8px 10px', color: '#DB2777', fontWeight: 600 }}>❌ 사용 금지 (Unicode 부정확, deprecated)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong>쉽게 기억하는 법</strong>: 의심스러우면 <code style={codeStyle}>encodeURIComponent</code>. 더 안전한 쪽을 선택.
        </p>
      </div>

      {/* 3. 한글·이모지 UTF-8 인코딩 */}
      <h2 style={sectionTitle}>🇰🇷 한글·이모지 UTF-8 인코딩 원리</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          ASCII 외 문자는 <strong>UTF-8 멀티바이트</strong>로 변환된 후 각 바이트가 <code style={codeStyle}>%XX</code>로 인코딩됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>글자</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>코드포인트</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>UTF-8 bytes</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>URL 인코딩</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['한', 'U+D55C', '3 (ED 95 9C)', '%ED%95%9C'],
                ['국', 'U+AD6D', '3 (EA B5 AD)', '%EA%B5%AD'],
                ['안', 'U+C548', '3 (EC 95 88)', '%EC%95%88'],
                ['녕', 'U+B155', '3 (EB 85 95)', '%EB%85%95'],
                ['😀', 'U+1F600', '4 (F0 9F 98 80)', '%F0%9F%98%80'],
                ['韓', 'U+97D3', '3 (E9 9F 93)', '%E9%9F%93'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', fontSize: 22, fontWeight: 700 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>{row[2]}</td>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: '#0EA5E9', fontWeight: 700 }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 한국어 1글자 = 보통 3 bytes (BMP), 이모지 1글자 = 보통 4 bytes (Supplementary Plane). 따라서 <strong>&quot;한국&quot; 2글자도 URL에서는 12자(%XX 6번) 차지</strong>합니다.
          이는 URL 길이 제한(브라우저 약 2,000자, 서버 약 8,000자)에서 한글이 빨리 차오르는 이유.
        </p>
      </div>

      {/* 4. 흔한 실수 5가지 */}
      <h2 style={sectionTitle}>🚨 흔한 실수 5가지</h2>
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '2px solid rgba(255, 138, 62, 0.50)',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '14px',
      }}>
        <ol style={{ margin: 0, paddingLeft: 22, fontSize: 13.5, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>이중 인코딩</strong> — 이미 인코딩된 값을 또 인코딩 → <code style={codeStyle}>%2520</code>(원래 공백 = <code style={codeStyle}>%20</code>). 본 도구의 <strong>반복 디코드</strong> 옵션으로 풀기 가능</li>
          <li><strong>encodeURIComponent vs encodeURI 잘못 사용</strong> — 쿼리 값에 encodeURI 쓰면 <code style={codeStyle}>=</code>·<code style={codeStyle}>&amp;</code>가 그대로 남아 파싱 깨짐</li>
          <li><strong>옛날 escape() 사용</strong> — Unicode 부정확, deprecated. 절대 쓰지 마세요</li>
          <li><strong>% 단독 입력</strong> — <code style={codeStyle}>%</code> 다음에 16진수 2자리 필수 (<code style={codeStyle}>%XX</code>). 단독 % → 디코드 오류</li>
          <li><strong>+ 기호 혼동</strong> — application/x-www-form-urlencoded 폼 인코딩에서만 <code style={codeStyle}>+</code>가 공백, RFC 3986 표준은 <code style={codeStyle}>%20</code>. 혼합 사용 시 디코드 결과 다름</li>
        </ol>
      </div>

      {/* 5. 추적 파라미터 — 어디서 왔고 왜 정리해야 하나 */}
      <h2 style={sectionTitle}>📊 추적 파라미터 — 어디서 왔고 왜 정리해야 하나</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          광고 클릭·검색 결과·SNS 공유 시 URL에 자동으로 붙는 파라미터들입니다. <strong>실제 콘텐츠와 무관</strong>하며, 광고 플랫폼이 클릭 출처·전환을 추적하는 용도예요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 14 }}>
          {[
            { emoji: '🌐', name: 'Google (UTM)', desc: 'utm_source/medium/campaign — Google Analytics 캠페인 추적' },
            { emoji: '🌐', name: 'Google Ads', desc: 'gclid·gbraid·wbraid — 광고 클릭 ID' },
            { emoji: '📘', name: 'Facebook·Meta', desc: 'fbclid·_fbp·_fbc — 페북 광고·픽셀 추적' },
            { emoji: '🇰🇷', name: '네이버', desc: 'n_media·n_query·n_keyword — 네이버 검색·검색광고' },
            { emoji: '💬', name: '카카오', desc: 'kakao_share_id·kakao_chat_id — 카톡 공유 추적' },
            { emoji: '🛍️', name: '쿠팡', desc: '_xts_·src·addtag — 쿠팡 파트너스·검색 광고' },
            { emoji: '🟦', name: 'Microsoft Bing', desc: 'msclkid·mc_eid — Bing 광고·MailChimp' },
            { emoji: '📊', name: '기타', desc: 'twclid·li_fat_id·yclid·igshid — Twitter·LinkedIn·Yandex·Instagram' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', borderLeft: '3px solid #FFA63E' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>{s.emoji} {s.name}</p>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
          <strong>왜 정리해야 하나?</strong> ① 깔끔한 URL 공유 (블로그·메모) ② 개인 추적 거부 ③ 캐시 효율 ↑ ④ 분석 도구가 같은 페이지를 다른 페이지로 인식하는 문제 방지<br />
          <strong>주의</strong>: 일부 사이트는 추적 파라미터로 다국어·캠페인 분기를 수행하므로, 제거 후 동작 검토 필요.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. encodeURIComponent와 encodeURI 차이?</summary>
        <p style={faqAnswer}>
          <strong>encodeURIComponent</strong>는 거의 모든 특수문자를 인코드합니다 (<code style={codeStyle}>:</code>·<code style={codeStyle}>/</code>·<code style={codeStyle}>?</code>·<code style={codeStyle}>#</code>·<code style={codeStyle}>@</code>·<code style={codeStyle}>&amp;</code>·<code style={codeStyle}>=</code> 포함).<br />
          <strong>encodeURI</strong>는 URL 구조 문자(스킴·구분자)를 보존합니다.<br />
          <strong>실용 룰</strong>:<br />
          • <strong>쿼리 값·경로 세그먼트</strong> → <code style={codeStyle}>encodeURIComponent</code> (안전)<br />
          • <strong>전체 URL 한 번에</strong> → <code style={codeStyle}>encodeURI</code><br />
          예: <code style={codeStyle}>encodeURIComponent(&quot;a&amp;b&quot;)</code> = <code style={codeStyle}>a%26b</code> (쿼리 값으로 안전), <code style={codeStyle}>encodeURI(&quot;a&amp;b&quot;)</code> = <code style={codeStyle}>a&amp;b</code> (그대로 — 쿼리 키와 충돌 위험).
          의심스러우면 항상 encodeURIComponent.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. escape()는 왜 쓰면 안 되나요?</summary>
        <p style={faqAnswer}>
          <strong>1990년대 옛 함수</strong>로 deprecated 됐습니다 (ECMAScript 표준에서 Annex B로 분류 — 호환성용만).<br />
          문제점:<br />
          • <strong>Unicode 부정확</strong>: BMP 외 문자(이모지) 처리 못함<br />
          • <strong>%uXXXX 형식</strong>: 표준 URL %XX 인코딩이 아닌 자바스크립트 전용 형식 → 서버에서 디코드 실패<br />
          • <strong>한글 깨짐</strong>: ISO-8859-1 가정 → UTF-8 한글 처리 불가<br />
          반드시 <code style={codeStyle}>encodeURIComponent</code> 또는 <code style={codeStyle}>encodeURI</code> 사용. 본 도구는 escape()를 지원하지 않습니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 한글 1글자가 왜 %XX %XX %XX (3개)인가요?</summary>
        <p style={faqAnswer}>
          <strong>UTF-8 인코딩</strong> 때문입니다. URL은 ASCII 문자만 직접 사용 가능하므로, 비-ASCII 문자는 UTF-8 바이트로 변환됩니다.<br />
          • <strong>한글</strong> (BMP, U+AC00 ~ U+D7A3): UTF-8에서 <strong>3 bytes</strong> → URL %XX %XX %XX<br />
          • <strong>이모지</strong> (Supplementary Plane, U+1F000+): UTF-8에서 <strong>4 bytes</strong> → URL %XX %XX %XX %XX<br />
          • <strong>한자</strong>: BMP 내 한자는 3 bytes<br />
          예: <code style={codeStyle}>한</code>(U+D55C) → UTF-8 <code style={codeStyle}>0xED 0x95 0x9C</code> → URL <code style={codeStyle}>%ED%95%9C</code>.
          본 도구의 한글 분석 박스에서 글자별 변환 과정을 시각화합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. + 기호는 공백인가요? %20인가요?</summary>
        <p style={faqAnswer}>
          <strong>둘 다 공백이지만 사용 컨텍스트가 다릅니다</strong>.<br />
          • <strong>RFC 3986 (표준 URL)</strong>: 공백 = <code style={codeStyle}>%20</code>. <code style={codeStyle}>+</code>는 그냥 + 문자<br />
          • <strong>application/x-www-form-urlencoded (HTML 폼)</strong>: 공백 = <code style={codeStyle}>+</code>. <code style={codeStyle}>%20</code>도 공백으로 디코드<br />
          <strong>실제 동작</strong>:<br />
          • <code style={codeStyle}>encodeURIComponent(&quot; &quot;)</code> = <code style={codeStyle}>%20</code> (RFC 3986)<br />
          • <code style={codeStyle}>new URLSearchParams({`{a: ' '}`}).toString()</code> = <code style={codeStyle}>a=+</code> (form 변형)<br />
          • 디코드 시 양쪽 모두 공백으로 인식<br />
          <strong>혼용 주의</strong>: 같은 URL에 <code style={codeStyle}>%20</code>과 <code style={codeStyle}>+</code> 섞이면 문제. 한 가지로 통일 권장. 본 도구는 <code style={codeStyle}>%20</code> (encodeURIComponent) 출력.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 이중 인코딩(%2520)이 발생하는 이유?</summary>
        <p style={faqAnswer}>
          <strong>이미 인코딩된 값을 또 인코딩했기 때문</strong>입니다.<br />
          1단계: 공백 → <code style={codeStyle}>%20</code> (정상)<br />
          2단계: <code style={codeStyle}>%20</code>의 <code style={codeStyle}>%</code> → <code style={codeStyle}>%25</code> → 결과 <code style={codeStyle}>%2520</code>!<br />
          <strong>발생 시나리오</strong>:<br />
          • 백엔드에서 디코드된 값을 받아 다시 인코드하면서 변환<br />
          • 프론트엔드에서 이미 인코딩된 URL을 또 encodeURIComponent 호출<br />
          • OAuth redirect_uri 등에서 중첩 escape<br />
          <strong>해결</strong>: 본 도구의 <strong>탭 1 디코드 + 반복 디코드 옵션</strong>으로 한 번에 풀기 (최대 5회). 코드에서는 인코드/디코드 횟수를 명확히 추적해야 합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. UTM 파라미터 제거해도 되나요?</summary>
        <p style={faqAnswer}>
          <strong>네, 일반적으로 안전합니다</strong>. UTM은 <strong>Google Analytics 추적용</strong>이며 페이지 콘텐츠에 영향을 주지 않습니다.<br />
          • <code style={codeStyle}>utm_source</code>, <code style={codeStyle}>utm_medium</code>, <code style={codeStyle}>utm_campaign</code> 등은 분석 데이터일 뿐<br />
          • 제거해도 페이지는 정상 작동<br />
          • 깔끔한 URL 공유에 유리 (블로그·SNS·문서)<br />
          <strong>예외 주의</strong>:<br />
          • 일부 사이트가 UTM으로 다국어·캠페인 페이지 분기 (드물지만 가능)<br />
          • 광고주 입장에서는 추적 데이터가 사라지므로 본인 광고 클릭은 유지 권장<br />
          • OAuth state·CSRF 토큰처럼 보안 토큰은 절대 제거 X (본 도구는 추적이 아닌 키는 손대지 않음)
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 네이버 n_media 같은 파라미터는?</summary>
        <p style={faqAnswer}>
          <strong>네이버 검색·쇼핑·검색광고 추적</strong> 파라미터입니다.<br />
          • <code style={codeStyle}>n_media</code>: 광고 매체 (예: cpc=검색광고)<br />
          • <code style={codeStyle}>n_query</code>: 검색어<br />
          • <code style={codeStyle}>n_keyword</code>: 키워드 ID<br />
          • <code style={codeStyle}>n_rank</code>: 검색 결과 순위<br />
          • <code style={codeStyle}>n_ad_group</code>·<code style={codeStyle}>n_ad</code>: 광고 그룹·광고 ID<br />
          • <code style={codeStyle}>n_campaign_type</code>: 캠페인 유형<br />
          UTM과 동일하게 <strong>제거해도 페이지 작동에 영향 없음</strong>. 깔끔한 공유 URL을 만들 때 유용합니다.
          본 도구의 <strong>네이버 그룹</strong>에서 일괄 제거 가능.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. URL 길이 제한은 얼마인가요?</summary>
        <p style={faqAnswer}>
          공식 표준에는 길이 제한이 없지만, <strong>실용적 제한</strong>이 존재합니다:<br />
          • <strong>브라우저</strong>: Chrome/Firefox/Safari 대부분 ~32,000자 처리, 일부 구형 IE는 2,083자<br />
          • <strong>웹 서버</strong>: Nginx 기본 8,192자, Apache 8,190자, IIS 16,384자<br />
          • <strong>안전권장</strong>: <strong>2,000자 이하</strong> (모든 환경 호환)<br />
          • <strong>SEO</strong>: 짧을수록 좋음 (~75자 권장)<br />
          <strong>한글 주의</strong>: 한글 1글자가 URL에서 9자(%ED%95%9C)를 차지하므로, 짧은 한국어 텍스트도 URL에서는 빨리 길어집니다. 긴 데이터는 POST body나 JSON 토큰으로 전달 권장.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. OAuth state·redirect_uri 디코드?</summary>
        <p style={faqAnswer}>
          <strong>OAuth 콜백 URL 디버깅</strong>에 본 도구가 매우 유용합니다.<br />
          • <code style={codeStyle}>state</code>: CSRF 방지 토큰 (랜덤 문자열, 디코드해서 검증)<br />
          • <code style={codeStyle}>redirect_uri</code>: 콜백 URL (이중 인코딩 자주 발생)<br />
          • <code style={codeStyle}>code</code>: 인증 코드 (단발성, 1회 사용)<br />
          • <code style={codeStyle}>access_token</code>: 액세스 토큰 (보안 민감!)<br />
          <strong>⚠️ 보안 주의</strong>:<br />
          1. <strong>access_token·refresh_token·session_id 디코드는 OK, 공유·수정은 절대 X</strong> (계정 탈취 위험)<br />
          2. <strong>state 토큰을 임의로 수정하면 CSRF 검증 실패</strong> → 인증 오류<br />
          3. <strong>공용 PC에서 사용 후 브라우저 캐시·localStorage 정리</strong> (본 도구의 입력은 localStorage에 저장됨)<br />
          본 도구는 모든 처리가 클라이언트 측이라 외부 전송 없음.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 본 도구는 입력 데이터를 서버에 보내나요?</summary>
        <p style={faqAnswer}>
          <strong>아니요. 모든 처리가 브라우저(클라이언트)에서 수행됩니다.</strong><br />
          • 인코드/디코드: <strong>Native Web API</strong> (encodeURIComponent·decodeURIComponent·URL·URLSearchParams)<br />
          • 한글 분석: <code style={codeStyle}>TextEncoder</code> 브라우저 내장<br />
          • 외부 라이브러리·서버 호출 <strong>0개</strong><br />
          • Network 탭 확인: 변환 시 어떤 fetch/XHR도 발생하지 않음<br />
          • 다운로드: <code style={codeStyle}>Blob</code> URL로 브라우저 내 처리<br />
          • 입력은 <strong>localStorage에 저장</strong>(편의), 외부 전송 없음<br />
          <strong>다만</strong>: 공용 PC·공유 기기에서 OAuth 토큰·세션 ID·access_token 등을 다룬 경우 사용 후 정리하세요.
          DevTools → Application → Local Storage에서 <code style={codeStyle}>youtil_url_encode_v1</code> 키 삭제 가능.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📋</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성
          </p>
        </Link>
        <Link href="/tools/dev/regex" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔍</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>정규식 테스트기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            매칭·캡처·치환·치트시트
          </p>
        </Link>
        <Link href="/tools/dev/yaml-json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📄</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>YAML ↔ JSON 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            K8s·Spring·OpenAPI 예시
          </p>
        </Link>
      </div>
    </div>
  )
}
