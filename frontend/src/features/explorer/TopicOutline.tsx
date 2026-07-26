import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { ChevronDown, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  const currentItemRef = useRef<HTMLButtonElement>(null)
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    ancestorIds(currentSceneId, routesById)
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-foreground/25 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-stretch justify-start">
          <Dialog.Popup
            initialFocus={() => currentItemRef.current}
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

            <ScrollArea className="min-h-0 flex-1">
              <nav aria-label="전체 Topic 목차" className="p-4">
                <OutlineBranch
                  nodes={outline}
                  currentSceneId={currentSceneId}
                  expanded={expanded}
                  navigationDisabled={navigationDisabled}
                  currentItemRef={currentItemRef}
                  onToggle={toggle}
                  onSelectScene={onSelectScene}
                />
              </nav>
            </ScrollArea>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
