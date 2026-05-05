/* HTTP 상태 코드 검색기 — 데이터 + 검색 함수 */

export type CategoryKey = '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'nonstandard'
export type CategoryFilter = CategoryKey | 'all' | 'favorites'
export type DebugCategory = 'all' | 'auth' | 'cors' | 'timeout' | 'rate' | 'server' | 'redirect' | 'validation'

/* ─────────────────────────────────────────────
   카테고리 메타
   ───────────────────────────────────────────── */
export const CATEGORY_META: Record<CategoryKey, { color: string; label: string; range: string; desc: string; emoji: string }> = {
  '1xx':           { color: '#888888', label: 'Informational', range: '100–199', desc: '정보성 응답 (드물게 사용)', emoji: 'ℹ️' },
  '2xx':           { color: '#3EFFD0', label: 'Success',       range: '200–299', desc: '요청 성공',                emoji: '✅' },
  '3xx':           { color: '#3EC8FF', label: 'Redirect',      range: '300–399', desc: '리다이렉트',              emoji: '↪️' },
  '4xx':           { color: '#FFB83E', label: 'Client Error',  range: '400–499', desc: '클라이언트 오류',          emoji: '⚠️' },
  '5xx':           { color: '#FF3E8C', label: 'Server Error',  range: '500–599', desc: '서버 오류',               emoji: '🚨' },
  nonstandard:     { color: '#9B59B6', label: 'Non-standard',  range: '벤더',     desc: 'Cloudflare·nginx 비표준',  emoji: '🔌' },
}

export const CATEGORIES: { id: CategoryFilter; label: string; emoji: string }[] = [
  { id: 'all',         label: '전체',     emoji: '✨' },
  { id: '1xx',         label: '1xx',      emoji: 'ℹ️' },
  { id: '2xx',         label: '2xx',      emoji: '✅' },
  { id: '3xx',         label: '3xx',      emoji: '↪️' },
  { id: '4xx',         label: '4xx',      emoji: '⚠️' },
  { id: '5xx',         label: '5xx',      emoji: '🚨' },
  { id: 'nonstandard', label: '비표준',   emoji: '🔌' },
  { id: 'favorites',   label: '⭐ 즐겨찾기', emoji: '⭐' },
]

export const POPULAR_CODES = [200, 301, 302, 400, 401, 403, 404, 429, 500, 502, 503, 504]

/* ─────────────────────────────────────────────
   StatusCode 데이터 구조
   ───────────────────────────────────────────── */
export interface StatusCode {
  code: number
  category: CategoryKey
  name: string                              /* English */
  nameKr: string                            /* Korean */
  emoji: string
  shortDesc: string                         /* 한 줄 한국어 */
  longDesc: string                          /* 자세한 한국어 */
  whenItHappens: string[]                   /* 발생 시기 (3-5) */
  howToFix: string[]                        /* 해결 힌트 (3-5) */
  koreanCase?: string                       /* 한국 사이트 사례 */
  example?: { lang: string; body: string }
  rfc?: string
  rfcUrl?: string
  isStandard: boolean
  source?: string                           /* 'Cloudflare' | 'nginx' (비표준 시) */
}

/* ─────────────────────────────────────────────
   ALL_CODES (60+ 상태 코드)
   ───────────────────────────────────────────── */
export const ALL_CODES: StatusCode[] = [
  /* ═══ 1xx Informational (3) ═══ */
  {
    code: 100, category: '1xx', name: 'Continue', nameKr: '계속',
    emoji: 'ℹ️',
    shortDesc: '클라이언트가 요청을 계속 보내도 됨',
    longDesc: 'Expect: 100-continue 헤더로 큰 본문 전송 전에 서버 OK 확인. 거의 사용 안됨.',
    whenItHappens: ['POST/PUT 큰 본문 전송 전 서버 사전 확인', 'curl --expect100-timeout 사용 시'],
    howToFix: ['정상 동작 — 추가 작업 불필요'],
    isStandard: true, rfc: 'RFC 7231 §6.2.1',
  },
  {
    code: 101, category: '1xx', name: 'Switching Protocols', nameKr: '프로토콜 전환',
    emoji: '🔀',
    shortDesc: '프로토콜 전환 요청 수락 (예: HTTP → WebSocket)',
    longDesc: 'Upgrade 헤더로 요청한 프로토콜로 전환. WebSocket 핸드셰이크에서 자주 사용.',
    whenItHappens: ['WebSocket 연결 수립', 'HTTP/1.1 → HTTP/2 업그레이드'],
    howToFix: ['정상 — Upgrade 응답 헤더 확인'],
    koreanCase: '카카오톡 채팅·네이버 라이브 스트리밍 WebSocket 핸드셰이크',
    isStandard: true, rfc: 'RFC 7231 §6.2.2',
  },
  {
    code: 103, category: '1xx', name: 'Early Hints', nameKr: '조기 힌트',
    emoji: '💨',
    shortDesc: '최종 응답 전 미리 힌트 전송 (preload·preconnect)',
    longDesc: '서버가 본 응답 처리 중에 미리 Link 헤더로 리소스 preload 힌트 전송. 페이지 로딩 속도 향상.',
    whenItHappens: ['Cloudflare·Fastly 등 CDN이 preload 힌트 전송', '대형 사이트 LCP 최적화'],
    howToFix: ['Link: <css>; rel=preload 헤더 정상 처리'],
    isStandard: true, rfc: 'RFC 8297',
  },

  /* ═══ 2xx Success (7) ═══ */
  {
    code: 200, category: '2xx', name: 'OK', nameKr: '성공',
    emoji: '✅',
    shortDesc: '요청이 성공적으로 처리되었습니다',
    longDesc: '가장 일반적인 성공 응답. GET/POST/PUT/DELETE 등 모든 메서드의 정상 처리. 본문에 결과 포함.',
    whenItHappens: ['GET 요청이 정상 데이터 반환', 'POST 처리 후 결과 본문 반환', 'API가 정상 응답', 'PUT으로 리소스 정상 업데이트'],
    howToFix: ['정상 응답 — 추가 작업 불필요'],
    koreanCase: '네이버 검색 API 정상 응답, 카카오 OAuth 토큰 발급 성공',
    example: { lang: 'json', body: '{ "status": "success", "data": { "id": 1, "name": "user" } }' },
    isStandard: true, rfc: 'RFC 7231 §6.3.1',
  },
  {
    code: 201, category: '2xx', name: 'Created', nameKr: '생성됨',
    emoji: '🎉',
    shortDesc: 'POST 요청으로 새 리소스가 생성되었습니다',
    longDesc: 'POST·PUT 요청으로 새 리소스가 생성됨. Location 헤더에 새 리소스 URL 포함 권장.',
    whenItHappens: ['POST /users 로 새 사용자 생성', 'PUT /articles/123 으로 새 게시글 등록', 'PaymentIntent 생성 등 결제 객체 생성'],
    howToFix: ['정상 — Location 헤더로 새 리소스 위치 확인'],
    koreanCase: '토스페이먼츠 결제 생성 응답 (paymentKey 반환)',
    example: { lang: 'json', body: '{ "id": 42, "createdAt": "2026-05-05T12:00:00Z" }' },
    isStandard: true, rfc: 'RFC 7231 §6.3.2',
  },
  {
    code: 202, category: '2xx', name: 'Accepted', nameKr: '수락됨',
    emoji: '⏳',
    shortDesc: '요청은 수락되었지만 처리는 비동기로 진행 중',
    longDesc: '비동기 작업·큐 처리 시작 — 결과는 별도 polling 또는 webhook으로 확인.',
    whenItHappens: ['배치 작업 큐에 추가', '대용량 파일 처리·이메일 발송 비동기', 'AWS SQS·SNS·Lambda 비동기 호출'],
    howToFix: ['Location 헤더 또는 응답 본문의 task_id로 상태 polling'],
    koreanCase: '대량 메시지 발송 API (수락 후 백그라운드 처리)',
    isStandard: true, rfc: 'RFC 7231 §6.3.3',
  },
  {
    code: 204, category: '2xx', name: 'No Content', nameKr: '본문 없음',
    emoji: '📭',
    shortDesc: '성공했지만 응답 본문이 없습니다',
    longDesc: '주로 DELETE 성공 또는 PUT 후 변경 사항만 알릴 때. 본문 0 bytes.',
    whenItHappens: ['DELETE /users/123 정상 삭제', 'PUT 후 변경 결과 반환 불필요', 'CORS preflight OPTIONS 성공 응답'],
    howToFix: ['정상 — 응답 본문 파싱 X (.json() 호출 X)'],
    example: { lang: 'json', body: '(빈 본문)' },
    isStandard: true, rfc: 'RFC 7231 §6.3.5',
  },
  {
    code: 206, category: '2xx', name: 'Partial Content', nameKr: '부분 콘텐츠',
    emoji: '📦',
    shortDesc: '범위(Range) 요청이 성공해 일부 콘텐츠 반환',
    longDesc: 'Range 헤더로 파일 일부만 받을 때 응답. 동영상 스트리밍·이어받기.',
    whenItHappens: ['동영상 streaming (YouTube·Netflix)', '파일 이어받기 (resume download)', 'Content-Range 응답'],
    howToFix: ['Content-Range 응답 헤더로 받은 범위 확인'],
    isStandard: true, rfc: 'RFC 7233 §4.1',
  },
  {
    code: 207, category: '2xx', name: 'Multi-Status', nameKr: '다중 상태',
    emoji: '📊',
    shortDesc: 'WebDAV — 여러 리소스 상태를 한 번에 응답',
    longDesc: 'WebDAV (Web Distributed Authoring) 전용. XML 본문에 여러 리소스의 상태 포함.',
    whenItHappens: ['WebDAV PROPFIND·PROPPATCH 요청', 'Microsoft Exchange·OwnCloud·Nextcloud'],
    howToFix: ['XML 본문 파싱하여 각 리소스 상태 확인'],
    isStandard: true, rfc: 'RFC 4918 §11.1',
  },
  {
    code: 226, category: '2xx', name: 'IM Used', nameKr: 'IM 사용됨',
    emoji: '🔧',
    shortDesc: 'Delta encoding (RFC 3229) — 거의 사용 안됨',
    longDesc: 'HTTP Delta Encoding 응답. 매우 드물게 사용.',
    whenItHappens: ['Delta encoding 지원 서버 (실무에서 보기 매우 드묾)'],
    howToFix: ['IM 응답 헤더 확인'],
    isStandard: true, rfc: 'RFC 3229',
  },

  /* ═══ 3xx Redirect (7) ═══ */
  {
    code: 300, category: '3xx', name: 'Multiple Choices', nameKr: '여러 선택',
    emoji: '🔀',
    shortDesc: '여러 응답 후보 중 클라이언트가 선택',
    longDesc: '거의 사용 안됨. 자원에 여러 표현(언어·형식)이 있을 때.',
    whenItHappens: ['콘텐츠 협상 (드묾)'],
    howToFix: ['Location 또는 본문에서 옵션 선택'],
    isStandard: true, rfc: 'RFC 7231 §6.4.1',
  },
  {
    code: 301, category: '3xx', name: 'Moved Permanently', nameKr: '영구 이동',
    emoji: '🔀',
    shortDesc: '리소스가 영구적으로 새 URL로 이동했습니다',
    longDesc: 'SEO·검색엔진은 새 URL로 인덱싱 갱신. 캐시 가능. POST → GET 변환 가능 (구식 동작).',
    whenItHappens: ['도메인 변경 (daum.net → kakao.com 일부 페이지)', 'http → https 마이그레이션', 'URL 구조 개편 (영구)'],
    howToFix: ['Location 헤더의 새 URL로 자동 follow', '북마크·링크 업데이트 권장', 'SEO에는 301 사용 (302 X)'],
    koreanCase: '다음 → 카카오 URL 변경, 네이버 블로그 → 새 도메인',
    isStandard: true, rfc: 'RFC 7231 §6.4.2',
  },
  {
    code: 302, category: '3xx', name: 'Found', nameKr: '임시 이동',
    emoji: '↪️',
    shortDesc: '리소스가 임시로 다른 URL에 있습니다',
    longDesc: '임시 리다이렉트. 검색엔진은 원본 URL 유지. 다음 요청 시 다시 원본으로.',
    whenItHappens: ['로그인 후 리다이렉트', 'A/B 테스트로 임시 분기', '점검 페이지로 임시 이동'],
    howToFix: ['Location 헤더로 follow', 'SEO 영구 이동이면 301 사용 권장', 'POST → GET 변환 주의 (303 또는 307이 명확)'],
    isStandard: true, rfc: 'RFC 7231 §6.4.3',
  },
  {
    code: 303, category: '3xx', name: 'See Other', nameKr: '다른 위치 참조',
    emoji: '👀',
    shortDesc: 'POST 후 GET으로 결과 페이지 이동 (PRG 패턴)',
    longDesc: 'Post-Redirect-Get 패턴. POST 처리 후 결과 페이지로 GET 이동 명시.',
    whenItHappens: ['주문 완료 후 주문 상세 페이지로', 'Form POST 후 새로고침 시 재제출 방지'],
    howToFix: ['Location 헤더로 GET 요청'],
    isStandard: true, rfc: 'RFC 7231 §6.4.4',
  },
  {
    code: 304, category: '3xx', name: 'Not Modified', nameKr: '수정되지 않음',
    emoji: '🔄',
    shortDesc: '캐시된 버전이 최신 — 본문 전송 안 함',
    longDesc: 'If-Modified-Since·If-None-Match 조건부 요청에서 변경 없음. 브라우저 캐시 효율.',
    whenItHappens: ['이미지·CSS·JS 캐시 적중', 'ETag 일치', 'Last-Modified 변경 없음'],
    howToFix: ['정상 — 브라우저 캐시 활용', 'Cache-Control·ETag 헤더 정상 설정 확인'],
    isStandard: true, rfc: 'RFC 7232 §4.1',
  },
  {
    code: 307, category: '3xx', name: 'Temporary Redirect', nameKr: '임시 리다이렉트',
    emoji: '↪️',
    shortDesc: '302와 비슷하지만 메서드·본문 그대로 유지',
    longDesc: '302와 달리 POST → POST, PUT → PUT으로 메서드 보존. 본문도 그대로.',
    whenItHappens: ['POST 요청을 다른 서버로 임시 분기', '메서드 보존 필요한 임시 이동'],
    howToFix: ['Location으로 동일 메서드로 재요청'],
    isStandard: true, rfc: 'RFC 7231 §6.4.7',
  },
  {
    code: 308, category: '3xx', name: 'Permanent Redirect', nameKr: '영구 리다이렉트',
    emoji: '🔀',
    shortDesc: '301과 비슷하지만 메서드·본문 그대로 유지',
    longDesc: '301의 현대적 대체. POST → POST 보존. 캐시 가능.',
    whenItHappens: ['REST API URL 영구 변경 (메서드 보존)', 'http → https 영구 이동 (POST 포함)'],
    howToFix: ['Location으로 동일 메서드로 재요청'],
    isStandard: true, rfc: 'RFC 7538',
  },

  /* ═══ 4xx Client Error (26) ═══ */
  {
    code: 400, category: '4xx', name: 'Bad Request', nameKr: '잘못된 요청',
    emoji: '❌',
    shortDesc: '요청 형식이 잘못되었습니다 (문법 오류·잘못된 JSON 등)',
    longDesc: '서버가 요청을 이해할 수 없음. 클라이언트가 요청을 수정해야 함.',
    whenItHappens: ['JSON 파싱 오류 (구문 잘못, 콤마 누락 등)', '필수 파라미터 누락', '잘못된 형식 (날짜·이메일 등)', '쿼리 스트링 오류', 'JWT 형식 불량'],
    howToFix: ['요청 본문 JSON 검증 (jsonlint)', '필수 필드 확인', '응답 본문의 errors 필드 참조', 'curl -v로 실제 전송 데이터 확인'],
    koreanCase: '카카오 API에 잘못된 template_object 전송 시 400',
    example: { lang: 'json', body: '{ "code": 400, "msg": "Invalid JSON: unexpected token at line 3" }' },
    isStandard: true, rfc: 'RFC 7231 §6.5.1',
  },
  {
    code: 401, category: '4xx', name: 'Unauthorized', nameKr: '인증 필요',
    emoji: '🔐',
    shortDesc: '인증 정보가 없거나 잘못되었습니다 (실제 의미: 인증 안됨)',
    longDesc: "이름과 달리 '권한 부족'이 아닌 '인증 정보 누락/만료'를 의미. 'Unauthenticated'에 더 가까움. WWW-Authenticate 헤더로 인증 방식 안내.",
    whenItHappens: [
      'Authorization 헤더 누락',
      'JWT 토큰 만료 (exp 시간 지남)',
      '잘못된 API 키 또는 형식',
      'OAuth access_token 만료 → refresh_token으로 갱신 필요',
      'Bearer 접두사 누락 (Authorization: TOKEN ❌ → Authorization: Bearer TOKEN ✅)',
    ],
    howToFix: [
      'Authorization 헤더 확인 (Bearer 접두사 포함)',
      '토큰 만료 여부 확인 (jwt.io에서 디코드)',
      'OAuth refresh_token으로 새 access_token 발급',
      'API 키 권한 범위 확인 (스코프)',
      'WWW-Authenticate 응답 헤더 확인',
    ],
    koreanCase: '카카오 OAuth access_token 만료 (6시간) → kapi.kakao.com 401 응답',
    example: { lang: 'json', body: '{ "code": 401, "msg": "Invalid access token", "error": "unauthorized" }' },
    isStandard: true, rfc: 'RFC 7235 §3.1',
  },
  {
    code: 402, category: '4xx', name: 'Payment Required', nameKr: '결제 필요',
    emoji: '💳',
    shortDesc: '결제가 필요합니다 (대부분 미사용)',
    longDesc: '원래 디지털 결제용으로 예약됐지만 표준화 안됨. Stripe·일부 SaaS API에서 사용.',
    whenItHappens: ['Stripe·SaaS API에서 결제 실패·구독 만료', 'Cloudflare에서 일부 사용'],
    howToFix: ['결제 정보 갱신·구독 활성화', 'Stripe Dashboard 확인'],
    isStandard: true, rfc: 'RFC 7231 §6.5.2',
  },
  {
    code: 403, category: '4xx', name: 'Forbidden', nameKr: '금지됨',
    emoji: '🚫',
    shortDesc: '인증은 됐지만 접근 권한이 없습니다',
    longDesc: '401과 달리 인증은 됐지만 해당 리소스에 권한이 없음. 401과 명확히 구분 필요.',
    whenItHappens: [
      '권한이 없는 리소스 접근 (다른 사용자 데이터)',
      'API 키의 스코프 부족',
      'IP 차단 (지역 제한·블랙리스트)',
      'CDN/CloudFront 서명 만료·잘못됨',
      'Referer 헤더 차단 (이미지 hotlink 방지)',
    ],
    howToFix: [
      'API 키의 권한 범위 확인',
      '관리자에게 권한 요청',
      'IP 차단 여부 확인 (VPN으로 테스트)',
      'CloudFront 서명 URL 갱신',
      'Referer 헤더 추가 또는 제거',
    ],
    koreanCase: '토스페이먼츠 잘못된 시크릿 키 사용 시 403, 쿠팡 이미지 다른 사이트에서 hotlink 시도 시 403',
    example: { lang: 'json', body: '{ "code": 403, "msg": "Permission denied", "required_scope": "write:users" }' },
    isStandard: true, rfc: 'RFC 7231 §6.5.3',
  },
  {
    code: 404, category: '4xx', name: 'Not Found', nameKr: '찾을 수 없음',
    emoji: '🔍',
    shortDesc: '요청한 리소스를 찾을 수 없습니다',
    longDesc: '가장 유명한 오류 코드. URL이 잘못됐거나 리소스가 삭제됨.',
    whenItHappens: ['URL 오타·잘못된 경로', '삭제된 리소스 요청', 'API 엔드포인트 변경', '권한이 없을 때 404로 위장 (보안 정보 은폐)'],
    howToFix: ['URL 철자 확인', 'API 문서에서 정확한 경로 확인', '리소스가 실제 존재하는지 (DB·관리자 페이지)', '권한 문제일 가능성도 검토 (실제로는 403일 수 있음)'],
    koreanCase: '쿠팡 상품 페이지 사라짐, 네이버 카페 글 삭제 후 404',
    example: { lang: 'json', body: '{ "code": 404, "msg": "Resource not found" }' },
    isStandard: true, rfc: 'RFC 7231 §6.5.4',
  },
  {
    code: 405, category: '4xx', name: 'Method Not Allowed', nameKr: '허용되지 않은 메서드',
    emoji: '🚷',
    shortDesc: 'HTTP 메서드가 허용되지 않습니다 (예: GET 전용에 POST)',
    longDesc: 'Allow 응답 헤더에 허용된 메서드 목록. CORS preflight OPTIONS 누락 시 자주 발생.',
    whenItHappens: ['GET 전용 라우트에 POST 호출', 'CORS preflight OPTIONS 미처리', 'REST API에 허용되지 않은 메서드'],
    howToFix: ['Allow 응답 헤더로 허용 메서드 확인', '서버 라우팅 설정 검토 (Express·Spring·FastAPI)', 'CORS 미들웨어로 OPTIONS 자동 응답'],
    isStandard: true, rfc: 'RFC 7231 §6.5.5',
  },
  {
    code: 406, category: '4xx', name: 'Not Acceptable', nameKr: '허용 불가',
    emoji: '🙅',
    shortDesc: 'Accept 헤더와 호환되는 응답 형식이 없습니다',
    longDesc: '클라이언트의 Accept 헤더(예: application/xml)와 서버 가능 형식(JSON만)이 불일치.',
    whenItHappens: ['Accept: application/xml 요청에 JSON만 가능한 서버', '언어·인코딩 협상 실패'],
    howToFix: ['Accept 헤더 변경 (application/json)', 'Accept: */* 사용으로 모든 형식 허용'],
    isStandard: true, rfc: 'RFC 7231 §6.5.6',
  },
  {
    code: 407, category: '4xx', name: 'Proxy Authentication Required', nameKr: '프록시 인증 필요',
    emoji: '🔒',
    shortDesc: '프록시 서버 인증이 필요합니다',
    longDesc: '401과 비슷하지만 프록시 서버용. Proxy-Authenticate 헤더로 인증 방식 안내.',
    whenItHappens: ['회사 사내망 프록시 사용 시', '인증 프록시 통과 필요'],
    howToFix: ['Proxy-Authorization 헤더 추가', 'curl --proxy-user user:pass'],
    isStandard: true, rfc: 'RFC 7235 §3.2',
  },
  {
    code: 408, category: '4xx', name: 'Request Timeout', nameKr: '요청 시간 초과',
    emoji: '⏱️',
    shortDesc: '서버가 요청을 기다리다 시간 초과 (클라이언트가 늦음)',
    longDesc: '클라이언트가 요청을 보내는 데 너무 오래 걸림. 504와 다름 (504는 서버가 늦음).',
    whenItHappens: ['클라이언트 인터넷 느림', '큰 본문 업로드 도중 끊김', 'Keep-Alive 연결 idle 시간 초과'],
    howToFix: ['요청 재시도', '청크 업로드 사용', '네트워크 상태 확인'],
    isStandard: true, rfc: 'RFC 7231 §6.5.7',
  },
  {
    code: 409, category: '4xx', name: 'Conflict', nameKr: '충돌',
    emoji: '⚔️',
    shortDesc: '리소스 상태 충돌 (예: 중복 등록)',
    longDesc: '동일 이메일 가입·낙관적 락 위반·동시 수정 충돌.',
    whenItHappens: ['이미 존재하는 이메일·아이디로 가입 시도', 'Git push 충돌', '낙관적 락 (ETag·version) 위반', '동시 수정'],
    howToFix: ['중복 검사 후 재시도', '서버 상태 다시 fetch 후 재요청', 'If-Match 헤더로 ETag 확인'],
    koreanCase: '회원가입 시 이미 존재하는 이메일',
    isStandard: true, rfc: 'RFC 7231 §6.5.8',
  },
  {
    code: 410, category: '4xx', name: 'Gone', nameKr: '영구 삭제됨',
    emoji: '👻',
    shortDesc: '리소스가 영구적으로 삭제되었습니다 (404와 달리 의도적)',
    longDesc: '404는 "찾을 수 없음", 410은 "영구 삭제됨"으로 의도 명확. 검색엔진이 인덱스 제거.',
    whenItHappens: ['단종된 API 엔드포인트', '의도적으로 삭제된 콘텐츠', '서비스 종료'],
    howToFix: ['새 API 사용', '검색 인덱스 재구축 (sitemap에서 제거)'],
    isStandard: true, rfc: 'RFC 7231 §6.5.9',
  },
  {
    code: 411, category: '4xx', name: 'Length Required', nameKr: 'Content-Length 필요',
    emoji: '📏',
    shortDesc: 'Content-Length 헤더가 필요합니다',
    longDesc: '서버가 본문 크기를 미리 알아야 처리 가능한 경우.',
    whenItHappens: ['POST/PUT 시 Content-Length 누락', '청크 인코딩 미지원 서버'],
    howToFix: ['Content-Length 헤더 자동 설정 (대부분 라이브러리는 자동)'],
    isStandard: true, rfc: 'RFC 7231 §6.5.10',
  },
  {
    code: 412, category: '4xx', name: 'Precondition Failed', nameKr: '사전 조건 실패',
    emoji: '🚧',
    shortDesc: '조건부 요청의 조건 (If-Match·If-None-Match) 실패',
    longDesc: 'ETag·Last-Modified 기반 조건부 요청에서 조건 불충족.',
    whenItHappens: ['If-Match ETag 불일치 (낙관적 락 위반)', '리소스가 이미 변경됨'],
    howToFix: ['최신 ETag 다시 가져와 재요청', '낙관적 락 패턴 검토'],
    isStandard: true, rfc: 'RFC 7232 §4.2',
  },
  {
    code: 413, category: '4xx', name: 'Payload Too Large', nameKr: '본문 너무 큼',
    emoji: '📦',
    shortDesc: '요청 본문이 서버 허용 한도를 초과했습니다',
    longDesc: '파일 업로드 크기 제한 초과. nginx client_max_body_size·Express limit 설정.',
    whenItHappens: ['이미지·동영상 업로드 시 nginx 1MB 기본 제한', 'Express bodyParser limit 초과', 'AWS API Gateway 6MB·Lambda 6MB 제한'],
    howToFix: ['nginx: client_max_body_size 100M;', 'Express: bodyParser.json({ limit: "10mb" })', '청크 업로드·multipart 사용', 'Pre-signed URL로 S3 직접 업로드'],
    koreanCase: 'nginx 기본 1MB 초과 이미지 업로드 시 413',
    isStandard: true, rfc: 'RFC 7231 §6.5.11',
  },
  {
    code: 414, category: '4xx', name: 'URI Too Long', nameKr: 'URL 너무 김',
    emoji: '📏',
    shortDesc: 'URL이 서버 허용 한도를 초과했습니다 (보통 8KB+)',
    longDesc: '쿼리 스트링이 너무 길거나 base64 데이터를 URL에 넣은 경우.',
    whenItHappens: ['GET 요청에 거대한 쿼리 스트링', 'JWT를 URL 파라미터로 (POST body로 옮기기 권장)'],
    howToFix: ['POST body로 데이터 이동', '쿼리 스트링 최소화', 'nginx large_client_header_buffers 늘리기'],
    isStandard: true, rfc: 'RFC 7231 §6.5.12',
  },
  {
    code: 415, category: '4xx', name: 'Unsupported Media Type', nameKr: '지원 안 되는 형식',
    emoji: '📋',
    shortDesc: 'Content-Type 형식을 서버가 지원하지 않습니다',
    longDesc: 'Content-Type이 잘못됐거나 누락. 서버는 application/json을 기대하지만 text/plain 전송 등.',
    whenItHappens: ['Content-Type 헤더 누락', 'JSON 보내면서 application/x-www-form-urlencoded 명시', 'multipart 부적절 사용'],
    howToFix: ['Content-Type: application/json 명시', '서버가 받는 형식 확인 (Spring @RequestMapping consumes)', 'Postman·curl에서 Content-Type 확인'],
    isStandard: true, rfc: 'RFC 7231 §6.5.13',
  },
  {
    code: 416, category: '4xx', name: 'Range Not Satisfiable', nameKr: '범위 충족 불가',
    emoji: '📐',
    shortDesc: 'Range 헤더 범위가 파일 크기를 초과',
    longDesc: '동영상 streaming·이어받기에서 범위 잘못 요청.',
    whenItHappens: ['Range: bytes=1000- 인데 파일이 500 bytes', '잘못된 범위 형식'],
    howToFix: ['HEAD 요청으로 Content-Length 먼저 확인', '범위 재계산'],
    isStandard: true, rfc: 'RFC 7233 §4.4',
  },
  {
    code: 417, category: '4xx', name: 'Expectation Failed', nameKr: '기대 실패',
    emoji: '😞',
    shortDesc: 'Expect 헤더 기대를 서버가 충족 못함',
    longDesc: 'Expect: 100-continue 등 기대 충족 실패.',
    whenItHappens: ['Expect 헤더 사용 시 (드묾)'],
    howToFix: ['Expect 헤더 제거 또는 변경'],
    isStandard: true, rfc: 'RFC 7231 §6.5.14',
  },
  {
    code: 418, category: '4xx', name: "I'm a teapot", nameKr: '나는 찻주전자',
    emoji: '🫖',
    shortDesc: '농담 코드 — RFC 2324 (Hyper Text Coffee Pot Control Protocol)',
    longDesc: '1998년 만우절 농담. 일부 사이트에서 재미로 사용.',
    whenItHappens: ['Google teapot easter egg', '일부 개발자가 장난으로 반환'],
    howToFix: ['실제 운영 환경에서는 사용 X — 재미용'],
    isStandard: true, rfc: 'RFC 2324',
  },
  {
    code: 422, category: '4xx', name: 'Unprocessable Entity', nameKr: '처리 불가능한 엔티티',
    emoji: '📋',
    shortDesc: '요청 형식은 맞지만 의미적 오류 (Validation 실패)',
    longDesc: '400과 달리 JSON 파싱은 됐지만 비즈니스 검증(Validation) 실패. Spring·FastAPI·Django REST가 자주 사용.',
    whenItHappens: ['이메일 형식 잘못 (@ 없음)', '비밀번호 길이 부족', '필수 필드 빈 값', 'Spring @Valid·FastAPI Pydantic·Joi 검증 실패', 'NaN·음수 등 비즈니스 규칙 위반'],
    howToFix: ['응답 본문의 errors 배열 확인 (필드별 오류)', 'Validation 규칙 클라이언트에도 동기화', '입력 검증 라이브러리 사용 (Yup·Zod·Joi)'],
    koreanCase: 'FastAPI Pydantic 모델 검증 실패 시 자동 422 응답',
    example: { lang: 'json', body: '{ "detail": [{ "loc": ["body", "email"], "msg": "value is not a valid email address", "type": "value_error.email" }] }' },
    isStandard: true, rfc: 'RFC 4918 §11.2',
  },
  {
    code: 425, category: '4xx', name: 'Too Early', nameKr: '너무 이름',
    emoji: '⏰',
    shortDesc: '서버가 재전송될 수 있는 요청을 처리할 의향이 없음 (TLS 0-RTT)',
    longDesc: 'TLS 1.3 0-RTT 보안 관련. 거의 사용 안됨.',
    whenItHappens: ['TLS 0-RTT 재전송 보호'],
    howToFix: ['요청 재시도 (정상 핸드셰이크 후)'],
    isStandard: true, rfc: 'RFC 8470',
  },
  {
    code: 426, category: '4xx', name: 'Upgrade Required', nameKr: '업그레이드 필요',
    emoji: '⬆️',
    shortDesc: '다른 프로토콜(HTTPS·HTTP/2)로 전환 필요',
    longDesc: '서버가 더 안전한 프로토콜 요구. Upgrade 응답 헤더로 안내.',
    whenItHappens: ['HTTPS 강제 사이트가 HTTP 요청에 응답', 'WebSocket 필수 엔드포인트에 일반 HTTP'],
    howToFix: ['Upgrade 헤더 따라 프로토콜 전환', 'HTTPS로 재요청'],
    isStandard: true, rfc: 'RFC 7231 §6.5.15',
  },
  {
    code: 428, category: '4xx', name: 'Precondition Required', nameKr: '사전 조건 필요',
    emoji: '🔐',
    shortDesc: 'If-Match·If-Unmodified-Since 같은 조건부 헤더 필수',
    longDesc: '동시 수정 방지를 위해 조건부 요청 강제.',
    whenItHappens: ['DELETE·PUT에 If-Match 필수인 API'],
    howToFix: ['If-Match: "etag" 헤더 추가'],
    isStandard: true, rfc: 'RFC 6585 §3',
  },
  {
    code: 429, category: '4xx', name: 'Too Many Requests', nameKr: '너무 많은 요청',
    emoji: '🚦',
    shortDesc: 'Rate limit 초과 — 너무 많은 요청',
    longDesc: 'API 호출 한도 초과. Retry-After 헤더로 재시도 가능 시간 안내.',
    whenItHappens: [
      'OpenAI API 분당 호출 한도 초과',
      '네이버 검색 API 일일 25,000회 초과',
      '카카오 API 분당 한도 초과',
      'GitHub API 시간당 5,000 (인증) 또는 60 (비인증) 초과',
      'Cloudflare DDoS 방어 동작',
    ],
    howToFix: [
      'Retry-After 응답 헤더 확인 (대기 시간)',
      'exponential backoff 재시도 패턴',
      'Rate limit 키 (X-RateLimit-*) 모니터링',
      'API 플랜 업그레이드',
      '캐싱·요청 묶기 (batch)',
    ],
    koreanCase: '네이버 검색 API 25,000회/일 초과 시 429, 토스 결제 burst 초과 시 429',
    example: { lang: 'json', body: '{ "code": 429, "msg": "Rate limit exceeded", "retry_after": 60 }' },
    isStandard: true, rfc: 'RFC 6585 §4',
  },
  {
    code: 431, category: '4xx', name: 'Request Header Fields Too Large', nameKr: '헤더 너무 큼',
    emoji: '📋',
    shortDesc: '요청 헤더가 서버 허용 크기 초과',
    longDesc: '쿠키가 너무 많거나 헤더가 너무 김. nginx large_client_header_buffers.',
    whenItHappens: ['거대한 JWT를 헤더에 (정상)', '쿠키 너무 많음 (4KB+)', '디버그 헤더 폭증'],
    howToFix: ['쿠키 정리', 'nginx 헤더 버퍼 늘리기', '큰 데이터는 body로'],
    isStandard: true, rfc: 'RFC 6585 §5',
  },
  {
    code: 451, category: '4xx', name: 'Unavailable For Legal Reasons', nameKr: '법적 사유로 사용 불가',
    emoji: '⚖️',
    shortDesc: '법적 검열·차단 (지역 제한·DMCA 등)',
    longDesc: '소설 1984에서 따온 코드. 정부 검열·DMCA·GDPR 차단 등.',
    whenItHappens: ['지역 차단 (한국 → 일부 외국 사이트)', 'DMCA 저작권 삭제', 'GDPR 동의 없음'],
    howToFix: ['VPN으로 다른 지역 접근', '법적 차단 — 우회 X'],
    isStandard: true, rfc: 'RFC 7725',
  },

  /* ═══ 5xx Server Error (10) ═══ */
  {
    code: 500, category: '5xx', name: 'Internal Server Error', nameKr: '내부 서버 오류',
    emoji: '💥',
    shortDesc: '서버 내부에서 알 수 없는 오류 발생',
    longDesc: '가장 일반적인 5xx. 서버 로그를 봐야 정확한 원인 파악 가능.',
    whenItHappens: [
      '서버 코드 unhandled exception',
      '데이터베이스 연결 실패',
      'NullPointerException·TypeError 등',
      '환경 변수 누락',
      '잘못된 SQL 쿼리',
    ],
    howToFix: [
      '서버 로그 확인 (가장 중요)',
      'Sentry·Datadog 등 에러 트래킹',
      'try/catch로 처리되지 않은 예외 검토',
      '환경 변수·DB 연결 확인',
      'try-catch + 로깅으로 4xx로 변환 권장',
    ],
    koreanCase: 'Spring Boot @ExceptionHandler 미처리 시 500, AWS Lambda runtime 오류',
    example: { lang: 'json', body: '{ "code": 500, "msg": "Internal Server Error" }' },
    isStandard: true, rfc: 'RFC 7231 §6.6.1',
  },
  {
    code: 501, category: '5xx', name: 'Not Implemented', nameKr: '구현되지 않음',
    emoji: '🚧',
    shortDesc: '서버가 요청 메서드를 지원하지 않습니다',
    longDesc: '405와 다름. 서버 자체가 메서드 미구현 (예: PATCH·CONNECT 미지원).',
    whenItHappens: ['이전 HTTP 서버가 PATCH 미지원', 'CONNECT·TRACE 미구현'],
    howToFix: ['지원 메서드 사용 (GET/POST/PUT/DELETE)', '서버 업그레이드'],
    isStandard: true, rfc: 'RFC 7231 §6.6.2',
  },
  {
    code: 502, category: '5xx', name: 'Bad Gateway', nameKr: '게이트웨이 오류',
    emoji: '🔌',
    shortDesc: '게이트웨이(nginx·CDN)가 백엔드 서버에서 잘못된 응답 받음',
    longDesc: '리버스 프록시·CDN이 origin 서버와 통신 실패. 백엔드가 다운되었거나 응답 형식이 깨졌을 때.',
    whenItHappens: ['백엔드 서버 다운 (Spring·Express·Lambda)', 'nginx upstream 헬스체크 실패', 'CloudFront → S3 origin 응답 깨짐', 'AWS ALB → EC2 connection refused'],
    howToFix: ['백엔드 서비스 재시작·로그 확인', 'nginx upstream 설정 검토', 'AWS Target Group 헬스체크 확인', 'CDN 캐시 purge'],
    koreanCase: '쿠팡 CDN 장애·AWS ELB → EC2 다운 시 502',
    isStandard: true, rfc: 'RFC 7231 §6.6.3',
  },
  {
    code: 503, category: '5xx', name: 'Service Unavailable', nameKr: '서비스 이용 불가',
    emoji: '🚧',
    shortDesc: '서버가 일시적으로 이용 불가 (점검·과부하)',
    longDesc: '의도적 점검 또는 과부하. Retry-After 헤더로 복구 시간 안내 권장.',
    whenItHappens: ['서버 점검 중', '트래픽 폭증으로 과부하', 'AutoScaling 적응 중', 'Maintenance 페이지'],
    howToFix: ['Retry-After 헤더 확인 후 재시도', 'AutoScaling 설정 검토', 'Status 페이지에 점검 공지', '대기열 큐로 부하 분산'],
    koreanCase: '카카오톡 장애·네이버 점검 시 503',
    isStandard: true, rfc: 'RFC 7231 §6.6.4',
  },
  {
    code: 504, category: '5xx', name: 'Gateway Timeout', nameKr: '게이트웨이 시간 초과',
    emoji: '⏰',
    shortDesc: '게이트웨이가 백엔드 응답을 기다리다 시간 초과',
    longDesc: '502와 비슷하지만 백엔드가 다운된 게 아니라 응답이 너무 느림.',
    whenItHappens: [
      'AWS Lambda 30초 (API Gateway 29초) 타임아웃',
      'DB 슬로우 쿼리',
      '외부 API 호출 무응답',
      'nginx proxy_read_timeout 초과 (기본 60초)',
    ],
    howToFix: [
      '백엔드 처리 시간 단축 (DB 인덱스·캐시)',
      'Lambda timeout 증가 (최대 15분)',
      'nginx proxy_read_timeout 600s 등 증가',
      '비동기 처리로 전환 (202 Accepted + polling)',
    ],
    koreanCase: 'AWS Lambda 30초 타임아웃·Spring 백엔드 무한루프 시 504',
    isStandard: true, rfc: 'RFC 7231 §6.6.5',
  },
  {
    code: 505, category: '5xx', name: 'HTTP Version Not Supported', nameKr: 'HTTP 버전 미지원',
    emoji: '📜',
    shortDesc: '서버가 요청한 HTTP 버전을 지원 안 함',
    longDesc: 'HTTP/1.0 클라이언트가 HTTP/2-only 서버 접근 등.',
    whenItHappens: ['HTTP/1.0만 지원하는 클라이언트', 'HTTP/2 강제 서버'],
    howToFix: ['클라이언트 HTTP 버전 업그레이드'],
    isStandard: true, rfc: 'RFC 7231 §6.6.6',
  },
  {
    code: 506, category: '5xx', name: 'Variant Also Negotiates', nameKr: '협상 변형 오류',
    emoji: '🔄',
    shortDesc: '콘텐츠 협상 순환 참조 (드묾)',
    longDesc: '서버 설정 오류. 거의 안 보임.',
    whenItHappens: ['서버 콘텐츠 협상 설정 오류'],
    howToFix: ['서버 설정 검토 (Apache mod_negotiation)'],
    isStandard: true, rfc: 'RFC 2295 §8.1',
  },
  {
    code: 507, category: '5xx', name: 'Insufficient Storage', nameKr: '저장 공간 부족',
    emoji: '💾',
    shortDesc: 'WebDAV — 서버 저장 공간 부족',
    longDesc: 'WebDAV 전용. 디스크 풀.',
    whenItHappens: ['Nextcloud·OwnCloud 저장소 풀', 'WebDAV PUT 시 공간 부족'],
    howToFix: ['디스크 정리·확장'],
    isStandard: true, rfc: 'RFC 4918 §11.5',
  },
  {
    code: 508, category: '5xx', name: 'Loop Detected', nameKr: '루프 감지됨',
    emoji: '🔁',
    shortDesc: 'WebDAV — 무한 루프 감지',
    longDesc: 'WebDAV 작업에서 무한 루프 감지.',
    whenItHappens: ['WebDAV PROPFIND 무한 참조'],
    howToFix: ['리소스 구조 검토'],
    isStandard: true, rfc: 'RFC 5842 §7.2',
  },
  {
    code: 510, category: '5xx', name: 'Not Extended', nameKr: '확장 필요',
    emoji: '🔧',
    shortDesc: '추가 확장이 필요한 요청 (드묾)',
    longDesc: '거의 사용 안됨.',
    whenItHappens: ['HTTP Extension Framework (RFC 2774)'],
    howToFix: ['확장 헤더 추가'],
    isStandard: true, rfc: 'RFC 2774',
  },
  {
    code: 511, category: '5xx', name: 'Network Authentication Required', nameKr: '네트워크 인증 필요',
    emoji: '📶',
    shortDesc: '네트워크 인증 (Wi-Fi 캡티브 포털) 필요',
    longDesc: '공항·카페 Wi-Fi 로그인 페이지 리다이렉트용.',
    whenItHappens: ['공항·호텔·카페 Wi-Fi 첫 접속'],
    howToFix: ['captive portal 로그인'],
    isStandard: true, rfc: 'RFC 6585 §6',
  },

  /* ═══ Cloudflare 5xx (8) ═══ */
  {
    code: 520, category: 'nonstandard', name: 'Web Server Returned an Unknown Error', nameKr: '알 수 없는 오류',
    emoji: '☁️',
    shortDesc: 'Cloudflare — Origin 서버가 빈 응답·잘못된 응답',
    longDesc: 'Cloudflare가 origin 서버에서 비정상 응답 받음. 502와 비슷.',
    whenItHappens: ['Origin 서버 응답 헤더 누락', 'TCP RST·잘못된 응답', 'Cloudflare ↔ Origin 통신 문제'],
    howToFix: ['Origin 서버 로그 확인', 'Cloudflare Always Online 활성화', '502/520 모니터링'],
    isStandard: false, source: 'Cloudflare',
  },
  {
    code: 521, category: 'nonstandard', name: 'Web Server Is Down', nameKr: 'Origin 서버 다운',
    emoji: '☁️',
    shortDesc: 'Cloudflare — Origin 서버 다운 (TCP 연결 거부)',
    longDesc: 'Cloudflare가 origin에 TCP 연결 못함. 서버 다운·방화벽 차단·Cloudflare IP 화이트리스트 누락.',
    whenItHappens: ['Origin 서버 다운', '방화벽이 Cloudflare IP 차단', 'Origin 포트 닫힘'],
    howToFix: ['Origin 서버 재시작', 'Cloudflare IP 범위 화이트리스트', 'iptables·security group 점검'],
    koreanCase: '쿠팡·카카오 일부 서비스 장애 시 521',
    isStandard: false, source: 'Cloudflare',
  },
  {
    code: 522, category: 'nonstandard', name: 'Connection Timed Out', nameKr: '연결 시간 초과',
    emoji: '☁️',
    shortDesc: 'Cloudflare — Origin 서버 TCP 연결 시간 초과',
    longDesc: 'TCP 핸드셰이크 단계에서 타임아웃. 521과 다른 점은 521은 거부, 522는 응답 없음.',
    whenItHappens: ['Origin 서버 과부하', 'Cloudflare ↔ Origin 네트워크 지연', 'Origin 방화벽 패킷 드롭'],
    howToFix: ['Origin 서버 부하 분산', 'Cloudflare IP 화이트리스트 확인', '네트워크 모니터링'],
    isStandard: false, source: 'Cloudflare',
  },
  {
    code: 523, category: 'nonstandard', name: 'Origin Is Unreachable', nameKr: 'Origin 도달 불가',
    emoji: '☁️',
    shortDesc: 'Cloudflare — Origin 서버에 도달할 수 없음 (DNS·라우팅)',
    longDesc: 'DNS 해석 실패·BGP 라우팅 문제로 origin에 도달 불가.',
    whenItHappens: ['DNS 변경 직후 전파 안됨', 'Origin 도메인이 잘못된 IP', 'BGP 라우팅 장애'],
    howToFix: ['DNS 레코드 확인 (A·AAAA)', 'Cloudflare DNS 설정 검토', 'dig·nslookup으로 검증'],
    isStandard: false, source: 'Cloudflare',
  },
  {
    code: 524, category: 'nonstandard', name: 'A Timeout Occurred', nameKr: '응답 시간 초과',
    emoji: '☁️',
    shortDesc: 'Cloudflare — Origin이 100초 내 응답 못함 (504와 비슷)',
    longDesc: 'TCP 연결은 됐지만 HTTP 응답이 100초 내에 안 옴. Cloudflare 기본 타임아웃.',
    whenItHappens: ['Origin 처리 시간 100초 초과', 'DB 슬로우 쿼리·외부 API 무응답', 'WebSocket 장기 연결 시 (별도 처리 필요)'],
    howToFix: ['처리 시간 단축', '비동기 처리 (202 Accepted + polling)', 'Cloudflare Enterprise 플랜에서 타임아웃 늘리기 (최대 6000초)', 'WebSocket·SSE 사용 시 별도 처리'],
    koreanCase: '쿠팡 검색 API·대형 쇼핑몰 트래픽 폭주 시 524',
    isStandard: false, source: 'Cloudflare',
  },
  {
    code: 525, category: 'nonstandard', name: 'SSL Handshake Failed', nameKr: 'SSL 핸드셰이크 실패',
    emoji: '☁️',
    shortDesc: 'Cloudflare ↔ Origin SSL/TLS 핸드셰이크 실패',
    longDesc: 'SSL 인증서·암호화 스위트 불일치.',
    whenItHappens: ['Origin SSL 인증서 만료', 'TLS 버전 불일치', '잘못된 SNI'],
    howToFix: ['Origin 인증서 갱신', 'Cloudflare SSL/TLS 모드 확인 (Full·Strict)', 'OpenSSL로 핸드셰이크 테스트'],
    isStandard: false, source: 'Cloudflare',
  },
  {
    code: 526, category: 'nonstandard', name: 'Invalid SSL Certificate', nameKr: '잘못된 SSL 인증서',
    emoji: '☁️',
    shortDesc: 'Cloudflare — Origin SSL 인증서 검증 실패',
    longDesc: 'Cloudflare Full (Strict) 모드에서 origin 인증서 검증 실패.',
    whenItHappens: ['Origin self-signed 인증서', '인증서 만료', '잘못된 CA'],
    howToFix: ['Origin에 유효한 인증서 (Let\'s Encrypt) 설치', 'Cloudflare SSL 모드 Flexible로 (보안 ↓ 권장 X)'],
    isStandard: false, source: 'Cloudflare',
  },
  {
    code: 530, category: 'nonstandard', name: 'Frozen', nameKr: '계정 동결',
    emoji: '🧊',
    shortDesc: 'Cloudflare — 계정 동결·1xxx 오류 (서비스 약관 위반)',
    longDesc: '결제 실패·약관 위반·DMCA 등으로 Cloudflare 계정 동결.',
    whenItHappens: ['결제 실패로 계정 정지', 'Cloudflare 약관 위반'],
    howToFix: ['Cloudflare Dashboard에서 계정 상태 확인', 'Support 문의'],
    isStandard: false, source: 'Cloudflare',
  },

  /* ═══ nginx (3) ═══ */
  {
    code: 444, category: 'nonstandard', name: 'No Response', nameKr: '응답 없음',
    emoji: '🔌',
    shortDesc: 'nginx — 응답 없이 연결 종료 (DDoS 차단용)',
    longDesc: 'nginx가 의도적으로 연결만 끊음. 클라이언트는 빈 응답 받음.',
    whenItHappens: ['nginx return 444; (의심스러운 요청 차단)', 'DDoS 방어'],
    howToFix: ['nginx 로그 확인 (왜 차단됐는지)', 'User-Agent·IP·Referer 검토'],
    isStandard: false, source: 'nginx',
  },
  {
    code: 494, category: 'nonstandard', name: 'Request Header Too Large', nameKr: '요청 헤더 너무 큼',
    emoji: '📋',
    shortDesc: 'nginx — 헤더 크기 초과 (431과 유사)',
    longDesc: 'nginx 자체 코드. 표준은 431.',
    whenItHappens: ['거대한 쿠키·헤더', 'nginx large_client_header_buffers 초과'],
    howToFix: ['nginx large_client_header_buffers 4 32k;', '쿠키 정리'],
    isStandard: false, source: 'nginx',
  },
  {
    code: 499, category: 'nonstandard', name: 'Client Closed Request', nameKr: '클라이언트가 연결 종료',
    emoji: '🚪',
    shortDesc: 'nginx — 응답 전에 클라이언트가 연결 끊음',
    longDesc: '서버 처리 중에 클라이언트가 취소·새로고침. 모바일 브라우저에서 자주 발생.',
    whenItHappens: ['모바일 사용자가 페이지 떠남 (back·새로고침)', '클라이언트 timeout', 'AJAX 취소'],
    howToFix: ['일반적으로 클라이언트 측 문제 — 서버 정상', '클라이언트 timeout 늘리기', '백엔드 응답 시간 개선 (사용자가 안 떠나게)'],
    koreanCase: '모바일 한국 사이트에서 가장 자주 보이는 5xx (서버 정상이지만 사용자가 빨리 떠남)',
    isStandard: false, source: 'nginx',
  },
]

/* ─────────────────────────────────────────────
   디버깅 시나리오 (12개)
   ───────────────────────────────────────────── */
export interface DebugScenario {
  id: string
  emoji: string
  category: DebugCategory
  title: string
  causes: string[]
  steps: string[]
  relatedCodes: number[]
}

export const DEBUG_SCENARIOS: DebugScenario[] = [
  {
    id: 'jwt-401', emoji: '🔐', category: 'auth',
    title: 'API 호출에 401 Unauthorized 발생',
    causes: [
      'Authorization 헤더 누락',
      'JWT 토큰 만료 (exp 시간 지남)',
      'Bearer 접두사 누락',
      'OAuth access_token 만료',
      '잘못된 API 키',
    ],
    steps: [
      'DevTools Network → 요청 헤더에 Authorization 있는지 확인',
      'jwt.io에 토큰 붙여넣고 exp 만료 시간 확인',
      'Bearer 접두사 확인: `Authorization: Bearer eyJ...`',
      'OAuth refresh_token으로 새 access_token 발급',
      'API 키의 권한 스코프 확인 (read·write 분리)',
    ],
    relatedCodes: [401, 403],
  },
  {
    id: 'cdn-403', emoji: '🚫', category: 'auth',
    title: '이미지·정적 파일 403 Forbidden',
    causes: [
      'CDN/CloudFront 서명 URL 만료',
      'Referer 헤더 차단 (hotlink 방지)',
      'S3 버킷 정책 권한 부족',
      '지역 차단 (Geo-block)',
      'IP 화이트리스트 누락',
    ],
    steps: [
      'CloudFront 서명 URL 만료 시간 확인 (Date 파라미터)',
      'Referer 헤더 추가 또는 제거 (테스트)',
      'S3 버킷 정책: GetObject 권한 + Resource ARN 확인',
      'AWS WAF 규칙 확인 (지역·IP 차단)',
      'curl -v 로 응답 헤더의 X-Cache·X-Amz-Cf-Id 확인',
    ],
    relatedCodes: [403, 404],
  },
  {
    id: 'method-405', emoji: '📮', category: 'cors',
    title: 'POST 요청에 405 Method Not Allowed',
    causes: [
      'GET 전용 라우트에 POST 호출',
      'CORS preflight OPTIONS 미처리',
      'Express·Spring 라우팅 메서드 불일치',
      'CDN/Reverse Proxy가 PUT/DELETE 차단',
    ],
    steps: [
      '응답의 Allow 헤더로 허용 메서드 확인',
      'Express: app.post(path, ...) 등록 확인',
      'Spring: @PostMapping 또는 @RequestMapping(method=POST)',
      'CORS 미들웨어로 OPTIONS 자동 응답: cors({methods: [...]})',
      'nginx에서 limit_except 설정 검토',
    ],
    relatedCodes: [405, 200, 403],
  },
  {
    id: 'content-415', emoji: '📦', category: 'validation',
    title: '415 Unsupported Media Type',
    causes: [
      'Content-Type 헤더 누락',
      'JSON 보내면서 form-urlencoded 명시',
      'multipart 부적절 사용',
      '서버 consumes 설정 불일치',
    ],
    steps: [
      'Content-Type 헤더 확인: `Content-Type: application/json`',
      'curl -v로 실제 전송 헤더 확인',
      'Spring: @PostMapping(consumes = "application/json")',
      'fetch: `headers: { "Content-Type": "application/json" }`',
      'Postman → Body → 형식 (JSON·form·raw) 점검',
    ],
    relatedCodes: [415, 400, 422],
  },
  {
    id: 'cors-preflight', emoji: '🌐', category: 'cors',
    title: 'CORS preflight 실패 (405/403)',
    causes: [
      'OPTIONS 요청 응답 미설정',
      'Access-Control-Allow-Origin 누락',
      'Access-Control-Allow-Methods 누락',
      'Access-Control-Allow-Headers 누락',
      '커스텀 헤더 (Authorization 등) 미허용',
    ],
    steps: [
      'DevTools Network → OPTIONS 요청 응답 확인',
      '서버 CORS 미들웨어 설치: cors() (Express) / @CrossOrigin (Spring)',
      'Allow-Origin: 도메인 명시 또는 * (credentials 없을 때만)',
      'Allow-Methods: GET, POST, PUT, DELETE, OPTIONS',
      'Allow-Headers: Authorization, Content-Type 추가',
      'credentials: include 사용 시 Allow-Origin은 정확한 도메인 (* X)',
    ],
    relatedCodes: [405, 403, 200, 204],
  },
  {
    id: 'lambda-504', emoji: '⏱️', category: 'timeout',
    title: 'AWS Lambda·Spring 504 Gateway Timeout',
    causes: [
      'Lambda 30초 제한 (API Gateway 29초)',
      'DB 슬로우 쿼리',
      '외부 API 호출 무응답',
      'nginx proxy_read_timeout 초과',
      '대용량 데이터 처리 동기 실행',
    ],
    steps: [
      'CloudWatch Logs에서 Lambda 실행 시간 확인',
      'Lambda timeout 늘리기 (최대 15분, API Gateway는 별도)',
      'DB 인덱스·쿼리 최적화 (EXPLAIN)',
      '외부 API 호출에 timeout 설정 (axios timeout: 5000)',
      'nginx: proxy_read_timeout 600s; (긴 처리)',
      '비동기 패턴 변환: SQS·Step Functions로 분리',
    ],
    relatedCodes: [504, 502, 524, 408],
  },
  {
    id: 'nginx-502', emoji: '🔌', category: 'server',
    title: 'nginx 502 Bad Gateway',
    causes: [
      '백엔드 (Spring·Express·PHP-FPM) 다운',
      '백엔드 포트가 listen 안 함',
      'nginx upstream 헬스체크 실패',
      '백엔드가 너무 많은 요청에 죽음',
      'PHP-FPM worker 풀 소진',
    ],
    steps: [
      '백엔드 서비스 상태 확인: `systemctl status spring-boot`',
      '백엔드 포트 listen 확인: `netstat -tlnp | grep 8080`',
      'nginx error.log 확인: `tail -f /var/log/nginx/error.log`',
      'upstream 설정 검토: `upstream backend { server 127.0.0.1:8080; }`',
      'PHP-FPM: `pm.max_children` 늘리기',
      '백엔드 재시작 + 모니터링 (Datadog·Prometheus)',
    ],
    relatedCodes: [502, 503, 504, 521],
  },
  {
    id: 'cf-5xx', emoji: '☁️', category: 'server',
    title: 'Cloudflare 521·522·524 발생',
    causes: [
      '521: Origin 서버 다운 (TCP 거부)',
      '522: TCP 연결 타임아웃',
      '524: HTTP 응답 100초 초과',
      'Cloudflare IP 방화벽 차단',
    ],
    steps: [
      'Origin 서버 직접 접근 테스트: `curl -v https://origin.com`',
      'Cloudflare IP 화이트리스트: AWS Security Group·iptables 추가',
      'Cloudflare 공식 IP 범위 확인 (cloudflare.com/ips)',
      'Origin 처리 시간 단축 (524 대비)',
      'WebSocket·SSE는 Cloudflare Enterprise 필요 (장기 연결)',
      'Cloudflare Always Online 활성화 (캐시 폴백)',
    ],
    relatedCodes: [521, 522, 524, 502, 504],
  },
  {
    id: 'rate-429', emoji: '🚦', category: 'rate',
    title: '429 Too Many Requests (Rate Limit)',
    causes: [
      'OpenAI API: 분당 토큰·요청 한도',
      '네이버 검색: 25,000회/일',
      '카카오 API: 분당 한도',
      'GitHub API: 시간당 5000 (인증) / 60 (비인증)',
      'Cloudflare DDoS 방어 동작',
    ],
    steps: [
      'Retry-After 응답 헤더 확인 (대기 시간 sec)',
      'X-RateLimit-Remaining·X-RateLimit-Reset 헤더 모니터링',
      'Exponential backoff 패턴: `wait = base * 2^attempt`',
      '캐싱 도입 (응답 5분 캐시 → 호출 90% 감소)',
      'Batch API 사용 (1회 요청에 여러 작업)',
      'API 플랜 업그레이드 (paid tier)',
    ],
    relatedCodes: [429, 503],
  },
  {
    id: 'validation-422', emoji: '📋', category: 'validation',
    title: '422 Unprocessable Entity (Validation 실패)',
    causes: [
      'Spring @Valid 검증 실패',
      'FastAPI Pydantic 모델 위반',
      'Joi·Yup·Zod 스키마 불일치',
      '필수 필드 누락·형식 오류',
      '비즈니스 규칙 위반 (음수·NaN)',
    ],
    steps: [
      '응답 본문의 errors·detail 배열 확인 (필드별 오류)',
      'Validation 라이브러리 메시지 한국어화 (i18n)',
      '클라이언트에도 동일 검증 추가 (UX ↑)',
      'Postman·curl로 실제 전송 데이터 검증',
      'API 문서·OpenAPI 스펙과 일치 확인',
    ],
    relatedCodes: [422, 400],
  },
  {
    id: 'redirect-loop', emoji: '🔄', category: 'redirect',
    title: '301/302 무한 리다이렉트 루프',
    causes: [
      'http → https 강제 + https → http 캐시 충돌',
      '도메인 A → B → A 순환',
      'Cloudflare SSL 모드 Flexible + Origin 강제 https',
      '서브도메인 설정 오류',
    ],
    steps: [
      'curl -I로 Location 헤더 확인 (체인 추적)',
      '브라우저 DevTools → Network → Disable cache + 시크릿 모드',
      'Cloudflare SSL/TLS 모드 확인: Full (Strict) 권장',
      '서버 강제 리다이렉트 규칙 검토',
      'HSTS 헤더 캐시 정리',
    ],
    relatedCodes: [301, 302, 308, 307],
  },
  {
    id: 'cookie-401', emoji: '🍪', category: 'auth',
    title: '쿠키 인증인데 401 발생',
    causes: [
      'SameSite=Strict로 cross-site 쿠키 차단',
      'Secure 플래그 누락 (https 필요)',
      '쿠키 도메인 불일치 (api.example.com vs example.com)',
      'CORS credentials 미설정',
      '쿠키 만료',
    ],
    steps: [
      'DevTools → Application → Cookies → 쿠키 존재·도메인·만료 확인',
      'SameSite 설정: SameSite=Lax (대부분), SameSite=None; Secure (cross-site)',
      'fetch: `credentials: "include"` 추가',
      '서버 CORS: `Access-Control-Allow-Credentials: true`',
      '쿠키 도메인 명시: `Domain=.example.com` (서브도메인 공유)',
    ],
    relatedCodes: [401, 403],
  },
]

/* ─────────────────────────────────────────────
   흔한 혼동 비교 쌍
   ───────────────────────────────────────────── */
export const CONFUSION_PAIRS: { a: number; b: number; aDesc: string; bDesc: string; usage: string }[] = [
  { a: 401, b: 403, aDesc: '인증 정보 없음·만료', bDesc: '인증은 됐지만 권한 없음', usage: '401: 토큰 누락/만료, 403: 토큰 있지만 스코프 부족·IP 차단' },
  { a: 301, b: 302, aDesc: '영구 이동 (캐시·SEO)', bDesc: '임시 이동 (SEO 영향 X)', usage: 'SEO 영구 이동은 301, 일시적 분기·테스트는 302' },
  { a: 502, b: 504, aDesc: '백엔드 다운·잘못된 응답', bDesc: '백엔드 응답 너무 느림 (timeout)', usage: '502: nginx upstream 다운, 504: Lambda 30초 초과' },
  { a: 200, b: 204, aDesc: '성공 + 응답 본문 있음', bDesc: '성공 + 본문 없음 (DELETE 후)', usage: '데이터 반환=200, DELETE/PUT 후 헤더만=204' },
  { a: 200, b: 201, aDesc: '단순 성공 (조회·수정)', bDesc: '성공 + 새 리소스 생성 (POST)', usage: 'GET/PUT 결과=200, POST로 생성=201 (Location 헤더)' },
]

/* ═════════════════════════════════════════════
   검색·필터 함수
   ═════════════════════════════════════════════ */
export function getCategory(code: number): CategoryKey {
  if (code >= 100 && code < 200) return '1xx'
  if (code >= 200 && code < 300) return '2xx'
  if (code >= 300 && code < 400) return '3xx'
  if (code >= 400 && code < 500) return '4xx'
  if (code >= 500 && code < 600) return '5xx'
  return '5xx'
}

export function isStandard(code: number): boolean {
  const c = ALL_CODES.find((sc) => sc.code === code)
  return c ? c.isStandard : false
}

export function findCode(code: number): StatusCode | undefined {
  return ALL_CODES.find((c) => c.code === code)
}

export function searchCodes(query: string, filter: CategoryFilter = 'all', favorites: number[] = []): StatusCode[] {
  let pool = ALL_CODES

  /* 카테고리 필터 */
  if (filter === 'favorites') {
    pool = pool.filter((c) => favorites.includes(c.code))
  } else if (filter !== 'all') {
    pool = pool.filter((c) => c.category === filter)
  }

  /* 빈 쿼리 → 카테고리 결과 그대로 */
  const q = query.trim().toLowerCase()
  if (!q) return pool

  /* 숫자 prefix 매칭 */
  if (/^\d+$/.test(q)) {
    return pool.filter((c) => c.code.toString().startsWith(q))
  }

  /* 텍스트 매칭 (영문 이름·한글 이름·짧은 설명·발생 시기) */
  return pool.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.nameKr.includes(query) ||
    c.shortDesc.toLowerCase().includes(q) ||
    c.shortDesc.includes(query) ||
    c.whenItHappens.some((w) => w.toLowerCase().includes(q) || w.includes(query)),
  )
}

/* ─────────────────────────────────────────────
   포맷·통계
   ───────────────────────────────────────────── */
export function getStats() {
  const total = ALL_CODES.length
  const standard = ALL_CODES.filter((c) => c.isStandard).length
  const nonstandard = total - standard
  return { total, standard, nonstandard }
}

export function getCodesByCategory(cat: CategoryKey): StatusCode[] {
  return ALL_CODES.filter((c) => c.category === cat)
}
