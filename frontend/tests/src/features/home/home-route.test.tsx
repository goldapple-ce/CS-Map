// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"

import { HomeRoute } from "../../../../src/app/routes/HomeRoute"

afterEach(cleanup)

describe("HomeRoute", () => {
  it("기존 홈페이지 흐름에 퀴즈 소개를 함께 표시한다", () => {
    render(
      <MemoryRouter>
        <HomeRoute />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        name: "브라우저에 google.com을 입력하면 무슨 일이 발생할까요?",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "읽은 내용을 문제로 확인해보세요." })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "전체 퀴즈 시작하기" })
    ).toHaveAttribute("href", "/quiz")
  })
})
