import { contentData } from "@/content/generated/content-data"
import type { ContentRepository } from "@/content/repository"
import type { ContentId } from "@shared/content/types"

/** Scene ID에 대응하는 완성 생성 콘텐츠를 조회하고 unknown ID를 거부한다. */
function sceneContent(id: ContentId) {
  const content = contentData.scenes[id]
  if (!content) throw new Error(`Unknown scene: ${id}`)
  return content
}

/** 단일 generated record를 기존 비동기 Repository API로 노출한다. */
export const contentRepository: ContentRepository = {
  /** 설정된 Root Scene ID를 반환한다. */
  getRootSceneId() {
    return contentData.rootSceneId
  },

  /** 게시된 Route 목록을 안정된 생성 순서로 반환한다. */
  listRoutes() {
    return contentData.routes
  },

  /** URL 경로와 일치하는 Route를 찾는다. */
  findRoute(path) {
    return contentData.routes.find((route) => route.path === path)
  },

  /** Scene 지도 모델을 기존 Promise 계약으로 반환한다. */
  async loadSceneMap(id) {
    return sceneContent(id).scene
  },

  /** Scene 지도와 Markdown을 기존 Promise 계약으로 반환한다. */
  async loadScene(id) {
    const { scene, markdown } = sceneContent(id)
    return { scene, markdown }
  },

  /** Topic의 최종 설명을 반환하고 알 수 없는 Topic을 거부한다. */
  async loadTopicExplanation(sceneId, elementId) {
    const content = sceneContent(sceneId)
    const element = content.scene.elements.find((item) => item.id === elementId)
    if (!element || element.kind !== "node") {
      throw new Error(`Unknown Topic ${elementId} in Scene ${sceneId}`)
    }
    return content.topicExplanations[elementId]
  },

  /** eager data 환경에서 호환을 위해 완료된 Promise만 반환한다. */
  async prefetchScene() {},

  /** Concept와 Markdown을 반환하고 unknown ID를 거부한다. */
  async loadConcept(id) {
    const content = contentData.concepts[id]
    if (!content) throw new Error(`Unknown concept: ${id}`)
    return content
  },
}
