import { describe, expect, it } from "vitest"

import type { GeneratedContentData } from "@shared/content/generated-contract"
import type { Scene } from "@shared/content/types"
import {
  buildRouteIndex,
  renderContentData,
} from "../../../scripts/content-build/generated-content.ts"

/** Route 계산과 생성 데이터 직렬화 테스트에 필요한 Scene을 만든다. */
function preparedScene(id: string, slug: string, parentId?: string) {
  const value = {
    id,
    slug,
    ...(parentId ? { parentId } : {}),
    title: id,
    layout: { columns: 5, rows: 5 },
    areas: [],
    elements: [],
  } satisfies Scene
  return { value }
}

describe("Generated content", () => {
  it("부모 Route를 계산하고 경로순으로 정렬한다", () => {
    const files = [
      preparedScene("enter-google", "enter-google"),
      preparedScene("server", "server", "enter-google"),
      preparedScene("server-spring", "spring", "server"),
    ]

    expect(buildRouteIndex(files)).toEqual([
      {
        id: "enter-google",
        title: "enter-google",
        path: "/explore/enter-google",
      },
      {
        id: "server",
        title: "server",
        path: "/explore/enter-google/server",
        parentId: "enter-google",
      },
      {
        id: "server-spring",
        title: "server-spring",
        path: "/explore/enter-google/server/spring",
        parentId: "server",
      },
    ])
  })

  it("단일 생성 계약에 모든 runtime content 범주를 직렬화한다", () => {
    const content = renderContentData({
      rootSceneId: "enter-google",
      routes: [
        {
          id: "enter-google",
          title: "Root",
          path: "/explore/enter-google",
        },
      ],
      scenes: {
        "enter-google": {
          scene: {
            ...preparedScene("enter-google", "enter-google").value,
            selfCheckQuiz: [{ question: "question", answer: "answer" }],
          },
          markdown: "scene markdown",
          topicExplanations: { topic: "topic markdown" },
        },
      },
      layouts: {
        "enter-google": { width: 10, height: 10, nodes: {}, edges: {} },
      },
    } as GeneratedContentData)

    expect(content).toContain("GeneratedContentData")
    for (const value of [
      "scene markdown",
      "topic markdown",
      "question",
      "/explore/enter-google",
      '"width": 10',
    ]) {
      expect(content).toContain(value)
    }
  })
})
