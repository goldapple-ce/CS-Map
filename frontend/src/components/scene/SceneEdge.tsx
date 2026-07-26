import type { LayoutPoint } from "@/components/scene/scene-layout"
import type { SceneEdgeElement } from "@/domain/content-types"

type SceneEdgeProps = {
  element: SceneEdgeElement
  points: readonly LayoutPoint[]
  contextual?: boolean
}

function labelPosition(points: readonly LayoutPoint[]) {
  let longestSegment = { start: points[0], end: points[1], length: -1 }

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index]
    const end = points[index + 1]
    const length = Math.hypot(end.x - start.x, end.y - start.y)
    if (length > longestSegment.length) {
      longestSegment = { start, end, length }
    }
  }

  const { start, end } = longestSegment
  const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)
  return {
    x: (start.x + end.x) / 2 + (horizontal ? 0 : 12),
    y: (start.y + end.y) / 2 + (horizontal ? -12 : 0),
    textAnchor: horizontal ? ("middle" as const) : ("start" as const),
  }
}

export function SceneEdge({
  element,
  points,
  contextual = false,
}: SceneEdgeProps) {
  if (points.length < 2) return null
  const label = element.label ? labelPosition(points) : undefined
  const supporting = element.variant === "supporting"
  const returning = element.variant === "return"
  const secondary = supporting || returning

  return (
    <g aria-label={element.label} role={element.label ? "img" : undefined}>
      <polyline
        points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={contextual ? "var(--muted-foreground)" : "var(--foreground)"}
        strokeWidth={contextual ? "1.2" : "1.75"}
        opacity={contextual ? "0.2" : secondary ? "0.58" : "0.72"}
        strokeDasharray={secondary ? "8 7" : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd="url(#scene-arrowhead)"
        vectorEffect="non-scaling-stroke"
      />
      {element.label ? <title>{element.label}</title> : null}
      {element.label && label ? (
        <text
          x={label.x}
          y={label.y}
          textAnchor={label.textAnchor}
          dominantBaseline="middle"
          fill={
            contextual || secondary
              ? "var(--muted-foreground)"
              : "var(--foreground)"
          }
          stroke="var(--background)"
          strokeWidth="8"
          strokeLinejoin="round"
          paintOrder="stroke"
          fontSize="18"
          fontWeight="600"
          opacity={contextual ? "0.35" : secondary ? "0.72" : "0.82"}
          aria-hidden="true"
          className="pointer-events-none select-none"
        >
          {element.label}
        </text>
      ) : null}
    </g>
  )
}
