// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { SceneArea } from "../../../../src/features/explorer/components/SceneArea"
import { SceneNode } from "../../../../src/features/explorer/components/SceneNode"
import type { SceneArea as SceneAreaModel } from "../../../../shared/content/types"

afterEach(cleanup)

function renderArea(area: SceneAreaModel, onSelect = vi.fn()) {
  render(
    <svg>
      <SceneArea
        area={area}
        sceneWidth={500}
        sceneHeight={500}
        columns={5}
        rows={5}
        onSelect={onSelect}
      />
    </svg>
  )
  return onSelect
}

describe("SceneArea", () => {
  it("설명이 있는 Area의 사각형 전체를 선택할 수 있다", () => {
    const onSelect = renderArea({
      id: "keyspace",
      label: "Keyspace",
      grid: { row: 1, col: 1 },
      rowSpan: 1,
      colSpan: 2,
      hasExplanation: true,
    })

    const area = screen.getByRole("button", {
      name: "Keyspace 영역 설명 열기",
    })
    fireEvent.click(area.querySelector("rect")!)
    expect(onSelect).toHaveBeenCalledWith("keyspace", "Keyspace")
    expect(document.querySelector("rect")).toHaveClass("fill-muted/20")
    expect(area).toHaveClass("cursor-pointer")
  })

  it("설명이 없는 Area Label은 기존 비상호작용 text로 유지한다", () => {
    const onSelect = renderArea({
      id: "group",
      label: "Group",
      grid: { row: 1, col: 1 },
      rowSpan: 1,
      colSpan: 1,
      hasExplanation: false,
    })

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByText("Group").tagName).toBe("text")
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("Area 위에 렌더링된 Node 선택이 Area보다 우선한다", () => {
    const onSelectArea = vi.fn()
    const onSelectTopic = vi.fn()
    render(
      <svg>
        <SceneArea
          area={{
            id: "keyspace",
            label: "Keyspace",
            grid: { row: 1, col: 1 },
            rowSpan: 1,
            colSpan: 2,
            hasExplanation: true,
          }}
          sceneWidth={500}
          sceneHeight={500}
          columns={5}
          rows={5}
          onSelect={onSelectArea}
        />
        <SceneNode
          element={{
            id: "hash-table",
            kind: "node",
            label: "Hash Table",
            grid: { row: 1, col: 1 },
          }}
          layout={{ x: 20, y: 20, width: 100, height: 60 }}
          state="interactive"
          onSelectTopic={onSelectTopic}
        />
      </svg>
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Hash Table 설명 열기" })
    )

    expect(onSelectTopic).toHaveBeenCalledWith("hash-table", "Hash Table")
    expect(onSelectArea).not.toHaveBeenCalled()
  })
})
