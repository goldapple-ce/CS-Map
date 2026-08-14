import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { parse } from "yaml"

import type {
  ConceptIndexEntry,
  ContentManifest,
  RouteIndexEntry,
  SceneIndexEntry,
} from "../src/content/repository.ts"
import { validateContentGraph } from "../src/content/relationship-validation.ts"
import {
  conceptSchema,
  normalizeSceneDocument,
  sceneDocumentChildren,
  sceneDocumentSchema,
  sceneQuizSchema,
  scenarioDocumentSchema,
  type SceneDocument,
  type SceneDerivedMetadata,
  type ScenarioDocument,
} from "../src/content/schemas.ts"
import type { Concept, Scene, SelfCheckQuestion } from "../src/content/types.ts"
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

async function prepareScenes(
  files: readonly ContentFile<SceneDocument>[],
  scenario: ScenarioDocument
) {
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
  const rootOwner = ownerByChildId.get(scenario.rootSceneId)
  if (rootOwner) {
    errors.push(
      `${scenario.rootSceneId}: configured root Scene cannot be a child of ${rootOwner.parentId}`
    )
  }

  const metadataCache = new Map<string, SceneDerivedMetadata>()
  const resolving = new Set<string>()
  const resolveMetadata = (document: SceneDocument, filePath: string): SceneDerivedMetadata => {
    const cached = metadataCache.get(document.id)
    if (cached) return cached
    if (resolving.has(document.id)) throw new Error(`Child Scene cycle detected at ${document.id}`)
    resolving.add(document.id)
    if (document.id === scenario.rootSceneId) {
      const metadata: SceneDerivedMetadata = {
        slug: path.basename(path.dirname(filePath)),
        scenarioId: scenario.id,
      }
      metadataCache.set(document.id, metadata)
      resolving.delete(document.id)
      return metadata
    }
    const owner = ownerByChildId.get(document.id)
    const parentFile = owner ? documentsById.get(owner.parentId) : undefined
    const parentMetadata = parentFile
      ? resolveMetadata(parentFile.value, parentFile.filePath)
      : undefined
    const metadata: SceneDerivedMetadata = {
      slug: owner?.nodeId ?? path.basename(path.dirname(filePath)),
      scenarioId: parentMetadata?.scenarioId ?? document.id,
      ...(owner ? { parentId: owner.parentId } : {}),
    }
    metadataCache.set(document.id, metadata)
    resolving.delete(document.id)
    return metadata
  }

  const prepared: PreparedSceneFile[] = []
  for (const file of files) {
    const directory = path.dirname(file.filePath)
    const markdownPath = path.join(directory, "content.ko.md")
    try {
      await readFile(markdownPath, "utf8")
    } catch {
      errors.push(`${relative(file.filePath)}: missing Markdown content content.ko.md`)
      continue
    }
    const quiz = await loadOptionalQuiz(directory, errors)
    try {
      const metadata = resolveMetadata(file.value, file.filePath)
      prepared.push({ filePath: file.filePath, document: file.value, value: normalizeSceneDocument(file.value, metadata, quiz) })
    } catch (error) {
      errors.push(`${relative(file.filePath)}: ${errorMessage(error)}`)
    }
  }
  return { files: prepared, errors }
}

function collectReachableSceneIds(
  rootSceneId: string,
  files: readonly ContentFile<SceneDocument>[]
) {
  const scenesById = new Map(files.map((file) => [file.value.id, file.value]))
  const reachable = new Set<string>()
  const errors: string[] = []

  if (!scenesById.has(rootSceneId)) {
    errors.push(
      `content/scenarios: configured rootSceneId references unknown Scene: ${rootSceneId}`
    )
    return { reachable, errors }
  }

  const visit = (sceneId: string) => {
    if (reachable.has(sceneId)) return
    const scene = scenesById.get(sceneId)
    if (!scene) return
    reachable.add(sceneId)
    for (const child of sceneDocumentChildren(scene)) {
      if (!scenesById.has(child.childSceneId)) {
        errors.push(
          `${scene.id}:nodes.${child.nodeId}.childSceneId: Unknown child Scene: ${child.childSceneId}`
        )
        continue
      }
      visit(child.childSceneId)
    }
  }

  visit(rootSceneId)
  return { reachable, errors }
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

function renderContentIndex(
  manifest: ContentManifest,
  scenes: readonly SceneIndexEntry[],
  concepts: readonly ConceptIndexEntry[]
) {
  return `import type { ConceptIndexEntry, ContentManifest, SceneIndexEntry } from "@/content/repository"\n\n// Generated by scripts/build-content-index.ts. Do not edit manually.\nexport const contentManifest: ContentManifest = ${JSON.stringify(manifest, null, 2)}\nexport const sceneIndex: readonly SceneIndexEntry[] = ${JSON.stringify(scenes, null, 2)}\nexport const conceptIndex: readonly ConceptIndexEntry[] = ${JSON.stringify(concepts, null, 2)}\n`
}
function renderRouteIndex(routes: readonly RouteIndexEntry[]) {
  return `import type { RouteIndexEntry } from "@/content/repository"\n\n// Generated by scripts/build-content-index.ts. Do not edit manually.\nexport const routeIndex: readonly RouteIndexEntry[] = ${JSON.stringify(routes, null, 2)}\n`
}
function renderSceneLayoutIndex(layouts: Readonly<Record<string, Awaited<ReturnType<typeof buildSceneLayout>>>>) {
  return `import type { SerializedSceneLayout } from "@/features/explorer/layout/scene-layout"\n\n// Generated by scripts/build-content-index.ts. Do not edit manually.\nexport const sceneLayoutIndex: Readonly<Record<string, SerializedSceneLayout>> = ${JSON.stringify(layouts, null, 2)}\n`
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
  const [scenarioPaths, scenePaths, conceptPaths] = await Promise.all([
    findFiles(path.join(contentRoot, "scenarios"), "scenario.yaml"),
    findFiles(path.join(contentRoot, "scenes"), "scene.yaml"),
    findFiles(path.join(contentRoot, "concepts"), "concept.yaml"),
  ])
  const [scenarioDocuments, sceneDocuments, conceptResult] = await Promise.all([
    parseFiles<ScenarioDocument>(scenarioPaths, scenarioDocumentSchema),
    parseFiles<SceneDocument>(scenePaths, sceneDocumentSchema),
    parseFiles<Concept>(conceptPaths, conceptSchema),
  ])
  const errors = [
    ...scenarioDocuments.errors,
    ...sceneDocuments.errors,
    ...conceptResult.errors,
  ]
  if (scenarioPaths.length !== 1) {
    errors.push(
      `content/scenarios: expected exactly one scenario.yaml, found ${scenarioPaths.length}`
    )
  }
  const scenario = scenarioDocuments.files[0]?.value
  if (!scenario) {
    throw new Error(
      `Content validation failed:\n${errors.map((item) => `- ${item}`).join("\n")}`
    )
  }

  const sceneResult = await prepareScenes(sceneDocuments.files, scenario)
  errors.push(...sceneResult.errors)
  errors.push(...(await validateMarkdownRefs(conceptResult.files)))

  const reachability = collectReachableSceneIds(
    scenario.rootSceneId,
    sceneDocuments.files
  )
  errors.push(...reachability.errors)

  const graphIssues = validateContentGraph(sceneResult.files.map(({ value }) => value), conceptResult.files.map(({ value }) => value))
  const contentFiles = new Map([...sceneResult.files, ...conceptResult.files].map(({ filePath, value }) => [value.id, relative(filePath)]))
  for (const issue of graphIssues) errors.push(`${contentFiles.get(issue.contentId ?? "") ?? "content"}:${issue.path}: ${issue.message}`)
  if (errors.length > 0) throw new Error(`Content validation failed:\n${errors.map((item) => `- ${item}`).join("\n")}`)

  const publishedSceneFiles = sceneResult.files.filter(({ value }) =>
    reachability.reachable.has(value.id)
  )
  const manifest: ContentManifest = {
    scenarioId: scenario.id,
    rootSceneId: scenario.rootSceneId,
  }
  const scenes = buildSceneIndex(publishedSceneFiles)
  const concepts = buildConceptIndex(conceptResult.files)
  const routes = buildRouteIndex(publishedSceneFiles)
  const layouts = Object.fromEntries(await Promise.all(publishedSceneFiles.map(async ({ value }) => [value.id, await buildSceneLayout(value)])))
  await Promise.all([
    syncGenerated("content-index.ts", renderContentIndex(manifest, scenes, concepts)),
    syncGenerated("route-index.ts", renderRouteIndex(routes)),
    syncGenerated("scene-layout-index.ts", renderSceneLayoutIndex(layouts)),
  ])
}

main().catch((error) => {
  process.stderr.write(`${errorMessage(error)}\n`)
  process.exitCode = 1
})
