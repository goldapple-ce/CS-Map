import {
  createSceneLayout,
  type LayoutBox,
  type SceneLayout,
} from "@/features/explorer/layout/scene-layout"
import {
  SCENE_NODE_HEIGHT,
  SCENE_NODE_WIDTH,
} from "@/features/explorer/layout/scene-node-metrics"
import type { Scene } from "@/content/types"

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

export function createWorldLayout(
  scenes: readonly Scene[],
  rootSceneId: string
): WorldLayout {
  const scenesById = new Map(scenes.map((scene) => [scene.id, scene]))
  const root = scenesById.get(rootSceneId)
  if (!root) {
    throw new Error(`World layout requires configured root Scene: ${rootSceneId}`)
  }

  const positioned = new Map<string, PositionedScene>()
  const visiting = new Set<string>()
  const layouts = new Map<string, SceneLayout>()
  const layoutFor = (scene: Scene) => {
    const cached = layouts.get(scene.id)
    if (cached) return cached
    const layout = createSceneLayout(scene)
    layouts.set(scene.id, layout)
    return layout
  }

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

export function getSceneAncestors(layout: WorldLayout, sceneId: string) {
  const ids = new Set<string>()
  let current = layout.scenes.get(sceneId)
  while (current) {
    ids.add(current.scene.id)
    current = current.parentId ? layout.scenes.get(current.parentId) : undefined
  }
  return ids
}
