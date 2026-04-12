'use client'

import { useMemo } from 'react'

interface Props {
  years?: number
}

const RATES = [
  { rate: 3,  label: '3%',  color: '#3EC8FF' },
  { rate: 5,  label: '5%',  color: '#3EFF9B' },
  { rate: 7,  label: '7%',  color: '#C8FF3E' },
  { rate: 10, label: '10%', color: '#FF8C3E' },
]

const PRINCIPAL = 1000 // 만원
const YEARS = 30

export default function CompoundChart({ years = YEARS }: Props) {
  const data = useMemo(() => {
    return RATES.map(({ rate, label, color }) => {
      const points = Array.from({ length: years + 1 }, (_, y) => ({
        y,
        value: Math.round(PRINCIPAL * Math.pow(1 + rate / 100, y)),
      }))
      return { rate, label, color, points }
    })
  }, [years])

  // SVG 좌표 계산
  const W = 560
  const H = 280
  const padL = 56
  const padR = 16
  const padT = 16
  const padB = 40

  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const maxValue = data[data.length - 1].points[years].value
  const xScale = (y: number) => padL + (y / years) * chartW
  const yScale = (v: number) => padT + chartH - (v / maxValue) * chartH

  // X축 눈금 (0, 5, 10, 15, 20, 25, 30)
  const xTicks = Array.from({ length: 7 }, (_, i) => i * 5)
  // Y축 눈금
  const yTicks = [0, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 17500]
    .filter(v => v <= maxValue + 1000)

  const fmtVal = (v: number) =>
    v >= 10000 ? `${(v / 10000).toFixed(0)}억` : `${v.toLocaleString()}만`

  // 각 라인의 path 생성
  const makePath = (points: { y: number; value: number }[]) =>
    points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(p.y).toFixed(1)} ${yScale(p.value).toFixed(1)}`
    ).join(' ')

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '20px',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
        원금 1,000만 원 투자 시 복리 성장 시뮬레이션 (30년)
      </p>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>

        {/* 그리드 수평선 */}
        {yTicks.map(v => (
          <g key={v}>
            <line
              x1={padL} y1={yScale(v)}
              x2={W - padR} y2={yScale(v)}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"
            />
            <text
              x={padL - 6} y={yScale(v) + 4}
              fontSize="10" fill="rgba(255,255,255,0.3)"
              textAnchor="end">
              {fmtVal(v)}
            </text>
          </g>
        ))}

        {/* X축 눈금 */}
        {xTicks.map(y => (
          <g key={y}>
            <line
              x1={xScale(y)} y1={padT + chartH}
              x2={xScale(y)} y2={padT + chartH + 4}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1"
            />
            <text
              x={xScale(y)} y={padT + chartH + 16}
              fontSize="10" fill="rgba(255,255,255,0.3)"
              textAnchor="middle">
              {y}년
            </text>
          </g>
        ))}

        {/* 원금 기준선 */}
        <line
          x1={padL} y1={yScale(PRINCIPAL)}
          x2={W - padR} y2={yScale(PRINCIPAL)}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 3"
        />
        <text x={padL + 4} y={yScale(PRINCIPAL) - 4} fontSize="9" fill="rgba(255,255,255,0.3)">원금</text>

        {/* 복리 곡선 */}
        {data.map(({ label, color, points }) => (
          <g key={label}>
            <path
              d={makePath(points)}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 끝점 값 */}
            <circle
              cx={xScale(years)}
              cy={yScale(points[years].value)}
              r="4"
              fill={color}
            />
          </g>
        ))}

        {/* X축 */}
        <line
          x1={padL} y1={padT + chartH}
          x2={W - padR} y2={padT + chartH}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1"
        />
      </svg>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
        {data.map(({ label, color, points }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '20px', height: '3px', background: color, borderRadius: '99px', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              연 {label} → <strong style={{ color }}>{fmtVal(points[years].value)}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}