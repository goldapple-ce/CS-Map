// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { SceneNode } from "../../../../src/features/explorer/components/SceneNode"

afterEach(cleanup)

describe("SceneNode label", () => {
  it("작성된 줄바꿈만 유지하며 긴 줄은 font-size를 축소한다", () => {
    const { container } = render(
      <svg>
        <SceneNode
          element={{
            id: "reference-records",
            kind: "node",
            label: "Card Table/\nRemembered Set",
            grid: { row: 1, col: 1 },
          }}
          layout={{ x: 0, y: 0, width: 130, height: 80 }}
          state="interactive"
        />
      </svg>
    )

    const label = screen.getByText("Card Table/").parentElement!
    const authoredLines = label.querySelectorAll(":scope > span")

    expect(label).toHaveClass("whitespace-nowrap")
    expect(authoredLines).toHaveLength(2)
    expect([...authoredLines].map((line) => line.textContent)).toEqual([
      "Card Table/",
      "Remembered Set",
    ])
    expect(Number.parseFloat(label.style.fontSize)).toBeLessThan(24)
    expect(container.textContent).toContain("Remembered Set")
  })

  it("짧은 label은 density의 기본 font-size를 유지한다", () => {
    render(
      <svg>
        <SceneNode
          element={{
            id: "short-label",
            kind: "node",
            label: "Redis",
            grid: { row: 1, col: 1 },
          }}
          layout={{ x: 0, y: 0, width: 130, height: 80 }}
          state="interactive"
        />
      </svg>
    )

    const label = screen.getByText("Redis").parentElement!
    expect(label).toHaveClass("whitespace-nowrap")
    expect(label).toHaveStyle({ fontSize: "24px" })
  })

  it("매우 긴 단일 토큰도 줄바꿈 없이 font-size를 축소한다", () => {
    render(
      <svg>
        <SceneNode
          element={{
            id: "long-token",
            kind: "node",
            label: "RememberedSetWithAVeryLongToken",
            grid: { row: 1, col: 1 },
          }}
          layout={{ x: 0, y: 0, width: 130, height: 80 }}
          state="interactive"
        />
      </svg>
    )

    const line = screen.getByText("RememberedSetWithAVeryLongToken")
    const label = line.parentElement!
    expect(label).toHaveClass("whitespace-nowrap")
    expect(label.querySelectorAll(":scope > span")).toHaveLength(1)
    expect(Number.parseFloat(label.style.fontSize)).toBeLessThan(24)
  })
})
