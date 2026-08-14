import type { SceneNodeElement } from "@/content/types"

export const SCENE_NODE_WIDTH = 130
export const SCENE_NODE_HEIGHT = 80
export const SCENE_GRID_WIDTH = 1000
export const SCENE_GRID_HEIGHT = 600

export function estimatedSceneNodeLabelWidth(label: string) {
  return [...label].reduce((width, character) => {
    if (/\s/u.test(character)) return width + 10
    if (/[^\u0000-\u00ff]/u.test(character)) return width + 36
    return width + 18
  }, 0)
}

export function estimatedSceneNodeWidth(_node: SceneNodeElement) {
  return SCENE_NODE_WIDTH
}
