import type { SceneArea as SceneAreaModel } from "@/domain/content-types"

type SceneAreaProps = {
  area: SceneAreaModel
  sceneWidth: number
  sceneHeight: number
  columns: number
  rows: number
}

const AREA_INSET = 8
const AREA_LABEL_GAP = 8

export function SceneArea({
  area,
  sceneWidth,
  sceneHeight,
  columns,
  rows,
}: SceneAreaProps) {
  const cellWidth = sceneWidth / columns
  const cellHeight = sceneHeight / rows
  const x = (area.grid.col - 1) * cellWidth + AREA_INSET
  const y = (area.grid.row - 1) * cellHeight + AREA_INSET
  const width = area.colSpan * cellWidth - AREA_INSET * 2
  const height = area.rowSpan * cellHeight - AREA_INSET * 2

  return (
    <g
      data-scene-area-id={area.id}
      role="img"
      aria-label={`${area.label} 영역`}
      className="pointer-events-none"
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={18}
        className="fill-muted/20 stroke-border"
        strokeWidth={2}
      />
      <text
        x={x}
        y={y - AREA_LABEL_GAP}
        textAnchor="start"
        className="fill-muted-foreground text-sm font-medium"
      >
        {area.label}
      </text>
    </g>
  )
}
