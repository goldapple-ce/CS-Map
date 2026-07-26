export type ContentId = string

export type ContentStatus = "draft" | "review" | "published" | "planned"

export type Contributor = {
  id: ContentId
  displayName: string
}

export type Source = {
  title: string
  url: string
  type: "official" | "primary" | "secondary"
}

export type LayoutHint = "horizontal" | "branch"

export type SceneGridPlacement = {
  row: number
  col: number
}

export type SceneGridLayout = {
  type: "grid"
  columns: 5
  rows: 5
}

type SceneElementBase = {
  id: ContentId
  label?: string
}

export type SceneNodeElement = SceneElementBase & {
  kind: "node"
  grid?: SceneGridPlacement
  targetSceneId?: ContentId
  navigateToSceneId?: ContentId
  status?: "published" | "planned"
}

export type SceneEdgeElement = SceneElementBase & {
  kind: "edge"
  fromElementId: ContentId
  toElementId: ContentId
  variant?: "flow" | "supporting" | "return"
  fromSide?: "top" | "right" | "bottom" | "left"
  toSide?: "top" | "right" | "bottom" | "left"
}

export type SceneElement = SceneNodeElement | SceneEdgeElement

export type Context = {
  id: ContentId
  summary: string
  contentRef?: string
}

export type Occurrence = {
  id: ContentId
  conceptId: ContentId
  contextId: ContentId
  elementId?: ContentId
  implementationSceneIds: ContentId[]
}

export type ConceptUsage = {
  conceptId: ContentId
  occurrenceId: ContentId
  contextId: ContentId
}

export type QuizOption = {
  id: ContentId
  label: string
}

export type QuizQuestion = {
  id: ContentId
  prompt: string
  options: QuizOption[]
  correctOptionId: ContentId
  explanation: string
}

export type TopicQuiz = {
  questions: QuizQuestion[]
}

export type SelfCheckQuestion = {
  question: string
  answer: string
}

export type Scene = {
  id: ContentId
  slug: string
  scenarioId: ContentId
  parentId?: ContentId
  title: string
  summary: string
  status: ContentStatus
  ariaLabel: string
  layoutHint?: LayoutHint
  layout?: SceneGridLayout
  elements: SceneElement[]
  contentRef: string
  contexts: Context[]
  occurrences: Occurrence[]
  conceptRefs: ConceptUsage[]
  quiz?: TopicQuiz
  selfCheckQuiz?: SelfCheckQuestion[]
}

export type Concept = {
  id: ContentId
  slug: string
  title: string
  aliases: string[]
  summary: string
  status: ContentStatus
  contentRef: string
  sources: Source[]
  author: Contributor
  updatedAt: string
}
