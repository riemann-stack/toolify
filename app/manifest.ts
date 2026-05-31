import type { MetadataRoute } from 'next'

// PWA 매니페스트 — '웹 앱으로 설치' 시 이름·테마·아이콘.
// 아이콘 파일은 아래 경로에 직접 넣어주세요(없으면 설치 아이콘만 비어 보임):
//   public/icon-192.png        (192×192)  ← Android 홈 화면
//   public/icon-512.png        (512×512)  ← 스플래시·고해상도
//   public/icon-512-maskable.png (512×512, 안전여백 포함) ← Android 적응형(선택)
// iOS 홈 화면 아이콘은 매니페스트가 아니라 app/apple-icon.png(180×180)를 사용합니다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    short_name: 'Youtil',
    description: '금융·건강·생활·날짜·변환·개발자 도구까지 한곳에. 로그인 없이 즉시 사용하는 무료 계산기 모음.',
    lang: 'ko',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#f0f7ff',
    theme_color: '#f0f7ff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
