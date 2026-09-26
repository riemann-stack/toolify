/* 정규식 실행을 Web Worker로 격리 — catastrophic backtracking 패턴이 탭 전체를 멈추지 않도록
   제한 시간(기본 1초)을 넘기면 워커를 terminate하고 '시간 초과'로 돌려준다.
   워커 코드는 번들러 설정과 무관하게 동작하도록 Blob 문자열로 만든다 (ES5 문법만 사용, 외부 참조 없음).
   매칭 로직은 regexUtils.runMatches와 같은 규칙: g가 없으면(y 단독 포함) 첫 매치만, g면 전체(최대 max개). */

import type { Mode, RunMatchesResult, RunReplaceResult, RunSplitResult } from './regexUtils'
import { runMatches, runReplace, runSplit, MAX_MATCHES } from './regexUtils'

export const REGEX_TIMEOUT_MS = 1000

export interface RegexJob {
  pattern: string
  flags: string
  text: string
  /** 'none'이면 매칭만 */
  mode: Mode | 'none'
  replacement: string
  max: number
}

export type RegexJobResult =
  | { ok: true; match: RunMatchesResult; replace: RunReplaceResult | null; split: RunSplitResult | null }
  | { ok: false; timedOut: boolean; error: string }

export const REGEX_WORKER_SRC = `
function advance(s, i, u) {
  if (u && i + 1 < s.length) {
    var c = s.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF) {
      var n = s.charCodeAt(i + 1);
      if (n >= 0xDC00 && n <= 0xDFFF) return i + 2;
    }
  }
  return i + 1;
}
function conv(m) {
  var groups = [];
  for (var i = 1; i < m.length; i++) groups.push(m[i] == null ? '' : m[i]);
  var named = {};
  if (m.groups) { for (var k in m.groups) named[k] = m.groups[k] == null ? '' : m.groups[k]; }
  return { index: m.index, length: m[0].length, fullMatch: m[0], groups: groups, namedGroups: named };
}
self.onmessage = function (e) {
  var d = e.data;
  var out;
  try {
    var re = new RegExp(d.pattern, d.flags);
    var t0 = performance.now();
    var matches = [], truncated = false, m;
    re.lastIndex = 0;
    if (!re.global) {
      m = re.exec(d.text);
      if (m) matches.push(conv(m));
    } else {
      while ((m = re.exec(d.text)) !== null) {
        matches.push(conv(m));
        if (m[0] === '') re.lastIndex = advance(d.text, re.lastIndex, re.unicode);
        if (matches.length >= d.max) { truncated = true; break; }
      }
    }
    var match = { matches: matches, executionMs: performance.now() - t0, truncated: truncated };
    var replace = null, split = null, t1;
    if (d.mode === 'replace') {
      re.lastIndex = 0; t1 = performance.now();
      var r = d.text;
      try { r = d.text.replace(re, d.replacement); } catch (err1) {}
      replace = { result: r, executionMs: performance.now() - t1 };
    } else if (d.mode === 'split') {
      re.lastIndex = 0; t1 = performance.now();
      var parts = [];
      try { parts = d.text.split(re); } catch (err2) {}
      split = { parts: parts, executionMs: performance.now() - t1 };
    }
    out = { ok: true, match: match, replace: replace, split: split };
  } catch (err) {
    out = { ok: false, timedOut: false, error: String(err && err.message ? err.message : err) };
  }
  self.postMessage(out);
};
`

/** 워커 없이 메인 스레드에서 실행 (Worker 미지원 환경 폴백) */
export function runRegexJobSync(job: RegexJob): RegexJobResult {
  try {
    const re = new RegExp(job.pattern, job.flags)
    const match = runMatches(re, job.text, job.max)
    const replace = job.mode === 'replace' ? runReplace(re, job.text, job.replacement) : null
    const split = job.mode === 'split' ? runSplit(re, job.text) : null
    return { ok: true, match, replace, split }
  } catch (e) {
    return { ok: false, timedOut: false, error: e instanceof Error ? e.message : String(e) }
  }
}

let workerUrl: string | null = null

/** 작업 하나마다 워커를 새로 띄워 실행하고, 끝나거나 시간 초과면 종료. cancel()로 중간 취소 */
export function runRegexJob(
  job: RegexJob,
  timeoutMs: number = REGEX_TIMEOUT_MS,
): { promise: Promise<RegexJobResult>; cancel: () => void } {
  let worker: Worker | null = null
  try {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined') throw new Error('no worker')
    if (!workerUrl) workerUrl = URL.createObjectURL(new Blob([REGEX_WORKER_SRC], { type: 'text/javascript' }))
    worker = new Worker(workerUrl)
  } catch {
    return { promise: Promise.resolve(runRegexJobSync(job)), cancel: () => {} }
  }
  const w = worker
  let done = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const promise = new Promise<RegexJobResult>((resolve) => {
    const finish = (r: RegexJobResult) => {
      if (done) return
      done = true
      if (timer) clearTimeout(timer)
      w.terminate()
      resolve(r)
    }
    timer = setTimeout(() => finish({ ok: false, timedOut: true, error: '' }), timeoutMs)
    w.onmessage = (e: MessageEvent<RegexJobResult>) => finish(e.data)
    w.onerror = (e) => { e.preventDefault(); finish({ ok: false, timedOut: false, error: e.message || '실행 오류' }) }
    w.postMessage({ ...job, max: job.max || MAX_MATCHES })
  })
  return {
    promise,
    cancel: () => {
      if (done) return
      done = true
      if (timer) clearTimeout(timer)
      w.terminate()
    },
  }
}
