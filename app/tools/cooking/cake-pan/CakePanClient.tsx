'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  HO_PRESETS, HEIGHT_PRESETS, convertPan,
  type PanShape, type HeightId, type PanSpec,
} from './cakePanData'
import s from './cake-pan.module.css'

interface SideState {
  shape: PanShape
  dSel: number | null   // 호수 프리셋 지름 (null = 직접 입력)
  dCustom: string
  w: string
  l: string
  hId: HeightId
  hCustom: string
}

const initSide = (d: number): SideState => ({
  shape: 'round', dSel: d, dCustom: '', w: '', l: '', hId: 'high', hCustom: '',
})

function toSpec(st: SideState): PanSpec {
  const hPreset = HEIGHT_PRESETS.find((h) => h.id === st.hId)!
  const h = st.hId === 'custom' ? parseFloat(st.hCustom) || 0 : hPreset.h
  const d = st.dSel !== null ? st.dSel : parseFloat(st.dCustom) || 0
  return {
    shape: st.shape,
    d: Math.min(d, 100),
    w: Math.min(parseFloat(st.w) || 0, 100),
    l: Math.min(parseFloat(st.l) || 0, 100),
    h: Math.min(h, 30),
  }
}

function PanPicker({ side, st, onChange }: {
  side: string
  st: SideState
  onChange: (next: SideState) => void
}) {
  const num = (v: string) => v.replace(/[^0-9.]/g, '')
  return (
    <div>
      <div className={s.shapeRow} role="group" aria-label={`${side} 팬 형태`}>
        <button type="button" className={`${s.shapeBtn} ${st.shape === 'round' ? s.on : ''}`}
          aria-pressed={st.shape === 'round'} onClick={() => onChange({ ...st, shape: 'round' })}>⚪ 원형</button>
        <button type="button" className={`${s.shapeBtn} ${st.shape === 'square' ? s.on : ''}`}
          aria-pressed={st.shape === 'square'} onClick={() => onChange({ ...st, shape: 'square' })}>⬜ 사각·직사각</button>
      </div>

      {st.shape === 'round' ? (
        <>
          <div className={s.hoGrid} role="group" aria-label={`${side} 호수 선택`}>
            {HO_PRESETS.map((p) => (
              <button key={p.label} type="button"
                className={`${s.hoBtn} ${st.dSel === p.d ? s.on : ''}`}
                aria-pressed={st.dSel === p.d}
                onClick={() => onChange({ ...st, dSel: p.d, dCustom: '' })}>
                <span className={s.hoName}>{p.label}</span>
                <span className={s.hoD}>{p.d}cm</span>
              </button>
            ))}
          </div>
          <div className={s.customRow}>
            <label className={s.miniLabel} htmlFor={`${side}-dia`}>직접 입력</label>
            <input id={`${side}-dia`} className={s.numInput} type="text" inputMode="decimal"
              placeholder="지름" value={st.dCustom}
              onChange={(e) => onChange({ ...st, dCustom: num(e.target.value), dSel: e.target.value ? null : st.dSel })} />
            <span className={s.unit}>cm</span>
          </div>
        </>
      ) : (
        <div className={s.customRow}>
          <input className={s.numInput} type="text" inputMode="decimal" placeholder="가로"
            aria-label={`${side} 사각팬 가로 (센티미터)`} value={st.w}
            onChange={(e) => onChange({ ...st, w: num(e.target.value) })} />
          <span className={s.unit}>×</span>
          <input className={s.numInput} type="text" inputMode="decimal" placeholder="세로"
            aria-label={`${side} 사각팬 세로 (센티미터)`} value={st.l}
            onChange={(e) => onChange({ ...st, l: num(e.target.value) })} />
          <span className={s.unit}>cm</span>
        </div>
      )}

      <div className={s.heightRow} role="group" aria-label={`${side} 팬 높이`}>
        {HEIGHT_PRESETS.map((h) => (
          <button key={h.id} type="button"
            className={`${s.hBtn} ${st.hId === h.id ? s.on : ''}`}
            aria-pressed={st.hId === h.id}
            onClick={() => onChange({ ...st, hId: h.id })}>
            {h.label}
          </button>
        ))}
        {st.hId === 'custom' && (
          <span className={s.hCustomBox}>
            <input className={s.numInput} type="text" inputMode="decimal" placeholder="높이"
              aria-label={`${side} 팬 높이 직접 입력 (센티미터)`} value={st.hCustom}
              onChange={(e) => onChange({ ...st, hCustom: num(e.target.value) })} />
            <span className={s.unit}>cm</span>
          </span>
        )}
      </div>
    </div>
  )
}

export default function CakePanClient() {
  const [from, setFrom] = useState<SideState>(() => initSide(15))
  const [to, setTo] = useState<SideState>(() => initSide(18))
  const [ingAmount, setIngAmount] = useState('100')

  const result = useMemo(() => convertPan(toSpec(from), toSpec(to)), [from, to])

  const fmt = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
  const ing = parseFloat(ingAmount)

  const swap = () => { setFrom(to); setTo(from) }

  return (
    <div className={s.wrap}>
      {/* 팬 선택 */}
      <div className={s.card}>
        <p className={s.groupLabel}>레시피의 팬 (기준)</p>
        <PanPicker side="기준" st={from} onChange={setFrom} />
      </div>

      <div className={s.swapRow}>
        <button type="button" className={s.swapBtn} onClick={swap} aria-label="기준 팬과 내 팬 서로 바꾸기">⇅ 서로 바꾸기</button>
      </div>

      <div className={s.card}>
        <p className={s.groupLabel}>내가 가진 팬 (변환)</p>
        <PanPicker side="변환" st={to} onChange={setTo} />
      </div>

      {/* 결과 */}
      <div className={s.resultCard} role="status">
        <p className={s.resultLabel}>레시피 배율</p>
        {result ? (
          <>
            <p className={s.hero}>
              ×{result.ratio.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={s.resultSub}>
              팬 부피 {fmt(result.fromVol)}ml → {fmt(result.toVol)}ml
              {result.ratio > 1.28 && result.ratio < 1.6 && <> · 커뮤니티 통용 반올림 &lsquo;1.5배&rsquo; 구간</>}
            </p>
            <div className={s.ingRow}>
              <label className={s.miniLabel} htmlFor="ing-amount">재료 환산</label>
              <input id="ing-amount" className={s.numInput} type="text" inputMode="decimal"
                value={ingAmount} onChange={(e) => setIngAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
              <span className={s.unit}>g →</span>
              <strong className={s.ingOut}>
                {isFinite(ing) && ing > 0 ? `${(ing * result.ratio).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}g` : '—'}
              </strong>
            </div>
            <p className={s.yieldNote}>
              계란은 개수 단위라 딱 떨어지지 않아요 — 환산값에 가까운 개수로 잡고 나머지 재료를 미세 조정하는 게 관행입니다.
            </p>
          </>
        ) : (
          <p className={s.emptyNote}>두 팬의 치수를 입력하면 부피 기준 배율을 계산해요.</p>
        )}
      </div>

      {/* 굽기 보정 */}
      {result && Math.abs(result.ratio - 1) > 0.05 && (
        <div className={s.card}>
          <p className={s.groupLabel}>🔥 굽기 보정 — 정량 규칙은 없어요</p>
          <ul className={s.tipList}>
            <li>굽는 시간을 배율({result.ratio.toFixed(2)}배)만큼 <strong>비례 계산하면 안 됩니다</strong> — 두께가 관건이에요.</li>
            <li>팬이 커지거나 깊어지면(반죽이 두꺼워지면) <strong>온도를 조금 낮추고 시간을 5분 단위로 늘려가며</strong> 확인하세요.</li>
            <li>최종 판정은 <strong>꼬치(이쑤시개) 테스트</strong> — 중앙에 찔러 반죽이 묻어나지 않으면 완료.</li>
            <li>반죽은 틀의 <strong>60~70%</strong>까지만 채우세요. 실측 사례: 2호 제누와즈 170℃ 30~35분 → 3호 약 40분.</li>
          </ul>
        </div>
      )}

      {/* 호수 참고표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>원형 팬 호수 참고표 (높은팬 7cm 기준)</p>
        <div className={s.tableScroll}>
          <table className={s.refTable}>
            <thead>
              <tr>
                <th scope="col">호수</th>
                <th scope="col">지름</th>
                <th scope="col">부피(H7)</th>
                <th scope="col">인원 관행</th>
                <th scope="col">인치 대응</th>
              </tr>
            </thead>
            <tbody>
              {HO_PRESETS.map((p) => (
                <tr key={p.label}>
                  <td><strong>{p.label}</strong></td>
                  <td>{p.d}cm</td>
                  <td>{fmt(Math.PI * Math.pow(p.d / 2, 2) * 7)}ml</td>
                  <td>{p.serving}</td>
                  <td className={s.dim}>{p.inch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.groupNote}>
          미니는 판매처에 따라 11.3~12cm 편차가 있어요. 인원수는 케이크샵마다 표기가 크게 달라 관행 수준의 참고치입니다.
          제과점 완성 케이크는 아이싱 두께 때문에 팬보다 지름을 약 1cm 크게 표기하는 곳도 있어요(팬 기준과 구분).
        </p>
      </div>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/cooking/baking-recipe', label: '제과 레시피 계산기' },
          { href: '/tools/cooking/baker-percent', label: '베이커 퍼센트 계산기' },
          { href: '/tools/cooking/baking-schedule', label: '제빵 타임라인 계산기' },
        ]}
        sources={[
          { label: '베이킹 자재상 판매 규격 (카우2004·웰베이킹 등) 교차 확인', href: 'https://www.cow2004.com' },
        ]}
      >
        배율은 팬 부피 비율 기준 산술값입니다. 사각팬·파운드(오란다)팬은 표준 규격이 없어 판매처마다 치수가 다르므로 실측 치수를 입력하세요. 굽기 온도·시간은 오븐·반죽에 따라 달라 테스트가 필요합니다.
      </Disclaimer>
    </div>
  )
}
