'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import styles from './alcohol.module.css'
import {
  KOREAN_GLASS_PRESETS, DILUTION_OPTIONS, KOREAN_COCKTAIL_PRESETS,
  SOJU_BRANDS, EQUIV_TARGETS,
  ALCOHOL_DENSITY, STANDARD_DRINK_G,
  calcAlcohol, calcDilutionAmount, equivConvert,
  riskLevel, fmtMl, GlassPreset,
} from './alcoholUtils'

type Tab = 'mix' | 'dilute' | 'equiv' | 'party'

const TABS: { id: Tab; label: string }[] = [
  { id: 'mix',    label: '🍹 혼합 도수' },
  { id: 'dilute', label: '💧 목표 희석' },
  { id: 'equiv',  label: '⚖️ 알코올 환산' },
  { id: 'party',  label: '👥 1인당 분배' },
]

interface DrinkItem { id: number; name: string; volume: string; abv: string }
let nextId = 100

/* ────────────────────────────────────────────────────────────── */
/* 탭 1: 혼합 도수 (잔/병 프리셋 + 칵테일 + 직접 입력)            */
/* ────────────────────────────────────────────────────────────── */
function MixTab() {
  const [items, setItems] = useState<DrinkItem[]>([
    { id: 1, name: '술 A', volume: '', abv: '' },
    { id: 2, name: '술 B', volume: '', abv: '' },
  ])
  const [presetTarget, setPresetTarget] = useState<number>(1)
  const [glassMode, setGlassMode] = useState<'glass' | 'bottle'>('glass')

  const update = useCallback((id: number, field: keyof Omit<DrinkItem, 'id'>, val: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it))
  }, [])

  const applyGlass = useCallback((g: GlassPreset, qty: number = 1) => {
    setItems(prev => prev.map(it =>
      it.id === presetTarget
        ? { ...it, name: g.name + (qty > 1 ? ` ×${qty}` : ''), volume: String(g.ml * qty), abv: g.abv === null ? it.abv : String(g.abv) }
        : it
    ))
  }, [presetTarget])

  const applyCocktail = useCallback((id: string) => {
    const c = KOREAN_COCKTAIL_PRESETS.find(x => x.id === id)
    if (!c) return
    setItems([
      { id: ++nextId, name: c.base.label,  volume: String(c.base.ml),  abv: String(c.base.abv) },
      { id: ++nextId, name: c.mixer.label, volume: String(c.mixer.ml), abv: String(c.mixer.abv) },
    ])
  }, [])

  const result = useMemo(() => {
    const valid = items.filter(it => {
      const v = parseFloat(it.volume); const a = parseFloat(it.abv)
      return v > 0 && a >= 0 && a <= 100
    })
    if (valid.length < 2) return null
    const totalVol = valid.reduce((s, it) => s + parseFloat(it.volume), 0)
    const totalAlcMl = valid.reduce((s, it) => s + parseFloat(it.volume) * (parseFloat(it.abv) / 100), 0)
    const mixedAbv = (totalAlcMl / totalVol) * 100
    const alcG = totalAlcMl * ALCOHOL_DENSITY
    const standard = alcG / STANDARD_DRINK_G
    return {
      totalVol: +totalVol.toFixed(0),
      mixedAbv: +mixedAbv.toFixed(2),
      alcMl: +totalAlcMl.toFixed(1),
      alcG: +alcG.toFixed(1),
      kcal: Math.round(alcG * 7),
      standard: +standard.toFixed(2),
    }
  }, [items])

  const filteredGlasses = KOREAN_GLASS_PRESETS.filter(g => g.group === glassMode)

  return (
    <div className={styles.tabContent}>
      {/* 잔/병 프리셋 */}
      <div className={styles.presetCard}>
        <div className={styles.presetTop}>
          <span className={styles.presetLabel}>프리셋 적용 대상</span>
          <div className={styles.presetTargetBtns}>
            {items.map(it => (
              <button key={it.id}
                className={`${styles.targetBtn} ${presetTarget === it.id ? styles.targetBtnActive : ''}`}
                onClick={() => setPresetTarget(it.id)}>
                {it.name || `술 ${items.indexOf(it) + 1}`}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.modeToggle}>
          <button className={`${styles.modeBtn} ${glassMode === 'glass' ? styles.modeBtnActive : ''}`}
            onClick={() => setGlassMode('glass')}>잔 단위</button>
          <button className={`${styles.modeBtn} ${glassMode === 'bottle' ? styles.modeBtnActive : ''}`}
            onClick={() => setGlassMode('bottle')}>병·캔</button>
        </div>
        <div className={styles.glassGrid}>
          {filteredGlasses.map(g => (
            <button key={g.id} className={styles.glassCard} onClick={() => applyGlass(g)}>
              <span className={styles.glassIcon}>{g.icon}</span>
              <span className={styles.glassName}>{g.name}</span>
              <span className={styles.glassMeta}>
                {g.ml}ml{g.abv !== null ? ` · ${g.abv}%` : ''}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 인기 칵테일 프리셋 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>한국 인기 칵테일 (자동 채우기)</label>
        <div className={styles.cocktailGrid}>
          {KOREAN_COCKTAIL_PRESETS.map(c => (
            <button key={c.id} className={styles.cocktailCard} onClick={() => applyCocktail(c.id)}>
              <div className={styles.cocktailTitle}>{c.emoji} {c.name}</div>
              <div className={styles.cocktailDesc}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 재료 행 */}
      <div className={styles.itemList}>
        {items.map((it, idx) => (
          <div key={it.id} className={styles.card}>
            <div className={styles.itemHeader}>
              <input className={styles.nameInput} type="text"
                placeholder={`술 ${idx + 1}`} value={it.name}
                onChange={e => update(it.id, 'name', e.target.value)} />
              {items.length > 2 && (
                <button className={styles.removeBtn}
                  onClick={() => setItems(prev => prev.filter(x => x.id !== it.id))}>×</button>
              )}
            </div>
            <div className={styles.itemInputs}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>용량</label>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="decimal"
                    placeholder="50" value={it.volume}
                    onChange={e => update(it.id, 'volume', e.target.value)} />
                  <span className={styles.unit}>ml</span>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>도수</label>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="decimal"
                    placeholder="16" value={it.abv}
                    onChange={e => update(it.id, 'abv', e.target.value)} />
                  <span className={styles.unit}>%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length < 5 && (
        <button className={styles.addBtn}
          onClick={() => { const n = { id: ++nextId, name: '', volume: '', abv: '' }; setItems(prev => [...prev, n]); setPresetTarget(n.id) }}>
          + 술 추가 ({items.length}/5)
        </button>
      )}

      {/* 결과 */}
      {result ? (
        <div className={styles.resultCard}>
          <div className={styles.heroRow}>
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>혼합 도수</div>
              <div className={styles.heroNum}>{result.mixedAbv}<span className={styles.heroUnit}>%</span></div>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>총 용량</div>
              <div className={styles.heroNum}>{result.totalVol}<span className={styles.heroUnit}>ml</span></div>
            </div>
          </div>
          <div className={styles.alcInfoGrid3}>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.alcMl}ml</div>
              <div className={styles.alcInfoLabel}>알코올 부피</div>
            </div>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.alcG}g</div>
              <div className={styles.alcInfoLabel}>알코올 무게</div>
            </div>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.kcal} kcal</div>
              <div className={styles.alcInfoLabel}>알코올 칼로리</div>
            </div>
          </div>
          <div className={styles.alcInfoGrid}>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.standard} 잔</div>
              <div className={styles.alcInfoLabel}>표준 음주량</div>
            </div>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{(result.kcal / 314).toFixed(1)} 공기</div>
              <div className={styles.alcInfoLabel}>밥 환산 (1공기 314kcal)</div>
            </div>
          </div>
          <p className={styles.stdNote}>
            * 한국 1표준잔 = 알코올 8g · 에탄올 밀도 0.79g/ml · 알코올 1g = 7 kcal
          </p>
        </div>
      ) : (
        <div className={styles.empty}>두 가지 이상의 술 정보를 입력하면 혼합 도수가 계산됩니다</div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* 탭 2: 목표 도수 희석 (물·맥주·탄산수·토닉 등)                 */
/* ────────────────────────────────────────────────────────────── */
function DilutionTab() {
  const [originalMl, setOriginalMl] = useState('')
  const [originalAbv, setOriginalAbv] = useState('')
  const [targetAbv, setTargetAbv] = useState('')
  const [dilutionId, setDilutionId] = useState('water')

  const dilution = DILUTION_OPTIONS.find(d => d.id === dilutionId) ?? DILUTION_OPTIONS[0]

  const applyGlass = useCallback((g: GlassPreset) => {
    setOriginalMl(String(g.ml))
    if (g.abv !== null) setOriginalAbv(String(g.abv))
  }, [])

  const result = useMemo(() => {
    const v = parseFloat(originalMl)
    const a = parseFloat(originalAbv)
    const t = parseFloat(targetAbv)
    if (!v || !a || !t) return null
    return calcDilutionAmount({
      originalMl: v, originalAbv: a, targetAbv: t, dilutionAbv: dilution.abv,
    })
  }, [originalMl, originalAbv, targetAbv, dilution])

  const compareTable = useMemo(() => {
    const v = parseFloat(originalMl)
    const a = parseFloat(originalAbv)
    const t = parseFloat(targetAbv)
    if (!v || !a || !t) return null
    return DILUTION_OPTIONS.map(opt => {
      const r = calcDilutionAmount({
        originalMl: v, originalAbv: a, targetAbv: t, dilutionAbv: opt.abv,
      })
      return { opt, result: r }
    })
  }, [originalMl, originalAbv, targetAbv])

  const invalidTarget = useMemo(() => {
    const a = parseFloat(originalAbv); const t = parseFloat(targetAbv)
    return !!(a && t && t >= a)
  }, [originalAbv, targetAbv])

  const alcG = useMemo(() => {
    const v = parseFloat(originalMl); const a = parseFloat(originalAbv)
    if (!v || !a) return 0
    return calcAlcohol(v, a).alcoholG
  }, [originalMl, originalAbv])

  return (
    <div className={styles.tabContent}>
      {/* 잔 프리셋 (원액) */}
      <div className={styles.presetCard}>
        <span className={styles.presetLabel}>원액 (잔/병 빠른 선택)</span>
        <div className={styles.glassGrid} style={{ marginTop: 10 }}>
          {KOREAN_GLASS_PRESETS.filter(g => g.abv !== null).map(g => (
            <button key={g.id} className={styles.glassCard} onClick={() => applyGlass(g)}>
              <span className={styles.glassIcon}>{g.icon}</span>
              <span className={styles.glassName}>{g.name}</span>
              <span className={styles.glassMeta}>{g.ml}ml · {g.abv}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* 원액 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>원액 정보</label>
        <div className={styles.itemInputs}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>용량</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="30" value={originalMl} onChange={e => setOriginalMl(e.target.value)} />
              <span className={styles.unit}>ml</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>도수</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="40" value={originalAbv} onChange={e => setOriginalAbv(e.target.value)} />
              <span className={styles.unit}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 희석 재료 선택 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>희석 재료</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 6 }}>
          {DILUTION_OPTIONS.map(d => (
            <button key={d.id}
              className={`${styles.glassCard} ${dilutionId === d.id ? styles.glassCardActive : ''}`}
              onClick={() => setDilutionId(d.id)}>
              <span className={styles.glassName} style={{ fontSize: 13 }}>{d.name}</span>
              <span className={styles.glassDesc}>{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 목표 도수 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>목표 도수</label>
        <div className={styles.inputRow}>
          <input className={`${styles.numInput} ${invalidTarget ? styles.numInputError : ''}`}
            type="number" inputMode="decimal"
            placeholder="7" value={targetAbv} onChange={e => setTargetAbv(e.target.value)} />
          <span className={styles.unit}>%</span>
        </div>
        {invalidTarget && (
          <p className={styles.errorMsg}>목표 도수는 원액({originalAbv}%)보다 낮아야 합니다</p>
        )}
        {!invalidTarget && parseFloat(targetAbv) > 0 && parseFloat(targetAbv) <= dilution.abv && (
          <p className={styles.errorMsg}>희석재료 도수({dilution.abv}%) 이하로는 만들 수 없습니다 (다른 재료 선택)</p>
        )}
      </div>

      {/* 결과 */}
      {result ? (
        <div className={styles.resultCard}>
          <div className={styles.heroRow}>
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>추가할 {dilution.name.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\s*/u, '')}</div>
              <div className={styles.heroNum}>{result.dilutionMl}<span className={styles.heroUnit}>ml</span></div>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>최종 용량</div>
              <div className={styles.heroNum}>{result.totalMl}<span className={styles.heroUnit}>ml</span></div>
            </div>
          </div>
          <div className={styles.alcInfoGrid}>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{alcG}g</div>
              <div className={styles.alcInfoLabel}>순수 알코올 (변하지 않음)</div>
            </div>
            <div className={styles.alcInfoItem}>
              <div className={styles.alcInfoNum}>{result.finalAbv}%</div>
              <div className={styles.alcInfoLabel}>최종 도수</div>
            </div>
          </div>
          <p className={styles.stdNote}>
            원액에 {dilution.name}을(를) {result.dilutionMl}ml 추가하면 약 {fmtMl(result.totalMl)}, 도수 {result.finalAbv}% 음료가 됩니다.
          </p>
        </div>
      ) : (
        <div className={styles.empty}>원액 정보와 목표 도수를 입력하면 희석량이 계산됩니다</div>
      )}

      {/* 다양한 희석재료 비교 */}
      {compareTable && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>같은 원액 → 같은 목표 도수 만들기 비교</label>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>희석재료</th>
                  <th>도수</th>
                  <th style={{ textAlign: 'right' }}>추가량</th>
                  <th style={{ textAlign: 'right' }}>최종</th>
                </tr>
              </thead>
              <tbody>
                {compareTable.map(({ opt, result: r }) => (
                  <tr key={opt.id}>
                    <td>{opt.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{opt.abv}%</td>
                    <td className={styles.num}>{r ? `${r.dilutionMl}ml` : '—'}</td>
                    <td className={styles.num} style={{ color: 'var(--text)' }}>{r ? `${r.totalMl}ml` : '불가'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.stdNote} style={{ marginTop: 8 }}>
            ⚠️ 맥주(4.5%) 등 도수 있는 재료로 희석할 때는 목표 도수가 그 재료 도수보다 높아야 가능합니다.
          </p>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* 탭 3: 같은 알코올량 환산                                       */
/* ────────────────────────────────────────────────────────────── */
function EquivTab() {
  const [glassId, setGlassId] = useState('soju-glass')
  const [qty, setQty] = useState(3)
  const [sex, setSex] = useState<'male' | 'female'>('male')

  const glass = KOREAN_GLASS_PRESETS.find(g => g.id === glassId) ?? KOREAN_GLASS_PRESETS[0]
  const totalMl = glass.ml * qty
  const abv = glass.abv ?? 0
  const calc = calcAlcohol(totalMl, abv)
  const risk = riskLevel(calc.alcoholG, sex)

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <label className={styles.cardLabel}>기준 술 (잔 단위)</label>
        <div className={styles.glassGrid}>
          {KOREAN_GLASS_PRESETS.filter(g => g.abv !== null).map(g => (
            <button key={g.id}
              className={`${styles.glassCard} ${glassId === g.id ? styles.glassCardActive : ''}`}
              onClick={() => setGlassId(g.id)}>
              <span className={styles.glassIcon}>{g.icon}</span>
              <span className={styles.glassName}>{g.name}</span>
              <span className={styles.glassMeta}>{g.ml}ml · {g.abv}%</span>
            </button>
          ))}
        </div>
        <div className={styles.qtyRow}>
          <span className={styles.qtyLabel}>갯수</span>
          <div className={styles.qtyControls}>
            <button className={styles.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span className={styles.qtyValue}>{qty}</span>
            <button className={styles.qtyBtn} onClick={() => setQty(Math.min(50, qty + 1))}>+</button>
          </div>
        </div>
      </div>

      {/* 결과 히어로 */}
      <div className={styles.resultCard}>
        <div className={styles.heroBlock} style={{ marginBottom: 14 }}>
          <div className={styles.heroLabel}>{glass.icon} {glass.name} {qty}잔</div>
          <div className={styles.heroNum}>{calc.alcoholG}<span className={styles.heroUnit}>g</span></div>
          <div className={styles.stdNote} style={{ marginTop: 4 }}>
            ({totalMl}ml × {abv}% = 알코올 {calc.alcoholMl}ml · {calc.standard} 표준잔)
          </div>
        </div>

        <label className={styles.cardLabel}>같은 알코올량을 다른 술로 환산</label>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>술</th>
                <th>도수</th>
                <th style={{ textAlign: 'right' }}>환산량</th>
                <th style={{ textAlign: 'right' }}>{glass.id === 'soju-glass' ? '비교' : '잔'}</th>
              </tr>
            </thead>
            <tbody>
              {EQUIV_TARGETS.map(t => {
                const conv = equivConvert(calc.alcoholG, t)
                return (
                  <tr key={t.name}>
                    <td>{t.emoji} {t.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{t.abv}%</td>
                    <td className={styles.num}>{conv.ml}ml</td>
                    <td className={styles.num} style={{ color: 'var(--text)' }}>{conv.units} {t.unitLabel}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 위험도 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>한국 보건복지부 1일 권장 대비</label>
        <div className={styles.sexToggle} style={{ marginBottom: 12 }}>
          <button className={`${styles.sexBtn} ${sex === 'male' ? styles.sexBtnActive : ''}`}
            onClick={() => setSex('male')}>남성 (32g/일)</button>
          <button className={`${styles.sexBtn} ${sex === 'female' ? styles.sexBtnActive : ''}`}
            onClick={() => setSex('female')}>여성 (16g/일)</button>
        </div>
        <div className={styles.riskCard}>
          <div className={styles.riskHead}>
            <span className={styles.riskLabel} style={{ color: risk.color }}>{risk.label}</span>
            <span className={styles.riskPct} style={{ color: risk.color }}>{risk.pct}%</span>
          </div>
          <div className={styles.riskBar}>
            <div className={styles.riskFill} style={{ width: `${Math.min(100, risk.pct)}%`, background: risk.color }} />
          </div>
          <p className={styles.riskHint}>
            오늘 마신 양이 한국 보건복지부 1일 저위험 음주 기준 ({sex === 'male' ? '남성 4잔(32g)' : '여성 2잔(16g)'})의 {risk.pct}%에 해당.
          </p>
        </div>
        {risk.level === 'high' || risk.level === 'very-high' ? (
          <p className={styles.stdNote} style={{ marginTop: 10, textAlign: 'left', color: '#FF8C3E', lineHeight: 1.7 }}>
            ⚠️ 이 정도 마셨다면: 절대 운전 금지 · 충분한 수분 · 다음날 운전도 자제(혈중알코올 도구 확인) · 카카오 T 대리 1577-1577 / 티맵 대리 1644-3030
          </p>
        ) : null}
      </div>

      {/* 혈중알코올 도구 연결 */}
      <Link href="/tools/health/blood-alcohol" className={styles.linkBanner}>
        <div>
          <div className={styles.linkBannerText}>🚗 음주 후 운전 가능 시각 계산</div>
          <div className={styles.linkBannerSub}>혈중알코올(BAC) 추정 도구로 이동 →</div>
        </div>
        <span className={styles.linkBannerArrow}>→</span>
      </Link>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* 탭 4: 술자리 1인당 분배                                        */
/* ────────────────────────────────────────────────────────────── */
function PartyTab() {
  const [drinks, setDrinks] = useState<{ id: number; presetId: string; qty: number }[]>([
    { id: 1, presetId: 'soju-bottle', qty: 3 },
    { id: 2, presetId: 'beer-can',    qty: 6 },
  ])
  const [people, setPeople] = useState(4)
  const [drinkers, setDrinkers] = useState(4)
  const [sex, setSex] = useState<'male' | 'female'>('male')

  const addDrink = () => {
    const n = Math.max(0, ...drinks.map(d => d.id)) + 1
    setDrinks([...drinks, { id: n, presetId: 'soju-bottle', qty: 1 }])
  }
  const removeDrink = (id: number) => setDrinks(drinks.filter(d => d.id !== id))
  const updateDrink = (id: number, field: 'presetId' | 'qty', val: string | number) =>
    setDrinks(drinks.map(d => d.id === id ? { ...d, [field]: val } : d))

  const totals = useMemo(() => {
    let totalAlcG = 0
    let totalMl = 0
    const rows: { name: string; ml: number; abv: number; alcG: number; qty: number }[] = []
    for (const d of drinks) {
      const preset = KOREAN_GLASS_PRESETS.find(p => p.id === d.presetId)
      if (!preset || preset.abv === null) continue
      const ml = preset.ml * d.qty
      const c = calcAlcohol(ml, preset.abv)
      totalAlcG += c.alcoholG
      totalMl += ml
      rows.push({ name: `${preset.icon} ${preset.name}`, ml: preset.ml, abv: preset.abv, alcG: c.alcoholG, qty: d.qty })
    }
    return { totalAlcG: +totalAlcG.toFixed(1), totalMl, rows }
  }, [drinks])

  const perPerson = drinkers > 0 ? totals.totalAlcG / drinkers : 0
  const perPersonStd = perPerson / STANDARD_DRINK_G
  const perPersonKcal = Math.round(perPerson * 7)
  const risk = riskLevel(perPerson, sex)

  return (
    <div className={styles.tabContent}>
      {/* 술 추가 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>마신 술 (병/캔 단위)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {drinks.map(d => (
            <div key={d.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={d.presetId}
                onChange={e => updateDrink(d.id, 'presetId', e.target.value)}
                style={{
                  flex: 1, background: 'var(--bg3)', color: 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 10px', fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif',
                }}>
                {KOREAN_GLASS_PRESETS.filter(p => p.abv !== null).map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name} ({p.ml}ml, {p.abv}%)</option>
                ))}
              </select>
              <div className={styles.qtyControls}>
                <button className={styles.qtyBtn} onClick={() => updateDrink(d.id, 'qty', Math.max(1, d.qty - 1))}>−</button>
                <span className={styles.qtyValue}>{d.qty}</span>
                <button className={styles.qtyBtn} onClick={() => updateDrink(d.id, 'qty', Math.min(50, d.qty + 1))}>+</button>
              </div>
              {drinks.length > 1 && (
                <button className={styles.removeBtn} onClick={() => removeDrink(d.id)}>×</button>
              )}
            </div>
          ))}
        </div>
        <button className={styles.addBtn} style={{ marginTop: 10 }} onClick={addDrink}>+ 술 추가</button>
      </div>

      {/* 인원·음주자 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>인원 설정</label>
        <div className={styles.partyRow}>
          <div className={styles.partyNumLabel}>
            <span>총 인원</span>
            <div className={styles.qtyControls}>
              <button className={styles.qtyBtn} onClick={() => { const v = Math.max(1, people - 1); setPeople(v); if (drinkers > v) setDrinkers(v) }}>−</button>
              <span className={styles.qtyValue}>{people}</span>
              <button className={styles.qtyBtn} onClick={() => setPeople(Math.min(30, people + 1))}>+</button>
            </div>
          </div>
          <div className={styles.partyNumLabel}>
            <span>음주자만 (비음주자 제외)</span>
            <div className={styles.qtyControls}>
              <button className={styles.qtyBtn} onClick={() => setDrinkers(Math.max(1, drinkers - 1))}>−</button>
              <span className={styles.qtyValue}>{drinkers}</span>
              <button className={styles.qtyBtn} onClick={() => setDrinkers(Math.min(people, drinkers + 1))}>+</button>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 */}
      {totals.rows.length > 0 ? (
        <>
          <div className={styles.resultCard}>
            <div className={styles.heroBlock} style={{ marginBottom: 14 }}>
              <div className={styles.heroLabel}>음주자 1인당 알코올</div>
              <div className={styles.heroNum}>{perPerson.toFixed(1)}<span className={styles.heroUnit}>g</span></div>
              <div className={styles.stdNote} style={{ marginTop: 4 }}>
                = {perPersonStd.toFixed(1)} 표준잔 · {perPersonKcal} kcal
              </div>
            </div>

            <label className={styles.cardLabel}>입력 요약 (총 {totals.totalAlcG}g)</label>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>술</th>
                  <th>갯수</th>
                  <th style={{ textAlign: 'right' }}>총 ml</th>
                  <th style={{ textAlign: 'right' }}>알코올</th>
                </tr>
              </thead>
              <tbody>
                {totals.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{r.qty}</td>
                    <td className={styles.num}>{r.ml * r.qty}</td>
                    <td className={styles.num} style={{ color: 'var(--text)' }}>{r.alcG.toFixed(1)}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 위험도 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>1인당 음주량 위험도</label>
            <div className={styles.sexToggle} style={{ marginBottom: 12 }}>
              <button className={`${styles.sexBtn} ${sex === 'male' ? styles.sexBtnActive : ''}`}
                onClick={() => setSex('male')}>남성 (32g/일)</button>
              <button className={`${styles.sexBtn} ${sex === 'female' ? styles.sexBtnActive : ''}`}
                onClick={() => setSex('female')}>여성 (16g/일)</button>
            </div>
            <div className={styles.riskCard}>
              <div className={styles.riskHead}>
                <span className={styles.riskLabel} style={{ color: risk.color }}>{risk.label}</span>
                <span className={styles.riskPct} style={{ color: risk.color }}>{risk.pct}%</span>
              </div>
              <div className={styles.riskBar}>
                <div className={styles.riskFill} style={{ width: `${Math.min(100, risk.pct)}%`, background: risk.color }} />
              </div>
              <p className={styles.riskHint}>
                1인당 {perPerson.toFixed(1)}g = {sex === 'male' ? '남성' : '여성'} 1일 저위험 음주 기준의 {risk.pct}%.
              </p>
            </div>
            {(risk.level === 'high' || risk.level === 'very-high') && (
              <p className={styles.stdNote} style={{ marginTop: 10, textAlign: 'left', color: '#FF6B6B', lineHeight: 1.7 }}>
                🔴 위험 수준 음주: 절대 운전 X · 다음날 출근 운전도 단속 가능(BAC 잔류) · 일주일 이상 간격 권장 · 카카오 T 대리 1577-1577 / 알코올중독상담 1899-0975
              </p>
            )}
          </div>

          {/* 혈중알코올 연결 */}
          <Link href="/tools/health/blood-alcohol" className={styles.linkBanner}>
            <div>
              <div className={styles.linkBannerText}>🚗 1인당 BAC 추정·운전 가능 시각</div>
              <div className={styles.linkBannerSub}>혈중알코올 도구로 이동 →</div>
            </div>
            <span className={styles.linkBannerArrow}>→</span>
          </Link>
        </>
      ) : (
        <div className={styles.empty}>마신 술을 추가하면 1인당 분배가 계산됩니다</div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* 메인                                                            */
/* ────────────────────────────────────────────────────────────── */
export default function AlcoholClient() {
  const [tab, setTab] = useState<Tab>('mix')

  // 본인 기준 도수 변환 (혼합 탭 하단 보조 도구)
  const [convAlcG, setConvAlcG] = useState('19.2')
  const [convSojuAbv, setConvSojuAbv] = useState(17.5)

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'mix'    && <MixTab />}
      {tab === 'dilute' && <DilutionTab />}
      {tab === 'equiv'  && <EquivTab />}
      {tab === 'party'  && <PartyTab />}

      {/* 본인 기준 도수 변환 (모든 탭 공통) */}
      <div className={styles.card} style={{ marginTop: 8 }}>
        <label className={styles.cardLabel}>🍶 본인 기준 도수로 변환 (알코올 g → 잔/병)</label>
        <div className={styles.itemInputs} style={{ marginBottom: 12 }}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>알코올 양</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="19.2" value={convAlcG} onChange={e => setConvAlcG(e.target.value)} />
              <span className={styles.unit}>g</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>본인 소주 도수</label>
            <div className={styles.sliderRow}>
              <input type="range" min="14" max="25" step="0.5" value={convSojuAbv}
                className={styles.slider}
                onChange={e => setConvSojuAbv(parseFloat(e.target.value))} />
              <span className={styles.sliderValue}>{convSojuAbv}%</span>
            </div>
          </div>
        </div>
        {parseFloat(convAlcG) > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>술</th>
                  <th>도수</th>
                  <th style={{ textAlign: 'right' }}>환산량</th>
                  <th style={{ textAlign: 'right' }}>병/캔 환산</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: '🍶 소주', abv: convSojuAbv, bottle: 360 },
                  { name: '🍺 맥주 (4.5%)', abv: 4.5, bottle: 500 },
                  { name: '🥣 막걸리 (6%)', abv: 6, bottle: 750 },
                  { name: '🍷 와인 (13%)', abv: 13, bottle: 750 },
                  { name: '🥃 위스키 (40%)', abv: 40, bottle: 700 },
                ].map((r, i) => {
                  const ml = (parseFloat(convAlcG) / ALCOHOL_DENSITY) * (100 / r.abv)
                  const bottles = ml / r.bottle
                  return (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{r.abv}%</td>
                      <td className={styles.num}>{Math.round(ml)}ml</td>
                      <td className={styles.num} style={{ color: 'var(--text)' }}>{bottles.toFixed(2)}병</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className={styles.stdNote} style={{ marginTop: 8 }}>
              ※ 한국 소주 도수: 진로 이즈백 16% · 처음처럼 16.5~16.9% · 진로 17.5% · 한라산 25%. 라벨 확인 후 슬라이더 조정.
            </p>
          </div>
        )}
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>주요 한국 소주 브랜드 도수 보기</summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {SOJU_BRANDS.map(b => (
              <span key={b.brand} style={{ fontSize: 11, background: 'var(--bg3)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 6, color: 'var(--muted)' }}>
                {b.brand} <strong style={{ color: 'var(--accent)' }}>{b.abv}%</strong>
              </span>
            ))}
          </div>
        </details>
      </div>

      {/* 면책 */}
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, padding: '12px 16px', background: 'var(--bg2)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 10, lineHeight: 1.7 }}>
        ⚠️ 본 도구는 음주를 권장하지 않으며, 본인 음주량 인지·관리 보조용입니다. 임산부·수유 중·미성년자는 절대 음주 금지. 약물 복용 중 음주는 의사 상담 필수. 음주 후 운전 절대 금지. WHO(2023): &ldquo;알코올 섭취량에 안전한 수준은 없다.&rdquo; 도움이 필요하면 한국알코올중독상담센터 <strong style={{ color: '#FF8C3E' }}>1899-0975</strong>, 정신건강 위기상담 <strong style={{ color: '#FF8C3E' }}>1577-0199</strong>, 카카오 T 대리 <strong style={{ color: '#FF8C3E' }}>1577-1577</strong>.
      </p>
    </div>
  )
}
