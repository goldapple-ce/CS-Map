/** 생성 콘텐츠 전반에서 사용하는 안정된 문자열 식별자다. */
export type ContentId = string

export type SceneGridPlacement = {
  row: number
  col: number
  rowSpan?: number
  colSpan?: number
}

export type SceneGridLayout = {
  columns: 5
  rows: 5
}

export type SceneArea = {
  id: ContentId
  label: string
  grid: SceneGridPlacement
  rowSpan: number
  colSpan: number
  hasExplanation: boolean
}

type SceneElementBase = {
  id: ContentId
}

export type SceneNodeElement = SceneElementBase & {
  kind: "node"
  label: string
  grid: SceneGridPlacement
  targetSceneId?: ContentId
  navigateToSceneId?: ContentId
}

export type SceneEdgeElement = SceneElementBase & {
  kind: "edge"
  label?: string
  fromElementId: ContentId
  toElementId: ContentId
  variant?: "flow" | "supporting" | "return"
  fromSide?: "top" | "right" | "bottom" | "left"
  toSide?: "top" | "right" | "bottom" | "left"
  labelSide?: "top" | "right" | "bottom" | "left"
}

export type SceneElement = SceneNodeElement | SceneEdgeElement

export type SelfCheckQuestion = {
  question: string
  answer: string
}

export type SceneLightFlowStage = {
  edgeIds: ContentId[]
}

export type SceneLightFlow = {
  id: ContentId
  label?: string
  stages: SceneLightFlowStage[]
}

export type Scene = {
  id: ContentId
  slug: string
  parentId?: ContentId
  title: string
  summary: string
  keywords?: string[]
  layout: SceneGridLayout
  areas: SceneArea[]
  elements: SceneElement[]
  lightFlows?: SceneLightFlow[]
  selfCheckQuiz?: SelfCheckQuestion[]
}
