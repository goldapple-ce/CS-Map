import { useNavigate } from "react-router-dom"
import { useTheme } from "./theme-provider"
import { Moon, Search, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppHeader() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

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
        variant="ghost"
        size="icon"
        aria-label="테마 변경"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="hidden dark:block" />
        <Moon className="block dark:hidden" />
      </Button>
    </header>
  )
}
