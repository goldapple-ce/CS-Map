import { useLocation } from "react-router-dom"

import { contentRepository } from "@/content/content-repository"
import { ExplorerShell } from "@/features/explorer/ExplorerShell"

/** 현재 URL을 Scene Route로 해석해 Explorer 화면을 연다. */
export function ExploreRoute() {
  const location = useLocation()
  const route = contentRepository.findRoute(location.pathname)

  return <ExplorerShell sceneId={route?.id} routeNotFound={!route} />
}
