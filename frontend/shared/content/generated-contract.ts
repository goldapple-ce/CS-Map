import type { Concept, ContentId, Scene } from "./types.ts"
import type { SerializedSceneLayout } from "../layout/scene-layout-contract.ts"

export type RouteIndexEntry = {
  id: ContentId
  title: string
  path: string
  parentId?: ContentId
  order: number
}

export type GeneratedSceneContent = {
  scene: Scene
  markdown: string
  topicExplanations: Readonly<Record<ContentId, string>>
}

export type GeneratedConceptContent = {
  concept: Concept
  markdown: string
}

export type GeneratedContentData = {
  rootSceneId: ContentId
  routes: readonly RouteIndexEntry[]
  scenes: Readonly<Record<ContentId, GeneratedSceneContent>>
  concepts: Readonly<Record<ContentId, GeneratedConceptContent>>
  layouts: Readonly<Record<ContentId, SerializedSceneLayout>>
}
