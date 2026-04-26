# Changelog

Youtil(youtil.kr) 버전 변경 기록. 형식: [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) · 버전 규칙: [SemVer](https://semver.org/lang/ko/).

---

## [1.0.0] — 2026-04-26

> **MVP 졸업 · 본격 운영 시작.** 초기 배포 후 약 2주간 카테고리·도구·SEO·인프라 전반을 정비하여 1.0 라인업으로 진입.

### Added — 신규 도구
- **금융·재테크**
  - 부동산 투자 수익률 계산기 (`/tools/finance/real-estate`) — 매매·임대·대출 레버리지 ROE, 매도 시나리오 ±10%, 손익분기 분석
- **스포츠** (신규 카테고리)
  - 격투기 체급 계산기 (`/tools/sports/fight-weight`) — 8 종목, 감량 3단계 일정표, D-day 위험도 평가
  - 야구 타율·OPS 계산기 (`/tools/sports/baseball-stats`) — KBO·MLB·NPB 평균 비교, 세이버메트릭스, 시즌 페이스 환산
  - 축구 승점·순위 계산기 (`/tools/sports/football-points`) — K리그·EPL 등 9 리그 프리셋, 라이벌 추격 시나리오, 시뮬레이션 슬라이더
- **단위·변환**
  - 시간 단위 변환기 (`/tools/unit/time`) — 근무시간 기준 변환·10,000시간 법칙
  - 배터리 용량 변환기 (`/tools/unit/battery`) — mAh↔Wh, 비행기 반입 가능 여부 (100/160 Wh)
  - 연비 변환기 (`/tools/unit/fuel-economy`) — km/L·L/100km·mpg + 전기차 전비
  - 타이어 공기압 변환기 (`/tools/unit/tire-pressure`) — psi·kPa·bar + 차량별 권장 공기압

### Added — 인프라·문서
- 문의 페이지 (`/contact`) — contact@youtil.kr 메일 CTA + 4개 카테고리 안내
- 404 페이지 (`/not-found`) — 인기 도구·카테고리 빠른 진입
- 동적 OG 이미지 (`app/opengraph-image.tsx`) — 1200×630 edge runtime 자동 생성
- AdSlot 컴포넌트 (dev/prod 분리) — 14곳 사전 배치 (홈·전체도구·카테고리 8개·대표 도구 4개)
- `public/ads.txt` placeholder
- `CHANGELOG.md` (이 파일)

### Changed — 카테고리 재편
- **🏃 health**: `건강·안전` → `건강·웰빙` 으로 명칭 정리. 일반 의학·생활건강 7개 도구 (BMI·BMR·임신·반려동물·혈중알코올·영양제·체중감량)
- **⛳ sports**: 신규 카테고리 신설(`#FFD93E`). 골프 3종(`/tools/life/golf-*`) + 러닝 페이스·마라톤 예측·1RM(`/tools/health/*`) 카테고리 이동 (URL 보존, breadcrumb 라벨만 갱신)

### Changed — SEO·메타
- `app/layout.tsx` — Open Graph (locale, siteName), Twitter card, canonical, robots(googleBot max-image-preview), title.template(`%s | Youtil`)
- 뷰포트 메타 분리 + `themeColor: '#0D0D0D'` + `colorScheme: 'dark'`
- 12개 도구 명칭 표준화 (계산기/변환기 종결, desc <25자) — 비만도(BMI)·기초대사량(BMR)·체중 감량 기간·마라톤 기록 예측·1RM·월배당 자산·견과류 섭취량·요리 단위 등

### Changed — 푸터·문서
- 푸터에 면책 안내 배너 추가 (의료·법률·세무·금융 전문가 상담 권고)
- 푸터에 `문의` 링크 추가
- 푸터에 버전 배지 표시 (`v1.0.0`)

### Fixed — 접근성·모바일
- `--muted` 색상 강화 (`#A0A098` → `#B8B8B0`) — WCAG AAA 대비 약 9.5:1
- `--muted-strong` 변수 추가 — 작은 글씨용 더 강한 대비
- iOS Safari 입력 자동 확대(zoom on focus) 4곳 수정 — 임신 주수·양음력·띠별자리·단위 변환기의 select font-size 16px 보정

### Performance
- Google Fonts preconnect (`fonts.googleapis.com` + `fonts.gstatic.com`)
- 빌드 최종 — 92 페이지 (정적 90 + 동적 2 [`/opengraph-image`, `/tools/life/drake`, `/tools/music/bpm`])

---

## [0.1.0] — 2026-04-12 (추정)

### Added — 초기 배포
- 6 카테고리 × 약 60개 무료 도구
- 다크 테마(Syne + Noto Sans KR) · 카테고리 색상 시스템
- Google Analytics + Search Console 연동
- next-sitemap 자동 생성
- About / Privacy / Terms 정책 페이지
