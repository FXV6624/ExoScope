import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface SubItem {
  title: string
  path: string
}

interface NavGroupProps {
  icon: LucideIcon
  title: string
  items: SubItem[]
  open: boolean
  onToggle: () => void
  chevron: LucideIcon
}

export function NavGroup({
  icon: Icon,
  title,
  items,
  open,
  onToggle,
  chevron: ChevronIcon,
}: NavGroupProps) {
  const { isMobile, setOpenMobile, state: sidebarState } = useSidebar()
  const router = useRouterState()
  const currentPath = router.location.pathname

  const isGroupActive = items.some((item) => currentPath.startsWith(item.path))
  const isCollapsed = sidebarState === "collapsed"

  const handleSubClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <div className="px-2 py-0.5">
      {/* Group header button */}
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={title}
          isActive={isGroupActive && !open}
          onClick={onToggle}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Icon size={16} />
            {!isCollapsed && <span>{title}</span>}
          </span>
          {!isCollapsed && (
            <ChevronIcon
              size={14}
              className="text-muted-foreground transition-transform duration-200"
              style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Sub-items */}
      {open && !isCollapsed && (
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
          {items.map((item) => {
            const isActive =
              currentPath === item.path ||
              currentPath.startsWith(`${item.path}/`)
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  asChild
                  size="sm"
                >
                  <RouterLink to={item.path} onClick={handleSubClick}>
                    <span>{item.title}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </div>
      )}
    </div>
  )
}
