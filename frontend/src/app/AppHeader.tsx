import { useNavigate } from "react-router-dom"
import { Moon, Search, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  ThemeAnimationType,
  useModeAnimation,
} from "react-theme-switch-animation"
import { useState } from "react"

const GIFS = [
  "https://media.tenor.com/4oEf1dDrLOUAAAAi/heart-love.gif",
  "https://media.tenor.com/cc-cpgM3FToAAAAi/peach-and-goma-jumping.gif",
  "https://media.tenor.com/cyORI7kwShQAAAAi/shigure-ui-dance.gif",
]

export function AppHeader() {
  const navigate = useNavigate()

  const [gifUrl, setGifUrl] = useState(GIFS[0])
  const { ref, toggleSwitchTheme } = useModeAnimation({
    animationType: ThemeAnimationType.GIF,
    gifUrl,
  })

  const handleThemeToggle = () => {
    const nextGif = GIFS[Math.floor(Math.random() * GIFS.length)]
    setGifUrl(nextGif)

    toggleSwitchTheme()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
      <Button
        className="text-lg"
        variant="ghost"
        onClick={() => navigate("/")}
        aria-label="홈"
      >
        CS-MAP
      </Button>

      <Button variant="ghost" size="icon" aria-label="검색">
        <Search />
      </Button>
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        aria-label="테마 변경"
        onClick={handleThemeToggle}
      >
        <Sun className="hidden dark:block" />
        <Moon className="block dark:hidden" />
      </Button>
    </header>
  )
}
