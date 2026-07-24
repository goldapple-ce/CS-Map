import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { WorldRenderer } from "@/components/scene/WorldRenderer"
import {
  createWorldLayout,
  type WorldLayout,
} from "@/components/scene/world-layout"
import { Button } from "@/components/ui/button"
import { contentRepository } from "@/content/content-repository"
import {
  cameraForBounds,
  type CameraState,
  type ViewportSize,
} from "@/features/explorer/camera"
import {
  getSceneSnapshot,
  type SceneNavigationRequest,
} from "@/features/explorer/exploration-memory"

type WorldLoadState =
  | { status: "loading" }
  | { status: "loaded"; layout: WorldLayout }
  | { status: "error"; message: string }

type SceneViewportProps = {
  sceneId?: string
  routeNotFound: boolean
  navigationDisabled: boolean
  reducedMotion: boolean
  onEnterScene: (request: SceneNavigationRequest) => void
  onShowPlanned: (elementId: string, label: string) => void
  onSceneReady: (sceneId: string, title: string) => void
  onCameraChange: (camera: CameraState) => void
  onAnimationChange: (animating: boolean) => void
}

const DEFAULT_CAMERA: CameraState = { centerX: 640, centerY: 360, scale: 1 }

export function SceneViewport({
  sceneId,
  routeNotFound,
  navigationDisabled,
  reducedMotion,
  onEnterScene,
  onShowPlanned,
  onSceneReady,
  onCameraChange,
  onAnimationChange,
}: SceneViewportProps) {
  const navigate = useNavigate()
  const viewportRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const cameraRef = useRef(DEFAULT_CAMERA)
  const initializedRef = useRef(false)
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 1,
    height: 1,
  })
  const [camera, setCamera] = useState(DEFAULT_CAMERA)
  const [worldState, setWorldState] = useState<WorldLoadState>({
    status: "loading",
  })
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all(
      contentRepository
        .listRoutes()
        .map(({ id }) => contentRepository.loadScene(id))
    )
      .then((loaded) => {
        if (!active) return
        setWorldState({
          status: "loaded",
          layout: createWorldLayout(loaded.map(({ scene }) => scene)),
        })
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
      })
    return () => {
      active = false
    }
  }, [])

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
      viewport.width <= 1 ||
      viewport.height <= 1
    )
      return
    const positioned = worldState.layout.scenes.get(sceneId)
    if (!positioned) return
    const savedCamera = getSceneSnapshot(sceneId)?.camera
    const target = savedCamera ?? cameraForBounds(positioned.bounds, viewport)
    animateCamera(target, !initializedRef.current)
    initializedRef.current = true
    onSceneReady(sceneId, positioned.scene.title)
  }, [
    animateCamera,
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
    worldState.status === "loaded" && sceneId
      ? worldState.layout.scenes.get(sceneId)?.scene
      : undefined
  const rootPositioned =
    worldState.status === "loaded"
      ? worldState.layout.scenes.get(worldState.layout.rootSceneId)
      : undefined
  const rootCamera = rootPositioned
    ? cameraForBounds(rootPositioned.bounds, viewport)
    : undefined
  const relativeZoom = rootCamera
    ? Math.round((camera.scale / rootCamera.scale) * 100)
    : 100

  return (
    <section
      aria-labelledby="scene-title"
      aria-busy={worldState.status === "loading" || animating}
      className="flex size-full min-h-0 flex-col bg-muted/20"
    >
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
            {routeNotFound
              ? "Topic을 찾을 수 없음"
              : (focusedScene?.title ?? "지식 공간 로딩")}
          </h1>
        </div>
        {focusedScene ? (
          <p className="text-xs text-muted-foreground">{relativeZoom}%</p>
        ) : null}
      </div>

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        {routeNotFound ? (
          <div className="flex size-full items-center justify-center p-8">
            <div className="flex max-w-md flex-col items-start gap-4 rounded-xl border border-border bg-background p-6">
              <h2 className="text-xl font-semibold">
                게시된 Topic이 없습니다.
              </h2>
              <Button onClick={() => navigate("/explore/google-search")}>
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
            focusedSceneId={sceneId}
            navigationDisabled={navigationDisabled || animating}
            onEnterScene={enterScene}
            onShowPlanned={onShowPlanned}
          />
        ) : null}
      </div>
    </section>
  )
}
