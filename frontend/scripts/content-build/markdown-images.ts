import { lstat, readFile } from "node:fs/promises"
import path from "node:path"

import { fromMarkdown } from "mdast-util-from-markdown"
import type { Image, Nodes, Parent } from "mdast"

const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
])
const localImagePattern = /^\.\/([^/\\?#]+)$/u

export type GeneratedContentAsset = {
  outputRelativePath: string
  contents: Uint8Array
}

type Replacement = {
  start: number
  end: number
  value: string
}

/** Content Build와 dev watcher가 같은 이미지 확장자 집합을 사용한다. */
export function isSupportedContentImage(filePath: string) {
  return imageExtensions.has(path.extname(filePath).toLowerCase())
}

/** 파일명에 제어 문자가 포함됐는지 확인한다. */
function hasControlCharacter(value: string) {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint <= 31 || codePoint === 127
  })
}

/** Markdown AST에서 inline 이미지 노드만 순서대로 수집한다. */
function collectImages(node: Nodes, images: Image[]) {
  if (node.type === "image") images.push(node)
  if ("children" in node) {
    for (const child of (node as Parent).children) collectImages(child, images)
  }
}

/** 절대 URL과 공개 content URL이 아닌 이미지 주소를 로컬 상대 주소로 분류한다. */
function isLocalImageUrl(url: string) {
  return (
    !url.startsWith("/") &&
    !url.startsWith("//") &&
    !/^[A-Za-z][A-Za-z\d+.-]*:/u.test(url)
  )
}

/** URL에 사용할 각 경로 세그먼트를 인코딩한다. */
function assetUrl(relativePath: string) {
  const encodedPath = relativePath
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  return `/content/generated/${encodedPath}`
}

/** Markdown의 로컬 이미지를 검증하고 배포용 공개 경로로 치환한다. */
export async function prepareMarkdownImages(
  appRoot: string,
  markdownPath: string,
  markdown: string
): Promise<{
  markdown: string
  assets: GeneratedContentAsset[]
  errors: string[]
}> {
  const markdownDirectory = path.dirname(markdownPath)
  const scenesRoot = path.join(appRoot, "content", "scenes")
  const relativeDirectory = path.relative(scenesRoot, markdownDirectory)
  const outputDirectory = relativeDirectory || "_root"
  const images: Image[] = []
  const assets: GeneratedContentAsset[] = []
  const errors: string[] = []
  const replacements: Replacement[] = []

  collectImages(fromMarkdown(markdown), images)

  for (const image of images) {
    if (!isLocalImageUrl(image.url)) continue
    const match = localImagePattern.exec(image.url)
    const fileName = match?.[1]
    if (
      !fileName ||
      hasControlCharacter(fileName) ||
      !isSupportedContentImage(fileName)
    ) {
      errors.push(
        `${image.url}: local Markdown image must use ./filename with a supported image extension`
      )
      continue
    }

    const sourcePath = path.join(markdownDirectory, fileName)
    try {
      const file = await lstat(sourcePath)
      if (!file.isFile() || file.isSymbolicLink()) {
        throw new Error("image must be a regular file")
      }
      const outputRelativePath = path.join(outputDirectory, fileName)
      assets.push({
        outputRelativePath,
        contents: await readFile(sourcePath),
      })

      const start = image.position?.start.offset
      const end = image.position?.end.offset
      if (start === undefined || end === undefined) {
        throw new Error("image position is unavailable")
      }
      const imageSource = markdown.slice(start, end)
      const destinationStart = imageSource.lastIndexOf("](")
      const urlOffset = imageSource.indexOf(image.url, destinationStart + 2)
      if (urlOffset < 0) throw new Error("image URL is unavailable")
      replacements.push({
        start: start + urlOffset,
        end: start + urlOffset + image.url.length,
        value: assetUrl(outputRelativePath),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${image.url}: ${message}`)
    }
  }

  let transformed = markdown
  for (const replacement of replacements.sort(
    (left, right) => right.start - left.start
  )) {
    transformed =
      transformed.slice(0, replacement.start) +
      replacement.value +
      transformed.slice(replacement.end)
  }

  return { markdown: transformed, assets, errors }
}
