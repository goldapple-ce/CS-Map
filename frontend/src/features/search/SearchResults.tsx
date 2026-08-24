import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { SearchItemContent } from "./SearchItemContent"
import type { SearchEntry } from "./search-index"

type SearchResultsProps = {
  entries: readonly SearchEntry[]
  currentSceneId?: string
}

/** 검색된 Scene metadata를 이동 가능한 평탄한 목록으로 표시한다. */
export function SearchResults({ entries, currentSceneId }: SearchResultsProps) {
  const navigate = useNavigate()

  if (entries.length === 0) {
    return (
      <div
        role="status"
        className="rounded-lg border border-dashed border-border py-8 text-center"
      >
        <p className="text-sm font-medium">일치하는 Topic이 없습니다.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          다른 제목, 설명, 키워드나 더 짧은 검색어를 입력해 보세요.
        </p>
      </div>
    )
  }

  return (
    <ul aria-label="Topic 검색 결과" className="space-y-2">
      {entries.map((entry) => {
        const isCurrent = entry.id === currentSceneId

        return (
          <li key={entry.id}>
            <button
              className={cn(
                "w-full rounded-lg border border-border p-3 text-left hover:bg-muted",
                isCurrent && "bg-muted"
              )}
              aria-label={
                isCurrent ? `${entry.title}, 현재 Topic` : entry.title
              }
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => navigate(entry.path)}
            >
              <SearchItemContent
                entry={entry}
                current={isCurrent}
                showKeywords
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
