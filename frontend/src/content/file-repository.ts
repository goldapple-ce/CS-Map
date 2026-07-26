import { parse } from "yaml"

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
import type { ContentId } from "@/domain/content-types"

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
  listRoutes() {
    return routeIndex
  }

  findRoute(path: string) {
    return routeIndex.find((entry) => entry.path === path)
  }

  async loadScene(id: ContentId): Promise<LoadedScene> {
    const entry = sceneIndex.find((item) => item.id === id)
    if (!entry) throw new Error(`Unknown scene: ${id}`)

    const raw = await loadRaw(sceneModules, entry.moduleKey)
    const markdown = await loadRaw(
      markdownModules,
      siblingModuleKey(entry.moduleKey, "content.ko.md")
    )
    const document = parseSceneDocument(parse(raw))
    const quizKey = siblingModuleKey(entry.moduleKey, "quiz.ko.yaml")
    const quizLoader = quizModules[quizKey]
    const quiz = quizLoader
      ? parseSceneQuiz(parse(await loadRaw(quizModules, quizKey)))
      : undefined
    const scene = normalizeSceneDocument(
      document,
      {
        slug: entry.slug,
        scenarioId: entry.scenarioId,
        ...(entry.parentId ? { parentId: entry.parentId } : {}),
      },
      quiz
    )
    return { scene, markdown }
  }

  async loadConcept(id: ContentId): Promise<LoadedConcept> {
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
