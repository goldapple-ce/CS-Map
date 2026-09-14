import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  deriveSceneDocuments,
  ROOT_SCENE_ID,
} from "../../../scripts/content-build/source-content.ts"
import {
  normalizeSceneDocument,
  sceneDocumentSchema,
} from "../../../scripts/content-build/schemas.ts"

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
  it("Scene 요약과 검색 키워드를 runtime 모델에 보존한다", () => {
    const document = {
      ...sourceScene("Searchable Scene"),
      id: "searchable-scene",
      keywords: ["별칭", "alias"],
    }

    expect(
      normalizeSceneDocument(document, { slug: "searchable-scene" })
    ).toMatchObject({
      summary: "Searchable Scene",
      keywords: ["별칭", "alias"],
    })
  })

  it("빈 검색 키워드 배열과 빈 키워드를 거부한다", () => {
    expect(() =>
      sceneDocumentSchema.parse({
        title: "Empty keywords",
        summary: "Summary",
        keywords: [],
        nodes: {},
      })
    ).toThrow()
    expect(() =>
      sceneDocumentSchema.parse({
        title: "Blank keyword",
        summary: "Summary",
        keywords: ["   "],
        nodes: {},
      })
    ).toThrow()
  })

  it("Area contentRef를 build-only 설명 여부로 정규화한다", () => {
    const document = {
      ...sourceScene("Area Scene"),
      id: "area-scene",
      areas: {
        group: {
          label: "Group",
          row: 1,
          col: 1,
          rowSpan: 2,
          colSpan: 2,
          contentRef: "group.ko.md",
        },
      },
    }

    const scene = normalizeSceneDocument(document, { slug: "area-scene" })

    expect(scene.areas).toEqual([
      expect.objectContaining({ id: "group", hasExplanation: true }),
    ])
    expect(scene.areas[0]).not.toHaveProperty("contentRef")
    expect(() =>
      sceneDocumentSchema.parse({
        title: "Invalid Area",
        summary: "Invalid Area",
        nodes: {},
        areas: {
          group: {
            label: "Group",
            row: 1,
            col: 1,
            rowSpan: 1,
            colSpan: 1,
            contentRef: "../group.md",
          },
        },
      })
    ).toThrow()
  })

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
