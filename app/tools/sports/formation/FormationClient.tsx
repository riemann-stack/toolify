'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './formation.module.css'
import {
  getFormationsByCount,
  positionLabel,
  parseFormation,
  type Formation,
} from './formationData'

const STORAGE_KEY = 'youtil_formation_v1'

interface PlayerData {
  name: string
  number: string
}

/* ─── 메인 ─── */
export default function FormationClient() {
  const [total, setTotal] = useState<5 | 7 | 9 | 11>(11)
  const [formationId, setFormationId] = useState<string>('4-3-3')
  const [customLines, setCustomLines] = useState<number[] | null>(null)
  const [customInput, setCustomInput] = useState('')
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [showLabels, setShowLabels] = useState(true)
  const [teamColor, setTeamColor] = useState('#0891B2')
  const [teamName, setTeamName] = useState('Our Team')

  const [players, setPlayers] = useState<PlayerData[]>(() => Array.from({ length: 11 }, () => ({ name: '', number: '' })))
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const svgRef = useRef<SVGSVGElement | null>(null)

  /* localStorage 복원 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.total) setTotal(j.total)
      if (j.formationId) setFormationId(j.formationId)
      if (Array.isArray(j.customLines)) setCustomLines(j.customLines)
      if (j.customInput) setCustomInput(j.customInput)
      if (j.direction) setDirection(j.direction)
      if (typeof j.showLabels === 'boolean') setShowLabels(j.showLabels)
      if (j.teamColor) setTeamColor(j.teamColor)
      if (j.teamName) setTeamName(j.teamName)
      if (Array.isArray(j.players)) setPlayers(j.players)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        total, formationId, customLines, customInput,
        direction, showLabels, teamColor, teamName, players,
      }))
    } catch {}
  }, [total, formationId, customLines, customInput, direction, showLabels, teamColor, teamName, players])

  /* 인원 변경 시 포메이션 자동 첫 항목으로 + 명단 길이 조정 */
  const formations = useMemo(() => getFormationsByCount(total), [total])
  const currentFormation: Formation | null = useMemo(() => {
    if (customLines) return { id: 'custom', name: customLines.join('-'), lines: customLines, desc: '커스텀' }
    return formations.find(f => f.id === formationId) ?? formations[0] ?? null
  }, [customLines, formations, formationId])

  // 인원 변경 시 적절한 포메이션 자동 선택
  useEffect(() => {
    if (customLines) {
      const sum = customLines.reduce((a, b) => a + b, 0) + 1
      if (sum !== total) setCustomLines(null)  // 인원 변경 → 커스텀 해제
      return
    }
    if (!formations.find(f => f.id === formationId)) {
      setFormationId(formations[0]?.id ?? '')
    }
  }, [total, formations, formationId, customLines])

  // 선수 배열 길이 동기화
  useEffect(() => {
    if (players.length !== total) {
      setPlayers(prev => {
        if (prev.length > total) return prev.slice(0, total)
        return [...prev, ...Array.from({ length: total - prev.length }, () => ({ name: '', number: '' }))]
      })
    }
  }, [total, players.length])

  /* 커스텀 포메이션 적용 */
  const applyCustom = () => {
    const parsed = parseFormation(customInput)
    if (!parsed) {
      alert('형식: "4-3-3" 또는 "4-2-3-1" (라인별 인원, 합계 = 총원 - 1)')
      return
    }
    const sum = parsed.reduce((a, b) => a + b, 0)
    if (sum !== total - 1) {
      alert(`라인 합계 ${sum}이 골키퍼 제외 인원 ${total - 1}과 일치하지 않습니다.`)
      return
    }
    setCustomLines(parsed)
    setFormationId('custom')
  }

  /* 좌표 계산 (SVG 800 × 1000)
   * direction 'up' → 우리팀이 아래에서 위로 공격
   * 실제 축구 위치 비율 참고:
   *   - GK: 자신의 골 라인 근처 (~5-7%)
   *   - DEF: 자기 진영 20-25%
   *   - MID: 하프라인 ±10%
   *   - FW: 상대 진영 70-80% (페널티 박스 근처, 골 라인 X)
   */
  const positions = useMemo(() => {
    if (!currentFormation) return []
    const W = 800, H = 1000
    const lines = currentFormation.lines
    const totalLines = lines.length
    const points: { x: number; y: number; label: string; idx: number }[] = []
    // GK
    const gkY = direction === 'up' ? H - 80 : 80
    points.push({ x: W / 2, y: gkY, label: 'GK', idx: 0 })
    // 라인들 — 수비라인 H*0.78 / 공격라인 H*0.24 사이 균등 분할
    // (위쪽 24%는 골 박스 영역 — 공격수가 너무 깊이 들어가지 않도록)
    const startY = direction === 'up' ? H * 0.78 : H * 0.22  // 수비 라인
    const endY   = direction === 'up' ? H * 0.24 : H * 0.76  // 공격 라인
    const stepY = totalLines > 1 ? (endY - startY) / (totalLines - 1) : 0
    let idxCounter = 1
    lines.forEach((cnt, lineIdx) => {
      const y = totalLines === 1 ? (startY + endY) / 2 : startY + stepY * lineIdx
      // 라인 내 좌우 균등 — 양쪽 100px 여유
      const lineWidth = W - 200
      for (let i = 0; i < cnt; i++) {
        const x = 100 + (cnt === 1 ? lineWidth / 2 : (lineWidth * i) / (cnt - 1))
        points.push({
          x,
          y,
          label: positionLabel(lineIdx, i, cnt, totalLines),
          idx: idxCounter++,
        })
      }
    })
    return points
  }, [currentFormation, direction])

  /* 마크다운 복사 */
  const copyMarkdown = async () => {
    if (!currentFormation) return
    const lines: string[] = [
      `## ⚽ ${teamName} — ${currentFormation.name} (${total}인)`,
      '',
    ]
    positions.forEach(pos => {
      const p = players[pos.idx]
      if (!p) return
      const num = p.number ? `#${p.number} ` : ''
      const name = p.name || '—'
      lines.push(`- **${pos.label}** ${num}${name}`)
    })
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { alert('복사 실패') }
  }

  /* PNG 다운로드 */
  const downloadPng = useCallback(async () => {
    if (!svgRef.current) return
    setDownloading(true)
    try {
      const svg = svgRef.current
      const clone = svg.cloneNode(true) as SVGSVGElement
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const xml = new XMLSerializer().serializeToString(clone)
      const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()
      img.src = url
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej() })
      const canvas = document.createElement('canvas')
      const scale = 2
      canvas.width = 800 * scale
      canvas.height = 1000 * scale
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#2a7a3a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => {
        if (!blob) return
        const dl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = dl
        a.download = `${teamName || 'formation'}-${currentFormation?.name || ''}.png`.replace(/\s+/g, '_')
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(dl), 1000)
      }, 'image/png')
    } catch {
      alert('이미지 생성 실패')
    } finally {
      setDownloading(false)
    }
  }, [teamName, currentFormation])

  /* 개별 선수 편집 */
  const updatePlayer = (idx: number, patch: Partial<PlayerData>) => {
    setPlayers(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p))
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/random', label: '랜덤 추첨기' },
          { href: '/tools/sports/football-points', label: '리그 승점 계산기' },
          { href: '/tools/life/ladder', label: '사다리타기' },
        ]}
      >
        모든 데이터는 본인 브라우저에 저장되며, 명단·등번호·포메이션은 새로고침해도 유지됩니다.
      </Disclaimer>

      {/* ── 인원 수 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>👥 인원 수</div>
        <div className={s.countRow}>
          {([5, 7, 9, 11] as const).map(n => (
            <button
              key={n}
              type="button"
              className={`${s.countBtn} ${total === n ? s.countActive : ''}`}
              onClick={() => { setTotal(n); setCustomLines(null) }}
            >
              {n}인
              <span className={s.countSub}>
                {n === 11 ? '정규' : n === 9 ? '청소년' : n === 7 ? '7인제' : '풋살'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 포메이션 선택 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📋 포메이션 (총 {total}인 = GK 1 + 필드 {total - 1})</div>
        <div className={s.formationGrid}>
          {formations.map(f => {
            const on = !customLines && formationId === f.id
            return (
              <button
                key={f.id}
                type="button"
                className={`${s.formBtn} ${on ? s.formActive : ''}`}
                onClick={() => { setFormationId(f.id); setCustomLines(null) }}
              >
                <div className={s.formName}>{f.name}</div>
                <div className={s.formDesc}>{f.desc}</div>
              </button>
            )
          })}
        </div>
        <div className={s.customRow}>
          <span className={s.subLabel}>커스텀:</span>
          <input
            type="text"
            className={s.customInput}
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="예: 4-2-3-1"
            onKeyDown={e => { if (e.key === 'Enter') applyCustom() }}
          />
          <button type="button" className={s.miniBtn} onClick={applyCustom}>적용</button>
          {customLines && (
            <button type="button" className={s.miniBtn}
              onClick={() => { setCustomLines(null); setCustomInput('') }}>
              ✕ 해제
            </button>
          )}
        </div>
      </div>

      {/* ── 옵션 (컴팩트) ── */}
      <div className={s.optCard}>
        <div className={s.optGrid}>
          {/* 팀 이름 + 컬러 */}
          <div className={s.optTeamRow}>
            <input type="text" className={s.textInput}
              value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="팀 이름"
              maxLength={30} />
            <input type="color" className={s.colorInput}
              value={teamColor} onChange={e => setTeamColor(e.target.value)}
              title="팀 컬러" />
          </div>

          {/* 공격 방향 토글 */}
          <div className={s.dirRow}>
            <button type="button"
              className={`${s.dirBtn} ${direction === 'up' ? s.dirActive : ''}`}
              onClick={() => setDirection('up')} title="공격 방향: 위">↑</button>
            <button type="button"
              className={`${s.dirBtn} ${direction === 'down' ? s.dirActive : ''}`}
              onClick={() => setDirection('down')} title="공격 방향: 아래">↓</button>
          </div>

          {/* 포지션 라벨 토글 */}
          <label className={s.labelToggleBtn}>
            <input type="checkbox" checked={showLabels}
              onChange={e => setShowLabels(e.target.checked)} />
            <span>📍 라벨</span>
          </label>
        </div>
      </div>

      {/* ── 피치 ── */}
      <div className={s.pitchCard}>
        <div className={s.pitchHeader}>
          <span className={s.pitchTeam}>{teamName}</span>
          <span className={s.pitchFormation}>
            {currentFormation?.name ?? '—'} · {total}인
          </span>
        </div>
        <svg
          ref={svgRef}
          viewBox="0 0 800 1000"
          className={s.pitchSvg}
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="축구 포메이션 배치도"
        >
          {/* 잔디 그라데이션 (세로 스트라이프) */}
          <defs>
            <pattern id="grass" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#2a7a3a" />
              <rect x="50" width="50" height="100" fill="#338944" />
            </pattern>
          </defs>
          <rect width="800" height="1000" fill="url(#grass)" />

          {/* 외곽선 */}
          <rect x="30" y="30" width="740" height="940"
            fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
          {/* 하프라인 */}
          <line x1="30" y1="500" x2="770" y2="500"
            stroke="#fff" strokeWidth="3" opacity="0.9" />
          {/* 센터 서클 */}
          <circle cx="400" cy="500" r="80"
            fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
          <circle cx="400" cy="500" r="4" fill="#fff" opacity="0.9" />

          {/* 위쪽 페널티 박스 */}
          <rect x="200" y="30" width="400" height="150"
            fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
          <rect x="300" y="30" width="200" height="60"
            fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
          <circle cx="400" cy="130" r="3" fill="#fff" opacity="0.9" />

          {/* 아래쪽 페널티 박스 */}
          <rect x="200" y="820" width="400" height="150"
            fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
          <rect x="300" y="910" width="200" height="60"
            fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
          <circle cx="400" cy="870" r="3" fill="#fff" opacity="0.9" />

          {/* 골대 */}
          <rect x="360" y="20" width="80" height="10" fill="#fff" opacity="0.9" />
          <rect x="360" y="970" width="80" height="10" fill="#fff" opacity="0.9" />

          {/* 코너 호 (4개) */}
          {[[30,30],[770,30],[30,970],[770,970]].map(([cx,cy], i) => {
            const dx = cx === 30 ? 1 : -1
            const dy = cy === 30 ? 1 : -1
            return (
              <path
                key={i}
                d={`M ${cx} ${cy + 12*dy} A 12 12 0 0 ${dx === dy ? 0 : 1} ${cx + 12*dx} ${cy}`}
                fill="none" stroke="#fff" strokeWidth="2" opacity="0.9"
              />
            )
          })}

          {/* 선수 카드 — 큰 폰트로 가독성 ↑ */}
          {positions.map((pos) => {
            const p = players[pos.idx]
            if (!p) return null
            return (
              <g key={pos.idx} className={s.playerGroup}
                onClick={() => setEditingIdx(pos.idx)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={pos.x} cy={pos.y} r={48}
                  fill={teamColor} stroke="#fff" strokeWidth="4"
                  opacity="0.95" />
                <text x={pos.x} y={pos.y + 14} textAnchor="middle"
                  fill="#fff" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
                  fontSize="42" fontWeight="800"
                  style={{ pointerEvents: 'none' }}>
                  {p.number || (pos.idx === 0 ? '1' : pos.idx + 1)}
                </text>
                {/* 이름 카드 — 큰 폰트 */}
                {p.name && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect
                      x={pos.x - 80} y={pos.y + 54}
                      width="160" height="40" rx="10"
                      fill="rgba(0,0,0,0.78)"
                    />
                    <text x={pos.x} y={pos.y + 80} textAnchor="middle"
                      fill="#fff" fontFamily="Noto Sans KR, sans-serif"
                      fontSize="26" fontWeight="700">
                      {p.name.length > 6 ? p.name.slice(0, 6) + '…' : p.name}
                    </text>
                  </g>
                )}
                {/* 포지션 라벨 */}
                {showLabels && (
                  <text x={pos.x} y={pos.y - 58} textAnchor="middle"
                    fill="#fff" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
                    fontSize="22" fontWeight="800"
                    opacity="0.92"
                    style={{ pointerEvents: 'none' }}>
                    {pos.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* 공격 방향 표시 — 골키퍼 우측 빈공간, 굵은 화살표 + 큰 글자 */}
          {(() => {
            // GK는 항상 정중앙 (x=400). 그 우측 빈공간 = x ≈ 660, y는 direction별로 GK 근처
            const arrowX = 670
            const isUp = direction === 'up'
            // direction 'up' → GK 아래쪽(y=930), 화살표는 위쪽 향함 (감독 시점에서 본진→상대)
            // direction 'down' → GK 위쪽(y=70), 화살표는 아래쪽 향함
            const gkY = isUp ? 930 : 70
            const arrowTop = isUp ? gkY - 110 : gkY + 110
            const arrowBottom = isUp ? gkY - 20 : gkY + 20
            const tipY = isUp ? arrowTop : arrowBottom
            const tailY = isUp ? arrowBottom : arrowTop
            const labelY = isUp ? arrowBottom + 30 : arrowTop - 14
            // 화살표 머리 좌우 좌표
            const tipDx = 14
            const tipDy = isUp ? 24 : -24
            return (
              <g>
                {/* 본체 (굵은 라인) */}
                <line x1={arrowX} y1={tailY} x2={arrowX} y2={tipY}
                  stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.85" />
                {/* 화살촉 */}
                <path d={`M ${arrowX} ${tipY} L ${arrowX - tipDx} ${tipY + tipDy} M ${arrowX} ${tipY} L ${arrowX + tipDx} ${tipY + tipDy}`}
                  stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.85" />
                {/* 텍스트 */}
                <text x={arrowX} y={labelY} fill="#fff" fontSize="28" fontWeight="800"
                  textAnchor="middle" fontFamily="Noto Sans KR, sans-serif"
                  style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.5)', strokeWidth: 3 } as React.CSSProperties}>
                  공격
                </text>
              </g>
            )
          })()}
        </svg>

        <div className={s.pitchActions}>
          <button type="button" className={`${s.copyBtn} ${copied ? s.copied : ''}`}
            onClick={copyMarkdown}>
            {copied ? '✓ 복사됨' : '📋 마크다운 복사'}
          </button>
          <button type="button" className={s.copyBtn} onClick={downloadPng} disabled={downloading}>
            {downloading ? '생성 중…' : '🖼️ PNG 다운로드'}
          </button>
        </div>
      </div>

      {/* ── 선수 편집 모달 ── */}
      {editingIdx !== null && players[editingIdx] && (
        <div className={s.modalBackdrop} onClick={() => setEditingIdx(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <span>{positions.find(p => p.idx === editingIdx)?.label ?? ''} 편집</span>
              <button type="button" className={s.modalClose}
                onClick={() => setEditingIdx(null)}>×</button>
            </div>
            <div className={s.modalRow}>
              <span className={s.subLabel}>등번호</span>
              <input type="text" className={s.textInput}
                value={players[editingIdx].number}
                onChange={e => updatePlayer(editingIdx, { number: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                inputMode="numeric"
                placeholder="10"
                autoFocus
              />
            </div>
            <div className={s.modalRow}>
              <span className={s.subLabel}>이름</span>
              <input type="text" className={s.textInput}
                value={players[editingIdx].name}
                onChange={e => updatePlayer(editingIdx, { name: e.target.value })}
                placeholder="선수 이름"
                maxLength={12}
              />
            </div>
            <button type="button" className={s.modalDone}
              onClick={() => setEditingIdx(null)}>완료</button>
          </div>
        </div>
      )}

      {/* ── 선수 명단 표 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📋 선수 명단 (클릭으로 편집)</div>
        <div className={s.rosterList}>
          {positions.map(pos => {
            const p = players[pos.idx]
            if (!p) return null
            return (
              <button key={pos.idx} type="button"
                className={s.rosterItem}
                onClick={() => setEditingIdx(pos.idx)}>
                <span className={s.rosterPos}>{pos.label}</span>
                <span className={s.rosterNum}>#{p.number || (pos.idx === 0 ? '1' : pos.idx + 1)}</span>
                <span className={s.rosterName}>{p.name || <em>미입력</em>}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
