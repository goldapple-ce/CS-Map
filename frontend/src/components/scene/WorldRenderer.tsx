import { SceneAnnotation } from "@/components/scene/SceneAnnotation"
import { SceneEdge } from "@/components/scene/SceneEdge"
import { SceneGroup } from "@/components/scene/SceneGroup"
import {
  SceneNode,
  type SceneNodeDensity,
  type SceneNodeState,
} from "@/components/scene/SceneNode"
import type { WorldLayout } from "@/components/scene/world-layout"
import { getSceneAncestors } from "@/components/scene/world-layout"
import type {
  SceneAnnotationElement,
  SceneEdgeElement,
  SceneGroupElement,
  SceneNodeElement,
} from "@/domain/content-types"
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
  navigationDisabled: boolean
  onEnterScene: (sceneId: string, elementId: string) => void
  onShowPlanned: (elementId: string, label: string) => void
}

function nodeState(element: SceneNodeElement): SceneNodeState {
  if (
    (element.targetSceneId || element.navigateToSceneId) &&
    element.status === "published"
  )
    return "interactive"
  if (element.status === "planned") return "planned"
  return "static"
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
  navigationDisabled,
  onEnterScene,
  onShowPlanned,
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
    return (
      boundsIntersect(positioned.bounds, visibleBounds) &&
      (positioned.scene.id === layout.rootSceneId ||
        ancestors.has(positioned.scene.id) ||
        projectedWidth >= 220)
    )
  })
  const semanticLinks = [...layout.scenes.values()].flatMap((owner) =>
    owner.scene.relationships.flatMap((relationship, index) => {
      if (
        relationship.type !== "related" &&
        relationship.type !== "prerequisite" &&
        relationship.type !== "used-by"
      )
        return []
      const source = layout.scenes.get(relationship.sourceSceneId)
      const target = layout.scenes.get(relationship.targetSceneId)
      return source && target ? [{ relationship, source, target, index }] : []
    })
  )
  const translateX = viewport.width / 2 - camera.centerX * camera.scale
  const translateY = viewport.height / 2 - camera.centerY * camera.scale

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

      <g
        transform={`translate(${translateX} ${translateY}) scale(${camera.scale})`}
      >
        {semanticLinks.map(({ relationship, source, target, index }) => (
          <line
            key={`${relationship.type}-${source.scene.id}-${target.scene.id}-${index}`}
            x1={source.bounds.x + source.bounds.width / 2}
            y1={source.bounds.y + source.bounds.height / 2}
            x2={target.bounds.x + target.bounds.width / 2}
            y2={target.bounds.y + target.bounds.height / 2}
            stroke="var(--muted-foreground)"
            strokeWidth="1"
            strokeDasharray="5 7"
            opacity="0.45"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {visibleScenes.map((positioned) => {
          const { scene, localLayout } = positioned
          const projectedWidth = positioned.bounds.width * camera.scale
          const renderScale = positioned.scale * camera.scale
          const density = nodeDensity(renderScale)
          const isFocused = scene.id === focusedSceneId
          const groups = scene.elements.filter(
            (element): element is SceneGroupElement => element.kind === "group"
          )
          const edges = scene.elements.filter(
            (element): element is SceneEdgeElement => element.kind === "edge"
          )
          const annotations = scene.elements.filter(
            (element): element is SceneAnnotationElement =>
              element.kind === "annotation"
          )
          const nodes = scene.elements.filter(
            (element): element is SceneNodeElement => element.kind === "node"
          )

          return (
            <g
              key={scene.id}
              data-world-scene-id={scene.id}
              transform={`translate(${positioned.x} ${positioned.y}) scale(${positioned.scale})`}
            >
              {isFocused && projectedWidth >= 520
                ? groups.map((element) => {
                    const box = localLayout.groups.get(element.id)
                    return box ? (
                      <SceneGroup
                        key={element.id}
                        element={element}
                        layout={box}
                      />
                    ) : null
                  })
                : null}
              {edges.map((element) => {
                const points = localLayout.edges.get(element.id)
                return points ? (
                  <SceneEdge
                    key={element.id}
                    element={element}
                    points={points}
                    contextual={!isFocused}
                    density={density}
                  />
                ) : null
              })}
              {isFocused && projectedWidth >= 720
                ? annotations.map((element) => {
                    const box = localLayout.annotations.get(element.id)
                    return box ? (
                      <SceneAnnotation
                        key={element.id}
                        element={element}
                        layout={box}
                      />
                    ) : null
                  })
                : null}
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
                    state={nodeState(element)}
                    density={density}
                    navigationDisabled={navigationDisabled}
                    onEnterScene={onEnterScene}
                    onShowPlanned={onShowPlanned}
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
