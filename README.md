# Youtil (youtil.kr)

한국 생활에 맞춘 무료 계산기·도구 모음입니다. 연봉 실수령액, 4대보험, 연말정산, 대출·DSR, 퇴직금 같은
돈 계산부터 날짜·건강·요리·단위 변환·개발자 도구까지 11개 카테고리로 나뉘어 있습니다.
로그인 없이 브라우저에서 바로 계산하고, 입력값은 서버로 보내지 않습니다(외부 조회가 필요한 일부 기능 제외).

- 사이트: https://youtil.kr
- 도구 목록의 단일 소스: `lib/tools.ts` (카테고리·이름·설명·경로)
- 개발 컨벤션: **[CLAUDE.md](./CLAUDE.md)** — 코드를 고치기 전에 반드시 읽을 것

## 기술 스택

| 영역 | 사용 |
|---|---|
| 프레임워크 | Next.js 16 App Router — 도구 페이지는 정적 생성(SSG) |
| UI | React 19, CSS Modules, 전역 디자인 토큰(`app/globals.css`) |
| 언어 | TypeScript strict |
| 폰트 | Google Fonts `<link>` (layout `<head>`). `next/font` 전환 금지 — 사유는 CLAUDE.md |
| 테스트 | `node:test` + `tsx` (`tests/**/*.test.mts`) |
| 호스팅 | Vercel (main 푸시 = 프로덕션 자동 배포) |
| 분석·광고 | GA4, Google AdSense (설정: `lib/ads.ts`) |

Node.js 22 기준입니다(CI와 동일).

## 디렉터리

```
app/
  tools/<카테고리>/<도구>/   도구 1개 = page.tsx(서버: 메타·가이드·FAQ) + *Client.tsx(인터랙션)
                            + *Utils.ts(계산) + *.module.css
  api/                      og-preview · proxy-time · time · speedtest · produce-price (+ _lib 공용 보안 헬퍼)
  collections/              상황별 도구 모음
  sitemap.ts · robots.ts    sitemap-lastmod.json(git 이력 기반 lastmod)을 읽어 사이트맵 생성
  popular-tools.json        GA4 조회수 기반 인기 도구 순서(주간 자동 갱신)
components/                 공용 컴포넌트 (Faq, Disclaimer, UpdatedMeta, AutoAds, AdSlot …)
lib/                        레지스트리·검색·SEO 헬퍼, 법정 수치 단일 소스(krIncomeTax, krInsuranceRates …)
scripts/                    매니페스트 생성·일괄 수정·검사 스크립트
tests/                      회귀·골든 테스트
```

## 명령어

```bash
npm ci                 # 의존성 설치
npm run dev            # 개발 서버 (http://localhost:3000)
npm run build          # 프로덕션 빌드 (정적 생성 포함)
npm start              # 빌드 결과 실행
npm test               # 테스트 (tests/**/*.test.mts) — 외부 네트워크 없이 실행
NET_TESTS=1 npm test   # 실제 외부 연결이 필요한 케이스까지 포함 (로컬 점검용, CI에서는 생략)
npm run lint           # ESLint
npx tsc --noEmit       # 타입 검사 (새로 클론했다면 먼저 `npx next typegen` — next-env.d.ts 생성)
```

커밋 전에는 `npx tsc --noEmit && npm test && npm run build`를 통과시킵니다. 계산 로직을 바꿨다면
전후 비교·경계값 검산을 함께 합니다(CLAUDE.md "검증·배포").

### 데이터 매니페스트

| 명령 | 하는 일 |
|---|---|
| `npm run gen:lastmod` | git 커밋 이력으로 페이지별 마지막 변경일을 계산해 `app/sitemap-lastmod.json`을 다시 씁니다. 전체 git 이력이 필요합니다. `-- --dry`를 붙이면 파일을 쓰지 않고 바뀔 항목만 보여 줍니다. |
| `npm run gen:popular` | GA4 최근 28일 조회수로 `app/popular-tools.json`을 갱신합니다. 환경변수 `GA4_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_KEY`가 없으면 아무것도 바꾸지 않습니다. 보통은 GitHub Actions가 매주 실행합니다. |

**lastmod 규칙.** 콘텐츠를 바꾼 커밋이 들어간 뒤 `gen:lastmod`를 실행하고 결과를 커밋합니다.
토큰·색·헤더 코드모드나 포맷팅처럼 표현만 바꾼 전역 커밋이 수백 페이지의 lastmod를 같은 날로
리셋하면 안 됩니다. 그런 커밋은 제목에 `[skip-lastmod]`를 넣거나, 이미 만든 커밋이면 해시를
`.lastmod-ignore`에 등록합니다. 두 경우 모두 lastmod 계산에서 제외됩니다.

### 보조 스크립트

| 스크립트 | 용도 |
|---|---|
| `node scripts/check-internal-links.mjs` | 내부 `/tools/*` 링크가 레지스트리에 있는지 검사 |
| `node scripts/check-self-links.mjs` | Disclaimer 관련 링크가 자기 페이지를 가리키는지 검사 |
| `node scripts/add-input-labels.mjs --dry` | label↔input `htmlFor`/`id` 연결이 빠진 곳 확인 (`--dry` 없이 실행하면 수정) |
| `node scripts/add-th-scope.mjs --dry` | `<th>`의 `scope` 누락 확인 |
| `npx tsx scripts/search-regression.mts` | 검색 품질 회귀 케이스 실행 |

스크립트는 자기 위치에서 저장소 루트를 찾으므로 어느 디렉터리에서 실행해도 됩니다.

## 환경변수

| 이름 | 쓰는 곳 | 비고 |
|---|---|---|
| `KAMIS_API_KEY`, `KAMIS_API_ID` | `/api/produce-price` | KAMIS 농산물 시세. 없으면 평균 소매가로 폴백합니다. |
| `KAMIS_DEBUG_TOKEN` | `/api/produce-price?debug=1` | 16자 이상. 요청 헤더 `x-debug-token`이 일치할 때만 진단 모드가 열립니다. 설정하지 않으면 진단 모드는 꺼져 있습니다. |
| `GA4_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_KEY` | `gen:popular` | GitHub Actions Secrets에 둡니다. 저장소에 커밋하지 않습니다. |

## 광고 설정

`lib/ads.ts` 한 곳에서 관리합니다. 광고는 실재하는 도구 페이지에만 붙습니다. 홈·카테고리·컬렉션·정책
페이지와 404, 민감 주제 도구(주류·복권·민감 건강 정보)는 제외됩니다.

오류 화면처럼 경로는 도구 페이지 그대로인 '콘텐츠 없는 화면'은 `<AdFreeScreen />`
(`components/AutoAds.tsx`)으로 막습니다. 이 표지는 **렌더된 화면에서만** 효과가 있으므로, 오류 화면이
보호되는지는 `app/error.tsx`가 `<AdFreeScreen />`을 렌더하는지에 달려 있습니다. 렌더하는 동안에는
광고 스크립트를 새로 넣지 않고 수동 슬롯도 만들지 않습니다. 스크립트가 이미 로드된 뒤라면
`adsbygoogle.pauseAdRequests = 1`로 신규 요청 보류를 시도하지만, Google이 문서화한 사용법은 로드 전에
1로 두었다가 0으로 재개하는 것뿐이라 이 보류는 best-effort입니다. 배포 후 DevTools 네트워크 패널
(`googlesyndication|doubleclick` 필터)에서 도구 페이지 → 오류 화면·광고 제외 페이지로 SPA 이동했을 때
신규 광고 요청이 멈추는지 확인합니다.

AdSense 심사 기간에는 `AD_REVIEW_MODE = true`로 두어 타이머·게임·측정형 화면을 추가로 제외합니다.
승인 뒤 `false`로 바꾸는 커밋은 콘텐츠 변경이 아니므로 제목에 `[skip-lastmod]`를 붙입니다.

## 배포

- `main`에 푸시하면 Vercel이 자동으로 프로덕션 배포합니다(보통 2~5분).
- `.github/workflows/ci.yml`: PR과 `main` 푸시마다 타입 검사, 테스트, 빌드를 실행합니다.
  lint는 기존 오류가 정리될 때까지 결과만 보고하고 실패로 처리하지 않습니다.
- `.github/workflows/refresh-popular.yml`: 매주 월요일 04:00 KST에 인기 도구 매니페스트를 갱신해 `main`에 푸시합니다.
  봇 커밋 제목에는 `[skip ci] [skip-lastmod]`가 붙습니다. 순위 재정렬은 콘텐츠 변경이 아니므로 홈 lastmod를 바꾸지 않습니다
  (`gen:lastmod`도 홈 입력에서 `app/popular-tools.json`을 빼 두었습니다).
- 배포 후 라이브 HTML은 한 줄이므로 `grep -c` 대신 `grep -o … | wc -l`로 셉니다. 자세한 내용은 CLAUDE.md를 봅니다.
- `next.config.ts`의 301 리다이렉트는 영구 유지합니다. 옛 URL로 들어오는 외부 링크와 색인이 남아 있는 한 지우지 않습니다.
