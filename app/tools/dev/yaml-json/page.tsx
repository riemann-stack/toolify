import Link from 'next/link'
import YamlJsonClient from './YamlJsonClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/dev/yaml-json',
  title: 'YAML ↔ JSON 변환기 — 양방향 변환 + 유효성 검사 + K8s·Spring·OpenAPI 예시',
  description: 'YAML ↔ JSON 양방향 변환·유효성 검사 + Kubernetes·Docker Compose·GitHub Actions·Spring·OpenAPI 12개 예시 라이브러리.',
  keywords: [
    'YAML JSON 변환', 'yaml to json', 'json to yaml',
    'YAML 변환기', 'JSON 변환기', 'YAML 검증', 'JSON 검증',
    'Kubernetes YAML 변환', 'K8s yaml json', 'kubectl',
    'Docker Compose JSON', 'docker yaml',
    'GitHub Actions yaml', 'GitLab CI yaml',
    'Spring application.yml', 'Spring Boot 설정',
    'OpenAPI yaml json', 'Swagger 변환',
    'Helm values', 'helm chart',
    'yaml 들여쓰기', 'yaml 멀티 도큐먼트', 'yaml 앵커',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  listStyle: 'none',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}
const codeStyle: React.CSSProperties = {
  background: 'var(--bg3)',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: '#0EA5E9',
}

const FAQ_LD = [
  { "q":"YAML과 JSON 어떤 차이가 있나요?","a":"둘 다 같은 데이터 구조(객체·배열·문자열·숫자·boolean·null)를 표현하지만 문법과 용도가 다릅니다. • YAML: 들여쓰기 기반·주석 지원·앵커/별칭·멀티 도큐먼트 — 사람이 편집하는 설정 파일에 적합 (K8s·CI·Spring) • JSON: 중괄호·대괄호 기반·문자열 필수 따옴표·주석 미지원 — 기계가 처리하는 API·데이터 교환에 표준 모든 JSON은 유효한 YAML이지만 (YAML은 JSON 슈퍼셋), 그 반대는 아닙니다." },
  { "q":"주석은 왜 사라지나요?","a":"JSON 표준이 주석을 지원하지 않기 때문입니다 (RFC 8259). 모든 JSON 파서는 주석을 거부하므로, YAML → JSON 변환 시 주석이 자동 제거됩니다. 역변환(JSON → YAML) 시 원본 주석은 복원할 수 없어요. 주석 보존이 필요한 경우: • 원본 YAML을 그대로 사용 (변환하지 않기) • JSONC (JSON with Comments) 사용 — VSCode 설정·tsconfig.json에서 사용 • JSON5 — 주석·후행 콤마·작은따옴표 허용 (별도 파서 필요) 본 도구는 변환 시 주석 발견을 ⚠️ 오렌지 박스로 안내합니다." },
  { "q":"YAML 들여쓰기는 탭 vs 공백?","a":"YAML은 탭 문자를 허용하지 않습니다 (공백만 사용). 탭을 쓰면 파싱 오류가 발생해요. • 표준: 2 spaces (DevOps·K8s·Docker), 4 spaces (Java/Spring 일부) • 한 파일 내 통일 필수 — 2/4 혼용은 들여쓰기 오류 에디터 설정: • VS Code: , • IntelliJ: Settings → Editor → Code Style → YAML → Tab and Indents 본 도구는 입력 타입 무관(탭/공백) 파싱하지만, 출력은 공백 2/4만 사용 (YAML 표준 준수)." },
  { "q":"K8s 매니페스트의 ---는 무엇인가요?","a":"YAML 멀티 도큐먼트 구분자입니다. 한 파일에 여러 YAML 도큐먼트를 담을 때 사용해요. K8s에서는 Deployment + Service + ConfigMap을 한 파일에 묶을 때 자주 씁니다: 본 도구는 JSON 배열로 변환: [{``}, {``}]. 멀티 도큐먼트 발견 시 ⚠️ 자동 안내합니다." },
  { "q":"yes/no가 자동으로 boolean이 되는데 어떻게?","a":"YAML 1.1의 악명 높은 함정입니다. yes·no·on·off·true·false 모두 자동으로 boolean으로 해석돼요. 실제 사고 사례: • 노르웨이 ISO 코드 NO → false로 해석되어 데이터 깨짐 • Docker 환경 변수 SETTING: yes → true로 해석 해결: • YAML 1.2 사용 — boolean은 true/false만 (yes/no는 문자열) • 따옴표로 감싸기 — 본 도구는 JSON_SCHEMA (YAML 1.2 호환)을 기본 사용 → yes/no를 문자열로 유지합니다. CORE_SCHEMA(1.1) 옵션은 호환성 위해 미제공." },
  { "q":"앵커(&)와 별칭(*)이 무엇인가요?","a":"YAML의 참조 메커니즘입니다. 같은 데이터를 여러 곳에서 재사용해 중복을 줄여요. 예시: {`defaults: &defaults timeout: 30 retries: 3 prod: JSON 변환 시: 앵커가 펼쳐져 모든 곳에 데이터가 복사됩니다 (참조 관계 손실). 역변환 시 자동 앵커 생성은 본 도구에서 끔(noRefs: true)으로 두어 깔끔한 YAML 출력을 보장합니다." },
  { "q":"application.yml과 application.yaml 차이?","a":"완전히 동일합니다. 단순히 파일 확장자만 다를 뿐 내용·문법·동작 모두 같아요. • .yml: 옛 표기 (YAML 1.0 시대), Windows 8.3 파일 시스템 호환 목적 • .yaml: 공식 권장 확장자 (yaml.org·YAML 스펙) Spring Boot 우선순위: 같은 디렉토리에 두 개 다 있으면 application.yaml이 우선 적용 (Spring Boot 2.5+). 새 프로젝트에는 .yaml 권장. 본 도구의 다운로드 파일명은 .yaml 사용." },
  { "q":"변환 결과가 원본보다 길어요","a":"YAML → JSON: 일반적으로 JSON이 약 10~30% 길어집니다. 이유: • 키마다 따옴표 ( → ) • 중괄호·대괄호 추가 • 콤마 구분자 추가 • 들여쓰기 (compact 모드는 한 줄로 줄임) JSON → YAML: 일반적으로 YAML이 짧아집니다 (괄호·따옴표 제거). 파일 크기가 중요하면 JSON Compact 모드(한 줄)를 사용하세요. 옵션 패널의 \"JSON 출력: Compact\"." },
  { "q":"한국어·이모지가 깨져요","a":"본 도구는 UTF-8 인코딩을 사용해 한국어·이모지·중국어·일본어 모두 정상 처리됩니다. 깨짐이 발생하면 다음을 확인하세요: 1. 원본 파일 인코딩 — UTF-8 (BOM 없음) 권장. EUC-KR·CP949 변환 후 사용 2. 다운로드 후 열 때 — 메모장 대신 VS Code·Notepad++ 사용 3. Windows 명령 프롬프트 — chcp 65001로 UTF-8 설정 4. 특수 문자 — 따옴표로 감싸기 () 본 도구의 다운로드 파일은 항상 UTF-8 BOM 없이 저장됩니다." },
  { "q":"본 도구는 입력 데이터를 서버에 보내나요?","a":"아니요. 모든 처리가 브라우저(클라이언트)에서 수행됩니다. • 변환·검증·트리 미리보기 모두 js-yaml(MIT 라이선스, ~50KB) 라이브러리로 브라우저 내 처리 • 입력 데이터는 localStorage에만 저장 (재방문 편의), 외부 전송 없음 • Network 탭으로 확인 가능 — 변환 시 어떤 fetch/XHR도 발생하지 않음 • 다운로드는 Blob URL로 브라우저 내 처리 다만: 공용 PC·공유 기기에서 K8s 시크릿·Spring 비밀번호 등을 다룰 때는 사용 후 브라우저 캐시·localStorage를 정리하세요. 개발자 도구 → Application → Local Storage에서 youtil_yaml_json_v1 키 삭제 가능." }
]

export default function YamlJsonPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📄 YAML ↔ JSON 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        양방향 변환·유효성 + <strong style={{ color: 'var(--text)' }}>Kubernetes·Docker Compose·GitHub Actions</strong> 12개 예시.
      </p>

      {/* 면책 박스 */}
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '1px solid rgba(255, 138, 62, 0.40)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.75, margin: 0 }}>
          ⚠️ 본 도구의 변환·검증은 모두 <strong>브라우저에서 실행</strong>되며 입력 데이터는 외부로 전송되지 않습니다.
          YAML → JSON 변환 시 <strong>주석·앵커·별칭·커스텀 태그가 손실</strong>될 수 있습니다.
          K8s·Spring 등 운영 환경 설정 파일은 변환 전후 <strong>반드시 검증·테스트 후 적용</strong>하세요.
          입력 500KB 제한, 깊은 중첩(100+) 또는 매우 큰 파일은 일부 브라우저에서 느릴 수 있습니다.
          분야별 안전 안내는 <Link href="/disclaimer#dev" style={{ color: 'var(--accent)' }}>면책조항</Link> 참고.
        </p>
      </div>

      <YamlJsonClient />

      <GuideDivider />

      {/* 1. 사용법 */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 1 변환</strong> — 좌측에 YAML/JSON 붙여넣기 → 우측 자동 변환. 자동 감지 + 들여쓰기/Pretty/Compact/키 정렬 옵션</li>
          <li><strong>탭 2 검증</strong> — 단일 입력 + 형식 자동 감지 + 유효성 + 통계(줄·키·깊이) + 트리 미리보기</li>
          <li><strong>탭 3 예시 라이브러리</strong> — K8s·Docker·CI·Spring·OpenAPI·Node 12개 카드, 클릭 시 변환 탭 자동 적용</li>
          <li><strong>탭 4 가이드</strong> — YAML vs JSON 비교 + 흔한 오류 5가지 + 손실 정보 + 한국 시나리오</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 입력·옵션은 자동 저장됩니다. 변환은 200ms 디바운스로 입력 변화 시 즉시 재계산. 결과는 <strong>📋 복사</strong> 또는 <strong>💾 다운로드</strong> (convert-YYYYMMDD.json/yaml).
        </p>
      </div>

      {/* 2. YAML vs JSON 비교 */}
      <h2 style={sectionTitle}>📊 YAML vs JSON 비교</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          두 형식은 <strong>같은 데이터 구조</strong>(객체·배열·문자열·숫자·boolean·null)를 표현하지만 문법이 크게 다릅니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11 }}>항목</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#0891B2', fontSize: 11 }}>YAML</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#0D9488', fontSize: 11 }}>JSON</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['주석', '# 지원', '미지원'],
                ['들여쓰기', '의미 있음 (필수)', '무의미 (가독성용)'],
                ['따옴표', '선택적', '문자열 필수 (")'],
                ['키 표기', '"" 없이 가능', '반드시 "key"'],
                ['마지막 콤마', '없음', '금지 (오류)'],
                ['데이터 타입', '자동 추론', '명시적'],
                ['멀티 도큐먼트', '--- 구분', '1 도큐먼트만'],
                ['앵커/별칭', '지원 (& *)', '미지원'],
                ['주 사용처', 'DevOps·CI·설정', 'API·웹 데이터'],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontSize: 13 }}>{row[1]}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text)', fontSize: 13 }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong>일반 룰</strong>: 사람이 자주 편집하는 설정 파일(K8s·CI·Spring) → YAML, API/웹 데이터 교환 → JSON.
        </p>
      </div>

      {/* 3. 변환 시 손실 정보 */}
      <h2 style={sectionTitle}>⚠️ 변환 시 손실되는 정보</h2>
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '2px solid rgba(255, 138, 62, 0.50)',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '14px',
      }}>
        <p style={{ fontSize: 14, color: '#FFA63E', fontWeight: 700, margin: '0 0 12px' }}>
          🚨 <strong>YAML → JSON 변환 시 다음 정보가 사라집니다</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: 22, fontSize: 13, color: 'var(--text)', lineHeight: 1.95 }}>
          <li><strong>💬 주석 (#)</strong> — JSON은 주석을 지원하지 않으므로 모두 삭제. <strong>역변환 시 복원 불가</strong></li>
          <li><strong>🔗 앵커 (&) / 별칭 (*)</strong> — 펼쳐져 데이터 중복으로 변환됨. 참조 관계 손실</li>
          <li><strong>📚 멀티 도큐먼트 (---)</strong> — JSON 배열로 통합 변환 (구분 정보 손실)</li>
          <li><strong>🏷️ 커스텀 태그 (!!)</strong> — <code style={codeStyle}>!!python/object</code> 등은 라이브러리별 동작 다름</li>
          <li><strong>📅 특수 타입</strong> — 날짜·정규식 등 JSON에 없는 타입은 문자열로 변환</li>
          <li><strong>⚠️ YAML 1.1 자동 타입 추론</strong> — <code style={codeStyle}>yes</code>/<code style={codeStyle}>no</code>가 boolean, 8자리 숫자가 8진수로 해석 (본 도구는 JSON_SCHEMA로 엄격 처리해 문자열 유지)</li>
        </ul>
      </div>

      {/* 4. 흔한 YAML 오류 */}
      <h2 style={sectionTitle}>🚨 흔한 YAML 오류 5가지</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 22, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>탭 문자 사용</strong> — YAML은 공백만 허용. 에디터에서 &quot;탭 → 공백 2/4&quot; 자동 변환 설정 필수</li>
          <li><strong>콜론 뒤 공백 누락</strong> — <code style={codeStyle}>key:value</code> ❌ → <code style={codeStyle}>key: value</code> ✅</li>
          <li><strong>들여쓰기 불일치</strong> — 같은 레벨에서 2/4 spaces 혼용 금지. 한 파일 내 통일</li>
          <li><strong>특수문자 escape</strong> — <code style={codeStyle}>${`{}`}</code>·콜론·따옴표 포함 시 따옴표로 감싸기 (<code style={codeStyle}>{`url: "https://api.com"`}</code>)</li>
          <li><strong>중복 키</strong> — 같은 레벨 같은 키 → 마지막 값으로 덮어쓰기. 오류 아니지만 디버깅 어려움</li>
        </ol>
      </div>

      {/* 5. 한국 개발자 시나리오 */}
      <h2 style={sectionTitle}>🇰🇷 한국 개발자 자주 쓰는 변환 시나리오</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
          <li>🍃 <strong>Spring application.yml → JSON</strong> — 외부 시스템 연동·설정 백업·환경별 비교</li>
          <li>☸️ <strong>K8s YAML → JSON</strong> — kubectl 일부 명령에 JSON 사용 (<code style={codeStyle}>kubectl create -f - --dry-run -o json</code>)</li>
          <li>🐙 <strong>GitHub Actions YAML 검증</strong> — 워크플로 푸시 전 들여쓰기·구문 오류 사전 발견</li>
          <li>🔌 <strong>OpenAPI YAML → JSON</strong> — 일부 SDK 생성 도구(swagger-codegen 일부)는 JSON만 지원</li>
          <li>⛵ <strong>Helm values.yaml → JSON</strong> — 외부 시크릿 매니저(Vault·AWS Secrets Manager) 연동</li>
          <li>🐳 <strong>Docker Compose 검증</strong> — 멀티 서비스 정의 들여쓰기·키 오타 확인</li>
          <li>📋 <strong>운영 설정 ↔ 백업</strong> — JSON 백업·아카이브 → YAML 편집 후 다시 적용</li>
        </ul>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. YAML과 JSON 어떤 차이가 있나요?</summary>
        <p style={faqAnswer}>
          둘 다 같은 데이터 구조(객체·배열·문자열·숫자·boolean·null)를 표현하지만 <strong>문법과 용도</strong>가 다릅니다.<br />
          • <strong>YAML</strong>: 들여쓰기 기반·주석 지원·앵커/별칭·멀티 도큐먼트 — 사람이 편집하는 <strong>설정 파일</strong>에 적합 (K8s·CI·Spring)<br />
          • <strong>JSON</strong>: 중괄호·대괄호 기반·문자열 필수 따옴표·주석 미지원 — 기계가 처리하는 <strong>API·데이터 교환</strong>에 표준<br />
          모든 JSON은 유효한 YAML이지만 (YAML은 JSON 슈퍼셋), 그 반대는 아닙니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 주석은 왜 사라지나요?</summary>
        <p style={faqAnswer}>
          <strong>JSON 표준이 주석을 지원하지 않기</strong> 때문입니다 (RFC 8259).
          모든 JSON 파서는 주석을 거부하므로, YAML → JSON 변환 시 주석이 자동 제거됩니다.<br />
          역변환(JSON → YAML) 시 원본 주석은 복원할 수 없어요.
          <strong>주석 보존이 필요한 경우</strong>:<br />
          • 원본 YAML을 그대로 사용 (변환하지 않기)<br />
          • <strong>JSONC</strong> (JSON with Comments) 사용 — VSCode 설정·tsconfig.json에서 사용<br />
          • <strong>JSON5</strong> — 주석·후행 콤마·작은따옴표 허용 (별도 파서 필요)<br />
          본 도구는 변환 시 주석 발견을 ⚠️ 오렌지 박스로 안내합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. YAML 들여쓰기는 탭 vs 공백?</summary>
        <p style={faqAnswer}>
          <strong>YAML은 탭 문자를 허용하지 않습니다 (공백만 사용)</strong>. 탭을 쓰면 파싱 오류가 발생해요.<br />
          • <strong>표준</strong>: 2 spaces (DevOps·K8s·Docker), 4 spaces (Java/Spring 일부)<br />
          • <strong>한 파일 내 통일</strong> 필수 — 2/4 혼용은 들여쓰기 오류<br />
          <strong>에디터 설정</strong>:<br />
          • VS Code: <code style={codeStyle}>{`"editor.insertSpaces": true`}</code>, <code style={codeStyle}>{`"editor.tabSize": 2`}</code><br />
          • IntelliJ: Settings → Editor → Code Style → YAML → Tab and Indents<br />
          본 도구는 입력 타입 무관(탭/공백) 파싱하지만, <strong>출력은 공백 2/4</strong>만 사용 (YAML 표준 준수).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. K8s 매니페스트의 ---는 무엇인가요?</summary>
        <div style={faqAnswer}>
          <strong>YAML 멀티 도큐먼트 구분자</strong>입니다. 한 파일에 여러 YAML 도큐먼트를 담을 때 사용해요.<br />
          K8s에서는 <strong>Deployment + Service + ConfigMap</strong>을 한 파일에 묶을 때 자주 씁니다:
          <pre style={{ background: 'var(--bg3)', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)', marginTop: 6 }}>
{`apiVersion: v1
kind: Pod
metadata:
  name: web
---
apiVersion: v1
kind: Service
metadata:
  name: web-svc`}
          </pre>
          본 도구는 <strong>JSON 배열로 변환</strong>: <code style={codeStyle}>[{`{...pod}`}, {`{...service}`}]</code>.
          멀티 도큐먼트 발견 시 ⚠️ 자동 안내합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. yes/no가 자동으로 boolean이 되는데 어떻게?</summary>
        <p style={faqAnswer}>
          <strong>YAML 1.1의 악명 높은 함정</strong>입니다. <code style={codeStyle}>yes·no·on·off·true·false</code> 모두 자동으로 boolean으로 해석돼요.<br />
          <strong>실제 사고 사례</strong>:<br />
          • <strong>노르웨이 ISO 코드 NO</strong> → <code style={codeStyle}>false</code>로 해석되어 데이터 깨짐<br />
          • Docker 환경 변수 <code style={codeStyle}>SETTING: yes</code> → <code style={codeStyle}>true</code>로 해석<br />
          <strong>해결</strong>:<br />
          • <strong>YAML 1.2 사용</strong> — boolean은 <code style={codeStyle}>true</code>/<code style={codeStyle}>false</code>만 (yes/no는 문자열)<br />
          • <strong>따옴표로 감싸기</strong> — <code style={codeStyle}>{`country: "NO"`}</code><br />
          본 도구는 <strong>JSON_SCHEMA</strong> (YAML 1.2 호환)을 기본 사용 → yes/no를 문자열로 유지합니다. CORE_SCHEMA(1.1) 옵션은 호환성 위해 미제공.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 앵커(&)와 별칭(*)이 무엇인가요?</summary>
        <div style={faqAnswer}>
          <strong>YAML의 참조 메커니즘</strong>입니다. 같은 데이터를 여러 곳에서 재사용해 중복을 줄여요.<br />
          예시:
          <pre style={{ background: 'var(--bg3)', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)', marginTop: 6 }}>
{`defaults: &defaults
  timeout: 30
  retries: 3

prod:
  <<: *defaults
  url: https://prod.api.com

dev:
  <<: *defaults
  url: https://dev.api.com`}
          </pre>
          <strong>JSON 변환 시</strong>: 앵커가 펼쳐져 모든 곳에 데이터가 복사됩니다 (참조 관계 손실).
          역변환 시 자동 앵커 생성은 본 도구에서 끔(noRefs: true)으로 두어 깔끔한 YAML 출력을 보장합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. application.yml과 application.yaml 차이?</summary>
        <p style={faqAnswer}>
          <strong>완전히 동일</strong>합니다. 단순히 파일 확장자만 다를 뿐 내용·문법·동작 모두 같아요.<br />
          • <strong>.yml</strong>: 옛 표기 (YAML 1.0 시대), Windows 8.3 파일 시스템 호환 목적<br />
          • <strong>.yaml</strong>: <strong>공식 권장 확장자</strong> (yaml.org·YAML 스펙)<br />
          <strong>Spring Boot 우선순위</strong>: 같은 디렉토리에 두 개 다 있으면 <code style={codeStyle}>application.yaml</code>이 우선 적용 (Spring Boot 2.5+).<br />
          새 프로젝트에는 <strong>.yaml</strong> 권장. 본 도구의 다운로드 파일명은 <code style={codeStyle}>.yaml</code> 사용.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 변환 결과가 원본보다 길어요</summary>
        <p style={faqAnswer}>
          <strong>YAML → JSON</strong>: 일반적으로 <strong>JSON이 약 10~30% 길어집니다</strong>.<br />
          이유:<br />
          • 키마다 따옴표 (<code style={codeStyle}>{`name`}</code> → <code style={codeStyle}>{`"name"`}</code>)<br />
          • 중괄호·대괄호 추가<br />
          • 콤마 구분자 추가<br />
          • 들여쓰기 (compact 모드는 한 줄로 줄임)<br />
          <strong>JSON → YAML</strong>: 일반적으로 <strong>YAML이 짧아집니다</strong> (괄호·따옴표 제거).<br />
          파일 크기가 중요하면 <strong>JSON Compact 모드</strong>(한 줄)를 사용하세요. 옵션 패널의 &quot;JSON 출력: Compact&quot;.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 한국어·이모지가 깨져요</summary>
        <p style={faqAnswer}>
          본 도구는 <strong>UTF-8 인코딩</strong>을 사용해 한국어·이모지·중국어·일본어 모두 정상 처리됩니다.<br />
          깨짐이 발생하면 다음을 확인하세요:<br />
          1. <strong>원본 파일 인코딩</strong> — UTF-8 (BOM 없음) 권장. EUC-KR·CP949 변환 후 사용<br />
          2. <strong>다운로드 후 열 때</strong> — 메모장 대신 VS Code·Notepad++ 사용<br />
          3. <strong>Windows 명령 프롬프트</strong> — <code style={codeStyle}>chcp 65001</code>로 UTF-8 설정<br />
          4. <strong>특수 문자</strong> — 따옴표로 감싸기 (<code style={codeStyle}>{`name: "한글: 포함"`}</code>)<br />
          본 도구의 다운로드 파일은 항상 UTF-8 BOM 없이 저장됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 본 도구는 입력 데이터를 서버에 보내나요?</summary>
        <p style={faqAnswer}>
          <strong>아니요. 모든 처리가 브라우저(클라이언트)에서 수행됩니다.</strong><br />
          • 변환·검증·트리 미리보기 모두 <strong>js-yaml</strong>(MIT 라이선스, ~50KB) 라이브러리로 브라우저 내 처리<br />
          • 입력 데이터는 <strong>localStorage에만 저장</strong> (재방문 편의), 외부 전송 없음<br />
          • Network 탭으로 확인 가능 — 변환 시 어떤 fetch/XHR도 발생하지 않음<br />
          • 다운로드는 <code style={codeStyle}>Blob</code> URL로 브라우저 내 처리<br />
          <strong>다만</strong>: 공용 PC·공유 기기에서 K8s 시크릿·Spring 비밀번호 등을 다룰 때는 사용 후 브라우저 캐시·localStorage를 정리하세요.
          개발자 도구 → Application → Local Storage에서 <code style={codeStyle}>youtil_yaml_json_v1</code> 키 삭제 가능.
        </p>
      </details>

      {/* 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/dev/json" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>📋</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>JSON 포맷터</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            JSON 정렬·압축·유효성
          </p>
        </Link>
        <Link href="/tools/dev/regex" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔍</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>정규식 테스트기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            매칭·캡처·치환·치트시트
          </p>
        </Link>
        <Link href="/tools/dev/hash" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔒</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>해시 생성기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            MD5·SHA·HMAC·파일 무결성
          </p>
        </Link>
      </div>
    </div>
  )
}
