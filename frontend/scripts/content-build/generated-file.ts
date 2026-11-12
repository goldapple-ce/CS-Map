import {
  access,
  mkdir,
  readdir,
  readFile,
  unlink,
  writeFile,
} from "node:fs/promises"
import path from "node:path"

import type { GeneratedContentAsset } from "./markdown-images.ts"

const obsoleteGeneratedFiles = [
  "content-index.ts",
  "route-index.ts",
  "scene-layout-index.ts",
]

/** 애플리케이션 루트 기준 경로를 슬래시 형식으로 바꾼다. */
function relativePath(appRoot: string, filePath: string) {
  return path.relative(appRoot, filePath).split(path.sep).join("/")
}

/** 생성 이미지 디렉터리 아래의 파일을 재귀적으로 수집한다. */
async function findFiles(directory: string): Promise<string[]> {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    throw error
  }
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name)
      return entry.isDirectory()
        ? findFiles(entryPath)
        : Promise.resolve([entryPath])
    })
  )
  return files.flat()
}

/** Markdown에서 참조한 이미지와 public 생성 파일을 동기화한다. */
async function syncGeneratedAssets(
  appRoot: string,
  assets: readonly GeneratedContentAsset[],
  checkOnly: boolean
) {
  const generatedRoot = path.join(appRoot, "public", "content", "generated")
  const expected = new Map<string, Uint8Array>()
  for (const asset of assets) {
    const outputPath = path.join(generatedRoot, asset.outputRelativePath)
    const previous = expected.get(outputPath)
    if (previous && !Buffer.from(previous).equals(asset.contents)) {
      throw new Error(
        `Conflicting generated content asset: ${relativePath(appRoot, outputPath)}`
      )
    }
    expected.set(outputPath, asset.contents)
  }

  const existingFiles = await findFiles(generatedRoot)
  if (checkOnly) {
    for (const [outputPath, contents] of expected) {
      const current = await readFile(outputPath).catch(() => undefined)
      if (!current || !current.equals(contents)) {
        throw new Error(
          `${relativePath(appRoot, outputPath)} is stale; run npm run content:build`
        )
      }
    }
    const obsolete = existingFiles.find((filePath) => !expected.has(filePath))
    if (obsolete) {
      throw new Error(
        `${relativePath(appRoot, obsolete)} is obsolete; run npm run content:build`
      )
    }
    return
  }

  for (const [outputPath, contents] of expected) {
    await mkdir(path.dirname(outputPath), { recursive: true })
    await writeFile(outputPath, contents)
  }
  await Promise.all(
    existingFiles
      .filter((filePath) => !expected.has(filePath))
      .map((filePath) => unlink(filePath))
  )
}

/** 단일 생성 파일을 동기화하고 알려진 이전 생성 파일을 순서대로 정리한다. */
export async function syncGeneratedContent(
  appRoot: string,
  output: string,
  checkOnly: boolean,
  assets: readonly GeneratedContentAsset[] = []
) {
  const generatedRoot = path.join(appRoot, "src/content/generated")
  const outputPath = path.join(generatedRoot, "content-data.ts")
  if (checkOnly) {
    if ((await readFile(outputPath, "utf8").catch(() => "")) !== output) {
      throw new Error(
        `${relativePath(appRoot, outputPath)} is stale; run npm run content:build`
      )
    }
  } else {
    await mkdir(generatedRoot, { recursive: true })
    await writeFile(outputPath, output)
  }

  for (const fileName of obsoleteGeneratedFiles) {
    const filePath = path.join(generatedRoot, fileName)
    try {
      await access(filePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue
      throw error
    }
    if (checkOnly) {
      throw new Error(
        `${relativePath(appRoot, filePath)} is obsolete; run npm run content:build`
      )
    }
    await unlink(filePath)
  }

  await syncGeneratedAssets(appRoot, assets, checkOnly)
}
