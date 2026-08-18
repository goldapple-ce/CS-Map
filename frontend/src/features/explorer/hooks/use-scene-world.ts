import { contentRepository } from "@/content/content-repository"
import { createWorldLayout } from "../layout/world-layout"
import { useMemo } from "react"
import type { RouteIndexEntry } from "@shared/content/generated-contract"

/** Root부터 대상 Scene까지 검증된 Route ID 경로를 만든다. */
function scenePathIds(
  sceneId: string,
  routes: readonly RouteIndexEntry[],
  rootSceneId: string
) {
  const routesById = new Map(routes.map((route) => [route.id, route]))
  const path: string[] = []
  const visited = new Set<string>()
  let current = routesById.get(sceneId)

  if (!current) throw new Error(`Unknown Scene route: ${sceneId}`)

  while (current) {
    if (visited.has(current.id)) {
      throw new Error(`Cyclic Scene route ancestry: ${current.id}`)
    }
    visited.add(current.id)
    path.unshift(current.id)
    if (!current.parentId) break
    const parent = routesById.get(current.parentId)
    if (!parent) {
      throw new Error(
        `Scene route ${current.id} references unknown parent: ${current.parentId}`
      )
    }
    current = parent
  }

  if (path[0] !== rootSceneId) {
    throw new Error(
      `Scene route ${sceneId} is not reachable from Root Scene: ${rootSceneId}`
    )
  }

  return path
}

/** Root부터 현재 Scene까지의 WorldLayout을 구성한다. */
export function useSceneWorld(sceneId: string) {
  return useMemo(() => {
    const rootSceneId = contentRepository.getRootSceneId()

    const pathIds = scenePathIds(
      sceneId,
      contentRepository.listRoutes(),
      rootSceneId
    )

    const scenes = pathIds.map((id) => contentRepository.getSceneMap(id))

    return {
      focusedSceneId: sceneId,
      layout: createWorldLayout(scenes, rootSceneId),
    }
  }, [sceneId])
}
