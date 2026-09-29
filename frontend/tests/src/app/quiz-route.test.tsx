// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
} from "react-router-dom"

import { AppHeader } from "../../../src/app/AppHeader"
import { routes } from "../../../src/app/router"

afterEach(cleanup)

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  })
})

describe("독립 퀴즈 Route", () => {
  it("Header에서 /quiz로 이동하는 진입점을 제공한다", () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>
    )

    expect(screen.getByRole("link", { name: "퀴즈" })).toHaveAttribute(
      "href",
      "/quiz"
    )
  })

  it("/quiz 직접 접근 시 범위 선택 화면을 연다", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/quiz"] })
    render(<RouterProvider router={router} />)

    expect(
      screen.getByRole("heading", { name: "어디까지 확인해볼까요?" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("출제 범위")).toBeInTheDocument()
  })
})
