import type { Metadata } from 'next'
import ZodiacClient from './ZodiacClient'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '띠·별자리 계산기 — 생년월일로 확인 | Youtil',
  description: '생년월일을 입력하면 띠(12간지)와 별자리를 즉시 확인합니다. 성격 특징, 같은 띠 연도, 원소 정보 제공.',
  keywords: ['띠계산기', '별자리계산기', '생년월일띠', '나의별자리', '12간지', '띠별자리'],
}

export default function ZodiacPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🐯 띠·별자리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        생년월일을 입력하면 띠(12간지)와 별자리를 즉시 확인합니다.
      </p>

      <ZodiacClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>12간지 순서와 해당 연도</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['띠', '순서', '최근 해당 연도'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🐭 쥐', '1번째', '1996, 2008, 2020'],
                  ['🐮 소', '2번째', '1997, 2009, 2021'],
                  ['🐯 호랑이', '3번째', '1998, 2010, 2022'],
                  ['🐰 토끼', '4번째', '1999, 2011, 2023'],
                  ['🐲 용', '5번째', '2000, 2012, 2024'],
                  ['🐍 뱀', '6번째', '2001, 2013, 2025'],
                  ['🐴 말', '7번째', '2002, 2014, 2026'],
                  ['🐑 양', '8번째', '2003, 2015, 2027'],
                  ['🐵 원숭이', '9번째', '2004, 2016, 2028'],
                  ['🐔 닭', '10번째', '2005, 2017, 2029'],
                  ['🐶 개', '11번째', '2006, 2018, 2030'],
                  ['🐷 돼지', '12번째', '2007, 2019, 2031'],
                ].map(([animal, order, years], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{animal}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{order}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{years}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>별자리 날짜표</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['별자리', '기간', '원소'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['♈ 양자리',    '3/21 ~ 4/19',  '불', '#FF6B6B'],
                  ['♉ 황소자리',  '4/20 ~ 5/20',  '지', '#C8FF3E'],
                  ['♊ 쌍둥이자리','5/21 ~ 6/21',  '공기', '#3EC8FF'],
                  ['♋ 게자리',    '6/22 ~ 7/22',  '물', '#6B8BFF'],
                  ['♌ 사자자리',  '7/23 ~ 8/22',  '불', '#FF6B6B'],
                  ['♍ 처녀자리',  '8/23 ~ 9/22',  '지', '#C8FF3E'],
                  ['♎ 천칭자리',  '9/23 ~ 10/23', '공기', '#3EC8FF'],
                  ['♏ 전갈자리',  '10/24 ~ 11/22','물', '#6B8BFF'],
                  ['♐ 사수자리',  '11/23 ~ 12/21','불', '#FF6B6B'],
                  ['♑ 염소자리',  '12/22 ~ 1/19', '지', '#C8FF3E'],
                  ['♒ 물병자리',  '1/20 ~ 2/18',  '공기', '#3EC8FF'],
                  ['♓ 물고기자리','2/19 ~ 3/20',  '물', '#6B8BFF'],
                ].map(([sign, period, element, color], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{sign}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{period}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: color as string, fontWeight: 500 }}>{element}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '띠는 음력 기준인가요 양력 기준인가요?', a: '엄밀히는 음력 설날을 기준으로 하지만, 실용적으로는 양력 1월 1일을 기준으로 계산하는 경우도 많습니다. 본 계산기는 양력 기준으로 계산합니다. 음력 설날 전후 출생자는 실제 띠와 1년 차이가 날 수 있습니다.' },
              { q: '별자리는 태양 별자리인가요?', a: '네, 본 계산기는 생일 기준 태양 별자리(Sun Sign)를 계산합니다. 점성술에서는 태양 별자리 외에도 달 별자리, 상승 별자리 등이 있으며, 정확한 점성술 분석은 출생 시간과 장소가 필요합니다.' },
              { q: '별자리 경계 날짜에 태어난 경우는?', a: '두 별자리의 경계 날짜(예: 양자리와 황소자리의 경계인 4월 19~20일)에 태어난 경우를 "커스프(Cusp)"라고 합니다. 이 경우 두 별자리의 특징을 모두 가질 수 있습니다. 정확한 별자리는 출생 연도와 시간에 따라 다를 수 있습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/age',  icon: '🎂', name: '만 나이 계산기', desc: '법 개정 기준 만 나이' },
              { href: '/tools/date/dday', icon: '📅', name: 'D-day 계산기',   desc: '생일까지 남은 날 계산' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}