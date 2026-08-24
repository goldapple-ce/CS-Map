import { describe, expect, it } from "vitest"

import {
  normalizeSearchText,
  sceneSearchKeywords,
  sceneSearchText,
} from "../../../../src/features/search/search-index"

describe("Search index", () => {
  it("Scene 제목·요약·키워드와 Topic 이름을 같은 검색 문자열에 포함한다", () => {
    const searchText = sceneSearchText({
      title: "Spring Security",
      summary: "요청 인증 흐름을 설명합니다.",
      keywords: ["보안 필터", "Authentication"],
      elements: [
        {
          id: "security-context",
          kind: "node",
          label: "Security Context",
          grid: { row: 1, col: 1 },
        },
      ],
    })

    for (const query of [
      "spring",
      "인증 흐름",
      "보안 필터",
      "authentication",
      "security context",
    ]) {
      expect(searchText).toContain(normalizeSearchText(query))
    }
  })

  it("키워드가 없는 Scene도 제목과 요약으로 검색할 수 있다", () => {
    const searchText = sceneSearchText({
      title: "DNS",
      summary: "도메인 이름을 IP 주소로 변환합니다.",
      elements: [],
    })

    expect(searchText).toContain("dns")
    expect(searchText).toContain("ip 주소")
  })

  it("Edge의 label은 검색 문자열에 포함하지 않는다", () => {
    const searchText = sceneSearchText({
      title: "요청 흐름",
      summary: "요청 전달 과정을 설명합니다.",
      elements: [
        {
          id: "request-edge",
          kind: "edge",
          from: "client",
          to: "server",
          label: "내부 연결 설명",
        },
      ],
    })

    expect(searchText).not.toContain("내부 연결 설명")
  })

  it("작성 키워드 다음에 Topic 이름을 정의 순서대로 표시한다", () => {
    const keywords = sceneSearchKeywords({
      keywords: ["보안", "Authentication"],
      elements: [
        {
          id: "filter-chain",
          kind: "node",
          label: "Filter Chain",
          grid: { row: 1, col: 1 },
        },
        {
          id: "security-context",
          kind: "node",
          label: "Security Context",
          grid: { row: 1, col: 2 },
        },
      ],
    })

    expect(keywords).toEqual([
      "보안",
      "Authentication",
      "Filter Chain",
      "Security Context",
    ])
  })

  it("정규화하면 같은 키워드는 처음 등장한 표시 문자열만 보존한다", () => {
    const keywords = sceneSearchKeywords({
      keywords: ["Security Context", "ＤＮＳ"],
      elements: [
        {
          id: "security-context",
          kind: "node",
          label: " security context ",
          grid: { row: 1, col: 1 },
        },
        {
          id: "dns",
          kind: "node",
          label: "dns",
          grid: { row: 1, col: 2 },
        },
      ],
    })

    expect(keywords).toEqual(["Security Context", "ＤＮＳ"])
  })
})
