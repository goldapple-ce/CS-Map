import { createBrowserRouter, type RouteObject } from "react-router-dom"

import { ExploreRoute } from "@/app/routes/ExploreRoute"
import { HomeRoute } from "@/app/routes/HomeRoute"
import { NotFoundRoute } from "@/app/routes/NotFoundRoute"
import { QuizRoute } from "@/app/routes/QuizRoute"
import { AppLayout } from "./AppLayout"

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomeRoute />,
      },
      {
        path: "/explore/*",
        element: <ExploreRoute />,
      },
      {
        path: "/quiz",
        element: <QuizRoute />,
      },
      {
        path: "*",
        element: <NotFoundRoute />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
