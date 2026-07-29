import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import SiteJsonLd from '@/components/SiteJsonLd'
import AutoAds from '@/components/AutoAds'

// 모바일 뷰포트 + 라이트 테마 시각화 (status bar / 모바일 브라우저 UI)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // 홈 화면 추가(standalone) 실행 시 하단 탭바의 env(safe-area-inset-bottom)이 유효하려면 필수
  viewportFit: 'cover',
  themeColor: '#f0f7ff',
  colorScheme: 'light',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://youtil.kr'),
  title: {
    default: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    template: '%s | Youtil',
  },
  description: '금융, 건강, 생활, 날짜, 예술, 변환, 개발자 도구까지 한곳에. 자주 쓰는 무료 계산기와 실용 도구를 로그인 없이 즉시 사용.',
  applicationName: 'Youtil',
  // iOS '홈 화면에 추가' 시: 아이콘 아래 이름을 'Youtil'로, 웹앱(전체화면)으로 실행
  appleWebApp: {
    capable: true,
    title: 'Youtil',
    statusBarStyle: 'default',
  },
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

// 폰트 CSS URL — preload·삽입 스크립트·noscript 3곳이 동일 URL을 참조해야 캐시가 한 번만 쓰임
const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense — 사이트 소유권 확인 (전 페이지) */}
        <meta name="google-adsense-account" content="ca-pub-9104888603507576" />

        {/* 폰트 CDN preconnect — fonts.googleapis CSS + fonts.gstatic 폰트 파일 모두 단축 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* 폰트 CSS 비차단 로드 — 파서 삽입 stylesheet는 렌더를 차단(모바일 LCP 주범, ~115KB)하므로
            preload로 조기 fetch만 걸고, 스크립트 삽입 stylesheet(스펙상 비차단)로 적용.
            display=swap과 결합해 첫 페인트는 시스템 폰트로 즉시 → 로드 후 스왑.
            next/font 전환 금지(인라인 fontFamily 실명 참조 264파일)·웨이트 축소 불가(5웨이트 전부 실사용) 제약 하의 최적안. */}
        <link rel="preload" as="style" href={FONT_CSS_URL} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${FONT_CSS_URL}';document.head.appendChild(l);})();`,
          }}
        />
        <noscript>
          <link rel="stylesheet" href={FONT_CSS_URL} />
        </noscript>

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
        <AutoAds />
        <SiteJsonLd />
        <Nav />
        <main>{children}</main>
        <Footer />
        {/* 모바일 하단 탭바 — 전제: AdSense 앵커 광고 콘솔 OFF (BottomNav.tsx 주석 참조) */}
        <BottomNav />
      </body>
    </html>
  )
}