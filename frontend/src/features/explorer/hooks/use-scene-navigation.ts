import { useCallback, useRef, useState } from "react"
import { contentData } from "@/content/generated/content-data"
import { useNavigate } from "react-router-dom"

type UseSceneNavigationOptions = {
  sceneId: string
}

/** Scene Route 이동과 전환 중 중복 입력 방지를 관리한다. */
export function useSceneNavigation({ sceneId }: UseSceneNavigationOptions) {
  const navigate = useNavigate()
  const navigationLockedRef = useRef(false)
  const [navigationDisabled, setNavigationDisabled] = useState(false)

  /** 선택한 Topic의 Child Scene Route로 진입한다. */
  const enterScene = (targetSceneId: string) => {
    if (navigationLockedRef.current) return
    const targetRoute = contentData.routes.find(
      ({ id }) => id === targetSceneId
    )
    if (!targetRoute) return
    navigationLockedRef.current = true
    setNavigationDisabled(true)
    navigate(targetRoute.path)
  }

  /** 고른 Scene Route로 직접 이동한다. */
  const selectScene = (targetSceneId: string) => {
    if (navigationLockedRef.current || targetSceneId === sceneId) return
    const targetRoute = contentData.routes.find(
      ({ id }) => id === targetSceneId
    )
    if (!targetRoute) return
    navigationLockedRef.current = true
    setNavigationDisabled(true)
    navigate(targetRoute.path)
  }

  /** Root에서는 홈으로, 나머지 Scene에서는 이전 Route로 돌아간다. */
  const goBack = () => {
    if (navigationLockedRef.current) return
    navigationLockedRef.current = true
    setNavigationDisabled(true)
    if (sceneId === contentData.rootSceneId) navigate("/")
    else navigate(-1)
  }

  /** Camera 전환 상태에 맞춰 탐색 잠금을 갱신한다. */
  const handleAnimationChange = useCallback((animating: boolean) => {
    setNavigationDisabled(animating)
    if (!animating) navigationLockedRef.current = false
  }, [])

  return {
    navigationDisabled,
    enterScene,
    selectScene,
    goBack,
    handleAnimationChange,
  }
}
