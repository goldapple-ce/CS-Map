import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from "react"

export type LightFlowNodeState = "source" | "target"

type LightFlowRenderState = {
  activeEdgeIds: ReadonlySet<string>
  activeNodeIds: ReadonlySet<string>
  nodeState?: LightFlowNodeState
  playbackKey?: string
}

const EMPTY_IDS: ReadonlySet<string> = new Set()
const INACTIVE_LIGHT_FLOW: LightFlowRenderState = {
  activeEdgeIds: EMPTY_IDS,
  activeNodeIds: EMPTY_IDS,
}

const LightFlowRenderContext = createContext(INACTIVE_LIGHT_FLOW)

type LightFlowRenderProviderProps = LightFlowRenderState & {
  children: ReactNode
}

/** focused Scene의 Light Flow 표시 상태를 Renderer 하위에 공유한다. */
export function LightFlowRenderProvider({
  activeEdgeIds,
  activeNodeIds,
  nodeState,
  playbackKey,
  children,
}: LightFlowRenderProviderProps) {
  const value = useMemo(
    () => ({ activeEdgeIds, activeNodeIds, nodeState, playbackKey }),
    [activeEdgeIds, activeNodeIds, nodeState, playbackKey]
  )

  return (
    <LightFlowRenderContext.Provider value={value}>
      {children}
    </LightFlowRenderContext.Provider>
  )
}

/** Provider 밖에서는 모든 Light Flow 표시가 꺼진 안전한 기본 상태를 반환한다. */
// eslint-disable-next-line react-refresh/only-export-components
export function useLightFlowRender() {
  return useContext(LightFlowRenderContext)
}
