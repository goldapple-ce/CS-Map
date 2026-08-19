import { House } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

const knownLabels: Record<string, string> = {
  explore: "탐색",
  "google-com": "google.com 접속",
  "user-browser": "사용자와 브라우저",
  router: "Router",
  network: "네트워크",
  dns: "DNS",
  "udp-query": "UDP 질의",
  "socket-kernel": "Socket/Kernel",
}

/** Explorer의 뒤로 가기, 홈 이동, 현재 경로와 패널 열기 동작을 표시한다. */
export function ExplorerHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const segments = location.pathname.split("/").filter(Boolean)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="시작 화면으로 이동"
          onClick={() => navigate("/")}
        >
          <House aria-hidden="true" />
        </Button>
      </div>

      <nav aria-label="현재 탐색 경로" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-2 text-sm">
          {segments.map((segment, index) => (
            <li
              key={`${segment}-${index}`}
              className="flex min-w-0 items-center gap-2"
            >
              {index > 0 ? (
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
              ) : null}
              <span
                className={
                  index === segments.length - 1
                    ? "truncate font-medium text-foreground"
                    : "truncate text-muted-foreground"
                }
              >
                {knownLabels[segment] ?? segment.replaceAll("-", " ")}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    </header>
  )
}
