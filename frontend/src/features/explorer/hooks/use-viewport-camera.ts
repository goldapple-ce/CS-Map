import { useCallback, useEffect, useRef, useState } from "react"
import {
  cameraForBounds,
  cameraForGridScene,
  cameraForWidth,
  type CameraState,
  type ViewportSize,
} from "../camera"
import type { PositionedScene } from "../layout/world-layout"
import { getSceneSnapshot } from "../exploration-memory"

type UseViewportCameraOptions = {
  sceneId: string
  positionedScene?: PositionedScene
  embedded: boolean
  reducedMotion: boolean
  onCameraChange: (camera: CameraState) => void
  onAnimationChange: (animating: boolean) => void
}

const DEFAULT_CAMERA: CameraState = { centerX: 640, centerY: 360, scale: 1 }

/** Viewport 크기와 현재 Scene의 Camera 이동을 관리한다. */
export function useViewportCamera({
  sceneId,
  positionedScene,
  embedded,
  reducedMotion,
  onCameraChange,
  onAnimationChange,
}: UseViewportCameraOptions) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const cameraRef = useRef(DEFAULT_CAMERA)
  const initializedRef = useRef(false)
  const pendingAnnouncementRef = useRef<string | undefined>(undefined)

  const [viewport, setViewport] = useState<ViewportSize>({
    width: 1,
    height: 1,
  })
  const [camera, setCamera] = useState(DEFAULT_CAMERA)

  const [animating, setAnimating] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setViewport({
        width: Math.max(entry.contentRect.width, 1),
        height: Math.max(entry.contentRect.height, 1),
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  /** Camera ref와 렌더링 상태를 함께 갱신해 외부에 알린다. */
  const updateCamera = useCallback(
    (next: CameraState) => {
      cameraRef.current = next
      setCamera(next)
      onCameraChange(next)
    },
    [onCameraChange]
  )

  /** 동작 설정에 따라 Camera를 즉시 적용하거나 보간해 이동한다. */
  const animateCamera = useCallback(
    (target: CameraState, immediate: boolean) => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
      if (immediate || reducedMotion) {
        updateCamera(target)
        setAnimating(false)
        if (pendingAnnouncementRef.current) {
          setAnnouncement(pendingAnnouncementRef.current)
          pendingAnnouncementRef.current = undefined
        }
        onAnimationChange(false)
        return
      }

      const start = cameraRef.current
      const viewportCenterX = viewport.width / 2
      const viewportCenterY = viewport.height / 2
      const startTranslateX = viewportCenterX - start.centerX * start.scale
      const startTranslateY = viewportCenterY - start.centerY * start.scale
      const targetTranslateX = viewportCenterX - target.centerX * target.scale
      const targetTranslateY = viewportCenterY - target.centerY * target.scale
      const startedAt = performance.now()
      const duration = 620
      setAnimating(true)
      onAnimationChange(true)

      /** 한 animation frame의 Camera 위치를 계산하고 다음 frame을 예약한다. */
      const frame = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const scale = start.scale + (target.scale - start.scale) * eased
        const translateX =
          startTranslateX + (targetTranslateX - startTranslateX) * eased
        const translateY =
          startTranslateY + (targetTranslateY - startTranslateY) * eased
        updateCamera({
          centerX: (viewportCenterX - translateX) / scale,
          centerY: (viewportCenterY - translateY) / scale,
          scale,
        })
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(frame)
        } else {
          animationFrameRef.current = undefined
          setAnimating(false)
          if (pendingAnnouncementRef.current) {
            setAnnouncement(pendingAnnouncementRef.current)
            pendingAnnouncementRef.current = undefined
          }
          onAnimationChange(false)
        }
      }
      animationFrameRef.current = requestAnimationFrame(frame)
    },
    [onAnimationChange, reducedMotion, updateCamera, viewport]
  )

  useEffect(() => {
    if (!positionedScene || viewport.width <= 1 || viewport.height <= 1) return
    const savedCamera = embedded ? undefined : getSceneSnapshot(sceneId)?.camera
    const target =
      savedCamera ??
      (embedded
        ? cameraForWidth(positionedScene.bounds, viewport)
        : positionedScene.scene.layout?.type === "grid"
          ? cameraForGridScene(
              positionedScene.bounds,
              positionedScene.scale,
              viewport
            )
          : cameraForBounds(positionedScene.bounds, viewport))
    pendingAnnouncementRef.current = `${positionedScene.scene.title} Topic으로 이동했습니다.`
    animateCamera(target, !initializedRef.current)
    initializedRef.current = true
  }, [animateCamera, embedded, positionedScene, sceneId, viewport])

  /** animation frame cleanup */
  useEffect(
    () => () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
    },
    []
  )

  return {
    viewportRef,
    viewport,
    camera,
    animating,
    announcement,
  }
}
