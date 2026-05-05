/* YAML ↔ JSON 변환기 — 데이터·계산 유틸 */

import yaml from 'js-yaml'

export type Format = 'yaml' | 'json' | 'ambiguous' | 'empty'
export type Direction = 'auto' | 'y2j' | 'j2y'
export type IndentId = '2' | '4' | 'tab'
export type CategoryId = 'k8s' | 'docker' | 'ci' | 'spring' | 'openapi' | 'node'

export const MAX_INPUT_BYTES = 500 * 1024  /* 500KB */
export const MAX_DEPTH_WARN = 100

/* ─────────────────────────────────────────────
   들여쓰기 옵션
   ───────────────────────────────────────────── */
export interface IndentOption {
  id: IndentId
  label: string
  value: string  /* 실제 들여쓰기 문자열 */
  yamlIndent: number  /* js-yaml dump indent (숫자) */
}

export const INDENT_OPTIONS: IndentOption[] = [
  { id: '2',   label: '2 spaces (기본)', value: '  ',   yamlIndent: 2 },
  { id: '4',   label: '4 spaces',        value: '    ', yamlIndent: 4 },
  { id: 'tab', label: 'Tab',             value: '\t',   yamlIndent: 2 },  /* yaml은 tab 미지원, 2 fallback */
]

export const getIndent = (id: IndentId) =>
  INDENT_OPTIONS.find((o) => o.id === id) ?? INDENT_OPTIONS[0]

/* ─────────────────────────────────────────────
   카테고리
   ───────────────────────────────────────────── */
export const CATEGORIES: { id: CategoryId | 'all'; emoji: string; label: string }[] = [
  { id: 'all',     emoji: '✨', label: '전체' },
  { id: 'k8s',     emoji: '☸️', label: 'Kubernetes' },
  { id: 'docker',  emoji: '🐳', label: 'Docker' },
  { id: 'ci',      emoji: '🐙', label: 'CI/CD' },
  { id: 'spring',  emoji: '🍃', label: 'Spring' },
  { id: 'openapi', emoji: '🔌', label: 'OpenAPI' },
  { id: 'node',    emoji: '📦', label: 'Node.js' },
]

/* ─────────────────────────────────────────────
   12 예시 라이브러리
   ───────────────────────────────────────────── */
export interface Example {
  id: string
  emoji: string
  name: string
  category: CategoryId
  format: 'yaml' | 'json'
  desc: string
  code: string
}

export const EXAMPLES: Example[] = [
  {
    id: 'k8s-pod', emoji: '☸️', name: 'Kubernetes Pod', category: 'k8s', format: 'yaml',
    desc: 'apiVersion·kind·spec 가장 단순한 파드 정의',
    code: `apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
      resources:
        limits:
          memory: "128Mi"
          cpu: "500m"
`,
  },
  {
    id: 'k8s-deployment', emoji: '☸️', name: 'Kubernetes Deployment', category: 'k8s', format: 'yaml',
    desc: 'replicas + selector + template 표준 디플로이먼트',
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 80
`,
  },
  {
    id: 'k8s-configmap', emoji: '☸️', name: 'Kubernetes ConfigMap', category: 'k8s', format: 'yaml',
    desc: '환경 변수·설정 파일 보관',
    code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_url: "postgres://db:5432/app"
  log_level: "info"
  feature_flags: |
    new_ui: true
    beta_search: false
`,
  },
  {
    id: 'docker-compose', emoji: '🐳', name: 'Docker Compose', category: 'docker', format: 'yaml',
    desc: 'services·volumes·networks — 멀티 컨테이너',
    code: `services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    depends_on:
      - api
  api:
    build: ./api
    environment:
      DATABASE_URL: postgres://db:5432/app
    ports:
      - "3000:3000"
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: app
      POSTGRES_PASSWORD: secret

volumes:
  pgdata:
`,
  },
  {
    id: 'github-actions', emoji: '🐙', name: 'GitHub Actions Workflow', category: 'ci', format: 'yaml',
    desc: 'CI/CD 워크플로 — Node.js 빌드·테스트',
    code: `name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm test
`,
  },
  {
    id: 'gitlab-ci', emoji: '🐙', name: 'GitLab CI', category: 'ci', format: 'yaml',
    desc: 'stages + jobs — GitLab 표준 CI 파이프라인',
    code: `stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:20-alpine
  script:
    - npm test
  coverage: '/Lines\\s*:\\s*(\\d+\\.\\d+)%/'

deploy:
  stage: deploy
  only:
    - main
  script:
    - echo "Deploying to production"
`,
  },
  {
    id: 'spring-app', emoji: '🍃', name: 'Spring application.yml', category: 'spring', format: 'yaml',
    desc: 'server·datasource·jpa — 기본 Spring Boot 설정',
    code: `server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app
    username: appuser
    password: \${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        show_sql: false

logging:
  level:
    root: INFO
    com.example: DEBUG
`,
  },
  {
    id: 'spring-multi', emoji: '🍃', name: 'Spring 멀티 프로파일', category: 'spring', format: 'yaml',
    desc: '--- 구분자로 dev·prod 환경 분리',
    code: `spring:
  profiles:
    active: dev

---
spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:h2:mem:devdb
  jpa:
    show-sql: true

---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: jdbc:postgresql://prod-db:5432/app
  jpa:
    show-sql: false
`,
  },
  {
    id: 'openapi', emoji: '🔌', name: 'OpenAPI 3.0', category: 'openapi', format: 'yaml',
    desc: 'paths·schemas·components — Swagger 스펙',
    code: `openapi: 3.0.3
info:
  title: User API
  version: 1.0.0
  description: 사용자 관리 API

paths:
  /users:
    get:
      summary: 사용자 목록
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: 사용자 생성
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '201':
          description: 생성됨

components:
  schemas:
    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: integer
        email:
          type: string
          format: email
        name:
          type: string
`,
  },
  {
    id: 'package-json', emoji: '📦', name: 'package.json', category: 'node', format: 'json',
    desc: 'Node.js 프로젝트 표준 설정 파일',
    code: `{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My awesome app",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "vitest": "^2.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}`,
  },
  {
    id: 'tsconfig', emoji: '⚙️', name: 'tsconfig.json', category: 'node', format: 'json',
    desc: 'TypeScript 컴파일러 설정',
    code: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next"]
}`,
  },
  {
    id: 'helm-values', emoji: '⛵', name: 'Helm values.yaml', category: 'k8s', format: 'yaml',
    desc: 'Helm 차트 변수 — 환경별 오버라이드용',
    code: `replicaCount: 3

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: "1.25"

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 64Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
`,
  },
]

/* ═════════════════════════════════════════════
   자동 형식 감지
   ═════════════════════════════════════════════ */
export function detectFormat(text: string): Format {
  const trimmed = text.trim()
  if (trimmed === '') return 'empty'
  const first = trimmed[0]
  if (first === '{' || first === '[') return 'json'
  /* YAML 단서: # 주석, --- 구분자, key: 패턴, - 리스트 */
  if (first === '#' || trimmed.startsWith('---')) return 'yaml'
  if (/^[a-zA-Z_][\w-]*\s*:/m.test(trimmed)) return 'yaml'
  if (/^-\s/m.test(trimmed)) return 'yaml'
  return 'ambiguous'
}

/* ═════════════════════════════════════════════
   변환 옵션·결과 타입
   ═════════════════════════════════════════════ */
export interface ConvertOpts {
  indent: IndentId
  jsonCompact: boolean
  sortKeys: boolean
}

export interface ConvertStats {
  lines: number
  keys: number
  depth: number
  ms: number
}

export interface ConvertResult {
  success: boolean
  result?: string
  error?: string
  errorLine?: number
  errorCol?: number
  stats?: ConvertStats
  warnings?: string[]
  isMultiDoc?: boolean
}

/* ═════════════════════════════════════════════
   YAML → JSON
   ═════════════════════════════════════════════ */
export function yamlToJson(yamlText: string, opts: ConvertOpts): ConvertResult {
  const t0 = performance.now()
  const warnings = detectLossyFeatures(yamlText).lossyMessages

  try {
    const indent = getIndent(opts.indent)
    /* 멀티 도큐먼트 우선 시도 */
    const docs = yaml.loadAll(yamlText, undefined, { schema: yaml.JSON_SCHEMA })
    let parsed: unknown
    let isMultiDoc = false
    if (docs.length > 1) {
      parsed = docs
      isMultiDoc = true
      warnings.push('📚 멀티 도큐먼트 YAML — JSON 배열로 변환됨')
    } else if (docs.length === 1) {
      parsed = docs[0]
    } else {
      parsed = null
    }

    const sortFn = opts.sortKeys ? (key: string, value: unknown) => sortReplacer(key, value) : undefined
    const result = opts.jsonCompact
      ? JSON.stringify(parsed, sortFn)
      : JSON.stringify(parsed, sortFn, indent.value)
    return {
      success: true, result,
      stats: computeStats(parsed, result, performance.now() - t0),
      warnings: warnings.length > 0 ? warnings : undefined,
      isMultiDoc,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'YAML 파싱 오류'
    /* js-yaml YAMLException은 line/column 정보 포함 */
    let line: number | undefined, col: number | undefined
    if (e && typeof e === 'object' && 'mark' in e) {
      const mark = (e as { mark?: { line?: number; column?: number } }).mark
      if (mark) { line = (mark.line ?? -1) + 1; col = (mark.column ?? -1) + 1 }
    }
    return { success: false, error: msg, errorLine: line, errorCol: col }
  }
}

/* ═════════════════════════════════════════════
   JSON → YAML
   ═════════════════════════════════════════════ */
export function jsonToYaml(jsonText: string, opts: ConvertOpts): ConvertResult {
  const t0 = performance.now()
  try {
    const parsed = JSON.parse(jsonText)
    const indent = getIndent(opts.indent)
    const result = yaml.dump(parsed, {
      indent: indent.yamlIndent,
      sortKeys: opts.sortKeys,
      lineWidth: -1,    /* 자동 줄바꿈 비활성 */
      noRefs: true,     /* 앵커 자동 생성 X */
      schema: yaml.JSON_SCHEMA,
      forceQuotes: false,
      quotingType: '"',
    })
    return {
      success: true, result,
      stats: computeStats(parsed, result, performance.now() - t0),
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'JSON 파싱 오류'
    /* JSON.parse 오류 메시지에서 position 추출 시도 */
    let line: number | undefined, col: number | undefined
    if (e instanceof SyntaxError) {
      const posMatch = msg.match(/position (\d+)/)
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10)
        const before = jsonText.slice(0, pos)
        line = before.split('\n').length
        col = pos - before.lastIndexOf('\n')
      }
    }
    return { success: false, error: msg, errorLine: line, errorCol: col }
  }
}

/* sortKeys replacer (재귀 키 정렬) */
function sortReplacer(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const sorted: Record<string, unknown> = {}
    const obj = value as Record<string, unknown>
    Object.keys(obj).sort().forEach((k) => { sorted[k] = obj[k] })
    return sorted
  }
  return value
}

/* ═════════════════════════════════════════════
   손실 정보 감지
   ═════════════════════════════════════════════ */
export interface LossyFeatures {
  hasComments: boolean
  hasAnchors: boolean
  isMultiDoc: boolean
  hasTags: boolean
  lossyMessages: string[]
}

export function detectLossyFeatures(yamlText: string): LossyFeatures {
  const messages: string[] = []
  /* # 주석 (단, 문자열 안의 # 은 제외 — 간단 휴리스틱) */
  const lines = yamlText.split('\n')
  const hasComments = lines.some((l) => {
    const t = l.trim()
    return t.startsWith('#') || /\s#\s/.test(t)
  })
  if (hasComments) messages.push('💬 주석(#) 발견 — JSON 변환 시 사라집니다')

  /* & 앵커 / * 별칭 */
  const hasAnchors = /(\s|^)[&*]\w/.test(yamlText)
  if (hasAnchors) messages.push('🔗 앵커(&)/별칭(*) 발견 — 펼쳐져 데이터 중복으로 변환됩니다')

  /* --- 멀티 도큐먼트 */
  const docCount = (yamlText.match(/^---\s*$/gm) || []).length
  const isMultiDoc = docCount > 0 && yamlText.replace(/^---\s*$/gm, '').trim().length > 0
  /* 멀티 도큐먼트 메시지는 yamlToJson 에서 처리 (실제 도큐먼트 수에 따라) */

  /* !!tag 커스텀 태그 */
  const hasTags = /!!?\w+/.test(yamlText)
  if (hasTags) messages.push('🏷️ 커스텀 태그(!!) 발견 — 일부 환경에서 동작 다름')

  return { hasComments, hasAnchors, isMultiDoc, hasTags, lossyMessages: messages }
}

/* ═════════════════════════════════════════════
   검증
   ═════════════════════════════════════════════ */
export interface ValidateResult {
  format: Format
  detectedAs: 'yaml' | 'json' | 'invalid' | 'empty'
  valid: boolean
  error?: string
  errorLine?: number
  errorCol?: number
  data?: unknown
  stats?: ConvertStats
}

export function validateData(text: string): ValidateResult {
  const detected = detectFormat(text)
  if (detected === 'empty') {
    return { format: 'empty', detectedAs: 'empty', valid: false }
  }

  const t0 = performance.now()

  /* JSON 우선 시도 */
  if (detected === 'json' || detected === 'ambiguous') {
    try {
      const data = JSON.parse(text)
      return {
        format: detected, detectedAs: 'json', valid: true, data,
        stats: computeStats(data, text, performance.now() - t0),
      }
    } catch (e) {
      if (detected === 'json') {
        const msg = e instanceof Error ? e.message : 'JSON 오류'
        let line: number | undefined, col: number | undefined
        if (e instanceof SyntaxError) {
          const posMatch = msg.match(/position (\d+)/)
          if (posMatch) {
            const pos = parseInt(posMatch[1], 10)
            const before = text.slice(0, pos)
            line = before.split('\n').length
            col = pos - before.lastIndexOf('\n')
          }
        }
        return { format: 'json', detectedAs: 'invalid', valid: false, error: msg, errorLine: line, errorCol: col }
      }
      /* ambiguous 면 YAML 시도로 fall through */
    }
  }

  /* YAML 시도 */
  try {
    const docs = yaml.loadAll(text, undefined, { schema: yaml.JSON_SCHEMA })
    const data = docs.length === 1 ? docs[0] : docs
    return {
      format: detected === 'ambiguous' ? 'yaml' : detected, detectedAs: 'yaml',
      valid: true, data,
      stats: computeStats(data, text, performance.now() - t0),
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'YAML 오류'
    let line: number | undefined, col: number | undefined
    if (e && typeof e === 'object' && 'mark' in e) {
      const mark = (e as { mark?: { line?: number; column?: number } }).mark
      if (mark) { line = (mark.line ?? -1) + 1; col = (mark.column ?? -1) + 1 }
    }
    return { format: detected, detectedAs: 'invalid', valid: false, error: msg, errorLine: line, errorCol: col }
  }
}

/* ═════════════════════════════════════════════
   통계 계산
   ═════════════════════════════════════════════ */
function computeStats(data: unknown, text: string, ms: number): ConvertStats {
  return {
    lines: text.split('\n').length,
    keys: countKeys(data),
    depth: maxDepth(data),
    ms,
  }
}

export function countKeys(value: unknown): number {
  if (value === null || typeof value !== 'object') return 0
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + countKeys(item), 0)
  }
  const obj = value as Record<string, unknown>
  let count = 0
  for (const k in obj) {
    count++
    count += countKeys(obj[k])
  }
  return count
}

export function maxDepth(value: unknown, current = 0): number {
  if (value === null || typeof value !== 'object') return current
  let max = current
  if (Array.isArray(value)) {
    for (const item of value) {
      max = Math.max(max, maxDepth(item, current + 1))
    }
  } else {
    const obj = value as Record<string, unknown>
    for (const k in obj) {
      max = Math.max(max, maxDepth(obj[k], current + 1))
    }
  }
  return max
}

/* ═════════════════════════════════════════════
   유틸
   ═════════════════════════════════════════════ */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function fmtMs(ms: number): string {
  if (ms < 1) return ms.toFixed(2) + 'ms'
  if (ms < 100) return ms.toFixed(1) + 'ms'
  return ms.toFixed(0) + 'ms'
}

export function fmtInt(n: number): string {
  return n.toLocaleString('ko-KR')
}

/** 다운로드 파일명 생성 — convert-YYYYMMDD.{ext} */
export function downloadFileName(format: 'json' | 'yaml'): string {
  const d = new Date()
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `convert-${y}${mo}${da}.${format}`
}

/** 데이터 트리 미리보기용 — 최상위 키 5개까지 */
export interface TreeNode {
  key: string
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  preview: string
  childCount?: number
}

export function buildTreePreview(data: unknown, limit = 5): TreeNode[] {
  if (data === null || typeof data !== 'object') return []
  if (Array.isArray(data)) {
    return data.slice(0, limit).map((item, i) => describeNode(`[${i}]`, item))
  }
  const obj = data as Record<string, unknown>
  return Object.keys(obj).slice(0, limit).map((k) => describeNode(k, obj[k]))
}

function describeNode(key: string, value: unknown): TreeNode {
  if (value === null) return { key, type: 'null', preview: 'null' }
  if (Array.isArray(value)) return { key, type: 'array', preview: `[${value.length} items]`, childCount: value.length }
  if (typeof value === 'object') {
    const count = Object.keys(value).length
    return { key, type: 'object', preview: `{${count} keys}`, childCount: count }
  }
  if (typeof value === 'string') {
    const trunc = value.length > 40 ? value.slice(0, 37) + '...' : value
    return { key, type: 'string', preview: `"${trunc}"` }
  }
  if (typeof value === 'number') return { key, type: 'number', preview: String(value) }
  if (typeof value === 'boolean') return { key, type: 'boolean', preview: String(value) }
  return { key, type: 'string', preview: String(value) }
}
