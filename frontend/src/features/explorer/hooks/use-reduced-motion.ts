import { useEffect, useState } from "react"

/** 운영체제의 동작 감소 설정을 구독한다. */
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    /** 운영체제의 동작 감소 설정을 현재 화면 상태에 반영한다. */
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  return reducedMotion
}
