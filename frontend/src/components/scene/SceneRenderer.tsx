import { SceneAnnotation } from "@/components/scene/SceneAnnotation"
import { SceneEdge } from "@/components/scene/SceneEdge"
import { SceneGroup } from "@/components/scene/SceneGroup"
import { SceneNode, type SceneNodeState } from "@/components/scene/SceneNode"
import type { Scene, SceneElement } from "@/domain/content-types"

type SceneRendererProps = {
  scene: Scene
}

function nodeState(element: SceneElement): SceneNodeState {
  if (element.status === "published") return "interactive"
  if (element.status === "planned") return "planned"
  return "static"
}

export function SceneRenderer({ scene }: SceneRendererProps) {
  const elementsByKind = (kind: SceneElement["kind"]) =>
    scene.elements.filter((element) => element.kind === kind)

  return (
    <figure className="flex size-full min-h-0 items-center justify-center overflow-hidden p-5">
      <svg
        viewBox={`0 0 ${scene.canvas.width} ${scene.canvas.height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-labelledby="scene-diagram-title scene-diagram-description"
        className="block size-full rounded-xl border border-border bg-background shadow-sm"
      >
        <title id="scene-diagram-title">{scene.title}</title>
        <desc id="scene-diagram-description">{scene.canvas.ariaLabel}</desc>
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

        {elementsByKind("group").map((element) => (
          <SceneGroup key={element.id} element={element} />
        ))}
        {elementsByKind("edge").map((element) => (
          <SceneEdge key={element.id} element={element} />
        ))}
        {elementsByKind("annotation").map((element) => (
          <SceneAnnotation key={element.id} element={element} />
        ))}
        {elementsByKind("node").map((element) => (
          <SceneNode
            key={element.id}
            element={element}
            state={nodeState(element)}
          />
        ))}
      </svg>
      <figcaption className="sr-only">{scene.summary}</figcaption>
    </figure>
  )
}
