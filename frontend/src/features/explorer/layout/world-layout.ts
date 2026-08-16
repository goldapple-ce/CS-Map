import { createSceneLayout } from "@/features/explorer/layout/scene-layout"
import type {
  LayoutBox,
  SceneLayout,
} from "@shared/layout/scene-layout-contract"
import {
  SCENE_NODE_HEIGHT,
  SCENE_NODE_WIDTH,
} from "@shared/layout/scene-node-metrics"
import type { Scene } from "@shared/content/types"

export type WorldBounds = LayoutBox

export type PositionedScene = {
  scene: Scene
  parentId?: string
  targetElementId?: string
  x: number
  y: number
  scale: number
  bounds: WorldBounds
  localLayout: SceneLayout
}

export type WorldLayout = {
  rootSceneId: string
  scenes: ReadonlyMap<string, PositionedScene>
}

/** Root와 Child Scene의 로컬 Layout을 하나의 재귀적인 World 공간에 배치한다. */
export function createWorldLayout(
  scenes: readonly Scene[],
  rootSceneId: string
): WorldLayout {
  const scenesById = new Map(scenes.map((scene) => [scene.id, scene]))
  const root = scenesById.get(rootSceneId)
  if (!root) {
    throw new Error(`World layout requires Root Scene: ${rootSceneId}`)
  }

  const positioned = new Map<string, PositionedScene>()
  const visiting = new Set<string>()
  const layouts = new Map<string, SceneLayout>()
  /** Scene별 로컬 Layout을 한 번 생성하고 같은 World 계산에서 재사용한다. */
  const layoutFor = (scene: Scene) => {
    const cached = layouts.get(scene.id)
    if (cached) return cached
    const layout = createSceneLayout(scene)
    layouts.set(scene.id, layout)
    return layout
  }

  /** Scene을 World 좌표에 놓고 Node 내부의 Child Scene을 재귀 배치한다. */
  const place = (
    scene: Scene,
    x: number,
    y: number,
    scale: number,
    parentId?: string,
    targetElementId?: string
  ) => {
    if (visiting.has(scene.id) || positioned.has(scene.id)) return
    visiting.add(scene.id)
    const localLayout = layoutFor(scene)
    const item: PositionedScene = {
      scene,
      parentId,
      targetElementId,
      x,
      y,
      scale,
      bounds: {
        x,
        y,
        width: localLayout.width * scale,
        height: localLayout.height * scale,
      },
      localLayout,
    }
    positioned.set(scene.id, item)

    for (const element of scene.elements) {
      if (element.kind !== "node" || !element.targetSceneId) continue
      const child = scenesById.get(element.targetSceneId)
      const nodeBounds = localLayout.nodes.get(element.id)
      if (!child || !nodeBounds) continue
      const childLayout = layoutFor(child)
      const targetWidth = Math.min(SCENE_NODE_WIDTH, nodeBounds.width)
      const targetHeight = Math.min(SCENE_NODE_HEIGHT, nodeBounds.height)
      const targetX = nodeBounds.x + (nodeBounds.width - targetWidth) / 2
      const targetY = nodeBounds.y + (nodeBounds.height - targetHeight) / 2
      const childScaleWithinNode = Math.min(
        targetWidth / childLayout.width,
        targetHeight / childLayout.height
      )
      const childScale = scale * childScaleWithinNode
      const childLocalWidth = childLayout.width * childScaleWithinNode
      const childLocalHeight = childLayout.height * childScaleWithinNode
      place(
        child,
        x + (targetX + (targetWidth - childLocalWidth) / 2) * scale,
        y + (targetY + (targetHeight - childLocalHeight) / 2) * scale,
        childScale,
        scene.id,
        element.id
      )
    }
    visiting.delete(scene.id)
  }

  place(root, 0, 0, 1)
  return { rootSceneId: root.id, scenes: positioned }
}

/** 대상 Scene 자신부터 Root까지의 Scene ID 집합을 반환한다. */
export function getSceneAncestors(layout: WorldLayout, sceneId: string) {
  const ids = new Set<string>()
  let current = layout.scenes.get(sceneId)
  while (current) {
    ids.add(current.scene.id)
    current = current.parentId ? layout.scenes.get(current.parentId) : undefined
  }
  return ids
}
