import { type RefObject } from "react"
import { ListTree } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  cameraForBounds,
  cameraForGridScene,
  type CameraState,
} from "@/features/explorer/camera"
import { type SceneNavigationRequest } from "@/features/explorer/exploration-memory"
import { useSceneWorld } from "./hooks/use-scene-world"
import { useViewportCamera } from "./hooks/use-viewport-camera"
import { WorldRenderer } from "./components/WorldRenderer"

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
  onCameraChange,
  onAnimationChange,
}: SceneViewportProps) {
  const world = useSceneWorld(sceneId)
  const positionedScene = world.layout.scenes.get(world.focusedSceneId)
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

  const focusedScene = positionedScene?.scene
  const rootPositioned = world.layout.scenes.get(world.layout.rootSceneId)
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

  return (
    <section
      aria-labelledby="scene-title"
      aria-busy={animating}
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
      <SceneViewportHeading
        embedded={embedded}
        title={sceneTitle}
        relativeZoom={relativeZoom}
        showZoom={Boolean(focusedScene)}
      />

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
        <WorldRenderer
          layout={world.layout}
          camera={cameraState}
          viewport={viewport}
          focusedSceneId={world.focusedSceneId}
          selectedSceneId={selectedSceneId}
          selectedElementId={selectedElementId}
          navigationDisabled={navigationDisabled || animating}
          onEnterScene={enterScene}
          onSelectTopic={onSelectTopic}
        />
      </div>
    </section>
  )
}

/** 표시 방식에 맞는 Scene 제목과 확대 비율을 렌더링한다. */
function SceneViewportHeading({
  embedded,
  title,
  relativeZoom,
  showZoom,
}: {
  embedded: boolean
  title: string
  relativeZoom: number
  showZoom: boolean
}) {
  if (embedded) {
    return (
      <h2 id="scene-title" className="sr-only">
        {title}
      </h2>
    )
  }

  return (
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
          {title}
        </h1>
      </div>

      {showZoom ? (
        <p className="text-xs text-muted-foreground">{relativeZoom}%</p>
      ) : null}
    </div>
  )
}
