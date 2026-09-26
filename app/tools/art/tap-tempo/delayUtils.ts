/* 탭 템포 계산기 ▸ 「딜레이 계산」 탭 계산 로직 (구 /tools/art/bpm BpmClient에서 이동 — 수식 원본 그대로) */

export const PRESETS = [60, 80, 100, 120, 140, 160]

export const NOTES = [
  { label: '2분음표', factor: 2 },
  { label: '4분음표', factor: 1 },
  { label: '8분음표', factor: 0.5 },
  { label: '16분음표', factor: 0.25 },
]

/* 원값(ms, 미반올림) — 점음표·셋잇단은 반드시 이 원값에 배율을 곱한 뒤 반올림해야
   소수 BPM에서 이중 반올림 오차(예: 128.5 BPM 점4분 701→700)가 없다 */
export function rawDelay(bpm: number, factor: number) {
  return (60000 / bpm) * factor
}
export function calcDelay(bpm: number, factor: number) {
  return Math.round(rawDelay(bpm, factor))
}

/** ?bpm= 쿼리·탭 측정값 → 입력 초기값 문자열 (1~300 밖·비숫자면 null)
 *  구 bpm/page.tsx 서버 searchParams 검증과 같은 규칙 — 소수 1자리 보존
 *  (FAQ가 소수 BPM 지원을 명시하고 탭 템포 연동값도 소수일 수 있음 — 정수 반올림 금지) */
export function normalizeBpmParam(raw: string | null | undefined): string | null {
  const parsed = parseFloat(typeof raw === 'string' ? raw : '')
  return parsed >= 1 && parsed <= 300 ? String(Math.round(parsed * 10) / 10) : null
}
