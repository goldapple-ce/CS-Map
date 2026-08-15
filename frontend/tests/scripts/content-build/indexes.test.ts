import { describe, expect, it } from "vitest"

import type { GeneratedContentData } from "@shared/content/generated-contract"
import { sceneDocumentSchema } from "../../../scripts/content-build/schemas.ts"
import type { Scene } from "@shared/content/types"
import {
  buildRouteIndex,
  renderContentData,
} from "../../../scripts/content-build/indexes.ts"

/** Route와 Index 테스트에 필요한 최소 준비 Scene을 만든다. */
function preparedScene(
  id: string,
  slug: string,
  parentId?: string,
  children: readonly string[] = [],
  status: Scene["status"] = "published"
) {
  const document = sceneDocumentSchema.parse({
    id,
    title: id,
    summary: id,
    nodes: Object.fromEntries(
      children.map((childId, index) => [
        `child-${index}`,
        { label: childId, row: 1, col: index + 1, childSceneId: childId },
      ])
    ),
  })
  const value = {
    id,
    slug,
    scenarioId: "scenario",
    ...(parentId ? { parentId } : {}),
    title: id,
    summary: id,
    status,
    ariaLabel: id,
    layout: { type: "grid", columns: 5, rows: 5 },
    areas: [],
    elements: [],
    contentRef: "content.ko.md",
    contexts: [],
    occurrences: [],
    conceptRefs: [],
  } satisfies Scene
  return { document, value, moduleKey: `/content/${id}/scene.yaml` }
}

describe("Content indexes", () => {
  it("부모 Route와 Child order를 계산하고 draft Scene은 제외한다", () => {
    const files = [
      preparedScene("root", "root", undefined, ["second", "first"]),
      preparedScene("first", "a", "root"),
      preparedScene("second", "b", "root"),
      preparedScene("draft", "draft", undefined, [], "draft"),
    ]

    expect(buildRouteIndex(files)).toEqual([
      { id: "root", title: "root", path: "/explore/root", order: 0 },
      {
        id: "first",
        title: "first",
        path: "/explore/root/a",
        parentId: "root",
        order: 1,
      },
      {
        id: "second",
        title: "second",
        path: "/explore/root/b",
        parentId: "root",
        order: 0,
      },
    ])
  })

  it("단일 생성 계약에 모든 runtime content 범주를 직렬화한다", () => {
    const content = renderContentData({
      rootSceneId: "root",
      routes: [{ id: "root", title: "Root", path: "/explore/root", order: 0 }],
      scenes: {
        root: {
          scene: {
            ...preparedScene("root", "root").value,
            selfCheckQuiz: [{ question: "question", answer: "answer" }],
          },
          markdown: "scene markdown",
          topicExplanations: { topic: "topic markdown" },
        },
      },
      concepts: {
        concept: {
          concept: { id: "concept", title: "Concept" },
          markdown: "concept markdown",
        },
      },
      layouts: {
        root: { width: 10, height: 10, nodes: {}, edges: {} },
      },
    } as GeneratedContentData)

    expect(content).toContain("GeneratedContentData")
    for (const value of [
      "scene markdown",
      "topic markdown",
      "question",
      "concept markdown",
      "/explore/root",
      '"width": 10',
    ]) {
      expect(content).toContain(value)
    }
  })
})
