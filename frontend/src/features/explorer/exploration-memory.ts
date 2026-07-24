import type { CameraState } from "@/features/explorer/camera"

export type SceneNavigationRequest = {
  sceneId: string
  elementId: string
  camera: CameraState
}

export type SceneSnapshot = {
  focusedElementId?: string
  camera: CameraState
  panelCollapsed: boolean
  panelMode: "split" | "reading"
  panelSize: number
  explanationScrollTop: number
}

const snapshots = new Map<string, SceneSnapshot>()

export function saveSceneSnapshot(sceneId: string, snapshot: SceneSnapshot) {
  snapshots.set(sceneId, snapshot)
}

export function getSceneSnapshot(sceneId: string) {
  return snapshots.get(sceneId)
}
