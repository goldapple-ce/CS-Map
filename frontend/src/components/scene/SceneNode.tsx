import { cva } from "class-variance-authority"

import type { LayoutBox } from "@/components/scene/scene-layout"
import { estimatedSceneNodeLabelWidth } from "@/components/scene/scene-node-metrics"
import type { SceneNodeElement } from "@/domain/content-types"
import { cn } from "@/lib/utils"

export type SceneNodeState = "interactive" | "selected"
export type SceneNodeDensity = "far" | "medium" | "near"

const sceneNodeLabelFontSizes: Record<SceneNodeDensity, number> = {
  far: 36,
  medium: 30,
  near: 24,
}

const sceneNodeVariants = cva(
  "relative flex size-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card/90 text-center shadow-sm transition-[background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      state: {
        interactive: "font-medium hover:bg-muted/70 hover:text-foreground",
        selected: "bg-muted font-medium ring-2 ring-ring/30",
      },
    },
    defaultVariants: { state: "interactive" },
  }
)

const sceneNodeLabelVariants = cva(
  "inline-block origin-center leading-none font-medium whitespace-nowrap",
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
  const labelFontSize = sceneNodeLabelFontSizes[density]
  const estimatedLabelWidth =
    estimatedSceneNodeLabelWidth(label) * (labelFontSize / 36)
  const labelScale = Math.min(1, (width - 12) / estimatedLabelWidth)
  const navigationSceneId = element.targetSceneId ?? element.navigateToSceneId
  const preview = navigationSceneId
    ? `${label} 내부 내용을 봅니다.`
    : `${label} 설명을 엽니다.`
  const content = (
    <>
      <span
        className={sceneNodeLabelVariants({ density })}
        style={{ transform: `scale(${labelScale})` }}
      >
        {label}
      </span>
      {navigationSceneId ? (
        <span
          aria-hidden="true"
          className="text-xs leading-none whitespace-nowrap text-muted-foreground"
        >
          [내부 보기]
        </span>
      ) : null}
    </>
  )

  let nodeContent
  if (navigationSceneId && onEnterScene) {
    nodeContent = (
      <button
        type="button"
        data-scene-node-id={element.id}
        disabled={navigationDisabled}
        aria-label={`${label} 내부 보기`}
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
