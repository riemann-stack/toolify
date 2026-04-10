import type { Metadata } from 'next'
import JsonClient from './JsonClient'

export const metadata: Metadata = {
  title: 'JSON 포맷터 — JSON 정렬·압축·유효성 검사 | Youtil',
  description: 'JSON을 보기 좋게 정렬(Beautify)하거나 한 줄로 압축(Minify)합니다. 유효성 검사로 JSON 오류 위치를 즉시 확인.',
  keywords: ['JSON포맷터', 'JSON정렬', 'JSON압축', 'JSON유효성검사', 'JSON뷰어', 'JSONbeautify'],
}

export default function JsonPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📋 JSON 포맷터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        JSON을 정렬·압축하고 유효성을 검사합니다.
      </p>

      <JsonClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>JSON이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            JSON(JavaScript Object Notation)은 데이터를 저장하고 전송하기 위한 경량 데이터 형식입니다. 사람이 읽기 쉽고 기계가 파싱하기 쉬워 API 응답, 설정 파일, 데이터 교환 등에 널리 사용됩니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: 'JSON 정렬 (Beautify)', content: 'API에서 받은 압축된 JSON을 들여쓰기가 있는 형태로 변환해 가독성을 높입니다. 디버깅이나 코드 리뷰 시 유용합니다.' },
              { title: 'JSON 압축 (Minify)', content: '공백과 줄바꿈을 제거해 JSON 크기를 줄입니다. 네트워크 전송이나 저장 공간 절약이 필요할 때 사용합니다.' },
              { title: 'JSON 유효성 검사', content: '잘못된 JSON 입력 시 오류 위치와 원인을 표시합니다. API 개발이나 설정 파일 작성 시 오류를 빠르게 찾을 수 있습니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>자주 발생하는 JSON 오류</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>오류 유형</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>원인</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Trailing comma', '마지막 요소 뒤에 쉼표(,)가 있는 경우. JSON은 trailing comma를 허용하지 않습니다.'],
                  ['Single quotes', '문자열에 작은따옴표(\')를 사용한 경우. JSON은 큰따옴표(")만 허용합니다.'],
                  ['Undefined/NaN', 'JavaScript의 undefined, NaN, Infinity는 JSON 값으로 사용할 수 없습니다.'],
                  ['주석 포함', 'JSON은 // 또는 /* */ 주석을 지원하지 않습니다. JSON5나 JSONC는 지원합니다.'],
                ].map(([error, cause], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: '#FF6B6B', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{error}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{cause}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}