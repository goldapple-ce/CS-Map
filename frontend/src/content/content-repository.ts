import { contentData } from "@/content/generated/content-data"
import type { RouteIndexEntry } from "@shared/content/generated-contract"
import type { ContentId } from "@shared/content/types"
import { normalizedSceneNodeLabel } from "@shared/content/scene-label"

export type ExplanationTarget =
  | {
      kind: "topic"
      sceneId: ContentId
      elementId: ContentId
      label: string
    }
  | {
      kind: "area"
      sceneId: ContentId
      areaId: ContentId
      label: string
    }

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

  /** Scene ID에 대응하는 canonical Route를 찾는다. */
  findSceneRoute(sceneId: ContentId): RouteIndexEntry | undefined {
    return contentData.routes.find((route) => route.id === sceneId)
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

  /** Scene에 실제로 존재하는 Area의 최종 설명을 반환한다. */
  getAreaExplanation(sceneId: ContentId, areaId: ContentId) {
    const content = sceneContent(sceneId)
    const area = content.scene.areas.find((item) => item.id === areaId)

    if (!area) throw new Error(`Unknown Area ${areaId} in Scene ${sceneId}`)

    return content.areaExplanations[areaId]
  },

  /** Fragment ID가 현재 Scene에서 선택 가능한 leaf Topic 또는 설명 Area인지 판별한다. */
  findExplanationTarget(
    sceneId: ContentId,
    selectionId: ContentId
  ): ExplanationTarget | undefined {
    const { scene } = sceneContent(sceneId)
    const element = scene.elements.find(
      (item) => item.kind === "node" && item.id === selectionId
    )
    if (
      element?.kind === "node" &&
      !element.targetSceneId &&
      !element.navigateToSceneId
    ) {
      return {
        kind: "topic",
        sceneId,
        elementId: element.id,
        label: normalizedSceneNodeLabel(element.label),
      }
    }

    const area = scene.areas.find(
      (item) => item.id === selectionId && item.hasExplanation
    )
    return area
      ? {
          kind: "area",
          sceneId,
          areaId: area.id,
          label: area.label,
        }
      : undefined
  },
}
