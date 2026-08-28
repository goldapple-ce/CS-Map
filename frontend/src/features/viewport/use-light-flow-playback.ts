import type { Scene, SceneLightFlow } from "@shared/content/types"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  LIGHT_FLOW_EDGE_DURATION_MS,
  LIGHT_FLOW_NODE_DURATION_MS,
} from "@/features/explorer/light-flow-timing"

type PlaybackStatus = "idle" | "playing" | "completed"
export type LightFlowPhase = "source" | "edge" | "target"

type UseLightFlowPlaybackOptions = {
  sceneId: string
  scene?: Scene
  lightFlows: readonly SceneLightFlow[]
  blocked: boolean
}

type EdgeEndpoints = { from: string; to: string }

/** stage가 참조하는 Edge의 출발 또는 도착 Node 집합을 만든다. */
function stageNodeIds(
  edgeIds: readonly string[],
  endpoints: ReadonlyMap<string, EdgeEndpoints>,
  side: keyof EdgeEndpoints
) {
  const nodeIds = new Set<string>()
  for (const edgeId of edgeIds) {
    const endpoint = endpoints.get(edgeId)
    if (endpoint) nodeIds.add(endpoint[side])
  }
  return nodeIds
}

/** 현재 Scene의 Light Flow 단계 재생과 Scene 이동 시 취소를 관리한다. */
export function useLightFlowPlayback({
  sceneId,
  scene,
  lightFlows,
  blocked,
}: UseLightFlowPlaybackOptions) {
  const [status, setStatus] = useState<PlaybackStatus>("idle")
  const [playbackSceneId, setPlaybackSceneId] = useState<string>()
  const [activeFlowId, setActiveFlowId] = useState<string>()
  const [activeStageIndex, setActiveStageIndex] = useState<number>()
  const [phase, setPhase] = useState<LightFlowPhase>("source")
  const [runToken, setRunToken] = useState(0)
  const edgeEndpoints = useMemo(
    () =>
      new Map(
        (scene?.elements ?? []).flatMap((element) =>
          element.kind === "edge"
            ? [
                [
                  element.id,
                  {
                    from: element.fromElementId,
                    to: element.toElementId,
                  },
                ] as const,
              ]
            : []
        )
      ),
    [scene]
  )

  const sceneMatches = playbackSceneId === sceneId
  const resolvedStatus = sceneMatches ? status : "idle"
  const resolvedFlowId = sceneMatches ? activeFlowId : undefined
  const resolvedStageIndex = sceneMatches ? activeStageIndex : undefined
  const activeFlow = lightFlows.find((flow) => flow.id === resolvedFlowId)
  const activeStage =
    resolvedStageIndex === undefined
      ? undefined
      : activeFlow?.stages[resolvedStageIndex]
  const activeEdgeIds = useMemo(
    () => new Set(phase === "edge" ? (activeStage?.edgeIds ?? []) : []),
    [activeStage, phase]
  )
  const stageEdgeIds = useMemo(
    () => new Set(activeStage?.edgeIds ?? []),
    [activeStage]
  )

  const cancel = useCallback(() => {
    setStatus("idle")
    setPlaybackSceneId(undefined)
    setActiveFlowId(undefined)
    setActiveStageIndex(undefined)
    setPhase("source")
  }, [])

  /** 선택한 Flow를 첫 단계부터 재생하거나 완료된 Flow를 다시 재생한다. */
  const play = useCallback(
    (flowId: string) => {
      if (blocked || resolvedStatus === "playing") return
      const flow = lightFlows.find((candidate) => candidate.id === flowId)
      if (!flow) return
      setPlaybackSceneId(sceneId)
      setActiveFlowId(flow.id)
      setActiveStageIndex(0)
      setPhase("source")
      setRunToken((current) => current + 1)
      setStatus("playing")
    },
    [blocked, lightFlows, resolvedStatus, sceneId]
  )

  useEffect(() => {
    if (!blocked || resolvedStatus !== "playing") return
    const timeout = window.setTimeout(cancel, 0)
    return () => window.clearTimeout(timeout)
  }, [blocked, cancel, resolvedStatus])

  useEffect(() => {
    if (
      resolvedStatus !== "playing" ||
      !activeFlow ||
      resolvedStageIndex === undefined
    ) {
      return
    }
    let frame: number | undefined
    let timeout: number | undefined

    const advance = () => {
      if (phase === "source") {
        setPhase("edge")
        return
      }
      if (phase === "edge") {
        setPhase("target")
        return
      }

      const nextStageIndex = resolvedStageIndex + 1
      if (nextStageIndex < activeFlow.stages.length) {
        const currentTargets = stageNodeIds(
          activeFlow.stages[resolvedStageIndex].edgeIds,
          edgeEndpoints,
          "to"
        )
        const nextSources = stageNodeIds(
          activeFlow.stages[nextStageIndex].edgeIds,
          edgeEndpoints,
          "from"
        )
        const continuous =
          nextSources.size > 0 &&
          [...nextSources].every((nodeId) => currentTargets.has(nodeId))
        setActiveStageIndex(nextStageIndex)
        setPhase(continuous ? "edge" : "source")
        return
      }
      setStatus("completed")
      setActiveStageIndex(undefined)
      setPhase("source")
    }

    if (phase === "edge") {
      frame = requestAnimationFrame(() => {
        timeout = window.setTimeout(advance, LIGHT_FLOW_EDGE_DURATION_MS)
      })
    } else {
      timeout = window.setTimeout(advance, LIGHT_FLOW_NODE_DURATION_MS)
    }
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      if (timeout !== undefined) window.clearTimeout(timeout)
    }
  }, [
    activeFlow,
    edgeEndpoints,
    phase,
    resolvedStageIndex,
    resolvedStatus,
    sceneId,
  ])

  return {
    status: resolvedStatus,
    activeFlowId: resolvedFlowId,
    activeStageIndex: resolvedStageIndex,
    activeStageCount: activeFlow?.stages.length,
    phase: resolvedStatus === "playing" ? phase : undefined,
    runToken,
    activeEdgeIds,
    stageEdgeIds,
    play,
    cancel,
  }
}
