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
      { source: '/tools/music/bpm',          destination: '/tools/art/tap-tempo?tab=delay', permanent: true }, // 2026-09-26 art/bpm 통합 → 체인 없이 최종 목적지로
      { source: '/tools/music/frequency',    destination: '/tools/art/frequency',    permanent: true },
      { source: '/tools/music/capo',         destination: '/tools/art/capo',         permanent: true },
      { source: '/tools/music/tap-tempo',    destination: '/tools/art/tap-tempo',    permanent: true },
      { source: '/tools/music/chord',        destination: '/tools/art/chord',        permanent: true },
      { source: '/tools/music/scale',        destination: '/tools/art/scale',        permanent: true },
      { source: '/tools/dev/color',          destination: '/tools/art/color',        permanent: true },
      { source: '/tools/dev/lorem',          destination: '/tools/art/lorem',        permanent: true },
      { source: '/tools/dev/charcount',      destination: '/tools/art/charcount',    permanent: true },
      { source: '/tools/life/golden-ratio',  destination: '/tools/art/golden-ratio', permanent: true },

      // ─────────────────────────────────────────────────────────────────────────
      // 도구 통폐합 (2026-09-26) — 겹치는 도구 10개를 대상 도구의 탭으로 흡수, 2개 폐지
      // ※ 영구 유지 — 삭제 금지 (위 블록과 같은 원칙). ?tab= 은 대상 도구의 useInitialTab이 첫 탭으로 연다.
      //   요청 쿼리(예: 옛 /tools/art/bpm?bpm=120)는 Next가 목적지 쿼리에 합쳐 넘긴다.
      //   새 리다이렉트를 더할 때는 기존 목적지가 옛 경로가 되지 않는지(체인) 확인 — 위 /tools/music/bpm처럼 최종 목적지로 바로.
      // ─────────────────────────────────────────────────────────────────────────
      { source: '/tools/sports/race-plan',       destination: '/tools/sports/pace?tab=plan',               permanent: true },
      { source: '/tools/sports/lsd',             destination: '/tools/sports/interval-training?tab=easy',  permanent: true },
      { source: '/tools/sports/football-points', destination: '/tools/sports/league-scenarios?tab=season', permanent: true },
      { source: '/tools/interior/bolt-wrench',   destination: '/tools/interior/screw?tab=bolt',            permanent: true },
      { source: '/tools/cooking/cake-pan',       destination: '/tools/cooking/baking-recipe?tab=pan',      permanent: true },
      { source: '/tools/art/bpm',                destination: '/tools/art/tap-tempo?tab=delay',            permanent: true },
      { source: '/tools/dev/yaml-json',          destination: '/tools/dev/json?tab=yaml',                  permanent: true },
      { source: '/tools/date/life-time',         destination: '/tools/date/age?tab=life',                  permanent: true },
      { source: '/tools/edu/sci-units',          destination: '/tools/edu/sig-figs?tab=notation',          permanent: true },
      { source: '/tools/finance/stock-decision', destination: '/tools/finance/stock',                      permanent: true },
      // 폐지 — 대체 도구가 없어 분야 허브로. 원칙은 원래 분야 허브(tech-stack → /tools/dev).
      // 예외: fart-risk는 생활 분야(재미·교양 묶음)에 있었지만 내용이 소화기 증상·저FODMAP 식단이라
      //       찾던 사람에게 가까운 도구가 있는 건강 허브로 보낸다 (tests/redirects.test.mts RETIRED와 /updates 문구도 같게).
      { source: '/tools/dev/tech-stack',         destination: '/tools/dev',                                permanent: true },
      { source: '/tools/life/fart-risk',         destination: '/tools/health',                             permanent: true },
    ]
  },
};

export default nextConfig;
