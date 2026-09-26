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
      // 골프 3종을 생활 → 스포츠로 카테고리 정리 (SEO 보존)
      { source: '/tools/life/golf-handicap',    destination: '/tools/sports/golf-handicap',  permanent: true },
      { source: '/tools/life/golf-cost',        destination: '/tools/sports/golf-cost',      permanent: true },
      { source: '/tools/life/golf-distance',    destination: '/tools/sports/golf-distance',  permanent: true },

      // ─────────────────────────────────────────────────────────────────────────
      // 음악 → 예술·창작 카테고리 확장 (2026-05-05)
      // music/* → art/* + 디자인·글쓰기 도구 4종을 dev/life에서 art로 이동
      // ※ 영구 유지 — 삭제 금지. 외부 백링크·북마크·검색 색인(네이버 포함)에 옛 URL이 남아 있는 한
      //   301/308은 계속 필요하고 유지 비용은 0이다. 지우면 옛 경로가 404가 되어 링크 가치·유입을 잃는다.
      //   (이 파일의 다른 리다이렉트 블록도 모두 같은 원칙)
      // ─────────────────────────────────────────────────────────────────────────
      { source: '/tools/music',              destination: '/tools/art',              permanent: true },
      { source: '/tools/music/vocal-range',  destination: '/tools/art/vocal-range',  permanent: true },
      { source: '/tools/music/bpm',          destination: '/tools/art/bpm',          permanent: true },
      { source: '/tools/music/frequency',    destination: '/tools/art/frequency',    permanent: true },
      { source: '/tools/music/capo',         destination: '/tools/art/capo',         permanent: true },
      { source: '/tools/music/tap-tempo',    destination: '/tools/art/tap-tempo',    permanent: true },
      { source: '/tools/music/chord',        destination: '/tools/art/chord',        permanent: true },
      { source: '/tools/music/scale',        destination: '/tools/art/scale',        permanent: true },
      { source: '/tools/dev/color',          destination: '/tools/art/color',        permanent: true },
      { source: '/tools/dev/lorem',          destination: '/tools/art/lorem',        permanent: true },
      { source: '/tools/dev/charcount',      destination: '/tools/art/charcount',    permanent: true },
      { source: '/tools/life/golden-ratio',  destination: '/tools/art/golden-ratio', permanent: true },
    ]
  },
};

export default nextConfig;
