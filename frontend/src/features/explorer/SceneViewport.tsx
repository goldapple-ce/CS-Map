import { useEffect, type RefObject } from "react"
import { ListTree } from "lucide-react"

import { WorldRenderer } from "@/features/explorer/components/WorldRenderer"
import { Button } from "@/components/ui/button"
import {
  cameraForBounds,
  cameraForGridScene,
  type CameraState,
} from "@/features/explorer/camera"
import { type SceneNavigationRequest } from "@/features/explorer/exploration-memory"
import { useSceneWorld } from "./hooks/use-scene-world"
import { useViewportCamera } from "./hooks/use-viewport-camera"

type SceneViewportProps = {
  sceneId: string
  selectedSceneId?: string
  selectedElementId?: string
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

/** Scene 경로를 불러오고 Camera·선택·전환 상태를 조립한다. */
export function SceneViewport({
  sceneId,
  selectedSceneId,
  selectedElementId,
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
  const world = useSceneWorld(sceneId)

  const positionedScene =
    world.state.status === "loaded"
      ? world.state.layout.scenes.get(sceneId)
      : undefined

  const embedded = presentation === "embedded"

  const {
    viewportRef,
    viewport,
    camera: cameraState,
    animating,
    announcement,
  } = useViewportCamera({
    sceneId,
    positionedScene,
    embedded,
    reducedMotion,
    onCameraChange,
    onAnimationChange,
  })

  const focusedScene =
    world.state.status === "loaded"
      ? world.state.layout.scenes.get(world.state.focusedSceneId)?.scene
      : undefined
  const rootPositioned =
    world.state.status === "loaded"
      ? world.state.layout.scenes.get(world.state.layout.rootSceneId)
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
    ? Math.round((cameraState.scale / rootCamera.scale) * 100)
    : 100
  const sceneTitle = focusedScene?.title ?? "지식 공간 로딩"

  /** 현재 Camera를 포함한 Child Scene 진입 요청을 전달한다. */
  const enterScene = (targetSceneId: string, elementId: string) => {
    if (animating) return
    onEnterScene({
      sceneId: targetSceneId,
      elementId,
      camera: cameraState,
    })
  }

  useEffect(() => {
    if (!focusedScene) return

    onSceneReady(sceneId, focusedScene.title)
  }, [focusedScene, onSceneReady, sceneId])

  return (
    <section
      aria-labelledby="scene-title"
      aria-busy={world.state.status === "loading" || animating}
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
        {world.state.status === "loading" ? (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            논리적 지식 공간을 구성하는 중입니다.
          </div>
        ) : null}
        {world.state.status === "error" ? (
          <div className="flex size-full items-center justify-center p-8 text-sm text-destructive">
            {world.state.message}
          </div>
        ) : null}
        {world.state.status === "loaded" ? (
          <WorldRenderer
            layout={world.state.layout}
            camera={cameraState}
            viewport={viewport}
            focusedSceneId={world.state.focusedSceneId}
            selectedSceneId={selectedSceneId}
            selectedElementId={selectedElementId}
            navigationDisabled={navigationDisabled || animating}
            onEnterScene={enterScene}
            onSelectTopic={onSelectTopic}
          />
        ) : null}
      </div>
    </section>
  )
}
