import type {
  Concept,
  ContentId,
  ContentStatus,
  Scene,
} from "@/content/types"

export type ContentManifest = {
  scenarioId: ContentId
  rootSceneId: ContentId
}

export type SceneIndexEntry = {
  id: ContentId
  title: string
  slug: string
  scenarioId: ContentId
  parentId?: ContentId
  status: ContentStatus
  moduleKey: string
}

export type ConceptIndexEntry = {
  id: ContentId
  slug: string
  status: ContentStatus
  moduleKey: string
}

export type RouteIndexEntry = {
  id: ContentId
  title: string
  path: string
  parentId?: ContentId
  order: number
  status: "published"
  moduleKey: string
}

export type LoadedScene = {
  scene: Scene
  markdown: string
}

export type LoadedConcept = {
  concept: Concept
  markdown: string
}

export interface ContentRepository {
  getRootSceneId(): ContentId
  listRoutes(): readonly RouteIndexEntry[]
  findRoute(path: string): RouteIndexEntry | undefined
  loadSceneMap(id: ContentId): Promise<Scene>
  loadScene(id: ContentId): Promise<LoadedScene>
  loadTopicExplanation(
    sceneId: ContentId,
    elementId: ContentId
  ): Promise<string | undefined>
  prefetchScene(id: ContentId): Promise<void>
  loadConcept(id: ContentId): Promise<LoadedConcept>
}
