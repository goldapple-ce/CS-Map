import { cva } from "class-variance-authority"

import type { LayoutBox } from "@/components/scene/scene-layout"
import type { SceneNodeElement } from "@/domain/content-types"
import { cn } from "@/lib/utils"

export type SceneNodeState = "interactive" | "planned" | "static" | "selected"
export type SceneNodeDensity = "far" | "medium" | "near"

const sceneNodeVariants = cva(
  "flex size-full flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-card/90 px-3 text-center shadow-sm transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
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
        far: "text-4xl",
        medium: "text-3xl",
        near: "text-2xl",
      },
    },
    defaultVariants: { density: "near" },
  }
)

const sceneNodeStatusVariants = cva("text-muted-foreground", {
  variants: {
    density: {
      far: "text-xl",
      medium: "text-lg",
      near: "text-base",
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
  onShowPlanned?: (elementId: string, label: string) => void
}

export function SceneNode({
  element,
  layout,
  state,
  density = "near",
  navigationDisabled = false,
  onEnterScene,
  onShowPlanned,
}: SceneNodeProps) {
  const { x, y, width, height } = layout
  const label = element.label ?? element.id
  const targetSceneId = element.targetSceneId
  const preview = targetSceneId
    ? `${label} 내부 흐름으로 확대합니다.`
    : state === "planned"
      ? `${label} 상세 장면은 준비 중입니다.`
      : undefined
  const content = (
    <>
      <span className={sceneNodeLabelVariants({ density })}>{label}</span>
      {state === "planned" ? (
        <span className={sceneNodeStatusVariants({ density })}>준비 중</span>
      ) : null}
    </>
  )

  let nodeContent
  if (targetSceneId && onEnterScene) {
    nodeContent = (
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
    )
  } else if (state === "planned" && onShowPlanned) {
    nodeContent = (
      <button
        type="button"
        data-scene-node-id={element.id}
        disabled={navigationDisabled}
        aria-label={`${label}, 준비 중 내용 보기`}
        className={cn(sceneNodeVariants({ state }), "cursor-pointer")}
        onClick={() => onShowPlanned(element.id, label)}
      >
        {content}
      </button>
    )
  } else {
    nodeContent = (
      <div
        data-scene-node-id={element.id}
        role="group"
        aria-label={`${label}, ${stateLabels[state]}`}
        className={cn(sceneNodeVariants({ state }))}
      >
        {content}
      </div>
    )
  }

  return (
    <foreignObject x={x} y={y} width={width} height={height} overflow="visible">
      <div className="group relative size-full">
        {nodeContent}
        {preview ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 w-max max-w-72 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-sm leading-5 whitespace-normal text-popover-foreground opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
          >
            {preview}
          </span>
        ) : null}
      </div>
    </foreignObject>
  )
}
