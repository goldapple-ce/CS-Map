import { useState } from "react"
import { usePanelRef } from "react-resizable-panels"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ExplanationPanel } from "@/features/explanation/ExplanationPanel"
import { ExplorerHeader } from "@/features/explorer/ExplorerHeader"
import { SceneViewport } from "@/features/explorer/SceneViewport"

type PanelMode = "split" | "reading"

export function ExplorerShell() {
  const mapPanelRef = usePanelRef()
  const explanationPanelRef = usePanelRef()
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>("split")

  const collapseExplanation = () => {
    explanationPanelRef.current?.collapse()
  }

  const openExplanation = () => {
    explanationPanelRef.current?.expand()
  }

  const toggleReadingMode = () => {
    if (panelMode === "reading") {
      mapPanelRef.current?.expand()
      explanationPanelRef.current?.resize("38%")
      setPanelMode("split")
      return
    }

    setPanelMode("reading")
    requestAnimationFrame(() => mapPanelRef.current?.collapse())
  }

  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ExplorerHeader
        panelCollapsed={panelCollapsed}
        onOpenPanel={openExplanation}
      />

      <main className="min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            id="scene-viewport"
            panelRef={mapPanelRef}
            defaultSize="62%"
            minSize="36%"
            collapsible={panelMode === "reading"}
            collapsedSize="0%"
          >
            <SceneViewport />
          </ResizablePanel>

          <ResizableHandle
            withHandle={panelMode === "split"}
            className={
              panelMode === "reading"
                ? "pointer-events-none opacity-0"
                : undefined
            }
          />

          <ResizablePanel
            id="explanation-panel"
            panelRef={explanationPanelRef}
            defaultSize="38%"
            minSize="26%"
            maxSize={panelMode === "reading" ? "100%" : "58%"}
            collapsible
            collapsedSize="0%"
            onResize={({ asPercentage }) =>
              setPanelCollapsed(asPercentage === 0)
            }
          >
            <ExplanationPanel
              readingMode={panelMode === "reading"}
              onCollapse={collapseExplanation}
              onToggleReadingMode={toggleReadingMode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
