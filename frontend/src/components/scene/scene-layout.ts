import type {
  Scene,
  SceneEdgeElement,
  SceneNodeElement,
} from "@/domain/content-types"
import { sceneLayoutIndex } from "@/content/generated/scene-layout-index"
import {
  estimatedSceneNodeWidth,
  SCENE_GRID_HEIGHT,
  SCENE_GRID_WIDTH,
  SCENE_NODE_HEIGHT,
  SCENE_NODE_WIDTH,
} from "@/components/scene/scene-node-metrics"

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
  edges: ReadonlyMap<string, readonly LayoutPoint[]>
}

export type SerializedSceneLayout = {
  width: number
  height: number
  nodes: Readonly<Record<string, LayoutBox>>
  edges: Readonly<Record<string, readonly LayoutPoint[]>>
}

const generatedLayoutCache = new Map<string, SceneLayout>()

function deserializeSceneLayout(layout: SerializedSceneLayout): SceneLayout {
  return {
    width: layout.width,
    height: layout.height,
    nodes: new Map(Object.entries(layout.nodes)),
    edges: new Map(Object.entries(layout.edges)),
  }
}

const MIN_SCENE_WIDTH = 1280
const MIN_SCENE_HEIGHT = 720
const HORIZONTAL_MARGIN = 72
const VERTICAL_MARGIN = 88
const COLUMN_GAP = 112
const ROW_GAP = 52
const PARALLEL_EDGE_GAP = 28

function estimatedEdgeLabelWidth(label: string) {
  return (
    [...label].reduce((width, character) => {
      if (/\s/u.test(character)) return width + 6
      // eslint-disable-next-line no-control-regex
      if (/[^\u0000-\u00ff]/u.test(character)) return width + 18
      return width + 10
    }, 0) + 28
  )
}

function calculateDepths(scene: Scene, nodes: readonly SceneNodeElement[]) {
  const nodeIds = new Set(nodes.map(({ id }) => id))
  const incoming = new Map(nodes.map(({ id }) => [id, 0]))
  const outgoing = new Map<string, string[]>()
  const flowNodeIds = new Set<string>()

  const edges = scene.elements.filter(
    (element): element is SceneEdgeElement => element.kind === "edge"
  )
  for (const edge of edges) {
    if (
      edge.variant === "supporting" ||
      !nodeIds.has(edge.fromElementId) ||
      !nodeIds.has(edge.toElementId) ||
      edge.fromElementId === edge.toElementId
    ) {
      continue
    }
    incoming.set(edge.toElementId, (incoming.get(edge.toElementId) ?? 0) + 1)
    flowNodeIds.add(edge.fromElementId)
    flowNodeIds.add(edge.toElementId)
    const targets = outgoing.get(edge.fromElementId) ?? []
    targets.push(edge.toElementId)
    outgoing.set(edge.fromElementId, targets)
  }

  const roots = nodes.filter(
    ({ id }) => flowNodeIds.has(id) && incoming.get(id) === 0
  )
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

  for (let pass = 0; pass < nodes.length; pass += 1) {
    let changed = false
    for (const node of nodes) {
      if (depths.has(node.id)) continue
      const targetDepths = edges.flatMap((edge) =>
        edge.variant === "supporting" && edge.fromElementId === node.id
          ? [depths.get(edge.toElementId)]
          : []
      )
      const resolvedDepths = targetDepths.filter(
        (depth): depth is number => depth !== undefined
      )
      if (resolvedDepths.length === 0) continue
      depths.set(node.id, Math.min(...resolvedDepths))
      changed = true
    }
    if (!changed) break
  }

  for (const node of nodes) {
    if (!depths.has(node.id)) depths.set(node.id, 0)
  }

  return depths
}

function edgePoints(
  source: LayoutBox,
  target: LayoutBox,
  laneOffset?: number,
  preferTopEntry = false
): LayoutPoint[] {
  const sourceCenterX = source.x + source.width / 2
  const sourceCenterY = source.y + source.height / 2
  const targetCenterX = target.x + target.width / 2
  const targetCenterY = target.y + target.height / 2

  if (source === target) {
    const loopTop = Math.max(28, source.y - 54)
    const startX = source.x + source.width * 0.35
    const rightX = source.x + source.width + 34
    const targetY = source.y + source.height * 0.35
    return [
      { x: startX, y: source.y },
      { x: startX, y: loopTop },
      { x: rightX, y: loopTop },
      { x: rightX, y: targetY },
      { x: source.x + source.width, y: targetY },
    ]
  }

  const offset = laneOffset ?? 0
  const horizontallySeparated =
    target.x >= source.x + source.width || source.x >= target.x + target.width

  if (preferTopEntry && sourceCenterY < target.y) {
    const targetIsLeftOfSource = targetCenterX < sourceCenterX
    const start = horizontallySeparated
      ? {
          x: targetIsLeftOfSource ? source.x : source.x + source.width,
          y: sourceCenterY,
        }
      : { x: sourceCenterX, y: source.y + source.height }
    const end = { x: targetCenterX, y: target.y }
    if (start.x === end.x) return [start, end]
    return [start, { x: end.x, y: start.y }, end]
  }

  if (horizontallySeparated) {
    const forward = targetCenterX > sourceCenterX
    const start = {
      x: forward ? source.x + source.width : source.x,
      y: sourceCenterY + offset,
    }
    const end = {
      x: forward ? target.x : target.x + target.width,
      y: targetCenterY + offset,
    }
    if (start.y === end.y) return [start, end]
    const middleX = (start.x + end.x) / 2
    return [start, { x: middleX, y: start.y }, { x: middleX, y: end.y }, end]
  }

  const downward = targetCenterY > sourceCenterY
  const start = {
    x: sourceCenterX + offset,
    y: downward ? source.y + source.height : source.y,
  }
  const end = {
    x: targetCenterX + offset,
    y: downward ? target.y : target.y + target.height,
  }
  if (start.x === end.x) return [start, end]
  const middleY = (start.y + end.y) / 2
  return [start, { x: start.x, y: middleY }, { x: end.x, y: middleY }, end]
}

export function createSceneLayout(scene: Scene): SceneLayout {
  const cachedLayout = generatedLayoutCache.get(scene.id)
  if (cachedLayout) return cachedLayout

  const generatedLayout = sceneLayoutIndex[scene.id]
  if (generatedLayout) {
    const layout = deserializeSceneLayout(generatedLayout)
    generatedLayoutCache.set(scene.id, layout)
    return layout
  }

  const nodes = scene.elements.filter(
    (element): element is SceneNodeElement => element.kind === "node"
  )
  const edges = scene.elements.filter(
    (element): element is SceneEdgeElement => element.kind === "edge"
  )
  const depths = calculateDepths(scene, nodes)
  const maxDepth = Math.max(...depths.values(), 0)
  const layers = Array.from({ length: maxDepth + 1 }, (_, depth) =>
    nodes.filter((node) => depths.get(node.id) === depth)
  )
  const nodeWidths = new Map(
    nodes.map((node) => [node.id, estimatedSceneNodeWidth(node)])
  )
  const layerWidths = layers.map((layer) =>
    Math.max(...layer.map((node) => nodeWidths.get(node.id) ?? 0), 0)
  )
  const layerGaps = Array.from(
    { length: Math.max(layers.length - 1, 0) },
    () => COLUMN_GAP
  )
  for (const edge of edges) {
    if (!edge.label) continue
    const sourceDepth = depths.get(edge.fromElementId)
    const targetDepth = depths.get(edge.toElementId)
    if (
      sourceDepth === undefined ||
      targetDepth === undefined ||
      Math.abs(targetDepth - sourceDepth) !== 1
    ) {
      continue
    }
    const gapIndex = Math.min(sourceDepth, targetDepth)
    layerGaps[gapIndex] = Math.max(
      layerGaps[gapIndex] ?? COLUMN_GAP,
      estimatedEdgeLabelWidth(edge.label)
    )
  }
  const contentWidth =
    layerWidths.reduce((sum, width) => sum + width, 0) +
    layerGaps.reduce((sum, gap) => sum + gap, 0)
  const sceneWidth =
    scene.layout?.type === "grid"
      ? SCENE_GRID_WIDTH
      : Math.max(MIN_SCENE_WIDTH, HORIZONTAL_MARGIN * 2 + contentWidth)
  const tallestLayer = Math.max(
    ...layers.map(
      (layer) =>
        layer.length * SCENE_NODE_HEIGHT +
        Math.max(layer.length - 1, 0) * ROW_GAP
    ),
    0
  )
  const sceneHeight =
    scene.layout?.type === "grid"
      ? SCENE_GRID_HEIGHT
      : Math.max(MIN_SCENE_HEIGHT, tallestLayer + VERTICAL_MARGIN * 2)
  const centerY = sceneHeight / 2
  const nodeLayouts = new Map<string, LayoutBox>()
  let columnX = (sceneWidth - contentWidth) / 2

  layers.forEach((layer, depth) => {
    const layerWidth = layerWidths[depth] ?? 0
    const layerHeight =
      layer.length * SCENE_NODE_HEIGHT + Math.max(layer.length - 1, 0) * ROW_GAP
    const firstY =
      scene.layoutHint === "branch" && layer.length > 1
        ? centerY -
          SCENE_NODE_HEIGHT / 2 -
          (layer.length - 1) * (SCENE_NODE_HEIGHT + ROW_GAP)
        : centerY - layerHeight / 2

    layer.forEach((node, index) => {
      const width = nodeWidths.get(node.id) ?? SCENE_NODE_WIDTH
      nodeLayouts.set(node.id, {
        x: columnX + (layerWidth - width) / 2,
        y: firstY + index * (SCENE_NODE_HEIGHT + ROW_GAP),
        width,
        height: SCENE_NODE_HEIGHT,
      })
    })
    columnX += layerWidth + (layerGaps[depth] ?? 0)
  })

  const edgeLayouts = new Map<string, readonly LayoutPoint[]>()
  const edgesByPair = new Map<string, SceneEdgeElement[]>()
  for (const edge of edges) {
    if (edge.fromElementId === edge.toElementId) continue
    const pairKey = [edge.fromElementId, edge.toElementId].sort().join("<->")
    const pairEdges = edgesByPair.get(pairKey) ?? []
    pairEdges.push(edge)
    edgesByPair.set(pairKey, pairEdges)
  }
  const laneOffsets = new Map<string, number>()
  for (const pairEdges of edgesByPair.values()) {
    if (pairEdges.length < 2) continue
    pairEdges.forEach((edge, index) => {
      laneOffsets.set(
        edge.id,
        (index - (pairEdges.length - 1) / 2) * PARALLEL_EDGE_GAP
      )
    })
  }
  for (const edge of edges) {
    const source = nodeLayouts.get(edge.fromElementId)
    const target = nodeLayouts.get(edge.toElementId)
    if (source && target) {
      edgeLayouts.set(
        edge.id,
        edgePoints(
          source,
          target,
          laneOffsets.get(edge.id),
          edge.variant === "supporting" || edge.variant === "return"
        )
      )
    }
  }

  return {
    width: sceneWidth,
    height: sceneHeight,
    nodes: nodeLayouts,
    edges: edgeLayouts,
  }
}
