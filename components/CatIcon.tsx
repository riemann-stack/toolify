/* 카테고리 라인 아이콘 — Tabler Icons(MIT, tabler.io/icons) outline 경로.
   이모지 대신 stroke 아이콘을 써서 OS 렌더링 차이 없이 솔리드 타일 위에 균일하게 표시.
   색은 currentColor 상속 — 사용처에서 color로 제어. */

const CAT_PATHS: Record<string, string[]> = {
  finance: [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1',
    'M12 7v10',
  ],
  health: [
    'M19.5 13.572l-7.5 7.428l-2.896 -2.868m-6.117 -8.104a5 5 0 0 1 9.013 -3.022a5 5 0 1 1 7.5 6.572',
    'M3 13h2l2 3l2 -6l1 3h3',
  ],
  cooking: [
    'M12 3c1.918 0 3.52 1.35 3.91 3.151a4 4 0 0 1 2.09 7.723l0 7.126h-12v-7.126a4 4 0 1 1 2.092 -7.723a4 4 0 0 1 3.908 -3.151z',
    'M6.161 17.009l11.839 -.009',
  ],
  life: [
    'M4 5h2', 'M5 4v2', 'M11.5 4l-.5 2', 'M18 5h2', 'M19 4v2',
    'M15 9l-1 1', 'M18 13l2 -.5', 'M18 19h2', 'M19 18v2',
    'M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39z',
  ],
  sports: [
    'M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M4 17l5 1l.75 -1.5',
    'M15 21l0 -4l-4 -3l1 -6',
    'M7 12l0 -3l5 -1l3 3l3 1',
  ],
  interior: [
    'M5 12l-2 0l9 -9l9 9l-2 0',
    'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7',
    'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6',
  ],
  unit: [
    'M17 3l4 4l-14 14l-4 -4z',
    'M16 7l-1.5 -1.5', 'M13 10l-1.5 -1.5', 'M10 13l-1.5 -1.5', 'M7 16l-1.5 -1.5',
  ],
  date: [
    'M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z',
    'M16 3v4', 'M8 3v4', 'M4 11h16', 'M11 15h1', 'M12 15v3',
  ],
  art: [
    'M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25',
    'M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  edu: [
    'M22 9l-10 -4l-10 4l10 4l10 -4v6',
    'M6 10.6v5.4a6 3 0 0 0 12 0v-5.4',
  ],
  dev: [
    'M7 8l-4 4l4 4',
    'M17 8l4 4l-4 4',
    'M14 4l-4 16',
  ],
}

export default function CatIcon({ id, size = 20 }: { id: string; size?: number }) {
  const paths = CAT_PATHS[id]
  if (!paths) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map(d => <path key={d} d={d} />)}
    </svg>
  )
}
