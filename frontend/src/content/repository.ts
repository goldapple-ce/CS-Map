import type {
  Concept,
  ContentId,
  ContentStatus,
  Scene,
} from "@/domain/content-types"

export type SceneIndexEntry = {
  id: ContentId
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
  listRoutes(): readonly RouteIndexEntry[]
  findRoute(path: string): RouteIndexEntry | undefined
  loadScene(id: ContentId): Promise<LoadedScene>
  loadConcept(id: ContentId): Promise<LoadedConcept>
}
