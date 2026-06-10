'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useRef, useState } from 'react'
import s from './random.module.css'
import {
  pickWithWeights, pickWeightedIndex,
  divideIntoTeams, arrangeOrder, arrangeSeats,
  simulateFairness, calcRouletteAngle, describePieSlice,
  detectDuplicates, genColors,
  newId,
  type WeightedItem, type FairnessRow,
} from './randomUtils'
import { TEMPLATES, TEMPLATE_CATEGORIES, getTemplate } from './templates'

type Tab = 'roulette' | 'weighted' | 'team' | 'order' | 'fair'

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function RandomClient() {
  const [tab, setTab] = useState<Tab>('roulette')

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/lotto', label: '로또 번호 생성기' },
          { href: '/tools/life/ladder', label: '사다리타기' },
          { href: '/tools/life/dutch', label: '더치페이 계산기' }
        ]}
      >
        본 도구는 Math.random() 기반 의사난수 알고리즘을 사용합니다.
      </Disclaimer>

      <div className={s.tabs} role="tablist" aria-label="랜덤 추첨 도구 탭">
        {([
          ['roulette', '🎰 룰렛'],
          ['weighted', '⚖️ 가중치'],
          ['team',     '👥 팀'],
          ['order',    '📋 순서·자리'],
          ['fair',     '📊 공정성'],
        ] as [Tab, string][]).map(([key, label]) => {
          const cls =
            tab !== key ? '' :
            key === 'roulette' ? s.tabActiveRoul :
            key === 'weighted' ? s.tabActiveWeight :
            key === 'team'     ? s.tabActiveTeam :
            key === 'order'    ? s.tabActiveOrder :
            s.tabActiveFair
          return (
            <button key={key} type="button" role="tab" aria-selected={tab === key}
              className={`${s.tabBtn} ${cls}`} onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'roulette' && <RouletteTab />}
      {tab === 'weighted' && <WeightedTab />}
      {tab === 'team'     && <TeamTab />}
      {tab === 'order'    && <OrderTab />}
      {tab === 'fair'     && <FairnessTab />}
    </div>
  )
}

/* ═════════════════════════════════════════ 공용 — 이름 칩 입력 ═════════════════════════════════════════ */
interface NamesChipsProps {
  names: string[]
  onChange: (names: string[]) => void
  placeholder?: string
  max?: number
  /** 템플릿 카테고리 표시 여부 */
  showTemplates?: boolean
  /** 중복 표시 */
  showDupes?: boolean
}

function NamesChips({ names, onChange, placeholder = '이름 입력 후 Enter', max, showTemplates, showDupes }: NamesChipsProps) {
  const [draft, setDraft] = useState('')
  const [activeCat, setActiveCat] = useState('food')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const dupes = useMemo(() => showDupes ? detectDuplicates(names) : [], [names, showDupes])

  const addParts = (text: string) => {
    const parts = text.split(/[\n,\t]+/).map(s => s.trim()).filter(Boolean)
    if (parts.length === 0) return
    const next = [...names, ...parts]
    onChange(max ? next.slice(0, max) : next)
  }

  const commitDraft = () => {
    if (!draft.trim()) return
    addParts(draft)
    setDraft('')
  }

  const removeAt = (i: number) => onChange(names.filter((_, idx) => idx !== i))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commitDraft()
    } else if (e.key === 'Backspace' && draft === '' && names.length > 0) {
      onChange(names.slice(0, -1))
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData('text')
    if (/[\n,\t]/.test(t)) {
      e.preventDefault()
      addParts(t)
      setDraft('')
    }
  }

  const handleBlur = () => {
    if (draft.trim()) commitDraft()
  }

  const dedupe = () => onChange([...new Set(names)])

  const filteredTpls = useMemo(() => {
    const cat = TEMPLATE_CATEGORIES.find(c => c.id === activeCat)
    return TEMPLATES.filter(t => cat?.templates.includes(t.id) && t.items.length > 0)
  }, [activeCat])

  const applyTemplate = (id: string) => {
    const t = getTemplate(id)
    if (!t || t.items.length === 0) return
    onChange(max ? t.items.slice(0, max) : t.items)
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <>
      <div className={s.chipBox} onClick={() => inputRef.current?.focus()}>
        {names.map((n, i) => (
          <span key={`${n}-${i}`} className={s.chip}>
            <span className={s.chipName}>{n}</span>
            <button
              type="button"
              className={s.chipDel}
              onClick={(e) => { e.stopPropagation(); removeAt(i) }}
              aria-label={`${n} 제거`}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className={s.chipInput}
          aria-label={placeholder}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={names.length === 0 ? placeholder : ''}
        />
      </div>

      <div className={s.chipMeta}>
        <span>
          <strong>{names.length}</strong>명{max && ` / ${max}`}
          {dupes.length > 0 && (
            <span className={s.dupWarn}>
              {' '}· ⚠️ 중복 {dupes.length}건
              <button type="button" className={s.miniInline} onClick={dedupe}>중복 제거</button>
            </span>
          )}
        </span>
        {names.length > 0 && (
          <button type="button" className={s.miniInline} onClick={() => onChange([])}>
            전체 지우기
          </button>
        )}
      </div>

      {showTemplates && (
        <div className={s.tplBlock}>
          <div className={s.catRow} role="group" aria-label="템플릿 카테고리">
            {TEMPLATE_CATEGORIES.map(c => (
              <button key={c.id}
                type="button"
                aria-pressed={activeCat === c.id}
                className={`${s.catChip} ${activeCat === c.id ? s.catActive : ''}`}
                onClick={() => setActiveCat(c.id)}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
          <div className={s.tplGrid}>
            {filteredTpls.map(t => (
              <button key={t.id} type="button" className={s.tplCard} onClick={() => applyTemplate(t.id)}>
                <div className={s.tplEmoji}>{t.icon}</div>
                <div className={s.tplName}>{t.name}</div>
                <div className={s.tplCount}>{t.items.length}개</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 1 — 룰렛 (메인) ═════════════════════════════════════════ */
function RouletteTab() {
  const [items, setItems] = useState<{ id: string; name: string; weight: number }[]>([
    { id: newId(), name: '김치찌개', weight: 1 },
    { id: newId(), name: '파스타',   weight: 1 },
    { id: newId(), name: '비빔밥',   weight: 1 },
    { id: newId(), name: '초밥',     weight: 1 },
    { id: newId(), name: '치킨',     weight: 1 },
    { id: newId(), name: '피자',     weight: 1 },
  ])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [showWeights, setShowWeights] = useState(false)

  // 가중치 토글이 꺼져 있으면 모두 동일 확률(1)로 취급 — 표시·룰렛·추첨이 일관되게 균등
  const ew = (w: number) => (showWeights ? Math.max(1, w) : 1)
  const valid = items.filter(it => it.name.trim())
  const total = valid.reduce((s, it) => s + ew(it.weight), 0)
  const colors = useMemo(() => genColors(valid.length, 75, 58), [valid.length])

  const updateItem = (id: string, patch: Partial<{ name: string; weight: number }>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id))
  const addItem = () => {
    if (items.length >= 16) return
    setItems(prev => [...prev, { id: newId(), name: '', weight: 1 }])
  }

  /* 칩 입력에서 받은 이름 목록을 items로 매핑 (이름만 갱신, weight 유지) */
  const namesOnly = items.map(it => it.name).filter(Boolean)
  const onNamesChange = (next: string[]) => {
    const capped = next.slice(0, 16)
    const used = new Set<number>()
    const newItems = capped.map((name) => {
      // 위치가 아니라 이름으로 기존 항목을 찾아 가중치 유지
      // (앞 칩 삭제·템플릿 교체 시 가중치가 위치를 따라 엉뚱한 항목에 붙는 문제 방지)
      const mi = items.findIndex((it, idx) => !used.has(idx) && it.name === name)
      if (mi >= 0) { used.add(mi); return { ...items[mi], name } }
      return { id: newId(), name, weight: 1 }
    })
    setItems(newItems.length > 0 ? newItems : [{ id: newId(), name: '', weight: 1 }])
  }

  const handleSpin = () => {
    if (valid.length < 2 || spinning) return
    setWinner(null)
    const wItems: WeightedItem[] = valid.map(it => ({ name: it.name, weight: ew(it.weight) }))
    const idx = pickWeightedIndex(wItems)
    // 현재 회전각 기준으로 절대 목표각 계산 (이전 위치에 그대로 더하면 2회전부터 화살표↔결과 불일치)
    const targetRotation = calcRouletteAngle(wItems, idx, rotation)
    setRotation(targetRotation)
    setSpinning(true)
    setTimeout(() => {
      setWinner(wItems[idx].name)
      setSpinning(false)
    }, 4000)
  }

  /* SVG slices 계산 */
  const slices = useMemo(() => {
    if (total === 0 || valid.length === 0) return []
    const r = 140
    let cum = 0
    return valid.map((it, i) => {
      const sweep = ((showWeights ? Math.max(1, it.weight) : 1) / total) * 360
      const start = cum
      const end = cum + sweep
      cum = end
      const path = describePieSlice(150, 150, r, start, end)
      const midAngle = start + sweep / 2
      const labelX = 150 + (r * 0.6) * Math.cos(((midAngle - 90) * Math.PI) / 180)
      const labelY = 150 + (r * 0.6) * Math.sin(((midAngle - 90) * Math.PI) / 180)
      return { ...it, path, color: colors[i], labelX, labelY, midAngle }
    })
  }, [valid, total, colors, showWeights])

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          항목
          <span className={s.cardLabelHint}>{namesOnly.length}/16 · 가중치는 토글로 조정</span>
        </label>
        <NamesChips
          names={namesOnly}
          onChange={onNamesChange}
          placeholder="음식·이름·옵션 입력 (Enter / 쉼표 / 줄바꿈 paste)"
          max={16}
          showTemplates
        />

        <label className={s.toggleLabel} style={{ marginTop: 10 }}>
          <input type="checkbox" checked={showWeights} onChange={e => setShowWeights(e.target.checked)} />
          ⚖️ 항목별 가중치 조정 (확률 다르게)
        </label>

        {showWeights && (
          <div className={s.weightList} style={{ marginTop: 8 }}>
            {items.filter(it => it.name.trim()).map((it) => (
              <div key={it.id} className={s.weightRowCompact}>
                <span className={s.wrName}>{it.name}</span>
                <input type="range" className={s.weightSlider} min={1} max={10} step={1} aria-label="가중치 (1~10)"
                  value={Math.min(10, Math.max(1, it.weight))}
                  onChange={e => updateItem(it.id, { weight: parseInt(e.target.value) })} />
                <span className={s.weightPct} style={{ color: '#DC2626' }}>×{it.weight}</span>
              </div>
            ))}
          </div>
        )}

        {showWeights && items.length < 16 && (
          <button type="button" className={s.addItemBtn} onClick={addItem}>
            + 항목 추가
          </button>
        )}
        {showWeights && items.filter(it => !it.name.trim()).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
            {items.filter(it => !it.name.trim()).map(it => (
              <div key={it.id} className={s.weightRowCompact}>
                <input className={s.textInput} type="text" placeholder="빈 항목"
                  value={it.name} onChange={e => updateItem(it.id, { name: e.target.value })} />
                <input type="range" className={s.weightSlider} min={1} max={10} step={1} aria-label="가중치 (1~10)"
                  value={Math.min(10, Math.max(1, it.weight))}
                  onChange={e => updateItem(it.id, { weight: parseInt(e.target.value) })} />
                <span className={s.weightPct} style={{ color: '#DC2626' }}>×{it.weight}</span>
                <button className={s.removeBtn} onClick={() => removeItem(it.id)}
                  disabled={items.length <= 2}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={s.rouletteWrap}>
        <div className={s.rouletteArrow} />
        <svg viewBox="0 0 300 300" className={s.rouletteSvg}
          style={{ transform: `rotate(${rotation}deg)` }} aria-hidden="true">
          {slices.map((sl, i) => (
            <g key={i}>
              <path d={sl.path} fill={sl.color} stroke="#0a0a2e" strokeWidth={2} />
              {sl.name && (
                <text x={sl.labelX} y={sl.labelY} textAnchor="middle" dominantBaseline="middle"
                  className={s.sliceText}
                  transform={`rotate(${sl.midAngle - 90} ${sl.labelX} ${sl.labelY})`}>
                  {sl.name.length > 6 ? sl.name.slice(0, 6) + '…' : sl.name}
                </text>
              )}
            </g>
          ))}
          <circle cx={150} cy={150} r={14} className={s.rouletteHub} />
        </svg>
        <button className={s.bigDraw} onClick={handleSpin} disabled={spinning || valid.length < 2}>
          {spinning ? '🌀 회전 중...' : '🎰 룰렛 돌리기'}
        </button>
      </div>

      {winner && !spinning && (
        <div className={s.rouletteResult} role="status" aria-live="polite">
          <div className={s.rouletteResultLabel}>🎉 결과 발표</div>
          <div className={s.rouletteResultName}>{winner}</div>
          <button className={s.copyBtn}
            onClick={() => navigator.clipboard.writeText(winner)}
            style={{ marginTop: 14, maxWidth: 180, marginLeft: 'auto', marginRight: 'auto' }}>
            📋 결과 복사
          </button>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 2 — 가중치 추첨 ═════════════════════════════════════════ */
function WeightedTab() {
  const [items, setItems] = useState<{ id: string; name: string; weight: number }[]>([
    { id: newId(), name: '비빔밥', weight: 4 },
    { id: newId(), name: '김치찌개', weight: 3 },
    { id: newId(), name: '파스타', weight: 2 },
    { id: newId(), name: '초밥', weight: 1 },
  ])
  const [pickCount, setPickCount] = useState(1)
  const [allowDup, setAllowDup] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const totalWeight = items.reduce((s, it) => s + Math.max(0, it.weight), 0)
  const valid = items.filter(it => it.name.trim() && it.weight > 0)
  // 실제 추첨은 빈 항목을 제외하므로, 표시 확률도 "유효 항목 합" 기준이어야 한다 (빈 행 추가 시 표시 확률 왜곡 방지)
  const validTotal = valid.reduce((s, it) => s + it.weight, 0)

  const handleDraw = () => {
    if (valid.length === 0) return
    const wItems: WeightedItem[] = valid.map(it => ({ name: it.name.trim(), weight: it.weight }))
    setResults(pickWithWeights(wItems, pickCount, allowDup))
    setCopied(false)
  }

  const updateItem = (id: string, patch: Partial<{ name: string; weight: number }>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id))
  const addItem = () => {
    if (items.length >= 30) return
    setItems(prev => [...prev, { id: newId(), name: '', weight: 1 }])
  }

  const handleCopy = () => {
    if (results.length === 0) return
    navigator.clipboard.writeText(results.join(', ')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const colors = useMemo(() => genColors(valid.length, 70, 60), [valid.length])

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          항목·가중치
          <span className={s.cardLabelHint}>{items.length}/30 · 총합 {totalWeight}</span>
        </label>
        <div className={s.weightList}>
          {items.map((it, idx) => {
            const pct = (it.name.trim() && it.weight > 0 && validTotal > 0) ? (it.weight / validTotal) * 100 : 0
            return (
              <div key={it.id} className={s.weightRow}>
                <input className={s.textInput} type="text" placeholder={`항목 ${idx + 1}`}
                  value={it.name} onChange={e => updateItem(it.id, { name: e.target.value })} />
                <input type="range" className={s.weightSlider} min={1} max={20} step={1} aria-label="가중치 (1~20)"
                  value={Math.min(20, Math.max(1, it.weight))}
                  onChange={e => updateItem(it.id, { weight: parseInt(e.target.value) })} />
                <span className={s.weightPct}>{pct.toFixed(1)}%</span>
                <button className={s.removeBtn} onClick={() => removeItem(it.id)}
                  disabled={items.length <= 2}>×</button>
              </div>
            )
          })}
        </div>
        <button className={s.addItemBtn} onClick={addItem} disabled={items.length >= 30}>
          + 항목 추가
        </button>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>확률 미리보기</label>
        <div className={s.probBars}>
          {valid.map((it, i) => {
            const pct = validTotal > 0 ? (it.weight / validTotal) * 100 : 0
            return (
              <div key={it.id} className={s.probRow}>
                <span className={s.probName}>{it.name || '—'} (×{it.weight})</span>
                <span className={s.probTrack}>
                  <span className={s.probFill} style={{ width: `${pct}%`, background: colors[i] }} />
                </span>
                <span className={s.probValue}>{pct.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>옵션</label>
        <div className={s.miniRow}>
          <span className={s.subLabel} style={{ alignSelf: 'center', margin: 0, marginRight: 8 }}>뽑기 개수</span>
          <div className={s.countRow} role="group" aria-label="뽑기 개수 선택">
            {[1, 2, 3, 5].map(n => (
              <button key={n} type="button"
                aria-pressed={pickCount === n}
                className={`${s.countBtn} ${pickCount === n ? s.countActive : ''}`}
                onClick={() => setPickCount(n)}>{n}개</button>
            ))}
          </div>
        </div>
        <label className={s.toggleLabel} style={{ marginTop: 10 }}>
          <input type="checkbox" checked={allowDup} onChange={e => setAllowDup(e.target.checked)} />
          중복 허용 (같은 항목이 여러 번 뽑힐 수 있음)
        </label>
      </div>

      <button className={s.bigDraw} onClick={handleDraw} disabled={valid.length === 0}>
        🎯 가중치 추첨
      </button>

      {results.length > 0 && (
        <div className={s.resultCard} role="status" aria-live="polite">
          <div className={s.resultLabel}>🎉 가중치 추첨 결과</div>
          {results.length === 1 ? (
            <div className={s.resultBig}>{results[0]}</div>
          ) : (
            <div className={s.resultList}>
              {results.map((r, i) => (
                <div key={i} className={s.resultRow}>
                  <span className={s.resultRank}>{i + 1}.</span>
                  <span className={s.resultName}>{r}</span>
                </div>
              ))}
            </div>
          )}
          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}
            style={{ marginTop: 14, maxWidth: 180, marginLeft: 'auto', marginRight: 'auto' }}>
            {copied ? '✓ 복사됨' : '📋 복사'}
          </button>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3 — 팀 나누기 ═════════════════════════════════════════ */
function TeamTab() {
  const [names, setNames] = useState<string[]>(['김민수', '이지은', '박서준', '최수아', '정현우', '강하늘', '조민지', '윤도현'])
  const [splitMode, setSplitMode] = useState<'count' | 'size'>('count')
  const [teamCount, setTeamCount] = useState(2)
  const [teamSize, setTeamSize] = useState(4)
  const [keepTogether, setKeepTogether] = useState<string[][]>([])
  const [keepApart, setKeepApart] = useState<string[][]>([])
  const [leaders, setLeaders] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [teams, setTeams] = useState<string[][]>([])
  const [copied, setCopied] = useState(false)

  const colors = useMemo(() => genColors(Math.max(2, teams.length || teamCount), 70, 60), [teams.length, teamCount])

  const handleDraw = () => {
    if (names.length === 0) return
    const opts = {
      teamCount: splitMode === 'count' ? teamCount : undefined,
      teamSize: splitMode === 'size' ? teamSize : undefined,
      keepTogether: keepTogether.length > 0 ? keepTogether : undefined,
      keepApart: keepApart.length > 0 ? keepApart : undefined,
      leaders: leaders.length > 0 ? leaders : undefined,
    }
    setTeams(divideIntoTeams(names, opts))
    setCopied(false)
  }

  const handleCopy = () => {
    if (teams.length === 0) return
    const leaderSet = new Set(leaders)
    const text = teams.map((team, i) =>
      `${String.fromCharCode(65 + i)}팀 (${team.length}명)\n${team.map(m =>
        leaderSet.has(m) ? `⭐ ${m}` : `· ${m}`
      ).join('\n')}`
    ).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const leaderSet = new Set(leaders)

  // 옵션이 물리적으로 불가능하면 미리 경고 (조용히 위반하는 대신)
  const effectiveTeamCount = splitMode === 'count' ? teamCount : Math.max(1, Math.ceil(names.length / Math.max(1, teamSize)))
  const teamWarnings: string[] = []
  if (splitMode === 'size') {
    for (const g of keepTogether) {
      if (g.filter(m => names.includes(m)).length > teamSize) {
        teamWarnings.push(`같이 묶을 그룹이 팀당 인원(${teamSize}명)보다 커서, 일부 팀이 정원을 넘습니다.`); break
      }
    }
  }
  for (const g of keepApart) {
    if (g.filter(m => names.includes(m)).length > effectiveTeamCount) {
      teamWarnings.push(`떨어뜨릴 그룹 인원이 팀 수(${effectiveTeamCount}개)보다 많아, 일부는 같은 팀이 됩니다.`); break
    }
  }

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>참가자 명단</label>
        <NamesChips
          names={names}
          onChange={(n) => { setNames(n); setTeams([]) }}
          placeholder="이름 입력 후 Enter (붙여넣기·쉼표 OK)"
          showDupes
        />
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>분배 방식</label>
        <div className={s.modeRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} role="group" aria-label="분배 방식 선택">
          <button type="button" aria-pressed={splitMode === 'count'} className={`${s.modeBtn} ${splitMode === 'count' ? s.modeBtnActive : ''}`}
            onClick={() => setSplitMode('count')}>팀 수 지정</button>
          <button type="button" aria-pressed={splitMode === 'size'} className={`${s.modeBtn} ${splitMode === 'size' ? s.modeBtnActive : ''}`}
            onClick={() => setSplitMode('size')}>팀당 인원</button>
        </div>
        <div style={{ marginTop: 10 }}>
          {splitMode === 'count' ? (
            <div className={s.countRow} role="group" aria-label="팀 수 선택">
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} type="button"
                  aria-pressed={teamCount === n}
                  className={`${s.countBtn} ${teamCount === n ? s.countActive : ''}`}
                  onClick={() => setTeamCount(n)}>{n}팀</button>
              ))}
            </div>
          ) : (
            <div className={s.countRow} role="group" aria-label="팀당 인원 선택">
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} type="button"
                  aria-pressed={teamSize === n}
                  className={`${s.countBtn} ${teamSize === n ? s.countActive : ''}`}
                  onClick={() => setTeamSize(n)}>{n}명</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={s.card}>
        <button type="button" className={s.advToggle}
          onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? '▾' : '▸'} 고급 옵션 (리더·묶기·떨어뜨리기)
        </button>
        {showAdvanced && (
          <div style={{ marginTop: 10 }}>
            <span className={s.subLabel}>각 팀 리더 (1팀 1명)</span>
            <NamesChips
              names={leaders}
              onChange={setLeaders}
              placeholder="리더 이름 입력"
            />
            <span className={s.subLabel} style={{ marginTop: 12 }}>같이 묶을 그룹 (Enter로 그룹 구분)</span>
            <GroupChips groups={keepTogether} onChange={setKeepTogether}
              placeholder="같은 팀 멤버 입력 → 쉼표로 그룹 / 빈 줄로 다음 그룹" />
            <span className={s.subLabel} style={{ marginTop: 12 }}>떨어뜨릴 그룹</span>
            <GroupChips groups={keepApart} onChange={setKeepApart}
              placeholder="다른 팀으로 나눌 멤버 입력" />
          </div>
        )}
      </div>

      {teamWarnings.length > 0 && (
        <div style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.35)', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6 }}>
          {teamWarnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
        </div>
      )}

      <button className={s.bigDraw} onClick={handleDraw} disabled={names.length === 0}>
        👥 팀 나누기
      </button>

      {teams.length > 0 && (
        <>
          <div className={s.teamGrid} role="status" aria-live="polite">
            {teams.map((team, i) => (
              <div key={i} className={s.teamCard} style={{ borderLeftColor: colors[i] }}>
                <div className={s.teamHeader}>
                  <span className={s.teamName}>{String.fromCharCode(65 + i)}팀</span>
                  <span className={s.teamCount}>{team.length}명</span>
                </div>
                <div className={s.teamMembers}>
                  {team.map((m, j) => (
                    <div key={j} className={`${s.teamMember} ${leaderSet.has(m) ? s.teamLeader : ''}`}>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}
            style={{ marginTop: 4, maxWidth: 240, marginLeft: 'auto', marginRight: 'auto' }}>
            {copied ? '✓ 복사됨' : '📋 텍스트 복사'}
          </button>
        </>
      )}
    </>
  )
}

/* ─── 그룹 칩 (떨어뜨릴/같이 묶을용) ─── */
function GroupChips({ groups, onChange, placeholder }: {
  groups: string[][]
  onChange: (g: string[][]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  const commitGroup = () => {
    const parts = draft.split(/[\n,\t]+/).map(s => s.trim()).filter(Boolean)
    if (parts.length === 0) return
    onChange([...groups, parts])
    setDraft('')
  }

  const removeGroup = (i: number) => onChange(groups.filter((_, idx) => idx !== i))

  return (
    <div>
      {groups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
          {groups.map((g, i) => (
            <div key={i} className={s.groupChip}>
              <span>{g.join(', ')}</span>
              <button type="button" className={s.chipDel} onClick={() => removeGroup(i)} aria-label="그룹 제거">×</button>
            </div>
          ))}
        </div>
      )}
      <div className={s.miniRow}>
        <input
          type="text"
          className={s.textInput}
          style={{ flex: 1 }}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitGroup() } }}
          placeholder={placeholder}
        />
        <button type="button" className={s.miniBtn} onClick={commitGroup} disabled={!draft.trim()}>
          + 그룹
        </button>
      </div>
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 4 — 순서·자리 ═════════════════════════════════════════ */
function OrderTab() {
  const [mode, setMode] = useState<'order' | 'seat'>('order')
  const [names, setNames] = useState<string[]>(['김민수', '이지은', '박서준', '최수아', '정현우', '강하늘'])
  // order
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [excluded, setExcluded] = useState<string[]>([])
  // seat
  const [rows, setRows] = useState(4)
  const [cols, setCols] = useState(6)
  const [keepApart, setKeepApart] = useState<string[][]>([])
  // results
  const [order, setOrder] = useState<string[] | null>(null)
  const [seats, setSeats] = useState<(string | null)[][] | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleOrder = () => {
    const fixed: { name: string; position: number | 'last' }[] = []
    if (firstName.trim()) fixed.push({ name: firstName.trim(), position: 1 })
    if (lastName.trim())  fixed.push({ name: lastName.trim(), position: 'last' })
    setOrder(arrangeOrder(names, { fixed, excluded }))
    setSeats(null)
    setCopied(false)
  }
  const handleSeat = () => {
    setSeats(arrangeSeats(names, { rows, cols, keepApart: keepApart.length ? keepApart : undefined }))
    setOrder(null)
    setCopied(false)
  }

  const handleCopy = () => {
    let text = ''
    if (order) {
      text = `📋 발표 순서\n` + order.map((n, i) => `${i + 1}. ${n}`).join('\n')
    } else if (seats) {
      text = `💺 자리 배치 (${rows}×${cols})\n` +
        seats.map(row => row.map(c => c ?? '·').join('\t')).join('\n')
    }
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const fixedSet = new Set([firstName.trim(), lastName.trim()].filter(Boolean))

  // 자리 폰트·패딩 동적 계산 — cols가 많을수록 작게 (최소 10px, 그 이하는 가로 스크롤로 처리)
  const seatFontSize = Math.max(10, Math.min(15, 22 - cols * 2))
  const seatPadding = Math.max(4, Math.min(12, 18 - cols * 2))

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>모드</label>
        <div className={s.orderModeRow} role="group" aria-label="순서/자리 모드 선택">
          <button type="button" aria-pressed={mode === 'order'} className={`${s.orderModeBtn} ${mode === 'order' ? s.orderModeActive : ''}`}
            onClick={() => { setMode('order'); setOrder(null); setSeats(null) }}>📋 발표 순서</button>
          <button type="button" aria-pressed={mode === 'seat'} className={`${s.orderModeBtn} ${mode === 'seat' ? s.orderModeActive : ''}`}
            onClick={() => { setMode('seat'); setOrder(null); setSeats(null) }}>💺 자리 배치</button>
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>참가자 명단</label>
        <NamesChips
          names={names}
          onChange={(n) => { setNames(n); setOrder(null); setSeats(null) }}
          placeholder="이름 입력 후 Enter"
          showDupes
        />
      </div>

      {mode === 'order' && (
        <div className={s.card}>
          <button type="button" className={s.advToggle}
            onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? '▾' : '▸'} 고급 옵션 (고정·제외)
          </button>
          {showAdvanced && (
            <div style={{ marginTop: 10 }}>
              <div className={s.fieldRow}>
                <div>
                  <span className={s.subLabel}>1번 (맨 처음)</span>
                  <input className={s.textInput} type="text" placeholder="(선택)"
                    aria-label="맨 처음(1번)에 고정할 이름"
                    value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <span className={s.subLabel}>마지막</span>
                  <input className={s.textInput} type="text" placeholder="(선택)"
                    aria-label="마지막에 고정할 이름"
                    value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <span className={s.subLabel} style={{ marginTop: 10 }}>제외할 사람</span>
              <NamesChips names={excluded} onChange={setExcluded} placeholder="제외할 이름" />
            </div>
          )}
        </div>
      )}

      {mode === 'seat' && (
        <div className={s.card}>
          <label className={s.cardLabel}>자리 크기 — {rows} × {cols} = {rows * cols}자리</label>
          <div className={s.fieldRow}>
            <div>
              <span className={s.subLabel}>행</span>
              <input className={s.numInput} type="number" min={1} max={20} inputMode="numeric"
                aria-label="자리 행 수"
                value={rows} onChange={e => setRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))} />
            </div>
            <div>
              <span className={s.subLabel}>열</span>
              <input className={s.numInput} type="number" min={1} max={20} inputMode="numeric"
                aria-label="자리 열 수"
                value={cols} onChange={e => setCols(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))} />
            </div>
          </div>
          {names.length > rows * cols && (
            <div style={{ marginTop: 10, background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6 }}>
              ⚠️ 참가자 {names.length}명 &gt; 자리 {rows * cols}개 — <strong>{names.length - rows * cols}명이 배치되지 않습니다.</strong> 행·열을 늘리세요.
            </div>
          )}
          <button type="button" className={s.advToggle} style={{ marginTop: 10 }}
            onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? '▾' : '▸'} 떨어뜨릴 그룹 (인접 회피)
          </button>
          {showAdvanced && (
            <div style={{ marginTop: 8 }}>
              <GroupChips groups={keepApart} onChange={setKeepApart}
                placeholder="떨어뜨릴 멤버 (쉼표로 그룹)" />
            </div>
          )}
        </div>
      )}

      <button className={s.bigDraw} onClick={mode === 'order' ? handleOrder : handleSeat}
        disabled={names.length === 0}>
        {mode === 'order' ? '📋 순서 추첨' : '💺 자리 배치'}
      </button>

      {order && (
        <>
          <div className={s.card} role="status" aria-live="polite">
            <label className={s.cardLabel}>📋 발표 순서</label>
            <div className={s.orderList}>
              {order.map((n, i) => {
                const fixed = fixedSet.has(n)
                return (
                  <div key={i} className={`${s.orderRow} ${fixed ? s.orderRowFixed : ''}`}>
                    <span className={s.orderRank}>{i + 1}.</span>
                    <span className={s.orderName}>
                      {n}
                      {fixed && i === 0 && <small>고정 1번</small>}
                      {fixed && i === order.length - 1 && <small>고정 마지막</small>}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}
            style={{ marginTop: 4, maxWidth: 180, marginLeft: 'auto', marginRight: 'auto' }}>
            {copied ? '✓ 복사됨' : '📋 복사'}
          </button>
        </>
      )}

      {seats && (
        <>
          <div className={s.card} role="status" aria-live="polite">
            <label className={s.cardLabel}>💺 자리 배치 ({rows} × {cols})</label>
            <div className={s.seatGrid} style={{ gridTemplateColumns: `repeat(${cols}, minmax(36px, 1fr))` }}>
              {seats.map((row, r) => row.map((cell, c) => (
                <div key={`${r}-${c}`}
                  className={`${s.seatCell} ${!cell ? s.seatCellEmpty : ''}`}
                  style={{ fontSize: `${seatFontSize}px`, padding: `${seatPadding}px 2px` }}
                  title={cell ?? `${r + 1}행 ${c + 1}열 (비어있음)`}>
                  {cell ?? '—'}
                </div>
              )))}
            </div>
          </div>
          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}
            style={{ marginTop: 4, maxWidth: 180, marginLeft: 'auto', marginRight: 'auto' }}>
            {copied ? '✓ 복사됨' : '📋 복사'}
          </button>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 5 — 공정성 검증 ═════════════════════════════════════════ */
function FairnessTab() {
  const [items, setItems] = useState<{ id: string; name: string; weight: number }[]>([
    { id: newId(), name: 'A', weight: 1 },
    { id: newId(), name: 'B', weight: 1 },
    { id: newId(), name: 'C', weight: 1 },
    { id: newId(), name: 'D', weight: 1 },
  ])
  const [trials, setTrials] = useState(1000)
  const [results, setResults] = useState<FairnessRow[] | null>(null)
  const [running, setRunning] = useState(false)

  const updateItem = (id: string, patch: Partial<{ name: string; weight: number }>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }
  const removeItem = (id: string) => setItems(prev => prev.filter(it => it.id !== id))
  const addItem = () => {
    if (items.length >= 20) return
    setItems(prev => [...prev, { id: newId(), name: String.fromCharCode(65 + prev.length), weight: 1 }])
  }

  const valid = items.filter(it => it.name.trim() && it.weight > 0)

  const handleRun = () => {
    if (valid.length < 2) return
    setRunning(true)
    setTimeout(() => {
      const wItems: WeightedItem[] = valid.map(it => ({ name: it.name, weight: it.weight }))
      setResults(simulateFairness(wItems, trials))
      setRunning(false)
    }, 50)
  }

  const totalWeight = valid.reduce((s, it) => s + it.weight, 0)
  const maxBar = results ? Math.max(...results.map(r => Math.max(r.actualPct, r.expectedPct))) : 0

  const devClass = (d: number) => {
    const abs = Math.abs(d)
    if (abs < 5) return s.devSmall
    if (abs < 15) return s.devMid
    return s.devLarge
  }

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          항목·가중치
          <span className={s.cardLabelHint}>총합 {totalWeight}</span>
        </label>
        <div className={s.weightList}>
          {items.map((it, idx) => {
            const expected = totalWeight > 0 ? (it.weight / totalWeight) * 100 : 0
            return (
              <div key={it.id} className={s.weightRow}>
                <input className={s.textInput} type="text" placeholder={`항목 ${idx + 1}`}
                  value={it.name} onChange={e => updateItem(it.id, { name: e.target.value })} />
                <input type="range" className={s.weightSlider} min={1} max={20} step={1} aria-label="가중치 (1~20)"
                  value={Math.min(20, Math.max(1, it.weight))}
                  onChange={e => updateItem(it.id, { weight: parseInt(e.target.value) })} />
                <span className={s.weightPct} style={{ color: '#059669' }}>{expected.toFixed(1)}%</span>
                <button className={s.removeBtn} onClick={() => removeItem(it.id)}
                  disabled={items.length <= 2}>×</button>
              </div>
            )
          })}
        </div>
        <button className={s.addItemBtn} onClick={addItem} disabled={items.length >= 20}>
          + 항목 추가
        </button>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>시뮬레이션 횟수</label>
        <div className={s.simRow} role="group" aria-label="시뮬레이션 횟수 선택">
          {[100, 1000, 10000, 100000].map(n => (
            <button key={n} type="button"
              aria-pressed={trials === n}
              className={`${s.simBtn} ${trials === n ? s.simActive : ''}`}
              onClick={() => setTrials(n)}>
              {n.toLocaleString()}회
            </button>
          ))}
        </div>
      </div>

      <button className={s.bigDraw} onClick={handleRun}
        disabled={running || valid.length < 2}>
        {running ? '시뮬레이션 중...' : `📊 ${trials.toLocaleString()}회 시뮬레이션`}
      </button>

      {results && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel}>
              시뮬레이션 결과
              <span className={s.cardLabelHint}>{trials.toLocaleString()}회</span>
            </label>
            <div className={s.fairTable}>
              <div className={s.fairRow} style={{ background: 'transparent', borderColor: 'transparent', fontWeight: 700, fontSize: 11, color: 'var(--muted)' }}>
                <span>항목 (가중치)</span>
                <span style={{ textAlign: 'right' }}>기대</span>
                <span style={{ textAlign: 'right' }}>실제</span>
                <span style={{ textAlign: 'right' }}>편차</span>
              </div>
              {results.map((r, i) => (
                <div key={i} className={s.fairRow}>
                  <span className={s.fairName}>{r.name} (×{r.weight})</span>
                  <span className={s.fairExpected}>
                    {r.expected}회<br /><small>{r.expectedPct.toFixed(1)}%</small>
                  </span>
                  <span className={s.fairActual}>
                    {r.actual}회<br /><small>{r.actualPct.toFixed(1)}%</small>
                  </span>
                  <span className={`${s.fairDeviation} ${devClass(r.deviation)}`}>
                    {r.deviation >= 0 ? '+' : ''}{r.deviation}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>실제 vs 기대 비율</label>
            <div className={s.fairBars}>
              {results.map((r, i) => (
                <div key={i} className={s.fairBarRow}>
                  <span className={s.fairName}>{r.name}</span>
                  <span className={s.fairBarTrack}>
                    <span className={s.fairBarFill}
                      style={{ width: `${maxBar > 0 ? (r.actualPct / maxBar) * 100 : 0}%` }} />
                    <span className={s.fairBarMark}
                      style={{ left: `${maxBar > 0 ? (r.expectedPct / maxBar) * 100 : 0}%` }}
                      title="기대 비율" />
                  </span>
                  <span className={s.weightPct} style={{ color: '#059669' }}>
                    {r.actualPct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
              ⓘ 흰색 마커는 <strong style={{ color: 'var(--text)' }}>기대 비율</strong>, 초록 막대는 <strong style={{ color: '#059669' }}>실제 비율</strong>입니다.
            </p>
          </div>

          <div className={s.fairExplain}>
            💡 <strong>큰 수의 법칙 (Law of Large Numbers)</strong> — 시행 횟수가 많을수록 실제 비율이 기대 확률에 수렴합니다.
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li><strong>100회</strong>: 편차 큼 (작은 표본은 변동 ↑)</li>
              <li><strong>1,000회</strong>: 편차 줄어듦 (상당히 균등)</li>
              <li><strong>10,000회</strong>: 편차 작음</li>
              <li><strong>100,000회</strong>: 거의 이론값에 수렴</li>
            </ul>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '6px 0 0', lineHeight: 1.6 }}>
              ※ 편차 크기는 항목 수·가중치 편차에 따라 달라집니다. 위는 대략적 경향입니다.
            </p>
          </div>
        </>
      )}
    </>
  )
}
