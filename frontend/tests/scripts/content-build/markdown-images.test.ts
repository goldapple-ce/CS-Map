import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  isSupportedContentImage,
  prepareMarkdownImages,
} from "../../../scripts/content-build/markdown-images.ts"

const temporaryRoots: string[] = []

/** Markdown과 같은 디렉터리에 이미지를 둘 수 있는 테스트 루트를 만든다. */
async function createSceneRoot() {
  const appRoot = await mkdtemp(path.join(tmpdir(), "cs-map-images-"))
  temporaryRoots.push(appRoot)
  const sceneDirectory = path.join(appRoot, "content/scenes/sample")
  await mkdir(sceneDirectory, { recursive: true })
  return {
    appRoot,
    sceneDirectory,
    markdownPath: path.join(sceneDirectory, "content.ko.md"),
  }
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe("Markdown local images", () => {
  it("dev watcher와 build가 같은 이미지 확장자를 인식한다", () => {
    expect(isSupportedContentImage("diagram.PNG")).toBe(true)
    expect(isSupportedContentImage("content.ko.md")).toBe(false)
  })

  it("같은 디렉터리의 이미지를 공개 경로로 치환하고 asset을 만든다", async () => {
    const { appRoot, sceneDirectory, markdownPath } = await createSceneRoot()
    await writeFile(path.join(sceneDirectory, "diagram.png"), "image bytes")

    const result = await prepareMarkdownImages(
      appRoot,
      markdownPath,
      [
        "![구조도](./diagram.png)",
        "![외부](https://example.com/image.png)",
        "![공개](/content/shared/image.png)",
        "`![예시](./missing.png)`",
      ].join("\n\n")
    )

    expect(result.errors).toEqual([])
    expect(result.markdown).toContain(
      "![구조도](/content/generated/sample/diagram.png)"
    )
    expect(result.markdown).toContain("https://example.com/image.png")
    expect(result.markdown).toContain("/content/shared/image.png")
    expect(result.markdown).toContain("`![예시](./missing.png)`")
    expect(result.assets).toHaveLength(1)
    expect(result.assets[0]?.outputRelativePath).toBe(
      path.join("sample", "diagram.png")
    )
  })

  it("상위·하위 경로와 없는 파일을 거부한다", async () => {
    const { appRoot, markdownPath } = await createSceneRoot()

    const result = await prepareMarkdownImages(
      appRoot,
      markdownPath,
      [
        "![상위](../outside.png)",
        "![하위](./images/inside.png)",
        "![없음](./missing.png)",
      ].join("\n\n")
    )

    expect(result.errors).toEqual([
      "../outside.png: local Markdown image must use ./filename with a supported image extension",
      "./images/inside.png: local Markdown image must use ./filename with a supported image extension",
      expect.stringContaining("./missing.png:"),
    ])
    expect(result.assets).toEqual([])
  })

  it("같은 디렉터리에 있어도 symbolic link 이미지는 거부한다", async () => {
    const { appRoot, sceneDirectory, markdownPath } = await createSceneRoot()
    const outsidePath = path.join(appRoot, "outside.png")
    await writeFile(outsidePath, "outside image")
    await symlink(outsidePath, path.join(sceneDirectory, "linked.png"))

    const result = await prepareMarkdownImages(
      appRoot,
      markdownPath,
      "![링크](./linked.png)"
    )

    expect(result.errors).toEqual([
      "./linked.png: image must be a regular file",
    ])
  })
})
