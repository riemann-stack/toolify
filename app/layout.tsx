import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// 모바일 뷰포트 + 다크 테마 시각화 (status bar / 모바일 브라우저 UI)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D0D0D',
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://youtil.kr'),
  title: {
    default: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    template: '%s | Youtil',
  },
  description: '금융, 건강, 생활, 날짜, 음악, 변환, 개발자 도구까지 한곳에. 자주 쓰는 무료 계산기와 실용 도구를 로그인 없이 즉시 사용.',
  applicationName: 'Youtil',
  keywords: ['무료 계산기', '온라인 도구', '연봉 계산기', 'BMI', '로또', '단위 변환', '날짜 계산기', '한국 계산기'],
  authors: [{ name: 'Youtil' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://youtil.kr',
    siteName: 'Youtil',
    title: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    description: '금융·건강·생활·날짜·음악·변환·개발자 도구까지 한곳에. 무료, 로그인 없음, 즉시 사용.',
    // images는 app/opengraph-image.tsx 가 자동 적용 (1200x630 동적 생성)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    description: '금융·건강·생활·날짜·음악·변환·개발자 도구까지 한곳에. 무료, 로그인 없음, 즉시 사용.',
    // twitter 이미지도 app/twitter-image.tsx 가 있으면 자동 적용. 없으면 opengraph-image 폴백
  },
  alternates: {
    canonical: 'https://youtil.kr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        {/* 폰트 CDN preconnect — fonts.googleapis CSS + fonts.gstatic 폰트 파일 모두 단축 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

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