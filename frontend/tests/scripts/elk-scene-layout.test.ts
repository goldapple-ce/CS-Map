import { describe, expect, it } from "vitest"

import type { Scene, SceneElement } from "@shared/content/types"
import { buildSceneLayout } from "../../scripts/elk-scene-layout.ts"

/** Layout 테스트에 필요한 최소 Grid Scene을 만든다. */
function gridScene(elements: SceneElement[]): Scene {
  return {
    id: "test-scene",
    slug: "test-scene",
    title: "Test Scene",
    summary: "Test Scene summary",
    layout: { columns: 5, rows: 5 },
    areas: [],
    elements,
  }
}

describe("buildSceneLayout", () => {
  it("Grid 위치와 span을 고정된 Node box로 변환한다", async () => {
    const layout = await buildSceneLayout(
      gridScene([
        {
          id: "source",
          kind: "node",
          label: "Source",
          grid: { row: 1, col: 1, rowSpan: 2, colSpan: 2 },
        },
      ])
    )

    expect(layout.nodes.source).toEqual({
      x: 35,
      y: 20,
      width: 330,
      height: 200,
    })
  })

  it("지정된 port side를 사용해 직교 Edge 경로를 만든다", async () => {
    const layout = await buildSceneLayout(
      gridScene([
        {
          id: "source",
          kind: "node",
          label: "Source",
          grid: { row: 1, col: 1 },
        },
        {
          id: "target",
          kind: "node",
          label: "Target",
          grid: { row: 1, col: 3 },
        },
        {
          id: "edge",
          kind: "edge",
          fromElementId: "source",
          toElementId: "target",
          fromSide: "right",
          toSide: "left",
        },
      ])
    )

    expect(layout.edges.edge.length).toBeGreaterThanOrEqual(2)
    for (const [index, point] of layout.edges.edge.entries()) {
      if (index === 0) continue
      const previous = layout.edges.edge[index - 1]
      expect(point.x === previous.x || point.y === previous.y).toBe(true)
    }
  })

  it("self-loop을 직렬화한다", async () => {
    const loopLayout = await buildSceneLayout(
      gridScene([
        {
          id: "source",
          kind: "node",
          label: "Source",
          grid: { row: 1, col: 1 },
        },
        {
          id: "loop",
          kind: "edge",
          fromElementId: "source",
          toElementId: "source",
        },
      ])
    )

    expect(loopLayout.edges.loop.length).toBeGreaterThanOrEqual(2)
  })
})
