import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  deriveSceneDocuments,
  ROOT_SCENE_ID,
} from "../../../scripts/content-build/source-content.ts"
import { sceneDocumentSchema } from "../../../scripts/content-build/schemas.ts"

const appRoot = path.join(path.sep, "app")

/** ID가 없는 최소 Scene 작성 문서를 만든다. */
function sourceScene(title: string) {
  return sceneDocumentSchema.parse({
    title,
    summary: title,
    nodes: {},
  })
}

describe("Source content", () => {
  it("scenes 기준 상대 폴더 경로 전체를 Scene ID로 주입한다", () => {
    const result = deriveSceneDocuments(appRoot, [
      {
        filePath: path.join(appRoot, "content/scenes/scene.yaml"),
        value: sourceScene("Root"),
      },
      {
        filePath: path.join(
          appRoot,
          "content/scenes/server/sample-scene/scene.yaml"
        ),
        value: sourceScene("Sample"),
      },
    ])

    expect(result.errors).toEqual([])
    expect(result.files.map(({ value }) => value.id)).toEqual([
      ROOT_SCENE_ID,
      "server-sample-scene",
    ])
  })

  it("잘못된 경로 세그먼트와 중복 파생 ID에 관련 파일 경로를 표시한다", () => {
    const result = deriveSceneDocuments(appRoot, [
      {
        filePath: path.join(appRoot, "content/scenes/InvalidName/scene.yaml"),
        value: sourceScene("Invalid"),
      },
      {
        filePath: path.join(appRoot, "content/scenes/first-shared/scene.yaml"),
        value: sourceScene("First"),
      },
      {
        filePath: path.join(appRoot, "content/scenes/first/shared/scene.yaml"),
        value: sourceScene("Second"),
      },
    ])

    expect(result.errors).toEqual([
      "content/scenes/InvalidName/scene.yaml: Scene path segment must be lowercase kebab-case: InvalidName",
      "Duplicate derived Scene ID first-shared: content/scenes/first-shared/scene.yaml, content/scenes/first/shared/scene.yaml",
    ])
  })
})
