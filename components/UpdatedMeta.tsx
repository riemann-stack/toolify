/* YMYL(금융·세금·보험) 페이지 상단 신선도·출처 표시 바.
   "연도 넘어가면 낡아 보임"을 완화하고 E-E-A-T(신뢰도) 신호를 줍니다.
   페이지 상단(인트로 아래)에 1회 배치. */

export interface MetaSource {
  label: string
  href: string
}

interface Props {
  /** 최종 검토·업데이트 시점. 예: "2026년 5월" */
  date: string
  /** 기준 근거. 예: "2026년 종합소득세율 기준" */
  basis?: string
  /** 공식 출처 링크 */
  sources?: MetaSource[]
}

export default function UpdatedMeta({ date, basis, sources }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px 14px',
        fontSize: '13px',
        color: 'var(--muted)',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '9px 14px',
        marginBottom: '32px',
        lineHeight: 1.6,
      }}
    >
      <span>
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>최종 업데이트</span> {date}
      </span>
      {basis && <span>· {basis}</span>}
      {sources && sources.length > 0 && (
        <span>
          · 출처:{' '}
          {sources.map((s, i) => (
            <span key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                {s.label} ↗
              </a>
              {i < sources.length - 1 && <span> · </span>}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}
