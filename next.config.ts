import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 스포츠 카테고리 정리: /tools/health/* → /tools/sports/* 영구 이동 (SEO 보존)
      { source: '/tools/health/pace',           destination: '/tools/sports/pace',           permanent: true },
      { source: '/tools/health/race-predictor', destination: '/tools/sports/race-predictor', permanent: true },
      { source: '/tools/health/one-rm',         destination: '/tools/sports/one-rm',         permanent: true },
      // 날짜 차이 계산기 → D-day 계산기 [두 날짜 사이] 탭으로 통합 (SEO 보존)
      { source: '/tools/date/diff',             destination: '/tools/date/dday',             permanent: true },
      // 단위 카테고리 정리: 단순 변환 4개 → 통합 단위 변환기로 흡수 (SEO 보존)
      { source: '/tools/unit/length',           destination: '/tools/unit/converter',        permanent: true },
      { source: '/tools/unit/weight',           destination: '/tools/unit/converter',        permanent: true },
      { source: '/tools/unit/temperature',      destination: '/tools/unit/converter',        permanent: true },
      { source: '/tools/unit/time',             destination: '/tools/unit/converter',        permanent: true },
    ]
  },
};

export default nextConfig;
