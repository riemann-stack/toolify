/* components/ResultHero.tsx — 결과 카드 (스펙 §10.3). 훅 없음 → *Client.tsx 안에서 그대로 쓴다(서버에서도 가능).
   규칙: 숫자는 검정(--text) · role="status"는 숫자/빈 상태가 공유하는 요소 1곳(교체하지 않음) · 계산식 줄(formula) 필수 ·
         입력 전에는 empty로 같은 높이 확보(CLS 0) · 액션은 [링크 공유(secondary)] [결과 복사(primary)] 1:1.4, 복사 토스트 1500ms.
   data-result-label → 데스크톱 레일 미니 결과(RailResult)가 이 라벨·숫자를 그대로 미러링한다. */
import type { ReactNode } from 'react'
import styles from './ResultHero.module.css'
import UiIcon from './UiIcon'

export interface ResultSegment { label: string; value: number; color: 'data-1' | 'data-2' | 'data-3' | 'data-4' }
export interface ResultHeroProps {
  label: string                 // '월 실수령액'
  value?: string                // '3,506,176' (포맷 완료 문자열) — 없으면 empty 상태
  unit?: string                 // '원'
  pill?: string                 // '실수령률 84.1%'
  sub?: ReactNode               // <>연 <b>42,074,112원</b> · 매달 공제 <b>660,490원</b></>
  formula: ReactNode            // <>세전 월 <b>4,166,666</b> − 공제 <b>660,490</b> = <b>3,506,176원</b></>
  segments?: ResultSegment[]    // 구성 막대(합 100 기준 %)
  empty?: string                // '연봉을 입력하면 월 실수령액이 여기에 표시됩니다'
  actions?: ReactNode           // <div className="ui-btnRow">…</div>
  /** 개인정보 한 줄. 서버 API를 호출하는 도구는 false(사실과 다른 문구 금지) */
  privacyNote?: boolean
  /** 앵커 id — 한 페이지에 결과 카드가 둘이면 두 번째는 다른 id */
  id?: string
  children?: ReactNode          // <BreakdownTable …/> 등
}

export default function ResultHero({ label, value, unit, pill, sub, formula, segments, empty, actions, privacyNote = true, id = 'result', children }: ResultHeroProps) {
  return (
    <section className={`ui-card ${styles.rh}`} id={id} aria-label="계산 결과">
      <div className={styles.rhHead}>
        <p className={styles.rhLabel}>{label}</p>
        {pill && value && <span className="ui-pill">{pill}</span>}
      </div>
      {/* 라이브 영역은 빈 상태·값 상태에서 같은 요소 1개를 유지하고 안의 내용만 바꾼다 —
          값이 처음 생길 때 role=status 요소가 새로 삽입되면 첫 결과가 낭독되지 않을 수 있다 */}
      <p className={value ? styles.rhNum : styles.rhEmpty} role="status" aria-live="polite" aria-atomic="true" data-result-label={value ? label : undefined}>
        {value ? <>{value}{unit && <span className={styles.rhUnit}>{unit}</span>}</> : (empty ?? '값을 입력하면 결과가 여기에 표시됩니다')}
      </p>
      {value && (<>
        {sub && <p className={styles.rhSub}>{sub}</p>}
        <p className={styles.rhFormula}><UiIcon name="calc" size={16} /><span>{formula}</span></p>
        {segments && segments.length > 0 && (<>
          <div className={styles.rhStack} role="img" aria-label={segments.map(s => `${s.label} ${s.value}%`).join(', ')}>
            {segments.map(s => <span key={s.label} style={{ width: `${Math.max(0, Math.min(100, s.value))}%`, background: `var(--${s.color})` }} />)}
          </div>
          <div className={styles.rhLegend}>
            {segments.map(s => <span key={s.label}><i style={{ background: `var(--${s.color})` }} />{s.label} <b>{s.value}%</b></span>)}
          </div>
        </>)}
        {children}
        {actions}
      </>)}
      {privacyNote && <p className={styles.rhFoot}><UiIcon name="lock" size={16} />입력값은 이 기기에서만 계산되며 서버로 전송되지 않습니다.</p>}
    </section>
  )
}

export interface BreakdownRow { label: string; note?: string; cols: string[]; color?: ResultSegment['color']; kind?: 'sum' | 'net' }

/** 결과 카드 안 내역표 — 첫 열은 항목(행 머리), 나머지는 우측 정렬 숫자 */
export function BreakdownTable({ caption, unit, head, rows }: { caption: string; unit?: string; head: string[]; rows: BreakdownRow[] }) {
  return (
    <div className={styles.rhTable}>
      <div className={styles.rhTableCap}>{caption}{unit && <span>단위: {unit}</span>}</div>
      <div className="tableScroll">
        <table>
          <thead><tr>{head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className={r.kind === 'sum' ? styles.rhSum : r.kind === 'net' ? styles.rhNet : undefined}>
                <th scope="row">{r.color && <i style={{ background: `var(--${r.color})` }} />}{r.label}{r.note && <small>{r.note}</small>}</th>
                {r.cols.map((c, i) => <td key={i}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
