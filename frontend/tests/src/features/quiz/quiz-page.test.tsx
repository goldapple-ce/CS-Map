// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"

import { QuizPage } from "../../../../src/features/quiz/QuizPage"
import type { GeneratedContentData } from "../../../../shared/content/generated-contract"

afterEach(cleanup)

const content = {
  routes: [
    { id: "root", title: "Root", path: "/explore/root" },
    {
      id: "child",
      title: "Child",
      path: "/explore/root/child",
      parentId: "root",
    },
  ],
  scenes: {
    root: {
      scene: { selfCheckQuiz: [{ question: "첫 문제?", answer: "첫 답" }] },
    },
    child: {
      scene: { selfCheckQuiz: [{ question: "둘째 문제?", answer: "둘째 답" }] },
    },
  },
} as unknown as Pick<GeneratedContentData, "routes" | "scenes">

function renderQuiz() {
  return render(
    <MemoryRouter>
      <QuizPage content={content} random={() => 0.99} />
    </MemoryRouter>
  )
}

describe("독립 퀴즈 페이지", () => {
  it("문제가 없으면 시작 대신 안내를 표시한다", () => {
    const emptyContent = {
      routes: [{ id: "root", title: "Root", path: "/explore/root" }],
      scenes: { root: { scene: {} } },
    } as unknown as Pick<GeneratedContentData, "routes" | "scenes">

    render(
      <MemoryRouter>
        <QuizPage content={emptyContent} />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", { name: "아직 풀 수 있는 문제가 없습니다." })
    ).toBeInTheDocument()
  })

  it("선택한 범위의 문제 수를 보여주고 답 공개 뒤에만 평가한다", () => {
    renderQuiz()

    expect(
      screen.getByText("전체 Scene의 2문제를 순서만 섞어 출제합니다.")
    ).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("출제 범위"), {
      target: { value: "child" },
    })
    expect(
      screen.getByText("Child의 1문제를 순서만 섞어 출제합니다.")
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "1문제 시작하기" }))
    expect(
      screen.getByRole("heading", { name: "둘째 문제?" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "알겠어요" })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }))
    expect(screen.getByRole("status")).toHaveTextContent("둘째 답")
    expect(screen.getByRole("button", { name: "알겠어요" })).toBeInTheDocument()
  })

  it("두 평가 경로를 거쳐 결과와 복습 출처를 표시하고 다시 시작한다", () => {
    renderQuiz()
    fireEvent.click(screen.getByRole("button", { name: "2문제 시작하기" }))

    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }))
    fireEvent.click(screen.getByRole("button", { name: "다시 볼래요" }))
    expect(screen.getByLabelText("퀴즈 진행 상황")).toHaveTextContent("2 / 2")

    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }))
    fireEvent.click(screen.getByRole("button", { name: "알겠어요" }))

    expect(
      screen.getByRole("heading", { name: "2문제를 모두 확인했어요." })
    ).toBeInTheDocument()
    expect(
      screen.getByText("다시 볼 문제 1개를 모았습니다.")
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Root" })).toHaveAttribute(
      "href",
      "/explore/root"
    )

    fireEvent.click(screen.getByRole("button", { name: "같은 범위 다시 풀기" }))
    expect(screen.getByLabelText("퀴즈 진행 상황")).toHaveTextContent("1 / 2")
    expect(
      screen.queryByText("다시 볼 문제 1개를 모았습니다.")
    ).not.toBeInTheDocument()
  })

  it("범위 선택으로 돌아가면 새 세션 준비 화면을 표시한다", () => {
    renderQuiz()
    fireEvent.change(screen.getByLabelText("출제 범위"), {
      target: { value: "child" },
    })
    fireEvent.click(screen.getByRole("button", { name: "1문제 시작하기" }))
    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }))
    fireEvent.click(screen.getByRole("button", { name: "알겠어요" }))
    fireEvent.click(screen.getByRole("button", { name: "범위 다시 선택하기" }))

    expect(
      screen.getByRole("heading", { name: "어디까지 확인해볼까요?" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("출제 범위")).toHaveValue("child")
  })
})
