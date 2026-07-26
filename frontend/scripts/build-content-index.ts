import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { parse } from "yaml"

import type { ConceptIndexEntry, RouteIndexEntry, SceneIndexEntry } from "../src/content/repository.ts"
import { validateContentGraph } from "../src/content/relationship-validation.ts"
import {
  conceptSchema,
  isMinimalSceneDocument,
  normalizeSceneDocument,
  sceneDocumentChildren,
  sceneDocumentSchema,
  sceneQuizSchema,
  type SceneDocument,
  type SceneDerivedMetadata,
} from "../src/content/schemas.ts"
import type { Concept, Scene, SelfCheckQuestion } from "../src/domain/content-types.ts"
import { buildSceneLayout } from "./elk-scene-layout.ts"

type ContentFile<T> = { filePath: string; value: T }
type PreparedSceneFile = ContentFile<Scene> & { document: SceneDocument }

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const contentRoot = path.join(appRoot, "content")
const generatedRoot = path.join(appRoot, "src/content/generated")
const checkOnly = process.argv.includes("--check")

async function findFiles(directory: string, fileName: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return findFiles(entryPath, fileName)
    return Promise.resolve(entry.name === fileName ? [entryPath] : [])
  }))).flat().sort()
}

async function parseFiles<T>(filePaths: readonly string[], schema: {
  safeParse(input: unknown):
    | { success: true; data: T }
    | { success: false; error: { issues: readonly { path: PropertyKey[]; message: string }[] } }
}): Promise<{ files: ContentFile<T>[]; errors: string[] }> {
  const files: ContentFile<T>[] = []
  const errors: string[] = []
  for (const filePath of filePaths) {
    try {
      const result = schema.safeParse(parse(await readFile(filePath, "utf8")))
      if (result.success) files.push({ filePath, value: result.data })
      else for (const issue of result.error.issues) {
        errors.push(`${relative(filePath)}:${issue.path.map(String).join(".") || "root"}: ${issue.message}`)
      }
    } catch (error) {
      errors.push(`${relative(filePath)}: ${errorMessage(error)}`)
    }
  }
  return { files, errors }
}

function relative(filePath: string) {
  return path.relative(appRoot, filePath).split(path.sep).join("/")
}

function moduleKey(filePath: string) {
  return `/${relative(filePath)}`
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function markdownTitle(markdown: string) {
  return markdown.match(/^#\s+(.+?)\s*$/m)?.[1]
}

async function loadOptionalQuiz(directory: string, errors: string[]) {
  const quizPath = path.join(directory, "quiz.ko.yaml")
  let source: string
  try {
    source = await readFile(quizPath, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined
    errors.push(`${relative(quizPath)}: ${errorMessage(error)}`)
    return undefined
  }
  const result = sceneQuizSchema.safeParse(parse(source))
  if (result.success) return result.data as SelfCheckQuestion[]
  for (const issue of result.error.issues) {
    errors.push(`${relative(quizPath)}:${issue.path.map(String).join(".") || "root"}: ${issue.message}`)
  }
  return undefined
}

async function prepareScenes(files: readonly ContentFile<SceneDocument>[]) {
  const errors: string[] = []
  const documentsById = new Map(files.map((file) => [file.value.id, file]))
  const ownerByChildId = new Map<string, { parentId: string; nodeId: string; order: number }>()
  for (const { value: document } of files) {
    for (const child of sceneDocumentChildren(document)) {
      const owner = ownerByChildId.get(child.childSceneId)
      if (owner) {
        errors.push(`${document.id}:nodes.${child.nodeId}.childSceneId: Scene ${child.childSceneId} is already owned by ${owner.parentId}`)
      } else {
        ownerByChildId.set(child.childSceneId, { parentId: document.id, nodeId: child.nodeId, order: child.order })
      }
    }
  }

  const metadataCache = new Map<string, SceneDerivedMetadata>()
  const resolving = new Set<string>()
  const resolveMetadata = (document: SceneDocument, filePath: string, title: string): SceneDerivedMetadata => {
    const cached = metadataCache.get(document.id)
    if (cached) return cached
    if (resolving.has(document.id)) throw new Error(`Child Scene cycle detected at ${document.id}`)
    resolving.add(document.id)
    const owner = ownerByChildId.get(document.id)
    const parentFile = owner ? documentsById.get(owner.parentId) : undefined
    const legacy = isMinimalSceneDocument(document) ? undefined : document
    const parentMetadata = parentFile
      ? resolveMetadata(parentFile.value, parentFile.filePath, "")
      : undefined
    const metadata: SceneDerivedMetadata = {
      title,
      slug: legacy?.slug ?? owner?.nodeId ?? path.basename(path.dirname(filePath)),
      scenarioId: legacy?.scenarioId ?? parentMetadata?.scenarioId ?? document.id,
      ...(owner ? { parentId: owner.parentId } : {}),
      status: legacy?.status ?? "published",
    }
    metadataCache.set(document.id, metadata)
    resolving.delete(document.id)
    return metadata
  }

  const prepared: PreparedSceneFile[] = []
  for (const file of files) {
    const directory = path.dirname(file.filePath)
    const markdownPath = path.join(directory, "content.ko.md")
    let markdown = ""
    try {
      markdown = await readFile(markdownPath, "utf8")
    } catch {
      errors.push(`${relative(file.filePath)}: missing Markdown content content.ko.md`)
      continue
    }
    const title = markdownTitle(markdown)
    if (!title) {
      errors.push(`${relative(markdownPath)}: first H1 is required for the Scene title`)
      continue
    }
    const quiz = await loadOptionalQuiz(directory, errors)
    try {
      const metadata = resolveMetadata(file.value, file.filePath, title)
      prepared.push({ filePath: file.filePath, document: file.value, value: normalizeSceneDocument(file.value, { ...metadata, title }, quiz) })
    } catch (error) {
      errors.push(`${relative(file.filePath)}: ${errorMessage(error)}`)
    }
  }
  return { files: prepared, errors }
}

async function validateMarkdownRefs<T extends { contentRef: string }>(files: readonly ContentFile<T>[]) {
  const errors: string[] = []
  for (const { filePath, value } of files) {
    try { await readFile(path.resolve(path.dirname(filePath), value.contentRef), "utf8") }
    catch { errors.push(`${relative(filePath)}: missing Markdown content ${value.contentRef}`) }
  }
  return errors
}

function buildSceneIndex(files: readonly PreparedSceneFile[]): SceneIndexEntry[] {
  return files.map(({ filePath, value }) => ({
    id: value.id,
    title: value.title,
    slug: value.slug,
    scenarioId: value.scenarioId,
    ...(value.parentId ? { parentId: value.parentId } : {}),
    status: value.status,
    moduleKey: moduleKey(filePath),
  }))
}

function buildConceptIndex(files: readonly ContentFile<Concept>[]): ConceptIndexEntry[] {
  return files.map(({ filePath, value }) => ({ id: value.id, slug: value.slug, status: value.status, moduleKey: moduleKey(filePath) }))
}

function buildRouteIndex(files: readonly PreparedSceneFile[]): RouteIndexEntry[] {
  const published = files.filter(({ value }) => value.status === "published")
  const scenesById = new Map(published.map((item) => [item.value.id, item]))
  const paths = new Map<string, string>()
  const childOrder = new Map<string, number>()
  for (const { document } of published) {
    for (const child of sceneDocumentChildren(document)) childOrder.set(child.childSceneId, child.order)
  }
  const resolveRoute = (sceneId: string): string => {
    const cached = paths.get(sceneId)
    if (cached) return cached
    const item = scenesById.get(sceneId)
    if (!item) throw new Error(`Published route references unavailable Scene: ${sceneId}`)
    const route = item.value.parentId ? `${resolveRoute(item.value.parentId)}/${item.value.slug}` : `/explore/${item.value.slug}`
    paths.set(sceneId, route)
    return route
  }
  return published.map(({ filePath, value }) => ({
    id: value.id,
    title: value.title,
    path: resolveRoute(value.id),
    ...(value.parentId ? { parentId: value.parentId } : {}),
    order: childOrder.get(value.id) ?? 0,
    status: "published" as const,
    moduleKey: moduleKey(filePath),
  })).sort((a, b) => a.path.localeCompare(b.path))
}

function renderContentIndex(scenes: readonly SceneIndexEntry[], concepts: readonly ConceptIndexEntry[]) {
  return `import type { ConceptIndexEntry, SceneIndexEntry } from "@/content/repository"\n\n// Generated by scripts/build-content-index.ts. Do not edit manually.\nexport const sceneIndex: readonly SceneIndexEntry[] = ${JSON.stringify(scenes, null, 2)}\nexport const conceptIndex: readonly ConceptIndexEntry[] = ${JSON.stringify(concepts, null, 2)}\n`
}
function renderRouteIndex(routes: readonly RouteIndexEntry[]) {
  return `import type { RouteIndexEntry } from "@/content/repository"\n\n// Generated by scripts/build-content-index.ts. Do not edit manually.\nexport const routeIndex: readonly RouteIndexEntry[] = ${JSON.stringify(routes, null, 2)}\n`
}
function renderSceneLayoutIndex(layouts: Readonly<Record<string, Awaited<ReturnType<typeof buildSceneLayout>>>>) {
  return `import type { SerializedSceneLayout } from "@/components/scene/scene-layout"\n\n// Generated by scripts/build-content-index.ts. Do not edit manually.\nexport const sceneLayoutIndex: Readonly<Record<string, SerializedSceneLayout>> = ${JSON.stringify(layouts, null, 2)}\n`
}
async function syncGenerated(fileName: string, output: string) {
  const outputPath = path.join(generatedRoot, fileName)
  if (checkOnly) {
    if (await readFile(outputPath, "utf8").catch(() => "") !== output) throw new Error(`${relative(outputPath)} is stale; run npm run content:build`)
    return
  }
  await writeFile(outputPath, output)
}

async function main() {
  const [scenePaths, conceptPaths] = await Promise.all([
    findFiles(path.join(contentRoot, "scenes"), "scene.yaml"),
    findFiles(path.join(contentRoot, "concepts"), "concept.yaml"),
  ])
  const [sceneDocuments, conceptResult] = await Promise.all([
    parseFiles<SceneDocument>(scenePaths, sceneDocumentSchema),
    parseFiles<Concept>(conceptPaths, conceptSchema),
  ])
  const sceneResult = await prepareScenes(sceneDocuments.files)
  const errors = [...sceneDocuments.errors, ...sceneResult.errors, ...conceptResult.errors]
  errors.push(...(await validateMarkdownRefs(conceptResult.files)))

  const graphIssues = validateContentGraph(sceneResult.files.map(({ value }) => value), conceptResult.files.map(({ value }) => value))
  const contentFiles = new Map([...sceneResult.files, ...conceptResult.files].map(({ filePath, value }) => [value.id, relative(filePath)]))
  for (const issue of graphIssues) errors.push(`${contentFiles.get(issue.contentId ?? "") ?? "content"}:${issue.path}: ${issue.message}`)
  if (errors.length > 0) throw new Error(`Content validation failed:\n${errors.map((item) => `- ${item}`).join("\n")}`)

  const scenes = buildSceneIndex(sceneResult.files)
  const concepts = buildConceptIndex(conceptResult.files)
  const routes = buildRouteIndex(sceneResult.files)
  const layouts = Object.fromEntries(await Promise.all(sceneResult.files.map(async ({ value }) => [value.id, await buildSceneLayout(value)])))
  await Promise.all([
    syncGenerated("content-index.ts", renderContentIndex(scenes, concepts)),
    syncGenerated("route-index.ts", renderRouteIndex(routes)),
    syncGenerated("scene-layout-index.ts", renderSceneLayoutIndex(layouts)),
  ])
}

main().catch((error) => {
  process.stderr.write(`${errorMessage(error)}\n`)
  process.exitCode = 1
})
