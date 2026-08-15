import type {
  Concept,
  ContentId,
  Scene,
} from "@shared/content/types"
import type { RouteIndexEntry } from "@shared/content/generated-contract"

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
