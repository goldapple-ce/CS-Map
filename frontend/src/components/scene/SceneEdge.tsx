import type { LayoutPoint } from "@/components/scene/scene-layout"
import type { SceneEdgeElement } from "@/domain/content-types"

type SceneEdgeProps = {
  element: SceneEdgeElement
  points: readonly LayoutPoint[]
}

export function SceneEdge({ element, points }: SceneEdgeProps) {
  if (points.length < 2) return null

  return (
    <g aria-label={element.label} role={element.label ? "img" : undefined}>
      <polyline
        points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd="url(#scene-arrowhead)"
        vectorEffect="non-scaling-stroke"
      />
      {element.label ? <title>{element.label}</title> : null}
    </g>
  )
}
