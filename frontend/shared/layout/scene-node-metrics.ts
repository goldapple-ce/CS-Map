export const SCENE_NODE_WIDTH = 130
export const SCENE_NODE_HEIGHT = 80
export const SCENE_GRID_WIDTH = 1000
export const SCENE_GRID_HEIGHT = 600

/** 화면에 투영된 Node label의 대략적인 너비를 문자 종류별로 계산한다. */
export function estimatedSceneNodeLabelWidth(label: string) {
  return [...label].reduce((width, character) => {
    if (/\s/u.test(character)) return width + 10
    // eslint-disable-next-line no-control-regex
    if (/[^\u0000-\u00ff]/u.test(character)) return width + 36
    return width + 18
  }, 0)
}
