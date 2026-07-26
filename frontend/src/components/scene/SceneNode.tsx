import { cva } from "class-variance-authority"

import type { LayoutBox } from "@/components/scene/scene-layout"
import type { SceneNodeElement } from "@/domain/content-types"
import { cn } from "@/lib/utils"

export type SceneNodeState = "interactive" | "selected"
export type SceneNodeDensity = "far" | "medium" | "near"

const sceneNodeVariants = cva(
  "flex size-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-card/90 px-8 text-center shadow-sm transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      state: {
        interactive:
          "font-medium hover:bg-muted/70 hover:text-foreground",
        selected: "bg-muted font-medium ring-2 ring-ring/30",
      },
    },
    defaultVariants: { state: "interactive" },
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

const stateLabels: Record<SceneNodeState, string> = {
  interactive: "탐색 대상",
  selected: "선택됨",
}

type SceneNodeProps = {
  element: SceneNodeElement
  layout: LayoutBox
  state: SceneNodeState
  density?: SceneNodeDensity
  navigationDisabled?: boolean
  onEnterScene?: (sceneId: string, elementId: string) => void
  onSelectTopic?: (elementId: string, label: string) => void
}

export function SceneNode({
  element,
  layout,
  state,
  density = "near",
  navigationDisabled = false,
  onEnterScene,
  onSelectTopic,
}: SceneNodeProps) {
  const { x, y, width, height } = layout
  const label = element.label ?? element.id
  const navigationSceneId =
    element.targetSceneId ?? element.navigateToSceneId
  const preview = element.targetSceneId
    ? `${label} 내부 흐름으로 확대합니다.`
    : element.navigateToSceneId
      ? `${label} Topic으로 이동합니다.`
      : `${label} 설명을 엽니다.`
  const content = (
    <>
      <span className={sceneNodeLabelVariants({ density })}>{label}</span>
    </>
  )

  let nodeContent
  if (navigationSceneId && onEnterScene) {
    nodeContent = (
      <button
        type="button"
        data-scene-node-id={element.id}
        disabled={navigationDisabled}
        aria-label={
          element.targetSceneId
            ? `${label} 하위 장면 열기`
            : `${label} Topic으로 이동`
        }
        className={cn(sceneNodeVariants({ state }))}
        onClick={() => onEnterScene(navigationSceneId, element.id)}
      >
        {content}
      </button>
    )
  } else if (onSelectTopic) {
    nodeContent = (
      <button
        type="button"
        data-scene-node-id={element.id}
        disabled={navigationDisabled}
        aria-label={`${label} 설명 열기`}
        className={cn(sceneNodeVariants({ state }))}
        onClick={() => onSelectTopic(element.id, label)}
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
