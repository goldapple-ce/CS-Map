import path from "node:path"
import { fileURLToPath } from "node:url"

import type { GeneratedContentData } from "@shared/content/generated-contract"
import {
  buildRouteIndex,
  renderContentData,
} from "./content-build/generated-content.ts"
import { syncGeneratedContent } from "./content-build/generated-file.ts"
import { validateContentGraph } from "./content-build/relationship-validation.ts"
import { collectReachableSceneIds } from "./content-build/scene-graph.ts"
import {
  prepareScenes,
  readSourceDocuments,
} from "./content-build/source-content.ts"
import { buildSceneLayout } from "./elk-scene-layout.ts"

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const checkOnly = process.argv.includes("--check")

/** 애플리케이션 루트 기준 경로를 운영체제와 무관한 슬래시 형식으로 바꾼다. */
function relativePath(filePath: string) {
  return path.relative(appRoot, filePath).split(path.sep).join("/")
}

/** 알 수 없는 예외 값을 사용자에게 표시할 문자열로 정규화한다. */
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

/** 수집된 오류를 기존 Content Build 형식의 단일 검증 오류로 던진다. */
function throwContentValidation(errors: readonly string[]): never {
  throw new Error(
    `Content validation failed:\n${errors.map((item) => `- ${item}`).join("\n")}`
  )
}

/** Source 검증부터 Layout·data 조립과 생성물 동기화까지 순서대로 조율한다. */
async function main() {
  const { rootScene, sceneDocuments } = await readSourceDocuments(appRoot)
  const errors = [...sceneDocuments.errors]
  if (!rootScene) throwContentValidation(errors)
  const rootSceneId = rootScene.value.id

  const sceneResult = await prepareScenes(
    appRoot,
    sceneDocuments.files,
    rootSceneId
  )
  errors.push(...sceneResult.errors)
  const reachability = collectReachableSceneIds(
    rootSceneId,
    sceneDocuments.files
  )
  errors.push(...reachability.errors)

  const graphIssues = validateContentGraph(
    sceneResult.files.map(({ value }) => value)
  )
  const contentFiles = new Map(
    sceneResult.files.map(({ filePath, value }) => [
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

  const publishedScenes = sceneResult.files.filter(({ value }) =>
    reachability.reachable.has(value.id)
  )
  const layouts = Object.fromEntries(
    await Promise.all(
      publishedScenes.map(async ({ value }) => [
        value.id,
        await buildSceneLayout(value),
      ])
    )
  )
  const data: GeneratedContentData = {
    rootSceneId,
    routes: buildRouteIndex(publishedScenes),
    scenes: Object.fromEntries(
      publishedScenes.map(
        ({ value, markdown, topicExplanations, areaExplanations }) => [
          value.id,
          { scene: value, markdown, topicExplanations, areaExplanations },
        ]
      )
    ),
    layouts,
  }

  await syncGeneratedContent(
    appRoot,
    renderContentData(data),
    checkOnly,
    sceneResult.assets
  )
}

main().catch((error) => {
  process.stderr.write(`${errorMessage(error)}\n`)
  process.exitCode = 1
})
