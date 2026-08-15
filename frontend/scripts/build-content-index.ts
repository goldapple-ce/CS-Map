import { access, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { parse } from "yaml"
import type { ZodType } from "zod"

import type {
  GeneratedConceptContent,
  GeneratedContentData,
} from "@shared/content/generated-contract"
import { validateContentGraph } from "./content-build/relationship-validation.ts"
import {
  conceptSchema,
  normalizeSceneDocument,
  sceneDocumentSchema,
  sceneQuizSchema,
  scenarioDocumentSchema,
  type SceneDocument,
  type ScenarioDocument,
} from "./content-build/schemas.ts"
import type { Concept, Scene, SelfCheckQuestion } from "@shared/content/types"
import {
  buildRouteIndex,
  renderContentData,
} from "./content-build/indexes.ts"
import {
  collectReachableSceneIds,
  collectSceneOwners,
  createSceneMetadataResolver,
  rootOwnershipError,
} from "./content-build/scene-graph.ts"
import { buildSceneLayout } from "./elk-scene-layout.ts"

type ContentFile<T> = { filePath: string; value: T }
type PreparedSceneFile = ContentFile<Scene> & {
  document: SceneDocument
  markdown: string
  topicExplanations: Readonly<Record<string, string>>
}

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const contentRoot = path.join(appRoot, "content")
const generatedRoot = path.join(appRoot, "src/content/generated")
const checkOnly = process.argv.includes("--check")
const obsoleteGeneratedFiles = [
  "content-index.ts",
  "route-index.ts",
  "scene-layout-index.ts",
]

/** 지정한 디렉터리 아래에서 이름이 일치하는 파일을 재귀적으로 찾아 정렬한다. */
async function findFiles(directory: string, fileName: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const matches = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return findFiles(entryPath, fileName)
      return Promise.resolve(entry.name === fileName ? [entryPath] : [])
    })
  )
  return matches.flat().sort()
}

/** YAML 파일을 읽어 스키마로 검증하고 성공한 값과 오류를 입력 순서대로 모은다. */
async function parseFiles<T>(
  filePaths: readonly string[],
  schema: ZodType<T>
): Promise<{ files: ContentFile<T>[]; errors: string[] }> {
  const files: ContentFile<T>[] = []
  const errors: string[] = []
  for (const filePath of filePaths) {
    try {
      const result = schema.safeParse(parse(await readFile(filePath, "utf8")))
      if (result.success) files.push({ filePath, value: result.data })
      else for (const issue of result.error.issues) {
        errors.push(
          `${relativePath(filePath)}:${issue.path.map(String).join(".") || "root"}: ${issue.message}`
        )
      }
    } catch (error) {
      errors.push(`${relativePath(filePath)}: ${errorMessage(error)}`)
    }
  }
  return { files, errors }
}

/** 애플리케이션 루트 기준 경로를 운영체제와 무관한 슬래시 형식으로 바꾼다. */
function relativePath(filePath: string) {
  return path.relative(appRoot, filePath).split(path.sep).join("/")
}

/** 알 수 없는 예외 값을 사용자에게 표시할 문자열로 정규화한다. */
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

/** Scene 디렉터리의 선택적 퀴즈를 읽고 검증하며 파일이 없으면 생략한다. */
async function loadOptionalQuiz(directory: string, errors: string[]) {
  const quizPath = path.join(directory, "quiz.ko.yaml")
  let source: string
  try {
    source = await readFile(quizPath, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined
    errors.push(`${relativePath(quizPath)}: ${errorMessage(error)}`)
    return undefined
  }
  const result = sceneQuizSchema.safeParse(parse(source))
  if (result.success) return result.data as SelfCheckQuestion[]
  for (const issue of result.error.issues) {
    errors.push(
      `${relativePath(quizPath)}:${issue.path.map(String).join(".") || "root"}: ${issue.message}`
    )
  }
  return undefined
}

/** Scene 설명·퀴즈를 확인하고 graph 메타데이터로 화면용 Scene을 준비한다. */
async function prepareScenes(
  files: readonly ContentFile<SceneDocument>[],
  scenario: ScenarioDocument
) {
  const ownership = collectSceneOwners(files)
  const errors = [...ownership.errors]
  const rootError = rootOwnershipError(scenario.rootSceneId, ownership.owners)
  if (rootError) errors.push(rootError)
  const resolveMetadata = createSceneMetadataResolver(
    files,
    scenario,
    ownership.owners
  )

  const prepared: PreparedSceneFile[] = []
  for (const file of files) {
    const directory = path.dirname(file.filePath)
    let markdown: string
    try {
      markdown = await readFile(path.join(directory, "content.ko.md"), "utf8")
    } catch {
      errors.push(
        `${relativePath(file.filePath)}: missing Markdown content content.ko.md`
      )
      continue
    }
    const quiz = await loadOptionalQuiz(directory, errors)
    const topicExplanations: Record<string, string> = {}
    for (const [elementId, node] of Object.entries(file.value.nodes)) {
      if (node.description) topicExplanations[elementId] = node.description
      if (!node.contentRef) continue
      try {
        topicExplanations[elementId] = await readFile(
          path.join(directory, node.contentRef),
          "utf8"
        )
      } catch {
        errors.push(
          `${relativePath(file.filePath)}: missing Markdown content ${node.contentRef}`
        )
      }
    }
    try {
      const metadata = resolveMetadata(file.value, file.filePath)
      prepared.push({
        filePath: file.filePath,
        document: file.value,
        value: normalizeSceneDocument(file.value, metadata, quiz),
        markdown,
        topicExplanations,
      })
    } catch (error) {
      errors.push(`${relativePath(file.filePath)}: ${errorMessage(error)}`)
    }
  }
  return { files: prepared, errors }
}

/** Concept와 참조 Markdown을 완성된 생성 record로 준비한다. */
async function prepareConcepts(files: readonly ContentFile<Concept>[]) {
  const errors: string[] = []
  const concepts: Record<string, GeneratedConceptContent> = {}
  for (const { filePath, value } of files) {
    try {
      const markdown = await readFile(
        path.resolve(path.dirname(filePath), value.contentRef),
        "utf8"
      )
      concepts[value.id] = { concept: value, markdown }
    } catch {
      errors.push(
        `${relativePath(filePath)}: missing Markdown content ${value.contentRef}`
      )
    }
  }
  return { concepts, errors }
}

/** 생성 파일을 쓰거나 `--check`에서는 정확한 바이트가 최신인지 확인한다. */
async function syncGenerated(fileName: string, output: string) {
  const outputPath = path.join(generatedRoot, fileName)
  if (checkOnly) {
    if (await readFile(outputPath, "utf8").catch(() => "") !== output) {
      throw new Error(
        `${relativePath(outputPath)} is stale; run npm run content:build`
      )
    }
    return
  }
  await writeFile(outputPath, output)
}

/** 알려진 이전 generated 파일을 build에서는 지우고 check에서는 오류로 보고한다. */
async function removeObsoleteGenerated() {
  for (const fileName of obsoleteGeneratedFiles) {
    const filePath = path.join(generatedRoot, fileName)
    try {
      await access(filePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue
      throw error
    }
    if (checkOnly) {
      throw new Error(
        `${relativePath(filePath)} is obsolete; run npm run content:build`
      )
    }
    await unlink(filePath)
  }
}

/** 수집된 오류를 기존 Content Build 형식의 단일 검증 오류로 던진다. */
function throwContentValidation(errors: readonly string[]): never {
  throw new Error(
    `Content validation failed:\n${errors.map((item) => `- ${item}`).join("\n")}`
  )
}

/** 파일 탐색·검증·순수 계산·생성물 동기화의 전체 순서를 조율한다. */
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
  if (!scenario) throwContentValidation(errors)

  const sceneResult = await prepareScenes(sceneDocuments.files, scenario)
  errors.push(...sceneResult.errors)
  const preparedConcepts = await prepareConcepts(conceptResult.files)
  errors.push(...preparedConcepts.errors)

  const reachability = collectReachableSceneIds(
    scenario.rootSceneId,
    sceneDocuments.files
  )
  errors.push(...reachability.errors)

  const graphIssues = validateContentGraph(
    sceneResult.files.map(({ value }) => value),
    conceptResult.files.map(({ value }) => value)
  )
  const contentFiles = new Map(
    [...sceneResult.files, ...conceptResult.files].map(({ filePath, value }) => [
      value.id,
      relativePath(filePath),
    ])
  )
  for (const issue of graphIssues) {
    errors.push(
      `${contentFiles.get(issue.contentId ?? "") ?? "content"}:${issue.path}: ${issue.message}`
    )
  }
  if (errors.length > 0) throwContentValidation(errors)

  const publishedSceneFiles = sceneResult.files.filter(({ value }) =>
    reachability.reachable.has(value.id)
  )
  const layouts = Object.fromEntries(
    await Promise.all(
      publishedSceneFiles.map(async ({ value }) => [
        value.id,
        await buildSceneLayout(value),
      ])
    )
  )
  const data: GeneratedContentData = {
    rootSceneId: scenario.rootSceneId,
    routes: buildRouteIndex(publishedSceneFiles),
    scenes: Object.fromEntries(
      publishedSceneFiles.map(({ value, markdown, topicExplanations }) => [
        value.id,
        { scene: value, markdown, topicExplanations },
      ])
    ),
    concepts: preparedConcepts.concepts,
    layouts,
  }

  await syncGenerated("content-data.ts", renderContentData(data))
  await removeObsoleteGenerated()
}

main().catch((error) => {
  process.stderr.write(`${errorMessage(error)}\n`)
  process.exitCode = 1
})
