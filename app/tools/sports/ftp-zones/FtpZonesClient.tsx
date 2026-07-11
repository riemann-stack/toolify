'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import { TEST_METHODS, calcFtp } from './ftpZonesData'
import s from './ftp-zones.module.css'

export default function FtpZonesClient() {
  const [methodId, setMethodId] = useState('t20')
  const [watt, setWatt] = useState('250')
  const [weight, setWeight] = useState('70')

  const method = TEST_METHODS.find((m) => m.id === methodId) ?? TEST_METHODS[0]
  const wattNum = parseFloat(watt) || 0
  const weightNum = parseFloat(weight) || 0
  const valid = wattNum > 0

  const result = useMemo(() => (valid ? calcFtp(wattNum, method, weightNum) : null), [valid, wattNum, method, weightNum])

  const fmt = (n: number) => n.toLocaleString('ko-KR')

  return (
    <div className={s.wrap}>
      {/* 테스트 방법 */}
      <div className={s.card}>
        <p className={s.groupLabel}>측정 방법</p>
        <div className={s.methodGrid}>
          {TEST_METHODS.map((m) => (
            <button key={m.id} type="button"
              aria-pressed={methodId === m.id}
              className={`${s.methodBtn} ${methodId === m.id ? s.methodBtnActive : ''}`}
              onClick={() => setMethodId(m.id)}>
              {m.name}
            </button>
          ))}
        </div>
        <p className={s.methodDesc}>{method.desc}</p>
      </div>

      {/* 파워 입력 */}
      <div className={s.card}>
        <label className={s.fieldLabel} htmlFor="ftp-watt">{method.inputLabel}</label>
        <div className={s.inputRow}>
          <input id="ftp-watt" type="number" inputMode="numeric" min={0} step={5}
            className={s.input} value={watt}
            onChange={(e) => setWatt(e.target.value)} aria-label={`${method.inputLabel} (와트)`} />
          <span className={s.unit}>W</span>
        </div>
      </div>

      {/* 체중 */}
      <div className={s.card}>
        <label className={s.fieldLabel} htmlFor="ftp-weight">체중 <span className={s.optional}>(W/kg·카테고리용)</span></label>
        <div className={s.inputRow}>
          <input id="ftp-weight" type="number" inputMode="decimal" min={0} step={1}
            className={s.input} value={weight}
            onChange={(e) => setWeight(e.target.value)} aria-label="체중(kg)" />
          <span className={s.unit}>kg</span>
        </div>
      </div>

      {/* 결과 */}
      {result ? (
        <div className={s.resultCard} role="status">
          <p className={s.resultLabel}>추정 FTP (기능적 역치 파워)</p>
          <p className={s.hero}>{fmt(result.ftp)}<span className={s.heroUnit}>W</span></p>
          {result.wkg !== null && (
            <p className={s.resultSub}>
              <strong>{result.wkg.toFixed(2)} W/kg</strong> · {result.grade}
            </p>
          )}

          {result.zwift && (
            <div className={s.zwiftBox} style={{ borderColor: result.zwift.color }}>
              <span className={s.zwiftLabel}>즈위프트 레이스 카테고리</span>
              <span className={s.zwiftCat} style={{ color: result.zwift.color }}>{result.zwift.cat}</span>
              <span className={s.zwiftNote}>W/kg 기준 · 리그마다 상이</span>
            </div>
          )}

          {/* 파워존 표 */}
          <div className={s.zoneList}>
            {result.zones.map((zn) => (
              <div key={zn.z} className={s.zoneRow}>
                <span className={s.zoneTag}>{zn.z}</span>
                <div className={s.zoneBody}>
                  <span className={s.zoneName}>{zn.name}</span>
                  <span className={s.zoneDesc}>{zn.desc}</span>
                </div>
                <span className={s.zoneWatt}>
                  {fmt(zn.loW)}{zn.hiW !== null ? `~${fmt(zn.hiW)}` : '+'}<small>W</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.emptyNote}>측정값을 입력하면 FTP와 7단계 파워존, W/kg 등급을 계산합니다.</p>
        </div>
      )}

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/sports/vo2max', label: 'VO₂ Max 계산기' },
          { href: '/tools/sports/interval-training', label: '인터벌 훈련 계산기' },
          { href: '/tools/sports/pace', label: '러닝 페이스 계산기' },
        ]}
        sources={[
          { label: 'Allen & Coggan — Training and Racing with a Power Meter', href: 'https://www.trainingpeaks.com' },
        ]}
      >
        FTP 추정 계수와 파워존은 Allen·Coggan 방법 기준이며, 실제 역치는 컨디션·측정 조건에 따라 달라집니다. W/kg 등급과 즈위프트 카테고리는 커뮤니티 통용 참고값으로 리그·성별에 따라 다릅니다.
      </Disclaimer>
    </div>
  )
}
