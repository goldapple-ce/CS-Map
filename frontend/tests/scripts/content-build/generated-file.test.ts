import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { syncGeneratedContent } from "../../../scripts/content-build/generated-file.ts"

const temporaryRoots: string[] = []

/** 생성 파일 lifecycle 테스트용 애플리케이션 루트를 만든다. */
async function createAppRoot() {
  const appRoot = await mkdtemp(path.join(tmpdir(), "cs-map-generated-"))
  temporaryRoots.push(appRoot)
  await mkdir(path.join(appRoot, "src/content/generated"), { recursive: true })
  return appRoot
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  )
})

describe("Generated file lifecycle", () => {
  it("check에서는 stale과 첫 obsolete 파일을 순서대로 보고하고 build에서는 동기화한다", async () => {
    const staleRoot = await createAppRoot()
    await expect(
      syncGeneratedContent(staleRoot, "new content", true)
    ).rejects.toThrow(
      "src/content/generated/content-data.ts is stale; run npm run content:build"
    )

    const obsoleteRoot = await createAppRoot()
    const generatedRoot = path.join(obsoleteRoot, "src/content/generated")
    await writeFile(path.join(generatedRoot, "content-data.ts"), "new content")
    await writeFile(path.join(generatedRoot, "content-index.ts"), "obsolete")
    await writeFile(path.join(generatedRoot, "route-index.ts"), "obsolete")
    await expect(
      syncGeneratedContent(obsoleteRoot, "new content", true)
    ).rejects.toThrow(
      "src/content/generated/content-index.ts is obsolete; run npm run content:build"
    )
    await expect(access(path.join(generatedRoot, "route-index.ts"))).resolves.toBe(
      undefined
    )

    await syncGeneratedContent(obsoleteRoot, "updated content", false)
    expect(await readFile(path.join(generatedRoot, "content-data.ts"), "utf8"))
      .toBe("updated content")
    for (const fileName of [
      "content-index.ts",
      "route-index.ts",
      "scene-layout-index.ts",
    ]) {
      await expect(access(path.join(generatedRoot, fileName))).rejects.toMatchObject(
        { code: "ENOENT" }
      )
    }
  })

  it("Markdown 이미지 asset을 public에 동기화하고 오래된 asset을 찾는다", async () => {
    const appRoot = await createAppRoot()
    const asset = {
      outputRelativePath: path.join("sample", "diagram.png"),
      contents: Buffer.from("image bytes"),
    }
    await syncGeneratedContent(appRoot, "content", false, [asset])

    const outputPath = path.join(
      appRoot,
      "public/content/generated/sample/diagram.png"
    )
    expect(await readFile(outputPath, "utf8")).toBe("image bytes")
    await expect(
      syncGeneratedContent(appRoot, "content", true, [asset])
    ).resolves.toBeUndefined()

    await writeFile(outputPath, "stale")
    await expect(
      syncGeneratedContent(appRoot, "content", true, [asset])
    ).rejects.toThrow(
      "public/content/generated/sample/diagram.png is stale; run npm run content:build"
    )
  })
})
