import ELK from "elkjs/lib/elk.bundled.js"
import { routeEdges } from "@mr_mint/elkjs-libavoid"
import type {
  ElkExtendedEdge,
  ElkNode,
  ElkPoint,
  ElkPort,
} from "elkjs/lib/elk-api.js"

import type { SerializedSceneLayout } from "../src/components/scene/scene-layout.ts"
import type {
  Scene,
  SceneEdgeElement,
  SceneNodeElement,
} from "../src/domain/content-types.ts"

const MIN_SCENE_WIDTH = 1280
const MIN_SCENE_HEIGHT = 720
const MIN_NODE_WIDTH = 144
const NODE_HEIGHT = 124
const HORIZONTAL_MARGIN = 72
const ANNOTATION_HEIGHT = 28
const ANNOTATION_GAP = 6
const GRID_COLUMN_GAP = 220
const GRID_ROW_GAP = 96
const GRID_VERTICAL_MARGIN = 88

const elk = new ELK()

function estimatedNodeWidth(node: SceneNodeElement) {
  const label = node.label ?? node.id
  const textWidth = [...label].reduce((width, character) => {
    if (/\s/u.test(character)) return width + 9
    if (/[^\u0000-\u00ff]/u.test(character)) return width + 24
    return width + 14
  }, 0)
  return Math.max(MIN_NODE_WIDTH, textWidth + 32)
}

function estimatedEdgeLabelWidth(label: string) {
  return (
    [...label].reduce((width, character) => {
      if (/\s/u.test(character)) return width + 6
      if (/[^\u0000-\u00ff]/u.test(character)) return width + 18
      return width + 10
    }, 0) + 28
  )
}

function portSide(
  edge: SceneEdgeElement,
  endpoint: "source" | "target",
  reverseDirection: boolean
) {
  if (edge.variant === "supporting") {
    return endpoint === "source" ? "SOUTH" : "NORTH"
  }
  if (reverseDirection) {
    return endpoint === "source" ? "WEST" : "EAST"
  }
  return endpoint === "source" ? "EAST" : "WEST"
}

function findReverseEdges(edges: readonly SceneEdgeElement[]) {
  const firstDirectionByPair = new Map<string, string>()
  const reverseEdgeIds = new Set<string>()
  for (const edge of edges) {
    const pair = [edge.fromElementId, edge.toElementId].sort().join("<->")
    const direction = `${edge.fromElementId}->${edge.toElementId}`
    const firstDirection = firstDirectionByPair.get(pair)
    if (!firstDirection) {
      firstDirectionByPair.set(pair, direction)
    } else if (firstDirection !== direction) {
      reverseEdgeIds.add(edge.id)
    }
  }
  return reverseEdgeIds
}

function createPorts(
  nodeId: string,
  edges: readonly SceneEdgeElement[],
  reverseEdgeIds: ReadonlySet<string>
): ElkPort[] {
  return edges.flatMap((edge) => {
    const ports: ElkPort[] = []
    if (edge.fromElementId === nodeId) {
      ports.push({
        id: `${edge.id}::source`,
        width: 0,
        height: 0,
        layoutOptions: {
          "elk.port.side": portSide(
            edge,
            "source",
            reverseEdgeIds.has(edge.id)
          ),
        },
      })
    }
    if (edge.toElementId === nodeId) {
      ports.push({
        id: `${edge.id}::target`,
        width: 0,
        height: 0,
        layoutOptions: {
          "elk.port.side": portSide(
            edge,
            "target",
            reverseEdgeIds.has(edge.id)
          ),
        },
      })
    }
    return ports
  })
}

function createElkEdge(edge: SceneEdgeElement): ElkExtendedEdge {
  return {
    id: edge.id,
    sources: [`${edge.id}::source`],
    targets: [`${edge.id}::target`],
    ...(edge.label
      ? {
          labels: [
            {
              id: `${edge.id}::label`,
              text: edge.label,
              width: estimatedEdgeLabelWidth(edge.label),
              height: 28,
              layoutOptions: { "elk.edgeLabels.placement": "CENTER" },
            },
          ],
        }
      : {}),
    layoutOptions: {
      "elk.layered.priority.direction":
        edge.variant === "flow" || edge.variant === undefined ? "10" : "1",
      ...(edge.variant === "return"
        ? { "elk.layered.feedbackEdges": "true" }
        : {}),
    },
  }
}

function sectionPoints(edge: ElkExtendedEdge): ElkPoint[] {
  const section = edge.sections?.[0]
  if (!section) return []
  return [section.startPoint, ...(section.bendPoints ?? []), section.endPoint]
}

function rounded(value: number | undefined) {
  return Math.round((value ?? 0) * 100) / 100
}

async function buildGridSceneLayout(
  scene: Scene,
  nodes: readonly SceneNodeElement[],
  edges: readonly SceneEdgeElement[]
): Promise<SerializedSceneLayout> {
  const columns = scene.layout?.columns ?? 5
  const rows = scene.layout?.rows ?? 5
  const columnWidths = Array.from({ length: columns }, () => MIN_NODE_WIDTH)
  for (const node of nodes) {
    if (!node.grid) continue
    columnWidths[node.grid.col - 1] = Math.max(
      columnWidths[node.grid.col - 1] ?? MIN_NODE_WIDTH,
      estimatedNodeWidth(node)
    )
  }

  const gridWidth =
    columnWidths.reduce((sum, width) => sum + width, 0) +
    Math.max(columns - 1, 0) * GRID_COLUMN_GAP
  const gridHeight =
    rows * NODE_HEIGHT + Math.max(rows - 1, 0) * GRID_ROW_GAP
  const annotations = scene.elements.filter(
    (element) => element.kind === "annotation"
  )
  const annotationAreaHeight =
    annotations.length === 0
      ? 0
      : 54 +
        annotations.length * ANNOTATION_HEIGHT +
        Math.max(annotations.length - 1, 0) * ANNOTATION_GAP
  const sceneWidth = Math.max(
    MIN_SCENE_WIDTH,
    gridWidth + HORIZONTAL_MARGIN * 2
  )
  const sceneHeight = Math.max(
    MIN_SCENE_HEIGHT,
    gridHeight + GRID_VERTICAL_MARGIN * 2 + annotationAreaHeight
  )
  const gridStartX = (sceneWidth - gridWidth) / 2
  const gridStartY =
    (sceneHeight - annotationAreaHeight - gridHeight) / 2
  const columnStarts: number[] = []
  let nextColumnX = gridStartX
  for (const width of columnWidths) {
    columnStarts.push(nextColumnX)
    nextColumnX += width + GRID_COLUMN_GAP
  }

  const nodeLayouts = Object.fromEntries(
    nodes.map((node) => {
      if (!node.grid) {
        throw new Error(
          `Grid scene ${scene.id} is missing coordinates for node ${node.id}`
        )
      }
      const width = estimatedNodeWidth(node)
      const columnWidth = columnWidths[node.grid.col - 1] ?? width
      return [
        node.id,
        {
          x:
            (columnStarts[node.grid.col - 1] ?? gridStartX) +
            (columnWidth - width) / 2,
          y:
            gridStartY +
            (node.grid.row - 1) * (NODE_HEIGHT + GRID_ROW_GAP),
          width,
          height: NODE_HEIGHT,
        },
      ]
    })
  )

  const routes = await routeEdges(
    {
      id: scene.id,
      x: 0,
      y: 0,
      width: sceneWidth,
      height: sceneHeight,
      children: nodes.map((node) => ({ id: node.id, ...nodeLayouts[node.id] })),
      edges: edges.map((edge) => ({
        id: edge.id,
        sources: [edge.fromElementId],
        targets: [edge.toElementId],
      })),
    },
    {
      routingType: "orthogonal",
      shapeBufferDistance: 18,
      idealNudgingDistance: 18,
      segmentPenalty: 20,
      crossingPenalty: 120,
      fixedSharedPathPenalty: 80,
      nudgeOrthogonalSegmentsConnectedToShapes: true,
      nudgeOrthogonalTouchingColinearSegments: true,
      nudgeSharedPathsWithCommonEndPoint: true,
      selfLoopHandling: "fallback",
    }
  )

  const edgeLayouts = Object.fromEntries(
    edges.flatMap((edge) => {
      const route = routes.get(edge.id)
      if (!route) return []
      return [
        [
          edge.id,
          [route.sourcePoint, ...route.bendPoints, route.targetPoint].map(
            (point) => ({ x: rounded(point.x), y: rounded(point.y) })
          ),
        ] as const,
      ]
    })
  )

  const groups = scene.elements.filter((element) => element.kind === "group")
  const groupLayouts = Object.fromEntries(
    groups.flatMap((group) => {
      const memberBoxes = nodes.flatMap((node) => {
        const box = node.groupId === group.id ? nodeLayouts[node.id] : undefined
        return box ? [box] : []
      })
      if (memberBoxes.length === 0) return []
      const left = Math.min(...memberBoxes.map(({ x }) => x))
      const top = Math.min(...memberBoxes.map(({ y }) => y))
      const right = Math.max(...memberBoxes.map(({ x, width }) => x + width))
      const bottom = Math.max(
        ...memberBoxes.map(({ y, height }) => y + height)
      )
      return [
        [
          group.id,
          {
            x: left - 16,
            y: top - 34,
            width: right - left + 32,
            height: bottom - top + 50,
          },
        ] as const,
      ]
    })
  )

  const annotationLayouts = Object.fromEntries(
    annotations.map((annotation, index) => [
      annotation.id,
      {
        x: HORIZONTAL_MARGIN,
        y:
          sceneHeight -
          54 -
          index * (ANNOTATION_HEIGHT + ANNOTATION_GAP),
        width: sceneWidth - HORIZONTAL_MARGIN * 2,
        height: ANNOTATION_HEIGHT,
      },
    ])
  )

  return {
    width: sceneWidth,
    height: sceneHeight,
    nodes: nodeLayouts,
    groups: groupLayouts,
    edges: edgeLayouts,
    annotations: annotationLayouts,
  }
}

export async function buildSceneLayout(
  scene: Scene
): Promise<SerializedSceneLayout> {
  const nodes = scene.elements.filter(
    (element): element is SceneNodeElement => element.kind === "node"
  )
  const edges = scene.elements.filter(
    (element): element is SceneEdgeElement => element.kind === "edge"
  )
  const groups = scene.elements.filter((element) => element.kind === "group")
  const annotations = scene.elements.filter(
    (element) => element.kind === "annotation"
  )

  if (scene.layout?.type === "grid") {
    return buildGridSceneLayout(scene, nodes, edges)
  }

  const reverseEdgeIds = findReverseEdges(edges)

  const graph: ElkNode = {
    id: scene.id,
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.randomSeed": "1",
      "elk.padding": "[top=88,left=72,bottom=88,right=72]",
      "elk.spacing.nodeNode": "52",
      "elk.spacing.edgeEdge": "24",
      "elk.spacing.edgeNode": "28",
      "elk.spacing.edgeLabel": "12",
      "elk.layered.spacing.nodeNodeBetweenLayers": "112",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.unnecessaryBendpoints": "true",
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: estimatedNodeWidth(node),
      height: NODE_HEIGHT,
      ports: createPorts(node.id, edges, reverseEdgeIds),
      layoutOptions: { "elk.portConstraints": "FIXED_SIDE" },
    })),
    edges: edges.map(createElkEdge),
  }

  const result = await elk.layout(graph)
  const graphWidth = rounded(result.width)
  const graphHeight = rounded(result.height)
  const annotationAreaHeight =
    annotations.length === 0
      ? 0
      : 54 +
        annotations.length * ANNOTATION_HEIGHT +
        Math.max(annotations.length - 1, 0) * ANNOTATION_GAP
  const sceneWidth = Math.max(MIN_SCENE_WIDTH, graphWidth)
  const sceneHeight = Math.max(
    MIN_SCENE_HEIGHT,
    graphHeight + annotationAreaHeight
  )
  const offsetX = (sceneWidth - graphWidth) / 2
  const offsetY = Math.max(
    0,
    (sceneHeight - annotationAreaHeight - graphHeight) / 2
  )

  const nodeLayouts = Object.fromEntries(
    (result.children ?? []).map((node) => [
      node.id,
      {
        x: rounded(node.x) + offsetX,
        y: rounded(node.y) + offsetY,
        width: rounded(node.width),
        height: rounded(node.height),
      },
    ])
  )

  const edgeLayouts = Object.fromEntries(
    (result.edges ?? [])
      .map((edge) => [
        edge.id,
        sectionPoints(edge).map((point) => ({
          x: rounded(point.x) + offsetX,
          y: rounded(point.y) + offsetY,
        })),
      ] as const)
      .filter(([, points]) => points.length >= 2)
  )

  const groupLayouts = Object.fromEntries(
    groups.flatMap((group) => {
      const memberBoxes = nodes.flatMap((node) => {
        const box = node.groupId === group.id ? nodeLayouts[node.id] : undefined
        return box ? [box] : []
      })
      if (memberBoxes.length === 0) return []
      const left = Math.min(...memberBoxes.map(({ x }) => x))
      const top = Math.min(...memberBoxes.map(({ y }) => y))
      const right = Math.max(...memberBoxes.map(({ x, width }) => x + width))
      const bottom = Math.max(
        ...memberBoxes.map(({ y, height }) => y + height)
      )
      return [
        [
          group.id,
          {
            x: left - 16,
            y: top - 34,
            width: right - left + 32,
            height: bottom - top + 50,
          },
        ] as const,
      ]
    })
  )

  const annotationLayouts = Object.fromEntries(
    annotations.map((annotation, index) => [
      annotation.id,
      {
        x: HORIZONTAL_MARGIN,
        y:
          sceneHeight -
          54 -
          index * (ANNOTATION_HEIGHT + ANNOTATION_GAP),
        width: sceneWidth - HORIZONTAL_MARGIN * 2,
        height: ANNOTATION_HEIGHT,
      },
    ])
  )

  return {
    width: sceneWidth,
    height: sceneHeight,
    nodes: nodeLayouts,
    groups: groupLayouts,
    edges: edgeLayouts,
    annotations: annotationLayouts,
  }
}
