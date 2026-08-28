import type { SceneEdgeElement, SceneNodeElement } from "@shared/content/types"
import { SceneArea } from "@/features/explorer/components/SceneArea"
import { SceneEdge } from "@/features/explorer/components/SceneEdge"
import {
  SceneNode,
  type SceneNodeDensity,
  type SceneNodeState,
} from "@/features/explorer/components/SceneNode"
import { useLightFlowRender } from "@/features/explorer/light-flow-render-context"
import {
  boundsIntersect,
  visibleWorldBounds,
  type CameraState,
  type ViewportSize,
} from "@/features/explorer/camera"
import {
  getSceneAncestors,
  type WorldLayout,
} from "@/features/explorer/layout/world-layout"

type WorldRendererProps = {
  layout: WorldLayout
  camera: CameraState
  viewport: ViewportSize
  focusedSceneId: string
  selectedSceneId?: string
  selectedElementId?: string
  navigationDisabled: boolean
  onEnterScene: (sceneId: string) => void
  // onPrefetchScene: (sceneId: string) => void
  onSelectTopic: (sceneId: string, elementId: string, label: string) => void
}

const MAX_CONTEXT_RENDER_SCALE = 128

/** 현재 Topic 선택과 일치하는 Node의 시각 상태를 결정한다. */
function nodeState(
  element: SceneNodeElement,
  sceneId: string,
  selectedSceneId: string | undefined,
  selectedElementId: string | undefined
): SceneNodeState {
  return sceneId === selectedSceneId && element.id === selectedElementId
    ? "selected"
    : "interactive"
}

/** 화면에 투영된 배율을 Node 정보 밀도 단계로 변환한다. */
function nodeDensity(renderScale: number): SceneNodeDensity {
  if (renderScale < 0.45) return "far"
  if (renderScale < 0.65) return "medium"
  return "near"
}

/** Camera에 보이는 Scene만 World 좌표에서 화면 좌표로 투영해 렌더링한다. */
export function WorldRenderer({
  layout,
  camera,
  viewport,
  focusedSceneId,
  selectedSceneId,
  selectedElementId,
  navigationDisabled,
  onEnterScene,
  onSelectTopic,
}: WorldRendererProps) {
  const lightFlow = useLightFlowRender()
  const visibleBounds = visibleWorldBounds(camera, viewport)
  const ancestors = getSceneAncestors(layout, focusedSceneId)
  const targetChildren = new Map<string, number>()
  for (const positioned of layout.scenes.values()) {
    if (positioned.parentId && positioned.targetElementId) {
      targetChildren.set(
        `${positioned.parentId}/${positioned.targetElementId}`,
        positioned.bounds.width * camera.scale
      )
    }
  }

  const visibleScenes = [...layout.scenes.values()].filter((positioned) => {
    const projectedWidth = positioned.bounds.width * camera.scale
    const renderScale = positioned.scale * camera.scale
    const isFocused = positioned.scene.id === focusedSceneId
    const isAncestor = ancestors.has(positioned.scene.id)
    return (
      boundsIntersect(positioned.bounds, visibleBounds) &&
      (isFocused ||
        (isAncestor && renderScale <= MAX_CONTEXT_RENDER_SCALE) ||
        (!isAncestor && projectedWidth >= 220))
    )
  })

  return (
    <svg
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      className="block size-full bg-background"
      role="img"
      aria-labelledby="world-title world-description"
    >
      <title id="world-title">CS 지식 공간 지도</title>
      <desc id="world-description">
        Topic을 클릭하면 같은 공간 안의 하위 영역으로 카메라가 이동하고
        확대됩니다.
      </desc>
      <defs>
        <marker
          id="scene-arrowhead"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--foreground)" />
        </marker>
      </defs>

      <g>
        {visibleScenes.map((positioned) => {
          const { scene, localLayout } = positioned
          const renderScale = positioned.scale * camera.scale
          const screenX =
            viewport.width / 2 + (positioned.x - camera.centerX) * camera.scale
          const screenY =
            viewport.height / 2 + (positioned.y - camera.centerY) * camera.scale
          const density = nodeDensity(renderScale)
          const isFocused = scene.id === focusedSceneId
          const edges = scene.elements.filter(
            (element): element is SceneEdgeElement => element.kind === "edge"
          )
          const nodes = scene.elements.filter(
            (element): element is SceneNodeElement => element.kind === "node"
          )

          return (
            <g
              key={scene.id}
              transform={`translate(${screenX} ${screenY}) scale(${renderScale})`}
            >
              {isFocused
                ? scene.areas.map((area) => (
                    <SceneArea
                      key={area.id}
                      area={area}
                      sceneWidth={localLayout.width}
                      sceneHeight={localLayout.height}
                      columns={scene.layout.columns}
                      rows={scene.layout.rows}
                    />
                  ))
                : null}
              {edges.map((element) => {
                const points = localLayout.edges.get(element.id)
                return points ? (
                  <SceneEdge
                    key={
                      isFocused && lightFlow.activeEdgeIds.has(element.id)
                        ? `${element.id}-${lightFlow.playbackKey}`
                        : element.id
                    }
                    element={element}
                    points={points}
                    contextual={!isFocused}
                    lightFlowActive={
                      isFocused && lightFlow.activeEdgeIds.has(element.id)
                    }
                  />
                ) : null
              })}
              {nodes.map((element) => {
                const box = localLayout.nodes.get(element.id)
                const childProjectedWidth = targetChildren.get(
                  `${scene.id}/${element.id}`
                )
                if (!box || (childProjectedWidth ?? 0) >= 280) return null
                return (
                  <SceneNode
                    key={element.id}
                    element={element}
                    layout={box}
                    state={nodeState(
                      element,
                      scene.id,
                      selectedSceneId,
                      selectedElementId
                    )}
                    density={density}
                    lightFlowState={
                      isFocused && lightFlow.activeNodeIds.has(element.id)
                        ? lightFlow.nodeState
                        : undefined
                    }
                    navigationDisabled={navigationDisabled}
                    onEnterScene={onEnterScene}
                    onSelectTopic={(elementId, label) =>
                      onSelectTopic(scene.id, elementId, label)
                    }
                  />
                )
              })}
            </g>
          )
        })}
      </g>
    </svg>
  )
}
