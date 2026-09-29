// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, useLocation } from "react-router-dom"

import { SearchOutline } from "../../../../src/features/search/SearchOutline"
import { SearchResults } from "../../../../src/features/search/SearchResults"
import {
  orderedSearchEntries,
  type SearchEntry,
} from "../../../../src/features/search/search-index"

afterEach(cleanup)

/** 테스트 중 Link와 navigate가 바꾼 현재 경로를 노출한다. */
function LocationProbe() {
  return <output aria-label="현재 경로">{useLocation().pathname}</output>
}

describe("Search Scene 항목", () => {
  it("기본 목차에서 Scene 요약만 표시하고 가지 이동을 유지한다", () => {
    const root = orderedSearchEntries.find(
      (entry) => entry.id === "enter-google"
    )!
    const dns = orderedSearchEntries.find((entry) => entry.id === "dns")!

    render(
      <MemoryRouter initialEntries={[root.path]}>
        <SearchOutline currentSceneId={root.id} />
        <LocationProbe />
      </MemoryRouter>
    )

    expect(screen.getByText(root.summary)).toBeInTheDocument()
    for (const keyword of root.keywords) {
      expect(screen.queryByText(keyword)).not.toBeInTheDocument()
    }
    expect(screen.queryByLabelText("검색 키워드")).not.toBeInTheDocument()

    const toggle = screen.getByRole("button", {
      name: `${root.title} 하위 Topic 펼치기`,
    })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")

    expect(screen.getByText(dns.summary)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("link", { name: dns.title }))
    expect(screen.getByRole("status", { name: "현재 경로" })).toHaveTextContent(
      dns.path
    )
  })

  it("검색 결과도 공통 metadata와 현재 위치를 표시하고 선택한 경로로 이동한다", () => {
    const entry: SearchEntry = {
      id: "spring",
      title: "Spring",
      summary: "요청 처리 구조를 설명합니다.",
      keywords: ["DispatcherServlet", "JPA"],
      searchText: "spring 요청 처리 구조 dispatcherservlet jpa",
      path: "/explore/spring",
    }

    render(
      <MemoryRouter initialEntries={["/"]}>
        <SearchResults entries={[entry]} currentSceneId={entry.id} />
        <LocationProbe />
      </MemoryRouter>
    )

    const result = screen.getByRole("button", {
      name: `${entry.title}, 현재 Topic`,
    })
    expect(result).toHaveAttribute("aria-current", "page")
    expect(result).toHaveTextContent(entry.summary)
    expect(result).toHaveTextContent("DispatcherServlet")
    expect(result).toHaveTextContent("JPA")
    expect(result).toHaveTextContent("현재 Topic")
    expect(screen.getByLabelText("검색 키워드")).toBeInTheDocument()

    fireEvent.click(result)
    expect(screen.getByRole("status", { name: "현재 경로" })).toHaveTextContent(
      entry.path
    )
  })
})
