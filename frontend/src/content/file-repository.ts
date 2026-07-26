import { parse } from "yaml"

import {
  recordContentCacheHit,
  recordContentFailure,
  recordContentLoaded,
  recordContentPrefetch,
  recordContentRequest,
} from "@/content/content-performance"
import { conceptIndex, sceneIndex } from "@/content/generated/content-index"
import { routeIndex } from "@/content/generated/route-index"
import type {
  ContentRepository,
  LoadedConcept,
  LoadedScene,
} from "@/content/repository"
import {
  normalizeSceneDocument,
  parseConcept,
  parseSceneDocument,
  parseSceneQuiz,
} from "@/content/schemas"
import type { ContentId, Scene } from "@/domain/content-types"

type RawLoader = () => Promise<unknown>

const sceneModules = import.meta.glob("/content/scenes/**/scene.yaml", {
  query: "?raw",
  import: "default",
}) as Record<string, RawLoader>

const conceptModules = import.meta.glob("/content/concepts/**/concept.yaml", {
  query: "?raw",
  import: "default",
}) as Record<string, RawLoader>

const markdownModules = import.meta.glob(
  ["/content/scenes/**/*.md", "/content/concepts/**/*.md"],
  { query: "?raw", import: "default" }
) as Record<string, RawLoader>

const quizModules = import.meta.glob("/content/scenes/**/quiz.ko.yaml", {
  query: "?raw",
  import: "default",
}) as Record<string, RawLoader>

async function loadRaw(modules: Record<string, RawLoader>, moduleKey: string) {
  const loader = modules[moduleKey]
  if (!loader) throw new Error(`Content module is not indexed: ${moduleKey}`)
  const value = await loader()
  if (typeof value !== "string") {
    throw new Error(`Content module did not return text: ${moduleKey}`)
  }
  return value
}

function siblingModuleKey(moduleKey: string, contentRef: string) {
  const directory = moduleKey.slice(0, moduleKey.lastIndexOf("/") + 1)
  return `${directory}${contentRef}`
}

export class FileContentRepository implements ContentRepository {
  private readonly sceneMapCache = new Map<ContentId, Promise<Scene>>()
  private readonly sceneCache = new Map<ContentId, Promise<LoadedScene>>()
  private readonly scenePrefetches = new Map<ContentId, Promise<void>>()
  private readonly conceptCache = new Map<ContentId, Promise<LoadedConcept>>()

  listRoutes() {
    return routeIndex
  }

  findRoute(path: string) {
    return routeIndex.find((entry) => entry.path === path)
  }

  loadSceneMap(id: ContentId): Promise<Scene> {
    const cached = this.sceneMapCache.get(id)
    if (cached) {
      recordContentCacheHit("scene", id)
      return cached
    }

    const startedAt = recordContentRequest("scene", id)
    let request: Promise<Scene>
    request = this.loadSceneMapUncached(id)
      .then((scene) => {
        recordContentLoaded("scene", id, startedAt)
        return scene
      })
      .catch((error: unknown) => {
        if (this.sceneMapCache.get(id) === request) this.sceneMapCache.delete(id)
        recordContentFailure("scene", id)
        throw error
      })
    this.sceneMapCache.set(id, request)
    return request
  }

  private async loadSceneMapUncached(id: ContentId): Promise<Scene> {
    const entry = sceneIndex.find((item) => item.id === id)
    if (!entry) throw new Error(`Unknown scene: ${id}`)

    const raw = await loadRaw(sceneModules, entry.moduleKey)
    const document = parseSceneDocument(parse(raw))
    return normalizeSceneDocument(document, {
      slug: entry.slug,
      scenarioId: entry.scenarioId,
      ...(entry.parentId ? { parentId: entry.parentId } : {}),
    })
  }

  loadScene(id: ContentId): Promise<LoadedScene> {
    const cached = this.sceneCache.get(id)
    if (cached) {
      recordContentCacheHit("scene-detail", id)
      return cached
    }

    const startedAt = recordContentRequest("scene-detail", id)
    let request: Promise<LoadedScene>
    request = this.loadSceneUncached(id)
      .then((loaded) => {
        recordContentLoaded("scene-detail", id, startedAt)
        return loaded
      })
      .catch((error: unknown) => {
        if (this.sceneCache.get(id) === request) this.sceneCache.delete(id)
        recordContentFailure("scene-detail", id)
        throw error
      })
    this.sceneCache.set(id, request)
    return request
  }

  private async loadSceneUncached(id: ContentId): Promise<LoadedScene> {
    const entry = sceneIndex.find((item) => item.id === id)
    if (!entry) throw new Error(`Unknown scene: ${id}`)

    const scene = await this.loadSceneMap(id)
    const markdown = await loadRaw(
      markdownModules,
      siblingModuleKey(entry.moduleKey, "content.ko.md")
    )
    const quizKey = siblingModuleKey(entry.moduleKey, "quiz.ko.yaml")
    const quizLoader = quizModules[quizKey]
    const quiz = quizLoader
      ? parseSceneQuiz(parse(await loadRaw(quizModules, quizKey)))
      : undefined
    return {
      scene: quiz ? { ...scene, selfCheckQuiz: quiz } : scene,
      markdown,
    }
  }

  prefetchScene(id: ContentId): Promise<void> {
    const existing = this.scenePrefetches.get(id)
    if (existing) return existing

    recordContentPrefetch("scene", id)
    let request: Promise<void>
    request = this.loadSceneMap(id)
      .then(() => undefined)
      .catch(() => {
        if (this.scenePrefetches.get(id) === request) {
          this.scenePrefetches.delete(id)
        }
      })
    this.scenePrefetches.set(id, request)
    return request
  }

  loadConcept(id: ContentId): Promise<LoadedConcept> {
    const cached = this.conceptCache.get(id)
    if (cached) {
      recordContentCacheHit("concept", id)
      return cached
    }

    const startedAt = recordContentRequest("concept", id)
    let request: Promise<LoadedConcept>
    request = this.loadConceptUncached(id)
      .then((loaded) => {
        recordContentLoaded("concept", id, startedAt)
        return loaded
      })
      .catch((error: unknown) => {
        if (this.conceptCache.get(id) === request) this.conceptCache.delete(id)
        recordContentFailure("concept", id)
        throw error
      })
    this.conceptCache.set(id, request)
    return request
  }

  private async loadConceptUncached(id: ContentId): Promise<LoadedConcept> {
    const entry = conceptIndex.find((item) => item.id === id)
    if (!entry) throw new Error(`Unknown concept: ${id}`)

    const raw = await loadRaw(conceptModules, entry.moduleKey)
    const concept = parseConcept(parse(raw))
    const markdown = await loadRaw(
      markdownModules,
      siblingModuleKey(entry.moduleKey, concept.contentRef)
    )
    return { concept, markdown }
  }
}
