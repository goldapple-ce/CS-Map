import { execFile } from "node:child_process"
import path from "path"
import { promisify } from "node:util"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

const execFileAsync = promisify(execFile)

function contentHotReload(): Plugin {
  let rebuildQueue = Promise.resolve()

  return {
    name: "cs-map-content-hot-reload",
    async handleHotUpdate({ file, server }) {
      const contentDirectory = path.resolve(__dirname, "content")
      const isContentYaml =
        file.startsWith(`${contentDirectory}${path.sep}`) &&
        ["scene.yaml", "concept.yaml"].includes(path.basename(file))
      if (!isContentYaml) return

      rebuildQueue = rebuildQueue.catch(() => undefined).then(async () => {
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
    },
  },
})
