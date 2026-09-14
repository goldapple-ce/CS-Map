import type { SceneArea as SceneAreaModel } from "@shared/content/types"

type SceneAreaProps = {
  area: SceneAreaModel
  sceneWidth: number
  sceneHeight: number
  columns: number
  rows: number
  selected?: boolean
  disabled?: boolean
  onSelect?: (areaId: string, label: string) => void
}

const AREA_INSET = 8
const AREA_LABEL_GAP = 8

/** Grid 범위를 Scene 내부 SVG Area로 표시하고 설명이 있으면 전체를 선택 가능하게 한다. */
export function SceneArea({
  area,
  sceneWidth,
  sceneHeight,
  columns,
  rows,
  selected = false,
  disabled = false,
  onSelect,
}: SceneAreaProps) {
  const cellWidth = sceneWidth / columns
  const cellHeight = sceneHeight / rows
  const x = (area.grid.col - 1) * cellWidth + AREA_INSET
  const y = (area.grid.row - 1) * cellHeight + AREA_INSET
  const width = area.colSpan * cellWidth - AREA_INSET * 2
  const height = area.rowSpan * cellHeight - AREA_INSET * 2
  const selectable = area.hasExplanation && Boolean(onSelect)

  return (
    <g
      data-scene-area-id={area.id}
      role={selectable ? "button" : "img"}
      aria-label={
        selectable ? `${area.label} 영역 설명 열기` : `${area.label} 영역`
      }
      aria-disabled={selectable && disabled ? true : undefined}
      tabIndex={selectable && !disabled ? 0 : undefined}
      className={
        selectable
          ? disabled
            ? "pointer-events-none"
            : "group cursor-pointer outline-none"
          : "pointer-events-none"
      }
      onClick={
        selectable && !disabled
          ? () => onSelect?.(area.id, area.label)
          : undefined
      }
      onKeyDown={
        selectable && !disabled
          ? (event) => {
              if (event.key !== "Enter" && event.key !== " ") return
              event.preventDefault()
              onSelect?.(area.id, area.label)
            }
          : undefined
      }
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={18}
        className={
          selected
            ? "fill-muted/60 stroke-ring"
            : selectable
              ? "fill-muted/20 stroke-border transition-colors group-hover:fill-muted/40 group-focus-visible:stroke-ring"
              : "fill-muted/20 stroke-border"
        }
        strokeWidth={2}
      />
      <text
        x={x}
        y={y - AREA_LABEL_GAP}
        textAnchor="start"
        className={
          selected
            ? "fill-foreground text-sm font-medium"
            : "fill-muted-foreground text-sm font-medium"
        }
      >
        {area.label}
      </text>
    </g>
  )
}
