'use client'

import { useMemo, useState } from 'react'
import s from './fart-risk.module.css'
import {
  FOOD_DATA, CATEGORIES, CAUSE_TYPES, CONDITIONS, FODMAP_ALTERNATIVES,
  SYMPTOM_RESPONSES, RED_FLAGS, PORTIONS,
  calcFartScore,
  type CondKey, type SymptomKey, type Portion,
} from './fartRiskUtils'

type TabId = 'main' | 'alt' | 'symptom'

const TABS: { id: TabId; label: string }[] = [
  { id: 'main',    label: '오늘 점수' },
  { id: 'alt',     label: '대체 음식' },
  { id: 'symptom', label: '증상 대처' },
]

export default function FartRiskClient() {
  const [tab, setTab] = useState<TabId>('main')

  return (
    <div className={s.wrap}>
      <div className={s.tabs} role="tablist" aria-label="방귀 위험도 도구 모드">
        {TABS.map(t => (
          <button key={t.id} type="button" role="tab" id={`fr-tab-${t.id}`} aria-controls={`fr-panel-${t.id}`} aria-selected={tab === t.id}
            className={`${s.tabBtn} ${tab === t.id ? s.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭을 모두 마운트한 채 숨김 토글 — 전환해도 선택·결과 유지 */}
      <div role="tabpanel" id="fr-panel-main"    aria-labelledby="fr-tab-main"    hidden={tab !== 'main'}><MainTab /></div>
      <div role="tabpanel" id="fr-panel-alt"     aria-labelledby="fr-tab-alt"     hidden={tab !== 'alt'}><AlternativeTab /></div>
      <div role="tabpanel" id="fr-panel-symptom" aria-labelledby="fr-tab-symptom" hidden={tab !== 'symptom'}><SymptomTab /></div>

      {/* 면책 (모든 탭 공통, 강화) */}
      <div className={s.disclaimerCard}>
        <p className={s.disclaimerTitle}>⚠️ 본 도구는 재미·교육용 참고 도구입니다</p>
        <p className={s.disclaimerBody}>
          의학적 진단·처방·치료 도구가 아닙니다. 모든 점수는 추정이며 개인 체질에 따라 다릅니다.
          IBS·유당불내증·SIBO·셀리악 의심 시 영양사·소화기내과 전문의 상담 권장.
        </p>
        <p className={s.disclaimerBody} style={{ marginTop: 8 }}>
          ⚠️ <strong>다음 증상 시 즉시 의료 상담</strong>: 혈변·검은 변 / 갑작스러운 체중 감소 / 심한 복통(한밤중) / 발열·구토 반복 / 1주+ 지속 변비·설사 / 임산부.
        </p>
        <p className={s.disclaimerBody} style={{ marginTop: 8 }}>
          📞 <strong>도움</strong>: 보건복지상담센터 <strong style={{ color: '#EA580C' }}>129</strong> · 질병관리청 건강상담 <strong style={{ color: '#EA580C' }}>1339</strong> · 응급 <strong style={{ color: '#EA580C' }}>119</strong> · 소화기내과 직접 방문.
        </p>
      </div>
    </div>
  )
}

/* ──────────────────────── 탭 1: 오늘 점수 ──────────────────────── */
function MainTab() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [conds, setConds] = useState<Set<CondKey>>(new Set())
  const [portion, setPortion] = useState<Portion>('normal')
  const [copied, setCopied] = useState(false)

  const toggleFood = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }
  const toggleCond = (k: CondKey) => {
    setConds(prev => {
      const n = new Set(prev)
      if (n.has(k)) n.delete(k); else n.add(k)
      return n
    })
  }
  const reset = () => { setSelected(new Set()); setConds(new Set()); setPortion('normal'); setCopied(false) }

  const result = useMemo(() => calcFartScore(Array.from(selected), conds, portion), [selected, conds, portion])

  const handleShare = async () => {
    if (!result) return
    const types = result.primaryTypes.map(p => CAUSE_TYPES[p.type].name).join(' + ')
    const text = `오늘 내 가스 리스크: ${result.total}점 (${result.riskLabel})\n` +
      `💨 가스량 ${result.gas} · 🦨 냄새 ${result.smell} · 🎈 팽만 ${result.bloat}\n` +
      `🫧 조합: ${types || '단순'}\n` +
      `youtil.kr/tools/life/fart-risk`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }

  return (
    <>
      {/* 음식 */}
      <div className={s.card}>
        <span className={s.cardLabel}>오늘 먹은 음식 (복수 선택)</span>
        {CATEGORIES.map(cat => (
          <div key={cat.id} className={s.catGroup}>
            <div className={s.catHead}>{cat.label}</div>
            <div className={s.foodGrid}>
              {cat.ids.map(id => {
                const f = FOOD_DATA.find(x => x.id === id)
                if (!f) return null
                const on = selected.has(id)
                return (
                  <button key={id} type="button" aria-pressed={on}
                    className={`${s.foodBtn} ${on ? s.foodActive : ''}`}
                    onClick={() => toggleFood(id)}>
                    <span className={s.foodEmoji} aria-hidden="true">{f.emoji}</span>
                    <span>{f.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 섭취량 */}
      <div className={s.card}>
        <span className={s.cardLabel}>섭취량 (전체적으로)</span>
        <div className={s.portionRow} role="group" aria-label="섭취량">
          {PORTIONS.map(p => (
            <button key={p.key} type="button" aria-pressed={portion === p.key}
              className={`${s.portionBtn} ${portion === p.key ? s.portionActive : ''}`}
              onClick={() => setPortion(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
        <p className={s.altHint}>같은 음식도 한 입과 한 대접은 다릅니다 — 대략적인 양을 고르면 점수에 반영됩니다.</p>
      </div>

      {/* 조건 */}
      <div className={s.card}>
        <span className={s.cardLabel}>추가 조건</span>
        <div className={s.condGrid}>
          {CONDITIONS.map(c => {
            const on = conds.has(c.key)
            return (
              <label key={c.key} className={`${s.condItem} ${on ? s.condActive : ''}`}>
                <input type="checkbox" className={s.condCheck}
                  checked={on} onChange={() => toggleCond(c.key)} />
                <span className={s.condLabel}>{c.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 결과 */}
      {!result ? (
        <div className={s.empty}>음식을 선택하거나 조건을 체크하면 점수가 계산됩니다.</div>
      ) : (
        <>
          {/* 히어로 */}
          <div className={s.heroCard} role="status" aria-live="polite" style={{ borderColor: result.riskColor + 'aa', background: result.riskColor + '14' }}>
            <div className={s.heroLabel}>오늘의 가스 리스크</div>
            <div className={s.heroScore} style={{ color: result.riskColor }}>{result.total}<span className={s.heroUnit}>점</span></div>
            <div className={s.heroRiskBadge} style={{ color: result.riskColor, borderColor: result.riskColor + '55' }}>
              {result.riskLabel}
            </div>
          </div>

          {/* 3축 점수 */}
          <div className={s.card}>
            <span className={s.cardLabel}>3축 점수</span>
            {[
              { label: '💨 가스량',    val: result.gas,   color: '#0EA5E9' },
              { label: '🦨 냄새',      val: result.smell, color: '#E11D48' },
              { label: '🎈 복부팽만',  val: result.bloat, color: '#0891B2' },
            ].map((g, i) => (
              <div key={i} className={s.gaugeRow}>
                <div className={s.gaugeLabel}>
                  <span>{g.label}</span>
                  <span className={s.gaugeVal} style={{ color: g.color }}>{g.val}점</span>
                </div>
                <div className={s.gaugeBar}>
                  <div className={s.gaugeFill} style={{ width: `${g.val}%`, background: g.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* 원인 유형 */}
          {result.primaryTypes.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>오늘의 원인 유형 TOP {result.primaryTypes.length}</span>
              <div className={s.causeList}>
                {result.primaryTypes.map(p => {
                  const ct = CAUSE_TYPES[p.type]
                  return (
                    <div key={p.type} className={s.causeCard} style={{ borderColor: ct.color + '55' }}>
                      <span className={s.causeIcon} aria-hidden="true">{ct.icon}</span>
                      <div>
                        <div className={s.causeName} style={{ color: ct.color }}>{ct.name}</div>
                        <div className={s.causeDesc}>{ct.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 음식 TOP 3 */}
          {result.topFoods.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>원인 음식 TOP {result.topFoods.length}</span>
              <div className={s.topList}>
                {result.topFoods.map((f, i) => (
                  <div key={f.id} className={s.topRow}>
                    <span className={`${s.topRank} ${i === 0 ? s.rank1 : i === 1 ? s.rank2 : s.rank3}`} aria-hidden="true">{i + 1}</span>
                    <span className={s.topEmoji} aria-hidden="true">{f.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={s.topName}>{f.name}</div>
                      <div className={s.topReason}>{f.causeTypes.map(t => CAUSE_TYPES[t].name).join(' · ')}</div>
                      <span className={s.topScore}>가스 {f.gas} · 냄새 {f.smell} · 팽만 {f.bloat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 위험 조합 */}
          {result.comboWarnings.length > 0 && (
            <div className={s.comboCard}>
              <div className={s.comboHead}>🚨 위험 조합 감지</div>
              {result.comboWarnings.map((w, i) => (
                <div key={i} className={s.comboItem}>{w}</div>
              ))}
            </div>
          )}

          {/* 안내 (선택 보정 등) */}
          {result.hints.length > 0 && (
            <div className={s.hintCard}>
              {result.hints.map((h, i) => (
                <p key={i} className={s.hintItem}><span aria-hidden="true">ℹ️ </span>{h}</p>
              ))}
            </div>
          )}

          {/* 완화 팁 */}
          <div className={s.tipCard}>
            <div className={s.tipHead}>완화 팁</div>
            <p className={s.tipSubHead}>즉시</p>
            <ul className={s.tipUl}>
              <li>식후 10~15분 가벼운 산책</li>
              <li>따뜻한 물 또는 페퍼민트차·생강차</li>
              <li>무릎 당기기 스트레칭 (가스 배출)</li>
            </ul>
            <p className={s.tipSubHead} style={{ marginTop: 10 }}>다음 식사</p>
            <ul className={s.tipUl}>
              {result.primaryTypes.some(p => p.type === 'fermentation') && <li>양파·마늘·콩류·인공감미료 양 ↓</li>}
              {result.primaryTypes.some(p => p.type === 'lactose') && <li>유제품 → 락토프리 또는 식물성 음료</li>}
              {result.primaryTypes.some(p => p.type === 'air') && <li>탄산 대신 물·따뜻한 차</li>}
              {result.primaryTypes.some(p => p.type === 'slow') && <li>식사량 ↓, 천천히 씹기 (한 입 30회)</li>}
              {result.primaryTypes.some(p => p.type === 'smell') && <li>황 성분(계란·고기·브로콜리) 양 조절</li>}
              <li>본 도구의 [대체 음식] 탭에서 저FODMAP 대체 확인</li>
            </ul>
            {result.riskLevel === 'extreme' && (
              <p className={s.tipWarn}>
                ⚠️ 폭탄급 — 좁은 공간 피하고 환기. 본 도구의 [증상 대처] 탭 활용.
              </p>
            )}
          </div>

          {/* 액션 */}
          <div className={s.actionRow}>
            <button type="button" className={`${s.shareBtn} ${copied ? s.copied : ''}`} onClick={handleShare}>
              {copied ? '✅ 복사됨!' : '오늘 점수 공유'}
            </button>
            <button type="button" className={s.resetBtn} onClick={reset}>다시 계산</button>
          </div>
        </>
      )}
    </>
  )
}

/* ──────────────────────── 탭 2: 대체 음식 ──────────────────────── */
function AlternativeTab() {
  const [picked, setPicked] = useState<Set<string>>(new Set())

  const togglePick = (id: string) => {
    setPicked(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const showItems = picked.size === 0
    ? []   // 선택 전엔 카드를 접어 스크롤을 줄임 (안내만 표시)
    : FODMAP_ALTERNATIVES.filter(a => picked.has(a.highId))

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>본인이 자주 가스 차게 하는 음식 (복수)</span>
        <div className={s.altPickGrid}>
          {FODMAP_ALTERNATIVES.map(a => {
            const on = picked.has(a.highId)
            return (
              <button key={a.highId} type="button" aria-pressed={on}
                className={`${s.foodBtn} ${on ? s.foodActive : ''}`}
                onClick={() => togglePick(a.highId)}>
                <span className={s.foodEmoji} aria-hidden="true">{a.highEmoji}</span>
                <span>{a.highName}</span>
              </button>
            )
          })}
        </div>
        <p className={s.altHint}>
          {picked.size === 0
            ? '↑ 위에서 음식을 선택하면 저FODMAP 대체 추천이 표시됩니다.'
            : `↓ 선택한 ${picked.size}개 음식의 저FODMAP 대체 추천`}
        </p>
      </div>

      {showItems.map(a => (
        <div key={a.highId} className={s.altCard}>
          <div className={s.altHead}>
            <span className={s.altEmoji} aria-hidden="true">{a.highEmoji}</span>
            <span className={s.altTitle}>{a.highName} → 대체</span>
          </div>
          <div className={s.altOptionList}>
            {a.options.map((opt, i) => (
              <div key={i} className={s.altOption}>
                <span className={s.altOptName}>{opt.name}</span>
                <span className={s.altOptReason}>{opt.reason}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={s.tipCard}>
        <div className={s.tipHead}>저FODMAP 대체 사용 가이드</div>
        <ul className={s.tipUl}>
          <li>새 음식 시도 시 <strong>소량부터</strong> 시작</li>
          <li>한 번에 여러 변경 X — 효과 구분 어려움</li>
          <li>1~2주 일기로 본인 패턴 확인</li>
          <li>저FODMAP은 <strong>평생 식단이 아님</strong> — 진단·재도입 도구</li>
          <li>지속 증상 시 영양사·소화기내과 상담</li>
        </ul>
      </div>
    </>
  )
}

/* ──────────────────────── 탭 3: 증상 대처 ──────────────────────── */
function SymptomTab() {
  const [picked, setPicked] = useState<Set<SymptomKey>>(new Set())

  const togglePick = (k: SymptomKey) => {
    setPicked(prev => {
      const n = new Set(prev)
      if (n.has(k)) n.delete(k); else n.add(k)
      return n
    })
  }

  const showSymptoms = picked.size === 0
    ? []   // 선택 전엔 카드를 접어 스크롤을 줄임 (안내 + 아래 위험신호 카드만 표시)
    : SYMPTOM_RESPONSES.filter(sym => picked.has(sym.key))

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>겪고 있는 증상 (복수 선택)</span>
        <div className={s.altPickGrid}>
          {SYMPTOM_RESPONSES.map(sym => {
            const on = picked.has(sym.key)
            return (
              <button key={sym.key} type="button" aria-pressed={on}
                className={`${s.foodBtn} ${on ? s.foodActive : ''}`}
                onClick={() => togglePick(sym.key)}>
                <span className={s.foodEmoji} aria-hidden="true">{sym.emoji}</span>
                <span>{sym.name}</span>
              </button>
            )
          })}
        </div>
        <p className={s.altHint}>
          {picked.size === 0
            ? '↑ 위에서 증상을 선택하면 맞춤 대처가 표시됩니다. (아래 위험 신호는 항상 표시)'
            : `↓ 선택한 ${picked.size}개 증상에 대한 대처`}
        </p>
      </div>

      {showSymptoms.map(sym => (
        <div key={sym.key} className={s.symCard} style={sym.severity === 'urgent' ? { borderColor: 'rgba(220,38,38,0.4)' } : {}}>
          <div className={s.symHead}>
            <span className={s.symEmoji} aria-hidden="true">{sym.emoji}</span>
            <span className={s.symName}>{sym.name}</span>
          </div>
          <div className={s.symGrid}>
            <div>
              <p className={s.symSubHead} style={{ color: '#0891B2' }}>즉시</p>
              <ul className={s.tipUl}>
                {sym.immediate.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            <div>
              <p className={s.symSubHead} style={{ color: 'var(--accent)' }}>다음 식사</p>
              <ul className={s.tipUl}>
                {sym.nextMeal.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>
          <div className={s.symDoctor}>
            <span style={{ fontSize: 13, fontWeight: 700, color: sym.severity === 'urgent' ? '#DC2626' : '#EA580C' }}>
              ⚕️ 의료 상담:
            </span>
            <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{sym.seeDoctor}</span>
          </div>
        </div>
      ))}

      {/* 위험 신호 카드 (★★★★) */}
      <div className={s.redFlagCard}>
        <div className={s.redFlagHead}>⚠️ 위험 신호 — 다음 증상 시 즉시 의료 상담</div>
        <ul className={s.redFlagList}>
          {RED_FLAGS.map((flag, i) => <li key={i}>{flag}</li>)}
        </ul>
        <div className={s.redFlagFooter}>
          <p>📞 <strong>응급</strong>: 119</p>
          <p>📞 <strong>보건복지상담센터</strong>: 129</p>
          <p>📞 <strong>질병관리청 건강상담</strong>: 1339</p>
          <p>🏥 <strong>소화기내과</strong> 직접 방문 권장</p>
          <p style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', lineHeight: 1.7 }}>
이런 증상의 원인은 다양합니다 — 과민성대장증후군(IBS) · 소장세균과증식(SIBO) · 셀리악병(글루텐에 대한 자가면역 질환, 알레르기 아님) · 유당불내증 · 췌장 효소 부족 · 담즙 문제 등. 증상만으로 특정 질환을 단정할 수 없으니 전문의 상담이 필요합니다.
          </p>
        </div>
      </div>
    </>
  )
}
