import type { CameraState } from "@/features/explorer/camera"

export type SceneNavigationRequest = {
  sceneId: string
  elementId: string
  camera: CameraState
}

export type SceneSnapshot = {
  focusedElementId?: string
  camera: CameraState
}

const snapshots = new Map<string, SceneSnapshot>()

/** Scene을 떠날 때의 탐색 상태를 메모리 스냅샷으로 저장한다. */
export function saveSceneSnapshot(sceneId: string, snapshot: SceneSnapshot) {
  snapshots.set(sceneId, snapshot)
}

/** 이전에 저장한 Scene 탐색 스냅샷을 조회한다. */
export function getSceneSnapshot(sceneId: string) {
  return snapshots.get(sceneId)
}
