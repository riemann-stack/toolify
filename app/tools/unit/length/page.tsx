import type { Metadata } from 'next'
import LengthClient from './LengthClient'

export const metadata: Metadata = {
  title: '길이 변환기 — cm m km 인치 피트 마일 | Toolify',
  description: 'cm, m, km, 인치(inch), 피트(ft), 마일(mile), 야드(yd) 등 길이 단위를 즉시 변환.',
  keywords: ['길이변환기', '인치cm변환', '피트미터변환', '마일km변환'],
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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>자주 쓰는 변환 값</h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
          <strong style={{ color: 'var(--text)' }}>1인치 = 2.54cm</strong> · <strong style={{ color: 'var(--text)' }}>1피트 = 30.48cm</strong> · <strong style={{ color: 'var(--text)' }}>1마일 = 1.609km</strong>. 신장 표기 시 5ft 11in처럼 피트+인치를 혼용하는 경우가 많습니다.
        </p>
      </div>
    </div>
  )
}