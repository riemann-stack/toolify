# youtil.kr (toolify) — 개발 컨벤션

한국어 계산기·도구 모음 (Next.js App Router SSG + TS strict + CSS Modules). 도구 193개(레지스트리 `lib/tools.ts`, 2026-09 기준), 모바일 우선.

## 아키텍처 원칙
- 도구 1개 = `app/tools/<cat>/<slug>/` 디렉터리: `page.tsx`(서버 — metadata·가이드·FAQ·관련도구) + `*Client.tsx`(인터랙션 전용) + `*Utils.ts` + `*.module.css`. 정적 콘텐츠를 Client에 넣지 말 것.
- 도구 간 복붙은 의도된 구조 — 무리한 공용화 금지. 단 **법정·공식 수치(세율·요율·최저시급·상하한·기준표)는 반드시 `lib/` 단일 소스** 사용. 페이지 문구의 법정 숫자도 lib 값을 보간한다(손으로 치지 않기):
  - 소득세 누진세율·지방소득세 비율: `lib/krIncomeTax.ts` · 연말정산: `lib/krYearEndTax.ts`
  - 4대보험 요율·최저시급·월 209시간: `lib/krInsuranceRates.ts` (연도 키 + `minHourlyWageFor(year)`, 국민연금 기준소득월액은 7월 기준 기간 `pensionBaseAt()`, 연금 보험료율 연도 스케줄)
  - 그 밖: 취득세 `krAcquisitionTax` · 이자·배당 원천징수 `krFinancialIncomeTax` · 중개보수 `krBrokerageFee` · 연차 `krLabor` · 주휴·가산수당 `krHourlyPay` · 구직급여(상한 기간표·이직 연도별 하한) `krUnemployment` · 국민연금 `krNationalPension` · 보유세 `krPropertyTax` · 상속·증여 `krInheritanceTax` · 전기요금 `krElectricityRates` · 유가 `krFuelPrices` · 자동차세 `krVehicleTax` · 관세 `krCustoms` · 경비율 `krExpenseRates` · 대출 규칙 `krLoanRules` · 음주운전 `krDrunkDriving` · 러닝 계수 `running`
  - 시점에 따라 바뀌는 값은 '연도/기간 키 + 조회 함수'로 둔다(하드코딩된 `[2026]` 인덱스 대신). 기준일·조문을 주석에 적는다.
  - 오늘 날짜 문자열: `lib/date.ts` `todayStr()` — `toISOString().slice(0,10)` 금지 (KST 00~09시 어제 버그). 날짜가 결과에 영향을 주면 SSG·하이드레이션 불일치가 없게 `buildDate={todayStr()}` prop + 클라이언트 보정(4-insurance·unemployment-benefit 패턴).
- 날짜 파싱: `new Date('YYYY-MM-DD')` 직접 금지 (UTC 해석) — `new Date(y, m-1, d)` 분해 파싱 또는 `'T00:00:00'` 접미.
- 렌더 중 `performance.now()`·`Date.now()`·`Math.random()` 값을 화면에 그리지 말 것(하이드레이션 불일치 React #418) — 마운트 뒤에만 표시.

## 도구 페이지 구조 (새 도구는 app/tools/finance/salary/page.tsx 모양을 따른다)
```
<ToolPage width={760|880} slug="/tools/<cat>/<slug>">
  <h1 className="tp-h1"><ToolIconBadge catId="<cat>" />도구명</h1>
  <p className="tp-lead">무엇을 넣으면 무엇이 나오는지 1~2문장</p>
  <UpdatedMeta date="2026년 9월" basis="…" sources={[{ label, href }]} />   ← toolMeta(기준일·출처)의 데이터 원천
  <XxxClient />
  <GuideDivider />
  가이드: <h2 className="g-h2">, <p className="g-p">, 표는 <DataFigure> 또는 <div className="tableScroll">, 팁·주의는 <Callout tone>
  <Faq items={FAQ_LD} />  <Disclaimer variant sources />  <RelatedTools items={[…]} />
</ToolPage>
```
- ToolPage가 breadcrumb(즐겨찾기·공유)·도구 영역(`data-tool-region`)·가이드 시트(바이라인·목차·참고 자료)·레일(≥1200px)을 자동 구성한다. 분야 아이브로우 `<p>`는 넣지 않는다(breadcrumb가 대신).
- 탭 딥링크: `?tab=` 은 `components/useInitialTab.ts`(마운트 후 허용 목록 검증)로만 읽는다 — 서버 `searchParams` 금지(SSG가 동적 렌더로 바뀜).
- 도구 삭제·병합 시 `next.config.ts`에 영구 301 + 체인 없이 최종 목적지로(`tests/redirects.test.mts`가 검증), 레지스트리·검색 별칭(`lib/search.ts` + `scripts/search-regression.mts`)·컬렉션·분야 가이드·내부 링크(`node scripts/check-internal-links.mjs`)를 함께 정리. `/updates`에 이용자용 기록.

## 콘텐츠 원칙 (애드센스 '가치가 별로 없는 콘텐츠' 거절 대응)
- 도구 페이지 최소선: 리드 1 · 가이드 H2 ≥3 · 데이터 표 ≥1 · FAQ ≥4 · 공식·1차 출처 ≥1(`UpdatedMeta sources`) · 가이드 본문 ≥1,200자 — `node scripts/check-content-slots.mjs`.
- 숫자를 채우려고 쓰는 글은 금지: 형식적 FAQ('무료인가요?' 류), 부풀린 문단, 도구 간 복제 문단, **지어낸 통계·연구·인용·1인칭 경험**. 운영자 실제 경험 노트(GV70 공기압·연비·엔진오일, 밀양·고양 하프, 만세력 원고)는 지우지 않는다.
- 예시 숫자·표는 가능하면 도구와 같은 util/lib로 빌드 시 계산해 계산기 결과와 항상 일치시킨다. 시간에 따라 뒤집히는 결론(예: 유가에 따른 순위)은 문장도 계산 결과로 분기.
- 계산 해설(`/guides`, `lib/guides.ts`): 여러 도구를 잇는 흐름 글. 도구 페이지 가이드를 복붙하지 않는다. 작성자 표기는 필명 '리만'.

## 디자인 토큰 (app/globals.css · app/styles/ui.css)
- 색은 토큰만: `var(--accent)`(#1F5EF0, 텍스트엔 `--accent-ink`), 카테고리 `var(--cat-*)`, 시맨틱 `--success/--warning/--danger`(+`-soft`, 흰 배경 텍스트 AA). 신규 hex 추가 금지. `--red-600`·`--cyan-600` 등 원시 색은 레거시 호환용 — 새 코드는 시맨틱·`--data-*` 토큰.
- **토큰 정의 파일(`app/globals.css`, `app/styles/`)은 색 치환 코드모드 대상에서 제외**(`--x: var(--x)` 순환 = 사이트 전체 색 무효 사고, 78ecd9a).
- 서체: `var(--font-sans)`(Pretendard Variable) · `var(--font-num)` · `var(--font-mono)`(JetBrains Mono는 /tools/dev에서만 로드). 인라인 fontFamily 실명 금지.
- radius: `--radius-xs(6)/s(8)/m(12)/card(16)/lg(20)/pill(999px)`. 간격은 짝수 px. 글자 크기는 정수 px(하프픽셀 금지) — 캡션 하한 11, 보조 13, 본문 16(가이드), 도구 H1 `clamp(28px, 6vw, 36px)`.
- 본문 폭 2종: 760px 기본 / 880px 와이드(표·에디터형). 결과 히어로 숫자: `clamp(44px, 11vw, 72px)` + 단위 0.36em (`ResultHero`).
- 솔리드 버튼 배경은 `--accent-strong` + 흰 글자. UI 키트는 전역 `ui-` 클래스(`app/styles/ui.css`).
- 하단 고정 UI(토스트·스티키 바)는 모바일 하단 탭바 높이만큼 띄운다: `bottom: calc(var(--bottom-nav-h, 0px) + Npx)`.

## 공용 컴포넌트
- FAQ: `<Faq items={FAQ_LD} />` (JSON-LD+화면 동시 렌더). 면책: `<Disclaimer variant sources open>` — 계산기 위(도구 영역)에서는 `open` 쓰지 않기(모바일 첫 화면에서 입력칸이 밀림). 구분선: `<GuideDivider />`. 시간 민감 수치: `<UpdatedMeta>` (기준일+공식 출처 필수).
- 표는 `.tableScroll` 래퍼 또는 `<DataFigure>` (가로 스크롤+섀도 힌트). html/body가 `overflow-x: clip`이라 넘친 요소는 스크롤되지 않고 잘린다 — 360px에서 확인.
- `ResultHero`(주 결과, `role="status"` 포함) · `Callout` · `RelatedTools` · `SourceNotes`(ToolPage가 자동 삽입).

## localStorage
- 키: `youtil:<도구slug>:<용도>-v<n>`. 호출은 `typeof window` 가드 + try/catch 필수. `JSON.parse` 결과는 Array.isArray/enum 검증 후 사용 (무검증 `as T` 금지). 기존 키 개명 금지(데이터 유실 — 병합으로 옮긴 도구도 원래 키 유지). 즐겨찾기·최근은 `lib/userNav.ts`(`youtil:nav:v1`).

## 입력·접근성
- 숫자 입력: 금액은 `type="text" + inputMode="numeric"` + 실시간 콤마(dsr 패턴), 소수는 `inputMode="decimal"`. 파싱은 parseFloat 기반(소수점 자릿수 흡수 버그 주의) + 상한 클램프.
- label↔input은 htmlFor/id 연결 (`scripts/add-input-labels.mjs --dry`로 잔여 확인). 주 결과 히어로엔 `role="status"` 1개(탭이 여럿이면 보이는 탭에 1개). 클릭 가능한 비버튼은 role+tabIndex+onKeyDown (CarCostClient.tsx:349 패턴).
- SVG gradient/filter id는 인스턴스별 고유화: `useId().replace(/[^a-zA-Z0-9_-]/g, '')` 접미사.
- 복사 버튼 토스트 리셋은 1500ms.

## 검증·배포
- 계산 로직 변경 시 node 검산(.mts) 필수 — 전후 비교, 경계값 포함. 법정 계산은 `tests/golden/*.test.mts`(손계산 기대값 + 근거 주석)에 고정하고 `scripts/build-tool-meta.mjs`의 `GOLDEN` 표에 연결(도구 페이지 '검산' 표시).
- 커밋 전 `npx tsc --noEmit && npm test && npm run build`. CI(`.github/workflows/ci.yml`)도 tsc·test·build를 돈다.
- 기계적 일괄 변경(코드모드 등) 커밋은 제목에 `[skip-lastmod]` — 안 붙이면 전 도구의 '최종 업데이트'·dateModified·sitemap lastmod가 그날로 바뀐다. 내용 변경과 섞지 말 것. 그 뒤 `node scripts/build-tool-meta.mjs --write`·`npm run gen:lastmod`.
- main 푸시 = Vercel 자동 배포(~2-5분). 라이브 검증: HTML이 한 줄이므로 `grep -o | wc -l` 사용(`grep -c` 금지), React 주석 마커(`<!-- -->`)가 동적 텍스트를 쪼갬, RSC 페이로드로 콘텐츠 2회+ 출현.
- 폰트는 layout `<head>` `<link>` — next/font 전환 금지.
