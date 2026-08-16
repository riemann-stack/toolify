'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './kinship.module.css'
import {
  STEPS, NODES, MAX_DEPTH, PRESETS,
  resolvePath, allowedSteps, pick, isLegalRelative, pathText, stepLabelAt,
  type Gender, type StepId,
} from './kinshipData'

const STORAGE_KEY = 'youtil:kinship:state-v1'
const VALID_STEPS = new Set(STEPS.map((st) => st.id))

export default function KinshipClient() {
  const [gender, setGender] = useState<Gender>('male')
  const [steps, setSteps] = useState<StepId[]>(['F', 'OB'])
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* localStorage — 무검증 복원 금지 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      const g: Gender | null = j.gender === 'male' || j.gender === 'female' ? j.gender : null
      const st: StepId[] | null = Array.isArray(j.steps) && j.steps.length <= MAX_DEPTH && j.steps.every((x: unknown) => typeof x === 'string' && VALID_STEPS.has(x as StepId))
        ? (j.steps as StepId[]) : null
      if (g) setGender(g)
      /* 경로는 성별 게이트 통과 여부까지 확인 후 복원 */
      if (g && st && resolvePath(st, g).blockedAt === null) setSteps(st)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ gender, steps })) } catch {}
  }, [gender, steps])

  const result = useMemo(() => resolvePath(steps, gender), [steps, gender])
  const allowed = useMemo(() => new Set(allowedSteps(steps, gender)), [steps, gender])
  const node = result.node
  const legal = node && node.id !== 'me' ? isLegalRelative(node) : null

  const [resetNotice, setResetNotice] = useState(false)

  function switchGender(g: Gender) {
    setGender(g)
    /* 성별 전환으로 경로가 무효화되면(남편/아내 시작) 초기화 */
    if (resolvePath(steps, g).blockedAt !== null) {
      setSteps([])
      setResetNotice(true)
    }
  }

  function pushStep(id: StepId) {
    if (steps.length >= MAX_DEPTH) return
    if (!allowed.has(id)) return
    setResetNotice(false)
    setSteps([...steps, id])
  }

  async function copyResult() {
    if (!node || node.id === 'me') return
    const lines = [
      `[가족 호칭 계산기]`,
      `${pathText(steps, gender)} = ${pick(node.call, gender)}`,
      node.ref ? `지칭: ${node.ref}` : '',
      chonText(node),
      ``,
      `https://youtil.kr/tools/life/kinship`,
    ].filter(Boolean)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    copyTimer.current = setTimeout(() => setCopied('idle'), 1500)
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        sources={[
          { label: '국립국어원 표준 언어 예절 (2011)', href: 'https://www.korean.go.kr/front/reportData/reportDataView.do?mn_id=207&report_seq=772' },
          { label: '국립국어원 우리, 뭐라고 부를까요? (2020)', href: 'https://www.korean.go.kr/front/etcData/etcDataView.do?mn_id=208&etc_seq=648' },
          { label: '민법 제767~777조 (친족·촌수)', href: 'https://www.law.go.kr/법령/민법' },
        ]}
        related={[
          { href: '/tools/date/age', label: '나이 계산기' },
          { href: '/tools/life/zodiac', label: '띠·별자리' },
          { href: '/tools/date/lunar', label: '양력↔음력' },
        ]}
      >
        호칭어(부를 때)와 지칭어(남에게 말할 때)는 다를 수 있습니다. 표준 언어 예절 기준이며, 집안·지역 관행과 다를 수 있습니다.
      </Disclaimer>

      {/* 나의 성별 */}
      <div className={s.card}>
        <span className={s.cardLabel}>나는</span>
        <div className={s.genderRow}>
          <button type="button" aria-pressed={gender === 'male'} className={`${s.genderBtn} ${gender === 'male' ? s.genderActive : ''}`} onClick={() => switchGender('male')}>남성</button>
          <button type="button" aria-pressed={gender === 'female'} className={`${s.genderBtn} ${gender === 'female' ? s.genderActive : ''}`} onClick={() => switchGender('female')}>여성</button>
        </div>
        <p className={s.helpText}>형/오빠·매형/형부처럼 화자 성별에 따라 갈리는 호칭에 반영됩니다. 배우자 경로(남편/아내)도 성별에 맞게 열립니다.</p>
      </div>

      {/* 경로 빌더 */}
      <div className={s.card}>
        <span className={s.cardLabel}>관계 따라가기 <span className={s.cardLabelHint}>({steps.length}/{MAX_DEPTH}단계)</span></span>
        <div className={s.chipRow} aria-label="현재 관계 경로">
          <span className={s.chipMe}>나</span>
          {steps.map((id, i) => (
            <span key={i} className={s.chip}>
              <span className={s.chipArrow}>→</span>
              {stepLabelAt(result.trail[i] ?? 'me', id, gender)}
            </span>
          ))}
          {steps.length > 0 && (
            <button type="button" className={s.chipUndo} onClick={() => setSteps(steps.slice(0, -1))} aria-label="마지막 단계 되돌리기">⌫ 되돌리기</button>
          )}
        </div>
        <div className={s.stepGrid}>
          {STEPS.map((st) => {
            const ok = allowed.has(st.id)
            return (
              <button
                key={st.id}
                type="button"
                className={s.stepBtn}
                disabled={!ok}
                title={ok ? `${st.label} 단계 추가` : steps.length === 0 && (st.id === 'H' || st.id === 'W') ? '화자 성별에 따라 열리는 경로입니다 (남편 = 여성 화자 · 아내 = 남성 화자)' : steps.length >= MAX_DEPTH ? '최대 5단계까지 지원합니다' : '이 관계에서는 표준 호칭이 특정되지 않아 지원하지 않습니다'}
                onClick={() => pushStep(st.id)}
              >
                {st.label}
              </button>
            )
          })}
        </div>
        <div className={s.builderFoot}>
          <button type="button" className={s.resetBtn} onClick={() => setSteps([])}>처음부터</button>
          <p className={s.helpText} style={{ margin: 0 }}>
            버튼이 꺼져 있으면 그 방향은 표준 호칭이 특정되지 않는 경로입니다 (예: 아버지의 아들 = 나 또는 형제 — 형제는 첫 단계에서 선택). 남편/아내 버튼은 화자 성별에 따라 한쪽만 열립니다.{resetNotice && <strong> 배우자에서 시작한 경로는 성별 전환 시 초기화됩니다.</strong>}
          </p>
        </div>
      </div>

      {/* 결과 HERO */}
      {node && node.id !== 'me' ? (
        <div className={s.hero} role="status">
          <p className={s.heroLead}>{pathText(steps, gender)}</p>
          <p className={s.heroValue}>{pick(node.call, gender)}</p>
          {node.ageVariant && (
            <p className={s.heroAge}>연상이면 <strong>{node.ageVariant.older}</strong> · 연하면 <strong>{node.ageVariant.younger}</strong></p>
          )}
          <div className={s.heroMeta}>
            {node.ref && <span>지칭 <strong>{node.ref}</strong></span>}
            {node.hanja && <span>한자 <strong>{node.hanja}</strong></span>}
            <span>{chonText(node)}</span>
            <span className={s.groupBadge}>{node.group}</span>
          </div>
          {node.note && <p className={s.heroNote}>※ {node.note}</p>}
        </div>
      ) : (
        <div className={s.heroEmpty} role="status">
          위 버튼으로 관계를 따라가면 호칭이 여기 표시됩니다.
        </div>
      )}

      {/* 역방향 + 민법 */}
      {node && node.id !== 'me' && (
        <div className={s.twoCol}>
          <div className={s.card}>
            <span className={s.cardLabel}>거꾸로 — 그 사람은 나를</span>
            <p className={s.reverseText}>{pick(node.reverse, gender)}</p>
          </div>
          <div className={s.card}>
            <span className={s.cardLabel}>민법상 친족인가요?</span>
            <p className={s.legalText}>
              {legal?.relative ? '✅ 친족' : '❌ 친족 아님'}
              <span className={s.legalBasis}>{legal?.basis}</span>
            </p>
          </div>
        </div>
      )}

      {/* 가계도 */}
      {node && node.id !== 'me' && (
        <div className={s.card}>
          <span className={s.cardLabel}>관계 가계도</span>
          <TrailTree trail={result.trail} gender={gender} />
          <p className={s.helpText}>나(왼쪽 아래)에서 출발해 선택한 관계를 따라간 경로입니다. 세로 = 세대.</p>
        </div>
      )}

      {node && node.id !== 'me' && (
        <button className={`${s.copyBtn} ${copied === 'ok' ? s.copied : ''}`} onClick={copyResult} type="button">
          {copied === 'ok' ? '✓ 복사됨' : copied === 'fail' ? '복사 실패 — 결과를 직접 선택해 주세요' : '결과 복사하기'}
        </button>
      )}

      {/* 프리셋 */}
      <div className={s.card}>
        <span className={s.cardLabel}>자주 찾는 관계</span>
        <div className={s.presetGrid}>
          {PRESETS.map((p) => {
            const needsGender = p.gender && p.gender !== gender
            return (
              <button
                key={p.label}
                type="button"
                className={s.presetBtn}
                onClick={() => {
                  if (p.gender) setGender(p.gender)
                  setResetNotice(false)
                  setSteps(p.steps)
                }}
              >
                {p.label}
                {needsGender && <span className={s.presetHint}>{p.gender === 'male' ? '남성 화자' : '여성 화자'} 기준</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function chonText(node: { chon: number | null; kind: string }): string {
  if (node.kind === 'spouse') return '무촌 (배우자)'
  if (node.kind === 'none') return '촌수 없음'
  if (node.chon === null) return ''
  return node.kind === 'blood' ? `${node.chon}촌 혈족` : `인척 ${node.chon}촌`
}

/* ─────────────────────────────────────────────
   TrailTree — 경로 가계도 SVG
   ───────────────────────────────────────────── */
function TrailTree({ trail, gender }: { trail: string[]; gender: Gender }) {
  const nodes = trail.map((id) => NODES[id])
  const COL = 118
  const ROW = 64
  const BOX_W = 104
  const BOX_H = 34
  const PAD = 14

  const gens = nodes.map((n) => n.generation)
  const gMax = Math.max(...gens)
  const gMin = Math.min(...gens)
  const width = PAD * 2 + nodes.length * COL - (COL - BOX_W)
  const height = PAD * 2 + (gMax - gMin) * ROW + BOX_H

  const x = (i: number) => PAD + i * COL
  const y = (g: number) => PAD + (gMax - g) * ROW

  return (
    <div className={s.treeScroll}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`나에서 ${nodes[nodes.length - 1].label}까지의 관계 경로 가계도`}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* 연결선 */}
        {nodes.slice(1).map((n, i) => {
          const x1 = x(i) + BOX_W / 2
          const y1 = y(nodes[i].generation) + BOX_H / 2
          const x2 = x(i + 1) + BOX_W / 2
          const y2 = y(n.generation) + BOX_H / 2
          const sameGen = n.generation === nodes[i].generation
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`}
              fill="none"
              stroke="var(--border-hover)"
              strokeWidth={sameGen ? 1.2 : 1.6}
              strokeDasharray={sameGen ? '4,3' : undefined}
            />
          )
        })}
        {/* 노드 */}
        {nodes.map((n, i) => {
          const last = i === nodes.length - 1
          const first = i === 0
          return (
            <g key={i}>
              <rect
                x={x(i)} y={y(n.generation)} width={BOX_W} height={BOX_H} rx={8}
                fill={last ? 'var(--accent-strong)' : first ? 'var(--accent-light)' : 'var(--bg3)'}
                stroke={last ? 'var(--accent-strong)' : 'var(--border)'}
                strokeWidth={1.2}
              />
              <text
                x={x(i) + BOX_W / 2} y={y(n.generation) + BOX_H / 2 + 4}
                textAnchor="middle" fontSize={12} fontWeight={700}
                fill={last ? '#ffffff' : 'var(--text)'}
                fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
              >
                {i === 0 ? '나' : last ? pick(n.call, gender).split(' ')[0].slice(0, 8) : n.label.slice(0, 8)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
