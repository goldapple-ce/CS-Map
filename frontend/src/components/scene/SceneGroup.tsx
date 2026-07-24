import type { LayoutBox } from "@/components/scene/scene-layout"
import type { SceneGroupElement } from "@/domain/content-types"

type SceneGroupProps = {
  element: SceneGroupElement
  layout: LayoutBox
}

export function SceneGroup({ element, layout }: SceneGroupProps) {
  const { x, y, width } = layout

  return (
    <g aria-label={element.label} role={element.label ? "group" : undefined}>
      {element.label ? (
        <text
          x={x + width / 2}
          y={y + 24}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="20"
          fontWeight="500"
          opacity="0.7"
        >
          {element.label}
        </text>
      ) : null}
    </g>
  )
}
