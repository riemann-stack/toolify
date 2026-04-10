import type { Metadata } from 'next'
import LengthClient from './LengthClient'

export const metadata: Metadata = {
  title: '길이 변환기 — cm m km 인치 피트 마일 변환 | Youtil',
  description: 'cm, m, km, 인치(inch), 피트(ft), 마일(mile), 야드(yd) 등 길이 단위를 즉시 변환. 신장 변환, 거리 변환 지원.',
  keywords: ['길이변환기', '인치cm변환', '피트미터변환', '마일km변환', 'cm인치변환', '길이단위변환'],
}

export default function LengthPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📏 길이 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        cm, m, km부터 인치, 피트, 마일까지 길이 단위를 즉시 변환합니다.
      </p>

      <LengthClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 쓰는 길이 변환 표</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>단위</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>cm</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>m</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>km</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1인치 (inch)', '2.54', '0.0254', '0.0000254'],
                  ['1피트 (ft)', '30.48', '0.3048', '0.0003048'],
                  ['1야드 (yd)', '91.44', '0.9144', '0.0009144'],
                  ['1마일 (mile)', '160,934', '1,609.34', '1.60934'],
                  ['1해리 (nmi)', '185,200', '1,852', '1.852'],
                ].map(([unit, cm, m, km], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{unit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{cm}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{m}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{km}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>신장(키) 단위 변환 — 피트·인치 ↔ cm</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>피트·인치</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>cm</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["5'0\"", '152.4cm'],
                  ["5'5\"", '165.1cm'],
                  ["5'9\"", '175.3cm'],
                  ["5'11\"", '180.3cm'],
                  ["6'0\"", '182.9cm'],
                  ["6'2\"", '188.0cm'],
                ].map(([ft, cm], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{ft}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{cm}</td>
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