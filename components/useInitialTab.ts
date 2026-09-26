'use client'

/* components/useInitialTab.ts — `?tab=` 쿼리로 첫 탭 고르기 (도구 통폐합 301 목적지용)
   ─ 예: /tools/sports/race-plan → 301 → /tools/sports/pace?tab=plan
   ─ 서버 searchParams를 쓰면 페이지가 SSG에서 동적 렌더로 바뀐다 → 마운트 뒤 location.search만 읽는다.
   ─ 허용 목록에 있는 값만 받는다(임의 문자열 무시). canonical은 쿼리 없는 기본 경로 그대로(buildMetadata).
   ─ 마운트 1회만 적용 — 이후 사용자가 탭을 바꾸면 쿼리는 다시 보지 않는다. */
import { useEffect } from 'react'

/** 현재 URL의 쿼리 값 하나(없거나 SSR이면 null) */
export function readQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return new URLSearchParams(window.location.search).get(name)
  } catch {
    return null
  }
}

export function useInitialTab<T extends string>(
  allowed: readonly T[],
  setTab: (tab: T) => void,
  param = 'tab',
): void {
  useEffect(() => {
    const v = readQueryParam(param)
    if (v !== null && (allowed as readonly string[]).includes(v)) setTab(v as T)
    // 마운트 1회만 — allowed·setTab이 렌더마다 새로 만들어져도 다시 적용하지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
