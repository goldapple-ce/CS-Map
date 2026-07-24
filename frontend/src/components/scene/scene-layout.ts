import type {
  Scene,
  SceneAnnotationElement,
  SceneEdgeElement,
  SceneGroupElement,
  SceneNodeElement,
} from "@/domain/content-types"

export type LayoutBox = {
  x: number
  y: number
  width: number
  height: number
}

export type LayoutPoint = {
  x: number
  y: number
}

export type SceneLayout = {
  nodes: ReadonlyMap<string, LayoutBox>
  groups: ReadonlyMap<string, LayoutBox>
  edges: ReadonlyMap<string, readonly LayoutPoint[]>
  annotations: ReadonlyMap<string, LayoutBox>
}

const UNGROUPED = "__ungrouped__"
const NODE_HEIGHT = 88

function flowOrder(scene: Scene, nodes: readonly SceneNodeElement[]) {
  const nodeIds = new Set(nodes.map(({ id }) => id))
  const originalIndex = new Map(nodes.map(({ id }, index) => [id, index]))
  const outgoing = new Map<string, string[]>()
  const indegree = new Map(nodes.map(({ id }) => [id, 0]))

  for (const relationship of scene.relationships) {
    if (
      relationship.type !== "flows-to" ||
      !nodeIds.has(relationship.fromElementId) ||
      !nodeIds.has(relationship.toElementId)
    ) {
      continue
    }
    const targets = outgoing.get(relationship.fromElementId) ?? []
    targets.push(relationship.toElementId)
    outgoing.set(relationship.fromElementId, targets)
    indegree.set(
      relationship.toElementId,
      (indegree.get(relationship.toElementId) ?? 0) + 1
    )
  }

  const queue = nodes
    .filter(({ id }) => indegree.get(id) === 0)
    .map(({ id }) => id)
  const ordered: string[] = []
  const visited = new Set<string>()

  while (queue.length > 0) {
    queue.sort(
      (left, right) =>
        (originalIndex.get(left) ?? 0) - (originalIndex.get(right) ?? 0)
    )
    const current = queue.shift()
    if (!current || visited.has(current)) continue
    visited.add(current)
    ordered.push(current)

    for (const target of outgoing.get(current) ?? []) {
      indegree.set(target, (indegree.get(target) ?? 1) - 1)
      if (indegree.get(target) === 0) queue.push(target)
    }
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) ordered.push(node.id)
  }
  return ordered
}

function edgePoints(
  source: LayoutBox,
  target: LayoutBox,
  canvasHeight: number
): LayoutPoint[] {
  const sourceCenterX = source.x + source.width / 2
  const targetCenterX = target.x + target.width / 2
  const sourceCenterY = source.y + source.height / 2
  const targetCenterY = target.y + target.height / 2

  if (Math.abs(sourceCenterX - targetCenterX) < source.width / 2) {
    const downward = targetCenterY >= sourceCenterY
    const startY = downward ? source.y + source.height : source.y
    const endY = downward ? target.y : target.y + target.height
    return [
      { x: sourceCenterX, y: startY },
      { x: targetCenterX, y: endY },
    ]
  }

  if (targetCenterX > sourceCenterX) {
    const startX = source.x + source.width
    const endX = target.x
    const middleX = (startX + endX) / 2
    return [
      { x: startX, y: sourceCenterY },
      { x: middleX, y: sourceCenterY },
      { x: middleX, y: targetCenterY },
      { x: endX, y: targetCenterY },
    ]
  }

  const routeY = Math.min(
    canvasHeight - 18,
    Math.max(source.y + source.height, target.y + target.height) + 28
  )
  return [
    { x: source.x, y: sourceCenterY },
    { x: source.x - 18, y: sourceCenterY },
    { x: source.x - 18, y: routeY },
    { x: target.x + target.width + 18, y: routeY },
    { x: target.x + target.width + 18, y: targetCenterY },
    { x: target.x + target.width, y: targetCenterY },
  ]
}

export function createSceneLayout(scene: Scene): SceneLayout {
  const nodes = scene.elements.filter(
    (element): element is SceneNodeElement => element.kind === "node"
  )
  const groups = scene.elements.filter(
    (element): element is SceneGroupElement => element.kind === "group"
  )
  const edges = scene.elements.filter(
    (element): element is SceneEdgeElement => element.kind === "edge"
  )
  const annotations = scene.elements.filter(
    (element): element is SceneAnnotationElement =>
      element.kind === "annotation"
  )
  const nodesById = new Map(nodes.map((node) => [node.id, node]))
  const orderedNodeIds = flowOrder(scene, nodes)
  const orderedNodes = orderedNodeIds.flatMap((id) => {
    const node = nodesById.get(id)
    return node ? [node] : []
  })

  const declaredGroupIds = new Set(groups.map(({ id }) => id))
  const groupOrder: string[] = []
  for (const node of orderedNodes) {
    const groupId =
      node.groupId && declaredGroupIds.has(node.groupId)
        ? node.groupId
        : UNGROUPED
    if (!groupOrder.includes(groupId)) groupOrder.push(groupId)
  }
  for (const group of groups) {
    if (!groupOrder.includes(group.id)) groupOrder.push(group.id)
  }

  const annotationTop = annotations.length > 0 ? 92 : 24
  const outerX = 32
  const groupGap = 24
  const columnCount = Math.max(groupOrder.length, 1)
  const availableWidth =
    scene.canvas.width - outerX * 2 - groupGap * (columnCount - 1)
  const columnWidth = availableWidth / columnCount
  const groupTop = annotationTop
  const groupHeight = scene.canvas.height - groupTop - 32
  const groupLayouts = new Map<string, LayoutBox>()
  const nodeLayouts = new Map<string, LayoutBox>()

  groupOrder.forEach((groupId, index) => {
    const groupBox: LayoutBox = {
      x: outerX + index * (columnWidth + groupGap),
      y: groupTop,
      width: columnWidth,
      height: groupHeight,
    }
    if (groupId !== UNGROUPED) groupLayouts.set(groupId, groupBox)

    const members = orderedNodes.filter((node) => {
      const nodeGroupId =
        node.groupId && declaredGroupIds.has(node.groupId)
          ? node.groupId
          : UNGROUPED
      return nodeGroupId === groupId
    })
    const nodeWidth = Math.min(220, Math.max(140, columnWidth - 48))
    const contentTop = groupId === UNGROUPED ? groupTop : groupTop + 52
    const contentBottom = scene.canvas.height - 48
    const usableHeight = contentBottom - contentTop
    const gap =
      members.length > 1
        ? Math.max(
            18,
            (usableHeight - members.length * NODE_HEIGHT) / (members.length - 1)
          )
        : 0
    const firstNodeY =
      members.length === 1
        ? contentTop + (usableHeight - NODE_HEIGHT) / 2
        : contentTop
    members.forEach((node, memberIndex) => {
      nodeLayouts.set(node.id, {
        x: groupBox.x + (columnWidth - nodeWidth) / 2,
        y: firstNodeY + memberIndex * (NODE_HEIGHT + gap),
        width: nodeWidth,
        height: NODE_HEIGHT,
      })
    })
  })

  const edgeLayouts = new Map<string, readonly LayoutPoint[]>()
  for (const edge of edges) {
    const source = nodeLayouts.get(edge.fromElementId)
    const target = nodeLayouts.get(edge.toElementId)
    if (source && target) {
      edgeLayouts.set(edge.id, edgePoints(source, target, scene.canvas.height))
    }
  }

  const annotationLayouts = new Map<string, LayoutBox>()
  const annotationGap = 16
  const annotationWidth = Math.min(
    320,
    (scene.canvas.width -
      outerX * 2 -
      annotationGap * (annotations.length - 1)) /
      Math.max(annotations.length, 1)
  )
  annotations.forEach((annotation, index) => {
    annotationLayouts.set(annotation.id, {
      x: outerX + index * (annotationWidth + annotationGap),
      y: 20,
      width: annotationWidth,
      height: 56,
    })
  })

  return {
    nodes: nodeLayouts,
    groups: groupLayouts,
    edges: edgeLayouts,
    annotations: annotationLayouts,
  }
}
