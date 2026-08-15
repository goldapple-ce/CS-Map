import type { SceneEdgeElement } from "@shared/content/types"
import type { LayoutPoint } from "@shared/layout/scene-layout-contract"

type SceneEdgeProps = {
  element: SceneEdgeElement
  points: readonly LayoutPoint[]
  contextual?: boolean
}

const LABEL_FONT_SIZE = 12
const LABEL_OUTLINE_WIDTH = 4

type LabelSide = NonNullable<SceneEdgeElement["labelSide"]>

/** Edge의 적합한 선분을 골라 요청된 방향에 Label 좌표를 배치한다. */
function labelPosition(
  points: readonly LayoutPoint[],
  clearance: number,
  labelSide?: LabelSide
) {
  const segments = points.slice(0, -1).map((start, index) => {
    const end = points[index + 1]
    const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)
    return {
      start,
      end,
      horizontal,
      length: Math.hypot(end.x - start.x, end.y - start.y),
    }
  })
  const wantsHorizontal = labelSide === "top" || labelSide === "bottom"
  const matchingSegments = labelSide
    ? segments.filter(({ horizontal }) => horizontal === wantsHorizontal)
    : segments
  const candidates = matchingSegments.length > 0 ? matchingSegments : segments
  const segment = candidates.reduce((longest, candidate) =>
    candidate.length > longest.length ? candidate : longest
  )
  const resolvedSide =
    labelSide ?? (segment.horizontal ? ("top" as const) : ("right" as const))
  const centerX = (segment.start.x + segment.end.x) / 2
  const centerY = (segment.start.y + segment.end.y) / 2

  if (resolvedSide === "top") {
    return { x: centerX, y: centerY - clearance, textAnchor: "middle" as const }
  }
  if (resolvedSide === "bottom") {
    return { x: centerX, y: centerY + clearance, textAnchor: "middle" as const }
  }
  if (resolvedSide === "left") {
    return { x: centerX - clearance, y: centerY, textAnchor: "end" as const }
  }
  return { x: centerX + clearance, y: centerY, textAnchor: "start" as const }
}

/** 직교 경로와 선택적 Label을 의미에 맞는 SVG Edge로 표시한다. */
export function SceneEdge({
  element,
  points,
  contextual = false,
}: SceneEdgeProps) {
  if (points.length < 2) return null
  const labelClearance =
    LABEL_FONT_SIZE / 2 + LABEL_OUTLINE_WIDTH / 2 + 6
  const label = element.label
    ? labelPosition(points, labelClearance, element.labelSide)
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
