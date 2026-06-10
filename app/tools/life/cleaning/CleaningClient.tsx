'use client'

import { useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import { AGENTS, AGENT_MAP, SITUATIONS, MIX_RISKS } from './cleaningData'
import s from './cleaning.module.css'

function recipe(sit: (typeof SITUATIONS)[number], volumeMl: number) {
  const agent = AGENT_MAP[sit.agentId]
  if (sit.gPerL && sit.gPerL > 0) {
    const g = Math.max(1, Math.round((volumeMl / 1000) * sit.gPerL))
    const tbsp = agent.gPerTbsp ? Math.round((g / agent.gPerTbsp) * 2) / 2 : null
    const sub = tbsp == null ? '' : tbsp >= 0.5 ? `약 ${tbsp}큰술` : '½큰술 미만'
    return { amount: `${g.toLocaleString('ko-KR')}g`, sub }
  }
  if (sit.mlPerL && sit.mlPerL > 0) {
    const ml = Math.max(1, Math.round((volumeMl / 1000) * sit.mlPerL))
    return { amount: `${ml.toLocaleString('ko-KR')}ml`, sub: sit.ratio || '' }
  }
  return { amount: '사용법 참고', sub: '' }
}

const PRESETS = [
  { label: '분무기 500ml', v: 500 },
  { label: '세면대 2L', v: 2000 },
  { label: '양동이 5L', v: 5000 },
]

export default function CleaningClient() {
  const [sitId, setSitId] = useState('kitchen-oil')
  const [volume, setVolume] = useState(500)

  const sit = SITUATIONS.find((x) => x.id === sitId) ?? SITUATIONS[0]
  const agent = AGENT_MAP[sit.agentId]
  const alt = sit.altId ? AGENT_MAP[sit.altId] : null
  const r = recipe(sit, volume)
  const usesVolume = !!((sit.gPerL && sit.gPerL > 0) || (sit.mlPerL && sit.mlPerL > 0))

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/laundry-dry', label: '빨래 건조 시간' },
          { href: '/tools/cooking/food-storage', label: '식재료 보관' },
          { href: '/tools/health/uv-protection', label: '자외선 지수' },
        ]}
      >
        <strong>안전이 최우선입니다.</strong> 한 번에 한 가지 세제만 쓰고, <strong>락스는 물로만 희석·단독·환기</strong>하세요. 락스를 산성(구연산·식초)·암모니아·과탄산과 섞으면 <strong>유독가스</strong>가 발생합니다. 희석량은 일반 권장 근사치이며 제품 라벨을 우선하세요.
      </Disclaimer>

      {/* 안전 — 혼합 금지 (항상 노출) */}
      <div className={s.safetyCard}>
        <div className={s.safetyHead}>🚫 절대 섞으면 안 되는 조합</div>
        <ul className={s.safetyList}>
          {MIX_RISKS.map((m, i) => (
            <li key={i} className={m.level === 'danger' ? s.riskDanger : s.riskCaution}>
              <strong>{m.combo}</strong> → {m.result}
            </li>
          ))}
        </ul>
      </div>

      {/* 응급 — 혼합 사고 시 */}
      <div className={s.safetyCard} style={{ background: 'rgba(234,88,12,0.06)', borderColor: 'rgba(234,88,12,0.35)' }}>
        <div className={s.safetyHead} style={{ color: '#EA580C' }}>🆘 가스 흡입·혼합 사고 시</div>
        <ul className={s.safetyList}>
          <li>즉시 그 자리를 벗어나 창문·문을 열고 신선한 공기를 마신다</li>
          <li>피부·눈에 닿았으면 흐르는 물로 <strong>15분 이상</strong> 씻는다</li>
          <li>기침·호흡곤란·어지럼이 지속되면 <strong>119</strong>에 신고</li>
          <li>일반 면·부직포 마스크는 <strong>염소가스를 막지 못합니다</strong> — 애초에 섞지 않는 것이 유일한 예방입니다</li>
        </ul>
      </div>

      {/* 상황 선택 */}
      <div className={s.card}>
        <span className={s.cardLabel}>청소 상황 선택</span>
        <div className={s.sitGrid}>
          {SITUATIONS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={sitId === x.id}
              aria-label={`${x.place} ${x.stain}`}
              className={`${s.sitBtn} ${sitId === x.id ? s.sitActive : ''}`}
              onClick={() => setSitId(x.id)}
            >
              <span className={s.sitEmoji} aria-hidden="true">{x.emoji}</span>
              <span className={s.sitPlace}>{x.place}</span>
              <span className={s.sitStain}>{x.stain}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 물 용량 (정량 사용 상황에선 숨김) */}
      {usesVolume && (
      <div className={s.card}>
        <span className={s.cardLabel}>만들 물 용량</span>
        <div className={s.volRow}>
          <input
            className={s.input}
            type="number"
            inputMode="numeric"
            aria-label="만들 물 용량 (ml)"
            min={50}
            max={20000}
            step={50}
            value={volume}
            onChange={(e) => setVolume(Math.max(50, Math.min(20000, Number(e.target.value) || 50)))}
          />
          <span className={s.unit}>ml</span>
        </div>
        <div className={s.presetRow}>
          {PRESETS.map((p) => (
            <button
              key={p.v}
              type="button"
              aria-pressed={volume === p.v}
              className={`${s.preset} ${volume === p.v ? s.presetActive : ''}`}
              onClick={() => setVolume(p.v)}
            >{p.label}</button>
          ))}
        </div>
      </div>
      )}

      {/* 결과 — 레시피 */}
      <div className={s.result}>
        <div className={s.resultHead}>
          <span className={s.resultEmoji}>{sit.emoji}</span>
          {sit.place} · {sit.stain}
        </div>

        <div className={s.recipeBox} aria-live="polite">
          <span className={s.agentChip} style={{ background: agent.color }}>{agent.name}</span>
          <div className={s.recipeMain}>
            {usesVolume ? (
              <>물 <strong>{volume.toLocaleString('ko-KR')}ml</strong> + {agent.name} <strong style={{ color: agent.color }}>{r.amount}</strong></>
            ) : (
              <>{agent.name} <strong style={{ color: agent.color }}>정량 사용</strong> — 아래 사용법 참고</>
            )}
          </div>
          {r.sub && <div className={s.recipeSub}>{r.sub}{sit.hot ? ' · 따뜻한 물(40~60℃) 사용' : ''}</div>}
          {!r.sub && sit.hot && <div className={s.recipeSub}>따뜻한 물(40~60℃) 사용</div>}
        </div>

        <ol className={s.steps}>
          {sit.steps.map((st, i) => <li key={i}>{st}</li>)}
        </ol>

        <div className={s.metaRow}>
          {alt && (
            <div className={s.metaItem}>
              <span className={s.metaLabel}>대안 세제</span>
              <span>{alt.name} <span style={{ color: 'var(--muted)' }}>(농도·사용법이 다르니 제품 라벨 확인)</span></span>
            </div>
          )}
          <div className={s.metaItem}>
            <span className={s.metaLabel}>💡 주의</span>
            <span>{sit.caution}</span>
          </div>
        </div>

        <div className={s.neverBox}>
          🚫 <strong>이 상황에서 함께 쓰지 마세요:</strong> {sit.never}
        </div>
      </div>

      {/* 세제별 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>세제별 특징 한눈에</span>
        <div className={s.agentList}>
          {AGENTS.map((a) => (
            <div key={a.id} className={s.agentRow}>
              <span className={s.agentDot} style={{ background: a.color }} />
              <div className={s.agentBody}>
                <div className={s.agentName}>{a.name} <span className={s.agentType}>{a.type} · pH {a.ph}</span></div>
                <div className={s.agentUse}>{a.uses}</div>
                <div className={s.agentTip}>{a.tip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
