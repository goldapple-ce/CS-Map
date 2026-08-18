import { contentData } from "@/content/generated/content-data"
import type { RouteIndexEntry } from "@shared/content/generated-contract"
import type { ContentId, Scene } from "@shared/content/types"

/** Scene ID에 대응하는 완성 생성 콘텐츠를 조회하고 unknown ID를 거부한다. */
function sceneContent(id: ContentId) {
  const content = contentData.scenes[id]
  if (!content) throw new Error(`Unknown scene: ${id}`)
  return content
}

/** 단일 generated record를 기존 비동기 Repository API로 노출한다. */
export const contentRepository = {
  /** 설정된 Root Scene ID를 반환한다. */
  getRootSceneId(): ContentId {
    return contentData.rootSceneId
  },

  /** 게시된 Route 목록을 안정된 생성 순서로 반환한다. */
  listRoutes(): readonly RouteIndexEntry[] {
    return contentData.routes
  },

  /** URL 경로와 일치하는 Route를 찾는다. */
  findRoute(path: string): RouteIndexEntry | undefined {
    return contentData.routes.find((route) => route.path === path)
  },

  /** Scene ID에 대응하는 지도 모델을 반환한다. */
  getSceneMap(id: ContentId): Scene {
    return sceneContent(id).scene
  },

  /** Scene 지도와 Markdown을 반환한다. */
  getScene(id: ContentId) {
    const { scene, markdown } = sceneContent(id)
    return { scene, markdown }
  },

  /** Topic의 최종 설명을 반환한다. */
  getTopicExplanation(sceneId: ContentId, elementId: ContentId) {
    const content = sceneContent(sceneId)
    const element = content.scene.elements.find((item) => item.id === elementId)

    if (!element || element.kind !== "node")
      throw new Error(`Unknown Topic ${elementId} in Scene ${sceneId}`)

    return content.topicExplanations[elementId]
  },

  /** Concept와 Markdown을 반환한다. */
  getConcept(id: ContentId) {
    const content = contentData.concepts[id]
    if (!content) throw new Error(`Unknown concept: ${id}`)
    return content
  },
}
