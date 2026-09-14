import { cameraForGridScene } from "@/features/explorer/camera"
import { LightFlowRenderProvider } from "@/features/explorer/light-flow-render-context"
import { useMemo } from "react"
import { useSceneWorld } from "./use-scene-world"
import { useViewportCamera } from "./use-viewport-camera"
import { WorldRenderer } from "../explorer/components/WorldRenderer"
import { SceneViewportHeader } from "./SceneViewportHeader"
import { ViewportBreadcrumb } from "./ViewportBreadcrumb"
import { LightFlowControls } from "./LightFlowControls"
import {
  type LightFlowPhase,
  useLightFlowPlayback,
} from "./use-light-flow-playback"
import type { Scene } from "@shared/content/types"

/** 현재 stage Edge의 출발 또는 도착 Node ID를 모은다. */
function lightFlowNodeIds(
  scene: Scene | undefined,
  edgeIds: ReadonlySet<string>,
  phase: LightFlowPhase | undefined
) {
  const nodeIds = new Set<string>()
  if (!scene || (phase !== "source" && phase !== "target")) return nodeIds
  for (const element of scene.elements) {
    if (element.kind !== "edge" || !edgeIds.has(element.id)) continue
    nodeIds.add(
      phase === "source" ? element.fromElementId : element.toElementId
    )
  }
  return nodeIds
}

type SceneViewportProps = {
  sceneId: string
  selectedSceneId?: string
  selectedElementId?: string
  selectedAreaId?: string
  navigationDisabled: boolean
  reducedMotion: boolean
  onEnterScene: (sceneId: string) => void
  onSelectTopic: (sceneId: string, elementId: string, label: string) => void
  onSelectArea: (sceneId: string, areaId: string, label: string) => void
  onAnimationChange: (animating: boolean) => void
}

/** Scene 경로를 불러오고 Camera·선택·전환 상태를 조립한다. */
export function SceneViewport({
  sceneId,
  selectedSceneId,
  selectedElementId,
  selectedAreaId,
  navigationDisabled,
  reducedMotion,
  onEnterScene,
  onSelectTopic,
  onSelectArea,
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
  const lightFlows = focusedScene?.lightFlows ?? []
  const lightFlow = useLightFlowPlayback({
    sceneId: world.focusedSceneId,
    scene: focusedScene,
    lightFlows,
    blocked: navigationDisabled || animating,
  })
  const activeLightFlowNodeIds = useMemo(
    () =>
      lightFlowNodeIds(focusedScene, lightFlow.stageEdgeIds, lightFlow.phase),
    [focusedScene, lightFlow.phase, lightFlow.stageEdgeIds]
  )

  /** Camera 전환 중이 아닐 때 Child Scene 진입을 전달한다. */
  const enterScene = (targetSceneId: string) => {
    if (animating) return
    lightFlow.cancel()
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
        <div className="absolute top-4 left-4 z-10">
          <ViewportBreadcrumb />
        </div>
        <div className="absolute top-4 right-4 z-10">
          <LightFlowControls
            lightFlows={lightFlows}
            playing={lightFlow.status === "playing"}
            disabled={navigationDisabled || animating}
            onPlay={lightFlow.play}
          />
        </div>
        <LightFlowRenderProvider
          activeEdgeIds={lightFlow.activeEdgeIds}
          activeNodeIds={activeLightFlowNodeIds}
          nodeState={
            lightFlow.phase === "source" || lightFlow.phase === "target"
              ? lightFlow.phase
              : undefined
          }
          playbackKey={
            lightFlow.activeFlowId && lightFlow.activeStageIndex !== undefined
              ? `${lightFlow.runToken}-${lightFlow.activeFlowId}-${lightFlow.activeStageIndex}`
              : undefined
          }
        >
          <WorldRenderer
            layout={world.layout}
            camera={cameraState}
            viewport={viewport}
            focusedSceneId={world.focusedSceneId}
            selectedSceneId={selectedSceneId}
            selectedElementId={selectedElementId}
            selectedAreaId={selectedAreaId}
            navigationDisabled={navigationDisabled || animating}
            onEnterScene={enterScene}
            onSelectTopic={onSelectTopic}
            onSelectArea={onSelectArea}
          />
        </LightFlowRenderProvider>
      </div>
    </section>
  )
}
