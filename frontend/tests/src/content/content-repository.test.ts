import { describe, expect, it } from "vitest"

import { contentRepository } from "../../../src/content/content-repository"
import { contentData } from "../../../src/content/generated/content-data"

describe("contentRepository", () => {
  it("정적 Scene과 상세 콘텐츠를 반환한다", () => {
    const detail = contentRepository.getScene(contentData.rootSceneId)

    expect(detail.scene).toBe(contentData.scenes[contentData.rootSceneId].scene)
    expect(detail).toEqual({
      scene: contentData.scenes[contentData.rootSceneId].scene,
      markdown: contentData.scenes[contentData.rootSceneId].markdown,
    })
  })

  it("Topic 설명 없음과 unknown 콘텐츠 오류 계약을 유지한다", () => {
    expect(
      contentRepository.getTopicExplanation(contentData.rootSceneId, "https")
    ).toBeUndefined()
    expect(() => contentRepository.getScene("missing-scene")).toThrow(
      "Unknown scene: missing-scene"
    )
    expect(() =>
      contentRepository.getTopicExplanation(contentData.rootSceneId, "missing")
    ).toThrow("Unknown Topic missing in Scene enter-google")
  })
})
