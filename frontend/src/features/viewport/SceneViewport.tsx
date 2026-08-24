import { cameraForGridScene } from "@/features/explorer/camera"
import { useSceneWorld } from "./use-scene-world"
import { useViewportCamera } from "./use-viewport-camera"
import { WorldRenderer } from "../explorer/components/WorldRenderer"
import { SceneViewportHeader } from "./SceneViewportHeader"
import { ViewportBreadcrumb } from "./ViewportBreadcrumb"

type SceneViewportProps = {
  sceneId: string
  selectedSceneId?: string
  selectedElementId?: string
  navigationDisabled: boolean
  reducedMotion: boolean
  onEnterScene: (sceneId: string) => void
  onSelectTopic: (sceneId: string, elementId: string, label: string) => void
  onAnimationChange: (animating: boolean) => void
}

/** Scene 경로를 불러오고 Camera·선택·전환 상태를 조립한다. */
export function SceneViewport({
  sceneId,
  selectedSceneId,
  selectedElementId,
  navigationDisabled,
  reducedMotion,
  onEnterScene,
  onSelectTopic,
  onAnimationChange,
}: SceneViewportProps) {
  const world = useSceneWorld(sceneId)
  const positionedScene = world.layout.scenes.get(world.focusedSceneId)
  const focusedScene = positionedScene?.scene
  const {
    viewportRef,
    viewport,
    camera: cameraState,
    animating,
  } = useViewportCamera({
    sceneId,
    positionedScene,
    reducedMotion,
    onAnimationChange,
  })

  const rootPositioned = world.layout.scenes.get(world.layout.rootSceneId)
  const rootCamera = rootPositioned
    ? cameraForGridScene(rootPositioned.bounds, rootPositioned.scale, viewport)
    : undefined
  const relativeZoom = rootCamera
    ? Math.round((cameraState.scale / rootCamera.scale) * 100)
    : 100
  const sceneTitle = focusedScene?.title ?? "지식 공간 로딩"

  /** Camera 전환 중이 아닐 때 Child Scene 진입을 전달한다. */
  const enterScene = (targetSceneId: string) => {
    if (animating) return
    onEnterScene(targetSceneId)
  }

  return (
    <section
      aria-labelledby="scene-title"
      aria-busy={animating}
      className="flex size-full min-h-0 flex-col bg-muted/20"
    >
      <SceneViewportHeader title={sceneTitle} relativeZoom={relativeZoom} />

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        <div className="absolute top-4 right-4 left-4 z-10">
          <ViewportBreadcrumb />
        </div>
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
