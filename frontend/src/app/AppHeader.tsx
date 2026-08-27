import { Link } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Search } from "@/features/search/Search"

import {
  ThemeAnimationType,
  useModeAnimation,
} from "react-theme-switch-animation"
import { useState } from "react"
import logo from "/logo.svg"

const GIFS = [
  "https://media.tenor.com/4oEf1dDrLOUAAAAi/heart-love.gif",
  "https://media.tenor.com/cc-cpgM3FToAAAAi/peach-and-goma-jumping.gif",
  "https://media.tenor.com/cyORI7kwShQAAAAi/shigure-ui-dance.gif",
]

export function AppHeader() {
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
    <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
      <Link
        to="/"
        aria-label="홈으로 이동"
        className="inline-flex items-center"
      >
        <img src={logo} alt="CS Map" className="h-8 w-auto" />
      </Link>

      <Search />
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
