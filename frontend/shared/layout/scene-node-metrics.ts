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
    if (/[MWmw@%&]/u.test(character)) return width + 28
    if (/[ilIjtfr1|!.,'`:/]/u.test(character)) return width + 12
    if (/[A-Z]/u.test(character)) return width + 24
    // Geist의 굵은 영문 label이 카드 밖으로 나가지 않도록 나머지 폭도 보수적으로 잡는다.
    return width + 19
  }, 0)
}
