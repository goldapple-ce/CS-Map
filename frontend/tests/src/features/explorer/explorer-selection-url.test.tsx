// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import type { ReactNode } from "react"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"

import { ExploreRoute } from "../../../../src/app/routes/ExploreRoute"
import { contentData } from "../../../../src/content/generated/content-data"

const panel = vi.hoisted(() => ({
  open: vi.fn(),
  toggleVisibility: vi.fn(),
  toggleReadingMode: vi.fn(),
  handleResize: vi.fn(),
}))

vi.mock("@/features/explorer/hooks/use-explanation-panel", () => ({
  useExplanationPanel: () => ({
    viewportPanelRef: { current: null },
    explanationPanelRef: { current: null },
    collapsed: false,
    mode: "split",
    ...panel,
  }),
}))

vi.mock("@/features/explorer/hooks/use-reduce-motion", () => ({
  useReducedMotion: () => true,
}))

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ResizablePanel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ResizableHandle: () => <div />,
}))

vi.mock("@/features/viewport/SceneViewport", () => ({
  SceneViewport: ({
    sceneId,
    selectedSceneId,
    selectedElementId,
    selectedAreaId,
    onEnterScene,
    onSelectTopic,
    onSelectArea,
  }: {
    sceneId: string
    selectedSceneId?: string
    selectedElementId?: string
    selectedAreaId?: string
    onEnterScene: (sceneId: string) => void
    onSelectTopic: (sceneId: string, elementId: string, label: string) => void
    onSelectArea: (sceneId: string, areaId: string, label: string) => void
  }) => (
    <section>
      <output aria-label="focused scene">{sceneId}</output>
      <output aria-label="selected scene">{selectedSceneId}</output>
      <output aria-label="selected topic">{selectedElementId}</output>
      <output aria-label="selected area">{selectedAreaId}</output>
      <button
        type="button"
        onClick={() =>
          onSelectTopic(
            sceneId,
            sceneId === "server-redis" ? "resp" : "browser",
            "Topic"
          )
        }
      >
        focused topic 선택
      </button>
      <button
        type="button"
        onClick={() => onSelectArea("server-redis", "keyspace", "Keyspace")}
      >
        area 선택
      </button>
      <button
        type="button"
        onClick={() =>
          onSelectTopic(contentData.rootSceneId, "browser", "Browser")
        }
      >
        contextual topic 선택
      </button>
      <button type="button" onClick={() => onEnterScene("https")}>
        child scene 이동
      </button>
    </section>
  ),
}))

vi.mock("@/features/explanation/ExplanationPanel", () => ({
  ExplanationPanel: ({
    sceneId,
    selection,
    onClearSelection,
  }: {
    sceneId: string
    selection?: { label: string }
    onClearSelection: () => void
  }) => (
    <aside>
      <output aria-label="panel scene">{sceneId}</output>
      <output aria-label="panel title">
        {selection?.label ?? "Scene 설명"}
      </output>
      <button type="button" onClick={onClearSelection}>
        현재 Scene 설명으로 돌아가기
      </button>
    </aside>
  ),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function LocationProbe() {
  const location = useLocation()
  return (
    <output aria-label="현재 URL">
      {location.pathname}
      {location.search}
      {location.hash}
    </output>
  )
}

function HistoryControls() {
  const navigate = useNavigate()
  return (
    <div>
      <button type="button" onClick={() => navigate(-1)}>
        history back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        history forward
      </button>
    </div>
  )
}

function renderExplorer(initialEntries: string[], initialIndex?: number) {
  return render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Routes>
        <Route path="/explore/*" element={<ExploreRoute />} />
        <Route path="*" element={<div>다른 화면</div>} />
      </Routes>
      <LocationProbe />
      <HistoryControls />
    </MemoryRouter>
  )
}

const rootRoute = contentData.routes.find(
  ({ id }) => id === contentData.rootSceneId
)!
const redisRoute = contentData.routes.find(({ id }) => id === "server-redis")!
const httpsRoute = contentData.routes.find(({ id }) => id === "https")!

describe("Explorer URL Fragment selection", () => {
  it("valid direct URL에서 Topic 선택과 Panel을 복원한다", async () => {
    renderExplorer([`${rootRoute.path}#browser`])

    expect(screen.getByLabelText("selected scene")).toHaveTextContent(
      contentData.rootSceneId
    )
    expect(screen.getByLabelText("selected topic")).toHaveTextContent("browser")
    expect(screen.getByLabelText("panel title")).toHaveTextContent("Browser")
    await waitFor(() => expect(panel.open).toHaveBeenCalled())
  })

  it("같은 Scene의 Topic·Area 선택과 해제를 history에 남기고 query를 보존한다", async () => {
    renderExplorer([`${redisRoute.path}?mode=map`])

    fireEvent.click(screen.getByRole("button", { name: "focused topic 선택" }))
    expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
      `${redisRoute.path}?mode=map#resp`
    )
    expect(screen.getByLabelText("selected topic")).toHaveTextContent("resp")

    fireEvent.click(screen.getByRole("button", { name: "area 선택" }))
    expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
      `${redisRoute.path}?mode=map#keyspace`
    )
    expect(screen.getByLabelText("selected area")).toHaveTextContent("keyspace")

    fireEvent.click(
      screen.getByRole("button", { name: "현재 Scene 설명으로 돌아가기" })
    )
    expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
      `${redisRoute.path}?mode=map`
    )

    fireEvent.click(screen.getByRole("button", { name: "history back" }))
    await waitFor(() =>
      expect(screen.getByLabelText("selected area")).toHaveTextContent(
        "keyspace"
      )
    )
    fireEvent.click(screen.getByRole("button", { name: "history forward" }))
    await waitFor(() =>
      expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
        `${redisRoute.path}?mode=map`
      )
    )
  })

  it("contextual Topic은 owner Scene URL로 이동하고 Scene 이동은 stale hash를 버린다", async () => {
    renderExplorer([`${redisRoute.path}#resp`])

    fireEvent.click(
      screen.getByRole("button", { name: "contextual topic 선택" })
    )
    await waitFor(() =>
      expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
        `${rootRoute.path}#browser`
      )
    )

    fireEvent.click(screen.getByRole("button", { name: "child scene 이동" }))
    await waitFor(() =>
      expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
        httpsRoute.path
      )
    )
    expect(screen.getByLabelText("현재 URL")).not.toHaveTextContent("#")
  })

  it("invalid·navigation Node Fragment를 base Scene URL로 replace한다", async () => {
    renderExplorer(["/before", `${rootRoute.path}#https`], 1)

    await waitFor(() =>
      expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
        rootRoute.path
      )
    )
    expect(screen.getByLabelText("현재 URL")).not.toHaveTextContent("#https")
    expect(screen.getByLabelText("panel title")).toHaveTextContent("Scene 설명")

    fireEvent.click(screen.getByRole("button", { name: "history back" }))
    await waitFor(() =>
      expect(screen.getByLabelText("현재 URL")).toHaveTextContent("/before")
    )
  })

  it("Panel UI 제어는 valid Fragment를 변경하지 않는다", () => {
    renderExplorer([`${rootRoute.path}#browser`])

    fireEvent.click(screen.getByRole("button", { name: "읽기 모드 열기" }))
    fireEvent.click(screen.getByRole("button", { name: "설명 패널 닫기" }))

    expect(panel.toggleReadingMode).toHaveBeenCalled()
    expect(panel.toggleVisibility).toHaveBeenCalled()
    expect(screen.getByLabelText("현재 URL")).toHaveTextContent(
      `${rootRoute.path}#browser`
    )
  })
})
