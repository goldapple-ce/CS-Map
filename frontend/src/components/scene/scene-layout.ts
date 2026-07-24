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
  width: number
  height: number
  nodes: ReadonlyMap<string, LayoutBox>
  groups: ReadonlyMap<string, LayoutBox>
  edges: ReadonlyMap<string, readonly LayoutPoint[]>
  annotations: ReadonlyMap<string, LayoutBox>
}

const MIN_SCENE_WIDTH = 1280
const MIN_SCENE_HEIGHT = 720
const MIN_NODE_WIDTH = 112
const NODE_HEIGHT = 104
const HORIZONTAL_MARGIN = 52
const VERTICAL_MARGIN = 72
const COLUMN_GAP = 64
const ROW_GAP = 34

function estimatedNodeWidth(node: SceneNodeElement) {
  const label = node.label ?? node.id
  const textWidth = [...label].reduce((width, character) => {
    if (/\s/u.test(character)) return width + 9
    if (/[^\u0000-\u00ff]/u.test(character)) return width + 24
    return width + 14
  }, 0)
  return Math.max(MIN_NODE_WIDTH, textWidth + 32)
}

function calculateDepths(scene: Scene, nodes: readonly SceneNodeElement[]) {
  const nodeIds = new Set(nodes.map(({ id }) => id))
  const incoming = new Map(nodes.map(({ id }) => [id, 0]))
  const outgoing = new Map<string, string[]>()

  for (const relationship of scene.relationships) {
    if (
      relationship.type !== "flows-to" ||
      !nodeIds.has(relationship.fromElementId) ||
      !nodeIds.has(relationship.toElementId)
    ) {
      continue
    }
    incoming.set(
      relationship.toElementId,
      (incoming.get(relationship.toElementId) ?? 0) + 1
    )
    const targets = outgoing.get(relationship.fromElementId) ?? []
    targets.push(relationship.toElementId)
    outgoing.set(relationship.fromElementId, targets)
  }

  const roots = nodes.filter(({ id }) => incoming.get(id) === 0)
  const queue = (roots.length > 0 ? roots : nodes.slice(0, 1)).map(
    ({ id }) => id
  )
  const depths = new Map<string, number>(queue.map((id) => [id, 0]))

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) continue
    const nextDepth = (depths.get(current) ?? 0) + 1
    for (const target of outgoing.get(current) ?? []) {
      if (depths.has(target)) continue
      depths.set(target, nextDepth)
      queue.push(target)
    }
  }

  for (const node of nodes) {
    if (!depths.has(node.id)) depths.set(node.id, 0)
  }

  for (const node of nodes) {
    const hasFlow =
      (incoming.get(node.id) ?? 0) > 0 ||
      (outgoing.get(node.id)?.length ?? 0) > 0
    if (hasFlow || !node.groupId) continue
    const peerDepths = nodes.flatMap((peer) =>
      peer.id !== node.id && peer.groupId === node.groupId
        ? [depths.get(peer.id) ?? 0]
        : []
    )
    if (peerDepths.length > 0) {
      depths.set(
        node.id,
        Math.round(
          peerDepths.reduce((sum, depth) => sum + depth, 0) / peerDepths.length
        )
      )
    }
  }

  return depths
}

function edgePoints(
  source: LayoutBox,
  target: LayoutBox,
  sceneHeight: number
): LayoutPoint[] {
  const sourceCenterY = source.y + source.height / 2
  const targetCenterY = target.y + target.height / 2

  if (target.x >= source.x) {
    return [
      { x: source.x + source.width, y: sourceCenterY },
      { x: target.x, y: targetCenterY },
    ]
  }

  const returnY = Math.min(
    sceneHeight - 36,
    Math.max(source.y + source.height, target.y + target.height) + 54
  )
  return [
    { x: source.x, y: sourceCenterY },
    { x: source.x - 24, y: sourceCenterY },
    { x: source.x - 24, y: returnY },
    { x: target.x + target.width + 24, y: returnY },
    { x: target.x + target.width + 24, y: targetCenterY },
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
  const depths = calculateDepths(scene, nodes)
  const maxDepth = Math.max(...depths.values(), 0)
  const layers = Array.from({ length: maxDepth + 1 }, (_, depth) =>
    nodes.filter((node) => depths.get(node.id) === depth)
  )
  const nodeWidths = new Map(
    nodes.map((node) => [node.id, estimatedNodeWidth(node)])
  )
  const layerWidths = layers.map((layer) =>
    Math.max(...layer.map((node) => nodeWidths.get(node.id) ?? 0), 0)
  )
  const contentWidth =
    layerWidths.reduce((sum, width) => sum + width, 0) +
    Math.max(layerWidths.length - 1, 0) * COLUMN_GAP
  const sceneWidth = Math.max(
    MIN_SCENE_WIDTH,
    HORIZONTAL_MARGIN * 2 + contentWidth
  )
  const tallestLayer = Math.max(
    ...layers.map(
      (layer) =>
        layer.length * NODE_HEIGHT + Math.max(layer.length - 1, 0) * ROW_GAP
    ),
    0
  )
  const sceneHeight = Math.max(
    MIN_SCENE_HEIGHT,
    tallestLayer + VERTICAL_MARGIN * 2
  )
  const centerY = sceneHeight / 2
  const nodeLayouts = new Map<string, LayoutBox>()
  let columnX = (sceneWidth - contentWidth) / 2

  layers.forEach((layer, depth) => {
    const layerWidth = layerWidths[depth] ?? 0
    const layerHeight =
      layer.length * NODE_HEIGHT + Math.max(layer.length - 1, 0) * ROW_GAP
    const firstY = centerY - layerHeight / 2

    layer.forEach((node, index) => {
      const width = nodeWidths.get(node.id) ?? MIN_NODE_WIDTH
      nodeLayouts.set(node.id, {
        x: columnX + (layerWidth - width) / 2,
        y: firstY + index * (NODE_HEIGHT + ROW_GAP),
        width,
        height: NODE_HEIGHT,
      })
    })
    columnX += layerWidth + COLUMN_GAP
  })

  const groupLayouts = new Map<string, LayoutBox>()
  for (const group of groups) {
    const memberBoxes = nodes.flatMap((node) => {
      const box =
        node.groupId === group.id ? nodeLayouts.get(node.id) : undefined
      return box ? [box] : []
    })
    if (memberBoxes.length === 0) continue
    const left = Math.min(...memberBoxes.map(({ x }) => x))
    const top = Math.min(...memberBoxes.map(({ y }) => y))
    const right = Math.max(...memberBoxes.map(({ x, width }) => x + width))
    groupLayouts.set(group.id, {
      x: left - 16,
      y: top - 34,
      width: right - left + 32,
      height:
        Math.max(...memberBoxes.map(({ y, height }) => y + height)) - top + 50,
    })
  }

  const edgeLayouts = new Map<string, readonly LayoutPoint[]>()
  for (const edge of edges) {
    const source = nodeLayouts.get(edge.fromElementId)
    const target = nodeLayouts.get(edge.toElementId)
    if (source && target) {
      edgeLayouts.set(edge.id, edgePoints(source, target, sceneHeight))
    }
  }

  const annotationLayouts = new Map<string, LayoutBox>()
  annotations.forEach((annotation, index) => {
    annotationLayouts.set(annotation.id, {
      x: HORIZONTAL_MARGIN,
      y: sceneHeight - 54 - index * 34,
      width: sceneWidth - HORIZONTAL_MARGIN * 2,
      height: 28,
    })
  })

  return {
    width: sceneWidth,
    height: sceneHeight,
    nodes: nodeLayouts,
    groups: groupLayouts,
    edges: edgeLayouts,
    annotations: annotationLayouts,
  }
}
