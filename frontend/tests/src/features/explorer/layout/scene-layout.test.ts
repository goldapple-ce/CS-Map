import { describe, expect, it } from "vitest"

import { contentData } from "../../../../../src/content/generated/content-data"
import type { Scene } from "@shared/content/types"
import { createSceneLayout } from "../../../../../src/features/explorer/layout/scene-layout"

describe("createSceneLayout", () => {
  it("생성 Layout을 Map으로 바꾸고 같은 Scene 요청에서 재사용한다", () => {
    const scene = { id: contentData.rootSceneId } as Scene

    const first = createSceneLayout(scene)
    const second = createSceneLayout(scene)

    expect(first).toBe(second)
    expect(first.nodes).toBeInstanceOf(Map)
    expect(first.edges).toBeInstanceOf(Map)
  })

  it("생성 Layout이 없는 Scene을 명확한 오류로 거부한다", () => {
    const scene = { id: "missing-scene" } as Scene

    expect(() => createSceneLayout(scene)).toThrow(
      "Generated layout is missing for Scene: missing-scene"
    )
  })
})
