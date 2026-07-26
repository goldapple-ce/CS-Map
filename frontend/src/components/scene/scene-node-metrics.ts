import type { SceneNodeElement } from "@/domain/content-types"

export const MIN_SCENE_NODE_WIDTH = 144
export const SCENE_NODE_HEIGHT = 124
export const SCENE_NODE_HORIZONTAL_PADDING = 32

function estimatedLabelWidth(label: string) {
  return [...label].reduce((width, character) => {
    if (/\s/u.test(character)) return width + 10
    if (/[^\u0000-\u00ff]/u.test(character)) return width + 36
    return width + 18
  }, 0)
}

export function estimatedSceneNodeWidth(node: SceneNodeElement) {
  const label = node.label ?? node.id
  return Math.max(
    MIN_SCENE_NODE_WIDTH,
    estimatedLabelWidth(label) + SCENE_NODE_HORIZONTAL_PADDING * 2
  )
}
