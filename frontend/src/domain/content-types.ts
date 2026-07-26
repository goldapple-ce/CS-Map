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
  groupId?: ContentId
  targetSceneId?: ContentId
  navigateToSceneId?: ContentId
  conceptId?: ContentId
  status?: "published" | "planned"
}

export type SceneGroupElement = SceneElementBase & {
  kind: "group"
}

export type SceneEdgeElement = SceneElementBase & {
  kind: "edge"
  fromElementId: ContentId
  toElementId: ContentId
  variant?: "flow" | "supporting" | "return"
  fromSide?: "top" | "right" | "bottom" | "left"
  toSide?: "top" | "right" | "bottom" | "left"
}

export type SceneAnnotationElement = SceneElementBase & {
  kind: "annotation"
}

export type SceneElement =
  | SceneNodeElement
  | SceneGroupElement
  | SceneEdgeElement
  | SceneAnnotationElement

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

export type Relationship =
  | { type: "contains"; elementId: ContentId; targetSceneId: ContentId }
  | {
      type: "flows-to"
      fromElementId: ContentId
      toElementId: ContentId
      label?: string
    }
  | {
      type: "supports"
      fromElementId: ContentId
      toElementId: ContentId
      label?: string
    }
  | { type: "uses-concept"; occurrenceId: ContentId }
  | {
      type: "related-to"
      sourceConceptId: ContentId
      targetConceptId: ContentId
      summary: string
    }
  | {
      type: "related" | "prerequisite" | "used-by"
      sourceSceneId: ContentId
      targetSceneId: ContentId
      summary?: string
    }
  | {
      type: "implemented-by"
      occurrenceId: ContentId
      targetSceneId: ContentId
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
  relationships: Relationship[]
  sources: Source[]
  author: Contributor
  updatedAt: string
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
