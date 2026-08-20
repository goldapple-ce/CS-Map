import type { RouteIndexEntry } from "@shared/content/generated-contract"

import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

type SearchResultsProps = {
  routes: readonly RouteIndexEntry[]
  currentSceneId?: string
}

/** 검색 결과와 각 Topic의 상위 경로를 선택 가능한 목록으로 표시한다. */
export function SearchResults({ routes, currentSceneId }: SearchResultsProps) {
  const navigate = useNavigate()

  if (routes.length === 0) {
    return (
      <div
        role="status"
        className="rounded-lg border border-dashed border-border py-8 text-center"
      >
        <p className="text-sm font-medium">일치하는 Topic이 없습니다.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          다른 제목이나 더 짧은 검색어를 입력해 보세요.
        </p>
      </div>
    )
  }

  return (
    <ul aria-label="Topic 검색 결과" className="space-y-2">
      {routes.map((route) => {
        const isCurrent = route.id === currentSceneId

        return (
          <li key={route.id}>
            <button
              className={cn(
                "w-full rounded-lg border border-border p-3 text-left hover:bg-muted",
                isCurrent && "bg-muted"
              )}
              onClick={() => navigate(route.path)}
            >
              <p className="block font-medium">
                {route.title}
                {isCurrent ? (
                  <span className="ml-4 text-xs">현재 Topic</span>
                ) : null}
              </p>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
