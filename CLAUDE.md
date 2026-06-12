# youtil.kr (toolify) — 개발 컨벤션

한국어 계산기·도구 모음 (Next.js App Router SSG + TS strict + CSS Modules). 도구 172개, 모바일 우선.

## 아키텍처 원칙
- 도구 1개 = `app/tools/<cat>/<slug>/` 디렉터리: `page.tsx`(서버 — metadata·가이드·FAQ·관련도구) + `*Client.tsx`(인터랙션 전용) + `*Utils.ts` + `*.module.css`. 정적 콘텐츠를 Client에 넣지 말 것.
- 도구 간 복붙은 의도된 구조 — 무리한 공용화 금지. 단 **법정 수치(세율·요율·최저시급)는 반드시 `lib/` 단일 소스** 사용:
  - 소득세 누진세율: `lib/krIncomeTax.ts` (progressiveTax·marginalRate)
  - 4대보험 요율·최저시급: `lib/krInsuranceRates.ts` (연도 키)
  - 오늘 날짜 문자열: `lib/date.ts` `todayStr()` — `toISOString().slice(0,10)` 금지 (KST 00~09시 어제 버그)
- 날짜 파싱: `new Date('YYYY-MM-DD')` 직접 금지 (UTC 해석) — `new Date(y, m-1, d)` 분해 파싱 또는 `'T00:00:00'` 접미.

## 디자인 토큰 (globals.css)
- 색은 토큰만: `var(--accent)`(텍스트엔 `--accent-ink`), 카테고리 `var(--cat-*)` 11종, 시맨틱 `--success/--warning/--danger`(600레벨, 텍스트 AA 안전). 신규 hex 추가 금지.
- radius: `--radius-s(8)/m(12)/card(14)/pill(999px)`. 간격은 짝수 px. 폰트 스케일: 11(캡션 하한)/12/13(본문)/14/16/18/20(h2)/clamp h1 — 하프픽셀(12.5px 등) 금지.
- 본문 폭 2종: 760px 기본 / 880px 와이드(표·에디터형). 결과 히어로 숫자: `clamp(44px, 11vw, 72px)` + 단위 0.36em.
- 솔리드 버튼 배경은 `--accent-strong` + 흰 글자.

## 공용 컴포넌트
- FAQ: `<Faq items={FAQ_LD} />` (JSON-LD+화면 동시 렌더). 면책: `<Disclaimer variant sources open>`. 구분선: `<GuideDivider />`. 시간 민감 수치: `<UpdatedMeta>` (기준일+공식 출처 필수).
- 표는 `.tableScroll` 래퍼 (가로 스크롤+섀도 힌트).

## localStorage
- 키: `youtil:<도구slug>:<용도>-v<n>`. 호출은 `typeof window` 가드 + try/catch 필수. `JSON.parse` 결과는 Array.isArray/enum 검증 후 사용 (무검증 `as T` 금지). 기존 키 개명 금지(데이터 유실).

## 입력·접근성
- 숫자 입력: 금액은 `type="text" + inputMode="numeric"` + 실시간 콤마(dsr 패턴), 소수는 `inputMode="decimal"`. 파싱은 parseFloat 기반(소수점 자릿수 흡수 버그 주의) + 상한 클램프.
- label↔input은 htmlFor/id 연결 (`scripts/add-input-labels.mjs --dry`로 잔여 확인). 주 결과 히어로엔 `role="status"` 1개. 클릭 가능한 비버튼은 role+tabIndex+onKeyDown (CarCostClient.tsx:349 패턴).
- SVG gradient/filter id는 인스턴스별 고유화: `useId().replace(/[^a-zA-Z0-9_-]/g, '')` 접미사.
- 복사 버튼 토스트 리셋은 1500ms.

## 검증·배포
- 계산 로직 변경 시 node 검산(.mts) 필수 — 전후 비교, 경계값 포함. 커밋 전 `npx tsc --noEmit && npm run build`.
- main 푸시 = Vercel 자동 배포(~2-5분). 라이브 검증: HTML이 한 줄이므로 `grep -o | wc -l` 사용(`grep -c` 금지), React 주석 마커(`<!-- -->`)가 동적 텍스트를 쪼갬, RSC 페이로드로 콘텐츠 2회+ 출현.
- 폰트는 layout `<head>` `<link>` — next/font 전환 금지(인라인 fontFamily 실명 참조 264파일과 비호환).
