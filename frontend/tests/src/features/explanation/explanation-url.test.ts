import { describe, expect, it } from "vitest"

import {
  explanationBaseUrl,
  explanationSelectionUrl,
  parseExplanationHash,
} from "../../../../src/features/explanation/explanation-url"

describe("Explanation selection URL", () => {
  it("bare Fragment를 선택 ID로 읽는다", () => {
    expect(parseExplanationHash("#jvm-stack")).toEqual({
      kind: "selection",
      selectionId: "jvm-stack",
    })
    expect(parseExplanationHash("")).toEqual({ kind: "none" })
  })

  it("malformed encoding과 ID 규칙 밖의 Fragment를 예외 없이 거부한다", () => {
    expect(parseExplanationHash("#%E0%A4%A")).toEqual({ kind: "invalid" })
    expect(parseExplanationHash("#Topic%20Name")).toEqual({ kind: "invalid" })
    expect(parseExplanationHash("#")).toEqual({ kind: "invalid" })
  })

  it("canonical 선택 URL과 hash 제거 URL에서 기존 query를 보존한다", () => {
    expect(
      explanationSelectionUrl(
        "/explore/server/java/jvm",
        "jvm-stack",
        "?mode=map"
      )
    ).toBe("/explore/server/java/jvm?mode=map#jvm-stack")
    expect(explanationBaseUrl("/explore/server/java/jvm", "?mode=map")).toBe(
      "/explore/server/java/jvm?mode=map"
    )
  })
})
