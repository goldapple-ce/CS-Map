import type { LayoutPoint } from "@/components/scene/scene-layout"
import type { SceneEdgeElement } from "@/domain/content-types"

type SceneEdgeProps = {
  element: SceneEdgeElement
  points: readonly LayoutPoint[]
  contextual?: boolean
}

const LABEL_FONT_SIZE = 12
const LABEL_OUTLINE_WIDTH = 4

function labelPosition(points: readonly LayoutPoint[], clearance: number) {
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
    x: (start.x + end.x) / 2 + (horizontal ? 0 : clearance),
    y: (start.y + end.y) / 2 + (horizontal ? -clearance : 0),
    textAnchor: horizontal ? ("middle" as const) : ("start" as const),
  }
}

export function SceneEdge({
  element,
  points,
  contextual = false,
}: SceneEdgeProps) {
  if (points.length < 2) return null
  const labelClearance =
    LABEL_FONT_SIZE / 2 + LABEL_OUTLINE_WIDTH / 2 + 6
  const label = element.label
    ? labelPosition(points, labelClearance)
    : undefined
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
          strokeWidth={LABEL_OUTLINE_WIDTH}
          strokeLinejoin="round"
          paintOrder="stroke"
          opacity={contextual ? "0.35" : secondary ? "0.72" : "0.82"}
          aria-hidden="true"
          className="pointer-events-none select-none text-xs"
        >
          {element.label}
        </text>
      ) : null}
    </g>
  )
}
