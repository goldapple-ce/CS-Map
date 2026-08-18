import { contentRepository } from "@/content/content-repository"
import { createWorldLayout, type WorldLayout } from "../layout/world-layout"
import { useEffect, useState } from "react"
import type { RouteIndexEntry } from "@shared/content/generated-contract"

type WorldLoadState =
  | { status: "loading" }
  | { status: "loaded"; focusedSceneId: string; layout: WorldLayout }
  | { status: "error"; focusedSceneId: string; message: string }

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
  const rootSceneId = contentRepository.getRootSceneId()
  const [state, setState] = useState<WorldLoadState>({
    status: "loading",
  })

  useEffect(() => {
    let active = true
    const routes = contentRepository.listRoutes()
    Promise.resolve()
      .then(() => scenePathIds(sceneId, routes, rootSceneId))
      .then((pathIds) =>
        Promise.all(pathIds.map((id) => contentRepository.loadSceneMap(id)))
      )
      .then((loaded) => {
        if (!active) return
        setState({
          status: "loaded",
          focusedSceneId: sceneId,
          layout: createWorldLayout(loaded, rootSceneId),
        })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: "error",
          focusedSceneId: sceneId,
          message:
            error instanceof Error
              ? error.message
              : "지식 공간을 불러오지 못했습니다.",
        })
      })
    return () => {
      active = false
    }
  }, [rootSceneId, sceneId])

  const currentState: WorldLoadState =
    state.status !== "loading" && state.focusedSceneId === sceneId
      ? state
      : { status: "loading" as const }

  return {
    rootSceneId,
    state: currentState,
  }
}
