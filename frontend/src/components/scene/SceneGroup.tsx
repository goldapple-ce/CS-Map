import type { SceneElement } from "@/domain/content-types"

type SceneGroupProps = {
  element: SceneElement
}

export function SceneGroup({ element }: SceneGroupProps) {
  const { x, y, width = 0, height = 0 } = element.geometry

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
