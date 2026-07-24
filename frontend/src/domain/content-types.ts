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

export type CanvasDefinition = {
  width: number
  height: number
  ariaLabel: string
}

type SceneElementBase = {
  id: ContentId
  label?: string
}

export type SceneNodeElement = SceneElementBase & {
  kind: "node"
  groupId?: ContentId
  targetSceneId?: ContentId
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

export type Relationship =
  | { type: "contains"; elementId: ContentId; targetSceneId: ContentId }
  | {
      type: "flows-to"
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
  canvas: CanvasDefinition
  elements: SceneElement[]
  contentRef: string
  contexts: Context[]
  occurrences: Occurrence[]
  conceptRefs: ConceptUsage[]
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
