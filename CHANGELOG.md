# Changelog

Youtil(youtil.kr) 버전 변경 기록. 형식: [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) · 버전 규칙: [SemVer](https://semver.org/lang/ko/).
사용자에게 보이는 정정·추가 내역은 사이트의 [/updates](https://youtil.kr/updates)(업데이트 기록)에 사람이 읽는 문장으로 따로 공개한다(데이터: `app/_trust/updatesData.ts`).

---

## [4.0.0] — 2026-09-26

> **전면 개편 'Trust Ledger'.** 숫자와 그 근거(기준일·공식 출처·작성자·검산·변경 기록)를 한 지면에 나란히 적는 디자인 시스템을 새로 만들고,
> 전 분야 도구의 계산 오류를 감사·검산해 고쳤다. 운영자 공개·편집 원칙·정정 기록 같은 신뢰 페이지를 새로 만들었다.
> 이 항목에는 작업 트리에 실제로 들어간 것만 적는다 — 도구 페이지의 새 컴포넌트 적용(코드모드), 도구 통폐합, 수동 광고 슬롯은 들어가는 대로 추가.

### Changed — 디자인 시스템 (FINAL_SPEC 'Trust Ledger')
- 토큰 전면 교체(`app/globals.css` `:root`) — 쿨그레이 중립 캔버스, 탭 가능한 색은 Youtil Blue 하나(`--accent #1F5EF0`), 분야 11색은 흰 배경 위 AA 이상으로 재조정하고 칩·점·라인 신호로만 사용, 입력 경계 `--field-line`(3.65:1). 레거시 토큰 이름은 모두 유지
- 서체를 Pretendard Variable(dynamic-subset, 비차단 로드) 단일 가변 서체로 통일, JetBrains Mono는 개발 도구(`app/tools/dev/layout.tsx`)에서만
- radius 스케일 xs 6 · s 8 · m 12 · card 16 · lg 20 · pill
- 계산기 UI 키트 `app/styles/ui.css`(`ui-` 접두 — 카드·세그먼트·입력·칩·숫자 그리드·상세 조건·버튼)
- 공용 컴포넌트 신설 — ToolPage·ToolHeader(기준일·작성자·출처 한 줄)·ResultHero·ArticleSheet(본문 시트·자동 섹션 번호)·Rail(이 계산기의 기준·미니 결과·목차)·SourceNotes(참고 자료 + 이 계산기를 만든 방법)·Callout·DataFigure·RelatedTools·SectionBar. 도구 페이지 적용은 후속 코드모드(적용 전까지 도구 머리는 기존 UpdatedMeta의 '기준 점검'·기준·출처 한 줄만 보인다)
- Nav·Footer(운영자·문의·광고 고지)·BottomNav·Faq·Disclaimer·UpdatedMeta 재스타일
- `lib/toolMeta.ts` — 도구별 기준 점검일·최종 업데이트(git)·출처·검산(골든 테스트 통과 도구만) 단일 소스. ToolHeader·Rail·SourceNotes와 ToolPage의 JSON-LD가 읽는다

### Added — 신뢰 페이지
- `/editorial-policy` 편집·검산 원칙(자료 기준, 검산 방식, AI 도구 사용 범위, 기준 점검 주기, 정정 절차 — 출처 표기·검산 도구 수는 빌드 시 집계)
- `/updates` 공개 업데이트 기록(2026-06 이후 실제 정정·기준 반영·새 도구 — git 기록에서 옮겨 적음)
- `/ads-policy` 광고 게재 원칙(현재 Google 자동 광고 — 광고가 나오는 페이지·제외 페이지, 직접 광고 자리를 둘 때의 원칙, 제휴/협찬 표시 원칙 — 제외 목록은 `lib/ads`에서 읽음)
- `/about` 운영자(필명 리만, 1인 운영) 1인칭 소개로 재작성 — 운영자 경험, 검증 방법, 정정 정책, 운영비(광고), 수집 정보
- `/contact`·`/privacy`·`/terms`·`/disclaimer` 재조판(개인정보처리방침 변경 이력 표 복원 — 2026-04 최초 게시부터, 면책조항 연락처 정정 — 1339는 응급 번호가 아님), 404(검색 + 핵심 도구 바로가기, 로또 링크 제거)·오류 화면(광고 금지 신호 `AdFreeScreen`·다시 시도) 재작성, `app/global-error.tsx` 신설

### Fixed — 법정 수치·계산
- 국민연금 기준소득월액 상·하한을 연도 키 대신 7월 기준 기간 스케줄로 적용(2026-07~ 41만/659만 원). 2026-07-01부터 이 수정 전까지 이전 기준(40만/637만 원)으로 계산해 연봉 약 7,900만 원 이상에서 월 연금 보험료가 10,450원 과소 계산되던 오류(7월 개정 반영 지연)
- 취득세 계산을 `lib/krAcquisitionTax.ts`로 통합 — 부동산 수익률 계산기가 지역 입력 없이 2주택에 8%를 매기던 오류 정정, 경매 도구도 같은 함수 사용
- 금융·건강·요리·생활·스포츠·주거·교육·단위·날짜·개발·예술 분야 도구별 감사(발견 → 적대적 검증 → 수정 → 리뷰) 후 계산·사실 오류 수정. 계산 변경은 전후 `.mts` 검산(경계값 포함)
- 금융: 증여 공제 이중 적용·배우자 공제 60억 오입력, 연말정산 표준세액공제 중복, 분양권 세율, 종부세 재산세 중복분 공제, 산재 요율 1/10, 퇴직 근속연수 올림, 단시간 구직급여 하한, 프리랜서 경비율, 복리 이중 적용, 미국 주식 수량 등
- 건강·요리: 자정 넘긴 음주 '완전 분해' 오판(거짓 안전 판정), 대체재 큰술·컵 단위, 반려동물 성장기 판정, 영양제 UL 오판 등
- 주거·스포츠·개발·날짜·예술: 차단기 > 전선 허용전류 3,847건 → 0, 초보 인터벌 페이스, 풀업·딥스 1RM, 골프 핸디캡, 64비트 진법, 해시 형식, 정규식 코드 예시, 신발·브라 사이즈, 쉥겐 기준일, 백일 계산, SMS 바이트·Threads 한도 등
- 법정·시세 수치 추가 단일 소스화(전기요금·유가·자동차세·상속세·음주운전·관세·경비율·대출 규칙·러닝 계수 — 전후 비교 차이 0, 자동차 유지비 유가 혼재 1,650/1,858원 → 1,858원 통일)
- 생활·스포츠: 해외 직구 관부가세 한도·관세율, 사다리 도착 편향, 더치페이 음수 송금액, VIN 연식 해석, 키 백분위, 페이스 칩, 격투기 체급(여성) 등

### Changed — 검색·인프라
- 검색 엔진 개편 — 계산기/계산 접미사 제거·자연어 질의·짧은 별칭 오탐 차단·세금 별칭 교정(회귀 57/57)
- 광고 심사 모드(`AD_REVIEW_MODE`) — 타이머·게임·측정형 화면 광고 제외(승인 후 한 줄로 해제)
- API 보안(og-preview SSRF 방어·CORS 제거·응답 noindex), robots `/api/` 차단, sitemap 정리, lastmod 생성 시 `[skip-lastmod]`·`.lastmod-ignore` 커밋 건너뛰기
- 골든 테스트(`tests/golden`)와 `npm test`, CI(tsc·test·build) 추가


---

## [3.x] — 2026-06 ~ 2026-08 (버전 번호 없이 배포)

> 3.0.0 이후 버전을 올리지 않고 배포한 작업의 요약. 도구별 상세는 /updates.

- **도구별 감사 정정** — 음력 표를 KASI 기준으로 전면 교체(2027 설날 2/6 → 2/7), 군 전역일 월말 오류, 조선 왕 16명 원년, 양도세 보유기간(일수/365.25 → 만 연수), 연봉 소득세 보험료 공제 누락, 4대보험 최저시급 오류값, 복리 월납·연복리 과대, 우주 달력·행성 비교의 만/억 단위 오류, 소리 속도 낙뢰 '안전' 등급 삭제 등
- **기준 반영** — 제헌절·노동절 공휴일 및 대체공휴일(2026 개정), 법정 수치 단일 소스(`lib/krIncomeTax.ts`·`lib/krInsuranceRates.ts`·최저시급)
- **신규 도구** — 세금·연금(양도세·보유세·연말정산·실업급여·국민연금), 생활·개발(자녀 키·징검다리 연휴·수영 페이스·썬팅·한영타·JWT·Cron), 7월 14종(제습기·폭염 수분·카보로딩·FTP·러닝화·GL·HbA1c·내신 5등급·이유식·케이크 팬·키 백분위·LLM VRAM·파크골프·잔존가치), 축구 순위 경우의 수, 가족 호칭
- **콘텐츠** — 운영자 정보 공개(about·contact), 운영자 1인칭 경험(자동차·하프마라톤·책), 설명 부족 도구 약 30종 보강(1차 출처), 전 도구 설명 전수 점검(확정 오류 79건)
- **접근성·모바일** — 입력·터치 기본기, select 대비, 면책 제목 대비(199개 중 198개 AA 미달 정정), 도구 h1 이모지 → 아이콘 배지, 모바일 하단 탭바

---

## [3.0.0] — 2026-05-24

> git 기록(커밋 `3462ed8`)에서 복원한 요약.

- 11개 카테고리 전 도구 표준화 — 면책·"자주 묻는 질문"·"함께 쓰면 좋은 도구" 헤딩과 카드 UI 통일
- YMYL 도구에 공식 출처 링크 추가, 누락·중복 면책 정리
- 신규 도구: 유효숫자·오차 계산기, 과학 단위 변환기
- 광고 인프라: `lib/ads`(제외 경로 단일 소스) + AutoAds 로더, 고위험 페이지 광고 제외
- 개인정보처리방침 보강(웹 비콘·민감정보 처리), 문의 페이지 운영 형태 수정

## [2.0.0] — 2026-05-09

> git 기록(커밋 `eac987b`)에서 복원한 요약.

- 홈 hero 재구성, 통계 한 줄로 간결화
- 신규 도구: 계란 타이머·등산 시간·금 시세 변환·전월세 비교·프리랜서 세금·기술 스택·그라디언트 생성기
- Disclaimer 컴포넌트 통합(85개 도구), ToolSection·GuideDivider 신설
- 면책 고지 디자인 통일(medical/finance/safety/default 4 variant), 페이지별 공유 버튼

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
