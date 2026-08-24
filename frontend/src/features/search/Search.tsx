import { useMemo, useState } from "react"
import { Search as SearchIcon } from "lucide-react"
import { useLocation } from "react-router-dom"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { contentRepository } from "@/content/content-repository"
import { SearchOutline } from "./SearchOutline"
import { SearchResults } from "./SearchResults"
import { normalizeSearchText, orderedSearchEntries } from "./search-index"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"

/** 전체 Topic 트리와 제목 검색을 제공하는 공통 Dialog를 렌더링한다. */
export function Search() {
  const { pathname } = useLocation()
  const [query, setQuery] = useState("")

  const currentSceneId = contentRepository.findRoute(pathname)?.id
  const normalizedQuery = normalizeSearchText(query)
  const searchResults = useMemo(
    () =>
      normalizedQuery
        ? orderedSearchEntries.filter((entry) =>
            entry.searchText.includes(normalizedQuery)
          )
        : [],
    [normalizedQuery]
  )

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="w-sm justify-start gap-2 font-normal text-muted-foreground"
          >
            <SearchIcon />
            전체 Topic 탐색
          </Button>
        }
      />

      <DialogContent className="flex h-10/12 flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>전체 Topic 목차</DialogTitle>
          <DialogDescription>
            전체 학습 구조를 펼쳐 보고 원하는 Topic으로 바로 이동하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <InputGroup className="shrink-0">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              enterKeyHint="search"
              value={query}
              placeholder="예: Spring, DNS"
              role="searchbox"
              onChange={(event) => setQuery(event.target.value)}
            />
            <InputGroupAddon align="inline-end" className="text-xs font-normal">
              {searchResults.length} result
            </InputGroupAddon>
          </InputGroup>

          <ScrollArea className="min-h-0 flex-1">
            <nav aria-label="전체 Topic 목차">
              {normalizedQuery ? (
                <SearchResults
                  entries={searchResults}
                  currentSceneId={currentSceneId}
                />
              ) : (
                <SearchOutline currentSceneId={currentSceneId} />
              )}
            </nav>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
