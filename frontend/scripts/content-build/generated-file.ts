import { access, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

const obsoleteGeneratedFiles = [
  "content-index.ts",
  "route-index.ts",
  "scene-layout-index.ts",
]

/** 애플리케이션 루트 기준 경로를 슬래시 형식으로 바꾼다. */
function relativePath(appRoot: string, filePath: string) {
  return path.relative(appRoot, filePath).split(path.sep).join("/")
}

/** 단일 생성 파일을 동기화하고 알려진 이전 생성 파일을 순서대로 정리한다. */
export async function syncGeneratedContent(
  appRoot: string,
  output: string,
  checkOnly: boolean
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
}
