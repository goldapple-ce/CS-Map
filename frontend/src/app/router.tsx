import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
  useLocation,
} from "react-router-dom"

import { ExploreRoute } from "@/app/routes/ExploreRoute"
import { HomeRoute } from "@/app/routes/HomeRoute"
import { NotFoundRoute } from "@/app/routes/NotFoundRoute"

const legacyExplorePaths: Record<string, string> = {
  "/explore/google-search": "/explore/google-com",
  "/explore/google-search/network": "/explore/google-com/router",
  "/explore/google-search/network/dns": "/explore/google-com/dns",
  "/explore/google-search/network/dns/udp-query":
    "/explore/google-com/dns/udp-query",
  "/explore/google-search/network/dns/udp-query/socket-kernel":
    "/explore/google-com/dns/udp-query/socket-kernel",
}

function LegacyExploreRedirect() {
  const location = useLocation()
  const target = legacyExplorePaths[location.pathname] ?? "/explore/google-com"
  return <Navigate to={target} replace />
}

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomeRoute />,
  },
  {
    path: "/explore/google-search/*",
    element: <LegacyExploreRedirect />,
  },
  {
    path: "/explore/*",
    element: <ExploreRoute />,
  },
  {
    path: "*",
    element: <NotFoundRoute />,
  },
]

export const router = createBrowserRouter(routes)
