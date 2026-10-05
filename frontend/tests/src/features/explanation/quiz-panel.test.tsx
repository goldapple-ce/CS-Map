// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { QuizPanel } from "../../../../src/features/explanation/QuizPanel"

afterEach(cleanup)

describe("QuizPanel", () => {
  it("rich question을 문제 heading과 분리하고 rich answer를 여닫는다", () => {
    const { container } = render(
      <QuizPanel
        questions={[
          {
            question: "다음을 확인하세요.\n\n- 첫 항목\n- `둘째` 항목",
            answer: "**정답**입니다.\n\n> 이유를 설명합니다.",
          },
        ]}
      />
    )

    expect(
      screen.getByRole("heading", { level: 4, name: "문제 1" })
    ).toBeInTheDocument()
    expect(container.querySelector("h4 ul")).not.toBeInTheDocument()
    expect(container.querySelectorAll("li")).toHaveLength(2)
    expect(screen.queryByText("정답")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "정답 보기" }))
    expect(
      screen.getByRole("status").querySelector("strong")
    ).toHaveTextContent("정답")
    expect(
      screen.getByRole("status").querySelector("blockquote")
    ).toHaveTextContent("이유를 설명합니다.")

    fireEvent.click(screen.getByRole("button", { name: "답변 숨기기" }))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
