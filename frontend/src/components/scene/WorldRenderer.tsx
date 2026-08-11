import { SceneEdge } from "@/components/scene/SceneEdge"
import { SceneArea } from "@/components/scene/SceneArea"
import {
  SceneNode,
  type SceneNodeDensity,
  type SceneNodeState,
} from "@/components/scene/SceneNode"
import type { WorldLayout } from "@/components/scene/world-layout"
import { getSceneAncestors } from "@/components/scene/world-layout"
import type { SceneEdgeElement, SceneNodeElement } from "@/domain/content-types"
import {
  boundsIntersect,
  visibleWorldBounds,
  type CameraState,
  type ViewportSize,
} from "@/features/explorer/camera"

type WorldRendererProps = {
  layout: WorldLayout
  camera: CameraState
  viewport: ViewportSize
  focusedSceneId: string
  selectedSceneId?: string
  selectedElementId?: string
  navigationDisabled: boolean
  onEnterScene: (sceneId: string, elementId: string) => void
  onPrefetchScene: (sceneId: string) => void
  onSelectTopic: (sceneId: string, elementId: string, label: string) => void
}

const MAX_CONTEXT_RENDER_SCALE = 128

function nodeState(
  element: SceneNodeElement,
  sceneId: string,
  selectedSceneId: string | undefined,
  selectedElementId: string | undefined,
): SceneNodeState {
  return sceneId === selectedSceneId && element.id === selectedElementId
    ? "selected"
    : "interactive"
}

function nodeDensity(renderScale: number): SceneNodeDensity {
  if (renderScale < 0.45) return "far"
  if (renderScale < 0.65) return "medium"
  return "near"
}

export function WorldRenderer({
  layout,
  camera,
  viewport,
  focusedSceneId,
  selectedSceneId,
  selectedElementId,
  navigationDisabled,
  onEnterScene,
  onPrefetchScene,
  onSelectTopic,
}: WorldRendererProps) {
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
            viewport.width / 2 +
            (positioned.x - camera.centerX) * camera.scale
          const screenY =
            viewport.height / 2 +
            (positioned.y - camera.centerY) * camera.scale
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
              data-world-scene-id={scene.id}
              transform={`translate(${screenX} ${screenY}) scale(${renderScale})`}
            >
              {scene.areas.map((area) => (
                <SceneArea
                  key={area.id}
                  area={area}
                  sceneWidth={localLayout.width}
                  sceneHeight={localLayout.height}
                  columns={scene.layout?.columns ?? 5}
                  rows={scene.layout?.rows ?? 5}
                />
              ))}
              {edges.map((element) => {
                const points = localLayout.edges.get(element.id)
                return points ? (
                  <SceneEdge
                    key={element.id}
                    element={element}
                    points={points}
                    contextual={!isFocused}
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
                    navigationDisabled={navigationDisabled}
                    onEnterScene={onEnterScene}
                    onPrefetchScene={onPrefetchScene}
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
