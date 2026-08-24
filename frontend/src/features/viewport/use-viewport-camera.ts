import { useCallback, useEffect, useRef, useState } from "react"
import {
  cameraForGridScene,
  type CameraState,
  type ViewportSize,
} from "../explorer/camera"
import type { PositionedScene } from "../explorer/layout/world-layout"

type UseViewportCameraOptions = {
  sceneId: string
  positionedScene?: PositionedScene
  reducedMotion: boolean
  onAnimationChange: (animating: boolean) => void
}

const DEFAULT_CAMERA: CameraState = { centerX: 640, centerY: 360, scale: 1 }

/** Viewport 크기와 현재 Scene의 Camera 이동을 관리한다. */
export function useViewportCamera({
  sceneId,
  positionedScene,
  reducedMotion,
  onAnimationChange,
}: UseViewportCameraOptions) {
  /** Viewport DOM */
  const viewportRef = useRef<HTMLDivElement>(null)
  /** 진행 중인 animation frame ID */
  const animationFrameRef = useRef<number | undefined>(undefined)
  /** 최신 Camera 값 */
  const cameraRef = useRef(DEFAULT_CAMERA)
  /** 최초 Camera 배치 여부 */
  const initializedRef = useRef(false)

  const [viewport, setViewport] = useState<ViewportSize>({
    width: 1,
    height: 1,
  })

  const [camera, setCamera] = useState(DEFAULT_CAMERA)
  const [animating, setAnimating] = useState(false)

  /** Camera 자동 배치에 사용할 Viewport 크기를 감지한다. */
  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const width = Math.max(entry.contentRect.width, 1)
      const height = Math.max(entry.contentRect.height, 1)
      setViewport((current) => {
        if (current.width === width && current.height === height) return current
        return { width, height }
      })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  /** 렌더링 상태와 animation 계산용 Ref에 같은 Camera를 반영한다. */
  const updateCamera = useCallback((next: CameraState) => {
    cameraRef.current = next
    setCamera(next)
  }, [])

  /** 현재 Viewport 좌표계를 기준으로 목표 Camera까지 이동한다. */
  const animateCamera = useCallback(
    (target: CameraState, targetViewport: ViewportSize, immediate: boolean) => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = undefined
      }

      if (immediate || reducedMotion) {
        updateCamera(target)
        setAnimating(false)
        onAnimationChange(false)
        return
      }

      const start = cameraRef.current
      const viewportCenterX = targetViewport.width / 2
      const viewportCenterY = targetViewport.height / 2
      const startTranslateX = viewportCenterX - start.centerX * start.scale
      const startTranslateY = viewportCenterY - start.centerY * start.scale
      const targetTranslateX = viewportCenterX - target.centerX * target.scale
      const targetTranslateY = viewportCenterY - target.centerY * target.scale
      const startedAt = performance.now()
      const duration = 620
      setAnimating(true)
      onAnimationChange(true)

      /** Frame별 Camera 보간 */
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
          onAnimationChange(false)
        }
      }
      animationFrameRef.current = requestAnimationFrame(frame)
    },
    [onAnimationChange, reducedMotion, updateCamera]
  )

  /** Scene 또는 Viewport가 바뀌면 현재 크기에 맞는 Camera를 다시 계산한다. */
  useEffect(() => {
    if (!positionedScene || viewport.width <= 1 || viewport.height <= 1) {
      return
    }

    const target = cameraForGridScene(
      positionedScene.bounds,
      positionedScene.scale,
      viewport
    )
    animateCamera(target, viewport, !initializedRef.current)
    initializedRef.current = true
  }, [animateCamera, positionedScene, sceneId, viewport])

  /** 컴포넌트가 사라지면 진행 중인 Camera animation을 정리한다. */
  useEffect(
    () => () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    },
    []
  )

  return {
    viewportRef,
    viewport,
    camera,
    animating,
  }
}
