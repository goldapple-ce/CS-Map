import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import { parse } from "yaml"
import type { ZodType } from "zod"

import type { Scene, SelfCheckQuestion } from "@shared/content/types"
import {
  prepareMarkdownImages,
  type GeneratedContentAsset,
} from "./markdown-images.ts"
import {
  collectSceneOwners,
  createSceneMetadataResolver,
  rootOwnershipError,
} from "./scene-graph.ts"
import {
  contentIdSchema,
  normalizeSceneDocument,
  sceneDocumentSchema,
  sceneQuizSchema,
  type SceneDocument,
  type SceneSourceDocument,
} from "./schemas.ts"

type ContentFile<T> = { filePath: string; value: T }
type PreparedSceneFile = ContentFile<Scene> & {
  document: SceneDocument
  markdown: string
  topicExplanations: Readonly<Record<string, string>>
  areaExplanations: Readonly<Record<string, string>>
}

type SceneSourceFile = ContentFile<SceneSourceDocument>

/** 제품의 고정 시작점인 Root Scene에 부여하는 ID다. */
export const ROOT_SCENE_ID = "enter-google"

/** 지정한 디렉터리 아래에서 이름이 일치하는 파일을 재귀적으로 찾아 정렬한다. */
async function findFiles(
  directory: string,
  fileName: string
): Promise<string[]> {
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

/** 애플리케이션 루트 기준 경로를 슬래시 형식으로 바꾼다. */
function relativePath(appRoot: string, filePath: string) {
  return path.relative(appRoot, filePath).split(path.sep).join("/")
}

/** 알 수 없는 예외 값을 사용자에게 표시할 문자열로 정규화한다. */
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

/** YAML 파일을 읽어 스키마로 검증하고 성공한 값과 오류를 입력 순서대로 모은다. */
async function parseFiles<T>(
  appRoot: string,
  filePaths: readonly string[],
  schema: ZodType<T>
): Promise<{ files: ContentFile<T>[]; errors: string[] }> {
  const files: ContentFile<T>[] = []
  const errors: string[] = []
  for (const filePath of filePaths) {
    try {
      const result = schema.safeParse(parse(await readFile(filePath, "utf8")))
      if (result.success) files.push({ filePath, value: result.data })
      else
        for (const issue of result.error.issues) {
          errors.push(
            `${relativePath(appRoot, filePath)}:${issue.path.map(String).join(".") || "root"}: ${issue.message}`
          )
        }
    } catch (error) {
      errors.push(`${relativePath(appRoot, filePath)}: ${errorMessage(error)}`)
    }
  }
  return { files, errors }
}

/** content/scenes 기준 폴더 경로를 계층형 ID로 주입하고 잘못되거나 중복된 경로를 보고한다. */
export function deriveSceneDocuments(
  appRoot: string,
  files: readonly SceneSourceFile[]
): { files: ContentFile<SceneDocument>[]; errors: string[] } {
  const derived: ContentFile<SceneDocument>[] = []
  const errors: string[] = []
  const filesById = new Map<string, string>()
  const scenesRoot = path.join(appRoot, "content", "scenes")

  for (const file of files) {
    const sceneDirectory = path.dirname(file.filePath)
    const relativeDirectory = path.relative(scenesRoot, sceneDirectory)
    if (
      relativeDirectory.startsWith(`..${path.sep}`) ||
      relativeDirectory === ".." ||
      path.isAbsolute(relativeDirectory)
    ) {
      errors.push(
        `${relativePath(appRoot, file.filePath)}: Scene must be inside content/scenes`
      )
      continue
    }

    const segments = relativeDirectory ? relativeDirectory.split(path.sep) : []
    const invalidSegment = segments.find(
      (segment) => !contentIdSchema.safeParse(segment).success
    )
    if (invalidSegment) {
      errors.push(
        `${relativePath(appRoot, file.filePath)}: Scene path segment must be lowercase kebab-case: ${invalidSegment}`
      )
      continue
    }

    const id = segments.length > 0 ? segments.join("-") : ROOT_SCENE_ID

    const previousPath = filesById.get(id)
    if (previousPath) {
      errors.push(
        `Duplicate derived Scene ID ${id}: ${relativePath(appRoot, previousPath)}, ${relativePath(appRoot, file.filePath)}`
      )
      continue
    }

    filesById.set(id, file.filePath)
    derived.push({
      filePath: file.filePath,
      value: { ...file.value, id },
    })
  }

  return { files: derived, errors }
}

/** 고정 Root Scene과 하위 Scene 작성 파일을 읽어 YAML 검증 결과를 반환한다. */
export async function readSourceDocuments(appRoot: string) {
  const contentRoot = path.join(appRoot, "content")
  const rootScenePath = path.join(contentRoot, "scenes", "scene.yaml")
  const scenePaths = await findFiles(
    path.join(contentRoot, "scenes"),
    "scene.yaml"
  )
  const sceneDocuments = await parseFiles(
    appRoot,
    scenePaths,
    sceneDocumentSchema
  )
  const derivedScenes = deriveSceneDocuments(appRoot, sceneDocuments.files)
  sceneDocuments.errors.push(...derivedScenes.errors)
  const rootScene = derivedScenes.files.find(
    ({ filePath }) => filePath === rootScenePath
  )
  if (!scenePaths.includes(rootScenePath)) {
    sceneDocuments.errors.push(
      `${relativePath(appRoot, rootScenePath)}: missing Root Scene file`
    )
  }
  return {
    rootScene,
    sceneDocuments: {
      files: derivedScenes.files,
      errors: sceneDocuments.errors,
    },
  }
}

/** Scene 디렉터리의 선택적 퀴즈를 읽고 검증하며 파일이 없으면 생략한다. */
async function loadOptionalQuiz(
  appRoot: string,
  directory: string,
  errors: string[]
) {
  const quizPath = path.join(directory, "quiz.ko.yaml")
  let source: string
  try {
    source = await readFile(quizPath, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined
    errors.push(`${relativePath(appRoot, quizPath)}: ${errorMessage(error)}`)
    return undefined
  }
  const result = sceneQuizSchema.safeParse(parse(source))
  if (result.success) return result.data as SelfCheckQuestion[]
  for (const issue of result.error.issues) {
    errors.push(
      `${relativePath(appRoot, quizPath)}:${issue.path.map(String).join(".") || "root"}: ${issue.message}`
    )
  }
  return undefined
}

/** Scene 설명·퀴즈를 확인하고 graph 메타데이터로 화면용 Scene을 준비한다. */
export async function prepareScenes(
  appRoot: string,
  files: readonly ContentFile<SceneDocument>[],
  rootSceneId: string
) {
  const ownership = collectSceneOwners(files)
  const errors = [...ownership.errors]
  const rootError = rootOwnershipError(rootSceneId, ownership.owners)
  if (rootError) errors.push(rootError)
  const resolveMetadata = createSceneMetadataResolver(
    files,
    rootSceneId,
    ownership.owners
  )

  const prepared: PreparedSceneFile[] = []
  const assets: GeneratedContentAsset[] = []
  for (const file of files) {
    const directory = path.dirname(file.filePath)
    const sceneMarkdownPath = path.join(directory, "content.ko.md")
    let markdown: string
    try {
      markdown = await readFile(sceneMarkdownPath, "utf8")
    } catch {
      errors.push(
        `${relativePath(appRoot, file.filePath)}: missing Markdown content content.ko.md`
      )
      continue
    }
    const preparedMarkdown = await prepareMarkdownImages(
      appRoot,
      sceneMarkdownPath,
      markdown
    )
    markdown = preparedMarkdown.markdown
    assets.push(...preparedMarkdown.assets)
    errors.push(
      ...preparedMarkdown.errors.map(
        (error) => `${relativePath(appRoot, sceneMarkdownPath)}: ${error}`
      )
    )
    const quiz = await loadOptionalQuiz(appRoot, directory, errors)
    const topicExplanations: Record<string, string> = {}
    for (const [elementId, node] of Object.entries(file.value.nodes)) {
      if (node.description) topicExplanations[elementId] = node.description
      if (!node.contentRef) continue
      const topicMarkdownPath = path.join(directory, node.contentRef)
      try {
        const topicMarkdown = await readFile(topicMarkdownPath, "utf8")
        const preparedTopicMarkdown = await prepareMarkdownImages(
          appRoot,
          topicMarkdownPath,
          topicMarkdown
        )
        topicExplanations[elementId] = preparedTopicMarkdown.markdown
        assets.push(...preparedTopicMarkdown.assets)
        errors.push(
          ...preparedTopicMarkdown.errors.map(
            (error) => `${relativePath(appRoot, topicMarkdownPath)}: ${error}`
          )
        )
      } catch {
        errors.push(
          `${relativePath(appRoot, file.filePath)}: missing Markdown content ${node.contentRef}`
        )
      }
    }
    const areaExplanations: Record<string, string> = {}
    for (const [areaId, area] of Object.entries(file.value.areas)) {
      if (!area.contentRef) continue
      const areaMarkdownPath = path.join(directory, area.contentRef)
      try {
        const areaMarkdown = await readFile(areaMarkdownPath, "utf8")
        const preparedAreaMarkdown = await prepareMarkdownImages(
          appRoot,
          areaMarkdownPath,
          areaMarkdown
        )
        areaExplanations[areaId] = preparedAreaMarkdown.markdown
        assets.push(...preparedAreaMarkdown.assets)
        errors.push(
          ...preparedAreaMarkdown.errors.map(
            (error) => `${relativePath(appRoot, areaMarkdownPath)}: ${error}`
          )
        )
      } catch {
        errors.push(
          `${relativePath(appRoot, file.filePath)}: missing Markdown content ${area.contentRef}`
        )
      }
    }
    try {
      const metadata = resolveMetadata(file.value)
      prepared.push({
        filePath: file.filePath,
        document: file.value,
        value: normalizeSceneDocument(file.value, metadata, quiz),
        markdown,
        topicExplanations,
        areaExplanations,
      })
    } catch (error) {
      errors.push(
        `${relativePath(appRoot, file.filePath)}: ${errorMessage(error)}`
      )
    }
  }
  return { files: prepared, errors, assets }
}
