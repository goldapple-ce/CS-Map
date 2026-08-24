import type { ContentId, Scene } from "./types.ts"
import type { SerializedSceneLayout } from "../layout/scene-layout-contract.ts"

export type RouteIndexEntry = {
  id: ContentId
  title: string
  path: string
  parentId?: ContentId
}

export type GeneratedSceneContent = {
  scene: Scene
  markdown: string
  topicExplanations: Readonly<Record<ContentId, string>>
}

export type GeneratedContentData = {
  rootSceneId: ContentId
  routes: readonly RouteIndexEntry[]
  scenes: Readonly<Record<ContentId, GeneratedSceneContent>>
  layouts: Readonly<Record<ContentId, SerializedSceneLayout>>
}
