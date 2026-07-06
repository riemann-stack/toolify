'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './server-time.module.css'

/* ─── 타입 ─── */
type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error'
type AlertStage = 'none' | '3s' | '1s' | 'fired'

/* ─── NTP-like 측정 ─── */
async function measureOffset(): Promise<{ offsetMs: number; rttMs: number } | null> {
  const t0 = Date.now()
  try {
    const res = await fetch(`/api/time?t=${t0}`, { cache: 'no-store' })
    const t2 = Date.now()
    const json = await res.json() as { serverTimeMs: number }
    const rtt = t2 - t0
    // 서버 시각 측정 시점은 응답 송신 직전이라 가정 → 단방향 latency = rtt/2
    const offset = json.serverTimeMs + Math.floor(rtt / 2) - t2
    return { offsetMs: offset, rttMs: rtt }
  } catch {
    return null
  }
}

/* ─── 시간 포맷 (KST) ─── */
const KST_OFFSET_MS = 9 * 3600 * 1000

function fmtKstTime(serverMs: number, includeMs = true): string {
  const d = new Date(serverMs + KST_OFFSET_MS)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  if (!includeMs) return `${hh}:${mm}:${ss}`
  const ms = String(d.getUTCMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

function fmtKstDate(serverMs: number): string {
  const d = new Date(serverMs + KST_OFFSET_MS)
  const yyyy = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const wd = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()]
  return `${yyyy}-${mo}-${dd} (${wd})`
}

/* 카운트다운 포맷 (HH:MM:SS.mmm) */
function fmtCountdown(ms: number): { hours: string; mins: string; secs: string; millis: string; negative: boolean } {
  const negative = ms < 0
  const abs = Math.abs(ms)
  const hours = Math.floor(abs / 3600000)
  const mins = Math.floor((abs % 3600000) / 60000)
  const secs = Math.floor((abs % 60000) / 1000)
  const millis = Math.floor(abs % 1000)
  return {
    hours: String(hours).padStart(2, '0'),
    mins: String(mins).padStart(2, '0'),
    secs: String(secs).padStart(2, '0'),
    millis: String(millis).padStart(3, '0'),
    negative,
  }
}

/* 다음 정각 (KST) — clientNowMs 기준 */
function nextHourMs(currentServerMs: number): number {
  const kst = currentServerMs + KST_OFFSET_MS
  const d = new Date(kst)
  d.setUTCMinutes(0, 0, 0)
  d.setUTCHours(d.getUTCHours() + 1)
  return d.getTime() - KST_OFFSET_MS
}

/* 오늘/내일 특정 KST 시각 → server epoch ms */
function todayAtKst(currentServerMs: number, hour: number, min = 0, sec = 0): number {
  const kst = currentServerMs + KST_OFFSET_MS
  const d = new Date(kst)
  d.setUTCHours(hour, min, sec, 0)
  let target = d.getTime() - KST_OFFSET_MS
  if (target <= currentServerMs) {
    // 이미 지났으면 내일
    target += 24 * 3600 * 1000
  }
  return target
}

/* HH:MM:SS → server ms (오늘 또는 내일) */
function parseTimeInput(timeStr: string, currentServerMs: number): number | null {
  const m = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const mn = parseInt(m[2], 10)
  const sc = m[3] ? parseInt(m[3], 10) : 0
  if (h > 23 || mn > 59 || sc > 59) return null
  return todayAtKst(currentServerMs, h, mn, sc)
}

/* ─── 한국 시나리오 프리셋 ─── */
const SCENARIOS = [
  { id: 'next-hour',  name: '다음 정각',         icon: '⏰', desc: '정시 이벤트' },
  { id: '09:00',      name: '오전 9시',          icon: '🌅', desc: '수강신청·은행 오픈' },
  { id: '10:00',      name: '오전 10시',         icon: '🎫', desc: '대학·정부 신청' },
  { id: '11:00',      name: '오전 11시',         icon: '⚾', desc: 'KBO 야구 티켓' },
  { id: '14:00',      name: '오후 2시',          icon: '🎟️', desc: '주말 콘서트·뮤지컬' },
  { id: '20:00',      name: '오후 8시',          icon: '🎤', desc: '평일 콘서트·아이돌' },
] as const

/* ─── 외부 사이트 프록시 측정 ─── */
type ProxyApiResult =
  | { ok: true; serverTimeMs: number; rttMs: number; httpStatus: number; finalUrl: string; dateHeader: string }
  | { ok: false; error: string; reason?: string }

type ProxyResult =
  | { ok: true; serverTimeMs: number; rttMs: number; httpStatus: number; finalUrl: string; dateHeader: string; measuredAt: number }
  | { ok: false; error: string; reason?: string }

async function measureExternal(url: string): Promise<ProxyResult> {
  try {
    const res = await fetch(`/api/proxy-time?url=${encodeURIComponent(url)}`, { cache: 'no-store' })
    const data = await res.json() as ProxyApiResult
    if (data.ok) {
      return { ...data, measuredAt: Date.now() }
    }
    return data
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '측정 실패' }
  }
}

/* 한국 인기 티켓팅·예매·신청 사이트 프리셋 */
const SITE_PRESETS = [
  { url: 'https://ticket.interpark.com', label: '🎤 인터파크 티켓' },
  { url: 'https://ticket.yes24.com',     label: '📚 예스24 티켓' },
  { url: 'https://www.melon.com/ticket', label: '🎵 멜론티켓' },
  { url: 'https://www.ticketlink.co.kr', label: '🎟️ 티켓링크' },
  { url: 'https://www.korail.com',       label: '🚄 KTX 코레일' },
  { url: 'https://etk.srail.kr',         label: '🚅 SRT' },
  { url: 'https://dongma.club',          label: '🏃 동마클럽' },
  { url: 'https://www.snu.ac.kr',        label: '🎓 서울대' },
  { url: 'https://www.yonsei.ac.kr',     label: '🎓 연세대' },
  { url: 'https://www.korea.ac.kr',      label: '🎓 고려대' },
  { url: 'https://www.skku.edu',         label: '🎓 성균관대' },
  { url: 'https://www.sogang.ac.kr',     label: '🎓 서강대' },
  { url: 'https://www.hanyang.ac.kr',    label: '🎓 한양대' },
] as const

export default function ServerTimeClient() {
  /* 동기화 상태 */
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [offsetMs, setOffsetMs] = useState(0)
  const [rttMs, setRttMs] = useState(0)
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null)

  /* 시계용 — requestAnimationFrame으로 갱신 */
  const [, setTick] = useState(0)
  const rafRef = useRef<number | null>(null)

  /* 카운트다운 */
  const [targetTimeStr, setTargetTimeStr] = useState('14:00:00')
  const [targetMs, setTargetMs] = useState<number | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  const [alertStage, setAlertStage] = useState<AlertStage>('none')
  const audioCtxRef = useRef<AudioContext | null>(null)

  /* 외부 사이트 트래킹 */
  const [extUrl, setExtUrl] = useState('')
  const [extResult, setExtResult] = useState<ProxyResult | null>(null)
  const [extLoading, setExtLoading] = useState(false)
  const [extAutoRefresh, setExtAutoRefresh] = useState(false)

  /* 현재 서버 시각 (가장 최근 측정 + 클라이언트 흐름) */
  const getServerNow = useCallback(() => Date.now() + offsetMs, [offsetMs])

  /* 동기화 — 5회 측정 후 최소 RTT 채택 */
  const sync = useCallback(async () => {
    setStatus('syncing')
    const samples: { offsetMs: number; rttMs: number }[] = []
    for (let i = 0; i < 5; i++) {
      const r = await measureOffset()
      if (r) samples.push(r)
    }
    if (samples.length === 0) {
      setStatus('error')
      return
    }
    // 가장 작은 RTT 사용 (네트워크 지터 최소)
    samples.sort((a, b) => a.rttMs - b.rttMs)
    const best = samples[0]
    setOffsetMs(best.offsetMs)
    setRttMs(best.rttMs)
    setLastSyncAt(Date.now())
    setStatus('ok')
  }, [])

  /* 초기 동기화 + 5분마다 재동기화 */
  useEffect(() => {
    sync()
    const id = setInterval(sync, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [sync])

  /* requestAnimationFrame 시계 — 60fps 갱신 */
  useEffect(() => {
    const loop = () => {
      setTick((n) => (n + 1) % 1000)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  /* 카운트다운 타겟 파싱 */
  useEffect(() => {
    const ms = parseTimeInput(targetTimeStr, getServerNow())
    setTargetMs(ms)
    setAlertStage('none')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTimeStr])

  /* 비프 */
  const getAudio = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
      const Ctx = W.AudioContext || W.webkitAudioContext
      if (Ctx) audioCtxRef.current = new Ctx()
    }
    return audioCtxRef.current
  }
  const beep = (freq: number, duration = 0.18) => {
    const ctx = getAudio()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain).connect(ctx.destination)
    const t0 = ctx.currentTime
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(0.2, t0 + 0.01)
    gain.gain.linearRampToValueAtTime(0.2, t0 + duration - 0.02)
    gain.gain.linearRampToValueAtTime(0, t0 + duration)
    osc.start(t0)
    osc.stop(t0 + duration + 0.02)
  }

  /* 알림 트리거 */
  useEffect(() => {
    if (!soundOn || targetMs === null) return
    const id = setInterval(() => {
      const remain = targetMs - getServerNow()
      if (alertStage === 'none' && remain <= 3000 && remain > 2900) {
        beep(660); setAlertStage('3s')
      } else if (alertStage === '3s' && remain <= 1000 && remain > 900) {
        beep(880); setAlertStage('1s')
      } else if (alertStage === '1s' && remain <= 0) {
        beep(1320, 0.4); setAlertStage('fired')
      }
    }, 100)
    return () => clearInterval(id)
  }, [soundOn, targetMs, alertStage, getServerNow])

  /* 외부 사이트 측정 */
  const runExtMeasure = useCallback(async (url: string) => {
    const target = url.trim()
    if (!target) return
    setExtLoading(true)
    const r = await measureExternal(target)
    setExtResult(r)
    setExtLoading(false)
  }, [])

  const onExtMeasure = () => { void runExtMeasure(extUrl) }
  const onExtPreset = (url: string) => {
    setExtUrl(url)
    void runExtMeasure(url)
  }

  /* 외부 사이트 자동 새로고침 (5초 주기) */
  useEffect(() => {
    if (!extAutoRefresh || !extUrl.trim()) return
    const id = setInterval(() => { void runExtMeasure(extUrl) }, 5000)
    return () => clearInterval(id)
  }, [extAutoRefresh, extUrl, runExtMeasure])

  /* 프리셋 적용 */
  const applyScenario = (id: string) => {
    if (id === 'next-hour') {
      const next = nextHourMs(getServerNow())
      const d = new Date(next + KST_OFFSET_MS)
      const hh = String(d.getUTCHours()).padStart(2, '0')
      setTargetTimeStr(`${hh}:00:00`)
    } else {
      // "09:00" 등 직접 시각
      const [h, m] = id.split(':')
      setTargetTimeStr(`${h}:${m}:00`)
    }
  }

  /* 표시 값 */
  const serverNow = getServerNow()
  const remainMs = targetMs !== null ? targetMs - serverNow : 0
  const cd = fmtCountdown(remainMs)
  const timeStr = fmtKstTime(serverNow, true)
  const dateStr = fmtKstDate(serverNow)
  const targetDisplay = targetMs !== null
    ? `${fmtKstDate(targetMs)} ${fmtKstTime(targetMs, false)}`
    : ''

  /* 외부 사이트 — 측정 시각 + 경과 시간을 더해 실시간 추정 */
  const extLive = useMemo(() => {
    if (!extResult || !extResult.ok) return null
    const elapsed = Date.now() - extResult.measuredAt
    const liveMs = extResult.serverTimeMs + elapsed
    // 자체 서버와의 차이 (외부 - 자체)
    const diffVsSelf = liveMs - serverNow
    return { liveMs, diffVsSelf }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extResult, serverNow])

  const offsetDisplay = useMemo(() => {
    const abs = Math.abs(offsetMs)
    if (abs < 50) return { text: '거의 정확', cls: s.offsetSafe, sign: '' }
    const sec = (abs / 1000).toFixed(2)
    const sign = offsetMs > 0 ? '느림' : '빠름'
    const cls = abs < 500 ? s.offsetOk : abs < 2000 ? s.offsetWarn : s.offsetDanger
    return { text: `${sec}초 ${sign}`, cls, sign }
  }, [offsetMs])

  return (
    <div className={s.wrap}>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/date/dday', label: 'D-Day 계산기' },
          { href: '/tools/date/age',  label: '나이 계산기' },
          { href: '/tools/life/pomodoro', label: '뽀모도로 타이머' },
        ]}
      >
        본 도구의 「서버」는 Vercel Edge (UTC NTP 동기화) 기준입니다. 한국 주요 티켓팅·신청 서버와 ±50ms 이내로 거의 일치하지만 절대 보장 X — 새로고침은 약간 여유를 두세요.
      </Disclaimer>

      {/* ─── 큰 시계 ─── */}
      <div className={s.clockCard}>
        <div className={s.clockHeader}>
          <span className={s.clockBadge}>🇰🇷 한국 표준시 (KST)</span>
          <button
            className={s.syncBtn}
            onClick={sync}
            disabled={status === 'syncing'}
          >
            {status === 'syncing' ? '동기화 중…' : '↻ 다시 동기화'}
          </button>
        </div>

        <div className={s.clockTime}>
          <span className={s.clockTimeHMS}>{timeStr.slice(0, 8)}</span>
          <span className={s.clockTimeMs}>.{timeStr.slice(9, 12)}</span>
        </div>

        <div className={s.clockDate}>{dateStr}</div>

        <div className={s.clockMeta}>
          <div className={s.metaItem}>
            <span className={s.metaLabel}>내 PC 시계</span>
            <span className={`${s.metaValue} ${offsetDisplay.cls}`}>
              {status === 'syncing' ? '측정 중…'
               : status === 'error' ? '연결 실패'
               : offsetDisplay.text}
            </span>
          </div>
          <div className={s.metaItem}>
            <span className={s.metaLabel}>측정 정확도</span>
            <span className={s.metaValue}>±{Math.round(rttMs / 2)}ms (RTT {rttMs}ms)</span>
          </div>
          <div className={s.metaItem}>
            <span className={s.metaLabel}>마지막 동기화</span>
            <span className={s.metaValue}>
              {lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString('ko-KR') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 외부 사이트 트래킹 ─── */}
      <div className={s.externalCard}>
        <div className={s.cardLabel}>외부 사이트 서버 시간 트래킹</div>

        <p className={s.extNote}>
          티켓팅·신청 사이트의 <strong>HTTP <code>Date</code> 헤더</strong>를 프록시로 측정합니다.
          정확도 ±1초 (헤더는 초 단위), 일부 사이트는 봇 차단으로 측정 불가.
        </p>

        <div className={s.extInputRow}>
          <input
            type="url"
            className={s.urlInput}
            placeholder="https://ticket.example.com"
            value={extUrl}
            onChange={(e) => setExtUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onExtMeasure() }}
          />
          <button
            type="button"
            className={s.extMeasureBtn}
            onClick={onExtMeasure}
            disabled={extLoading || !extUrl.trim()}
          >
            {extLoading ? '측정 중…' : '↻ 측정'}
          </button>
        </div>

        <label className={s.soundLabel}>
          <input
            type="checkbox"
            checked={extAutoRefresh}
            onChange={(e) => setExtAutoRefresh(e.target.checked)}
            disabled={!extUrl.trim()}
          />
          <span>5초마다 자동 재측정</span>
        </label>

        <div className={s.sitePresetGrid}>
          {SITE_PRESETS.map((sp) => (
            <button
              key={sp.url}
              type="button"
              className={s.sitePresetBtn}
              onClick={() => onExtPreset(sp.url)}
              disabled={extLoading}
            >
              {sp.label}
            </button>
          ))}
        </div>

        {extResult && extResult.ok && extLive && (
          <div className={s.extResultCard}>
            <div className={s.extLiveTime}>{fmtKstTime(extLive.liveMs, false)}</div>
            <p className={s.extLiveDate}>{fmtKstDate(extLive.liveMs)}</p>
            <div className={s.extMetaGrid}>
              <div className={s.metaItem}>
                <span className={s.metaLabel}>자체 서버와 차이</span>
                <span className={`${s.metaValue} ${
                  Math.abs(extLive.diffVsSelf) < 1000 ? s.offsetSafe
                  : Math.abs(extLive.diffVsSelf) < 3000 ? s.offsetOk
                  : Math.abs(extLive.diffVsSelf) < 10000 ? s.offsetWarn
                  : s.offsetDanger
                }`}>
                  {extLive.diffVsSelf >= 0 ? '+' : ''}{(extLive.diffVsSelf / 1000).toFixed(1)}초
                </span>
              </div>
              <div className={s.metaItem}>
                <span className={s.metaLabel}>측정 RTT</span>
                <span className={s.metaValue}>{extResult.rttMs}ms</span>
              </div>
              <div className={s.metaItem}>
                <span className={s.metaLabel}>마지막 측정</span>
                <span className={s.metaValue}>
                  {new Date(extResult.measuredAt).toLocaleTimeString('ko-KR')}
                </span>
              </div>
              <div className={s.metaItem}>
                <span className={s.metaLabel}>HTTP 상태</span>
                <span className={s.metaValue}>{extResult.httpStatus}</span>
              </div>
            </div>
            <p className={s.extFinalUrl}>{extResult.finalUrl}</p>
            <p className={s.extWarn}>
              ⚠️ 표시 시각은 마지막 측정값에 클라이언트 경과를 더한 추정치입니다.
              네트워크 지연·서버 처리 시간으로 ±1초 오차 가능 — 새로고침은 0.5~1초 여유를 두세요.
            </p>
          </div>
        )}

        {extResult && !extResult.ok && (
          <div className={s.extErrorBox}>
            <strong>❌ 측정 실패</strong>
            <p>{extResult.error}</p>
            {extResult.reason === 'no_date_header' && (
              <p className={s.extErrorHint}>이 사이트는 Date 헤더를 응답하지 않아 추적할 수 없습니다.</p>
            )}
            {extResult.reason === 'timeout' && (
              <p className={s.extErrorHint}>봇 차단 또는 응답 지연일 가능성이 있습니다.</p>
            )}
            {extResult.reason === 'blocked_host' && (
              <p className={s.extErrorHint}>보안상 내부망·사설 IP는 접근할 수 없습니다.</p>
            )}
            {extResult.reason === 'invalid_url' && (
              <p className={s.extErrorHint}>URL 형식을 확인해주세요 (예: https://ticket.example.com).</p>
            )}
          </div>
        )}
      </div>

      {/* ─── 카운트다운 ─── */}
      <div className={s.countdownCard}>
        <div className={s.cardLabel}>카운트다운 — 목표 시각까지</div>

        <div className={s.targetRow}>
          <input
            type="text"
            className={s.targetInput}
            placeholder="14:00:00"
            value={targetTimeStr}
            onChange={(e) => setTargetTimeStr(e.target.value)}
          />
          <label className={s.soundLabel}>
            <input
              type="checkbox"
              checked={soundOn}
              onChange={(e) => {
                setSoundOn(e.target.checked)
                if (e.target.checked) { const ctx = getAudio(); if (ctx?.state === 'suspended') ctx.resume() }
              }}
            />
            <span>알림음 (3초·1초 전·정각)</span>
          </label>
        </div>

        {targetMs === null ? (
          <p className={s.targetError}>형식: HH:MM 또는 HH:MM:SS (예: 14:00 또는 14:00:00)</p>
        ) : (
          <>
            <p className={s.targetDisplay}>{targetDisplay}</p>
            <div className={`${s.cdGrid} ${cd.negative ? s.cdNegative : remainMs < 10000 ? s.cdUrgent : ''}`}>
              <div className={s.cdBox}>
                <div className={s.cdNum}>{cd.hours}</div>
                <div className={s.cdLabel}>시간</div>
              </div>
              <div className={s.cdSep}>:</div>
              <div className={s.cdBox}>
                <div className={s.cdNum}>{cd.mins}</div>
                <div className={s.cdLabel}>분</div>
              </div>
              <div className={s.cdSep}>:</div>
              <div className={s.cdBox}>
                <div className={s.cdNum}>{cd.secs}</div>
                <div className={s.cdLabel}>초</div>
              </div>
              <div className={s.cdMs}>
                <span className={s.cdMsNum}>.{cd.millis}</span>
              </div>
            </div>
            <p className={s.cdStatus}>
              {cd.negative
                ? `🎯 ${cd.hours === '00' && cd.mins === '00' ? cd.secs + '초' : `${cd.hours}:${cd.mins}:${cd.secs}`} 경과`
                : remainMs < 60000 ? '🔥 1분 이내 — 새로고침 준비!'
                : remainMs < 3600000 ? '⏰ 1시간 이내'
                : '시간 여유 있음'}
            </p>
          </>
        )}

        {/* 프리셋 */}
        <div className={s.presetGrid}>
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              className={s.presetBtn}
              onClick={() => applyScenario(sc.id)}
            >
              <span className={s.presetIcon}>{sc.icon}</span>
              <div className={s.presetText}>
                <p className={s.presetName}>{sc.name}</p>
                <p className={s.presetDesc}>{sc.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── 정확한 클릭 가이드 ─── */}
      <div className={s.tipCard}>
        <div className={s.cardLabel}>정확한 클릭을 위한 팁</div>
        <ul className={s.tipList}>
          <li><strong>새로고침은 목표 시각 0.5~1초 전</strong> — 너무 빠르면 서버가 못 받음, 너무 늦으면 매진</li>
          <li><strong>F5보다 URL 직접 접속이 빠름</strong> — 브라우저 캐시 재검증 단계 X</li>
          <li><strong>티켓팅 사이트는 1~3초 전 대기 페이지로 리다이렉트</strong> — 미리 열어두기</li>
          <li><strong>본인인증·결제 정보 미리 저장</strong> — 클릭 후 입력 시간 ↓</li>
          <li><strong>유선 인터넷 + Wi-Fi 5GHz</strong> 권장 — Wi-Fi 2.4GHz는 지연 ↑</li>
          <li><strong>크롬 시크릿 모드</strong> 사용 — 확장 프로그램 간섭 X</li>
        </ul>
      </div>
    </div>
  )
}
