import { execFile } from "node:child_process"
import path from "path"
import { promisify } from "node:util"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

import { isSupportedContentImage } from "./scripts/content-build/markdown-images.ts"

const execFileAsync = promisify(execFile)

/** 콘텐츠와 Layout source 변경 시 생성물을 갱신하고 전체 화면을 다시 불러온다. */
function contentHotReload(): Plugin {
  let rebuildQueue = Promise.resolve()
  const layoutSources = [
    path.resolve(__dirname, "scripts/elk-scene-layout.ts"),
    path.resolve(__dirname, "shared/layout/scene-node-metrics.ts"),
  ]

  return {
    name: "cs-map-content-hot-reload",
    /** Content Build가 참조하는 Layout source를 개발 서버 watcher에 추가한다. */
    configureServer(server) {
      server.watcher.add(layoutSources)
    },
    /** 작성 콘텐츠나 Layout source 변경을 직렬화해 Content Build를 다시 실행한다. */
    async handleHotUpdate({ file, server }) {
      const contentDirectory = path.resolve(__dirname, "content")
      const isMarkdown = path.extname(file) === ".md"
      const isContentFile =
        file.startsWith(`${contentDirectory}${path.sep}`) &&
        (isMarkdown ||
          isSupportedContentImage(file) ||
          ["scenario.yaml", "scene.yaml", "quiz.ko.yaml"].includes(
            path.basename(file)
          ))
      if (!isContentFile && !layoutSources.includes(file)) return

      rebuildQueue = rebuildQueue
        .catch(() => undefined)
        .then(async () => {
          await execFileAsync(
            process.execPath,
            [
              path.resolve(__dirname, "node_modules/tsx/dist/cli.mjs"),
              path.resolve(__dirname, "scripts/build-content-index.ts"),
            ],
            { cwd: __dirname }
          )
        })
      await rebuildQueue
      server.ws.send({ type: "full-reload" })
      return []
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [contentHotReload(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
})
