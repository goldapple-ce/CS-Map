// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ExplanationPanel } from "../../../../src/features/explanation/ExplanationPanel"

afterEach(cleanup)

describe("ExplanationPanel Area selection", () => {
  it("선택한 Area 제목과 Markdown을 Topic과 구분해 표시한다", () => {
    const onClearSelection = vi.fn()
    render(
      <ExplanationPanel
        sceneId="server-redis"
        selection={{
          kind: "area",
          sceneId: "server-redis",
          areaId: "keyspace",
          label: "Keyspace",
        }}
        onClearSelection={onClearSelection}
      />
    )

    expect(screen.getByText("Area")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 1, name: "Keyspace" })
    ).toBeInTheDocument()
    const returnButton = screen.getByRole("button", {
      name: "현재 Scene 설명으로 돌아가기",
    })
    expect(returnButton).toBeInTheDocument()
    const toolbar = returnButton.closest(
      '[data-slot="explanation-toolbar-overlay"]'
    )
    expect(toolbar).toHaveClass("absolute", "inset-x-0", "justify-end")
    expect(screen.queryByRole("tab", { name: "설명" })).not.toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: "퀴즈" })).not.toBeInTheDocument()
    expect(
      returnButton.closest('[data-slot="scroll-area-viewport"]')
    ).toBeNull()

    fireEvent.click(returnButton)
    expect(onClearSelection).toHaveBeenCalledOnce()
  })

  it("선택이 없으면 floating toolbar에서 설명과 퀴즈를 전환한다", () => {
    render(
      <ExplanationPanel
        sceneId="server-redis"
        onClearSelection={vi.fn()}
      />
    )

    const quizTab = screen.getByRole("tab", { name: "퀴즈" })
    expect(
      quizTab.closest('[data-slot="explanation-toolbar-overlay"]')
    ).toHaveClass("absolute", "inset-x-0", "justify-start")
    expect(
      screen.queryByRole("button", {
        name: "현재 Scene 설명으로 돌아가기",
      })
    ).not.toBeInTheDocument()

    fireEvent.click(quizTab)
    expect(
      screen.getByRole("heading", { level: 3, name: "현재 Scene 퀴즈" })
    ).toBeInTheDocument()
  })
})
