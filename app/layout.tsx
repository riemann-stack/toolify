import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Toolify — 무료 온라인 도구 모음',
  description: '연봉 계산기, 로또 번호 생성기, BMI 계산기 등 일상에서 자주 쓰는 무료 도구 모음. 로그인 없이 즉시 사용.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}