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
    ).toThrow(`Unknown Topic missing in Scene ${contentData.rootSceneId}`)
  })

  it("Scene에 실제로 존재하는 Area 설명만 반환한다", () => {
    expect(
      contentRepository.getAreaExplanation("server-redis", "keyspace")
    ).toContain("Keyspace")
    expect(() =>
      contentRepository.getAreaExplanation("server-redis", "missing")
    ).toThrow("Unknown Area missing in Scene server-redis")
  })

  it("Fragment ID를 leaf Topic과 설명 가능한 Area로만 해석한다", () => {
    expect(
      contentRepository.findExplanationTarget(
        contentData.rootSceneId,
        "browser"
      )
    ).toEqual({
      kind: "topic",
      sceneId: contentData.rootSceneId,
      elementId: "browser",
      label: "Browser",
    })
    expect(
      contentRepository.findExplanationTarget("server-redis", "keyspace")
    ).toEqual({
      kind: "area",
      sceneId: "server-redis",
      areaId: "keyspace",
      label: "Keyspace",
    })
    expect(
      contentRepository.findExplanationTarget(contentData.rootSceneId, "https")
    ).toBeUndefined()
    expect(
      contentRepository.findExplanationTarget(
        contentData.rootSceneId,
        "missing"
      )
    ).toBeUndefined()
  })

  it("Fragment에서 복원한 Topic label을 Node의 접근 가능한 이름과 같게 정규화한다", () => {
    expect(
      contentRepository.findExplanationTarget("server-java-java-source", "oop")
    ).toMatchObject({
      kind: "topic",
      label: "Object Oriented Programming",
    })
  })
})
