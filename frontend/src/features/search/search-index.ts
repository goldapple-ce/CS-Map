import { contentData } from "@/content/generated/content-data"
import type { RouteIndexEntry } from "@shared/content/generated-contract"
import type { Scene } from "@shared/content/types"

export type SearchNode = {
  entry: SearchEntry
  children: SearchNode[]
}

export type SearchEntry = RouteIndexEntry & {
  summary: string
  keywords: readonly string[]
  searchText: string
}

/** Topic 제목을 기준으로 목차 항목의 안정된 순서를 정한다. */
function compareEntries(left: SearchEntry, right: SearchEntry) {
  return left.title.localeCompare(right.title, "ko")
}

/** 평탄한 Route 목록을 부모-자식 목차 트리로 변환한다. */
function createOutline(entries: readonly SearchEntry[]): SearchNode[] {
  const nodes = new Map<string, SearchNode>(
    entries.map((entry) => [entry.id, { entry, children: [] }])
  )
  const roots: SearchNode[] = []

  for (const node of nodes.values()) {
    const parent = node.entry.parentId
      ? nodes.get(node.entry.parentId)
      : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  /** 현재 가지와 모든 하위 가지를 같은 기준으로 정렬한다. */
  const sortBranch = (nodesToSort: SearchNode[]) => {
    nodesToSort.sort((left, right) => compareEntries(left.entry, right.entry))
    for (const node of nodesToSort) sortBranch(node.children)
  }
  sortBranch(roots)
  return roots
}

/** 목차 트리를 화면 순서의 검색 항목 목록으로 평탄화한다. */
function flattenOutline(nodes: readonly SearchNode[]): SearchEntry[] {
  return nodes.flatMap((node) => [node.entry, ...flattenOutline(node.children)])
}

export const searchRoutes = contentData.routes
export const searchRoutesById = new Map(
  searchRoutes.map((route) => [route.id, route])
)
const searchEntries: readonly SearchEntry[] = searchRoutes.map((route) => {
  const scene = contentData.scenes[route.id].scene
  const keywords = sceneSearchKeywords(scene)

  return {
    ...route,
    summary: scene.summary,
    keywords,
    searchText: sceneSearchText(scene),
  }
})
export const searchOutline = createOutline(searchEntries)
export const orderedSearchEntries = flattenOutline(searchOutline)

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

/** 작성 키워드와 Topic 이름을 표시 순서대로 합치고 의미가 같은 값은 제거한다. */
export function sceneSearchKeywords(
  scene: Pick<Scene, "keywords" | "elements">
) {
  const keywords = [
    ...(scene.keywords ?? []),
    ...scene.elements.flatMap((element) =>
      element.kind === "node" ? [element.label] : []
    ),
  ]
  const normalizedKeywords = new Set<string>()

  return keywords.filter((keyword) => {
    const normalizedKeyword = normalizeSearchText(keyword)
    if (normalizedKeywords.has(normalizedKeyword)) return false

    normalizedKeywords.add(normalizedKeyword)
    return true
  })
}

/** Scene의 제목·요약·키워드와 Topic 이름을 하나의 정규화된 검색 문자열로 만든다. */
export function sceneSearchText(
  scene: Pick<Scene, "title" | "summary" | "keywords" | "elements">
) {
  return normalizeSearchText(
    [scene.title, scene.summary, ...sceneSearchKeywords(scene)].join(" ")
  )
}
