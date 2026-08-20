import { Outlet } from "react-router-dom"
import { AppHeader } from "./AppHeader"

export function AppLayout() {
  return (
    <div className="flex h-dvh flex-col">
      <AppHeader />

      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
