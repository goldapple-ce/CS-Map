type ContentKind = "scene" | "scene-detail" | "concept"

type ContentKindMetrics = {
  requests: number
  cacheHits: number
  failures: number
  prefetches: number
  lastDurationMs?: number
}

export type ContentPerformanceSnapshot = Record<
  ContentKind,
  ContentKindMetrics
>

const metrics: ContentPerformanceSnapshot = {
  scene: { requests: 0, cacheHits: 0, failures: 0, prefetches: 0 },
  "scene-detail": {
    requests: 0,
    cacheHits: 0,
    failures: 0,
    prefetches: 0,
  },
  concept: { requests: 0, cacheHits: 0, failures: 0, prefetches: 0 },
}

declare global {
  interface Window {
    __CS_MAP_CONTENT_METRICS__?: () => ContentPerformanceSnapshot
  }
}

function snapshot(): ContentPerformanceSnapshot {
  return {
    scene: { ...metrics.scene },
    "scene-detail": { ...metrics["scene-detail"] },
    concept: { ...metrics.concept },
  }
}

function report(
  kind: ContentKind,
  event: "request" | "cache-hit" | "prefetch" | "loaded" | "failed",
  id: string
) {
  if (!import.meta.env.DEV) return
  console.info("[CS Map content]", { kind, event, id, metrics: snapshot() })
}

export function recordContentRequest(kind: ContentKind, id: string) {
  if (!import.meta.env.DEV) return 0
  metrics[kind].requests += 1
  report(kind, "request", id)
  return performance.now()
}

export function recordContentCacheHit(kind: ContentKind, id: string) {
  if (!import.meta.env.DEV) return
  metrics[kind].cacheHits += 1
  report(kind, "cache-hit", id)
}

export function recordContentPrefetch(kind: ContentKind, id: string) {
  if (!import.meta.env.DEV) return
  metrics[kind].prefetches += 1
  report(kind, "prefetch", id)
}

export function recordContentLoaded(
  kind: ContentKind,
  id: string,
  startedAt: number
) {
  if (!import.meta.env.DEV) return
  const finishedAt = performance.now()
  metrics[kind].lastDurationMs =
    Math.round((finishedAt - startedAt) * 100) / 100
  performance.measure(`cs-map:${kind}-load`, {
    start: startedAt,
    end: finishedAt,
  })
  report(kind, "loaded", id)
}

export function recordContentFailure(kind: ContentKind, id: string) {
  if (!import.meta.env.DEV) return
  metrics[kind].failures += 1
  report(kind, "failed", id)
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  window.__CS_MAP_CONTENT_METRICS__ = snapshot
}
