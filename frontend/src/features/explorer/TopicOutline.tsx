import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { ChevronDown, ChevronRight, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { RouteIndexEntry } from "@/content/repository"
import { cn } from "@/lib/utils"

type OutlineNode = {
  route: RouteIndexEntry
  children: OutlineNode[]
}

type TopicOutlineProps = {
  open: boolean
  routes: readonly RouteIndexEntry[]
  currentSceneId?: string
  navigationDisabled: boolean
  triggerRef: RefObject<HTMLButtonElement | null>
  onOpenChange: (open: boolean) => void
  onSelectScene: (sceneId: string) => void
}

function compareRoutes(left: RouteIndexEntry, right: RouteIndexEntry) {
  return left.order - right.order || left.title.localeCompare(right.title, "ko")
}

function createOutline(routes: readonly RouteIndexEntry[]): OutlineNode[] {
  const nodes = new Map<string, OutlineNode>(
    routes.map((route) => [route.id, { route, children: [] }])
  )
  const roots: OutlineNode[] = []

  for (const node of nodes.values()) {
    const parent = node.route.parentId
      ? nodes.get(node.route.parentId)
      : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const sortBranch = (nodesToSort: OutlineNode[]) => {
    nodesToSort.sort((left, right) => compareRoutes(left.route, right.route))
    for (const node of nodesToSort) sortBranch(node.children)
  }
  sortBranch(roots)
  return roots
}

function ancestorIds(
  sceneId: string | undefined,
  routesById: ReadonlyMap<string, RouteIndexEntry>
) {
  const ids = new Set<string>()
  let current = sceneId ? routesById.get(sceneId) : undefined
  while (current?.parentId) {
    ids.add(current.parentId)
    current = routesById.get(current.parentId)
  }
  return ids
}

function normalizeSearchText(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase("ko-KR")
}

function flattenOutline(nodes: readonly OutlineNode[]): RouteIndexEntry[] {
  return nodes.flatMap((node) => [
    node.route,
    ...flattenOutline(node.children),
  ])
}

function topicPath(
  sceneId: string,
  routesById: ReadonlyMap<string, RouteIndexEntry>
) {
  const path: RouteIndexEntry[] = []
  const visited = new Set<string>()
  let current = routesById.get(sceneId)

  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    path.unshift(current)
    current = current.parentId ? routesById.get(current.parentId) : undefined
  }
  return path
}

type OutlineBranchProps = {
  nodes: readonly OutlineNode[]
  currentSceneId?: string
  expanded: ReadonlySet<string>
  navigationDisabled: boolean
  currentItemRef: RefObject<HTMLButtonElement | null>
  onToggle: (sceneId: string) => void
  onSelectScene: (sceneId: string) => void
}

function OutlineBranch({
  nodes,
  currentSceneId,
  expanded,
  navigationDisabled,
  currentItemRef,
  onToggle,
  onSelectScene,
}: OutlineBranchProps) {
  return (
    <ul className="space-y-1">
      {nodes.map(({ route, children }) => {
        const hasChildren = children.length > 0
        const isExpanded = expanded.has(route.id)
        const isCurrent = route.id === currentSceneId

        return (
          <li key={route.id}>
            <div
              className={cn(
                "flex min-w-0 items-center gap-1 rounded-lg",
                isCurrent && "bg-muted"
              )}
            >
              {hasChildren ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  aria-label={`${route.title} 하위 Topic ${isExpanded ? "접기" : "펼치기"}`}
                  aria-expanded={isExpanded}
                  onClick={() => onToggle(route.id)}
                >
                  {isExpanded ? (
                    <ChevronDown aria-hidden="true" />
                  ) : (
                    <ChevronRight aria-hidden="true" />
                  )}
                </Button>
              ) : (
                <span aria-hidden="true" className="size-7 shrink-0" />
              )}

              <button
                ref={isCurrent ? currentItemRef : undefined}
                type="button"
                aria-current={isCurrent ? "location" : undefined}
                disabled={navigationDisabled}
                className={cn(
                  "min-w-0 flex-1 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onSelectScene(route.id)}
              >
                <span className="block truncate">{route.title}</span>
                {isCurrent ? (
                  <span className="block text-xs font-normal text-muted-foreground">
                    현재 Topic
                  </span>
                ) : null}
              </button>
            </div>

            {hasChildren && isExpanded ? (
              <div className="mt-1 ml-3 border-l border-border pl-3">
                <OutlineBranch
                  nodes={children}
                  currentSceneId={currentSceneId}
                  expanded={expanded}
                  navigationDisabled={navigationDisabled}
                  currentItemRef={currentItemRef}
                  onToggle={onToggle}
                  onSelectScene={onSelectScene}
                />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function TopicOutline({
  open,
  routes,
  currentSceneId,
  navigationDisabled,
  triggerRef,
  onOpenChange,
  onSelectScene,
}: TopicOutlineProps) {
  const routesById = useMemo(
    () => new Map(routes.map((route) => [route.id, route])),
    [routes]
  )
  const outline = useMemo(() => createOutline(routes), [routes])
  const orderedRoutes = useMemo(() => flattenOutline(outline), [outline])
  const currentItemRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    ancestorIds(currentSceneId, routesById)
  )
  const normalizedQuery = normalizeSearchText(query)
  const searchResults = useMemo(
    () =>
      normalizedQuery
        ? orderedRoutes.filter((route) =>
            normalizeSearchText(route.title).includes(normalizedQuery)
          )
        : [],
    [normalizedQuery, orderedRoutes]
  )

  useEffect(() => {
    const ancestors = ancestorIds(currentSceneId, routesById)
    setExpanded((current) => new Set([...current, ...ancestors]))
  }, [currentSceneId, routesById])

  const toggle = (sceneId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(sceneId)) next.delete(sceneId)
      else next.add(sceneId)
      return next
    })
  }

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) setQuery("")
    onOpenChange(nextOpen)
  }

  const selectScene = (sceneId: string) => {
    setQuery("")
    onSelectScene(sceneId)
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-foreground/25 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-stretch justify-start">
          <Dialog.Popup
            initialFocus={() => searchInputRef.current}
            finalFocus={() => triggerRef.current}
            className="flex h-full w-[min(24rem,calc(100vw-2rem))] flex-col border-r border-border bg-background shadow-2xl transition-transform duration-200 outline-none data-ending-style:-translate-x-full data-starting-style:-translate-x-full"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <Dialog.Title className="text-lg font-semibold">
                  전체 Topic 목차
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  전체 학습 구조를 펼쳐 보고 원하는 Topic으로 바로 이동하세요.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="목차 닫기"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <X aria-hidden="true" className="size-4" />
              </Dialog.Close>
            </div>

            <div className="border-b border-border px-4 py-3">
              <label
                htmlFor="topic-outline-search"
                className="mb-2 block text-sm font-medium"
              >
                Topic 검색
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  ref={searchInputRef}
                  id="topic-outline-search"
                  type="text"
                  role="searchbox"
                  enterKeyHint="search"
                  value={query}
                  placeholder="예: Spring, DNS"
                  className="pr-9 pl-9"
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="검색어 지우기"
                    className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    onClick={() => {
                      setQuery("")
                      searchInputRef.current?.focus()
                    }}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                ) : null}
              </div>
              {normalizedQuery ? (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-2 text-xs text-muted-foreground"
                >
                  검색 결과 {searchResults.length}개
                </p>
              ) : null}
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <nav aria-label="전체 Topic 목차" className="p-4">
                {normalizedQuery ? (
                  searchResults.length > 0 ? (
                    <ul aria-label="Topic 검색 결과" className="space-y-2">
                      {searchResults.map((route) => {
                        const isCurrent = route.id === currentSceneId
                        const path = topicPath(route.id, routesById)
                        return (
                          <li key={route.id}>
                            <button
                              type="button"
                              aria-current={
                                isCurrent ? "location" : undefined
                              }
                              disabled={navigationDisabled}
                              className={cn(
                                "w-full rounded-lg border border-border px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                                isCurrent && "bg-muted"
                              )}
                              onClick={() => selectScene(route.id)}
                            >
                              <span className="block text-sm font-medium text-foreground">
                                {route.title}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                {path.map((item) => item.title).join(" / ")}
                              </span>
                              {isCurrent ? (
                                <span className="mt-1 block text-xs font-medium text-foreground">
                                  현재 Topic
                                </span>
                              ) : null}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <div
                      role="status"
                      className="rounded-lg border border-dashed border-border px-4 py-8 text-center"
                    >
                      <p className="text-sm font-medium">
                        일치하는 Topic이 없습니다.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        다른 제목이나 더 짧은 검색어를 입력해 보세요.
                      </p>
                    </div>
                  )
                ) : (
                  <OutlineBranch
                    nodes={outline}
                    currentSceneId={currentSceneId}
                    expanded={expanded}
                    navigationDisabled={navigationDisabled}
                    currentItemRef={currentItemRef}
                    onToggle={toggle}
                    onSelectScene={selectScene}
                  />
                )}
              </nav>
            </ScrollArea>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
