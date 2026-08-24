import { contentData } from "@/content/generated/content-data"
import type { RouteIndexEntry } from "@shared/content/generated-contract"
import type { ContentId } from "@shared/content/types"

/** Scene ID에 대응하는 완성 생성 콘텐츠를 조회하고 unknown ID를 거부한다. */
function sceneContent(id: ContentId) {
  const content = contentData.scenes[id]
  if (!content) throw new Error(`Unknown scene: ${id}`)
  return content
}

/** 생성 데이터 중 조회 시 검증이 필요한 콘텐츠만 노출한다. */
export const contentRepository = {
  /** URL 경로와 일치하는 Route를 찾는다. */
  findRoute(path: string): RouteIndexEntry | undefined {
    return contentData.routes.find((route) => route.path === path)
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
}
