import type { SceneEdgeElement } from "@shared/content/types"
import type { LayoutPoint } from "@shared/layout/scene-layout-contract"
import { useEffect, useId, useRef } from "react"

import { LIGHT_FLOW_EDGE_DURATION_MS } from "@/features/explorer/light-flow-timing"

type SceneEdgeProps = {
  element: SceneEdgeElement
  points: readonly LayoutPoint[]
  contextual?: boolean
  lightFlowActive?: boolean
}

const LABEL_FONT_SIZE = 12
const LABEL_OUTLINE_WIDTH = 4

type LabelSide = NonNullable<SceneEdgeElement["labelSide"]>

/** 동적으로 추가된 SMIL pulse를 현재 SVG 시간축에서 정확히 한 번 시작한다. */
function SceneEdgeLightPulse({ motionPath }: { motionPath: string }) {
  const animationRef = useRef<SVGAnimateMotionElement>(null)
  const gradientId = `light-flow-${useId().replaceAll(":", "")}`

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      animationRef.current?.beginElement()
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <g>
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="33%" stopColor="var(--primary)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="12" fill={`url(#${gradientId})`} />
      <animateMotion
        ref={animationRef}
        begin="indefinite"
        dur={`${LIGHT_FLOW_EDGE_DURATION_MS}ms`}
        fill="freeze"
        path={motionPath}
        repeatCount="1"
      />
    </g>
  )
}

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
  lightFlowActive = false,
}: SceneEdgeProps) {
  if (points.length < 2) return null
  const labelClearance = LABEL_FONT_SIZE / 2 + LABEL_OUTLINE_WIDTH / 2 + 6
  const label = element.label
    ? labelPosition(points, labelClearance, element.labelSide)
    : undefined
  const supporting = element.variant === "supporting"
  const returning = element.variant === "return"
  const secondary = supporting || returning
  const pointList = points.map(({ x, y }) => `${x},${y}`).join(" ")
  const motionPath = points
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ")

  return (
    <g aria-label={element.label} role={element.label ? "img" : undefined}>
      <polyline
        points={pointList}
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
      {lightFlowActive ? (
        <g aria-hidden="true" data-light-flow-edge={element.id}>
          <SceneEdgeLightPulse motionPath={motionPath} />
        </g>
      ) : null}
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
          className="pointer-events-none text-xs select-none"
        >
          {element.label}
        </text>
      ) : null}
    </g>
  )
}
