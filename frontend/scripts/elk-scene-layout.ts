import ELK from "elkjs/lib/elk.bundled.js"
import { routeEdges } from "@mr_mint/elkjs-libavoid"
import type {
  ElkExtendedEdge,
  ElkNode,
  ElkPoint,
  ElkPort,
} from "elkjs/lib/elk-api.js"

import type { SerializedSceneLayout } from "../src/components/scene/scene-layout.ts"
import {
  estimatedSceneNodeWidth,
  SCENE_GRID_HEIGHT,
  SCENE_GRID_WIDTH,
  SCENE_NODE_HEIGHT,
  SCENE_NODE_WIDTH,
} from "../src/components/scene/scene-node-metrics.ts"
import type {
  Scene,
  SceneEdgeElement,
  SceneNodeElement,
} from "../src/domain/content-types.ts"

const MIN_SCENE_WIDTH = 1280
const MIN_SCENE_HEIGHT = 720

const elk = new ELK()

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

type GridPortSide = NonNullable<SceneEdgeElement["fromSide"]>

function portPosition(
  width: number,
  height: number,
  side: GridPortSide,
  index: number,
  count: number
) {
  const ratio = (index + 1) / (count + 1)
  if (side === "top") return { x: width * ratio, y: 0 }
  if (side === "right") return { x: width, y: height * ratio }
  if (side === "bottom") return { x: width * ratio, y: height }
  return { x: 0, y: height * ratio }
}

function createHintedPorts(
  node: SceneNodeElement,
  box: { width: number; height: number },
  edges: readonly SceneEdgeElement[]
) {
  const endpoints = edges.flatMap((edge) => {
    const result: { id: string; side: GridPortSide }[] = []
    if (edge.fromElementId === node.id && edge.fromSide) {
      result.push({ id: `${edge.id}::source`, side: edge.fromSide })
    }
    if (edge.toElementId === node.id && edge.toSide) {
      result.push({ id: `${edge.id}::target`, side: edge.toSide })
    }
    return result
  })

  return endpoints.map((endpoint) => {
    const sameSide = endpoints.filter(({ side }) => side === endpoint.side)
    const index = sameSide.findIndex(({ id }) => id === endpoint.id)
    return {
      id: endpoint.id,
      ...portPosition(
        box.width,
        box.height,
        endpoint.side,
        index,
        sameSide.length
      ),
      width: 0,
      height: 0,
      properties: { "elk.port.side": endpoint.side.toUpperCase() },
    }
  })
}

async function buildGridSceneLayout(
  scene: Scene,
  nodes: readonly SceneNodeElement[],
  edges: readonly SceneEdgeElement[]
): Promise<SerializedSceneLayout> {
  const columns = scene.layout?.columns ?? 5
  const rows = scene.layout?.rows ?? 5
  const sceneWidth = SCENE_GRID_WIDTH
  const sceneHeight = SCENE_GRID_HEIGHT
  const cellWidth = sceneWidth / columns
  const cellHeight = sceneHeight / rows

  const nodeLayouts = Object.fromEntries(
    nodes.map((node) => {
      if (!node.grid) {
        throw new Error(
          `Grid scene ${scene.id} is missing coordinates for node ${node.id}`
        )
      }
      const rowSpan = node.grid.rowSpan ?? 1
      const colSpan = node.grid.colSpan ?? 1
      return [
        node.id,
        {
          x:
            (node.grid.col - 1) * cellWidth +
            (cellWidth - SCENE_NODE_WIDTH) / 2,
          y:
            (node.grid.row - 1) * cellHeight +
            (cellHeight - SCENE_NODE_HEIGHT) / 2,
          width: (colSpan - 1) * cellWidth + SCENE_NODE_WIDTH,
          height: (rowSpan - 1) * cellHeight + SCENE_NODE_HEIGHT,
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
      children: nodes.map((node) => {
        const box = nodeLayouts[node.id]
        return {
          id: node.id,
          ...box,
          ports: createHintedPorts(node, box, edges),
        }
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        sources: [
          edge.fromSide ? `${edge.id}::source` : edge.fromElementId,
        ],
        targets: [edge.toSide ? `${edge.id}::target` : edge.toElementId],
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

  return {
    width: sceneWidth,
    height: sceneHeight,
    nodes: nodeLayouts,
    edges: edgeLayouts,
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
      width: estimatedSceneNodeWidth(node),
      height: SCENE_NODE_HEIGHT,
      ports: createPorts(node.id, edges, reverseEdgeIds),
      layoutOptions: { "elk.portConstraints": "FIXED_SIDE" },
    })),
    edges: edges.map(createElkEdge),
  }

  const result = await elk.layout(graph)
  const graphWidth = rounded(result.width)
  const graphHeight = rounded(result.height)
  const sceneWidth = Math.max(MIN_SCENE_WIDTH, graphWidth)
  const sceneHeight = Math.max(MIN_SCENE_HEIGHT, graphHeight)
  const offsetX = (sceneWidth - graphWidth) / 2
  const offsetY = Math.max(
    0,
    (sceneHeight - graphHeight) / 2
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

  return {
    width: sceneWidth,
    height: sceneHeight,
    nodes: nodeLayouts,
    edges: edgeLayouts,
  }
}
