import { describe, expect, it } from "vitest"

import { contentRepository } from "../../../src/content/content-repository"
import { contentData } from "../../../src/content/generated/content-data"

describe("contentRepository", () => {
  it("정적 Scene과 상세 콘텐츠를 기존 Promise API로 반환한다", async () => {
    const scene = await contentRepository.loadSceneMap(contentData.rootSceneId)
    const detail = await contentRepository.loadScene(contentData.rootSceneId)

    expect(scene).toBe(contentData.scenes[contentData.rootSceneId].scene)
    expect(detail).toEqual({
      scene,
      markdown: contentData.scenes[contentData.rootSceneId].markdown,
    })
  })

  it("Topic 설명 없음과 unknown 콘텐츠 오류 계약을 유지한다", async () => {
    await expect(
      contentRepository.loadTopicExplanation(contentData.rootSceneId, "https")
    ).resolves.toBeUndefined()
    await expect(contentRepository.loadSceneMap("missing-scene")).rejects.toThrow(
      "Unknown scene: missing-scene"
    )
    await expect(contentRepository.loadConcept("missing-concept")).rejects.toThrow(
      "Unknown concept: missing-concept"
    )
    await expect(
      contentRepository.loadTopicExplanation(contentData.rootSceneId, "missing")
    ).rejects.toThrow(
      "Unknown Topic missing in Scene google-search-root"
    )
  })

  it("prefetch 호환 API는 eager data에서 아무 작업 없이 완료된다", async () => {
    await expect(contentRepository.prefetchScene("missing-scene")).resolves.toBeUndefined()
  })
})
