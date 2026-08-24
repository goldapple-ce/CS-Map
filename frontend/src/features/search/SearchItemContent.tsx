import { Badge } from "@/components/ui/badge"
import type { SearchEntry } from "./search-index"

type SearchItemContentProps = {
  entry: SearchEntry
  current?: boolean
  showKeywords: boolean
}

/** 검색 결과와 기본 목차가 공유하는 Scene 메타데이터를 표시한다. */
export function SearchItemContent({
  entry,
  current,
  showKeywords,
}: SearchItemContentProps) {
  return (
    <div className="min-w-0">
      <p className="font-medium">
        {entry.title}
        {current ? <span className="ml-4 text-xs">현재 Topic</span> : null}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{entry.summary}</p>
      {showKeywords && entry.keywords.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="검색 키워드">
          {entry.keywords.map((keyword) => (
            <Badge variant="outline">{keyword}</Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
