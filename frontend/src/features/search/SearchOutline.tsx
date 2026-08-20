import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ancestorIds, searchOutline, type SearchNode } from "./search-index"
import { Link } from "react-router-dom"

type SearchOutlineProps = {
  currentSceneId?: string
}

type OutlineBranchProps = SearchOutlineProps & {
  nodes: readonly SearchNode[]
  expanded: ReadonlySet<string>
  onToggle: (sceneId: string) => void
}

/** 한 목차 가지와 재귀적인 하위 가지를 렌더링한다. */
function OutlineBranch({
  nodes,
  currentSceneId,
  expanded,
  onToggle,
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
                "flex items-center rounded-lg",
                isCurrent && "bg-muted"
              )}
            >
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => onToggle(route.id)}
                >
                  {isExpanded ? <ChevronDown /> : <ChevronRight />}
                </Button>
              ) : (
                <span className="size-7 shrink-0" />
              )}

              <Link
                className={cn(
                  "w-full min-w-0 flex-1 rounded-md p-2 text-left hover:bg-muted",
                  isCurrent && "bg-muted"
                )}
                to={route.path}
              >
                <p className="block font-medium">
                  {route.title}
                  {isCurrent ? (
                    <span className="ml-4 text-xs">현재 Topic</span>
                  ) : null}
                </p>
              </Link>
            </div>

            {hasChildren && isExpanded && (
              <div className="mt-1 ml-3 border-l pl-3">
                <OutlineBranch
                  nodes={children}
                  currentSceneId={currentSceneId}
                  expanded={expanded}
                  onToggle={onToggle}
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** 현재 위치의 조상을 펼친 계층형 Topic 목차를 표시한다. */
export function SearchOutline({ currentSceneId }: SearchOutlineProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    ancestorIds(currentSceneId)
  )
  const visibleExpanded = useMemo(
    () => new Set([...expanded, ...ancestorIds(currentSceneId)]),
    [currentSceneId, expanded]
  )

  /** 사용자가 선택한 목차 가지의 펼침 상태를 전환한다. */
  const toggle = (sceneId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(sceneId)) next.delete(sceneId)
      else next.add(sceneId)
      return next
    })
  }

  return (
    <OutlineBranch
      nodes={searchOutline}
      currentSceneId={currentSceneId}
      expanded={visibleExpanded}
      onToggle={toggle}
    />
  )
}
