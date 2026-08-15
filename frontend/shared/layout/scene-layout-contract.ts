export type LayoutBox = {
  x: number
  y: number
  width: number
  height: number
}

export type LayoutPoint = {
  x: number
  y: number
}

export type SceneLayout = {
  width: number
  height: number
  nodes: ReadonlyMap<string, LayoutBox>
  edges: ReadonlyMap<string, readonly LayoutPoint[]>
}

export type SerializedSceneLayout = {
  width: number
  height: number
  nodes: Readonly<Record<string, LayoutBox>>
  edges: Readonly<Record<string, readonly LayoutPoint[]>>
}
