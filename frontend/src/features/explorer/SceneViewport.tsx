import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import { ListTree } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { WorldRenderer } from "@/components/scene/WorldRenderer"
import {
  createWorldLayout,
  type WorldLayout,
} from "@/components/scene/world-layout"
import { Button } from "@/components/ui/button"
import { contentRepository } from "@/content/content-repository"
import type { RouteIndexEntry } from "@/content/repository"
import {
  cameraForBounds,
  cameraForGridScene,
  cameraForWidth,
  type CameraState,
  type ViewportSize,
} from "@/features/explorer/camera"
import {
  getSceneSnapshot,
  type SceneNavigationRequest,
} from "@/features/explorer/exploration-memory"

type WorldLoadState =
  | { status: "loading" }
  | { status: "loaded"; focusedSceneId: string; layout: WorldLayout }
  | { status: "error"; message: string }

type SceneViewportProps = {
  sceneId?: string
  selectedSceneId?: string
  selectedElementId?: string
  routeNotFound: boolean
  navigationDisabled: boolean
  reducedMotion: boolean
  outlineTriggerRef?: RefObject<HTMLButtonElement | null>
  presentation?: "explorer" | "embedded"
  onOpenOutline?: () => void
  onEnterScene: (request: SceneNavigationRequest) => void
  onSelectTopic: (sceneId: string, elementId: string, label: string) => void
  onSceneReady: (sceneId: string, title: string) => void
  onCameraChange: (camera: CameraState) => void
  onAnimationChange: (animating: boolean) => void
}

const DEFAULT_CAMERA: CameraState = { centerX: 640, centerY: 360, scale: 1 }

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void) => number
  cancelIdleCallback?: (handle: number) => void
}

function scenePathIds(
  sceneId: string,
  routes: readonly RouteIndexEntry[]
) {
  const routesById = new Map(routes.map((route) => [route.id, route]))
  const path: string[] = []
  const visited = new Set<string>()
  let current = routesById.get(sceneId)

  if (!current) throw new Error(`Unknown Scene route: ${sceneId}`)

  while (current) {
    if (visited.has(current.id)) {
      throw new Error(`Cyclic Scene route ancestry: ${current.id}`)
    }
    visited.add(current.id)
    path.unshift(current.id)
    if (!current.parentId) break
    const parent = routesById.get(current.parentId)
    if (!parent) {
      throw new Error(
        `Scene route ${current.id} references unknown parent: ${current.parentId}`
      )
    }
    current = parent
  }

  return path
}

function recordScenePathReady(
  sceneId: string,
  requestedSceneCount: number,
  totalSceneCount: number,
  startedAt: number
) {
  if (!import.meta.env.DEV) return
  const finishedAt = performance.now()
  performance.measure("cs-map:scene-path-ready", {
    start: startedAt,
    end: finishedAt,
  })
  console.info("[CS Map performance]", {
    metric: "scene-path-ready",
    sceneId,
    durationMs: Math.round((finishedAt - startedAt) * 100) / 100,
    requestedSceneCount,
    totalSceneCount,
  })
}

export function SceneViewport({
  sceneId,
  selectedSceneId,
  selectedElementId,
  routeNotFound,
  navigationDisabled,
  reducedMotion,
  outlineTriggerRef,
  presentation = "explorer",
  onOpenOutline,
  onEnterScene,
  onSelectTopic,
  onSceneReady,
  onCameraChange,
  onAnimationChange,
}: SceneViewportProps) {
  const navigate = useNavigate()
  const rootPath =
    contentRepository.listRoutes().find(({ parentId }) => !parentId)?.path ??
    "/explore/google-com"
  const embedded = presentation === "embedded"
  const viewportRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const cameraRef = useRef(DEFAULT_CAMERA)
  const initializedRef = useRef(false)
  const pendingAnnouncementRef = useRef<string>()
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 1,
    height: 1,
  })
  const [camera, setCamera] = useState(DEFAULT_CAMERA)
  const [worldState, setWorldState] = useState<WorldLoadState>({
    status: "loading",
  })
  const [loadingSceneId, setLoadingSceneId] = useState<string>()
  const [animating, setAnimating] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    if (routeNotFound || !sceneId) return
    let active = true
    const routes = contentRepository.listRoutes()
    const startedAt = performance.now()
    let pathIds: string[]
    try {
      pathIds = scenePathIds(sceneId, routes)
    } catch (error: unknown) {
      setWorldState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "현재 Scene 경로를 찾지 못했습니다.",
      })
      return
    }
    setLoadingSceneId(sceneId)
    Promise.all(pathIds.map((id) => contentRepository.loadSceneMap(id)))
      .then((loaded) => {
        if (!active) return
        recordScenePathReady(sceneId, pathIds.length, routes.length, startedAt)
        setWorldState({
          status: "loaded",
          focusedSceneId: sceneId,
          layout: createWorldLayout(loaded),
        })
        setLoadingSceneId(undefined)
      })
      .catch((error: unknown) => {
        if (!active) return
        setWorldState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "지식 공간을 불러오지 못했습니다.",
        })
        setLoadingSceneId(undefined)
      })
    return () => {
      active = false
    }
  }, [routeNotFound, sceneId])

  const prefetchScene = useCallback((targetSceneId: string) => {
    void contentRepository.prefetchScene(targetSceneId)
  }, [])

  useEffect(() => {
    if (worldState.status !== "loaded") return
    const focusedScene = worldState.layout.scenes.get(
      worldState.focusedSceneId
    )?.scene
    if (!focusedScene) return
    const targets = new Set(
      focusedScene.elements.flatMap((element) =>
        element.kind === "node"
          ? [element.targetSceneId, element.navigateToSceneId].filter(
              (id): id is string => Boolean(id)
            )
          : []
      )
    )
    if (targets.size === 0) return

    const idleWindow = window as IdleWindow
    const run = () => {
      for (const targetSceneId of targets) prefetchScene(targetSceneId)
    }
    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(run)
      return () => idleWindow.cancelIdleCallback?.(handle)
    }
    const handle = window.setTimeout(run, 200)
    return () => window.clearTimeout(handle)
  }, [prefetchScene, worldState])

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setViewport({
        width: Math.max(entry.contentRect.width, 1),
        height: Math.max(entry.contentRect.height, 1),
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const updateCamera = useCallback(
    (next: CameraState) => {
      cameraRef.current = next
      setCamera(next)
      onCameraChange(next)
    },
    [onCameraChange]
  )

  const animateCamera = useCallback(
    (target: CameraState, immediate: boolean) => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
      if (immediate || reducedMotion) {
        updateCamera(target)
        setAnimating(false)
        if (pendingAnnouncementRef.current) {
          setAnnouncement(pendingAnnouncementRef.current)
          pendingAnnouncementRef.current = undefined
        }
        onAnimationChange(false)
        return
      }

      const start = cameraRef.current
      const viewportCenterX = viewport.width / 2
      const viewportCenterY = viewport.height / 2
      const startTranslateX = viewportCenterX - start.centerX * start.scale
      const startTranslateY = viewportCenterY - start.centerY * start.scale
      const targetTranslateX = viewportCenterX - target.centerX * target.scale
      const targetTranslateY = viewportCenterY - target.centerY * target.scale
      const startedAt = performance.now()
      const duration = 620
      setAnimating(true)
      onAnimationChange(true)

      const frame = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const scale = start.scale + (target.scale - start.scale) * eased
        const translateX =
          startTranslateX + (targetTranslateX - startTranslateX) * eased
        const translateY =
          startTranslateY + (targetTranslateY - startTranslateY) * eased
        updateCamera({
          centerX: (viewportCenterX - translateX) / scale,
          centerY: (viewportCenterY - translateY) / scale,
          scale,
        })
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(frame)
        } else {
          animationFrameRef.current = undefined
          setAnimating(false)
          if (pendingAnnouncementRef.current) {
            setAnnouncement(pendingAnnouncementRef.current)
            pendingAnnouncementRef.current = undefined
          }
          onAnimationChange(false)
        }
      }
      animationFrameRef.current = requestAnimationFrame(frame)
    },
    [onAnimationChange, reducedMotion, updateCamera, viewport]
  )

  useEffect(() => {
    if (
      routeNotFound ||
      !sceneId ||
      worldState.status !== "loaded" ||
      worldState.focusedSceneId !== sceneId ||
      viewport.width <= 1 ||
      viewport.height <= 1
    )
      return
    const positioned = worldState.layout.scenes.get(sceneId)
    if (!positioned) return
    const savedCamera = embedded ? undefined : getSceneSnapshot(sceneId)?.camera
    const target =
      savedCamera ??
      (embedded
        ? cameraForWidth(positioned.bounds, viewport)
        : positioned.scene.layout?.type === "grid"
          ? cameraForGridScene(positioned.bounds, positioned.scale, viewport)
          : cameraForBounds(positioned.bounds, viewport))
    pendingAnnouncementRef.current = `${positioned.scene.title} Topic으로 이동했습니다.`
    onSceneReady(sceneId, positioned.scene.title)
    animateCamera(target, !initializedRef.current)
    initializedRef.current = true
  }, [
    animateCamera,
    embedded,
    onSceneReady,
    routeNotFound,
    sceneId,
    viewport,
    worldState,
  ])

  useEffect(
    () => () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
    },
    []
  )

  const enterScene = (targetSceneId: string, elementId: string) => {
    if (animating) return
    onEnterScene({
      sceneId: targetSceneId,
      elementId,
      camera: cameraRef.current,
    })
  }

  const focusedScene =
    worldState.status === "loaded"
      ? worldState.layout.scenes.get(worldState.focusedSceneId)?.scene
      : undefined
  const rootPositioned =
    worldState.status === "loaded"
      ? worldState.layout.scenes.get(worldState.layout.rootSceneId)
      : undefined
  const rootCamera = rootPositioned
    ? rootPositioned.scene.layout?.type === "grid"
      ? cameraForGridScene(
          rootPositioned.bounds,
          rootPositioned.scale,
          viewport
        )
      : cameraForBounds(rootPositioned.bounds, viewport)
    : undefined
  const relativeZoom = rootCamera
    ? Math.round((camera.scale / rootCamera.scale) * 100)
    : 100
  const sceneTitle = routeNotFound
    ? "Topic을 찾을 수 없음"
    : (focusedScene?.title ?? "지식 공간 로딩")

  return (
    <section
      aria-labelledby="scene-title"
      aria-busy={
        worldState.status === "loading" || Boolean(loadingSceneId) || animating
      }
      className={
        embedded
          ? "flex size-full min-h-0 flex-col"
          : "flex size-full min-h-0 flex-col bg-muted/20"
      }
    >
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
      {embedded ? (
        <h2 id="scene-title" className="sr-only">
          {sceneTitle}
        </h2>
      ) : (
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              World viewport
            </p>
            <h1
              id="scene-title"
              tabIndex={-1}
              className="text-lg font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {sceneTitle}
            </h1>
          </div>
          {focusedScene ? (
            <p className="text-xs text-muted-foreground">{relativeZoom}%</p>
          ) : null}
        </div>
      )}

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        {onOpenOutline ? (
          <Button
            ref={outlineTriggerRef}
            type="button"
            variant="outline"
            size="sm"
            disabled={navigationDisabled || animating}
            aria-haspopup="dialog"
            className="absolute top-4 left-4 z-10 bg-background/90 shadow-sm backdrop-blur-sm"
            onClick={onOpenOutline}
          >
            <ListTree aria-hidden="true" />
            목차
          </Button>
        ) : null}
        {routeNotFound ? (
          <div className="flex size-full items-center justify-center p-8">
            <div className="flex max-w-md flex-col items-start gap-4 rounded-xl border border-border bg-background p-6">
              <h2 className="text-xl font-semibold">
                게시된 Topic이 없습니다.
              </h2>
              <Button onClick={() => navigate(rootPath)}>
                루트로
              </Button>
            </div>
          </div>
        ) : null}
        {worldState.status === "loading" ? (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            논리적 지식 공간을 구성하는 중입니다.
          </div>
        ) : null}
        {worldState.status === "error" ? (
          <div className="flex size-full items-center justify-center p-8 text-sm text-destructive">
            {worldState.message}
          </div>
        ) : null}
        {worldState.status === "loaded" && sceneId && !routeNotFound ? (
          <WorldRenderer
            layout={worldState.layout}
            camera={camera}
            viewport={viewport}
            focusedSceneId={worldState.focusedSceneId}
            selectedSceneId={selectedSceneId}
            selectedElementId={selectedElementId}
            navigationDisabled={navigationDisabled || animating}
            onEnterScene={enterScene}
            onPrefetchScene={prefetchScene}
            onSelectTopic={onSelectTopic}
          />
        ) : null}
      </div>
    </section>
  )
}
