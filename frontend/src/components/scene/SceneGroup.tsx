import type { LayoutBox } from "@/components/scene/scene-layout"
import type { SceneGroupElement } from "@/domain/content-types"

type SceneGroupProps = {
  element: SceneGroupElement
  layout: LayoutBox
}

export function SceneGroup({ element, layout }: SceneGroupProps) {
  const { x, y, width, height } = layout

  return (
    <g aria-label={element.label} role={element.label ? "group" : undefined}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="20"
        fill="var(--muted)"
        fillOpacity="0.28"
        stroke="var(--border)"
        strokeWidth="1"
        strokeDasharray="6 8"
        vectorEffect="non-scaling-stroke"
      />
      {element.label ? (
        <text
          x={x + 20}
          y={y + 32}
          fill="var(--muted-foreground)"
          fontSize="13"
          fontWeight="600"
        >
          {element.label}
        </text>
      ) : null}
    </g>
  )
}
