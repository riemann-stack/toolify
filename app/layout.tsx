import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://youtil.kr'),
  title: 'Youtil — 무료 온라인 도구 모음',
  description: '연봉 계산기, 로또 번호 생성기, BMI 계산기 등 일상에서 자주 쓰는 무료 도구 모음. 로그인 없이 즉시 사용.',
  verification: {
    google: '-iy41VlIHWNyy-1njszGVK2UM6dq-0vAkhaEbSvOTlI',
    other: {
      'naver-site-verification': '77892a28985ac64263859f613be41f7fda5c19d5',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1J054JW010"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1J054JW010');
          `}
        </Script>
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}