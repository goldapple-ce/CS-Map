// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ExplanationPanel } from "../../../../src/features/explanation/ExplanationPanel"

afterEach(cleanup)

describe("ExplanationPanel Area selection", () => {
  it("선택한 Area 제목과 Markdown을 Topic과 구분해 표시한다", () => {
    render(
      <ExplanationPanel
        sceneId="server-redis"
        selection={{
          kind: "area",
          sceneId: "server-redis",
          areaId: "keyspace",
          label: "Keyspace",
        }}
        onClearSelection={vi.fn()}
      />
    )

    expect(screen.getByText("Area")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 1, name: "Keyspace" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "현재 Scene 설명으로 돌아가기" })
    ).toBeInTheDocument()
  })
})
