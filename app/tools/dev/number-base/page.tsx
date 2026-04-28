import Link from 'next/link'
import NumberBaseClient from './NumberBaseClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/dev/number-base',
  title: '진법 변환기 — 2진수·8진수·10진수·16진수·비트·ASCII',
  description: '2진수·8진수·10진수·16진수 상호 변환, 비트 시각화, 2의 보수, ASCII 문자 변환, 비트 연산(AND·OR·XOR·SHIFT)을 한 도구에. 단계별 학습 모드 포함.',
  keywords: ['진법변환기', '2진수', '8진수', '10진수', '16진수', '진법변환', '비트연산', 'ASCII', '2의보수', 'binary', 'hex', '진법계산', '비트마스크'],
})

export default function NumberBasePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자·텍스트
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🔢 진법 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        2진수·8진수·10진수·16진수를 <strong style={{ color: 'var(--text)' }}>실시간으로 상호 변환</strong>합니다.
        <strong style={{ color: 'var(--text)' }}> 비트 토글 시각화·2의 보수·ASCII·비트 연산(AND/OR/XOR/SHIFT)</strong> + 자리값 분해와 나누기 방식 단계별 학습까지 한 도구에서.
      </p>

      <NumberBaseClient />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            진법 변환 핵심 원리
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 자리값 (오른쪽이 0번째)</span></div>
            <div><span style={{ color: 'var(--accent)' }}>2진수</span>:  1, 2, 4, 8, 16, 32, 64, 128, 256, ...</div>
            <div><span style={{ color: '#FFD700' }}>8진수</span>:  1, 8, 64, 512, 4096, ...</div>
            <div><span style={{ color: '#3EC8FF' }}>10진수</span>: 1, 10, 100, 1000, 10000, ...</div>
            <div><span style={{ color: '#FF8C3E' }}>16진수</span>: 1, 16, 256, 4096, 65536, ...</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>변환 원리:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>N진수 → 10진수: 각 자리에 자리값 곱하고 합산 (<strong>1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11</strong>)</li>
              <li>10진수 → N진수: N으로 계속 나누고 나머지를 역순 배열</li>
            </ul>
          </div>
        </div>

        {/* ── 2. 진법 간 관계 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            진법 간 단축 변환 관계
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>2진수 ↔ 16진수 (가장 자주)</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <strong>2진수 4자리 = 16진수 1자리</strong>
                <br />0000 = 0 / 0001 = 1 / 1010 = A / 1111 = F
                <br />8비트(1바이트) = 16진수 2자리 (예: 0xFF)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FFD700', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: '#FFD700', fontWeight: 700, marginBottom: 8 }}>2진수 ↔ 8진수</p>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                <strong>2진수 3자리 = 8진수 1자리</strong>
                <br />000 = 0 / 111 = 7
                <br />Unix 권한(rwx)에 자주 사용 (chmod 755)
              </p>
            </div>
          </div>
          <div style={{
            background: 'rgba(62,200,255,0.05)',
            border: '1px solid rgba(62,200,255,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            💡 <strong style={{ color: '#3EC8FF' }}>왜 16진수를 자주 쓰나?</strong> 2진수는 너무 길어서 (8비트 = 16진 2자리),
            메모리 주소·색상 코드·HEX 덤프 등에서 표준입니다.
            <code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>0xFF</code>가
            <code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>11111111</code>보다 훨씬 읽기 쉽습니다.
          </div>
        </div>

        {/* ── 3. 비트 폭 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            비트 폭별 표현 범위
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['비트', '부호 없는 최대', '부호 있는 범위'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { b: '8-bit (1B)',   u: '255',                 s: '−128 ~ 127' },
                  { b: '16-bit (2B)',  u: '65,535',              s: '−32,768 ~ 32,767' },
                  { b: '32-bit (4B)',  u: '약 42억',              s: '−약 21억 ~ 약 21억' },
                  { b: '64-bit (8B)',  u: '약 1.8 × 10¹⁹',        s: '−9.2 × 10¹⁸ ~ 9.2 × 10¹⁸' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.b}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.u}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#3EC8FF', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            🔢 <strong style={{ color: 'var(--text)' }}>2의 거듭제곱 (자주 쓰는 값):</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>2⁸ = <strong>256</strong> (1바이트)</li>
              <li>2¹⁰ = <strong>1,024</strong> (1KiB)</li>
              <li>2¹⁶ = <strong>65,536</strong> (UTF-16 BMP, 16비트 포트)</li>
              <li>2²⁰ = <strong>1,048,576</strong> (1MiB)</li>
              <li>2³² = <strong>약 42억</strong> (32-bit 정수 한계, IPv4 주소)</li>
            </ul>
          </div>
        </div>

        {/* ── 4. 2의 보수 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            2의 보수 (Two&apos;s Complement)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            컴퓨터가 음수를 비트로 표현하는 가장 효율적인 방법입니다. 거의 모든 현대 CPU·언어에서 표준으로 사용됩니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2,
          }}>
            <div><span style={{ color: 'var(--muted)' }}># 8-bit 예시</span></div>
            <div>+5 = <span style={{ color: 'var(--accent)' }}>00000101</span></div>
            <div>−5 = <span style={{ color: '#FF6B6B' }}>11111011</span> (00000101 비트 반전 후 +1)</div>
            <div></div>
            <div><span style={{ color: 'var(--muted)' }}># 8-bit 표현 범위 — MSB가 부호 비트</span></div>
            <div>00000000 (0) ~ 01111111 (+127)</div>
            <div>10000000 (−128) ~ 11111111 (−1)</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 12 }}>
            {[
              { t: '✓ 장점 1', d: '0이 단 하나 (+0과 −0이 분리되지 않음, 부호+절대값 방식과 다름)' },
              { t: '✓ 장점 2', d: '덧셈·뺄셈을 같은 회로로 처리 (a − b = a + (−b))' },
              { t: '✓ 장점 3', d: '비트 반전 후 +1로 매우 간단히 변환' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'rgba(62,255,155,0.05)', border: '1px solid rgba(62,255,155,0.30)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#3EFF9B', fontWeight: 700, marginBottom: 4 }}>{g.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 비트 연산 활용 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            비트 연산 활용 가이드
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연산', '동작', '활용 예시'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { o: 'AND (&)',   d: '둘 다 1일 때만 1', u: '마스킹 — 0xFF & 0x0F = 0x0F (하위 4비트만 추출)' },
                  { o: 'OR (|)',    d: '하나라도 1이면 1',  u: '비트 설정 — 0x10 | 0x01 = 0x11 (특정 비트 ON)' },
                  { o: 'XOR (^)',   d: '다르면 1, 같으면 0', u: '토글·암호화 — 같은 값 두 번 XOR하면 원복' },
                  { o: 'NOT (~)',   d: '0↔1 반전',           u: '비트 반전, 마스크 생성' },
                  { o: 'LSHIFT (<<)',d: '왼쪽 이동',          u: 'x << 1 = x × 2 (빠른 곱셈)' },
                  { o: 'RSHIFT (>>)',d: '오른쪽 이동',         u: 'x >> 1 = x ÷ 2 (정수 나눗셈)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.o}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            🛠️ <strong style={{ color: 'var(--text)' }}>실전 활용:</strong>
            <ul style={{ paddingLeft: 22, marginTop: 6 }}>
              <li>플래그 관리 (여러 옵션을 한 변수에): <code style={{ background: 'var(--bg3)', padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>flags |= READ; if (flags &amp; READ) ...</code></li>
              <li>Linux 파일 권한 (chmod 755 = 0o755 = rwxr-xr-x)</li>
              <li>RGB 채널 분리: <code style={{ background: 'var(--bg3)', padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>r = (color &gt;&gt; 16) &amp; 0xFF</code></li>
              <li>비트 연산은 일반 산술보다 훨씬 빠름 — 성능 최적화</li>
            </ul>
          </div>
        </div>

        {/* ── 6. ASCII ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            ASCII 표준
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            ASCII = American Standard Code for Information Interchange (1963년 제정).
            7비트로 영어·숫자·기본 기호 128개를 표현하는 표준이며, 8비트 확장 ASCII는 256개를 다룹니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {[
              { range: '0~31',   label: '제어 문자',   c: '#A8A29E', d: 'NUL, TAB(9), LF(10), CR(13), ESC(27) 등' },
              { range: '32',     label: '공백 (SPACE)', c: '#3EFFD0', d: '문자열 구분' },
              { range: '48~57',  label: '숫자 0~9',     c: '#FFD700', d: 'ord(\'0\') = 48' },
              { range: '65~90',  label: '대문자 A~Z',   c: 'var(--accent)', d: 'ord(\'A\') = 65' },
              { range: '97~122', label: '소문자 a~z',   c: '#3EC8FF', d: 'ord(\'a\') = 97 (대문자+32)' },
              { range: '127',    label: 'DEL',          c: '#FF6B6B', d: '구식 천공카드 삭제 표시' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${g.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: g.c, fontWeight: 800, marginBottom: 2 }}>{g.range}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{g.label}</p>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.6 }}>{g.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            background: 'rgba(155,89,182,0.06)',
            border: '1px solid rgba(155,89,182,0.30)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 12.5,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.85,
          }}>
            🌏 <strong style={{ color: '#C485E0' }}>유니코드:</strong> ASCII 0~127은 유니코드와 완전 동일.
            한글은 <code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>U+AC00 ~ U+D7A3</code> 범위에 11,172개가 정의 (가~힣).
          </div>
        </div>

        {/* ── 7. 언어별 표기 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            프로그래밍 언어별 진법 표기
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['언어', '16진수', '2진수', '8진수'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { l: 'C / C++ / Java',    h: '0xFF',  b: '0b11111111 (C++14+)', o: '0377 (앞 0)' },
                  { l: 'Python',             h: '0xff',  b: '0b11111111',           o: '0o377' },
                  { l: 'JavaScript / TS',    h: '0xFF',  b: '0b11111111',           o: '0o377' },
                  { l: 'Rust / Go',          h: '0xFF',  b: '0b1111_1111',          o: '0o377' },
                  { l: 'CSS 색상',            h: '#FF0000', b: '—',                   o: '—' },
                  { l: 'HTML 엔터티',         h: '&#x41;',  b: '—',                   o: '—' },
                  { l: 'URL 인코딩',          h: '%41',     b: '—',                   o: '—' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 600 }}>{r.l}</td>
                    <td style={{ padding: '10px 12px', color: '#FF8C3E', fontFamily: 'var(--font-mono)' }}>{r.h}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.b}</td>
                    <td style={{ padding: '10px 12px', color: '#FFD700', fontFamily: 'var(--font-mono)' }}>{r.o}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '왜 16진수를 자주 사용하나요?',
                a: '2진수는 길어서 사람이 읽기 어렵지만, 16진수는 짧고 직관적이기 때문입니다. <strong>8비트(1바이트)는 16진수 2자리</strong>로 표현되며, 메모리 주소·색상 코드·암호화 키 등에 표준입니다. 또한 16진수와 2진수는 <strong>4비트 단위로 직접 변환</strong>되어 (1111 = F) 비트 패턴 분석에 매우 편리합니다. <code>0xFF</code>가 <code>11111111</code>보다 훨씬 읽기 쉽습니다.',
              },
              {
                q: '2의 보수는 왜 사용하나요?',
                a: '컴퓨터에서 음수를 표현하는 가장 효율적인 방법이기 때문입니다. ① <strong>0이 단 하나</strong>(+0과 −0이 구분 X), ② <strong>덧셈·뺄셈을 같은 회로로 처리</strong>(a − b = a + (−b)), ③ <strong>비트 반전 후 +1</strong>로 간단히 변환. 거의 모든 현대 CPU·프로그래밍 언어에서 표준으로 사용합니다. 부호+절대값 방식이나 1의 보수 방식은 0의 표현이 두 가지가 되거나 회로가 복잡해 거의 쓰이지 않습니다.',
              },
              {
                q: 'ASCII와 유니코드의 차이는 무엇인가요?',
                a: 'ASCII는 7비트로 영어·숫자·기본 기호 128개를 표현하는 표준입니다(1963년 제정). <strong>유니코드는 전 세계 모든 문자</strong>를 표현하기 위해 ASCII를 확장한 표준이며, 약 14만 개 이상의 문자(한글·한자·이모지 포함)를 정의합니다. ASCII 0~127번은 유니코드와 완전히 동일하므로 ASCII 호환성이 보장됩니다. 한글은 <code>U+AC00 ~ U+D7A3</code> 범위에 11,172개가 정의되어 있습니다.',
              },
              {
                q: '비트 연산은 언제 사용하나요?',
                a: '비트 연산은 다음 상황에 자주 사용됩니다: ① <strong>플래그 관리</strong>(여러 옵션을 한 변수에 OR로 설정·AND로 확인), ② <strong>마스킹</strong>(특정 비트만 추출), ③ <strong>빠른 곱셈·나눗셈</strong>(x &lt;&lt; 1 = x×2), ④ 권한 시스템(Linux 파일 권한 0o755), ⑤ <strong>암호화·해시</strong>(XOR 활용), ⑥ <strong>그래픽 처리</strong>(RGB 채널 분리). 비트 연산은 일반 산술 연산보다 훨씬 빠르므로 성능 최적화에도 사용됩니다.',
              },
              {
                q: '16진수에서 A~F는 무엇을 의미하나요?',
                a: '16진수는 0~15까지 16개 숫자를 사용하는 진법이지만, 한 자리에 두 자리 숫자(10~15)를 넣을 수 없어 알파벳을 빌려 사용합니다: <strong>A=10, B=11, C=12, D=13, E=14, F=15</strong>. 예를 들어 <code>0xFF = 15 × 16 + 15 = 255</code>입니다. 관습상 대문자(A~F)와 소문자(a~f) 모두 허용되며 같은 값을 의미합니다. CSS 색상은 대문자가 일반적이고, Python·Rust 등은 소문자를 선호합니다.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/dev/charcount',     icon: '🔡', name: '글자수 세기',           desc: '바이트·트위터 가중치·플랫폼 한도' },
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일·JWT Base64 변환' },
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·트리·TS 변환' },
              { href: '/tools/dev/color',         icon: '🎨', name: '색상 코드 변환기',     desc: 'HEX·RGB·HSL 변환' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 값 변환기',         desc: 'px·rem·em·clamp() 변환' },
              { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 시뮬레이터', desc: '직렬·병렬 회로 시각화' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
