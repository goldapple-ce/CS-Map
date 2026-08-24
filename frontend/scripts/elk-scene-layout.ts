import { routeEdges } from "@mr_mint/elkjs-libavoid"

import type { SerializedSceneLayout } from "@shared/layout/scene-layout-contract"
import {
  SCENE_GRID_HEIGHT,
  SCENE_GRID_WIDTH,
  SCENE_NODE_HEIGHT,
  SCENE_NODE_WIDTH,
} from "@shared/layout/scene-node-metrics"
import type {
  Scene,
  SceneEdgeElement,
  SceneNodeElement,
} from "@shared/content/types"

type GridPortSide = NonNullable<SceneEdgeElement["fromSide"]>

/** libavoid 좌표의 소수점 오차를 생성물에서 안정적인 두 자리 값으로 고정한다. */
function rounded(value: number | undefined) {
  return Math.round((value ?? 0) * 100) / 100
}

/** 같은 Node 면의 포트를 겹치지 않게 균등한 간격으로 배치한다. */
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

/** 작성 데이터가 지정한 Edge 면을 libavoid의 고정 포트 좌표로 변환한다. */
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

/** 검증된 5×5 Grid Scene을 Node box와 직교 Edge 경로로 직렬화한다. */
export async function buildSceneLayout(
  scene: Scene
): Promise<SerializedSceneLayout> {
  const nodes = scene.elements.filter(
    (element): element is SceneNodeElement => element.kind === "node"
  )
  const edges = scene.elements.filter(
    (element): element is SceneEdgeElement => element.kind === "edge"
  )
  const sceneWidth = SCENE_GRID_WIDTH
  const sceneHeight = SCENE_GRID_HEIGHT
  const cellWidth = sceneWidth / 5
  const cellHeight = sceneHeight / 5

  const nodeLayouts = Object.fromEntries(
    nodes.map((node) => {
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
      // Scene과 내부 Topic이 같은 ID를 가질 수 있어 ELK graph ID만 별도 namespace로 둔다.
      id: `scene:${scene.id}`,
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
        sources: [edge.fromSide ? `${edge.id}::source` : edge.fromElementId],
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
