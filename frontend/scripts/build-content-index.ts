import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { parse } from "yaml"

import type {
  ConceptIndexEntry,
  RouteIndexEntry,
  SceneIndexEntry,
} from "../src/content/repository.ts"
import { validateContentGraph } from "../src/content/relationship-validation.ts"
import { conceptSchema, sceneSchema } from "../src/content/schemas.ts"
import type { Concept, Scene } from "../src/domain/content-types.ts"

type ContentFile<T> = { filePath: string; value: T }

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const contentRoot = path.join(appRoot, "content")
const generatedRoot = path.join(appRoot, "src/content/generated")
const checkOnly = process.argv.includes("--check")

async function findFiles(
  directory: string,
  fileName: string
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return findFiles(entryPath, fileName)
      return Promise.resolve(entry.name === fileName ? [entryPath] : [])
    })
  )
  return nested.flat().sort()
}

async function parseFiles<T>(
  filePaths: readonly string[],
  schema: {
    safeParse(input: unknown):
      | { success: true; data: T }
      | {
          success: false
          error: { issues: readonly { path: PropertyKey[]; message: string }[] }
        }
  }
): Promise<{ files: ContentFile<T>[]; errors: string[] }> {
  const files: ContentFile<T>[] = []
  const errors: string[] = []

  for (const filePath of filePaths) {
    try {
      const source = await readFile(filePath, "utf8")
      const result = schema.safeParse(parse(source))
      if (result.success) {
        files.push({ filePath, value: result.data })
      } else {
        for (const issue of result.error.issues) {
          errors.push(
            `${relative(filePath)}:${issue.path.map(String).join(".") || "root"}: ${issue.message}`
          )
        }
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

async function validateMarkdownRefs<
  T extends { id: string; contentRef: string },
>(files: readonly ContentFile<T>[]) {
  const errors: string[] = []
  for (const { filePath, value } of files) {
    const markdownPath = path.resolve(path.dirname(filePath), value.contentRef)
    if (!markdownPath.startsWith(`${path.dirname(filePath)}${path.sep}`)) {
      errors.push(
        `${relative(filePath)}: contentRef escapes its content directory`
      )
      continue
    }
    try {
      await readFile(markdownPath, "utf8")
    } catch {
      errors.push(
        `${relative(filePath)}: missing Markdown content ${value.contentRef}`
      )
    }
  }
  return errors
}

async function validateContextMarkdownRefs(
  files: readonly ContentFile<Scene>[]
) {
  const errors: string[] = []
  for (const { filePath, value } of files) {
    for (const context of value.contexts) {
      if (!context.contentRef) continue
      const markdownPath = path.resolve(
        path.dirname(filePath),
        context.contentRef
      )
      if (!markdownPath.startsWith(`${path.dirname(filePath)}${path.sep}`)) {
        errors.push(
          `${relative(filePath)}: context ${context.id} contentRef escapes its content directory`
        )
        continue
      }
      try {
        await readFile(markdownPath, "utf8")
      } catch {
        errors.push(
          `${relative(filePath)}: context ${context.id} is missing Markdown content ${context.contentRef}`
        )
      }
    }
  }
  return errors
}

function buildSceneIndex(
  files: readonly ContentFile<Scene>[]
): SceneIndexEntry[] {
  return files.map(({ filePath, value }) => ({
    id: value.id,
    slug: value.slug,
    scenarioId: value.scenarioId,
    ...(value.parentId ? { parentId: value.parentId } : {}),
    status: value.status,
    moduleKey: moduleKey(filePath),
  }))
}

function buildConceptIndex(
  files: readonly ContentFile<Concept>[]
): ConceptIndexEntry[] {
  return files.map(({ filePath, value }) => ({
    id: value.id,
    slug: value.slug,
    status: value.status,
    moduleKey: moduleKey(filePath),
  }))
}

function buildRouteIndex(
  files: readonly ContentFile<Scene>[]
): RouteIndexEntry[] {
  const published = files.filter(({ value }) => value.status === "published")
  const scenesById = new Map(published.map((item) => [item.value.id, item]))
  const paths = new Map<string, string>()

  const resolveRoute = (sceneId: string): string => {
    const cached = paths.get(sceneId)
    if (cached) return cached
    const item = scenesById.get(sceneId)
    if (!item)
      throw new Error(
        `Published route references unavailable scene: ${sceneId}`
      )
    const route = item.value.parentId
      ? `${resolveRoute(item.value.parentId)}/${item.value.slug}`
      : `/explore/${item.value.slug}`
    paths.set(sceneId, route)
    return route
  }

  return published
    .map(({ filePath, value }) => ({
      id: value.id,
      path: resolveRoute(value.id),
      ...(value.parentId ? { parentId: value.parentId } : {}),
      status: "published" as const,
      moduleKey: moduleKey(filePath),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

function renderContentIndex(
  scenes: readonly SceneIndexEntry[],
  concepts: readonly ConceptIndexEntry[]
) {
  return `import type { ConceptIndexEntry, SceneIndexEntry } from "@/content/repository"

// Generated by scripts/build-content-index.ts. Do not edit manually.
export const sceneIndex: readonly SceneIndexEntry[] = ${JSON.stringify(scenes, null, 2)}
export const conceptIndex: readonly ConceptIndexEntry[] = ${JSON.stringify(concepts, null, 2)}
`
}

function renderRouteIndex(routes: readonly RouteIndexEntry[]) {
  return `import type { RouteIndexEntry } from "@/content/repository"

// Generated by scripts/build-content-index.ts. Do not edit manually.
export const routeIndex: readonly RouteIndexEntry[] = ${JSON.stringify(routes, null, 2)}
`
}

async function syncGenerated(fileName: string, output: string) {
  const outputPath = path.join(generatedRoot, fileName)
  if (checkOnly) {
    const current = await readFile(outputPath, "utf8").catch(() => "")
    if (current !== output) {
      throw new Error(
        `${relative(outputPath)} is stale; run npm run content:build`
      )
    }
    return
  }
  await writeFile(outputPath, output)
}

async function main() {
  const [scenePaths, conceptPaths] = await Promise.all([
    findFiles(path.join(contentRoot, "scenes"), "scene.yaml"),
    findFiles(path.join(contentRoot, "concepts"), "concept.yaml"),
  ])
  const [sceneResult, conceptResult] = await Promise.all([
    parseFiles<Scene>(scenePaths, sceneSchema),
    parseFiles<Concept>(conceptPaths, conceptSchema),
  ])

  const errors = [...sceneResult.errors, ...conceptResult.errors]
  errors.push(
    ...(await validateMarkdownRefs(sceneResult.files)),
    ...(await validateMarkdownRefs(conceptResult.files)),
    ...(await validateContextMarkdownRefs(sceneResult.files))
  )

  const graphIssues = validateContentGraph(
    sceneResult.files.map(({ value }) => value),
    conceptResult.files.map(({ value }) => value)
  )
  const contentFiles = new Map(
    [...sceneResult.files, ...conceptResult.files].map(
      ({ filePath, value }) => [value.id, relative(filePath)]
    )
  )
  for (const graphIssue of graphIssues) {
    errors.push(
      `${contentFiles.get(graphIssue.contentId ?? "") ?? "content"}:${graphIssue.path}: ${graphIssue.message}`
    )
  }

  if (errors.length > 0) {
    throw new Error(
      `Content validation failed:\n${errors.map((item) => `- ${item}`).join("\n")}`
    )
  }

  const scenes = buildSceneIndex(sceneResult.files)
  const concepts = buildConceptIndex(conceptResult.files)
  const routes = buildRouteIndex(sceneResult.files)
  await Promise.all([
    syncGenerated("content-index.ts", renderContentIndex(scenes, concepts)),
    syncGenerated("route-index.ts", renderRouteIndex(routes)),
  ])
}

main().catch((error) => {
  process.stderr.write(`${errorMessage(error)}\n`)
  process.exitCode = 1
})
