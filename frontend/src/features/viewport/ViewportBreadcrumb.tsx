import { Fragment } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}

export function ViewportBreadcrumb() {
  const { pathname } = useLocation()

  const segments = pathname.split("/").filter(Boolean).slice(1)

  const current = segments.at(-1) ?? "enter-google"
  const parents = segments.slice(0, -1)

  const visibleParents =
    parents.length > 2 ? [parents[0], "...", ...parents.slice(-1)] : parents

  const path = (index: number) =>
    "/explore/" + segments.slice(0, index + 1).join("/")

  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-hidden text-sm">
      {visibleParents.map((segment, index) => {
        if (segment === "...") {
          return (
            <Fragment key="ellipsis">
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />

              <DropdownMenu>
                <DropdownMenuTrigger className="shrink-0 text-muted-foreground hover:text-foreground">
                  ...
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {parents.slice(1, -1).map((item, i) => (
                    <DropdownMenuItem key={item}>
                      <Link to={path(i + 1)}>{formatSegment(item)}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Fragment>
          )
        }

        const realIndex = segments.indexOf(segment)

        return (
          <Fragment key={segment}>
            {index > 0 && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}

            <Link
              to={path(realIndex)}
              className="min-w-0 truncate text-blue-600 hover:underline dark:text-blue-400"
            >
              {formatSegment(segment)}
            </Link>
          </Fragment>
        )
      })}

      {parents.length > 0 && (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      )}

      <span className="min-w-0 truncate font-medium text-foreground">
        {formatSegment(current)}
      </span>
    </nav>
  )
}
