import type {
  Scene,
  SceneEdgeElement,
  SceneNodeElement,
} from "@shared/content/types"
import type {
  LayoutBox,
  SceneLayout,
} from "@shared/layout/scene-layout-contract"

import { SceneArea } from "@/features/explorer/components/SceneArea"
import { SceneEdge } from "@/features/explorer/components/SceneEdge"
import { SceneNode } from "@/features/explorer/components/SceneNode"
import { createSceneLayout } from "@/features/explorer/layout/scene-layout"

type EnterGooglePreviewProps = {
  scene: Scene
  onEnter: () => void
}

const PREVIEW_PADDING = 44
const AREA_LABEL_SPACE = 28

/** 실제 콘텐츠가 차지하는 범위만 Home 미리보기 영역으로 계산한다. */
function previewBounds(scene: Scene, layout: SceneLayout): LayoutBox {
  const xValues: number[] = []
  const yValues: number[] = []

  for (const box of layout.nodes.values()) {
    xValues.push(box.x, box.x + box.width)
    yValues.push(box.y, box.y + box.height)
  }

  for (const points of layout.edges.values()) {
    for (const point of points) {
      xValues.push(point.x)
      yValues.push(point.y)
    }
  }

  if (scene.layout?.type === "grid") {
    const cellWidth = layout.width / scene.layout.columns
    const cellHeight = layout.height / scene.layout.rows
    for (const area of scene.areas) {
      const x = (area.grid.col - 1) * cellWidth
      const y = (area.grid.row - 1) * cellHeight
      xValues.push(x, x + area.colSpan * cellWidth)
      yValues.push(y - AREA_LABEL_SPACE, y + area.rowSpan * cellHeight)
    }
  }

  if (xValues.length === 0 || yValues.length === 0) {
    return { x: 0, y: 0, width: layout.width, height: layout.height }
  }

  const minX = Math.min(...xValues) - PREVIEW_PADDING
  const minY = Math.min(...yValues) - PREVIEW_PADDING
  const maxX = Math.max(...xValues) + PREVIEW_PADDING
  const maxY = Math.max(...yValues) + PREVIEW_PADDING

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/** Root Scene의 흐름만 잘라내어 테마에 반응하는 Home 미리보기로 표시한다. */
export function EnterGooglePreview({
  scene,
  onEnter,
}: EnterGooglePreviewProps) {
  const layout = createSceneLayout(scene)
  const bounds = previewBounds(scene, layout)
  const edges = scene.elements.filter(
    (element): element is SceneEdgeElement => element.kind === "edge"
  )
  const nodes = scene.elements.filter(
    (element): element is SceneNodeElement => element.kind === "node"
  )

  return (
    <svg
      viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
      className="block w-full rounded-xl bg-background"
      aria-labelledby="enter-google-preview-title enter-google-preview-description"
    >
      <title id="enter-google-preview-title">{scene.title}</title>
      <desc id="enter-google-preview-description">
        Topic을 선택하면 전체 Explorer로 이동합니다.
      </desc>
      <defs>
        <marker
          id="scene-arrowhead"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--foreground)" />
        </marker>
      </defs>

      {scene.layout?.type === "grid"
        ? scene.areas.map((area) => (
            <SceneArea
              key={area.id}
              area={area}
              sceneWidth={layout.width}
              sceneHeight={layout.height}
              columns={scene.layout?.columns ?? 5}
              rows={scene.layout?.rows ?? 5}
            />
          ))
        : null}

      {edges.map((element) => {
        const points = layout.edges.get(element.id)
        return points ? (
          <SceneEdge key={element.id} element={element} points={points} />
        ) : null
      })}

      {nodes.map((element) => {
        const box = layout.nodes.get(element.id)
        return box ? (
          <SceneNode
            key={element.id}
            element={element}
            layout={box}
            state="interactive"
            onEnterScene={onEnter}
            onSelectTopic={onEnter}
          />
        ) : null
      })}
    </svg>
  )
}
