'use client'

import { useState, useMemo } from 'react'
import styles from './ramen.module.css'
import {
  RAMEN_TYPES,
  MULTI_RAMEN_ADJUSTMENT,
  BROTH_STRENGTH,
  NOODLE_TEXTURE,
  TOPPINGS,
  RAMEN_NUTRITION_DEFAULT,
  WHO_DAILY_SODIUM,
  calcRamen,
  formatTime,
  formatWater,
  type RamenType,
} from './ramenUtils'

type TabId = 'main' | 'topping' | 'preset' | 'nutrition'

const QUICK_RAMEN_IDS = ['shin', 'jin', 'ansung', 'neoguri', 'jjapaghetti', 'buldak', 'bibim']

export default function RamenClient() {
  const [tab, setTab] = useState<TabId>('main')

  // 입력 상태
  const [ramenId, setRamenId] = useState('shin')
  const [count, setCount] = useState(1)
  const [brothId, setBrothId] = useState('normal')
  const [textureId, setTextureId] = useState('firm')
  const [toppings, setToppings] = useState<string[]>([])

  const result = useMemo(() => calcRamen({
    ramenId, count, brothStrengthId: brothId, textureId, toppings,
  }), [ramenId, count, brothId, textureId, toppings])

  const ramen = RAMEN_TYPES.find(r => r.id === ramenId)
  const quickRamens = QUICK_RAMEN_IDS.map(id => RAMEN_TYPES.find(r => r.id === id)).filter(Boolean) as RamenType[]

  const toggleTopping = (id: string) => {
    setToppings(toppings.includes(id) ? toppings.filter(t => t !== id) : [...toppings, id])
  }

  // 카테고리별 라면 그룹화 (탭3)
  const presetGroups = useMemo(() => {
    const groups: Record<string, { emoji: string; ramens: RamenType[] }> = {
      '🌶️ 매운 국물':   { emoji: '🌶️', ramens: [] },
      '🍲 구수한 국물': { emoji: '🍲', ramens: [] },
      '⚫ 짜장 (물 빼기)': { emoji: '⚫', ramens: [] },
      '🔥 볶음 (물 빼기)': { emoji: '🔥', ramens: [] },
      '❄️ 비빔 (찬물 헹굼)': { emoji: '❄️', ramens: [] },
      '🥤 컵라면':      { emoji: '🥤', ramens: [] },
    }
    for (const r of RAMEN_TYPES) {
      if (r.type === 'broth') {
        if (r.category.includes('매운') || r.category.includes('해물')) groups['🌶️ 매운 국물'].ramens.push(r)
        else groups['🍲 구수한 국물'].ramens.push(r)
      } else if (r.type === 'jjajang') groups['⚫ 짜장 (물 빼기)'].ramens.push(r)
      else if (r.type === 'stir') groups['🔥 볶음 (물 빼기)'].ramens.push(r)
      else if (r.type === 'cold') groups['❄️ 비빔 (찬물 헹굼)'].ramens.push(r)
      else if (r.type === 'cup') groups['🥤 컵라면'].ramens.push(r)
    }
    return groups
  }, [])

  const [copied, setCopied] = useState(false)
  const copyResult = () => {
    if (!result) return
    const toppingNames = result.toppingTimeline.map(t => t.topping).join(', ')
    const text = [
      `🍜 ${ramen!.name} ${count}개 권장 물양`,
      `${formatWater(result.recommendedWater)} (${formatWater(result.rangeMin)}~${formatWater(result.rangeMax)})`,
      `⏱️ 조리 ${formatTime(result.cookTimeSeconds)}`,
      `🍲 ${result.potDesc}`,
      toppingNames && `🥢 토핑: ${toppingNames}`,
      `🔥 칼로리 ${result.totalKcal.toLocaleString()}kcal · 나트륨 ${(result.totalSodium/1000).toFixed(1)}g`,
      `\nyoutil.kr 라면 물양 계산기`,
    ].filter(Boolean).join('\n')
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.disclaimer}>
        🍜 <strong>본 도구의 권장 물양은 일반 가이드</strong>입니다. 라면 브랜드·생산 시기·냄비·화력·고도·습도·취향에 따라 다를 수 있으며,
        봉지 권장량과 차이날 수 있습니다. <strong>본인 취향에 맞게 조정 권장</strong>.
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {[
          { id: 'main',      label: '💧 물양 계산',  cls: styles.tabActive },
          { id: 'topping',   label: '🥢 토핑·시간',  cls: styles.tabActiveTopping },
          { id: 'preset',    label: '🍜 라면 프리셋', cls: styles.tabActivePreset },
          { id: 'nutrition', label: '💪 영양 정보',  cls: styles.tabActiveNutrition },
        ].map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? t.cls : ''}`}
            onClick={() => setTab(t.id as TabId)}
          >{t.label}</button>
        ))}
      </div>

      {/* ──────────── TAB 1: 물양 계산 ──────────── */}
      {tab === 'main' && (
        <>
          {/* 라면 빠른 선택 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              라면 종류
              <span className={styles.cardLabelHint}>※ 「라면 프리셋」 탭에서 15종 모두 보기</span>
            </div>
            <div className={styles.quickGrid}>
              {quickRamens.map(r => (
                <button key={r.id}
                  className={`${styles.quickBtn} ${ramenId === r.id ? styles.quickBtnActive : ''}`}
                  onClick={() => setRamenId(r.id)}>
                  <span className={styles.quickBtnEmoji}>{r.emoji}</span>
                  <div className={styles.quickBtnName}>{r.name}</div>
                  <div className={styles.quickBtnDesc}>{r.baseWater}ml · {formatTime(r.cookTime)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 라면 개수 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>라면 개수</div>
            <div className={styles.countGrid}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n}
                  className={`${styles.countBtn} ${count === n ? styles.countBtnActive : ''}`}
                  onClick={() => setCount(n)}>
                  <div className={styles.countBtnNum}>{n}</div>
                  <div className={styles.countBtnLabel}>{n}개</div>
                </button>
              ))}
            </div>
            {count >= 2 && (
              <div className={styles.cardLabelHint} style={{ marginTop: 8 }}>
                ※ {MULTI_RAMEN_ADJUSTMENT.find(m => m.count === count)?.desc ?? `${count}개`}
              </div>
            )}
          </div>

          {/* 국물 농도 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>국물 농도</div>
            <div className={styles.brothRow}>
              {BROTH_STRENGTH.map(b => (
                <button key={b.id}
                  className={`${styles.brothBtn} ${brothId === b.id ? styles.brothBtnActive : ''}`}
                  onClick={() => setBrothId(b.id)}
                  style={brothId === b.id ? { background: `${b.color}15`, borderColor: b.color, color: b.color } : {}}>
                  <div className={styles.brothBtnLabel}>{b.name}</div>
                  <div className={styles.brothBtnDelta}>
                    {b.delta === 0 ? '기준' : b.delta > 0 ? `+${b.delta}ml/개` : `${b.delta}ml/개`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 면 익힘 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>면 익힘 정도</div>
            <div className={styles.brothRow}>
              {NOODLE_TEXTURE.map(t => (
                <button key={t.id}
                  className={`${styles.brothBtn} ${textureId === t.id ? styles.brothBtnActive : ''}`}
                  onClick={() => setTextureId(t.id)}
                  style={textureId === t.id ? { background: 'var(--accent-dim)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
                  <div className={styles.brothBtnLabel}>{t.name}</div>
                  <div className={styles.brothBtnDelta}>
                    {t.timeDelta === 0 ? '기준' : t.timeDelta > 0 ? `+${t.timeDelta}초` : `${t.timeDelta}초`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 토핑 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              토핑 (선택, 다중 가능)
              <span className={styles.cardLabelHint}>{toppings.length}/16 선택</span>
            </div>
            <div className={styles.toppingGrid}>
              {TOPPINGS.map(t => {
                const active = toppings.includes(t.id)
                return (
                  <button key={t.id}
                    className={`${styles.toppingBtn} ${active ? styles.toppingBtnActive : ''}`}
                    onClick={() => toggleTopping(t.id)}>
                    {active && <span className={styles.toppingBtnCheck}>✓</span>}
                    <span className={styles.toppingBtnEmoji}>{t.emoji}</span>
                    <div className={styles.toppingBtnName}>{t.name}</div>
                    <div className={styles.toppingBtnInfo}>
                      {t.waterDelta > 0 ? `+${t.waterDelta}ml` : t.waterDelta < 0 ? `${t.waterDelta}ml` : '0ml'}
                      {' · '}+{t.kcal}kcal
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 결과 */}
          {result && (
            <>
              {/* 히어로 */}
              <div className={`${styles.hero} ${styles.heroAccent}`}>
                <div className={styles.heroLabel}>권장 물양</div>
                <div className={styles.heroNum}>{formatWater(result.recommendedWater)}</div>
                <div className={styles.heroSub}>
                  {ramen!.emoji} {ramen!.name} {count}개 · {BROTH_STRENGTH.find(b=>b.id===brothId)?.name} · {NOODLE_TEXTURE.find(t=>t.id===textureId)?.name}
                </div>
                <div className={styles.heroRange}>
                  범위 {formatWater(result.rangeMin)} ~ {formatWater(result.rangeMax)}
                </div>
              </div>

              {/* 다개수 비교 (count >= 2일 때만) */}
              {count >= 2 && (
                <div className={styles.card}>
                  <div className={styles.cardLabel}>1개 기준 대비 비교</div>
                  <div className={styles.compareBox}>
                    <div className={`${styles.compareRow} ${styles.compareRowBad}`}>
                      <span>단순 ×{count} (싱거움 X)</span>
                      <span>{formatWater(ramen!.baseWater * count)}</span>
                    </div>
                    <div className={`${styles.compareRow} ${styles.compareRowGood}`}>
                      <span>권장 ({result.multiplier.toFixed(2)}배)</span>
                      <span>{formatWater(result.recommendedWater)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 짜장·볶음·비빔 안내 */}
              {result.drainAdvice && (
                <div className={styles.adviceBox}>
                  <strong>{ramen!.emoji} 조리 안내:</strong> {result.drainAdvice}
                </div>
              )}

              {/* 4 메트릭 */}
              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>조리 시간</div>
                  <div className={`${styles.metricValue} ${styles.metricValueAccent}`}>{formatTime(result.cookTimeSeconds)}</div>
                  <div className={styles.metricSub}>물 끓이기 후 면 투입 기준</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>권장 냄비</div>
                  <div className={styles.metricValue}>{result.potDiameter}cm</div>
                  <div className={styles.metricSub}>{result.potDesc}</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>총 칼로리</div>
                  <div className={`${styles.metricValue} ${result.totalKcal > 1500 ? styles.metricValueRed : ''}`}>
                    {result.totalKcal.toLocaleString()} kcal
                  </div>
                  <div className={styles.metricSub}>한 끼 권장 ~700kcal</div>
                </div>
                <div className={styles.metric}>
                  <div className={styles.metricLabel}>총 나트륨</div>
                  <div className={`${styles.metricValue} ${result.totalSodium > WHO_DAILY_SODIUM ? styles.metricValueRed : styles.metricValueOrange}`}>
                    {(result.totalSodium / 1000).toFixed(1)} g
                  </div>
                  <div className={styles.metricSub}>WHO 권장 {Math.round(result.totalSodium / WHO_DAILY_SODIUM * 100)}%</div>
                </div>
              </div>

              {/* 조리 타임라인 */}
              <div className={styles.card}>
                <div className={styles.cardLabel}>🕐 조리 단계 타임라인 (면 투입 기준)</div>
                <div className={styles.timelineList}>
                  <div className={styles.timelineRow}>
                    <span className={styles.timelineTime}>-5:00</span>
                    <span className={styles.timelineEmoji}>🔥</span>
                    <div>
                      <div className={styles.timelineLabel}>물 끓이기 시작</div>
                      <div className={styles.timelineNote}>{result.potDiameter}cm 냄비에 {formatWater(result.recommendedWater)} 투입</div>
                    </div>
                  </div>
                  {result.toppingTimeline.filter(t => t.offsetSec < 0).map((t, i) => (
                    <div key={`pre-${i}`} className={styles.timelineRow}>
                      <span className={styles.timelineTime}>{t.offsetSec}초</span>
                      <span className={styles.timelineEmoji}>{t.emoji}</span>
                      <div>
                        <div className={styles.timelineLabel}>{t.topping} 추가</div>
                        <div className={styles.timelineNote}>{t.addAt}{t.note ? ` · ${t.note}` : ''}</div>
                      </div>
                    </div>
                  ))}
                  <div className={styles.timelineRow} style={{ background: 'rgba(200,255,62,0.06)', borderColor: 'rgba(200,255,62,0.3)' }}>
                    <span className={styles.timelineTime}>0:00</span>
                    <span className={styles.timelineEmoji}>🍜</span>
                    <div>
                      <div className={styles.timelineLabel}>면·스프 투입</div>
                      <div className={styles.timelineNote}>물 끓을 때 동시 투입</div>
                    </div>
                  </div>
                  {result.toppingTimeline.filter(t => t.offsetSec >= 0 && t.offsetSec < result.cookTimeSeconds).map((t, i) => (
                    <div key={`mid-${i}`} className={styles.timelineRow}>
                      <span className={styles.timelineTime}>+{Math.floor(t.offsetSec / 60)}:{String(t.offsetSec % 60).padStart(2, '0')}</span>
                      <span className={styles.timelineEmoji}>{t.emoji}</span>
                      <div>
                        <div className={styles.timelineLabel}>{t.topping} 추가</div>
                        <div className={styles.timelineNote}>{t.addAt}{t.note ? ` · ${t.note}` : ''}</div>
                      </div>
                    </div>
                  ))}
                  <div className={`${styles.timelineRow} ${styles.timelineRowFinal}`}>
                    <span className={styles.timelineTime}>+{formatTime(result.cookTimeSeconds)}</span>
                    <span className={styles.timelineEmoji}>✨</span>
                    <div>
                      <div className={styles.timelineLabel}>완성</div>
                      <div className={styles.timelineNote}>
                        {result.isStirOrCold ? '물 빼기 후 비빔/볶기' : '그릇에 옮겨 토핑 마무리'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 경고 */}
              {result.warnings.length > 0 && (
                <div className={styles.warnBox}>
                  <strong>⚠️ 주의:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--muted)' }}>
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* 액션 */}
              <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={copyResult}>
                {copied ? '✓ 복사 완료' : '📋 결과 복사 (카톡 공유)'}
              </button>
              <div className={styles.actionGrid}>
                <button className={styles.actionBtn} onClick={() => setTab('topping')}>🥢 토핑·시간 자세히</button>
                <button className={styles.actionBtn} onClick={() => setTab('preset')}>🍜 라면 15종 보기</button>
                <button className={styles.actionBtn} onClick={() => setTab('nutrition')}>💪 영양 정보</button>
              </div>
            </>
          )}

          {!result && (
            <div className={styles.empty}>라면을 선택해주세요.</div>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 토핑·시간 ──────────── */}
      {tab === 'topping' && (
        <>
          <div className={styles.infoBox}>
            💡 <strong>토핑별 물양 보정 + 투입 타이밍</strong>을 한 번에 확인. 메인 탭에서 선택한 토핑은 자동 반영됩니다.
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>🥢 토핑별 영향 (전체 16종)</div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.nutritionTable}>
                <thead>
                  <tr>
                    <th>토핑</th>
                    <th>물양 보정</th>
                    <th>칼로리</th>
                    <th>단백질</th>
                    <th>투입 타이밍</th>
                  </tr>
                </thead>
                <tbody>
                  {TOPPINGS.map(t => (
                    <tr key={t.id} style={toppings.includes(t.id) ? { background: 'rgba(200,255,62,0.06)' } : {}}>
                      <td>{t.emoji} {t.name}</td>
                      <td style={{ color: t.waterDelta > 0 ? '#FF8C3E' : t.waterDelta < 0 ? '#3EC8FF' : 'var(--muted)' }}>
                        {t.waterDelta === 0 ? '0' : t.waterDelta > 0 ? `+${t.waterDelta}` : t.waterDelta}ml
                      </td>
                      <td style={{ color: '#FF8C3E' }}>+{t.kcal}</td>
                      <td>{t.protein ?? 0}g</td>
                      <td style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 11.5 }}>{t.timeAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>⏱️ 면 익힘 정도별 시간</div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.nutritionTable}>
                <thead>
                  <tr>
                    <th>익힘</th>
                    <th>봉지 대비</th>
                    <th>설명</th>
                  </tr>
                </thead>
                <tbody>
                  {NOODLE_TEXTURE.map(t => {
                    const active = textureId === t.id
                    return (
                      <tr key={t.id} style={active ? { background: 'var(--accent-dim)' } : {}}>
                        <td style={active ? { color: 'var(--accent)' } : {}}>
                          {t.name}{active && ' ⭐'}
                        </td>
                        <td>
                          {t.timeDelta === 0 ? '기준' : t.timeDelta > 0 ? `+${t.timeDelta}초` : `${t.timeDelta}초`}
                        </td>
                        <td style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 11.5 }}>{t.desc}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.adviceBox}>
            <strong>💡 토핑 추천 조합:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--muted)' }}>
              <li>🥚 계란 + 🌿 대파 — 한국 표준 (영양·풍미)</li>
              <li>🍡 떡 + 🥟 만두 — 떡만두라면 (포만감 ↑)</li>
              <li>🌱 콩나물 + 🌶️ 김치 — 해장라면 (속풀이)</li>
              <li>🧀 치즈 + 🥫 스팸 — 부대찌개 스타일 (단, 짜게 X)</li>
              <li>⬜ 순두부 + 🌱 콩나물 — 건강식 (저칼로리)</li>
            </ul>
          </div>
        </>
      )}

      {/* ──────────── TAB 3: 라면 프리셋 ──────────── */}
      {tab === 'preset' && (
        <>
          <div className={styles.infoBox}>
            💡 <strong>한국 인기 라면 15종</strong> — 카드 클릭 시 메인 탭으로 자동 입력. 짜장·볶음·비빔면은 일반 라면과 조리법이 다르니 안내 참고.
          </div>

          <div className={styles.presetSection}>
            {Object.entries(presetGroups).map(([title, group]) => group.ramens.length > 0 && (
              <div key={title} className={styles.presetCategory}>
                <div className={styles.presetCategoryTitle}>{title}</div>
                <div className={styles.presetGrid}>
                  {group.ramens.map(r => (
                    <button key={r.id}
                      className={`${styles.presetCard} ${ramenId === r.id ? styles.presetCardActive : ''}`}
                      onClick={() => { setRamenId(r.id); setTab('main') }}>
                      <div className={styles.presetCardName}>
                        <span>{r.emoji}</span>{r.name}
                      </div>
                      <div className={styles.presetCardSpec}>{r.baseWater}ml · {formatTime(r.cookTime)}</div>
                      <div className={styles.presetCardBrand}>{r.brand}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.adviceBox}>
            <strong>💡 짜장·볶음·비빔면 조리법 (일반 라면과 다름):</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--muted)' }}>
              <li><strong style={{ color: '#FFD700' }}>짜파게티</strong>: 600ml로 끓인 후 물 8큰술(120ml) 남기고 따라낸 뒤 분말스프 + 올리브유 비빔</li>
              <li><strong style={{ color: '#FFD700' }}>불닭볶음면</strong>: 600ml로 끓인 후 물 8큰술 남기고 따라낸 뒤 액상소스 + 후레이크 + 김 비빔</li>
              <li><strong style={{ color: '#FFD700' }}>비빔면</strong>: 600ml로 면만 익힌 뒤 물 전부 따라내고 찬물 헹굼 → 비빔장 비빔</li>
            </ul>
          </div>
        </>
      )}

      {/* ──────────── TAB 4: 영양 정보 ──────────── */}
      {tab === 'nutrition' && result && (
        <>
          <div className={styles.infoBox}>
            💡 <strong>현재 입력값 기준 영양 정보</strong> — 라면 + 토핑 합계, WHO 권장량 대비 표시.
          </div>

          <div className={`${styles.hero} ${styles.heroCyan}`}>
            <div className={styles.heroLabel}>오늘 라면 영양</div>
            <div className={`${styles.heroNum} ${styles.heroNumCyan}`} style={{ fontSize: 'clamp(28px, 6vw, 48px)' }}>
              {result.totalKcal.toLocaleString()} kcal
            </div>
            <div className={styles.heroSub}>
              {ramen!.name} {count}개 + 토핑 {toppings.length}개
            </div>
            <div className={styles.heroDesc}>
              한 끼 권장(700kcal)의 {Math.round(result.totalKcal / 700 * 100)}% · 1일 권장(2,000kcal)의 {Math.round(result.totalKcal / 2000 * 100)}%
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>📊 라면 1봉 평균 영양 (참고)</div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.nutritionTable}>
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>1봉</th>
                    <th>오늘 합계</th>
                    <th>WHO/권장 대비</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🔥 칼로리</td>
                    <td>{RAMEN_NUTRITION_DEFAULT.kcal} kcal</td>
                    <td style={result.totalKcal > 1500 ? { color: '#FF6B6B' } : {}}>{result.totalKcal.toLocaleString()} kcal</td>
                    <td>{Math.round(result.totalKcal / 2000 * 100)}% (성인)</td>
                  </tr>
                  <tr>
                    <td>🧂 나트륨</td>
                    <td>{RAMEN_NUTRITION_DEFAULT.sodium.toLocaleString()} mg</td>
                    <td className={styles.warnCell}>{result.totalSodium.toLocaleString()} mg</td>
                    <td style={result.totalSodium > WHO_DAILY_SODIUM ? { color: '#FF6B6B' } : { color: '#FF8C3E' }}>
                      {Math.round(result.totalSodium / WHO_DAILY_SODIUM * 100)}% ⚠️
                    </td>
                  </tr>
                  <tr>
                    <td>💪 단백질</td>
                    <td>{RAMEN_NUTRITION_DEFAULT.protein} g</td>
                    <td>{result.totalProtein} g</td>
                    <td>{Math.round(result.totalProtein / 50 * 100)}%</td>
                  </tr>
                  <tr>
                    <td>🍳 지방</td>
                    <td>{RAMEN_NUTRITION_DEFAULT.fat} g</td>
                    <td>{(RAMEN_NUTRITION_DEFAULT.fat * count)} g</td>
                    <td>{Math.round(RAMEN_NUTRITION_DEFAULT.fat * count / 65 * 100)}%</td>
                  </tr>
                  <tr>
                    <td>🍞 탄수화물</td>
                    <td>{RAMEN_NUTRITION_DEFAULT.carb} g</td>
                    <td>{(RAMEN_NUTRITION_DEFAULT.carb * count)} g</td>
                    <td>{Math.round(RAMEN_NUTRITION_DEFAULT.carb * count / 300 * 100)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>📊 나트륨 진행 막대 (WHO 일일 권장 2g 기준)</div>
            <div className={styles.nutritionBar}>
              <div className={result.totalSodium > WHO_DAILY_SODIUM ? styles.nutritionBarFillDanger : styles.nutritionBarFillWarn}
                style={{ width: `${Math.min(100, result.totalSodium / WHO_DAILY_SODIUM * 100)}%` }} />
            </div>
            <div className={styles.cardLabelHint} style={{ marginTop: 6, textAlign: 'right' }}>
              {(result.totalSodium / 1000).toFixed(1)}g / 2.0g ({Math.round(result.totalSodium / WHO_DAILY_SODIUM * 100)}%)
            </div>
          </div>

          <div className={styles.adviceBox}>
            <strong>💡 라면 건강하게 먹는 팁:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--muted)' }}>
              <li>국물 다 먹지 X — 나트륨 약 50% 줄임</li>
              <li>단백질 토핑 추가 (계란·만두·콩) — 영양 균형</li>
              <li>채소 토핑 (콩나물·대파·양파) — 비타민 보충</li>
              <li>다음 끼 싱겁게 (소금 X) · 물 충분히 (2L+)</li>
              <li>칼륨 풍부 식품 (바나나·시금치) — 나트륨 배출 도움</li>
              <li>일주일 1~2회 권장 — 매일 X</li>
            </ul>
          </div>

          <div className={styles.actionGrid}>
            <a href="/tools/health/bmr" className={styles.actionBtn}>💪 BMR 계산기 (1일 권장 칼로리)</a>
            <a href="/tools/health/bmi" className={styles.actionBtn}>📊 BMI 계산기</a>
            <a href="/tools/cooking/serving" className={styles.actionBtn}>🍽️ 1인분 분량 계산기</a>
          </div>

          <div className={styles.warnBox}>
            <strong>⚠️ 라면은 가끔의 즐거움입니다.</strong> 매일 먹으면 나트륨·포화지방 누적으로 고혈압·신장 부담·영양 불균형 위험.
            칼로리·체중 관리 중이라면 BMR 계산기로 1일 권장 칼로리 확인 권장.
          </div>
        </>
      )}

      {tab === 'nutrition' && !result && (
        <div className={styles.empty}>먼저 「물양 계산」 탭에서 라면을 선택해주세요.</div>
      )}
    </div>
  )
}
