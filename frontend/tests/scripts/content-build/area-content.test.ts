import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  prepareScenes,
  ROOT_SCENE_ID,
} from "../../../scripts/content-build/source-content.ts"
import { sceneDocumentSchema } from "../../../scripts/content-build/schemas.ts"

const temporaryRoots: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})

describe("Area Markdown content", () => {
  it("Area 설명과 같은 폴더의 이미지를 별도 record로 준비한다", async () => {
    const appRoot = await mkdtemp(path.join(tmpdir(), "cs-map-area-content-"))
    temporaryRoots.push(appRoot)
    const directory = path.join(appRoot, "content/scenes")
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, "content.ko.md"), "Scene")
    await writeFile(
      path.join(directory, "keyspace.ko.md"),
      "![구조](./key.png)"
    )
    await writeFile(path.join(directory, "key.png"), "image")

    const document = {
      ...sceneDocumentSchema.parse({
        title: "Root",
        summary: "Root",
        nodes: {},
        areas: {
          keyspace: {
            label: "Keyspace",
            row: 1,
            col: 1,
            rowSpan: 1,
            colSpan: 1,
            contentRef: "keyspace.ko.md",
          },
        },
      }),
      id: ROOT_SCENE_ID,
    }

    const result = await prepareScenes(
      appRoot,
      [{ filePath: path.join(directory, "scene.yaml"), value: document }],
      ROOT_SCENE_ID
    )

    expect(result.errors).toEqual([])
    expect(result.files[0]?.areaExplanations).toEqual({
      keyspace: "![구조](/content/generated/_root/key.png)",
    })
    expect(result.assets).toEqual([
      expect.objectContaining({
        outputRelativePath: path.join("_root", "key.png"),
      }),
    ])
  })
})
