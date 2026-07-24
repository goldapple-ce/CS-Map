import { cva } from "class-variance-authority"

import type { LayoutBox } from "@/components/scene/scene-layout"
import type { SceneNodeElement } from "@/domain/content-types"
import { cn } from "@/lib/utils"

export type SceneNodeState = "interactive" | "planned" | "static" | "selected"

const sceneNodeVariants = cva(
  "flex size-full flex-col items-start justify-between rounded-xl border bg-background p-4 text-left shadow-sm transition-[border-color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      state: {
        interactive: "border-primary/50 hover:border-primary",
        planned: "border-dashed border-border bg-muted/40",
        static: "border-border",
        selected: "border-primary ring-3 ring-ring/30",
      },
    },
    defaultVariants: { state: "static" },
  }
)

const sceneNodeBadgeVariants = cva(
  "rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
  {
    variants: {
      state: {
        interactive: "border-primary/30 text-foreground",
        planned: "border-border text-muted-foreground",
        static: "border-border text-muted-foreground",
        selected: "border-primary/30 text-foreground",
      },
    },
  }
)

const stateLabels: Record<SceneNodeState, string> = {
  interactive: "탐색 대상",
  planned: "준비 중",
  static: "현재 흐름",
  selected: "선택됨",
}

type SceneNodeProps = {
  element: SceneNodeElement
  layout: LayoutBox
  state: SceneNodeState
  navigationDisabled?: boolean
  onEnterScene?: (sceneId: string) => void
}

export function SceneNode({
  element,
  layout,
  state,
  navigationDisabled = false,
  onEnterScene,
}: SceneNodeProps) {
  const { x, y, width, height } = layout
  const label = element.label ?? element.id
  const targetSceneId = element.targetSceneId
  const content = (
    <>
      <span className="text-sm leading-snug font-semibold text-foreground">
        {label}
      </span>
      <span className={cn(sceneNodeBadgeVariants({ state }))}>
        {stateLabels[state]}
      </span>
    </>
  )

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      {targetSceneId && onEnterScene ? (
        <button
          type="button"
          disabled={navigationDisabled}
          aria-label={`${label} 하위 장면 열기`}
          className={cn(sceneNodeVariants({ state }))}
          onClick={() => onEnterScene(targetSceneId)}
        >
          {content}
        </button>
      ) : (
        <div
          tabIndex={state === "planned" ? 0 : undefined}
          role="group"
          aria-label={`${label}, ${stateLabels[state]}`}
          className={cn(sceneNodeVariants({ state }))}
        >
          {content}
        </div>
      )}
    </foreignObject>
  )
}
