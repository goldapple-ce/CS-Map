import { SceneAnnotation } from "@/components/scene/SceneAnnotation"
import { SceneEdge } from "@/components/scene/SceneEdge"
import { SceneGroup } from "@/components/scene/SceneGroup"
import { SceneNode, type SceneNodeState } from "@/components/scene/SceneNode"
import { createSceneLayout } from "@/components/scene/scene-layout"
import type {
  Scene,
  SceneAnnotationElement,
  SceneEdgeElement,
  SceneGroupElement,
  SceneNodeElement,
} from "@/domain/content-types"

type SceneRendererProps = {
  scene: Scene
  selectedElementId?: string
  navigationDisabled?: boolean
  onEnterScene?: (sceneId: string, elementId: string) => void
}

function nodeState(
  element: SceneNodeElement,
  selectedElementId?: string
): SceneNodeState {
  if (element.id === selectedElementId) return "selected"
  if (
    (element.targetSceneId || element.navigateToSceneId) &&
    element.status === "published"
  )
    return "interactive"
  if (element.status === "planned") return "planned"
  return "static"
}

export function SceneRenderer({
  scene,
  selectedElementId,
  navigationDisabled = false,
  onEnterScene,
}: SceneRendererProps) {
  const layout = createSceneLayout(scene)
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
    <figure className="flex size-full min-h-0 items-center justify-center overflow-hidden p-5">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="scene-diagram-title scene-diagram-description"
        className="block size-full rounded-xl border border-border bg-background shadow-sm"
      >
        <title id="scene-diagram-title">{scene.title}</title>
        <desc id="scene-diagram-description">{scene.ariaLabel}</desc>
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
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
          </marker>
        </defs>

        {groups.map((element) => {
          const elementLayout = layout.groups.get(element.id)
          return elementLayout ? (
            <SceneGroup
              key={element.id}
              element={element}
              layout={elementLayout}
            />
          ) : null
        })}
        {edges.map((element) => {
          const points = layout.edges.get(element.id)
          return points ? (
            <SceneEdge key={element.id} element={element} points={points} />
          ) : null
        })}
        {annotations.map((element) => {
          const elementLayout = layout.annotations.get(element.id)
          return elementLayout ? (
            <SceneAnnotation
              key={element.id}
              element={element}
              layout={elementLayout}
            />
          ) : null
        })}
        {nodes.map((element) => {
          const elementLayout = layout.nodes.get(element.id)
          return elementLayout ? (
            <SceneNode
              key={element.id}
              element={element}
              layout={elementLayout}
              state={nodeState(element, selectedElementId)}
              navigationDisabled={navigationDisabled}
              onEnterScene={onEnterScene}
            />
          ) : null
        })}
      </svg>
      <figcaption className="sr-only">{scene.summary}</figcaption>
    </figure>
  )
}
