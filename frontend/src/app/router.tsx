import {
  createBrowserRouter,
  type RouteObject,
} from "react-router-dom"

import { ExploreRoute } from "@/app/routes/ExploreRoute"
import { HomeRoute } from "@/app/routes/HomeRoute"
import { NotFoundRoute } from "@/app/routes/NotFoundRoute"

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomeRoute />,
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
