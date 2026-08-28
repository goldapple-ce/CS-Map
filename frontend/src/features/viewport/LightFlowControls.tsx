import type { SceneLightFlow } from "@shared/content/types"
import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"

type LightFlowControlsProps = {
  lightFlows: readonly SceneLightFlow[]
  playing: boolean
  disabled: boolean
  onPlay: (flowId: string) => void
}

/** Scene에 정의된 단일 또는 복수 Light Flow 실행 버튼과 텍스트 상태를 표시한다. */
export function LightFlowControls({
  lightFlows,
  playing,
  disabled,
  onPlay,
}: LightFlowControlsProps) {
  if (lightFlows.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {lightFlows.map((flow) => {
        return (
          <Button
            key={flow.id}
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || playing}
            onClick={() => onPlay(flow.id)}
          >
            <Play aria-hidden="true" />
            {flow.label}
          </Button>
        )
      })}
    </div>
  )
}
