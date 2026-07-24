import { cva } from "class-variance-authority"

import type { LayoutBox } from "@/components/scene/scene-layout"
import type { SceneNodeElement } from "@/domain/content-types"
import { cn } from "@/lib/utils"

export type SceneNodeState = "interactive" | "planned" | "static" | "selected"
export type SceneNodeDensity = "far" | "medium" | "near"

const sceneNodeVariants = cva(
  "flex size-full flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-center transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      state: {
        interactive:
          "cursor-pointer font-medium hover:bg-muted/70 hover:text-foreground",
        planned: "text-muted-foreground",
        static: "text-foreground",
        selected: "bg-muted font-medium ring-2 ring-ring/30",
      },
    },
    defaultVariants: { state: "static" },
  }
)

const sceneNodeLabelVariants = cva(
  "leading-none font-medium whitespace-nowrap",
  {
    variants: {
      density: {
        far: "text-3xl",
        medium: "text-2xl",
        near: "text-xl",
      },
    },
    defaultVariants: { density: "near" },
  }
)

const sceneNodeStatusVariants = cva("text-muted-foreground", {
  variants: {
    density: {
      far: "text-lg",
      medium: "text-base",
      near: "text-sm",
    },
  },
  defaultVariants: { density: "near" },
})

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
  density?: SceneNodeDensity
  navigationDisabled?: boolean
  onEnterScene?: (sceneId: string, elementId: string) => void
}

export function SceneNode({
  element,
  layout,
  state,
  density = "near",
  navigationDisabled = false,
  onEnterScene,
}: SceneNodeProps) {
  const { x, y, width, height } = layout
  const label = element.label ?? element.id
  const targetSceneId = element.targetSceneId
  const content = (
    <>
      <span className={sceneNodeLabelVariants({ density })}>{label}</span>
      {state === "planned" ? (
        <span className={sceneNodeStatusVariants({ density })}>준비 중</span>
      ) : null}
    </>
  )

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      {targetSceneId && onEnterScene ? (
        <button
          type="button"
          data-scene-node-id={element.id}
          disabled={navigationDisabled}
          aria-label={`${label} 하위 장면 열기`}
          className={cn(sceneNodeVariants({ state }))}
          onClick={() => onEnterScene(targetSceneId, element.id)}
        >
          {content}
        </button>
      ) : (
        <div
          data-scene-node-id={element.id}
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
