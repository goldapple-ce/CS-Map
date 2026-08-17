import { useCallback, useEffect, useRef, useState } from "react"
import type { CameraState } from "../camera"
import {
  getSceneSnapshot,
  saveSceneSnapshot,
  type SceneNavigationRequest,
} from "../exploration-memory"
import { contentRepository } from "@/content/content-repository"
import { useNavigate } from "react-router-dom"

type UseSceneNavigationOptions = {
  sceneId?: string
}

const DEFAULT_CAMERA: CameraState = { centerX: 640, centerY: 360, scale: 1 }

/** Scene Route의 URL segment 수로 탐색 깊이를 계산한다. */
function routeDepth(sceneId?: string) {
  if (!sceneId) return 0
  const route = contentRepository.listRoutes().find(({ id }) => id === sceneId)
  return route?.path.split("/").filter(Boolean).length ?? 0
}

/** Scene 이동과 Camera 스냅샷 및 복귀 포커스를 관리한다. */
export function useSceneNavigation({ sceneId }: UseSceneNavigationOptions) {
  const navigate = useNavigate()
  const previousSceneIdRef = useRef(sceneId)
  const navigationLockedRef = useRef(false)
  const returningRef = useRef(false)

  const currentCameraRef = useRef(DEFAULT_CAMERA)
  const [navigationDisabled, setNavigationDisabled] = useState(false)

  /** 떠나는 Scene의 Camera와 선택 Topic을 탐색 스냅샷에 저장한다. */
  const captureScene = useCallback(
    (
      targetSceneId: string | undefined,
      camera = currentCameraRef.current,
      focusedElementId?: string
    ) => {
      if (!targetSceneId) return
      saveSceneSnapshot(targetSceneId, {
        focusedElementId,
        camera,
      })
    },
    []
  )

  useEffect(() => {
    const previousSceneId = previousSceneIdRef.current

    if (previousSceneId && previousSceneId !== sceneId) {
      if (!navigationLockedRef.current) {
        captureScene(previousSceneId)
      }

      if (!returningRef.current) {
        returningRef.current = routeDepth(sceneId) < routeDepth(previousSceneId)
      }
    }

    previousSceneIdRef.current = sceneId
  }, [captureScene, sceneId])

  /** 선택한 Topic의 Child Scene Route로 진입한다. */
  const enterScene = (request: SceneNavigationRequest) => {
    if (navigationLockedRef.current) return
    const targetRoute = contentRepository
      .listRoutes()
      .find(({ id }) => id === request.sceneId)
    if (!targetRoute) return
    navigationLockedRef.current = true
    returningRef.current = false
    setNavigationDisabled(true)
    captureScene(sceneId, request.camera, request.elementId)
    navigate(targetRoute.path)
  }

  /** 고른 Scene Route로 직접 이동한다. */
  const selectScene = (targetSceneId: string) => {
    if (navigationLockedRef.current || targetSceneId === sceneId) return
    const targetRoute = contentRepository
      .listRoutes()
      .find(({ id }) => id === targetSceneId)
    if (!targetRoute) return
    navigationLockedRef.current = true
    returningRef.current = false
    setNavigationDisabled(true)
    captureScene(sceneId)
    navigate(targetRoute.path)
  }

  /** 현재 탐색 스냅샷을 저장하고 이전 Route로 돌아간다. */
  const goBack = () => {
    if (navigationLockedRef.current) return
    navigationLockedRef.current = true
    returningRef.current = true
    setNavigationDisabled(true)
    captureScene(sceneId)
    if (routeDepth(sceneId) <= 2) navigate("/")
    else navigate(-1)
  }

  /** 최신 Camera를 다음 탐색 스냅샷 저장용 ref에 보관한다. */
  const handleCameraChange = useCallback((camera: CameraState) => {
    currentCameraRef.current = camera
  }, [])

  /** Scene 전환 잠금을 갱신하고 이동 완료 뒤 적절한 요소에 초점을 둔다. */
  const handleAnimationChange = useCallback(
    (animating: boolean) => {
      setNavigationDisabled(animating)
      if (animating) return
      navigationLockedRef.current = false
      if (returningRef.current && sceneId) {
        const focusedElementId = getSceneSnapshot(sceneId)?.focusedElementId
        if (focusedElementId) {
          document
            .querySelector<HTMLElement>(
              `[data-world-scene-id="${sceneId}"] [data-scene-node-id="${focusedElementId}"]`
            )
            ?.focus()
        }
      } else {
        document.querySelector<HTMLElement>("#scene-title")?.focus()
      }
      returningRef.current = false
    },
    [sceneId]
  )

  return {
    navigationDisabled,
    enterScene,
    selectScene,
    goBack,
    handleCameraChange,
    handleAnimationChange,
  }
}
