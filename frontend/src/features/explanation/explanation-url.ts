const CONTENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type ParsedExplanationHash =
  | { kind: "none" }
  | { kind: "selection"; selectionId: string }
  | { kind: "invalid" }

/** URL의 bare Fragment를 안전하게 선택 ID로 해석한다. */
export function parseExplanationHash(hash: string): ParsedExplanationHash {
  if (!hash) return { kind: "none" }

  try {
    const selectionId = decodeURIComponent(hash.slice(1))
    return CONTENT_ID_PATTERN.test(selectionId)
      ? { kind: "selection", selectionId }
      : { kind: "invalid" }
  } catch {
    return { kind: "invalid" }
  }
}

/** owner Scene의 canonical path에 bare 선택 Fragment를 붙인다. */
export function explanationSelectionUrl(
  scenePath: string,
  selectionId: string,
  search = ""
) {
  return `${scenePath}${search}#${encodeURIComponent(selectionId)}`
}

/** Scene path와 query는 유지하면서 선택 Fragment만 제거한다. */
export function explanationBaseUrl(pathname: string, search = "") {
  return `${pathname}${search}`
}
