import type { WorldBounds } from "@/features/explorer/layout/world-layout"
import {
  SCENE_GRID_HEIGHT,
  SCENE_GRID_WIDTH,
} from "@shared/layout/scene-node-metrics"

export type CameraState = {
  centerX: number
  centerY: number
  scale: number
}

export type ViewportSize = {
  width: number
  height: number
}

/** 여백을 포함한 Bounds 전체가 Viewport에 들어오는 Camera를 계산한다. */
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

/** Grid Scene의 기준 크기를 Viewport에 맞추는 Camera를 계산한다. */
export function cameraForGridScene(
  bounds: WorldBounds,
  worldScale: number,
  viewport: ViewportSize
): CameraState {
  return {
    centerX: bounds.x + bounds.width / 2,
    centerY: bounds.y + bounds.height / 2,
    scale: Math.min(
      viewport.width /
        Math.max(SCENE_GRID_WIDTH * worldScale, 0.0001),
      viewport.height /
        Math.max(SCENE_GRID_HEIGHT * worldScale, 0.0001)
    ),
  }
}

/** Bounds 너비가 Viewport 너비에 맞도록 Camera를 계산한다. */
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

/** Camera와 overscan으로 현재 렌더링할 World Bounds를 계산한다. */
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

/** 두 World Bounds가 맞닿거나 겹치는지 확인한다. */
export function boundsIntersect(left: WorldBounds, right: WorldBounds) {
  return !(
    left.x + left.width < right.x ||
    right.x + right.width < left.x ||
    left.y + left.height < right.y ||
    right.y + right.height < left.y
  )
}
