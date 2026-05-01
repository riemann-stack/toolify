/* ──────────────────────────────────────────────────────
   interior/room-area/projectionUtils.ts
   3D 캐비넷 투영 (cabinet projection) — 정확한 8정점 계산
   기존 버그: 우측 벽 폭 0짜리 막대기로 표시되던 문제 해결
   ────────────────────────────────────────────────────── */

export interface BoxDimensions {
  width: number    // 가로 (m) — x축
  depth: number    // 세로 (m) — z축 (사람이 보는 깊이)
  height: number   // 천장 높이 (m) — y축
}

export interface Point2D {
  x: number
  y: number
}

export interface ProjectedBox {
  // 8정점 (front=앞, back=뒤, left·right, floor·ceiling)
  flf: Point2D  // floor-left-front
  frf: Point2D  // floor-right-front
  flb: Point2D  // floor-left-back
  frb: Point2D  // floor-right-back
  clf: Point2D  // ceiling-left-front
  crf: Point2D  // ceiling-right-front
  clb: Point2D  // ceiling-left-back
  crb: Point2D  // ceiling-right-back
}

export interface ProjectionConfig {
  scale: number        // m → px 환산
  origin: Point2D      // 화면 기준점 (flf의 위치)
  angle?: number        // 깊이 각도 (라디안), 기본 30°
  depthFactor?: number  // 깊이 축소 (cabinet=0.5, isometric=1.0)
}

/**
 * 캐비넷 투영 (cabinet projection)
 * 깊이를 50% 축소해 표시하는 표준 등각 투영 변형
 * - x축 (가로): 그대로
 * - y축 (높이): 위쪽으로 (스크린 y는 아래로 + 이므로 부호 반전)
 * - z축 (깊이): cos(angle), sin(angle)로 평면 투영, 50% 축소
 *
 * 기존 버그 — `ix(w, l) = w * 0.866`로 z 좌표 무시 → frb·frf의 x 동일 → 우측 벽 폭 0
 * 수정 — `ix(x, z) = x + z * cos(angle) * depthFactor` 로 z 명시 반영
 */
export function projectCabinet(dim: BoxDimensions, cfg: ProjectionConfig): ProjectedBox {
  const { scale, origin } = cfg
  const angle = cfg.angle ?? Math.PI / 6  // 30°
  const depthFactor = cfg.depthFactor ?? 0.5

  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // 3D → 2D 투영 함수
  // y_screen은 위가 작은값. 높이(y)와 깊이(z) 모두 화면 위쪽으로 이동시켜야 함
  const project = (x: number, y: number, z: number): Point2D => ({
    x: origin.x + (x + z * cos * depthFactor) * scale,
    y: origin.y - (y + z * sin * depthFactor) * scale,
  })

  const w = dim.width
  const d = dim.depth
  const h = dim.height

  return {
    flf: project(0, 0, 0),
    frf: project(w, 0, 0),
    flb: project(0, 0, d),
    frb: project(w, 0, d),
    clf: project(0, h, 0),
    crf: project(w, h, 0),
    clb: project(0, h, d),
    crb: project(w, h, d),
  }
}

/* ─── 박스 전체 영역의 화면 경계 (자동 스케일 계산용) ─── */
export interface BoxBounds {
  minX: number; maxX: number; minY: number; maxY: number
  width: number; height: number
}

export function getBoxBounds(box: ProjectedBox): BoxBounds {
  const xs = [box.flf.x, box.frf.x, box.flb.x, box.frb.x, box.clf.x, box.crf.x, box.clb.x, box.crb.x]
  const ys = [box.flf.y, box.frf.y, box.flb.y, box.frb.y, box.clf.y, box.crf.y, box.clb.y, box.crb.y]
  const minX = Math.min(...xs); const maxX = Math.max(...xs)
  const minY = Math.min(...ys); const maxY = Math.max(...ys)
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * 자동 스케일: 입력 차원이 어떤 크기여도 viewBox 안에 적절히 맞추기
 * 1m × 5m 복도 / 7m × 7m 정사각형 / 10m × 3m 큰 직사각형 모두 비율 유지
 */
export function autoScale(
  dim: BoxDimensions,
  viewWidth: number,
  viewHeight: number,
  margin: number = 30,
  angle: number = Math.PI / 6,
  depthFactor: number = 0.5,
): { scale: number; origin: Point2D } {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  // 박스의 px-당-1m 기준 화면 폭/높이
  const projWidth = dim.width + dim.depth * cos * depthFactor
  const projHeight = dim.height + dim.depth * sin * depthFactor

  if (projWidth <= 0 || projHeight <= 0) return { scale: 30, origin: { x: margin, y: viewHeight - margin } }

  const scaleX = (viewWidth - margin * 2) / projWidth
  const scaleY = (viewHeight - margin * 2) / projHeight
  const scale = Math.min(scaleX, scaleY)

  // 박스를 화면 가운데 정렬
  const usedW = projWidth * scale
  const usedH = projHeight * scale
  const offsetX = (viewWidth - usedW) / 2
  const offsetY = (viewHeight - usedH) / 2

  // origin = flf의 화면 좌표 (왼쪽-앞-아래)
  // flf는 박스의 가장 아래·왼쪽·앞쪽 → 화면에선 왼쪽 + 아래 (y큼)
  return {
    scale,
    origin: { x: offsetX, y: viewHeight - offsetY },
  }
}

/* ─── SVG path 헬퍼 ─── */
export function pathPolygon(...pts: Point2D[]): string {
  return 'M ' + pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ') + ' Z'
}

/* ─── 보이는 면 (cabinet 투영 기본 시점) ─── */
export interface VisibleFace {
  id: 'floor' | 'ceiling' | 'front' | 'back' | 'left' | 'right'
  points: Point2D[]
  fill: string
  stroke: string
}

export function getVisibleFaces(box: ProjectedBox): VisibleFace[] {
  // Painter's algorithm: 뒤쪽부터 그려서 앞쪽 면이 위에 오도록
  // 시점이 위·앞·왼쪽이라 가정 → 보이는 면: 천장, 정면, 우측
  // (좌측 벽·뒷벽·바닥은 가려짐)
  return [
    // 1. 바닥 (옅게, 천장보다 먼저 그려서 천장이 위에 오도록 — 천장이 더 가까움)
    {
      id: 'floor',
      points: [box.flf, box.frf, box.frb, box.flb],
      fill: 'rgba(200,255,62,0.18)', stroke: '#C8FF3E',
    },
    // 2. 정면 벽 (사용자가 들어오는 쪽)
    {
      id: 'front',
      points: [box.flf, box.frf, box.crf, box.clf],
      fill: 'rgba(255,140,62,0.18)', stroke: '#FF8C3E',
    },
    // 3. 우측 벽 — 버그 수정 핵심: frf와 frb의 x좌표가 다름!
    {
      id: 'right',
      points: [box.frf, box.frb, box.crb, box.crf],
      fill: 'rgba(232,151,87,0.14)', stroke: '#FF8C3E',
    },
    // 4. 천장 (위에서 살짝 보임)
    {
      id: 'ceiling',
      points: [box.clf, box.crf, box.crb, box.clb],
      fill: 'rgba(155,89,182,0.18)', stroke: '#9B59B6',
    },
  ]
}

/* ─── 자체 단위 테스트 (개발 시 console에서 검증) ─── */
export function runProjectionSelfTest(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = []
  let passed = 0
  const expect = (label: string, ok: boolean, extra?: string) => {
    if (ok) passed++
    else errors.push(`❌ ${label}${extra ? ': ' + extra : ''}`)
  }

  // 1. 정사각형 7×7×2.4 — 8정점 모두 다른 좌표
  {
    const box = projectCabinet({ width: 7, depth: 7, height: 2.4 }, { scale: 20, origin: { x: 0, y: 100 } })
    const all = [box.flf, box.frf, box.flb, box.frb, box.clf, box.crf, box.clb, box.crb]
    const uniqueXs = new Set(all.map(p => p.x.toFixed(2)))
    expect('정사각형 — x 좌표 최소 3개 다름', uniqueXs.size >= 3, `unique=${uniqueXs.size}`)
  }

  // 2. 우측 벽 폭이 0이 아님 (★★★★ 핵심 버그 수정)
  {
    const box = projectCabinet({ width: 5, depth: 4, height: 2.4 }, { scale: 20, origin: { x: 0, y: 100 } })
    const xs = [box.frf.x, box.frb.x, box.crb.x, box.crf.x]
    const dx = Math.max(...xs) - Math.min(...xs)
    expect('우측 벽 폭 > 0.5px', dx > 0.5, `dx=${dx.toFixed(2)}px`)
  }

  // 3. 정면 벽 — 천장이 바닥 위에 (스크린 y는 작을수록 위)
  {
    const box = projectCabinet({ width: 5, depth: 4, height: 2.4 }, { scale: 20, origin: { x: 0, y: 100 } })
    expect('천장이 바닥보다 위 (clf.y < flf.y)', box.clf.y < box.flf.y,
      `clf.y=${box.clf.y.toFixed(1)} flf.y=${box.flf.y.toFixed(1)}`)
  }

  // 4. flf와 flb의 x 좌표가 다름 (좌측 깊이 분리)
  {
    const box = projectCabinet({ width: 5, depth: 4, height: 2.4 }, { scale: 20, origin: { x: 0, y: 100 } })
    expect('flf와 flb의 x 좌표 분리', Math.abs(box.flf.x - box.flb.x) > 0.5,
      `dx=${Math.abs(box.flf.x - box.flb.x).toFixed(2)}px`)
  }

  // 5. 자동 스케일 — 다양한 비율 모두 viewBox 안에
  {
    const dims: BoxDimensions[] = [
      { width: 1, depth: 5, height: 2.4 },     // 복도형
      { width: 7, depth: 7, height: 2.4 },     // 정사각형
      { width: 10, depth: 3, height: 2.4 },    // 가로 긴
      { width: 5, depth: 5, height: 5 },        // 천장 높음
    ]
    for (const d of dims) {
      const cfg = autoScale(d, 360, 240, 30)
      const box = projectCabinet(d, cfg)
      const bounds = getBoxBounds(box)
      expect(`자동 스케일 ${d.width}×${d.depth}×${d.height} — viewBox 안`,
        bounds.minX >= -1 && bounds.maxX <= 361 && bounds.minY >= -1 && bounds.maxY <= 241,
        `bounds=[${bounds.minX.toFixed(0)},${bounds.maxX.toFixed(0)},${bounds.minY.toFixed(0)},${bounds.maxY.toFixed(0)}]`)
    }
  }

  return { passed, failed: errors.length, errors }
}
