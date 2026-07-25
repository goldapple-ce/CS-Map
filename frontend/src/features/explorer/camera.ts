import type { WorldBounds } from "@/components/scene/world-layout"

export type CameraState = {
  centerX: number
  centerY: number
  scale: number
}

export type ViewportSize = {
  width: number
  height: number
}

export function cameraForBounds(
  bounds: WorldBounds,
  viewport: ViewportSize,
  paddingRatio = 0.08
): CameraState {
  const usableWidth = viewport.width * (1 - paddingRatio * 2)
  const usableHeight = viewport.height * (1 - paddingRatio * 2)
  return {
    centerX: bounds.x + bounds.width / 2,
    centerY: bounds.y + bounds.height / 2,
    scale: Math.min(
      usableWidth / Math.max(bounds.width, 0.0001),
      usableHeight / Math.max(bounds.height, 0.0001)
    ),
  }
}

export function cameraForWidth(
  bounds: WorldBounds,
  viewport: ViewportSize
): CameraState {
  return {
    centerX: bounds.x + bounds.width / 2,
    centerY: bounds.y + bounds.height / 2,
    scale: viewport.width / Math.max(bounds.width, 0.0001),
  }
}

export function visibleWorldBounds(
  camera: CameraState,
  viewport: ViewportSize,
  overscan = 0.15
): WorldBounds {
  const width = (viewport.width / camera.scale) * (1 + overscan * 2)
  const height = (viewport.height / camera.scale) * (1 + overscan * 2)
  return {
    x: camera.centerX - width / 2,
    y: camera.centerY - height / 2,
    width,
    height,
  }
}

export function boundsIntersect(left: WorldBounds, right: WorldBounds) {
  return !(
    left.x + left.width < right.x ||
    right.x + right.width < left.x ||
    left.y + left.height < right.y ||
    right.y + right.height < left.y
  )
}
