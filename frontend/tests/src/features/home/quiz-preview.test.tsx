// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, useLocation } from "react-router-dom"

const { mockContentData } = vi.hoisted(() => ({
  mockContentData: {
    routes: [] as Array<{
      id: string
      title: string
      path: string
      parentId?: string
    }>,
    scenes: {} as Record<
      string,
      { scene: { selfCheckQuiz?: Array<{ question: string; answer: string }> } }
    >,
  },
}))

vi.mock("@/content/generated/content-data", () => ({
  contentData: mockContentData,
}))

import { QuizPreview } from "../../../../src/features/home/QuizPreview"

afterEach(cleanup)

beforeEach(() => {
  mockContentData.routes = [
    { id: "first", title: "첫 Scene", path: "/explore/first" },
    { id: "second", title: "둘째 Scene", path: "/explore/second" },
  ]
  mockContentData.scenes = {
    first: {
      scene: {
        selfCheckQuiz: [{ question: "대표 질문?", answer: "대표 정답" }],
      },
    },
    second: {
      scene: {
        selfCheckQuiz: [{ question: "다른 질문?", answer: "다른 정답" }],
      },
    },
  }
})

function LocationProbe() {
  return <output aria-label="현재 경로">{useLocation().pathname}</output>
}

describe("QuizPreview", () => {
  it("안정된 첫 문제를 보여주고 요청할 때만 정답을 공개한다", () => {
    render(
      <MemoryRouter>
        <QuizPreview />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", { name: "대표 질문?" })
    ).toBeInTheDocument()
    expect(screen.queryByText("다른 질문?")).not.toBeInTheDocument()
    expect(screen.queryByText("대표 정답")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }))
    expect(screen.getByRole("status")).toHaveTextContent("대표 정답")
    expect(
      screen.getByRole("heading", { name: "대표 질문?" })
    ).toBeInTheDocument()
  })

  it("CTA로 독립 퀴즈 Route에 이동한다", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <QuizPreview />
        <LocationProbe />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole("link", { name: "전체 퀴즈 시작하기" }))
    expect(screen.getByRole("status", { name: "현재 경로" })).toHaveTextContent(
      "/quiz"
    )
  })

  it("Quiz Bank가 비어 있으면 소개 영역을 렌더링하지 않는다", () => {
    mockContentData.routes = []
    mockContentData.scenes = {}

    const { container } = render(
      <MemoryRouter>
        <QuizPreview />
      </MemoryRouter>
    )

    expect(container).toBeEmptyDOMElement()
  })
})
