import { useLocation } from "react-router-dom"

import { contentRepository } from "@/content/content-repository"
import { ExplorerShell } from "@/features/explorer/ExplorerShell"

export function ExploreRoute() {
  const location = useLocation()
  const route = contentRepository.findRoute(location.pathname)

  return <ExplorerShell sceneId={route?.id} routeNotFound={!route} />
}
