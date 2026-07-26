import type { LayoutPoint } from "@/components/scene/scene-layout"
import type { SceneNodeDensity } from "@/components/scene/SceneNode"
import type { SceneEdgeElement } from "@/domain/content-types"

type SceneEdgeProps = {
  element: SceneEdgeElement
  points: readonly LayoutPoint[]
  contextual?: boolean
  density?: SceneNodeDensity
}

const labelMetrics: Record<
  SceneNodeDensity,
  { fontSize: number; outlineWidth: number }
> = {
  far: { fontSize: 30, outlineWidth: 12 },
  medium: { fontSize: 25, outlineWidth: 10 },
  near: { fontSize: 21, outlineWidth: 8 },
}

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
  density = "near",
}: SceneEdgeProps) {
  if (points.length < 2) return null
  const labelMetric = labelMetrics[density]
  const labelClearance =
    labelMetric.fontSize / 2 + labelMetric.outlineWidth / 2 + 6
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
          strokeWidth={labelMetric.outlineWidth}
          strokeLinejoin="round"
          paintOrder="stroke"
          fontSize={labelMetric.fontSize}
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
