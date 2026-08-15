import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
)

/** 디렉터리 아래의 TypeScript source 파일을 재귀적으로 수집한다. */
function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(filePath)
    return /\.tsx?$/u.test(entry.name) ? [filePath] : []
  })
}

/** 정적 import와 export-from의 module specifier를 추출한다. */
function moduleSpecifiers(source: string) {
  return [...source.matchAll(/^\s*(?:import|export).*?from\s+["']([^"']+)["']/gmu)]
    .map((match) => match[1])
}

describe("content module boundaries", () => {
  it("scripts, shared와 browser의 단방향 의존성을 유지한다", () => {
    const findings: string[] = []
    for (const area of ["scripts", "shared", "src"] as const) {
      for (const filePath of sourceFiles(path.join(frontendRoot, area))) {
        const source = readFileSync(filePath, "utf8")
        const relative = path.relative(frontendRoot, filePath)
        const imports = moduleSpecifiers(source)

        if (area === "scripts") {
          for (const specifier of imports) {
            if (specifier.startsWith("@/") || specifier.includes("/src/")) {
              findings.push(`${relative}: scripts must not import src: ${specifier}`)
            }
          }
        }
        if (area === "shared") {
          for (const specifier of imports) {
            if (specifier.startsWith("@/") || /(?:^|\/)scripts?\//u.test(specifier)) {
              findings.push(`${relative}: shared must stay independent: ${specifier}`)
            }
          }
        }
        if (area === "src") {
          for (const specifier of imports) {
            if (/(?:^|\/)scripts?\//u.test(specifier)) {
              findings.push(`${relative}: src must not import scripts: ${specifier}`)
            }
            if (specifier === "yaml" || specifier === "zod") {
              findings.push(`${relative}: browser must not import ${specifier}`)
            }
          }
          if (source.includes("import.meta.glob")) {
            findings.push(`${relative}: browser must not use raw content glob`)
          }
        }
      }
    }

    expect(findings).toEqual([])
  })
})
