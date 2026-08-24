import { contentRepository } from "@/content/content-repository"
import type { RouteIndexEntry } from "@shared/content/generated-contract"

export type SearchNode = {
  route: RouteIndexEntry
  children: SearchNode[]
}

/** Topic 제목을 기준으로 목차 항목의 안정된 순서를 정한다. */
function compareRoutes(left: RouteIndexEntry, right: RouteIndexEntry) {
  return left.title.localeCompare(right.title, "ko")
}

/** 평탄한 Route 목록을 부모-자식 목차 트리로 변환한다. */
function createOutline(routes: readonly RouteIndexEntry[]): SearchNode[] {
  const nodes = new Map<string, SearchNode>(
    routes.map((route) => [route.id, { route, children: [] }])
  )
  const roots: SearchNode[] = []

  for (const node of nodes.values()) {
    const parent = node.route.parentId
      ? nodes.get(node.route.parentId)
      : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  /** 현재 가지와 모든 하위 가지를 같은 기준으로 정렬한다. */
  const sortBranch = (nodesToSort: SearchNode[]) => {
    nodesToSort.sort((left, right) => compareRoutes(left.route, right.route))
    for (const node of nodesToSort) sortBranch(node.children)
  }
  sortBranch(roots)
  return roots
}

/** 목차 트리를 화면 순서의 Route 목록으로 평탄화한다. */
function flattenOutline(nodes: readonly SearchNode[]): RouteIndexEntry[] {
  return nodes.flatMap((node) => [node.route, ...flattenOutline(node.children)])
}

export const searchRoutes = contentRepository.listRoutes()
export const searchRoutesById = new Map(
  searchRoutes.map((route) => [route.id, route])
)
export const searchOutline = createOutline(searchRoutes)
export const orderedSearchRoutes = flattenOutline(searchOutline)

/** 현재 Scene을 드러내기 위해 펼쳐야 하는 모든 조상 ID를 구한다. */
export function ancestorIds(sceneId: string | undefined) {
  const ids = new Set<string>()
  let current = sceneId ? searchRoutesById.get(sceneId) : undefined
  while (current?.parentId) {
    ids.add(current.parentId)
    current = searchRoutesById.get(current.parentId)
  }
  return ids
}

/** Topic 검색에 사용할 공백·유니코드·대소문자를 정규화한다. */
export function normalizeSearchText(value: string) {
  return value.trim().normalize("NFKC").toLocaleLowerCase("ko-KR")
}
