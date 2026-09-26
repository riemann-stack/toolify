'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useState } from 'react'
import s from './network-test.module.css'

/* ─── 타입 ─── */
type Phase = 'idle' | 'latency' | 'sites' | 'download' | 'done'

interface LatencyStats {
  samples: number[]
  min: number
  median: number
  avg: number
  p95: number
  max: number
  jitter: number  // 연속 샘플 차이의 평균 (RFC 3550 방식 단순화)
  loss: number    // 실패 비율 (0~1)
}

interface SiteResult {
  url: string
  label: string
  rttMs?: number
  edgeRttMs?: number  // Edge → 사이트 구간 (서버 측정)
  status?: number
  error?: string
}

interface DownloadResult {
  bytes: number
  durationMs: number
  mbps: number
}

/* ─── 측정 사이트 ─── */
const SITE_TARGETS = [
  { url: 'https://ticket.interpark.com',        label: '🎤 인터파크 티켓' },
  { url: 'https://ticket.yes24.com',            label: '📚 예스24 티켓' },
  { url: 'https://www.melon.com',               label: '🎵 멜론' },
  { url: 'https://www.ticketlink.co.kr',        label: '🎟️ 티켓링크' },
  { url: 'https://tickets.koreabaseball.com',   label: '⚾ KBO 티켓' },
  { url: 'https://www.google.com',              label: '🌐 Google (해외 기준)' },
] as const

/* ─── 통계 헬퍼 ─── */
function calcStats(samples: number[], loss: number): LatencyStats {
  const sorted = [...samples].sort((a, b) => a - b)
  const n = sorted.length
  const min = n > 0 ? sorted[0] : 0
  const max = n > 0 ? sorted[n - 1] : 0
  const median = n > 0 ? sorted[Math.floor(n / 2)] : 0
  const p95 = n > 0 ? sorted[Math.floor(n * 0.95)] || sorted[n - 1] : 0
  const avg = n > 0 ? sorted.reduce((a, b) => a + b, 0) / n : 0
  // 지터 = 이웃한 샘플 간 차이의 평균 (측정 순서 기준) — 튀는 값 1개가 표준편차처럼 크게 부풀리지 않음
  let diffSum = 0
  for (let i = 1; i < samples.length; i++) diffSum += Math.abs(samples[i] - samples[i - 1])
  const jitter = samples.length > 1 ? diffSum / (samples.length - 1) : 0
  return { samples, min, median, avg, p95, max, jitter, loss }
}

/* ─── 등급 함수 ─── */
function rateLatency(min: number): { label: string; color: string; desc: string } {
  if (min < 20) return { label: '🟢 매우 좋음', color: '#059669', desc: '광랜·5G·우수 Wi-Fi 수준' }
  if (min < 50) return { label: '🟢 좋음', color: '#0891B2', desc: '일반 광랜·5G 수준' }
  if (min < 100) return { label: '🟡 보통', color: '#D97706', desc: 'LTE·Wi-Fi 5GHz 수준' }
  if (min < 200) return { label: '🟠 느림', color: '#EA580C', desc: '혼잡한 Wi-Fi·LTE 약함' }
  return { label: '🔴 매우 느림', color: '#DC2626', desc: '회선·라우터 점검 필요' }
}
function rateJitter(jitter: number): { label: string; color: string; desc: string } {
  if (jitter < 5) return { label: '🟢 매우 안정', color: '#059669', desc: '티켓팅 적합' }
  if (jitter < 15) return { label: '🟢 안정', color: '#0891B2', desc: '일반 사용 OK' }
  if (jitter < 30) return { label: '🟡 약간 불안정', color: '#D97706', desc: '간헐적 지연 가능' }
  return { label: '🔴 매우 불안정', color: '#DC2626', desc: 'Wi-Fi 채널·라우터 점검' }
}
function rateSpeed(mbps: number): { label: string; color: string; desc: string } {
  if (mbps >= 100) return { label: '🟢 매우 빠름', color: '#059669', desc: '고화질 영상·대용량 다운로드도 여유' }
  if (mbps >= 50) return { label: '🟢 빠름', color: '#0891B2', desc: '일상 사용에 충분' }
  if (mbps >= 20) return { label: '🟡 보통', color: '#D97706', desc: '웹·영상 스트리밍 가능' }
  if (mbps >= 5) return { label: '🟠 느림', color: '#EA580C', desc: '약한 신호·혼잡한 Wi-Fi 의심' }
  return { label: '🔴 매우 느림', color: '#DC2626', desc: '회선 점검 필요' }
}

/* ─── 측정 함수 ─── */
async function measureOnce(): Promise<number | null> {
  const t0 = performance.now()
  try {
    const r = await fetch(`/api/time?t=${t0}-${Math.random()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    await r.text()
    return performance.now() - t0
  } catch {
    return null
  }
}

async function measureSite(url: string): Promise<SiteResult> {
  const t0 = performance.now()
  try {
    const r = await fetch(`/api/proxy-time?url=${encodeURIComponent(url)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    const data = await r.json() as { ok: boolean; rttMs?: number; httpStatus?: number; error?: string }
    const browserToEdge = performance.now() - t0
    if (data.ok) {
      // 브라우저 측정값과 Edge→사이트 RTT 둘 다 표현
      return {
        url, label: '', rttMs: Math.round(browserToEdge), status: data.httpStatus,
        edgeRttMs: typeof data.rttMs === 'number' ? Math.round(data.rttMs) : undefined,
      }
    }
    return { url, label: '', error: data.error || '실패' }
  } catch (e) {
    return { url, label: '', error: e instanceof Error ? e.message : '네트워크 오류' }
  }
}

async function measureDownload(bytes: number): Promise<DownloadResult | null> {
  try {
    const r = await fetch(`/api/speedtest?bytes=${bytes}&t=${performance.now()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    })
    if (!r.ok) return null
    // 타이머는 응답 헤더를 받은 뒤부터 — 요청 왕복·서버 처리 시간(TTFB)을 빼고 본문 전송만 잰다
    const t0 = performance.now()
    let size = 0
    if (r.body) {
      const reader = r.body.getReader()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
      }
    } else {
      size = (await r.blob()).size
    }
    const dur = Math.max(1, performance.now() - t0)
    if (size === 0) return null
    const mbps = (size * 8) / (dur / 1000) / 1_000_000
    return { bytes: size, durationMs: dur, mbps }
  } catch {
    return null
  }
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function NetworkTestClient() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  const [latency, setLatency] = useState<LatencyStats | null>(null)
  const [sites, setSites] = useState<SiteResult[]>([])
  const [download, setDownload] = useState<DownloadResult | null>(null)
  const [downloadSize, setDownloadSize] = useState<1 | 5>(1)
  const [latencyFailed, setLatencyFailed] = useState(false)

  const runFullTest = useCallback(async () => {
    setLatency(null)
    setSites([])
    setDownload(null)
    setLatencyFailed(false)
    setProgress(0)

    // ── 1) 핑·지터 (워밍업 1회 + 20회) ──
    setPhase('latency')
    setProgressLabel('회선 핑 측정 중…')
    // 첫 요청은 DNS·TLS 연결 수립이 섞여 느리므로 버림
    await measureOnce()
    const N = 20
    const samples: number[] = []
    let failed = 0
    for (let i = 0; i < N; i++) {
      const r = await measureOnce()
      if (r === null) failed++
      else samples.push(r)
      setProgress(((i + 1) / N) * 35)
    }
    const loss = failed / N
    setLatency(calcStats(samples, loss))
    if (samples.length === 0) setLatencyFailed(true)

    // ── 2) 사이트 응답 시간 (병렬) ──
    setPhase('sites')
    setProgressLabel('주요 사이트 응답 시간 측정 중…')
    setProgress(40)
    const siteResults = await Promise.all(SITE_TARGETS.map(async (st) => {
      const r = await measureSite(st.url)
      return { ...r, url: st.url, label: st.label }
    }))
    setSites(siteResults)
    setProgress(70)

    // ── 3) 다운로드 ──
    setPhase('download')
    setProgressLabel(`다운로드 속도 측정 중 (${downloadSize}MB)…`)
    const dl = await measureDownload(downloadSize * 1_000_000)
    setDownload(dl)
    setProgress(100)

    setPhase('done')
    setProgressLabel('완료')
  }, [downloadSize])

  const isRunning = phase !== 'idle' && phase !== 'done'

  /* ─── 종합 판정 ─── */
  const overall = (() => {
    if (!latency || latency.samples.length === 0) return null
    const lat = rateLatency(latency.min)
    const jit = rateJitter(latency.jitter)
    // 단순 점수: 핑 40 + 지터 30 + 다운로드 30
    const latScore = Math.max(0, 100 - latency.min) // 100→0
    const jitScore = Math.max(0, 100 - latency.jitter * 4)
    const dlScore = download ? Math.min(100, (download.mbps / 100) * 100) : 50
    const total = Math.round(latScore * 0.4 + jitScore * 0.3 + dlScore * 0.3)
    return { lat, jit, total }
  })()

  /* ─── 추천 사항 ─── */
  const recommendations = (() => {
    if (!latency) return []
    const recs: string[] = []
    if (latency.min > 100) recs.push('📶 광랜·5G로 회선 변경 권장 (Wi-Fi 2.4GHz·LTE 약함 의심)')
    if (latency.jitter > 15) recs.push('📡 Wi-Fi 5GHz 사용 + 라우터 5m 이내 + 채널 변경 (지터 큼)')
    if (latency.loss > 0.05) recs.push('🛑 패킷 손실 5%+ — 유선 LAN 연결 권장 (Wi-Fi 회피)')
    if (download && download.mbps < 20) recs.push('🐢 대용량 다운로드 속도 저조 — 회선 상품 점검 (KT/SKT/LGU+ 상담)')
    if (recs.length === 0) recs.push('✅ 티켓팅·수강신청에 적합한 회선 상태입니다.')
    if (latency.min < 50 && latency.jitter < 10) recs.push('🎯 새로고침 타이밍은 평소처럼 0.5~1초 전이 안전')
    return recs
  })()

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/date/server-time', label: '실시간 서버 시간' },
          { href: '/tools/dev/http-status', label: 'HTTP 상태 코드' },
          { href: '/tools/dev/curl',        label: 'cURL 변환기' },
        ]}
      >
        브라우저에서 측정 가능한 지표만 사용 (ICMP ping X). 모든 요청은 youtil Edge로 전송되며 결과는 저장되지 않습니다.
      </Disclaimer>

      {/* ─── 시작 카드 ─── */}
      <div className={s.startCard}>
        <div className={s.startTitle}>회선 종합 진단</div>
        <p className={s.startDesc}>
          핑·지터 20회 → 한국 주요 티켓팅 사이트 응답 → 다운로드 속도까지 약 <strong>15~30초</strong> 소요.
          티켓팅·수강신청에 적합한 회선인지 종합 판정.
        </p>

        <div className={s.sizeRow}>
          <span className={s.sizeLabel}>다운로드 테스트 크기:</span>
          <div className={s.sizeBtns}>
            <button
              type="button"
              className={`${s.sizeBtn} ${downloadSize === 1 ? s.sizeBtnActive : ''}`}
              onClick={() => setDownloadSize(1)}
              disabled={isRunning}
            >1MB (빠른 측정)</button>
            <button
              type="button"
              className={`${s.sizeBtn} ${downloadSize === 5 ? s.sizeBtnActive : ''}`}
              onClick={() => setDownloadSize(5)}
              disabled={isRunning}
            >5MB (정확도 ↑)</button>
          </div>
        </div>

        <button
          type="button"
          className={s.runBtn}
          onClick={runFullTest}
          disabled={isRunning}
        >
          {isRunning ? '측정 중…' : phase === 'done' ? '↻ 다시 측정' : '▶ 측정 시작'}
        </button>

        {isRunning && (
          <div className={s.progress}>
            <div className={s.progressBar} style={{ width: `${progress}%` }} />
            <div className={s.progressText}>{progressLabel} ({Math.round(progress)}%)</div>
          </div>
        )}
      </div>

      {/* 스크린리더용 결과 알림 */}
      <p className="srOnly" role="status">
        {phase === 'done' && overall ? `측정 완료 — 종합 점수 ${overall.total}점` : phase === 'done' && latencyFailed ? '측정 실패 — 서버에 연결하지 못했습니다' : ''}
      </p>

      {latencyFailed && (
        <div className={s.card}>
          <div className={s.cardLabel}>⚠️ 핑을 측정하지 못했습니다</div>
          <p className={s.note}>
            20번의 요청이 모두 실패했습니다. 인터넷 연결이 끊겼거나, 회사·학교 방화벽·광고 차단 확장 프로그램이 요청을 막았을 수 있습니다.
            연결을 확인한 뒤 다시 측정해 주세요.
          </p>
        </div>
      )}

      {/* ─── 종합 결과 ─── */}
      {overall && (
        <div className={s.overallCard}>
          <div className={s.overallScore}>
            <div className={s.scoreNum}>{overall.total}</div>
            <div className={s.scoreLabel}>종합 점수 / 100</div>
          </div>
          <div className={s.overallRight}>
            <div className={s.overallBadgeRow}>
              <span className={s.overallBadge} style={{ color: overall.lat.color, borderColor: `${overall.lat.color}55` }}>
                응답 {overall.lat.label}
              </span>
              <span className={s.overallBadge} style={{ color: overall.jit.color, borderColor: `${overall.jit.color}55` }}>
                안정성 {overall.jit.label}
              </span>
            </div>
            <ul className={s.recList}>
              {recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* ─── 핑·지터 결과 ─── */}
      {latency && latency.samples.length > 0 && (
        <div className={s.card}>
          <div className={s.cardLabel}>회선 응답 시간 (User → youtil Edge·서울)</div>
          <div className={s.statGrid}>
            <div className={s.statBox} style={{ borderColor: `${rateLatency(latency.min).color}66` }}>
              <div className={s.statLabel}>최소 핑</div>
              <div className={s.statNum} style={{ color: rateLatency(latency.min).color }}>
                {latency.min.toFixed(1)}<span>ms</span>
              </div>
              <div className={s.statSub}>{rateLatency(latency.min).label}</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statLabel}>중앙값</div>
              <div className={s.statNum}>{latency.median.toFixed(1)}<span>ms</span></div>
              <div className={s.statSub}>50% 이내 응답</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statLabel}>평균 핑</div>
              <div className={s.statNum}>{latency.avg.toFixed(1)}<span>ms</span></div>
              <div className={s.statSub}>P95 {latency.p95.toFixed(0)}ms</div>
            </div>
            <div className={s.statBox} style={{ borderColor: `${rateJitter(latency.jitter).color}66` }}>
              <div className={s.statLabel}>지터 (연속 차이 평균)</div>
              <div className={s.statNum} style={{ color: rateJitter(latency.jitter).color }}>
                {latency.jitter.toFixed(1)}<span>ms</span>
              </div>
              <div className={s.statSub}>{rateJitter(latency.jitter).label}</div>
            </div>
            <div className={s.statBox} style={{ borderColor: latency.loss > 0 ? '#DC262666' : undefined }}>
              <div className={s.statLabel}>실패율</div>
              <div className={s.statNum} style={{ color: latency.loss > 0 ? '#DC2626' : '#059669' }}>
                {(latency.loss * 100).toFixed(0)}<span>%</span>
              </div>
              <div className={s.statSub}>{latency.samples.length}/{latency.samples.length + Math.round(latency.loss * (latency.samples.length / Math.max(1 - latency.loss, 0.01)))}회 성공</div>
            </div>
            <div className={s.statBox}>
              <div className={s.statLabel}>최대</div>
              <div className={s.statNum}>{latency.max.toFixed(0)}<span>ms</span></div>
              <div className={s.statSub}>가장 느렸던 응답</div>
            </div>
          </div>
          <SampleSparkline samples={latency.samples} />
        </div>
      )}

      {/* ─── 사이트 응답 ─── */}
      {sites.length > 0 && (
        <div className={s.card}>
          <div className={s.cardLabel}>한국 주요 티켓팅 사이트 응답 시간</div>
          <p className={s.note}>
            ⚠️ 측정값은 <strong>「내 브라우저 → youtil Edge → 사이트」</strong>의 총 왕복 시간입니다.
            실제 티켓팅 시 「내 브라우저 → 사이트」 직접 경로와 다를 수 있습니다.
          </p>
          <ul className={s.siteList}>
            {[...sites]
              .sort((a, b) => (a.rttMs ?? 9999) - (b.rttMs ?? 9999))
              .map(site => (
                <li key={site.url} className={s.siteItem}>
                  <div className={s.siteLeft}>
                    <span className={s.siteLabel}>{site.label}</span>
                    <span className={s.siteUrl}>{site.url.replace(/^https?:\/\//, '')}</span>
                  </div>
                  <div className={s.siteRight}>
                    {site.rttMs !== undefined ? (
                      <>
                        <span className={s.siteRtt} style={{ color: rateLatency(site.rttMs).color }}>
                          {site.rttMs}ms
                        </span>
                        {site.status && <span className={s.siteStatus}>HTTP {site.status}{site.edgeRttMs !== undefined ? ` · Edge→사이트 ${site.edgeRttMs}ms` : ''}</span>}
                      </>
                    ) : (
                      <span className={s.siteError}>❌ {site.error}</span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* ─── 다운로드 속도 ─── */}
      {download && (
        <div className={s.card}>
          <div className={s.cardLabel}>다운로드 속도</div>
          <div className={s.dlMain}>
            <div className={s.dlNum} style={{ color: rateSpeed(download.mbps).color }}>
              {download.mbps.toFixed(1)}<span>Mbps</span>
            </div>
            <div className={s.dlRight}>
              <div className={s.dlBadge} style={{ color: rateSpeed(download.mbps).color, borderColor: `${rateSpeed(download.mbps).color}55` }}>
                {rateSpeed(download.mbps).label}
              </div>
              <div className={s.dlDesc}>{rateSpeed(download.mbps).desc}</div>
              <div className={s.dlMeta}>
                {(download.bytes / 1_000_000).toFixed(1)}MB · {(download.durationMs / 1000).toFixed(2)}초
              </div>
            </div>
          </div>
          <div className={s.dlBenchmark}>
            <div className={s.benchRow}>
              <span>📶 LTE 평균 (과기정통부 2025 평가)</span>
              <span>96 Mbps</span>
            </div>
            <div className={s.benchRow}>
              <span>📡 5G 평균 (과기정통부 2025 평가)</span>
              <span>974 Mbps</span>
            </div>
            <div className={s.benchRow}>
              <span>🏠 광랜 1Gbps 상품</span>
              <span>최대 1,000 Mbps</span>
            </div>
          </div>
          <p className={s.note}>
            ⓘ 브라우저 한 연결로 잰 참고치라 실제 회선 최고 속도보다 낮게 나오는 게 보통입니다. 위 평균은 전국 평가 지점에서 정해진 절차로 잰 정부 평가값(2025년 12월 발표)입니다.
          </p>
        </div>
      )}

      {/* ─── 사용 가이드 ─── */}
      <div className={s.guideCard}>
        <div className={s.cardLabel}>측정값 해석 가이드</div>
        <ul className={s.guideList}>
          <li><strong>핑(Latency)</strong> — 요청 후 응답까지 시간. 티켓팅에서 <strong>가장 중요</strong>. 50ms 이하 권장</li>
          <li><strong>지터(Jitter)</strong> — 핑의 변동성. 낮을수록 안정. 15ms 초과면 Wi-Fi 채널·라우터 점검</li>
          <li><strong>실패율(Loss)</strong> — 요청이 아예 응답 없는 비율. 5% 초과면 회선 문제</li>
          <li><strong>다운로드 속도</strong> — 티켓팅보다는 영상·다운로드용. 핑 빠르면 1MB도 즉시 받음</li>
          <li><strong>5G ≠ 항상 빠름</strong> — 같은 5G도 기지국 거리·시간대로 핑 차이 큼. 측정 권장</li>
          <li><strong>Wi-Fi 2.4GHz vs 5GHz</strong> — 5GHz가 간섭이 적고 빠른 대신 벽 투과·도달 거리가 짧음. 공유기 가까이에서 5GHz 권장</li>
        </ul>
      </div>
    </div>
  )
}

/* ─── 샘플 스파크라인 ─── */
function SampleSparkline({ samples }: { samples: number[] }) {
  if (samples.length === 0) return null
  const W = 600, H = 80, P = 8
  const max = Math.max(...samples) * 1.1
  const min = 0
  const range = max - min || 1
  const stepX = (W - P * 2) / Math.max(1, samples.length - 1)
  const pts = samples.map((v, i) => {
    const x = P + i * stepX
    const y = P + (1 - (v - min) / range) * (H - P * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textAlign: 'center' }}>
        샘플 {samples.length}회 시계열 (낮을수록 좋음)
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 80, background: 'var(--bg3)', borderRadius: 'var(--radius-s)' }}>
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {samples.map((v, i) => {
          const x = P + i * stepX
          const y = P + (1 - (v - min) / range) * (H - P * 2)
          return <circle key={i} cx={x} cy={y} r="2" fill="var(--accent)" />
        })}
      </svg>
    </div>
  )
}
